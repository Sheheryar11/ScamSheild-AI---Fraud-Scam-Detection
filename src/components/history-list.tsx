"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ScanRecord } from "@/lib/types";

const BADGE_VARIANT: Record<string, "safe" | "suspicious" | "dangerous"> = {
  Safe: "safe",
  Suspicious: "suspicious",
  Dangerous: "dangerous",
};

export function HistoryList({ initialScans }: { initialScans: ScanRecord[] }) {
  const [scans, setScans] = useState(initialScans);

  async function handleDelete(id: number) {
    setScans((prev) => prev.filter((s) => s.id !== id));
    await fetch(`/api/history?id=${id}`, { method: "DELETE" });
  }

  if (scans.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
          <Inbox className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No scans yet. Analyze a message on the home page to see it here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {scans.map((scan) => (
          <motion.div
            key={scan.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardContent className="p-4 sm:p-5">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={BADGE_VARIANT[scan.risk_level]}>{scan.risk_level}</Badge>
                    <span className="text-xs text-muted-foreground">Score {scan.risk_score}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {new Date(scan.created_at).toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleDelete(scan.id)}
                      aria-label="Delete scan"
                      className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="line-clamp-2 text-sm text-foreground/80">{scan.message}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
