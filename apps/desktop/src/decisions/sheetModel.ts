// Fiche de décision = note Markdown suivant le modèle du guide :
// ## Contexte · ## Options (tableau Option | Pour | Contre) · ## Décision ·
// ## Conséquences · ## Sources (liens /dashboard/preview/<id>).

export interface SheetOption {
  name: string;
  pros: string[];
  cons: string[];
}

export interface SheetSource {
  title: string;
  bookmarkId: string | null;
  url: string;
}

export interface Sheet {
  context: string;
  options: SheetOption[];
  decision: string | null;
  decisionRaw: string;
  consequences: string;
  sources: SheetSource[];
}

interface Section {
  title: string;
  body: string;
}

const SECTION_KEYS = {
  context: /^contexte/i,
  options: /^options?/i,
  decision: /^d[ée]cision/i,
  consequences: /^cons[ée]quences/i,
  sources: /^sources/i,
} as const;

function splitSections(markdown: string): Section[] {
  const sections: Section[] = [];
  let current: Section | null = null;
  for (const line of markdown.split("\n")) {
    const heading = /^##\s+(.+?)\s*$/.exec(line);
    if (heading) {
      current = { title: heading[1], body: "" };
      sections.push(current);
    } else if (current) {
      current.body += `${line}\n`;
    }
  }
  return sections.map((s) => ({ ...s, body: s.body.trim() }));
}

function sectionBody(
  sections: Section[],
  key: keyof typeof SECTION_KEYS,
): string {
  return sections.find((s) => SECTION_KEYS[key].test(s.title))?.body ?? "";
}

function cells(row: string): string[] {
  return row
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

function items(cell: string | undefined): string[] {
  return (cell ?? "")
    .split(/<br\s*\/?>|\s;\s|\s·\s/i)
    .map((s) => s.trim())
    .filter((s) => s && s !== "—" && s !== "-");
}

export function parseOptions(body: string): SheetOption[] {
  const rows = body.split("\n").filter((l) => l.trim().startsWith("|"));
  return rows
    .slice(2)
    .map(cells)
    .filter((c) => c[0])
    .map((c) => ({
      name: c[0].replace(/\*\*/g, ""),
      pros: items(c[1]),
      cons: items(c[2]),
    }));
}

function parseDecision(body: string): string | null {
  const text = body.replace(/==(?:\{\w+\})?([^=]+)==/g, "$1").trim();
  if (!text || /^(à trancher|a trancher|…|\.\.\.)$/i.test(text)) return null;
  return text;
}

export function parseSources(body: string): SheetSource[] {
  return Array.from(body.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)).map((m) => ({
    title: m[1],
    url: m[2],
    bookmarkId: /\/dashboard\/preview\/([\w-]+)/.exec(m[2])?.[1] ?? null,
  }));
}

export function parseSheet(markdown: string): Sheet {
  const sections = splitSections(markdown);
  return {
    context: sectionBody(sections, "context"),
    options: parseOptions(sectionBody(sections, "options")),
    decision: parseDecision(sectionBody(sections, "decision")),
    decisionRaw: sectionBody(sections, "decision"),
    consequences: sectionBody(sections, "consequences"),
    sources: parseSources(sectionBody(sections, "sources")),
  };
}

// Remplace le corps d'une section en gardant le reste de la note intact.
export function replaceSection(
  markdown: string,
  key: keyof typeof SECTION_KEYS,
  body: string,
): string {
  const lines = markdown.split("\n");
  const start = lines.findIndex(
    (l) => /^##\s+/.test(l) && SECTION_KEYS[key].test(l.replace(/^##\s+/, "")),
  );
  if (start < 0)
    return `${markdown.trimEnd()}\n\n## ${key === "decision" ? "Décision" : key}\n${body}\n`;
  let end = lines.findIndex((l, i) => i > start && /^##?\s+/.test(l));
  if (end < 0) end = lines.length;
  return [...lines.slice(0, start + 1), body, "", ...lines.slice(end)].join(
    "\n",
  );
}

export function decisionLine(option: string, date: Date, who: string): string {
  const day = date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `=={green}${option}== — ${day}, ${who}`;
}

export const SHEET_TEMPLATE = `## Contexte


## Options
| Option | Pour | Contre |
|---|---|---|
|  |  |  |

## Décision
À trancher

## Conséquences / à surveiller


## Sources
`;
