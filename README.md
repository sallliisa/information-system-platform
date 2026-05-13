# Base Frontend Monorepo

Monorepo skeleton for the company platform stack.

Current status:

- `apps/web` is the active Vue 3 + Vite frontend.
- `apps/api` is a placeholder for the future backend app.
- `apps/base-mobile` is the active Expo mobile baseline.
- `packages/contracts`, `packages/sdk`, and `packages/domain` are scaffolded package boundaries only.
- `packages/model-meta` contains shared model config types and runtime helpers, published as `@southneuhof/is-data-model`.
- `packages/vue-framework` contains Vue components, services, and app patterns, published as `@southneuhof/is-vue-framework`.
- `packages/apostle` contains HTTP helpers used by `vue-framework`, published as `@southneuhof/apostle`.
- `packages/data-model` contains project-owned model definitions (base/web/mobile).

## Workspace Layout

```txt
apps/
  api/              # backend placeholder
  base-mobile/      # active Expo mobile app
  web/              # active Vue frontend
packages/
  contracts/        # future generated API contracts
  sdk/              # shared API client wrapper
  domain/           # future shared domain primitives
  model-meta/       # shared model metadata + runtime config builders
  vue-framework/    # Vue framework components and patterns
  apostle/          # HTTP helper package
  data-model/       # project-owned model definitions (base/web/mobile)
```

## Commands

The repository is standardized on `pnpm`.

- `pnpm dev` - run the Vue sandbox app with framework source aliases
- `pnpm dev:mobile` - run the mobile app (`apps/base-mobile`)
- `pnpm build` - build publishable framework packages and the web sandbox
- `pnpm test` - run framework package and web sandbox tests
- `pnpm type-check` - type-check workspace packages and apps
- `pnpm type-check:mobile` - type-check the mobile app
- `pnpm release:verify` - build, pack, and verify publishable package contents
- `pnpm changeset` - create a Changesets release note

## Framework Package Flow

Framework development is source-first. The sandbox web app resolves `@southneuhof/is-data-model`, `@southneuhof/is-vue-framework`, and `@southneuhof/apostle` directly to `packages/*/src` through Vite and TypeScript aliases, so framework edits work with normal Vite HMR.

Published package consumption is build-first. The publishable packages emit to `dist`, expose only `package.json#exports`, and are configured for GitHub Packages under the `@southneuhof` scope.

Run `pnpm release:verify` before publishing or cutting a release PR. Generated `dist` output and local pack tarballs are not source artifacts.

## GitHub Packages

This repo includes `.npmrc` registry routing for `@southneuhof`. Local consumers still need a GitHub Packages token in their user-level npm config or environment. CI publishing is handled by `.github/workflows/release.yml` with Changesets.

## Web App

See [apps/web/README.md](apps/web/README.md) for frontend-specific setup and runtime notes.
