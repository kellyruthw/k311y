import type { Section } from "@/lib/fragments/sections";

/**
 * The nav tree for the current page, derived from its sections rather than
 * authored anywhere. Reordering sections in WordPress reorders the tree, and a
 * section that is removed cannot leave a node behind.
 */

/**
 * Components that render a repeating, CPT-fed child. These become the diamonds
 * hanging off a circle in the tree.
 */
const SUBCOMPONENTS: Record<string, string> = {
  WorkCardGrid: "Card",
  BuildTable: "TableRow",
  PageHero: "MetaBlock",
};

/**
 * Diamonds that only make sense on an entry detail page, not on Home.
 *
 * MetaBlock hangs off the hero only where the post type carries meta for it to
 * draw, which is a case study or a project. Home and the prose pages have none.
 */
const ENTRY_ONLY_SUBCOMPONENTS = new Set(["MetaBlock"]);

/**
 * Where the derived name is not how the component is written.
 *
 * WPGraphQL title-cases layout names, so an acronym loses its capitals:
 * question_cta becomes QuestionCta. The derived form stays the key everything
 * matches on -- only the label shown to a reader is corrected.
 */
const DISPLAY_NAMES: Record<string, string> = {
  QuestionCta: "QuestionCTA",
};

export function displayName(name: string): string {
  return DISPLAY_NAMES[name] ?? name;
}

export interface NavNode {
  /** The derived component name. The key sections are matched on. */
  name: string;
  /** How the name is written, which is not always how it is derived. */
  label: string;
  /** How many times it appears on the page. Chips render only above 1. */
  count: number;
  /** Section element ids, in page order. Clicking scrolls to the first. */
  ids: string[];
  /** The CPT-fed child, when the component has one. */
  subcomponent: string | null;
}

/** "PageSectionsSectionsWorkCardGridLayout" -> "WorkCardGrid" */
export function componentName(typename: string): string {
  return typename.replace(/^PageSectionsSections/, "").replace(/Layout$/, "");
}

/** The id a section renders, matching what Renderer assigns. */
export function sectionElementId(typename: string, index: number): string {
  const name = componentName(typename)
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();

  return `${name}-${index + 1}`;
}

/**
 * Group sections by component type, keeping first-appearance order.
 *
 * Type-grouped rather than one node per section: a page with four TextSections
 * gets a single node with a "4" chip, which is what keeps the tree readable.
 */
export function buildNavTree(sections: Section[], isEntryPage = false): NavNode[] {
  const order: string[] = [];
  const byName = new Map<string, NavNode>();

  sections.forEach((section, index) => {
    const name = componentName(section.__typename);
    const id = sectionElementId(section.__typename, index);

    const existing = byName.get(name);
    if (existing) {
      existing.count += 1;
      existing.ids.push(id);
      return;
    }

    const sub = SUBCOMPONENTS[name] ?? null;
    const allowed = sub && (!ENTRY_ONLY_SUBCOMPONENTS.has(sub) || isEntryPage);

    order.push(name);
    byName.set(name, {
      name,
      label: displayName(name),
      count: 1,
      ids: [id],
      subcomponent: allowed ? sub : null,
    });
  });

  return order.map((name) => byName.get(name) as NavNode);
}
