"use client";

import { useCallback, useEffect, useState } from "react";
import { type Knowledge, getKnowledge } from "@/lib/api";

/** A connection's business context, definitions and verified answers. */
export function useKnowledge(connectionId: string | null) {
  const [knowledge, setKnowledge] = useState<Knowledge | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (id: string, isCurrent: () => boolean) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getKnowledge(id);
      if (isCurrent()) setKnowledge(data);
    } catch (err) {
      if (isCurrent()) setError(err instanceof Error ? err.message : "Couldn't load this connection's knowledge.");
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!connectionId) return;
    let current = true;
    void load(connectionId, () => current);
    return () => {
      current = false;
    };
  }, [connectionId, load]);

  return { knowledge: connectionId ? knowledge : null, setKnowledge, loading, error };
}
