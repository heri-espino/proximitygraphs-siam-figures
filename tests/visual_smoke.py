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
    for name in ("editor.js","geometry-details.js","data/pg_reference_points.js","point-processes.js","app.js","motion.js"):
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
        assert len(scenes["alpha"]["points"])==600
        assert scenes["alpha"]["default_preset"]=="pg"
        assert len(scenes["alpha"]["presets"]["smiley"]["points"])==53
        assert scenes["alpha"]["options"]["28.57142857142857"]["topology"]=={"components":2,"holes":2}
        assert page.locator("#alpha-point-set").input_value()=="pg"
        assert "2 holes" in page.locator("#habitat-stat").inner_text()
        assert len(scenes["beta"]["points"])==25
        assert page.locator("#water-plot g[aria-hidden='true'] circle").count()==578
        assert "Broad St" in page.locator("#water-details").inner_text()
        page.locator("#water-deaths").uncheck()
        assert page.locator("#water-plot g[aria-hidden='true'] circle").count()==0
        page.locator("#water-deaths").check()
        assert page.locator("#water-plot g[aria-hidden='true'] circle").count()==578
        checks.append("All 13 historical pumps and 578 death marks load, with working contextual layer toggle")
        assert page.locator("h1 em").inner_text()=="neighbor?"
        assert page.evaluate("getComputedStyle(document.body).backgroundColor")=="rgb(250, 249, 247)"
        assert page.locator("#water").evaluate(
            "el => getComputedStyle(el).boxShadow")=="none"
        assert page.locator(".chapter-card").first.evaluate(
            "el => getComputedStyle(el).boxShadow")=="none"
        checks.append("Editorial monochrome layout, serif headline, and borderless figures render")
        page.screenshot(path=str(output/"01-home.png"))
        # Plain scrolling must not reveal or animate sections. Only clicking
        # a section anchor (or browser history hash navigation) may do that.
        assert page.locator(".is-section-entering").count()==0
        assert page.evaluate("getComputedStyle(document.documentElement).scrollBehavior")=="auto"
        page.evaluate("window.scrollTo(0, document.getElementById('habitat').offsetTop)")
        page.wait_for_timeout(120)
        assert page.locator(".is-section-entering").count()==0, (
            "Ordinary scrolling should never trigger a section animation"
        )
        page.locator('.masthead nav a[href="#water"]').click()
        assert page.locator("#water").evaluate(
            "el => el.classList.contains('is-section-entering')"
        )
        assert page.locator("#water .section-heading").evaluate(
            "el => getComputedStyle(el).animationName"
        )=="section-enter"
        page.wait_for_timeout(900)
        assert page.locator("#water").evaluate(
            "el => !el.classList.contains('is-section-entering')"
        )
        page.locator("#water .section-next").click()
        assert page.locator("#habitat").evaluate(
            "el => el.classList.contains('is-section-entering')"
        ), "The Next link should animate its target section"
        checks.append("Scrolling is static; navigation clicks animate only the chosen section")
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
        assert page.locator("#habitat-plot circle.editable-site").count()==1200
        assert page.locator("#habitat-plot circle.editable-site[opacity]").count()==600
        assert "2 holes" in page.locator("#habitat-stat").inner_text()
        slider=page.locator("#alpha-slider")
        assert slider.get_attribute("min")=="-100"
        assert slider.get_attribute("max")=="100"
        slider.fill("-100")
        assert "α = -100" in page.locator("#alpha-value").inner_text()
        slider.fill("0")
        assert "α = 0" in page.locator("#alpha-value").inner_text()
        assert "convex hull" in page.locator("#habitat-note").inner_text()
        slider.fill("100")
        assert "α = 100" in page.locator("#alpha-value").inner_text()
        assert "furthest-site" in page.locator("#habitat-note").inner_text()
        slider.fill("-28.57142857142857")
        assert "2 holes" in page.locator("#habitat-stat").inner_text()
        density=page.locator("#pg-interior-slider")
        assert density.get_attribute("min")=="0"
        assert density.get_attribute("max")=="600"
        assert density.input_value()=="302"
        assert page.locator("#pg-interior-count").inner_text()=="302"
        density.fill("0")
        assert "298 sites" in page.locator("#habitat-stat").inner_text()
        assert "Edited points" in page.locator("#habitat-edit-source").inner_text()
        density.fill("420")
        assert "718 sites" in page.locator("#habitat-stat").inner_text()
        before=page.locator("#habitat-plot .editable-site[data-point-index='400']").last.get_attribute("cx")
        page.locator("#pg-reshuffle").click()
        after=page.locator("#habitat-plot .editable-site[data-point-index='400']").last.get_attribute("cx")
        assert before!=after,"Reshuffle must produce a different random point cloud"
        page.locator('button[data-editor-reset="habitat"]').click()
        assert density.input_value()=="302"
        assert "600 sites" in page.locator("#habitat-stat").inner_text()
        assert "Original points" in page.locator("#habitat-edit-source").inner_text()
        page.locator("#habitat").screenshot(path=str(output/"03-alpha-construction.png"))
        checks.append("Pg alpha-hull and alpha-shape render two enclosed holes with circles")
        page.locator("#alpha-point-set").select_option("smiley")
        assert page.locator("#alpha-point-set").input_value()=="smiley"
        assert "173 sites" in page.locator("#habitat-stat").inner_text()
        assert "α = -8" in page.locator("#alpha-value").inner_text()
        assert slider.get_attribute("max")=="100"
        assert page.locator("#pg-density-controls").is_hidden()
        assert page.locator("#smiley-density-controls").is_visible()
        smiley_density=page.locator("#smiley-interior-slider")
        smiley_density.fill("0")
        assert "53 sites" in page.locator("#habitat-stat").inner_text()
        smiley_density.fill("200")
        assert "253 sites" in page.locator("#habitat-stat").inner_text()
        first_x=page.locator('#habitat-plot .editable-site[data-point-index="53"]').last.get_attribute("cx")
        page.locator("#smiley-reshuffle").click()
        second_x=page.locator('#habitat-plot .editable-site[data-point-index="53"]').last.get_attribute("cx")
        assert first_x!=second_x
        page.locator('button[data-editor-reset="habitat"]').click()
        assert smiley_density.input_value()=="120"
        assert "173 sites" in page.locator("#habitat-stat").inner_text()
        page.locator("#habitat").screenshot(path=str(output/"08-smiley-preset.png"))
        page.locator("#alpha-point-set").select_option("poisson")
        assert page.locator("#process-controls").is_visible()
        assert "Poisson" in page.locator("#process-definition").inner_text()
        process_slider=page.locator("#process-slider")
        process_slider.fill("0")
        assert "0 sites" in page.locator("#habitat-stat").inner_text()
        assert "Realized N = 0" in page.locator("#process-realized").inner_text()
        process_slider.fill("80")
        realized=int(page.locator("#process-realized").inner_text().split("=")[-1].strip())
        assert 40<=realized<=120,realized
        assert f"{realized} sites" in page.locator("#habitat-stat").inner_text()
        x=page.locator('#habitat-plot .editable-site[data-point-index="0"]').last.get_attribute("cx")
        page.locator("#process-reshuffle").click()
        assert x!=page.locator('#habitat-plot .editable-site[data-point-index="0"]').last.get_attribute("cx")
        page.locator("#habitat").screenshot(path=str(output/"09-poisson.png"))
        page.locator("#alpha-point-set").select_option("binomial")
        assert "Fixed number" in page.locator("#process-parameter-title").inner_text()
        assert "120 sites" in page.locator("#habitat-stat").inner_text()
        process_slider.fill("27")
        assert "27 sites" in page.locator("#habitat-stat").inner_text()
        assert "Realized N = 27" in page.locator("#process-realized").inner_text()
        page.locator("#habitat").screenshot(path=str(output/"10-binomial.png"))
        page.locator("#alpha-point-set").select_option("pg")
        assert "600 sites" in page.locator("#habitat-stat").inner_text()
        assert slider.get_attribute("max")=="100"
        assert page.locator("#pg-density-controls").is_visible()
        assert page.locator("#smiley-density-controls").is_hidden()
        assert page.locator("#process-controls").is_hidden()
        assert density.input_value()=="302"
        assert "2 holes" in page.locator("#habitat-stat").inner_text()
        checks.append("Signed alpha −100..100 including convex hull at zero and furthest-site positive alpha")
        checks.append("Pg/Smiley interior point sliders preserve contours, and PPP/BPP sampling updates observed counts")

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
        # Deliberate control changes show a short diagram transition. Dragging
        # remains unanimated, and the site must honor OS reduced-motion.
        animated=page.evaluate("""() => {
          const control=document.getElementById('alpha-kept');
          control.click();
          return document.getElementById('habitat-plot').classList.contains('is-recomposing');
        }""")
        assert animated,"Changing geometry layers should trigger a restrained transition"
        checks.append("Control-driven diagram transitions are enabled")
        assert not errors,errors

        mobile=browser.new_page(viewport={"width":390,"height":844},
                                device_scale_factor=1,is_mobile=True,has_touch=True)
        mobile_errors=[]
        mobile.on("pageerror",lambda e:mobile_errors.append(str(e)))
        mobile.set_content(html,wait_until="load",timeout=60000)
        mobile.screenshot(path=str(output/"06-mobile-home.png"))
        mobile.locator("#habitat").screenshot(path=str(output/"07-mobile-alpha.png"))
        assert "600 sites" in mobile.locator("#habitat-stat").inner_text()
        assert not mobile_errors,mobile_errors
        checks.append("Desktop and mobile render without browser exceptions")
        reduced=browser.new_page(viewport={"width":1000,"height":800},
                                 reduced_motion="reduce")
        reduced.set_content(html,wait_until="load",timeout=60000)
        assert not reduced.evaluate(
            "document.documentElement.classList.contains('motion-ready')")
        assert reduced.locator(".chapter-card").first.evaluate(
            "el => getComputedStyle(el).transitionDuration")=="0s"
        reduced.locator('.masthead nav a[href="#water"]').click()
        assert reduced.locator("#water").evaluate(
            "el => !el.classList.contains('is-section-entering')"
        ), "Section navigation must not animate with reduced motion enabled"
        checks.append("Reduced-motion preference disables section and figure transitions")
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
