import Link from "next/link";
import { entryNumber, type BlogEntry } from "@/lib/queries/blog";
import styles from "./blogRail.module.scss";

/**
 * The changelog rail: every post is a numbered entry hung off a left rule, the
 * way the sidebar tree hangs its component pills off a branch. Each entry is a
 * frame on the canvas -- black fill, named in mono above its top-left corner
 * the way Figma names a frame -- and the rail grows downward as entries ship.
 *
 * A draft entry wears a dashed chip beside its frame label: the same "not yet
 * placed" voice a dashed border speaks elsewhere on the canvas. Drafts only
 * reach this component locally (see lib/queries/blog.ts), so production never
 * renders the chip at all.
 *
 * A post with a featured image carries it in the frame's left column; without
 * one, the text spans the whole frame. The media never dictates the layout of
 * its neighbours -- each entry decides alone.
 */

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

export default function BlogRail({ entries }: { entries: BlogEntry[] }) {
  if (!entries.length) return null;

  const latest = entryNumber(Math.max(...entries.map((entry) => entry.number)));

  return (
    <section className={styles.section} data-component="BlogRail" id="blog-rail">
      <ol className={styles.rail}>
        {entries.map((entry) => (
          <li key={entry.databaseId} className={styles.entry}>
            <p className={styles.frameLabel}>
              revival / {entryNumber(entry.number)}
              {entry.isDraft ? <span className={styles.chipDraft}>Draft</span> : null}
            </p>

            <Link
              href={entry.href}
              className={entry.image ? `${styles.frame} ${styles.frameMedia}` : styles.frame}
            >
              {entry.image ? (
                /* eslint-disable-next-line @next/next/no-img-element -- sized by
                   the grid column it sits in; next/image adds nothing here. */
                <img
                  className={styles.cardMedia}
                  src={entry.image.url}
                  alt={entry.image.alt}
                  loading="lazy"
                />
              ) : null}

              <div className={styles.body}>
                <div className={styles.meta}>
                  <time dateTime={entry.date}>{formatDate(entry.date)}</time>
                  <span>{entry.readingTimeMinutes} min read</span>
                </div>

                <h2 className={styles.title}>{entry.title}</h2>

                {entry.excerpt ? <p className={styles.excerpt}>{entry.excerpt}</p> : null}

                <span className={styles.read}>Open {entryNumber(entry.number)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ol>

      <p className={styles.railEnd}>
        {`// ${latest} of ${latest} — the changelog grows downward as entries ship`}
      </p>
    </section>
  );
}
