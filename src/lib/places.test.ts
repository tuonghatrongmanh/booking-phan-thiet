import { describe, it, expect } from "vitest";
import { avgOf, availabilityLabel } from "./places";

describe("avgOf", () => {
  it("returns 0 for an empty array", () => {
    expect(avgOf([])).toBe(0);
  });

  it("computes the average of ratings", () => {
    expect(avgOf([5, 4, 3])).toBe(4);
  });

  it("handles a single value", () => {
    expect(avgOf([4.5])).toBe(4.5);
  });
});

describe("availabilityLabel", () => {
  it("labels HOLDING the same for room and vehicle", () => {
    expect(availabilityLabel("HOLDING", "room")).toBe("Đang được giữ chỗ");
    expect(availabilityLabel("HOLDING", "vehicle")).toBe("Đang được giữ chỗ");
  });

  it("labels AVAILABLE differently for room vs vehicle", () => {
    expect(availabilityLabel("AVAILABLE", "room")).toBe("Còn phòng");
    expect(availabilityLabel("AVAILABLE", "vehicle")).toBe("Còn xe");
  });

  it("labels UNAVAILABLE differently for room vs vehicle", () => {
    expect(availabilityLabel("UNAVAILABLE", "room")).toBe("Hết phòng");
    expect(availabilityLabel("UNAVAILABLE", "vehicle")).toBe("Hết xe");
  });
});
