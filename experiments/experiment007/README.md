# experiment007 — contextual illustrations in the SIAM News article

**Date:** November 8, 2026  
**Status:** Manuscript revision implemented; automated PDF checks recorded in the final handoff.

## Why

Ensure the magazine-style feature explains the interactive construction witnesses and distinguishes historical records from synthetic examples. The previous PDF template incorrectly appended “All sites are synthetic” to the John Snow example, despite using digitized historical map points. The editorial pitch also retained a stale claim that the smiley, rather than the image-traced Pg, was the default shape.

## What was done

The canonical article was revised in prose, keeping its short mathematical arguments and existing citation set. Figure 1 now explicitly distinguishes 13 historical Soho pump locations from 578 separate cholera death marks, explains the modern Euclidean Voronoi/Delaunay overlay and names bisectors/circumcircles available on the website. Figure 2 describes 380 synthetic image-traced Pg sites, two letter components, two counters at alpha approximately -28.57, alpha-shape straight edges versus alpha-hull circular arcs, the supporting circles, retained triangles and the optional 53-point smiley. Figure 3 describes 25 synthetic sensor sites arranged as two clusters and three relays; readers can reveal accepted versus blocked beta candidates, two-disk lunes and blocking points.

A new article link directs readers to controlled side-by-side comparisons on identical sensor coordinates. The PDF generator now uses caption-specific provenance and no longer inserts a blanket synthetic-data statement. The editorial pitch and historical/application guardrails were synchronized.

## Reproduction

From the repository root, run:

~~~bash
python scripts/render_article.py
python scripts/check_article.py
cd article
pdflatex -interaction=nonstopmode -halt-on-error main.tex
pdflatex -interaction=nonstopmode -halt-on-error main.tex
~~~

The GitHub Actions article workflow regenerates the LaTeX and commits the compiled PDF proof. The website is independent of this editorial-only experiment; its underlying geometry and source CSVs have not been modified.

## Findings

The revised Markdown contains three figure captions and ten bibliography entries, and its estimated body length remains within SIAM News's 800–1,400-word range. The mathematical and editorial distinctions are explicit: John Snow did not compute the illustrated Voronoi model; the alpha typographic and sensor layouts are synthetic; the beta network is a geometric candidate graph, not a validated wireless deployment. The alpha scene and other graphs remain principally planar even though the broader mathematical framework is dimension-general.

## Next steps and limitations

Inspect the generated PDF at publication resolution, verify captions and author credits, confirm cross-page links, and record the successful CI run. The work does not establish deployment safety, infer real infection transmission, grant image rights, or imply publication or editorial acceptance. Coauthors must approve the byline and content before any external SIAM submission.
