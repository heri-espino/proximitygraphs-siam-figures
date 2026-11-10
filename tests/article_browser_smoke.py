"""End-to-end Playwright check of the four REAL live article iframes.

Runs the actual site over an ephemeral local HTTP server (unlike pure screenshot
fixtures). No remote network, no SIAM-site dependency, no mocked geometry.
"""
import argparse
import json
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"

class QuietHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(SITE), **kwargs)

    def log_message(self, *_args):
        return

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="docs/visual-qa")
    args = parser.parse_args()
    out = (ROOT / args.output).resolve()
    out.mkdir(parents=True, exist_ok=True)
    server = ThreadingHTTPServer(("127.0.0.1", 0), QuietHandler)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base = f"http://127.0.0.1:{server.server_port}/"
    items = [
        ("water", "water-plot"),
        ("habitat", "habitat-plot"),
        ("sensors", "sensors-plot"),
        ("compare", "compare-left-plot"),
    ]
    report = []
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(
                headless=True, args=["--no-sandbox", "--disable-dev-shm-usage"]
            )
            page = browser.new_page(
                viewport={"width": 1480, "height": 950}, device_scale_factor=1
            )
            failures = []
            page.on("pageerror", lambda exc: failures.append(str(exc)))
            page.goto(base + "article.html", wait_until="domcontentloaded", timeout=60000)
            assert page.locator("iframe").count() == 4
            assert page.locator("figcaption").count() == 4
            assert page.locator(".equation-number").count() == 2
            page.screenshot(path=str(out / "13-article-opening.png"))
            for number, (name, plot_id) in enumerate(items, 1):
                article_figure = page.locator(f"#figure{number}")
                article_figure.scroll_into_view_if_needed(timeout=60000)
                nested = article_figure.frame_locator("iframe")
                plot = nested.locator(f"#{plot_id}")
                plot.wait_for(state="visible", timeout=90000)
                # The actual original app must draw point circles on every view.
                plot.locator("circle").first.wait_for(timeout=90000)
                assert nested.locator("main > section:visible").count() == 1
                actual_src = article_figure.locator("iframe").get_attribute("src")
                assert actual_src == f"./?embed={name}"
                assert plot.locator("circle").count() > 0
                if name == "water":
                    # Existing editor controls remain operable in iframe.
                    nested.locator('[data-editor-scene="water"][data-mode="add"]').click()
                    assert nested.locator(
                        '[data-editor-scene="water"][data-mode="add"]'
                    ).get_attribute("aria-pressed") == "true"
                if name == "compare":
                    nested.locator("#compare-left").select_option("beta")
                    assert nested.locator("#compare-left-parameter").is_visible()
                    assert nested.locator("#compare-right-parameter").is_hidden()
                    left_slider = nested.locator("#compare-left-slider")
                    left_slider.fill("2.4")
                    assert "β = 2.4" in nested.locator(
                        "#compare-left-parameter-value"
                    ).inner_text()
                    assert "β = 2.4" in nested.locator(
                        "#compare-left-label"
                    ).inner_text()
                    # Right-hand alpha-hull is a genuinely curved construction.
                    nested.locator("#compare-right").select_option("alpha-hull")
                    assert nested.locator("#compare-right-parameter").is_visible()
                    nested.locator("#compare-right-slider").fill("-5")
                    assert "α = −5" in nested.locator(
                        "#compare-right-label"
                    ).inner_text()
                    assert nested.locator("#compare-right-plot polyline").count() > 0
                    assert nested.locator("#compare-left-slider").input_value() == "2.4"
                    # All changes are parameter-only; no site can be resampled.
                    def coordinates(side):
                        return nested.locator(f"#compare-{side}-plot circle").evaluate_all(
                            "(sites) => sites.map(p => [p.getAttribute('cx'),p.getAttribute('cy')])"
                        )
                    original = coordinates("left")
                    assert coordinates("right") == original
                    nested.locator("#compare-swap").click()
                    assert nested.locator("#compare-left").input_value() == "alpha-hull"
                    assert nested.locator("#compare-left-slider").input_value() == "-5"
                    assert nested.locator("#compare-right").input_value() == "beta"
                    assert nested.locator("#compare-right-slider").input_value() == "2.4"
                    assert coordinates("left") == original
                    assert coordinates("right") == original
                    nested.locator("#compare-reset").click()
                    assert nested.locator("#compare-left").input_value() == "gabriel"
                    assert nested.locator("#compare-right").input_value() == "rng"
                    assert nested.locator("#compare-left-parameter").is_hidden()
                    assert nested.locator("#compare-right-parameter").is_hidden()
                article_figure.screenshot(
                    path=str(out / f"{13+number:02d}-article-figure{number}.png")
                )
                report.append({
                    "figure": number, "scene": name,
                    "visible_original_app_sections": 1,
                    "plot_child_elements": plot.locator("*").count(),
                    "source": actual_src,
                })
            assert not failures, "JavaScript page exceptions: " + repr(failures)
            narrow = browser.new_page(
                viewport={"width": 390, "height": 844}, device_scale_factor=1
            )
            narrow.goto(base + "article.html", wait_until="domcontentloaded",
                        timeout=60000)
            assert narrow.locator("iframe").count() == 4
            assert narrow.evaluate(
                "document.documentElement.scrollWidth <= window.innerWidth + 3"
            ), "Article exceeds mobile viewport width"
            narrow.screenshot(path=str(out / "18-article-mobile.png"))
            browser.close()
    finally:
        server.shutdown()
        thread.join(timeout=5)
    result = {
        "status": "passed",
        "source": "HTTP-served real article iframes and pinned ProximityGraphs JSON",
        "figures": report,
        "screenshots": ["13-article-opening.png"]
        + [f"{13+n:02d}-article-figure{n}.png" for n in range(1, 5)]
        + ["18-article-mobile.png"],
    }
    (out / "article-browser-summary.json").write_text(
        json.dumps(result, indent=2), encoding="utf-8"
    )
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
