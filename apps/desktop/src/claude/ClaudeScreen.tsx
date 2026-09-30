import type { ReactElement } from "react";

import { Eyebrow } from "../shared/Eyebrow";
import { Rise } from "../shared/Rise";
import { ActivityJournal } from "./ActivityJournal";
import { AgentKeysCard } from "./AgentKeysCard";
import { McpCard } from "./McpCard";
import { ToolsCard } from "./ToolsCard";
import type { AgentActivity } from "./useAgentActivity";
import { useClaudeSetup } from "./useClaudeSetup";

export function ClaudeScreen({
  activity,
  following,
  onToggleFollow,
}: {
  activity: AgentActivity;
  following: boolean;
  onToggleFollow: () => void;
}): ReactElement {
  const setup = useClaudeSetup();
  return (
    <div className="mx-auto flex max-w-[1320px] flex-col gap-7 px-10 pb-20 pt-9">
      <Rise className="flex flex-col gap-3.5">
        <Eyebrow>INTÉGRATION</Eyebrow>
        <h1 className="text-text m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.035em]">
          Claude,{" "}
          <span className="inline-block -rotate-[2.5deg] rounded-[14px] bg-[#A774D4] px-[.26em] pb-[.06em] text-white">
            co-auteur
          </span>{" "}
          de la base
        </h1>
        <p className="m-0 max-w-[64ch] text-base font-medium leading-normal text-muted">
          Claude Code se connecte à Savoir par le serveur MCP karakeep. Ses
          actions arrivent par l’API comme celles de Chris et portent sa marque.
        </p>
      </Rise>
      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-5">
          <Rise index={1}>
            <McpCard setup={setup} busy={activity.busy} />
          </Rise>
          <Rise index={2}>
            <AgentKeysCard setup={setup} />
          </Rise>
          <Rise index={3}>
            <ToolsCard />
          </Rise>
        </div>
        <Rise index={2} className="flex min-w-0 max-w-[480px] flex-[1_1_360px]">
          <ActivityJournal
            items={activity.items}
            following={following}
            onToggleFollow={onToggleFollow}
          />
        </Rise>
      </div>
    </div>
  );
}
