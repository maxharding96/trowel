from pydantic import BaseModel


Embedding = list[float]


class EmbedInput(BaseModel):
    urls: list[str]


class EmbedOutput(BaseModel):
    embeddings: list[Embedding]
