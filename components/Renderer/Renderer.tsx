import type { ComponentType } from "react";
import type { Section, SectionTypename } from "@/lib/fragments/sections";
import { componentName } from "@/lib/navTree";
import PageHero from "@/components/PageHero/PageHero";
import BuildTable from "@/components/BuildTable/BuildTable";
import WorkCardGrid from "@/components/WorkCardGrid/WorkCardGrid";
import SplitStatement from "@/components/SplitStatement/SplitStatement";
import QuestionCTA from "@/components/QuestionCTA/QuestionCTA";
import IntroCopy from "@/components/IntroCopy/IntroCopy";
import TextSection from "@/components/TextSection/TextSection";
import MediaCopy from "@/components/MediaCopy/MediaCopy";
import FullWidthMedia from "@/components/FullWidthMedia/FullWidthMedia";
import CalloutList from "@/components/CalloutList/CalloutList";
import LargeList from "@/components/LargeList/LargeList";
import NextCase from "@/components/NextCase/NextCase";
import Timeline from "@/components/Timeline/Timeline";

/**
 * Maps a section's __typename to the component that draws it.
 *
 * Deliberately declarative: no cross-section scanning, no injecting a component
 * mid-array for one route, no conditional props. Anything a section needs to
 * know about its neighbours travels in its own data or through context, so this
 * file stays readable as the component count grows.
 *
 * The Record is typed on SectionTypename, so adding a layout to the union
 * without adding it here is a compile error rather than a blank space on
 * the page.
 */

// Each component narrows its own section type; the map cannot express that per
// entry. The directive has to sit immediately above the line it excuses, so the
// reason goes here rather than trailing it.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SectionComponent = ComponentType<any>;

const SECTION_COMPONENTS: Record<SectionTypename, SectionComponent | null> = {
  PageSectionsSectionsPageHeroLayout: PageHero,
  PageSectionsSectionsIntroCopyLayout: IntroCopy,
  PageSectionsSectionsTextSectionLayout: TextSection,
  PageSectionsSectionsMediaCopyLayout: MediaCopy,
  PageSectionsSectionsFullWidthMediaLayout: FullWidthMedia,
  PageSectionsSectionsCalloutListLayout: CalloutList,
  PageSectionsSectionsLargeListLayout: LargeList,
  PageSectionsSectionsSplitStatementLayout: SplitStatement,
  PageSectionsSectionsNextCaseLayout: NextCase,
  PageSectionsSectionsWorkCardGridLayout: WorkCardGrid,
  PageSectionsSectionsBuildTableLayout: BuildTable,
  PageSectionsSectionsTimelineLayout: Timeline,
  PageSectionsSectionsQuestionCtaLayout: QuestionCTA,
};

/** Stable id for a section, used for anchors and the sidebar nav tree. */
export function sectionId(section: Section, index: number): string {
  const name = componentName(section.__typename)
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();

  return `${name}-${index + 1}`;
}

export default function Renderer({
  sections,
  indexOffset = 0,
}: {
  sections: Section[];
  /**
   * Where this slice of the page starts in the full section list. A page that
   * renders its sections in two Renderers (the entry shell's panel and its
   * trailing NextCase) must offset the second, or its ids restart at 1 and no
   * longer match what buildNavTree derived from the whole list.
   */
  indexOffset?: number;
}) {
  return (
    <>
      {sections.map((section, index) => {
        const Component = SECTION_COMPONENTS[section.__typename];
        if (!Component) return null;

        const id = sectionId(section, index + indexOffset);

        return (
          <Component
            key={id}
            id={id}
            component={componentName(section.__typename)}
            {...section}
          />
        );
      })}
    </>
  );
}
