import { describe, expect, it } from "vitest";
import { maskEmail, maskPhone } from "./mask";

describe("maskPhone", () => {
  it("giữ 3 số đầu và 2 số cuối", () => {
    expect(maskPhone("0912345678")).toBe("091•••••78");
  });
  it("số quá ngắn thì che hết", () => {
    expect(maskPhone("1234")).toBe("••••");
  });
});

describe("maskEmail", () => {
  it("giữ ký tự đầu và tên miền", () => {
    expect(maskEmail("nguyenvana@gmail.com")).toBe("n•••••••••@gmail.com");
  });
  it("tên quá ngắn vẫn che tối thiểu 3 ký tự", () => {
    expect(maskEmail("ab@x.vn")).toBe("a•••@x.vn");
  });
  it("không có @ thì che phần lớn", () => {
    expect(maskEmail("abc")).toBe("•••");
  });
});
