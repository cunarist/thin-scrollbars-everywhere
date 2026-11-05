/**
 * Regression: where the browser lacks `scrollbar-width`, the call patches
 * nothing and adopts nothing, so old WebKit keeps its shadow roots intact.
 */

import { expect, it, vi } from "vite-plus/test";

import { applyThinScrollbarsEverywhere } from "#scrollbars";

it("leaves the page alone without scrollbar-width", () => {
  const supports = vi.fn().mockReturnValue(false);
  vi.stubGlobal("CSS", { supports });

  applyThinScrollbarsEverywhere();

  expect(supports).toHaveBeenCalledWith("scrollbar-width", "thin");
  expect(document.adoptedStyleSheets).toHaveLength(0);
  const root = document.createElement("div").attachShadow({ mode: "open" });
  expect(root.adoptedStyleSheets).toHaveLength(0);
});
