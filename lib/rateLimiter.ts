// lib/rateLimiter.ts
const attempts = new Map<string, { count: number; expires: number }>();

export function checkRateLimit(ip: string) {
  const now = Date.now();
  const entry = attempts.get(ip);

  if (entry && entry.expires > now) {
    if (entry.count >= 15) {
      throw new Error("Too many failed attempts from this IP. Try again later.");
    }
    entry.count++;
  } else {
    attempts.set(ip, { count: 1, expires: now + 15 * 60 * 1000 });
  }
}

export function resetRateLimit(ip: string) {
  attempts.delete(ip);
}