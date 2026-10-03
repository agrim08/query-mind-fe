"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PLAN_ORDER, PLANS, type Plan } from "@/lib/plans";
import { BorderBeam } from "./motion/BorderBeam";
import { Reveal } from "./motion/Reveal";
import { SectionHeading } from "./SectionHeading";
import { useIsSignedIn } from "./useIsSignedIn";

export function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-16 border-t border-line-subtle py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <SectionHeading
          eyebrow="Pricing"
          title="Start free. Pay when it earns its keep."
          lead="Every plan is read-only, streams results live and keeps your history. Upgrade or cancel any time."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {PLAN_ORDER.map((id, i) => {
            const plan = PLANS[id];
            const featured = id === "pro";
            return (
              <Reveal key={id} delay={i * 0.08} className="h-full">
                {featured ? (
                  <BorderBeam className="h-full" innerClassName="h-full bg-surface">
                    <PlanCard plan={plan} featured />
                  </BorderBeam>
                ) : (
                  <div className="h-full rounded-2xl border border-line-subtle bg-surface">
                    <PlanCard plan={plan} />
                  </div>
                )}
              </Reveal>
            );
          })}
        </div>

        <p className="mt-6 font-mono text-[12px] text-fg-subtle">
          A question counts once when it runs, including ones that end in an error.
        </p>
      </div>
    </section>
  );
}

function PlanCard({ plan, featured = false }: { plan: Plan; featured?: boolean }) {
  const signedIn = useIsSignedIn();
  const signedInHref = plan.id === "free" ? "/dashboard" : "/billing";
  const signedInLabel = plan.id === "free" ? "Open dashboard" : `Upgrade to ${plan.name}`;
  const signedOutLabel = plan.id === "free" ? "Start free" : `Get ${plan.name}`;
  const buttonClass = featured
    ? "bg-accent text-canvas hover:opacity-90"
    : "border border-line text-fg hover:border-line-strong hover:bg-raised";

  return (
    <div className="flex h-full flex-col p-7">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-fg">{plan.name}</h3>
        {featured && (
          <span className="rounded-full bg-accent/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-accent">
            Most picked
          </span>
        )}
      </div>
      <p className="mt-1 text-[14px] text-fg-muted">{plan.pitch}</p>

      <div className="mt-7 flex items-baseline gap-2">
        <span className="font-display text-[52px] font-extrabold leading-none tracking-[-0.04em] text-fg">${plan.price}</span>
        <span className="font-mono text-[12px] text-fg-subtle">{plan.cadence}</span>
      </div>

      <ul className="mt-7 space-y-3">
        {plan.perks.map((perk) => (
          <li key={perk} className="flex items-center gap-3 text-[15px] text-fg-muted">
            <Check size={15} className={featured ? "text-accent" : "text-fg-subtle"} />
            {perk}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        <Link
          href={signedIn ? signedInHref : "/sign-up"}
          className={`group flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[15px] font-semibold transition ${buttonClass}`}
        >
          {signedIn ? signedInLabel : signedOutLabel}
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
