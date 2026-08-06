"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { QuestionCtaFields } from "@/lib/fragments/questionCta";
import styles from "./questionCta.module.scss";
import type { SectionProps } from "@/lib/fragments/sections";

gsap.registerPlugin(ScrollTrigger);

/**
 * QuestionCTA. One to three stickies, each wholly clickable.
 *
 * The rotations, tape and corner peel are all CSS, and the whole sticky is a
 * single link rather than a card with a link inside it, so there is one tab
 * stop and one hit area per note. The only JavaScript is the entrance.
 */

type QuestionCTAProps = QuestionCtaFields & SectionProps;

/** The entrance, tuned as a set. Three notes, so the run stays short. */
const NOTE_RISE = 28;
const NOTE_FADE = 0.55;
const NOTE_STAGGER = 0.1;

/**
 * Opposing rotations with the middle straightest, as specified. Indexed rather
 * than random so the layout is identical on server and client, and stable
 * between builds.
 */
const ROTATIONS = ["left", "center", "right"] as const;

export default function QuestionCTA(props: QuestionCTAProps) {
  const scope = useRef<HTMLElement>(null);
  const notes = (props.notes ?? []).filter((note) => note.question);

  /**
   * Each note rises into place, one after another.
   *
   * The LI is animated, never the sticky inside it. The sticky carries
   * `transform: rotate(var(--lean))` and takes a second transform on hover, and
   * an inline transform from GSAP outranks a stylesheet rule -- so animating it
   * directly would freeze the lean at whatever GSAP last wrote and kill the
   * hover lift with it. The li has no transform of its own, so there is nothing
   * to collide with.
   *
   * fromTo rather than from, because the pre-animation state in
   * styles/base/_globals.scss has already set these to opacity 0 and `from`
   * would read that as the destination.
   */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const root = scope.current;
        if (!root) return;

        const items = Array.from(root.querySelectorAll<HTMLElement>("[data-note]"));
        if (!items.length) return;

        gsap.fromTo(
          items,
          { y: NOTE_RISE, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: NOTE_FADE,
            stagger: NOTE_STAGGER,
            ease: "power2.out",
            scrollTrigger: { trigger: root, start: "top 85%", once: true },
          },
        );
      });

      return () => mm.revert();
    },
    { scope, dependencies: [notes.length] },
  );

  if (!notes.length) return null;

  return (
    <section
      ref={scope}
      id={props.id}
      data-component={props.component}
      className={styles.section}
    >
      <ul className={styles.notes} data-count={notes.length}>
        {notes.map((note, index) => {
          const href = note.linkUrl ?? "#";
          const isInternal = href.startsWith("/");
          const lean = ROTATIONS[index % ROTATIONS.length];

          const body = (
            <>
              <span className={styles.tape} aria-hidden />
              <span className={styles.question}>{note.question}</span>

              <span className={styles.action}>
                <span className={styles.actionLabel}>{note.linkLabel}</span>
                <svg className={styles.arrow} viewBox="0 0 24 24" aria-hidden focusable="false">
                  <path
                    d="M4 12h15M13 6l6 6-6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>

              <span className={styles.attribution} aria-hidden>
                Kelly Warpechowski
              </span>
            </>
          );

          return (
            <li key={note.question} className={styles.note} data-lean={lean} data-note>
              {isInternal ? (
                <Link href={href} className={styles.sticky}>
                  {body}
                </Link>
              ) : (
                <a href={href} className={styles.sticky} target="_blank" rel="noreferrer">
                  {body}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
