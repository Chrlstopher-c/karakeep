import type { ReactElement } from "react";
import { motion } from "motion/react";

import symbolUrl from "../../design/brand/symbol-white.svg";
import { Button } from "../shared/Button";
import { SCREEN_TRANSITION } from "../shared/motion";
import type { Connection } from "./connection-store";
import { useConnectForm } from "./useConnectForm";

const FIELD =
  "h-11 w-full rounded-xl border border-line bg-field px-3.5 text-text " +
  "placeholder:text-muted focus:border-accent focus:outline-none";

export function ConnectionScreen({
  onConnect,
}: {
  onConnect: (c: Connection) => Promise<void>;
}): ReactElement {
  const form = useConnectForm(onConnect);
  return (
    <motion.main
      className="grid h-full place-items-center px-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={SCREEN_TRANSITION}
    >
      <form
        onSubmit={form.submit}
        className="bg-surface border-line grid w-full max-w-md gap-5 rounded-[28px] border p-8"
      >
        <img src={symbolUrl} alt="" className="h-10 w-10" />
        <div className="grid gap-1.5">
          <h1 className="text-text m-0 text-3xl font-extrabold tracking-tight">
            Connexion à Savoir
          </h1>
          <p className="m-0 text-sm">
            Adresse du serveur Karakeep et clé API (Réglages → Clés API).
          </p>
        </div>
        <input
          className={FIELD}
          placeholder="http://serveur:3070"
          aria-label="Adresse du serveur"
          value={form.address}
          onChange={(e) => form.setAddress(e.target.value)}
          required
          autoFocus
        />
        <input
          className={FIELD}
          placeholder="Clé API"
          aria-label="Clé API"
          type="password"
          value={form.apiKey}
          onChange={(e) => form.setApiKey(e.target.value)}
          required
        />
        {form.error && (
          <p role="alert" className="text-accent-ink m-0 font-mono text-[13px]">
            {form.error}
          </p>
        )}
        <Button variant="primary" type="submit" disabled={form.busy}>
          {form.busy ? "Vérification…" : "Se connecter"}
        </Button>
      </form>
    </motion.main>
  );
}
