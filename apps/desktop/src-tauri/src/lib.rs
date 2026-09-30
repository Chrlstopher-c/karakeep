mod capture_shortcut;
mod claude_code;
mod connection;

use tauri::Manager;
use tauri_plugin_log::{Target, TargetKind};

// WebKitGTK : suivi DRM de la fréquence d'écran qui lit 0 Hz au réveil de l'écran (SIGFPE).
// Rendu DMA-BUF coupé avec NVIDIA seulement (plantage explicit-sync) ; ailleurs, le couper
// divise la fluidité par 3, donc on le rétablit même si la session l'a coupé pour toutes les apps.
fn webkit_workarounds() {
    if std::env::var_os("WEBKIT_FORCE_VBLANK_TIMER").is_none() {
        std::env::set_var("WEBKIT_FORCE_VBLANK_TIMER", "1");
    }
    if std::path::Path::new("/proc/driver/nvidia").exists() {
        std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
    } else {
        std::env::remove_var("WEBKIT_DISABLE_DMABUF_RENDERER");
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
