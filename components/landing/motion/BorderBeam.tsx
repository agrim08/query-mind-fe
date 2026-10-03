/**
 * A thin beam of light that travels around a card's border (in the spirit of
 * Magic UI's BorderBeam / ShineBorder). A rotating conic gradient sits behind a
 * 1px gap; the card's own background covers everything except that gap.
 */
export function BorderBeam({
  children,
  className,
  innerClassName,
  duration = 8,
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  duration?: number;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-px ${className ?? ""}`}>
      <div className="pointer-events-none absolute inset-0 bg-line" aria-hidden />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[250%] -translate-x-1/2 -translate-y-1/2"
        aria-hidden
      >
        <div
          className="qm-beam h-full w-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, transparent 300deg, var(--accent) 345deg, transparent 360deg)",
            animation: `qm-beam-spin ${duration}s linear infinite`,
          }}
        />
      </div>
      <div className={`relative rounded-[15px] ${innerClassName ?? "bg-surface"}`}>{children}</div>
    </div>
  );
}
