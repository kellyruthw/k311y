import { toLines } from "@/lib/acf";
import Prose from "@/components/UI/Prose/Prose";
import styles from "./sectionHeader.module.scss";

/**
 * The optional header trio: kicker, heading, intro.
 *
 * Shared so that "where does the break fall" is answered identically in every
 * component. Each authored line becomes its own element rather than relying on
 * white-space, so no stylesheet can collapse a break the editor typed.
 *
 * Renders nothing at all when nothing is authored, which is what lets every
 * field stay genuinely optional.
 */

export interface SectionHeaderProps {
  kicker?: string | null;
  heading?: string | null;
  intro?: string | null;
  className?: string;
  /** Heading level. Case pages use h2 under the hero's h1. */
  as?: "h2" | "h3";
}

function Lines({ value, className }: { value: string; className: string }) {
  const lines = toLines(value);

  return (
    <>
      {lines.map((line) => (
        <span key={line} className={className}>
          {line}
        </span>
      ))}
    </>
  );
}

export default function SectionHeader({
  kicker,
  heading,
  intro,
  className,
  as: Heading = "h2",
}: SectionHeaderProps) {
  if (!kicker && !heading && !intro) return null;

  return (
    <header
      className={[styles.header, className].filter(Boolean).join(" ")}
      // Sections tighten the gap beneath a header that has no heading: a kicker
      // sitting straight on top of copy needs less room than a kicker, a
      // heading and then copy.
      data-heading={heading ? "true" : "false"}
    >
      {kicker ? <p className={styles.kicker}>{kicker}</p> : null}

      {heading ? (
        <Heading className={styles.heading}>
          <Lines value={heading} className={styles.headingLine} />
        </Heading>
      ) : null}

      {/* Prose, so each authored line is its own paragraph. */}
      <Prose value={intro} className={styles.intro} />
    </header>
  );
}
