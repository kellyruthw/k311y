import { fetchGraphQL } from "@/lib/graphql";
import { SECTION_FRAGMENTS, type Section } from "@/lib/fragments/sections";
import { SEO_FRAGMENT, type YoastSeo } from "@/lib/seo";
import { hydrateSections } from "./hydrateSections";

/**
 * A WordPress page by URI, with its flexible sections.
 *
 * Pages carry the same `sections` field as case studies and projects, so they
 * resolve to the same layout union and the same Renderer map. That is what the
 * content model means by "no page templates with hardcoded layouts": a page
 * route is a loader and a shell, and nothing else.
 *
 * Keyed on URI rather than slug because that is what the primary menu stores.
 * A nested page then addresses itself the same way a top-level one does.
 */

const PAGE_QUERY = `
  query PageByUri($uri: ID!) {
    page(id: $uri, idType: URI) {
      title
      ${SEO_FRAGMENT}
      pageSections {
        sections {
          __typename
          ${SECTION_FRAGMENTS}
        }
      }
    }
  }
`;

interface PageQueryResult {
  page: {
    title: string | null;
    seo: YoastSeo | null;
    pageSections: { sections: Section[] | null } | null;
  } | null;
}

export interface SitePage {
  title: string | null;
  /** Authored in Yoast. Routes pass it through toMetadata(). */
  seo: YoastSeo | null;
  sections: Section[];
}

/** Null when no page is published at that URI, which routes call notFound() on. */
export async function getPage(uri: string): Promise<SitePage | null> {
  const data = await fetchGraphQL<PageQueryResult>(PAGE_QUERY, { uri });
  if (!data.page) return null;

  return {
    title: data.page.title,
    seo: data.page.seo,
    sections: await hydrateSections(data.page.pageSections?.sections ?? []),
  };
}
