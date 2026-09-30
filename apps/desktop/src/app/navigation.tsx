import type { ReactElement, ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type ScreenId =
  | "home"
  | "decisions"
  | "sources"
  | "projects"
  | "highlights"
  | "tags"
  | "claude"
  | "settings";

export type Route =
  | { screen: ScreenId }
  | { screen: "reader"; bookmarkId: string; highlightId?: string }
  | { screen: "sheet"; bookmarkId: string };

interface History {
  stack: Route[];
  index: number;
}

export interface Navigation {
  route: Route;
  go: (route: Route) => void;
  back: () => void;
  forward: () => void;
}

const NavigationContext = createContext<Navigation | null>(null);

function sameRoute(a: Route, b: Route): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function NavigationProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const [history, setHistory] = useState<History>({
    stack: [{ screen: "home" }],
    index: 0,
  });

  const go = useCallback((route: Route) => {
    setHistory((h) => {
      if (sameRoute(h.stack[h.index], route)) return h;
      const stack = [...h.stack.slice(0, h.index + 1), route];
      return { stack, index: stack.length - 1 };
    });
  }, []);
  const back = useCallback(
    () => setHistory((h) => ({ ...h, index: Math.max(0, h.index - 1) })),
    [],
  );
  const forward = useCallback(
    () =>
      setHistory((h) => ({
        ...h,
        index: Math.min(h.stack.length - 1, h.index + 1),
      })),
    [],
  );

  const value = useMemo(
    () => ({ route: history.stack[history.index], go, back, forward }),
    [history, go, back, forward],
  );
  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): Navigation {
  const nav = useContext(NavigationContext);
  if (!nav) throw new Error("useNavigation hors de NavigationProvider");
  return nav;
}

// Écran de la barre latérale qui reste actif pendant la lecture d'une source ou d'une fiche.
export function activeNavId(route: Route): ScreenId {
  if (route.screen === "reader") return "sources";
  if (route.screen === "sheet") return "decisions";
  return route.screen;
}
