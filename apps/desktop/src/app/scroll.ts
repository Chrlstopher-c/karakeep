import { createContext, useContext } from "react";
import type { RefObject } from "react";

export const ScrollContext = createContext<RefObject<HTMLDivElement | null> | null>(null);

export function useScrollContainer(): RefObject<HTMLDivElement | null> {
  const ref = useContext(ScrollContext);
  if (!ref) throw new Error("useScrollContainer hors de la coquille");
  return ref;
}
