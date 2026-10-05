"use client";

import { useCallback, useEffect, useState } from "react";
import { type Knowledge, getKnowledge } from "@/lib/api";

interface Loaded {
  connectionId: string;
  knowledge: Knowledge | null;
  error: string | null;
}

/**
 * A connection's business context, definitions and verified answers.
 * Data is tied to the connection it was loaded for, so switching connections never shows the
 * previous one's knowledge; `loading` stays true until the selected connection's data arrives.
 */
export function useKnowledge(connectionId: string | null) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    if (!connectionId) return;
    let current = true;
    getKnowledge(connectionId).then(
      (knowledge) => {
        if (current) setLoaded({ connectionId, knowledge, error: null });
      },
      (err: unknown) => {
        const error = err instanceof Error ? err.message : "Couldn't load this connection's knowledge.";
        if (current) setLoaded({ connectionId, knowledge: null, error });
      },
    );
    return () => {
      current = false;
    };
  }, [connectionId]);

  const setKnowledge = useCallback(
    (knowledge: Knowledge) => {
      if (connectionId) setLoaded({ connectionId, knowledge, error: null });
    },
    [connectionId],
  );

  const forSelected = loaded && loaded.connectionId === connectionId ? loaded : null;
  return {
    knowledge: forSelected?.knowledge ?? null,
    setKnowledge,
    loading: Boolean(connectionId) && !forSelected,
    error: forSelected?.error ?? null,
  };
}
