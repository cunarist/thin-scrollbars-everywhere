At the start of every new session, run `damem recall` in the terminal and treat
its output as the context for this repository. If the `damem` command is not
found, read [INSTALL.md](https://github.com/cunarist/damem/blob/main/INSTALL.md)
and follow it before reasoning or responding.

# AGENTS.md

## Project

- **thin-scrollbars-everywhere**: a small browser library, published to npm,
  that gives the document and every shadow root thin, translucent
  scrollbars. Its one export is `applyThinScrollbarsEverywhere`, written in
  `src/scrollbars/index.ts` (alias `#scrollbars`).
- Built with Vite+ (`vp`): Oxlint, Oxfmt, type checking, Vitest, tsdown.
  The tooling runs on Node.js 22.18+; the package itself runs in browsers.
- `vp pack` builds `src/scrollbars/index.ts` into `dist/` as ESM (`index.js`) and
  CommonJS (`index.cjs`) with declarations, the same `import`/`require`
  entry points the earlier Deno dnt build published.
- `example/` holds hand-run demo pages: `npm run example`.

## Rules

- `vp check`, `vp test`, and `vp pack` must all pass. `vp check --fix`
  formats.
- The only config files are `package.json`, `tsconfig.json`, and
  `vite.config.ts`, plus `package-lock.json`. Only `.ts` source files,
  configs included; there are no `.js`, `.mjs`, `.cjs`, `.jsx`, or `.tsx`
  files.
- `tsconfig.json` enables exactly `strict`, `noUncheckedIndexedAccess`,
  `noPropertyAccessFromIndexSignature`, `noImplicitReturns`,
  `noUnusedLocals`, `noUnusedParameters`, `noImplicitOverride`,
  `noFallthroughCasesInSwitch`, and `erasableSyntaxOnly`, sets
  `allowUnreachableCode` and `allowUnusedLabels` to `false`, plus
  `verbatimModuleSyntax`, `allowImportingTsExtensions`, `noEmit`,
  `declaration`, and `isolatedDeclarations`. `exactOptionalPropertyTypes`
  stays off. `lib` is browser-only (`es2022`, `dom`, `dom.iterable`), there
  is no `types` field, and `include` is `["src"]`.
- Entry files are `index.ts`. `scripts/` is flat, with no subfolders and no
  `index.ts`. `imports` aliases, if added, point only at direct `src/`
  subfolders; `../` is banned everywhere. See `imports-aliases-barrels`.
- Tests run in a `happy-dom` document. Unit tests sit next to the code as
  `*.test.ts`; package-level regression tests sit in `tests/`, one file per
  topic (`tests/shadow-root-styling.test.ts`, `tests/sheet-restore.test.ts`),
  importing through `#scrollbars`. See `tests-layout-vitest`.
- Lint: every Oxlint category except `nursery` is on, plus
  `eslint-plugin-explicit-types` and `eslint-plugin-import-structure` through
  their `all` configs. `vite.config.ts` names no rule; offs and option tweaks
  live in `configs.project` in `scripts/project-lint.ts`, and `overrides` is
  exactly its `projectOverrides`. See `lint-config` and
  `project-lint-plugin`.
- Lint disable and enable comments fail `vp check`; fix the source. See
  `lint-no-disable-comments`.
- Lint coverage never drops below what Deno enforced. See
  `lint-parity-with-deno`.
- Enum-like string values are UPPER_SNAKE wherever we own the format. See
  `naming-upper-snake-values`.
- `package.json` keys follow Oxfmt's standard sort. No `packageManager`, no
  `peerDependencies`. Keep the package name, exports, and behavior stable.
- CI runs `vp check` and `vp pack`, and `vp test` on node@22.18.0 and
  node@latest.
- Only CI publishes, from a published GitHub release `vX.Y.Z` that matches
  `package.json`, through npm trusted publishing. Use the `release` skill and
  ask the user first. Release notes live only on GitHub releases; there is
  no `CHANGELOG.md`.
