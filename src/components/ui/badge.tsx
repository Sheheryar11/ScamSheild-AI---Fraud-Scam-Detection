import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "safe" | "suspicious" | "dangerous" }) {
  const variants: Record<string, string> = {
    default: "bg-white/10 text-foreground border-white/15",
    safe: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    suspicious: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    dangerous: "bg-red-500/15 text-red-400 border-red-500/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
