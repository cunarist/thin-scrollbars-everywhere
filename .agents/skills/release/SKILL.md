---
name: release
description: Cut an npm release when the user asks; bump package.json in a PR, then publish a GitHub release page so CI publishes. Never npm publish locally
---

Only when the user asked for a release. Never run `npm publish` yourself,
never push a bare `v*` tag, and never create the release page without the
user's go-ahead: the page is what publishes. See the `publishing-ci-only`
memory.

1. **Bump on a branch.** Set `X.Y.Z` as `version` in `package.json`, then:

   ```sh
   npm install --package-lock-only
   vp check && vp test && vp pack
   git commit -am "Version X.Y.Z"
   ```

   Before 1.0, a change that breaks users (a removed export, changed
   behavior) is a minor bump.

2. **Merge through a PR.** Open it with the usual footer, let the user merge
   (squash). Never merge it yourself.

3. **Consumer check** on the merged `main`: `vp pack`, `npm pack`, install the
   tarball into a scratch project outside the repo, and load it both with
   `import` and with `require`. Fix anything it finds through a new PR.

4. **Create the release page**, which also creates the tag:

   ```sh
   gh release create vX.Y.Z --target main --generate-notes
   # add --prerelease to publish under the `next` dist-tag
   ```

   Release notes live only here; edit them on the page. There is no
   `CHANGELOG.md` and none is added.

5. **Watch the publish run:** `gh run watch`. It fails early if the tag and
   `package.json` disagree; then fix the version through a PR, delete the
   release and its tag, and start again from step 4.

Publishing is tokenless: npm trusted publishing is set up for
`.github/workflows/publish.yml`.
