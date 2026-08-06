import AutoplayVideo from "@/components/UI/AutoplayVideo/AutoplayVideo";
import { isVideo, mediaUrl } from "@/lib/acf";
import type { SectionProps } from "@/lib/fragments/sections";
import type { FullWidthMediaFields } from "@/lib/fragments/caseSections";
import ZoomLens from "./ZoomLens";
import styles from "./fullWidthMedia.module.scss";

/**
 * FullWidthMedia. A single artifact across the full 8 content columns.
 *
 * "Full width" means the content column, not the viewport -- it never bleeds
 * to the page edges, which is why there is no width choice to make.
 *
 * `zoom_lens` is opt-in per section because it only earns its cost on dense
 * artifacts like the component tree board, where reading the detail is the point.
 */

type FullWidthMediaProps = FullWidthMediaFields & SectionProps;

export default function FullWidthMedia(props: FullWidthMediaProps) {
  const node = props.media?.node;
  const src = mediaUrl(node);
  if (!src) return null;

  const video = isVideo(node);

  const media = video ? (
    <AutoplayVideo className={styles.media} src={src} />
  ) : (
    /* eslint-disable-next-line @next/next/no-img-element -- full-width artifact
       sized by its container; next/image cannot serve the zoom lens. */
    <img className={styles.media} src={src} alt={node?.altText ?? ""} loading="lazy" />
  );

  return (
    <section
      id={props.id}
      data-component={props.component}
      className={styles.section}
    >
      <figure className={styles.figure} data-frame={props.frame ? "true" : "false"}>
        {props.frame ? (
          <span className={styles.chrome} aria-hidden>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </span>
        ) : null}

        {/* Only still images can be magnified; a looping video has nothing to hold. */}
        {props.zoomLens && !video ? (
          <ZoomLens src={src} alt={node?.altText ?? ""} />
        ) : (
          <div className={styles.frameInner}>{media}</div>
        )}

        {props.caption ? <figcaption className={styles.caption}>{props.caption}</figcaption> : null}
      </figure>
    </section>
  );
}
