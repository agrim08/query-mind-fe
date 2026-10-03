/**
 * Plan display data. Must match the entitlement matrix in backend app/api/deps.py
 * and .claude/rules/business-logic.md §1 — change all three together.
 */
export type PlanId = "free" | "pro" | "team";

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // USD per month
  cadence: string;
  pitch: string;
  perks: string[];
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    cadence: "forever",
    pitch: "For trying it on one database.",
    perks: ["1 database connection", "50 questions / month", "1 schema design / month", "Read-only execution"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 12,
    cadence: "per month",
    pitch: "For people who ask their data questions every day.",
    perks: ["5 database connections", "Unlimited questions", "6 schema designs / month", "CSV export"],
  },
  team: {
    id: "team",
    name: "Team",
    price: 39,
    cadence: "per month",
    pitch: "For teams that live in their data.",
    perks: [
      "Unlimited connections",
      "Unlimited questions",
      "Unlimited schema designs",
      "CSV + PDF export",
    ],
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "pro", "team"];
