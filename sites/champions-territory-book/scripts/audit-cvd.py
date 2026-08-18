"""Greyscale and Vienot-Brettel-Mollon dichromacy over whole images.

Reuses the matrices and the transfer functions in colorlab.py rather than
restating them, so an image simulation and a token simulation cannot drift.
"""
import sys
import numpy as np
from PIL import Image
import colorlab as C


def to_lin(a):
    return C.srgb_to_linear(a)


def from_lin(a):
    return C.linear_to_srgb(a)


def sim_image(img, kind):
    a = np.asarray(img.convert("RGB"), dtype=float) / 255.0
    lin = to_lin(a)
    lms = lin @ C._RGB_LMS.T
    out = (lms @ C._SIM[kind].T) @ C._LMS_RGB.T
    return Image.fromarray((np.clip(from_lin(out), 0, 1) * 255).round().astype(np.uint8))


def grey_image(img):
    a = np.asarray(img.convert("RGB"), dtype=float) / 255.0
    lin = to_lin(a)
    y = lin @ np.array([0.2126, 0.7152, 0.0722])
    v = from_lin(np.stack([y, y, y], axis=-1))
    return Image.fromarray((np.clip(v, 0, 1) * 255).round().astype(np.uint8))


if __name__ == "__main__":
    for p in sys.argv[1:]:
        img = Image.open(p)
        stem = p[:-4]
        grey_image(img).save(stem + "--grey.png")
        for k in ("protan", "deutan", "tritan"):
            sim_image(img, k).save(f"{stem}--{k}.png")
        print("wrote", stem)
