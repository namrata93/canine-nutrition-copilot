import { describe, expect, it } from "vitest";
import {
  assessCalciumPhosphorus,
  RECOMMENDED_CA_P_RANGE,
} from "../src/engine/recipe.js";

describe("calcium:phosphorus assessment", () => {
  it("flags a ratio below the range as low", () => {
    // Muscle meat with no bone is phosphorus-heavy — the classic raw-diet trap.
    expect(assessCalciumPhosphorus(0.5).status).toBe("low");
  });

  it("flags a ratio above the range as high", () => {
    // Too much bone swings it the other way.
    expect(assessCalciumPhosphorus(3.0).status).toBe("high");
  });

  it("accepts a ratio inside the range", () => {
    expect(assessCalciumPhosphorus(1.4).status).toBe("in-range");
  });

  it("treats the range boundaries as in-range", () => {
    expect(assessCalciumPhosphorus(RECOMMENDED_CA_P_RANGE.min).status).toBe(
      "in-range",
    );
    expect(assessCalciumPhosphorus(RECOMMENDED_CA_P_RANGE.max).status).toBe(
      "in-range",
    );
  });

  it("returns unknown when there is no ratio", () => {
    const assessment = assessCalciumPhosphorus(null);
    expect(assessment.status).toBe("unknown");
    expect(assessment.ratio).toBeNull();
  });
});
