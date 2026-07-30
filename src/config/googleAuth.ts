// Web Client ID de OAuth del proyecto "feealingpilates" en Google Cloud
// Console (cliente "Feeling Pilates Web"). El mismo valor está configurado en
// `GOOGLE_CLIENT_ID` del backend (feellingPilates/.env), ya que el backend
// valida el idToken contra ese mismo client id como audience. Además existe
// (o debe existir) un Client ID tipo "Android" en el mismo proyecto, con el
// paquete `com.feellingpilatesapp` y el SHA-1 del keystore de firma — sin ese
// registro Google rechaza el inicio de sesión desde la app aunque este Web
// Client ID esté bien puesto.
export const GOOGLE_WEB_CLIENT_ID =
  '250633726563-mk4s0a2sdp22erbgm9hp4hhpar6js48n.apps.googleusercontent.com';
