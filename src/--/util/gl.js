//http://tulrich.com/geekstuff/canvas/jsgl.js


const vertexShader = `
  attribute vec2 aVertexPosition;
  attribute vec2 aTextureCoord;
  uniform vec2 uResolution;
  
  varying highp vec2 vTextureCoord;
  
  void main() {
    vTextureCoord = aTextureCoord;
  
    // convert the position from pixels to 0.0 to 1.0
    vec2 zeroToOne = aVertexPosition / uResolution;
    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;
    // convert from 0->2 to -1->+1 (clip space)
    vec2 clipSpace = zeroToTwo - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  }
`

//OpenGL Shading Language injection
// fragment shader code from '../images/fragment-shader.shader';
const fragmentShader = `
  #ifdef GL_ES
    precision highp float;
  #endif
  
  uniform vec4 uGlobalColor;
  varying highp vec2 vTextureCoord;
  uniform sampler2D uSampler;
  
  void main() {
    gl_FragColor = texture2D(uSampler, vTextureCoord);
  }
`

fabric.util.gl = {
  fragmentShader: fragmentShader,
  vertexShader: vertexShader,
  standartShaderProgram (gl) {
    return this.buildShaderProgram(gl, [
      {
        code: vertexShader,
        type: gl.VERTEX_SHADER
      },
      {
        code: fragmentShader,
        type: gl.FRAGMENT_SHADER
      }
    ])
  },
  setTextureImage(gl, texture, image){

    function isPowerOf2(value) {
      return (value & (value - 1)) === 0;
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
        gl.RGBA, gl.UNSIGNED_BYTE, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      // Yes, it's a power of 2. Generate mips.
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);

    } else {
      // No, it's not a power of 2. Turn of mips and set
      // wrapping to clamp to edge
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    return texture;
  },
  createTexture(gl, color){

    color[3] = Math.round(color[3] * 255)

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Because images have to be download over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const pixel = new Uint8Array(color );  // opaque blue
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    return texture;
  },
  buildShaderProgram(gl,shaderInfo) {
    let program = gl.createProgram();


    function compileShader(shaderInfo) {
      if (shaderInfo.id) {
        shaderInfo.code = document.getElementById(id).firstChild.nodeValue;
        delete shaderInfo.id;
      }
      let shader = gl.createShader(shaderInfo.type);

      gl.shaderSource(shader, shaderInfo.code);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(`Error compiling ${shaderInfo.type === gl.VERTEX_SHADER ? "vertex" : "fragment"} shader:`);
        console.log(gl.getShaderInfoLog(shader));
      }
      return shader;
    }

    shaderInfo.forEach(function (desc) {
      let shader = compileShader(desc);

      if (shader) {
        gl.attachShader(program, shader);
      }
    });

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.log("Error linking shader program:");
      console.log(gl.getProgramInfoLog(program));
    }

    return program;
  },
  drawTriangles: function(ctx,triangles){
    ctx.strokeStyle = "black";
    ctx.beginPath();
    let tri;
    for (let i in triangles) {
      tri = triangles[i];
      ctx.moveTo(tri.p0.x, tri.p0.y);
      ctx.lineTo(tri.p1.x, tri.p1.y);
      ctx.lineTo(tri.p2.x, tri.p2.y);
      ctx.lineTo(tri.p0.x, tri.p0.y);
    }
    ctx.stroke();
    ctx.closePath();
  },
  drawTriangle: function(ctx, im, x0, y0, x1, y1, x2, y2, sx0, sy0, sx1, sy1, sx2, sy2,stroke) {
    ctx.save();

    // Clip the output to the on-screen triangle boundaries.
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    if(stroke){
      ctx.stroke();//xxxxxxx for wireframe
    }
    ctx.clip();

    /*
     ctx.transform(m11, m12, m21, m22, dx, dy) sets the context transform matrix.

     The context matrix is:

     [ m11 m21 dx ]
     [ m12 m22 dy ]
     [  0   0   1 ]

     Coords are column vectors with a 1 in the z coord, so the transform is:
     x_out = m11 * x + m21 * y + dx;
     y_out = m12 * x + m22 * y + dy;

     From Maxima, these are the transform values that map the source
     coords to the dest coords:

     sy0 (x2 - x1) - sy1 x2 + sy2 x1 + (sy1 - sy2) x0
     [m11 = - -----------------------------------------------------,
     sx0 (sy2 - sy1) - sx1 sy2 + sx2 sy1 + (sx1 - sx2) sy0

     sy1 y2 + sy0 (y1 - y2) - sy2 y1 + (sy2 - sy1) y0
     m12 = -----------------------------------------------------,
     sx0 (sy2 - sy1) - sx1 sy2 + sx2 sy1 + (sx1 - sx2) sy0

     sx0 (x2 - x1) - sx1 x2 + sx2 x1 + (sx1 - sx2) x0
     m21 = -----------------------------------------------------,
     sx0 (sy2 - sy1) - sx1 sy2 + sx2 sy1 + (sx1 - sx2) sy0

     sx1 y2 + sx0 (y1 - y2) - sx2 y1 + (sx2 - sx1) y0
     m22 = - -----------------------------------------------------,
     sx0 (sy2 - sy1) - sx1 sy2 + sx2 sy1 + (sx1 - sx2) sy0

     sx0 (sy2 x1 - sy1 x2) + sy0 (sx1 x2 - sx2 x1) + (sx2 sy1 - sx1 sy2) x0
     dx = ----------------------------------------------------------------------,
     sx0 (sy2 - sy1) - sx1 sy2 + sx2 sy1 + (sx1 - sx2) sy0

     sx0 (sy2 y1 - sy1 y2) + sy0 (sx1 y2 - sx2 y1) + (sx2 sy1 - sx1 sy2) y0
     dy = ----------------------------------------------------------------------]
     sx0 (sy2 - sy1) - sx1 sy2 + sx2 sy1 + (sx1 - sx2) sy0
     */

    // TODO: eliminate common subexpressions.
    let denom = sx0 * (sy2 - sy1) - sx1 * sy2 + sx2 * sy1 + (sx1 - sx2) * sy0;
    if (denom === 0) {
      return;
    }
    let m11 = -(sy0 * (x2 - x1) - sy1 * x2 + sy2 * x1 + (sy1 - sy2) * x0) / denom;
    let m12 = (sy1 * y2 + sy0 * (y1 - y2) - sy2 * y1 + (sy2 - sy1) * y0) / denom;
    let m21 = (sx0 * (x2 - x1) - sx1 * x2 + sx2 * x1 + (sx1 - sx2) * x0) / denom;
    let m22 = -(sx1 * y2 + sx0 * (y1 - y2) - sx2 * y1 + (sx2 - sx1) * y0) / denom;
    let dx = (sx0 * (sy2 * x1 - sy1 * x2) + sy0 * (sx1 * x2 - sx2 * x1) + (sx2 * sy1 - sx1 * sy2) * x0) / denom;
    let dy = (sx0 * (sy2 * y1 - sy1 * y2) + sy0 * (sx1 * y2 - sx2 * y1) + (sx2 * sy1 - sx1 * sy2) * y0) / denom;

    ctx.transform(m11, m12, m21, m22, dx, dy);

    // Draw the whole image.  Transform and clip will map it onto the
    // correct output triangle.
    //
    // TODO: figure out if drawImage goes faster if we specify the rectangle that
    // bounds the source coords.
    ctx.drawImage(im, 0, 0);
    ctx.restore();
  },
  drawElement: function(ctx,element,triangles,stroke){

    let tri;
    for (let i in triangles) {
      tri = triangles[i];

      this.drawTriangle(ctx, element,
        +tri.p0.x, tri.p0.y,
        tri.p1.x, tri.p1.y,
        tri.p2.x, tri.p2.y,
        tri.t0.u, tri.t0.v,
        tri.t1.u, tri.t1.v,
        tri.t2.u, tri.t2.v,
        stroke);
    }
  },
  fixSemiTransparentPixels: function(ctx){
    let imgData = ctx.getImageData(0,0,ctx.canvas.width,ctx.canvas.height);
    for(let i = 3; i < imgData.data.length; i+=4){
      if(imgData.data[i] > 0){
        imgData.data[i] = 255;
      }
    }
    ctx.putImageData(imgData,0,0);
  },
};
