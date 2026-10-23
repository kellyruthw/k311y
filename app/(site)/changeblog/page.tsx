import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Renderer from "@/components/Renderer/Renderer";
import SidebarNav from "@/components/SidebarNav/SidebarNav";
import SiteFooter from "@/components/SiteFooter/SiteFooter";
import BlogRail from "@/components/BlogRail/BlogRail";
import { getPage } from "@/lib/queries/page";
import { entryNumber, getBlogEntries } from "@/lib/queries/blog";
import { jsonLd, toMetadata } from "@/lib/seo";
import { getPrimaryMenu } from "@/lib/queries/nav";
import { getSiteFooter } from "@/lib/queries/footer";
import { buildNavTree, type NavNode } from "@/lib/navTree";
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
const URI = "/changeblog/";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(URI);
  return toMetadata(page?.seo, { path: "/changeblog", fallbackTitle: page?.title });
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
   * The hero's kicker counts the changelog: "Changeblog / 003" with three
   * entries on the rail. The label is authored in WordPress; only the number
   * is appended here, so the count can never drift from what renders below.
   * Locally that includes drafts, because the rail shows them too.
   */
  const sections = page.sections.map((section) =>
    section.__typename === "PageSectionsSectionsPageHeroLayout" && section.kicker?.trim()
      ? { ...section, kicker: `${section.kicker.trim()} / ${entryNumber(entries.length)}` }
      : section,
  );

  /**
   * Blog schema, with each entry as a BlogPosting stub. Drafts are deliberately
   * left out even locally: schema describes what the public page claims, and a
   * draft is not yet a claim.
   */
  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Changeblog",
    url: `${SITE_URL}/changeblog`,
    description: page.seo?.metaDesc || undefined,
    author: { "@type": "Person", name: "Kelly Warpechowski", url: SITE_URL },
    blogPost: entries
      .filter((entry) => !entry.isDraft)
      .map((entry) => ({
        "@type": "BlogPosting",
        headline: entry.title,
        url: `${SITE_URL}${entry.href}`,
        datePublished: entry.dateGmt,
      })),
  };

  return (
    <>
      <SidebarNav
        links={links}
        // The authored sections, plus the rail: BlogRail is this route's own
        // component rather than a WP section, so it joins the tree by hand,
        // with its repeating entry as the diamond -- the WorkCardGrid: Card
        // relationship, one level down.
        nodes={[
          ...buildNavTree(sections),
          ...(entries.length
            ? [
                {
                  name: "BlogRail",
                  label: "BlogRail",
                  count: 1,
                  ids: ["blog-rail"],
                  subcomponent: "Entry",
                } satisfies NavNode,
              ]
            : []),
        ]}
        currentHref={URI}
        wordmarkSrc="/logo-kelly-warpechowski.svg"
      />

      {/* data-fill: a short rail must not strand the footer mid-screen -- the
          body column in _globals.scss grows this main and pins the footer's
          bottom edge to the viewport's. */}
      <main className={styles.main} data-fill="viewport">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
        />

        <Renderer sections={sections} />
        <BlogRail entries={entries} />
      </main>

      <SiteFooter {...footer} />
    </>
  );
}
