"""Regression checks for the SIAM-style four-panel web article and safe embeds."""
from html.parser import HTMLParser
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.iframes = []
        self.captions = []
        self.figure_ids = []
        self.links = []

    def handle_starttag(self, tag, attrs):
        attr = dict(attrs)
        if tag == "iframe":
            self.iframes.append(attr)
        if tag == "figure":
            self.figure_ids.append(attr.get("id"))
        if tag == "figcaption":
            self.captions.append(True)
        if tag == "a":
            self.links.append(attr)


class InteractiveArticleTests(unittest.TestCase):
    def test_four_live_figures(self):
        src = (SITE / "article.html").read_text(encoding="utf-8")
        p = PageParser()
        p.feed(src)
        self.assertEqual(p.figure_ids, ["figure1", "figure2", "figure3", "figure4"])
        self.assertEqual(len(p.captions), 4)
        self.assertEqual(len(p.iframes), 4)
        self.assertEqual([x["src"] for x in p.iframes],
                         ["./?embed=water", "./?embed=habitat",
                          "./?embed=sensors", "./?embed=compare"])
        self.assertTrue(all(x.get("title") for x in p.iframes))
        self.assertTrue(all(x.get("loading") == "lazy" for x in p.iframes))
        self.assertIn('id="software"', src)
        self.assertIn('class="equation-number"', src)
        self.assertNotIn("Physarum", src)
        self.assertNotIn("FungalGraph", src)

    def test_embed_mode_preserves_full_lab(self):
        index = (SITE / "index.html").read_text(encoding="utf-8")
        css = (SITE / "styles.css").read_text(encoding="utf-8")
        self.assertIn('new URLSearchParams(location.search).get("embed")', index)
        for name in ("water", "habitat", "sensors", "compare"):
            self.assertIn(f'id="{name}"', index)
            self.assertIn(f'html[data-embed="{name}"]', css)
            self.assertIn(f'./?embed={name}', (SITE / "article.html").read_text(encoding="utf-8"))
        self.assertIn('href="article.html"', index)
        self.assertIn('figure04-compare.png', index)
        self.assertIn('main > section:not(#water)', css)

    def test_fourth_static_figure_is_reproducible(self):
        py = (ROOT / "scripts/export_scenes.py").read_text(encoding="utf-8")
        self.assertIn('def render_comparison(scene)', py)
        self.assertIn('render_comparison(scene)', py)
        self.assertIn('graph_options["gabriel"]', py) if 'graph_options["gabriel"]' in py else self.assertIn('("gabriel", "Gabriel graph"', py)
        self.assertIn('("rng", "Relative neighborhood graph"', py)
        self.assertTrue((SITE / "assets/figure04-compare.png").is_file())


if __name__ == "__main__":
    unittest.main()
