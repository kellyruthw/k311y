import Link from "next/link";
import RichText from "@/components/UI/RichText/RichText";
import { entryNumber, type BlogPost as BlogPostData } from "@/lib/queries/blog";
import styles from "./blogPost.module.scss";

/**
 * A Revival entry, opened.
 *
 * The hero -- back link, frame label, title, meta -- runs the full canvas
 * width: the title token earns its size from the room around it. Only the
 * reading body takes a measure (125ch, centered), because prose is read a line
 * at a time and a headline is not.
 *
 * The body is Gutenberg HTML through RichText, which parses to real elements
 * and drops the tags that could ever do more than display. Type inside it
 * comes from descendant rules in the module, every one a shipped mixin.
 *
 * The draft chip appears only when the loader could see a draft at all, which
 * only happens locally; see lib/queries/blog.ts.
 */

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

export default function BlogPost({
  post,
  nextHref,
  nextLabel,
}: {
  post: BlogPostData;
  /** Where "Next entry" points: the next post, or back to the changelog. */
  nextHref: string;
  nextLabel: string;
}) {
  const number = entryNumber(post.number);

  return (
    <article className={styles.post} data-component="BlogPost" id={`revival-${number}`}>
      <header className={styles.hero}>
        <p className={styles.backRow}>
          <Link href="/blog" className={styles.backlink}>
            &larr; Revival
          </Link>
        </p>

        <p className={styles.frameLabel}>
          revival / {number}
          {post.isDraft ? <span className={styles.chipDraft}>Draft</span> : null}
        </p>

        <h1 className={styles.title}>{post.title}</h1>

        <div className={styles.meta}>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span>{post.readingTimeMinutes} min read</span>
        </div>
      </header>

      <div className={styles.body}>
        <RichText value={post.content} className={styles.prose} />

        <footer className={styles.endRail}>
          <span className={styles.endLabel}>Next entry</span>
          <Link href={nextHref} className={styles.endLink}>
            {nextLabel}
          </Link>
        </footer>
      </div>
    </article>
  );
}
