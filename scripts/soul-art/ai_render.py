"""
AI-painted card pictures of "Walka o duszę" (replace the SVG drawings of the cards in ai-prompts.json).

Runs locally with ComfyUI (SDXL + DMD2) through the `cardgen.py` helper, then crops each picture to
4:3 and writes `public/soul/art/<id>.webp` (600x450, like the other card pictures).

    <ComfyUI>/python_embeded/python.exe scripts/soul-art/ai_render.py            # every card
    <ComfyUI>/python_embeded/python.exe scripts/soul-art/ai_render.py lektor ... # only these

Seeds are fixed in ai-prompts.json, so a rerun reproduces the same picture; change a card's seed or
prompt to redraw it. CARDGEN overrides the path to cardgen.py.
"""
import json
import os
import subprocess
import sys
import tempfile

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(ROOT, "public", "soul", "art")
CARDGEN = os.environ.get("CARDGEN", os.path.expanduser("~/ComfyUI/cardgen/cardgen.py"))
W, H = 600, 450

SIDE = {
    "parish": "warm golden light, hopeful peaceful atmosphere",
    "demons": "sinister shadowy atmosphere, deep purple and crimson tones, menacing but not gory",
}
NEGATIVE = (
    "text, letters, words, writing, caption, watermark, signature, logo, blurry, frame, border, "
    "gore, blood, nudity, deformed hands, extra fingers"
)


def to_card(png: str, dest: str) -> None:
    img = Image.open(png).convert("RGB")
    w, h = img.size
    cw = min(w, round(h * W / H))  # centre crop to 4:3
    ch = round(cw * H / W)
    left, top = (w - cw) // 2, (h - ch) // 2
    img.crop((left, top, left + cw, top + ch)).resize((W, H), Image.LANCZOS).save(dest, "WEBP", quality=82)


def main() -> None:
    with open(os.path.join(HERE, "ai-prompts.json"), encoding="utf-8") as f:
        cards = json.load(f)
    only = sys.argv[1:]
    unknown = [i for i in only if i not in cards]
    if unknown:
        sys.exit(f"not in ai-prompts.json: {', '.join(unknown)}")
    ids = only or list(cards)
    with tempfile.TemporaryDirectory() as tmp:
        batch = [
            {"name": i, "seed": cards[i]["seed"], "prompt": f"{cards[i]['prompt']}, {SIDE[cards[i]['side']]}"}
            for i in ids
        ]
        batch_file = os.path.join(tmp, "batch.json")
        with open(batch_file, "w", encoding="utf-8") as f:
            json.dump(batch, f)
        cmd = [sys.executable, CARDGEN, "--batch", batch_file, "--style", "fantasy", "--size", "landscape",
               "--out", tmp, "--negative", NEGATIVE]
        proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, text=True, encoding="utf-8")
        done = 0
        for line in proc.stdout:
            line = line.strip()
            if not line.startswith("{"):
                continue
            r = json.loads(line)
            to_card(r["files"][0], os.path.join(OUT, f"{r['name']}.webp"))
            done += 1
            print(f"[{done}/{len(ids)}] {r['name']} ({r['seconds']}s)", flush=True)
        if proc.wait() != 0:
            sys.exit(f"cardgen failed (exit {proc.returncode})")
    print(f"rendered {done} pictures")


if __name__ == "__main__":
    main()
