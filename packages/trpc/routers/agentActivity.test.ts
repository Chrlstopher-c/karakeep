import { beforeEach, describe, expect, test } from "vitest";

import { BookmarkTypes } from "@karakeep/shared/types/bookmarks";

import type { CustomTestContext } from "../testUtils";
import { defaultBeforeEach, getApiKeyCallerForPlainKey } from "../testUtils";

beforeEach<CustomTestContext>(defaultBeforeEach(true));

describe("Agent activity", () => {
  test<CustomTestContext>("logs mutations of an agent key only", async ({
    apiCallers,
    db,
  }) => {
    const owner = apiCallers[0];
    const { key } = await owner.agentActivity.createAgentKey({
      name: "Claude",
      agent: "claude",
    });
    const claude = await getApiKeyCallerForPlainKey(db, key);

    const note = await claude.bookmarks.createBookmark({
      type: BookmarkTypes.TEXT,
      text: "Fiche rédigée par Claude",
    });
    const highlight = await claude.highlights.create({
      bookmarkId: note.id,
      startOffset: 0,
      endOffset: 5,
      color: "green",
      text: "Fiche",
      note: null,
    });
    await owner.bookmarks.createBookmark({
      type: BookmarkTypes.TEXT,
      text: "Note de Chris",
    });

    const { items } = await owner.agentActivity.list({});
    expect(items.map((i) => i.path)).toEqual([
      "highlights.create",
      "bookmarks.createBookmark",
    ]);
    expect(items[0].bookmarkId).toEqual(note.id);
    expect(items[0].highlightId).toEqual(highlight.id);
    expect(items[0].detail).toMatchObject({ color: "green" });

    const provenance = await owner.agentActivity.provenance();
    expect(provenance.bookmarkIds).toEqual([note.id]);
    expect(provenance.highlightIds).toEqual([highlight.id]);
  });

  test<CustomTestContext>("marks an existing key as agent", async ({
    apiCallers,
  }) => {
    const owner = apiCallers[0];
    const created = await owner.apiKeys.create({ name: "MCP" });
    await owner.agentActivity.setAgent({ id: created.id, agent: "claude" });
    const keys = await owner.agentActivity.keys();
    expect(keys.find((k) => k.id === created.id)?.agent).toEqual("claude");
    await expect(
      apiCallers[1].agentActivity.setAgent({ id: created.id, agent: null }),
    ).rejects.toThrow();
    await owner.agentActivity.revokeAgentKey({ id: created.id });
    expect((await owner.agentActivity.keys()).map((k) => k.id)).not.toContain(
      created.id,
    );
    const plain = await owner.apiKeys.create({ name: "Plain" });
    await expect(
      owner.agentActivity.revokeAgentKey({ id: plain.id }),
    ).rejects.toThrow();
  });
});

describe("Reading progress", () => {
  test<CustomTestContext>("returns the last unfinished reading", async ({
    apiCallers,
  }) => {
    const api = apiCallers[0];
    const first = await api.bookmarks.createBookmark({
      type: BookmarkTypes.LINK,
      url: "https://example.com/a",
    });
    const second = await api.bookmarks.createBookmark({
      type: BookmarkTypes.LINK,
      url: "https://example.com/b",
    });
    expect(await api.readingProgress.current()).toBeNull();
    await api.bookmarks.updateReadingProgress({
      bookmarkId: first.id,
      readingProgressOffset: 120,
      readingProgressPercent: 42,
    });
    await api.bookmarks.updateReadingProgress({
      bookmarkId: second.id,
      readingProgressOffset: 900,
      readingProgressPercent: 100,
    });
    expect((await api.readingProgress.current())?.bookmarkId).toEqual(first.id);
    expect(
      (await api.readingProgress.get({ bookmarkId: first.id }))?.percent,
    ).toEqual(42);
  });
});
