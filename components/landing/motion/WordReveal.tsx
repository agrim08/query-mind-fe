"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Word-by-word blur-in (in the spirit of React Bits' BlurText).
 * Words are inline-block so the browser still wraps lines naturally.
 */
export function WordReveal({
  text,
  delay = 0,
  stagger = 0.06,
  className,
  wordClassName,
}: {
  text: string;
  delay?: number;
  stagger?: number;
  className?: string;
  wordClassName?: string;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className={`inline-block will-change-transform ${wordClassName ?? ""}`}
          initial={reduce ? false : { opacity: 0, y: "0.35em", filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: delay + i * stagger, ease: [0.22, 1, 0.36, 1] }}
        >
          {word}
          {i < words.length - 1 && " "}
        </motion.span>
      ))}
    </span>
  );
}
