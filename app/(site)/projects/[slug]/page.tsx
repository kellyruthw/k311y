import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Renderer from "@/components/Renderer/Renderer";
import SidebarNav from "@/components/SidebarNav/SidebarNav";
import SiteFooter from "@/components/SiteFooter/SiteFooter";
import Tab from "@/components/UI/Tab/Tab";
import { getProject, getProjectSlugs } from "@/lib/queries/project";
import { toMetadata } from "@/lib/seo";
import { getPrimaryMenu } from "@/lib/queries/nav";
import { getSiteFooter } from "@/lib/queries/footer";
import { buildNavTree } from "@/lib/navTree";
import styles from "../../entryShell.module.scss";

/**
 * A project detail page.
 *
 * Deliberately the case study's shell and the case study's shape: a project is
 * the same kind of object to a reader, and the WorkCardGrid on Home already
 * sends them here from the same grid of cards.
 */

/** Every project is prerendered at build time. */
export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getProject(slug);

  // Same permalink mismatch as case studies: WordPress says /project/<slug>.
  return toMetadata(entry?.seo, { path: `/projects/${slug}`, fallbackTitle: entry?.title });
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [entry, links, footer] = await Promise.all([
    getProject(slug),
    getPrimaryMenu(),
    getSiteFooter(),
  ]);

  if (!entry) notFound();

  /**
   * NextCase sits outside the bordered panel, between the entry and the footer.
   * It carries its own tab, which is the tell: a tab labels the block it sits
   * on, so a second tab means a second block.
   */
  const isNextCase = (section: (typeof entry.sections)[number]) =>
    section.__typename === "PageSectionsSectionsNextCaseLayout";

  const panelSections = entry.sections.filter((section) => !isNextCase(section));
  const trailingSections = entry.sections.filter(isNextCase);

  return (
    <>
      <SidebarNav
        links={links}
        // An entry page: the project's own meta is attached to the hero, so
        // MetaBlock hangs off it here exactly as it does on a case study.
        nodes={buildNavTree(entry.sections, true)}
        // The menu item this page lives under, so the tree opens beneath it.
        // Projects is an anchor into Home's card grid, not a page of its own.
        currentHref="/#projects"
        // Nested inside that item as a breadcrumb, per the as-built rail rules.
        entryLabel={entry.title}
        wordmarkSrc="/logo-kelly-warpechowski.svg"
      />

      <main className={styles.shell}>
        {/* The tab labels the panel it sits on, exactly as a table's does. */}
        {entry.tabLabel ? (
          <div className={styles.tabRow}>
            <Tab>{entry.tabLabel}</Tab>
          </div>
        ) : null}

        <div className={styles.panel}>
          <Renderer sections={panelSections} />
        </div>

        {trailingSections.length ? (
          <div className={styles.trailing}>
            <Renderer sections={trailingSections} />
          </div>
        ) : null}
      </main>

      <SiteFooter {...footer} />
    </>
  );
}
