"use client";

import { useState } from "react";
import type { PendingClarification } from "@/lib/store";

interface ClarifyPanelProps {
  clarification: PendingClarification;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
}

const MAX_ANSWER = 500;

/** A multiple-choice question when the question has several fair readings, plus "Something else". */
export default function ClarifyPanel({ clarification, onAnswer, disabled }: ClarifyPanelProps) {
  const [custom, setCustom] = useState("");
  const answer = custom.trim();

  return (
    <div className="card answer-card animate-fade-up">
      {clarification.understood && <div className="answer-understood">{clarification.understood}</div>}
      <div className="answer-headline">{clarification.question}</div>
      <div className="clarify-options">
        {clarification.options.map((option) => (
          <button
            key={option}
            type="button"
            className="clarify-option"
            onClick={() => onAnswer(option)}
            disabled={disabled}
          >
            {option}
          </button>
        ))}
      </div>
      <form
        style={{ display: "flex", gap: 8 }}
        onSubmit={(e) => {
          e.preventDefault();
          if (answer) onAnswer(answer);
        }}
      >
        <label htmlFor="clarify-custom" className="sr-only">
          Something else
        </label>
        <input
          id="clarify-custom"
          className="input"
          placeholder="Something else…"
          value={custom}
          maxLength={MAX_ANSWER}
          onChange={(e) => setCustom(e.target.value)}
          disabled={disabled}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary" disabled={disabled || !answer}>
          Answer
        </button>
      </form>
    </div>
  );
}
