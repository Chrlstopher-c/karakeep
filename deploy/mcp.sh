#!/usr/bin/env bash
# Lance le MCP Karakeep du fork (stdio) avec la clé lue hors dépôt.
set -euo pipefail
cd "$(dirname "$0")/.."
export KARAKEEP_API_ADDR=${KARAKEEP_API_ADDR:-http://localhost:3070}
export KARAKEEP_API_KEY=${KARAKEEP_API_KEY:-$(cat "$HOME/.config/karakeep/cle-api")}
exec node apps/mcp/dist/index.js
