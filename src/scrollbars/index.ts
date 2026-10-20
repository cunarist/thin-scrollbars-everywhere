/**
 * The single stylesheet shared by the document and all shadow roots.
 * Created lazily so importing this module does not touch DOM APIs,
 * which keeps the import safe in non-browser environments like SSR.
 */
let scrollbarStyle: CSSStyleSheet | null = null;

/**
 * Returns the shared stylesheet, creating it on first use.
 * One constructable sheet can be adopted by any number of roots,
 * so every root reuses this instance instead of getting a copy.
 */
function getScrollbarStyle(): CSSStyleSheet {
  if (scrollbarStyle === null) {
    scrollbarStyle = new CSSStyleSheet();
    scrollbarStyle.replaceSync(`
      * {
        scrollbar-color: color-mix(in srgb, currentColor 25%, #0000) #0000;
        scrollbar-width: thin;
      }
    `);
  }
  return scrollbarStyle;
}

/**
 * Roots that already have a MutationObserver attached, so patchRoot
 * does not stack a second observer on the same root. A WeakSet lets
 * discarded roots be garbage collected along with their observers.
 */
const observedRoots = new WeakSet<Document | ShadowRoot>();

/** The native `Element.prototype.attachShadow`, called with an element. */
interface NativeAttachShadow {
  attachShadow: (this: Element, init: ShadowRootInit) => ShadowRoot;
}

/**
 * Whether applyThinScrollbarsEverywhere has run, making repeat calls
 * no-ops so Element.prototype.attachShadow is only patched once.
 */
let installed = false;

/**
 * Walks a subtree and patches every open shadow root found in it.
 * Needed for roots that already existed before this module could
 * see them being attached, such as declarative shadow DOM.
 */
function patchShadowRoots(node: Node): void {
  if (node instanceof Element && node.shadowRoot !== null) {
    patchRoot(node.shadowRoot);
  }
  for (const child of node.childNodes) {
    patchShadowRoots(child);
  }
}

/**
 * Adopts the stylesheet into a root and starts observing it so new
 * descendants get scanned for shadow roots and the sheet is restored
 * if some other code overwrites adoptedStyleSheets later.
 */
function patchRoot(root: Document | ShadowRoot): void {
  const sheet = getScrollbarStyle();
  if (!root.adoptedStyleSheets.includes(sheet)) {
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
  }
  if (observedRoots.has(root)) {
    return;
  }
  observedRoots.add(root);
  new MutationObserver((records) => {
    patchRoot(root);
    for (const record of records) {
      for (const node of record.addedNodes) {
        patchShadowRoots(node);
      }
    }
  }).observe(root, { childList: true, subtree: true });
  patchShadowRoots(root);
}

/**
 * Applies thin, translucent scrollbars to the document and to every
 * shadow root in the same realm, and keeps watching so roots attached
 * later are styled too. Closed shadow roots that already exist at call
 * time cannot be reached, so call this as early as possible. An iframe
 * is a separate page with its own realm; call this inside it. Calling
 * it more than once has no further effect.
 */
export function applyThinScrollbarsEverywhere(): void {
  if (installed) {
    return;
  }
  installed = true;
  // Read through a function-typed property, so the native method is kept
  // with the `this` it needs spelled out for the `call` below.
  const nativePrototype: NativeAttachShadow = Element.prototype;
  const nativeAttachShadow = nativePrototype.attachShadow;
  Element.prototype.attachShadow = function attachShadow(
    init: ShadowRootInit,
  ): ShadowRoot {
    const root = nativeAttachShadow.call(this, init);
    patchRoot(root);
    return root;
  };
  patchRoot(document);
}
