"""Editorial preflight for the SIAM News outreach article.

Uses article/feature.md as the readable master narrative and validates the
LaTeX proof's three inclusion commands. No external dependencies.
Run: python scripts/check_article.py
"""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
ARTICLE = ROOT / "article" / "feature.md"
TEX = ROOT / "article" / "main.tex"

source = ARTICLE.read_text(encoding="utf-8")
latex = TEX.read_text(encoding="utf-8")
body, refs = source.split("## References", 1)

# Approximate editorial word count; omit Python code and URLs, include captions.
text = re.sub(r"\x60{3}[\s\S]*?\x60{3}", " ", body)
text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
text = re.sub(r"(?m)^\s{0,3}#{1,6}\s+", "", text)
text = re.sub(r"\\\[[\s\S]*?\\\]", " ", text)
text = re.sub(r"\x60[^\x60]+\x60", " ", text)
words = re.findall(r"\b[\w'-]+\b", text)
count = len(words)

figure_count = len(re.findall(r"\*\*Figure [123]\.\*\*", body))
refs_block = refs.split("## About the authors", 1)[0]
ref_count = len([p for p in re.split(r"\n\s*\n", refs_block)
                 if re.search(r"\(\d{4}\)", p)])
paths = [
    "site/assets/figure01-water.png",
    "site/assets/figure02-habitat.png",
    "site/assets/figure03-sensors.png",
]
missing_figures = [p for p in paths if not (ROOT / p).is_file()]

print(f"Feature word count (approx., including captions): {count}")
print(f"Figure captions: {figure_count}/3; bibliography entries: {ref_count}/10")
failures = []
if not 800 <= count <= 1400:
    failures.append("SIAM News target is approximately 800–1,400 words")
if figure_count != 3 or latex.count(r"\featurefigure{") != 3:
    failures.append("Expected exactly three feature images and matching captions")
if not 1 <= ref_count <= 10:
    failures.append("Expected 1–10 bibliography entries")
if missing_figures:
    failures.append(f"Missing scientific figures: {missing_figures}")
for url in ["https://github.com/ProximityGraphs/ProximityGraphs",
            "https://heri-espino.github.io/proximitygraphs-siam-figures/",
            "https://pypi.org/project/proximitygraphs/"]:
    if url not in source:
        failures.append(f"Missing CTA: {url}")
if "not submitted" not in source.lower():
    failures.append("The draft's editorial submission status must be explicit")
if failures:
    print("\nEditorial preflight failed:\n- " + "\n- ".join(failures))
    sys.exit(1)
print("Editorial preflight passed (human review and author approval still required).")
