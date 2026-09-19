import { describe, expect, it } from "vitest";
import { pageNumbers } from "./pagination";

describe("pageNumbers", () => {
  it("ít trang thì hiện hết", () => {
    expect(pageNumbers(1, 3)).toEqual([1, 2, 3]);
  });
  it("nhiều trang thì rút gọn bằng dấu ba chấm quanh trang hiện tại", () => {
    expect(pageNumbers(6, 12)).toEqual([1, "gap", 5, 6, 7, "gap", 12]);
    expect(pageNumbers(1, 12)).toEqual([1, 2, "gap", 12]);
    expect(pageNumbers(12, 12)).toEqual([1, "gap", 11, 12]);
  });
});
