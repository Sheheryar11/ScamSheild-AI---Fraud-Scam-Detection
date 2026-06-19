"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ScanSearch, ShieldAlert, ShieldCheck, ShieldQuestion, Sparkles, Quote, BrainCircuit, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RiskMeter } from "@/components/risk-meter";
import { RedFlagCard } from "@/components/red-flag-card";
import type { AnalyzeResponse, RiskLevel } from "@/lib/types";

const LEVEL_META: Record<RiskLevel, { icon: typeof ShieldCheck; badge: "safe" | "suspicious" | "dangerous"; label: string }> = {
  Safe: { icon: ShieldCheck, badge: "safe", label: "Safe" },
  Suspicious: { icon: ShieldQuestion, badge: "suspicious", label: "Suspicious" },
  Dangerous: { icon: ShieldAlert, badge: "dangerous", label: "Dangerous" },
};

export function Analyzer() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (!message.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Analysis failed. Please try again.");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const meta = result ? LEVEL_META[result.risk_level] : null;
  const LevelIcon = meta?.icon;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300">
          <Sparkles className="h-3.5 w-3.5" />
          AI-Powered Fraud Detection for Pakistan & Beyond
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
          Is that message a <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">scam?</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          Paste any suspicious SMS, WhatsApp message, or investment offer. ScamShield AI analyzes it instantly and explains the red flags in plain language.
        </p>
      </motion.div>

      <Card className="overflow-hidden">
        <CardContent className="p-5 sm:p-6">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Paste the suspicious message, SMS, or investment offer here..."
            rows={6}
            maxLength={4000}
          />

          <div className="mt-4 flex items-center justify-end">
            <Button onClick={handleAnalyze} disabled={loading || !message.trim()} size="lg">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <ScanSearch className="h-4 w-4" />
                  Analyze Risk
                </>
              )}
            </Button>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-400">{error}</p>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {result && meta && LevelIcon && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-8 space-y-6"
          >
            <Card>
              <CardContent className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-center sm:justify-around">
                <RiskMeter score={result.risk_score} level={result.risk_level} />

                <div className="flex flex-1 flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <LevelIcon className="h-7 w-7" />
                    <Badge variant={meta.badge} className="text-sm">
                      {meta.label}
                    </Badge>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-muted-foreground"
                      title={
                        result.source === "gemini"
                          ? "Analyzed by Gemini AI with RAG-retrieved scam pattern context"
                          : "Gemini was unavailable (e.g. quota limit) — analyzed by the rule-based fallback engine instead"
                      }
                    >
                      {result.source === "gemini" ? (
                        <BrainCircuit className="h-3.5 w-3.5" />
                      ) : (
                        <Calculator className="h-3.5 w-3.5" />
                      )}
                      {result.source === "gemini" ? "AI analysis" : "Rule-based fallback"}
                    </span>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Confidence</span>
                      <span>{Math.round(result.confidence * 100)}%</span>
                    </div>
                    <Progress value={result.confidence * 100} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {result.red_flags.length > 0 && (
              <Card>
                <CardContent className="p-5 sm:p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Red Flags Detected ({result.red_flags.length})
                  </h3>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {result.red_flags.map((flag, i) => (
                      <RedFlagCard key={flag} flag={flag} index={i} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {result.suspicious_phrases.length > 0 && (
              <Card>
                <CardContent className="p-5 sm:p-6">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Suspicious Phrases
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.suspicious_phrases.map((phrase) => (
                      <span
                        key={phrase}
                        className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-300"
                      >
                        &ldquo;{phrase}&rdquo;
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-5 sm:p-6">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  AI Explanation
                </h3>
                <div className="flex gap-3 rounded-xl bg-white/[0.03] p-4">
                  <Quote className="h-5 w-5 shrink-0 text-violet-400" />
                  <p className="text-sm leading-relaxed text-foreground/90">{result.explanation}</p>
                </div>
              </CardContent>
            </Card>

            {result.recommendations.length > 0 && (
              <Card>
                <CardContent className="p-5 sm:p-6">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Safety Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec) => (
                      <li key={rec} className="flex items-start gap-2.5 text-sm text-foreground/90">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
