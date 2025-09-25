from essentia.standard import MonoLoader, TensorflowPredictEffnetDiscogs
from models import Embedding
import numpy as np


class Embedder:
    def __init__(
        self, *, model_path: str, sampleRate: int = 16000, resampleQuality: int = 4
    ):
        self._model = TensorflowPredictEffnetDiscogs(
            graphFilename=model_path,
        )
        self._sampleRate = sampleRate
        self._resampleQuality = resampleQuality

    def process(self, *, audio_path: str) -> Embedding:
        loader = MonoLoader(
            filename=audio_path,
            sampleRate=self._sampleRate,
            resampleQuality=self._resampleQuality,
        )

        audio = loader()

        data = self._model(audio)

        return np.mean(data, axis=0)
