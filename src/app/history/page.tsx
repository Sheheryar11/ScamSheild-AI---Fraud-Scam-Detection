import { getAllScans } from "@/lib/db";
import { HistoryList } from "@/components/history-list";

export default function HistoryPage() {
  const scans = getAllScans(50);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="mb-1 text-2xl font-bold tracking-tight sm:text-3xl">Scan History</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Your last {scans.length} analyzed message{scans.length === 1 ? "" : "s"}.
      </p>
      <HistoryList initialScans={scans} />
    </div>
  );
}
