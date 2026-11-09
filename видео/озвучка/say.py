r"""Озвучка голосом друга. Пример: venv\Scripts\python.exe say.py -t "Привет!" -o out\hello.wav
Несколько реплик: файл, по одной на строку -> out\NAME_001.wav ... (--file lines.txt --prefix NAME)"""
import argparse, os
from f5_tts.api import F5TTS

D = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser()
ap.add_argument("-t", "--text")
ap.add_argument("-o", "--out", default=os.path.join(D, "out", "say.wav"))
ap.add_argument("--file")
ap.add_argument("--prefix", default="line")
ap.add_argument("--voice", default="friend")
ap.add_argument("--speed", type=float, default=1.0)
ap.add_argument("--seed", type=int, default=1)
ap.add_argument("--nfe", type=int, default=32, help="шаги генерации: 32 по умолчанию, 64 чище и вдвое дольше")
a = ap.parse_args()

v = os.path.join(D, "voices", a.voice)
ref_text = open(os.path.join(v, "ref.txt"), encoding="utf-8").read().strip()
tts = F5TTS(model="F5TTS_v1_Base",
            ckpt_file=os.path.join(D, "model", "F5TTS_v1_Base_v4_winter", "model_212000.safetensors"),
            vocab_file=os.path.join(D, "model", "F5TTS_v1_Base", "vocab.txt"), device="cuda")

def gen(text, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tts.infer(os.path.join(v, "ref.wav"), ref_text, text, file_wave=path, speed=a.speed, seed=a.seed, nfe_step=a.nfe, show_info=lambda *_: None)
    print(path)

if a.file:
    lines = [l.strip() for l in open(a.file, encoding="utf-8") if l.strip()]
    for i, l in enumerate(lines, 1):
        gen(l, os.path.join(D, "out", f"{a.prefix}_{i:03d}.wav"))
else:
    gen(a.text, a.out)
