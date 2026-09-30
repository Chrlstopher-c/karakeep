import type { ReactElement, ReactNode } from "react";
import { motion } from "motion/react";

import { EASE_OUT_SOFT, riseDelay } from "./motion";

// Entrée d'un bloc d'écran : +16 px et fondu, en cascade de 60 ms.
export function Rise({
  index = 0,
  className,
  children,
}: {
  index?: number;
  className?: string;
  children: ReactNode;
}): ReactElement {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: EASE_OUT_SOFT,
        delay: riseDelay(index),
      }}
    >
      {children}
    </motion.div>
  );
}
