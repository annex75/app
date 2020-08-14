export const lerp = (p1: [number, number], p2: [number, number], x: number) => {
  const [ x1, y1 ] = p1;
  const [ x2, y2 ] = p2;
  return (y1*(x2-x)+y2*(x-x1))/(x2-x1);
}

export const monotonicIncreasing = (array: number[], strict: boolean = false) => {
  for (let i = 0; i < array.length - 1; i++) {
    const condition = strict? array[i+1] <= array[i]: array[i+1] < array[i];
    if (condition) {
      return false;
    }
  }
  return true;
}

export const extractInterpolatedValueFromCurves = (xc: number[], yc: number[], x: number) => {
  if (!xc.length || xc.length !== yc.length) {
    throw new Error("Curves for interpolation must have same non-zero length");
  }

  if (!monotonicIncreasing(xc, true) || !monotonicIncreasing(yc)) {
    throw new Error ("Curves for interpolation must be monotonic increasing");
  }

  if (x <= xc[0]) {
    return yc[0];
  } 
  for (let i = 0; i < xc.length - 1; i++) {
    if (x >= xc[i]) {
      return lerp([xc[i], yc[i]], [xc[i+1], yc[i+1]], x, );
    }
  }
  return yc[yc.length-1];
}