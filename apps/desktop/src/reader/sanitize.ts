import DOMPurify from "dompurify";

// Le HTML des articles vient du web : aucun script, formulaire ni cadre ne doit
// atteindre le webview (qui a accès aux commandes natives de l'app).
export function sanitizeArticle(html: string): string {
  return DOMPurify.sanitize(html, {
    FORBID_TAGS: ["script", "style", "iframe", "frame", "object", "embed", "form", "input", "button", "link", "meta"],
    FORBID_ATTR: ["style", "srcset"],
    ALLOW_DATA_ATTR: false,
  });
}
