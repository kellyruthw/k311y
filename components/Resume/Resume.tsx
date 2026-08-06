import { Fragment } from "react";
import type { ResumeContent } from "@/lib/resume/types";
import styles from "./resume.module.scss";

/**
 * The resume, rendered from a content file.
 *
 * A server component with no hooks, no GSAP and no client boundary. Every other
 * component on this site animates; this one deliberately does not, and the
 * handoff says so outright -- reduced-motion is moot because there is no motion,
 * and dark mode is moot because print is white.
 *
 * THE DOM ORDER IS THE READING ORDER. That is the whole point of building this
 * in HTML rather than exporting it from Figma: a browser prints semantic markup
 * in document order, so the PDF's text layer comes out ordered and selectable
 * instead of as a bag of positioned runs. Nothing in here may reorder content
 * visually in a way that diverges from the source -- no grid-row tricks, no
 * flex `order`, no absolute positioning of anything that carries meaning.
 *
 * It renders the <main> itself rather than being placed inside one by the page.
 * Two things have to travel together and only one of them is styling: the sheet
 * class, and the `data-doc="resume"` attribute that styles/base/_globals.scss
 * keys the dark-canvas opt-out off. Split across the page and the component, a
 * second route could mount the resume and get the dot grid behind it.
 */
export default function Resume({ content }: { content: ResumeContent }) {
  return (
    <main className={styles.sheet} data-doc="resume">
      <header className={styles.masthead}>
        <h1 className={styles.name}>{content.name}</h1>
        <p className={styles.title}>{content.title}</p>

        {/*
          The separators are real text nodes, not a ::before.
          Generated content lands in the PDF's text layer exactly as authored
          content does, so a decorative pseudo-element is indistinguishable from
          a typo once it has been printed. U+00B7 also sits inside the latin
          subset's unicode-range, so it comes off the same font file as the rest
          of the line rather than pulling latin-ext for one glyph.
        */}
        <p className={styles.contact}>
          {content.contact.map((item, index) => (
            <Fragment key={item.label}>
              {index > 0 ? " · " : null}
              {item.href ? (
                <a className={styles.link} href={item.href}>
                  {item.label}
                </a>
              ) : (
                item.label
              )}
            </Fragment>
          ))}
        </p>
      </header>

      <p className={styles.summary}>{content.summary}</p>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Experience</h2>

        {content.experience.map((role) => (
          <article key={`${role.company}-${role.dates}`} className={styles.entry}>
            {/*
              The header, the bullets and the clients line are siblings INSIDE
              this article, and that nesting is the requirement rather than a
              tidiness preference: `break-inside: avoid` applies to the element
              it is set on, so the fragmentation unit has to be the element that
              wraps the entire job. A job is never split across a page -- title,
              company line, every bullet and the clients line move to the next
              page together or not at all.
            */}
            <header className={styles.entryHeader}>
              <h3 className={styles.entryTitle}>{role.title}</h3>
              <p className={styles.entryMeta}>
                {role.company} · {role.location} · {role.dates}
              </p>
            </header>

            <ul className={styles.bullets}>
              {role.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>

            {role.clientsLine ? (
              <p className={styles.clients}>{role.clientsLine}</p>
            ) : null}
          </article>
        ))}
      </section>

      {/*
        Projects is per-variant: the cuts aimed at engineering organisations
        carry it, the base resume does not. Rendered between Experience and
        Skills, which is where the source documents put it.
      */}
      {content.projects?.length ? (
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Projects</h2>
          <ul className={styles.bullets}>
            {content.projects.map((project) => (
              <li key={project}>{project}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Skills</h2>

        {/*
          A <dl> because that is what a label/values pair is, and because dt
          then dd IS the reading order once a parser linearises the two columns.
          The items are joined into one text node for the same reason: one
          continuous run in the PDF rather than six fragments to reassemble.
        */}
        <dl className={styles.skills}>
          {content.skills.map((group) => (
            <Fragment key={group.label}>
              <dt className={styles.skillLabel}>{group.label}</dt>
              <dd className={styles.skillItems}>{group.items.join(", ")}</dd>
            </Fragment>
          ))}
        </dl>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Education</h2>
        {content.education.map((entry) => (
          <p key={entry.credential} className={styles.education}>
            {entry.credential}, {entry.school}
          </p>
        ))}
      </section>
    </main>
  );
}
