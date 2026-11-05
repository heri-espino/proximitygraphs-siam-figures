"use strict";

/* A small progressive enhancement, independent of the mathematical engine.
 * We animate entry and *user-requested* recompositions only. Moving a point
 * must remain immediate, and reduced-motion preferences always take priority.
 */
(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const outstanding = new WeakMap();

  function animatePlot(svg) {
    if (!svg || reduced.matches) return;
    const previous = outstanding.get(svg);
    if (previous) clearTimeout(previous);
    svg.classList.remove("is-recomposing");
    // Restart the one-shot trace only after a deliberate change of layers.
    void svg.getBoundingClientRect().width;
    svg.classList.add("is-recomposing");
    outstanding.set(svg, setTimeout(function () {
      svg.classList.remove("is-recomposing");
      outstanding.delete(svg);
    }, 370));
  }

  function plotsFor(control) {
    const section = control.closest("section.exhibit");
    if (!section) return [];
    return Array.from(section.querySelectorAll(".chart-frame svg"));
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

  function init() {
    const supportsObserver = "IntersectionObserver" in window;
    const targets = document.querySelectorAll(
      ".hero-copy, .hero-visual, .directory > .section-kicker, " +
      ".directory > h2, .chapter-card, .exhibit, .about-section"
    );

    if (supportsObserver && !reduced.matches) {
      const revealObserver = new IntersectionObserver(function (entries, observer) {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        }
      }, { rootMargin: "0px 0px -44px 0px", threshold: .05 });
      targets.forEach(function (target) {
        target.classList.add("reveal");
        revealObserver.observe(target);
      });
      document.documentElement.classList.add("motion-ready");
    }

    // Navigation location is a subtle underline, not an animated progress bar.
    if (supportsObserver) {
      const sections = Array.from(document.querySelectorAll(
        "#top, #water, #habitat, #sensors, #compare, #about"
      ));
      const links = Array.from(document.querySelectorAll('.masthead nav a[href^="#"]'));
      const navObserver = new IntersectionObserver(function (entries) {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const active = "#" + entry.target.id;
          for (const link of links) {
            if (link.getAttribute("href") === active) {
              link.setAttribute("aria-current", "location");
            } else {
              link.removeAttribute("aria-current");
            }
          }
        }
      }, { rootMargin: "-15% 0px -70% 0px", threshold: 0 });
      sections.forEach(function (section) { navObserver.observe(section); });
    }

    document.addEventListener("input", onControls, true);
    document.addEventListener("change", onControls, true);
    document.addEventListener("click", onControls, true);

    if (typeof reduced.addEventListener === "function") {
      reduced.addEventListener("change", function () {
        if (reduced.matches) {
          document.documentElement.classList.remove("motion-ready");
          document.querySelectorAll(".is-recomposing").forEach(function (svg) {
            svg.classList.remove("is-recomposing");
          });
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
