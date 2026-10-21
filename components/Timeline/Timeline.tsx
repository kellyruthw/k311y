"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Tab from "@/components/UI/Tab/Tab";
import Prose from "@/components/UI/Prose/Prose";
import MediaCarousel from "@/components/UI/MediaCarousel/MediaCarousel";
import type { MediaNode } from "@/lib/fragments/buildTable";
import type { TimelineFields } from "@/lib/fragments/timeline";
import type { SectionProps } from "@/lib/fragments/sections";
import styles from "./timeline.module.scss";

gsap.registerPlugin(ScrollTrigger);

/**
 * Timeline. Career entries as a deck: each era is a full-width card that
 * sticks below the top of the viewport while the next one deals over it, so by
 * the last entry the whole career is physically stacked behind the current
 * chapter -- which is the point, since the last entry is the studio the rest
 * led to.
 *
 * The sticky pile is CSS and works everywhere. GSAP adds only the fade: as
 * the next card travels up, the one beneath it eases back in opacity, scrubbed
 * to the scroll. With JS off, or under reduced motion, cards simply stack at
 * full strength -- complete, exactly as server-rendered.
 *
 * An entry's media is its entryGallery, in authored order, handed to
 * MediaCarousel as one run. A single shot renders as a plain frame with no
 * pager, which is most entries.
 */

type TimelineProps = TimelineFields & SectionProps;

const pad2 = (n: number) => String(n).padStart(2, "0");

export default function Timeline(props: TimelineProps) {
  const scope = useRef<HTMLElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const tabRowRef = useRef<HTMLDivElement>(null);
  const entries = (props.entries ?? []).filter(
    (entry) => entry.entryDate || entry.entryCompany || entry.entryBody,
  );

  // THE FOLDER JOIN. A dealt card tucks its top edge under the pinned tab
  // row's rule, so tab and sheet read as one folder -- which means the cards'
  // sticky offset is exactly the tab row's height, and that height is not a
  // token: it is a 1px border plus paddings around a cap-trimmed label, and it
  // scales with the root. So it is measured, and re-measured on resize, into a
  // custom property the stylesheet offsets by. The stylesheet's fallbacks keep
  // the layout sane before this runs.
  //
  // The last card's height is measured for the same reason: the tab's sticky
  // container (.tabPin) ends one last-card-height above the shell's end, which
  // is what releases the tab at the exact moment the final card's top reaches
  // the join -- from there the two scroll off together instead of the card
  // sliding past a still-pinned tab.
  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const tabRow = tabRowRef.current;
    const cards = shell.querySelectorAll<HTMLElement>("[data-timeline-card]");
    const lastCard = cards[cards.length - 1];

    // The one reach outside this component: on tablet-and-below the sidebar is
    // a sticky top bar, and the mobile pin line hangs space(8) under it. Its
    // height is content-driven, so it is measured like the tab's. The selector
    // is SidebarNav's landmark; if that nav ever renames, the stylesheet's
    // fallback keeps the pin usable.
    const navBar = document.querySelector<HTMLElement>('nav[aria-label="Page structure"]');

    const measure = () => {
      shell.style.setProperty("--timeline-tab-height", `${tabRow?.offsetHeight ?? 0}px`);
      if (lastCard) {
        shell.style.setProperty("--timeline-last-card-height", `${lastCard.offsetHeight}px`);
      }
      if (navBar) {
        shell.style.setProperty("--timeline-nav-height", `${navBar.offsetHeight}px`);
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    if (tabRow) observer.observe(tabRow);
    if (lastCard) observer.observe(lastCard);
    if (navBar) observer.observe(navBar);
    return () => observer.disconnect();
  }, [entries.length]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // THE FADE, DESKTOP -- motion-safe only.
      //
      // Card i is driven by card i+1's travel toward the sticky line: as the
      // next card closes in, this one fades back. Opacity only, deliberately
      // no scale: a scaled card pulls its edges in and breaks the flush folder
      // join against the pinned tab row. The last card has no successor and
      // never fades; it is the destination.
      mm.add("(min-width: 1025px) and (prefers-reduced-motion: no-preference)", () => {
        const root = scope.current;
        if (!root) return;

        const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-timeline-card]"));

        cards.forEach((card, index) => {
          const next = cards[index + 1];
          if (!next) return;

          // The card's CHILDREN fade, never the card: opacity on the card
          // itself makes the whole sheet translucent and the pile beneath
          // ghosts through its copy. The sheet stays opaque; its contents
          // lighten. fromTo rather than to, so the interpolation is pinned at
          // both ends whatever the computed style says at tween creation.
          gsap.fromTo(Array.from(card.children), { opacity: 1 }, {
            opacity: 0.6,
            ease: "none",
            scrollTrigger: {
              trigger: next,
              // Not "top bottom": the next card is visible at the foot of the
              // viewport the whole time the reader is on this one, and starting
              // there dimmed the card while it was being read. By two thirds up
              // the screen this card has stuck and the reader has moved on, so
              // the recede happens during the cover, never during the reading.
              start: "top 66%",
              // The next card's own sticky offset, read live rather than baked
              // in, so a resize re-measures instead of scrubbing to a stale
              // pixel figure.
              end: () => `top ${parseFloat(getComputedStyle(next).top) || 0}`,
              scrub: 0.6,
            },
          });
        });
      });

      // THE FADE, MOBILE -- motion-safe only.
      //
      // One column means the cards' heights vary wildly, and a short card
      // pinned over a tall one leaves the tall sheet's tail showing behind it.
      // So on a phone the WHOLE card fades, border included, and is gone by
      // the time the incoming card is halfway to the pin line. Fading the
      // sheet is safe here where it ghosted on desktop: everything beneath it
      // has already faded to nothing, so what shows through is the canvas.
      mm.add("(max-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const root = scope.current;
        if (!root) return;

        const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-timeline-card]"));

        cards.forEach((card, index) => {
          const next = cards[index + 1];
          if (!next) return;

          // autoAlpha so a fully faded card is also visibility: hidden and
          // cannot catch taps through the card above it.
          gsap.fromTo(card, { autoAlpha: 1 }, {
            autoAlpha: 0,
            ease: "none",
            scrollTrigger: {
              trigger: next,
              // Nothing fades while the incoming card is still low on the
              // screen: the fade runs from the moment its top crosses the
              // viewport's centre to the moment it lands on the pin line, so
              // the old card is readable right up until it is actually being
              // covered, and gone by the time the cover completes.
              start: "top 50%",
              end: () => `top ${parseFloat(getComputedStyle(next).top) || 0}`,
              scrub: 0.6,
            },
          });
        });
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
      {/* One flow wrapper for the tab and the deck, because both stick: a
          sticky element pins within its containing block, and as grid items
          each would be confined to its own row. In here the tab pins for the
          whole run and the cards deal beneath it. */}
      <div className={styles.shell} ref={shellRef}>
        {/* The tab labels the deck it sits on, and rides along: it stays
            pinned above the pile, each dealt card attaches flush beneath its
            rule, and when the last card arrives the tab releases and leaves
            with it. The .tabPin wrapper is the sticky container that ends
            early to make that release happen. */}
        {props.label ? (
          <div className={styles.tabPin}>
            <div className={styles.tabRow} ref={tabRowRef}>
              <Tab count={props.countDisplay}>{props.label}</Tab>
            </div>
          </div>
        ) : null}

        <div className={styles.deck}>
        {entries.map((entry, index) => {
          const media: MediaNode[] = entry.entryGallery?.nodes ?? [];

          return (
            <article
              key={`${entry.entryDate ?? ""}-${entry.entryCompany ?? ""}-${index}`}
              className={styles.card}
              data-timeline-card
            >
              <header className={styles.head}>
                {entry.entryDate ? <p className={styles.date}>{entry.entryDate}</p> : null}

                {entry.entryCompany ? (
                  <h3 className={styles.company}>{entry.entryCompany}</h3>
                ) : null}

                <span className={styles.count} aria-hidden>
                  {pad2(index + 1)} / {pad2(entries.length)}
                </span>
              </header>

              {/* Prose renders one <p> per authored line; the wrapper keeps
                  those siblings out of the card's grid. */}
              <div className={styles.copy}>
                <Prose value={entry.entryBody} className={styles.body} />
              </div>

              {media.length ? <MediaCarousel media={media} className={styles.carousel} /> : null}
            </article>
          );
        })}
        </div>
      </div>
    </section>
  );
}
