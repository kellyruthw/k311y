import type { Metadata } from "next";

/**
 * Yoast, mapped onto Next's Metadata.
 *
 * SEO is authored in WordPress like everything else on this site: the title,
 * the description and the social card are editorial decisions, and they belong
 * where the rest of the editorial decisions are. Nothing here invents copy --
 * it only translates what Yoast already holds into the shape Next wants.
 *
 * Two things Yoast says that are deliberately NOT used:
 *
 *   canonical  points at the WordPress origin and, worse, at the WordPress
 *              permalink: `/case-study/ascaya/`, where this site serves
 *              `/case-studies/ascaya`. The front end owns its own URLs, so the
 *              canonical is built from the route rather than read from the CMS.
 *
 *   opengraphUrl  same problem, same answer.
 *
 * A caution for anyone extending this: Yoast builds its output from WordPress's
 * global query state, which it does not reset between root fields in a single
 * GraphQL request. Ask for `page` and `caseStudy` together and the second one
 * comes back carrying the first one's SEO. Every loader here fetches exactly
 * one root field, which is what keeps that from happening.
 */

export const SEO_FRAGMENT = `
  seo {
    title
    metaDesc
    metaRobotsNoindex
    metaRobotsNofollow
    opengraphTitle
    opengraphDescription
    opengraphType
    opengraphImage { sourceUrl mediaItemUrl altText mediaDetails { width height } }
    twitterTitle
    twitterDescription
    twitterImage { sourceUrl mediaItemUrl }
  }
`;

interface SeoImage {
  sourceUrl?: string | null;
  mediaItemUrl?: string | null;
  altText?: string | null;
  mediaDetails?: { width: number | null; height: number | null } | null;
}

export interface YoastSeo {
  title: string | null;
  metaDesc: string | null;
  /** "index" | "noindex". A string, not a boolean. */
  metaRobotsNoindex: string | null;
  /** "follow" | "nofollow". */
  metaRobotsNofollow: string | null;
  opengraphTitle: string | null;
  opengraphDescription: string | null;
  opengraphType: string | null;
  opengraphImage: SeoImage | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: SeoImage | null;
}

/**
 * Yoast returns "" for a field the editor left blank, never null. Treating
 * those as values is how a page ends up advertising an empty description.
 */
function text(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function imageUrl(image: SeoImage | null | undefined): string | undefined {
  return text(image?.sourceUrl) ?? text(image?.mediaItemUrl);
}

export interface SeoOptions {
  /** The route this page actually serves at, e.g. "/case-studies/ascaya". */
  path: string;
  /** Used only when Yoast has no title, which means the field was cleared. */
  fallbackTitle?: string | null;
}

export function toMetadata(seo: YoastSeo | null | undefined, options: SeoOptions): Metadata {
  const { path, fallbackTitle } = options;

  const title =
    text(seo?.title) ?? (fallbackTitle ? `${fallbackTitle} / Kelly Warpechowski` : "Kelly Warpechowski");

  const description = text(seo?.metaDesc);

  // Social falls back to the page's own title and description rather than
  // being omitted: a card with no title is worse than a card that repeats one.
  const ogTitle = text(seo?.opengraphTitle) ?? title;
  const ogDescription = text(seo?.opengraphDescription) ?? description;

  // Yoast is the only source of the social image, site-wide default included:
  // with a default set in WordPress, opengraphImage comes back populated on
  // every route rather than only the ones an editor gave their own image, so
  // there is nothing for the front end to fall back to.
  //
  // Deliberately NOT app/opengraph-image.png, which Next would also accept.
  // File-based metadata outranks generateMetadata, so that file would sit on
  // top of every image authored in Yoast and nothing would report the override
  // -- changing the image in WordPress would simply stop having any effect.
  const ogImage = imageUrl(seo?.opengraphImage);
  const twImage = imageUrl(seo?.twitterImage) ?? ogImage;

  const index = seo?.metaRobotsNoindex !== "noindex";
  const follow = seo?.metaRobotsNofollow !== "nofollow";

  return {
    title,
    description,

    // Built from the route, not from Yoast. See the note at the top.
    alternates: { canonical: path },

    robots: { index, follow },

    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: path,
      siteName: "Kelly Warpechowski",
      type: seo?.opengraphType === "article" ? "article" : "website",
      images: ogImage
        ? [
            {
              url: ogImage,
              alt: text(seo?.opengraphImage?.altText) ?? ogTitle,
              width: seo?.opengraphImage?.mediaDetails?.width ?? undefined,
              height: seo?.opengraphImage?.mediaDetails?.height ?? undefined,
            },
          ]
        : undefined,
    },

    twitter: {
      card: twImage ? "summary_large_image" : "summary",
      title: text(seo?.twitterTitle) ?? ogTitle,
      description: text(seo?.twitterDescription) ?? ogDescription,
      images: twImage ? [twImage] : undefined,
    },
  };
}
