"use strict";

/* Reproducible browser geometry checks, without external Node dependencies.
 * Run: node tests/test_editor.js
 * Authoritative default scenes come from pinned ProximityGraphs Python builds.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const context=vm.createContext({console});
for(const file of ["site/editor.js","site/geometry-details.js","site/app.js"]){
  vm.runInContext(fs.readFileSync(path.join(root,file),"utf8"),context,{filename:file});
}
const scene=JSON.parse(fs.readFileSync(path.join(root,"site/data/scenes.json"),"utf8"));
const normalizedEdges=edges=>Array.from(edges,edge=>Array.from(edge).sort((a,b)=>a-b).join(":")).sort();
function assertEdgeSets(actual,expected,desc){
  assert.deepEqual(normalizedEdges(actual),normalizedEdges(expected),desc);
}
function testHistoricalAndSyntheticDefaults(){
  const v=scene.voronoi;
  assert.equal(v.points.length,13);
  assert.equal(v.death_marks.length,578);
  assert.equal(v.labels[v.historical.broad_street_index],"Broad St");
  assert.equal(scene.alpha.default_preset,"pg");
  assert.equal(scene.alpha.points.length,78);
  assert.equal(scene.alpha.description,"synthetic Pg wordmark with two counters");
  assert.equal(scene.alpha.presets.smiley.points.length,53);
  assert.equal(scene.alpha.presets.smiley.description,"original synthetic smiley face");
  assert.equal(scene.alpha.presets.pg.options["11.8"].topology.holes,2);
  assert.equal(scene.alpha.presets.pg.options["11.8"].topology.components,1);
  assert.equal(context.pgPoints.length,78);
  assert.equal(context.smileyPoints.length,53);
  scene.alpha.points.forEach((pt,i)=>pt.forEach((v,j)=>
    assert.ok(Math.abs(v-context.pgPoints[i][j])<1e-8,
      "Python and JavaScript wordmark generators must agree.")));
  assert.equal(scene.beta.points.length,25);
  assert.equal(scene.beta.description,"synthetic relay-corridor sensor network");
  const transform=v.historical.normalization;
  assert.ok(transform.scale>0 && transform.method.includes("preserving"));
  assert.ok(v.death_marks.every(p=>p.every(x=>x>=0&&x<=1)));
}
function testDelaunay(){
  const pts=scene.voronoi.points;
  assertEdgeSets(context.trianglesEdges(context.delaunayTriangles(pts)),
    scene.voronoi.delaunay,"Edited-browser Delaunay must match default library geometry.");
  assert.equal(context.delaunayTriangles([]).length,0);
  assert.equal(context.delaunayTriangles([[0,0],[.5,.5]]).length,0);
  assert.equal(context.delaunayTriangles([[0,0],[.5,.5],[1,1]]).length,0);
  const moved=pts.map(x=>x.slice());moved[0]=[.92,.34];
  const before=normalizedEdges(scene.voronoi.delaunay);
  const after=normalizedEdges(context.trianglesEdges(context.delaunayTriangles(moved)));
  assert.notDeepEqual(after,before,"Moving a station should recompute Delaunay links.");
  assert.notDeepEqual(context.cells(moved),scene.voronoi.cells,
    "Moving a station must change the Voronoi service partition.");
}
function testAlpha(){
  for(const presetName of ["pg","smiley"]){
    const preset=scene.alpha.presets[presetName];
    for(const a of preset.alpha_values){
      const computed=context.fallbackAlpha(preset.points,-a);
      const fromLibrary=preset.options[String(a)];
      assertEdgeSets(computed.segments,fromLibrary.segments,
        "Browser alpha-hull boundaries should match "+presetName+" at alpha=-"+a);
      for(const arc of computed.arcs){
        if(arc.length<3)continue;
        const circle=context.arcCircle(arc);
        assert.ok(circle && Math.abs(circle.r-1/a)<0.0001,
          "Browser alpha-hull arc must have radius R=1/|alpha|.");
      }
      const simplex=context.alphaSimplices(preset.points,-a);
      const topo=context.alphaComplexTopology(simplex.kept);
      assert.deepEqual(topo,fromLibrary.topology,
        "Alpha-complex hole count must agree with Python for "+presetName);
    }
  }
  assert.equal(scene.alpha.presets.pg.options["11.8"].topology.holes,2);
  assert.equal(context.fallbackAlpha(scene.alpha.presets.smiley.points.slice(0,2),-4).arcs.length,0);
}
function testBeta(){
  for(const beta of [1,1.25,1.5,1.75,2]){
    assertEdgeSets(context.betaEdges(scene.beta.points,beta),
      scene.beta.options[String(beta)],
      "Browser beta-skeleton should match library at beta="+beta);
  }
  const moved=scene.beta.points.map(p=>p.slice());
  moved[0]=[.05,.92];
  assert.notDeepEqual(normalizedEdges(context.betaEdges(moved,1.5)),
    normalizedEdges(scene.beta.options["1.5"]));
}
function testGeometryWitnesses(){
  const points=scene.beta.points;
  const pairs=context.allPointPairs(points);
  assert.equal(pairs.length,points.length*(points.length-1)/2);
  for(const beta of [1,1.25,1.5,1.75,2]){
    const authoritative=new Set(normalizedEdges(scene.beta.options[String(beta)]));
    for(const pair of pairs){
      const report=context.betaPairDetails(points,beta,...pair);
      assert.equal(report.valid,authoritative.has(pair.join(":")),
        "Every beta witness must agree with the pinned library for β="+beta);
      if(report.valid)assert.equal(report.blockers.length,0);
      else assert.ok(report.blockers.length>0);
    }
  }
  const blocked=context.findBlockedBetaPair(points,1.5);
  assert.ok(blocked,"The default example should include a rejected pair.");
  const witness=context.betaPairDetails(points,1.5,...blocked);
  assert.equal(witness.valid,false);
  assert.ok(witness.blockers.every(x=>x.index!==blocked[0]&&x.index!==blocked[1]));
  const v=scene.voronoi.points[0],q=scene.voronoi.points[1];
  const bis=context.bisectorClippedToUnitSquare(v,q);
  assert.ok(bis && bis.length===2);
  for(const x of bis){
    assert.ok(x.every(t=>t>=0&&t<=1));
    const d=Math.abs(Math.hypot(x[0]-v[0],x[1]-v[1])-
      Math.hypot(x[0]-q[0],x[1]-q[1]));
    assert.ok(d<1e-8,"Bisector points are equidistant from both sites.");
  }
}
function testShapeAndComparison(){
  for(const presetName of ["pg","smiley"]){
    const preset=scene.alpha.presets[presetName];
    const points=preset.points;
    for(const alpha of preset.alpha_values){
      const exported=preset.options[String(alpha)];
      const js=context.alphaSimplices(points,-alpha);
      assertEdgeSets(js.boundary,exported.shape_edges,
        "The "+presetName+" alpha-shape boundary should match Alpha_Shape.");
      assertEdgeSets(exported.shape_edges,exported.segments,
        "Library alpha-hull straight segments must equal shape edges.");
      assert.equal(js.kept.length,exported.kept_triangles.length);
      for(const kept of js.kept)assert.ok(kept.r<=1/alpha+1e-12);
      for(const rejected of js.discarded)assert.ok(rejected.r>1/alpha-1e-12);
      assert.equal(context.allAlphaCircles(exported.arcs).length,exported.arcs.length);
    }
  }
  const sample=scene.compare.points;
  for(const key of ["delaunay","gabriel","rng","beta","alpha-shape"]){
    assertEdgeSets(context.compareGraphEdges(sample,key),
      scene.compare.options[key],
      "Compare-panel graph "+key+" must match authoritative library.");
  }
}
function testPointValidation(){
  const pts=[[.2,.2],[.5,.5]];
  assert.equal(context.validPoint(pts,[.8,.7]),true);
  assert.equal(context.validPoint(pts,[.2,.2]),false,"Reject duplicates.");
  assert.equal(context.validPoint(pts,[-.01,.5]),false,"Keep coordinates in the square.");
  assert.equal(context.validPoint(pts,[.201,.2],0),true,"Allow an existing point's own location.");
  assert.equal(context.validPoint(pts,[.5,.5],0),false,"Moving cannot overlap another site.");
}
function testUI(){
  const html=fs.readFileSync(path.join(root,"site/index.html"),"utf8");
  const css=fs.readFileSync(path.join(root,"site/styles.css"),"utf8");
  assert.ok(html.indexOf('src="editor.js"') < html.indexOf('src="app.js"'));
  assert.ok(html.includes('src="geometry-details.js"'));
  for(const section of ["top","explore","water","habitat","sensors","compare","about"]){
    assert.match(html,new RegExp('id="'+section+'"'),"Missing section "+section);
  }
  for(const name of ["water","habitat","sensors"]){
    assert.match(html,new RegExp('data-editor-scene="'+name+'" data-mode="move"'));
    assert.match(html,new RegExp('data-editor-scene="'+name+'" data-mode="add"'));
    assert.match(html,new RegExp('data-editor-scene="'+name+'" data-mode="delete"'));
    assert.match(html,new RegExp('data-editor-reset="'+name+'"'));
  }
  const links=html.match(/<a\b[^>]*>/g)||[];
  for(const link of links)if(/href="https?:\/\//.test(link)){
    assert.match(link,/target="_blank"/,"External links open in new tabs: "+link);
    assert.match(link,/rel="noopener noreferrer"/,"External links prevent opener access: "+link);
  }
  for(const element of ["alpha-preset","alpha-scene-label","alpha-shape","alpha-all-circles","alpha-kept",
    "beta-show-blocked","beta-invalid","beta-blockers","beta-disks",
    "water-bisectors","water-circumcircle","compare-left","compare-right"]){
    assert.match(html,new RegExp('id="'+element+'"'),"Missing control "+element);
  }
  assert.match(html,/data-editor-scene="sensors" data-mode="inspect"/);
  for(const id of ["water-deaths","water-pump-label"]){
    assert.match(html,new RegExp('id="'+id+'"'),"Missing historical layer control "+id);
  }
  assert.ok(html.includes('value="pg" selected'));
  assert.ok(html.includes('value="smiley"'));
  assert.ok(html.includes("two enclosed counters"));
  assert.ok(html.includes("Historical cholera death marks"));
  assert.ok(css.includes(".point-toolbar"));
  assert.ok(css.includes(".studio"));
  assert.match(css,/--bg:\s*#faf9f7/);
  assert.match(css,/--ink:\s*#242421/);
  assert.match(css,/\.exhibit\s*\{[^}]*border:\s*0;/);
  assert.match(css,/prefers-reduced-motion:\s*reduce/);
  assert.match(html,/src="motion\.js"/);
  assert.match(html,/<h1[^>]+>Who counts as a <em>neighbor\?<\/em><\/h1>/);
  const motion=fs.readFileSync(path.join(root,"site/motion.js"),"utf8");
  assert.ok(!motion.includes("IntersectionObserver"),"Scrolling must not trigger section reveals");
  assert.ok(!motion.includes('addEventListener("scroll"'),"No scroll-triggered animations");
  assert.ok(motion.includes('a[href^="#"]'),"Only section links activate section motion");
  assert.ok(motion.includes("hashchange"),"Browser history can activate a selected section");
  assert.ok(motion.includes("is-section-entering"),"Selected section animation class");
  assert.ok(motion.includes("prefers-reduced-motion"));
  assert.ok(motion.includes("is-recomposing"));
  assert.match(css,/html\s*\{\s*scroll-behavior:\s*auto;/);
  assert.match(css,/@keyframes section-enter/);
  assert.ok(!css.includes("html.motion-ready .reveal"),"No scroll-dependent hidden content");
}
testHistoricalAndSyntheticDefaults();
testDelaunay();
testAlpha();
testBeta();
testGeometryWitnesses();
testShapeAndComparison();
testPointValidation();
testUI();
console.log("Construction witnesses, alpha shape, comparison, responsive sections and link checks passed.");
