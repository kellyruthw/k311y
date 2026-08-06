"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Tab from "@/components/UI/Tab/Tab";
import Prose from "@/components/UI/Prose/Prose";
import AutoplayVideo from "@/components/UI/AutoplayVideo/AutoplayVideo";
import { isVideo, mediaUrl } from "@/lib/acf";
import type { TimelineFields } from "@/lib/fragments/timeline";
import type { SectionProps } from "@/lib/fragments/sections";
import styles from "./timeline.module.scss";

gsap.registerPlugin(ScrollTrigger);

/**
 * Timeline. Career entries either side of a centre line that grows as you read
 * down it.
 *
 * Which side an entry falls on is derived from its position, never authored, so
 * reordering the repeater re-alternates the whole run and there is no way to
 * end up with two entries on the same side.
 *
 * Everything is server-rendered in its finished position. GSAP sets the start
 * state on mount and scrubs back to it, so with JS off, or under reduced
 * motion, the timeline is simply complete: line drawn, entries in place.
 */

type TimelineProps = TimelineFields & SectionProps;

/**
 * The scrub every per-entry animation runs on: from the card entering the
 * bottom of the viewport to it reaching the reading line.
 *
 * Shared so the branch and the card it belongs to cannot drift apart. They are
 * separate tweens on separate breakpoints -- the branch draws at every width,
 * the card only travels where it has somewhere to travel from -- and the one
 * thing that has to stay identical between them is this.
 */
const CARD_SCRUB = (card: HTMLElement) => ({
  trigger: card,
  start: "top bottom",
  end: "top center",
  scrub: 0.6,
});

export default function Timeline(props: TimelineProps) {
  const scope = useRef<HTMLElement>(null);
  const entries = (props.entries ?? []).filter(
    (entry) => entry.entryDate || entry.entryCompany || entry.entryBody,
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // THE LINE AND ITS BRANCHES -- every width.
      //
      // The spine grows and each branch draws out of it toward its entry. None
      // of that depends on having two sides: on a phone the entries are one
      // column and the branches simply all reach the same way, which is what
      // still ties each date to the line rather than leaving it floating beside
      // one.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const root = scope.current;
        if (!root) return;

        const fill = root.querySelector<HTMLElement>("[data-timeline-fill]");
        const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-timeline-card]"));

        // The line grows across the whole panel: one scrub from the moment the
        // panel's top reaches the reading line to the moment its bottom does.
        if (fill) {
          gsap.from(fill, {
            scaleY: 0,
            ease: "none",
            scrollTrigger: {
              trigger: fill.parentElement as HTMLElement,
              start: "top center",
              end: "bottom center",
              scrub: 0.6,
            },
          });
        }

        for (const card of cards) {
          const branch = card.querySelector<HTMLElement>("[data-timeline-branch]");
          if (!branch) continue;

          gsap.from(branch, {
            scaleX: 0,
            ease: "none",
            scrollTrigger: CARD_SCRUB(card),
          });
        }
      });

      // THE CARDS THEMSELVES -- desktop only.
      //
      // The travel is the part that needs sides: a card starts at the spine and
      // slides away toward the page edge, and in one column there is no "away"
      // to slide to. Its own trigger rather than a shared timeline, on the same
      // start, end and scrub as the branch above, so the two stay in step
      // without the branch having to live in a timeline it does not need.
      mm.add("(min-width: 1025px) and (prefers-reduced-motion: no-preference)", () => {
        const root = scope.current;
        if (!root) return;

        const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-timeline-card]"));

        for (const card of cards) {
          const branch = card.querySelector<HTMLElement>("[data-timeline-branch]");
          const toLeft = card.dataset.timelineSide === "left";

          // The distance is the branch's own width, read at refresh rather than
          // baked in, so a resize re-measures instead of animating to a stale
          // pixel figure. Sign flips per side: a left card sits left of the
          // spine, so it starts shifted right.
          gsap.from(card, {
            x: () => (branch?.offsetWidth ?? 0) * (toLeft ? 1 : -1),
            autoAlpha: 0,
            ease: "none",
            scrollTrigger: CARD_SCRUB(card),
          });
        }
      });

      return () => mm.revert();
    },
    { scope, dependencies: [entries.length] },
  );

  if (!entries.length) return null;

  return (
    <section
      ref={scope}
      id={props.id}
      data-component={props.component}
      className={styles.section}
    >
      {/* The tab labels the panel it sits on, exactly as a table's does. */}
      {props.label ? (
        <div className={styles.tabRow}>
          <Tab count={props.countDisplay}>{props.label}</Tab>
        </div>
      ) : null}

      <div className={styles.panel}>
        {/* The track is always drawn; only the fill over it grows. */}
        <div className={styles.spine} aria-hidden>
          <span className={styles.spineFill} data-timeline-fill />
        </div>

        {entries.map((entry, index) => {
          const side = index % 2 === 0 ? "left" : "right";
          const node = entry.entryMedia?.node;
          const src = mediaUrl(node);

          return (
            <div
              key={`${entry.entryDate ?? ""}-${entry.entryCompany ?? ""}-${index}`}
              className={styles.entry}
            >
              <article
                className={styles.card}
                data-side={side}
                data-timeline-card
                data-timeline-side={side}
              >
                {src ? (
                  <div className={styles.mediaFrame}>
                    {isVideo(node) ? (
                      <AutoplayVideo className={styles.media} src={src} />
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element -- fixed
                         ratio frame sized by the grid column. */
                      <img
                        className={styles.media}
                        src={src}
                        alt={node?.altText ?? ""}
                        loading="lazy"
                      />
                    )}
                  </div>
                ) : null}

                {entry.entryDate ? (
                  <p className={styles.date}>
                    {entry.entryDate}

                    {/*
                      The branch hangs off the date rather than the top of the
                      card, which is where the design draws it. It lives inside
                      this element so its 100% is the card's edge whatever the
                      date's text width.
                    */}
                    <span className={styles.branch} data-timeline-branch aria-hidden />
                  </p>
                ) : null}

                {entry.entryCompany ? (
                  <h3 className={styles.company}>{entry.entryCompany}</h3>
                ) : null}

                <Prose value={entry.entryBody} className={styles.body} />
              </article>
            </div>
          );
        })}
      </div>
    </section>
  );
}
