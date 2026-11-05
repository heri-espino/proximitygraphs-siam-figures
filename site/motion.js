"use strict";

/* Motion is intentional navigation feedback, never a consequence of scrolling.
 * Native anchor links keep sections accessible even if JavaScript is disabled.
 * The geometry layer still responds immediately to point dragging.
 */
(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const plotTimers = new WeakMap();
  const sectionTimers = new WeakMap();
  const sectionIds = new Set(["top", "explore", "water", "habitat", "sensors", "compare", "about"]);
  let lastNavigationId = null;

  function animatePlot(svg) {
    if (!svg || reduced.matches) return;
    const previous = plotTimers.get(svg);
    if (previous) clearTimeout(previous);
    svg.classList.remove("is-recomposing");
    void svg.getBoundingClientRect().width;
    svg.classList.add("is-recomposing");
    plotTimers.set(svg, setTimeout(function () {
      svg.classList.remove("is-recomposing");
      plotTimers.delete(svg);
    }, 370));
  }

  function plotsFor(control) {
    const section = control.closest("section.exhibit");
    return section ? Array.from(section.querySelectorAll(".chart-frame svg")) : [];
  }

  function onControls(event) {
    const control = event.target;
    if (!(control instanceof Element)) return;
    if (event.type === "input" && !control.matches('input[type="range"]')) return;
    if (event.type === "change" && !control.matches("select, input[type=checkbox]")) return;
    if (event.type === "click" &&
        !control.closest("button.utility, button.reset-points")) return;
    if (!control.closest(".studio-panel, .compare-controls")) return;
    for (const svg of plotsFor(control)) animatePlot(svg);
  }

  function sectionFromHash(hash) {
    if (!hash || hash.charAt(0) !== "#") return null;
    let id;
    try { id = decodeURIComponent(hash.slice(1)); } catch (_) { return null; }
    return sectionIds.has(id) ? document.getElementById(id) : null;
  }

  function markNavigation(id) {
    const active = id === "explore" ? "top" : id;
    document.querySelectorAll('.masthead nav a[href^="#"]').forEach(function (link) {
      if (link.getAttribute("href") === "#" + active) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function enterSection(section) {
    if (!section || reduced.matches) return;
    const oldTimer = sectionTimers.get(section);
    if (oldTimer) clearTimeout(oldTimer);
    section.classList.remove("is-section-entering");
    void section.offsetWidth;
    section.classList.add("is-section-entering");
    sectionTimers.set(section, setTimeout(function () {
      section.classList.remove("is-section-entering");
      sectionTimers.delete(section);
    }, 820));
  }

  function onSectionLinkClick(event) {
    if (event.defaultPrevented || event.button > 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const source = event.target;
    if (!(source instanceof Element)) return;
    const link = source.closest('a[href^="#"]');
    if (!link || link.target === "_blank") return;
    const section = sectionFromHash(link.getAttribute("href"));
    if (!section) return;
    // Normal anchor navigation is untouched: this only animates the selected
    // section, irrespective of how far it is from the current viewport.
    lastNavigationId = section.id;
    markNavigation(section.id);
    enterSection(section);
  }

  function onHashChange() {
    const section = sectionFromHash(window.location.hash);
    const id = section ? section.id : "top";
    markNavigation(id);
    // Back/forward and script-driven hash changes are section navigation too;
    // an ordinary wheel, touch or keyboard scroll does not change the hash.
    if (section && section.id !== lastNavigationId) enterSection(section);
    lastNavigationId = section ? section.id : null;
  }

  function init() {
    document.documentElement.classList.toggle("motion-ready", !reduced.matches);
    markNavigation(sectionFromHash(window.location.hash)?.id || "top");
    lastNavigationId = sectionFromHash(window.location.hash)?.id || null;

    document.addEventListener("click", onSectionLinkClick, true);
    window.addEventListener("hashchange", onHashChange);
    document.addEventListener("input", onControls, true);
    document.addEventListener("change", onControls, true);
    document.addEventListener("click", onControls, true);

    if (typeof reduced.addEventListener === "function") {
      reduced.addEventListener("change", function () {
        document.documentElement.classList.toggle("motion-ready", !reduced.matches);
        if (!reduced.matches) return;
        document.querySelectorAll(".is-recomposing").forEach(function (svg) {
          svg.classList.remove("is-recomposing");
        });
        document.querySelectorAll(".is-section-entering").forEach(function (section) {
          section.classList.remove("is-section-entering");
        });
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
