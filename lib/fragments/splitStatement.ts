/**
 * SplitStatement. Authored lines arrive from alternating sides and settle
 * centred.
 *
 * There is no variant: it always scrolls. The only static case is a device
 * that asks for reduced motion, which is decided at render, not in the CMS.
 */

export const SPLIT_STATEMENT_FRAGMENT = `
  ... on PageSectionsSectionsSplitStatementLayout {
    quote
    highlightPhrases { phrase }
  }
`;

export interface SplitStatementFields {
  __typename: "PageSectionsSectionsSplitStatementLayout";
  /** Line breaks separate the halves. Split with toLines(). */
  quote: string | null;
  highlightPhrases: { phrase: string | null }[] | null;
}
