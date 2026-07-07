import Link from "next/link";
import { Brain, BookOpen, MoonStar, Sparkles, Stars, Wand2 } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: MoonStar,
    title: "记录夜间梦境",
    description: "用温柔的方式保存你的梦境片段、情绪与标签，建立属于自己的梦境档案。",
  },
  {
    icon: Brain,
    title: "AI 象征解读",
    description: "从象征、情绪与潜意识角度给出诗意而克制的解读，不做医学诊断。",
  },
  {
    icon: BookOpen,
    title: "睡前安抚故事",
    description: "根据梦境生成轻柔的睡前故事，帮助你以更平静的状态进入睡眠。",
  },
];

const steps = [
  "注册账号并登录",
  "记录昨晚的梦境",
  "一键生成 AI 解读",
  "在历史中回顾与收藏",
];

export default function HomePage() {
  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/10 px-4 py-1 text-sm text-violet-200">
              <Stars className="h-4 w-4" />
              AI Nighttime Dream Weaver
            </div>
            <h1 className="font-display text-4xl font-semibold leading-tight text-white sm:text-6xl">
              在夜色里，温柔地读懂你的梦
            </h1>
            <p className="mt-6 text-lg text-slate-300 sm:text-xl">
              Dreamweaver 帮你记录梦境、探索象征意义，并生成令人安心的睡前故事。
              让每一次醒来，都多一点点自我理解。
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="lg">
                  <Sparkles className="h-4 w-4" />
                  开始编织梦境
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  已有账号，登录
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title}>
                <feature.icon className="mb-4 h-8 w-8 text-violet-300" />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription className="mt-3 leading-7">{feature.description}</CardDescription>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <Card className="overflow-hidden">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-violet-300">How it works</p>
                <h2 className="font-display mt-3 text-3xl font-semibold text-white">四步开启你的梦境之旅</h2>
                <ol className="mt-6 space-y-4">
                  {steps.map((step, index) => (
                    <li key={step} className="flex items-center gap-4 text-slate-300">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20 text-sm font-semibold text-violet-200">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/20 to-cyan-400/10 p-8">
                <Wand2 className="h-10 w-10 text-violet-200" />
                <p className="mt-6 text-lg leading-8 text-slate-200">
                  “昨夜我梦见自己在漂浮的城市里行走，Dreamweaver 帮我看见了那份对自由的渴望。”
                </p>
                <p className="mt-4 text-sm text-slate-400">— 来自一位早期体验者</p>
              </div>
            </div>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
