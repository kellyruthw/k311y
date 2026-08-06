import type { Metadata } from "next";
import Resume from "@/components/Resume/Resume";
import { baseResume } from "@/lib/resume/base";
import "./print.scss";

/**
 * /resume
 *
 * Outside app/(site)/ deliberately. Chrome on this site is composed per page --
 * SidebarNav and SiteFooter are imported by the pages that want them, not by a
 * layout -- so a route that imports neither already inherits none. Sitting
 * outside the group as well means a group layout added later cannot reach it.
 *
 * Statically rendered with no configuration: nothing here reads cookies(),
 * headers() or searchParams, and the content is a module import rather than a
 * fetch, so Next prerenders it at build time like every other route. It is also
 * the only page on the site that does not depend on WordPress being up to build.
 *
 * The metadata is written out rather than passed through lib/seo.ts's
 * toMetadata(). That function's whole contract is "translate what Yoast holds
 * into the shape Next wants", and there is no Yoast record behind this page.
 * Passing it null works and returns no description at all, which is the one
 * thing an indexable page cannot go without; passing it a fabricated YoastSeo
 * object to save six lines would make the function lie about its input, and send
 * the next reader into WordPress after a page that is not there.
 *
 * Every value below comes off the content file, so tailoring the resume and
 * tailoring its search result stay one edit.
 */

const TITLE = `Resume / ${baseResume.name}`;

export const metadata: Metadata = {
  title: TITLE,
  description: baseResume.metaDescription,

  // A path, resolved against metadataBase in app/layout.tsx, like every other
  // canonical on this site.
  alternates: { canonical: "/resume" },

  // Explicit rather than inherited. This is the page most worth indexing on the
  // whole site, and stating so means a future site-wide default cannot quietly
  // take it out.
  robots: { index: true, follow: true },

  openGraph: {
    title: TITLE,
    description: baseResume.metaDescription,
    url: "/resume",
    siteName: baseResume.name,
    type: "website",
    // No image. Yoast supplies the site-wide default on every other route and
    // there is nothing here to ask; an og:image invented for one page would be
    // the only one on the site not authored where the others are. The Twitter
    // card degrades to "summary", which is right for a document.
  },
};

export default function ResumePage() {
  return <Resume content={baseResume} />;
}
