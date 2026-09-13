# thin-scrollbars-everywhere

[![npm](https://img.shields.io/npm/v/thin-scrollbars-everywhere)](https://www.npmjs.com/package/thin-scrollbars-everywhere)
[![bundle size](https://img.shields.io/bundlejs/size/thin-scrollbars-everywhere)](https://bundlejs.com/?q=thin-scrollbars-everywhere)

Thin, translucent scrollbars for the whole page, including every shadow root and
every framed page.

![Example page](https://github.com/user-attachments/assets/7666878d-a073-42c7-8f67-fdc6ca83dd1c)

Useful when plain CSS cannot reach the scrollbars because they live inside
shadow DOM:

- Apps built on Lit or other web-component frameworks
- Design systems shipped as custom elements (Shoelace, Material Web, FAST)
- Micro-frontends where each team mounts into its own shadow root
- Pages embedding third-party widgets that use closed shadow roots
- Electron or WebView app shells styling every scrollbar at once
- Pages that frame their own content and want it to match the rest of the app

## Usage

```ts
import { applyThinScrollbarsEverywhere } from "thin-scrollbars-everywhere";

applyThinScrollbarsEverywhere();
```

One call is enough. It keeps watching the page and styles new shadow roots as
they appear. Call it as early as possible, before any shadow DOM is created.
Closed shadow roots that already exist at call time cannot be reached.

It reaches into `iframe`, `frame`, `object`, and `embed` content too, as deeply
as those nest, and styles a framed page again whenever it navigates.

Only pages the browser lets you touch can be reached. A cross-origin page, or a
frame sandboxed without `allow-same-origin`, is walled off and keeps the
platform's own scrollbars; call this inside such a page to style it. A `PDF`
shown by the browser's own viewer is out of reach for the same reason.

## How it works

A constructable stylesheet sets `scrollbar-width: thin` and a
`currentColor`-based `scrollbar-color` on `*`. The sheet is adopted by the
document and by every shadow root, found through a patched
`Element.prototype.attachShadow` plus mutation observers that catch roots
created before the call or attached inside other roots.

A framed page is a realm of its own, so it gets its own sheet, since a
constructable sheet is refused by every document but the one that built it, and
its own `attachShadow` patch, since `Element.prototype` there is not the one
patched here. Frames are found by the same observers and followed on `load`,
because navigating one throws away the document that was styled.
