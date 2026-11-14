# Interactive companion — SIAM News author handoff

**Manuscript:** *The Empty Space That Makes a Network*.  
**Status:** Unsubmitted author draft. Neither publication nor external interactive embedding has been authorized by SIAM News.

## Print and online figure mapping

The LaTeX article contains **three static figures**, each linked to an interactive view. The author-hosted online article retains **four** because the rejected-edge sensor witness is most informative interactively.

| Print figure | Source asset | Online article | Standalone interactive | Topic |
| --- | --- | --- | --- | --- |
| Figure 1 | `figure01-water.png` | [Online Figure 1](https://heri-espino.github.io/proximitygraphs-siam-figures/article.html#figure1) | [Water demonstration](https://heri-espino.github.io/proximitygraphs-siam-figures/?embed=water) | Historical pumps; **modern Euclidean** Voronoi/Delaunay, not Snow's road-distance boundary |
| Figure 2 | `figure02-habitat.png` | [Online Figure 2](https://heri-espino.github.io/proximitygraphs-siam-figures/article.html#figure2) | [Alpha demonstration](https://heri-espino.github.io/proximitygraphs-siam-figures/?embed=habitat) | Synthetic 645-point letterform, alpha-shape and curved alpha-hull |
| — online only — | `figure03-sensors.png` | [Online Figure 3](https://heri-espino.github.io/proximitygraphs-siam-figures/article.html#figure3) | [Witness demonstration](https://heri-espino.github.io/proximitygraphs-siam-figures/?embed=sensors) | Synthetic candidate pairs, empty lunes and blocking points |
| Figure 3 | `figure04-compare.png` | [Online Figure 4](https://heri-espino.github.io/proximitygraphs-siam-figures/article.html#figure4) | [Comparison demonstration](https://heri-espino.github.io/proximitygraphs-siam-figures/?embed=compare) | Gabriel versus RNG on **the identical 25 synthetic sites** |

Author-hosted narrative: https://heri-espino.github.io/proximitygraphs-siam-figures/article.html

**Deployment caution:** The URL serves GitHub Pages from the published main-branch workflow. **Changes on an unmerged PR do not automatically appear on the live website.** Verify deployment and browser behavior before sending this manuscript to SIAM News.

## Editorial alternatives

- **If interactive embeds are permitted:** Editors may embed the author-hosted views, with captions and data/illustration credit.
- **If arbitrary iframes are prohibited:** Editors can link to each visualization; the standalone pages remain fully interactive.
- **If only three online graphics are preferred:** Use online Figures 1, 2, and 4, and link to the empty-lune inspector in the text.

[VisualPDE's September 2026 SIAM News article](https://www.siam.org/publications/siam-news/articles/visualpde-interactive-spatiotemporal-modeling-via-web-browsers-on-any-device/) shows precedent, **not guaranteed editorial approval** for this implementation. SIAM News normally recommends one to three credited graphics.

## Scientific provenance

- Unedited reference scenes and all static SVG/PNG images use the pinned **Python ProximityGraphs** exporter. Point edits in the browser use a **separate JavaScript implementation**.
- Fixed-site comparison: Gabriel 46 edges, length 7.873373853, mean pair stretch 1.100802912; RNG 31 edges, length 4.791049476, mean pair stretch 1.271160882. Each mean is over all 300 pairs; see `experiments/experiment020/compare_graph_metrics.py`.
- The empty-region graph framework is credited to Cardinal, Collette, and Langerman (2009), DOI: 10.1016/j.comgeo.2008.09.003.
- Persistent homology, physical network performance, and broader higher-dimensional applications are research directions, not claimed existing software capabilities.
- Snow's parish map **did** use an equidistance boundary measured along roads in 1855; our 13-pump Euclidean tessellation is a different present-day calculation.
- Check reproduction permissions for the historical digitization and letterform source before external publication.

## Rebuild and verify

```bash
python scripts/check_article.py
python scripts/package_siam_source.py
python -m unittest discover -s tests -v
node tests/test_editor.js
cd article
pdflatex -interaction=nonstopmode -halt-on-error main.tex
pdflatex -interaction=nonstopmode -halt-on-error main.tex
```

Serve `site/` over HTTP for browser checks. See `site/EMBEDDING.md` for iframe syntax and `docs/EDITORIAL.md` for editorial sign-off requirements.
