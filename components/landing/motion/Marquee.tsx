/**
 * Infinite horizontal strip (in the spirit of Magic UI's Marquee). Pure CSS: the
 * children are rendered twice and the track slides by half its width. Pauses on hover.
 */
export function Marquee({
  children,
  reverse = false,
  duration = 40,
  gap = 12,
  className,
}: {
  children: React.ReactNode;
  reverse?: boolean;
  duration?: number;
  gap?: number;
  className?: string;
}) {
  const style = {
    "--marquee-duration": `${duration}s`,
    "--marquee-gap": `${gap}px`,
    gap,
  } as React.CSSProperties;

  return (
    <div className={`qm-marquee qm-fade-x overflow-hidden ${className ?? ""}`}>
      <div className="qm-marquee-track flex w-max" data-reverse={reverse} style={style}>
        <div className="flex shrink-0" style={{ gap }}>{children}</div>
        <div className="flex shrink-0" style={{ gap }} aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
