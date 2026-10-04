"use client";

import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { extractKnowledge } from "@/lib/api";
import { useKnowledge } from "@/hooks/useKnowledge";
import BusinessContextEditor from "./BusinessContextEditor";

interface IndexingContextPromptProps {
  connectionId: string;
  phase: "running" | "done" | "error";
}

/**
 * Fills the indexing wait with the optional "Tell us about your business" step (skippable,
 * editable later on the Knowledge page). When the first index finishes, QueryMind reads the
 * schema and description once, so starter questions and definitions are ready right away.
 */
export default function IndexingContextPrompt({ connectionId, phase }: IndexingContextPromptProps) {
  const { knowledge, setKnowledge } = useKnowledge(connectionId);
  const extractedRef = useRef(false);

  useEffect(() => {
    const firstSetup = knowledge && knowledge.starter_questions.length === 0 && knowledge.setup_calls_left > 0;
    if (phase !== "done" || !firstSetup || extractedRef.current) return;
    extractedRef.current = true;
    extractKnowledge(connectionId)
      .then((updated) => {
        setKnowledge(updated);
        toast.success("QueryMind read your schema. Starter questions and definitions are on the Knowledge page.");
      })
      .catch(() => {
        // Optional step: the connection works without it, and it can be run from the Knowledge page.
      });
  }, [phase, knowledge, connectionId, setKnowledge]);

  if (!knowledge || phase === "error") return null;
  return (
    <div style={{ marginTop: 14 }}>
      <BusinessContextEditor
        connectionId={connectionId}
        knowledge={knowledge}
        onChange={setKnowledge}
        schemaReady={false}
      />
    </div>
  );
}
