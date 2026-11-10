"""SIAM News LaTeX author-proof preflight.

The canonical editorial manuscript is article/main.tex. This check does not
read the archived Markdown or require a compiled PDF.
"""
from pathlib import Path
import re
import sys

ROOT=Path(__file__).resolve().parents[1]
TEX=ROOT/"article"/"main.tex"
s=TEX.read_text(encoding="utf-8")
errors=[]

if s.count(r"\begin{document}")!=1 or s.count(r"\end{document}")!=1:
    errors.append("Exactly one LaTeX document environment is required")
body=s.split(r"\begin{document}",1)[-1].split(r"\section*{References}",1)[0]
body=body.split("\\end{center}",1)[-1]
body=re.sub(r"(?s)\\\[.*?\\\]"," ",body)
body=re.sub(r"\$[^$]+\$"," ",body)
body=re.sub(r"https?://[^}\s]+"," ",body)
body=re.sub(r"\\[A-Za-z]+\*?(?:\[[^\]]*\])?"," ",body)
body=re.sub(r"(?m)^%.*$"," ",body)
body=re.sub(r"[{}\\#~]"," ",body)
count=len(re.findall(r"\b[\w\-]+\b",body))
if not 800<=count<=1400:
    errors.append(f"Article and caption length {count} outside SIAM News 800-1400 target")

figures=re.findall(r"(?m)^\\pgfigure\{(figure\d\d-[a-z]+)\}",s)
expected=["figure01-water","figure02-habitat","figure03-sensors","figure04-compare"]
if figures!=expected:errors.append(f"Expected three credited illustrations in order: {figures}")
for name in expected:
    if not (ROOT/"site"/"assets"/f"{name}.png").is_file():
        errors.append(f"Missing source figure: {name}.png")
for index in range(1, 5):
    if f"proximitygraphs-siam-figures/article.html\\#figure{index}" not in s:
        errors.append(f"Missing online interactive article link: Figure {index}")

header=s.split(r"\begin{document}",1)[0]
if "pdfauthor={Heriberto Espino-Montelongo; Hector Maravillo}" not in header:
    errors.append("PDF metadata must list exactly Heriberto then Hector")
front=s.split(r"\end{center}",1)[0]
h=front.rfind("Heriberto Espino-Montelongo")
m=front.rfind("H\\'ector Maravillo")
if h<0 or m<0 or h>m:
    errors.append("Article title byline must list Heriberto first and Hector second")
if re.search(r"Physarum|FungalGraph|bio[- ]inspired|myceli", s, re.I):
    errors.append("SIAM feature must focus on proximity graphs, not bio-inspired network models")
online=(ROOT/"site"/"article.html")
if not online.is_file():
    errors.append("Missing four-panel web article preview")
else:
    html=online.read_text(encoding="utf-8")
    if html.count("<iframe") != 4:
        errors.append("Online article must embed exactly four interactive views")
    for name in ("water","habitat","sensors","compare"):
        if f'?embed={name}' not in html:
            errors.append(f"Online article missing live {name} demonstration")

if re.search(r"Diego|Villarreal de la Cerda",s,re.I):
    errors.append("Excluded third author remains in article LaTeX")

bios=s.split(r"\section*{About the authors}",1)[-1].split(r"\end{document}",1)[0]
if len(re.findall(r"(?m)^\\textbf\{",bios))!=2:
    errors.append("Expected exactly two author biographies")
refs=s.split(r"\section*{References}",1)[-1].split(r"\section*{About the authors}",1)[0]
entries=re.findall(r"(?m)^\\item\s+([^,\n]+),",refs)
if len(entries)!=10:errors.append(f"References count {len(entries)} instead of 10")
if entries!=sorted(entries,key=str.casefold):
    errors.append("APA first-author entries not in surname alphabetical order")
if "not submitted" not in s.lower():
    errors.append("Author-proof submission disclaimer missing")

print(f"SIAM News LaTeX preflight: {count} words, {len(figures)} figures, {len(entries)} references, two authors")
if errors:
    print("FAILED:\n- "+"\n- ".join(errors))
    sys.exit(1)
print("PASSED (editorial authorization and figure rights remain external).")
