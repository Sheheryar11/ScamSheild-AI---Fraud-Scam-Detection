import { neon } from "@neondatabase/serverless";
import { embedText } from "@/lib/ai/embeddings";
import { KNOWLEDGE_BASE } from "@/lib/rag/knowledge";

const sql = neon(process.env.DATABASE_URL!);

function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

let tableReady: Promise<void> | null = null;

function ensureTable(): Promise<void> {
  if (!tableReady) {
    tableReady = (async () => {
      await sql`CREATE EXTENSION IF NOT EXISTS vector`;
      await sql`
        CREATE TABLE IF NOT EXISTS scam_knowledge (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          embedding VECTOR(768) NOT NULL
        )
      `;
    })();
  }
  return tableReady;
}

export async function seedKnowledgeBase(): Promise<{ inserted: number; total: number }> {
  await ensureTable();
  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM scam_knowledge`;
  if ((count as number) >= KNOWLEDGE_BASE.length) {
    return { inserted: 0, total: count as number };
  }

  let inserted = 0;
  for (const doc of KNOWLEDGE_BASE) {
    const embedding = await embedText(`${doc.title}\n${doc.content}`);
    await sql`
      INSERT INTO scam_knowledge (id, title, content, embedding)
      VALUES (${doc.id}, ${doc.title}, ${doc.content}, ${toVectorLiteral(embedding)}::vector)
      ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, embedding = EXCLUDED.embedding
    `;
    inserted += 1;
  }

  const [{ count: total }] = await sql`SELECT COUNT(*)::int AS count FROM scam_knowledge`;
  return { inserted, total: total as number };
}

export interface RetrievedDoc {
  id: string;
  title: string;
  content: string;
  distance: number;
}

export async function retrieveSimilarDocs(message: string, k = 3): Promise<RetrievedDoc[]> {
  await ensureTable();
  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM scam_knowledge`;
  if ((count as number) === 0) return [];

  const queryEmbedding = await embedText(message);
  const rows = await sql`
    SELECT id, title, content, embedding <=> ${toVectorLiteral(queryEmbedding)}::vector AS distance
    FROM scam_knowledge
    ORDER BY distance ASC
    LIMIT ${k}
  `;
  return rows.map((row) => ({
    id: row.id as string,
    title: row.title as string,
    content: row.content as string,
    distance: Number(row.distance),
  }));
}
