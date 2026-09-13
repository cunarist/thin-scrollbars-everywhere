/** Thin bars in a washed-out `currentColor`, over no track at all. */
const SCROLLBAR_RULE = `
  * {
    scrollbar-color: color-mix(in srgb, currentColor 25%, #0000) #0000;
    scrollbar-width: thin;
  }
`;

/** The tags that can hold a page of their own. */
const FRAME_TAGS = new Set(["iframe", "frame", "object", "embed"]);

/** What such an element offers, whichever of those tags it turns out to be. */
interface FramedElement extends Element {
  contentDocument?: Document;
  getSVGDocument?: () => Document | null;
}

/**
 * The sheet each document lends to its own roots, built on first use so
 * that importing this module never touches a DOM API, which keeps the
 * import safe where there is no DOM at all.
 * A constructable sheet belongs to the document that built it, and any
 * other document refuses to adopt it, so a framed page is given a sheet
 * of its own rather than a share of this page's.
 */
const documentSheets = new WeakMap<Document, CSSStyleSheet>();

/**
 * The `Element.prototype` objects already carrying the `attachShadow`
 * patch. Keyed by the prototype itself rather than by realm or document,
 * because a frame shows `about:blank` before the page it was asked for
 * and both share one prototype, while a navigation brings a fresh one.
 */
const patchedPrototypes = new WeakSet<object>();

/**
 * Roots that are already watched, so a second observer is never stacked
 * on one root. A weak set lets a discarded root take its observer with it.
 */
const observedRoots = new WeakSet<Document | ShadowRoot>();

/** Frame elements already waited on, so one `load` listener is enough. */
const watchedFrames = new WeakSet<Element>();

/**
 * Whether a node is an element, asked without `instanceof`.
 * A node built in one realm keeps that realm's prototypes even once it is
 * adopted into another, so `instanceof` asked from here says no to a node
 * that is plainly an element. Its `nodeType` belongs to no realm.
 */
function isElement(node: Node): node is Element {
  return node.nodeType === 1;
}

/** Whether an element is one of the few that can hold a page. */
function isFramedElement(element: Element): element is FramedElement {
  return FRAME_TAGS.has(element.localName);
}

/**
 * The page a framed element holds, or null when it is out of reach.
 * A cross-origin page answers `null`, and older engines throw where newer
 * ones answer, so a refusal of either shape is read the same way. An
 * `embed` offers only `getSVGDocument`, which reaches an SVG page alone.
 */
function framedDocumentOf(element: FramedElement): Document | null {
  try {
    return element.contentDocument ?? element.getSVGDocument?.() ?? null;
  } catch {
    return null;
  }
}

/** The document a root belongs to, which for a document is itself. */
function ownerOf(root: Document | ShadowRoot): Document {
  const owner = root.ownerDocument;
  return owner === null ? root : owner;
}

/** Styles the page a framed element holds, when it holds one in reach. */
function patchFramedPage(element: FramedElement): void {
  const framed = framedDocumentOf(element);
  if (framed !== null) {
    patchPage(framed);
  }
}

/**
 * Styles a frame's page now, and again each time it loads another.
 * Navigation throws away the document that was styled and builds a fresh
 * one, which remembers nothing of what the old one was given.
 */
function watchFrame(element: FramedElement): void {
  patchFramedPage(element);
  if (watchedFrames.has(element)) {
    return;
  }
  watchedFrames.add(element);
  element.addEventListener("load", () => patchFramedPage(element));
}

/**
 * Walks a subtree, styling every shadow root and framed page under it.
 * Roots that existed before this module could watch them being attached,
 * declarative shadow DOM above all, are only ever found this way.
 */
function patchDescendants(node: Node): void {
  if (isElement(node)) {
    if (node.shadowRoot !== null) {
      patchRoot(node.shadowRoot);
    }
    if (isFramedElement(node)) {
      watchFrame(node);
    }
  }
  for (const child of node.childNodes) {
    patchDescendants(child);
  }
}

/**
 * Adopts the sheet into a root and watches it from then on, so anything
 * grown later is styled and the sheet returns if other code drops it.
 *
 * The owner is read afresh every time rather than remembered, because a
 * host can be moved into another document, and the sheet the old one built
 * is one the new one refuses. A root whose document has no window of its
 * own is left entirely alone, so that it is still waiting the day it is
 * adopted into a document that has one.
 */
function patchRoot(root: Document | ShadowRoot): void {
  const owner = ownerOf(root);
  const view = owner.defaultView;
  if (view === null) {
    return;
  }
  let sheet = documentSheets.get(owner);
  if (sheet === undefined) {
    sheet = new view.CSSStyleSheet();
    sheet.replaceSync(SCROLLBAR_RULE);
    documentSheets.set(owner, sheet);
  }
  if (!root.adoptedStyleSheets.includes(sheet)) {
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
  }
  if (observedRoots.has(root)) {
    return;
  }
  observedRoots.add(root);
  const observer = new view.MutationObserver((records) => {
    patchRoot(root);
    for (const record of records) {
      for (const node of record.addedNodes) {
        patchDescendants(node);
      }
    }
  });
  observer.observe(root, { childList: true, subtree: true });
  patchDescendants(root);
}

/**
 * Styles a whole page: its document, its roots, and the roots it grows
 * from here on. Every realm patches its own `attachShadow`, because an
 * `Element.prototype` is that realm's alone and the patch made in one
 * page is invisible from every other.
 */
function patchPage(target: Document): void {
  const view = target.defaultView;
  if (view !== null && !patchedPrototypes.has(view.Element.prototype)) {
    const prototype = view.Element.prototype;
    patchedPrototypes.add(prototype);
    const attachShadow = prototype.attachShadow;
    prototype.attachShadow = function (init: ShadowRootInit): ShadowRoot {
      const root = attachShadow.call(this, init);
      patchRoot(root);
      return root;
    };
  }
  patchRoot(target);
}

/**
 * Applies thin, translucent scrollbars to this page, to every shadow root
 * in it, and to every `iframe`, `frame`, `object`, and `embed` page it is
 * allowed to open, as deeply as those nest. It keeps watching, so a root
 * attached or a page loaded later is styled as it arrives.
 *
 * Call it as early as possible: a closed shadow root that already exists
 * cannot be reached. A page the browser walls off, meaning a cross-origin
 * one or a frame sandboxed without `allow-same-origin`, cannot be reached
 * at all and keeps the platform's own scrollbars; run this inside such a
 * page to style it. Calling it more than once has no further effect.
 */
export function applyThinScrollbarsEverywhere(): void {
  patchPage(document);
}
