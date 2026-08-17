"""Colour maths for the theme directions.

Everything published in RESEARCH_theme_directions.md is computed here rather
than estimated by eye. Three jobs:

  1. WCAG 2.x relative-luminance contrast, so every text/surface pair in the
     proposal carries a real ratio and a real pass/fail.
  2. CIE L* so the lane ramp can be checked for greyscale separation, which is
     the property that actually makes the palette safe for a colourblind owner.
  3. Viénot-Brettel-Mollon dichromacy simulation, so lane pairs can be checked
     under deuteranopia, protanopia and tritanopia rather than assumed safe
     because they came from a palette that was safe in a different arrangement.
"""

import numpy as np


# ---------------------------------------------------------------- conversions

def hex_to_rgb(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=float) / 255.0


def rgb_to_hex(rgb):
    v = np.clip(rgb, 0, 1) * 255.0
    return "#" + "".join(f"{int(round(c)):02x}" for c in v)


def srgb_to_linear(c):
    c = np.asarray(c, dtype=float)
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def linear_to_srgb(c):
    c = np.clip(np.asarray(c, dtype=float), 0, 1)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * (c ** (1 / 2.4)) - 0.055)


def relative_luminance(h):
    lin = srgb_to_linear(hex_to_rgb(h))
    return float(np.dot(lin, [0.2126, 0.7152, 0.0722]))


def contrast(a, b):
    la, lb = relative_luminance(a), relative_luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


# --------------------------------------------------------------------- CIELAB

_M_RGB_XYZ = np.array([
    [0.4124564, 0.3575761, 0.1804375],
    [0.2126729, 0.7151522, 0.0721750],
    [0.0193339, 0.1191920, 0.9503041],
])
_WHITE = np.array([0.95047, 1.00000, 1.08883])


def hex_to_lab(h):
    xyz = _M_RGB_XYZ @ srgb_to_linear(hex_to_rgb(h))
    t = xyz / _WHITE
    f = np.where(t > (6 / 29) ** 3, np.cbrt(t), t / (3 * (6 / 29) ** 2) + 4 / 29)
    return np.array([116 * f[1] - 16, 500 * (f[0] - f[1]), 200 * (f[1] - f[2])])


def lstar(h):
    return float(hex_to_lab(h)[0])


def delta_e76(a, b):
    return float(np.linalg.norm(hex_to_lab(a) - hex_to_lab(b)))


def delta_e2000(h1, h2):
    """CIEDE2000. Worth the arithmetic: dE76 badly overstates the separation of
    saturated blues, which is exactly where a lane palette gets into trouble."""
    L1, a1, b1 = hex_to_lab(h1)
    L2, a2, b2 = hex_to_lab(h2)
    C1, C2 = np.hypot(a1, b1), np.hypot(a2, b2)
    Cb = (C1 + C2) / 2
    G = 0.5 * (1 - np.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7))) if Cb > 0 else 0.5
    a1p, a2p = (1 + G) * a1, (1 + G) * a2
    C1p, C2p = np.hypot(a1p, b1), np.hypot(a2p, b2)
    h1p = np.degrees(np.arctan2(b1, a1p)) % 360
    h2p = np.degrees(np.arctan2(b2, a2p)) % 360
    dLp = L2 - L1
    dCp = C2p - C1p
    if C1p * C2p == 0:
        dhp = 0.0
    elif abs(h2p - h1p) <= 180:
        dhp = h2p - h1p
    elif h2p - h1p > 180:
        dhp = h2p - h1p - 360
    else:
        dhp = h2p - h1p + 360
    dHp = 2 * np.sqrt(C1p * C2p) * np.sin(np.radians(dhp) / 2)
    Lbp = (L1 + L2) / 2
    Cbp = (C1p + C2p) / 2
    if C1p * C2p == 0:
        hbp = h1p + h2p
    elif abs(h1p - h2p) <= 180:
        hbp = (h1p + h2p) / 2
    elif h1p + h2p < 360:
        hbp = (h1p + h2p + 360) / 2
    else:
        hbp = (h1p + h2p - 360) / 2
    T = (1 - 0.17 * np.cos(np.radians(hbp - 30)) + 0.24 * np.cos(np.radians(2 * hbp))
         + 0.32 * np.cos(np.radians(3 * hbp + 6)) - 0.20 * np.cos(np.radians(4 * hbp - 63)))
    dTheta = 30 * np.exp(-(((hbp - 275) / 25) ** 2))
    Rc = 2 * np.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7)) if Cbp > 0 else 0.0
    Sl = 1 + (0.015 * (Lbp - 50) ** 2) / np.sqrt(20 + (Lbp - 50) ** 2)
    Sc = 1 + 0.045 * Cbp
    Sh = 1 + 0.015 * Cbp * T
    Rt = -np.sin(np.radians(2 * dTheta)) * Rc
    return float(np.sqrt((dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2
                         + Rt * (dCp / Sc) * (dHp / Sh)))


# --------------------------------------------------------------- dichromacies

# Hunt-Pointer-Estevez, normalised to D65. Viénot, Brettel and Mollon (1999)
# do the simulation as a projection onto the plane of confusion in LMS.
_RGB_LMS = np.array([
    [0.31399022, 0.63951294, 0.04649755],
    [0.15537241, 0.75789446, 0.08670142],
    [0.01775239, 0.10944209, 0.87256922],
])
_LMS_RGB = np.linalg.inv(_RGB_LMS)

_SIM = {
    "protan": np.array([[0.0, 1.05118294, -0.05116099],
                        [0.0, 1.0, 0.0],
                        [0.0, 0.0, 1.0]]),
    "deutan": np.array([[1.0, 0.0, 0.0],
                        [0.9513092, 0.0, 0.04264193],
                        [0.0, 0.0, 1.0]]),
    "tritan": np.array([[1.0, 0.0, 0.0],
                        [0.0, 1.0, 0.0],
                        [-0.86744736, 1.86727089, 0.0]]),
}


def simulate(h, kind):
    lin = srgb_to_linear(hex_to_rgb(h))
    lms = _RGB_LMS @ lin
    out = _LMS_RGB @ (_SIM[kind] @ lms)
    return rgb_to_hex(linear_to_srgb(out))


def greyscale(h):
    """Luminance-preserving desaturation, which is what a monochrome print or a
    greyscale filter actually does."""
    y = relative_luminance(h)
    v = linear_to_srgb(np.array([y, y, y]))
    return rgb_to_hex(v)


# ------------------------------------------------------------------- reporting

def fmt(x, n=2):
    return f"{x:.{n}f}"


def check_pairs(pairs, floor=4.5):
    """pairs: list of (label, fg, bg). Returns rows and a list of failures."""
    rows, bad = [], []
    for label, fg, bg in pairs:
        r = contrast(fg, bg)
        ok = r >= floor
        rows.append((label, fg, bg, r, ok))
        if not ok:
            bad.append((label, fg, bg, r))
    return rows, bad


# ------------------------------------------------- LCh construction (CIELAB)

def lab_to_hex(L, a, b):
    fy = (L + 16) / 116
    fx = fy + a / 500
    fz = fy - b / 200
    def finv(t):
        return t ** 3 if t > 6 / 29 else 3 * (6 / 29) ** 2 * (t - 4 / 29)
    xyz = np.array([finv(fx), finv(fy), finv(fz)]) * _WHITE
    lin = np.linalg.inv(_M_RGB_XYZ) @ xyz
    return rgb_to_hex(linear_to_srgb(lin)), bool(np.all(lin >= -0.001) and np.all(lin <= 1.001))


def lch_to_hex(L, C, h_deg):
    a = C * np.cos(np.radians(h_deg))
    b = C * np.sin(np.radians(h_deg))
    return lab_to_hex(L, a, b)


def lch_clamped(L, C, h_deg):
    """Walk chroma down until the colour is inside sRGB, so a requested hue and
    lightness always yield a usable token instead of a clipped surprise."""
    c = C
    while c > 0:
        hexv, ok = lch_to_hex(L, c, h_deg)
        if ok and abs(lstar(hexv) - L) < 0.6:
            return hexv, c
        c -= 1.0
    return lab_to_hex(L, 0, 0)[0], 0.0
