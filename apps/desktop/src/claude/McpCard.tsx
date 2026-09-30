import type { ReactElement } from "react";
import { AnimatePresence, motion } from "motion/react";

import { Button } from "../shared/Button";
import { Icon } from "../shared/Icon";
import { SPRING_SNAPPY } from "../shared/motion";
import type { ClaudeSetup } from "./useClaudeSetup";

const STEP_LABEL = {
  key: "Clé réservée à Claude créée",
  config: "Déclaration écrite dans ~/.claude.json",
};

function Row({
  k,
  v,
  mono = true,
}: {
  k: string;
  v: string;
  mono?: boolean;
}): ReactElement {
  return (
    <>
      <span className="font-mono text-[11px] leading-[1.8] tracking-[0.12em] text-muted">
        {k}
      </span>
      <span
        className={
          mono
            ? "text-text break-all font-mono text-[13px] leading-[1.6]"
            : "text-soft text-[13px]"
        }
      >
        {v}
      </span>
    </>
  );
}

export function McpCard({
  setup,
  busy: claudeBusy,
}: {
  setup: ClaudeSetup;
  busy: boolean;
}): ReactElement {
  const st = setup.status;
  const configured = !!st?.configured;
  const title = configured
    ? st?.managedBySavoir
      ? "Connecté par Savoir"
      : "Déclaré dans Claude Code"
    : "Non configuré";
  const sub = configured
    ? `serveur MCP karakeep${st?.address ? ` → ${st.address}` : ""}`
    : "Claude Code ne connaît pas encore Savoir";
  return (
    <div className="bg-surface flex flex-col gap-5 rounded-[28px] px-7 py-[26px] shadow-ring">
      <div className="flex items-center gap-4">
        <span className="relative size-3.5 flex-none">
          <span
            className={`absolute inset-0 rounded-full ${configured ? "bg-ok" : "bg-warn"}`}
          />
          {claudeBusy && (
            <span className="absolute inset-0 animate-[sv-ping_1.4s_cubic-bezier(.2,.7,.2,1)_infinite] rounded-full border-[1.5px] border-accent" />
          )}
        </span>
        <div className="flex flex-1 flex-col gap-1.5">
          <span className="text-text text-[19px] font-extrabold leading-[1.2] tracking-[-0.025em]">
            {title}
          </span>
          <span className="font-mono text-[12px] leading-[1.3] text-muted">
            {sub}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-2.5">
        <Row k="SERVEUR MCP" v="karakeep (embarqué dans Savoir)" />
        <Row k="LANCEMENT" v={st?.command ?? "—"} />
        <Row
          k="PORTÉE"
          v="Configuration utilisateur de Claude Code"
          mono={false}
        />
      </div>
      <div className="flex flex-col gap-3.5 pt-1">
        <span className="text-soft max-w-[60ch] text-sm font-medium leading-normal">
          {configured && !st?.managedBySavoir
            ? "Une déclaration karakeep existe déjà (installée à la main). La remplacer crée une nouvelle clé réservée à Claude et pointe vers le serveur embarqué."
            : "Savoir génère une clé réservée à Claude, puis écrit la déclaration du serveur dans la configuration de Claude Code."}
        </span>
        <div className="flex flex-wrap items-center gap-4">
          <Button
            variant="primary"
            onClick={() => void setup.install()}
            disabled={setup.busy}
          >
            {setup.busy
              ? "Configuration…"
              : configured
                ? "Reconfigurer"
                : "Ajouter à Claude Code"}
          </Button>
          <AnimatePresence>
            {setup.steps.map((s) => (
              <motion.span
                key={s}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={SPRING_SNAPPY}
                className="text-soft flex items-center gap-2 font-mono text-[12px] leading-none"
              >
                <span className="bg-ok grid size-4 place-items-center rounded-full text-white">
                  <Icon name="check" size={11} stroke={3} />
                </span>
                {STEP_LABEL[s]}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
        {setup.error && (
          <span role="alert" className="text-err font-mono text-[12px]">
            {setup.error}
          </span>
        )}
        {setup.steps.includes("config") && (
          <span className="text-[13px] text-muted">
            Relancer Claude Code pour qu’il charge le serveur.
          </span>
        )}
      </div>
    </div>
  );
}
