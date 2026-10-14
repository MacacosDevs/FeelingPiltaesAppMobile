# Prompt — Pruebas de errores de la app móvil (feellingPilatesApp)

**Proyecto:** `feellingPilatesApp` (React Native 0.86 + TypeScript, sin backend propio: consume `feellingPilates` y `feellingPilates-pagos` vía `apiFetch`, más SDKs nativos de terceros: Keychain, Google Sign-In, Stripe, vision-camera, image-picker).

**Propósito:** cobertura sistemática de los caminos de error de la app, con el mismo espíritu de control que ya se usa en `feellingPilates-pagos` (`auditoria/testing-errores/PROMPT-PRUEBAS-ERRORES.md` y su `MATRIZ-COBERTURA.md`) y en `feellingPilates` (`auditoria/orquestacion/`): severidad clasificada, resultados escritos en el repo (no solo en el chat), y nadie da por resuelto su propio hallazgo sin volver a correr la prueba.

No replica el orquestador multiagente completo del backend Java (EXECUTOR/AUDITOR/CORRECTOR con gates) — ese protocolo es para intervenciones de arquitectura con publicación. Aquí el objetivo es más chico y más cercano al prompt de pagos: pruebas de error con trazabilidad, adaptadas a que esto es un cliente RN sin lógica de servidor propia.

Este archivo es el prompt en sí — pégalo completo en una sesión nueva (o pásalo tal cual a un agente) cuando quieras correr o ampliar esta ronda de pruebas.

---

## 0. Contexto que hay que leer antes de escribir una sola prueba

Lee estos archivos, en este orden, antes de generar código de prueba:

1. `src/api/client.ts` — el único punto de entrada a la red (`apiFetch`) y la única clase de error propia (`ApiError`, con `status`/`message`/`fieldErrors`). A diferencia del backend de pagos, **no hay taxonomía de errores propia**: todo lo que no es `ApiError` (fallos de Keychain, Google Sign-In, Stripe SDK, vision-camera, image-picker) es un error nativo o genérico sin normalizar — confírmalo leyendo cada integración, no lo asumas.
2. `src/features/auth/context/AuthContext.tsx` y `src/features/auth/utils/secureToken.ts` — sesión, arranque de la app, y cómo (o si) se limpia un token inválido.
3. `src/features/packages/context/CarritoContext.tsx`, `src/features/packages/api/pagos.ts`, `src/features/packages/utils/idempotency.ts` y `src/features/packages/screens/CarritoScreen.tsx` — el único flujo de dinero del lado cliente (Stripe PaymentSheet + `crearIntentoPago`).
4. `src/features/classes/api/clases.ts` y `src/features/instructor/screens/InstructorClassCheckInScreen.tsx` — reservas, cancelaciones y el check-in por QR (incluye `parseCodigo`, que decide del lado cliente si un QR es válido para la clase antes de llamar al backend).
5. `src/app/navigation/RootNavigator.tsx` — cómo se decide qué stack se muestra (invitado / cliente / instructor) y qué pasa con `isLoading`. **No hay ningún interceptor global de 401** en `apiFetch`: cada pantalla decide qué hacer con un token vencido a mitad de sesión. Confirma este punto en el código, no lo des por hecho de este prompt.
6. `src/features/padel/context/CourtReservationsContext.tsx` — confirma que Padel es **estado local puro** (`useState` en memoria, sin ninguna llamada a `apiFetch`). No hay nada que reservar contra un servidor ahí todavía: no le dediques pruebas de error de red o de concurrencia, solo un smoke test de UI si acaso.

No asumas comportamiento por el nombre de una función o de una pantalla: confirma leyendo el código. Cuando un escenario dependa de qué le responde el backend (`feellingPilates` o `feellingPilates-pagos`) — p. ej. qué código HTTP devuelve `POST /api/clases/:id/reservas` cuando la clase está llena — cruza contra el controlador real de ese servicio en vez de inventar el código de estado.

## 1. Punto de partida: la infraestructura de tests actual es mínima

`package.json` solo tiene `jest` + `@react-native/jest-preset` + `react-test-renderer`, y el único test existente (`__tests__/App.test.tsx`) monta `<App />` completo sin mockear nada. Antes de escribir las pruebas de la sección 2:

1. Instalar `@testing-library/react-native` (y `@testing-library/jest-native` si hace falta para matchers) como devDependency — montar árboles completos con `react-test-renderer` a mano para cada pantalla no escala para probar estados de error.
2. Mockear `global.fetch` por test (`jest.spyOn(global, 'fetch')` o similar) para controlar determinísticamente cada respuesta de `apiFetch`: éxito, error 4xx/5xx con body JSON, error con body no-JSON, y **rechazo de la promesa** (fetch tira, ej. sin conexión) — los tres caminos que ya distingue `client.ts`.
3. Mockear los módulos nativos de terceros que **no** vienen mockeados por el preset de RN, uno por uno, decidiendo qué API expone cada mock:
   - `@react-native-google-signin/google-signin` (`GoogleSignin.configure`, `.hasPlayServices`, `.signIn`).
   - `react-native-keychain` (`setGenericPassword`, `getGenericPassword`, `resetGenericPassword`) — necesario para forzar el caso "Keychain tira" de la sección 2.B.
   - `@stripe/stripe-react-native` (`useStripe` → `initPaymentSheet`, `presentPaymentSheet`).
   - `react-native-vision-camera` (`useCameraDevice`, `useCameraPermission`, `useCodeScanner`, `Camera`).
   - `react-native-image-picker` si se prueba `InstructorEditProfileScreen`/`EditProfileScreen` (subida de foto).
4. Añadir script `"test:watch": "jest --watch"` si no está.
5. Nunca usar una publishable key real de Stripe (`pk_live_`), un `idToken` real de Google, ni un JWT real de producción en ningún test o fixture.

## 2. Matriz de escenarios de error a cubrir

### `apiFetch` / `ApiError` (`src/api/client.ts`)
- `fetch` rechaza (sin conexión, DNS, timeout) → `ApiError(0, 'No se pudo conectar con el servidor')`, nunca deja escapar el error original de `fetch`.
- Respuesta no-ok con body JSON válido (`{message, fieldErrors}`) → `ApiError` usa ese `message`/`fieldErrors`.
- Respuesta no-ok sin body JSON parseable (p. ej. HTML de un proxy/gateway caído, o vacío) → `ApiError` cae al mensaje genérico `'Ocurrió un error inesperado'`, sin lanzar por el `response.json()` fallido.
- Respuesta **ok** (2xx) con body que no es JSON válido → hoy `response.json()` no está en un `try/catch` para el camino de éxito: confirma qué pasa (la promesa de `apiFetch` se rechaza con el `SyntaxError` crudo de `JSON.parse`, no con un `ApiError`) y documenta si algún caller distingue este caso de un `ApiError` real (probablemente no, ver siguiente punto).
- Respuesta 204 → resuelve `undefined`, ningún intento de parsear body.
- Request con `body: FormData` → confirma que el header `Content-Type` no se fija a mano (se lo dejamos a RN) y que si además hay otros `options.headers` (ej. `Authorization`) igual se preservan.
- Todo caller que hace `err instanceof ApiError ? err.message : 'mensaje genérico'` (patrón repetido en `CarritoScreen`, `InstructorClassCheckInScreen`, etc.): confirma qué mensaje ve el usuario cuando el error real **no** es `ApiError` (p. ej. el `SyntaxError` del punto anterior, o un error de Google Sign-In) — si siempre cae al genérico, es aceptable, pero decláralo explícitamente en vez de asumirlo.

### Sesión y arranque de la app (`AuthContext.tsx`, `secureToken.ts`)
- Arranque sin token guardado → `isLoading` termina en `false`, `user`/`token` quedan `null`, sin llamar a `obtenerPerfil`.
- Arranque con token guardado válido → `obtenerPerfil` ok, `user`/`token` se setean, `photoVersion` cambia.
- Arranque con token guardado pero vencido/inválido (`obtenerPerfil` → `ApiError(401,...)`) → se llama `borrarToken()`, `user`/`token` quedan `null`, `isLoading` termina en `false`.
- **Arranque donde `obtenerToken()` (es decir, `Keychain.getGenericPassword`) tira** (Keystore corrupto, permiso de OS, etc.): en el código actual esa llamada está **fuera** del `try/catch` que solo envuelve `obtenerPerfil`. Verifica si esto dice deja la promesa del `useEffect` rechazada sin manejar y `setIsLoading(false)` **nunca se ejecuta** → la app queda mostrando `SplashScreen` para siempre. Si se confirma, es un hallazgo (ver severidad en sección 3) — no lo des por bug hasta reproducirlo con un mock de Keychain que tira.
- `login` / `registrar`: credenciales inválidas (401/400 del backend) → el error se propaga tal cual hasta la pantalla; confirma que `LoginScreen`/pantalla de registro lo captura y muestra, no lo deja sin manejar.
- `login` / `registrar` exitosos pero `guardarToken` (Keychain) tira **después** de que el backend ya emitió el token → `setToken`/`applyUser` nunca corren (están después del `await guardarToken`); el usuario "inició sesión" en el backend pero la app no lo refleja. Confirma cómo se ve esto para el usuario (¿mensaje de error genérico, pantalla que no avanza?).
- `loginConGoogle`: `GoogleSignin.hasPlayServices()` tira (Play Services ausente/desactualizado) → error nativo sin normalizar, propagado tal cual.
- `loginConGoogle`: el usuario **cancela** el picker de Google (`signInResponse.type !== 'success'`) → hoy se lanza el mismo `Error('No se pudo iniciar sesión con Google')` que un fallo real; confirma si la pantalla muestra ese mensaje como si fuera un error cuando en realidad el usuario solo cerró el diálogo (candidato a hallazgo de UX, ver sección 3).
- `loginConGoogle` con `idToken` presente pero el backend rechaza el intercambio (400/401 de `authApi.loginConGoogle`) → `ApiError` normal, confirma que se distingue del caso "cancelado" de arriba.
- `deleteAccount` / `updateProfile` / `updatePhoto` invocados sin `token` (sesión ya cerrada en otra pestaña de la UI, condición de carrera de re-render) → lanzan `Error('No hay sesión activa')`, **no** `ApiError`; confirma qué mensaje ve el usuario si el caller solo distingue `instanceof ApiError`.
- `logout`: `Keychain.resetGenericPassword` tira → confirma si igual se limpia el estado en memoria (`setToken(null)`/`setUser(null)`) o si el error aborta el logout dejando la sesión "a medias" (estado en memoria limpio pero token real seguía en Keychain, o viceversa).
- `subirFoto` con `asset.uri` inválido/inaccesible (el usuario borró la foto entre elegirla y confirmar) → confirma el mensaje que llega desde el backend o desde RN al armar el `FormData`.

### Carrito y pago (`CarritoContext.tsx`, `pagos.ts`, `CarritoScreen.tsx`, Stripe)
- Carrito con items y luego `logout` (token pasa a `null`) → el `useEffect` de `CarritoContext` vacía el carrito; confirma que si había un pago **en curso** (`procesando: true`) al momento del logout, no queda en un estado colgado.
- `handlePagar` con `token` presente pero `crearIntentoPago` responde 401 (sesión expiró mientras el usuario armaba el carrito) → `Alert` con el mensaje, carrito **no** se vacía, el usuario puede reintentar tras volver a iniciar sesión.
- `crearIntentoPago` responde 400 (`paqueteIds` inválido) / 404 (paquete inactivo mientras estaba en el carrito) / 502 (error de Stripe traducido por `feellingPilates-pagos`) → cada uno debe mostrar `initError`/mensaje sin reventar la pantalla, y **sin** limpiar `claveIdempotenciaRef` (debe reusarse en el reintento, igual que espera el backend).
- Doble tap en "Pagar" antes de que `procesando` se refleje en el botón: confirma en `PrimaryButton` si `loading`/`disabled` realmente bloquea un segundo `onPress` nativo antes del primer re-render, o si hay una ventana donde `handlePagar` puede dispararse dos veces con la misma `claveIdempotenciaRef` (esto es deseable — el backend lo debe des-duplicar — pero hay que confirmar que la app no genera una *segunda* clave por error).
- `initPaymentSheet` devuelve `initError` (tarjeta guardada corrupta, configuración de Stripe inválida, etc.) → `Alert`, `procesando` vuelve a `false`, `claveIdempotenciaRef` sigue viva para el reintento.
- `presentPaymentSheet` devuelve `presentError.code === 'Canceled'` (usuario cerró el sheet) → **no** debe mostrar `Alert` (es un cierre voluntario, no un error), y el carrito debe seguir intacto para reintentar.
- `presentPaymentSheet` devuelve un error real (tarjeta rechazada, error de red del SDK de Stripe) → `Alert` con el mensaje, mismo comportamiento de retención de carrito y clave que arriba.
- `presentPaymentSheet` resuelve sin error → hoy la app asume éxito y vacía el carrito **sin volver a consultar al backend** (`GET /api/pagos/mis-compras` o `estado-en-vivo`) para confirmar que la `Compra` ya quedó `pagada`. Documenta esto como comportamiento actual (depende de que el webhook de `feellingPilates-pagos` procese a tiempo) — no es necesariamente un bug, pero es una ventana real entre "Stripe confirmó" y "nuestro backend lo sabe" que vale la pena declarar explícitamente en la matriz.

### Clases: reservar, cancelar, check-in por QR (`clases.ts`, pantallas de instructor)
- `reservarClase` sin token (usuario invitado intenta reservar) → confirma que la pantalla redirige a `Auth` en vez de dejar que `apiFetch` mande `Authorization: Bearer undefined`.
- `reservarClase` con clase llena / fuera de ventana de reserva / usuario ya con una reserva activa para esa clase → cruza contra el código de error real que devuelve `feellingPilates` (no lo inventes) y confirma que la pantalla lo muestra sin mensaje genérico.
- `cancelarReserva` de una reserva que no es del usuario (403) o que ya no existe (404) → confirma el mensaje mostrado en vez de un fallo silencioso.
- `registrarCheckin` con un QR que no matchea el formato `FEELINGPILATES-RESERVA|<id>|<id>` → rechazado del lado cliente por `parseCodigo`, **sin** llamar a la red (confirma que efectivamente no se llama `apiFetch`).
- `registrarCheckin` con un QR bien formado pero `claseId` que no es el de la clase activa en pantalla → rechazado del lado cliente antes de llamar al backend. **Confirma en el backend de `feellingPilates`** (no en esta app) que el endpoint `POST /api/clases/reservas/:reservaId/checkin` también valida server-side que el `claseId` del body corresponde a la `claseId` real de la reserva, y no confía ciegamente en lo que mande el cliente — si el backend no lo valida, un cliente modificado (rooteado/parcheado) podría marcar asistencia en una clase distinta a la que realmente cursó. Esto es un hallazgo de confianza de límites (trust boundary), no un bug de esta app, pero debe quedar documentado aquí porque esta app es la que expone la superficie.
- `registrarCheckin` exitoso, luego se vuelve a escanear el **mismo** código QR en la misma sesión de pantalla → `ultimoValorRef` bloquea el reintento del lado cliente; confirma además que el backend es idempotente ante un checkin duplicado (dos llamadas de red separadas, ej. dos instructores escaneando el mismo QR desde dos dispositivos).
- `obtenerClase(route.params.claseId)` falla al montar la pantalla de check-in (404, red caída) → hoy el `.catch` deja `activeClase` en `null` sin ningún mensaje de error visible para el instructor, solo desaparece el subtítulo con el nombre de la clase. Documenta si esto es aceptable o si el instructor necesita saber por qué no ve el nombre de la clase.
- Sin cámara en el dispositivo (`device` es `undefined`) y permiso de cámara denegado permanentemente (el usuario ya dijo "no preguntar de nuevo" en el OS) → confirma que `requestPermission()` realmente puede volver a preguntar, o si en ese caso hace falta mandar al usuario a Ajustes del sistema (comportamiento típico de iOS que la pantalla actual no contempla).

### Sesión que expira a mitad de uso (cualquier pantalla autenticada)
- Con sesión iniciada, cualquier llamada autenticada (reservar, comprar, editar perfil, subir foto) responde 401 porque el token venció mientras el usuario navegaba → hoy no hay ningún interceptor global: cada pantalla solo muestra su propio `Alert` con el mensaje del backend, sin forzar `logout()` ni redirigir a `Auth`. Si el usuario sigue navegando, cada acción autenticada repetirá el mismo error hasta que cierre sesión manualmente. Documenta este comportamiento tal cual existe hoy — no lo arregles como efecto colateral de "solo pruebas" (ver sección 5) — y clasifícalo en la sección 3.

## 3. Clasificación de severidad para lo que se encuentre

| Severidad | Qué significa aquí | Ejemplos |
| --- | --- | --- |
| **P0** | Pérdida o corrupción de datos del usuario, sesión de otro usuario expuesta, la app queda inutilizable (pantalla colgada sin salida), o se dispara un pago/cargo duplicado desde el cliente. | La app queda en `SplashScreen` para siempre si `Keychain.getGenericPassword` tira; un doble tap en "Pagar" logra que la app dispare dos intentos de pago con claves de idempotencia distintas. |
| **P1** | Estado inconsistente pero recuperable (con un reinicio de la app o un refresh), mensaje de error engañoso o ausente que confunde al usuario, o una validación que solo existe del lado cliente y podría faltar del lado servidor. | Cancelar el picker de Google se muestra como si fuera un error real; sesión vencida produce alerts repetidos en vez de un logout automático; check-in de QR confía en el `claseId` del cliente sin confirmar que el backend también lo valida. |
| **P2** | Falta de cobertura, mejora de UX, deuda técnica. | `obtenerClase` fallido no muestra ningún aviso al instructor; falta test de un escenario. |

Un hallazgo no se cierra por asumir que "ya se corrigió": se vuelve a correr la prueba después del fix y se actualiza la matriz. Nadie marca su propio hallazgo como resuelto sin esa re-ejecución.

## 4. Qué registrar y dónde

Actualiza [`MATRIZ-COBERTURA.md`](./MATRIZ-COBERTURA.md) en esta misma carpeta con el resultado de cada escenario de la sección 2 (`PENDING` / `PASS` / `FAIL`), y si hay un `FAIL` (o un comportamiento confirmado que en sí mismo es un hallazgo, aunque el test "pase"), agrega una entrada en la sección de hallazgos de ese mismo archivo con severidad, evidencia (archivo de test + línea) y estado de la corrección.

No dejes el resultado solo en el chat: la matriz en el repo es la fuente de verdad, igual que en `feellingPilates-pagos` y en `feellingPilates` (`auditoria/`).

## 5. Qué NO hacer

- No llamar a la API real de Stripe, ni al backend real de `feellingPilates`/`feellingPilates-pagos`, desde el suite automatizado — todo mockeado (`fetch`, `useStripe`, SDKs nativos).
- No commitear tokens JWT reales, `idToken` de Google reales, ni claves publicables/secretas de Stripe en tests o fixtures.
- No "arreglar" el hallazgo de sesión vencida (sección 2, último punto) agregando un interceptor global como parte de "solo pruebas" — es un hallazgo P1/P2 a documentar y decidir, no algo para resolver dentro de esta tarea salvo que se pida explícitamente.
- No marcar como `PASS` un escenario que no se ejecutó (evidencia física — archivo de test y línea —, no inferencia).
- No usar snapshots de `react-test-renderer`/RTL como sustituto de probar el comportamiento de error real (un snapshot que solo verifica que algo "se ve igual" no confirma que el mensaje de error correcto se muestra, ni que la red se llamó/no se llamó las veces esperadas).

## 6. Entregable esperado

- Suite de pruebas ejecutable con `npm test`, cubriendo los escenarios de la sección 2.
- `MATRIZ-COBERTURA.md` actualizada con el estado real de cada fila.
- Resumen final: cuántos escenarios `PASS`/`FAIL`, lista de hallazgos con severidad y si quedaron corregidos o pendientes de decisión humana.
