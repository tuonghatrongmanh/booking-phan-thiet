import { describe, expect, it } from "vitest";
import { evaluateCarAvailability, evaluateStayAvailability, type PaidStayRow } from "./booking-availability";
import { computeCarDeposit, computeStayDeposit } from "./booking-deposit";
import { buildCustomerMessage } from "./booking-message";

describe("computeCarDeposit", () => {
  it("multiplies the per-vehicle deposit by the number of vehicles", () => {
    expect(computeCarDeposit({ placeDepositVnd: 150_000, defaultDepositVnd: 100_000, quantity: 4 })).toBe(600_000);
  });
  it("falls back to the default deposit per vehicle", () => {
    expect(computeCarDeposit({ placeDepositVnd: null, defaultDepositVnd: 100_000, quantity: 2 })).toBe(200_000);
  });
});

describe("computeStayDeposit", () => {
  it("uses the chosen package deposit x rooms", () => {
    expect(computeStayDeposit({ optionDepositVnd: 200_000, placeDepositVnd: 999, defaultDepositVnd: 1, quantity: 3 })).toBe(600_000);
  });
  it("uses a flat whole-property deposit when there are no packages", () => {
    expect(computeStayDeposit({ optionDepositVnd: null, placeDepositVnd: 500_000, defaultDepositVnd: 100_000, quantity: 1 })).toBe(500_000);
    expect(computeStayDeposit({ optionDepositVnd: null, placeDepositVnd: null, defaultDepositVnd: 100_000, quantity: 1 })).toBe(100_000);
  });
});

describe("evaluateCarAvailability", () => {
  it("allows booking while enough vehicles remain", () => {
    expect(evaluateCarAvailability([{ quantity: 2 }], 5, 3)).toEqual({ ok: true });
  });
  it("reports how many vehicles remain when the request is too large", () => {
    const res = evaluateCarAvailability([{ quantity: 2 }], 5, 4);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.message).toContain("còn 3 xe");
  });
  it("rejects when everything is already taken", () => {
    expect(evaluateCarAvailability([{ quantity: 1 }], 1, 1).ok).toBe(false);
  });
});

const room = (optionId: string, quantity: number): PaidStayRow => ({ optionId, optionLabel: "Phòng", optionWhole: false, quantity });
const whole: PaidStayRow = { optionId: "w", optionLabel: "Nguyên căn", optionWhole: true, quantity: 1 };
const legacy: PaidStayRow = { optionId: null, optionLabel: null, optionWhole: false, quantity: 1 };
const single = { id: "single", maxUnits: 3, wholeProperty: false };
const villa = { id: "w", maxUnits: 1, wholeProperty: true };

describe("evaluateStayAvailability", () => {
  it("allows a room type until its rooms run out", () => {
    expect(evaluateStayAvailability([room("single", 2)], single, 1)).toEqual({ ok: true });
    expect(evaluateStayAvailability([room("single", 2)], single, 2).ok).toBe(false);
    expect(evaluateStayAvailability([room("single", 3)], single, 1).ok).toBe(false);
  });
  it("does not let other room types use up this type's rooms", () => {
    expect(evaluateStayAvailability([room("double", 5)], single, 3)).toEqual({ ok: true });
  });
  it("a whole-property booking blocks every room type and vice versa", () => {
    expect(evaluateStayAvailability([whole], single, 1).ok).toBe(false);
    expect(evaluateStayAvailability([room("single", 1)], villa, 1).ok).toBe(false);
    expect(evaluateStayAvailability([], villa, 1)).toEqual({ ok: true });
  });
  it("legacy bookings without a package and places without packages act as whole-property", () => {
    expect(evaluateStayAvailability([legacy], single, 1).ok).toBe(false);
    expect(evaluateStayAvailability([legacy], null, 1).ok).toBe(false);
    expect(evaluateStayAvailability([room("single", 1)], null, 1).ok).toBe(false);
    expect(evaluateStayAvailability([], null, 1)).toEqual({ ok: true });
  });
});

describe("buildCustomerMessage", () => {
  const base = {
    customerName: "An",
    placeName: "Villa Biển",
    dateText: "18/10 - 20/10",
    detailText: "Phòng đôi x 2",
    depositAmount: 600_000,
    depositRef: "BPTABC234",
    cancelled: false,
  };
  it("asks for the deposit while it is pending", () => {
    const msg = buildCustomerMessage({ ...base, depositStatus: "PENDING" });
    expect(msg).toContain("600.000đ");
    expect(msg).toContain("BPTABC234");
  });
  it("confirms once the deposit is paid and says cancelled when cancelled", () => {
    expect(buildCustomerMessage({ ...base, depositStatus: "PAID" })).toContain("đã nhận cọc");
    expect(buildCustomerMessage({ ...base, depositStatus: "PAID", cancelled: true })).toContain("huỷ");
  });
});
