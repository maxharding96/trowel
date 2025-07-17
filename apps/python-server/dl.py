import yt_dlp

ydl_opt = {
    "format": "m4a/bestaudio/best",
    "postprocessors": [
        {
            "key": "FFmpegExtractAudio",
            "preferredcodec": "m4a",
        }
    ],
    "outtmpl": "tmp/%(id)s.%(ext)s",
}


def download_from_yt(*urls: str) -> list[str]:
    downloads: list[str] = []
    with yt_dlp.YoutubeDL(ydl_opt) as ydl:
        for url in urls:
            info = ydl.extract_info(url, download=True)
            file = f"tmp/{info['id']}.m4a"
            downloads.append(file)

    return downloads
