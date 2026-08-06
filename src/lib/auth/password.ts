import "server-only";

/**
 * Password hashing for the built-in (non-Firebase) auth path.
 * PBKDF2-SHA256 via Web Crypto — runs on Node, Edge and Cloudflare Workers.
 *
 * Stored format: `pbkdf2:<iterations>:<saltB64>:<hashB64>`
 */

const ITERATIONS = 100_000;
const KEY_LENGTH_BYTES = 32;
const SALT_BYTES = 16;
const VERSION = "pbkdf2";

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function derive(password: string, salt: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations: ITERATIONS,
    },
    keyMaterial,
    KEY_LENGTH_BYTES * 8,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await derive(password, salt);
  return `${VERSION}:${ITERATIONS}:${toBase64(salt)}:${toBase64(hash)}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [version, iterationsStr, saltB64, hashB64] = stored.split(":");
  if (version !== VERSION) return false;
  const iterations = Number(iterationsStr);
  if (!Number.isFinite(iterations)) return false;
  try {
    const expected = fromBase64(hashB64);
    const actual = await derive(password, fromBase64(saltB64));
    if (expected.length !== actual.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected[i] ^ actual[i];
    return diff === 0;
  } catch {
    return false;
  }
}
