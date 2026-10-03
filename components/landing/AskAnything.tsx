import { QUESTIONS, type ExampleQuestion } from "./content";
import { Reveal } from "./motion/Reveal";
import { SectionHeading } from "./SectionHeading";

/**
 * Deliberately still: it sits between the animated hero and the scroll-driven
 * "How it works", so it gives the eye a rest. Rows only fade in once.
 */
export function AskAnything() {
  return (
    <section className="border-t border-line-subtle py-24 md:py-32">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 md:px-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <SectionHeading
          eyebrow="Ask anything"
          title={
            <>
              Ask it the way you&apos;d
              <br className="hidden sm:block" /> ask a teammate.
            </>
          }
          lead="No table names, no joins, no syntax. If your data can answer it, you can ask it."
        />

        <ul className="grid border-t border-line-subtle sm:grid-cols-2 sm:gap-x-10">
          {QUESTIONS.map((q, i) => (
            <li key={q.text} className="border-b border-line-subtle">
              <Reveal delay={i * 0.05} y={10}>
                <QuestionRow q={q} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function QuestionRow({ q }: { q: ExampleQuestion }) {
  return (
    <div className="py-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-subtle">{q.who}</p>
      <p className="mt-1.5 text-[16px] leading-snug text-fg">{q.text}</p>
      <p className="mt-2 font-mono text-[12px] text-accent">
        → {q.answer}
        <span className="ml-2 text-fg-subtle">{q.ms} ms</span>
      </p>
    </div>
  );
}
