import type { TermConnection } from "@/lib/acf";

/**
 * BuildTable. The fragment and the type it produces live together so the query
 * cannot be edited without the type in view -- the only guard against drift,
 * since there is no codegen.
 *
 * Verified against the live schema: selects return arrays, and the taxonomy
 * field is a connection needing an inline fragment on Collaborator.
 */

export const BUILD_TABLE_FRAGMENT = `
  ... on PageSectionsSectionsBuildTableLayout {
    label
    countDisplay
    caption
    rows {
      year
      site
      role
      stack
      notes
      linkLabel
      link
      isCollaboration
      thumb { node { sourceUrl mediaItemUrl mimeType altText mediaDetails { width height } } }
      collaborator {
        nodes {
          name
          ... on Collaborator {
            collaboratorFields {
              companyUrl
              markerColour
            }
          }
        }
      }
    }
  }
`;

/** Canonical display order. A row renders its stack in this order, not click order. */
export const STACK_ORDER = [
  "headless_wp",
  "headless_shopify",
  "wp_custom_theme",
  "wordpress",
  "wordpress_ecommerce",
  "html_mobile",
  "tumblr",
  "nextjs",
  "gatsby",
  "gsap",
] as const;

export const ROLE_ORDER = ["design", "build", "ops"] as const;

export const STACK_LABELS: Record<string, string> = {
  headless_wp: "Headless WP",
  headless_shopify: "Headless Shopify",
  wp_custom_theme: "WP custom theme",
  wordpress: "WordPress",
  wordpress_ecommerce: "WordPress (ecommerce)",
  html_mobile: "HTML mobile sites",
  tumblr: "Tumblr",
  nextjs: "Next.js",
  gatsby: "Gatsby",
  gsap: "GSAP",
};

// Display labels for the stored ACF values. These are the frontend's own:
// renaming a choice label in ACF changes the WP admin only -- the value key
// ("build") is what GraphQL returns, and it deliberately stays stable.
export const ROLE_LABELS: Record<string, string> = {
  design: "Designer",
  build: "Engineer",
  ops: "Ops",
};

export interface MediaNode {
  /** Images only. WPGraphQL leaves this null for video and other files. */
  sourceUrl: string | null;
  /** The raw file URL, present for every attachment type. */
  mediaItemUrl: string | null;
  mimeType: string | null;
  altText: string | null;
  mediaDetails: { width: number | null; height: number | null } | null;
}

export interface CollaboratorTerm {
  name: string | null;
  collaboratorFields: {
    companyUrl: string | null;
    /** Single select, but ACF returns a list. Unwrap with selectValue(). */
    markerColour: string[] | null;
  } | null;
}

export interface BuildTableRow {
  year: string | null;
  site: string | null;
  /** Multi-select. Order with orderedSelect(role, ROLE_ORDER). */
  role: string[] | null;
  /** Multi-select. Order with orderedSelect(stack, STACK_ORDER). */
  stack: string[] | null;
  notes: string | null;
  linkLabel: string | null;
  link: string | null;
  isCollaboration: boolean | null;
  thumb: { node: MediaNode } | null;
  collaborator: TermConnection<CollaboratorTerm> | null;
}

export interface BuildTableFields {
  __typename: "PageSectionsSectionsBuildTableLayout";
  label: string | null;
  countDisplay: string | null;
  caption: string | null;
  rows: BuildTableRow[] | null;
}
