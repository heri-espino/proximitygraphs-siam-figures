# experiment003 — Editorial monochrome redesign

**Date:** November 5, 2026  
**Status:** Implementation complete; CI and visual-QA verification pending.

## Hypothesis

Replacing the card-heavy teal/orange dashboard styling with spacious, monochrome scientific editorial typography will produce a calmer, more legible interface. This is a design hypothesis, not an empirically established usability improvement.

## Changes

- `site/styles.css` replaces saturated theme colors, repetitive rounded cards, shadows, thick borders, and filled inspector panels with near-white paper, graphite/stone visualizations, serif display typography, understated plain-text controls, generous spacing and section rules.
- `site/index.html` adjusts the masthead, heading and chapter introductions; preserves stable anchors and every interactive control ID.
- `site/motion.js` progressively enhances scroll reading, active-section navigation and deliberate SVG layer/parameter changes with subtle transitions. Dragging does not animate per-frame, and `prefers-reduced-motion: reduce` disables all transitions.
- `site/app.js` and `scripts/export_scenes.py` use matched monochrome scientific palettes. All graph and point computations remain unchanged.
- `tests/test_editor.js` and `tests/visual_smoke.py` assert design tokens, absence of card shadows, new script loading, control-driven motion and reduced-motion compatibility.

## Reproduce

```bash
python -m pip install -r requirements.txt
python scripts/export_scenes.py
python -m unittest discover -s tests -v
node --check site/motion.js
node --check site/app.js
node --check site/editor.js
node --check site/geometry-details.js
node tests/test_editor.js
python -m pip install playwright==1.57.0
python -m playwright install chromium
python tests/visual_smoke.py --output docs/visual-qa
```

Inspect all generated `site/assets/*.png`, `*.svg`, and `docs/visual-qa/` screenshots for desktop/mobile composition. Preserve inputs and outputs in the repository. No new fonts, media assets, geometry libraries or dependencies are introduced.

## Constraints and uncertainty

Mathematical correctness is protected by the existing Python and JS regression tests; a visual redesign does not prove better usability or measured performance. The motion is intentionally non-physical and progressive enhancement only. Scene recomposition is a short fade, not mathematically meaningful edge interpolation. Screen-reader or advanced accessibility validation beyond keyboard focus and reduced-motion checks still merits manual testing.

## Next

Verify GitHub Actions geometry and Playwright QA results; repair regressions rather than weakening tests. Review screenshots and update this report with real run links. Publish only after PR review/appropriate merge authorization; verify Pages deployment and archive outputs. Next numbered study is experiment004.
