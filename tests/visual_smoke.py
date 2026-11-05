"""Reproducible browser-level visual checks for the SIAM geometry companion.

This is an *optional* quality-assurance script, separate from mathematical
regression tests. It requires Python Playwright 1.57.0 and installed Chromium.
The page is loaded from embedded local HTML/JS/CSS/JSON to remain reproducible
even when browsers cannot reach localhost or the public internet.

Run:
    python -m pip install playwright==1.57.0
    python -m playwright install chromium
    python tests/visual_smoke.py --output docs/visual-qa

The script writes PNG screenshots and visual-summary.json, to be preserved in
the repository by the dedicated GitHub Actions visual-QA workflow.
"""
from __future__ import annotations

import argparse
import base64
import json
from datetime import datetime, timezone
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/"site"


def inline_site():
    html=(SITE/"index.html").read_text(encoding="utf-8")
    for name in ("editor.js","geometry-details.js","app.js"):
        tag=f'<script src="{name}" defer></script>'
        if tag not in html:
            raise RuntimeError(f"Missing script tag {name}")
        html=html.replace(tag,"<script>"+(SITE/name).read_text(encoding="utf-8")+"</script>")
    css='<link rel="stylesheet" href="styles.css">'
    html=html.replace(css,"<style>"+(SITE/"styles.css").read_text(encoding="utf-8")+"</style>")
    for name in ("figure01-water.png","figure02-habitat.png","figure03-sensors.png"):
        binary=base64.b64encode((SITE/"assets"/name).read_bytes()).decode("ascii")
        html=html.replace("assets/"+name,"data:image/png;base64,"+binary)
    scenes=json.loads((SITE/"data"/"scenes.json").read_text(encoding="utf-8"))
    # The application continues using its actual fetch() code, but a controlled
    # in-memory response provides exactly the same committed source data.
    fake='<script>window.fetch=async()=>({ok:true,json:async()=>('+json.dumps(scenes)+')});</script>'
    html=html.replace("</head>",fake+"</head>")
    return html, scenes


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--output",default="docs/visual-qa")
    args=parser.parse_args()
    output=(ROOT/args.output).resolve()
    output.mkdir(parents=True,exist_ok=True)
    html,scenes=inline_site()
    checks=[]
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=["--no-sandbox","--disable-dev-shm-usage"])
        page=browser.new_page(viewport={"width":1440,"height":900},device_scale_factor=1)
        errors=[]
        page.on("pageerror",lambda e: errors.append(str(e)))
        page.set_content(html,wait_until="load",timeout=60000)
        page.locator("#source-status").wait_for()
        source=page.locator("#source-status").inner_text()
        assert "Authoritative default geometries" in source,source
        checks.append("Pinned Python ProximityGraphs source loaded")

        assert len(scenes["voronoi"]["points"])==13
        assert len(scenes["voronoi"]["death_marks"])==578
        assert scenes["voronoi"]["labels"][scenes["voronoi"]["historical"]["broad_street_index"]]=="Broad St"
        assert len(scenes["alpha"]["points"])==53
        assert len(scenes["beta"]["points"])==25
        assert page.locator("#water-plot g[aria-hidden='true'] circle").count()==578
        assert "Broad St" in page.locator("#water-details").inner_text()
        page.locator("#water-deaths").uncheck()
        assert page.locator("#water-plot g[aria-hidden='true'] circle").count()==0
        page.locator("#water-deaths").check()
        assert page.locator("#water-plot g[aria-hidden='true'] circle").count()==578
        checks.append("All 13 historical pumps and 578 death marks load, with working contextual layer toggle")
        page.screenshot(path=str(output/"01-home.png"))
        page.locator("#water-bisectors").check()
        page.locator("#water-triangles").check()
        assert page.locator("#water-plot line").count()>15
        page.locator("#water").screenshot(path=str(output/"02-voronoi-construction.png"))
        page.locator('button[data-editor-scene="water"][data-mode="move"]').click()
        page.locator('button[data-editor-scene="water"][data-mode="add"]').click()
        # Adding a hypothetical site must not move or create historical deaths.
        water=page.locator("#water-plot")
        bounds=water.bounding_box()
        sx=bounds["width"]/640
        sy=bounds["height"]/600
        water.click(position={"x":sx*(65+510*.96),"y":sy*(43+510*.96)})
        assert "hypothetical" in page.locator("#water-edit-source").inner_text()
        assert page.locator("#water-plot g[aria-hidden='true'] circle").count()==578
        page.locator('button[data-editor-reset="water"]').click()
        assert "Digitized historical" in page.locator("#water-edit-source").inner_text()
        checks.append("Voronoi bisectors, circumcircle and Delaunay triangulation render")

        page.locator("#alpha-all-circles").check()
        page.locator("#alpha-centers").check()
        page.locator("#alpha-triangulation").check()
        page.locator("#alpha-kept").check()
        arcs=page.locator("#habitat-plot polyline").count()
        assert arcs>0
        assert page.locator("#habitat-plot circle").count()>2*arcs
        page.locator("#habitat").screenshot(path=str(output/"03-alpha-construction.png"))
        checks.append("Alpha_Hull arcs, Alpha_Shape edges, retained triangles, and all circles render")

        page.locator("#beta-show-blocked").click()
        detail=page.locator("#sensors-details").inner_text()
        assert "REJECTED" in detail and "blocker" in detail,detail
        page.locator("#sensors").screenshot(path=str(output/"04-beta-blocked.png"))
        checks.append("Rejected beta candidate exposes blocking points and both disks")

        page.locator('button[data-editor-scene="sensors"][data-mode="inspect"]').click()
        page.locator('#sensors-plot [data-point-index="0"]').last.click()
        page.locator('#sensors-plot [data-point-index="1"]').last.click()
        assert "Pair 1–2" in page.locator("#sensors-details").inner_text()
        page.locator('button[data-editor-scene="sensors"][data-mode="move"]').click()
        node=page.locator('#sensors-plot [data-point-index="0"]').last
        bounds=node.bounding_box()
        x=bounds["x"]+bounds["width"]/2
        y=bounds["y"]+bounds["height"]/2
        page.mouse.move(x,y);page.mouse.down()
        page.mouse.move(x+15,y+4,steps=6);page.mouse.up()
        assert "Edited points" in page.locator("#sensors-edit-source").inner_text()
        checks.append("Pair inspection and pointer dragging update source provenance")

        page.locator("#compare").screenshot(path=str(output/"05-comparison.png"))
        before=page.locator("#compare-details").inner_text()
        page.locator("#compare-left").select_option("alpha-shape")
        after=page.locator("#compare-details").inner_text()
        assert before!=after,(before,after)
        checks.append("Same-site graph comparison reacts to selections and edits")
        assert not errors,errors

        mobile=browser.new_page(viewport={"width":390,"height":844},
                                device_scale_factor=1,is_mobile=True,has_touch=True)
        mobile_errors=[]
        mobile.on("pageerror",lambda e:mobile_errors.append(str(e)))
        mobile.set_content(html,wait_until="load",timeout=60000)
        mobile.screenshot(path=str(output/"06-mobile-home.png"))
        mobile.locator("#habitat").screenshot(path=str(output/"07-mobile-alpha.png"))
        assert not mobile_errors,mobile_errors
        checks.append("Desktop and mobile render without browser exceptions")
        browser.close()

    result={
        "source":"Pinned ProximityGraphs scene JSON + independent edited JS geometry",
        "scene_version":scenes["format_version"],
        "library_commit":scenes["metadata"]["library_source_commit"],
        "checks":checks,
        "results":"passed",
        "screenshots":[p.name for p in sorted(output.glob("*.png"))]
    }
    (output/"visual-summary.json").write_text(
        json.dumps(result,indent=2,ensure_ascii=False)+"\n",encoding="utf-8"
    )
    print(json.dumps(result,indent=2))


if __name__=="__main__":
    main()
