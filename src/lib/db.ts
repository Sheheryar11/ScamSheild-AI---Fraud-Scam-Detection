import { neon } from "@neondatabase/serverless";
import type { AnalysisResult, ScanRecord } from "@/lib/types";

const sql = neon(process.env.DATABASE_URL!);

let tableReady: Promise<void> | null = null;

function ensureTable(): Promise<void> {
  if (!tableReady) {
    tableReady = sql`
      CREATE TABLE IF NOT EXISTS scans (
        id SERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        risk_level TEXT NOT NULL,
        risk_score INTEGER NOT NULL,
        confidence REAL NOT NULL,
        red_flags TEXT NOT NULL,
        suspicious_phrases TEXT NOT NULL,
        explanation TEXT NOT NULL,
        recommendations TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `.then(() => undefined);
  }
  return tableReady;
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
    created_at: String(row.created_at),
  };
}

export async function saveScan(message: string, result: AnalysisResult): Promise<ScanRecord> {
  await ensureTable();
  const rows = await sql`
    INSERT INTO scans (message, risk_level, risk_score, confidence, red_flags, suspicious_phrases, explanation, recommendations)
    VALUES (${message}, ${result.risk_level}, ${result.risk_score}, ${result.confidence}, ${JSON.stringify(result.red_flags)}, ${JSON.stringify(result.suspicious_phrases)}, ${result.explanation}, ${JSON.stringify(result.recommendations)})
    RETURNING *
  `;
  return rowToRecord(rows[0] as Record<string, unknown>);
}

export async function getAllScans(limit = 50): Promise<ScanRecord[]> {
  await ensureTable();
  const rows = await sql`SELECT * FROM scans ORDER BY id DESC LIMIT ${limit}`;
  return rows.map((row) => rowToRecord(row as Record<string, unknown>));
}

export async function deleteScan(id: number): Promise<void> {
  await ensureTable();
  await sql`DELETE FROM scans WHERE id = ${id}`;
}
