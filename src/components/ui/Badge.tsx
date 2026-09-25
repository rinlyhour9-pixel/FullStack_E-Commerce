import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  tone?: "clay" | "forest" | "gold" | "ink";
}

const TONE_CLASSES: Record<NonNullable<BadgeProps["tone"]>, string> = {
  clay: "bg-clay text-cream",
  forest: "bg-forest text-cream",
  gold: "bg-gold text-ink",
  ink: "bg-ink text-cream",
};

export function Badge({ children, tone = "forest" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
