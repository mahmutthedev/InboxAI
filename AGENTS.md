# Repository Guidelines

## Project Structure & Module Organization
This template targets Next.js 13 App Router. Route entries and layouts live in `app/`. Shared UI primitives and form logic belong in `components/`, while reusable utilities stay in `lib/`. Configuration defaults (theme, analytics, etc.) go under `config/`, Tailwind styles in `styles/`, and static assets in `public/`. Type definitions sit in `types/`. Import modules via the `@/` alias rather than relative `../../` chains.

## Build, Test, and Development Commands
Use `npm run dev` for the local dev server with hot reload. `npm run build` creates an optimized production bundle, and `npm run start` serves that build. Run `npm run lint` before pushing; use `npm run lint:fix` for safe autofixes. `npm run typecheck` must stay green to preserve strict TypeScript settings. Format code with `npm run format:write` or verify with `npm run format:check`. For a production smoke test, `npm run preview` builds and starts the app in one go.

## Coding Style & Naming Conventions
Follow the enforced Prettier settings: 2-space indentation, double quotes, no semicolons, trailing commas where valid. Imports auto-sort via `@ianvs/prettier-plugin-sort-imports`; keep module groups aligned with the existing order. ESLint extends `next/core-web-vitals` and Tailwind recommendations; address warnings rather than suppressing them. Compose Tailwind classes via the `cn` helper and prefer semantic component names (`Button`, `SiteHeader`, etc.) over generic labels.

## Testing Guidelines
No dedicated test runner ships with this template yet. Guard regressions by running `npm run lint` and `npm run typecheck` before every PR. If you add automated tests, colocate them next to the component (`component.test.tsx`) and document the new command in `package.json` so others can reproduce results.

## Commit & Pull Request Guidelines
Commits follow Conventional Commit style (see `feat(next-template): ...`, `fix(next-template): ...` in `git log`). Keep the scope meaningful and explain why, not just what. PRs should link issues when available, summarize behavior changes, and attach screenshots or recordings for any UI update.

## Configuration & Environment Notes
Node 18+ is recommended to match the Next.js toolchain. Update `config/` modules instead of hardcoding environment-specific values in components; surface new env requirements in `.env.example` when adding configuration.
