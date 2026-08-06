"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SectionHeader from "@/components/UI/SectionHeader/SectionHeader";
import Prose from "@/components/UI/Prose/Prose";
import AutoplayVideo from "@/components/UI/AutoplayVideo/AutoplayVideo";
import Table from "@/components/Table/Table";
import { isVideo, mediaUrl, selectValue } from "@/lib/acf";
import { toTableProps } from "@/lib/table";
import type { SectionProps } from "@/lib/fragments/sections";
import type { MediaCopyFields } from "@/lib/fragments/caseSections";
import type { MediaNode } from "@/lib/fragments/buildTable";
import styles from "./mediaCopy.module.scss";

gsap.registerPlugin(ScrollTrigger);

/**
 * Deliberately smaller than the entrances elsewhere on the site.
 *
 * This is the workhorse: six of these run consecutively on Samesurf. At the
 * 16-24px the heroes and LargeList travel, six arrivals in a row stop reading
 * as sections appearing and start reading as the page never being still. In a
 * component that repeats, restraint is amplitude before it is duration.
 */
const PART_RISE = 12;
const PART_FADE = 0.5;
const PART_STAGGER = 0.12;

/**
 * MediaCopy. Copy on one side, media on the other.
 *
 * The media half is one of four things -- image, video, table, or a
 * before/after pair -- which is why `variant` and `mediaType` are separate:
 * before/after is a different shape, not another kind of media.
 */

type MediaCopyProps = MediaCopyFields & SectionProps;

function Media({ node, poster }: { node: MediaNode | null | undefined; poster?: MediaNode | null }) {
  const src = mediaUrl(node);
  if (!src) return null;

  if (isVideo(node)) {
    return (
      <AutoplayVideo
        className={styles.media}
        src={src}
        poster={mediaUrl(poster) ?? undefined}
      />
    );
  }

  /* eslint-disable-next-line @next/next/no-img-element -- sized by the grid
     column it sits in; next/image adds nothing at this scale. */
  return <img className={styles.media} src={src} alt={node?.altText ?? ""} loading="lazy" />;
}

export default function MediaCopy(props: MediaCopyProps) {
  const scope = useRef<HTMLElement>(null);
  const variant = selectValue(props.variant) ?? "default";
  const mediaType = selectValue(props.mediaType) ?? "image";
  const side = selectValue(props.mediaSide) ?? "left";

  const blocks = (props.copyBlocks ?? []).filter((block) => block.blockText);
  const listItems = (props.listItems ?? [])
    .map((item) => item.itemText)
    .filter((text): text is string => Boolean(text));

  const table = mediaType === "table" ? toTableProps(props) : null;

  /**
   * What the media half actually shows, which is not always `mediaType`: a
   * before/after pair is its own shape whatever media_type happens to be set to.
   *
   * Advertised on the section so stylesheets can react to a run of the same kind
   * of media without any section having to know what its neighbours are.
   */
  const mediaShown = variant === "before_after" ? "before_after" : mediaType;

  /**
   * The two halves arrive, media first.
   *
   * Media first ALWAYS, rather than in DOM order, and the reason is where the
   * order is actually perceptible. Side by side on desktop, a 0.12s offset
   * between two halves reads as one arrival with a little give in it, not as a
   * sequence -- whichever goes first. Stacked on mobile the media is on top by
   * design, and there the order is legible, so it is the case worth being
   * right for.
   */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const root = scope.current;
        if (!root) return;

        // Ordered by hand rather than by querySelectorAll, which would return
        // them in DOM order and put the copy first on a right-sided section.
        const halves = [
          root.querySelector<HTMLElement>("[data-media-half]"),
          root.querySelector<HTMLElement>("[data-copy-half]"),
        ].filter(Boolean) as HTMLElement[];

        if (!halves.length) return;

        gsap.fromTo(
          halves,
          { autoAlpha: 0, y: PART_RISE },
          {
            autoAlpha: 1,
            y: 0,
            duration: PART_FADE,
            stagger: PART_STAGGER,
            ease: "power2.out",
            scrollTrigger: { trigger: root, start: "top 85%", once: true },
          },
        );
      });

      return () => mm.revert();
    },
    { scope },
  );

  const copy = (
    <div className={styles.copy} data-copy-half>
        <SectionHeader kicker={props.kicker} heading={props.heading} />

        {blocks.length ? (
          <div className={styles.blocks}>
            {blocks.map((block) => (
              <div key={block.blockText} className={styles.block}>
                {/* A label makes it a titled block; without one it is prose. */}
                {block.blockLabel ? (
                  <p className={styles.blockLabel}>{block.blockLabel}</p>
                ) : null}

                <Prose value={block.blockText} className={styles.blockText} />
              </div>
            ))}
          </div>
        ) : null}

        {listItems.length ? (
          <ul className={styles.list}>
            {listItems.map((item) => (
              <li key={item} className={styles.listItem}>
                {item}
              </li>
            ))}
        </ul>
      ) : null}
    </div>
  );

  const media = (
    <div className={styles.mediaSlot} data-media-half>
        {variant === "before_after" ? (
          <div className={styles.beforeAfter}>
            <figure className={styles.compare}>
              <Media node={props.mediaBefore?.node} />
              {props.labelBefore ? (
                <figcaption className={styles.compareLabel}>{props.labelBefore}</figcaption>
              ) : null}
            </figure>

            <figure className={styles.compare}>
              <Media node={props.mediaAfter?.node} />
              {props.labelAfter ? (
                <figcaption className={styles.compareLabel}>{props.labelAfter}</figcaption>
              ) : null}
            </figure>
          </div>
        ) : mediaType === "table" ? (
          table ? <Table {...table} /> : null
        ) : mediaType === "video" ? (
          <Media node={props.mediaVideo?.node} poster={props.mediaVideoPoster?.node} />
        ) : (
          <Media node={props.mediaImage?.node} />
        )}
    </div>
  );

  return (
    <section
      ref={scope}
      id={props.id}
      data-component={props.component}
      data-side={side}
      data-variant={variant}
      data-media={mediaShown}
      className={styles.section}
    >
      {/*
        Rendered in visual order, not styled into it. CSS grid places items in
        source order, so a copy-first DOM with the copy assigned to a later
        column pushes the media onto a second row rather than beside it.
      */}
      {side === "left" ? (
        <>
          {media}
          {copy}
        </>
      ) : (
        <>
          {copy}
          {media}
        </>
      )}
    </section>
  );
}
