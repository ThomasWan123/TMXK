import { prisma } from "@/lib/db";

const DEFAULT_LIMIT = Number(process.env.AI_RATE_LIMIT_PER_HOUR ?? 10);

export async function checkInterpretationRateLimit(userId: string) {
  const since = new Date(Date.now() - 60 * 60 * 1000);

  const count = await prisma.interpretation.count({
    where: {
      dream: { userId },
      createdAt: { gte: since },
    },
  });

  if (count >= DEFAULT_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      limit: DEFAULT_LIMIT,
    };
  }

  return {
    allowed: true,
    remaining: DEFAULT_LIMIT - count,
    limit: DEFAULT_LIMIT,
  };
}
