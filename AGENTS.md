# AGENTS.md

## Project

- **Name:** notification-kit
- **Description:** Push notification SDK for the Open Game System (OGS) — client-side detection of the OGS WebView, React context for device ID, and server-side notification dispatch
- **Tech stack:** TypeScript (strict), React 18+ (optional peer), tsup (bundler)
- **Package manager:** npm
- **Package:** `@open-game-system/notification-kit` (v0.0.1-alpha.1)
- **Source layout:**
  - `src/core.ts` — client-side detection functions (`isOGSWebView`, `getDeviceId`, `onDeviceIdChange`)
  - `src/react.tsx` — React context provider and hook (`NotificationProvider`, `useNotifications`)
  - `src/server.ts` — server-side notification client factory (`createNotificationClient`)
  - `src/types.ts` — shared TypeScript interfaces
  - `src/index.ts` — barrel export for core + types

## Subpath Exports

This package exposes three entry points:

| Import Path | File | Environment | Purpose |
|-------------|------|-------------|---------|
| `@open-game-system/notification-kit` | `src/index.ts` | Client (browser) | OGS WebView detection, device ID access |
| `@open-game-system/notification-kit/react` | `src/react.tsx` | Client (React) | `<NotificationProvider>` + `useNotifications()` hook |
| `@open-game-system/notification-kit/server` | `src/server.ts` | Server (Node/Edge) | `createNotificationClient()` for sending push notifications |

## Knowledge Base

Start here. Load deeper docs **only when working on the relevant domain.**

| Topic | Location |
|---|---|
| System architecture | [docs/architecture.md](docs/architecture.md) |
| Lessons learned | [docs/lessons.md](docs/lessons.md) |
| Quality grades | [docs/quality.md](docs/quality.md) |

> **Progressive disclosure:** Do NOT load all docs upfront. Read this file,
> then load the specific doc relevant to your current task.

## Core Principles

- **Zero runtime deps**: This is a lightweight SDK — no production dependencies
- **Three clean entry points**: Core (vanilla JS), React, Server — consumers import only what they need
- **App-bridge is the source of truth**: Client-side detection reads from `window.__OGS_APP_BRIDGE__` injected by the OGS mobile app
- **README is aspirational**: The README documents the full planned API surface. The implementation is intentionally minimal for alpha. Do not "fix" the README to match the code — the code should grow toward the README.

## Key Conventions

### Client-Side Detection

- `isOGSWebView()` checks for `window.__OGS_APP_BRIDGE__` — returns `false` on server (SSR-safe)
- `getDeviceId()` reads `bridge.getState().ogsDeviceId` — returns `null` if not in OGS app
- `onDeviceIdChange()` subscribes to bridge state changes — returns an unsubscribe function (no-op if SSR)

### React Integration

- `NotificationProvider` wraps the app, manages `deviceId` state with `useEffect` subscription
- `useNotifications()` returns `{ isInOGSApp, isSupported, deviceId }`
- `isSupported` is `true` only when both inside OGS app AND deviceId is available

### Server Client

- `createNotificationClient({ apiKey, baseUrl? })` returns `{ sendNotification, sendBulkNotifications }`
- Default base URL: `https://api.opengame.org`
- Auth via `Authorization: Bearer <apiKey>` header
- Bulk send is currently N individual requests via `Promise.allSettled` (no batch API yet)
- Errors throw `NotificationApiError` with `code`, `message`, `status` from API response

## OGS Ecosystem Integration

```
┌─────────────────────────────────────────────────────┐
│ Game Server                                         │
│   uses: notification-kit/server                     │
│   calls: createNotificationClient({ apiKey })       │
│   sends: POST /api/v1/notifications/send            │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│ opengame-api (Cloudflare Workers)                   │
│   validates API key, looks up device, dispatches    │
│   push via APNs / FCM                              │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│ opengame-app (Expo / React Native)                  │
│   registers device + push token on launch           │
│   injects __OGS_APP_BRIDGE__ into WebView           │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│ Web Game (runs inside WebView)                      │
│   uses: notification-kit (core + /react)            │
│   reads: isOGSWebView(), getDeviceId()              │
│   renders: <NotificationProvider> + useNotifications │
└─────────────────────────────────────────────────────┘
```

## Build & Test

```bash
# Install dependencies
npm ci

# Build (ESM + CJS + .d.ts via tsup)
npm run build

# Type check
npm run typecheck

# Dev mode (watch)
npm run dev

# Run tests
npm test
```

## CI / CD

GitHub Actions workflow (`.github/workflows/ci.yml`) with three jobs:

| Job | Trigger | What it does |
|-----|---------|-------------|
| `test` | All pushes + PRs | Typecheck → Build → Test |
| `publish-dev` | PR branches | Publishes `MAJOR.DATE.PATCH-prN` to GitHub Packages, comments on PR |
| `publish-production` | Push to `main` | Publishes `MAJOR.DATE.PATCH` to npm, commits version bump back |

### Versioning Scheme

Same calver pattern as `app-bridge`:
- **Dev (PR):** `0.20260312.0-pr42` → GitHub Packages (`@dev` tag)
- **Production (main):** `0.20260312.0` → npm (`@latest` tag)

### Required Secrets

| Secret | Where | Purpose |
|--------|-------|---------|
| `GITHUB_TOKEN` | Automatic | Publishing dev versions to GitHub Packages |
| `NPM_TOKEN` | Repo settings | Publishing production versions to npm |

## Git

- **Main branch:** `main`
- Never use `--no-verify` on git hooks
