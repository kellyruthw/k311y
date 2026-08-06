"use client";

import { useEffect, useState } from "react";
import styles from "./selectionMarquee.module.scss";

/**
 * The Figma selection idiom: a dashed marquee with marching ants, a light tint,
 * and a component chip pinned to the top-right of every matching section.
 *
 * Drawn as one fixed overlay rather than borders on the sections themselves,
 * so nothing about a section's own layout changes when it is selected -- no
 * reflow, no shifted text, no fighting with each component's box model.
 *
 * Every instance of a repeated type lights at once, which is the point: the
 * panel is showing you what a component *is*, not where one of them sits.
 */

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function SelectionMarquee({
  component,
  label,
}: {
  /** The derived name, matched against each section's data-component. */
  component: string | null;
  /** How that name is written on the chip. */
  label: string | null;
}) {
  const [boxes, setBoxes] = useState<Box[]>([]);

  useEffect(() => {
    if (!component) {
      setBoxes([]);
      return;
    }

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(`[data-component="${component}"]`),
    );

    const measure = () => {
      setBoxes(
        targets.map((el) => {
          const rect = el.getBoundingClientRect();
          return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
        }),
      );
    };

    measure();

    // Positions are viewport-relative, so they have to be re-read whenever the
    // page moves under them.
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [component]);

  if (!component || !boxes.length) return null;

  return (
    <div className={styles.overlay} aria-hidden>
      {boxes.map((box, index) => (
        <div
          key={index}
          className={styles.marquee}
          style={{
            transform: `translate(${box.left}px, ${box.top}px)`,
            width: `${box.width}px`,
            height: `${box.height}px`,
          }}
        >
          <svg className={styles.ants} width="100%" height="100%" preserveAspectRatio="none">
            <rect
              x="0.5"
              y="0.5"
              width="calc(100% - 1px)"
              height="calc(100% - 1px)"
              className={styles.antsRect}
            />
          </svg>

          <span className={styles.chip}>{label ?? component}</span>
        </div>
      ))}
    </div>
  );
}
