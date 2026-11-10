"use client";

import { useCallback, useState } from "react";
import { ApiError, type LimitCode } from "@/lib/api";
import { usePlan } from "@/lib/entitlements";
import { UpgradeModal } from "@/components/billing/UpgradePrompt";

const COPY: Record<LimitCode, { title: string; description: string }> = {
  QUERY_LIMIT_REACHED: {
    title: "You've used this month's questions",
    description: "Upgrade for unlimited questions, or wait until your limit resets on the 1st (UTC).",
  },
  CONNECTION_LIMIT_REACHED: {
    title: "You've reached your database limit",
    description: "Upgrade to connect more databases, or delete one you no longer use.",
  },
  DESIGN_LIMIT_REACHED: {
    title: "You've used this month's schema designs",
    description: "Upgrade for more designs, or wait until your limit resets on the 1st (UTC).",
  },
};

/**
 * Turns a plan-limit error into the upgrade prompt for the next plan (Free → Pro, Pro → Team),
 * so a raw code like QUERY_LIMIT_REACHED never reaches the screen.
 * `handleLimit(err)` returns true when it showed the prompt.
 */
export function useLimitUpgrade() {
  const { nextPlan } = usePlan();
  const [code, setCode] = useState<LimitCode | null>(null);

  const handleLimit = useCallback((err: unknown) => {
    if (err instanceof ApiError && err.code) {
      setCode(err.code);
      return true;
    }
    return false;
  }, []);

  const upgradeModal =
    code && nextPlan ? (
      <UpgradeModal
        requiredPlan={nextPlan}
        title={COPY[code].title}
        description={COPY[code].description}
        onClose={() => setCode(null)}
      />
    ) : null;

  return { upgradeModal, handleLimit };
}
