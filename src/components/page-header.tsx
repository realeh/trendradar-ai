export function PageHeader({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-5 animate-fade-up sm:flex-row sm:items-end">
      <div>
        {eyebrow && <p className="text-xs font-black uppercase tracking-[0.24em] text-coral">{eyebrow}</p>}
        <h1 className="mt-2 font-display text-4xl leading-[1.03] text-ink sm:text-5xl dark:text-paper">{title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-ink/62 dark:text-paper/62">{description}</p>
      </div>
      {action}
    </div>
  );
}
