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
const context=vm.createContext({console,atob});
for(const file of ["site/editor.js","site/geometry-details.js","site/data/pg_reference_points.js","site/point-processes.js","site/app.js"]){
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
  assert.equal(scene.alpha.points.length,600);
  assert.equal(scene.alpha.default_preset,"pg");
  assert.equal(scene.alpha.description,"image-traced serif Pg wordmark with two enclosed counters");
  assert.equal(scene.alpha.presets.pg.points.length,600);
  assert.equal(scene.alpha.presets.smiley.points.length,53);
  assert.equal(scene.alpha.presets.smiley.description,"synthetic smiling face");
  assert.deepEqual(Object.keys(scene.alpha.presets).sort(),["pg","smiley"]);
  assert.deepEqual(Array.from(vm.runInContext("alphaValues",context)),[10,14,18,22,26,28.57142857142857,32,38,44]);
  assert.deepEqual(Array.from(vm.runInContext("smileyAlphaValues",context)),[4,8,10,12]);
  assert.equal(scene.alpha.options["28.57142857142857"].topology.holes,2);
  assert.equal(scene.alpha.options["28.57142857142857"].topology.components,2);
  assert.equal(scene.alpha.presets.pg.point_roles.filter(x=>x==="outline").length,298);
  assert.equal(scene.alpha.presets.pg.alpha_values.length,9);
  assert.equal(scene.alpha.presets.pg.default_alpha_index,5);
  assert.equal(scene.alpha.presets.pg.point_roles.filter(x=>x==="stroke").length,302);
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
  for(const [key,src] of Object.entries(scene.alpha.presets)){
    const values=src.alpha_values;
    for(const a of values){
      const computed=context.fallbackAlpha(src.points,-a);
      const reference=src.options[String(a)];
      assertEdgeSets(computed.segments,reference.segments,
        key+": JS alpha-hull boundaries should match library at alpha=-"+a);
      for(const arc of computed.arcs){
        if(arc.length<3)continue;
        const circle=context.arcCircle(arc);
        assert.ok(circle && Math.abs(circle.r-1/a)<0.0001);
      }
    }
  }
  const fallback=context.pgWordmarkPoints();
  assert.equal(fallback.length,600);
  for(let i=0;i<fallback.length;i++)
    for(let j=0;j<2;j++)
      assert.ok(Math.abs(fallback[i][j]-scene.alpha.points[i][j])<1e-8,
        "Browser Pg generator must match the Python reference coordinates");
  // Interior counts are arbitrary integers; exact original 298 contour sites
  // are never changed, including after reshuffling.
  for(const n of [0,1,82,83,150,302,450,600]){
    const sampled=context.pgWordmarkPoints(n);
    assert.equal(sampled.length,298+n);
    for(let i=0;i<298;i++)
      assert.deepEqual(sampled[i],fallback[i],
        "All traced glyph contours must remain fixed");
  }
  assert.deepEqual(context.pgWordmarkPoints(302),
    context.pgWordmarkPoints(302),"Same seeded density is reproducible");
  assert.notDeepEqual(context.pgWordmarkPoints(302,32572).slice(380,385),
    fallback.slice(380,385),"Reshuffle changes the new pseudorandom interior sites");
  assert.notDeepEqual(context.pgWordmarkPoints(20,32572).slice(298),
    context.pgWordmarkPoints(20).slice(298),
    "Reshuffle must also change low-density interior configurations");
  assert.equal(context.pgWordmarkPoints(20,32572).length,318);
  assert.equal(context.pgWordmarkPoints(600,32572).length,898);
  assert.deepEqual(context.pgWordmarkPoints(82),fallback.slice(0,380),
    "Reducing density to 82 returns exactly the original image-derived cloud");
  assert.equal(context.fallbackAlpha(scene.alpha.points.slice(0,2),-28.57142857142857).arcs.length,0);
}
function testSignedAlphaAndPointProcesses(){
  const points=[[.08,.12],[.88,.18],[.92,.86],[.20,.90],[.49,.37],[.6,.55]];
  const hull=Array.from(context.convexHullIndices(points));
  assert.equal(hull.length,4);
  const far=Array.from(context.furthestDelaunayTriangles(points));
  assert.equal(far.length,hull.length-2,"Farthest-site triangulation uses hull sites");
  assert.ok(far.every(t=>t.vertices.every(i=>hull.includes(i))));
  const hullEdges=hull.map((i,k)=>[i,hull[(k+1)%hull.length]]);
  assertEdgeSets(context.alphaSimplices(points,0).boundary,hullEdges,
    "Alpha zero gives the exact convex hull");
  assertEdgeSets(context.alphaSimplices(points,.5).boundary,hullEdges,
    "Furthest-site alpha boundary at sufficiently large radius");
  assert.equal(context.fallbackAlpha(points,0).arcs.length,0);
  assertEdgeSets(context.fallbackAlpha(points,0).segments,hullEdges);
  for(const a of [-100,-28.57,0,12,100]){
    const filtered=context.alphaSimplices(points,a);
    const fallback=context.fallbackAlpha(points,a);
    assertEdgeSets(fallback.segments,filtered.boundary,"Signed alpha "+a);
    for(const arc of fallback.arcs){
      if(arc.length<3)continue;
      const circle=context.arcCircle(arc);
      assert.ok(circle&&Math.abs(circle.r-1/Math.abs(a))<1e-4);
    }
  }
  assert.equal(context.stochasticPointSet("binomial",0).length,0);
  assert.equal(context.stochasticPointSet("poisson",0).length,0);
  for(const n of [0,1,12,120,600]){
    const bpp=context.stochasticPointSet("binomial",n,91234);
    assert.equal(bpp.length,n,"Binomial N equals n exactly");
    assert.ok(bpp.every(p=>p.every(v=>v>=0&&v<1)));
    assert.deepEqual(bpp,context.stochasticPointSet("binomial",n,91234));
  }
  const rate=24;
  const sizes=Array.from({length:300},(_,k)=>
    context.stochasticPointSet("poisson",rate,k+1000).length);
  const mean=sizes.reduce((x,y)=>x+y,0)/sizes.length;
  const variance=sizes.reduce((x,y)=>x+(y-mean)**2,0)/sizes.length;
  assert.ok(Math.abs(mean-rate)<4,"Poisson point-count expectation");
  assert.ok(variance>12&&variance<40,"Poisson point-count variance");
  assert.ok(new Set(sizes).size>10,"Poisson point count is random");
  assert.deepEqual(context.stochasticPointSet("poisson",24,24),
    context.stochasticPointSet("poisson",24,24));
  assert.throws(()=>context.stochasticPointSet("poisson",-1),/integer from 0 to 600/);
  const face=scene.alpha.presets.smiley.points;
  for(const n of [0,1,12,120,600]){
    const sample=context.smileyWithInteriorPoints(face,n,2718);
    assert.equal(sample.length,53+n);
    for(let k=0;k<53;k++)
      for(let axis=0;axis<2;axis++)assert.equal(sample[k][axis],face[k][axis]);
    for(const p of sample.slice(53)){
      assert.ok(context.pointInsidePolygon(...p,face.slice(0,30)));
      assert.ok(!context.pointInsidePolygon(...p,face.slice(30,36)));
      assert.ok(!context.pointInsidePolygon(...p,face.slice(36,42)));
    }
  }
  assert.notDeepEqual(context.smileyWithInteriorPoints(face,120,42).slice(53),
    context.smileyWithInteriorPoints(face,120,43).slice(53));
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
  for(const [key,src] of Object.entries(scene.alpha.presets)){
    for(const alpha of src.alpha_values){
      const exported=src.options[String(alpha)];
      const js=context.alphaSimplices(src.points,-alpha);
      assertEdgeSets(js.boundary,exported.shape_edges,
        key+": alpha-shape boundary should match actual Alpha_Shape.");
      assertEdgeSets(exported.shape_edges,exported.segments,
        key+": library alpha-hull straight segments should equal shape edges.");
      assert.equal(js.kept.length,exported.kept_triangles.length);
      assert.deepEqual({...context.complexTopology(js.kept.map(t=>t.vertices))},
        exported.topology,key+" alpha topology");
      for(const kept of js.kept)assert.ok(kept.r<=1/alpha+1e-12);
      for(const rejected of js.discarded)assert.ok(rejected.r>1/alpha-1e-12);
      assert.equal(context.allAlphaCircles(exported.arcs).length,exported.arcs.length);
    }
  }
  assert.equal(scene.alpha.presets.pg.options["22"].topology.holes,3);
  assert.equal(scene.alpha.presets.pg.options["26"].topology.holes,2);
  assert.equal(scene.alpha.presets.pg.options["28.57142857142857"].topology.holes,2);
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
  for(const element of ["alpha-shape","alpha-all-circles","alpha-kept",
    "beta-show-blocked","beta-invalid","beta-blockers","beta-disks",
    "water-bisectors","water-circumcircle","compare-left","compare-right"]){
    assert.match(html,new RegExp('id="'+element+'"'),"Missing control "+element);
  }
  assert.match(html,/data-editor-scene="sensors" data-mode="inspect"/);
  for(const id of ["water-deaths","water-pump-label"]){
    assert.match(html,new RegExp('id="'+id+'"'),"Missing historical layer control "+id);
  }
  assert.ok(html.includes('src="data/pg_reference_points.js"'));
  assert.ok(html.includes("Choose the traced"));
  assert.match(html,/id="pg-interior-slider"[^>]*max="600"[^>]*value="302"/);
  assert.match(html,/id="pg-interior-count"/);
  assert.match(html,/id="pg-reshuffle"/);
  assert.match(html,/id="pg-density-controls"/);
  assert.match(fs.readFileSync(path.join(root,"site/app.js"),"utf8"), /pgInteriorCount/);
  assert.match(css,/\.pg-density-controls\[hidden\]/);
  assert.match(html,/id="alpha-slider"[^>]*min="-100"[^>]*max="100"[^>]*step="any"/);
  assert.ok(html.includes('value="-28.57142857142857"'));
  for(const name of ["pg","smiley","poisson","binomial"])
    assert.ok(html.includes('value="'+name+'"'));
  for(const id of ["smiley-interior-slider","smiley-reshuffle","process-controls",
    "process-slider","process-reshuffle","process-realized","process-definition"])
    assert.ok(html.includes('id="'+id+'"'),"Missing "+id);
  assert.ok(html.includes('src="point-processes.js"'));
  assert.match(fs.readFileSync(path.join(root,"site/editor.js"),"utf8"), /habitat:1100/);
  const encoded=fs.readFileSync(path.join(root,"data/typography/pg_reference.u16.b64"),"ascii").trim();
  const mirrored=fs.readFileSync(path.join(root,"site/data/pg_reference_points.js"),"utf8");
  assert.ok(mirrored.includes(encoded),"Browser source must match archived sample");
  assert.equal(context.pgWordmarkPoints().length,600);
  assert.ok(html.includes("Historical cholera death marks"));
  assert.match(html,/id="alpha-point-set"/);
  assert.match(html,/<option value="pg" selected>/);
  assert.match(html,/<option value="smiley">/);
  assert.match(html,/id="alpha-kept" type="checkbox" checked/);
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
testSignedAlphaAndPointProcesses();
testBeta();
testGeometryWitnesses();
testShapeAndComparison();
testPointValidation();
testUI();
console.log("Construction witnesses, alpha shape, comparison, responsive sections and link checks passed.");
