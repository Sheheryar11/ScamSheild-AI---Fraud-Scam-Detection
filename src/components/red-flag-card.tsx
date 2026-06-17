"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export function RedFlagCard({ flag, index }: { flag: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.07 }}
      className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-3.5"
    >
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-500/15">
        <AlertTriangle className="h-4 w-4 text-red-400" />
      </div>
      <p className="text-sm leading-snug text-foreground/90">{flag}</p>
    </motion.div>
  );
}
