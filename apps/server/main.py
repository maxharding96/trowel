from fastapi import FastAPI
from models import EmbedInput, EmbedOutput
from embedder import Embedder
from concurrent.futures import ThreadPoolExecutor
import os
import yt_dlp
from typing import Optional

ydl_opt = {
    "noplaylist": True,
    "outtmpl": "tmp/%(id)s.%(ext)s",
}

app = FastAPI()
embdedder = Embedder(model_path="weights/discogs-effnet-bs64-1.pb")


def download(url: str) -> Optional[str]:
    with yt_dlp.YoutubeDL(ydl_opt) as ydl:
        try:
            info = ydl.extract_info(url, download=True)
            return "tmp/" + info["id"] + "." + info["ext"]
        except Exception as e:
            print(f"Error downloading {url}: {e}")


def process(url: str) -> Optional[str]:
    path = download(url)

    if not path:
        return None

    embedding = embdedder.process(audio_path=path)
    try:
        os.remove(path)
    except Exception as e:
        print(f"Error deleting file {path}: {e}")
    return embedding


def process_batch(urls: list[str]) -> list[Optional[str]]:
    max_workers = min(4, len(urls))  # Limit to 4 or number of URLs

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(process, url) for url in urls]

    results = [future.result() for future in futures]

    return results


@app.post("/embed", response_model=EmbedOutput)
async def embed(input: EmbedInput):
    embeddings = process_batch(input.urls)

    return EmbedOutput(embeddings=embeddings)
