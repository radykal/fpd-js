import Typr from "./typr.js";

Typr.U.shapeExtended = function(font,str,ltr ,ff, features) {
  let detected = fabric.fonts.getTextFeatures(str, ff, features);
  let getGlyphPosition = function(font, gls,i1,ltr) {
    let g1=gls[i1],g2=gls[i1+1], kern=font["kern"];
    if(kern) {
      let ind1 = kern.glyph1.indexOf(g1);
      if(ind1!==-1) {
        let ind2 = kern.rval[ind1].glyph2.indexOf(g2);
        if(ind2!==-1) return [0,0,kern.rval[ind1].vals[ind2],0];
      }
    }
    return [0,0,0,0];
  }

  let gls = [];
  for(let i=0; i<str.length; i++) {

    if(detected && detected[i]){
      gls.push(detected[i].code);
      i += detected[i].components.length-1
    }
    else{
      let cc = str.codePointAt(i);
      if(cc>0xffff) i++;
      gls.push(Typr["U"]["codeToGlyph"](font, cc));
    }
  }
  let shape = [];
  let x = 0, y = 0;

  for(let i=0; i<gls.length; i++) {
    let padj = getGlyphPosition(font, gls,i,ltr);
    let gid = gls[i];
    let ax=font["hmtx"].aWidth[gid]+padj[2];
    shape.push({"g":gid, "cl":i, "dx":0, "dy":0, "ax":ax, "ay":0});
    x+=ax;
  }
  return shape;
}

Typr.U.getBbox = function(char,ff, decl){
  let registry = fabric.fonts.registry[ff]
  let variation = registry.variations[(decl.fontStyle === "italic" ? "i" : "n") + (decl.fontWeight === "bold" ? "7" : "4")]

  let scale = decl.fontSize / variation.typr.head.unitsPerEm;
  let shape = Typr.U.shapeExtended(variation.typr, char , ff, this.features);
  let path = Typr.U.shapeToPath(variation.typr, shape);
  let bbox = Typr.U.getShapePathBbox(path)
  bbox.x*=scale
  bbox.y*=-scale
  bbox.width*=scale
  bbox.height*=-scale
  return bbox
}

Typr.U.getShapePathBbox = function(path){
  let c = 0, cmds = path["cmds"], crds = path["crds"];
  let pathString = ""
  for(let j=0; j<cmds.length; j++) {
    let cmd = cmds[j];
    if (cmd==="M") {
      pathString+=`M ${crds[c]} ${crds[c+1]}`
      c+=2;
    }
    else if(cmd==="L") {
      pathString+=`L ${crds[c]} ${crds[c+1]}`
      c+=2;
    }
    else if(cmd==="C") {
      pathString+=`C ${crds[c]} ${crds[c+1]} ${crds[c+2]} ${crds[c+3]} ${crds[c+4]} ${crds[c+5]}`
      c+=6;
    }
    else if(cmd==="Q") {
      pathString+=`Q ${crds[c]} ${crds[c+1]} ${crds[c+2]} ${crds[c+3]}`
      c+=4;
    }
    else if(cmd==="Z") {
      pathString+=`Z`
    }
  }

  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  let svgPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  svgPath.setAttribute("d", pathString);
  svg.appendChild(svgPath);
  document.body.append(svg)
  let bboxGroup = svgPath.getBBox();
  document.body.removeChild(svg)
  return bboxGroup
}

export default Typr;