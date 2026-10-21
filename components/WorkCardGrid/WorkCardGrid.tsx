"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import AutoplayVideo from "@/components/UI/AutoplayVideo/AutoplayVideo";
import Tab from "@/components/UI/Tab/Tab";
import { deferInitialScroll, onAnchor, recordAnchor } from "@/lib/anchors";
import { HERO_TOTAL } from "@/lib/heroTiming";
import { selectValue } from "@/lib/acf";
import type { WorkCardGridFields } from "@/lib/fragments/workCardGrid";
import type { WorkCard } from "@/lib/fragments/workCards";
import styles from "./workCardGrid.module.scss";
import type { SectionProps } from "@/lib/fragments/sections";

gsap.registerPlugin(ScrollTrigger);

/**
 * WorkCardGrid.
 *
 * A client component for the tab state only. Every card for every tab is
 * server-rendered and present in the HTML; switching tabs reveals a panel
 * rather than fetching, so the work is indexable and works before hydration.
 *
 * Cards are attached by hydrateSections, since they come from their own post
 * types rather than the page query.
 */

type WorkCardGridProps = WorkCardGridFields & SectionProps;

/**
 * Nav anchors that open a specific tab.
 *
 * The sidebar's Case Studies and Projects links are in-page anchors rather than
 * routes, so following one has to both scroll here and switch the tab. Keyed by
 * the tab's source so the mapping stays declarative.
 */
/**
 * The entrance's timings, in one place because they are tuned against each
 * other rather than individually: the stagger reads as a run only while it
 * stays shorter than the fade it is staggering.
 */
const SECTION_RISE = 0.6;
const CARD_FADE = 0.6;
const CARD_STAGGER = 0.12;

const ANCHOR_FOR_SOURCE: Record<string, string> = {
  case_study: "case-studies",
  project: "projects",
};

/**
 * Figma lays the first two cards out large and the rest at a third each.
 * Returning the row shape rather than styling per index keeps the rule in
 * one readable place.
 */
function toRows(cards: WorkCard[]): { cards: WorkCard[]; size: "large" | "small" }[] {
  if (!cards.length) return [];

  return [
    { cards: cards.slice(0, 2), size: "large" as const },
    { cards: cards.slice(2), size: "small" as const },
  ].filter((row) => row.cards.length);
}

function CardMedia({ media }: { media: WorkCard["media"] }) {
  if (!media) return <span className={styles.mediaEmpty} aria-hidden />;

  if (media.isVideo) {
    return (
      <AutoplayVideo
        className={styles.media}
        src={media.src}
        ariaLabel={media.alt || undefined}
      />
    );
  }

  /* eslint-disable-next-line @next/next/no-img-element -- media is a fixed-ratio
     frame sized by CSS; next/image cannot improve on that here. */
  return <img className={styles.media} src={media.src} alt={media.alt} loading="lazy" />;
}

function Card({ card, size }: { card: WorkCard; size: "large" | "small" }) {
  return (
    <li className={styles.card} data-size={size} data-work-card>
      <Link href={card.href} className={styles.cardLink}>
        <span className={styles.frame}>
          <CardMedia media={card.media} />
        </span>

        <span className={styles.eyebrow}>
          <span className={styles.name}>{card.name}</span>
          {card.category ? <span className={styles.category}>{card.category}</span> : null}
          {card.role ? <span className={styles.role}>{card.role}</span> : null}
        </span>

        {card.title ? <span className={styles.title}>{card.title}</span> : null}
      </Link>
    </li>
  );
}

export default function WorkCardGrid(props: WorkCardGridProps) {
  /**
   * Memoised for the anchor effect below, which depends on it.
   *
   * `props.tabs ?? []` looks free and is not: when `tabs` is absent the `??`
   * builds a NEW empty array every render, React compares effect dependencies
   * by reference, and `[] !== []` -- so the effect tore down and re-registered
   * its anchor listener on every single render. Only on the empty path, which
   * is why nothing ever looked wrong.
   */
  const tabs = useMemo(() => props.tabs ?? [], [props.tabs]);
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  /** Set by the ScrollTrigger once the section has actually been seen. */
  const hasEntered = useRef(false);

  /** Open the tab an anchor names, and bring the grid into view. */
  useEffect(() => {
    return onAnchor((hash, isInitial) => {
      const index = tabs.findIndex(
        (tab) => ANCHOR_FOR_SOURCE[selectValue(tab.source) ?? ""] === hash,
      );
      if (index === -1) return;

      setActive(index);

      const scroll = () =>
        sectionRef.current?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
          block: "start",
        });

      // On the arrival replay the router is about to reset the scroll; the
      // state change above stays immediate either way. See deferInitialScroll.
      if (isInitial) deferInitialScroll(scroll);
      else scroll();
    });
  }, [tabs]);

  /**
   * The entrance, and the tab switch, which are the same movement arriving for
   * two different reasons.
   *
   * On the first scroll into view the section rises and its cards follow. On
   * every tab change after that the cards alone re-stagger -- the section is
   * already in place, and lifting it again would move the page under a reader
   * who only pressed a tab.
   *
   * `hasEntered` is what separates the two. A ref rather than state because it
   * must not cause a render: it records that the arrival has happened, and it
   * is set by the ScrollTrigger itself so it cannot go true before the section
   * has actually been seen.
   *
   * Always scoped to the panel that is OPEN. The other tab's cards sit behind a
   * `hidden` attribute, and animating elements with no layout would leave them
   * faded when that tab is opened later -- invisible for a reason nothing on
   * screen explains.
   */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const root = sectionRef.current;
        if (!root) return;

        const open = root.querySelector<HTMLElement>("[role='tabpanel']:not([hidden])");
        const cards = open ? Array.from(open.querySelectorAll<HTMLElement>("[data-work-card]")) : [];
        if (!cards.length) return;

        // fromTo, not from, and that is required rather than stylistic. The
        // pre-animation state in styles/base/_globals.scss already sets these to
        // opacity 0, and `from` reads the CURRENT value as its destination -- so
        // it would animate 0 to 0 and the cards would never appear. Naming both
        // ends leaves nothing to infer.
        const hidden = { autoAlpha: 0 };
        const arrive = {
          autoAlpha: 1,
          duration: CARD_FADE,
          stagger: CARD_STAGGER,
          ease: "power1.out",
        };

        // Already arrived: the cards re-stagger and the section stays put.
        //
        // `gsap.set` on the root first, and it is not belt-and-braces -- without
        // it this branch leaves the whole grid invisible.
        //
        // The section is hidden by CSS until something reveals it, and only the
        // full branch below does that. During a real tab switch that is fine,
        // because the section was revealed on the way in. But this branch can
        // also run while the section has never been revealed at all: arriving
        // through the router, the effect sets up while the browser is still at
        // the previous route's scroll position, so the trigger can fire at once
        // and set `hasEntered` -- and the next time the effect runs, which in
        // development is immediately, since StrictMode mounts every component
        // twice, it takes this path and nothing ever turns the section on.
        //
        // A hard load never hits it: the page starts at the top, the trigger
        // does not fire during setup, and `hasEntered` is still false when the
        // second mount runs the full branch. That is the whole difference
        // between refreshing Home and coming back to it.
        if (hasEntered.current) {
          gsap.set(root, { autoAlpha: 1, y: 0 });
          gsap.fromTo(cards, hidden, arrive);
          return;
        }

        // Held off by the clock rather than by a signal from the hero.
        //
        // The delay is what REMAINS of the hero's run, not the whole of it. On
        // a fresh load this section is often already in view, the trigger fires
        // at once, and the two entrances would otherwise play over each other.
        // Scrolled to later -- or arriving from another route, where the hero
        // ran long ago -- the remainder is zero and the grid arrives with no
        // wait at all. A flat delay would make every late scroll sit through a
        // second of nothing.
        //
        // `mountedAt` is read when this effect runs, which is the same moment
        // the hero's timeline starts, so the two are measured from one clock.
        const mountedAt = performance.now();

        // Set in the cleanup below: the wait can outlive this effect, and a
        // timeline built afterwards would animate a section no longer on screen.
        let cancelled = false;

        const play = () => {
          if (cancelled) return;

          const elapsed = (performance.now() - mountedAt) / 1000;
          const timeline = gsap.timeline({ delay: Math.max(0, HERO_TOTAL - elapsed) });

          // The whole section, tabs and panel together, so the chrome arrives as
          // one object rather than assembling itself in pieces.
          timeline.fromTo(
            root,
            { y: 24, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: SECTION_RISE, ease: "power2.out" },
          );

          // Then the cards fill it, overlapping the tail of the rise so the two
          // read as one movement rather than two.
          timeline.fromTo(cards, hidden, arrive, `-=${SECTION_RISE * 0.35}`);
        };

        ScrollTrigger.create({
          trigger: root,
          start: "top 85%",
          once: true,
          onEnter: () => {
            hasEntered.current = true;
            play();
          },
        });

        return () => {
          cancelled = true;
        };
      });

      return () => mm.revert();
    },
    // Re-runs on a tab change, which is what re-staggers the newly open panel.
    { scope: sectionRef, dependencies: [active] },
  );

  if (!tabs.length) return null;

  return (
    <section
      ref={sectionRef}
      id={props.id}
      data-component={props.component}
      // The hook the pre-animation state hides on. See styles/base/_globals.scss.
      data-enter
      className={styles.section}
    >
      <div className={styles.tabs} role="tablist" aria-label="Work">
        {tabs.map((tab, index) => {
          const source = selectValue(tab.source) ?? "case_study";
          const count = props.cardsBySource?.[source]?.length ?? 0;

          return (
            <Tab
              key={tab.tabLabel ?? index}
              id={`${props.id}-tab-${index}`}
              controls={`${props.id}-panel-${index}`}
              active={index === active}
              count={tab.countDisplay ?? count}
              onClick={() => {
                setActive(index);

                // Recorded, not announced: announcing would scroll to a grid
                // the reader is already in front of. The hash is what makes a
                // refresh come back to this tab -- onAnchor above replays it.
                const anchor = ANCHOR_FOR_SOURCE[source];
                if (anchor) recordAnchor(anchor);
              }}
            >
              {tab.tabLabel}
            </Tab>
          );
        })}
      </div>

      {tabs.map((tab, index) => {
        const source = selectValue(tab.source) ?? "case_study";
        const cards = props.cardsBySource?.[source] ?? [];

        return (
          <div
            key={tab.tabLabel ?? index}
            role="tabpanel"
            id={`${props.id}-panel-${index}`}
            aria-labelledby={`${props.id}-tab-${index}`}
            className={styles.panel}
            hidden={index !== active}
          >
            {toRows(cards).map((row) => (
              <ul
                key={row.size}
                className={styles.row}
                data-size={row.size}
                data-count={row.cards.length}
              >
                {row.cards.map((card) => (
                  <Card key={card.id} card={card} size={row.size} />
                ))}
              </ul>
            ))}
          </div>
        );
      })}
    </section>
  );
}
