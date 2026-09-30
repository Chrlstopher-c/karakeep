import type { ReactElement } from "react";
import { useEffect, useId, useState } from "react";

import { log } from "../shared/log";

// Bloc ```mermaid rendu en schéma ; mermaid est chargé à la demande.
export function MermaidDiagram({ chart }: { chart: string }): ReactElement {
  const id = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dark = document.documentElement.dataset.theme !== "clair";

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: dark ? "dark" : "default",
        });
        const { svg: rendered } = await mermaid.render(`mmd-${id}`, chart);
        if (!cancelled) {
          setSvg(rendered);
          setError(null);
        }
      } catch (cause) {
        log.warn(`schéma mermaid : ${String(cause)}`);
        if (!cancelled)
          setError(cause instanceof Error ? cause.message : String(cause));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, id, dark]);

  if (error)
    return <pre className="text-err text-sm">{`${error}\n\n${chart}`}</pre>;
  if (!svg)
    return <div className="bg-surface-2 my-4 h-24 animate-pulse rounded-2xl" />;
  return (
    <div
      className="my-4 flex justify-center overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
