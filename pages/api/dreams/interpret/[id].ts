import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateDreamInterpretation } from "@/lib/ai";
import { prisma } from "@/lib/db";
import { checkInterpretationRateLimit } from "@/lib/rate-limit";

const interpretSchema = z.object({
  includeStory: z.boolean().optional().default(true),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "未登录" });
  }

  const id = req.query.id;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "无效的梦境 ID" });
  }

  const dream = await prisma.dream.findFirst({
    where: { id, userId: session.user.id },
    include: { interpretation: true },
  });

  if (!dream) {
    return res.status(404).json({ error: "梦境不存在" });
  }

  if (dream.interpretation) {
    return res.status(200).json({ interpretation: dream.interpretation });
  }

  const rateLimit = await checkInterpretationRateLimit(session.user.id);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: `AI 解读请求过于频繁，请稍后再试（每小时上限 ${rateLimit.limit} 次）`,
    });
  }

  try {
    const parsed = interpretSchema.safeParse(req.body ?? {});
    const includeStory = parsed.success ? parsed.data.includeStory : true;

    const { result, model } = await generateDreamInterpretation({
      title: dream.title,
      content: dream.content,
      mood: dream.mood,
      tags: dream.tags,
      includeStory,
    });

    const interpretation = await prisma.interpretation.create({
      data: {
        dreamId: dream.id,
        model,
        symbols: result.symbols,
        emotions: result.emotions,
        advice: result.advice,
        story: result.story ?? null,
      },
    });

    return res.status(201).json({ interpretation });
  } catch (error) {
    console.error("Interpret dream error:", error);
    const message =
      error instanceof Error && error.message.includes("AI_API_KEY")
        ? "AI 服务未配置，请联系管理员"
        : "AI 解读失败，请稍后重试";
    return res.status(500).json({ error: message });
  }
}
