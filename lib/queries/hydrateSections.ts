import { fetchGraphQL } from "@/lib/graphql";
import type { Section } from "@/lib/fragments/sections";
import {
  WORK_CARDS_QUERY,
  toWorkCards,
  type WorkCardsQueryResult,
} from "@/lib/fragments/workCards";

/**
 * Fills in data a section needs but cannot select for itself.
 *
 * WorkCardGrid is the case that exists today: its cards are case_study and
 * project posts, which are not reachable from the page query. Rather than
 * bloating that query or letting the component fetch its own data, sections are
 * enriched here once, between the fetch and the render.
 *
 * Follow-up queries only run when a section actually needs them, so a page
 * without a card grid costs nothing extra.
 */
export async function hydrateSections(sections: Section[]): Promise<Section[]> {
  const needsCards = sections.some(
    (section) => section.__typename === "PageSectionsSectionsWorkCardGridLayout",
  );

  if (!needsCards) return sections;

  const data = await fetchGraphQL<WorkCardsQueryResult>(WORK_CARDS_QUERY);
  const cardsBySource = toWorkCards(data);

  return sections.map((section) =>
    section.__typename === "PageSectionsSectionsWorkCardGridLayout"
      ? { ...section, cardsBySource }
      : section,
  );
}
