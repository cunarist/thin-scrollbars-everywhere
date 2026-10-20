---
description: Packages publish only from CI when a GitHub release vX.Y.Z is published, via npm trusted publishing; never npm publish by hand; notes live only on the release page
---

Standing convention (2026-10-12), applied to every package:

- **Only CI publishes.** Publishing a GitHub release `vX.Y.Z` triggers
  `.github/workflows/publish.yml`. Never run `npm publish` locally and never
  push a bare `v*` tag. Use the `release` skill, and only when the user asked
  for a release.
- **The workflow** checks that the tag equals `v` + `package.json` `version`,
  runs the full CI as a reusable workflow (every Node version in the matrix),
  then `vp pack` and `npm publish --access public --provenance`. A release
  marked pre-release publishes under the `next` dist-tag, others `latest`.
  It runs on Node 24 (npm 11, which trusted publishing needs) with no cache.
- **Auth is npm trusted publishing** (OIDC, `id-token: write`), which also
  attaches provenance. The package already existed under Deno's dnt build,
  with its trusted publisher set to this repo's `publish.yml`; no token is
  involved. Keep the workflow file name, since npm trusts it by name.
- **Release notes live only on the GitHub release page**
  (`--generate-notes`, edited there). There is no `CHANGELOG.md`; never add
  one.
- **The version lives only in `package.json`.** Under Deno it came from the
  tag at build time; now the tag must match `package.json`.
- **Before 1.0**, a change that breaks users (removed export, changed
  behavior) is a minor bump.
- **Before a release**, `vp pack` and `npm pack`, then import the tarball from
  a scratch project both as ESM (`import`) and CommonJS (`require`).
