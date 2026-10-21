"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Tab from "@/components/UI/Tab/Tab";
import { onAnchor, scrollToAnchor } from "@/lib/anchors";
import type { SiteFooterData } from "@/lib/queries/footer";
import styles from "./siteFooter.module.scss";

gsap.registerPlugin(ScrollTrigger);

/**
 * SiteFooter. Identical on every page.
 *
 * Everything it shows comes from the options page and nothing about it responds
 * to the viewer. The only client behaviour is its entrance: the block rises
 * into the page as the bottom is reached.
 */

export default function SiteFooter({ tabLabel, availabilityLine, links }: SiteFooterData) {
  const scope = useRef<HTMLElement>(null);

  /**
   * The footer rises into place as the page bottom arrives, and goes back down
   * if you leave. Scrubbed rather than played: its position is a function of
   * the scroll, so it is wherever the scroll says it is and scrolling away
   * returns it rather than leaving it finished.
   *
   * The range is the footer's own height -- from its top entering the viewport
   * to its bottom meeting the viewport's. That second edge is the document's
   * end, so the block lands exactly as the page runs out, with no scroll left
   * over on either side of the movement.
   *
   * `ease: "none"`, as every scrubbed tween on this site uses. An ease against
   * scroll position does not read as easing, it reads as the page lagging.
   *
   * The TAB AND BODY move together, inside a wrapper the footer clips. That is
   * what makes "from off the screen" safe: a transformed element still adds to
   * the document's scrollable area, so translating the block down by its own
   * height without clipping would hand the reader an extra screen of empty page
   * to scroll through before it moved. The wrapper takes the space in normal
   * flow, the block travels inside it, and the document's height never changes.
   *
   * fromTo rather than from, because the pre-animation state in
   * styles/base/_globals.scss already holds it down and `from` would read that
   * as the destination.
   */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const root = scope.current;
        const inner = root?.querySelector<HTMLElement>("[data-footer-rise]");
        if (!root || !inner) return;

        // `y: 0` in BOTH halves, and it is not redundant -- without it the
        // footer never came back up at all.
        //
        // The pre-animation state sets `transform: translateY(100%)` in CSS.
        // GSAP reads the COMPUTED transform, where that percentage has already
        // resolved to pixels, and records it as its own `y`. A tween that then
        // moves `yPercent` is moving a different property: it ran 100 to 0
        // while `y` sat at a full height of pixels the whole time, so the block
        // stayed exactly where it started -- and being clipped, stayed
        // invisible. Naming `y` zeroes what CSS put there and leaves `yPercent`
        // the only thing moving.
        const scrubbed = gsap.fromTo(
          inner,
          { yPercent: 100, y: 0 },
          {
            yPercent: 0,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top bottom",
              end: "bottom bottom",
              scrub: 0.6,
            },
          },
        );

        /**
         * The contact peek: the same arrival, summoned instead of scrolled to.
         *
         * On the sidebar's Contact the whole footer fixes to the viewport
         * bottom and rises exactly as the scrubbed entrance does; the first
         * scroll afterwards plays it back down and returns the footer to the
         * page flow, where the scrub still owns it.
         *
         * The ROOT travels here where the scrub moves the inner block, and
         * that is what lets the two coexist: the scrub goes on writing the
         * inner transform with every scroll, so peeking the same element would
         * be two tweens fighting over one property. While the peek is up, CSS
         * neutralises the inner transform (see [data-peek] in the stylesheet)
         * and the root is the only thing moving; when it ends, the inner
         * transform the scrub kept current simply reapplies.
         */
        let peeked = false;

        // Any click outside the footer dismisses it, the same as scrolling:
        // the reader has moved on to something else.
        const onOutsidePress = (event: PointerEvent) => {
          if (!root.contains(event.target as Node)) slideDown();
        };

        const slideDown = () => {
          window.removeEventListener("scroll", slideDown);
          document.removeEventListener("pointerdown", onOutsidePress);
          gsap.to(root, {
            yPercent: 100,
            y: 0,
            duration: 0.45,
            ease: "power2.in",
            onComplete: () => {
              root.removeAttribute("data-peek");
              gsap.set(root, { clearProps: "transform" });
              peeked = false;
            },
          });
        };

        const peek = () => {
          if (peeked) return;

          // Already rising in the viewport: a fixed copy would double it on
          // screen, so finish the trip the reader has nearly made instead.
          if ((scrubbed.scrollTrigger?.progress ?? 0) > 0) {
            scrollToAnchor("#contact");
            return;
          }

          peeked = true;
          root.setAttribute("data-peek", "true");
          gsap.fromTo(
            root,
            { yPercent: 100, y: 0 },
            {
              yPercent: 0,
              y: 0,
              duration: 0.6,
              ease: "power2.out",
              // Armed on arrival rather than on click, so the tail of the
              // scroll that was already in flight -- or the click that opened
              // it -- cannot dismiss the footer before it has arrived.
              onComplete: () => {
                window.addEventListener("scroll", slideDown, { passive: true });
                document.addEventListener("pointerdown", onOutsidePress);
              },
            },
          );
        };

        const offAnchor = onAnchor((hash) => {
          if (hash === "contact") peek();
        });

        return () => {
          offAnchor();
          window.removeEventListener("scroll", slideDown);
          document.removeEventListener("pointerdown", onOutsidePress);
        };
      });

      // Without the peek's motion, Contact keeps its old meaning: go to the
      // footer. scrollToAnchor already answers reduced motion with a jump.
      mm.add("(prefers-reduced-motion: reduce)", () =>
        onAnchor((hash) => {
          if (hash === "contact") scrollToAnchor("#contact");
        }),
      );

      return () => mm.revert();
    },
    { scope },
  );

  if (!availabilityLine && !links.length) return null;

  return (
    <>
      <footer ref={scope} className={styles.footer} data-component="SiteFooter" id="contact">
      <div data-footer-rise>
        {tabLabel ? <Tab className={styles.tab}>{tabLabel}</Tab> : null}

        {/* Ruled on the top and left, so the footer reads as one bounded block
            hanging off the tab rather than a run of loose text. */}
        <div className={styles.body}>
        {availabilityLine ? <p className={styles.availability}>{availabilityLine}</p> : null}

        {links.length ? (
          <ul className={styles.links}>
            {links.map((link) => {
              const isRoute = link.href.startsWith("/");
              const opensAway = /^https?:/i.test(link.href);

              return (
                <li key={link.href + link.label}>
                  {isRoute ? (
                    <Link href={link.href} className={styles.link}>
                      <span className={styles.linkLabel}>{link.label}</span>
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className={styles.link}
                      target={opensAway ? "_blank" : undefined}
                      rel={opensAway ? "noreferrer" : undefined}
                    >
                      <span className={styles.linkLabel}>{link.label}</span>
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
          ) : null}
        </div>
      </div>
      </footer>

      {/* Behind the peeked footer: a full-viewport veil that blurs the page a
          touch, so the summoned footer reads as the front object without a
          scrim darkening everything. A sibling AFTER the footer because CSS
          can reach a following sibling and not a preceding one, and it cannot
          live inside: the peek transform would make the footer the fixed
          child's containing block and clip it. Sits a z-index under the
          footer; pointer-events: none, so the click-away and scroll
          dismissals reach the page through it. */}
      <div className={styles.veil} aria-hidden />
    </>
  );
}
