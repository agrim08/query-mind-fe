interface SuggestionChipsProps {
  label: string;
  questions: string[];
  onPick: (question: string) => void;
  disabled?: boolean;
}

/** Suggested questions, put in the input on click: other readings of this one ("Instead") or natural next ones. */
export default function SuggestionChips({ label, questions, onPick, disabled }: SuggestionChipsProps) {
  if (questions.length === 0) return null;
  return (
    <div className="suggestion-row">
      <span className="suggestion-row-label">{label}</span>
      {questions.map((question) => (
        <button
          key={question}
          type="button"
          className="suggestion-chip"
          onClick={() => onPick(question)}
          disabled={disabled}
        >
          {question}
        </button>
      ))}
    </div>
  );
}
