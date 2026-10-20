import { expect, it } from "vite-plus/test";

import { applyThinScrollbarsEverywhere } from "./index.ts";

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

it("styles the document and every shadow root", () => {
  const early = document.createElement("div");
  const earlyRoot = early.attachShadow({ mode: "open" });
  document.body.append(early);

  applyThinScrollbarsEverywhere();
  expect(hasThinSheet(document)).toBe(true);
  expect(hasThinSheet(earlyRoot)).toBe(true);

  const host = document.createElement("div");
  const openRoot = host.attachShadow({ mode: "open" });
  const closedHost = document.createElement("div");
  const closedRoot = closedHost.attachShadow({ mode: "closed" });
  expect(hasThinSheet(openRoot)).toBe(true);
  expect(hasThinSheet(closedRoot)).toBe(true);
});

it("keeps the patched method's name", () => {
  applyThinScrollbarsEverywhere();
  expect(Element.prototype.attachShadow.name).toBe("attachShadow");
});

it("puts the sheet back when other code replaces it", async () => {
  applyThinScrollbarsEverywhere();
  document.adoptedStyleSheets = [];
  document.body.append(document.createElement("p"));
  await settle();
  expect(hasThinSheet(document)).toBe(true);
});

it("adopts one shared sheet only once per root", () => {
  applyThinScrollbarsEverywhere();
  applyThinScrollbarsEverywhere();
  const root = document.createElement("div").attachShadow({ mode: "open" });
  expect(root.adoptedStyleSheets).toHaveLength(1);
  expect(root.adoptedStyleSheets[0]).toBe(document.adoptedStyleSheets.at(-1));
});
