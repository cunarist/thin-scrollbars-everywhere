/// <reference lib="deno.unstable" />

import importCheckPlugin from "@cunarist/deno-import-check/lint";
import absencePlugin from "@cunarist/deno-lint-plugin-explicit-types/absence";
import concretePlugin from "@cunarist/deno-lint-plugin-explicit-types/concrete";
import namingPlugin from "@cunarist/deno-lint-plugin-explicit-types/naming";
import { setup as setupHugoalhPlugin } from "@hugoalh/deno-lint-rules/setup";

const hugoalhPlugin = setupHugoalhPlugin({
  tags: [],
  rules: {
    "max-complexity": { maximum: 16 },
    "max-file-lines": true,
    "max-file-size": true,
    "max-identifier-length": true,
    "max-nest-ternaries": true,
    "max-params": true,
    "no-class-constructor-parameter-property": true,
    "no-modifier-private": true,
  },
});

const plugin: Deno.lint.Plugin = {
  name: "custom",
  rules: {
    ...hugoalhPlugin.rules,
    ...importCheckPlugin.rules,
    ...concretePlugin.rules,
    ...namingPlugin.rules,
    ...absencePlugin.rules,
  },
};

export default plugin;
