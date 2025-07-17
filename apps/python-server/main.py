from fastapi import FastAPI
from .io import EmbedInput, EmbedOutput
from .model import DiscogsModel
from .dl import download_from_yt

app = FastAPI()
model = DiscogsModel(model_path="weights/discogs-effnet-bs64-1.pb")


@app.get("/embed", response_model=EmbedOutput)
async def embed(input: EmbedInput):
    audio_paths = download_from_yt(*input.urls)
    embeddings = [model.embed(audio_path=path) for path in audio_paths]
    return EmbedOutput(embeddings=embeddings)
