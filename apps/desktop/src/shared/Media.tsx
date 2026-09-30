import type { ReactElement } from "react";

import { useAssetUrl } from "./useAssetUrl";

// Image de la source, ou motif hachuré du prototype quand il n'y en a pas.
export function Media({
  imageUrl,
  assetId,
  label,
  className = "",
}: {
  imageUrl?: string | null;
  assetId?: string | null;
  label: string;
  className?: string;
}): ReactElement {
  const assetUrl = useAssetUrl(assetId);
  const src = assetUrl ?? imageUrl ?? undefined;
  return (
    <div
      className={`relative overflow-hidden bg-[repeating-linear-gradient(135deg,transparent_0_11px,var(--ph-line)_11px_12px),var(--ph-a)] ${className}`}
    >
      {src ? (
        <img src={src} alt="" loading="lazy" draggable={false} className="absolute inset-0 size-full object-cover" />
      ) : (
        <span className="absolute bottom-3 left-3.5 font-mono text-[10.5px] uppercase leading-none tracking-[0.1em] text-muted">
          {label}
        </span>
      )}
    </div>
  );
}
