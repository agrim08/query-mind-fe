"use client";

import { useAuth } from "@clerk/nextjs";
import type { PlanId } from "./plans";

export interface PlanLimits {
  /** null means unlimited. */
  connections: number | null;
  questionsPerMonth: number | null;
  designsPerMonth: number | null;
}

/**
 * Limits per plan. Mirrors `_build_entitlements` in backend app/api/deps.py and the table in
 * .claude/rules/business-logic.md §1: change all of them together.
 */
export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: { connections: 1, questionsPerMonth: 50, designsPerMonth: 1 },
  pro: { connections: 5, questionsPerMonth: null, designsPerMonth: 6 },
  team: { connections: null, questionsPerMonth: null, designsPerMonth: null },
};

/**
 * The one place the frontend reads the user's plan, for UX only (the backend enforces every limit).
 * Same implications as the backend: team ⇒ pro, pro ⇒ CSV, team ⇒ PDF.
 */
export function usePlan() {
  const { has } = useAuth();
  const feature = (key: string) => Boolean(has?.({ feature: key }));
  const checkPlan = (key: string) => Boolean(has?.({ plan: key }));
  const isTeam = feature("team_tier") || checkPlan("team") || checkPlan("team_tier");
  const isPro = isTeam || feature("pro_tier") || checkPlan("pro") || checkPlan("pro_tier");
  const plan: PlanId = isTeam ? "team" : isPro ? "pro" : "free";
  return {
    plan,
    isPro,
    isTeam,
    limits: PLAN_LIMITS[plan],
    /** The plan to suggest when a limit is hit; null on Team. */
    nextPlan: (plan === "free" ? "pro" : plan === "pro" ? "team" : null) as "pro" | "team" | null,
    canCsv: isPro || feature("csv_export"),
    canPdf: isTeam || feature("pdf_export"),
  };
}
