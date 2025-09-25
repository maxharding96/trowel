from pydantic import BaseModel
from typing import List


Embedding = List[float]


class EmbedInput(BaseModel):
    id: str
    uri: str


class EmbedOutput(BaseModel):
    id: str
    embedding: Embedding
