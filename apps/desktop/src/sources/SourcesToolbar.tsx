import type { ReactElement } from "react";

import { Button } from "../shared/Button";
import { Eyebrow } from "../shared/Eyebrow";
import { FilterChip } from "../shared/FilterChip";
import { Icon } from "../shared/Icon";
import { Segmented } from "../shared/Segmented";
import type { SourceKind } from "./sourceView";
import type { Author, SourceFilters, SourceLayout } from "./useSourceFilters";

const KINDS: { value: SourceKind | "all"; label: string }[] = [
  { value: "all", label: "Tous types" },
  { value: "lien", label: "Liens" },
  { value: "note", label: "Notes" },
  { value: "pdf", label: "PDF" },
  { value: "image", label: "Images" },
];

const AUTHORS: { value: Author; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "chris", label: "Chris" },
  { value: "claude", label: "Claude" },
];

const LAYOUTS: { value: SourceLayout; label: ReactElement; title: string }[] = [
  { value: "grid", label: <Icon name="grid" size={16} />, title: "Grille" },
  { value: "list", label: <Icon name="rows" size={16} />, title: "Liste" },
  {
    value: "compact",
    label: <Icon name="list" size={16} />,
    title: "Compacte",
  },
];

export function SourcesHeader({
  count,
  filters,
  onCapture,
}: {
  count: number;
  filters: SourceFilters;
  onCapture: () => void;
}): ReactElement {
  return (
    <header className="flex flex-wrap items-end gap-5">
      <div className="flex min-w-60 flex-1 flex-col gap-3">
        <Eyebrow>LISTES</Eyebrow>
        <h1 className="text-text m-0 flex items-baseline gap-3 text-[28px] font-extrabold leading-[1.15] tracking-[-0.035em]">
          Sources
          <span className="font-mono text-sm font-medium leading-none tracking-normal text-muted">{count}</span>
        </h1>
      </div>
      <Segmented square options={LAYOUTS} value={filters.layout} onChange={filters.setLayout} />
      <Button variant="primary" onClick={onCapture}>
        <Icon name="plus" size={16} stroke={2.2} />
        Ajouter
      </Button>
    </header>
  );
}

export function SourcesFilterBar({ filters }: { filters: SourceFilters }): ReactElement {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Segmented options={AUTHORS} value={filters.author} onChange={filters.setAuthor} />
      <div className="flex flex-wrap gap-1.5">
        {KINDS.map((k) => (
          <FilterChip key={k.value} active={filters.kind === k.value} onClick={() => filters.setKind(k.value)}>
            {k.label}
          </FilterChip>
        ))}
      </div>
      <span className="flex-1" />
      <button
        type="button"
        onClick={filters.toggleSort}
        className="hover:text-text flex h-8 cursor-pointer items-center gap-2 rounded-[10px] border-0 bg-transparent px-3 text-[13px] font-semibold text-muted"
      >
        <Icon name="sort" size={15} />
        {filters.sort === "recent" ? "Plus récentes" : "Titre A → Z"}
      </button>
      <span className="text-subtle font-mono text-[11px] leading-none">J / K · ENTRÉE</span>
    </div>
  );
}
