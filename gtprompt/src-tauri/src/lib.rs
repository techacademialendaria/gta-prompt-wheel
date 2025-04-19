// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(desktop)] // Only register shortcuts on desktop
            {
                use tauri::Emitter; // Use Emitter trait for handle.emit()
                use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

                // Define the shortcut we want to use
                let shortcut = Shortcut::new(Some(Modifiers::ALT | Modifiers::SHIFT), Code::KeyP);

                let handle = app.handle().clone(); // Clone handle for the handler closure

                // Initialize the plugin *with* the handler
                app.handle().plugin(
                    tauri_plugin_global_shortcut::Builder::new()
                        .with_handler(move |_app, shortcut_event, event_details| {
                            // Check if it's our specific shortcut that triggered the event
                            if shortcut_event == &shortcut {
                                match event_details.state() {
                                    ShortcutState::Pressed => {
                                        println!("Global shortcut Alt+Shift+P Pressed!");
                                        // Use handle.emit()
                                        if let Err(e) = handle.emit("global-shortcut-triggered", "Alt+Shift+P") {
                                            eprintln!("Failed to emit global-shortcut-triggered event: {}", e);
                                        }
                                    }
                                    ShortcutState::Released => {
                                        // Optional: Handle release event if needed
                                        println!("Global shortcut Alt+Shift+P Released!");
                                    }
                                }
                            }
                        })
                        .build(),
                )?;

                // Register the actual shortcut *after* initializing the plugin with the handler
                app.global_shortcut().register(shortcut)?;

                // Optional: Check registration
                // let is_registered = app.global_shortcut().is_registered(&shortcut)?;
                // println!("Is Alt+Shift+P registered? {}", is_registered);
            }
            Ok(()) // Return Ok(()) from the setup closure
        })
        // REMOVE redundant plugin registration here
        // .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
