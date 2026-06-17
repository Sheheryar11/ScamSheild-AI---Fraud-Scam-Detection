import type { AnalysisResult, RiskLevel } from "@/lib/types";

interface Rule {
  pattern: RegExp;
  weight: number;
  flag: string;
}

const RULES: Rule[] = [
  { pattern: /guarantee(d)?\s+(profit|return|income)/i, weight: 22, flag: "Promises guaranteed profit or returns" },
  { pattern: /double\s+your\s+money|300%|triple\s+your/i, weight: 20, flag: "Unrealistic investment returns promised" },
  { pattern: /urgent|immediately|act now|within 24 hours|before it'?s too late|limited slots?|limited time/i, weight: 14, flag: "Urgent payment or time pressure" },
  { pattern: /send.*(pkr|rs\.?|rupees)\s?[\d,]+|processing fee|advance fee/i, weight: 18, flag: "Requests upfront payment or processing fee" },
  { pattern: /cnic|cvv|otp|pin code|card number|verify your account/i, weight: 20, flag: "Requests sensitive personal or banking information" },
  { pattern: /congratulations|lucky (winner|draw)|you('ve| have) won|selected as.*winner/i, weight: 16, flag: "Unsolicited prize or lottery winning notification" },
  { pattern: /click (this|the) link|http:\/\/|bit\.ly|tinyurl|hbl-verify|secure-login/i, weight: 16, flag: "Contains suspicious or unofficial link" },
  { pattern: /easypaisa|jazzcash|\*786#/i, weight: 8, flag: "References mobile wallet transfer (Easypaisa/JazzCash) — common scam vector in Pakistan" },
  { pattern: /unknown sender|received.*by mistake|wrong number.*money/i, weight: 14, flag: "Claims of accidental money transfer requiring reversal" },
  { pattern: /account.*(suspend|frozen|block)/i, weight: 14, flag: "Threatens account suspension to create panic" },
  { pattern: /whatsapp|call.*agent|dial \*/i, weight: 8, flag: "Pushes communication to unverifiable channel" },
  { pattern: /no risk|100%\s*(safe|guaranteed)/i, weight: 12, flag: "Claims of zero risk, a hallmark of investment fraud" },
];

export function heuristicAnalyze(message: string): AnalysisResult {
  const text = message.toLowerCase();
  const redFlags: string[] = [];
  const suspiciousPhrases: string[] = [];
  let score = 0;

  for (const rule of RULES) {
    const match = message.match(rule.pattern);
    if (match) {
      score += rule.weight;
      redFlags.push(rule.flag);
      suspiciousPhrases.push(match[0]);
    }
  }

  score = Math.min(100, score);
  if (text.trim().length < 15) score = Math.max(score, 5);

  let risk_level: RiskLevel = "Safe";
  if (score > 70) risk_level = "Dangerous";
  else if (score > 30) risk_level = "Suspicious";

  const confidence = redFlags.length === 0 ? 0.55 : Math.min(0.95, 0.5 + redFlags.length * 0.08);

  const explanation =
    redFlags.length === 0
      ? "No strong scam indicators were detected in this message. It does not show common patterns associated with financial fraud, but always stay cautious with unsolicited requests for money or personal information."
      : `This message shows ${redFlags.length} pattern(s) commonly associated with scams, including pressure tactics and requests typical of fraud schemes targeting users in Pakistan. The combination of these signals suggests this could be an attempt to deceive the recipient into sending money or revealing sensitive information.`;

  const recommendations =
    risk_level === "Safe"
      ? [
          "Still verify the sender's identity before taking any action.",
          "Never share your OTP, PIN, or CNIC with anyone over call or SMS.",
        ]
      : [
          "Do not click any links or call numbers provided in the message.",
          "Never share your OTP, CVV, PIN, or CNIC with anyone.",
          "Verify directly with your bank or telecom operator using their official helpline.",
          "Report the message to your bank's fraud hotline or PTA (Pakistan Telecommunication Authority).",
        ];

  return {
    risk_level,
    risk_score: score,
    confidence: Math.round(confidence * 100) / 100,
    red_flags: [...new Set(redFlags)],
    suspicious_phrases: [...new Set(suspiciousPhrases)],
    explanation,
    recommendations,
  };
}
