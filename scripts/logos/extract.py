import sys, os, numpy as np
from PIL import Image
R = sys.argv[1]; O = sys.argv[2]
def ss(x, lo, hi): return np.clip((x - lo) / (hi - lo), 0, 1)
def load(n): return np.asarray(Image.open(os.path.join(R, n)).convert('RGB')).astype(np.float32) / 255
# name, file, crop (x0,y0,x1,y1 fraction or None), mode, lo, hi
specs = [
  ("odisseia",     "odisseia-0.6.png",       (0.20, 0.35, 0.80, 0.66), "light", 0.30, 0.55),
  ("ascensao",     "ascensao.png",           (0.30, 0.15, 0.70, 0.90), "light", 0.10, 0.45),
  ("drinks-disco", "drinks-disco.png",       (0.25, 0.20, 0.75, 0.80), "light", 0.25, 0.60),
  ("excelencia",   "excelencia.png",         (0.30, 0.20, 0.75, 0.75), "light", 0.25, 0.60),
  ("saber-gestao", "saber-gestao-logo.png",  (0.15, 0.15, 0.85, 0.85), "light", 0.20, 0.45),
  ("saber-pdi",    "saber-pdi.png",          (0.15, 0.10, 0.85, 0.90), "dark",  0.25, 0.65),
  ("travessia",    "travessia.png",          (0.12, 0.15, 0.88, 0.95), "darkblue", 0, 0),
  ("franchi",      "franchi.png",            (0.15, 0.30, 0.85, 0.65), "keybg", 0.10, 0.30),
]
for name, f, crop, mode, lo, hi in specs:
    im = load(f); h, w, _ = im.shape
    if crop: im = im[int(crop[1]*h):int(crop[3]*h), int(crop[0]*w):int(crop[2]*w)]
    lum = im @ np.array([.2126, .7152, .0722], np.float32)
    mx = im.max(2)
    if mode == "light":  a = ss(np.maximum(lum, mx * .8), lo, hi)
    elif mode == "dark": a = ss(1 - lum, lo, hi)
    elif mode == "darkblue":  # navy lettering on pale paper: dark AND bluish
        a = ss(1 - lum, 0.45, 0.70) * ss(im[..., 2] - im[..., 0], -0.02, 0.06)
    elif mode == "keybg":
        bg = np.median(np.concatenate([im[:8].reshape(-1, 3), im[-8:].reshape(-1, 3)]), 0)
        a = ss(np.abs(im - bg).sum(2), lo, hi)
    # tight bbox on solid alpha, then pad
    ys, xs = np.where(a > 0.5)
    if not len(xs): print("empty", name); continue
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    p = int(0.04 * max(y1 - y0, x1 - x0))
    y0, x0 = max(0, y0 - p), max(0, x0 - p); y1, x1 = min(a.shape[0], y1 + p), min(a.shape[1], x1 + p)
    a = a[y0:y1, x0:x1]
    A = (a * 255).astype(np.uint8)
    for tone, rgb in (("ink", (10, 10, 10)), ("white", (255, 255, 255))):
        out = np.zeros((*A.shape, 4), np.uint8); out[..., :3] = rgb; out[..., 3] = A
        img = Image.fromarray(out, 'RGBA'); hh = 240
        img = img.resize((max(1, round(img.width * hh / img.height)), hh), Image.LANCZOS)
        img.save(os.path.join(O, f"{name}-{tone}.png"), optimize=True)
    print(name, A.shape)
