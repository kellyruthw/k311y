"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Tab from "@/components/UI/Tab/Tab";
import { HERO_TOTAL } from "@/lib/heroTiming";
import { entryNumber, formatEntryDate, type BlogEntry } from "@/lib/queries/blog";
import styles from "./blogRail.module.scss";

gsap.registerPlugin(ScrollTrigger);

// MediaCopy's restrained entrance, because the rail repeats the same way: an
// entry is one arrival with a little give, not an event of its own. The 12px
// rise itself lives in the stylesheet (.entry's starting pose); the tween only
// plays it forward.
const ENTRY_FADE = 0.5;
const ENTRY_STAGGER = 0.12;

// The gate is HALF the hero's run, not all of it: waiting out the full
// timeline read as the page stalling. At half, the entries arrive while the
// hero is settling -- after its title has landed, before the eye gets there.
const RAIL_HOLD = HERO_TOTAL * 0.5;

/**
 * The changelog rail: every post is a numbered entry hung off a left rule, the
 * way the sidebar tree hangs its component pills off a branch. Each entry is a
 * frame on the canvas -- black fill, named in mono above its top-left corner
 * the way Figma names a frame -- and the rail grows downward as entries ship.
 *
 * A draft entry wears a dashed chip beside its frame label: the same "not yet
 * placed" voice a dashed border speaks elsewhere on the canvas. Drafts only
 * reach this component locally (see lib/queries/blog.ts), so production never
 * renders the chip at all.
 *
 * A post with a featured image carries it in the frame's left column; without
 * one, the text spans the whole frame. The media never dictates the layout of
 * its neighbours -- each entry decides alone.
 */

export default function BlogRail({ entries }: { entries: BlogEntry[] }) {
  const scope = useRef<HTMLElement>(null);

  /**
   * Entries arrive after the hero, not before it.
   *
   * The rail sits directly under the PageHero, which runs an entrance timeline;
   * without a gate the cards are simply there while the title is still
   * arriving, and the page reads bottom-first. The gate is the same one
   * WorkCardGrid uses behind the Home hero: hold the first batch back by
   * whatever is left of RAIL_HOLD at the moment it would enter, which is a
   * number, not an event. Batches scrolled into view later find nothing left
   * to wait for and play immediately.
   */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const root = scope.current;
        if (!root) return;

        const items = Array.from(root.querySelectorAll<HTMLElement>("li"));
        if (!items.length) return;

        const mountedAt = performance.now();

        // The starting pose (opacity 0, risen) is in the stylesheet, not a
        // gsap.set: a JS-only hide paints every entry for a frame before
        // hydration blinks it out. The tween only ever plays it forward.
        ScrollTrigger.batch(items, {
          start: "top 85%",
          once: true,
          onEnter: (batch) => {
            const elapsed = (performance.now() - mountedAt) / 1000;

            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: ENTRY_FADE,
              stagger: ENTRY_STAGGER,
              ease: "power2.out",
              delay: Math.max(0, RAIL_HOLD - elapsed),
            });
          },
        });
      });
    },
    { scope },
  );

  if (!entries.length) return null;

  return (
    <section ref={scope} className={styles.section} data-component="BlogRail" id="blog-rail">
      <ol className={styles.rail}>
        {entries.map((entry) => (
          <li key={entry.databaseId} className={styles.entry}>
            {/* The tab labels the frame it sits on, exactly as a table's does:
                the post's category and its changelog number. A local draft is
                flagged in the tab's own chip. */}
            <div className={styles.tabRow}>
              <Tab count={entry.isDraft ? "Draft" : undefined}>
                {entry.category} / {entryNumber(entry.number)}
              </Tab>
            </div>

            <Link
              href={entry.href}
              className={entry.image ? `${styles.frame} ${styles.frameMedia}` : styles.frame}
            >
              {entry.image ? (
                /* eslint-disable-next-line @next/next/no-img-element -- sized by
                   the grid column it sits in; next/image adds nothing here. */
                <img
                  className={styles.cardMedia}
                  src={entry.image.url}
                  alt={entry.image.alt}
                  loading="lazy"
                />
              ) : null}

              <div className={styles.body}>
                <div className={styles.meta}>
                  <time dateTime={entry.date}>{formatEntryDate(entry.date)}</time>
                  <span className={styles.readTime}>{entry.readingTimeMinutes} min read</span>
                </div>

                <h2 className={styles.title}>{entry.title}</h2>

                {entry.excerpt ? <p className={styles.excerpt}>{entry.excerpt}</p> : null}

                <span className={styles.read}>Open {entryNumber(entry.number)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
