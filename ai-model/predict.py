import torch
import json
import argparse
import glob
import os
import warnings
warnings.filterwarnings('ignore')

# Suppress torch warnings
torch.set_warn_always(False)
from torch_geometric.data import Data

from utils import HybridGCNGATModel
from utils import preprocessing_image_to_graph

class LeafDiseasePredictor:
    def __init__(self, model_path, label_map_path=None, device='cpu'):
        self.device = torch.device(device if torch.cuda.is_available() else 'cpu')
        self.model = self._load_model(model_path)
        self.label_map = self._load_label_map(label_map_path)
        self.idx_to_label = {v: k for k, v in self.label_map.items()} if self.label_map else None
    
    def _load_model(self, model_path):
        checkpoint = torch.load(model_path, map_location=self.device, weights_only=True)
        
        if isinstance(checkpoint, dict):
            state_dict = checkpoint.get('model_state_dict', checkpoint)
            num_node_features = checkpoint.get('num_node_features', 10)
            num_classes = checkpoint.get('num_classes', 6)
            hidden_channels = checkpoint.get('hidden_channels', 512)
        else:
            state_dict = checkpoint
            num_node_features = 10
            num_classes = 6
            hidden_channels = 512
        
        model = HybridGCNGATModel(
            num_node_features=num_node_features,
            num_classes=num_classes,
            hidden_channels=hidden_channels,
            use_edge_attr=True,
            gcn_layers=1,
            gat_layers=1
        ).to(self.device)
        
        model.load_state_dict(state_dict)
        model.eval()
        return model
    
    def _load_label_map(self, label_map_path):
        if label_map_path and os.path.exists(label_map_path):
            with open(label_map_path, 'r') as f:
                return json.load(f)
        return None
    
    def _image_to_graph(self, image_path):
        node_features, edge_index, edge_attr = preprocessing_image_to_graph(image_path)
        
        # Create PyTorch Geometric Data object
        graph_data = Data(
            x=node_features,
            edge_index=edge_index,
            edge_attr=edge_attr
        )
        
        return graph_data
    
    
    def predict(self, image_path):
        graph_data = self._image_to_graph(image_path).to(self.device)
        
        with torch.no_grad():
            output = self.model(graph_data)
            predicted_class = torch.argmax(output, dim=1).item()
        
        if self.idx_to_label:
            return self.idx_to_label[predicted_class]
        return f"Class_{predicted_class}"

    def predict_batch(self, image_paths):
        results = []
        for image_path in image_paths:
            try:
                label = self.predict(image_path)
                results.append((image_path, label))
            except Exception:
                results.append((image_path, "ERROR"))
        return results

def main():
    parser = argparse.ArgumentParser(description="Deploy leaf disease classification model")
    parser.add_argument('--model_path', type=str, required=True)
    parser.add_argument('--image_path', type=str, required=True)
    parser.add_argument('--label_map', type=str, default=None)
    parser.add_argument('--device', type=str, default='auto', choices=['auto', 'cpu', 'cuda'])
    parser.add_argument('--output', type=str, default=None)
    
    args = parser.parse_args()
    
    device = 'cuda' if (args.device == 'auto' and torch.cuda.is_available()) else args.device
    
    predictor = LeafDiseasePredictor(
        model_path=args.model_path,
        label_map_path=args.label_map,
        device=device
    )
    
    if os.path.isfile(args.image_path):
        result = predictor.predict(args.image_path)
        print(result)
        
        if args.output:
            with open(args.output, 'w') as f:
                json.dump([{'image': args.image_path, 'prediction': result}], f)
        
    elif os.path.isdir(args.image_path):
        image_files = []
        for ext in ['*.jpg', '*.jpeg', '*.png', '*.bmp']:
            image_files.extend(glob.glob(os.path.join(args.image_path, ext)))
            image_files.extend(glob.glob(os.path.join(args.image_path, ext.upper())))
        
        results = predictor.predict_batch(image_files)
        
        for image_path, prediction in results:
            print(f"{os.path.basename(image_path)}: {prediction}")
        
        if args.output:
            output_data = [{'image': img, 'prediction': pred} for img, pred in results]
            with open(args.output, 'w') as f:
                json.dump(output_data, f, indent=2)


def simple_predict_example():
    predictor = LeafDiseasePredictor(
        model_path='./ai-model/model.pt',
        label_map_path='./ai-model/label_map.json',
        device='auto'
    )
    
    image_path = './ai-model/test.jpg'
    result = predictor.predict(image_path)
    print(result)


if __name__ == "__main__":
    simple_predict_example()