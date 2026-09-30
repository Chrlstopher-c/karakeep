import type { Parent, PhrasingContent, Root, Text } from "mdast";
import { visit } from "unist-util-visit";

// ==texte== (jaune) ou =={green}texte== dans les notes, comme dans le web du fork.
const MARK_PATTERN = /==(?:\{(yellow|red|green|blue)\})?([^=\n]+?)==/g;

function splitText(node: Text): PhrasingContent[] | null {
  const parts: PhrasingContent[] = [];
  let last = 0;
  for (const match of node.value.matchAll(MARK_PATTERN)) {
    const start = match.index ?? 0;
    if (start > last)
      parts.push({ type: "text", value: node.value.slice(last, start) });
    const color = match[1] ?? "yellow";
    parts.push({
      type: "emphasis",
      data: {
        hName: "mark",
        hProperties: { className: ["sv-note-mark"], dataColor: color },
      },
      children: [{ type: "text", value: match[2] }],
    });
    last = start + match[0].length;
  }
  if (parts.length === 0) return null;
  if (last < node.value.length)
    parts.push({ type: "text", value: node.value.slice(last) });
  return parts;
}

export default function remarkMark() {
  return (tree: Root): void => {
    visit(tree, "text", (node: Text, index, parent: Parent | undefined) => {
      if (!parent || index === undefined) return;
      const parts = splitText(node);
      if (!parts) return;
      parent.children.splice(index, 1, ...(parts as Parent["children"])); // fragments de phrase : enfants valides du parent
      return index + parts.length;
    });
  };
}
