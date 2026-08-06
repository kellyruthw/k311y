import { fetchGraphQL } from "@/lib/graphql";
import { SECTION_FRAGMENTS, type Section } from "@/lib/fragments/sections";
import { SEO_FRAGMENT, type YoastSeo } from "@/lib/seo";
import { hydrateSections } from "./hydrateSections";

/**
 * A single project, by slug.
 *
 * Projects carry the same `sections` field as case studies and pages, so this
 * is the case-study loader's shape with a different post type and a different
 * meta block. Nothing about the schema changed to make project pages possible.
 */

const PROJECT_QUERY = `
  query Project($slug: ID!) {
    project(id: $slug, idType: SLUG) {
      title
      slug
      ${SEO_FRAGMENT}
      projectMeta {
        tagline
        cardCategory
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

const PROJECT_SLUGS_QUERY = `
  query ProjectSlugs {
    projects(first: 100) {
      nodes { slug }
    }
  }
`;

interface ProjectResult {
  project: {
    title: string | null;
    slug: string | null;
    seo: YoastSeo | null;
    projectMeta: {
      tagline: string | null;
      cardCategory: string | null;
      role: string | null;
      timeline: string | null;
      liveUrl: string | null;
      stack: { stackItem: string | null }[] | null;
    } | null;
    pageSections: { sections: Section[] | null } | null;
  } | null;
}

export interface Project {
  title: string;
  slug: string;
  /**
   * The label on the panel's tab, e.g. "Project · Next.js + PixiJS".
   *
   * Read off the hero's kicker chips, exactly as a case study's is, so the two
   * post types produce the same object: one label, joined with a middot, no
   * chip beside it. `card_category` is only the fallback, for a project whose
   * hero authored no chips.
   */
  tabLabel: string | null;
  /** Authored in Yoast. The route passes it through toMetadata(). */
  seo: YoastSeo | null;
  sections: Section[];
}

export async function getProjectSlugs(): Promise<string[]> {
  const data = await fetchGraphQL<{ projects: { nodes: { slug: string | null }[] } | null }>(
    PROJECT_SLUGS_QUERY,
  );

  return (data.projects?.nodes ?? [])
    .map((node) => node.slug)
    .filter((slug): slug is string => Boolean(slug));
}

export async function getProject(slug: string): Promise<Project | null> {
  const data = await fetchGraphQL<ProjectResult>(PROJECT_QUERY, { slug });
  const entry = data.project;
  if (!entry) return null;

  const meta = entry.projectMeta;

  /**
   * The hero renders the entry's own meta, which lives on the post type rather
   * than the layout. Attaching it here keeps PageHero a pure function of its
   * props, with nothing reaching outside itself for data -- the same move
   * getCaseStudy() makes, into the same HeroMeta shape, which is why CaseHero
   * draws the MetaBlock for either post type without knowing which it has.
   *
   * `client` is null and stays null: a project has no client. The row drops out
   * on its own. `status` is deliberately absent too -- it is already the chip on
   * the tab, and a fact stated twice on one screen invites the two to disagree.
   */
  const sections = (entry.pageSections?.sections ?? []).map((section) =>
    section.__typename === "PageSectionsSectionsPageHeroLayout"
      ? {
          ...section,
          entryName: entry.title,
          meta: {
            client: null,
            role: meta?.role ?? null,
            timeline: meta?.timeline ?? null,
            liveUrl: meta?.liveUrl ?? null,
            stack: (meta?.stack ?? []).map((item) => item.stackItem?.trim() ?? "").filter(Boolean),
          },
        }
      : section,
  );

  // The chips are authored on the hero and never rendered inside it; feeding
  // the tab is the whole reason they exist. Same derivation as getCaseStudy(),
  // so "Project - Next.js + PixiJS" and "Case study - Headless WordPress" are
  // the same object drawn from the same field.
  const hero = sections.find(
    (section) => section.__typename === "PageSectionsSectionsPageHeroLayout",
  );

  const chips = (hero?.kickerChips ?? []).map((chip) => chip.chipLabel?.trim() ?? "").filter(Boolean);

  return {
    title: entry.title ?? "",
    slug: entry.slug ?? slug,
    tabLabel: chips.length ? chips.join(" · ") : (meta?.cardCategory ?? null),
    seo: entry.seo,
    sections: await hydrateSections(sections),
  };
}
