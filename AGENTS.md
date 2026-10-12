# AGENTS.md

`@namesmt/utils-lambda` — AWS Lambda helpers and types: request/trigger event types, fake API
Gateway events, gzip/brotli response compression, payload decoding. Node >= 22, ESM only, `#src/*`
import aliases, [tsdown](https://github.com/rolldown/tsdown) build, [Vitest](https://vitest.dev) tests.

## Docs

Where knowledge lives, and when to reach for each:

| tier | what it holds | when you use it |
| --- | --- | --- |
| `AGENTS.md` — this file | orientation and the rules that prevent defects | read every session; write when a rule is learned the hard way |
| `.agentDocs/` | depth: module rationale, traps with their causes, compatibility | read on demand, before touching that area; write when a rule needs its reasoning kept |
| `docs/` | how-to and reference for a person using this package | read when the task is user-facing; write in the same commit as the change |
| `README.md` | the first read, for a person | write alongside `docs/` |

- **One home per fact.** State the rule here, keep the reasoning in `.agentDocs/` and link it — never both.
- **A dead pointer is a bug.** If the target is gone, delete the pointer rather than leave it.
- Move depth behind a pointer once a section outgrows a screen or two; keep the rule inline.

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
pnpm run start                  # NODE_ENV=dev tsx src/index.ts — no watch
pnpm run watch                  # NODE_ENV=dev tsx watch src/index.ts
pnpm run dev                    # alias of `pnpm run watch`
```

## Structure

- `src/index.ts` re-exports `./types` and `./utils`.
- `src/utils.ts` — runtime helpers (`fakeEvent*`, `eventMethodUrl`, `pickEventContextV2`,
  `compressV2*`, `decompress*`, `decodeResponseV2*`, `decodePayload`).
- `src/types.ts` — event unions (`LambdaEvent`, `LambdaRequestEvent`, `LambdaTriggerEvent`,
  `CommonTriggerEventsMap`) plus the local `LatticeProxyEventV2` types.
- `src/utils.test.ts` — tests sit next to their source, not in `test/`.
- `dist/` is built, never committed.
- `.github/workflows/ci.yml` runs lint + types + `pnpm test` on push/PR to `main`; `release.yml` is
  manual (below). `scripts/` holds the two release helpers.

## Conventions

- Conventional commits (`feat:`, `fix:`, `chore:`, …) — the changelog is derived from them.
- ESLint (`@antfu/eslint-config`) owns lint and formatting; `lint-staged` runs `eslint --fix` on commit.
- ESM only: `"type": "module"` with an `import`-only `exports` map; do not add a CJS build.
- Keep the local `LatticeProxyEventV2` types in `src/types.ts` until `@types/aws-lambda` ships them.

## How to work here

- **Check the callers before you change anything.** Grep who uses it and which tests name it. If the
  impact is unclear, say so — do not guess.
- **Never overwrite or delete a large section you have not understood.** Read it, or say what you could
  not determine and ask.
- **Do not invent requirements.** Build what was asked; surface what else you notice and let it be
  decided.
- **Fix the class, not the instance.** A copied helper, a rule stated twice, a guard bypassed by a
  second path is one problem: one implementation, one guard. That is the work, not a follow-up to ask
  for. Stay inside the task rather than refactoring the world.
- **Verify before claiming, and say what you checked.** A passing test is not evidence it pins
  anything — **break the thing it guards and watch it fail.** If it still passes, either the test is
  decoration or a different guard is running; find out which. Where a stub cannot answer the question,
  drive the real thing.
- **Never write an identifier from memory.** A commit hash, path, line number or version must be quoted
  from the source; a plausible-looking invented one is worse than none.
- **A stated blocker is a hypothesis, not a fact.** Re-test "cannot install X" / "tool unavailable"
  before inheriting it, and never report a failure your own flag forced.
- **Report the risk with the change** — correctness, security, operational and integration; plus what
  you could not verify and every assumption you made. An unverified claim marked as such beats a
  confident one that is wrong.
- **Missing recall of this repo?** Read this file, `.agentDocs/` and `git log` before acting, then ask
  1–3 focused questions rather than guessing at intent.

## Conciseness

**Prune verbose, keep correctness** — code, comments, docs alike.

- Code: a comment only for non-obvious *intent*, never to restate the line, and never long. A block
  arguing for its own change is a commit message.
- Docs: one idea per sentence. Cut anything that would not change what a reader does.
- Delete history `git log` already holds — keep the *rule* that came out of it, not the story.
- **Never drop a caveat to save a line.** Concise means no filler, not fewer facts.

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
