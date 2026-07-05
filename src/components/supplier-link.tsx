import { ExternalLink } from "lucide-react";

export function SupplierLink({ url }: { url?: string }) {
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-black/10 bg-white/60 px-3 py-1.5 text-xs font-bold text-ink/72 transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-paper/72 dark:hover:bg-white/10"
    >
      View supplier
      <ExternalLink size={13} />
    </a>
  );
}
