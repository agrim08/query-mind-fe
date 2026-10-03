import { Reveal } from "./motion/Reveal";

/** Eyebrow + display heading + optional lead, left-aligned by default. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: "left" | "center";
}) {
  const centered = align === "center";
  return (
    <Reveal className={centered ? "mx-auto max-w-[720px] text-center" : "max-w-[720px]"}>
      <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
      <h2 className="font-display text-[clamp(34px,9vw,48px)] font-extrabold leading-[1.04] tracking-[-0.04em] text-fg">
        {title}
      </h2>
      {lead && (
        <p
          className={`mt-6 text-[clamp(17px,1.4vw,20px)] font-[360] leading-[1.55] text-fg-muted ${
            centered ? "mx-auto max-w-[52ch]" : "max-w-[52ch]"
          }`}
        >
          {lead}
        </p>
      )}
    </Reveal>
  );
}
