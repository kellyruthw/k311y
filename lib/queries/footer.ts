import { fetchGraphQL } from "@/lib/graphql";

/**
 * Site footer. An ACF options page, so it is edited once and appears on every
 * page rather than being repeated in each page's sections.
 */

const SITE_FOOTER_QUERY = `
  query SiteFooter {
    siteFooter {
      siteFooterFields {
        tabLabel
        availabilityLine
        links {
          linkLabel
          linkUrl
        }
      }
    }
  }
`;

interface SiteFooterResult {
  siteFooter: {
    siteFooterFields: {
      tabLabel: string | null;
      availabilityLine: string | null;
      links: { linkLabel: string | null; linkUrl: string | null }[] | null;
    } | null;
  } | null;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface SiteFooterData {
  tabLabel: string | null;
  availabilityLine: string | null;
  links: FooterLink[];
}

export async function getSiteFooter(): Promise<SiteFooterData> {
  const data = await fetchGraphQL<SiteFooterResult>(SITE_FOOTER_QUERY);
  const fields = data.siteFooter?.siteFooterFields;

  return {
    tabLabel: fields?.tabLabel ?? null,
    availabilityLine: fields?.availabilityLine ?? null,
    links: (fields?.links ?? [])
      .filter((link) => link.linkLabel && link.linkUrl)
      .map((link) => ({ label: link.linkLabel as string, href: link.linkUrl as string })),
  };
}
