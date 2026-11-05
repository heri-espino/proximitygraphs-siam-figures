# experiment004 — Section-activated motion instead of scroll-activated reveals

**Date:** November 5, 2026  
**Status:** Implemented on feature branch; CI/visual QA and release status recorded below after validation.

## User objective

The experiment003 editorial design was accepted, but the reader specifically asked for animation **on section navigation, not on scroll**. This is an interaction-design refinement, not a change in mathematical algorithms, datasets, or outputs.

## Competing behaviors

- **Old (experiment003):** IntersectionObserver revealed sections upon crossing a viewport threshold; the current navigation underline tracked whichever section happened to be visible; CSS globally enabled smooth anchor scrolling.
- **New (experiment004):** An explicit click on a same-page section link or a browser `hashchange` navigates to and briefly animates only the chosen section's content. Ordinary scrolling never activates a transition. The active navigation underline indicates the selected anchor, not the scroll position. The page uses native, non-animated anchor scrolling.

## Changes

- `site/motion.js`: remove both IntersectionObservers and scroll-driven behavior; handle section-link clicks and hash/history navigation. Keep deliberate layer-change transitions and preserve reduced-motion behavior.
- `site/styles.css`: remove global `scroll-behavior:smooth` and hidden scroll-reveal classes; apply a short, transient `is-section-entering` animation only to the chosen section's headings and diagram/contents.
- `tests/test_editor.js`: assert there are no scroll observers/listeners or scroll-hidden sections.
- `tests/visual_smoke.py`: verify that manual scrolling does not animate; internal navigation does; clicking the “Next” section link animates that destination; all section animations clear; reduced-motion navigation stays static.
- `docs/DESIGN_SYSTEM.md`, README, AGENTS.md and AI_HANDOFF.md: update future-agent guidance.

## Reproduction

```bash
python -m pip install -r requirements.txt
python scripts/export_scenes.py
python -m unittest discover -s tests -v
node --check site/motion.js
node tests/test_editor.js
python -m pip install playwright==1.57.0
python -m playwright install chromium
python tests/visual_smoke.py --output docs/visual-qa
```

Expected behavior: scroll without navigation never applies `is-section-entering`. Clicking `#water`, `#habitat`, `#sensors`, `#compare`, `#explore`, `#about` or `#top` animates only the destination section, for a fraction of a second. No continuous movement or auto-reveal follows viewport intersection. Anchor links remain functional with JavaScript disabled.

## Limitations and next steps

No usability study was conducted; this change implements a user-expressed preference. Native hash navigation can move the viewport instantly, by design. Controlled diagrams still fade on deliberate parameter/layer changes. Preserve all graph computations, provenance and source files. Verify CI and visual QA before releasing; record run URLs and outcomes. Future iteration, if any, should use experiment005.
