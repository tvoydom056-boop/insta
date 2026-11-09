r"""Эксперимент «живость»: реплики генерируются по отдельности и склеиваются с настоящими паузами (вместо silenceremove).
venv\Scripts\python.exe live_test.py out\ringelman\marked.txt --name live1"""
import argparse, os, subprocess
import numpy as np, soundfile as sf, librosa
from f5_tts.api import F5TTS

D = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser()
ap.add_argument("marked"); ap.add_argument("--name", required=True)
ap.add_argument("--seed", type=int, default=2)
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

def render(tag, speeds, cfg, post):
    parts = []
    for i, l in enumerate(lines):
        raw = os.path.join(out, f"{tag}_{i}.wav")
        tts.infer(os.path.join(v, "ref.wav"), ref_text, l, file_wave=raw, speed=speeds[i], seed=a.seed, nfe_step=64, cfg_strength=cfg, show_info=lambda *_: None)
        y, _ = sf.read(raw)
        y, _ = librosa.effects.trim(y, top_db=38)
        parts.append(y); parts.append(np.zeros(int(SR * pause_after(l, i, len(lines)))))
    y = np.concatenate(parts)
    path = os.path.join(out, f"{tag}.wav"); sf.write(path, y, SR)
    final = os.path.join(out, f"{tag}_final.wav")
    flt = "loudnorm=I=-15:TP=-1.5:LRA=11"
    if post: flt = "highpass=f=70,acompressor=threshold=-24dB:ratio=2.2:attack=15:release=160:makeup=3,equalizer=f=3200:t=q:w=1.2:g=1.5,equalizer=f=220:t=q:w=1:g=1.0," + flt
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", path, "-af", flt, "-ar", "48000", final], check=True)
    print(tag, len(y) / SR)

n = len(lines)
render("B1_speed100", [1.0] * n, 2.0, False)
render("B2_speed100_cfg15", [1.0] * n, 1.5, False)
render("B3_speed108", [1.08] * n, 2.0, False)
