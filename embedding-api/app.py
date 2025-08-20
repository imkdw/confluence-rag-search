from fastapi import FastAPI
from sentence_transformers import SentenceTransformer
import torch
from pydantic import BaseModel

app = FastAPI()

torch.set_num_threads(16)
device = "mps" if torch.backends.mps.is_available() else "cpu"

model = SentenceTransformer("jhgan/ko-sroberta-multitask", device=device)


class EmbeddingRequest(BaseModel):
    text: str


@app.post("/embeddings")
def get_embeddings(request: EmbeddingRequest):
    embedding = model.encode(request.text, convert_to_numpy=True)
    return {"embedding": embedding.tolist()}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
