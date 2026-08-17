"""Search the nine lane inks for THE CABINET, the dark arcade theme.

The problem, restated for a dark ground. A lane ink has to carry 9.5px chip
text on its own dark tint, and it has to read as a mark on the lightest
surface in the system, so on this theme it has a FLOOR of roughly L* 68
rather than the ceiling of L* 45 that the light theme had. Above L* 68 the
sRGB gamut narrows fast: at L* 90 a magenta can hold perhaps C 30 while a
yellow holds C 90. Saturated colour also collapses harder under dichromacy
than muted colour does, and CIEDE2000's lightness term is divided by S_L,
which grows with |L* - 50|, so a 10 L* step at L* 85 counts for far less
than the same step at L* 30.

All three of those work against the 8.85 dE2000 floor the light theme
reached. So the ramp is not hand picked. This searches three hue families
crossed with three lightness bands, takes the maximum in-gamut chroma at
each cell, and reports the arrangement with the highest worst-pair
separation under Vienot, Brettel and Mollon protanopia, deuteranopia and
tritanopia.

Run: python3 scripts/lane_search.py
"""

import itertools
import sys
from functools import lru_cache

sys.path.insert(0, __file__.rsplit("/", 1)[0])

from colorlab import (contrast, delta_e2000, lch_clamped, lstar, simulate)


@lru_cache(maxsize=None)
def cell_c(L, h):
    """Maximum in-gamut chroma at this lightness and hue. Cached, because the
    search asks for the same cell tens of thousands of times."""
    return lch_clamped(float(L), 100.0, float(h % 360))


def cell(L, h):
    return cell_c(L, h)[0]


@lru_cache(maxsize=None)
def sim3(hexv):
    return tuple(simulate(hexv, k) for k in ("protan", "deutan", "tritan"))

# The semantic grid is fixed by the product and is not up for negotiation.
# Column is the buyer family, row is the greyscale band.
GRID = [
    # band 1, deepest        band 2                  band 3, lightest
    ["schools", "colleges", "fitness"],              # family A, calendar locked
    ["local-retail-food", "auto", "corporate"],      # family B, discretionary
    ["healthcare", "hospitality", "faith"],          # family C, discretionary
]

DICH = ("protan", "deutan", "tritan")


def build(hues, bands, hue_drift):
    """hues: three family hues. bands: three L* values. hue_drift: degrees the
    family hue is allowed to rotate per band, which buys chroma at the light
    end where the gamut pinches."""
    out = {}
    for fi, fam in enumerate(GRID):
        for bi, lane in enumerate(fam):
            h = (hues[fi] + hue_drift[fi] * (bi - 1)) % 360
            out[fam[bi]] = cell(bands[bi], round(h, 1))
    return out


def floor_of(lanes):
    """Worst CIEDE2000 across all 36 pairs and all three dichromacies."""
    worst = 1e9
    sims = {k: sim3(v) for k, v in lanes.items()}
    for a, b in itertools.combinations(lanes, 2):
        sa, sb = sims[a], sims[b]
        for i in range(3):
            d = delta_e2000(sa[i], sb[i])
            if d < worst:
                worst = d
                if worst < 3.0:
                    return worst
    return worst


def report(lanes, bands):
    pairs = []
    for a, b in itertools.combinations(lanes, 2):
        de = {k: delta_e2000(simulate(lanes[a], k), simulate(lanes[b], k))
              for k in DICH}
        pairs.append((min(de.values()), a, b, de))
    pairs.sort()
    for m, a, b, de in pairs[:6]:
        print(f"    {a:<18s} vs {b:<18s} min dE={m:6.2f}"
              f"  (P{de['protan']:6.1f} D{de['deutan']:6.1f} T{de['tritan']:6.1f})")
    print(f"    FLOOR {pairs[0][0]:.2f}")


def min_chroma(hues, bands, drift):
    lo = 999.0
    for fi in range(3):
        for bi in range(3):
            h = (hues[fi] + drift[fi] * (bi - 1)) % 360
            lo = min(lo, cell_c(bands[bi], round(h, 1))[1])
    return lo


def main():
    # Candidate family hues. The three have to be spread on the blue/yellow
    # axis that survives protanopia and deuteranopia AND on the red/green axis
    # that survives tritanopia, so the search is over triples rather than over
    # one hue at a time.
    # CHROMA IS A CONSTRAINT, NOT A PREFERENCE. Left alone the search will
    # happily push the light band to L* 94, where every hue is a pastel and
    # the separation comes from lightness. That measures well and looks like
    # a hospital. The brief asks for ink at full strength, so every one of the
    # nine cells has to hold at least CFLOOR chroma or the arrangement is
    # rejected outright.
    CFLOOR = float(sys.argv[1]) if len(sys.argv) > 1 else 40.0

    hue_grid = list(range(0, 360, 6))
    band_sets = [
        (68, 77, 86), (68, 78, 88), (69, 78, 87), (70, 79, 88),
        (68, 79, 90), (69, 80, 91), (70, 80, 90), (68, 76, 84),
        (71, 80, 89), (69, 79, 89), (68, 80, 88), (72, 81, 90),
    ]
    drift_sets = [(0, 0, 0), (10, 10, 10), (-10, -10, -10), (12, -12, 12),
                  (18, 0, -18), (0, 18, -18), (-18, 18, 0), (20, 20, 20),
                  (-20, -20, -20), (25, -25, 25), (15, 15, -15), (-15, 15, 15)]

    best = None
    # Coarse pass: fix bands, sweep hue triples.
    for h1, h2, h3 in itertools.combinations(hue_grid, 3):
        if min((h2 - h1), (h3 - h2), (360 + h1 - h3)) < 45:
            continue
        hs = (h1, h2, h3)
        if min_chroma(hs, (69, 79, 89), (0, 0, 0)) < CFLOOR:
            continue
        f = floor_of(build(hs, (69, 79, 89), (0, 0, 0)))
        if best is None or f > best[0]:
            best = (f, hs)
    print("coarse best hues", best)

    h0 = best[1]
    best2 = None
    for d1 in range(-6, 7, 2):
        for d2 in range(-6, 7, 2):
            for d3 in range(-6, 7, 2):
                hs = (h0[0] + d1, h0[1] + d2, h0[2] + d3)
                for bands in band_sets:
                    for drift in drift_sets:
                        if min_chroma(hs, bands, drift) < CFLOOR:
                            continue
                        f = floor_of(build(hs, bands, drift))
                        if best2 is None or f > best2[0]:
                            best2 = (f, hs, bands, drift)
    print("fine best", best2)
    f, hs, bands, drift = best2
    lanes = build(hs, bands, drift)
    for k, v in lanes.items():
        h = None
        print(f"  {k:<20s} {v}  L*={lstar(v):5.1f}")
    print(f"  min chroma {min_chroma(hs, bands, drift):.1f}")
    report(lanes, bands)


if __name__ == "__main__":
    main()
