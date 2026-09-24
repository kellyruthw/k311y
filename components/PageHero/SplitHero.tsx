import Prose from "@/components/UI/Prose/Prose";
import AutoplayVideo from "@/components/UI/AutoplayVideo/AutoplayVideo";
import { isVideo, mediaUrl, selectValue, toLines } from "@/lib/acf";
import { scrollToAnchor } from "@/lib/anchors";
import type { PageHeroFields } from "@/lib/fragments/pageHero";
import type { SectionProps } from "@/lib/fragments/sections";
import styles from "./splitHero.module.scss";

/**
 * PageHero, split variant. A full-height opener: media on 4 of the 8 content
 * columns, copy on the other 4, either way round.
 *
 * No entrance animation, for the same reason the simple variant has none: the
 * sequence approved in lib/schema.md is the home one and says so. This renders
 * its finished state.
 *
 * Not "use client" itself -- PageHero above it already is, so this ships to the
 * client with it and the CTA's handler works without a second directive.
 */

type SplitHeroProps = PageHeroFields & SectionProps;

/**
 * The CTA scrolls to a section on the same page.
 *
 * The href stays a real fragment, so with JS off, or before hydration, the
 * browser's own jump still lands in the right place. The handler only takes
 * over to make that jump smooth, and steps aside entirely when nothing matches
 * -- an anchor pointing at a section that has since been removed should behave
 * like a normal broken link, not silently do nothing.
 *
 * Resolving and scrolling live in lib/anchors.ts, shared with StackedHero.
 */
function AnchorCta({ label, link }: { label: string; link: string }) {
  return (
    <a
      href={link}
      className={styles.cta}
      onClick={(event) => {
        if (scrollToAnchor(link)) event.preventDefault();
      }}
    >
      <span className={styles.ctaLabel}>{label}</span>
    </a>
  );
}

export default function SplitHero(props: SplitHeroProps) {
  const node = props.media?.node;
  const src = mediaUrl(node);

  // Right unless told otherwise, matching the ACF default.
  const side = selectValue(props.mediaSide) === "left" ? "left" : "right";

  // Both halves of the CTA or none of it: a label with no destination is not a
  // link, and a destination with no label is nothing to click.
  const ctaLabel = props.ctaLabel?.trim();
  const ctaLink = props.ctaLink?.trim();
  const hasCta = Boolean(ctaLabel && ctaLink);

  return (
    <section
      id={props.id}
      data-component={props.component}
      data-variant="split"
      data-media-side={side}
      className={styles.hero}
    >
      <div className={styles.copy}>
        {props.kicker ? <p className={styles.kicker}>{props.kicker}</p> : null}

        {props.title ? (
          <h1 className={styles.title}>
            {/* Authored breaks are structural, same as every other hero. */}
            {toLines(props.title).map((line) => (
              <span key={line} className={styles.titleLine}>
                {line}
              </span>
            ))}
          </h1>
        ) : null}

        <Prose value={props.intro} className={styles.intro} />

        {hasCta ? <AnchorCta label={ctaLabel as string} link={ctaLink as string} /> : null}
      </div>

      {src ? (
        <div className={styles.mediaFrame}>
          {isVideo(node) ? (
            <AutoplayVideo className={styles.media} src={src} />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element -- the frame is
               sized by the grid column and the viewport, not by a fixed ratio. */
            <img
              className={styles.media}
              src={src}
              alt={node?.altText ?? ""}
              // Above the fold on every page that uses this, so never lazy.
              loading="eager"
            />
          )}
        </div>
      ) : null}
    </section>
  );
}
