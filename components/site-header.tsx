import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090b1a]/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-white">
          <Sparkles className="h-5 w-5 text-violet-300" />
          <span className="font-semibold tracking-wide">Dreamweaver</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              登录
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">免费开始</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
