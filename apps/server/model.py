from essentia.standard import MonoLoader, TensorflowPredictEffnetDiscogs


class DiscogsModel:
    def __init__(
        self, *, model_path: str, sampleRate: int = 16000, resampleQuality: int = 4
    ):
        self._model = TensorflowPredictEffnetDiscogs(
            graphFilename=model_path,
            output="PartitionedCall:1",
        )
        self._sampleRate = sampleRate
        self._resampleQuality = resampleQuality

    def embed(self, *, audio_path: str) -> list[float]:
        audio = MonoLoader(
            filename=audio_path,
            sampleRate=self._sampleRate,
            resampleQuality=self._resampleQuality,
        )()
        return self._model(audio)
