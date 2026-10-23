import Link from "next/link";
import Tab from "@/components/UI/Tab/Tab";
import { entryNumber, formatEntryDate, getBlogEntries } from "@/lib/queries/blog";
import type { ChangeblogTeaserFields } from "@/lib/fragments/changeblogTeaser";
import type { SectionProps } from "@/lib/fragments/sections";
import styles from "./changeblogTeaser.module.scss";

/**
 * The homepage's "Latest entry" strip: the shared Tab carrying the live entry
 * count, one frame with the newest post's title, date and read time, and a
 * link into the changelog. A heartbeat, not a reading list -- it always shows
 * exactly one post, so one entry never looks like an empty shelf and fifty
 * never grow the homepage.
 *
 * A server component that fetches its own data: the section's placement is
 * authored in WordPress, but WHAT it shows is always the newest entry, so
 * there is nothing to configure beyond the small label line. With no entries
 * at all it renders nothing, heading included, the same rule the optional
 * resume sections follow.
 */

type ChangeblogTeaserProps = ChangeblogTeaserFields & SectionProps;

export default async function ChangeblogTeaser(props: ChangeblogTeaserProps) {
  const entries = await getBlogEntries();
  const latest = entries[0];
  if (!latest) return null;

  return (
    <section id={props.id} data-component={props.component} className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.tabRow}>
          <Tab count={latest.isDraft ? "Draft" : undefined}>
            Changeblog / {entryNumber(latest.number)}
          </Tab>
        </div>

        <Link href={latest.href} className={styles.frame}>
          <div className={styles.copy}>
            <div className={styles.meta}>
              <span>{props.label?.trim() || "Latest entry"}</span>
              <time dateTime={latest.date}>{formatEntryDate(latest.date)}</time>
              <span className={styles.readTime}>{latest.readingTimeMinutes} min read</span>
            </div>

            <h2 className={styles.title}>{latest.title}</h2>
          </div>

          <span className={styles.open}>Read article &rarr;</span>
        </Link>
      </div>
    </section>
  );
}
