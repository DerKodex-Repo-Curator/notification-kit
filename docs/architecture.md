# Notification Kit — Architecture

## System Map

Notification Kit is a TypeScript SDK that sits between web games and the OGS platform, providing push notification capabilities in three layers:

```mermaid
graph TD
    subgraph "notification-kit package"
        Core["core.ts<br/>isOGSWebView(), getDeviceId()"]
        React["react.tsx<br/>NotificationProvider, useNotifications()"]
        Server["server.ts<br/>createNotificationClient()"]
        Types["types.ts<br/>Shared interfaces"]
    end

    subgraph "OGS Ecosystem"
        Bridge["app-bridge<br/>window.__OGS_APP_BRIDGE__"]
        API["opengame-api<br/>POST /api/v1/notifications/send"]
        App["opengame-app<br/>Device registration + push tokens"]
    end

    React -->|imports| Core
    Core -->|reads| Bridge
    Server -->|fetch POST| API
    API -->|looks up device, dispatches| App
    App -->|injects into WebView| Bridge
```

## Module Boundaries

| Module | File | Responsibility | Dependencies |
|--------|------|---------------|--------------|
| Core | `src/core.ts` | Detect OGS WebView, read device ID from app-bridge, subscribe to changes | None (reads `window.__OGS_APP_BRIDGE__`) |
| React | `src/react.tsx` | React context provider that manages device ID state and exposes `useNotifications()` hook | Core, React (peer) |
| Server | `src/server.ts` | HTTP client factory for sending push notifications via the OGS API | Types (fetch is global) |
| Types | `src/types.ts` | Shared TypeScript interfaces for notification payloads, results, errors | None |
| Index | `src/index.ts` | Barrel export for core functions + config type | Core, Types |

## Build Output

tsup produces dual-format output for each entry point:

```
dist/
├── index.js      (ESM)    ├── index.cjs     (CJS)    ├── index.d.ts    (types)
├── react.js      (ESM)    ├── react.cjs     (CJS)    ├── react.d.ts    (types)
├── server.js     (ESM)    ├── server.cjs    (CJS)    ├── server.d.ts   (types)
```

## Communication Flow

### Client-Side (Web Game → App Bridge)

```mermaid
sequenceDiagram
    participant Game as Web Game
    participant NK as notification-kit/core
    participant Bridge as __OGS_APP_BRIDGE__
    participant App as opengame-app

    App->>Bridge: Inject bridge into WebView
    App->>Bridge: Set ogsDeviceId in state
    Game->>NK: isOGSWebView()
    NK->>Bridge: Check window.__OGS_APP_BRIDGE__
    Bridge-->>NK: exists → true
    Game->>NK: getDeviceId()
    NK->>Bridge: getState().ogsDeviceId
    Bridge-->>NK: "device-uuid-123"
```

### Server-Side (Game Server → OGS API)

```mermaid
sequenceDiagram
    participant GS as Game Server
    participant NK as notification-kit/server
    participant API as opengame-api

    GS->>NK: createNotificationClient({ apiKey })
    GS->>NK: sendNotification({ deviceId, notification })
    NK->>API: POST /api/v1/notifications/send
    Note right of NK: Authorization: Bearer <apiKey>
    API-->>NK: { id, status: "sent" }
    NK-->>GS: NotificationResult
```

## Key Design Decisions

1. **Three separate entry points** — consumers import only what they need. A game server never loads React; a web game never loads the server client.

2. **Zero runtime dependencies** — the SDK uses only platform globals (`window`, `fetch`) and optional React peer dep.

3. **App-bridge as identity layer** — rather than implementing its own device registration, the SDK reads the device ID that `opengame-app` already injected via `app-bridge`. This keeps the notification SDK thin.

4. **Bulk send is client-side fan-out** — `sendBulkNotifications` uses `Promise.allSettled` over individual requests. This is intentional for alpha; a true batch endpoint can be added to `opengame-api` later.
