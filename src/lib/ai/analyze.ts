import type { AnalysisResult, RiskLevel } from "@/lib/types";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt";
import { heuristicAnalyze } from "./heuristics";

const RISK_LEVELS: RiskLevel[] = ["Safe", "Suspicious", "Dangerous"];
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function clampScoreToLevel(score: number, level: RiskLevel): RiskLevel {
  if (RISK_LEVELS.includes(level)) return level;
  if (score > 70) return "Dangerous";
  if (score > 30) return "Suspicious";
  return "Safe";
}

function parseModelJson(raw: string): AnalysisResult | null {
  try {
    const cleaned = raw.trim().replace(/^```(json)?/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleaned);

    const risk_score = Math.max(0, Math.min(100, Number(parsed.risk_score) || 0));
    return {
      risk_level: clampScoreToLevel(risk_score, parsed.risk_level),
      risk_score,
      confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.5)),
      red_flags: Array.isArray(parsed.red_flags) ? parsed.red_flags.map(String) : [],
      suspicious_phrases: Array.isArray(parsed.suspicious_phrases) ? parsed.suspicious_phrases.map(String) : [],
      explanation: String(parsed.explanation || ""),
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.map(String) : [],
    };
  } catch {
    return null;
  }
}

async function callGemini(apiKey: string, message: string): Promise<string | null> {
  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: buildUserPrompt(message) }] }],
      generationConfig: { response_mime_type: "application/json" },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return typeof text === "string" ? text : null;
}

export async function analyzeMessage(message: string): Promise<{ result: AnalysisResult; source: "gemini" | "heuristic" }> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const text = await callGemini(apiKey, message);
      if (text) {
        const parsed = parseModelJson(text);
        if (parsed) {
          return { result: parsed, source: "gemini" };
        }
      }
    } catch (error) {
      console.error("Gemini analysis failed, falling back to heuristics:", error);
    }
  }

  return { result: heuristicAnalyze(message), source: "heuristic" };
}
