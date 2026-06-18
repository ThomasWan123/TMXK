"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "注册失败");
      setLoading(false);
      return;
    }

    router.push("/login");
  }

  return (
    <Card>
      <CardTitle>创建账号</CardTitle>
      <CardDescription className="mt-2">开启你的 AI 梦境编织之旅。</CardDescription>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm text-slate-300" htmlFor="name">
            昵称
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="梦境旅人"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-300" htmlFor="email">
            邮箱
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-300" htmlFor="password">
            密码
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? "注册中..." : "注册"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        已有账号？{" "}
        <Link href="/login" className="text-violet-300 hover:text-violet-200">
          去登录
        </Link>
      </p>
    </Card>
  );
}
