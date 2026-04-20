# Mobile App (Expo)

This workspace contains the mobile metaframework scaffold built on Expo + React Native.

## Stack

- Expo + Expo Router
- React Native + NativeWind
- Shared model config from `@repo/model-meta`
- Shared API client from `@repo/sdk`

## Core Components

- `CRUDComposite`
- `CRUDList`
- `CRUDDetail`
- `CRUDCreate`
- `CRUDUpdate`
- `Form`
- `Detail`
- `DataTable`

## Current Routes

- `system`: `/login` (guest-only)
- `appPrivate`: `/dummy/tab-1`, `/dummy/tab-2`, `/dummy/tab-3`, `/dummy/tab-4`, `/menu`, `/settings/users`, `/settings/roles`, `/settings/tasks` (authenticated)
- `appPublic`: `/public/about` (guest + authenticated)

## App Shells

- `/(authenticated)` uses authenticated app shell with floating bottom pill navbar
- `/(unauthenticated)` uses unauthenticated app shell for guest-only system routes
- `/(public)` uses public app shell with public manifest-driven navbar

## Authenticated Navigation (Phase 1)

- Static nav configuration source: `src/lib/authenticated-nav.config.ts`
- V1 regular tabs: `Tab 1` to `Tab 4` (dummy routes under `/dummy/tab-*`)
- Rightmost special tab: `Search` route (`/menu`)
- `/menu` renders grouped searchable route cards from private route manifest entries

## Shared Material Tokens

- Source of truth: `@repo/domain` (`packages/domain/src/theme/materialTokens.ts`)
- Mobile adapter: `src/theme/material.ts`
- Phase 1 rollout is mobile-only; web theme consumption remains unchanged

## Unified Route Manifest

- Source of truth: `src/lib/route-manifest.ts`
- Route categories are split into `system`, `appPrivate`, and `appPublic`
- Route lookup index is auto-built at module load (`buildRouteIndex`), no manual flat-map maintenance
- Permission filtering for private route visibility lives in `src/lib/route-access.ts`
- Compile-time integrity checks live in `src/lib/route-manifest.typecheck.ts`

## Commands

- `pnpm --filter @repo/mobile dev`
- `pnpm --filter @repo/mobile android`
- `pnpm --filter @repo/mobile ios`
- `pnpm --filter @repo/mobile type-check`
