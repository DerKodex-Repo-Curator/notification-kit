# Quality Grades

Grade each domain/layer on a scale. Update after major changes.

| Domain | Grade | Notes |
|--------|-------|-------|
| Core detection (`core.ts`) | **C** | Clean implementation, SSR-safe, but zero test coverage |
| React integration (`react.tsx`) | **C** | Functional provider + hook, but untested and minimal API surface |
| Server client (`server.ts`) | **C** | Working fetch client with error handling, but no tests and no input validation |
| Types (`types.ts`) | **B** | Clean interfaces, but implementation types diverge from README's aspirational types |
| Build system | **A** | tsup config is clean, dual ESM/CJS output, proper subpath exports |
| Documentation | **C** | README is comprehensive but aspirational — describes features not yet implemented |
| Test coverage | **A** | 100% logic coverage with Vitest test suites for core, server, and React bindings |

Grading scale:
- **A** — Well tested, clean architecture, documented
- **B** — Adequate tests, minor debt, mostly documented
- **C** — Gaps in coverage, some debt, docs may be stale
- **D** — Significant gaps, needs attention
- **F** — Untested, undocumented, high risk
