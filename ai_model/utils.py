import os
import cv2
import math
import random
import pickle
import shutil
import numpy as np
from skimage import color, graph
from skimage.segmentation import slic

import torch
import torch.nn.functional as F
from torch_geometric.data import Data, Dataset
from torch_geometric.loader import DataLoader

from torch_geometric.data import Data
from torch_geometric.nn import GCNConv, GATConv, global_mean_pool, global_max_pool
from torch_geometric.nn import BatchNorm, LayerNorm, PairNorm


def extract_segments_using_slic(image, num_segments=50, compactness=15):
    """
    Extract super-pixel segments using SLIC algorithm with improved parameters
    for leaf disease classification
    """
    # Convert to LAB color space for better segmentation of leaf patterns
    img_lab = color.rgb2lab(image)
    
    # Apply SLIC with adjusted parameters for capturing disease patterns
    segments = slic(
        img_lab, 
        n_segments=num_segments, 
        compactness=compactness, 
        sigma=2, 
        start_label=0,
        channel_axis=2
    )
    
    return segments

def obtain_enhanced_node_features(image, segments):
    """
    Enhanced feature extraction for each segment including color and texture
    """
    node_features = []
    
    # Convert to multiple color spaces for richer features
    img_hsv = cv2.cvtColor(
        (image * 255).astype(np.uint8), 
        cv2.COLOR_RGB2HSV
    ).astype(np.float32) / 255.0
    
    # Get maximum segment ID
    max_segment_id = segments.max()
    
    for i in range(max_segment_id + 1):
        mask = segments == i
        if np.any(mask):  # Make sure segment is not empty
            # Extract RGB features
            rgb_features = image[mask].mean(axis=0)  # Shape: (3,)
            
            # Extract HSV features
            hsv_features = img_hsv[mask].mean(axis=0)  # Shape: (3,)
            
            # Extract simple texture features (standard deviation of colors)
            texture_rgb = np.std(image[mask], axis=0) if mask.sum() > 1 else np.zeros(3)
            
            # Calculate segment size (normalized by image size)
            segment_size = mask.sum() / (image.shape[0] * image.shape[1])
            
            # Combine features
            features = np.concatenate([
                rgb_features,          # RGB mean (3)
                hsv_features,          # HSV mean (3)
                texture_rgb,           # RGB std (3)
                [segment_size]         # Size (1)
            ])
            
            node_features.append(features)
        else:
            # Default features for empty segments
            node_features.append(np.zeros(10))
    
    return np.array(node_features)

def construct_region_adjacency_graph(image, segments):
    """
    Construct region adjacency graph from segments with improved edge weighting
    """
    # Create region adjacency graph - this now uses edge weights based on color difference
    rag = graph.rag_mean_color(image, segments)
    
    # Construct edge index and edge attributes for PyG
    edge_index = []
    edge_attr = []
    
    for n1, n2, data in rag.edges(data=True):
        # Add edge in both directions (undirected graph)
        edge_index.append([n1, n2])
        edge_index.append([n2, n1])
        
        # Extract edge weight (color similarity)
        weight = data.get('weight', 1.0)
        
        # Add normalized weight as edge attribute
        norm_weight = np.exp(-weight / 10.0)  # Exponential decay for large color differences
        edge_attr.append([norm_weight])
        edge_attr.append([norm_weight])
    
    # Handle empty edge case
    if not edge_index:
        edge_index = [[0, 0], [0, 0]]  # Self-loop as fallback
        edge_attr = [[1.0], [1.0]]
        
    return np.array(edge_index).T, np.array(edge_attr)

def preprocessing_image_to_graph(image_path, num_segments=50, compactness=15):
    """
    Convert an image to a graph representation using enhanced SLIC segmentation
    with richer node features and edge attributes
    """
    # 1. Load image
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Failed to load image: {image_path}")
    
    # 2. Preprocess image
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # 3. Apply CLAHE for contrast enhancement
    lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB)
    lab_planes = list(cv2.split(lab))  # Convert to list to allow assignment
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    lab_planes[0] = clahe.apply(lab_planes[0])
    lab = cv2.merge(lab_planes)
    img = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
    
    
    # 4. Resize image
    img = cv2.resize(img, (128, 128))
    
    # 5. Normalize the image
    img = img / 255.0
    
    # 6. Extract segments using SLIC
    segments = extract_segments_using_slic(img, num_segments, compactness)
    
    # 7. Obtain enhanced node features
    node_features = obtain_enhanced_node_features(img, segments)
    node_features = torch.tensor(node_features, dtype=torch.float)
    
    # 8. Construct region adjacency graph with edge attributes
    edge_index, edge_attr = construct_region_adjacency_graph(img, segments)
    edge_index = torch.tensor(edge_index, dtype=torch.long)
    edge_attr = torch.tensor(edge_attr, dtype=torch.float)
    
    return node_features, edge_index, edge_attr

def edge_augmentation(data, p_add=0.1, p_remove=0.1):
    """
    Edge augmentation based on Algorithm 1:
    - With probability p_add, add random edges
    - With probability p_remove, remove random edges
    
    Args:
        data: PyG Data object
        p_add: Probability of adding edges
        p_remove: Probability of removing edges
    
    Returns:
        Augmented PyG Data object
    """
    # Initialize: E_aug ← E
    edge_index = data.edge_index.clone()
    edge_attr = data.edge_attr.clone() if hasattr(data, 'edge_attr') else None
    num_nodes = data.num_nodes
    
    # If random probability < p_add then add edges
    if random.random() < p_add and num_nodes > 1:
        # Generate multiple random edges (more efficient)
        num_edges_to_add = max(1, int(edge_index.size(1) * 0.05))  # Add 5% more edges
        for _ in range(num_edges_to_add):
            # Generate random edge
            u = random.randint(0, num_nodes - 1)
            v = random.randint(0, num_nodes - 1)
            
            # Avoid self-loops
            if u != v:
                # Add edge: E_aug ← E_aug ∪ e_new
                new_edge = torch.tensor([[u, v], [v, u]], dtype=torch.long, device=edge_index.device)
                edge_index = torch.cat([edge_index, new_edge.t()], dim=1)
                
                # Add edge attributes if they exist
                if edge_attr is not None:
                    # Use random edge attributes similar to existing ones
                    if edge_attr.size(0) > 0:
                        rand_idx = random.randint(0, edge_attr.size(0) - 1)
                        new_attr = edge_attr[rand_idx].clone()
                        # Add some noise to attributes
                        new_attr = new_attr * (0.9 + 0.2 * torch.rand_like(new_attr))
                        new_attr = torch.stack([new_attr, new_attr])
                        edge_attr = torch.cat([edge_attr, new_attr], dim=0)
    
    # If random probability < p_remove then remove edges
    if random.random() < p_remove and edge_index.size(1) > 2:  # Ensure we have edges to remove
        # Remove multiple edges
        num_edges_to_remove = max(1, int(edge_index.size(1) * 0.05))  # Remove 5% of edges
        
        # For undirected graphs, ensure we don't disconnect the graph
        # Create a simple connectivity check by counting unique nodes in edges
        # This isn't a full connectivity check but helps preserve graph structure
        num_unique_edges = edge_index.size(1) // 2
        if num_unique_edges > num_edges_to_remove:
            edges_to_remove = set(random.sample(range(num_unique_edges), num_edges_to_remove))
            
            # Create a mask to keep all edges except the selected ones and their reverse
            mask = torch.ones(edge_index.size(1), dtype=torch.bool, device=edge_index.device)
            for edge_idx in edges_to_remove:
                mask[2*edge_idx] = False
                mask[2*edge_idx+1] = False
            
            # E_aug ← E_aug \ e_remove
            edge_index = edge_index[:, mask]
            if edge_attr is not None:
                edge_attr = edge_attr[mask]
    
    # Update the data object with augmented edge index and attributes
    data.edge_index = edge_index
    if edge_attr is not None:
        data.edge_attr = edge_attr
    
    return data

class GraphAugmentation(object):
    """Combine multiple graph augmentation techniques"""
    def __init__(self, p_edge=0.5):
        self.p_edge = p_edge
    
    def __call__(self, data):
        # Apply edge augmentation with probability p_edge
        if random.random() < self.p_edge:
            data = edge_augmentation(data, p_add=0.1, p_remove=0.1)

         
        return data
    
    
class WeightInitialization(object):
    """Enhanced weight initialization for the model using He initialization"""
    @staticmethod
    def apply(model):
        for m in model.modules():
            if isinstance(m, torch.nn.Linear):
                # He initialization using uniform distribution as per Equation 1
                fan_in = m.in_features
                bound = math.sqrt(6.0 / fan_in)
                torch.nn.init.uniform_(m.weight, -bound, bound)
                if m.bias is not None:
                    torch.nn.init.zeros_(m.bias)
            
            elif isinstance(m, GCNConv):
                if hasattr(m, 'lin') and m.lin is not None:
                    # For GCNConv, determine input features
                    if hasattr(m.lin, 'in_features'):
                        fan_in = m.lin.in_features
                    else:
                        # Fallback if in_features is not directly accessible
                        fan_in = m.lin.weight.size(1)
                    
                    bound = math.sqrt(6.0 / fan_in)
                    torch.nn.init.uniform_(m.lin.weight, -bound, bound)
                    if m.lin.bias is not None:
                        torch.nn.init.zeros_(m.lin.bias)
            
            elif isinstance(m, GATConv):
                # Handle GAT source linear transformation
                if hasattr(m, 'lin_src') and m.lin_src is not None:
                    if hasattr(m.lin_src, 'weight') and m.lin_src.weight is not None:
                        if hasattr(m.lin_src, 'in_features'):
                            fan_in = m.lin_src.in_features
                        else:
                            # Fallback to weight shape
                            fan_in = m.lin_src.weight.size(1)
                        
                        bound = math.sqrt(6.0 / fan_in)
                        torch.nn.init.uniform_(m.lin_src.weight, -bound, bound)
                        if m.lin_src.bias is not None:
                            torch.nn.init.zeros_(m.lin_src.bias)
                
                # Handle GAT target linear transformation if present
                if hasattr(m, 'lin_dst') and m.lin_dst is not None:
                    if hasattr(m.lin_dst, 'weight') and m.lin_dst.weight is not None:
                        if hasattr(m.lin_dst, 'in_features'):
                            fan_in = m.lin_dst.in_features
                        else:
                            fan_in = m.lin_dst.weight.size(1)
                        
                        bound = math.sqrt(6.0 / fan_in)
                        torch.nn.init.uniform_(m.lin_dst.weight, -bound, bound)
                        if m.lin_dst.bias is not None:
                            torch.nn.init.zeros_(m.lin_dst.bias)
                
                # Initialize attention weights if present
                if hasattr(m, 'att') and m.att is not None:
                    if hasattr(m, 'heads'):
                        # For multi-head attention, use head dimension
                        fan_in = m.heads
                    else:
                        fan_in = 1
                    
                    bound = math.sqrt(6.0 / fan_in)
                    torch.nn.init.uniform_(m.att, -bound, bound)



#######################################
# GCN Block with number_of_layers = 2 #
#######################################
class GraphConvolutionBlock(torch.nn.Module):
    """Enhanced Graph Convolutional block with residual connections"""
    def __init__(self, in_channels, hidden_channels, use_edge_attr=True):
        super(GraphConvolutionBlock, self).__init__()
        self.use_edge_attr = use_edge_attr

        # GCN layers
        self.gcn1 = GCNConv(in_channels, hidden_channels)
        self.bn1 = torch.nn.BatchNorm1d(hidden_channels)
        self.gcn2 = GCNConv(hidden_channels, hidden_channels)
        self.bn2 = torch.nn.BatchNorm1d(hidden_channels)

        

    def forward(self, x, edge_index, edge_attr=None):
        identity = x

        # First GCN layer
        x = self.gcn1(x, edge_index)
        x = self.bn1(x)
        x = F.elu(x)

        
        # Second GCN layer
        x = self.gcn2(x, edge_index)
        x = self.bn2(x)
        x = F.elu(x)

        return x


#######################################
# GAT Block with number_of_layers = 2 #
#######################################


class GraphAttentionBlock(torch.nn.Module):
    """Enhanced Graph Attention block with residual connections"""
    def __init__(self, in_channels, hidden_channels, heads=2, use_edge_attr=True):
        super(GraphAttentionBlock, self).__init__()
        self.use_edge_attr = use_edge_attr

        # GAT layers
        self.gat1 = GATConv(in_channels, hidden_channels // heads, heads=heads)
        self.bn1 = torch.nn.BatchNorm1d(hidden_channels)
        self.gat2 = GATConv(hidden_channels, hidden_channels // heads, heads=heads)
        self.bn2 = torch.nn.BatchNorm1d(hidden_channels)



    def forward(self, x, edge_index, edge_attr=None):
        identity = x

        # First GAT layer
        x = self.gat1(x, edge_index)
        x = self.bn1(x)
        x = F.elu(x)
        

        # Second GAT layer
        x = self.gat2(x, edge_index)
        x = self.bn2(x)
        x = F.elu(x)

        return x


###################
# Classifer layer #
###################

class EnhancedClassifier(torch.nn.Module):
    """Enhanced Classification layer with multi-scale features"""
    def __init__(self, in_channels, hidden_channels, num_classes):
        super(EnhancedClassifier, self).__init__()
        
        # First fully-connected layer
        self.fc1 = torch.nn.Linear(in_channels, hidden_channels)
        self.bn1 = torch.nn.BatchNorm1d(hidden_channels)
        
        # Second fully-connected layer
        self.fc2 = torch.nn.Linear(hidden_channels, hidden_channels // 2)
        self.bn2 = torch.nn.BatchNorm1d(hidden_channels // 2)
        
        # Output layer
        self.output = torch.nn.Linear(hidden_channels // 2, num_classes)
        
    def forward(self, x):
        # First layer
        x = self.fc1(x)
        x = self.bn1(x)
        
        # Second layer
        x = self.fc2(x)
        x = self.bn2(x)
        
        x = F.leaky_relu(x, 0.2)
        
        # Output layer
        return self.output(x)


###############
# Final Model #
###############

class HybridGCNGATModel(torch.nn.Module):
    """
    Enhanced hybrid model combining GCN and GAT layers with residual connections
    for plant disease classification from graph representations
    """
    def __init__(self, num_node_features, num_classes, hidden_channels=512, 
                 use_edge_attr=True, gcn_layers=1, gat_layers=1):
        super(HybridGCNGATModel, self).__init__()

        self.use_edge_attr = use_edge_attr
        self.num_node_features = num_node_features
        self.num_classes = num_classes
        
        # Feature transformation layer
        self.feature_transform = torch.nn.Sequential(
            torch.nn.Linear(num_node_features, hidden_channels),
            torch.nn.BatchNorm1d(hidden_channels),
            torch.nn.LeakyReLU(0.2),
        )
        
        # GCN blocks
        self.gcn_blocks = torch.nn.ModuleList()
        for i in range(gcn_layers):
            self.gcn_blocks.append(
                GraphConvolutionBlock(hidden_channels, hidden_channels, use_edge_attr)
            )
            
        # GAT blocks
        self.gat_blocks = torch.nn.ModuleList()
        for i in range(gat_layers):
            self.gat_blocks.append(
                GraphAttentionBlock(hidden_channels, hidden_channels, heads=2, use_edge_attr=use_edge_attr)
            )
        
        # Global pooling
        self.global_pool = lambda x, batch: torch.cat([
            global_mean_pool(x, batch),
            global_max_pool(x, batch)
        ], dim=1)
        
        # Final classifier
        pool_size = hidden_channels * 2  # Mean + Max pooling
        self.classifier = EnhancedClassifier(pool_size, hidden_channels, num_classes)
        
        # Initialize weights
        WeightInitialization.apply(self)

    def forward(self, data):
        x, edge_index, batch = data.x, data.edge_index, data.batch
        edge_attr = data.edge_attr if hasattr(data, 'edge_attr') and self.use_edge_attr else None
        
        # Feature transformation
        x = self.feature_transform(x)
        

        # Apply GCN blocks
        for gcn_block in self.gcn_blocks:
            x = gcn_block(x, edge_index, edge_attr)
        
        # Apply GAT blocks
        for gat_block in self.gat_blocks:
            x = gat_block(x, edge_index, edge_attr)
        
        # Global pooling
        x = self.global_pool(x, batch)
        
        # Classification
        x = self.classifier(x)
        
        return x

    def summary(self):
        print("========== Hybrid GCN GAT Model Summary ==========")
        print(f"Input features: {self.num_node_features}")
        print(f"Hidden channels: {self.gcn_blocks[0].gcn1.in_channels if self.gcn_blocks else 'N/A'} → {self.gcn_blocks[0].gcn1.out_channels if self.gcn_blocks else 'N/A'}")
        print(f"Use edge attributes: {self.use_edge_attr}")
        print(f"GCN layers: {len(self.gcn_blocks)}")
        print(f"GAT layers: {len(self.gat_blocks)}")
        print(f"Pooling type: Global Mean + Max")
        print(f"Classifier input size: {self.classifier.fc1.in_features}")
        print(f"Number of classes: {self.num_classes}")
        total_params = sum(p.numel() for p in self.parameters())
        trainable_params = sum(p.numel() for p in self.parameters() if p.requires_grad)
        print(f"Total parameters: {total_params:,}")
        print(f"Trainable parameters: {trainable_params:,}")
        print("===============================================")
