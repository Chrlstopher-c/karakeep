import type { ReactElement } from "react";
import { useState } from "react";

import type { ZBookmark } from "@karakeep/shared/types/bookmarks";

import { statusOf } from "../knowledge/conventions";
import { ClaudeBadge } from "../shared/ClaudeBadge";
import { parseSheet } from "./sheetModel";
import { Dashed, LinkedSources, OptionsTable, Prose, Recommendation, SheetSection } from "./SheetSections";
import type { DecisionActions } from "./useDecisionActions";

function DecisionBlock({
  decided,
  decision,
  proposal,
  byClaude,
  onUndo,
}: {
  decided: boolean;
  decision: string | null;
  proposal: string | null;
  byClaude: boolean;
  onUndo?: () => void;
}): ReactElement {
  return (
    <div
      className={`relative flex flex-col gap-3.5 overflow-hidden rounded-[28px] px-[30px] py-7 shadow-ring ${decided ? "bg-active" : "bg-surface"}`}
    >
      {decided ? (
        <>
          <span className="text-accent-ink font-mono text-[11px] leading-none tracking-[0.14em]">DÉCISION PRISE</span>
          <span className="text-text text-balance text-[26px] font-extrabold leading-[1.25] tracking-[-0.03em]">
            {decision}
          </span>
          {onUndo && (
            <button
              type="button"
              onClick={onUndo}
              className="text-accent-ink hover:text-text cursor-pointer self-start border-0 bg-transparent p-0 text-[13px] font-bold"
            >
              Annuler et rouvrir
            </button>
          )}
        </>
      ) : (
        <>
          <span className="text-[26px] font-extrabold leading-[1.2] tracking-[-0.03em] text-muted">À trancher</span>
          {proposal && <Recommendation text={proposal} byClaude={byClaude} />}
          <span className="font-mono text-[12px] leading-[1.4] text-muted">
            Retenir une option dans le tableau pour trancher.
          </span>
        </>
      )}
    </div>
  );
}

interface BodyState {
  bookmark: ZBookmark;
  sheet: ReturnType<typeof parseSheet>;
  decided: boolean;
  byClaude: boolean;
  pick: (name: string) => void;
  undo?: () => void;
}

function useSheetBody(bookmark: ZBookmark, text: string, byClaude: boolean, actions: DecisionActions): BodyState {
  const [undoText, setUndoText] = useState<string | null>(null);
  const pick = (name: string): void => {
    setUndoText(text);
    void actions.decide(bookmark, name);
  };
  const undo = (): void => {
    if (undoText !== null) void actions.reopen(bookmark, undoText);
    setUndoText(null);
  };
  return {
    bookmark,
    byClaude,
    pick,
    sheet: parseSheet(text),
    decided: statusOf(bookmark) === "tranchée",
    undo: undoText === null ? undefined : undo,
  };
}

function OptionsSection({ s }: { s: BodyState }): ReactElement {
  const badge = s.byClaude && s.sheet.options.length > 0 ? <ClaudeBadge label="RÉDIGÉ PAR CLAUDE" /> : undefined;
  return (
    <SheetSection index={3} n="02" title="Options" badge={badge}>
      {s.sheet.options.length > 0 ? (
        <OptionsTable
          options={s.sheet.options}
          chosen={s.decided ? s.sheet.decision : null}
          canPick={!s.decided}
          onPick={s.pick}
        />
      ) : (
        <Dashed>Aucune option rédigée. Éditer la fiche (E) pour en ajouter.</Dashed>
      )}
    </SheetSection>
  );
}

export function SheetBody({
  bookmark,
  text,
  byClaude,
  actions,
}: {
  bookmark: ZBookmark;
  text: string;
  byClaude: boolean;
  actions: DecisionActions;
}): ReactElement {
  const s = useSheetBody(bookmark, text, byClaude, actions);
  const { sheet } = s;
  return (
    <>
      <SheetSection index={2} n="01" title="Contexte">
        {sheet.context ? <Prose markdown={sheet.context} /> : <Dashed>Contexte à rédiger.</Dashed>}
      </SheetSection>
      <OptionsSection s={s} />
      <SheetSection index={4} n="03" title="Décision">
        <DecisionBlock
          decided={s.decided}
          decision={sheet.decision}
          proposal={s.decided ? null : sheet.decision}
          byClaude={byClaude}
          onUndo={s.undo}
        />
      </SheetSection>
      <SheetSection index={5} n="04" title="Conséquences">
        {sheet.consequences ? (
          <Prose markdown={sheet.consequences} />
        ) : (
          <Dashed>Conséquences à rédiger une fois la décision prise.</Dashed>
        )}
      </SheetSection>
      <SheetSection index={6} n="05" title="Sources liées">
        {sheet.sources.length > 0 ? <LinkedSources sources={sheet.sources} /> : <Dashed>Aucune source liée.</Dashed>}
      </SheetSection>
    </>
  );
}
