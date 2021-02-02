// linear interpolation
export const lerp = (p1: [number, number], p2: [number, number], x: number) => {
  const [ x1, y1 ] = p1;
  const [ x2, y2 ] = p2;
  return (y1*(x2-x)+y2*(x-x1))/(x2-x1);
}

// checks if an array of numbers is monotonic increasing alt. strictly monotonic increasing
export const monotonicIncreasing = (array: number[], strict: boolean = false) => {
  if (strict && array.length < 2) {
    return false;
  }
  for (let i = 0; i < array.length - 1; i++) {
    const condition = strict? array[i+1] <= array[i]: array[i+1] < array[i];
    if (condition) {
      return false;
    }
  }
  return true;
}

// extracts an interpolated value from two arrays xc and yc
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
    if (x < xc[i+1]) {
      return lerp([xc[i], yc[i]], [xc[i+1], yc[i+1]], x, );
    } else if (x === xc[i+1]) {
      return yc[i+1];
    }
  }
  return yc[yc.length-1];
}