

/**
 * получить матрицу для преобразования декартовых систем коорлинатю из СК с центром в точке А и вектором оси X - B в СК с центром в точке С b и вектором оси икс - D
 * @param a
 * @param b
 * @param c
 * @param d
 * @param ignoreScale не рассчитывать DimensionsTransformMatrix
 * @returns {{cosA: *, tranaslateY: *, scale: *, angle: *, tranaslateX: *, sinA: *}}
 */
export function getBasisTransformMatrix (a, b, c, d, ignoreScale) {
    // cos𝛼 = (ā,ƀ) / (|ā|*|ƀ|)
    // (ā,ƀ) = Ax * Bx + Ay * By
    // |ā| = √(x^2 + y^2)
    // x' = (x + Ax)*cos𝛼 + (y + Ay)*sin𝛼
    // y' = (y + Ay)*cos𝛼 - (x + Ax)*sin𝛼
    // cos𝛼 = (ā,ƀ) / (|ā|*|ƀ|)
    // (ā,ƀ) = Ax * Bx + Ay * B
    let ab = {x: b.x - a.x, y: b.y - a.y};
    let cd = {x: d.x - c.x, y: d.y - c.y};

    let alpha = -Math.acos((ab.x * cd.x + ab.y * cd.y) / (Math.sqrt(ab.x * ab.x + ab.y * ab.y) * Math.sqrt(cd.x * cd.x + cd.y * cd.y)));
    let cosA = fabric.util.cos(alpha);
    let sinA = fabric.util.sin(alpha);
    let ABDistance = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
    let CDDistance = Math.sqrt(Math.pow(d.x - c.x, 2) + Math.pow(d.y - c.y, 2));
    let scale = Math.abs(CDDistance / ABDistance);
    let tranaslateX = c.x - a.x;
    let tranaslateY = c.y - a.y;
    let matrix = [1, 0, 0, 1, -tranaslateX, -tranaslateY], //_calcTranslateMatrix,
        rotateMatrix = [cosA, sinA, -sinA, cosA, 0, 0]; //_calcRotateMatrix
    matrix = fabric.util.multiplyTransformMatrices(matrix, rotateMatrix, false);
    if (!ignoreScale) {
        let dimensionMatrix = [scale, 0, 0, scale, 0, 0]; //_calcDimensionsTransformMatrix
        matrix = fabric.util.multiplyTransformMatrices(matrix, dimensionMatrix, false);
    }
    return matrix;
}

export function getGroupCoords(object,group){
    let mB = object.calcOwnMatrix();
    let mX = group.calcTransformMatrix();

    let M = mB[0], N = mB[1], O = mB[2], P = mB[3], R = mB[4], S = mB[5],
        A = mX[0], B = mX[1], C = mX[2], D = mX[3], E = mX[4], F = mX[5],
        AD = A*D,
        BC = B*C,
        G = ( C*N - M*D ) / ( BC - AD ),
        H = ( A*N - M*B ) / ( AD - BC ),
        I = ( C*P - O*D ) / ( BC - AD ),
        J = ( A*P - O*B ) / ( AD - BC ),
        K = (C * ( S - F ) + D * ( E - R ) )/ (BC - AD),
        L = (A * ( S - F ) + B * ( E - R ) )/ (AD - BC);

    let matrix = [G,H,I,J,K,L],
        options = fabric.util.qrDecompose(matrix);

    return options;
}

export function toGroupCoords(object,group){
    let options = getGroupCoords(object,group);
    let center = new fabric.Point(options.translateX, options.translateY);
    object.flipX = false;
    object.flipY = false;
    object.set('scaleX', options.scaleX);
    object.set('scaleY', options.scaleY);
    object.skewX = options.skewX;
    object.skewY = options.skewY;
    object.angle = options.angle;
    object.setPositionByOrigin(center, 'center', 'center');
}
