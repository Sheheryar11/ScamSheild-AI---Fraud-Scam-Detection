import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 backdrop-blur-sm transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400/40 resize-none",
        className
      )}
      {...props}
    />
  );
}
