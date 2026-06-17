import Database from "better-sqlite3";
import path from "path";
import type { AnalysisResult, ScanRecord } from "@/lib/types";

const dbPath = path.join(process.cwd(), "scamshield.db");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT NOT NULL,
    risk_level TEXT NOT NULL,
    risk_score INTEGER NOT NULL,
    confidence REAL NOT NULL,
    red_flags TEXT NOT NULL,
    suspicious_phrases TEXT NOT NULL,
    explanation TEXT NOT NULL,
    recommendations TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

export function saveScan(message: string, result: AnalysisResult): ScanRecord {
  const stmt = db.prepare(`
    INSERT INTO scans (message, risk_level, risk_score, confidence, red_flags, suspicious_phrases, explanation, recommendations)
    VALUES (@message, @risk_level, @risk_score, @confidence, @red_flags, @suspicious_phrases, @explanation, @recommendations)
  `);

  const info = stmt.run({
    message,
    risk_level: result.risk_level,
    risk_score: result.risk_score,
    confidence: result.confidence,
    red_flags: JSON.stringify(result.red_flags),
    suspicious_phrases: JSON.stringify(result.suspicious_phrases),
    explanation: result.explanation,
    recommendations: JSON.stringify(result.recommendations),
  });

  return getScanById(Number(info.lastInsertRowid))!;
}

function rowToRecord(row: Record<string, unknown>): ScanRecord {
  return {
    id: row.id as number,
    message: row.message as string,
    risk_level: row.risk_level as ScanRecord["risk_level"],
    risk_score: row.risk_score as number,
    confidence: row.confidence as number,
    red_flags: JSON.parse(row.red_flags as string),
    suspicious_phrases: JSON.parse(row.suspicious_phrases as string),
    explanation: row.explanation as string,
    recommendations: JSON.parse(row.recommendations as string),
    created_at: row.created_at as string,
  };
}

export function getScanById(id: number): ScanRecord | null {
  const row = db.prepare("SELECT * FROM scans WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  return row ? rowToRecord(row) : null;
}

export function getAllScans(limit = 50): ScanRecord[] {
  const rows = db.prepare("SELECT * FROM scans ORDER BY id DESC LIMIT ?").all(limit) as Record<string, unknown>[];
  return rows.map(rowToRecord);
}

export function deleteScan(id: number): void {
  db.prepare("DELETE FROM scans WHERE id = ?").run(id);
}
