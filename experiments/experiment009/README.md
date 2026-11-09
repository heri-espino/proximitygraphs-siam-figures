# experiment009 — Verified graph-family breadth and bio-inspired models

**Date:** November 8, 2026
**Status:** Manuscript update implemented; first PDF failure diagnosed and fixed, subsequent editorial and figure CI passed.

## Research objective and editorial question

How should a short SIAM News Software and Programming article establish the breadth of ProximityGraphs without distracting readers with a 16-name constructor catalogue? The aim is to demonstrate multiple *mathematical definitions of a neighbor*, explain source-verified implemented functionality, and introduce two distinct bio-inspired models.

## Sources examined

Upstream [ProximityGraphs repository at pinned SHA d1a216d7](https://github.com/ProximityGraphs/ProximityGraphs/tree/d1a216d7255cbebea68dcaad6a97382168a3ec55): README, root API exports, proximity constructor exports, gamma/beta/stepping and other implementation modules, Physarum and Fungal source, Sphinx docs, package metadata and Experiment class. Complete name and implementation inventory with caveats: [docs/IMPLEMENTED_FAMILIES.md](../../docs/IMPLEMENTED_FAMILIES.md).

## Implementation

Updated article/feature.md to illustrate families by *function*: Voronoi and Delaunay for partition/adjacency; MST and NNG for sparse local structures; Gabriel, RNG and beta-skeletons for empty regions; gamma-neighborhood, stepping-stone and elliptic-Gabriel graphs for adjustable regional tests; alpha-shape/hull for boundaries. Added two bio-inspired heuristic constructors: simulated-flow PhysarumGraph and constructive FungalGraph. The final paragraphs emphasize reproducible point generation, graph comparison, geometric metrics and optional GIS. Existing three illustrations and ten references remain intact.

Updated the pitch, marketing kit, and README for consistency. The full inventory was deliberately kept outside the magazine feature in a technical note. No new figures or empirical validations were added.

## Bug and repair

Initial [editorial PDF workflow run 42553015465](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42553015465) failed at a raw Unicode beta character nested inside bold Markdown. The renderer originally substituted Greek in ordinary text after isolating bold spans, so it missed the nested character. Added Greek-to-LaTeX substitutions inside tex_escape, preserving mathematical notation in bold or linked phrases.

## Reproduce

From the repository root:

~~~bash
python scripts/render_article.py
python scripts/check_article.py
cd article
pdflatex -interaction=nonstopmode -halt-on-error main.tex
pdflatex -interaction=nonstopmode -halt-on-error main.tex
~~~

Successful [editorial PDF workflow #42553296658](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42553296658) and [figure/mathematics workflow #42553296605](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42553296605). Re-check the resulting PDF for actual Greek typography, links, captions, embedded images and final page count. The workflow commits its PDF to article/output.

## Findings, boundaries, and next steps

The public API has 16 named geometric/related constructors and 2 bio-inspired ones. Gamma_Graph, Beta_Skeleton and Stepping_Stone are actually implemented; a broad research motivation is not evidence that every constructor works in arbitrary dimension. Physarum/Fungal are algorithmic analogues of adaptive biological networks, not biological data or optimal-routing guarantees. The article remains a provisional SIAM News draft. Review the proof and request coauthor approval before submission; any new comparative performance claims require dedicated numerical experiments.


## Final PDF and repository verification

- Editorial PDF CI [run #42553296658](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42553296658) completed **successfully** after the nested Greek character fix; the reproducible scientific figure/mathematics [run #42553296605](https://github.com/heri-espino/proximitygraphs-siam-figures/actions/runs/42553296605) also passed.
- Downloaded the actual PDF artifact and inspected every page in a four-panel rendered image montage. Verified **4 US Letter pages**, **3 embedded images**, correct figure-to-text associations, mathematical symbols β and γ, the feature's Physarum/Fungal section on page 4, references, and the three biographies on page 4 rather than an orphan page.
- The source draft stays within editorial length (approximately 1,300 words under the article's preflight method), with **3 figure captions and 10 bibliography entries**. Citation author identities and publication status remain unchanged.
- No independent algorithmic performance comparison was executed; marketing claims are source/API audit and qualitative scientific examples only.
