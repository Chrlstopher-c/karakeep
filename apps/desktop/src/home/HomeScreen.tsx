import type { ReactElement } from "react";

import { useNavigation } from "../app/navigation";
import type { AgentActivity } from "../claude/useAgentActivity";
import { useProvenance } from "../claude/useAgentActivity";
import { useAllHighlights } from "../highlights/useAllHighlights";
import { useSourceBookmarks } from "../knowledge/useBookmarks";
import { useOpenBookmark } from "../knowledge/useOpenBookmark";
import { Button } from "../shared/Button";
import { Eyebrow } from "../shared/Eyebrow";
import { Icon } from "../shared/Icon";
import { Kbd } from "../shared/Kbd";
import { Rise } from "../shared/Rise";
import { SectionHeader } from "../shared/SectionHeader";
import { longToday } from "../shared/time";
import { SourceCard } from "../sources/SourceCard";
import { toSourceView } from "../sources/sourceView";
import { ActivityAside } from "./ActivityAside";
import { OpenDecisions } from "./OpenDecisions";
import { ResumeCard } from "./ResumeCard";
import { useSinceYesterday } from "./useSinceYesterday";

const LATEST = 6;

function HomeHeader({
  onFollow,
  onCapture,
  summary,
}: {
  onFollow: () => void;
  onCapture: () => void;
  summary: string;
}): ReactElement {
  return (
    <header className="flex flex-wrap items-end gap-6">
      <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-4">
        <Eyebrow>{longToday().toUpperCase()}</Eyebrow>
        <h1 className="text-text m-0 text-balance text-[44px] font-extrabold leading-[1.08] tracking-[-0.045em]">
          Ce qui a{" "}
          <span className="duration-[450ms] ease-[cubic-bezier(.34,1.4,.64,1)] inline-block -rotate-[2.5deg] rounded-2xl bg-[#A774D4] px-[.26em] pb-[.06em] text-white transition-transform hover:-rotate-[.5deg] hover:scale-[1.08]">
            bougé
          </span>{" "}
          depuis hier
        </h1>
        <p className="m-0 max-w-[62ch] text-pretty text-base font-medium leading-normal text-muted">{summary}</p>
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={onFollow} className="text-soft hover:text-text h-10 pl-3.5 pr-2.5 text-sm">
          Suivre Claude <Kbd>F</Kbd>
        </Button>
        <Button variant="primary" onClick={onCapture}>
          <Icon name="plus" size={16} stroke={2.2} />
          Ajouter
        </Button>
      </div>
    </header>
  );
}

function LatestSources(): ReactElement {
  const { go } = useNavigation();
  const { open } = useOpenBookmark();
  const sources = useSourceBookmarks();
  const highlights = useAllHighlights();
  const provenance = useProvenance();
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Dernières sources"
        action="Tout voir"
        kbd="G S"
        onAction={() => go({ screen: "sources" })}
      />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[18px]">
        {sources.bookmarks.slice(0, LATEST).map((b) => (
          <SourceCard
            key={b.id}
            size="small"
            source={toSourceView(b)}
            highlights={highlights.byBookmark.get(b.id) ?? []}
            byClaude={provenance.bookmarkIds.has(b.id)}
            onOpen={() => open(b.id)}
          />
        ))}
      </div>
    </section>
  );
}

export function HomeScreen({
  activity,
  onFollow,
  onCapture,
}: {
  activity: AgentActivity;
  onFollow: () => void;
  onCapture: () => void;
}): ReactElement {
  const summary = useSinceYesterday(activity.items);
  return (
    <div className="mx-auto flex max-w-[1320px] flex-col gap-9 px-10 pb-20 pt-9">
      <Rise>
        <HomeHeader onFollow={onFollow} onCapture={onCapture} summary={summary} />
      </Rise>
      <div className="flex flex-wrap items-start gap-7">
        <div className="flex min-w-0 flex-[1_1_560px] flex-col gap-9">
          <Rise index={1}>
            <ResumeCard />
          </Rise>
          <Rise index={2}>
            <LatestSources />
          </Rise>
          <Rise index={3}>
            <OpenDecisions />
          </Rise>
        </div>
        <Rise index={2} className="flex min-w-0 max-w-[440px] flex-[1_1_300px]">
          <ActivityAside activity={activity} />
        </Rise>
      </div>
    </div>
  );
}
