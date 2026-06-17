import Link from "next/link";
import { ShieldCheck, History } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 shadow-lg shadow-violet-600/30">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            ScamShield <span className="text-violet-400">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/history"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-white/10 hover:text-foreground"
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
