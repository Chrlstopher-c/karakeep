//! Raccourci global Ctrl+Maj+Espace : remonte la fenêtre et ouvre la capture rapide.
//! Sous Wayland (Hyprland) le raccourci global X11 ne voit pas les touches : lier une
//! touche du compositeur à `savoir --capture`, qui passe par l'instance unique.

use tauri::{App, AppHandle, Emitter, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

pub fn show_capture(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
    }
    if let Err(e) = app.emit("savoir://capture", ()) {
        log::error!("capture rapide : émission impossible : {e}");
    }
}

pub fn register(app: &App) -> tauri::Result<()> {
    let shortcut = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::Space);
    let plugin = tauri_plugin_global_shortcut::Builder::new()
        .with_handler(move |app, pressed, event| {
            if pressed == &shortcut && event.state() == ShortcutState::Pressed {
                show_capture(app);
            }
        })
        .build();
    app.handle().plugin(plugin)?;
    // Un autre programme peut déjà tenir ce raccourci : l'app reste utilisable sans.
    if let Err(e) = app.global_shortcut().register(shortcut) {
        log::warn!("raccourci global Ctrl+Maj+Espace indisponible : {e}");
    }
    Ok(())
}
