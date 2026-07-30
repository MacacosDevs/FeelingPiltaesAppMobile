// Assumes the backend is reached via `localhost:8080` from the device/emulator.
// - iOS simulator: reaches the host's localhost directly, no setup needed.
// - Android (emulator or physical device over USB): run
//   `adb reverse tcp:8080 tcp:8080` first to forward the device's localhost:8080
//   to the host machine.
export const API_BASE_URL = 'http://localhost:8080';

// Clave publicable de prueba de Stripe (pk_test_...). No es secreta -- está
// pensada para ir en el cliente -- pero debe ser la misma cuenta de Stripe que
// STRIPE_SECRET_KEY en feellingPilates/.env, o los PaymentIntents del backend
// no coincidirán con esta clave y Stripe rechazará el pago en el dispositivo.
export const STRIPE_PUBLISHABLE_KEY =
  'pk_test_51TykpqFths3S69vqNMpyN6sNnPyHkF9yWkE9VFPz8sezfogTA0mhDKpbOrBVspynXieFxthEhzK90PQfq2kSu00400VtGpM0Lx';
