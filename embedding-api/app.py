from fastapi import FastAPI
from sentence_transformers import SentenceTransformer
import torch
from pydantic import BaseModel

app = FastAPI()

torch.set_num_threads(12)
device = "mps" if torch.backends.mps.is_available() else "cpu"

# multilingual-e5-large 모델 로딩 (1024차원)
model = SentenceTransformer("intfloat/multilingual-e5-large", device=device)

print(f"모델 임베딩 차원: {model.get_sentence_embedding_dimension()}")


class EmbeddingRequest(BaseModel):
    text: str
    type: str


@app.post("/embeddings")
def get_embeddings(request: EmbeddingRequest):
    if request.type == "query":
        text_with_prefix = f"query: {request.text}"
    else:
        text_with_prefix = f"passage: {request.text}"

    embedding = model.encode(text_with_prefix, convert_to_numpy=True)

    return {"embedding": embedding.tolist()}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=9000)
