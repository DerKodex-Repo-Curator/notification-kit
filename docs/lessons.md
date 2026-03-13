# Lessons Learned

Persistent project knowledge. Things any agent (or human) needs to know.
Updated whenever a mistake is made, a gotcha is discovered, or a pattern proves
effective. Review this file at the start of each task.

> **Rule of thumb:** If this lesson would save a future agent from making
> the same mistake, it belongs here.

## Architecture

- **README is aspirational, not descriptive.** The README.md documents the full planned API surface (device registration, permission management, notification analytics, etc.). The actual implementation is intentionally a minimal alpha. Don't "fix" the README to match the code — grow the implementation toward the README.

- **App-bridge dependency is implicit, not explicit.** `core.ts` reads from `window.__OGS_APP_BRIDGE__` which is injected by `opengame-app` via the `app-bridge` package. There's no npm dependency on `app-bridge` — it's a runtime contract. If the bridge shape changes, `core.ts` must be updated manually.

## Build & Tooling

- **tsup handles the dual ESM/CJS build.** Don't add a separate CJS build step or try to configure TypeScript's `module` output — tsup does it all. The `tsconfig.json` is only used for type-checking (`tsc --noEmit`), not for building.

- **React is externalized in tsup config.** The `external: ['react']` in `tsup.config.ts` prevents React from being bundled into the output. This is critical — consumers provide their own React.
