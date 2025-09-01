from pydantic import BaseModel
from typing import List, Optional


Embedding = List[List[float]]


class EmbedInput(BaseModel):
    urls: list[str]


class EmbedOutput(BaseModel):
    embeddings: List[Optional[Embedding]]
