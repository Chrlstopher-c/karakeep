import type { ReactElement } from "react";
import { motion } from "motion/react";

import { EASE_OUT_SOFT } from "../shared/motion";

export function OfflineBanner({
  serverLabel,
  retrying,
  onRetry,
}: {
  serverLabel: string;
  retrying: boolean;
  onRetry: () => void;
}): ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: EASE_OUT_SOFT }}
      className="border-line bg-surface-2 text-soft flex flex-none items-center gap-3.5 border-b px-5 py-2.5 text-sm font-medium leading-[1.4]"
    >
      <span className="bg-warn size-2 flex-none rounded-full" />
      <span className="min-w-0 flex-1">
        Serveur injoignable : {serverLabel} ne répond pas. Le contenu déjà
        chargé reste consultable en lecture seule.
      </span>
      <button
        type="button"
        onClick={onRetry}
        className="bg-surface-3 text-text flex h-8 flex-none cursor-pointer items-center gap-2 rounded-[10px] border-0 px-3 text-[13px] font-bold"
      >
        {retrying && (
          <span className="size-3 animate-[sv-spin_.8s_linear_infinite] rounded-full border-2 border-accent border-r-transparent" />
        )}
        {retrying ? "Reconnexion…" : "Réessayer"}
      </button>
    </motion.div>
  );
}
