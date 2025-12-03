import { areArraysEqual } from "./areArraysEqual";

describe("areArraysEqual", () => {
  it("returns true for identical array references", () => {
    const arr = [1, 2, 3];
    expect(areArraysEqual(arr, arr)).toBe(true);
  });

  it("returns true for arrays with same elements", () => {
    expect(areArraysEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(areArraysEqual(["a", "b"], ["a", "b"])).toBe(true);
    expect(areArraysEqual([], [])).toBe(true);
  });

  it("returns false for arrays with different lengths", () => {
    expect(areArraysEqual([1, 2], [1, 2, 3])).toBe(false);
    expect(areArraysEqual([1, 2, 3], [1, 2])).toBe(false);
  });

  it("returns false for arrays with different elements", () => {
    expect(areArraysEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    expect(areArraysEqual(["a", "b"], ["a", "c"])).toBe(false);
  });

  it("returns false when one array is null", () => {
    expect(areArraysEqual(null as any, [1, 2])).toBe(false);
    expect(areArraysEqual([1, 2], null as any)).toBe(false);
  });

  it("returns true when both arrays are null (referential equality)", () => {
    // Both being null means they're equal by reference (null === null)
    expect(areArraysEqual(null as any, null as any)).toBe(true);
  });
});
