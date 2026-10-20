---
description: What this repo's Deno lint ran (tags, include list, hugoalh rules, plugins) and where each piece lives now under Oxlint
---

This repo's Deno lint setup, which the Oxlint config must keep covering
([[lint-parity-never-shrinks]]):

- **Tags and include list:** `recommended`, plus `camelcase`, `eqeqeq`,
  `guard-for-in`, `no-console`, `no-const-assign`, `no-eval`,
  `no-external-import`, `no-non-null-asserted-optional-chain`,
  `no-non-null-assertion`, `no-throw-literal`, `prefer-ascii`, and
  `verbatim-module-syntax`. `no-explicit-any` was excluded; it is on now.
- **hugoalh (`@hugoalh/deno-lint-rules` 0.18.2):** `max-complexity` 16,
  `max-file-lines`, `max-file-size`, `max-identifier-length`,
  `max-nest-ternaries`, `max-params`,
  `no-class-constructor-parameter-property`, `no-modifier-private`.
- **Plugins:** `@cunarist/deno-import-check` and the three
  `@cunarist/deno-lint-plugin-explicit-types` presets.

Where they live now:

| Deno                                      | Oxlint                                                       |
| ----------------------------------------- | ------------------------------------------------------------ |
| categories and include list               | Oxlint categories (correctness ... restriction)              |
| `camelcase`                               | `id-match` in `configs.project` ([[naming-id-match]])        |
| `no-external-import`                      | `no-restricted-imports` URL/`npm:`/`jsr:` patterns           |
| `no-window`, bare `console`               | `no-restricted-globals` (`window`, `console`, `Deno`)        |
| `prefer-ascii`                            | `project/prefer-ascii`                                       |
| `verbatim-module-syntax`                  | `tsconfig.json` `verbatimModuleSyntax`                       |
| `max-complexity`                          | built-in `complexity`, `max-depth`, ... at their defaults    |
| `max-file-lines`                          | built-in `max-lines` (default 300)                           |
| `max-file-size`                           | dropped (user decision, all repos)                           |
| `max-identifier-length`                   | `id-length` max 40                                           |
| `max-nest-ternaries`                      | `no-nested-ternary`                                          |
| `max-params`                              | `max-params` 4                                               |
| `no-class-constructor-parameter-property` | `typescript/parameter-properties`, plus `erasableSyntaxOnly` |
| `no-modifier-private`                     | `project/no-modifier-private`                                |
| deno-import-check                         | `eslint-plugin-import-structure` `all`                       |
| deno-lint-plugin-explicit-types           | `eslint-plugin-explicit-types` `all`                         |

The other hugoalh `recommended` ports (`no-nan`, `no-unsafe-number`, ...) are
on too, as in every repo. `maxWarnings: 0` keeps Deno's rule that every
diagnostic fails. Before removing a line from `configs.project`, find what
else covers it.
