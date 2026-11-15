# experiment019 — From generic overview to a mathematically grounded SIAM News story

**Date:** 2026-11-14. **Status:** Original rewritten author draft; not submitted, accepted, or endorsed by SIAM.

## Objective and editorial thesis

The original draft was a general tour of graph definitions and suggested applications. The new article tells one specific story: **the absence of points in a region can determine an edge, and its geometry controls both network structure and statistical predictions.** The narrative uses John Snow's Soho map, the 1969 Gabriel–Sokal geographic analysis, Toussaint's RNG, 2D alpha-shape/hull morphology, a controlled sensor-network comparison, and arbitrary-dimensional Poisson stochastic geometry. The revised manuscript is **article/main.tex**, not the historical `article/feature.md`.

## Existing artifacts and preservation

Read the original user-supplied LaTeX ZIP; the repository README, AGENTS.md, AI_HANDOFF.md, previous experiment015–018 reports, checker, package workflow, canonical TeX, interactive source, and four original image pairs. Archived the full pre-rewrite manuscript in **previous-main.tex**. No source figure PNG/SVG, point set, experiment, implementation, or live demo was deleted or regenerated.

Current byline remains **Heriberto Espino-Montelongo first**, **Héctor Maravillo second**; no third SIAM author.

## Literature and numerical verification

Primary reference PDFs supplied by the user were inspected: Devroye (1988), Gabriel & Sokal (1969), Penrose & Yukich (2001), Veltkamp (1992), Watanabe (2008), Maravillo Gómez et al. (2023), and Goldstein et al. (2018). Verified Goldstein and Dyballa bibliographic details against their journal records and the official SIAM News 2-page guide (800–1400 words, 1–3 credited print figures, <=10 APA references, accessible Software and Programming). The article retains ten alphabetized citations, now including **Penrose & Yukich (2001)** and **Goldstein et al. (2018)** for justified distributional-limit statements.

**Exact Poisson assumptions.** In a stationary Poisson process of intensity `rho` in `R^d`, condition on two sites distance `r` apart. If the forbidden region is open and has location- and orientation-independent volume `a_K r^d` (`a_K>0`), the void probability is `exp(-rho a_K r^d)`. The typical degree follows by integrating over other sites: `rho * int_Rd exp(-rho a_K ||x||^d) dx = v_d / a_K`, where `v_d = pi^(d/2)/Gamma(d/2+1)`. Under these conditions, degree expectation does **not** depend on intensity. The planar Gabriel region has `a_K=pi/4` and degree 4. Planar RNG has `a_K=2pi/3-sqrt(3)/2` and degree ~2.55753. This expectation is **not** a distributional identity for arbitrary finite, inhomogeneous or nonhomothetic samples. Normal limits for totals need additional hypotheses.

**Comparison from existing figure04:** On 25 identical synthetic sites, Python-generated Gabriel graph has 46 edges and RNG has 31; observed degrees are 92/25=3.68 and 62/25=2.48. This structured point set is **not** a stationary Poisson sample and must not be used to validate Poisson constants.

**Dimension:** The abstract empty-region predicate is meaningful in `R^d` for any positive integer `d`; many existing ProximityGraphs library constructors and browser visuals are primarily 2D. Do not confuse mathematical generality with implemented dimension support or infer GNN, persistent homology, GIS routing or wireless validation.

## Print versus interactive figures

The *printed author PDF* uses exactly three credited figures (historical John Snow; Pg alpha-shape and alpha-hull; sensor empty-region witnesses), within SIAM News's preferred 1–3. The fourth unchanged Gabriel/RNG comparison remains **online-only**, linked in prose, accessible at `article.html#figure4` and retained as original PNG/SVG in the source ZIP. The browser article retains its four interactive sections.

## Reproducibility

```bash
python scripts/check_article.py
cd article
pdflatex -interaction=nonstopmode -halt-on-error main.tex
pdflatex -interaction=nonstopmode -halt-on-error main.tex
pdfinfo main.pdf
pdfimages -list main.pdf
```

Package source via `python scripts/package_siam_source.py`: the ZIP includes four original image pairs for provenance, even though the LaTeX references only the three printed files. Regenerate/review all pages after article edits.

## Findings, limitations and next steps

The new manuscript is a total narrative rewrite with a historical hook, mathematically exact exclusion rule, quantified two-graph comparison, scale-sensitive geometry, dimension-qualified scope, statistical degree formula, conditional normal-approximation literature and a testable sensitivity/experiment design. It removes generic capability lists. The historic digitizations and typographic artwork require reproduction-rights clearance, and both authors must approve before SIAM submission. **No editorial submission was sent.** Verify CI checks, proof layout and source ZIP in the PR; do not merge without authorization.
## Subsequent correction: experiment020 (November 14, 2026)

This archived experiment019 record documents the original proposed rewrite, including its **historically incorrect implication** that Snow did not use a proximity partition. The revised 1855 parish map did contain an equidistance boundary based on nearest-road distance. This has been fully corrected in the current canonical manuscript and is documented with primary references in [experiment020](../experiment020/README.md). The print third figure is now the fixed-site Gabriel/RNG comparison, and the old sensor screenshot remains an online interactive. Do not treat the earlier narrative or original 600-point alpha print defaults in this record as current.
