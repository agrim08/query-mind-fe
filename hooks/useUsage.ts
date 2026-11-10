"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import type { Usage } from "@/lib/api";

/**
 * A metered feature's usage ({used, limit, unlimited}), loaded with `fetchUsage` and loaded again
 * whenever `refreshKey` changes (e.g. after each question) or when auth initializes.
 * Null until loaded or if it fails: the meter is a convenience, so a failed load just hides it.
 */
export function useUsage(fetchUsage: () => Promise<Usage>, refreshKey: unknown): Usage | null {
  const [usage, setUsage] = useState<Usage | null>(null);
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    let current = true;
    fetchUsage().then(
      (u) => {
        if (current) setUsage(u);
      },
      () => {
        if (current) setUsage(null);
      },
    );
    return () => {
      current = false;
    };
  }, [fetchUsage, refreshKey, isLoaded, isSignedIn]);

  return usage;
}
