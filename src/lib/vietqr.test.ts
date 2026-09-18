import { describe, expect, it } from "vitest";
import { bankLabelForBin, buildVietQrImageUrl, generateDepositRef } from "./vietqr";

describe("buildVietQrImageUrl", () => {
  it("builds a vietqr.io image url with amount, message and account name", () => {
    const url = new URL(
      buildVietQrImageUrl({
        bankBin: "970407",
        accountNumber: "1903123456",
        accountName: "NGUYEN VAN A",
        amount: 100000,
        message: "BPTABC234",
      })
    );
    expect(url.origin).toBe("https://img.vietqr.io");
    expect(url.pathname).toBe("/image/970407-1903123456-compact2.png");
    expect(url.searchParams.get("amount")).toBe("100000");
    expect(url.searchParams.get("addInfo")).toBe("BPTABC234");
    expect(url.searchParams.get("accountName")).toBe("NGUYEN VAN A");
  });

  it("rounds fractional amounts to whole dong", () => {
    const url = new URL(
      buildVietQrImageUrl({ bankBin: "970422", accountNumber: "1", accountName: "A", amount: 99999.6, message: "X" })
    );
    expect(url.searchParams.get("amount")).toBe("100000");
  });
});

describe("generateDepositRef", () => {
  it("always returns BPT + 6 unambiguous characters", () => {
    for (let i = 0; i < 200; i++) {
      expect(generateDepositRef()).toMatch(/^BPT[A-HJ-NP-Z2-9]{6}$/);
    }
  });

  it("is effectively unique across many calls", () => {
    const seen = new Set(Array.from({ length: 500 }, () => generateDepositRef()));
    expect(seen.size).toBeGreaterThan(495);
  });
});

describe("bankLabelForBin", () => {
  it("resolves known BINs and falls back to the raw BIN", () => {
    expect(bankLabelForBin("970407")).toBe("Techcombank");
    expect(bankLabelForBin("000000")).toBe("000000");
  });
});
