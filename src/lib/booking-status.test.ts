import { describe, expect, it } from "vitest";
import { CLAIM_COOLDOWN_MS, MAX_PAYMENT_CLAIMS, checkCanReportPaid, isDepositExpired } from "./booking-status";

const NOW = Date.UTC(2026, 8, 19, 12, 0, 0);
const base = { paymentClaimCount: 0, customerReportedPaidAt: null, paymentClaimRejectedAt: null };

describe("checkCanReportPaid", () => {
  it("allows the first report", () => {
    expect(checkCanReportPaid(base, NOW)).toEqual({ ok: true });
  });

  it("blocks while a previous report is still awaiting the admin", () => {
    const r = checkCanReportPaid({ ...base, paymentClaimCount: 1, customerReportedPaidAt: new Date(NOW - 1000) }, NOW);
    expect(r.ok).toBe(false);
  });

  it("forces a cool-down after the admin said the money has not arrived", () => {
    const rejected = new Date(NOW - 60_000);
    const early = checkCanReportPaid({ ...base, paymentClaimCount: 1, paymentClaimRejectedAt: rejected }, NOW);
    expect(early.ok).toBe(false);
    const later = checkCanReportPaid(
      { ...base, paymentClaimCount: 1, paymentClaimRejectedAt: new Date(NOW - CLAIM_COOLDOWN_MS - 1000) },
      NOW
    );
    expect(later).toEqual({ ok: true });
  });

  it("stops accepting reports after the maximum number of tries", () => {
    const r = checkCanReportPaid(
      { ...base, paymentClaimCount: MAX_PAYMENT_CLAIMS, paymentClaimRejectedAt: new Date(NOW - 3_600_000) },
      NOW
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain("liên hệ");
  });
});

describe("isDepositExpired", () => {
  it("expires an unpaid order after 24 hours", () => {
    expect(isDepositExpired(new Date(NOW - 23 * 3_600_000), NOW)).toBe(false);
    expect(isDepositExpired(new Date(NOW - 25 * 3_600_000), NOW)).toBe(true);
  });
});
