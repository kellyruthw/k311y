import Script from "next/script";

/**
 * GA4, loaded from an env var rather than a hardcoded ID.
 *
 * Not hardcoded for two reasons. A build with no ID set renders nothing at all,
 * so `next dev` and preview deploys do not report into the production property
 * and quietly corrupt the numbers -- which is the failure you would not notice,
 * because the data looks plausible. And the ID stays out of the repo, which
 * matters less than the first reason but costs nothing.
 *
 * A server component. `next/script` needs no client boundary here, so nothing
 * about analytics reaches the client bundle except the tag itself.
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_ID?.trim();

/**
 * A GA4 Measurement ID: "G-" and then ten-ish alphanumerics.
 *
 * This check exists because of a specific, easy, silent mistake. GA shows
 * several identifiers and only one of them works here:
 *
 *   Measurement ID   G-XXXXXXXXXX   what gtag.js needs -- this one
 *   Property ID      323708029      9 digits, shown in Admin > Property details
 *   Account ID       another number, shown in Admin > Account details
 *   Stream ID        another number again, beside the Measurement ID
 *
 * Give gtag a numeric ID and nothing errors. The script loads, the page runs,
 * and no data is ever collected -- so the first sign of trouble is an empty
 * report weeks later. Failing loudly in dev is worth more than that silence.
 */
const MEASUREMENT_ID = /^G-[A-Z0-9]{6,}$/i;

export default function GoogleAnalytics() {
  if (!GA_ID) return null;

  if (!MEASUREMENT_ID.test(GA_ID)) {
    // Dev only. A bad ID must not take a production build down over analytics,
    // but it must not pass unremarked in the terminal either.
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[analytics] NEXT_PUBLIC_GA_ID is "${GA_ID}", which is not a GA4 Measurement ID.\n` +
          `  Expected the G-XXXXXXXXXX form. A numeric value is the Property, Account or\n` +
          `  Stream ID, none of which gtag.js can use -- it would load and collect nothing.\n` +
          `  Find it in GA: Admin > Data streams > your web stream, top right.\n` +
          `  The tag is not being rendered.`,
      );
    }
    return null;
  }

  return (
    <>
      {/*
        afterInteractive, not beforeInteractive: analytics has no business
        competing with the page for the main thread before it is usable, and
        beforeInteractive would block hydration for a script whose result
        nothing on the page depends on.
      */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />

      {/*
        No manual page_view on route change, which is the thing most App Router
        GA snippets add and the thing that most often double-counts.
        GA4's Enhanced measurement is on by default and includes "page changes
        based on browser history events". Next's App Router navigates with
        pushState, so those navigations already register. Sending our own
        page_view on top of that reports every client-side navigation twice.

        If Enhanced measurement is ever turned off for this stream, that is the
        moment to add an explicit page_view here -- not before.
      */}
      {/*
        The two flags keep this out of Google's advertising ecosystem.

        allow_google_signals            off: no data into Google's cross-site
                                        ads graph, no remarketing audiences
        allow_ad_personalization_signals off: this traffic is not used to
                                        personalise ads anywhere

        Both default to ON, so leaving them out is a decision too -- just an
        unstated one. Switched off because feeding an ads network is the only
        part of GA4 that resembles "sharing personal information for
        cross-context behavioural advertising", which is the thing California's
        CPRA is actually built around. This site is far below every CCPA
        threshold and is not a regulated business, so nothing here is required;
        it is off because the site has no use for it and the cost of declining
        is a report nobody was going to read.

        What it costs: Demographics & Interests (age, gender, affinity
        categories), which need Google Signals. Everything worth looking at --
        sessions, pages, referrers, devices, geography -- is untouched.

        Not included: anonymize_ip. That is a Universal Analytics flag and does
        nothing in GA4, which never stores IP addresses in the first place --
        it derives coarse geography and discards them. Setting it would only
        look like a protection that was already unconditional.
      */}
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}', {
  allow_google_signals: false,
  allow_ad_personalization_signals: false
});`}
      </Script>
    </>
  );
}
