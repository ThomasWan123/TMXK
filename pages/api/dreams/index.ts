import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { dreamSchema } from "@/lib/validators";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "未登录" });
  }

  if (req.method === "GET") {
    const dreams = await prisma.dream.findMany({
      where: { userId: session.user.id },
      include: { interpretation: true },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ dreams });
  }

  if (req.method === "POST") {
    try {
      const parsed = dreamSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          error: parsed.error.errors[0]?.message ?? "输入无效",
        });
      }

      const dream = await prisma.dream.create({
        data: {
          userId: session.user.id,
          title: parsed.data.title.trim(),
          content: parsed.data.content.trim(),
          mood: parsed.data.mood?.trim() || null,
          tags: parsed.data.tags ?? [],
          sleepDate: new Date(parsed.data.sleepDate),
        },
      });

      return res.status(201).json({ dream });
    } catch (error) {
      console.error("Create dream error:", error);
      return res.status(500).json({ error: "保存梦境失败" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
