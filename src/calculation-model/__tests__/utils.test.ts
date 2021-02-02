import { lerp, monotonicIncreasing, extractInterpolatedValueFromCurves, } from '../utils';

describe('lerp', () => {
  it.each([
    [[0, 0], [1, 1], 0.5, 0.5],
    [[0, 0], [1, 1], 0.25, 0.25],
    [[0, 0], [1, 1], 1.25, 1.25],
    [[1, 1], [0, 0], 0.25, 0.25],
    [[-1, 1], [0, 0], 0.25, -0.25],
    [[0, 1], [0, 1], 0.25, NaN],
  ])('correctly interpolates %s', (p1, p2, x, expectedY) => {
    const y = lerp(p1 as [number, number], p2 as [number, number], x);
    expect(y).toEqual(expectedY);
  });
});

describe('monotonicIncreasing', () => {
  it.each([
    [[0, 1], true, true],
    [[0], false, true],
    [[0], true, false],
    [[0, 0], true, false],
    [[0, 0], false, true],
    [[1, 0], true, false],
    [[1, 0], false, false],
  ])('correctly determines if an array is monotonic increasing %s', (arr, strict, expected) => {
    const increasing = monotonicIncreasing(arr, strict)
    expect(increasing).toEqual(expected);
  });
});

describe('extractInterpolatedValueFromCurves', () => {
  it.each([
    [[0, 1], [0, 2], 0.5, 1],
    [[0, 1], [1, 1], 0.5, 1],
    [[0, 2], [0, 1], 1, 0.5],
    [[0, 1], [0, 1], 0.25, 0.25],
    [[0, 1, 2], [0, 1, 2], 1.5, 1.5],
    [[0, 1, 1.5], [0, 1, 2], 1.25, 1.5],
    [[0, 1], [0, 1], 2, 1],
    [[0, 1], [0, 1], -1, 0],
  ])('correctly extracts interpolated value from curves', (xc, yc, x, expectedY) => {
    const y = extractInterpolatedValueFromCurves(xc, yc, x);
    expect(y).toEqual(expectedY);
  });

  it.each([
    [[0, 0], [0, 1], 0.5],
    [[2, 0], [0, 1], 1],
    [[0, 1], [1, 0], 1],
    [[0, 1, 0.5], [0, 1, 2], 1],
    [[], [], 0],
    [[0, 1], [1, 2, 3], 2],
  ])('correctly identifies incorrect indata', (xc, yc, x) => {
    expect(() => extractInterpolatedValueFromCurves(xc, yc, x)).toThrow();
  });
});