import { describe, it, expect } from "vitest";
import { registerSchema, imagePathSchema } from "./validation";

function validBase() {
  return {
    name: "Nguyen Van A",
    phone: "0912345678",
    email: "test@example.com",
    dob: "2000-01-01",
    password: "password123",
  };
}

describe("registerSchema", () => {
  it("accepts a fully valid payload", () => {
    expect(registerSchema.safeParse(validBase()).success).toBe(true);
  });

  it("accepts a +84 phone number", () => {
    const result = registerSchema.safeParse({ ...validBase(), phone: "+84912345678" });
    expect(result.success).toBe(true);
  });

  it("rejects a phone number missing the valid second digit", () => {
    const result = registerSchema.safeParse({ ...validBase(), phone: "0112345678" });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({ ...validBase(), password: "short" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = registerSchema.safeParse({ ...validBase(), email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a birthdate in the future", () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const result = registerSchema.safeParse({ ...validBase(), dob: future.toISOString().slice(0, 10) });
    expect(result.success).toBe(false);
  });

  it("rejects someone under 13 years old", () => {
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
    const result = registerSchema.safeParse({ ...validBase(), dob: tenYearsAgo.toISOString().slice(0, 10) });
    expect(result.success).toBe(false);
  });
});

describe("imagePathSchema", () => {
  it("accepts a relative local path", () => {
    expect(imagePathSchema.safeParse("/images/avatar.png").success).toBe(true);
  });

  it("accepts an absolute https URL", () => {
    expect(imagePathSchema.safeParse("https://res.cloudinary.com/x/y.png").success).toBe(true);
  });

  it("rejects a bare filename with no leading slash or protocol", () => {
    expect(imagePathSchema.safeParse("avatar.png").success).toBe(false);
  });
});
