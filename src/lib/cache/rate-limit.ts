import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

type LimitResult = { success: boolean; remaining: number };

/**
 * Micro sliding-window limiter used as a local fallback when Upstash isn't
 * configured. Good enough for dev; the swap happens transparently.
 */
class MemoryWindow implements Limiter {
  private hits = new Map<string, number[]>();

  constructor(private windowMs: number, private maxCount: number) {}

  async limit(identifier: string): Promise<LimitResult> {
    const now = Date.now();
    const recent = (this.hits.get(identifier) ?? []).filter(
      (t) => now - t < this.windowMs,
    );
    this.hits.delete(identifier);
    this.hits.set(identifier, recent);
    if (recent.length >= this.maxCount) {
      return { success: false, remaining: 0 };
    }
    recent.push(now);
    this.hits.set(identifier, recent);
    return { success: true, remaining: this.maxCount - recent.length };
  }
}

type Limiter = {
  limit: (identifier: string) => Promise<LimitResult>;
};

export function getRatelimit(
  _name: string,
  { limit, windowSeconds = 60 }: { limit: number; windowSeconds?: number },
): Limiter {
  if (env.upstash.configured) {
    const rl = new Ratelimit({
      redis: new Redis({ url: env.upstash.url, token: env.upstash.token }),
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
    });
    return { limit: (id) => rl.limit(id) as Promise<LimitResult> };
  }
  return new MemoryWindow(windowSeconds * 1000, limit);
}