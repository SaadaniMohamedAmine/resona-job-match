import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { db } from "@/lib/db";

const redis = Redis.fromEnv();

const freeLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "30 d"),
  prefix: "resona:analyze:free",
});

const proLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(200, "30 d"),
  prefix: "resona:analyze:pro",
});

export async function checkAnalyzeLimit(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { plan: true } });
  const limiter = user?.plan === "PRO" ? proLimiter : freeLimiter;
  return limiter.limit(userId);
}

export async function getAnalyzeQuota(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { plan: true } });
  const isPro = user?.plan === "PRO";
  const limiter = isPro ? proLimiter : freeLimiter;
  const { remaining, limit } = await limiter.getRemaining(userId);
  return { plan: isPro ? ("PRO" as const) : ("FREE" as const), remaining, limit };
}

export const globalApiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  prefix: "resona:api",
});
