export function KpiCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="premium-card rounded-md p-4 transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-ink/48 dark:text-paper/48">{label}</div>
      <div className="mt-2 text-3xl font-black">{value}</div>
      <div className="mt-1 text-sm text-ink/62 dark:text-paper/62">{detail}</div>
    </div>
  );
}
