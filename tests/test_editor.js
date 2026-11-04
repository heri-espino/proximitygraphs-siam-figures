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
for(const file of ["site/editor.js","site/app.js"]){
  vm.runInContext(fs.readFileSync(path.join(root,file),"utf8"),context,{filename:file});
}
const scene=JSON.parse(fs.readFileSync(path.join(root,"site/data/scenes.json"),"utf8"));
const normalizedEdges=edges=>edges.map(edge=>edge.slice().sort((a,b)=>a-b).join(":")).sort();
function assertEdgeSets(actual,expected,desc){
  assert.deepEqual(normalizedEdges(actual),normalizedEdges(expected),desc);
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
  for(const a of [2,3,4,5]){
    const computed=context.fallbackAlpha(scene.alpha.points,-a);
    const fromLibrary=scene.alpha.options[String(a)];
    assertEdgeSets(computed.segments,fromLibrary.segments,
      "Browser alpha-hull boundaries should match library at alpha=-"+a);
    for(const arc of computed.arcs){
      if(arc.length<3)continue;
      const circle=context.arcCircle(arc);
      assert.ok(circle && Math.abs(circle.r-1/a)<0.0001,
        "Browser alpha-hull arc must have radius R=1/|alpha|.");
    }
  }
  const fewer=scene.alpha.points.slice(0,2);
  assert.equal(context.fallbackAlpha(fewer,-4).arcs.length,0);
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
  assert.ok(css.includes(".point-toolbar"));
}
testDelaunay();
testAlpha();
testBeta();
testPointValidation();
testUI();
console.log("Browser geometry, point validation, and link behavior checks passed.");
