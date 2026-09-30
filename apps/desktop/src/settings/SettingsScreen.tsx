import type { ReactElement, ReactNode } from "react";
import { useState } from "react";

import logoBlack from "../../design/brand/logo-reveal-black.svg";
import logoWhite from "../../design/brand/logo-reveal-white.svg";
import type { ThemePreference } from "../app/useTheme";
import { useThemeControl } from "../app/useTheme";
import { useActiveConnection } from "../connection/ConnectionContext";
import { checkConnection } from "../connection/connection-store";
import { Button } from "../shared/Button";
import { Eyebrow } from "../shared/Eyebrow";
import { Kbd } from "../shared/Kbd";
import { openExternal } from "../shared/openExternal";
import { Rise } from "../shared/Rise";
import { Segmented } from "../shared/Segmented";

const SHORTCUTS: [string, string][] = [
  ["Palette de commandes", "⌘K"],
  ["Rechercher", "/"],
  ["Nouvelle note ou lien", "⌘L"],
  ["Capture rapide (système)", "Ctrl ⇧ Espace"],
  ["Élément suivant / précédent", "J / K"],
  ["Ouvrir", "ENTRÉE"],
  ["Retour", "ÉCHAP"],
  ["Surligner (1 à 4)", "1 · 2 · 3 · 4"],
  ["Suivre Claude", "F"],
  ["Aller aux décisions / sources", "G D · G S"],
  ["Surlignages / projets", "G H · G P"],
  ["Éditer une fiche", "E"],
];

function Card({
  index,
  children,
  className = "",
}: {
  index: number;
  children: ReactNode;
  className?: string;
}): ReactElement {
  return (
    <Rise
      index={index}
      className={`bg-surface flex flex-col gap-4 rounded-3xl px-6 py-[22px] shadow-ring ${className}`}
    >
      {children}
    </Rise>
  );
}

function ServerCard(): ReactElement {
  const { address, apiKey, disconnect } = useActiveConnection();
  const [result, setResult] = useState<string | null>(null);
  const test = async (): Promise<void> => {
    setResult("Test…");
    setResult((await checkConnection({ address, apiKey })) ?? "Connexion établie.");
  };
  return (
    <Card index={1}>
      <h2 className="text-text m-0 text-base font-bold">Serveur</h2>
      <div className="flex flex-wrap items-center gap-3">
        <div className="bg-field text-text flex h-11 min-w-60 flex-1 items-center gap-2.5 rounded-xl px-3.5 font-mono text-[13px] shadow-[inset_0_0_0_1px_var(--line-strong)]">
          <span className="bg-ok size-[7px] rounded-full" />
          {address}
        </div>
        <Button className="h-11 text-sm" onClick={() => void test()}>
          Tester la connexion
        </Button>
        <Button variant="danger" className="h-11 text-sm" onClick={disconnect}>
          Se déconnecter
        </Button>
      </div>
      {result && <span className="font-mono text-[12px] text-muted">{result}</span>}
    </Card>
  );
}

function AppearanceCard(): ReactElement {
  const theme = useThemeControl();
  const options: { value: ThemePreference; label: string }[] = [
    { value: "night", label: "Night" },
    { value: "clair", label: "Clair" },
    { value: "systeme", label: "Système" },
  ];
  return (
    <Card index={2}>
      <h2 className="text-text m-0 text-base font-bold">Apparence</h2>
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-soft min-w-40 flex-1 text-sm">Thème</span>
        <Segmented value={theme.preference} onChange={theme.setPreference} options={options} />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-soft flex-1 text-sm">Mouvement réduit</span>
        <span className="font-mono text-[11px] tracking-[0.1em] text-muted">SUIT LE RÉGLAGE DU SYSTÈME</span>
      </div>
    </Card>
  );
}

export function SettingsScreen(): ReactElement {
  const { address } = useActiveConnection();
  const theme = useThemeControl();
  const dark = theme.preference !== "clair";
  return (
    <div className="mx-auto flex max-w-[820px] flex-col gap-5 px-10 pb-20 pt-9">
      <Rise className="mb-2 flex flex-col gap-3">
        <Eyebrow>APPLICATION</Eyebrow>
        <h1 className="text-text m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.035em]">Réglages</h1>
      </Rise>
      <ServerCard />
      <AppearanceCard />
      <Card index={3}>
        <h2 className="text-text m-0 text-base font-bold">Raccourcis</h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-x-7 gap-y-1">
          {SHORTCUTS.map(([label, keys]) => (
            <div key={label} className="border-line flex h-[38px] items-center gap-3 border-b">
              <span className="text-soft flex-1 text-sm">{label}</span>
              <Kbd>{keys}</Kbd>
            </div>
          ))}
        </div>
      </Card>
      <Card index={4} className="flex-row flex-wrap items-center">
        <div className="flex min-w-[260px] flex-1 flex-col gap-1.5">
          <h2 className="text-text m-0 text-base font-bold">Interface web</h2>
          <span className="text-sm text-muted">
            Administration, flux RSS, règles automatiques, imports et exports restent dans l’interface web.
          </span>
        </div>
        <Button className="h-10 text-sm" onClick={() => openExternal(address)}>
          Ouvrir l’interface web
        </Button>
      </Card>
      <Card index={5} className="flex-row flex-wrap items-center gap-6 py-7">
        <img src={dark ? logoWhite : logoBlack} alt="Echo Agency" className="h-14" />
        <div className="flex flex-col gap-1.5">
          <span className="text-text text-lg font-extrabold">Savoir 0.1</span>
          <span className="font-mono text-[11px] tracking-[0.14em] text-muted">UN OUTIL ECHO AGENCY</span>
        </div>
      </Card>
    </div>
  );
}
