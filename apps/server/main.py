from fastapi import FastAPI
from models import EmbedInput, EmbedOutput, Embedding
from embedder import Embedder
import os
import yt_dlp
from typing import Optional
import asyncio
from fastapi import HTTPException

ydl_opt = {
    "noplaylist": True,
    "outtmpl": "tmp/%(id)s.%(ext)s",
}

app = FastAPI()
embdedder = Embedder(model_path="weights/discogs-effnet-bs64-1.pb")


def download(url: str) -> Optional[str]:
    with yt_dlp.YoutubeDL(ydl_opt) as ydl:
        info = ydl.extract_info(url, download=True)
        return "tmp/" + info["id"] + "." + info["ext"]


def process(url: str) -> Optional[Embedding]:
    path = None
    try:
        path = download(url)
        return embdedder.process(audio_path=path)
    except Exception as e:
        print(f"Error processing {url}: {e}")
        return None
    finally:
        if path and os.path.exists(path):
            os.remove(path)


@app.post("/embed", response_model=EmbedOutput)
async def embed(input: EmbedInput):
    loop = asyncio.get_event_loop()
    embedding = await loop.run_in_executor(None, process, input.uri)

    if embedding is None:
        raise HTTPException(status_code=422, detail="Failed to embed video")

    return EmbedOutput(id=input.id, embedding=embedding)
