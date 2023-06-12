const getScaleByDimesions = (imgW, imgH, resizeToW=0, resizeToH=0, mode='fit') => {

    resizeToW = typeof resizeToW !== 'number' ? 0 : resizeToW;
    resizeToH = typeof resizeToH !== 'number' ? 0 : resizeToH;

    let scaling = 1,
        rwSet = resizeToW !== 0,
        rhSet = resizeToH !== 0;

    if(mode === 'cover') { //cover whole area

        let dW = resizeToW - imgW,
            dH =  resizeToH - imgH;

        if (dW < dH) { //scale width
            scaling = rwSet ? Math.max(resizeToW / imgW,  resizeToH / imgH) : 1;
        }
        else { //scale height
            scaling = rhSet ? Math.max(resizeToW / imgW,  resizeToH / imgH) : 1;
        }

    }
    else { //fit into area

        if(imgW > imgH) {
            scaling = rwSet ? Math.min(resizeToW / imgW,  resizeToH / imgH) : 1;
        }
        else {
            scaling = rhSet ? Math.min(resizeToW / imgW,  resizeToH / imgH) : 1;
        }

    }

    return parseFloat(scaling.toFixed(10));

}

export { getScaleByDimesions };

const drawCirclePath = (cx,cy,r) => {
    return "M" + cx + "," + cy + "m" + (-r) + ",0a" + r + "," + r + " 0 1,0 " + (r * 2) + ",0a" + r + "," + r + " 0 1,0 " + (-r * 2) + ",0";
}

export { drawCirclePath };
