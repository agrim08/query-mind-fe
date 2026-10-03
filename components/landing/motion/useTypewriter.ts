"use client";

import { useEffect, useState } from "react";

/**
 * Reveals `text` a few characters at a time while `running` is true.
 * Returns the visible slice ("" while not running) and whether typing has finished.
 */
export function useTypewriter(text: string, running: boolean, charsPerTick = 2, tickMs = 18) {
  const [progress, setProgress] = useState({ text, count: 0 });

  useEffect(() => {
    if (!running) return;
    let count = 0;
    const id = setInterval(() => {
      count = Math.min(text.length, count + charsPerTick);
      setProgress({ text, count });
      if (count >= text.length) clearInterval(id);
    }, tickMs);
    return () => {
      clearInterval(id);
      setProgress({ text, count: 0 });
    };
  }, [text, running, charsPerTick, tickMs]);

  const count = running && progress.text === text ? progress.count : 0;
  return { visible: text.slice(0, count), done: count >= text.length };
}
