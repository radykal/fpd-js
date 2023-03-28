
/**
 * find a closest point on an interval {A,B} from point P
 * @param P
 * @param A
 * @param B
 * @returns {{x: number, y: number}|*}
 */
export function closestPointBetween2D (P, A, B) {
    const _zero2D = {x: 0, y: 0};

    function _vectorToSegment2D(t, P, A, B) {
        return {
            x: (1 - t) * A.x + t * B.x - P.x,
            y: (1 - t) * A.y + t * B.y - P.y
        }
    }

    function _sqDiag2D(P) {
        return P.x ** 2 + P.y ** 2
    }

    const v = {x: B.x - A.x, y: B.y - A.y};
    const u = {x: A.x - P.x, y: A.y - P.y};
    const vu = v.x * u.x + v.y * u.y;
    const vv = v.x ** 2 + v.y ** 2;
    const t = -vu / vv;
    if (t >= 0 && t <= 1) {
        return _vectorToSegment2D(t, _zero2D, A, B);
    }
    const g0 = _sqDiag2D(_vectorToSegment2D(0, P, A, B));
    const g1 = _sqDiag2D(_vectorToSegment2D(1, P, A, B));
    return g0 <= g1 ? A : B

}



/// <summary>
/// The input parameters describe a circular arc going _clockwise_ from E to F.
/// The output is the bounding box.
/// </summary>
export function sectorBoundingBox(E, F, C, radius) {
    // Put the endpoints into the bounding box:
    let x1 = E.x;
    let y1 = E.y;
    let x2 = x1, y2 = y1;
    if (F.x < x1)
        x1 = F.x;
    if (F.x > x2)
        x2 = F.x;
    if (F.y < y1)
        y1 = F.y;
    if (F.y > y2)
        y2 = F.y;

    // Now consider the top/bottom/left/right extremities of the circle:
    let thetaE = Math.atan2(E.y - C.y, E.x - C.x);
    let thetaF = Math.atan2(F.y - C.y, F.x - C.x);
    if (AnglesInClockwiseSequence(thetaE, 0/*right*/, thetaF))
    {
        let x = (C.x + radius);
        if (x > x2)
            x2 = x;
    }
    if (AnglesInClockwiseSequence(thetaE, Math.PI/2/*bottom*/, thetaF))
    {
        let y = (C.y + radius);
        if (y > y2)
            y2 = y;
    }
    if (AnglesInClockwiseSequence(thetaE, Math.PI/*left*/, thetaF))
    {
        let x = (C.x - radius);
        if (x < x1)
            x1 = x;
    }
    if (AnglesInClockwiseSequence(thetaE, Math.PI*3/2/*top*/, thetaF))
    {
        let y = (C.y - radius);
        if (y < y1)
            y1 = y;
    }
    return {x: x1, y: y1, width: x2 - x1, height: y2 - y1}
}

/// <summary>
/// Do these angles go in clockwise sequence?
/// </summary>
export function AnglesInClockwiseSequence( x,  y,  z) {
    return AngularDiffSigned(x, y) + AngularDiffSigned(y, z) < 2*Math.PI;
}

/// <summary>
/// Returns a number between 0 and 360 degrees, as radians, representing the
/// angle required to go clockwise from 'theta1' to 'theta2'. If 'theta2' is
/// 5 degrees clockwise from 'theta1' then return 5 degrees. If it's 5 degrees
/// anticlockwise then return 360-5 degrees.
/// </summary>
export function AngularDiffSigned(theta1, theta2) {
    let dif = theta2 - theta1;
    while (dif >= 2 * Math.PI)
        dif -= 2 * Math.PI;
    while (dif <= 0)
        dif += 2 * Math.PI;
    return dif;
}