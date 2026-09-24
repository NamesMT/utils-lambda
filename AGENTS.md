# AGENTS.md

`@namesmt/utils-lambda` — AWS Lambda helpers and types: request/trigger event types, fake API
Gateway events, gzip/brotli response compression, payload decoding. Node >= 22, ESM only, `#src/*`
import aliases, [tsdown](https://github.com/rolldown/tsdown) build, [Vitest](https://vitest.dev) tests.

## Commands

```sh
pnpm run lint                   # eslint (@antfu/eslint-config) — it also owns formatting
pnpm run test                   # vitest in watch mode
pnpm run test:types             # tsc --noEmit --skipLibCheck
pnpm run check                  # lint + test:types + vitest run --coverage — the release gate
pnpm run build                  # tsdown -> dist/index.mjs + dist/index.d.mts
pnpm exec vitest run            # one-shot suite, without coverage
pnpm run release:check 0.2.0    # version must be semver and greater than the current one
pnpm run release:preview        # print the changelog the next release would get
```

## Structure

- `src/index.ts` re-exports `./types` and `./utils`.
- `src/utils.ts` — runtime helpers (`fakeEvent*`, `eventMethodUrl`, `pickEventContextV2`,
  `compressV2*`, `decompress*`, `decodeResponseV2*`, `decodePayload`).
- `src/types.ts` — event unions (`LambdaEvent`, `LambdaRequestEvent`, `LambdaTriggerEvent`,
  `CommonTriggerEventsMap`) plus the local `LatticeProxyEventV2` types.
- `src/utils.test.ts` — tests sit next to their source, not in `test/`.
- `tsdown.config.ts` / `vitest.config.ts` — build/test config; `dist/` is built, never committed.
- `.github/workflows/ci.yml` runs lint + types + `pnpm test` on push/PR to `main`; `release.yml` is
  manual (below). `scripts/` holds the two release helpers.

## Conventions

- Conventional commits (`feat:`, `fix:`, `chore:`, …) — the changelog is derived from them.
- ESLint via `@antfu/eslint-config` owns formatting: no Prettier, single quotes, 2-space indent,
  sorted imports with no blank lines. `lint-staged` runs `eslint --fix` on commit.
- ESM only: `"type": "module"` with an `import`-only `exports` map; do not add a CJS build.
- Keep the local `LatticeProxyEventV2` types in `src/types.ts` until `@types/aws-lambda` ships them.

## Releasing

Version-first and manual: dispatch **Actions → Release → Run workflow** with the version — that is the only publish path, a pushed tag publishes nothing.
`release.yml` runs `pnpm run check`, builds, then `npx -y changelogen@latest` bumps `package.json`, writes `CHANGELOG.md`, commits and tags `v<version>`, after which the run pushes, creates the GitHub release and publishes via OIDC trusted publishing.
`dry-run` skips only the push, GitHub release and npm publish — the changelogen version bump, commit and tag are still created locally.
One-time trusted-publisher setup is in the README.

## Gotchas

- `pnpm test` watches locally; use `pnpm exec vitest run` for a one-shot.
- `release.yml` runs on Node 24, `ci.yml` on Node 22.
- `prepublishOnly` runs `pnpm run build`, so a manual `npm publish` rebuilds after the workflow's build.
- changelogen `--clean` fails when `git status --porcelain` is non-empty; ignored files such as
  `dist/` do not count.
