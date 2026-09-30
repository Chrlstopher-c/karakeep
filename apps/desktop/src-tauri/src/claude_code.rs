//! Intégration Claude Code : déclare le serveur MCP karakeep (embarqué dans l'app)
//! dans la configuration utilisateur de Claude Code (~/.claude.json).
//! L'écriture passe par la CLI `claude mcp add-json` quand elle est installée,
//! sinon par une modification prudente du fichier (sauvegarde puis remplacement atomique).

use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

use serde::Serialize;
use serde_json::{json, Value};
use tauri::{AppHandle, Manager};

const SERVER_NAME: &str = "karakeep";
const MCP_RESOURCE: &str = "mcp/karakeep-mcp.js";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct McpStatus {
    configured: bool,
    command: Option<String>,
    address: Option<String>,
    managed_by_savoir: bool,
    cli_available: bool,
}

fn home() -> Result<PathBuf, String> {
    std::env::var_os("HOME").map(PathBuf::from).ok_or_else(|| "HOME introuvable".to_string())
}

fn claude_json() -> Result<PathBuf, String> {
    Ok(home()?.join(".claude.json"))
}

/// Les apps lancées depuis le bureau n'héritent pas toujours du PATH du shell.
fn find_binary(name: &str) -> Option<PathBuf> {
    let home = home().ok()?;
    let mut dirs: Vec<PathBuf> = std::env::var_os("PATH")
        .map(|p| std::env::split_paths(&p).collect())
        .unwrap_or_default();
    for extra in [".bun/bin", ".local/bin", ".npm-global/bin", ".volta/bin"] {
        dirs.push(home.join(extra));
    }
    dirs.extend(["/usr/local/bin", "/usr/bin"].iter().map(PathBuf::from));
    dirs.into_iter().map(|d| d.join(name)).find(|p| p.is_file())
}

fn read_json(path: &Path) -> Result<Value, String> {
    if !path.exists() {
        return Ok(json!({}));
    }
    let raw = fs::read_to_string(path).map_err(|e| e.to_string())?;
    serde_json::from_str(&raw).map_err(|e| format!("{} illisible : {e}", path.display()))
}

fn server_entry(config: &Value) -> Option<&Value> {
    config.get("mcpServers")?.get(SERVER_NAME)
}

#[tauri::command]
pub fn claude_mcp_status() -> Result<McpStatus, String> {
    let config = read_json(&claude_json()?)?;
    let entry = server_entry(&config);
    let command = entry.and_then(|e| e.get("command")).and_then(Value::as_str).map(str::to_string);
    let args = entry.and_then(|e| e.get("args")).and_then(Value::as_array);
    let managed = args.is_some_and(|a| a.iter().any(|v| v.as_str().is_some_and(|s| s.ends_with("karakeep-mcp.js"))));
    let address = entry
        .and_then(|e| e.get("env"))
        .and_then(|env| env.get("KARAKEEP_API_ADDR"))
        .and_then(Value::as_str)
        .map(str::to_string);
    Ok(McpStatus {
        configured: entry.is_some(),
        command,
        address,
        managed_by_savoir: managed,
        cli_available: find_binary("claude").is_some(),
    })
}

fn mcp_script(app: &AppHandle) -> Result<PathBuf, String> {
    let path = app
        .path()
        .resolve(MCP_RESOURCE, tauri::path::BaseDirectory::Resource)
        .map_err(|e| e.to_string())?;
    if path.is_file() {
        Ok(path)
    } else {
        Err(format!("serveur MCP absent de l'app : {}", path.display()))
    }
}

fn server_json(app: &AppHandle, address: &str, api_key: &str) -> Result<Value, String> {
    let runtime = find_binary("node")
        .or_else(|| find_binary("bun"))
        .ok_or("ni node ni bun trouvé : installer Node.js pour lancer le serveur MCP")?;
    Ok(json!({
        "type": "stdio",
        "command": runtime.to_string_lossy(),
        "args": [mcp_script(app)?.to_string_lossy()],
        "env": { "KARAKEEP_API_ADDR": address, "KARAKEEP_API_KEY": api_key },
    }))
}

fn install_with_cli(claude: &Path, server: &Value) -> Result<(), String> {
    let _ = Command::new(claude).args(["mcp", "remove", SERVER_NAME, "--scope", "user"]).output();
    let out = Command::new(claude)
        .args(["mcp", "add-json", SERVER_NAME, &server.to_string(), "--scope", "user"])
        .output()
        .map_err(|e| e.to_string())?;
    if out.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&out.stderr).trim().to_string())
    }
}

fn install_in_file(server: Value) -> Result<(), String> {
    let path = claude_json()?;
    let mut config = read_json(&path)?;
    if path.exists() {
        fs::copy(&path, path.with_extension("json.savoir-backup")).map_err(|e| e.to_string())?;
    }
    let servers = config
        .as_object_mut()
        .ok_or("~/.claude.json n'est pas un objet JSON")?
        .entry("mcpServers")
        .or_insert_with(|| json!({}));
    servers[SERVER_NAME] = server;
    let tmp = path.with_extension("json.savoir-tmp");
    let raw = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    fs::write(&tmp, raw).and_then(|_| fs::rename(&tmp, &path)).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn claude_mcp_install(app: AppHandle, address: String, api_key: String) -> Result<(), String> {
    let server = server_json(&app, &address, &api_key)?;
    let result = match find_binary("claude") {
        Some(cli) => install_with_cli(&cli, &server).or_else(|e| {
            log::warn!("claude mcp add-json a échoué ({e}), écriture directe du fichier");
            install_in_file(server)
        }),
        None => install_in_file(server),
    };
    match &result {
        Ok(()) => log::info!("serveur MCP {SERVER_NAME} déclaré dans Claude Code pour {address}"),
        Err(e) => log::error!("déclaration MCP impossible : {e}"),
    }
    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn install_in_file_keeps_the_rest_of_the_config() {
        let dir = std::env::temp_dir().join(format!("savoir-test-{}", std::process::id()));
        fs::create_dir_all(&dir).unwrap();
        std::env::set_var("HOME", &dir);
        let path = dir.join(".claude.json");
        fs::write(&path, r#"{"theme":"dark","mcpServers":{"autre":{"command":"x"}}}"#).unwrap();

        install_in_file(json!({"type":"stdio","command":"/usr/bin/node","args":["/opt/savoir/mcp/karakeep-mcp.js"]}))
            .unwrap();

        let config = read_json(&path).unwrap();
        assert_eq!(config["theme"], "dark");
        assert_eq!(config["mcpServers"]["autre"]["command"], "x");
        assert_eq!(config["mcpServers"]["karakeep"]["command"], "/usr/bin/node");
        assert!(path.with_extension("json.savoir-backup").exists());
        let status = claude_mcp_status().unwrap();
        assert!(status.configured && status.managed_by_savoir);
        fs::remove_dir_all(&dir).unwrap();
    }
}
