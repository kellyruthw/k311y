import { fetchGraphQL } from "@/lib/graphql";

/**
 * The sitemap's data, gathered from WordPress but shaped by this app's routes.
 *
 * The direction of control matters here and is the whole reason this file
 * exists rather than the sitemap reading WordPress directly. WordPress knows
 * what CONTENT exists; only this app knows what URLs it SERVES, and the two are
 * not the same set:
 *
 *   - WP permalinks are `/case-study/ascaya/`; this site serves
 *     `/case-studies/ascaya`. Nothing derives one from the other, so a sitemap
 *     built from WP uris would list URLs that 404.
 *   - WP publishes categories, authors and posts. This site has no such routes.
 *   - An editor can add a WP page tomorrow. There is no Next route for it, so
 *     it must not appear in the sitemap until someone builds one.
 *
 * So the route list below is authored, and WordPress is asked only for the one
 * thing it is authoritative about: when each entry last changed.
 */

export interface SitemapEntry {
  /** A path on THIS site, e.g. "/case-studies/ascaya". Never a WP permalink. */
  path: string;
  /** WP's `modified`, or undefined when nothing matched. */
  lastModified?: Date;
}

/**
 * The routes that exist as files rather than as content.
 *
 * `uri` is how WordPress names the same page, used only to look its timestamp
 * up. Home is "/" on both sides; the others carry WP's trailing slash, which
 * this site's routes do not.
 */
const STATIC_ROUTES: { path: string; uri: string }[] = [
  { path: "/", uri: "/" },
  { path: "/about", uri: "/about/" },
  { path: "/process", uri: "/process/" },
];

/**
 * One root field per query, and three requests rather than one.
 *
 * That is not an oversight -- it is the rule stated at the top of lib/seo.ts.
 * Yoast builds its output from WordPress's global query state and does not
 * reset it between root fields in a single request, so a combined query can
 * come back with one post type carrying another's data. Nothing here asks for
 * `seo`, so today a combined query would be safe; it would stop being safe the
 * moment someone added a field to it, and the failure would be silent. Three
 * requests at build time cost nothing worth having that risk for.
 */
const CASE_STUDY_SITEMAP_QUERY = `
  query CaseStudySitemap {
    caseStudies(first: 100, where: { status: PUBLISH }) {
      nodes { slug modified }
    }
  }
`;

const PROJECT_SITEMAP_QUERY = `
  query ProjectSitemap {
    projects(first: 100, where: { status: PUBLISH }) {
      nodes { slug modified }
    }
  }
`;

const PAGE_SITEMAP_QUERY = `
  query PageSitemap {
    pages(first: 100, where: { status: PUBLISH }) {
      nodes { uri modified }
    }
  }
`;

interface SlugNode {
  slug: string | null;
  modified: string | null;
}

interface UriNode {
  uri: string | null;
  modified: string | null;
}

/**
 * WPGraphQL returns `modified` as "2026-08-05T23:26:43" -- local site time, no
 * zone. `new Date()` on a bare string like that is read as local by the runtime,
 * which is close enough for a lastmod and wrong to pretend otherwise about.
 *
 * An unparseable value yields undefined rather than an Invalid Date, which
 * would serialise into the XML as "Invalid Date" and make the file invalid.
 */
function toDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  const [caseStudies, projects, pages] = await Promise.all([
    fetchGraphQL<{ caseStudies: { nodes: SlugNode[] } | null }>(CASE_STUDY_SITEMAP_QUERY),
    fetchGraphQL<{ projects: { nodes: SlugNode[] } | null }>(PROJECT_SITEMAP_QUERY),
    fetchGraphQL<{ pages: { nodes: UriNode[] } | null }>(PAGE_SITEMAP_QUERY),
  ]);

  const pageDates = new Map<string, string | null>(
    (pages.pages?.nodes ?? [])
      .filter((node): node is UriNode & { uri: string } => Boolean(node.uri))
      .map((node) => [node.uri, node.modified]),
  );

  const staticEntries: SitemapEntry[] = STATIC_ROUTES.map((route) => ({
    path: route.path,
    lastModified: toDate(pageDates.get(route.uri)),
  }));

  const entryFor = (prefix: string) => (node: SlugNode) => ({
    path: `${prefix}/${node.slug}`,
    lastModified: toDate(node.modified),
  });

  const hasSlug = (node: SlugNode): node is SlugNode & { slug: string } => Boolean(node.slug);

  return [
    ...staticEntries,
    ...(caseStudies.caseStudies?.nodes ?? []).filter(hasSlug).map(entryFor("/case-studies")),
    ...(projects.projects?.nodes ?? []).filter(hasSlug).map(entryFor("/projects")),
  ];
}
