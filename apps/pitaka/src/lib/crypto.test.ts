import { describe, expect, it } from "vitest";
import { isValidPin, isVault, newVaultKey, open, seal, WrongPinError } from "./crypto";

// Low iteration count keeps tests fast; production uses KDF_ITERATIONS.
const IT = 1_000;

describe("vault encryption", () => {
  it("round-trips data with the right PIN", async () => {
    const vk = await newVaultKey("123456", IT);
    const vault = await seal({ hello: "pitaka", n: 42 }, vk);
    expect(isVault(vault)).toBe(true);
    expect(vault.ct).not.toContain("pitaka"); // nothing readable at rest
    const { data } = await open(vault, "123456");
    expect(data).toEqual({ hello: "pitaka", n: 42 });
  });

  it("rejects a wrong PIN", async () => {
    const vault = await seal({ a: 1 }, await newVaultKey("1234", IT));
    await expect(open(vault, "1235")).rejects.toBeInstanceOf(WrongPinError);
  });

  it("uses a fresh IV per save", async () => {
    const vk = await newVaultKey("1234", IT);
    const a = await seal({ a: 1 }, vk);
    const b = await seal({ a: 1 }, vk);
    expect(a.iv).not.toBe(b.iv);
    expect(a.ct).not.toBe(b.ct);
  });

  it("validates PIN format", () => {
    expect(isValidPin("1234")).toBe(true);
    expect(isValidPin("123456")).toBe(true);
    expect(isValidPin("123")).toBe(false);
    expect(isValidPin("12a4")).toBe(false);
  });
});
