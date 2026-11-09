r"""Текстовая часть озвучки, запускается из venv-text (отдельно от F5, чтобы не ломать зависимости).
prepare <script.txt> <out_dir>  числа в слова, ударения (silero-stress), свой словарь, спорные слова по RUAccent
check <out_dir> <wav...>        сверка дублей с текстом через faster-whisper, выбор лучшего
"""
import difflib, json, os, re, sys

D = os.path.dirname(os.path.abspath(__file__))
VOW = set("аеёиоуыэюя")
WORD = re.compile(r"[+А-Яа-яЁё]+")


def tidy(m):
    """Убирает «+» там, где он не нужен: односложные слова и слова с «ё»."""
    w = m.group(0)
    plain = w.replace("+", "")
    low = plain.lower()
    return plain if sum(c in VOW for c in low) <= 1 or "ё" in low else w


def clean(text):
    return WORD.sub(tidy, text)


def load_dict():
    """stress_dict.txt: по слову на строку с «+», перекрывает автоматику."""
    path = os.path.join(D, "stress_dict.txt")
    if not os.path.exists(path):
        return {}
    rows = [l.split("#")[0].strip().lower() for l in open(path, encoding="utf-8")]
    return {r.replace("+", ""): r for r in rows if r}


def apply_dict(text, table):
    def sub(m):
        w = m.group(0)
        hit = table.get(w.replace("+", "").lower())
        if not hit:
            return w
        return hit[0].upper() + hit[1:] if w.replace("+", "")[0].isupper() and hit[0] != "+" else hit
    return WORD.sub(sub, text)


def ruaccent_marks():
    """RUAccent как второе мнение. Его модель требует token_type_ids, а библиотека их не передаёт: добавляем нули."""
    import numpy as np
    from ruaccent import RUAccent
    acc = RUAccent()
    acc.load(omograph_model_size="turbo3.1", use_dictionary=True, tiny_mode=False)
    sess = acc.accent_model.session
    orig = sess.run
    need = {i.name for i in sess.get_inputs()}

    def run(outs, inputs, *rest):
        if "token_type_ids" in need and "token_type_ids" not in inputs:
            inputs = dict(inputs, token_type_ids=np.zeros_like(inputs["input_ids"]))
        return orig(outs, inputs, *rest)

    sess.run = run
    return acc.process_all


def prepare(script, out):
    from rutextnorm import normalize_russian
    from silero_stress import load_accentor
    os.makedirs(out, exist_ok=True)
    src = " ".join(l.strip() for l in open(script, encoding="utf-8") if l.strip())
    plain = normalize_russian(src)
    silero = clean(load_accentor()(plain))
    table = load_dict()
    marked = apply_dict(silero, table)
    disputed = []
    try:
        other = clean(ruaccent_marks()(plain))
        a, b = WORD.findall(silero), WORD.findall(other)
        if len(a) == len(b):
            disputed = [f"{x} / {y}" for x, y in zip(a, b) if x.lower() != y.lower() and x.replace("+", "").lower() not in table]
        else:
            disputed = ["RUAccent изменил число слов, сравнение пропущено"]
    except Exception as e:
        disputed = [f"RUAccent недоступен: {e}"]
    for name, body in (("plain.txt", plain), ("marked.txt", marked), ("disputed.txt", "\n".join(disputed))):
        open(os.path.join(out, name), "w", encoding="utf-8").write(body)


def letters(text):
    from rutextnorm import normalize_russian
    return re.findall(r"[а-я]+", normalize_russian(text).lower().replace("ё", "е"))


def check(out, wavs):
    from faster_whisper import WhisperModel
    want = letters(open(os.path.join(out, "plain.txt"), encoding="utf-8").read())
    model = WhisperModel("medium", device="cpu", compute_type="int8")
    report = {"takes": []}
    for wav in wavs:
        segs, info = model.transcribe(wav, language="ru", word_timestamps=True)
        words = [[round(float(w.start), 2), round(float(w.end), 2), w.word.strip()] for s in segs for w in s.words]
        got = letters(" ".join(w[2] for w in words))
        sm = difflib.SequenceMatcher(None, want, got, autojunk=False)
        diff = [f"{' '.join(want[i1:i2])} -> {' '.join(got[j1:j2])}" for tag, i1, i2, j1, j2 in sm.get_opcodes() if tag != "equal"]
        gaps = [w[1] for w, n in zip(words, words[1:]) if n[0] - w[1] > 0.6]
        name = os.path.splitext(os.path.basename(wav))[0]
        json.dump(words, open(os.path.join(out, name + ".json"), "w", encoding="utf-8"), ensure_ascii=False)
        report["takes"].append({"take": name, "duration": round(float(info.duration), 2), "match": round(sm.ratio(), 4), "gaps": gaps, "diff": diff})
    report["best"] = max(report["takes"], key=lambda t: t["match"] - 0.01 * len(t["gaps"]))["take"]
    json.dump(report, open(os.path.join(out, "report.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    if sys.argv[1] == "prepare":
        prepare(sys.argv[2], sys.argv[3])
    else:
        check(sys.argv[2], sys.argv[3:])
