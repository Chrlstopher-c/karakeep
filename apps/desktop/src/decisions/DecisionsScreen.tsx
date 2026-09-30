import type { ReactElement } from "react";
import { useState } from "react";
import { motion } from "motion/react";

import type { ZBookmark } from "@karakeep/shared/types/bookmarks";

import { useNavigation } from "../app/navigation";
import { useProvenance } from "../claude/useAgentActivity";
import type { DecisionStatus } from "../knowledge/conventions";
import { DECISION_STATUSES, projectOf, statusOf } from "../knowledge/conventions";
import { useDecisionBookmarks } from "../knowledge/useBookmarks";
import { useKnowledgeLists } from "../knowledge/useKnowledgeLists";
import { Button } from "../shared/Button";
import { Eyebrow } from "../shared/Eyebrow";
import { FilterChip } from "../shared/FilterChip";
import { Icon } from "../shared/Icon";
import { EASE_OUT_SOFT } from "../shared/motion";
import { Rise } from "../shared/Rise";
import { DecisionCard } from "./DecisionCard";
import { useDecisionActions } from "./useDecisionActions";

const COLUMNS: Record<DecisionStatus, { label: string; dot: string; empty: string }> = {
  ouverte: {
    label: "OUVERTES",
    dot: "var(--accent)",
    empty: "Aucune décision ouverte.",
  },
  tranchée: {
    label: "TRANCHÉES",
    dot: "var(--ok)",
    empty: "Aucune décision tranchée.",
  },
  abandonnée: {
    label: "ABANDONNÉES",
    dot: "var(--subtle)",
    empty: "Aucune décision abandonnée.",
  },
};

function Column({
  status,
  items,
  claudeIds,
}: {
  status: DecisionStatus;
  items: ZBookmark[];
  claudeIds: Set<string>;
}): ReactElement {
  const { go } = useNavigation();
  const col = COLUMNS[status];
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex items-center gap-2.5 px-1.5 pb-1.5 pt-1">
        <span className="size-2 rounded-full" style={{ background: col.dot }} />
        <span className="text-soft flex-1 font-mono text-[12px] leading-none tracking-[0.14em]">{col.label}</span>
        <span className="bg-surface-2 rounded-full px-2 py-1 font-mono text-[11px] leading-none text-muted">
          {items.length}
        </span>
      </div>
      {items.map((b) => (
        <motion.div key={b.id} layout transition={{ duration: 0.4, ease: EASE_OUT_SOFT }}>
          <DecisionCard
            bookmark={b}
            byClaude={claudeIds.has(b.id)}
            onOpen={() => go({ screen: "sheet", bookmarkId: b.id })}
          />
        </motion.div>
      ))}
      {items.length === 0 && (
        <div className="border-line-strong rounded-3xl border-[1.5px] border-dashed px-5 py-7 text-center text-sm font-medium leading-[1.4] text-muted">
          {col.empty}
        </div>
      )}
    </div>
  );
}

export function DecisionsScreen(): ReactElement {
  const decisions = useDecisionBookmarks();
  const provenance = useProvenance();
  const lists = useKnowledgeLists();
  const actions = useDecisionActions();
  const { go } = useNavigation();
  const [project, setProject] = useState<string | null>(null);
  const projects = [...new Set(decisions.bookmarks.map(projectOf).filter((p): p is string => !!p))].sort();
  const shown = decisions.bookmarks.filter((b) => !project || projectOf(b) === project);

  const newSheet = async (): Promise<void> => {
    if (!lists.decisions) return;
    const id = await actions.createSheet("Nouvelle décision", lists.decisions, project);
    go({ screen: "sheet", bookmarkId: id });
  };

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-[22px] px-10 pb-20 pt-9">
      <Rise className="flex flex-wrap items-end gap-5">
        <div className="flex min-w-60 flex-1 flex-col gap-3">
          <Eyebrow>LISTES</Eyebrow>
          <h1 className="text-text m-0 flex items-baseline gap-3 text-[28px] font-extrabold leading-[1.15] tracking-[-0.035em]">
            Décisions
            <span className="font-mono text-sm font-medium tracking-normal text-muted">{shown.length}</span>
          </h1>
        </div>
        <Button variant="primary" onClick={() => void newSheet()} disabled={!lists.decisions}>
          <Icon name="plus" size={16} stroke={2.2} />
          Nouvelle fiche
        </Button>
      </Rise>
      <Rise index={1} className="flex flex-wrap gap-1.5">
        <FilterChip active={project === null} onClick={() => setProject(null)}>
          Tous les projets
        </FilterChip>
        {projects.map((p) => (
          <FilterChip key={p} active={project === p} onClick={() => setProject(p)}>
            {p}
          </FilterChip>
        ))}
      </Rise>
      <Rise index={2} className="grid grid-cols-3 items-start gap-5">
        {DECISION_STATUSES.map((s) => (
          <Column
            key={s}
            status={s}
            items={shown.filter((b) => statusOf(b) === s)}
            claudeIds={provenance.bookmarkIds}
          />
        ))}
      </Rise>
    </div>
  );
}
