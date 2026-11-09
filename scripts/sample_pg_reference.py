"""Reproduce the serif Pg point sample from the user-supplied image.

One-time optional dependencies: pillow numpy opencv-python-headless.
Run:
  python scripts/sample_pg_reference.py --input reference.png --output data/typography/pg_reference.u16.b64

Reference is a 806x616 screenshot of the serif P / flourished lowercase g.
Production users do NOT require the screenshot or OpenCV: the deterministic
380-point quantized result is committed to the repository.
"""
from __future__ import annotations
import argparse
import base64
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

THRESHOLD = 200
SEED = 32571
CONTOUR_SPACING_PX = 18
GRID_SPACING_PX = 30
GRID_KEEP_PROBABILITY = .88


def sample(image_path: Path) -> np.ndarray:
    image = np.asarray(Image.open(image_path).convert("L"))
    if image.shape != (616, 806):
        raise ValueError("Expected the exact 806x616 reference screenshot")
    ink = image < THRESHOLD
    contours, _ = cv2.findContours(ink.astype("uint8"),
                                    cv2.RETR_TREE, cv2.CHAIN_APPROX_NONE)
    contours = [c[:, 0, :].astype(float) for c in contours
                if abs(cv2.contourArea(c)) > 3000]
    if len(contours) != 4:
        raise ValueError("Expected exactly two exterior glyph contours and two counters")
    rng = np.random.default_rng(SEED)
    sampled = []
    for c in contours:
        segments = np.diff(np.concatenate([c, c[:1]]), axis=0)
        lengths = np.linalg.norm(segments, axis=1)
        cumulative = np.r_[0, np.cumsum(lengths)]
        total = cumulative[-1]
        count = max(3, round(total/CONTOUR_SPACING_PX))
        positions = ((np.arange(count) + rng.uniform(-.17, .17, count))
                     * total / count) % total
        for value in positions:
            k = min(len(lengths)-1, max(0, int(
                np.searchsorted(cumulative, value, side="right")-1)))
            point = c[k]+(value-cumulative[k])/max(lengths[k], .01)*segments[k]
            x, y = np.rint(point).astype(int)
            if not ink[np.clip(y,0,615),np.clip(x,0,805)]:
                point = point + .5*rng.standard_normal(2)
            sampled.append(point)
    boundary_count = len(sampled)

    for y in range(50,575,GRID_SPACING_PX):
        for x in range(23,691,GRID_SPACING_PX):
            if rng.random() > GRID_KEEP_PROBABILITY:
                continue
            point = np.array([
                x+rng.uniform(-.25,.25)*GRID_SPACING_PX,
                y+rng.uniform(-.25,.25)*GRID_SPACING_PX])
            px, py = np.rint(point).astype(int)
            if px<0 or px>=806 or py<0 or py>=616 or not ink[py,px]:
                continue
            if min(np.linalg.norm(point-other) for other in sampled) < 9:
                continue
            sampled.append(point)

    points = np.asarray(sampled)
    scale = .86 / (692-20)
    xy = np.column_stack([
        .07+(points[:,0]-20)*scale,
        .5-(points[:,1]-310.5)*scale])
    # Open the thin white slit in the lower g flourish, rather than creating
    # a false third alpha-shape hole by placing too many sites at the neck.
    keep = np.linalg.norm(xy-np.array([.595,.27]),axis=1)>.035
    retained_outline = int(np.count_nonzero(keep[:boundary_count]))
    xy = np.vstack([xy[keep],[[.146,.78],[.14,.75]]])
    if xy.shape != (380,2) or retained_outline != 298:
        raise AssertionError(f"Sampling drift: {xy.shape}, {retained_outline} outline sites")
    return xy


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    points = sample(args.input)
    encoded = base64.b64encode(
        np.round(points*65535).astype("<u2").tobytes()).decode("ascii")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(encoded+"\n", encoding="ascii")
    print(f"Wrote {len(points)} normalized point sites to {args.output}")


if __name__ == "__main__":
    main()
