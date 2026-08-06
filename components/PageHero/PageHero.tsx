"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Table, { type TableProps } from "@/components/Table/Table";
import Prose from "@/components/UI/Prose/Prose";
import CaseHero from "./CaseHero";
import SplitHero from "./SplitHero";
import StackedHero from "./StackedHero";
import BackgroundMediaHero from "./BackgroundMediaHero";
import { selectValue, toLines } from "@/lib/acf";
import { HERO_BOX, HERO_LEAD, HERO_PART } from "@/lib/heroTiming";
import type { PageHeroFields } from "@/lib/fragments/pageHero";
import styles from "./pageHero.module.scss";
import type { SectionProps } from "@/lib/fragments/sections";

/**
 * PageHero.
 *
 * A client component because nearly every element in it takes part in the
 * entrance sequence. It still server-renders: the HTML below is what ships, and
 * it is already the finished state. GSAP sets the start state on mount and
 * animates back to it, so with JS off, or under reduced motion, the hero is
 * simply complete and correct rather than invisible.
 */

type PageHeroProps = PageHeroFields & SectionProps;

/**
 * Local aliases for the shared timings in lib/heroTiming.ts. They live there
 * because WorkCardGrid sequences itself behind this sequence and has to know
 * how long it runs; keeping the numbers in one file is what stops the two
 * disagreeing after a retune.
 *
 * The lead is the only part given room; everything after it overlaps the one
 * before, so the sequence reads as one arrival rather than five. The overlaps
 * are fractions of the tween they cut into, so shortening a duration tightens
 * the run with it instead of leaving a gap behind.
 */
/**
 * The simple variant's own timings, deliberately NOT the home hero's.
 *
 * WorkCardGrid sequences itself behind HERO_TOTAL, so retuning this prose-page
 * opener must not quietly move a section on a different route.
 */
const SIMPLE_HEAD = 0.55;
const SIMPLE_COPY = 0.5;
const SIMPLE_STAGGER = 0.1;

const LEAD = HERO_LEAD;
const PART = HERO_PART;
const BOX = HERO_BOX;

/**
 * Split the tail around its highlighted substring. The highlight is authored as
 * text that must appear in the tail, so a mismatch is possible -- in that case
 * the whole tail renders unhighlighted rather than throwing.
 */
function splitOnHighlight(tail: string, highlight: string | null) {
  if (!highlight) return { before: tail, marked: "", after: "" };

  const at = tail.indexOf(highlight);
  if (at === -1) return { before: tail, marked: "", after: "" };

  return {
    before: tail.slice(0, at),
    marked: highlight,
    after: tail.slice(at + highlight.length),
  };
}

/** Map the authored table fields onto the shared Table primitive. */
function heroTable(section: PageHeroFields): TableProps | null {
  const orientation = selectValue(section.tableOrientation) ?? "horizontal";
  const showHeaders = section.tableShowHeaders ?? false;

  if (orientation === "vertical") {
    const rows = (section.tableVerticalRows ?? [])
      .filter((row) => row.rowLabel)
      .map((row) => ({
        label: row.rowLabel as string,
        value: row.rowValue ?? "",
        valueNote: row.rowValueNote,
      }));

    if (!rows.length) return null;
    return { orientation: "vertical", name: section.tableName, showHeaders, rows };
  }

  const rows = (section.tableRows ?? []).map((row) =>
    (row.cells ?? []).map((cell) => ({ content: cell.cellValue ?? "" })),
  );

  if (!rows.length) return null;

  return {
    orientation: "horizontal",
    name: section.tableName,
    showHeaders,
    columns: (section.tableColumns ?? []).map((column) => column.columnLabel ?? ""),
    rows,
  };
}

export default function PageHero(props: PageHeroProps) {
  const scope = useRef<HTMLElement>(null);
  const variant = selectValue(props.variant) ?? "simple";

  useGSAP(
    () => {
      // matchMedia only runs this branch when motion is welcome. Under
      // prefers-reduced-motion nothing is set and nothing animates, leaving the
      // server-rendered finished state exactly as it is.
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const find = (part: string) => scope.current?.querySelector(`[data-hero-part="${part}"]`);
        const lead = find("lead");
        const tail = find("tail");
        const box = find("box");
        const paragraph = find("paragraph");
        const table = find("table");

        const rise = [lead, tail, paragraph, table].filter(Boolean) as Element[];

        gsap.set(rise, { autoAlpha: 0, y: 16 });
        if (box) gsap.set(box, { scaleX: 0 });

        const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

        if (lead) tl.to(lead, { autoAlpha: 1, y: 0, duration: LEAD });
        if (tail) tl.to(tail, { autoAlpha: 1, y: 0, duration: PART }, `-=${LEAD * 0.6}`);

        // The marked words are black on black until this passes behind them.
        if (box) tl.to(box, { scaleX: 1, duration: BOX, ease: "power3.inOut" });

        if (paragraph) tl.to(paragraph, { autoAlpha: 1, y: 0, duration: PART }, `-=${BOX * 0.55}`);
        if (table) tl.to(table, { autoAlpha: 1, y: 0, duration: PART }, `-=${PART * 0.75}`);
      });

      /**
       * The simple variant: the head arrives, then the copy follows it up.
       *
       * Its own mm.add rather than a branch inside the one above, because the
       * two sequences share nothing but the media query -- and each no-ops on
       * the other's page, since the markup it looks for is not there.
       *
       * Parts are found by their own module classes rather than data hooks. The
       * intro is rendered by the shared Prose component, and giving it an
       * attribute to pass through would change a primitive four other
       * components use in order to animate one variant of a fifth.
       */
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const body = scope.current?.querySelector<HTMLElement>("[data-hero-simple]");
        if (!body) return;

        const head = [
          body.querySelector<HTMLElement>(`.${styles.simpleKicker}`),
          body.querySelector<HTMLElement>(`.${styles.simpleTitle}`),
        ].filter(Boolean) as HTMLElement[];

        const copy = Array.from(body.querySelectorAll<HTMLElement>(`.${styles.simpleIntro}`));
        if (!head.length && !copy.length) return;

        // The container is what CSS holds back, so nothing flashes before this
        // runs. Turning it on here and hiding the PARTS in the same frame means
        // the reveal is handed from the stylesheet to the timeline without a
        // paint in between.
        gsap.set(body, { autoAlpha: 1 });

        const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

        if (head.length) {
          tl.fromTo(
            head,
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: SIMPLE_HEAD, stagger: SIMPLE_STAGGER * 0.8 },
          );
        }

        if (copy.length) {
          tl.fromTo(
            copy,
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: SIMPLE_COPY, stagger: SIMPLE_STAGGER },
            `-=${SIMPLE_HEAD * 0.45}`,
          );
        }
      });

      return () => mm.revert();
    },
    { scope, dependencies: [variant] },
  );

  if (variant === "case") return <CaseHero {...props} />;

  if (variant === "split") return <SplitHero {...props} />;

  if (variant === "stacked") return <StackedHero {...props} />;

  if (variant === "background_media") return <BackgroundMediaHero {...props} />;

  /**
   * The simple variant: kicker, H1, intro. This is the freestanding header a
   * prose page opens with, and the whole of what About and Process ask of a
   * hero -- no media, no meta table, no nowline.
   *
   * It has its own entrance now -- head, then copy -- briefed separately from
   * the home sequence and run by its own block above. The two share the scope
   * ref and nothing else: each looks for markup the other does not have, so
   * whichever variant is rendered, only one of them finds anything.
   */
  if (variant === "simple") {
    return (
      <section
        ref={scope}
        id={props.id}
        data-component={props.component}
        data-variant="simple"
        className={styles.hero}
      >
        <div className={styles.simpleBody} data-hero-simple>
          {props.kicker ? <p className={styles.simpleKicker}>{props.kicker}</p> : null}

          {props.title ? (
            <h1 className={styles.simpleTitle}>
              {/* Authored breaks are structural here too, same as the home lead. */}
              {toLines(props.title).map((line) => (
                <span key={line} className={styles.simpleTitleLine}>
                  {line}
                </span>
              ))}
            </h1>
          ) : null}

          <Prose value={props.intro} className={styles.simpleIntro} />
        </div>
      </section>
    );
  }

  if (variant !== "home") return null;

  const leadLines = toLines(props.headlineLead);
  const tail = props.headlineTail ?? "";
  const { before, marked, after } = splitOnHighlight(tail, props.headlineHighlight);
  const table = heroTable(props);

  return (
    <section
      ref={scope}
      id={props.id}
      data-component={props.component}
      data-variant="home"
      className={styles.hero}
    >
      <h1 className={styles.headline}>
        {leadLines.length ? (
          <span className={styles.lead} data-hero-part="lead">
            {/*
              Each authored line is its own element rather than a newline held
              together by white-space: pre-line. The break is then structural,
              so no stylesheet can collapse it, and no HTML is injected.
            */}
            {leadLines.map((line) => (
              <span key={line} className={styles.leadLine}>
                {line}
              </span>
            ))}
          </span>
        ) : null}

        <span className={styles.tail} data-hero-part="tail">
          {before}
          {marked ? (
            <span className={styles.highlight}>
              <span className={styles.highlightBox} data-hero-part="box" aria-hidden />
              <span className={styles.highlightText}>{marked}</span>
            </span>
          ) : null}
          {after}
        </span>
      </h1>

      {props.paragraph ? (
        <p className={styles.paragraph} data-hero-part="paragraph">
          {props.paragraph}
        </p>
      ) : null}

      {table ? (
        <div className={styles.nowline} data-hero-part="table">
          <Table {...table} />
        </div>
      ) : null}
    </section>
  );
}
