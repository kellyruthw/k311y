import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Renderer from "@/components/Renderer/Renderer";
import SidebarNav from "@/components/SidebarNav/SidebarNav";
import SiteFooter from "@/components/SiteFooter/SiteFooter";
import Tab from "@/components/UI/Tab/Tab";
import { getCaseStudy, getCaseStudySlugs } from "@/lib/queries/caseStudy";
import { toMetadata } from "@/lib/seo";
import { getPrimaryMenu } from "@/lib/queries/nav";
import { getSiteFooter } from "@/lib/queries/footer";
import { buildNavTree } from "@/lib/navTree";
import styles from "../../entryShell.module.scss";

/** Every case study is prerendered at build time. */
export async function generateStaticParams() {
  const slugs = await getCaseStudySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getCaseStudy(slug);

  // Yoast's canonical points at the WordPress permalink, /case-study/<slug>.
  // This site serves /case-studies/<slug>, and the front end owns its URLs.
  return toMetadata(entry?.seo, {
    path: `/case-studies/${slug}`,
    fallbackTitle: entry?.title,
  });
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [entry, links, footer] = await Promise.all([
    getCaseStudy(slug),
    getPrimaryMenu(),
    getSiteFooter(),
  ]);

  if (!entry) notFound();

  /**
   * NextCase sits outside the bordered panel, between the case study and the
   * footer. It carries its own tab in Figma, which is the tell: a tab labels
   * the block it sits on, so a second tab means a second block.
   */
  const isNextCase = (section: (typeof entry.sections)[number]) =>
    section.__typename === "PageSectionsSectionsNextCaseLayout";

  const panelSections = entry.sections.filter((section) => !isNextCase(section));
  const trailingSections = entry.sections.filter(isNextCase);

  return (
    <>
      <SidebarNav
        links={links}
        // An entry page: MetaBlock hangs off the hero where there is meta to
        // draw, which is a case study or a project, never Home.
        nodes={buildNavTree(entry.sections, true)}
        // The menu item this page lives under, so the tree opens beneath it.
        currentHref="/#case-studies"
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
