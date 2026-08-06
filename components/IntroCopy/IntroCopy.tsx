"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { toLines } from "@/lib/acf";
import type { SectionProps } from "@/lib/fragments/sections";
import type { IntroCopyFields } from "@/lib/fragments/caseSections";
import styles from "./introCopy.module.scss";

gsap.registerPlugin(ScrollTrigger);

/**
 * The reveal, tuned against each other rather than separately: `WORD_FADE`
 * against `WORD_STAGGER` is how many words are mid-fade at once, and that ratio
 * is what makes it read as a wave passing through the text rather than words
 * flicking on one at a time.
 *
 * Both are relative, not absolute. The tween is scrubbed, so these set the
 * SHAPE of the sequence and the scroll distance sets its speed.
 */
const WORD_FADE = 0.3;
const WORD_STAGGER = 0.1;

/**
 * IntroCopy. The overview treatment: a kicker, prose, and one phrase lifted
 * into the yellow emphasis tier.
 *
 * The emphasis is a phrase found *inside* the prose, not a line appended after
 * it -- on Ascaya it is the opening sentence of the second paragraph. It is
 * matched rather than positioned, so it can sit anywhere, and a phrase that
 * does not appear simply highlights nothing.
 *
 * The kicker has no fallback. Left empty, nothing renders.
 */

type IntroCopyProps = IntroCopyFields & SectionProps;

/**
 * Wrap each word so it can be lit on its own.
 *
 * Split on whitespace while KEEPING it -- the capture group in the pattern is
 * what puts the separators back in the array. Rendering the spaces as they were
 * means the line wraps exactly where it did before, so nothing about the
 * paragraph's shape depends on the animation existing.
 *
 * Only the words are wrapped. A span around each space would be a second thing
 * to fade and would let a line break inside it.
 */
function toWords(text: string, keyPrefix: string) {
  return text.split(/(\s+)/).map((chunk, index) =>
    /^\s+$/.test(chunk) || chunk === "" ? (
      chunk
    ) : (
      <span key={`${keyPrefix}-${index}`} data-word>
        {chunk}
      </span>
    ),
  );
}

/** Split a line around the emphasised phrase, if it appears in it. */
function emphasise(line: string, phrase: string | null) {
  if (!phrase) return [{ text: line, emphasised: false }];

  const at = line.indexOf(phrase);
  if (at === -1) return [{ text: line, emphasised: false }];

  return [
    { text: line.slice(0, at), emphasised: false },
    { text: phrase, emphasised: true },
    { text: line.slice(at + phrase.length), emphasised: false },
  ].filter((part) => part.text.length > 0);
}

export default function IntroCopy(props: IntroCopyProps) {
  const scope = useRef<HTMLElement>(null);
  const paragraphs = (props.paragraphs ?? [])
    .map((entry) => entry.paragraphText)
    .filter((text): text is string => Boolean(text));

  /**
   * The words light as the section is read toward.
   *
   * Scrubbed, so the wave is tied to the scroll rather than played once: it
   * runs backwards if you scroll back up, which is the behaviour that makes it
   * feel like reading rather than like something that happened at you.
   *
   * The range ends at `center center` -- the section's own centre meeting the
   * viewport's -- so the last word lights exactly as the paragraph comes to
   * rest in the middle of the screen, with none of it left to do once you are
   * looking straight at it.
   *
   * `center center` rather than an offset from the top, and the difference is
   * not cosmetic: a `top` measurement ends at the same scroll position however
   * long the paragraph is, so a short intro would finish while most of the
   * screen was still empty and a long one would finish with its last lines
   * still below the fold. Measuring from the centre scales the range with the
   * paragraph, so every intro completes at the same point in ITS OWN arrival.
   *
   * 0.3 is the resting opacity, not zero. Unlit text is still text: it can be
   * read ahead of the wave, and if this animation never runs the paragraph is
   * dim rather than absent. That is a deliberately gentler failure than the
   * hidden-until-revealed sections elsewhere on the site.
   */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const root = scope.current;
        if (!root) return;

        const words = Array.from(root.querySelectorAll<HTMLElement>("[data-word]"));
        if (!words.length) return;

        gsap.fromTo(
          words,
          { opacity: 0.3 },
          {
            opacity: 1,
            duration: WORD_FADE,
            stagger: WORD_STAGGER,
            // As every scrubbed tween here: an ease against scroll position
            // reads as lag, not as easing.
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top bottom",
              end: "center center",
              scrub: 0.6,
            },
          },
        );
      });

      return () => mm.revert();
    },
    { scope, dependencies: [paragraphs.length] },
  );

  if (!paragraphs.length) return null;

  const phrase = props.emphasisLine?.trim() || null;


  return (
    <section
      ref={scope}
      id={props.id}
      data-component={props.component}
      className={styles.section}
    >
      {props.kicker ? <p className={styles.kicker}>{props.kicker}</p> : null}

      <div className={styles.body}>
        {/* One paragraph per authored line, with the emphasis matched inside it. */}
        {paragraphs.flatMap((text) =>
          toLines(text).map((line) => (
            <p key={line} className={styles.paragraph}>
              {emphasise(line, phrase).map((part, index) =>
                part.emphasised ? (
                  <span key={index} className={styles.emphasis}>
                    {toWords(part.text, `e${index}`)}
                  </span>
                ) : (
                  <span key={index}>{toWords(part.text, `p${index}`)}</span>
                ),
              )}
            </p>
          )),
        )}
      </div>
    </section>
  );
}
