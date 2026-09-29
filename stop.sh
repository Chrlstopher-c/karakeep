#!/usr/bin/env bash
# Arrête la pile Karakeep locale (groupes de processus lancés par start.sh).
set -uo pipefail
cd "$(dirname "$0")"
for f in .runtime/pids/*.pid; do
  [[ -f $f ]] || continue
  pid=$(cat "$f")
  kill -- -"$pid" 2>/dev/null && echo "$(basename "$f" .pid) arrêté"
  rm -f "$f"
done
