/**
 * Regression: when other code replaces a root's adopted sheets, the next
 * DOM mutation puts the scrollbar sheet back.
 */

import { expect, it } from "vite-plus/test";

import { applyThinScrollbarsEverywhere } from "#scrollbars";

/** Lets the mutation observers deliver their pending records. */
async function settle(): Promise<void> {
  await new Promise<void>((resolve) => {
    queueMicrotask(resolve);
  });
}

/** The scrollbar sheet a root adopted, read from its CSS text. */
function hasThinSheet(root: Document | ShadowRoot): boolean {
  return root.adoptedStyleSheets.some((sheet) =>
    [...sheet.cssRules].some((rule) =>
      rule.cssText.includes("scrollbar-width: thin"),
    ),
  );
}

it("puts the sheet back when other code replaces it", async () => {
  applyThinScrollbarsEverywhere();
  document.adoptedStyleSheets = [];
  document.body.append(document.createElement("p"));
  await settle();
  expect(hasThinSheet(document)).toBe(true);
});
