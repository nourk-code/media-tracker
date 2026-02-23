// Simple in-memory rate limiter: 12 requests per minute per user
const requestLog = new Map<string, number[]>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 12;

export function checkRateLimit(userId: string): {
  allowed: boolean;
  retryAfter?: number;
} {
  const now = Date.now();
  const timestamps = (requestLog.get(userId) ?? []).filter(
    (t) => now - t < WINDOW_MS
  );

  if (timestamps.length >= MAX_REQUESTS) {
    const oldest = timestamps[0];
    const retryAfter = Math.ceil((oldest + WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfter };
  }

  timestamps.push(now);
  requestLog.set(userId, timestamps);
  return { allowed: true };
}
