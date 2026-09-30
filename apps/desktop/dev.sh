#!/usr/bin/env bash
# Lance Savoir en dev dans la session graphique (Wayland/Hyprland), logs réinitialisés.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p logs
: > logs/dev.log
export XDG_RUNTIME_DIR=${XDG_RUNTIME_DIR:-/run/user/$(id -u)}
export WAYLAND_DISPLAY=${WAYLAND_DISPLAY:-$(ls "$XDG_RUNTIME_DIR" | grep -m1 '^wayland-[0-9]*$')}
if [[ -d $XDG_RUNTIME_DIR/hypr ]]; then
  export HYPRLAND_INSTANCE_SIGNATURE=${HYPRLAND_INSTANCE_SIGNATURE:-$(ls "$XDG_RUNTIME_DIR/hypr" | head -1)}
fi
export WEBKIT_DISABLE_DMABUF_RENDERER=1
export WEBKIT_FORCE_VBLANK_TIMER=1
exec setsid pnpm tauri dev >> logs/dev.log 2>&1
