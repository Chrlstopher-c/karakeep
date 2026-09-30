import { describe, expect, test } from "vitest";

import { decisionLine, parseSheet, replaceSection } from "./sheetModel";

const NOTE = `Intro libre.

## Contexte
Accéder à la base hors de la maison.

## Options
| Option | Pour | Contre |
|---|---|---|
| **Réseau maillé** | Aucun port ouvert<br>Chiffré | Client à installer |
| Tunnel inversé | Rien à installer ; Déjà en place | Le relais voit le trafic |

## Décision
À trancher

## Conséquences / à surveiller
Le téléphone rejoint le réseau privé.

## Sources
- [Tunnels inversés](/dashboard/preview/abc123)
- [Doc externe](https://example.com/doc)
`;

describe("parseSheet", () => {
  test("lit les sections du modèle", () => {
    const sheet = parseSheet(NOTE);
    expect(sheet.context).toBe("Accéder à la base hors de la maison.");
    expect(sheet.options).toEqual([
      {
        name: "Réseau maillé",
        pros: ["Aucun port ouvert", "Chiffré"],
        cons: ["Client à installer"],
      },
      {
        name: "Tunnel inversé",
        pros: ["Rien à installer", "Déjà en place"],
        cons: ["Le relais voit le trafic"],
      },
    ]);
    expect(sheet.decision).toBeNull();
    expect(sheet.consequences).toBe("Le téléphone rejoint le réseau privé.");
    expect(sheet.sources.map((s) => s.bookmarkId)).toEqual(["abc123", null]);
  });

  test("retenir une option réécrit seulement la section Décision", () => {
    const line = decisionLine("Réseau maillé", new Date(2026, 8, 30), "Chris");
    const updated = replaceSection(NOTE, "decision", line);
    expect(parseSheet(updated).decision).toBe(
      "Réseau maillé — 30 septembre 2026, Chris",
    );
    expect(updated).toContain("Intro libre.");
    expect(parseSheet(updated).options).toHaveLength(2);
    expect(parseSheet(updated).consequences).toBe(
      "Le téléphone rejoint le réseau privé.",
    );
  });
});
