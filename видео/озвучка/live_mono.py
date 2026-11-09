r"""Монолитная речь: для каждого предложения подбирается дубль без обрыва в конце; посентенческая генерация без пауз, несколько сидов, сверка с текстом через text_tools check. Было: эксперимент «живость»: реплики генерируются по отдельности и склеиваются с настоящими паузами (вместо silenceremove).
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



import shutil
if os.path.exists(os.path.join(D, "out", "ringelman", "plain.txt")): shutil.copy(os.path.join(D, "out", "ringelman", "plain.txt"), os.path.join(out, "plain.txt"))
db = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
GAP, TRIM, NEED = 0.06, 45, 18.0
seeds = [int(x) for x in a.seeds.split(",")]
parts, chosen = [], []
for i, l in enumerate(lines):
    best = None
    for sd in seeds:
        raw = os.path.join(out, f"c{i}_{sd}.wav")
        for attempt in range(8):                         # GPU делят с другими процессами: при сбое ждём и повторяем
            try:
                tts.infer(os.path.join(v, "ref.wav"), ref_text, l, file_wave=raw, speed=a.speed, seed=sd, nfe_step=64, show_info=lambda *_: None)
                break
            except RuntimeError:
                import torch, time; torch.cuda.empty_cache(); time.sleep(4)
        else:
            raise SystemExit("GPU не отвечает")
        y, _ = sf.read(raw); y, _ = librosa.effects.trim(y, top_db=TRIM)
        drop = db(y) - db(y[-int(0.04 * SR):])          # чем больше, тем мягче затухает конец
        if best is None or drop > best[0]: best = (drop, sd, y)
        if drop >= NEED: break
    drop, sd, y = best
    chosen.append((sd, round(float(drop), 1)))
    y = y.copy(); fo = int(0.03 * SR); fi = int(0.008 * SR)
    y[-fo:] *= np.linspace(1, 0, fo); y[:fi] *= np.linspace(0, 1, fi)
    parts.append(y)
    if i < len(lines) - 1: parts.append(np.zeros(int(SR * GAP)))
print("chosen", chosen)
w = os.path.join(out, "take_1.wav"); sf.write(w, np.concatenate(parts), SR)
