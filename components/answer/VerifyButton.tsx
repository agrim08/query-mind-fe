"use client";

import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import toast from "react-hot-toast";
import { verifyAnswer } from "@/lib/api";

interface VerifyButtonProps {
  questionId: string;
  /** Already saved as verified (e.g. in history). */
  verified?: boolean;
}

/** 👍: marks this answer as right. Similar questions will reuse its logic as a worked example. */
export default function VerifyButton({ questionId, verified = false }: VerifyButtonProps) {
  const [saved, setSaved] = useState(verified);

  // Shown as verified at once; the save takes a few database round trips and is undone if it fails.
  const verify = async () => {
    setSaved(true);
    try {
      await verifyAnswer(questionId);
      toast.success("Saved as a verified answer. Similar questions will reuse it.");
    } catch (err) {
      setSaved(false);
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      onClick={verify}
      disabled={saved}
      aria-pressed={saved}
      title="This answer is right: reuse it for similar questions"
      style={{ gap: 4, color: saved ? "var(--accent)" : undefined }}
    >
      <ThumbsUp size={13} />
      {saved ? "Verified" : "Correct"}
    </button>
  );
}
