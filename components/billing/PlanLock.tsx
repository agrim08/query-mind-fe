import { Lock } from "lucide-react";

/** The small "🔒 PRO" / "🔒 TEAM" tag on an action the current plan doesn't include. */
export default function PlanLock({ plan }: { plan: "pro" | "team" }) {
  return (
    <span className={`plan-lock plan-lock-${plan}`}>
      <Lock size={8} aria-hidden />
      {plan === "pro" ? "Pro" : "Team"}
    </span>
  );
}
