"use strict";
/* Auto-size same-origin article embeds to their complete actual graph contents. */
document.querySelectorAll(".interactive-figure iframe").forEach(frame => {
  frame.addEventListener("load", () => {
    let doc;
    try { doc = frame.contentDocument; } catch { return; }
    if (!doc) return;
    const main = doc.querySelector("main");
    if (!main) return;
    const resize = () => {
      const height = Math.ceil(main.getBoundingClientRect().height + 48);
      if (Number.isFinite(height) && height > 200) frame.style.height = height + "px";
    };
    resize();
    if (typeof ResizeObserver !== "undefined") new ResizeObserver(resize).observe(main);
  });
});
