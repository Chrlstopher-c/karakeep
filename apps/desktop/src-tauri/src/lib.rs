mod capture_shortcut;
mod claude_code;
mod connection;

use tauri::Manager;
use tauri_plugin_log::{Target, TargetKind};

// WebKitGTK sous Wayland : rendu DMA-BUF instable (NVIDIA) et suivi DRM de la fréquence
// d'écran qui lit 0 Hz au réveil de l'écran (SIGFPE). Réglages par défaut, surchargeables.
fn webkit_workarounds() {
    for (key, value) in [("WEBKIT_DISABLE_DMABUF_RENDERER", "1"), ("WEBKIT_FORCE_VBLANK_TIMER", "1")] {
        if std::env::var_os(key).is_none() {
            std::env::set_var(key, value);
        }
    }
}

pub fn run() {
    webkit_workarounds();
    let log = tauri_plugin_log::Builder::new()
        .targets([
            Target::new(TargetKind::Stdout),
            Target::new(TargetKind::LogDir { file_name: Some("savoir".into()) }),
            Target::new(TargetKind::Webview),
        ])
        .level(log::LevelFilter::Info)
        .build();

    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, args, _cwd| {
            if args.iter().any(|a| a == "--capture") {
                capture_shortcut::show_capture(app);
            } else if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .plugin(log)
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            capture_shortcut::register(app)?;
            if std::env::args().any(|a| a == "--capture") {
                capture_shortcut::show_capture(app.handle());
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            connection::load_connection,
            connection::save_connection,
            connection::forget_connection,
            claude_code::claude_mcp_status,
            claude_code::claude_mcp_install,
        ])
        .run(tauri::generate_context!())
        .expect("échec du démarrage de Savoir");
}
