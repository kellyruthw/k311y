import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Renderer from "@/components/Renderer/Renderer";
import SidebarNav from "@/components/SidebarNav/SidebarNav";
import SiteFooter from "@/components/SiteFooter/SiteFooter";
import BlogRail from "@/components/BlogRail/BlogRail";
import { getPage } from "@/lib/queries/page";
import { getBlogEntries } from "@/lib/queries/blog";
import { toMetadata } from "@/lib/seo";
import { getPrimaryMenu } from "@/lib/queries/nav";
import { getSiteFooter } from "@/lib/queries/footer";
import { buildNavTree } from "@/lib/navTree";
import { SITE_URL } from "@/lib/site";
import styles from "../site.module.scss";

/**
 * The blog hub: Revival's changelog.
 *
 * The hero is the Blog page's own PageHero, authored in WordPress and rendered
 * through the same Renderer as every other page -- title and intro are content,
 * not code. The rail of entries renders beneath it, newest first, numbered
 * oldest-first so an entry keeps its number forever.
 *
 * Drafts appear on the rail only when WORDPRESS_AUTH is set, which is only
 * ever locally; see lib/queries/blog.ts.
 */

/** The URI WordPress stores, which is also what the primary menu links to. */
const URI = "/blog/";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(URI);
  return toMetadata(page?.seo, { path: "/blog", fallbackTitle: page?.title });
}

export default async function BlogPage() {
  const [page, entries, links, footer] = await Promise.all([
    getPage(URI),
    getBlogEntries(),
    getPrimaryMenu(),
    getSiteFooter(),
  ]);

  if (!page) notFound();

  /**
   * Blog schema, with each entry as a BlogPosting stub. Drafts are deliberately
   * left out even locally: schema describes what the public page claims, and a
   * draft is not yet a claim.
   */
  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Revival",
    url: `${SITE_URL}/blog`,
    description: page.seo?.metaDesc || undefined,
    author: { "@type": "Person", name: "Kelly Warpechowski", url: SITE_URL },
    blogPost: entries
      .filter((entry) => !entry.isDraft)
      .map((entry) => ({
        "@type": "BlogPosting",
        headline: entry.title,
        url: `${SITE_URL}${entry.href}`,
        datePublished: entry.date,
      })),
  };

  return (
    <>
      <SidebarNav
        links={links}
        nodes={buildNavTree(page.sections)}
        currentHref={URI}
        wordmarkSrc="/logo-kelly-warpechowski.svg"
      />

      <main className={styles.main}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />

        <Renderer sections={page.sections} />
        <BlogRail entries={entries} />
      </main>

      <SiteFooter {...footer} />
    </>
  );
}
