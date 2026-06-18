"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InterpretButtonProps {
  dreamId: string;
  className?: string;
}

export function InterpretButton({ dreamId, className }: InterpretButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleInterpret() {
    setLoading(true);
    setError("");

    const response = await fetch(`/api/dreams/interpret/${dreamId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ includeStory: true }),
    });

    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "生成失败");
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Button onClick={handleInterpret} disabled={loading}>
        <Sparkles className="h-4 w-4" />
        {loading ? "编织中..." : "生成 AI 解读"}
      </Button>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
