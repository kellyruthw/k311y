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
 * Process.
 *
 * Composed entirely from the flexible sections authored on the WordPress page,
 * exactly as Home and About are. Nothing about this page is written here.
 *
 * Home's shell rather than the entry panel: the bordered box and its tab name
 * what a case study or a project *is*, and a prose page makes no such claim.
 */

/** The URI WordPress stores, which is also what the primary menu links to. */
const URI = "/process/";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage(URI);

  return toMetadata(page?.seo, { path: "/process", fallbackTitle: page?.title });
}

export default async function ProcessPage() {
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
        // No entryLabel: Process is a page square in its own right, so the tree
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
