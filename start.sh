#!/usr/bin/env bash
# Lance la pile Karakeep locale (sans Docker) : meilisearch, chrome headless, web, workers.
set -euo pipefail
cd "$(dirname "$0")"
RT=.runtime; PIDS=$RT/pids; LOGS=logs
mkdir -p "$PIDS" "$LOGS" "$RT/data" "$RT/meili" "$RT/chrome"
set -a; source .env; set +a
PORT=${KARAKEEP_PORT:-3070}

lancer() {
  local nom=$1; shift
  if [[ -f $PIDS/$nom.pid ]] && kill -0 "$(cat "$PIDS/$nom.pid")" 2>/dev/null; then
    echo "$nom déjà lancé"; return
  fi
  : > "$LOGS/$nom.log"
  setsid "$@" >> "$LOGS/$nom.log" 2>&1 < /dev/null &
  echo $! > "$PIDS/$nom.pid"
  echo "$nom lancé (pid $!)"
}

lancer meili "$RT/meilisearch" --db-path "$RT/meili" --http-addr 127.0.0.1:7700 \
  --master-key "$MEILI_MASTER_KEY" --no-analytics --env production
lancer chrome google-chrome-stable --headless=new --remote-debugging-address=127.0.0.1 \
  --remote-debugging-port=9222 --user-data-dir="$PWD/$RT/chrome" --disable-gpu --no-first-run \
  --hide-scrollbars --disable-blink-features=AutomationControlled --window-size=1440,900 \
  --disable-extensions --disable-background-networking --disable-component-update --disable-sync \
  --renderer-process-limit=2
# Node lancé directement (sans pnpm ni le lanceur tsx) : un processus par service au lieu de trois.
TSX="$PWD/node_modules/tsx/dist"
lancer web env -C apps/web node "$PWD/node_modules/next/dist/bin/next" start -p "$PORT" \
  -H "${KARAKEEP_HOST:-127.0.0.1}"
lancer workers env -C apps/workers node --require "$TSX/preflight.cjs" --import "file://$TSX/loader.mjs" index.ts
echo "Karakeep : http://localhost:$PORT"
