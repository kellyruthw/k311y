import Prose from "@/components/UI/Prose/Prose";
import AutoplayVideo from "@/components/UI/AutoplayVideo/AutoplayVideo";
import { isVideo, mediaUrl, selectValue, toLines } from "@/lib/acf";
import { scrollToAnchor } from "@/lib/anchors";
import type { PageHeroFields } from "@/lib/fragments/pageHero";
import type { SectionProps } from "@/lib/fragments/sections";
import styles from "./stackedHero.module.scss";

/**
 * PageHero, stacked variant. The same full-height opener as split, arranged the
 * other way round: the H1 runs across 7 of the 8 columns and the media and copy
 * sit in a row beneath it, 4 columns each.
 *
 * It authors nothing of its own -- every field here is one the split variant
 * already had, which is why this is a variant and not a layout.
 *
 * Static, like split and simple. The animation approved in lib/schema.md is the
 * home sequence and says so.
 */

type StackedHeroProps = PageHeroFields & SectionProps;

/**
 * The CTA scrolls to a section on the same page.
 *
 * The resolving and scrolling live in lib/anchors.ts, shared with SplitHero --
 * what differs between the two heroes is only how the link is drawn. The href
 * stays a real fragment, so the browser's own jump still works with JS off and
 * before hydration; the handler only takes over when it has somewhere to go.
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
      {label}
    </a>
  );
}

export default function StackedHero(props: StackedHeroProps) {
  const node = props.media?.node;
  const src = mediaUrl(node);

  // Figma puts the media on the left here, which is the other way round from
  // split. The field is the same one either way.
  const side = selectValue(props.mediaSide) === "right" ? "right" : "left";

  const ctaLabel = props.ctaLabel?.trim();
  const ctaLink = props.ctaLink?.trim();
  const hasCta = Boolean(ctaLabel && ctaLink);

  return (
    <section
      id={props.id}
      data-component={props.component}
      data-variant="stacked"
      data-media-side={side}
      className={styles.hero}
    >
      {/*
        Kicker and title are one grid child rather than two, so the hero has
        exactly two rows whether or not a kicker is authored. As separate
        children an optional kicker adds a third row, and the `1fr` that is
        meant to give the media row the remaining height lands on the title
        instead.
      */}
      <div className={styles.head}>
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

      <div className={styles.copy}>
        <Prose value={props.intro} className={styles.intro} />

        {hasCta ? <AnchorCta label={ctaLabel as string} link={ctaLink as string} /> : null}
      </div>
    </section>
  );
}
