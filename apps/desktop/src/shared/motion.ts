import type { Transition } from "motion/react";

// Courbes du prototype. On n'anime que transform et opacity (WebKitGTK).
export const EASE_OUT_SOFT = [0.2, 0.7, 0.2, 1] as const;
export const EASE_DAMPED = [0.22, 1, 0.36, 1] as const;
export const EASE_SPRING = [0.34, 1.4, 0.64, 1] as const;
export const EASE_SWEEP = [0.5, 0, 0.3, 1] as const;

export const DAMPED: Transition = { duration: 0.36, ease: EASE_DAMPED };
export const SCREEN_TRANSITION: Transition = {
  duration: 0.36,
  ease: EASE_OUT_SOFT,
};
export const SPRING_SNAPPY: Transition = { duration: 0.48, ease: EASE_SPRING };

// Cascade d'entrée des blocs d'un écran (« rise » : +16 px, 60 ms, 10 max).
export function riseDelay(index: number, step = 0.06, max = 10): number {
  return Math.min(index, max) * step;
}
