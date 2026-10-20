import explicitTypes from "eslint-plugin-explicit-types";
import importStructure from "eslint-plugin-import-structure";
import { defineConfig } from "vite-plus";

import projectLint, { projectOverrides } from "./scripts/project-lint.ts";

export default defineConfig({
  // The DOM the unit tests patch; the library itself runs only in browsers.
  test: { environment: "happy-dom" },
  fmt: {
    printWidth: 80,
    quoteProps: "preserve",
    embeddedLanguageFormatting: "off",
  },
  lint: {
    plugins: ["typescript", "unicorn", "oxc", "import"],
    jsPlugins: [
      "eslint-plugin-explicit-types",
      "eslint-plugin-import-structure",
      "./scripts/project-lint.ts",
    ],
    categories: {
      correctness: "error",
      suspicious: "error",
      pedantic: "error",
      perf: "error",
      style: "error",
      restriction: "error",
    },
    rules: {
      ...explicitTypes.configs.all.rules,
      ...importStructure.configs.all.rules,
      ...projectLint.configs.project.rules,
    },
    overrides: projectOverrides,
    options: {
      typeAware: true,
      typeCheck: true,
      maxWarnings: 0,
      reportUnusedDisableDirectives: "error",
    },
  },
  // ESM and CommonJS builds of `src/scrollbars/index.ts` as `dist/index.*`,
  // the files package.json "exports" names, with declarations, as the earlier
  // dnt build shipped.
  pack: {
    entry: { index: "src/scrollbars/index.ts" },
    format: ["esm", "cjs"],
    platform: "neutral",
    target: "es2022",
    dts: true,
    fixedExtension: false,
  },
});
