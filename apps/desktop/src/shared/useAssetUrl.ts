import { useQuery } from "@tanstack/react-query";

import { useActiveConnection } from "../connection/ConnectionContext";
import { log } from "./log";

// Les fichiers du serveur exigent la clé API : on les charge en blob et on
// sert une URL locale au webview (une balise <img> ne peut pas envoyer l'en-tête).
export function useAssetUrl(
  assetId: string | null | undefined,
): string | undefined {
  const { address, apiKey } = useActiveConnection();
  const { data } = useQuery({
    queryKey: ["savoir", "asset", address, assetId],
    enabled: !!assetId,
    staleTime: Infinity,
    gcTime: 10 * 60_000,
    queryFn: async () => {
      try {
        const res = await fetch(`${address}/api/assets/${assetId}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return URL.createObjectURL(await res.blob());
      } catch (cause) {
        log.warn(`fichier ${assetId} indisponible : ${String(cause)}`);
        return null;
      }
    },
  });
  return data ?? undefined;
}
