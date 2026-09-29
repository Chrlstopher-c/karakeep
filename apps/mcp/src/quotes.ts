import type { CallToolResult } from "@modelcontextprotocol/server";
import { parseHTML } from "linkedom";
import { z } from "zod";

import { createHighlightHandler } from "./highlights";
import { karakeepClient, registerTool } from "./shared";
import { toMcpToolError } from "./utils";

interface TextTreeNode {
  nodeType: number;
  textContent: string | null;
  childNodes: { forEach(cb: (child: TextTreeNode) => void): void };
}

// Same text the web reader walks (SHOW_TEXT over the rendered htmlContent),
// so offsets computed here land on the same characters in the UI.
export function readableText(html: string): string {
  const { document } = parseHTML(`<!doctype html><html><body></body></html>`);
  const container = document.createElement("div");
  container.innerHTML = html;
  const parts: string[] = [];
  const walk = (node: TextTreeNode): void => {
    if (node.nodeType === 3) {
      parts.push(node.textContent ?? "");
      return;
    }
    node.childNodes.forEach((child: TextTreeNode) => walk(child));
  };
  walk(container);
  return parts.join("");
}

const EQUIVALENT_CHARS: Record<string, string> = {
  "’": "'",
  "‘": "'",
  "“": '"',
  "”": '"',
  " ": " ",
};

interface NormalizedText {
  text: string;
  origin: number[];
}

// Collapses whitespace runs and folds typographic quotes, keeping for each
// normalized character the index it came from in the original text.
export function normalize(raw: string, lowerCase: boolean): NormalizedText {
  let text = "";
  const origin: number[] = [];
  let previousWasSpace = true;
  for (let i = 0; i < raw.length; i++) {
    let c = EQUIVALENT_CHARS[raw[i]] ?? raw[i];
    if (/\s/.test(c)) {
      if (previousWasSpace) continue;
      c = " ";
      previousWasSpace = true;
    } else {
      previousWasSpace = false;
    }
    text += lowerCase ? c.toLowerCase() : c;
    origin.push(i);
  }
  if (text.endsWith(" ")) {
    text = text.slice(0, -1);
    origin.pop();
  }
  return { text, origin };
}

export function locateQuote(
  content: string,
  quote: string,
  occurrence: number,
): { startOffset: number; endOffset: number } | null {
  for (const lowerCase of [false, true]) {
    const haystack = normalize(content, lowerCase);
    const needle = normalize(quote, lowerCase).text;
    if (!needle) return null;
    let index = -1;
    for (let n = 0; n < occurrence; n++) {
      index = haystack.text.indexOf(needle, index + 1);
      if (index === -1) break;
    }
    if (index !== -1) {
      return {
        startOffset: haystack.origin[index],
        endOffset: haystack.origin[index + needle.length - 1] + 1,
      };
    }
  }
  return null;
}

export const highlightQuoteInputSchema = {
  bookmarkId: z.string().min(1).describe(`The id of the link bookmark.`),
  quote: z
    .string()
    .min(1)
    .describe(
      `Exact passage to highlight, copied from the bookmark content. Whitespace, case and typographic quotes are matched loosely.`,
    ),
  occurrence: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe(
      `Which occurrence to highlight when the passage repeats. Defaults to 1.`,
    ),
  color: z
    .enum(["yellow", "red", "green", "blue"])
    .optional()
    .describe(`Highlight color. Defaults to yellow.`),
  note: z.string().optional().describe(`Note attached to the highlight.`),
};

export async function highlightQuoteHandler(input: {
  bookmarkId: string;
  quote: string;
  occurrence?: number;
  color?: "yellow" | "red" | "green" | "blue";
  note?: string;
}): Promise<CallToolResult> {
  const res = await karakeepClient.GET(`/bookmarks/{bookmarkId}`, {
    params: {
      path: { bookmarkId: input.bookmarkId },
      query: { includeContent: true },
    },
  });
  if (!res.data) {
    return toMcpToolError(res.error);
  }
  if (res.data.content.type !== "link" || !res.data.content.htmlContent) {
    return toMcpToolError(
      `Only crawled link bookmarks can be highlighted. For notes, wrap text in ==...== with update-bookmark.`,
    );
  }
  const text = readableText(res.data.content.htmlContent);
  const position = locateQuote(text, input.quote, input.occurrence ?? 1);
  if (!position) {
    return toMcpToolError(
      `Passage not found in the bookmark content. Fetch it with get-bookmark-content and copy it exactly.`,
    );
  }
  return createHighlightHandler({
    bookmarkId: input.bookmarkId,
    ...position,
    color: input.color,
    text: text.slice(position.startOffset, position.endOffset),
    note: input.note ?? null,
  });
}

registerTool(
  "highlight-quote",
  {
    description: `Highlight a passage of a link bookmark by quoting it: offsets are computed automatically so the highlight shows up in the reader view. Prefer this over create-highlight.`,
    inputSchema: z.object(highlightQuoteInputSchema),
    annotations: { readOnlyHint: false, destructiveHint: false },
  },
  highlightQuoteHandler,
);
