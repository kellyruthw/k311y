/**
 * In-page anchors that mean more than "scroll here".
 *
 * The sidebar's Case Studies and Projects links have to both scroll to the card
 * grid and open the matching tab, which the hash alone cannot express.
 *
 * Note this deliberately does not rely on the `hashchange` event: that fires
 * only for real hash navigation, never for history.pushState, which is what
 * Next's Link uses. Depending on it means the first click silently does nothing
 * while the router scrolls to the top of the page.
 */

export const ANCHOR_EVENT = "k311y:anchor";

/**
 * The element an authored anchor means.
 *
 * Section ids carry their position -- Renderer.sectionId() builds them from the
 * component name and page order, so the Timeline is `timeline-5`, not
 * `timeline`. Nobody authoring a link in WordPress knows or should have to know
 * that number, and it changes the moment a section is reordered.
 *
 * So an exact id wins, and failing that the first section of that component
 * does. `#timeline` finds the timeline wherever it has ended up.
 */
export function findAnchorTarget(hash: string): HTMLElement | null {
  const id = hash.replace(/^#/, "");
  if (!id) return null;

  const exact = document.getElementById(id);
  if (exact) return exact;

  // Guarded before going into a selector: an authored value is user input, and
  // anything outside this set cannot be a section id anyway.
  if (!/^[\w-]+$/.test(id)) return null;

  return document.querySelector<HTMLElement>(`[data-component][id^="${id}-"]`);
}

/**
 * Scroll to an in-page anchor, smoothly unless motion is unwelcome.
 *
 * Returns false when nothing matches, so a caller can leave the click to the
 * browser rather than swallowing it. A dead anchor should behave like a dead
 * link, not like a button that does nothing.
 */
export function scrollToAnchor(hash: string): boolean {
  const target = findAnchorTarget(hash);
  if (!target) return false;

  target.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "start",
  });

  // The resolved id, not the authored one, so the URL names an element that
  // exists and a refresh lands in the same place.
  window.history.replaceState(null, "", `#${target.id}`);
  return true;
}

/**
 * Record an anchor in the URL without announcing it. For a control that has
 * already handled its own state -- the card grid's tabs -- where announcing
 * would also scroll to a section the reader is already looking at. replaceState
 * rather than pushState, so flicking between tabs does not stack history
 * entries behind the back button.
 */
export function recordAnchor(hash: string): void {
  window.history.replaceState(null, "", `#${hash.replace(/^#/, "")}`);
}

/** Announce that an anchor was followed, and record it in the URL. */
export function requestAnchor(hash: string): void {
  const clean = hash.replace(/^#/, "");
  recordAnchor(clean);
  window.dispatchEvent(new CustomEvent<string>(ANCHOR_EVENT, { detail: clean }));
}

/**
 * Listen for anchors. The handler also runs once on subscribe with whatever is
 * already in the URL, so a direct load of /#projects behaves like a click --
 * synchronously, so state the handler sets is in place before any entrance
 * animation can start. `isInitial` is true only on that replay: a scroll the
 * handler wants to make MUST be deferred then (see deferInitialScroll),
 * because the router is about to reset the scroll position and would throw it
 * away. Only the scroll -- deferring the whole replay was tried, and the late
 * state change killed entrance animations already in flight and restarted
 * them.
 */
export function onAnchor(handler: (hash: string, isInitial?: boolean) => void): () => void {
  const listener = (event: Event) => {
    handler((event as CustomEvent<string>).detail, false);
  };

  window.addEventListener(ANCHOR_EVENT, listener);

  const initial = window.location.hash.replace(/^#/, "");
  if (initial) handler(initial, true);

  return () => window.removeEventListener(ANCHOR_EVENT, listener);
}

/**
 * Run an initial-replay scroll on the far side of the router's scroll reset.
 *
 * Subscribers mount during a client-side navigation, and the router resets
 * the scroll position when the new page commits -- AFTER their effects have
 * run. A scroll started inside the replay itself was being thrown away by
 * that reset, which is why arriving at /#case-studies from another page
 * landed at the top. Two frames put the scroll after the reset and after
 * first paint.
 */
export function deferInitialScroll(scroll: () => void): void {
  requestAnimationFrame(() => requestAnimationFrame(scroll));
}
