"use client";

import { useEffect, useId, useState } from "react";
import { useTheme } from "next-themes";

// Rend un bloc ```mermaid en schéma ; mermaid est chargé à la demande.
export function MermaidDiagram({ chart }: { chart: string }) {
  const id = useId().replace(/:/g, "");
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: resolvedTheme === "dark" ? "dark" : "default",
        });
        const { svg: rendered } = await mermaid.render(`mmd-${id}`, chart);
        if (!cancelled) {
          setSvg(rendered);
          setError(null);
        }
      } catch (e) {
        console.error("[mermaid]", e);
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, id, resolvedTheme]);

  if (error) {
    return (
      <pre className="text-sm text-red-500">
        {error}
        {"\n\n"}
        {chart}
      </pre>
    );
  }
  if (!svg) return <div className="my-4 h-24 animate-pulse rounded bg-muted" />;
  return (
    <div
      className="not-prose my-4 flex justify-center overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
