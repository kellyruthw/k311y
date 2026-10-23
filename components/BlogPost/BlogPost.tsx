import Link from "next/link";
import RichText from "@/components/UI/RichText/RichText";
import { formatEntryDate, type BlogPost as BlogPostData } from "@/lib/queries/blog";
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

export default function BlogPost({
  post,
  next,
}: {
  post: BlogPostData;
  /** The entry written after this one. Absent on the newest post, and the
      "Next entry" block simply does not render until one exists. */
  next?: { href: string; label: string };
}) {
  return (
    // The article itself carries no data-component: the scroll-spy's midpoint
    // test takes the first match in DOM order, and a wrapper spanning the whole
    // page would win at every scroll position. Its three parts are the tree's
    // nodes instead.
    <article className={styles.post}>
      <header className={styles.hero} data-component="PostHero" id="post-hero">
        <p className={styles.backRow}>
          <Link href="/changeblog" className={styles.backlink}>
            Back to Changeblog
          </Link>
        </p>

        <h1 className={styles.title}>{post.title}</h1>

        <div className={styles.meta}>
          <time dateTime={post.date}>{formatEntryDate(post.date)}</time>
          <span className={styles.readTime}>{post.readingTimeMinutes} min read</span>
        </div>
      </header>

      <div className={styles.body}>
        <section className={styles.content} data-component="PostContent" id="post-content">
          <RichText value={post.content} className={styles.prose} />
        </section>

        {next ? (
          <footer className={styles.endRail} data-component="Pagination" id="pagination">
            <span className={styles.endLabel}>Next entry</span>
            <Link href={next.href} className={styles.endLink}>
              {next.label}
            </Link>
          </footer>
        ) : null}
      </div>
    </article>
  );
}
