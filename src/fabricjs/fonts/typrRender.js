import Typr from "../../plugins/typr.ext.js";
import {FmFonts} from "./fonts.js";
import {getCharCode} from "../../util/string.ext.js";

// Typr.U.initHB(url, clb)

export const FmTyprRender = {
    name: "typrRender",
    deps: [FmFonts],
    install() {
        fabric.fonts.loadTypr = function(variation){
            variation.typr = Typr.parse(variation.buffer)[0];//new Buffer(registry.variations.n4.buffer)
            variation.cache = {}
        }
        fabric.fonts.fontIncludes = function(decl, char){
            let registry = fabric.fonts.registry[decl.fontFamily]
            if (!registry) {
                console.warn("no registry!" + decl.fontFamily)
                return false
            }
            let variation = registry.variations[(decl.fontStyle === "italic" ? "i" : "n") + (decl.fontWeight === "bold" ? "7" : "4")]

            if(registry.color){
                if(!variation.buffer){
                    return true;
                }
                if (!variation.typr) {
                    fabric.fonts.loadTypr(variation)
                }
                let charcode = getCharCode(char[0]);
                return Typr.U.codeToGlyph(variation.typr, charcode)
            }
            else{
                if(registry.range){
                    if(!registry.regexp){
                        registry.regexp = new RegExp("["+registry.range + "]","u")
                    }
                    return registry.regexp.test(char)
                }
                else{
                    return true;
                }
            }
        }
    },
    prototypes: {
        Text: {
            useRenderBoundingBoxes:true,
            _getBaseLine(styleFontSize){
               return (this.lineHeight * this.fontSize) -0.9 * styleFontSize
            },
            _getGraphemeBoxNative: fabric.Text.prototype._getGraphemeBox,
            _getGraphemeBox: function(grapheme, lineIndex, charIndex, prevGrapheme,skipLeft){
                let graphemeInfo = this._getGraphemeBoxNative(grapheme, lineIndex, charIndex, prevGrapheme,skipLeft);
                let style = this.getCompleteStyleDeclaration(lineIndex, charIndex);
                let ff = style.fontFamily.split(",")[0]
                let variation = fabric.fonts.getFontVariation(ff, style.fontWeight, style.fontStyle)?.variation
                if(variation){
                    if(variation.cache && variation.cache[grapheme]){
                        graphemeInfo.contour = variation.cache[grapheme]
                    }
                    else if(variation.typr){
                        let unitsPerEm = variation.typr.head.unitsPerEm
                        let shape = Typr.U.shapeExtended(variation.typr, grapheme, ff, this.features);
                        let path = Typr.U.shapeToPath(variation.typr, shape);
                        let ax = shape.reduce((ax,item) => ax+ item.ax,0)
                        let bbox = Typr.U.getShapePathBbox(path)

                        if(bbox.width && bbox.height){
                            graphemeInfo.contour = variation.cache[grapheme] = {
                                ax: ax,
                                path: path,
                                x: bbox.x / unitsPerEm,
                                y: bbox.y / unitsPerEm,
                                w: bbox.width / unitsPerEm,
                                h: bbox.height / unitsPerEm
                            }
                        }
                    }
                    else if (variation.buffer) {
                        fabric.fonts.loadTypr(variation)
                    }
                }
                return graphemeInfo
            },
            "^textRenders": ["typrRender"],
            typrRender: function (method, ctx, char, decl, alignment, left, top, angle) {
                let ff = decl.fontFamily.split(",")[0]
                let registry = fabric.fonts.registry[ff];
                let specifiedRenderer = this.renderer || registry && registry.renderer;
                if (!registry || !registry.active || specifiedRenderer && specifiedRenderer !== "typr") {
                    return false;
                }

                if(method !=="calc" && !specifiedRenderer && registry.format !== "svg"){
                    return false
                }

                let variation = fabric.fonts.getFontVariation(ff, decl.fontWeight, decl.fontStyle).variation
                if (!variation.typr) {
                    if(!variation.buffer){
                        return false;
                    }
                    fabric.fonts.loadTypr(variation)
                }
                let path, ax;

                if(variation.cache[char]){
                    path = variation.cache[char].path
                    ax = variation.cache[char].ax
                }
                else{

                    let shape = Typr.U.shapeExtended(variation.typr, char , ff, this.features);
                    path = Typr.U.shapeToPath(variation.typr, shape);
                    ax = shape.reduce((ax,item) => ax+ item.ax,0)
                }

                let scale = decl.fontSize / variation.typr.head.unitsPerEm;
                if(ctx){
                    ctx.save()
                    ctx.scale(scale, -scale);
                    ctx.beginPath();
                    if(alignment=== "center"){
                        ctx.translate( -ax / 2, 0);
                    }
                    Typr.U.pathToContext(path, ctx);  // setting color and calling fill() already in path
                    if(method === "both"){
                        if (decl.fill && this.paintFirst === 'fill') {
                            ctx.fill();
                        }
                        if(decl.stroke && decl.strokeWidth) {
                            if (this.shadow && !this.shadow.affectStroke) {
                                this._removeShadow(ctx);
                            }
                            ctx.save();
                            this._setLineDash(ctx, this.strokeDashArray);
                            ctx.beginPath();
                            ctx.stroke();
                            ctx.closePath();
                            ctx.restore();
                        }
                        if (decl.fill && this.paintFirst === 'stroke') {
                            ctx.fill();
                        }
                    }
                    else if(method === "fillText") {
                        decl.fill && ctx.fill();
                    }
                    else if(method === "strokeText") {
                        decl.stroke && decl.strokeWidth && ctx.stroke();
                    }
                    ctx.restore()
                }

                return true;
            }
        }
    }
}