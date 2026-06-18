"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Moon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  userName?: string | null;
}

export function AppHeader({ userName }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090b1a]/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-white">
          <Sparkles className="h-5 w-5 text-violet-300" />
          <span className="font-semibold tracking-wide">Dreamweaver</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <Moon className="h-4 w-4" />
              工作台
            </Button>
          </Link>
          <Link href="/dreams">
            <Button variant="ghost" size="sm">
              梦境历史
            </Button>
          </Link>
          <span className="hidden text-sm text-slate-400 sm:inline">{userName}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            退出
          </Button>
        </nav>
      </div>
    </header>
  );
}
