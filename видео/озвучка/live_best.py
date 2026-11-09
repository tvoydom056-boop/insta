r"""Лучший дубль: посентенческая генерация без пауз, несколько сидов, сверка с текстом через text_tools check. Было: эксперимент «живость»: реплики генерируются по отдельности и склеиваются с настоящими паузами (вместо silenceremove).
venv\Scripts\python.exe live_test.py out\ringelman\marked.txt --name live1"""
import argparse, os, subprocess
import numpy as np, soundfile as sf, librosa
from f5_tts.api import F5TTS

D = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser()
ap.add_argument("marked"); ap.add_argument("--name", required=True)
ap.add_argument("--seeds", default="1,2,3,4")
ap.add_argument("--speed", type=float, default=1.0)
a = ap.parse_args()
out = os.path.join(D, "out", a.name); os.makedirs(out, exist_ok=True)
import re
txt = " ".join(l.strip() for l in open(a.marked, encoding="utf-8") if l.strip()).replace("прочит+али всё", "прочит+али вс+е")
lines = [x.strip() for x in re.split(r"(?<=[.?!])\s+", txt) if x.strip()]
# короткие вставки склеиваем с предыдущим предложением
merged = []
for x in lines:
    if merged and len(x.split()) <= 4: merged[-1] += " " + x
    else: merged.append(x)
lines = merged
print(len(lines), "реплик")

v = os.path.join(D, "voices", "friend")
ref_text = open(os.path.join(v, "ref_marked.txt"), encoding="utf-8").read().strip()
tts = F5TTS(model="F5TTS_v1_Base", ckpt_file=os.path.join(D, "model", "F5TTS_v1_Base_v4_winter", "model_212000.safetensors"),
            vocab_file=os.path.join(D, "model", "F5TTS_v1_Base", "vocab.txt"), device="cuda")
SR = 24000

def pause_after(line, i, n):
    return 0.0 if i == n - 1 else 0.12  # как в старом конвейере: без пауз, только стык


import shutil, json
shutil.copy(os.path.join(D, "out", "ringelman", "plain.txt"), os.path.join(out, "plain.txt")) if os.path.exists(os.path.join(D, "out", "ringelman", "plain.txt")) else None
wavs = []
for sd in [int(x) for x in a.seeds.split(",")]:
    parts = []
    for i, l in enumerate(lines):
        raw = os.path.join(out, f"s{sd}_{i}.wav")
        tts.infer(os.path.join(v, "ref.wav"), ref_text, l, file_wave=raw, speed=a.speed, seed=sd, nfe_step=64, show_info=lambda *_: None)
        y, _ = sf.read(raw); y, _ = librosa.effects.trim(y, top_db=38)
        parts.append(y); parts.append(np.zeros(int(SR * pause_after(l, i, len(lines)))))
    w = os.path.join(out, f"take_{sd}.wav"); sf.write(w, np.concatenate(parts), SR); wavs.append(w); print("take", sd)
