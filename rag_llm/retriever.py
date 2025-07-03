from typing import List
from .embedding import load_vector_store

def retrieve(query: str, k: int = 2) -> List[str]:
    vectorstore = load_vector_store()
    results = vectorstore.similarity_search_with_score(query, k=k)

    output = []
    for doc, score in results:
        disease = doc.metadata.get("disease", "Không rõ")
        summary = f"Bệnh: {disease}\nScore: {score:.2f}\n{doc.page_content[:500]}"
        output.append(summary)

    return output

if __name__ == "__main__":
    query = "Cháy lá bacterial_leaf_blight?"
    results = retrieve(query)
    for i, text in enumerate(results, 1):
        print(f"\n--- Kết quả {i} ---")
        print(text)
