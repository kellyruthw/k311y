"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Re-measures every ScrollTrigger after a client-side navigation.
 *
 * ScrollTrigger caches each trigger's start and end as pixel offsets when it is
 * created, and re-measures on the window `load` event. A client-side navigation
 * never fires one. So a trigger created during that navigation keeps whatever
 * it measured mid-hydration -- before fonts settled, before images had
 * dimensions, and against a document whose height was still the previous page's
 * in the frame it was read.
 *
 * The result is a trigger whose start sits at a scroll position that no longer
 * corresponds to anything, so it either fires at the wrong moment or never
 * fires at all. That is the difference between loading a page directly, where
 * `load` corrects it, and returning to it through the router, where nothing
 * does -- which is exactly the shape of the WorkCardGrid bug this was written
 * for.
 *
 * Two refreshes, and the second is the one that matters. The first runs once
 * this component's effects do, which is after the route's components have
 * mounted and created their triggers. The second waits a frame, so anything
 * that changes height as it settles -- a font swapping in, an image taking its
 * intrinsic size -- has done so before the final measurement.
 *
 * Mounted once in app/layout.tsx rather than per component: a refresh is global
 * and re-measures everything, so doing it in five places would be the same work
 * five times.
 */
export default function ScrollRefresh() {
  const pathname = usePathname();

  useEffect(() => {
    ScrollTrigger.refresh();

    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
