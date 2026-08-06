import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/queries/sitemap";
import { absoluteUrl } from "@/lib/site";

/**
 * /sitemap.xml
 *
 * The route list is built in lib/queries/sitemap.ts, which explains why it is
 * authored there rather than read from WordPress. This file only turns it into
 * the shape Next serialises.
 *
 * Absolute URLs, because the sitemap protocol requires them and `metadataBase`
 * does not reach here -- it resolves the metadata object, not metadata routes.
 * A relative path would build without complaint and produce an invalid file.
 *
 * /dev is absent on purpose: it is a specimen page, already noindex, and
 * nothing links to it.
 *
 * No `changeFrequency` and no `priority`. Both are advisory fields that Google
 * has said for years it ignores, and inventing values for them would be
 * decoration that reads as information.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getSitemapEntries();

  return entries.map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: entry.lastModified,
  }));
}
