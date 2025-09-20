# WhatsApp – Flujo actual (v2 simplificado)

Este README refleja el flujo vigente en el frontend con el orquestador `/wa/*` y sin endpoints administrativos legacy.

## Arquitectura resumida

Frontend (Next.js) → Backend Core (Nest Aqua) → Orquestador WhatsApp (`/wa/*`) → Worker(s)

- El frontend usa helpers en `src/lib/api/simpleWaApi.ts`.
- No se usan más rutas `/_whatsapp/*` ni `/whatsapp/*` en UI. Acciones administrativas (reinit/purge) fueron removidas.

## Endpoints usados por el frontend

- `GET /wa/init`: inicia o recupera sesión; devuelve flags `ready`, `authenticated`, `hasQR`, y opcionalmente `qr`.
- `GET /wa/state`: snapshot de estado actual (para polling simple).
- `GET /wa/verify?phone=...` y `POST /wa/verify/bulk`: verificación de números.
- `POST /wa/send-pdf`: envía PDF en base64 (el backend genera la key y lo envía al worker).
- `POST /wa/logout`: cierra la sesión de WhatsApp del usuario.

Nota: El SSE unificado `/wa/events/stream` está planificado; hoy el modal usa polling simple.

## Hooks y componentes activos

- Hook: `src/hooks/useSimpleWaSession.ts`

  - Estados: `idle` | `initializing` | `qr` | `ready`.
  - Métodos: `start()`; gestiona init + polling de `state`/`qr`.
  - Retorno: `{ status, qr, initializing, ready, error, start }`.

- Modal: `src/app/home/components/WhatsappSessionModal.tsx`

  - Muestra el QR cuando `status === 'qr'`.
  - Llama a `start()` al abrirse; cierra automáticamente si `ready`.
  - Usa `qrcode` para renderizar la imagen a partir del texto.

- Navbar: `src/components/navbar/navbar.tsx`
  - Indicador de estado (verde listo, ámbar iniciando/esperando QR, gris inactivo).
  - Acciones disponibles: Ver/escaneo QR (abre el modal), Logout de WhatsApp, Logout de la plataforma.
  - Admin (reinit/purge) fue eliminado.

Enlaces rápidos a archivos clave:

- `src/lib/api/simpleWaApi.ts`
- `src/hooks/useSimpleWaSession.ts`
- `src/app/home/components/WhatsappSessionModal.tsx`
- `src/components/navbar/navbar.tsx`

## Helpers de API

Ubicación: `src/lib/api/simpleWaApi.ts`

- `simpleWaInit()` → GET `/wa/init`
- `simpleWaState()` → GET `/wa/state`
- `simpleWaQR()` → GET `/wa/state` y extrae `qr` (cuando aplica)
- `simpleWaVerify(phone)` → GET `/wa/verify?phone=...`
- `simpleWaBulkVerify(phones)` → POST `/wa/verify/bulk`
- `simpleWaSendPdf({ phoneNumber, pdfBase64, caption? })` → POST `/wa/send-pdf`
- `simpleWaLogout()` → POST `/wa/logout`

Autenticación: siempre con header `Authorization: Bearer <token>`.

## Flujo de inicio de sesión (UX)

1. Usuario abre el modal desde la Navbar: “Ver / Escanear QR”.
2. El modal llama `start()` del hook, que ejecuta `simpleWaInit()`.
3. Si `ready`, muestra estado listo; si no, comienza polling de `state` y `qr`.
4. Cuando `qr` está presente, se renderiza la imagen y el usuario lo escanea.
5. Al autenticarse (cuando `state` cambia a `ready`), el modal muestra éxito y puede autocerrar.

Snippet mínimo de uso del hook:

```tsx
import { useSimpleWaSession } from "@/hooks/useSimpleWaSession";

export function Example() {
  const { status, qr, ready, start } = useSimpleWaSession({ auto: false });
  useEffect(() => {
    start();
  }, [start]);
  if (ready) return <div>Listo</div>;
  if (status === "qr" && qr)
    return <img src={/* generar dataURL con qrcode */ ""} />;
  return <div>Inicializando...</div>;
}
```

## Diferencias vs documento anterior

- Se eliminaron las rutas `/whatsapp/*` en UI (status, purge, reinit, qr/stream/token, etc.).
- No se usa SSE legacy de QR; se hace polling liviano vía `/wa/state`.
- Se unificó el logout en `/wa/logout` y se reemplazaron helpers legacy.

## Próximos pasos (opcional)

- Implementar SSE unificado `/wa/events/stream` con token efímero.
- Migrar el backend para que `WaOrchestratorService` delegue internamente a `SimpleWaProxyService` hasta remover el orquestador.
- Telemetría mínima (regeneraciones, tiempos a ready) expuesta en `state`.

---

Última actualización: 2025-09-20
