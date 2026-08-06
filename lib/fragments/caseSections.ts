import { TABLE_FIELDS, type TableFields } from "@/lib/table";
import type { MediaNode } from "./buildTable";

/**
 * The case-study section layouts.
 *
 * Grouped in one file rather than seven: they are small, they share the header
 * trio and the media shape, and keeping them together makes the family legible.
 * Each still carries its own fragment and its own type, side by side.
 */

const MEDIA = `node { sourceUrl mediaItemUrl mimeType altText mediaDetails { width height } }`;

/** The optional header trio every content section supports. */
interface HeaderTrio {
  kicker: string | null;
  heading: string | null;
  intro: string | null;
}

// INTRO COPY ------------------------------------------------------------------

export const INTRO_COPY_FRAGMENT = `
  ... on PageSectionsSectionsIntroCopyLayout {
    kicker
    emphasisLine
    paragraphs { paragraphText }
  }
`;

export interface IntroCopyFields {
  __typename: "PageSectionsSectionsIntroCopyLayout";
  kicker: string | null;
  emphasisLine: string | null;
  paragraphs: { paragraphText: string | null }[] | null;
}

// TEXT SECTION ----------------------------------------------------------------

export const TEXT_SECTION_FRAGMENT = `
  ... on PageSectionsSectionsTextSectionLayout {
    kicker
    heading
    paragraphs { paragraphText }
  }
`;

export interface TextSectionFields extends Omit<HeaderTrio, "intro"> {
  __typename: "PageSectionsSectionsTextSectionLayout";
  paragraphs: { paragraphText: string | null }[] | null;
}

// MEDIA COPY ------------------------------------------------------------------

export const MEDIA_COPY_FRAGMENT = `
  ... on PageSectionsSectionsMediaCopyLayout {
    kicker
    heading
    copyBlocks { blockLabel blockText }
    listItems { itemText }
    variant
    mediaSide
    mediaType
    mediaImage { ${MEDIA} }
    mediaVideo { ${MEDIA} }
    mediaVideoPoster { ${MEDIA} }
    mediaBefore { ${MEDIA} }
    mediaAfter { ${MEDIA} }
    labelBefore
    labelAfter
    ${TABLE_FIELDS}
  }
`;

export interface MediaCopyFields extends TableFields {
  __typename: "PageSectionsSectionsMediaCopyLayout";
  kicker: string | null;
  heading: string | null;
  copyBlocks: { blockLabel: string | null; blockText: string | null }[] | null;
  listItems: { itemText: string | null }[] | null;
  /** Single selects, returned as lists. */
  variant: string[] | null;
  mediaSide: string[] | null;
  mediaType: string[] | null;
  mediaImage: { node: MediaNode } | null;
  mediaVideo: { node: MediaNode } | null;
  mediaVideoPoster: { node: MediaNode } | null;
  mediaBefore: { node: MediaNode } | null;
  mediaAfter: { node: MediaNode } | null;
  labelBefore: string | null;
  labelAfter: string | null;
}

// FULL WIDTH MEDIA ------------------------------------------------------------

export const FULL_WIDTH_MEDIA_FRAGMENT = `
  ... on PageSectionsSectionsFullWidthMediaLayout {
    media { ${MEDIA} }
    caption
    frame
    zoomLens
  }
`;

export interface FullWidthMediaFields {
  __typename: "PageSectionsSectionsFullWidthMediaLayout";
  media: { node: MediaNode } | null;
  caption: string | null;
  frame: boolean | null;
  zoomLens: boolean | null;
}

// CALLOUT LIST ----------------------------------------------------------------

export const CALLOUT_LIST_FRAGMENT = `
  ... on PageSectionsSectionsCalloutListLayout {
    kicker
    heading
    intro
    columns
    cards { cardTitle cardBody cardMedia { ${MEDIA} } }
  }
`;

export interface CalloutListFields extends HeaderTrio {
  __typename: "PageSectionsSectionsCalloutListLayout";
  columns: string[] | null;
  cards:
    | { cardTitle: string | null; cardBody: string | null; cardMedia: { node: MediaNode } | null }[]
    | null;
}

// LARGE LIST ------------------------------------------------------------------

export const LARGE_LIST_FRAGMENT = `
  ... on PageSectionsSectionsLargeListLayout {
    kicker
    heading
    intro
    inPanel
    pinned
    media { ${MEDIA} }
    items { itemTitle itemText itemMedia { ${MEDIA} } }
  }
`;

export interface LargeListFields extends HeaderTrio {
  __typename: "PageSectionsSectionsLargeListLayout";
  /**
   * Render inside the tab and bordered panel the tables use. `kicker` becomes
   * the tab's label and stops rendering above the heading -- a tabbed section
   * names itself through its tab, per lib/schema.md.
   */
  inPanel: boolean | null;
  /**
   * The scrollytelling arrangement: copy on columns 1-2 and sticky, list on
   * 4-8, and the item at the reading line takes the select colour.
   */
  pinned: boolean | null;
  /**
   * Optional. Present, it takes the left half and the list moves right.
   * Hidden in ACF when `pinned` is on: both restructure the same columns.
   */
  media: { node: MediaNode } | null;
  items:
    | {
        itemTitle: string | null;
        itemText: string | null;
        /**
         * The artifact for this step, under its own copy. Unrelated to the
         * section's `media` above, which is one image beside the whole list.
         */
        itemMedia: { node: MediaNode } | null;
      }[]
    | null;
}

// NEXT CASE -------------------------------------------------------------------

export const NEXT_CASE_FRAGMENT = `
  ... on PageSectionsSectionsNextCaseLayout {
    linkLabel
    title
    media { ${MEDIA} }
    nextRef {
      nodes {
        ... on CaseStudy {
          title
          slug
          caseStudyMeta { cardSummary cardCategory cardMedia { ${MEDIA} } }
        }
      }
    }
  }
`;

export interface NextCaseRef {
  title: string | null;
  slug: string | null;
  caseStudyMeta: {
    cardSummary: string | null;
    cardCategory: string | null;
    cardMedia: { node: MediaNode } | null;
  } | null;
}

export interface NextCaseFields {
  __typename: "PageSectionsSectionsNextCaseLayout";
  linkLabel: string | null;
  /** Overrides the referenced entry's card summary. */
  title: string | null;
  /** Overrides the referenced entry's card media. */
  media: { node: MediaNode } | null;
  nextRef: { nodes: NextCaseRef[] } | null;
}
