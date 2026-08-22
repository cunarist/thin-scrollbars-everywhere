# thin-scrollbars-everywhere

[![npm](https://img.shields.io/npm/v/thin-scrollbars-everywhere)](https://www.npmjs.com/package/thin-scrollbars-everywhere)
[![bundle size](https://img.shields.io/bundlejs/size/thin-scrollbars-everywhere)](https://bundlejs.com/?q=thin-scrollbars-everywhere)

Thin, translucent scrollbars for the whole page, including every shadow root.

![Example page](https://github.com/user-attachments/assets/7666878d-a073-42c7-8f67-fdc6ca83dd1c)

Useful when plain CSS cannot reach the scrollbars because they live inside
shadow DOM:

- Apps built on Lit or other web-component frameworks
- Design systems shipped as custom elements (Shoelace, Material Web, FAST)
- Micro-frontends where each team mounts into its own shadow root
- Pages embedding third-party widgets that use closed shadow roots
- Electron or WebView app shells styling every scrollbar at once

## Usage

```ts
import { applyThinScrollbarsEverywhere } from "thin-scrollbars-everywhere";

applyThinScrollbarsEverywhere();
```

One call is enough. It keeps watching the page and styles new shadow roots as
they appear. Call it as early as possible, before any shadow DOM is created.
Closed shadow roots that already exist at call time cannot be reached.

This does not reach into `iframe`, `object`, or `embed` content. Those are whole
separate pages with their own `window`, so each needs its own call.

## How it works

A shared constructable stylesheet sets `scrollbar-width: thin` and a
`currentColor`-based `scrollbar-color` on `*`. The sheet is adopted by the
document and by every shadow root, found through a patched
`Element.prototype.attachShadow` plus mutation observers that catch roots
created before the call or attached inside other roots.
