import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Renderer from "@/components/Renderer/Renderer";
import SidebarNav from "@/components/SidebarNav/SidebarNav";
import SiteFooter from "@/components/SiteFooter/SiteFooter";
import { getHomePage } from "@/lib/queries/home";
import { toMetadata } from "@/lib/seo";
import { getPrimaryMenu } from "@/lib/queries/nav";
import { getSiteFooter } from "@/lib/queries/footer";
import { buildNavTree } from "@/lib/navTree";
import styles from "./site.module.scss";

/**
 * Home had no generateMetadata at all, so it fell through to the placeholder in
 * app/layout.tsx and the title authored in Yoast was never used.
 */
export async function generateMetadata(): Promise<Metadata> {
  const home = await getHomePage();

  return toMetadata(home?.seo, { path: "/", fallbackTitle: home?.title });
}

export default async function HomePage() {
  // Independent queries, so they run together rather than in sequence.
  const [home, links, footer] = await Promise.all([
    getHomePage(),
    getPrimaryMenu(),
    getSiteFooter(),
  ]);

  if (!home) notFound();

  return (
    <>
      <SidebarNav
        links={links}
        nodes={buildNavTree(home.sections)}
        currentHref="/"
        wordmarkSrc="/logo-kelly-warpechowski.svg"
      />

      <main className={styles.main}>
        <Renderer sections={home.sections} />
      </main>

      <SiteFooter {...footer} />
    </>
  );
}
