import { scoreTone } from "@/lib/scoring";

export function ScoreRing({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="grid size-14 place-items-center rounded-full text-sm font-black"
        style={{
          background: `conic-gradient(#217c8f ${score * 3.6}deg, rgba(127,127,127,.18) 0deg)`
        }}
      >
        <span className="grid size-11 place-items-center rounded-full bg-paper dark:bg-ink">{score}</span>
      </div>
      <div>
        <div className={`font-bold ${scoreTone(score)}`}>{label}</div>
        <div className="text-xs text-ink/55 dark:text-paper/55">out of 100</div>
      </div>
    </div>
  );
}
