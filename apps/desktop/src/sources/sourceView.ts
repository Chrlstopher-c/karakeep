import type { ZBookmark, ZBookmarkedAsset, ZBookmarkedLink } from "@karakeep/shared/types/bookmarks";
import { getBookmarkTitle } from "@karakeep/shared/utils/bookmarkUtils";

export type SourceKind = "lien" | "note" | "image" | "pdf";

export const KIND_LABEL: Record<SourceKind, string> = {
  lien: "Lien",
  note: "Note",
  image: "Image",
  pdf: "PDF",
};

export interface SourceView {
  id: string;
  kind: SourceKind;
  title: string;
  domain: string;
  excerpt: string | null;
  imageUrl: string | null;
  imageAssetId: string | null;
  createdAt: Date;
}

function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function bannerAsset(bookmark: ZBookmark): string | null {
  return bookmark.assets.find((a) => a.assetType === "bannerImage")?.id ?? null;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/[#>*_`=[\]()|-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

type ViewParts = Omit<SourceView, "id" | "title" | "createdAt">;

function linkParts(bookmark: ZBookmark, c: ZBookmarkedLink): ViewParts {
  return {
    kind: "lien",
    domain: hostOf(c.url),
    excerpt: c.description ?? null,
    imageUrl: c.imageUrl ?? null,
    imageAssetId: bannerAsset(bookmark) ?? c.imageAssetId ?? null,
  };
}

function noteParts(bookmark: ZBookmark, text: string): ViewParts {
  return {
    kind: "note",
    domain: "Note",
    excerpt: stripMarkdown(text).slice(0, 220),
    imageUrl: null,
    imageAssetId: bannerAsset(bookmark),
  };
}

function assetParts(bookmark: ZBookmark, c: ZBookmarkedAsset): ViewParts {
  const kind = c.assetType === "pdf" ? "pdf" : "image";
  const imageAssetId = kind === "image" ? c.assetId : bannerAsset(bookmark);
  return { kind, domain: c.fileName ?? KIND_LABEL[kind], excerpt: null, imageUrl: null, imageAssetId };
}

export function toSourceView(bookmark: ZBookmark): SourceView {
  const base = { id: bookmark.id, title: getBookmarkTitle(bookmark) ?? "Sans titre", createdAt: bookmark.createdAt };
  const c = bookmark.content;
  if (c.type === "link") return { ...base, ...linkParts(bookmark, c) };
  if (c.type === "text") return { ...base, ...noteParts(bookmark, c.text) };
  if (c.type === "asset") return { ...base, ...assetParts(bookmark, c) };
  return { ...base, kind: "lien", domain: "", excerpt: null, imageUrl: null, imageAssetId: null };
}
