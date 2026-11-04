"""Simple draft word-count report; SIAM's 800–1400 target is editorial."""
from pathlib import Path
import re

source = Path(__file__).resolve().parents[1] / "article" / "main.tex"
s = source.read_text(encoding="utf-8")
s = s.split(r"\begin{document}", 1)[-1].split(r"\section*{References}", 1)[0]
s = re.sub(r"(?m)^%.*$", "", s)
s = re.sub(r"\\(?:href|url)\{[^}]*\}", " ", s)
s = re.sub(r"\\[a-zA-Z]+\*?(?:\[[^\]]*\])?", " ", s)
s = re.sub(r"[{}$~]", " ", s)
words = re.findall(r"\b[\w'-]+\b", s)
print(f"Approximate draft text count, including captions and heading text: {len(words)} words.")
if not (800 <= len(words) <= 1400):
    print("Editorial warning: review the SIAM News 800–1400-word target with editors.")
