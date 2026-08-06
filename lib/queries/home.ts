import { getPage, type SitePage } from "./page";

/**
 * Home. Pages call loaders like this one, never fetchGraphQL directly -- which
 * is what lets the data source be swapped without touching a component.
 *
 * Home is a WordPress page like any other, so it is the generic page loader
 * with its URI filled in. It keeps its own name because that is what reads at
 * the call site, and because the front page is the one URI that is a site
 * setting rather than a slug.
 */

export type HomePage = SitePage;

export async function getHomePage(): Promise<HomePage | null> {
  return getPage("/");
}
