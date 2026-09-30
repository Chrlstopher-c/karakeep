import type { Transition } from "motion/react";

// Courbes du design system : on n'anime que transform et opacity (WebKitGTK).
export const EASE_OUT_SOFT = [0.2, 0.7, 0.2, 1] as const;

export const SCREEN_TRANSITION: Transition = {
  duration: 0.32,
  ease: EASE_OUT_SOFT,
};

export const SPRING_SNAPPY: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 32,
};
