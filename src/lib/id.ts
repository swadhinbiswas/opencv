import "server-only";
import { createId } from "@paralleldrive/cuid2";

let fallbackSeq = 1000;

/**
 * Stable, collision-safe ID generator using cuid2 with a short human
 * prefix (e.g. "usr_xxxx"). Falls back to a monotonic counter only if
 * the cuid engine is unavailable.
 */
export function genId(prefix: string): string {
  let core: string;
  try {
    core = createId();
  } catch {
    core = `fb${((fallbackSeq++) % 1e9).toString(36)}${Date.now().toString(36)}`;
  }
  return `${prefix}_${core}`;
}