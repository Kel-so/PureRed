# second batch: logos the user sent + official files; smooth edges by upscale → threshold → downscale
import sys, os, numpy as np
from PIL import Image
from scipy import ndimage
R, O = sys.argv[1], sys.argv[2]
H = 128            # final height used by the clients band
SS = 4             # supersampling factor for the threshold pass
def ss(x, lo, hi): return np.clip((x - lo) / (hi - lo), 0, 1)
def rgb(f): return np.asarray(Image.open(os.path.join(R, f)).convert('RGB')).astype(np.float32) / 255
def rgba(f): return np.asarray(Image.open(os.path.join(R, f)).convert('RGBA')).astype(np.float32) / 255
def lum(im): return im[..., :3] @ np.array([.2126, .7152, .0722], np.float32)
def sat(im): mx = im[..., :3].max(2); return (mx - im[..., :3].min(2)) / np.maximum(mx, 1e-3)

def granja():      # white line art on charcoal
    im = rgb('user/01.jpeg'); return ss(lum(im), .35, .65)
def newshoes():    # official PNG from newshoes.com, shape = alpha
    return rgba('web/raw/newshoes-logo.png')[..., 3]
def skoria():      # red blackletter + the dark subtitle row; pigs left out (illegible at band size)
    im = rgb('user/03.jpeg'); r, g, b = im[..., 0], im[..., 1], im[..., 2]
    dark = ss(1 - lum(im), .42, .58)
    seed = (ss(r - g, .07, .13) * dark > .5); seed[:112] = False   # brick red; the pigs' grey linework has r≈g
    lab, n = ndimage.label(seed)                                     # drop red specks (cigar, skin tones)
    keep = np.isin(lab, 1 + np.flatnonzero(ndimage.sum(seed, lab, range(1, n + 1)) >= 30))
    red = dark * ndimage.binary_dilation(keep, iterations=2)         # + the letters' own dark outlines
    sub = ss(1 - lum(im), .26, .42); sub[:185] = 0; sub[199:] = 0
    return np.maximum(red, sub)
def fejepar():     # teal knot + navy wordmark on white
    im = rgb('user/04.png'); return ss(np.maximum(1 - lum(im), sat(im)), .15, .35)
def nejlon():      # four triangles (one light grey) on white
    im = rgb('user/05.jpeg'); return ss(np.maximum(1 - lum(im), sat(im)), .08, .18)
def numar():       # white lighthouse on red
    im = rgb('user/06.jpeg'); return ss(im.min(2), .45, .75)
def unect():       # official vector (unect.com.br) rendered at 1024px
    return rgba('web/raw/unect-logo-1024.png')[..., 3]

def finish(a, name, min_area=60, lo=.42):
    ys, xs = np.where(a > .5); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    p = max(2, int(.03 * (y1 - y0)))
    a = np.pad(a, p)[y0:y1 + 2 * p, x0:x1 + 2 * p]
    k = H * SS / a.shape[0]
    big = Image.fromarray((a * 255).astype(np.uint8)).resize((round(a.shape[1] * k), H * SS), Image.BICUBIC)
    m = ss(np.asarray(big, np.float32) / 255, lo, lo + .16)   # lower lo = bolder strokes
    lab, n = ndimage.label(m > .5)
    if n:
        sizes = ndimage.sum(m > .5, lab, range(1, n + 1))
        for i, s in enumerate(sizes, 1):
            if s < min_area: m[lab == i] = 0
    A = Image.fromarray((m * 255).astype(np.uint8)).resize((round(m.shape[1] / SS), H), Image.LANCZOS)
    for tone, c in (("ink", (10, 10, 10)), ("white", (255, 255, 255))):
        out = Image.new('RGBA', A.size, c + (0,)); out.putalpha(A)
        solid = Image.new('RGBA', A.size, c + (255,)); solid.putalpha(A)
        solid.save(os.path.join(O, f"{name}-{tone}.png"), optimize=True)
    print(name, A.size)

MIN = {"granja360": 6, "skoria": 12}
for name, fn in [("granja360", granja), ("newshoes", newshoes), ("skoria", skoria), ("fejepar", fejepar),
                 ("nejlon", nejlon), ("numar", numar), ("unect", unect)]:
    finish(fn(), name, MIN.get(name, 60), .14 if name == "granja360" else .42)   # granja's hairlines vanish at band size
