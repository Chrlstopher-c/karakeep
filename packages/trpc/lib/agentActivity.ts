import { agentActivity } from "@karakeep/db/schema";

import type { Context } from "../index";

// Echo fork: every successful mutation made with an agent API key is logged
// so that clients can mark what the agent did and follow it live.

const TEXT_LIMIT = 280;

type Fields = Record<string, unknown>;

function asFields(value: unknown): Fields {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Fields) // plain object checked just above
    : {};
}

function pickString(source: Fields, key: string): string | null {
  const value = source[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function truncate(value: string | null): string | null {
  return value && value.length > TEXT_LIMIT
    ? `${value.slice(0, TEXT_LIMIT)}…`
    : value;
}

function resolveIds(path: string, input: Fields, output: Fields) {
  const [domain] = path.split(".");
  const outputId = pickString(output, "id");
  return {
    bookmarkId:
      pickString(input, "bookmarkId") ??
      pickString(output, "bookmarkId") ??
      (domain === "bookmarks" ? (outputId ?? pickString(input, "id")) : null),
    highlightId:
      domain === "highlights"
        ? (pickString(input, "highlightId") ?? outputId)
        : null,
    listId:
      pickString(input, "listId") ??
      (domain === "lists" ? (outputId ?? pickString(input, "id")) : null),
  };
}

function describe(input: Fields, output: Fields): Fields {
  const detail: Fields = {};
  for (const key of ["title", "color", "note", "type", "url", "name"]) {
    const value = pickString(input, key) ?? pickString(output, key);
    if (value) detail[key] = truncate(value);
  }
  const text = pickString(input, "text");
  if (text) detail.text = truncate(text);
  return detail;
}

export async function recordAgentActivity(
  ctx: Context,
  path: string,
  rawInput: unknown,
  rawOutput: unknown,
): Promise<void> {
  const auth = ctx.auth;
  if (!ctx.user || auth?.type !== "apiKey" || !auth.agent) return;
  // Managing keys is not work on the knowledge base.
  if (path.startsWith("agentActivity.")) return;
  const input = asFields(rawInput);
  const output = asFields(rawOutput);
  try {
    await ctx.db.insert(agentActivity).values({
      userId: ctx.user.id,
      agent: auth.agent,
      path,
      ...resolveIds(path, input, output),
      detail: describe(input, output),
    });
  } catch (error) {
    console.error(`[agentActivity] failed to record ${path}:`, error);
  }
}
