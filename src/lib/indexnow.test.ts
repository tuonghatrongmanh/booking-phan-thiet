import { afterEach, describe, expect, it, vi } from "vitest";
import { getIndexNowKey, placePublicUrl, newsPublicUrl, foodPublicUrl, pingIndexNow } from "./indexnow";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("getIndexNowKey", () => {
  it("is null without a secret", () => {
    vi.stubEnv("NEXTAUTH_SECRET", "");
    expect(getIndexNowKey()).toBeNull();
  });

  it("is a stable 32-char hex string derived from the secret", () => {
    vi.stubEnv("NEXTAUTH_SECRET", "secret-a");
    const a = getIndexNowKey();
    expect(a).toMatch(/^[a-f0-9]{32}$/);
    expect(getIndexNowKey()).toBe(a);
    vi.stubEnv("NEXTAUTH_SECRET", "secret-b");
    expect(getIndexNowKey()).not.toBe(a);
  });
});

describe("public url helpers", () => {
  it("maps each content type to its public page", () => {
    expect(newsPublicUrl("bai-viet")).toMatch(/\/tin-tuc\/bai-viet$/);
    expect(foodPublicUrl("banh-xeo")).toMatch(/\/am-thuc\/mon\/banh-xeo$/);
    expect(placePublicUrl({ id: "p1", category: "HOMESTAY" })).toMatch(/\/luu-tru\/p1$/);
    expect(placePublicUrl({ id: "p2", category: "ATTRACTION" })).toMatch(/\/diem-tham-quan\/p2$/);
    expect(placePublicUrl({ id: "p3", category: "SALE" })).toMatch(/\/sale\/p3$/);
  });

  it("skips hidden places and categories without a detail page", () => {
    expect(placePublicUrl({ id: "p1", category: "HOMESTAY", hidden: true })).toBeNull();
    expect(placePublicUrl({ id: "p4", category: "CAR_RENTAL" })).toBeNull();
    expect(placePublicUrl({ id: "p5", category: "RESTAURANT" })).toBeNull();
  });
});

describe("pingIndexNow", () => {
  it("never calls out when not in production", () => {
    vi.stubEnv("NEXTAUTH_SECRET", "secret-a");
    vi.stubEnv("NODE_ENV", "development");
    const spy = vi.spyOn(globalThis, "fetch");
    pingIndexNow(["https://bookingphanthiet.com/tin-tuc/x"]);
    expect(spy).not.toHaveBeenCalled();
  });

  it("posts a deduplicated batch in production and throttles repeats", () => {
    vi.stubEnv("NEXTAUTH_SECRET", "secret-a");
    vi.stubEnv("NODE_ENV", "production");
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 200 }));
    const url = "https://bookingphanthiet.com/tin-tuc/throttle-test";
    pingIndexNow([url, url, null]);
    expect(spy).toHaveBeenCalledTimes(1);
    const body = JSON.parse((spy.mock.calls[0][1] as RequestInit).body as string);
    expect(body.urlList).toEqual([url]);
    expect(body.host).toBe("bookingphanthiet.com");
    expect(body.keyLocation).toBe(`https://bookingphanthiet.com/${body.key}.txt`);
    pingIndexNow([url]);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
