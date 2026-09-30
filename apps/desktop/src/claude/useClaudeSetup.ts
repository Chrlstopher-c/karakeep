import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@karakeep/shared-react/trpc";

import { useActiveConnection } from "../connection/ConnectionContext";
import { log } from "../shared/log";
import { installMcp, mcpStatus } from "./claudeCode";

export type SetupStep = "key" | "config";

export interface ClaudeSetup {
  status: Awaited<ReturnType<typeof mcpStatus>> | undefined;
  agentKeys: {
    id: string;
    name: string;
    createdAt: Date;
    lastUsedAt: Date | null;
  }[];
  steps: SetupStep[];
  busy: boolean;
  error: string | null;
  install: () => Promise<void>;
  revoke: (id: string) => Promise<void>;
}

// « Ajouter à Claude Code » : une clé réservée à Claude (marquée agent), puis la
// déclaration du serveur MCP embarqué dans la configuration de Claude Code.
export function useClaudeSetup(): ClaudeSetup {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { address } = useActiveConnection();
  const status = useQuery({
    queryKey: ["savoir", "mcp-status"],
    queryFn: mcpStatus,
  });
  const keys = useQuery(trpc.agentActivity.keys.queryOptions());
  const createKey = useMutation(
    trpc.agentActivity.createAgentKey.mutationOptions(),
  );
  const revokeKey = useMutation(
    trpc.agentActivity.revokeAgentKey.mutationOptions(),
  );
  const [steps, setSteps] = useState<SetupStep[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const install = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    setSteps([]);
    try {
      const created = await createKey.mutateAsync({
        name: `Claude (Savoir ${new Date().toISOString().slice(0, 10)})`,
        agent: "claude",
      });
      setSteps(["key"]);
      await installMcp(address, created.key);
      setSteps(["key", "config"]);
    } catch (cause) {
      log.error("intégration Claude Code", cause);
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
      void status.refetch();
      void queryClient.invalidateQueries(trpc.agentActivity.keys.pathFilter());
    }
  };

  const revoke = async (id: string): Promise<void> => {
    await revokeKey.mutateAsync({ id });
    void queryClient.invalidateQueries(trpc.agentActivity.keys.pathFilter());
  };

  return {
    status: status.data,
    agentKeys: (keys.data ?? []).filter((k) => k.agent === "claude"),
    steps,
    busy,
    error,
    install,
    revoke,
  };
}
