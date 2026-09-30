import { useQuery } from "@tanstack/react-query";

import { log } from "../shared/log";

const HEALTH_POLL_MS = 10_000;

// L'app reste utilisable hors ligne : on sonde /api/health pour afficher le bandeau.
export function useServerHealth(address: string): {
  online: boolean;
  retrying: boolean;
  retry: () => void;
} {
  const health = useQuery({
    queryKey: ["savoir", "health", address],
    queryFn: async () => {
      try {
        const res = await fetch(`${address}/api/health`, {
          signal: AbortSignal.timeout(5_000),
        });
        return res.ok;
      } catch (cause) {
        log.warn(`santé du serveur : ${String(cause)}`);
        return false;
      }
    },
    refetchInterval: HEALTH_POLL_MS,
  });
  return {
    online: health.data !== false,
    retrying: health.isFetching,
    retry: () => void health.refetch(),
  };
}
