# Base Frontend Monorepo

Monorepo skeleton for the company platform stack.

Current status:

- `apps/web` is the active Vue 3 + Vite frontend.
- `apps/api` is a placeholder for the future backend app.
- `apps/mobile-v2` is the active Expo SDK 54 mobile baseline.
- `apps/mobile` remains as the legacy mobile implementation.
- `packages/contracts`, `packages/sdk`, and `packages/domain` are scaffolded package boundaries only.
- `packages/model-meta` contains shared model config types, merge/runtime utilities, and base models.

## Workspace Layout

```txt
apps/
  api/              # backend placeholder
  mobile-v2/        # active Expo mobile app (Phase 1 baseline)
  mobile/           # legacy Expo mobile app
  web/              # active Vue frontend
packages/
  contracts/        # future generated API contracts
  sdk/              # shared API client wrapper
  domain/           # future shared domain primitives
  model-meta/       # shared model metadata + runtime config builders
```

## Commands

The repository is standardized on `pnpm`.

- `pnpm dev` - run the web app only
- `pnpm dev:mobile` - run the active mobile app (`apps/mobile-v2`)
- `pnpm dev:mobile:legacy` - run the legacy mobile app (`apps/mobile`)
- `pnpm build` - build the web app only
- `pnpm test` - run the web test suite only
- `pnpm type-check` - type-check the web app only
- `pnpm type-check:mobile` - type-check the active mobile app (`apps/mobile-v2`)
- `pnpm lint` - lint the web app only

## Current Baseline

From the relocated web app:

- unit tests pass
- type-check passes
- production build still fails because `src/assets/corporate/assets/logo-hka.png` is missing

That build failure is a pre-existing web issue and is not introduced by the monorepo skeleton itself.

## Web App

See [apps/web/README.md](/Users/gamer/Documents/projects/base-frontend/apps/web/README.md) for frontend-specific setup and runtime notes.
