# Editorial design system — experiment003

## Direction

Present ProximityGraphs as an interactive scientific essay, not a dashboard. The user requested a cleaner, minimal, elegant identity without colored bordered cards or saturated teal/orange UI.

- Warm paper background `#faf9f7`, graphite text `#242421`, stone scientific diagrams, only semantic muted red for rejected β-skeleton candidates.
- Large serif headlines with Iowan Old Style / Baskerville / Palatino / Georgia fallbacks; quiet sans-serif body and annotation text. No external font files or network dependency.
- White space and 1px hairlines separate research chapters; no drop shadows, card outlines, bright brand buttons or decorative gradients.
- Three-column scientific workbench at large sizes, with a dominant SVG stage and accessible control/inspector columns. Preserve full functionality on smaller viewports.
- Render Python-exported scientific preview images in the same grayscale/stone palette as the browser calculations.

## Motion

Source: `site/motion.js`, CSS media queries.

- IntersectionObserver reveals sections once on scroll; navigation active-section underline responds to the reader's location.
- Deliberate changes to layers and parameters give SVG strokes a brief (~300 ms) fade. It is an interaction acknowledgement, **not geometric interpolation or a simulation**.
- Dragging points remains immediate and unanimated; do not trigger thousands of animations on the 578 historical death marks.
- Honor `prefers-reduced-motion: reduce`; no invisible content if IntersectionObserver is unavailable. All controls are keyboard-operable and use visible focus.
- There is no animation framework, custom webfont, or additional dependency.

## Source fidelity

The site must preserve 13 digitized historical John Snow pumps, 578 read-only death marks, 53 synthetic smiley points, and 25 synthetic relay sensors. The graph predicates, actual `pg.Alpha_Shape` and `pg.Alpha_Hull` outputs, empty-lune blockers, comparison graphs, data provenance and exported PNG/SVG/JSON results are untouched mathematically. Palette changes in `site/app.js` must match `scripts/export_scenes.py`.

## Reproducibility

```bash
python -m pip install -r requirements.txt
python scripts/export_scenes.py
python -m unittest discover -s tests -v
node --check site/app.js
node --check site/editor.js
node --check site/geometry-details.js
node --check site/motion.js
node tests/test_editor.js
python -m pip install playwright==1.57.0
python -m playwright install chromium
python tests/visual_smoke.py --output docs/visual-qa
```

Visual QA verifies desktop/mobile rendering, monochrome styling, restored mathematical controls, animations on deliberate changes, and reduced-motion behavior. Preserve all snapshots and results in the repository.
