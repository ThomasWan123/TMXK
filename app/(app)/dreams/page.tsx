import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function DreamsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const dreams = userId
    ? await prisma.dream.findMany({
        where: { userId },
        include: { interpretation: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-white">梦境历史</h1>
          <p className="mt-2 text-slate-400">回顾你编织过的每一个夜晚。</p>
        </div>
        <Link href="/dashboard">
          <Button>记录新梦境</Button>
        </Link>
      </div>

      {dreams.length === 0 ? (
        <Card>
          <CardTitle>还没有梦境记录</CardTitle>
          <CardDescription className="mt-3">
            从记录第一个梦开始，让 Dreamweaver 为你点亮夜色中的线索。
          </CardDescription>
          <Link href="/dashboard" className="mt-6 inline-block">
            <Button>去记录</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {dreams.map((dream) => (
            <Card key={dream.id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>{dream.title}</CardTitle>
                  <CardDescription className="mt-2">
                    睡眠日期：{formatDate(dream.sleepDate)} · 记录于 {formatDateTime(dream.createdAt)}
                  </CardDescription>
                  <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-300">
                    {dream.content}
                  </p>
                  {dream.tags.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
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
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-200">
                    {dream.interpretation ? "已解读" : "待解读"}
                  </span>
                  <Link href={`/dreams/${dream.id}`}>
                    <Button variant="outline" size="sm">
                      查看详情
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
