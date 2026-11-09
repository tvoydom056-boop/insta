r"""Озвучка одной командой: текст -> числа словами -> ударения -> дубли F5 -> сверка -> лучший дубль с громкостью -15 LUFS.
По умолчанию «монолитный» режим: каждое предложение генерируется отдельно, берётся дубль без обрыва в конце (F5 иногда режет последнее слово), стык 0,06 с с плавным затуханием, speed 1.0. --whole: старый режим, весь текст одним проходом, speed 0.9.
venv\Scripts\python.exe voiceover.py texts\piter.txt --name piter
--dry: только подготовить текст. Результат в out\NAME: best.wav, best_words.json (время слов), marked.txt, disputed.txt, report.json.
Ошибки ударений правятся в stress_dict.txt: слово с «+», по одному на строку."""
import argparse, json, os, re, shutil, subprocess, time
import numpy as np, soundfile as sf, librosa
from f5_tts.api import F5TTS

D = os.path.dirname(os.path.abspath(__file__))
TEXT_PY = os.path.join(D, "venv-text", "Scripts", "python.exe")
TOOLS = os.path.join(D, "text_tools.py")
ENV = dict(os.environ, PYTHONIOENCODING="utf-8", HF_HUB_DISABLE_SYMLINKS_WARNING="1")

ap = argparse.ArgumentParser()
ap.add_argument("script")
ap.add_argument("--name", required=True)
ap.add_argument("--voice", default="friend")
ap.add_argument("--takes", type=int, default=3)
ap.add_argument("--speed", type=float, default=None)
ap.add_argument("--whole", action="store_true")
ap.add_argument("--nfe", type=int, default=64)
ap.add_argument("--dry", action="store_true")
a = ap.parse_args()
if a.speed is None: a.speed = 0.9 if a.whole else 1.0

out = os.path.join(D, "out", a.name)
subprocess.run([TEXT_PY, TOOLS, "prepare", a.script, out], check=True, env=ENV)
if a.dry:
    raise SystemExit
marked = open(os.path.join(out, "marked.txt"), encoding="utf-8").read().strip()

v = os.path.join(D, "voices", a.voice)
# Размеченный образец: в тесте дубли с ним распознавались чище всего.
ref_path = os.path.join(v, "ref_marked.txt")
ref_text = open(ref_path if os.path.exists(ref_path) else os.path.join(v, "ref.txt"), encoding="utf-8").read().strip()
tts = F5TTS(model="F5TTS_v1_Base",
            ckpt_file=os.path.join(D, "model", "F5TTS_v1_Base_v4_winter", "model_212000.safetensors"),
            vocab_file=os.path.join(D, "model", "F5TTS_v1_Base", "vocab.txt"), device="cuda")
wavs = []
SR = 24000
GAP, TRIM, NEED = 0.06, 45, 18.0  # стык, порог обрезки тишины (дБ), нужное затухание конца фразы (дБ)
db = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)

def sentences(text):
    parts = [x.strip() for x in re.split(r"(?<=[.?!])\s+", text) if x.strip()]
    out_ = []
    for x in parts:  # совсем короткие вставки приклеиваем к предыдущему предложению
        if out_ and len(x.split()) <= 4: out_[-1] += " " + x
        else: out_.append(x)
    return out_

def infer(text, path, seed):
    for _ in range(8):  # GPU могут делить с другими процессами: при сбое ждём и повторяем
        try:
            tts.infer(os.path.join(v, "ref.wav"), ref_text, text, file_wave=path, speed=a.speed, seed=seed, nfe_step=a.nfe, show_info=lambda *_: None)
            return
        except RuntimeError:
            import torch; torch.cuda.empty_cache(); time.sleep(4)
    raise SystemExit("GPU не отвечает")

for s in range(1, a.takes + 1):
    wav = os.path.join(out, f"take_{s}.wav")
    if a.whole:
        raw = os.path.join(out, f"take_{s}_raw.wav")
        infer(marked, raw, s)
        # F5 оставляет провалы между фразами: ужимаем их до проверки, чтобы время слов совпало с итоговым голосом.
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", "silenceremove=stop_periods=-1:stop_duration=0.16:stop_threshold=-32dB:stop_silence=0.14", wav], check=True)
    else:
        sents = sentences(marked)
        parts = []
        for i, l in enumerate(sents):
            best = None
            for sd in range(s, s + 10):  # дубли предложения: берём первый с мягким концом, иначе самый мягкий
                raw = os.path.join(out, f"take_{s}_s{i}.wav")
                infer(l, raw, sd)
                y, _ = sf.read(raw)
                y, _ = librosa.effects.trim(y, top_db=TRIM)
                drop = db(y) - db(y[-int(0.04 * SR):])
                if best is None or drop > best[0]: best = (drop, y)
                if drop >= NEED: break
            y = best[1].copy()
            fo, fi = int(0.03 * SR), int(0.008 * SR)
            y[-fo:] *= np.linspace(1, 0, fo); y[:fi] *= np.linspace(0, 1, fi)
            parts.append(y)
            if i < len(sents) - 1: parts.append(np.zeros(int(SR * GAP)))
            os.remove(raw)
        sf.write(wav, np.concatenate(parts), SR)
    wavs.append(wav)

subprocess.run([TEXT_PY, TOOLS, "check", out] + wavs, check=True, env=ENV)
best = json.load(open(os.path.join(out, "report.json"), encoding="utf-8"))["best"]
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(out, best + ".wav"), "-af", "loudnorm=I=-15:TP=-1.5:LRA=11", "-ar", "48000", os.path.join(out, "best.wav")], check=True)
shutil.copy(os.path.join(out, best + ".json"), os.path.join(out, "best_words.json"))
print(best)
