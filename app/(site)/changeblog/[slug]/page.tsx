import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SidebarNav from "@/components/SidebarNav/SidebarNav";
import SiteFooter from "@/components/SiteFooter/SiteFooter";
import Tab from "@/components/UI/Tab/Tab";
import BlogPost from "@/components/BlogPost/BlogPost";
import { entryNumber, getBlogEntries, getBlogPost, getBlogSlugs } from "@/lib/queries/blog";
import { toMetadata } from "@/lib/seo";
import { getPrimaryMenu } from "@/lib/queries/nav";
import { getSiteFooter } from "@/lib/queries/footer";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import styles from "../../entryShell.module.scss";

/**
 * One Revival entry.
 *
 * The [slug] segment is normally the post's slug, but a draft has none until
 * it is published, so locally a draft is addressed by its databaseId instead
 * -- the rail links whichever the entry has. In production an unpublished key
 * resolves to nothing and 404s, because the loader has no credentials there.
 */

/** Published posts prerender; drafts resolve at request time, locally only. */
export async function generateStaticParams() {
  const slugs = await getBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  return toMetadata(post?.seo, { path: `/changeblog/${slug}`, fallbackTitle: post?.title });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [post, entries, links, footer] = await Promise.all([
    getBlogPost(slug),
    getBlogEntries(),
    getPrimaryMenu(),
    getSiteFooter(),
  ]);

  if (!post) notFound();

  // Every entry under the Blog menu item, the one being read flagged, the same
  // breadcrumb the project pages hang off their square.
  const navEntries = entries.map((entry) => ({
    label: entry.title,
    href: entry.href,
    current: entry.databaseId === post.databaseId,
  }));

  // "Next entry" is the next number up -- the one written after this. On the
  // newest post there is none, and the block hides until one is written.
  const nextEntry = entries.find((entry) => entry.number === post.number + 1);
  const next = nextEntry ? { href: nextEntry.href, label: nextEntry.title } : undefined;

  /**
   * BlogPosting schema. Description prefers Yoast's meta description -- the
   * authored one -- and falls back to the excerpt. The image is the featured
   * image when one is set; absent otherwise rather than invented.
   */
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    url: absoluteUrl(post.href),
    datePublished: post.date,
    dateModified: post.modified ?? post.date,
    description: post.seo?.metaDesc?.trim() || post.excerpt || undefined,
    image: post.image?.url,
    author: { "@type": "Person", name: "Kelly Warpechowski", url: SITE_URL },
    isPartOf: { "@type": "Blog", name: "Changeblog", url: `${SITE_URL}/changeblog` },
  };

  return (
    <>
      <SidebarNav
        links={links}
        nodes={[]}
        currentHref="/changeblog/"
        entries={navEntries}
        wordmarkSrc="/logo-kelly-warpechowski.svg"
      />

      <main className={styles.shell}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />

        {/* The entry shell both detail post types wear: the tab labels the
            panel it sits on. A local draft is flagged in the tab's own chip. */}
        <div className={styles.tabRow}>
          <Tab count={post.isDraft ? "Draft" : undefined}>
            {post.category} / {entryNumber(post.number)}
          </Tab>
        </div>

        <div className={styles.panel}>
          <BlogPost post={post} next={next} />
        </div>
      </main>

      <SiteFooter {...footer} />
    </>
  );
}
