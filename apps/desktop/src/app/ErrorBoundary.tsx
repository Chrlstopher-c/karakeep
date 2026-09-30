import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

import { log } from "../shared/log";

interface State {
  error: Error | null;
}

// Un écran qui plante ne doit pas vider toute la fenêtre : on l'affiche et on le journalise.
export class ErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    log.error(`rendu : ${error.message}`, info.componentStack);
  }

  componentDidUpdate(prev: { resetKey?: string }): void {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="mx-auto flex max-w-[720px] flex-col gap-3 px-10 pt-16">
        <span className="text-err font-mono text-[12px] tracking-[0.14em]">ERREUR D’AFFICHAGE</span>
        <p className="text-text m-0 text-base font-semibold">
          Cet écran a rencontré un problème. Les autres restent utilisables.
        </p>
        <pre className="m-0 whitespace-pre-wrap font-mono text-[12px] text-muted">{this.state.error.message}</pre>
      </div>
    );
  }
}
