"use client";

import { useEffect, useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import toast from "react-hot-toast";
import { type Knowledge, draftDescription, extractKnowledge, saveDescription } from "@/lib/api";
import MicButton from "./MicButton";

interface BusinessContextEditorProps {
  connectionId: string;
  knowledge: Knowledge;
  onChange: (knowledge: Knowledge) => void;
  /** While indexing runs the schema isn't ready: only typing and saving are offered. */
  schemaReady?: boolean;
}

const MAX_DESCRIPTION = 4000;

/**
 * "Tell us about your business": type, paste or dictate. The AI can draft a starting point from
 * the schema, and turn the saved text into definitions and starter questions (each uses one of
 * the connection's daily setup calls; questions aren't counted).
 */
export default function BusinessContextEditor({
  connectionId,
  knowledge,
  onChange,
  schemaReady = true,
}: BusinessContextEditorProps) {
  const [text, setText] = useState(knowledge.description);
  const [busy, setBusy] = useState<"save" | "draft" | "extract" | null>(null);
  const dirty = text.trim() !== knowledge.description.trim();

  useEffect(() => setText(knowledge.description), [knowledge.description]);

  const run = async (action: "save" | "draft" | "extract") => {
    setBusy(action);
    try {
      if (action === "draft") {
        const { description } = await draftDescription(connectionId);
        setText(description);
        toast.success("Draft ready. Correct anything that's wrong, then save.");
        return;
      }
      let latest = dirty || action === "save" ? await saveDescription(connectionId, text.trim()) : knowledge;
      if (action === "extract") {
        latest = await extractKnowledge(connectionId);
        toast.success("Definitions and starter questions updated.");
      } else {
        toast.success("Saved.");
      }
      onChange(latest);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const noCalls = knowledge.setup_calls_left === 0;

  return (
    <div className="card answer-card">
      <div>
        <label htmlFor="business-description" className="answer-headline" style={{ display: "block" }}>
          Tell us about your business
        </label>
        <p className="answer-understood" style={{ marginTop: 4 }}>
          What you sell, what your key numbers mean, words your team uses. QueryMind follows it when it writes SQL.
        </p>
      </div>
      <textarea
        id="business-description"
        className="textarea"
        rows={5}
        maxLength={MAX_DESCRIPTION}
        placeholder="e.g. We run an online music store. Revenue means paid invoices only. A customer is active if they bought in the last 90 days."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={busy !== null}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <MicButton onText={(phrase) => setText((t) => (t ? `${t} ${phrase}` : phrase).slice(0, MAX_DESCRIPTION))} disabled={busy !== null} />
        {schemaReady && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => run("draft")}
            disabled={busy !== null || noCalls}
            style={{ gap: 4 }}
          >
            <Wand2 size={13} />
            {busy === "draft" ? "Drafting…" : "Draft from my schema"}
          </button>
        )}
        <div style={{ flex: 1 }} />
        <span className="text-mono-xs" style={{ color: "var(--text-tertiary)" }}>
          {text.length}/{MAX_DESCRIPTION}
        </span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => run("save")} disabled={busy !== null || !dirty}>
          {busy === "save" ? "Saving…" : "Save"}
        </button>
        {schemaReady && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => run("extract")}
            disabled={busy !== null || noCalls}
            style={{ gap: 4 }}
          >
            <Sparkles size={13} />
            {busy === "extract" ? "Reading…" : "Save & extract definitions"}
          </button>
        )}
      </div>
      {schemaReady && (
        <p className="answer-understood">
          {noCalls
            ? "Today's AI setup help for this connection is used up. You can still edit definitions yourself."
            : `${knowledge.setup_calls_left} AI setup ${knowledge.setup_calls_left === 1 ? "call" : "calls"} left today. Asking questions isn't affected.`}
        </p>
      )}
    </div>
  );
}
