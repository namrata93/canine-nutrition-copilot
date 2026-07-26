import { describe, expect, it } from "vitest";
import { toGrams, per100gScale, isMassUnit } from "../src/engine/units.js";

describe("unit conversion", () => {
  it("converts each supported unit to grams", () => {
    expect(toGrams(100, "g")).toBe(100);
    expect(toGrams(500, "mg")).toBe(0.5);
    expect(toGrams(2, "kg")).toBe(2000);
    expect(toGrams(1, "oz")).toBeCloseTo(28.3495, 4);
    expect(toGrams(1, "lb")).toBeCloseTo(453.592, 3);
  });

  it("treats zero as a valid amount", () => {
    expect(toGrams(0, "g")).toBe(0);
  });

  it("scales per-100g values proportionally", () => {
    expect(per100gScale(100, "g")).toBe(1);
    expect(per100gScale(150, "g")).toBeCloseTo(1.5, 10);
    expect(per100gScale(50, "g")).toBeCloseTo(0.5, 10);
  });
});

describe("input validation", () => {
  it("recognizes supported mass units", () => {
    expect(isMassUnit("g")).toBe(true);
    expect(isMassUnit("oz")).toBe(true);
    expect(isMassUnit("cups")).toBe(false);
  });

  it("rejects an unsupported unit", () => {
    // @ts-expect-error - deliberately passing an invalid unit
    expect(() => toGrams(100, "cups")).toThrow(/Unsupported unit/);
  });

  it("rejects negative amounts", () => {
    expect(() => toGrams(-5, "g")).toThrow(/negative/);
  });

  it("rejects non-finite amounts", () => {
    expect(() => toGrams(NaN, "g")).toThrow(/finite/);
    expect(() => toGrams(Infinity, "g")).toThrow(/finite/);
  });
});
