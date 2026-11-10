import Link from "next/link";
import type { Usage } from "@/lib/api";

interface UsageMeterProps {
  usage: Usage | null;
  /** What is counted, plural: "questions", "designs". */
  noun: string;
  /** Sits inside a toolbar: no outer margin. */
  inline?: boolean;
}

/** "12 / 50 questions this month", with a thin bar. Hidden on unlimited plans. */
export default function UsageMeter({ usage, noun, inline = false }: UsageMeterProps) {
  if (!usage || usage.unlimited) return null;
  const share = usage.limit > 0 ? Math.min(1, usage.used / usage.limit) : 1;
  const state = share >= 1 ? "full" : share >= 0.8 ? "near" : "ok";

  return (
    <div className="usage-meter" data-state={state} data-inline={inline || undefined}>
      <span className="usage-meter-text">
        {usage.used} / {usage.limit} {noun} this month
      </span>
      <span className="usage-meter-bar" aria-hidden>
        <span style={{ width: `${share * 100}%` }} />
      </span>
      {state !== "ok" && (
        <Link href="/billing" className="usage-meter-link">
          {state === "full" ? "Upgrade for more" : "Running low"}
        </Link>
      )}
    </div>
  );
}
