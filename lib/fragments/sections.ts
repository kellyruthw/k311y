import { PAGE_HERO_FRAGMENT, type PageHeroFields } from "./pageHero";
import { WORK_CARD_GRID_FRAGMENT, type WorkCardGridFields } from "./workCardGrid";
import { BUILD_TABLE_FRAGMENT, type BuildTableFields } from "./buildTable";
import { SPLIT_STATEMENT_FRAGMENT, type SplitStatementFields } from "./splitStatement";
import { QUESTION_CTA_FRAGMENT, type QuestionCtaFields } from "./questionCta";
import { TIMELINE_FRAGMENT, type TimelineFields } from "./timeline";
import { CHANGEBLOG_TEASER_FRAGMENT, type ChangeblogTeaserFields } from "./changeblogTeaser";
import {
  CALLOUT_LIST_FRAGMENT,
  FULL_WIDTH_MEDIA_FRAGMENT,
  INTRO_COPY_FRAGMENT,
  LARGE_LIST_FRAGMENT,
  MEDIA_COPY_FRAGMENT,
  NEXT_CASE_FRAGMENT,
  TEXT_SECTION_FRAGMENT,
  type CalloutListFields,
  type FullWidthMediaFields,
  type IntroCopyFields,
  type LargeListFields,
  type MediaCopyFields,
  type NextCaseFields,
  type TextSectionFields,
} from "./caseSections";

/**
 * Every layout the sections field can contain, composed into one selection set
 * by string interpolation -- the same approach as ascaya-next's PAGE_FIELDS.
 *
 * Adding a layout means adding its fragment here, its type to Section, and its
 * component to the Renderer map; miss any of the three and TypeScript says so.
 */
export const SECTION_FRAGMENTS = [
  PAGE_HERO_FRAGMENT,
  INTRO_COPY_FRAGMENT,
  TEXT_SECTION_FRAGMENT,
  MEDIA_COPY_FRAGMENT,
  FULL_WIDTH_MEDIA_FRAGMENT,
  CALLOUT_LIST_FRAGMENT,
  LARGE_LIST_FRAGMENT,
  SPLIT_STATEMENT_FRAGMENT,
  NEXT_CASE_FRAGMENT,
  WORK_CARD_GRID_FRAGMENT,
  BUILD_TABLE_FRAGMENT,
  TIMELINE_FRAGMENT,
  QUESTION_CTA_FRAGMENT,
  CHANGEBLOG_TEASER_FRAGMENT,
].join("\n");

/** The discriminated union the Renderer switches on. */
export type Section =
  | PageHeroFields
  | IntroCopyFields
  | TextSectionFields
  | MediaCopyFields
  | FullWidthMediaFields
  | CalloutListFields
  | LargeListFields
  | SplitStatementFields
  | NextCaseFields
  | WorkCardGridFields
  | BuildTableFields
  | TimelineFields
  | QuestionCtaFields
  | ChangeblogTeaserFields;

export type SectionTypename = Section["__typename"];

/**
 * What Renderer hands every section component.
 *
 * `component` is derived from __typename rather than written out in each
 * component, so the value the nav matches on and the value a section advertises
 * are the same string by construction. Hardcoding it meant QuestionCta rendered
 * as "QuestionCTA" and its nav node could never light.
 */
export interface SectionProps {
  id: string;
  component: string;
}

export interface WithSections {
  pageSections: { sections: Section[] | null } | null;
}
