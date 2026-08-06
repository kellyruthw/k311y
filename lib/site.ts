/**
 * The front end's own origin, in one place.
 *
 * Three things need it and need it to agree: `metadataBase` in app/layout.tsx,
 * which resolves every canonical and og:url; app/sitemap.ts, where the spec
 * requires absolute URLs and Next does NOT apply metadataBase; and
 * app/robots.ts, which has to point at the sitemap by absolute URL for the same
 * reason. Written out three times these could disagree, and the failure would
 * be silent -- a sitemap listing one host while the pages canonicalise to
 * another is a self-inflicted duplicate-content problem that renders fine.
 *
 * The live site is the default rather than localhost, deliberately. A canonical
 * is only wrong in one direction that matters: a production page advertising
 * `http://localhost:3000/about` is an SEO problem that nothing on the page
 * would reveal, and it happens the moment an env var is missed on a deploy.
 * Defaulting to the real origin means that failure cannot happen; the variable
 * exists to point a staging or preview build somewhere else, which is the case
 * that can afford to be explicit.
 *
 * Deliberately NOT the WordPress origin. These URLs belong to the front end --
 * see the note at the top of lib/seo.ts about why Yoast's own canonical and
 * sitemap are unusable here.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://k311y.com";

/** `${SITE_URL}${path}`, with no double slash when path is "/". */
export function absoluteUrl(path: string): string {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}
