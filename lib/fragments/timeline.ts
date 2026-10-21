import type { MediaNode } from "./buildTable";

/**
 * Timeline. The fragment and the type it produces live together so the query
 * cannot be edited without the type in view -- the only guard against drift,
 * since there is no codegen.
 *
 * The repeater is `entries`, not `items`, and the difference is load-bearing.
 * WPGraphQL-ACF names a repeater's row type after the field alone, not the
 * layout it sits in, so every `items` repeater in this group resolves to one
 * shared PageSectionsSectionsItems. LargeList already owns that name with a
 * different shape, and it wins. See the note in lib/schema.md.
 */

export const TIMELINE_FRAGMENT = `
  ... on PageSectionsSectionsTimelineLayout {
    label
    countDisplay
    entries {
      entryDate
      entryCompany
      entryBody
      entryGallery { nodes { sourceUrl mediaItemUrl mimeType altText mediaDetails { width height } } }
    }
  }
`;

export interface TimelineEntry {
  /** Text, not a date: "2013-2015" is as valid as "2016". */
  entryDate: string | null;
  entryCompany: string | null;
  /** One paragraph per authored line. Render through Prose. */
  entryBody: string | null;
  /**
   * The entry's media, in the order shown: images or mp4, as a gallery
   * connection. Optional, like the single media field it replaced: entries
   * without media are normal, not a gap to fill.
   */
  entryGallery: { nodes: MediaNode[] } | null;
}

export interface TimelineFields {
  __typename: "PageSectionsSectionsTimelineLayout";
  /** The tab above the panel. */
  label: string | null;
  countDisplay: string | null;
  entries: TimelineEntry[] | null;
}
