"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SectionHeader from "@/components/UI/SectionHeader/SectionHeader";
import Prose from "@/components/UI/Prose/Prose";
import AutoplayVideo from "@/components/UI/AutoplayVideo/AutoplayVideo";
import { isSvg, isVideo, mediaUrl, selectValue } from "@/lib/acf";
import type { SectionProps } from "@/lib/fragments/sections";
import type { CalloutListFields } from "@/lib/fragments/caseSections";
import styles from "./calloutList.module.scss";

gsap.registerPlugin(ScrollTrigger);

/** Cards are objects rather than prose, so they carry a little more travel. */
const RISE = 18;
const FADE = 0.5;
const STAGGER = 0.1;

/** CalloutList. Two to four cards side by side, each an argument in miniature. */

type CalloutListProps = CalloutListFields & SectionProps;

export default function CalloutList(props: CalloutListProps) {
  const scope = useRef<HTMLElement>(null);
  const cards = (props.cards ?? []).filter((card) => card.cardTitle || card.cardBody);
  /**
   * The header arrives, then the cards follow it up on a stagger.
   *
   * Parts are found by their own module classes: SectionHeader is a shared
   * primitive that takes no data hook, and the section carries the one hook CSS
   * needs. See TextSection, which does the same thing for the same reason.
   */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const root = scope.current;
        if (!root) return;

        const head = root.querySelector<HTMLElement>(`.${styles.header}`);
        const items = Array.from(root.querySelectorAll<HTMLElement>(`.${styles.card}`));
        if (!head && !items.length) return;

        gsap.set(root, { autoAlpha: 1 });

        const timeline = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: { trigger: root, start: "top 85%", once: true },
        });

        if (head) {
          timeline.fromTo(head, { autoAlpha: 0, y: RISE }, { autoAlpha: 1, y: 0, duration: FADE });
        }

        if (items.length) {
          timeline.fromTo(
            items,
            { autoAlpha: 0, y: RISE },
            { autoAlpha: 1, y: 0, duration: FADE, stagger: STAGGER },
            `-=${FADE * 0.5}`,
          );
        }
      });

      return () => mm.revert();
    },
    { scope },
  );

  if (!cards.length) return null;

  // One card per column up to a row of four; past that the grid wraps onto
  // further rows of the same width.
  const columns = selectValue(props.columns) ?? String(Math.min(cards.length, 4));


  return (
    <section
      ref={scope}
      id={props.id}
      data-component={props.component}
      data-enter-block
      className={styles.section}
    >
      <SectionHeader
        kicker={props.kicker}
        heading={props.heading}
        intro={props.intro}
        className={styles.header}
      />

      <ul className={styles.cards} data-columns={columns}>
        {cards.map((card) => {
          const node = card.cardMedia?.node;
          const src = mediaUrl(node);

          // An SVG is an icon, not artwork. The frame reads that off the media
          // itself rather than off a separate editor toggle, so a card cannot
          // be set to "icon" while holding a screenshot.
          const icon = isSvg(node);

          return (
            <li key={card.cardTitle ?? card.cardBody} className={styles.card}>
              {/* Media heights are equalised by the frame, not by the images,
                  so a row stays level whatever is dropped into it. */}
              {src ? (
                <span className={styles.frame} data-icon={icon ? "true" : "false"}>
                  {isVideo(node) ? (
                    <AutoplayVideo className={styles.media} src={src} />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element -- fixed
                       ratio frame sized by CSS. */
                    <img
                      className={styles.media}
                      src={src}
                      alt={node?.altText ?? ""}
                      loading="lazy"
                    />
                  )}
                </span>
              ) : null}

              {card.cardTitle ? <h3 className={styles.cardTitle}>{card.cardTitle}</h3> : null}

              <Prose value={card.cardBody} className={styles.cardBody} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
