---
description: package.json keys follow Oxfmt's standard sort; standard fields only; no peerDependencies or packageManager
---

## Key order (2026-10-16)

Oxfmt's standard `package.json` sort decides the key order; `vite.config.ts`
sets no `fmt.sortPackageJson`. This replaced the hand-written order of
2026-10-14. Run `vp check --fix` after editing the file. Oxfmt keeps the
order inside `imports`, which can matter (below).

```jsonc
{
  "name": "thin-scrollbars-everywhere",
  "version": "0.1.6",
  "description": "...",
  "license": "MIT",
  "repository": { "type": "git", "url": "git+https://github.com/..." },
  "files": ["dist"],
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": { "import": "./dist/index.js", "require": "./dist/index.cjs" },
  },
  "scripts": { "example": "vp dev --open /example/" },
  "devDependencies": { "vite-plus": "^1.3.0" },
  "engines": { "node": ">=22.18" },
}
```

`main`, `module`, and the `import`/`require` export pair keep the entry points
the earlier dnt build published (`esm/` and `script/`), now as `vp pack`'s
ESM and CommonJS builds in `dist/`. Declarations sit beside each build
(`index.d.ts`, `index.d.cts`). There are no runtime `dependencies`.

If `imports` aliases are ever added, their key order carries meaning: the
import-structure plugin's `enforce-layer-order` reads it as the layer order.

## Fields

- **Standard fields only.** `engines` has only `node` (never `engines.bun`).
- **No `packageManager`.** npm is detected from `package-lock.json`.
- **No `peerDependencies`, ever** (user preference, 2026-10-14). If something
  is needed at runtime, it goes in `dependencies`.
- **`dependencies`** = what runs or is type-referenced at runtime by consumers.
  This package has none.
- **`devDependencies`** = everything else: `vite-plus`, the lint plugins,
  `@eslint/core` and `@typescript-eslint/types` (types for
  `scripts/project-lint*.ts`), `happy-dom` (the test DOM), `@types/node`.

Refresh the lockfile with `npm install` (or `npm install
--package-lock-only` for a version bump) and commit it with the change.
