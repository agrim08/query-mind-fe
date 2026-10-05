"use client";

import { useAuth } from "@clerk/nextjs";

/**
 * What the user's plan allows, for UX only (the backend enforces every limit).
 * Mirrors `_build_entitlements` in backend app/api/deps.py: team ⇒ pro, pro ⇒ CSV, team ⇒ PDF.
 */
export function usePlan() {
  const { has } = useAuth();
  const feature = (key: string) => Boolean(has?.({ feature: key }));
  const isTeam = feature("team_tier");
  const isPro = isTeam || feature("pro_tier");
  return {
    isPro,
    isTeam,
    canCsv: isPro || feature("csv_export"),
    canPdf: isTeam || feature("pdf_export"),
  };
}
