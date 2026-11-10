# experiment018 — Portable SIAM News LaTeX source bundle

**Date:** November 10, 2026  
**Goal:** Deliver a downloadable, self-contained ZIP of the **current** SIAM News author draft with all four actual figures while preserving provenance and compilation reproducibility.

## Existing repository decisions

Read `README.md`, `AGENTS.md`, `AI_HANDOFF.md`, `docs/MANUSCRIPT_WORKFLOW.md`, `article/main.tex`, `scripts/check_article.py`, and the complete source/figure file tree. The current canonical source is **`article/main.tex`**, not the archived `article/feature.md`. The current byline is **Heriberto Espino-Montelongo first and Héctor Maravillo second**, with no third SIAM News author. The manuscript has exactly **four** figures: water, habitat, sensors, and controlled Gabriel/RNG comparison.

## Implementation

Added `scripts/package_siam_source.py`, using the Python standard library to copy the exact canonical TeX, four PNGs, four editable SVGs, a previous PDF proof when present, compilation README, and a source-commit identifier into a portable `ProximityGraphs-SIAM-News/` folder inside the ZIP. Relative paths match the canonical TeX's `../site/assets/` imports. The packager validates the two-author metadata and the expected four figure commands before producing the ZIP, uses reproducible ZIP metadata, and tests its integrity.

Added a dedicated `.github/workflows/package-siam-source.yml` source-package workflow. It runs the existing article checker, builds and validates the ZIP, then uploads it as a downloadable artifact. This does **not** change the manuscript, figures, interactive source, or existing CI tests.

## Reproduce locally

```bash
python scripts/check_article.py
python scripts/package_siam_source.py
unzip -t dist/ProximityGraphs_SIAM_News_LaTeX_Source.zip
mkdir unpacked
unzip -q dist/ProximityGraphs_SIAM_News_LaTeX_Source.zip -d unpacked
cd unpacked/ProximityGraphs-SIAM-News/article
pdflatex -interaction=nonstopmode -halt-on-error main.tex
pdflatex -interaction=nonstopmode -halt-on-error main.tex
```

The default ZIP includes the author-proof PDF only as a reference; it is **not** a journal typeset proof or evidence of SIAM approval. The `--no-proof` option packages just the editable source and figures.

## Findings and limitations

The ZIP is designed to compile without GitHub or network access once extracted, assuming the standard TeX Live packages listed in the bundled README are installed. The four original figures are carried in both raster and vector formats; the compiled TeX uses the PNGs. The external website interactions are **not** embedded into this archive.

The online four-figure feature still exceeds SIAM News's usual recommendation of 1–3 illustrations and needs editorial approval. Historical geodata and source letterform reproduction rights still require review. This project is an **author draft**, not a submission.

## Next actions

Verify the source ZIP GitHub Actions run, download the exact artifact, unzip it and compile a local proof. Confirm four embedded graphics and the two-author metadata before linking it for the user. Record the run and proof checks here. Merge the packaging PR only after available checks pass.

## Executed validation — November 10, 2026

- [Source-ZIP GitHub Actions run #42839459769](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42839459769): **successful**; created and uploaded `ProximityGraphs-SIAM-News-LaTeX-source`.
- [Reproducible figure workflow #42839459459](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42839459459): **successful** on the same PR revision.
- Downloaded the actual ZIP artifact, extracted its inner `ProximityGraphs_SIAM_News_LaTeX_Source.zip`, and ran `unzip -t`: **all 12 files valid**.
- Extracted in an isolated folder and compiled `article/main.tex` twice using locally installed `pdflatex` without modifying the source: **successful**, US Letter, 4 pages, 4 embedded images, 19 PDF links, correct `pdfauthor` = `Heriberto Espino-Montelongo; Hector Maravillo`.
- Rendered all four pages and inspected a contact sheet to confirm captions, all four figures, bibliography, author bios, and readable spacing without clipping.
- The ZIP includes the source `main.tex`, 4 PNGs, 4 SVGs, prior proof PDF, README and exact source revision. This is **not** an SIAM submission or any editorial approval.
