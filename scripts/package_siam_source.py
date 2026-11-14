#!/usr/bin/env python3
"""Build a reproducible, self-contained LaTeX source ZIP for the SIAM News feature.

Requires only Python 3 standard library. No edits to the canonical manuscript.
The output preserves the relative paths used by article/main.tex.
"""
from __future__ import annotations

import argparse
from pathlib import Path
import re
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
TOP = "ProximityGraphs-SIAM-News"
FIGURES = ["figure01-water", "figure02-habitat", "figure03-sensors", "figure04-compare"]
PRINT_FIGURES = ["figure01-water", "figure02-habitat", "figure04-compare"]
SOURCE = ROOT / "article" / "main.tex"
PROOF = ROOT / "article" / "output" / "proximitygraphs-siam-news-draft.pdf"

README = """# ProximityGraphs — SIAM News LaTeX author-source bundle

**Status:** Author draft, not submitted, accepted, or approved by SIAM News.

**Authors:** Heriberto Espino-Montelongo (first author);
Héctor Maravillo (second author).

## Contents

- `article/main.tex` — canonical, editable LaTeX manuscript.
- `site/assets/figure01-water.*` through `figure04-compare.*` —
  three printed illustrations plus a fourth online-only comparison, all
  preserved as PNG and SVG (the TeX uses the first three PNGs).
- An optional, previously compiled PDF proof can be included with
  `--include-proof`, but is not bundled by default because it may be stale.
- `SOURCE_REVISION.txt` — revision from which the ZIP was exported.

## Compile

From this unpacked folder, run:

```bash
cd article
pdflatex -interaction=nonstopmode -halt-on-error main.tex
pdflatex -interaction=nonstopmode -halt-on-error main.tex
```

The PDF is produced as `article/main.pdf`. The relative asset path
`../site/assets/...` is intentional; compile from `article/`.

Install a standard TeX Live distribution with `geometry`, `helvet`,
`microtype`, `graphicx`, `amsmath`, `amssymb`, `xcolor`,
`hyperref`, `caption`, and `float`.

## Editorial/source caveats

The print manuscript includes historical, alpha, and graph-comparison figures (SIAM News normally
recommends one to three); the separate sensor inspector remains online. No submitted or approved proof is implied.
Interactive figures remain external links and are not part of this ZIP.
The historical John Snow point digitization and source typeface
artwork require final reproduction-rights confirmation before submission.
No SIAM editorial submission or coauthor approval is implied.

Source: https://github.com/heri-espino/proximitygraphs-siam-figures
Interactive article: https://heri-espino.github.io/proximitygraphs-siam-figures/article.html
"""

def build(out: Path, include_proof: bool = False) -> list[str]:
    tex = SOURCE.read_text(encoding="utf-8")
    expected = re.findall(r"\\pgfigure\{(figure\d\d-[a-z]+)\}", tex)
    if expected != PRINT_FIGURES:
        raise RuntimeError(f"Three print figures expected; third sensor inspector remains online: {expected!r}")
    if "pdfauthor={Heriberto Espino-Montelongo; Hector Maravillo}" not in tex:
        raise RuntimeError("Author metadata is not the current two-author order")
    files = [Path("article/main.tex")]
    for stem in FIGURES:
        files.extend([Path(f"site/assets/{stem}.{ext}") for ext in ("png", "svg")])
    if include_proof and PROOF.is_file():
        files.append(Path("article/output/proximitygraphs-siam-news-draft.pdf"))
    for relative in files:
        candidate = ROOT / relative
        if not candidate.is_file() or candidate.stat().st_size == 0:
            raise FileNotFoundError(candidate)

    try:
        revision = subprocess.check_output(
            ["git", "rev-parse", "HEAD"], cwd=ROOT, text=True
        ).strip()
    except (FileNotFoundError, subprocess.CalledProcessError):
        revision = "unknown"
    data = [(str(path).replace("\\", "/"), (ROOT / path).read_bytes()) for path in files]
    data.append(("README.md", README.encode("utf-8")))
    data.append(("SOURCE_REVISION.txt", (revision + "\n").encode("utf-8")))
    out.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(out, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=8) as z:
        for path, contents in sorted(data):
            info = zipfile.ZipInfo(f"{TOP}/{path}", date_time=(2026, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            z.writestr(info, contents, compress_type=zipfile.ZIP_DEFLATED, compresslevel=8)
    with zipfile.ZipFile(out) as z:
        assert z.testzip() is None
    return sorted(path for path, _ in data)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--output", type=Path, default=ROOT / "dist" / "ProximityGraphs_SIAM_News_LaTeX_Source.zip")
    ap.add_argument("--include-proof", action="store_true",
                    help="include a manually verified current PDF; omitted by default")
    args = ap.parse_args()
    exported = build(args.output, include_proof=args.include_proof)
    print(f"Created {args.output} with {len(exported)} files")
    for filename in exported:
        print(" ", filename)

if __name__ == "__main__":
    main()
