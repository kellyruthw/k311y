"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Which item is at the reading line.
 *
 * A midpoint test, not IntersectionObserver, and for the reason SidebarNav's
 * scroll-spy states at length: `intersectionRatio` is measured against the
 * element's own height, so a tall row scores a fraction while a short one fully
 * inside the band scores 1. Comparing them means the long items can never win
 * and simply never light. A midpoint has no such bias -- an item is current for
 * exactly as long as the line is inside it, whatever its height.
 *
 * Returns -1 until the line is inside one of them, which is the state above and
 * below the list: nothing is highlighted rather than the first or last item
 * being highlighted by default.
 *
 * Not gated behind reduced motion. Nothing here animates -- an item is current
 * or it is not -- and telling a reader where they are is an indicator rather
 * than a flourish. The colour TRANSITION is what sits inside motion-safe, in
 * the stylesheet.
 */
export function useActiveItem<T extends HTMLElement>(count: number) {
  const ref = useRef<T>(null);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const root = ref.current;
    if (!root || count === 0) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-list-item]"));
    if (!items.length) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const line = window.innerHeight / 2;

      const index = items.findIndex((item) => {
        const rect = item.getBoundingClientRect();
        return rect.top <= line && rect.bottom >= line;
      });

      setActive(index);
    };

    // Coalesced into a frame: scroll fires far more often than the paint that
    // would show the change.
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [count]);

  return { ref, active };
}
