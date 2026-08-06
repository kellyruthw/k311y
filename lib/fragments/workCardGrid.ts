import type { CardsBySource } from "./workCards";

/**
 * WorkCardGrid. Tabs are authored; the cards themselves come from the chosen
 * post type, so this fragment carries only the tab configuration.
 */

export const WORK_CARD_GRID_FRAGMENT = `
  ... on PageSectionsSectionsWorkCardGridLayout {
    tabs {
      tabLabel
      source
      countDisplay
    }
  }
`;

export interface WorkCardGridTab {
  tabLabel: string | null;
  /** Single select, returned as a list: "case_study" or "project". */
  source: string[] | null;
  countDisplay: string | null;
}

export interface WorkCardGridFields {
  __typename: "PageSectionsSectionsWorkCardGridLayout";
  tabs: WorkCardGridTab[] | null;
  /**
   * Attached after the query by hydrateSections, not selected by the fragment.
   * Cards live in their own post types, so they cannot come back with the page.
   */
  cardsBySource?: CardsBySource;
}
