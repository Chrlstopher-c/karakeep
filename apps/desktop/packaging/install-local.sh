#!/usr/bin/env bash
# Construit Savoir en production et l'installe pour l'utilisateur courant (sans root) :
#   ~/.local/share/savoir/  binaire + serveur MCP embarqué
#   ~/.local/bin/savoir     lanceur (accepte --capture)
#   menu d'applications     savoir.desktop + icône
# Usage : packaging/install-local.sh [--no-build]
set -euo pipefail
cd "$(dirname "$0")/.."
DEST="$HOME/.local/share/savoir"
BIN="$HOME/.local/bin"
APPS="$HOME/.local/share/applications"
ICONS="$HOME/.local/share/icons/hicolor"

if [[ ${1:-} != "--no-build" ]]; then
  pnpm --dir ../mcp build
  pnpm tauri build --no-bundle
fi

mkdir -p "$DEST/mcp" "$BIN" "$APPS" "$ICONS/128x128/apps" "$ICONS/32x32/apps"
install -m 755 src-tauri/target/release/savoir "$DEST/savoir"
install -m 644 ../mcp/dist/index.js "$DEST/mcp/karakeep-mcp.js"
install -m 644 src-tauri/icons/128x128.png "$ICONS/128x128/apps/savoir.png"
install -m 644 src-tauri/icons/32x32.png "$ICONS/32x32/apps/savoir.png"

cat > "$BIN/savoir" <<LAUNCHER
#!/usr/bin/env bash
# WebKitGTK + NVIDIA : le rendu DMA-BUF provoque des fenêtres blanches.
export WEBKIT_DISABLE_DMABUF_RENDERER=1
exec "$DEST/savoir" "\$@"
LAUNCHER
chmod 755 "$BIN/savoir"

cat > "$APPS/savoir.desktop" <<DESKTOP
[Desktop Entry]
Type=Application
Name=Savoir
Comment=Base de connaissance Echo
Exec=$BIN/savoir
Icon=savoir
Categories=Office;Utility;
StartupWMClass=savoir
Actions=capture;

[Desktop Action capture]
Name=Capture rapide
Exec=$BIN/savoir --capture
DESKTOP

update-desktop-database "$APPS" 2>/dev/null || true
echo "Savoir installé : $BIN/savoir (capture : savoir --capture)"
