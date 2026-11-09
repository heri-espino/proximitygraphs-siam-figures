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

The site must preserve 13 digitized historical John Snow pumps, 578 read-only death marks, a 600-point image-traced serif Pg default (298 original contour sites, 302 total interior sites) with two genuine enclosed counters, the original 53-point synthetic smiley alternative, and 25 synthetic relay sensors. The graph predicates, actual `pg.Alpha_Shape` and `pg.Alpha_Hull` outputs, empty-lune blockers, comparison graphs, data provenance and exported PNG/SVG/JSON results are untouched mathematically. Palette changes in `site/app.js` must match `scripts/export_scenes.py`.

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

## experiment004 — Section navigation, not scroll motion

The reader requested that transitions occur **only when selecting a section**, not during ordinary scrolling. This supersedes the experiment003 IntersectionObserver scroll-reveal mechanism.

- No IntersectionObserver, scroll-event listener, auto-reveal, hidden offscreen section, or smooth-scrolling animation is used.
- Normal wheel, touch, trackpad, PageDown, and arrow-key scrolling remain immediate and visually static; all sections remain visible without JavaScript.
- Clicking any same-page section link (masthead navigation, hero “Explore” link, chapter index entry, “Next” link, or “Back to top”) briefly animates **only the selected section's content**. Native anchor links and browser history are preserved.
- Browser back/forward navigation to another hash also animates the selected section. The masthead underline follows the **chosen section**, not the scroll position.
- Changing a mathematical layer/slider still gives its diagram a short feedback animation; dragging remains immediate. These control animations are independent of section transitions.
- `prefers-reduced-motion: reduce` disables every animation. `site/motion.js` handles click/hashchange only; the CSS `.is-section-entering` class is transient.

Regression checks in `tests/test_editor.js` and `tests/visual_smoke.py` verify that scrolling alone never adds an animation class, that internal navigation animates the correct target, that the animation cleans itself up, and that reduced-motion navigation remains static. See `experiments/experiment004/README.md`.

## experiment006 — Typeface-aware scientific stippling
The current alpha default is no longer the block-letter experiment005 preview. It is a **sample of the user's image**: 298 dark small points along the actual serif/swash contours, 302 smaller and more transparent interior ink points. Retained triangles use a soft stone wash. Preserve the warm-white/graphite identity and do not rasterize a literal logo behind the graph; the point cloud and alpha construction themselves must form the letter. The original smiley remains a dropdown alternate. The number of independently movable alpha sites is 600 by default (cap 1100); treat their source trace roles as visual metadata, not as new mathematical graph vertices. Keep scroll motion disabled and section navigation transitions accessible.


### experiment008: user-adjustable random stroke density
The secondary Pg-only slider offers 0–600 interior sites plus the immutable 298 outline sites, and a restrained **Reshuffle random points** utility. Keep the existing neutral slider/label visual language and the no-scroll-animation rule. Default 302 interior sites produce 600 points, preserving the image-traced 82 original ink sites and adding 220 seeded pseudorandom samples. Hide the control entirely for the smiley and reset to the original density/seed on Reset points. Slider moves use debounced geometry updates with correctly labeled browser provenance; do not draw a fixed raster background or move source contours.


## experiment009 — Signed scale and stochastic point choices

Keep the existing editorial monochrome design. The selector provides four choices (Pg, Smiley, Poisson, Binomial) grouped into letterforms and stochastic processes. The signed alpha slider ranges −100..+100 with a concise numerical value and radius display; at zero show `R=∞` and no supporting circles. The Pg 0..600 interior slider and reset remain. The Smiley adds its own 0..600 interior slider and reshuffle, avoiding face details. The stochastic panel uses a shared slider for Poisson intensity λ and binomial fixed count n, a resample action, an explicit mathematical definition and observed N. Hide irrelevant controls for other presets; never imply the stochastic browser samples are pinned-library exports. Preserve access via touch and keyboard and the existing no-scroll-animation behavior.
