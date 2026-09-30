import type { ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@karakeep/shared-react/trpc";

import { useNavigation } from "../app/navigation";
import { Eyebrow } from "../shared/Eyebrow";
import { Media } from "../shared/Media";
import { toSourceView } from "../sources/sourceView";

export function ResumeCard(): ReactElement | null {
  const trpc = useTRPC();
  const { go } = useNavigation();
  const current = useQuery(trpc.readingProgress.current.queryOptions());
  const bookmarkId = current.data?.bookmarkId;
  const bookmark = useQuery({
    ...trpc.bookmarks.getBookmark.queryOptions({
      bookmarkId: bookmarkId ?? "",
    }),
    enabled: !!bookmarkId,
  });
  if (!current.data || !bookmark.data) return null;
  const source = toSourceView(bookmark.data);
  const percent = current.data.percent ?? 0;
  return (
    <button
      type="button"
      onClick={() => go({ screen: "reader", bookmarkId: source.id })}
      className="bg-surface hover:shadow-lift flex w-full cursor-pointer overflow-hidden rounded-3xl border-0 p-0 text-left shadow-ring transition-[transform,box-shadow] duration-200 hover:-translate-y-1"
    >
      <Media
        imageUrl={source.imageUrl}
        assetId={source.imageAssetId}
        label={source.domain}
        className="min-h-[190px] w-[36%] max-w-[280px] flex-none"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5 px-7 py-6">
        <Eyebrow>REPRENDRE LA LECTURE</Eyebrow>
        <div className="text-text text-[26px] font-extrabold leading-[1.15] tracking-[-0.035em]">{source.title}</div>
        <div className="font-mono text-[12px] leading-none text-muted">{source.domain}</div>
        <div className="mt-auto flex items-center gap-3.5 pt-3.5">
          <div className="bg-surface-3 h-1.5 flex-1 overflow-hidden rounded-full">
            <div
              className="h-full origin-left rounded-full bg-accent"
              style={{ transform: `scaleX(${percent / 100})` }}
            />
          </div>
          <span className="text-soft font-mono text-[12px] leading-none">{percent} %</span>
          <span className="text-text text-sm font-bold leading-none">Reprendre</span>
        </div>
      </div>
    </button>
  );
}
