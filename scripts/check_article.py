"""Editorial preflight for the SIAM News outreach article.

Uses article/feature.md as the readable master narrative and validates Markdown without requiring a current LaTeX proof. Optional --check-generated
also checks the freshly exported TeX. No external dependencies.
Run: python scripts/check_article.py
"""
from pathlib import Path
import argparse
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
ARTICLE = ROOT / "article" / "feature.md"
TEX = ROOT / "article" / "main.tex"

parser = argparse.ArgumentParser()
parser.add_argument("--check-generated", action="store_true")
args = parser.parse_args()
source = ARTICLE.read_text(encoding="utf-8")
latex = TEX.read_text(encoding="utf-8") if args.check_generated else ""
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
if figure_count != 3:
    failures.append("Expected three numbered figure captions")
if args.check_generated:
    if latex.count(r"\featurefigure{") != 3:
        failures.append("Expected three figures in generated TeX")
    author_names = ["Heriberto Espino-Montelongo", "Maravillo", "Diego Villarreal de la Cerda"]
    positions = [latex.find(name) for name in author_names]
    if -1 in positions or positions != sorted(positions):
        failures.append("Generated LaTeX author order differs from approved Markdown")
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
byline = source.split("<!-- ARTICLE_BODY_START -->", 1)[0]
author_names = ["**Heriberto Espino-Montelongo**", "**Héctor Maravillo**",
                "**Diego Villarreal de la Cerda**"]
locations = [byline.find(name) for name in author_names]
if -1 in locations or locations != sorted(locations):
    failures.append("Markdown byline must list Heriberto, Hector, Diego")
# Official SIAM News style guide: reference list alphabetized by first author,
# one or two sentences per author biography, and image/data creator credits.
import unicodedata

def first_author_key(entry):
    surname = entry.partition(",")[0].lower()
    return "".join(c for c in unicodedata.normalize("NFKD", surname)
                   if not unicodedata.combining(c))

ref_entries = [p.strip() for p in re.split(r"\n\s*\n", refs_block.strip())
               if re.search(r"\(\d{4}\)", p)]
surname_keys = [first_author_key(entry) for entry in ref_entries]
if surname_keys != sorted(surname_keys):
    failures.append("APA references must be alphabetized by first-author surname")

captions = re.findall(r"(?m)^\*\*Figure ([123])\.\*\*\s+([^\n]+)$", body)
for number, caption in captions:
    if not re.search(r"(?:data:|illustration:|graphic:|credit:|courtesy)",
                     caption, flags=re.IGNORECASE):
        failures.append(f"Figure {number} lacks source/illustration credit")
    if "https://heri-espino.github.io/proximitygraphs-siam-figures/#" not in caption:
        failures.append(f"Figure {number} lacks its interactive link")

bios = source.split("## About the authors", 1)[1].split("*Editorial note:", 1)[0]
bio_entries = [v.strip() for v in re.split(r"\n\s*\n", bios.strip()) if v.strip()]
if len(bio_entries) != 3:
    failures.append("Three author biographies required")
if len(bio_entries)==3 and not all(name in entry for name, entry in
       zip(["Heriberto", "Héctor", "Diego"], bio_entries)):
    failures.append("Author biographies must follow byline order")
for i, bio in enumerate(bio_entries, 1):
    if not 1 <= len(re.findall(r"[.!?](?:\s|$)", bio)) <= 2:
        failures.append(f"Author biography {i} should contain 1–2 sentences")

for index, name in enumerate(("water", "habitat", "sensors"), 1):
    for ext in ("png", "svg"):
        path = ROOT / f"site/assets/figure0{index}-{name}.{ext}"
        if not path.is_file():
            failures.append(f"Missing standalone figure: {path}")

if failures:
    print("\nEditorial preflight failed:\n- " + "\n- ".join(failures))
    sys.exit(1)
print("Editorial preflight passed (manual figure rights, coauthor consent and editor guidance still outstanding).")
