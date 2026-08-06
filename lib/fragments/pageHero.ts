import type { MediaNode } from "./buildTable";

/**
 * PageHero. Six variants share one layout; conditional logic in ACF means
 * fields outside the active variant come back null.
 *
 * The selection below is deliberately the union of every variant's fields, so
 * adding a variant that composes from existing ones -- as `background_media`
 * does -- changes nothing here. That is the test for whether something should
 * be a variant at all.
 */

export const PAGE_HERO_FRAGMENT = `
  ... on PageSectionsSectionsPageHeroLayout {
    variant
    headlineLead
    headlineTail
    headlineHighlight
    paragraph
    tableName
    tableOrientation
    tableShowHeaders
    tableColumns { columnLabel }
    tableRows { cells { cellValue } }
    tableVerticalRows { rowLabel rowValue rowValueNote }
    kickerChips { chipLabel }
    kicker
    title
    intro
    mediaSide
    ctaLabel
    ctaLink
    media { node { sourceUrl mediaItemUrl mimeType altText mediaDetails { width height } } }
  }
`;

/**
 * The entry's own meta, rendered by the case variant as the table beside the
 * hero media. Attached by hydrateSections, not selected by this fragment --
 * it lives on the post type, not the layout.
 */
export interface HeroMeta {
  client: string | null;
  role: string | null;
  timeline: string | null;
  liveUrl: string | null;
  stack: string[];
}

export interface PageHeroFields {
  __typename: "PageSectionsSectionsPageHeroLayout";
  /** Single select, returned as a list. Unwrap with selectValue(). */
  variant: string[] | null;
  /** Present on case pages only. See HeroMeta. */
  meta?: HeroMeta | null;
  /** The entry name, e.g. "Ascaya". The post title, not an authored field. */
  entryName?: string | null;

  // variant: home
  headlineLead: string | null;
  headlineTail: string | null;
  headlineHighlight: string | null;
  paragraph: string | null;
  tableName: string | null;
  tableOrientation: string[] | null;
  tableShowHeaders: boolean | null;
  tableColumns: { columnLabel: string | null }[] | null;
  tableRows: { cells: { cellValue: string | null }[] | null }[] | null;
  tableVerticalRows:
    | { rowLabel: string | null; rowValue: string | null; rowValueNote: string | null }[]
    | null;

  // variant: case
  kickerChips: { chipLabel: string | null }[] | null;

  // variant: case | split | stacked | background_media
  media: { node: MediaNode } | null;

  // variant: case | simple | split | stacked | background_media
  title: string | null;

  // variant: simple | split | stacked | background_media
  kicker: string | null;
  intro: string | null;

  // variant: split | stacked | background_media
  /** Single select, returned as a list. Unwrap with selectValue(). */
  mediaSide: string[] | null;
  /** The CTA renders only with both a label and a link. */
  ctaLabel: string | null;
  /** An in-page fragment, e.g. "#text-section-2". Never an outbound URL. */
  ctaLink: string | null;
}
