import type { Metadata } from "next";
import ScrollRefresh from "@/components/UI/ScrollRefresh/ScrollRefresh";
import GoogleAnalytics from "@/components/UI/GoogleAnalytics/GoogleAnalytics";
import { SITE_URL } from "@/lib/site";
import "@/styles/main.scss";

/**
 * Every route builds its own metadata from Yoast, through lib/seo.ts. What is
 * left here is the base the rest resolves against, and the fallback for the one
 * route that authors nothing (/dev).
 *
 * metadataBase has to be absolute: the canonical and og:url each route returns
 * are paths like "/about", and without a base Next cannot turn those into the
 * absolute URLs both tags require. It is deliberately NOT the WordPress origin
 * -- these URLs belong to the front end.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Kelly Warpechowski",
  description: "Design engineer building the sites you see and the systems you don't.",
};

/**
 * The two files that render above the fold. Preloading only these keeps the
 * critical path small; the rest load on demand via font-display: swap.
 *
 * Google Sans Flex is one variable file covering every weight the site uses, so
 * this is no longer a bet on which weight appears first -- preloading it covers
 * the hero, the body copy and everything else set in it. The latin-ext subset
 * is deliberately not here: it is only fetched by a page that uses one of its
 * characters, and preloading it would download it for every page that does not.
 */
const PRELOADED_FONTS = [
  "/fonts/GoogleSansFlex-latin.woff2",
  "/fonts/AOTSerialMono-Medium.woff2",
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {PRELOADED_FONTS.map((href) => (
          <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="" />
        ))}

        {/*
          The counterweight to the pre-animation state in styles/base/_globals.
          That rule hides what GSAP is about to animate so it does not flash in
          its finished position first; with scripting off there is no GSAP to
          reveal it again, and content that never appears is worse than content
          that never moved.

          A <noscript> rather than a class set by an inline script: it needs no
          JavaScript to be correct, so it cannot itself be the thing that fails.
          `!important` because the stylesheet's own load order relative to this
          is not something a layout can promise.
        */}
        <noscript>
          <style>
            {`[data-hero-part],[data-enter],[data-work-card],[data-note],[data-word],[data-hero-simple],[data-list-head],[data-list-item],[data-bg-copy],[data-media-half],[data-copy-half],[data-enter-block]{opacity:1!important;visibility:visible!important}` +
              `[data-hero-part="box"],[data-footer-rise]{transform:none!important}[data-bg-media]{clip-path:none!important}`}
          </style>
        </noscript>
      </head>
      <body>
        {/*
          ScrollTrigger re-measures on the window `load` event, which a
          client-side navigation never fires. Without this, every scroll-driven
          entrance on a route reached through the router keeps whatever it
          measured mid-hydration.
        */}
        <ScrollRefresh />
        {children}

        {/*
          Last in the body, and rendering nothing at all unless NEXT_PUBLIC_GA_ID
          is set to a real Measurement ID. See the component for why a numeric
          Property ID is rejected rather than passed through.
        */}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
