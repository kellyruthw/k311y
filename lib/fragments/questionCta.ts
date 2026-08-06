/**
 * QuestionCTA. One to three stickies, each wholly clickable.
 *
 * Note the layout type is QuestionCta, not QuestionCTA -- WPGraphQL title-cases
 * the ACF layout name, so the acronym loses its capitals.
 */

export const QUESTION_CTA_FRAGMENT = `
  ... on PageSectionsSectionsQuestionCtaLayout {
    notes {
      question
      linkLabel
      linkUrl
    }
  }
`;

export interface QuestionCtaNote {
  question: string | null;
  linkLabel: string | null;
  linkUrl: string | null;
}

export interface QuestionCtaFields {
  __typename: "PageSectionsSectionsQuestionCtaLayout";
  notes: QuestionCtaNote[] | null;
}
