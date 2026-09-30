import type { ReactElement } from "react";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import type { ZBookmark } from "@karakeep/shared/types/bookmarks";
import { getBookmarkTitle } from "@karakeep/shared/utils/bookmarkUtils";

import { projectOf, statusOf } from "../knowledge/conventions";
import {
  useAllBookmarks,
  useDecisionBookmarks,
} from "../knowledge/useBookmarks";
import { useOpenBookmark } from "../knowledge/useOpenBookmark";
import { Eyebrow } from "../shared/Eyebrow";
import { Icon } from "../shared/Icon";
import { EASE_OUT_SOFT } from "../shared/motion";
import { Rise } from "../shared/Rise";

interface Project {
  name: string;
  items: ZBookmark[];
  decisions: number;
  open: number;
}

// Un projet = le tag projet:<nom> (convention du guide).
function groupProjects(all: ZBookmark[], decisionIds: Set<string>): Project[] {
  const map = new Map<string, Project>();
  for (const b of all) {
    const name = projectOf(b);
    if (!name) continue;
    const p = map.get(name) ?? { name, items: [], decisions: 0, open: 0 };
    p.items.push(b);
    if (decisionIds.has(b.id)) {
      p.decisions += 1;
      if (statusOf(b) === "ouverte") p.open += 1;
    }
    map.set(name, p);
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

function ProjectCard({ project }: { project: Project }): ReactElement {
  const [expanded, setExpanded] = useState(false);
  const { open } = useOpenBookmark();
  const sources = project.items.length - project.decisions;
  return (
    <div className="bg-surface flex flex-col gap-3 rounded-3xl p-6 shadow-ring">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex cursor-pointer items-start gap-3 border-0 bg-transparent p-0 text-left"
      >
        <span className="flex flex-1 flex-col gap-2">
          <span className="text-text text-[22px] font-extrabold leading-[1.15] tracking-[-0.03em]">
            {project.name}
          </span>
          <span className="font-mono text-[12px] text-muted">
            {project.decisions} décision{project.decisions > 1 ? "s" : ""} ·{" "}
            {project.open} ouverte{project.open > 1 ? "s" : ""} · {sources}{" "}
            source{sources > 1 ? "s" : ""}
          </span>
        </span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          className="text-muted"
        >
          <Icon name="chevronDown" size={16} stroke={2} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE_OUT_SOFT }}
            className="border-line flex flex-col border-t pt-2"
          >
            {project.items.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => open(b.id)}
                className="text-soft hover:bg-surface-2 hover:text-text cursor-pointer truncate rounded-lg border-0 bg-transparent px-2 py-2 text-left text-sm font-semibold"
              >
                {getBookmarkTitle(b) ?? "Sans titre"}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ProjectsScreen(): ReactElement {
  const all = useAllBookmarks();
  const decisions = useDecisionBookmarks();
  const projects = groupProjects(
    all.bookmarks,
    new Set(decisions.bookmarks.map((b) => b.id)),
  );
  return (
    <div className="mx-auto flex max-w-[1320px] flex-col gap-6 px-10 pb-20 pt-9">
      <Rise className="flex flex-col gap-3">
        <Eyebrow>LISTES</Eyebrow>
        <h1 className="text-text m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.035em]">
          Projets
        </h1>
      </Rise>
      {!all.loading && projects.length === 0 && (
        <Rise
          index={1}
          className="border-line-strong rounded-3xl border-[1.5px] border-dashed px-6 py-10 text-center text-sm text-muted"
        >
          Aucun projet. Un projet apparaît dès qu’un élément porte le tag
          projet:&lt;nom&gt;.
        </Rise>
      )}
      <Rise
        index={1}
        className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] items-start gap-5"
      >
        {projects.map((p) => (
          <ProjectCard key={p.name} project={p} />
        ))}
      </Rise>
    </div>
  );
}
