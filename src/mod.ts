/** Thin bars in a washed-out `currentColor`, over no track at all. */
const SCROLLBAR_RULE = `
  * {
    scrollbar-color: color-mix(in srgb, currentColor 25%, #0000) #0000;
    scrollbar-width: thin;
  }
`;

/** The tags that can hold a page of their own. */
const FRAME_TAGS = new Set(["iframe", "frame", "object", "embed"]);

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
 * Documents whose realm has had its `attachShadow` patched.
 * Keyed by document, not by window: navigating a frame hands back the
 * same `contentWindow` while replacing everything behind it, so a window
 * that was patched once would look patched forever.
 */
const patchedDocuments = new WeakSet<Document>();

/**
 * Roots that are already watched, so a second observer is never stacked
 * on one root. A weak set lets a discarded root take its observer with it.
 */
const observedRoots = new WeakSet<Document | ShadowRoot>();

/** Frame elements already waited on, so one `load` listener is enough. */
const watchedFrames = new WeakSet<Element>();

/**
 * The page a framed element holds, or null when it is out of reach.
 * A cross-origin page answers `null`, and older engines throw where newer
 * ones answer, so a refusal of either shape is read the same way. An
 * `embed` offers only `getSVGDocument`, which reaches an SVG page alone.
 *
 * Every test runs against the element's own realm, because an `iframe`
 * inside a framed page is not this realm's `HTMLIFrameElement` and would
 * fail an `instanceof` asked from here.
 */
function framedDocumentOf(element: Element): Document | null {
  const view = element.ownerDocument.defaultView;
  if (view === null) {
    return null;
  }
  try {
    if (
      element instanceof view.HTMLIFrameElement ||
      element instanceof view.HTMLObjectElement ||
      element instanceof view.HTMLFrameElement
    ) {
      return element.contentDocument;
    }
    if (element instanceof view.HTMLEmbedElement) {
      return element.getSVGDocument();
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * The sheet for a document, built on first use from that document's own
 * `CSSStyleSheet`. A document torn out of its window can no longer build
 * one, and is left alone.
 */
function sheetFor(owner: Document): CSSStyleSheet | null {
  const existing = documentSheets.get(owner);
  if (existing !== undefined) {
    return existing;
  }
  const view = owner.defaultView;
  if (view === null) {
    return null;
  }
  const sheet = new view.CSSStyleSheet();
  sheet.replaceSync(SCROLLBAR_RULE);
  documentSheets.set(owner, sheet);
  return sheet;
}

/** Styles the page a framed element holds, when it holds one in reach. */
function patchFramedPage(element: Element): void {
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
function watchFrame(element: Element): void {
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
 * declarative shadow DOM above all, are only ever found this way. The
 * owner is carried along so nodes are tested against their own realm.
 */
function patchDescendants(node: Node, owner: Document): void {
  const view = owner.defaultView;
  if (view !== null && node instanceof view.Element) {
    if (node.shadowRoot !== null) {
      patchRoot(node.shadowRoot, owner);
    }
    if (FRAME_TAGS.has(node.localName)) {
      watchFrame(node);
    }
  }
  for (const child of node.childNodes) {
    patchDescendants(child, owner);
  }
}

/**
 * Adopts the sheet into a root and watches it from then on, so anything
 * grown later is styled and the sheet returns if other code drops it.
 */
function patchRoot(root: Document | ShadowRoot, owner: Document): void {
  const sheet = sheetFor(owner);
  if (sheet !== null && !root.adoptedStyleSheets.includes(sheet)) {
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
  }
  if (observedRoots.has(root)) {
    return;
  }
  observedRoots.add(root);
  const view = owner.defaultView;
  if (view !== null) {
    const observer = new view.MutationObserver((records) => {
      patchRoot(root, owner);
      for (const record of records) {
        for (const node of record.addedNodes) {
          patchDescendants(node, owner);
        }
      }
    });
    observer.observe(root, { childList: true, subtree: true });
  }
  patchDescendants(root, owner);
}

/**
 * Styles a whole page: its document, its roots, and the roots it grows
 * from here on. Every page patches its own `attachShadow`, because a
 * realm's `Element.prototype` is its own and the patch made in one page
 * is invisible from every other.
 */
function patchPage(target: Document): void {
  if (!patchedDocuments.has(target)) {
    patchedDocuments.add(target);
    const view = target.defaultView;
    if (view !== null) {
      const prototype = view.Element.prototype;
      const attachShadow = prototype.attachShadow;
      prototype.attachShadow = function (init: ShadowRootInit): ShadowRoot {
        const root = attachShadow.call(this, init);
        patchRoot(root, this.ownerDocument);
        return root;
      };
    }
  }
  patchRoot(target, target);
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
