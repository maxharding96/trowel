import time
from embedder import Embedder
from concurrent.futures import ThreadPoolExecutor
from typing import List
from functools import partial

filenames = [
    "tmp/GfsYL8znJNU.mp4",
    "tmp/szoAj7vQa3Y.mp4",
    "tmp/-nogCbX3Hq4.mp4",
]

embedder = Embedder(model_path="weights/discogs-effnet-bs64-1.pb")


def embed(url: str):
    global embedder
    return embedder.process(audio_path=url)


def main():
    start = time.time()

    with ThreadPoolExecutor(
        max_workers=4,
    ) as executor:
        futures = [executor.submit(embed, url) for url in filenames]

    results = [future.result() for future in futures]

    # for file in filenames:
    #     embed(file)
    end = time.time()
    print(end - start)


main()
