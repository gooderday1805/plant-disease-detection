import json
import re
from sentence_transformers import SentenceTransformer
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import TextLoader
from langchain_core.embeddings import Embeddings

class SentenceTransformerEmbedding(Embeddings):
    def __init__(self, model_name='paraphrase-multilingual-mpnet-base-v2'):
        self.model = SentenceTransformer(model_name)

    def embed_documents(self, texts):
        return self.model.encode(texts, show_progress_bar=True, convert_to_numpy=True).tolist()

    def embed_query(self, text):
        return self.model.encode([text], convert_to_numpy=True)[0].tolist()

def split_by_disease(doc_content):
    lines = doc_content.splitlines()
    chunks = []
    current_chunk = []
    current_disease = None

    for line in lines:
        match = re.match(r'^# (\w+)', line)
        if match:
            if current_chunk:
                chunks.append({
                    "content": "\n".join(current_chunk).strip(),
                    "metadata": {"disease": current_disease, "source": "plant_diseases.md"}
                })
                current_chunk = []
            current_disease = match.group(1)
        current_chunk.append(line)
    
    if current_chunk:
        chunks.append({
            "content": "\n".join(current_chunk).strip(),
            "metadata": {"disease": current_disease, "source": "plant_diseases.md"}
        })
    
    return chunks

def remove_duplicates(chunks):
    seen = set()
    unique_chunks = []
    for chunk in chunks:
        content = chunk["content"]
        if content not in seen:
            seen.add(content)
            unique_chunks.append(chunk)
    return unique_chunks

def create_vector_store(doc_path: str, persist_path: str = "faiss_index"):
    """
    Tạo vector store từ tài liệu Markdown và lưu vào đĩa.

    Args:
        doc_path (str): Đường dẫn đến tài liệu Markdown.
        persist_path (str, optional): Đường dẫn đến vị trí lưu vector store. Defaults to "faiss_index".
    """
    loader = TextLoader(doc_path, encoding="utf-8")
    docs = loader.load()
    doc_content = docs[0].page_content
    chunks = split_by_disease(doc_content)
    unique_chunks = remove_duplicates(chunks)
    print(f"Đã loại bỏ {len(chunks) - len(unique_chunks)} chunk trùng lặp.")

    docs_text = [chunk["content"] for chunk in unique_chunks]
    metadatas = [chunk["metadata"] for chunk in unique_chunks]
    embeddings = SentenceTransformerEmbedding()
    vectorstore = FAISS.from_texts(docs_text, embeddings, metadatas=metadatas)
    vectorstore.save_local(persist_path)
    print(f"✅ Vector store đã được lưu vào: {persist_path}")

    vectors = embeddings.embed_documents(docs_text)
    vector_dict = [
        {"disease": metadata["disease"], "vector": vector[:5]}
        for metadata, vector in zip(metadatas, vectors)
    ]
    with open("vectors.json", "w", encoding="utf-8") as f:
        json.dump(vector_dict, f, ensure_ascii=False, indent=2)
    print("✅ Vector cho tất cả các bệnh đã được lưu vào: vectors.json")

def load_vector_store(persist_path: str = "faiss_index"):
    embeddings = SentenceTransformerEmbedding()
    return FAISS.load_local(persist_path, embeddings, allow_dangerous_deserialization=True)

if __name__ == "__main__":
    create_vector_store("rag_llm/docs/plant_diseases.md")