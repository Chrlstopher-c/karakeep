import type { ReactElement } from "react";
import { motion } from "motion/react";

import { Icon } from "../shared/Icon";
import { Kbd } from "../shared/Kbd";
import { EASE_OUT_SOFT } from "../shared/motion";
import type { PaletteState } from "./usePalette";
import { usePalette } from "./usePalette";
import type { PaletteItem } from "./usePaletteResults";

const KIND_COLOR: Record<PaletteItem["kind"], string> = {
  COMMANDE: "var(--muted)",
  SOURCE: "var(--accent-ink)",
  DÉCISION: "var(--ok)",
  SURLIGNÉ: "var(--hl-yellow)",
};

function Row({
  item,
  selected,
  onHover,
  onRun,
}: {
  item: PaletteItem;
  selected: boolean;
  onHover: () => void;
  onRun: () => void;
}): ReactElement {
  return (
    <button
      type="button"
      data-pal-selected={selected || undefined}
      onClick={onRun}
      onMouseMove={onHover}
      className="text-text relative flex w-full cursor-pointer items-center gap-3.5 rounded-xl border-0 bg-transparent px-3 py-2.5 text-left"
    >
      {selected && (
        <motion.span
          layoutId="palette-selection"
          className="bg-active absolute inset-0 rounded-xl"
          transition={{ duration: 0.18, ease: EASE_OUT_SOFT }}
        />
      )}
      <span
        className="relative w-[72px] flex-none font-mono text-[10px] leading-none tracking-[0.12em]"
        style={{ color: KIND_COLOR[item.kind] }}
      >
        {item.kind}
      </span>
      <span className="relative flex min-w-0 flex-1 flex-col gap-[5px]">
        <span className="truncate text-sm font-bold leading-[1.3]">{item.title}</span>
        {item.snippet && (
          <span className="line-clamp-2 text-[13px] font-medium leading-[1.45] text-muted">{item.snippet}</span>
        )}
      </span>
      {item.kbd && (
        <span className="relative">
          <Kbd>{item.kbd}</Kbd>
        </span>
      )}
    </button>
  );
}

function Results({ p }: { p: PaletteState }): ReactElement {
  let index = -1;
  return (
    <div ref={p.listRef} className="border-line relative max-h-[440px] overflow-auto border-t px-2 pb-2 pt-1.5">
      {p.groups.map((g) => (
        <div key={g.label}>
          <div className="px-3 pb-1.5 pt-3 font-mono text-[11px] leading-none tracking-[0.14em] text-muted">
            {g.label}
          </div>
          {g.items.map((item) => {
            index += 1;
            const i = index;
            return (
              <Row
                key={item.key}
                item={item}
                selected={i === p.sel}
                onHover={() => p.setSel(i)}
                onRun={() => p.run(item)}
              />
            );
          })}
        </div>
      ))}
      {p.count === 0 && (
        <div className="px-3 py-7 text-center text-sm font-medium text-muted">Rien ne correspond à « {p.query} ».</div>
      )}
    </div>
  );
}

function SearchField({ p }: { p: PaletteState }): ReactElement {
  return (
    <div className="flex h-[60px] items-center gap-3 pl-5 pr-4 text-muted">
      <Icon name="search" size={18} stroke={2} />
      <input
        autoFocus
        value={p.query}
        onChange={(e) => p.setQuery(e.target.value)}
        onKeyDown={p.onKey}
        placeholder="Rechercher dans la base ou taper une commande"
        aria-label="Rechercher"
        className="text-text h-10 flex-1 border-0 bg-transparent text-[17px] font-semibold leading-none outline-none"
      />
      <Kbd>ÉCHAP</Kbd>
    </div>
  );
}

export function Palette({
  onClose,
  onCapture,
  onToggleFollow,
}: {
  onClose: () => void;
  onCapture: () => void;
  onToggleFollow: () => void;
}): ReactElement {
  const p = usePalette(onClose, onCapture, onToggleFollow);
  return (
    <div className="absolute inset-0 z-20 flex items-start justify-center pt-[12vh]">
      <motion.div
        className="bg-scrim absolute inset-0"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.14 }}
      />
      <motion.div
        role="dialog"
        aria-label="Palette de commandes"
        className="bg-pop shadow-modal relative flex w-[640px] max-w-[calc(100%-48px)] flex-col overflow-hidden rounded-3xl"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.22, ease: EASE_OUT_SOFT }}
      >
        <SearchField p={p} />
        <Results p={p} />
        <div className="border-line flex h-10 items-center gap-[18px] border-t px-5 font-mono text-[11px] leading-none text-muted">
          <span>↑↓ NAVIGUER</span>
          <span>ENTRÉE OUVRIR</span>
          <span className="flex-1" />
          <span>G S · G D · G H · G P</span>
        </div>
      </motion.div>
    </div>
  );
}
