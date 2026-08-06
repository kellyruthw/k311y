import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * /robots.txt
 *
 * /dev is deliberately NOT disallowed, which looks like an omission and is not.
 *
 * Disallow and noindex do different jobs and interact badly. Disallow stops a
 * crawler FETCHING a URL; noindex stops it INDEXING one. app/dev/page.tsx
 * already sets `robots: { index: false, follow: false }`, and that directive
 * only works if the crawler is allowed to fetch the page and read it. Adding a
 * Disallow here would block the fetch, the noindex would never be seen, and a
 * URL that Google learned about some other way could still be indexed -- as a
 * bare link with no description, which is the outcome the noindex exists to
 * prevent. Blocking crawl is the weaker guarantee, not the stronger one.
 *
 * So /dev stays crawlable and stays out of the index, and it is absent from the
 * sitemap so nothing advertises it in the first place.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
