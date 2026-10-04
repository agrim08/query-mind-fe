"use client";

import { Mic, MicOff } from "lucide-react";
import { useSpeechInput } from "@/hooks/useSpeechInput";

interface MicButtonProps {
  /** Receives each finished phrase. */
  onText: (text: string) => void;
  disabled?: boolean;
}

/** Dictate instead of typing. Hidden where the browser has no speech recognition (e.g. Firefox). */
export default function MicButton({ onText, disabled }: MicButtonProps) {
  const { supported, listening, start, stop } = useSpeechInput(onText);
  if (!supported) return null;
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      onClick={listening ? stop : start}
      disabled={disabled}
      aria-pressed={listening}
      aria-label={listening ? "Stop dictation" : "Dictate"}
      title="Dictate with your browser's speech recognition (your browser's speech service processes the audio)"
      style={{ gap: 4, color: listening ? "var(--accent)" : undefined }}
    >
      {listening ? <MicOff size={13} /> : <Mic size={13} />}
      {listening ? "Listening…" : "Speak"}
    </button>
  );
}
