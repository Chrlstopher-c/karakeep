import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@karakeep/shared-react/trpc";

import { useActiveConnection } from "../connection/ConnectionContext";
import { log } from "../shared/log";
import type { McpStatus } from "./claudeCode";
import { installMcp, mcpStatus } from "./claudeCode";

export type SetupStep = "key" | "config";

export interface ClaudeSetup {
  status: McpStatus | undefined;
  agentKeys: { id: string; name: string; createdAt: Date; lastUsedAt: Date | null }[];
  steps: SetupStep[];
  busy: boolean;
  error: string | null;
  install: () => Promise<void>;
  revoke: (id: string) => Promise<void>;
}

interface InstallProgress {
  steps: SetupStep[];
  busy: boolean;
  error: string | null;
}

const IDLE: InstallProgress = { steps: [], busy: false, error: null };

// « Ajouter à Claude Code » : une clé réservée à Claude (marquée agent), puis la
// déclaration du serveur MCP embarqué dans la configuration de Claude Code.
function useInstall(
  address: string,
  onFinished: () => void,
): { progress: InstallProgress; install: () => Promise<void> } {
  const trpc = useTRPC();
  const createKey = useMutation(trpc.agentActivity.createAgentKey.mutationOptions());
  const [progress, setProgress] = useState<InstallProgress>(IDLE);
  const install = async (): Promise<void> => {
    setProgress({ ...IDLE, busy: true });
    try {
      const name = `Claude (Savoir ${new Date().toISOString().slice(0, 10)})`;
      const created = await createKey.mutateAsync({ name, agent: "claude" });
      setProgress({ steps: ["key"], busy: true, error: null });
      await installMcp(address, created.key);
      setProgress({ steps: ["key", "config"], busy: false, error: null });
    } catch (cause) {
      log.error("intégration Claude Code", cause);
      setProgress((p) => ({ ...p, busy: false, error: cause instanceof Error ? cause.message : String(cause) }));
    } finally {
      onFinished();
    }
  };
  return { progress, install };
}

export function useClaudeSetup(): ClaudeSetup {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { address } = useActiveConnection();
  const status = useQuery({ queryKey: ["savoir", "mcp-status"], queryFn: mcpStatus });
  const keys = useQuery(trpc.agentActivity.keys.queryOptions());
  const revokeKey = useMutation(trpc.agentActivity.revokeAgentKey.mutationOptions());
  const refreshKeys = (): void => void queryClient.invalidateQueries(trpc.agentActivity.keys.pathFilter());
  const { progress, install } = useInstall(address, () => {
    void status.refetch();
    refreshKeys();
  });
  return {
    ...progress,
    status: status.data,
    agentKeys: (keys.data ?? []).filter((k) => k.agent === "claude"),
    install,
    revoke: async (id) => {
      await revokeKey.mutateAsync({ id });
      refreshKeys();
    },
  };
}
