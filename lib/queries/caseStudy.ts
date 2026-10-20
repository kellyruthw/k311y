import { fetchGraphQL } from "@/lib/graphql";
import { SECTION_FRAGMENTS, type Section } from "@/lib/fragments/sections";
import { SEO_FRAGMENT, type YoastSeo } from "@/lib/seo";
import { hydrateSections } from "./hydrateSections";

/** A single case study, by slug. */

const CASE_STUDY_QUERY = `
  query CaseStudy($slug: ID!) {
    caseStudy(id: $slug, idType: SLUG) {
      title
      slug
      ${SEO_FRAGMENT}
      caseStudyMeta {
        sectionLabel
        client
        role
        timeline
        liveUrl
        stack { stackItem }
      }
      pageSections {
        sections {
          __typename
          ${SECTION_FRAGMENTS}
        }
      }
    }
  }
`;

const CASE_STUDY_SLUGS_QUERY = `
  query CaseStudySlugs {
    caseStudies(first: 100) {
      nodes { slug title }
    }
  }
`;

interface CaseStudyResult {
  caseStudy: {
    title: string | null;
    slug: string | null;
    seo: YoastSeo | null;
    caseStudyMeta: {
      sectionLabel: string | null;
      client: string | null;
      role: string | null;
      timeline: string | null;
      liveUrl: string | null;
      stack: { stackItem: string | null }[] | null;
    } | null;
    pageSections: { sections: Section[] | null } | null;
  } | null;
}

export interface CaseStudy {
  title: string;
  slug: string;
  /**
   * The label on the panel's tab, e.g. "Case study · Headless WordPress".
   *
   * Comes from the hero's kicker chips, not `section_label`. The two are
   * different labels for different places: `section_label` names this entry in
   * the nav tree ("Ascaya"), while the tab describes what the page *is*.
   */
  tabLabel: string | null;
  /** Authored in Yoast. The route passes it through toMetadata(). */
  seo: YoastSeo | null;
  sections: Section[];
}

/** One row of the index: enough to name an entry and link to it. */
export interface EntrySummary {
  title: string;
  slug: string;
}

export async function getCaseStudyEntries(): Promise<EntrySummary[]> {
  const data = await fetchGraphQL<{
    caseStudies: { nodes: { slug: string | null; title: string | null }[] } | null;
  }>(CASE_STUDY_SLUGS_QUERY);

  return (data.caseStudies?.nodes ?? [])
    .filter((node): node is { slug: string; title: string } => Boolean(node.slug && node.title))
    .map((node) => ({ title: node.title, slug: node.slug }));
}

export async function getCaseStudySlugs(): Promise<string[]> {
  return (await getCaseStudyEntries()).map((entry) => entry.slug);
}

export async function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  const data = await fetchGraphQL<CaseStudyResult>(CASE_STUDY_QUERY, { slug });
  const entry = data.caseStudy;
  if (!entry) return null;

  const meta = entry.caseStudyMeta;

  /**
   * The hero renders the entry's own meta, which lives on the post type rather
   * than the layout. Attaching it here keeps PageHero a pure function of its
   * props, with nothing reaching outside itself for data.
   */
  const sections = (entry.pageSections?.sections ?? []).map((section) =>
    section.__typename === "PageSectionsSectionsPageHeroLayout"
      ? {
          ...section,
          entryName: entry.title,
          meta: {
            client: meta?.client ?? null,
            role: meta?.role ?? null,
            timeline: meta?.timeline ?? null,
            liveUrl: meta?.liveUrl ?? null,
            stack: (meta?.stack ?? [])
              .map((item) => item.stackItem?.trim() ?? "")
              .filter(Boolean),
          },
        }
      : section,
  );

  const hero = sections.find(
    (section) => section.__typename === "PageSectionsSectionsPageHeroLayout",
  );

  const chips = (hero?.kickerChips ?? [])
    .map((chip) => chip.chipLabel?.trim() ?? "")
    .filter(Boolean);

  return {
    title: entry.title ?? "",
    slug: entry.slug ?? slug,
    tabLabel: chips.length ? chips.join(" · ") : (meta?.sectionLabel ?? null),
    seo: entry.seo,
    sections: await hydrateSections(sections),
  };
}
