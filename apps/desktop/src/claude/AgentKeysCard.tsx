import type { ReactElement } from "react";
import { useState } from "react";

import { relativeTime, shortDate } from "../shared/time";
import type { ClaudeSetup } from "./useClaudeSetup";

export function AgentKeysCard({ setup }: { setup: ClaudeSetup }): ReactElement {
  const [asking, setAsking] = useState<string | null>(null);
  return (
    <div className="bg-surface flex flex-col gap-4 rounded-[28px] px-7 py-6 shadow-ring">
      <h2 className="text-text m-0 text-base font-bold">Clés d’accès de Claude</h2>
      {setup.agentKeys.length === 0 && <span className="text-sm text-muted">Aucune clé réservée à Claude.</span>}
      {setup.agentKeys.map((k) => (
        <div
          key={k.id}
          className="border-line flex flex-col gap-3 border-t pt-3 first-of-type:border-t-0 first-of-type:pt-0"
        >
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-[12px] leading-[1.4] text-muted">
            <span className="text-text text-[13px]">{k.name}</span>
            <span>Créée le {shortDate(k.createdAt)}</span>
            <span>Dernière utilisation : {k.lastUsedAt ? relativeTime(k.lastUsedAt) : "jamais"}</span>
          </div>
          {asking === k.id ? (
            <div className="bg-surface-2 flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3.5 shadow-[inset_0_0_0_1px_var(--line-strong)]">
              <span className="text-text min-w-[220px] flex-1 text-sm font-semibold leading-[1.45]">
                Révoquer cette clé ? Claude Code ne pourra plus rien lire ni écrire avec.
              </span>
              <button
                type="button"
                onClick={() => setAsking(null)}
                className="text-soft h-9 cursor-pointer rounded-[10px] border-0 bg-transparent px-3 text-[13px] font-bold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  void setup.revoke(k.id);
                  setAsking(null);
                }}
                className="bg-err h-9 cursor-pointer rounded-[10px] border-0 px-3.5 text-[13px] font-bold text-white"
              >
                Révoquer
              </button>
            </div>
          ) : (
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setAsking(k.id)}
                className="bg-surface-2 text-err hover:bg-surface-3 h-10 cursor-pointer rounded-[10px] border-0 px-3.5 text-sm font-bold"
              >
                Révoquer
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
