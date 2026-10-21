"use client";

import { useEffect, useRef, useState } from "react";
import AutoplayVideo from "@/components/UI/AutoplayVideo/AutoplayVideo";
import { isVideo, mediaUrl } from "@/lib/acf";
import type { MediaNode } from "@/lib/fragments/buildTable";
import styles from "./mediaCarousel.module.scss";

/**
 * A swipeable run of media. The swipe itself is native scroll-snap, so it works
 * by thumb, by trackpad and by keyboard with no library behind it; the only
 * scripted parts are the pager under the track -- diamonds plus a mono counter,
 * the same glyph the sidebar's nav diamonds use -- which follows the scroll
 * position and jumps to a slide on click.
 *
 * One slide renders as a plain frame: no pager, no listener, nothing to swipe.
 * That is the common case today, since most entries have a single shot, and it
 * is what lets a consumer pass whatever it has without counting first.
 *
 * The frame's aspect ratio is the lead media's own, read from its
 * mediaDetails, so a video is never squeezed into a photo's proportions --
 * and it is set once for the whole track, so a multi-shot swipe never jumps
 * heights between slides. Only when WordPress reports no dimensions (an SVG,
 * a missing probe) does the frame fall back to the drawn 309x210.
 */

export interface MediaCarouselProps {
  media: MediaNode[];
  className?: string;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

export default function MediaCarousel({ media, className }: MediaCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const slides = media.filter((node) => mediaUrl(node));
  const count = slides.length;

  useEffect(() => {
    const track = trackRef.current;
    if (!track || count < 2) return;

    // Slides are exactly one track wide with no gap, so the active index is a
    // plain division -- no per-slide measurement to go stale on resize.
    const onScroll = () => {
      const index = Math.round(track.scrollLeft / track.clientWidth);
      setActive(Math.min(count - 1, Math.max(0, index)));
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [count]);

  if (!count) return null;

  // The lead media's intrinsic ratio frames the whole track.
  const dims = slides[0].mediaDetails;
  const aspect = dims?.width && dims?.height ? dims.width / dims.height : null;

  const goTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    // No `behavior`: the stylesheet sets scroll-behavior inside motion-safe,
    // so smooth vs instant is the reader's call, decided in one place.
    track.scrollTo({ left: index * track.clientWidth });
  };

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      style={
        aspect
          ? ({ "--media-carousel-aspect": String(aspect) } as React.CSSProperties)
          : undefined
      }
    >
      <div className={styles.track} ref={trackRef}>
        {slides.map((node, index) => {
          const src = mediaUrl(node) as string;
          return (
            <div className={styles.slide} key={`${src}-${index}`}>
              {isVideo(node) ? (
                <AutoplayVideo className={styles.media} src={src} />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element -- fixed
                   ratio frame sized by its column. */
                <img className={styles.media} src={src} alt={node.altText ?? ""} loading="lazy" />
              )}
            </div>
          );
        })}
      </div>

      {count > 1 ? (
        <div className={styles.pager}>
          <div className={styles.dots}>
            {slides.map((node, index) => (
              <button
                key={`dot-${index}`}
                type="button"
                className={styles.dot}
                data-active={index === active}
                aria-label={`Shot ${index + 1} of ${count}`}
                aria-current={index === active}
                onClick={() => goTo(index)}
              />
            ))}
          </div>
          <span className={styles.count} aria-hidden>
            {pad2(active + 1)} / {pad2(count)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
