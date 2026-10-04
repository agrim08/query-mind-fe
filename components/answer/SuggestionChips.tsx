interface SuggestionChipsProps {
  label: string;
  questions: string[];
  onAsk: (question: string) => void;
  disabled?: boolean;
}

/** One-click questions: other readings of this one ("Instead") or natural next ones. */
export default function SuggestionChips({ label, questions, onAsk, disabled }: SuggestionChipsProps) {
  if (questions.length === 0) return null;
  return (
    <div className="suggestion-row">
      <span className="suggestion-row-label">{label}</span>
      {questions.map((question) => (
        <button
          key={question}
          type="button"
          className="suggestion-chip"
          onClick={() => onAsk(question)}
          disabled={disabled}
        >
          {question}
        </button>
      ))}
    </div>
  );
}
