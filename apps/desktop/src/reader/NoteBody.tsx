import type { ReactElement } from "react";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

import { useNavigation } from "../app/navigation";
import { openExternal } from "../shared/openExternal";
import { useAssetUrl } from "../shared/useAssetUrl";
import { MermaidDiagram } from "./MermaidDiagram";
import remarkMark from "./remarkMark";

const ASSET_PATH = /^\/api\/assets\/([\w-]+)/;
const PREVIEW_PATH = /^\/dashboard\/preview\/([\w-]+)/;

function NoteImage({ src, alt }: { src?: string; alt?: string }): ReactElement {
  const assetId = src?.match(ASSET_PATH)?.[1];
  const assetUrl = useAssetUrl(assetId);
  return <img src={assetId ? assetUrl : src} alt={alt ?? ""} />;
}

function NoteLink({ href, children }: { href?: string; children?: React.ReactNode }): ReactElement {
  const { go } = useNavigation();
  const internal = href?.match(PREVIEW_PATH)?.[1];
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        if (internal) go({ screen: "reader", bookmarkId: internal });
        else if (href) openExternal(href);
      }}
    >
      {children}
    </a>
  );
}

// Note Markdown (GFM, ==surlignages==, Mermaid, images et liens internes de la base).
export function NoteBody({ markdown }: { markdown: string }): ReactElement {
  return (
    <div className="sv-article">
      <Markdown
        remarkPlugins={[remarkGfm, remarkBreaks, remarkMark]}
        components={{
          img: ({ src, alt }) => <NoteImage src={typeof src === "string" ? src : undefined} alt={alt} />,
          a: ({ href, children }) => <NoteLink href={href}>{children}</NoteLink>,
          code: ({ className, children }) =>
            className?.includes("language-mermaid") ? (
              <MermaidDiagram chart={String(children).trim()} />
            ) : (
              <code className={className}>{children}</code>
            ),
        }}
      >
        {markdown}
      </Markdown>
    </div>
  );
}
