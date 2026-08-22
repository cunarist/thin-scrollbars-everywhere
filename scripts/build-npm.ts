import { build, emptyDir } from "@deno/dnt";

const version = Deno.args[0];
if (
  version === undefined ||
  !/^\d+\.\d+\.\d+(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/.test(version)
) {
  throw new Error(`Pass a semantic version as the first argument.`);
}

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {},
  packageManager: "deno",
  test: false,
  compilerOptions: {
    lib: ["ES2022", "DOM", "DOM.Iterable"],
  },
  package: {
    name: "thin-scrollbars-everywhere",
    version,
    description:
      "Thin, translucent scrollbars for the document and every shadow root.",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/cunarist/thin-scrollbars-everywhere.git",
    },
  },
  postBuild(): void {
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
