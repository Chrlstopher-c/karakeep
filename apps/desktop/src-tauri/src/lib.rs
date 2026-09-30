mod connection;

use tauri_plugin_log::{Target, TargetKind};

pub fn run() {
    let log = tauri_plugin_log::Builder::new()
        .targets([
            Target::new(TargetKind::Stdout),
            Target::new(TargetKind::LogDir { file_name: Some("savoir".into()) }),
            Target::new(TargetKind::Webview),
        ])
        .level(log::LevelFilter::Info)
        .build();

    tauri::Builder::default()
        .plugin(log)
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            connection::load_connection,
            connection::save_connection,
            connection::forget_connection,
        ])
        .run(tauri::generate_context!())
        .expect("échec du démarrage de Savoir");
}
