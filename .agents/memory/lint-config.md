---
description: Lint config shape and exceptions model; every category but nursery on, plugins via `all`, offs in configs.project, per-file exceptions only in projectOverrides, ignorePatterns only for generated output
---

User policy, 2026-10-19 (blacklist, not whitelist). `vite.config.ts` names no
rule; it only wires these pieces together.

- **Categories:** `correctness`, `suspicious`, `pedantic`, `perf`, `style`,
  and `restriction` at `error`. `nursery` stays off (no line for it).
- **Plugins:** each enabled whole through its `all` config, from npm:
  `explicitTypes.configs.all.rules` (eslint-plugin-explicit-types) and
  `importStructure.configs.all.rules` (eslint-plugin-import-structure). No
  Lit here, so no lit-robust.
- **Blacklist:** `projectLint.configs.project.rules` in
  `scripts/project-lint.ts`, spread last in `rules`. It holds the repo's own
  `project/*` rules, repo-wide offs (each with a one-line reason: "collides
  with ...", "too much churn", "Node code"), and option tweaks. Never a
  hand-set `"error"` a category already turns on. New limits sit at the
  smallest value the code passed when they were set (`max-statements` 12);
  hugoalh parity sets `max-params` 4 and `id-length` max 40. Other limits
  stay at Oxlint's defaults.
- **Per-file exceptions:** only in `projectOverrides`, the whole `overrides`
  array exported from `scripts/project-lint.ts`. The Node code entry
  (`vite.config.ts`, `scripts/**`, rules `nodeRules`) comes first; any
  further entry needs a why-comment and the user's approval. Today there
  is none.
- **Banned:** `allowFiles`-style options in custom rules, and lint disable
  comments ([[lint-no-disable-comments]]).
- **`ignorePatterns`:** only generated or build output, never hand-written
  code. This repo has none (`dist/`, `.vite/`, and `node_modules/` are
  gitignored).
- **Precedence:** categories < `rules` (a later spread wins) < `overrides`
  (a later entry wins).
- **Decided 2026-10-19 (all repos):** `typescript/switch-exhaustiveness-check`
  off (TypeScript's type checking covers it; no
  `considerDefaultExhaustiveForUnions`, no added `default:` branches),
  `consistent-return` off (not type-aware; `noImplicitReturns` covers it),
  `no-await-in-loop` off (sequential awaits are intentional), `default-case`
  off (TypeScript checks completeness; a forced `default:` hides missing
  cases). On through the
  categories with defaults: `typescript/promise-function-async` with
  `require-await` and `return-await` (`async f() { const x = await g();
  return x; }`), `init-declarations` (`let x: T | null = null;`),
  `no-use-before-define` with only `{ functions: false }`,
  `unicorn/no-array-for-each`, `unicorn/no-array-reduce`,
  `unicorn/prefer-structured-clone`, `typescript/prefer-nullish-coalescing`,
  `typescript/no-explicit-any`, and every `no-unsafe-*`. `unknown` is
  allowed: untrusted data is `unknown` plus a type guard.
- **Project rules:** `project/no-disable-comments`, `project/prefer-ascii`,
  `project/no-asset-imports`, and the hugoalh ports `no-duplicate-typeofs`,
  `no-empty-yield`, `no-nan`, `no-unsafe-number`, `no-useless-continue`,
  `no-duplicate-interfaces`, `no-duplicate-types`, `no-useless-type`, and
  `no-modifier-private`. hugoalh's `no-duplicate-awaits`/`-voids` are covered
  by `unicorn/no-unnecessary-await` and
  `typescript/no-meaningless-void-operator`, and `no-enum` by the published
  `explicit-types/no-enum`.
- Default limits stay (`max-lines` 300, `max-lines-per-function` 50, ...);
  refactor instead of raising them: split files, extract helpers, import a
  barrel, pass an options object.
- **Formatting:** `fmt` is `{ printWidth: 80, quoteProps: "preserve",
  embeddedLanguageFormatting: "off" }`, matching `deno fmt`; Oxfmt formats
  every file it supports, `example/*.html` included.

```ts
// vite.config.ts
categories: { correctness: "error", suspicious: "error", pedantic: "error",
  perf: "error", style: "error", restriction: "error" },
rules: { ...explicitTypes.configs.all.rules,
  ...importStructure.configs.all.rules, ...projectLint.configs.project.rules },
overrides: projectOverrides,

// scripts/project-lint.ts
export const projectOverrides: OxlintOverride[] = [
  { files: ["vite.config.ts", "scripts/**"], rules: nodeRules },
];
```
