"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SectionHeader from "@/components/UI/SectionHeader/SectionHeader";
import Prose from "@/components/UI/Prose/Prose";
import type { SectionProps } from "@/lib/fragments/sections";
import type { TextSectionFields } from "@/lib/fragments/caseSections";
import styles from "./textSection.module.scss";

gsap.registerPlugin(ScrollTrigger);

/** Prose, so it moves less than a section made of objects does. */
const RISE = 14;
const FADE = 0.5;
const STAGGER = 0.1;

/** TextSection. Standalone prose, with an optional kicker and heading. */

type TextSectionProps = TextSectionFields & SectionProps;

export default function TextSection(props: TextSectionProps) {
  const scope = useRef<HTMLElement>(null);
  const paragraphs = (props.paragraphs ?? [])
    .map((entry) => entry.paragraphText)
    .filter((text): text is string => Boolean(text));

  /**
   * The header arrives, then the paragraphs follow it up.
   *
   * Parts are found by their own module classes. SectionHeader and Prose are
   * shared primitives that take no data hook, and giving them one so this
   * component could animate would change four other callers to serve this one.
   */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const root = scope.current;
        if (!root) return;

        const head = root.querySelector<HTMLElement>(`.${styles.header}`);
        const items = Array.from(root.querySelectorAll<HTMLElement>(`.${styles.paragraph}`));
        if (!head && !items.length) return;

        // The section itself is what CSS holds back; the parts take their start
        // state from the timeline below, which renders it as soon as it is
        // built. One hook on the block instead of one per part, so neither
        // SectionHeader nor Prose has to grow a prop to be animated -- and the
        // paragraphs keep their place as direct flex children of .body, where
        // the column gap that spaces them actually applies.
        gsap.set(root, { autoAlpha: 1 });

        const timeline = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: { trigger: root, start: "top 85%", once: true },
        });

        if (head) {
          timeline.fromTo(
            head,
            { autoAlpha: 0, y: RISE },
            { autoAlpha: 1, y: 0, duration: FADE },
          );
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

  if (!paragraphs.length) return null;

  return (
    <section
      ref={scope}
      id={props.id}
      data-component={props.component}
      data-enter-block
      className={styles.section}
    >
      <SectionHeader kicker={props.kicker} heading={props.heading} className={styles.header} />

      <div className={styles.body}>
        {paragraphs.map((text) => (
          <Prose key={text} value={text} className={styles.paragraph} />
        ))}
      </div>
    </section>
  );
}
