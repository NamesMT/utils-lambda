# @namesmt/utils-lambda ![TypeScript heart icon](https://img.shields.io/badge/♡-%23007ACC.svg?logo=typescript&logoColor=white)

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Codecov][codecov-src]][codecov-href]
[![Bundlejs][bundlejs-src]][bundlejs-href]
[![jsDocs.io][jsDocs-src]][jsDocs-href]

**@namesmt/utils-lambda** is a collection of some useful utilities and types targeting AWS Lambda.

## Features
- [x] TypeScript ready!

## Usage
### Install package:
```sh
# npm
npm install @namesmt/utils-lambda

# yarn
yarn add @namesmt/utils-lambda

# pnpm (recommended)
pnpm install @namesmt/utils-lambda
```

### Import:
```ts
// ESM
import { decodeResponse } from '@namesmt/utils-lambda'
```

## Roadmap
- [ ] Become the legendary 10000x developer

## Releasing
Releases are version-first and dispatched by hand: one workflow run does the whole release,
so a `git push` on its own never publishes anything.

1. Go to **Actions → Release → Run workflow** and give it the version to ship, e.g. `0.2.0`.
2. [`.github/workflows/release.yml`](.github/workflows/release.yml) verifies the version, runs
   `pnpm run check`, builds, then lets [changelogen](https://github.com/unjs/changelogen) write
   the changelog, bump `package.json`, commit and tag `v<version>`. It pushes that commit and
   tag, creates the GitHub release, and publishes to npm with a short-lived
   [OIDC](https://docs.npmjs.com/generating-provenance-statements) token and `--provenance`.

Tick **dry-run** to do everything up to the commit and stop there — nothing is written back.

Locally, `pnpm run release:check <version>` validates a version against `package.json`, and
`pnpm run release:preview` prints the changelog the next release would get.

One-time setup: publish the package once by hand (npm only offers a trusted publisher for a
package that already exists), then on npmjs.com enable **Settings → Publishing access → Trusted
Publishing** for `namesmt/utils-lambda` with the workflow filename `release.yml`.

## License [![License][license-src]][license-href]
[MIT](./LICENSE) License © 2024 [NamesMT](https://github.com/NamesMT)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@namesmt/utils-lambda?labelColor=18181B&color=F0DB4F
[npm-version-href]: https://npmjs.com/package/@namesmt/utils-lambda
[npm-downloads-src]: https://img.shields.io/npm/dm/@namesmt/utils-lambda?labelColor=18181B&color=F0DB4F
[npm-downloads-href]: https://npmjs.com/package/@namesmt/utils-lambda
[codecov-src]: https://img.shields.io/codecov/c/gh/namesmt/utils-lambda/main?labelColor=18181B&color=F0DB4F
[codecov-href]: https://codecov.io/gh/namesmt/utils-lambda
[license-src]: https://img.shields.io/github/license/namesmt/utils-lambda.svg?labelColor=18181B&color=F0DB4F
[license-href]: https://github.com/namesmt/utils-lambda/blob/main/LICENSE
[bundlejs-src]: https://img.shields.io/bundlejs/size/@namesmt/utils-lambda?labelColor=18181B&color=F0DB4F
[bundlejs-href]: https://bundlejs.com/?q=@namesmt/utils-lambda
[jsDocs-src]: https://img.shields.io/badge/Check_out-jsDocs.io---?labelColor=18181B&color=F0DB4F
[jsDocs-href]: https://www.jsdocs.io/package/@namesmt/utils-lambda
