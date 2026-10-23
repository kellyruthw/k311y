/**
 * ChangeblogTeaser. The homepage's "Latest entry" strip.
 *
 * The layout carries almost nothing on purpose: the post it shows is always
 * the newest entry, fetched by the component itself, so placing the section in
 * WordPress is the whole configuration. The one field is the small line above
 * the title.
 */

export const CHANGEBLOG_TEASER_FRAGMENT = `
  ... on PageSectionsSectionsChangeblogTeaserLayout {
    label
  }
`;

export interface ChangeblogTeaserFields {
  __typename: "PageSectionsSectionsChangeblogTeaserLayout";
  label: string | null;
}
