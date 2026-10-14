// Un dispositivo fisico (celular real, no emulador/simulador) no puede usar
// `localhost` -- eso apuntaria al propio telefono, no a la PC. Necesita la IP
// de la PC en la red donde ambos esten conectados:
// - Misma red WiFi: IP local de la PC (ver `ipconfig`, adaptador Ethernet o
//   Wi-Fi). Hoy es 192.168.3.12 -- cambia si tu PC cambia de red/router.
// - Tailscale (recomendado si el celular ya lo tiene instalado con la misma
//   cuenta): funciona desde cualquier red, sin depender del mismo WiFi ni de
//   abrir el firewall de Windows. IP de esta PC en Tailscale: 100.117.16.103.
//
// Para emulador/simulador en la misma PC, sigue sirviendo `localhost`:
// - iOS simulator: reaches the host's localhost directly, no setup needed.
// - Android emulator o USB: `adb reverse tcp:8080 tcp:8080` primero.
//
// QA: gateway nginx de la VPS (srv1863965.hstgr.cloud), puerto 8081. Para
// volver al backend local: 'http://192.168.3.12:8080'.
export const API_BASE_URL = 'http://46.202.176.30:8081';

// Clave publicable de prueba de Stripe (pk_test_...). No es secreta -- está
// pensada para ir en el cliente -- pero debe ser la misma cuenta de Stripe que
// STRIPE_SECRET_KEY en feellingPilates/.env, o los PaymentIntents del backend
// no coincidirán con esta clave y Stripe rechazará el pago en el dispositivo.
export const STRIPE_PUBLISHABLE_KEY =
  'pk_test_51TykpqFths3S69vqNMpyN6sNnPyHkF9yWkE9VFPz8sezfogTA0mhDKpbOrBVspynXieFxthEhzK90PQfq2kSu00400VtGpM0Lx';
