"use client";

import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import toast from "react-hot-toast";
import { verifyAnswer } from "@/lib/api";

/** 👍: marks this answer as right. Similar questions will reuse its logic as a worked example. */
export default function VerifyButton({ questionId }: { questionId: string }) {
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");

  const verify = async () => {
    setState("saving");
    try {
      await verifyAnswer(questionId);
      setState("saved");
      toast.success("Saved as a verified answer. Similar questions will reuse it.");
    } catch (err) {
      setState("idle");
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      onClick={verify}
      disabled={state !== "idle"}
      aria-pressed={state === "saved"}
      title="This answer is right: reuse it for similar questions"
      style={{ gap: 4, color: state === "saved" ? "var(--accent)" : undefined }}
    >
      <ThumbsUp size={13} />
      {state === "saved" ? "Verified" : "Correct"}
    </button>
  );
}
