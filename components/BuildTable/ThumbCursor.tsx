"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import AutoplayVideo from "@/components/UI/AutoplayVideo/AutoplayVideo";
import styles from "./thumbCursor.module.scss";

/**
 * Shows a row's thumbnail next to the cursor while it is over that row.
 *
 * Rows advertise their media with data attributes rather than this component
 * being handed a list, so there is no index to keep in sync with the table:
 * whatever a row declares is what shows.
 *
 * One pointermove listener on the container, not one per row. With 31 rows that
 * matters, and rows can come and go without anything being rebound.
 */

interface Media {
  src: string;
  isVideo: boolean;
}

function mediaFromRow(target: EventTarget | null): Media | null {
  if (!(target instanceof Element)) return null;

  const source = target.closest("tr")?.querySelector<HTMLElement>("[data-thumb-src]");
  const src = source?.dataset.thumbSrc;
  if (!src) return null;

  return { src, isVideo: source?.dataset.thumbVideo === "true" };
}

export default function ThumbCursor({ children }: { children: React.ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);
  const follower = useRef<HTMLDivElement>(null);
  const [media, setMedia] = useState<Media | null>(null);

  useGSAP(
    () => {
      // Pointer-only, wide-only, and only when motion is welcome.
      //
      // The pointer queries alone are not enough, and the gap is not theoretical:
      // a desktop browser narrowed to a phone width still reports `hover: hover`
      // and `pointer: fine`, so the follower kept running over a layout that had
      // already become the deck -- where every card shows its own thumbnail
      // inline. A second copy of the same image chasing the cursor over the top
      // of it is the one place this affordance is actively wrong.
      //
      // 1025px is the width the table stops being a table, written the same way
      // SplitStatement and Timeline state theirs.
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 1025px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
        () => {
          const root = scope.current;
          const el = follower.current;
          if (!root || !el) return;

          // quickTo keeps the follower easing toward the pointer instead of
          // snapping to it, which is what makes it feel attached rather than glued.
          const moveX = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3" });
          const moveY = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3" });

          let placed = false;

          const onMove = (event: PointerEvent) => {
            const next = mediaFromRow(event.target);

            // First appearance jumps to the pointer, so it does not fly in
            // from wherever it was left.
            if (next && !placed) {
              gsap.set(el, { x: event.clientX, y: event.clientY });
              placed = true;
            }

            moveX(event.clientX);
            moveY(event.clientY);

            setMedia((current) => {
              if (current?.src === next?.src) return current;
              if (!next) placed = false;
              return next;
            });
          };

          const onLeave = () => {
            placed = false;
            setMedia(null);
          };

          root.addEventListener("pointermove", onMove);
          root.addEventListener("pointerleave", onLeave);

          return () => {
            root.removeEventListener("pointermove", onMove);
            root.removeEventListener("pointerleave", onLeave);
          };
        },
      );

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <div ref={scope} className={styles.scope}>
      {children}

      <div
        ref={follower}
        className={styles.follower}
        data-visible={media ? "true" : "false"}
        aria-hidden
      >
        {media ? (
          media.isVideo ? (
            <AutoplayVideo src={media.src} />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element -- follows the
               cursor at a fixed size; next/image adds nothing here. */
            <img src={media.src} alt="" />
          )
        ) : null}
      </div>
    </div>
  );
}
