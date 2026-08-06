"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Prose from "@/components/UI/Prose/Prose";
import AutoplayVideo from "@/components/UI/AutoplayVideo/AutoplayVideo";
import { isVideo, mediaUrl, selectValue, toLines } from "@/lib/acf";
import { scrollToAnchor } from "@/lib/anchors";
import type { PageHeroFields } from "@/lib/fragments/pageHero";
import type { SectionProps } from "@/lib/fragments/sections";
import styles from "./backgroundMediaHero.module.scss";

/**
 * The entrance. The copy arrives while the backdrop is still growing, not
 * after it -- the two are one movement, and the media finishing first would
 * make the text look like a second event.
 */
const MEDIA_GROW = 1.1;
const PART_FADE = 0.55;
const PART_STAGGER = 0.12;

/**
 * PageHero, background-media variant. Figma node 128:554, the About frame.
 *
 * Where split and stacked put the media BESIDE the copy, this one puts it
 * BEHIND: a backdrop on columns 3 to 8, dimmed into the canvas by a gradient,
 * with the H1, intro and CTA over it in a single column. Nothing sits next to
 * anything, so the height is set by the copy alone -- which is what lets the
 * section hold an exact 100vh where the other two need a floor.
 *
 * It authors nothing of its own. Every field here belongs to split and stacked
 * already, per lib/schema.md, which is why this is a variant and not a layout.
 *
 * It has its own entrance, briefed separately from the home sequence: the
 * backdrop grows up from its bottom edge while the H1, intro and CTA arrive
 * over it on a stagger.
 */

type BackgroundMediaHeroProps = PageHeroFields & SectionProps;

/**
 * The CTA scrolls to a section on the same page.
 *
 * Identical in behaviour to the one in StackedHero and drawn the same way, in
 * $color-text-select rather than split's white button. It matters more here
 * than anywhere else on the site: this hero is fixed at the viewport height
 * specifically so that this link cannot fall below the fold.
 */
function AnchorCta({ label, link }: { label: string; link: string }) {
  return (
    <a
      href={link}
      className={styles.cta}
      onClick={(event) => {
        if (scrollToAnchor(link)) event.preventDefault();
      }}
    >
      {label}
    </a>
  );
}

export default function BackgroundMediaHero(props: BackgroundMediaHeroProps) {
  const scope = useRef<HTMLElement>(null);
  const node = props.media?.node;
  const src = mediaUrl(node);

  // Right as drawn in the frame. The same field, and the same two values, that
  // split and stacked use.
  const side = selectValue(props.mediaSide) === "left" ? "left" : "right";

  /**
   * The backdrop grows from the bottom up while the copy arrives over it.
   *
   * `clip-path: inset(...)` rather than a scale, and that is the whole reason
   * the media is undistorted: insetting from the TOP and easing that inset to
   * zero uncovers the picture upward from its bottom edge, at its own
   * proportions the entire way. Scaling it would stretch it while it moved.
   *
   * On mount, not on scroll -- this is a page opener, and by the time it could
   * be scrolled to it has already happened.
   */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const root = scope.current;
        if (!root) return;

        const media = root.querySelector<HTMLElement>("[data-bg-media]");
        const parts = [
          root.querySelector<HTMLElement>(`.${styles.head}`),
          ...Array.from(root.querySelectorAll<HTMLElement>(`.${styles.intro}`)),
          root.querySelector<HTMLElement>(`.${styles.cta}`),
        ].filter(Boolean) as HTMLElement[];

        // The two containers are what CSS holds back. Turning them on here and
        // setting the parts' start state in the same frame hands the reveal
        // from the stylesheet to the timeline with no paint in between.
        const columns = Array.from(root.querySelectorAll<HTMLElement>("[data-bg-copy]"));
        if (columns.length) gsap.set(columns, { autoAlpha: 1 });

        const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

        if (media) {
          tl.fromTo(
            media,
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: MEDIA_GROW, ease: "power3.out" },
            0,
          );
        }

        if (parts.length) {
          tl.fromTo(
            parts,
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: PART_FADE, stagger: PART_STAGGER },
            // Overlapping the grow rather than following it, so the copy lands
            // on a backdrop that is still arriving.
            MEDIA_GROW * 0.2,
          );
        }
      });

      return () => mm.revert();
    },
    { scope },
  );

  const ctaLabel = props.ctaLabel?.trim();
  const ctaLink = props.ctaLink?.trim();
  const hasCta = Boolean(ctaLabel && ctaLink);

  return (
    <section
      ref={scope}
      id={props.id}
      data-component={props.component}
      data-variant="background_media"
      data-media-side={side}
      className={styles.hero}
    >
      {/*
        First in the DOM as well as behind in paint order: it is the backdrop
        the rest of the hero is read against, and a reader tabbing or using a
        screen reader should reach the heading without it in the way. It carries
        no text, so there is nothing here to announce.
      */}
      {src ? (
        <div className={styles.mediaLayer} data-bg-media>
          {isVideo(node) ? (
            <AutoplayVideo className={styles.media} src={src} />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element -- sized by the
               columns it spans and the viewport height, not by a fixed ratio. */
            <img
              className={styles.media}
              src={src}
              alt={node?.altText ?? ""}
              // The first thing on the page that uses this. Never lazy.
              loading="eager"
            />
          )}

          {/* The scrim. Fixed to the variant, not authored -- see schema.md. */}
          <div className={styles.scrim} aria-hidden />
        </div>
      ) : null}

      {/*
        Head and copy are separate grid children because they span different
        widths -- 7 columns against 4, as the frame draws them. Nesting the H1
        inside the copy column and widening it with a calc does not work: the
        percentage in grid-track() resolves against the copy column, not the
        page, so it would silently compute the wrong width.

        Kicker and title share one child, as in StackedHero, so an optional
        kicker cannot add a third row.
      */}
      <div className={styles.head} data-bg-copy>
        {props.kicker ? <p className={styles.kicker}>{props.kicker}</p> : null}

        {props.title ? (
          <h1 className={styles.title}>
            {/* Authored breaks are structural, same as every other hero. */}
            {toLines(props.title).map((line) => (
              <span key={line} className={styles.titleLine}>
                {line}
              </span>
            ))}
          </h1>
        ) : null}
      </div>

      <div className={styles.copy} data-bg-copy>
        <Prose value={props.intro} className={styles.intro} />

        {hasCta ? <AnchorCta label={ctaLabel as string} link={ctaLink as string} /> : null}
      </div>
    </section>
  );
}
