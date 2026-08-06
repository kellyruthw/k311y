import Link from "next/link";
import AutoplayVideo from "@/components/UI/AutoplayVideo/AutoplayVideo";
import Tab from "@/components/UI/Tab/Tab";
import { isVideo, mediaUrl } from "@/lib/acf";
import type { SectionProps } from "@/lib/fragments/sections";
import type { NextCaseFields } from "@/lib/fragments/caseSections";
import styles from "./nextCase.module.scss";

/**
 * NextCase. A tab-labelled block, wholly clickable.
 *
 * Title and media fall back to the referenced entry's own card fields, so the
 * common case is authored by picking a case study and nothing else. Overriding
 * either is possible but rarely needed.
 */

type NextCaseProps = NextCaseFields & SectionProps;

export default function NextCase(props: NextCaseProps) {
  const next = props.nextRef?.nodes?.[0];
  if (!next?.slug) return null;

  const title = props.title ?? next.caseStudyMeta?.cardSummary ?? next.title;
  const node = props.media?.node ?? next.caseStudyMeta?.cardMedia?.node;
  const src = mediaUrl(node);

  return (
    <section id={props.id} data-component={props.component} className={styles.section}>
      <Tab className={styles.tab}>Next case study</Tab>

      <Link href={`/case-studies/${next.slug}`} className={styles.card}>
        <div className={styles.copy}>
          {next.title ? <p className={styles.name}>{next.title}</p> : null}
          {title ? <p className={styles.title}>{title}</p> : null}

          {props.linkLabel ? (
            <span className={styles.action}>
              <span className={styles.actionLabel}>{props.linkLabel}</span>
              <svg className={styles.arrow} viewBox="0 0 24 24" aria-hidden focusable="false">
                <path
                  d="M4 12h15M13 6l6 6-6 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          ) : null}
        </div>

        {src ? (
          <span className={styles.frame}>
            {isVideo(node) ? (
              <AutoplayVideo className={styles.media} src={src} />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element -- fixed ratio
                 frame sized by CSS. */
              <img className={styles.media} src={src} alt={node?.altText ?? ""} loading="lazy" />
            )}
          </span>
        ) : null}
      </Link>
    </section>
  );
}
