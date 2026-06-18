import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate, formatDateTime } from "@/lib/utils";
import { InterpretButton } from "@/components/interpret-button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

interface DreamDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DreamDetailPage({ params }: DreamDetailPageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    notFound();
  }

  const dream = await prisma.dream.findFirst({
    where: { id, userId },
    include: { interpretation: true },
  });

  if (!dream) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/dreams" className="text-sm text-violet-300 hover:text-violet-200">
            ← 返回历史
          </Link>
          <h1 className="font-display mt-3 text-3xl font-semibold text-white">{dream.title}</h1>
          <p className="mt-2 text-slate-400">
            睡眠日期：{formatDate(dream.sleepDate)} · 记录于 {formatDateTime(dream.createdAt)}
          </p>
        </div>
        {!dream.interpretation ? (
          <InterpretButton dreamId={dream.id} />
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>梦境原文</CardTitle>
          <CardDescription className="mt-2">
            {dream.mood ? `情绪：${dream.mood}` : "情绪：未填写"}
          </CardDescription>
          <p className="mt-4 whitespace-pre-wrap leading-8 text-slate-200">{dream.content}</p>
          {dream.tags.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {dream.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </Card>

        {dream.interpretation ? (
          <div className="space-y-4">
            <Card>
              <CardTitle>象征解读</CardTitle>
              <p className="mt-4 whitespace-pre-wrap leading-8 text-slate-200">
                {dream.interpretation.symbols}
              </p>
            </Card>
            <Card>
              <CardTitle>情绪洞察</CardTitle>
              <p className="mt-4 whitespace-pre-wrap leading-8 text-slate-200">
                {dream.interpretation.emotions}
              </p>
            </Card>
            <Card>
              <CardTitle>温柔建议</CardTitle>
              <p className="mt-4 whitespace-pre-wrap leading-8 text-slate-200">
                {dream.interpretation.advice}
              </p>
            </Card>
            {dream.interpretation.story ? (
              <Card>
                <CardTitle>睡前故事</CardTitle>
                <p className="mt-4 whitespace-pre-wrap leading-8 text-slate-200">
                  {dream.interpretation.story}
                </p>
              </Card>
            ) : null}
          </div>
        ) : (
          <Card>
            <CardTitle>等待 AI 编织</CardTitle>
            <CardDescription className="mt-3 leading-7">
              这条梦境还没有生成解读。你可以点击上方按钮，让 Dreamweaver 为你展开象征与情绪的线索。
            </CardDescription>
            <InterpretButton dreamId={dream.id} className="mt-6" />
          </Card>
        )}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
        免责声明：以上内容由 AI 生成，仅供自我探索与娱乐参考，不构成医学或心理诊断建议。
      </div>
    </div>
  );
}
