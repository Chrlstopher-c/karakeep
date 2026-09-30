import type { ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";

import { useTRPC } from "@karakeep/shared-react/trpc";

import symbolUrl from "../../design/brand/symbol-white.svg";
import { Button } from "../shared/Button";
import { SCREEN_TRANSITION } from "../shared/motion";
import { BookmarkCard } from "./BookmarkCard";

const RECENT_LIMIT = 24;

function Header({ onDisconnect }: { onDisconnect: () => void }): ReactElement {
  const trpc = useTRPC();
  const me = useQuery(trpc.users.whoami.queryOptions());
  return (
    <header className="flex items-center gap-3 border-b border-border px-6 py-4">
      <img src={symbolUrl} alt="" className="h-7 w-7" />
      <span className="text-text text-lg font-extrabold tracking-tight">
        Savoir
      </span>
      <span className="text-text-muted ml-auto font-mono text-xs">
        {me.data?.name ?? ""}
      </span>
      <Button variant="ghost" onClick={onDisconnect}>
        Se déconnecter
      </Button>
    </header>
  );
}

export function LibraryHome({
  onDisconnect,
}: {
  onDisconnect: () => void;
}): ReactElement {
  const trpc = useTRPC();
  const recent = useQuery(
    trpc.bookmarks.getBookmarks.queryOptions({
      limit: RECENT_LIMIT,
      useCursorV2: true,
    }),
  );
  return (
    <motion.div
      className="flex h-full flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={SCREEN_TRANSITION}
    >
      <Header onDisconnect={onDisconnect} />
      <main className="flex-1 overflow-y-auto px-6 py-6">
        {recent.isError && (
          <p role="alert" className="text-accent-text">
            Chargement impossible : {recent.error.message}
          </p>
        )}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
          {recent.data?.bookmarks.map((b, i) => (
            <BookmarkCard key={b.id} bookmark={b} index={i} />
          ))}
        </div>
      </main>
    </motion.div>
  );
}
