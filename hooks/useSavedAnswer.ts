"use client";

import { useEffect, useState } from "react";
import { type SavedAnswer, getSavedAnswer } from "@/lib/api";

interface Loaded {
  questionId: string;
  saved: SavedAnswer | null;
  error: string | null;
}

/** The answer saved with a question, loaded once `enabled` (e.g. when its History row opens). */
export function useSavedAnswer(questionId: string, enabled: boolean) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const have = loaded?.questionId === questionId;

  useEffect(() => {
    if (!enabled || have) return;
    let current = true;
    getSavedAnswer(questionId).then(
      (saved) => {
        if (current) setLoaded({ questionId, saved, error: null });
      },
      (err: unknown) => {
        const error = err instanceof Error ? err.message : "We couldn't load this answer.";
        if (current) setLoaded({ questionId, saved: null, error });
      },
    );
    return () => {
      current = false;
    };
  }, [questionId, enabled, have]);

  return {
    saved: have ? loaded.saved : null,
    error: have ? loaded.error : null,
    loading: enabled && !have,
  };
}
