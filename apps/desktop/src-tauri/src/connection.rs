//! Connexion au serveur Karakeep : adresse + clé API, stockées hors du webview
//! dans un fichier du dossier de config de l'app, lisible par l'utilisateur seul.

use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

const FILE_NAME: &str = "connexion.json";

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Connection {
    pub address: String,
    pub api_key: String,
}

fn connection_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join(FILE_NAME))
}

#[cfg(unix)]
fn restrict_permissions(path: &PathBuf) -> std::io::Result<()> {
    use std::os::unix::fs::PermissionsExt;
    fs::set_permissions(path, fs::Permissions::from_mode(0o600))
}

#[cfg(not(unix))]
fn restrict_permissions(_path: &PathBuf) -> std::io::Result<()> {
    Ok(())
}

#[tauri::command]
pub fn load_connection(app: AppHandle) -> Result<Option<Connection>, String> {
    let path = connection_path(&app)?;
    if !path.exists() {
        return Ok(None);
    }
    let raw = fs::read_to_string(&path).map_err(|e| {
        log::error!("lecture de {} impossible : {e}", path.display());
        e.to_string()
    })?;
    serde_json::from_str(&raw).map(Some).map_err(|e| {
        log::error!("connexion illisible, à ressaisir : {e}");
        e.to_string()
    })
}

#[tauri::command]
pub fn save_connection(app: AppHandle, connection: Connection) -> Result<(), String> {
    let path = connection_path(&app)?;
    let raw = serde_json::to_string_pretty(&connection).map_err(|e| e.to_string())?;
    fs::write(&path, raw)
        .and_then(|_| restrict_permissions(&path))
        .map_err(|e| {
            log::error!("écriture de {} impossible : {e}", path.display());
            e.to_string()
        })?;
    log::info!("connexion enregistrée pour {}", connection.address);
    Ok(())
}

#[tauri::command]
pub fn forget_connection(app: AppHandle) -> Result<(), String> {
    let path = connection_path(&app)?;
    if path.exists() {
        fs::remove_file(&path).map_err(|e| {
            log::error!("suppression de {} impossible : {e}", path.display());
            e.to_string()
        })?;
    }
    log::info!("connexion oubliée");
    Ok(())
}
