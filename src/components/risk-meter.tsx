"use client";

import { motion } from "framer-motion";
import type { RiskLevel } from "@/lib/types";

const LEVEL_COLORS: Record<RiskLevel, { ring: string; text: string; glow: string }> = {
  Safe: { ring: "#10b981", text: "text-emerald-400", glow: "rgba(16,185,129,0.35)" },
  Suspicious: { ring: "#f59e0b", text: "text-amber-400", glow: "rgba(245,158,11,0.35)" },
  Dangerous: { ring: "#ef4444", text: "text-red-400", glow: "rgba(239,68,68,0.35)" },
};

export function RiskMeter({ score, level }: { score: number; level: RiskLevel }) {
  const radius = 80;
  const stroke = 14;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const colors = LEVEL_COLORS[level];

  return (
    <div className="relative flex h-[200px] w-[200px] items-center justify-center">
      <div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{ background: colors.glow }}
      />
      <svg height={radius * 2} width={radius * 2} className="relative -rotate-90">
        <circle
          stroke="rgba(255,255,255,0.08)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <motion.circle
          stroke={colors.ring}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          className={`text-4xl font-bold ${colors.text}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-muted-foreground">/ 100 risk score</span>
      </div>
    </div>
  );
}
