// Assumes the backend is reached via `localhost:8080` from the device/emulator.
// - iOS simulator: reaches the host's localhost directly, no setup needed.
// - Android (emulator or physical device over USB): run
//   `adb reverse tcp:8080 tcp:8080` first to forward the device's localhost:8080
//   to the host machine.
export const API_BASE_URL = 'http://localhost:8080';
