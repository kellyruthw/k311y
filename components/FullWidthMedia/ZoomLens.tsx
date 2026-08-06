"use client";

import { useRef, useState } from "react";
import styles from "./fullWidthMedia.module.scss";

/**
 * A magnifier that follows the pointer over a dense artifact.
 *
 * The lens paints the same file as a background, sized to the displayed image
 * multiplied by ZOOM, and offset so the point under the pointer lands at the
 * lens centre.
 *
 * The sizing has to be in pixels. A percentage background-size resolves against
 * the lens, not the image, so `250%` renders the picture at 2.5x the lens
 * width -- smaller than the original on any wide artifact, which is why it
 * appeared to do nothing.
 *
 * Off on touch and under reduced motion: no pointer to follow, and the artifact
 * is perfectly readable without it.
 */

const ZOOM = 2.5;
const LENS = 220;

interface LensState {
  x: number;
  y: number;
  bgX: number;
  bgY: number;
  width: number;
  height: number;
}

export default function ZoomLens({ src, alt }: { src: string; alt: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const [lens, setLens] = useState<LensState | null>(null);

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = frame.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setLens({
      x,
      y,
      width: rect.width * ZOOM,
      height: rect.height * ZOOM,
      // Put the magnified point in the middle of the lens.
      bgX: LENS / 2 - x * ZOOM,
      bgY: LENS / 2 - y * ZOOM,
    });
  };

  return (
    <div
      ref={frame}
      className={styles.frameInner}
      data-zoom="true"
      onPointerMove={onMove}
      onPointerLeave={() => setLens(null)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- paired with the
          lens below, which paints the same file as a background. */}
      <img className={styles.media} src={src} alt={alt} loading="lazy" />

      {lens ? (
        <span
          className={styles.lens}
          aria-hidden
          style={{
            width: LENS,
            height: LENS,
            margin: `${-LENS / 2}px 0 0 ${-LENS / 2}px`,
            transform: `translate(${lens.x}px, ${lens.y}px)`,
            backgroundImage: `url(${src})`,
            backgroundSize: `${lens.width}px ${lens.height}px`,
            backgroundPosition: `${lens.bgX}px ${lens.bgY}px`,
          }}
        />
      ) : null}
    </div>
  );
}
