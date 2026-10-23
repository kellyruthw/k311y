import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Renderer from "@/components/Renderer/Renderer";
import SidebarNav from "@/components/SidebarNav/SidebarNav";
import SiteFooter from "@/components/SiteFooter/SiteFooter";
import Tab from "@/components/UI/Tab/Tab";
import { getCaseStudy, getCaseStudyEntries, getCaseStudySlugs } from "@/lib/queries/caseStudy";
import { jsonLd, toMetadata } from "@/lib/seo";
import { getPrimaryMenu } from "@/lib/queries/nav";
import { getSiteFooter } from "@/lib/queries/footer";
import { buildNavTree } from "@/lib/navTree";
import { SITE_URL, absoluteUrl } from "@/lib/site";
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

  const [entry, siblings, links, footer] = await Promise.all([
    getCaseStudy(slug),
    getCaseStudyEntries(),
    getPrimaryMenu(),
    getSiteFooter(),
  ]);

  if (!entry) notFound();

  // Every case study under the menu item, in CMS order, the one being viewed
  // flagged so the tree hangs off it and the rest render as links.
  const navEntries = siblings.map((sibling) => ({
    label: sibling.title,
    href: `/case-studies/${sibling.slug}`,
    current: sibling.slug === entry.slug,
  }));

  /**
   * NextCase sits outside the bordered panel, between the case study and the
   * footer. It carries its own tab in Figma, which is the tell: a tab labels
   * the block it sits on, so a second tab means a second block.
   */
  const isNextCase = (section: (typeof entry.sections)[number]) =>
    section.__typename === "PageSectionsSectionsNextCaseLayout";

  const panelSections = entry.sections.filter((section) => !isNextCase(section));
  const trailingSections = entry.sections.filter(isNextCase);

  /**
   * The case study as a CreativeWork. Description is Yoast's meta description,
   * the authored one; absent rather than invented when none is written. The
   * author points at the Person node the home page declares.
   */
  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: entry.title,
    url: absoluteUrl(`/case-studies/${entry.slug}`),
    description: entry.seo?.metaDesc?.trim() || undefined,
    author: {
      "@type": "Person",
      "@id": `${SITE_URL}/#kelly`,
      name: "Kelly Warpechowski",
      url: SITE_URL,
    },
  };

  return (
    <>
      <SidebarNav
        links={links}
        // Panel-then-trailing, the order the two Renderers below draw them in,
        // so every node id matches a section that actually renders.
        nodes={buildNavTree([...panelSections, ...trailingSections])}
        // The menu item this page lives under, so the tree opens beneath it.
        currentHref="/#case-studies"
        // Nested inside that item as a breadcrumb, per the as-built rail rules.
        entries={navEntries}
        wordmarkSrc="/logo-kelly-warpechowski.svg"
      />

      <main className={styles.shell}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />

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
            <Renderer sections={trailingSections} indexOffset={panelSections.length} />
          </div>
        ) : null}
      </main>

      <SiteFooter {...footer} />
    </>
  );
}
