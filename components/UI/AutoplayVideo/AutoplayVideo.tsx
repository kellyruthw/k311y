"use client";

import { useEffect, useRef } from "react";

/**
 * The muted, looping video every section uses.
 *
 * Video on this site is always the same object: no controls, no sound, no
 * timeline the reader is meant to follow. It was written out eight times with
 * the same five attributes, so it is written here once instead.
 *
 * Playback is governed by this effect rather than by the `autoplay` attribute,
 * which buys two things that attribute cannot give:
 *
 * It replays. A browser is free to stall or discard a background video that has
 * scrolled away, and several do, so returning to a section could find a frozen
 * frame. Entering the viewport rewinds to 0 and plays, which also means a
 * reader who scrolls back sees the clip from the start rather than mid-loop.
 *
 * It obeys prefers-reduced-motion. Markup cannot, because the server does not
 * know the preference. Under reduced motion the video holds its poster and
 * never moves, which is the complete static fallback the accessibility target
 * asks for.
 */

export interface AutoplayVideoProps {
  src: string;
  /** The still shown before playback, and the whole story under reduced motion. */
  poster?: string;
  className?: string;
  /** Only for a video carrying meaning. Decorative clips stay unnamed. */
  ariaLabel?: string;
}

export default function AutoplayVideo({ src, poster, className, ariaLabel }: AutoplayVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    // React has never reliably server-rendered the `muted` attribute, and an
    // unmuted video is refused autoplay outright. Setting the property is the
    // one line that makes play() dependable.
    video.muted = true;

    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!motion.matches || !entry.isIntersecting) {
          video.pause();
          return;
        }

        // Rewind before playing: a clip the browser stalled offscreen otherwise
        // resumes from wherever it stopped, which reads as broken, not as a loop.
        video.currentTime = 0;

        // play() rejects when the browser declines to autoplay. There is nothing
        // to recover, and an unhandled rejection is just console noise.
        void video.play().catch(() => {});
      },
      // Start a little before the edge, so the clip is already running by the
      // time it is worth looking at.
      { rootMargin: "10% 0px", threshold: 0 },
    );

    observer.observe(video);

    // Turning reduced motion on mid-session stops playback immediately. Turning
    // it off waits for the next scroll into view, which is the quieter default.
    const onMotionChange = () => {
      if (!motion.matches) video.pause();
    };
    motion.addEventListener("change", onMotionChange);

    return () => {
      observer.disconnect();
      motion.removeEventListener("change", onMotionChange);
    };
    // Keyed on src, not empty. Changing the src of a mounted <video> runs the
    // media load algorithm, which pauses the element -- so a consumer that
    // swaps clips in place (ThumbCursor) would show a frozen first frame from
    // the second clip on. Re-running rebuilds the observer, whose initial
    // callback fires against the current intersection and starts the new clip.
    // Consumers with a fixed src are unaffected: the effect simply never re-runs.
  }, [src]);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={ariaLabel}
    />
  );
}
