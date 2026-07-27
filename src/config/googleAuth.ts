// PENDIENTE: crear un proyecto en Google Cloud Console (console.cloud.google.com),
// configurar la pantalla de consentimiento OAuth y crear un OAuth Client ID tipo
// "Web application" — ese Client ID (termina en .apps.googleusercontent.com) va aquí
// y también en `GOOGLE_CLIENT_ID` del backend (feellingPilates/.env), ya que el
// backend valida el idToken contra ese mismo client id como audience.
//
// Además hay que crear un Client ID tipo "Android" en el mismo proyecto, con el
// paquete `com.feellingpilatesapp` y el SHA-1 del keystore de firma (debug y, más
// adelante, release) — sin ese registro Google rechaza el inicio de sesión desde
// la app aunque el Web Client ID de abajo esté bien puesto.
export const GOOGLE_WEB_CLIENT_ID = 'PENDIENTE-CREAR-EN-GOOGLE-CLOUD-CONSOLE';
