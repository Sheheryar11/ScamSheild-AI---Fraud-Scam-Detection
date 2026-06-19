export type RiskLevel = "Safe" | "Suspicious" | "Dangerous";

export interface AnalysisResult {
  risk_level: RiskLevel;
  risk_score: number;
  confidence: number;
  red_flags: string[];
  suspicious_phrases: string[];
  explanation: string;
  recommendations: string[];
}

export interface ScanRecord extends AnalysisResult {
  id: number;
  message: string;
  created_at: string;
}

export interface AnalyzeResponse extends ScanRecord {
  source: "gemini" | "heuristic";
}
