import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Renderer from "@/components/Renderer/Renderer";
import SidebarNav from "@/components/SidebarNav/SidebarNav";
import SiteFooter from "@/components/SiteFooter/SiteFooter";
import { getPage } from "@/lib/queries/page";
import { toMetadata } from "@/lib/seo";
import { getPrimaryMenu } from "@/lib/queries/nav";
import { getSiteFooter } from "@/lib/queries/footer";
import { buildNavTree } from "@/lib/navTree";
import styles from "../site.module.scss";

/**
 * About.
 *
 * Composed entirely from the flexible sections authored on the WordPress page,
 * exactly as Home and the case studies are. Nothing about this page is written
 * here: reordering its sections in WordPress reorders both the page and the nav
 * tree, and a section removed there cannot leave anything behind in the route.
 *
 * Home's shell rather than the case study's, deliberately. The bordered panel
 * and its tab are a case-study idiom -- the tab names what the panel is ("Case
 * study - Headless WordPress"), and a prose page has no such claim to make.
 */

/** The URI WordPress stores, which is also what the primary menu links to. */
const URI = "/about/";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(URI);

  // "/about", not URI: the canonical names the route this site serves, which is
  // not the WordPress permalink it was authored at.
  return toMetadata(page?.seo, { path: "/about", fallbackTitle: page?.title });
}

export default async function AboutPage() {
  // Independent queries, so they run together rather than in sequence.
  const [page, links, footer] = await Promise.all([
    getPage(URI),
    getPrimaryMenu(),
    getSiteFooter(),
  ]);

  if (!page) notFound();

  return (
    <>
      <SidebarNav
        links={links}
        // No entryLabel: About is a page square in its own right, so the tree
        // hangs straight off it rather than off a nested breadcrumb.
        nodes={buildNavTree(page.sections)}
        // Matched against the menu item's own href, trailing slash and all.
        currentHref={URI}
        wordmarkSrc="/logo-kelly-warpechowski.svg"
      />

      <main className={styles.main}>
        <Renderer sections={page.sections} />
      </main>

      <SiteFooter {...footer} />
    </>
  );
}
