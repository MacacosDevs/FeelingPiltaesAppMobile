# Matriz de cobertura — pruebas de errores de la app móvil (feellingPilatesApp)

Fuente de verdad de esta ronda de pruebas (no las conversaciones ni el chat que la generó). Corresponde al prompt [`PROMPT-PRUEBAS-ERRORES.md`](./PROMPT-PRUEBAS-ERRORES.md) ejecutado sobre `feellingPilatesApp`, rama `develop`.

Última corrida verificada: **2026-09-23**, `npm test` → **7/7 suites, 59/59 PASS** (58 del suite de errores + `App.test.tsx`). `npx tsc --noEmit` y `npx eslint __tests__ jest` limpios.

Criterio de estado: `PASS` = el escenario se ejecutó y la prueba confirma el comportamiento **real** del código actual. Cuando ese comportamiento real es en sí un problema, la fila lo dice ("confirma hallazgo …") y el hallazgo está en la sección de abajo. Ninguna fila está marcada sin un test que la ejecute.

## Infraestructura de pruebas

- Test runner: **jest** (`npm test` = `jest`, `npm run test:watch` = `jest --watch`), preset `@react-native/jest-preset`.
- **Antes de esta ronda `npm test` no corría**: `jest.config.js` apuntaba a `@react-native/jest-preset`, pero el paquete nunca se había instalado ("Preset @react-native/jest-preset not found"). Se instaló `@react-native/jest-preset@0.86.0` (misma versión que `react-native`).
- Se instaló `@testing-library/react-native@^14` (API async: `await render`, `await fireEvent`). Trae sus propios matchers (`toBeOnTheScreen`, etc.); no hace falta `@testing-library/jest-native`.
- `jest/setup.js`: mocks de `react-native-keychain`, `@react-native-google-signin/google-signin`, `@stripe/stripe-react-native`, `react-native-vision-camera`, `react-native-image-picker`, y stubs sin comportamiento de error propio (`heroui-native` → `TextInput`/`Text`, íconos, `react-native-maps`, `react-native-qrcode-svg`, `uniwind`) porque arrastran runtime nativo (reanimated/worklets). Incluye el `jestSetup` de gesture-handler, con lo que `App.test.tsx` (preexistente, antes también roto) vuelve a pasar.
- `__tests__/helpers/fetchMock.ts`: `global.fetch` mockeado por test con los caminos que distingue `client.ts` (ok JSON, no-ok JSON, no-ok sin JSON, 204, rechazo).
- **Nunca** se llama a Stripe real ni a los backends reales. Todos los tokens/idTokens/client secrets de los tests son cadenas de prueba (`jwt-de-prueba`, `pk_test_prueba`, …).
- Cruces contra backend (lectura de código, no ejecución): `feellingPilates` (`ClaseReservaService.java`, `GlobalExceptionHandler.java`, `SecurityConfig.java`), `feellingPilates-pagos` (`src/middleware/errores.ts`, `src/middleware/auth.ts`, `src/errores.ts`) y `gateway/nginx.conf` (`/api/pagos/` se proxea tal cual al servicio Node).

## Leyenda de severidad

| Severidad | Significado |
|---|---|
| P0 | Pérdida/corrupción de datos del usuario, sesión de otro usuario expuesta, app inutilizable, o pago duplicado disparado desde el cliente |
| P1 | Estado inconsistente pero recuperable, mensaje engañoso/ausente, o validación que solo existe del lado cliente |
| P2 | Falta de cobertura, mejora de UX, deuda técnica |

## Matriz de escenarios

### `apiFetch` / `ApiError` (`src/api/client.ts`)

| # | Escenario | Estado | Evidencia |
|---|---|---|---|
| 1 | `fetch` rechaza → `ApiError(0, 'No se pudo conectar con el servidor')` | PASS | `__tests__/errores/apiClient.test.ts:16` |
| 2 | Respuesta no-ok con body JSON válido → usa `message`/`fieldErrors` del body | PASS | `apiClient.test.ts:26` |
| 3 | Respuesta no-ok sin body JSON parseable (HTML de gateway / vacío) → mensaje genérico, sin excepción sin manejar | PASS | `apiClient.test.ts:45` (`test.each`) |
| 4 | Respuesta ok (2xx) con body no-JSON → rechaza con `SyntaxError` crudo, **no** `ApiError` | PASS (confirma hallazgo P2-4) | `apiClient.test.ts:56` |
| 5 | Respuesta 204 → resuelve `undefined` sin parsear body | PASS | `apiClient.test.ts:65` |
| 6 | Request con `FormData` → no fija `Content-Type`, preserva `Authorization`; con JSON sí fija `application/json` y preserva los headers del caller | PASS | `apiClient.test.ts:73`, `apiClient.test.ts:89` |
| 7 | Callers `err instanceof ApiError ? ... : genérico` → con un error no-`ApiError` el usuario ve siempre el genérico (aceptable, declarado). Además: el mensaje real de `feellingPilates-pagos` (`{error}`) y el 401 sin body de `feellingPilates` **también** terminan en el genérico | PASS (confirma hallazgos P1-1 y P1-2) | `apiClient.test.ts:100`, `apiClient.test.ts:110`, `apiClient.test.ts:124` |

### Sesión y arranque de la app (`AuthContext.tsx`, `secureToken.ts`)

| # | Escenario | Estado | Evidencia |
|---|---|---|---|
| 8 | Arranque sin token guardado → `isLoading` termina `false`, sin llamar `obtenerPerfil` | PASS | `authContext.test.tsx:44` |
| 9 | Arranque con token válido → `user`/`token` se setean, `photoVersion` se renueva, header `Bearer` correcto | PASS | `authContext.test.tsx:53` |
| 10 | Arranque con token vencido (401) → `borrarToken()`, `user`/`token` en `null`, `isLoading` `false`. **Pero** arrancar sin conexión (o con el backend en 5xx) hace exactamente lo mismo | PASS (confirma hallazgo P1-3) | `authContext.test.tsx:68`, `authContext.test.tsx:80` |
| 11 | Arranque con `Keychain.getGenericPassword` lanzando → `isLoading` queda en `true` para siempre (Splash eterno), rechazo sin manejar confirmado | PASS (confirma hallazgo **P0-1**) | `authArranqueKeychain.test.tsx:34` (+ control `:53`) |
| 12 | `login`/`registrar` con credenciales inválidas (401) / correo existente (409) / sin conexión → la pantalla lo captura y muestra el mensaje correcto, no navega | PASS | `authContext.test.tsx:95`, `authContext.test.tsx:110`, `authScreen.test.tsx:39`, `authScreen.test.tsx:54` |
| 13 | `login` exitoso en backend pero `guardarToken` (Keychain) tira → sesión no se refleja, no se pide el perfil, el usuario ve "Ocurrió un error inesperado. Intenta de nuevo." | PASS (confirma hallazgo P2-3) | `authContext.test.tsx:122` |
| 14 | `loginConGoogle`: `hasPlayServices()` tira → error nativo sin normalizar → mensaje genérico, no se llama `signIn` ni la red | PASS | `authContext.test.tsx:138` |
| 15 | `loginConGoogle`: usuario cancela el picker → se pinta "Ocurrió un error inesperado. Intenta de nuevo." como si fuera un fallo | PASS (confirma hallazgo P1-5) | `authContext.test.tsx:153`, `authScreen.test.tsx:68` |
| 16 | `loginConGoogle`: backend rechaza el `idToken` (401) → `ApiError` con el mensaje del backend, distinguible del caso cancelado | PASS | `authContext.test.tsx:167`, `authScreen.test.tsx:79` |
| 17 | `deleteAccount`/`updateProfile`/`updatePhoto` sin `token` → `Error('No hay sesión activa')`, no `ApiError`, sin red → los callers (`AccountScreen.tsx:71`, `EditProfileScreen.tsx:43/64`) muestran su texto genérico, no "No hay sesión activa" | PASS | `authContext.test.tsx:180` (`test.each`) |
| 18 | `logout` con `Keychain.resetGenericPassword` lanzando → el logout aborta; token y usuario siguen en memoria | PASS (confirma hallazgo P1-4) | `authContext.test.tsx:200` |
| 19 | `subirFoto` con `asset.uri` inaccesible → RN rechaza el `fetch` → `ApiError(0)` → el usuario ve "No se pudo conectar con el servidor" | PASS con mock (confirma hallazgo P2-5) — **verificar en dispositivo** que RN efectivamente rechaza el `fetch` en ese caso | `authContext.test.tsx:215` |

### Carrito y pago (`CarritoContext.tsx`, `pagos.ts`, `CarritoScreen.tsx`)

| # | Escenario | Estado | Evidencia |
|---|---|---|---|
| 20 | `logout` con pago en curso → no queda colgado: carrito se vacía, `procesando` vuelve a `false`, sin Alert. El flujo en vuelo sí llega a abrir el PaymentSheet con la sesión ya cerrada | PASS (ver nota P2-6) | `carrito.test.tsx:116` |
| 21 | `crearIntentoPago` 401 (sesión vencida, cuerpo real `{error: 'Token invalido o expirado'}`) → Alert **genérico**, carrito no se vacía, no se abre Stripe | PASS (confirma hallazgos P1-1 y P1-2) | `carrito.test.tsx:143` |
| 22 | `crearIntentoPago` 400 → Alert, carrito intacto, reintento reusa la misma `idempotencyKey` | PASS (mensaje genérico: hallazgo P1-1) | `carrito.test.tsx:159` (`test.each`) |
| 23 | `crearIntentoPago` 404 (paquete inactivo) → ídem | PASS (ídem P1-1) | `carrito.test.tsx:159` (`test.each`) |
| 24 | `crearIntentoPago` 502 (decline de Stripe traducido por pagos) → ídem; el texto del decline nunca llega al usuario | PASS (ídem P1-1) | `carrito.test.tsx:159` (`test.each`) |
| 25 | Doble tap en "Pagar" antes del re-render → **sí** hay ventana (la guarda `procesando` del closure no alcanza): salen 2 `POST /intento`, pero con **la misma** clave (ref) → el backend deduplica. Tras el re-render, `PrimaryButton` con `loading` ignora el tap | PASS | `carrito.test.tsx:176`, `carrito.test.tsx:196` |
| 26 | `initPaymentSheet` con `initError` → Alert con el mensaje de Stripe, `procesando` vuelve a `false`, clave se conserva para el reintento | PASS | `carrito.test.tsx:213` |
| 27 | `presentPaymentSheet` con `code: 'Canceled'` → sin Alert, carrito intacto | PASS | `carrito.test.tsx:228` |
| 28 | `presentPaymentSheet` con error real → Alert con el mensaje de Stripe, carrito y clave se conservan | PASS | `carrito.test.tsx:240` |
| 29 | `presentPaymentSheet` exitoso → vacía carrito y muestra "¡Compra exitosa!" **sin** consultar `mis-compras`/`estado-en-vivo` (una sola llamada de red). Comportamiento actual documentado: depende de que el webhook de `feellingPilates-pagos` llegue a tiempo | PASS (ver nota P2-7) | `carrito.test.tsx:257` |

### Clases: reservar, cancelar, check-in por QR

| # | Escenario | Estado | Evidencia |
|---|---|---|---|
| 30 | `reservarClase` sin token (invitado) → hoja "Necesitas iniciar sesión…", botón navega a `Auth` (`{mode: 'login'}`), ninguna request con `Authorization` | PASS | `clases.test.tsx:82` |
| 31 | `reservarClase` con clase llena (409) / reserva duplicada (409) / clase ya comenzó (400) / clase cancelada (400) → Alert con el mensaje **real** del backend. Status y textos tomados de `ClaseReservaService.reservar` + `GlobalExceptionHandler` | PASS | `clases.test.tsx:110` (`test.each`) |
| 32 | `cancelarReserva` de reserva ajena o inexistente → el backend responde **404** "Reserva no encontrada" en ambos casos (no 403: no revela si existe), llega como `ApiError`. Nota: hoy **ninguna pantalla llama a `cancelarReserva`**, solo existe en `clases.ts` | PASS (API) | `clases.test.tsx:156` |
| 33 | `registrarCheckin`: QR con formato inválido → "Código no reconocido", sin llamar a la red | PASS | `clases.test.tsx:208` |
| 34 | `registrarCheckin`: QR válido pero de otra clase → rechazado en cliente sin red. **Server-side confirmado**: `ClaseReservaService.checkin` compara `reserva.getClase().getId()` con el `claseId` del body y responde 400 si no coinciden; también exige que el instructor sea el de la clase (o staff). No hay hallazgo de trust boundary | PASS | `clases.test.tsx:218`, `clases.test.tsx:228` |
| 35 | Mismo QR escaneado dos veces seguidas → bloqueado por `ultimoValorRef` (1 sola request). Backend idempotente: una reserva ya `ASISTIO` devuelve su estado actual sin error. Dos dispositivos a la vez: ambos pueden leer `CONFIRMADA` y ambos escriben `ASISTIO` (misma fila, último `asistioEn` gana), resultado benigno. **Pero** si el primer intento falla por red, re-escanear el mismo QR se ignora en silencio | PASS (confirma hallazgo P1-6) | `clases.test.tsx:241`, `clases.test.tsx:252` |
| 36 | `obtenerClase` falla al montar check-in → sin subtítulo, sin ningún aviso, el escáner sigue activo como si todo estuviera bien | PASS (confirma hallazgo P2-1) | `clases.test.tsx:275` |
| 37 | Sin cámara → mensaje explícito. Permiso denegado permanentemente → `requestPermission()` devuelve `false` sin diálogo, la pantalla no cambia y no hay salida a Ajustes (`Linking.openSettings` nunca se llama) | PASS con mock (confirma hallazgo P2-2) — **verificar en dispositivo** Android ("no volver a preguntar") e iOS | `clases.test.tsx:289`, `clases.test.tsx:297` |

### Sesión que expira a mitad de uso

| # | Escenario | Estado | Evidencia |
|---|---|---|---|
| 38 | Token vence mientras el usuario navega → sin interceptor global de 401: cada acción repite su Alert, sin logout ni navegación a `Auth`. Agravante: el 401 de `feellingPilates` viene **sin body** y el de pagos con `{error}`, así que el Alert ni siquiera dice que la sesión expiró; dice "Ocurrió un error inesperado" | PASS (confirma hallazgo P1-2) | `clases.test.tsx:123`, `carrito.test.tsx:143`, `apiClient.test.ts:124` |

## Hallazgos

Ninguno se corrigió en esta ronda: el prompt pide pruebas y documentación (sección 5), así que cada uno queda **pendiente de decisión humana**. Cuando se corrija, hay que volver a correr `npm test` completo y actualizar la fila y el hallazgo, sin darlo por cerrado antes.

### P0-1 — Si `Keychain.getGenericPassword` tira al arrancar, la app se queda en el Splash para siempre

- **Dónde**: `src/features/auth/context/AuthContext.tsx:56-70`. `await obtenerToken()` (línea 58) está **fuera** del `try/catch`, que solo envuelve `obtenerPerfil`. Si lanza, el IIFE async del `useEffect` se rechaza sin que nadie lo maneje y `setIsLoading(false)` (línea 68) nunca corre. `RootNavigator.tsx:30` muestra `<SplashScreen />` mientras `isLoading` sea `true`.
- **Impacto**: app inutilizable sin salida; reiniciarla no sirve, porque el Keystore sigue igual. Casos reales: Keystore de Android corrupto o invalidado (cambio de bloqueo de pantalla, restauración de backup), errores de permisos del SO.
- **Evidencia**: `__tests__/errores/authArranqueKeychain.test.tsx:34`. Con `getGenericPassword` rechazando, `isLoading` sigue en `true` después de 100 ms, no hay request de red y se registra el rechazo "Keystore corrupto". El control en `:53` confirma que el mismo árbol sale del Splash si el Keychain funciona.
- **Corrección sugerida**: meter `obtenerToken()` dentro del `try` (o un `try/finally` alrededor de todo el IIFE para que `setIsLoading(false)` siempre corra), y ante fallo tratarlo como "sin sesión" e intentar `borrarToken()`.
- **Estado**: pendiente.

### P1-1 — Ningún mensaje de error de `feellingPilates-pagos` llega al usuario: el contrato de errores no coincide

- **Dónde**: `src/api/client.ts:40-44` lee `body.message`. `feellingPilates-pagos` responde `{ error: "...", origen?: "..." }` (`src/middleware/errores.ts:28`, `src/middleware/auth.ts:28/42/50`), y `gateway/nginx.conf` lo proxea sin transformar.
- **Impacto**: todo error de pago (tarjeta rechazada con `origen: stripe_decline`, paquete inactivo 404, validación 400, sesión vencida 401, error interno 500) se muestra como "Ocurrió un error inesperado". El usuario no sabe si reintentar, cambiar de tarjeta o volver a iniciar sesión. Los mensajes que **sí** llegan son los del SDK de Stripe (`initError`/`presentError`, #26/#28), que no pasan por `apiFetch`.
- **Evidencia**: `apiClient.test.ts:110`; `carrito.test.tsx:143` y `:159` (`test.each` 400/404/502).
- **Corrección sugerida**: decidir un único contrato. Opción A: `apiFetch` acepta `body.message ?? body.error`. Opción B: `feellingPilates-pagos` responde también `message`. La opción B deja a los dos backends con la misma forma que `ErrorResponse` (`src/api/types.ts`).
- **Estado**: pendiente de decisión.

### P1-2 — Sesión vencida a mitad de uso: sin interceptor de 401 y con un mensaje que no lo dice

- **Dónde**: `src/api/client.ts` no trata el 401 de forma especial. `feellingPilates` responde 401 **sin cuerpo** (`SecurityConfig.java:55`, `HttpStatusEntryPoint`), y pagos responde `{error: 'Token invalido o expirado'}` (ver P1-1).
- **Impacto**: con el JWT vencido, cada acción autenticada (reservar, pagar, editar perfil, subir foto) muestra "Ocurrió un error inesperado", una y otra vez, hasta que el usuario cierra sesión por su cuenta. Nada le indica que ese es el problema.
- **Evidencia**: `clases.test.tsx:123` (dos intentos seguidos, mismo Alert genérico, sin navegar a `Auth`); `carrito.test.tsx:143`; `apiClient.test.ts:124`.
- **Corrección sugerida** (fuera del alcance de "solo pruebas", por eso no se aplicó): mínimo, un mensaje específico para `status === 401` ("Tu sesión expiró, vuelve a iniciar sesión"); idealmente, un manejo central que llame a `logout()` y lleve a `Auth`.
- **Estado**: pendiente de decisión.

### P1-3 — Abrir la app sin conexión (o con el backend caído) cierra la sesión

- **Dónde**: `AuthContext.tsx:63-66`. El `catch` trata **cualquier** fallo de `obtenerPerfil` como token inválido y llama `borrarToken()`: status 0 (sin red), 5xx, timeout.
- **Impacto**: un usuario que abre la app en el metro, en modo avión o durante un despliegue del backend pierde la sesión y tiene que volver a iniciarla. Es recuperable, pero es un logout involuntario.
- **Evidencia**: `authContext.test.tsx:80` (fetch rechaza → `resetGenericPassword` llamado, `token` `null`).
- **Corrección sugerida**: borrar el token solo si `err instanceof ApiError && err.status === 401` (o 403); en los demás casos, conservar el token y reintentar o mostrar un aviso de conexión.
- **Estado**: pendiente.

### P1-4 — Si `Keychain.resetGenericPassword` falla, "Cerrar sesión" no hace nada visible

- **Dónde**: `AuthContext.tsx:98-102` (`setToken(null)`/`setUser(null)` quedan después de `await borrarToken()`); los callers `AccountScreen.tsx:223` e `InstructorAccountScreen.tsx:45` pasan `onPress={logout}` sin `catch`.
- **Impacto**: el usuario toca "Cerrar sesión" y no pasa nada: el rechazo queda sin manejar y la sesión sigue en memoria y en el Keychain. En un dispositivo compartido, el siguiente usuario hereda la sesión.
- **Evidencia**: `authContext.test.tsx:200`.
- **Corrección sugerida**: limpiar el estado en memoria aunque falle el Keychain (`try { await borrarToken() } finally { setToken(null); setUser(null) }`) y registrar o avisar del fallo.
- **Estado**: pendiente.

### P1-5 — Cancelar el selector de Google se muestra como error

- **Dónde**: `AuthContext.tsx:89-91` lanza el mismo `Error('No se pudo iniciar sesión con Google')` para "cancelado" y para "sin idToken"; `mapGoogleAuthError` (no es `ApiError`) lo convierte en "Ocurrió un error inesperado. Intenta de nuevo."; `AuthScreen.tsx:96` lo pinta.
- **Impacto**: el usuario que solo cerró el diálogo ve un mensaje rojo de error. Es UX engañosa, igual que el ejemplo P1 del prompt.
- **Evidencia**: `authContext.test.tsx:153`, `authScreen.test.tsx:68`.
- **Corrección sugerida**: con `signInResponse.type === 'cancelled'`, retornar sin error (o lanzar un error marcado que la pantalla ignore).
- **Estado**: pendiente.

### P1-6 — Check-in QR: después de un fallo de red, re-escanear el mismo código se ignora en silencio

- **Dónde**: `InstructorClassCheckInScreen.tsx:67-68`. `ultimoValorRef` se fija **antes** de llamar a la red y no se limpia en el `catch` (línea 83-86).
- **Impacto**: si el check-in falla por red o por 5xx, el instructor ve el error, vuelve a apuntar al mismo QR y no pasa nada: ni request ni mensaje. Para reintentar tiene que escanear otro código primero, y nada en la pantalla lo indica. La asistencia puede quedar sin registrar.
- **Evidencia**: `clases.test.tsx:252` (1 sola llamada de red aunque el QR se escaneó dos veces tras el fallo).
- **Corrección sugerida**: en el `catch`, poner `ultimoValorRef.current = null` cuando el error es reintentable (status 0 o ≥ 500). El backend ya es idempotente, así que reintentar es seguro.
- **Estado**: pendiente.

### P2-1 — Check-in: si `obtenerClase` falla, el instructor no recibe ningún aviso

- **Dónde**: `InstructorClassCheckInScreen.tsx:52-64` (`.catch(() => setActiveClase(null))`).
- **Impacto**: solo desaparece el subtítulo con el nombre de la clase; el escáner sigue activo. El check-in funciona igual, porque solo usa `route.params.claseId`, pero el instructor no puede confirmar que está en la clase correcta.
- **Evidencia**: `clases.test.tsx:275`.
- **Estado**: pendiente (decisión de UX).

### P2-2 — Permiso de cámara denegado para siempre: sin salida a Ajustes

- **Dónde**: `InstructorClassCheckInScreen.tsx:117-127`. El botón vuelve a llamar `requestPermission`, que con "no volver a preguntar" (Android) o una denegación previa (iOS) devuelve `false` sin mostrar diálogo.
- **Impacto**: el botón no hace nada visible y el instructor no puede pasar lista por QR hasta que encuentre el permiso por su cuenta en los ajustes del SO.
- **Evidencia**: `clases.test.tsx:297` (mock). **Verificar en dispositivo real.**
- **Corrección sugerida**: si `requestPermission()` devuelve `false`, ofrecer `Linking.openSettings()`.
- **Estado**: pendiente.

### P2-3 — Login exitoso pero Keychain falla: mensaje genérico

- **Dónde**: `AuthContext.tsx:72-77` (y `registrar`/`loginConGoogle`). `guardarToken` va antes de `applyUser`/`setToken`.
- **Impacto**: el backend emitió un JWT (stateless, así que no queda nada colgado en el servidor), pero la app muestra "Ocurrió un error inesperado" y no inicia sesión. Reintentar probablemente falla igual. Es poco frecuente.
- **Evidencia**: `authContext.test.tsx:122`.
- **Estado**: pendiente (baja prioridad).

### P2-4 — Respuesta 2xx con body no-JSON (portal cautivo, proxy) sale como `SyntaxError`, no como `ApiError`

- **Dónde**: `client.ts:47-50` (`return response.json()` fuera de `try`).
- **Impacto**: todos los callers muestran su genérico, así que no rompe nada. Pero no se distingue de un bug real, y en un Wi-Fi con portal cautivo el usuario no ve el mensaje de conexión.
- **Evidencia**: `apiClient.test.ts:56`, `apiClient.test.ts:100`.
- **Estado**: pendiente (baja prioridad).

### P2-5 — Subir una foto inaccesible dice "No se pudo conectar con el servidor"

- **Dónde**: `usuarios.ts:34-48` + `client.ts:29-31`. Cualquier rechazo de `fetch` se traduce como falta de conexión.
- **Impacto**: si el usuario borró la foto entre elegirla y subirla, el mensaje lo manda a revisar su internet.
- **Evidencia**: `authContext.test.tsx:215` (con mock). **Verificar en dispositivo** el comportamiento real de RN.
- **Estado**: pendiente (baja prioridad).

### P2-6 — Logout con un pago en curso: el PaymentSheet se abre igual

- **Dónde**: `CarritoScreen.tsx:31-71`. `handlePagar` no vuelve a revisar `token` después de `await crearIntentoPago`.
- **Impacto**: nada queda colgado (#20), y en la práctica es difícil cerrar sesión con el flujo de pago en vuelo. Si ocurre, el sheet cobra a la cuenta de quien inició el pago, que es la dueña de la `Compra`, así que no hay cobro a otro usuario.
- **Evidencia**: `carrito.test.tsx:116`.
- **Estado**: documentado, sin acción recomendada inmediata.

### P2-7 — Éxito del PaymentSheet sin reconciliar con el backend

- **Dónde**: `CarritoScreen.tsx:62-64`.
- **Impacto**: "¡Compra exitosa!" se muestra en cuanto Stripe confirma, antes de que el webhook marque la `Compra` como `pagada`. Si el webhook tarda o falla, `useMisPaquetesActivos` puede no mostrar el paquete todavía, aunque la pantalla ya dijo "exitosa". `feellingPilates-pagos` ya expone `GET /compras/:id/estado-en-vivo` para este caso.
- **Evidencia**: `carrito.test.tsx:257` (una sola llamada de red).
- **Estado**: documentado; decidir si hace falta.

## Qué no se hizo / limitaciones

- No se corrigió ningún hallazgo (sección 5 del prompt): solo pruebas y documentación. Tampoco se agregó un interceptor de 401.
- No se llamó a Stripe ni a los backends reales. Los cruces con `feellingPilates` y `feellingPilates-pagos` son **lectura de código**, citada en cada fila.
- #19, #25 y #37 dependen de comportamiento nativo (lectura de `file://` en `FormData`, momento exacto de dos taps nativos, diálogo de permisos del SO) que aquí se simula con mocks. Lo verificado es la lógica de la app ante esas respuestas; confirmar la respuesta real del SO requiere un dispositivo.
- Padel (`CourtReservationsContext.tsx`) confirmado como estado local puro (`useState`, sin `apiFetch`): no tiene caminos de error de red y no se le dedicaron pruebas.

## Archivos de esta ronda

- `jest.config.js`, `jest/setup.js` — configuración y mocks nativos.
- `__tests__/helpers/fetchMock.ts` — respuestas de `fetch`, `rechazoDe`, `llamadasA`.
- `__tests__/errores/apiClient.test.ts`, `authContext.test.tsx`, `authArranqueKeychain.test.tsx`, `authScreen.test.tsx`, `carrito.test.tsx`, `clases.test.tsx`.
- `package.json`/`package-lock.json` — devDependencies `@testing-library/react-native`, `@react-native/jest-preset@0.86.0`; script `test:watch`.
