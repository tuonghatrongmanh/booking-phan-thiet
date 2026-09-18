import { afterEach, describe, expect, it, vi } from "vitest";
import { authenticator } from "otplib";
import { getTwoFactorClockDelta, verifyTwoFactorToken } from "./two-factor";
import { clearFailures, isRateLimited, recordFailure } from "./rate-limit";

const secret = authenticator.generateSecret();

function tokenAt(offsetMs: number): string {
  const a = authenticator.clone({});
  a.options = { epoch: Date.now() + offsetMs };
  return a.generate(secret);
}

afterEach(() => vi.useRealTimers());

describe("verifyTwoFactorToken", () => {
  it("accepts the current code and the neighbouring 30s codes (clock skew / slow typing)", () => {
    expect(verifyTwoFactorToken(tokenAt(0), secret)).toBe(true);
    expect(verifyTwoFactorToken(tokenAt(-30_000), secret)).toBe(true);
    expect(verifyTwoFactorToken(tokenAt(30_000), secret)).toBe(true);
  });

  it("rejects codes that are 2+ steps away and garbage", () => {
    expect(verifyTwoFactorToken(tokenAt(-90_000), secret)).toBe(false);
    expect(verifyTwoFactorToken(tokenAt(90_000), secret)).toBe(false);
    expect(verifyTwoFactorToken("000000", secret)).toBe(false);
    expect(verifyTwoFactorToken("", secret)).toBe(false);
  });

  it("tolerates spaces typed into the code (Google Authenticator shows 'xxx xxx')", () => {
    const t = tokenAt(0);
    expect(verifyTwoFactorToken(`${t.slice(0, 3)} ${t.slice(3)}`, secret)).toBe(true);
  });
});

describe("getTwoFactorClockDelta", () => {
  it("reports how many 30s steps the code is off, or null when it matches nothing", () => {
    expect(getTwoFactorClockDelta(tokenAt(-90_000), secret)).toBe(-3);
    expect(getTwoFactorClockDelta(tokenAt(0), secret)).toBe(0);
    expect(getTwoFactorClockDelta("000000", secret)).toBeNull();
  });
});

describe("failure-only rate limiting", () => {
  it("blocks only after enough failures and is reset by a success", () => {
    const key = "test-login:a@b.c";
    clearFailures(key);
    for (let i = 0; i < 4; i++) recordFailure(key);
    expect(isRateLimited(key, 5, 60_000)).toBe(false);
    recordFailure(key);
    expect(isRateLimited(key, 5, 60_000)).toBe(true);
    clearFailures(key);
    expect(isRateLimited(key, 5, 60_000)).toBe(false);
  });

  it("does not count anything while nothing failed, and old failures expire", () => {
    const key = "test-login:expire";
    clearFailures(key);
    vi.useFakeTimers();
    for (let i = 0; i < 5; i++) recordFailure(key);
    expect(isRateLimited(key, 5, 60_000)).toBe(true);
    vi.advanceTimersByTime(61_000);
    expect(isRateLimited(key, 5, 60_000)).toBe(false);
  });
});
