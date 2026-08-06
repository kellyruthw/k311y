"use client";

import SectionHeader from "@/components/UI/SectionHeader/SectionHeader";
import Prose from "@/components/UI/Prose/Prose";
import AutoplayVideo from "@/components/UI/AutoplayVideo/AutoplayVideo";
import Tab from "@/components/UI/Tab/Tab";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { isVideo, mediaUrl } from "@/lib/acf";
import { useActiveItem } from "./useActiveItem";
import type { SectionProps } from "@/lib/fragments/sections";
import type { LargeListFields } from "@/lib/fragments/caseSections";
import styles from "./largeList.module.scss";

gsap.registerPlugin(ScrollTrigger);

/** The entrance. The head leads, the rows follow it up. */
const HEAD_FADE = 0.55;
const ROW_FADE = 0.5;
const ROW_STAGGER = 0.09;

/**
 * LargeList. Bordered rows with oversized zero-padded numerals.
 *
 * The numerals come from position, not from the content, so reordering rows
 * renumbers them and there is no way to end up with two 02s.
 *
 * Three arrangements, all out of the same markup:
 *
 *   default   the list is the section, running the full 8 columns
 *   media     the artwork takes 1-4 and the list moves to 5-8
 *   pinned    the copy takes 1-2 and holds still while the list runs 4-8,
 *             marking whichever item is at the reading line
 *
 * A client component only for the last of those. Everything renders on the
 * server in its finished state and the spy only adds which row is current, so
 * with JS off the list is complete and simply never highlights.
 */

type LargeListProps = LargeListFields & SectionProps;

type ItemMediaNode = NonNullable<NonNullable<LargeListFields["items"]>[number]["itemMedia"]>["node"];

/** A step's own artifact. Renders nothing when the step has none, which is most. */
function ItemArtifact({ node }: { node: ItemMediaNode | undefined }) {
  const src = mediaUrl(node);
  if (!src) return null;

  return (
    <div className={styles.itemMediaFrame}>
      {isVideo(node) ? (
        <AutoplayVideo className={styles.itemMedia} src={src} />
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element -- the frame is
           sized by the row, not by a fixed ratio. */
        <img className={styles.itemMedia} src={src} alt={node?.altText ?? ""} loading="lazy" />
      )}
    </div>
  );
}

export default function LargeList(props: LargeListProps) {
  const items = (props.items ?? []).filter((item) => item.itemTitle || item.itemText);

  const pinned = Boolean(props.pinned);
  const inPanel = Boolean(props.inPanel);

  // Before the early return, which is the rule for hooks. Passing 0 when the
  // section is not pinned is what keeps the listeners off every other list on
  // the site -- the hook binds nothing at a count of 0.
  const { ref, active } = useActiveItem<HTMLOListElement>(pinned ? items.length : 0);
  const scope = useRef<HTMLElement>(null);

  /**
   * The section arrives: the head fades up, then the rows follow on a stagger.
   *
   * One branch, always revealing both, whatever arrangement the section is in.
   * Deliberately not the two-path shape WorkCardGrid needs -- a path that
   * reveals only some of what CSS is holding back is how a section ends up
   * permanently invisible, which is exactly what happened there.
   *
   * `clearProps: "transform"` on the head, and it matters only in the pinned
   * arrangement: that column contains a `position: sticky` child, and leaving a
   * no-op `translate(0, 0)` on its ancestor makes that ancestor a containing
   * block for no reason. Clearing the transform and not the opacity leaves the
   * reveal in place while putting the layout back exactly as CSS had it.
   *
   * The rows use `data-list-item`, the hook the scroll-spy already reads. The
   * two never collide: this moves the row, the highlight moves the box and the
   * colour inside it.
   */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const root = scope.current;
        if (!root) return;

        const head = root.querySelector<HTMLElement>("[data-list-head]");
        const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-list-item]"));
        if (!head && !rows.length) return;

        const timeline = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: { trigger: root, start: "top 85%", once: true },
        });

        if (head) {
          timeline.fromTo(
            head,
            { autoAlpha: 0, y: 20 },
            { autoAlpha: 1, y: 0, duration: HEAD_FADE, clearProps: "transform" },
          );
        }

        if (rows.length) {
          timeline.fromTo(
            rows,
            { autoAlpha: 0, y: 20 },
            { autoAlpha: 1, y: 0, duration: ROW_FADE, stagger: ROW_STAGGER },
            `-=${HEAD_FADE * 0.5}`,
          );
        }
      });

      return () => mm.revert();
    },
    { scope, dependencies: [items.length] },
  );

  if (!items.length) return null;

  // `pinned` wins. Both it and `media` claim the left of the grid, and ACF
  // hides the media field while pinning is on; this is the render-side half of
  // that rule, so a section authored before the field existed cannot arrive
  // with both set and lay itself out twice.
  const mediaNode = pinned ? null : props.media?.node;
  const mediaSrc = mediaUrl(mediaNode);

  // In a panel the kicker IS the tab, so it must not also print above the
  // heading. Everywhere else it is the header trio's first line as usual.
  const kicker = inPanel ? null : props.kicker;
  const tabLabel = inPanel ? props.kicker?.trim() : null;

  /**
   * The header is wrapped rather than placed directly, and the wrapper is what
   * carries the grid placement.
   *
   * A sticky element is bounded by its CONTAINING BLOCK, and for a grid item
   * that is the whole section -- so pinned directly, the copy went on holding
   * through the section's padding after the list had ended. The wrapper is a
   * grid item in the same row as the list, so it stretches to exactly the
   * list's height, and the copy releases where the list does.
   */
  const header = (
    <div className={styles.headerColumn} data-list-head>
      <SectionHeader
        kicker={kicker}
        heading={props.heading}
        intro={props.intro}
        className={styles.header}
      />
    </div>
  );

  const media = mediaSrc ? (
    <div className={styles.mediaFrame}>
      {isVideo(mediaNode) ? (
        <AutoplayVideo className={styles.media} src={mediaSrc} />
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element -- the frame is
           sized by the grid column, not by a fixed ratio. */
        <img className={styles.media} src={mediaSrc} alt={mediaNode?.altText ?? ""} loading="lazy" />
      )}
    </div>
  ) : null;

  const list = (
    <ol
      ref={ref}
      className={styles.items}
      data-has-media={mediaSrc ? "true" : "false"}
      data-pinned={pinned ? "true" : "false"}
    >
      {items.map((item, index) => (
        <li
          key={item.itemTitle ?? item.itemText}
          className={styles.item}
          data-list-item
          // Only ever set while pinned, so an ordinary list carries no state
          // attribute at all and nothing in its stylesheet has to ignore one.
          data-active={pinned ? String(index === active) : undefined}
        >
          {/* Numbered by position, so reordering renumbers and there is no
              way to end up with two 02s. */}
          <span className={styles.numeral} aria-hidden>
            {`${String(index + 1).padStart(2, "0")}.`}
          </span>

          <div className={styles.itemBody}>
            {item.itemTitle ? (
              <h3 className={styles.itemTitle}>
                {/*
                  The hero's highlight, not a colour swap: a box that wipes in
                  behind the words, with the words themselves set in the canvas
                  colour so they are only readable once it has passed. Same
                  three elements PageHero and SplitStatement use, so there is
                  one highlight idiom on the site rather than two.

                  Rendered whatever the arrangement. The box is scaled to
                  nothing and the text inherits its colour until a row is
                  actually current, so an unpinned list is unaffected by it.
                */}
                <span className={styles.highlight}>
                  <span className={styles.highlightBox} aria-hidden />
                  <span className={styles.highlightText}>{item.itemTitle}</span>
                </span>
              </h3>
            ) : null}

            <Prose value={item.itemText} className={styles.itemText} />

            {/*
              The artifact for this step, under its own copy rather than beside
              the list. Aligned with the text and not the numeral, so a step
              with one reads as that step's evidence.
            */}
            <ItemArtifact node={item.itemMedia?.node} />
          </div>
        </li>
      ))}
    </ol>
  );

  const body = (
    <>
      {header}
      {/* Before the list in the DOM as well as on the grid, so the reading
          order and the visual order agree. */}
      {media}
      {list}
    </>
  );

  return (
    <section
      ref={scope}
      id={props.id}
      data-component={props.component}
      data-pinned={pinned ? "true" : "false"}
      className={styles.section}
    >
      {inPanel ? (
        <>
          {/*
            The tab draws the panel's top rule, so it sits outside the panel
            rather than in it -- the same arrangement Timeline uses. Rendered
            only with a label: ACF cannot make the kicker conditionally
            required, and a tab with nothing in it is worse than no tab.
          */}
          {tabLabel ? (
            <div className={styles.tabRow}>
              <Tab count={items.length}>{tabLabel}</Tab>
            </div>
          ) : null}

          <div className={styles.panel}>{body}</div>
        </>
      ) : (
        body
      )}
    </section>
  );
}
