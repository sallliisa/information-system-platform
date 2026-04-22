# Mobile V2 (Phase 1)

`apps/mobile-v2` is the new baseline mobile app built with Expo SDK 54, React Native, and Expo Router.

## Commands

Run from monorepo root:

- `pnpm dev:mobile` - start active mobile app (this app)
- `pnpm type-check:mobile` - type-check this app
- `pnpm --filter @repo/mobile-v2 lint` - run Expo lint
- `pnpm --filter @repo/mobile-v2 android` - open Android target
- `pnpm --filter @repo/mobile-v2 ios` - open iOS target
- `pnpm --filter @repo/mobile-v2 web` - run web target

## Navigation Baseline

Phase 1 intentionally keeps the route surface shallow:

- `/` -> Home screen
- `/details` -> Details screen

Rules for this phase:

- no deep route-group nesting
- no dynamic route segments
- stack-only flow with straightforward forward/back behavior

## Structure

```txt
app/
  _layout.tsx      # root Stack navigator
  index.tsx        # Home screen
  details.tsx      # Details screen
```

## Next Phase

Phase 2 will layer in auth boundaries and data integration while keeping navigation complexity controlled.
