"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function DashboardPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [tags, setTags] = useState("");
  const [sleepDate, setSleepDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [includeStory, setIncludeStory] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const createResponse = await fetch("/api/dreams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        mood: mood || undefined,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        sleepDate,
      }),
    });

    const createData = (await createResponse.json()) as {
      error?: string;
      dream?: { id: string };
    };

    if (!createResponse.ok || !createData.dream?.id) {
      setError(createData.error ?? "保存梦境失败");
      setLoading(false);
      return;
    }

    const interpretResponse = await fetch(
      `/api/dreams/interpret/${createData.dream.id}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ includeStory }),
      },
    );

    const interpretData = (await interpretResponse.json()) as { error?: string };

    if (!interpretResponse.ok) {
      setError(interpretData.error ?? "AI 解读失败，但梦境已保存");
      setLoading(false);
      router.push(`/dreams/${createData.dream.id}`);
      return;
    }

    router.push(`/dreams/${createData.dream.id}`);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardTitle>记录新梦境</CardTitle>
        <CardDescription className="mt-2">
          尽可能详细地描述场景、人物、情绪与醒来时的感受。
        </CardDescription>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm text-slate-300" htmlFor="title">
              梦境标题
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="漂浮的城市"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300" htmlFor="content">
              梦境内容
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="我梦见自己在一片星光下的海面上行走..."
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300" htmlFor="mood">
                情绪
              </label>
              <Input
                id="mood"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="平静、好奇"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300" htmlFor="sleepDate">
                睡眠日期
              </label>
              <Input
                id="sleepDate"
                type="date"
                value={sleepDate}
                onChange={(e) => setSleepDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300" htmlFor="tags">
              标签（逗号分隔）
            </label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="飞行, 水, 童年"
            />
          </div>
          <label className="flex items-center gap-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={includeStory}
              onChange={(e) => setIncludeStory(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-white/5"
            />
            同时生成睡前安抚故事
          </label>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <Button className="w-full" type="submit" disabled={loading}>
            <Sparkles className="h-4 w-4" />
            {loading ? "编织中..." : "保存并生成 AI 解读"}
          </Button>
        </form>
      </Card>

      <Card>
        <CardTitle>今晚的小提示</CardTitle>
        <CardDescription className="mt-4 leading-7">
          记录梦境时，不必追求完整剧情。几个鲜明的画面、一种情绪、一个反复出现的符号，往往就足够开启有意义的自我探索。
        </CardDescription>
        <div className="mt-6 rounded-xl border border-violet-300/20 bg-violet-400/10 p-4 text-sm leading-7 text-violet-100">
          Dreamweaver 的内容仅供自我探索与娱乐参考，不能替代专业医疗或心理咨询。
        </div>
      </Card>
    </div>
  );
}
