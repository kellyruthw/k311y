"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { toLines } from "@/lib/acf";
import type { SplitStatementFields } from "@/lib/fragments/splitStatement";
import type { SectionProps } from "@/lib/fragments/sections";
import styles from "./splitStatement.module.scss";

gsap.registerPlugin(ScrollTrigger);

/**
 * SplitStatement.
 *
 * Lines arrive from alternating sides on scrub and settle centred.
 *
 * Desktop only, and reduced motion turns it off there too. The docstring here
 * used to claim mobile was already static, but nothing implemented that: the
 * media query below tested reduced motion alone, so a phone got the full scrub.
 * The move needs width to be worth making -- the halves come in from opposite
 * sides of a page, and in one column there are no sides to come in from, only
 * a line of type sliding about under the reader's thumb.
 *
 * Below the breakpoint the statement simply renders where it lands, which is
 * the same finished state reduced motion has always fallen back to.
 *
 * Works for any number of authored lines. It previously required exactly two
 * and silently did nothing on a one-line quote, which is most of them.
 */

type SplitStatementProps = SplitStatementFields & SectionProps;

interface Segment {
  text: string;
  highlighted: boolean;
}

/**
 * Split a line into plain and highlighted runs.
 *
 * Phrases are authored as text that must appear in the quote, so a phrase that
 * does not match simply highlights nothing rather than throwing. Matching is
 * longest-first so a phrase contained inside another cannot claim it.
 */
function segment(line: string, phrases: string[]): Segment[] {
  const present = phrases
    .filter((phrase) => phrase && line.includes(phrase))
    .sort((a, b) => b.length - a.length);

  if (!present.length) return [{ text: line, highlighted: false }];

  let segments: Segment[] = [{ text: line, highlighted: false }];

  for (const phrase of present) {
    segments = segments.flatMap((part) => {
      if (part.highlighted || !part.text.includes(phrase)) return part;

      return part.text
        .split(phrase)
        .flatMap((chunk, index) =>
          index === 0
            ? [{ text: chunk, highlighted: false }]
            : [{ text: phrase, highlighted: true }, { text: chunk, highlighted: false }],
        );
    });
  }

  return segments.filter((part) => part.text.length > 0);
}

export default function SplitStatement(props: SplitStatementProps) {
  const scope = useRef<HTMLElement>(null);
  const lines = toLines(props.quote);
  const phrases = (props.highlightPhrases ?? [])
    .map((entry) => entry.phrase?.trim() ?? "")
    .filter(Boolean);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // 1025px is one past the `tablet` breakpoint the stylesheets collapse at,
      // written the same way Timeline states its own. matchMedia takes a literal
      // string, so this cannot read $breakpoints -- if that map moves, this
      // moves with it.
      mm.add("(min-width: 1025px) and (prefers-reduced-motion: no-preference)", () => {
        const root = scope.current;
        if (!root) return;

        const quote = root.querySelector("[data-statement-part='quote']");
        const parts = Array.from(root.querySelectorAll<HTMLElement>("[data-statement-line]"));
        if (!quote || !parts.length) return;

        const timeline = gsap.timeline({
          scrollTrigger: {
            // The quote, not the section: the section's top is its padding edge,
            // so triggering there spends the scrub on text still below the fold.
            trigger: quote,
            start: "top bottom",
            end: "top center",
            scrub: 0.6,
          },
        });

        // Alternating sides. A single line still travels, which is the common
        // case -- most statements are one sentence.
        parts.forEach((part, index) => {
          timeline.from(
            part,
            { xPercent: index % 2 === 0 ? -40 : 40, autoAlpha: 0, ease: "none" },
            0,
          );
        });
      });

      return () => mm.revert();
    },
    { scope, dependencies: [lines.length] },
  );

  if (!lines.length) return null;

  return (
    <section
      ref={scope}
      id={props.id}
      data-component={props.component}
      className={styles.section}
    >
      <blockquote className={styles.quote} data-statement-part="quote">
        {lines.map((line, index) => (
          // The animated element is the wrapper, not the text: transforms have
          // no effect on an inline box.
          <span key={line} className={styles.line} data-statement-line={index}>
            {segment(line, phrases).map((piece, pieceIndex) =>
              piece.highlighted ? (
                <span key={pieceIndex} className={styles.highlight}>
                  <span className={styles.highlightBox} aria-hidden />
                  <span className={styles.highlightText}>{piece.text}</span>
                </span>
              ) : (
                <span key={pieceIndex}>{piece.text}</span>
              ),
            )}
          </span>
        ))}
      </blockquote>
    </section>
  );
}
