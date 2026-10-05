import Link from "next/link";
import { ArrowUpRight, BookOpen, Table2 } from "lucide-react";

interface StarterQuestionsProps {
  connectionName: string | null;
  /** Suggestions from the connection's business setup; empty before setup. */
  questions: string[];
  /** Puts the question in the input; the user runs it. */
  onPick: (question: string) => void;
}

const TABLES_QUESTION = "What tables do I have?";

/**
 * The empty dashboard: suggested questions right under the input, where the eye already is.
 * Before business setup, it offers the schema overview (answered without AI) and the way to
 * teach QueryMind the business.
 */
export default function StarterQuestions({ connectionName, questions, onPick }: StarterQuestionsProps) {
  const suggestions = questions.length > 0 ? questions : [TABLES_QUESTION];

  return (
    <section className="starter-section animate-fade-up" aria-label="Suggested questions">
      <div className="starter-header">
        <span>{connectionName ? `Suggested for ${connectionName}` : "Suggested questions"}</span>
        <Link href="/knowledge" className="starter-link">
          <BookOpen size={12} />
          {questions.length > 0 ? "Edit on Knowledge" : "Teach QueryMind your business"}
        </Link>
      </div>
      <div className="starter-grid">
        {suggestions.map((question) => (
          <button key={question} type="button" className="starter-card" onClick={() => onPick(question)}>
            {question === TABLES_QUESTION && <Table2 size={14} className="starter-card-icon" aria-hidden />}
            <span>{question}</span>
            <ArrowUpRight size={14} className="starter-card-arrow" aria-hidden />
          </button>
        ))}
      </div>
      {questions.length === 0 && (
        <p className="starter-note">
          Describe your business on the Knowledge page and QueryMind will suggest questions that fit your data.
        </p>
      )}
    </section>
  );
}
