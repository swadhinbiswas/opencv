import "server-only";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

/**
 * Cache adapter abstraction. Backs onto Upstash Redis when configured,
 * otherwise falls back to a tiny process-local LRU-style map (dev only).
 *
 * The public surface is intentionally minimal (get/set/del) so the two
 * backends are interchangeable.
 */
type Stored = string | Record<string, unknown> | unknown[] | number | boolean;

export abstract class CacheAdapter {
  abstract get(key: string): Promise<Stored | null>;
  abstract set(key: string, value: Stored, ttlSeconds?: number): Promise<void>;
  abstract del(key: string): Promise<void>;
}

class MemoryAdapter extends CacheAdapter {
  private store = new Map<string, { value: Stored; expiresAt: number | null }>();

  async get(key: string): Promise<Stored | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt !== null && entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: Stored, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}

class UpstashAdapter extends CacheAdapter {
  private redis: Redis;

  constructor() {
    super();
    this.redis = new Redis({
      url: env.upstash.url,
      token: env.upstash.token,
    });
  }

  async get(key: string): Promise<Stored | null> {
    return (await this.redis.get(key)) ?? null;
  }
  async set(key: string, value: Stored, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) await this.redis.set(key, value, { ex: ttlSeconds });
    else await this.redis.set(key, value);
  }
  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}

export const cache: CacheAdapter = env.upstash.configured
  ? new UpstashAdapter()
  : new MemoryAdapter();

// Collision-safe prefixing for user-scoped keys.
export const key = (scope: string, ...parts: string[]) =>
  [scope, ...parts].join(":");