/**
 * `project` - lint rules this repository holds its own source to: the rule
 * list in `configs.project`, and its own rules, each in a flat
 * `scripts/project-lint-*.ts` file: `prefer-ascii` and `no-disable-comments`
 * (`project-lint-source.ts`), `no-asset-imports` (`project-lint-modules.ts`),
 * and ports of the hugoalh `recommended` rules Oxlint lacks
 * (`project-lint-hugoalh.ts`, `project-lint-hugoalh-types.ts`).
 *
 * Loaded by `vite.config.ts` as an Oxlint `jsPlugins` entry, never packed:
 * `vp pack` builds `src/index.ts` alone and the tarball holds only `dist/`.
 *
 * @module
 */

import type { DummyRuleMap, OxlintOverride } from "vite-plus/lint";

import {
  noDuplicateInterfacesRule,
  noDuplicateTypesRule,
  noModifierPrivateRule,
  noUselessTypeRule,
} from "./project-lint-hugoalh-types.ts";
import {
  noDuplicateTypeofsRule,
  noEmptyYieldRule,
  noNanRule,
  noUnsafeNumberRule,
  noUselessContinueRule,
} from "./project-lint-hugoalh.ts";
import { noAssetImportsRule } from "./project-lint-modules.ts";
import {
  noDisableCommentsRule,
  preferAsciiRule,
} from "./project-lint-source.ts";

/**
 * This repository's own rule list, spread by `vite.config.ts` after the
 * plugins' `all` configs. Every Oxlint category except `nursery` is on, so
 * this list holds only the repo's own rules, opt-outs, and option tweaks.
 * Built-in Oxlint rule ids sit here too, so `vite.config.ts` lists no rule
 * by name.
 */
const rules: DummyRuleMap = {
  // The repo's own rules.
  "project/no-disable-comments": "error",
  "project/no-asset-imports": "error",
  // Deno's `prefer-ascii`, which also covers hugoalh's
  // `prefer-ascii-identifier`.
  "project/prefer-ascii": "error",
  // Ports of the hugoalh `recommended` rules with no Oxlint built-in, under
  // their hugoalh names.
  "project/no-duplicate-interfaces": "error",
  "project/no-duplicate-typeofs": "error",
  "project/no-duplicate-types": "error",
  "project/no-empty-yield": "error",
  "project/no-modifier-private": "error",
  "project/no-nan": "error",
  "project/no-unsafe-number": "error",
  "project/no-useless-continue": "error",
  "project/no-useless-type": "error",

  // Option tweaks. First, Deno's `camelcase`: no `_` inside the name once
  // leading and trailing ones are trimmed, unless it has no lowercase ASCII
  // letter (UPPER_SNAKE). Shorthand destructuring binds a key the code does
  // not own, and property names are not declarations.
  "id-match": [
    "error",
    "^_*[^_]*_*$|^[^a-z]*$",
    {
      properties: false,
      classFields: false,
      onlyDeclarations: false,
      ignoreDestructuring: true,
    },
  ],
  // Deno's `no-window`, and `no-console` for a bare `console` reference.
  "no-restricted-globals": ["error", "window", "console", "Deno"],
  // Deno's `no-external-import`: packages come from package.json by name.
  "no-restricted-imports": [
    "error",
    {
      patterns: [
        {
          regex: "^(?:https?:|npm:|jsr:)",
          message: "Import packages by name from package.json.",
        },
      ],
    },
  ],
  "one-var": ["error", "never"],
  "no-use-before-define": ["error", { functions: false }],
  "func-style": ["error", "declaration", { allowArrowFunctions: true }],
  // Set to the smallest value the current code passes.
  "max-statements": ["error", { max: 12 }],
  // hugoalh `max-identifier-length` (40); single capital type params pass.
  "id-length": ["error", { max: 40, exceptionPatterns: ["^[A-Z]$"] }],
  // hugoalh `max-params` (default 4).
  "max-params": ["error", { max: 4 }],

  // Off, collides with a project rule, a plugin config, or Oxfmt.
  // Collides with `project/no-modifier-private`: no access modifiers.
  "typescript/explicit-member-accessibility": "off",
  // Collides with mutable private state the code writes on purpose.
  "typescript/prefer-readonly": "off",
  // Collides with explicit-types' written-out types and DOM parameters.
  "typescript/prefer-readonly-parameter-types": "off",
  // Collides with `explicit-types/no-index-signatures`/`no-utility-types`.
  "typescript/consistent-indexed-object-style": "off",
  // Collides with the explicit annotations the house style writes out.
  "typescript/no-inferrable-types": "off",
  // Collides with `import-structure/enforce-import-order` and Oxfmt.
  "sort-imports": "off",
  // Collides with the `index.ts` entry modules.
  "oxc/no-barrel-file": "off",
  // Collides with exporting each declaration where it is written.
  "import/group-exports": "off",
  // Collides with exporting each declaration in place, beside its helpers.
  "import/exports-last": "off",
  // Collides with `import/no-default-export`: modules export by name.
  "import/prefer-default-export": "off",
  // Collides with `no-nested-ternary`, which keeps one level allowed.
  "no-ternary": "off",
  // Collides with ordinary modern TypeScript.
  "oxc/no-async-await": "off",
  // Collides with `typescript/prefer-optional-chain`.
  "oxc/no-optional-chaining": "off",
  // Collides with flags and hashing where bit operators are the point.
  "no-bitwise": "off",
  // Collides with checks against the `undefined` that `Map#get` returns.
  "no-undefined": "off",
  // Collides with `typescript/no-floating-promises`, which asks for `void`.
  "no-void": "off",
  // Collides with `explicit-types/no-undefined-type`: `null` marks absence.
  "unicorn/no-null": "off",
  // Collides with `import/no-default-export`: modules export by name.
  "import/no-named-export": "off",
  // Collides with `typescript/consistent-type-imports` and
  // `typescript/no-import-type-side-effects`.
  "import/consistent-type-specifier-style": "off",
  // Collides with Oxfmt, which prints hexadecimal digits in lowercase.
  "unicorn/number-literal-case": "off",

  // Off, too much churn for no change in behavior.
  "no-magic-numbers": "off",
  "sort-keys": "off",
  "capitalized-comments": "off",
  "typescript/explicit-function-return-type": "off",
  "typescript/explicit-module-boundary-types": "off",
  "no-empty-function": "off",
  "class-methods-use-this": "off",
  "unicorn/switch-case-braces": "off",
  "prefer-destructuring": "off",
  "oxc/no-rest-spread-properties": "off",
  "unicorn/numeric-separators-style": "off",
  "no-continue": "off",

  // Off, other checks cover it or the pattern is intended.
  // Sequential awaits in a loop are intended; workarounds cost more.
  "no-await-in-loop": "off",
  // Not type-aware; TypeScript's `noImplicitReturns` covers it.
  "consistent-return": "off",
  // TypeScript's type checking already covers exhaustive switches.
  "typescript/switch-exhaustiveness-check": "off",
  // TypeScript checks completeness; a forced `default:` hides missing cases.
  "default-case": "off",
};

/** Node code (`vite.config.ts` and `scripts/`): the first override's rules. */
const nodeRules: DummyRuleMap = {
  // Vite and the Oxlint plugin host read a default export.
  "import/no-default-export": "off",
  // Node code: tooling imports Node's built-ins.
  "import/no-nodejs-modules": "off",
  // Node code: a CLI exits with a status.
  "unicorn/no-process-exit": "off",
  // Node code: a CLI reports to the console.
  "no-console": "off",
};

/**
 * The whole `overrides` array `vite.config.ts` uses as is. The Node code entry
 * comes first; per-file exceptions follow, each with a comment saying why.
 * A later entry wins over an earlier one, and every entry wins over `rules`.
 */
export const projectOverrides: OxlintOverride[] = [
  { files: ["vite.config.ts", "scripts/**"], rules: nodeRules },
];

/**
 * The repo-local plugin, namespace `project`: its own rules, enabled as
 * `project/<rule>`, and `configs.project`, the rule list above.
 */
const plugin = {
  meta: { name: "project" },
  rules: {
    "no-disable-comments": noDisableCommentsRule,
    "no-asset-imports": noAssetImportsRule,
    "prefer-ascii": preferAsciiRule,
    "no-duplicate-interfaces": noDuplicateInterfacesRule,
    "no-duplicate-typeofs": noDuplicateTypeofsRule,
    "no-duplicate-types": noDuplicateTypesRule,
    "no-empty-yield": noEmptyYieldRule,
    "no-modifier-private": noModifierPrivateRule,
    "no-nan": noNanRule,
    "no-unsafe-number": noUnsafeNumberRule,
    "no-useless-continue": noUselessContinueRule,
    "no-useless-type": noUselessTypeRule,
  },
  configs: { project: { rules } },
};

export default plugin;
