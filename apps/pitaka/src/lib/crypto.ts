// Encryption at rest with the browser's built-in WebCrypto.
//
// PIN --PBKDF2-SHA256 (600k iterations, random salt)--> AES-256-GCM key
// The app state is encrypted with that key. The PIN itself is never stored.
// A wrong PIN fails AES-GCM's authentication check, so no PIN hash is needed.
//
// Honest limit: a short PIN has few combinations. This stops casual access,
// but someone who copies the encrypted data can try every PIN offline.

export const KDF_ITERATIONS = 600_000; // OWASP 2023 guidance for PBKDF2-SHA256

export interface Vault {
  format: "pitaka-vault";
  v: 1;
  kdf: { name: "PBKDF2"; hash: "SHA-256"; iterations: number; salt: string };
  iv: string;
  ct: string;
  /** PIN length only (not the PIN) so the keypad can auto-submit. */
  pinLength: number;
}

const enc = new TextEncoder();
const dec = new TextDecoder();

const toB64 = (buf: ArrayBuffer | Uint8Array) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
};
const fromB64 = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

const random = (n: number) => crypto.getRandomValues(new Uint8Array(n));

export async function deriveKey(pin: string, salt: Uint8Array, iterations = KDF_ITERATIONS): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey("raw", enc.encode(pin), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations },
    base,
    { name: "AES-GCM", length: 256 },
    false, // key can't be exported from memory
    ["encrypt", "decrypt"],
  );
}

export interface VaultKey {
  key: CryptoKey;
  salt: Uint8Array;
  iterations: number;
  pinLength: number;
}

/** Create a fresh key (new random salt) from a PIN. */
export async function newVaultKey(pin: string, iterations = KDF_ITERATIONS): Promise<VaultKey> {
  const salt = random(16);
  return { key: await deriveKey(pin, salt, iterations), salt, iterations, pinLength: pin.length };
}

export async function seal(data: unknown, vk: VaultKey): Promise<Vault> {
  const iv = random(12);
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv as BufferSource }, vk.key, enc.encode(JSON.stringify(data)));
  return {
    format: "pitaka-vault",
    v: 1,
    kdf: { name: "PBKDF2", hash: "SHA-256", iterations: vk.iterations, salt: toB64(vk.salt) },
    iv: toB64(iv),
    ct: toB64(ct),
    pinLength: vk.pinLength,
  };
}

export class WrongPinError extends Error {
  constructor() {
    super("Wrong PIN");
  }
}

/** Decrypt a vault with a PIN. Returns the data and the key (kept in memory while unlocked). */
export async function open(vault: Vault, pin: string): Promise<{ data: unknown; vk: VaultKey }> {
  const salt = fromB64(vault.kdf.salt);
  const key = await deriveKey(pin, salt, vault.kdf.iterations);
  try {
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(vault.iv) as BufferSource }, key, fromB64(vault.ct) as BufferSource);
    return { data: JSON.parse(dec.decode(pt)), vk: { key, salt, iterations: vault.kdf.iterations, pinLength: pin.length } };
  } catch {
    throw new WrongPinError();
  }
}

export function isVault(x: unknown): x is Vault {
  const v = x as Partial<Vault> | null;
  return !!v && v.format === "pitaka-vault" && v.v === 1 && typeof v.ct === "string" && typeof v.iv === "string" && !!v.kdf?.salt && typeof v.kdf.iterations === "number" && v.kdf.iterations >= 1_000 && v.kdf.iterations <= 10_000_000;
}

export const isValidPin = (pin: string) => /^\d{4,6}$/.test(pin);
