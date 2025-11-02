import { logger } from "./logger";

interface RateLimitStore {
  count: number;
  resetAt: number;
}

// In-memory rate limiter (for production, consider Redis)
const rateLimitMap = new Map<string, RateLimitStore>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the rate limit (e.g., user ID, IP address)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const store = rateLimitMap.get(identifier);

  // If no store exists or the window has expired, create a new one
  if (!store || now > store.resetAt) {
    const newStore: RateLimitStore = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    rateLimitMap.set(identifier, newStore);

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: newStore.resetAt,
    };
  }

  // Check if the request exceeds the limit
  if (store.count >= config.maxRequests) {
    logger.warn(
      { identifier, count: store.count, limit: config.maxRequests },
      "Rate limit exceeded"
    );

    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: store.resetAt,
    };
  }

  // Increment the count
  store.count += 1;
  rateLimitMap.set(identifier, store);

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - store.count,
    reset: store.resetAt,
  };
}

/**
 * Clean up expired rate limit entries (run periodically)
 */
export function cleanupRateLimits() {
  const now = Date.now();
  let cleaned = 0;

  const entries = Array.from(rateLimitMap.entries());
  for (const [key, store] of entries) {
    if (now > store.resetAt) {
      rateLimitMap.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    logger.debug({ cleaned }, "Cleaned up expired rate limit entries");
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}
