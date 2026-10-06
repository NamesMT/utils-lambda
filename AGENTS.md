# AGENTS.md

`@namesmt/utils-lambda` — AWS Lambda helpers and types: request/trigger event types, fake API
Gateway events, gzip/brotli response compression, payload decoding. Node >= 22, ESM only, `#src/*`
import aliases, [tsdown](https://github.com/rolldown/tsdown) build, [Vitest](https://vitest.dev) tests.

## Docs

Three tiers, so a reader loads only what the task needs:

1. **`AGENTS.md`** (this file) — orientation and the rules that prevent defects. Read every session.
2. **`.agentDocs/`** — depth that would bloat this file: module rationale, traps with their causes,
   compatibility rules. Read on demand.
3. **`README.md` / `docs/`** — for a person using the package, not for an agent.

**There is no `.agentDocs/` here yet and none is needed at this size.** Create one when a section
above outgrows a screen or two: move the *reasoning* out and keep the *rule* here with a pointer to
it — nobody reads a file they do not open. Each document opens with a one-line scope, and this file
links it.

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

## How to work here

- Check who calls it before you change it; say when impact is unclear rather than guessing.
- Never overwrite or delete a large section you have not understood; do not invent requirements —
  surface what looks needed.
- Report the risk, not only the change: correctness, security, operational, integration.
- **Fix the root cause, not the instance.** One bug under several names — a copied helper, a rule
  stated twice, a guard bypassed by a second path — is a class: fix it with one implementation, one
  guard. That is the work, not a follow-up to ask for.
- **Verify before claiming, and say what you checked.** A green test proves only what it asserts — **break the thing it guards and watch it fail.** If it still passes, either the test is decoration or a different guard is running; find out which. Where a stub cannot answer the question, drive the real thing. Mark anything unverified as unverified.
- If recall of this project is missing, read AGENTS.md + `git log` before acting.

## Conciseness

**Prune verbose, keep correctness** — code, comments, docs alike. A comment only for non-obvious
intent; docs one idea per sentence, cut what would not change what a reader does. Delete history
`git log` already holds — keep the rule, not the story. Never drop a caveat to save a line.

## User-facing docs

`README.md` is for a person: concise first read. There is no `docs/` here and no generated media,
so the README is the whole user-facing surface. Docs ship with the change, in the same commit.

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
- `compressV2*` and `decompress*` only understand `br` and `gzip`; any other `accept-encoding` or
  `contentEncoding` throws, so callers must gate on the header rather than pass it through.
