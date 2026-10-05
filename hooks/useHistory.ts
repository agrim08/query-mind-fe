"use client";

import { useCallback, useEffect, useState } from "react";
import { type HistoryEntry, getHistory } from "@/lib/api";

interface Loaded {
  key: string;
  items: HistoryEntry[];
  total: number;
  error: string | null;
}

/**
 * One page of question history: for one connection, or for all of them when `connectionId` is
 * null. Results are tied to the request they answer, so a stale response never shows.
 * `enabled: false` waits (e.g. until the selected connection is known).
 */
export function useHistory(connectionId: string | null, page: number, pageSize: number, enabled = true) {
  const key = `${connectionId ?? "all"}:${page}:${pageSize}`;
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let current = true;
    getHistory(page, pageSize, connectionId).then(
      ({ items, total }) => {
        if (current) setLoaded({ key, items, total, error: null });
      },
      (err: unknown) => {
        const error = err instanceof Error ? err.message : "Couldn't load your history.";
        if (current) setLoaded({ key, items: [], total: 0, error });
      },
    );
    return () => {
      current = false;
    };
  }, [key, connectionId, page, pageSize, enabled, attempt]);

  const retry = useCallback(() => {
    setLoaded(null);
    setAttempt((n) => n + 1);
  }, []);

  const forKey = loaded?.key === key ? loaded : null;
  return {
    entries: forKey?.items ?? [],
    total: forKey?.total ?? 0,
    loading: !forKey,
    error: forKey?.error ?? null,
    retry,
  };
}
