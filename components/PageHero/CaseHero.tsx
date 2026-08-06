import type { ReactNode } from "react";
import Table from "@/components/Table/Table";
import AutoplayVideo from "@/components/UI/AutoplayVideo/AutoplayVideo";
import { isVideo, mediaUrl, toLines } from "@/lib/acf";
import type { PageHeroFields } from "@/lib/fragments/pageHero";
import type { SectionProps } from "@/lib/fragments/sections";
import styles from "./caseHero.module.scss";

/**
 * The case-study and project hero.
 *
 * The H1 is the descriptive line -- "Content architecture for Las Vegas's
 * premier luxury community" -- not the entry name. The name is the post title
 * and appears in the nav.
 *
 * MetaBlock is rendered here rather than being a section of its own: it authors
 * no fields, it always sits beside the media, and in the nav it is a diamond
 * hanging off this hero rather than a node in its own right.
 */

type CaseHeroProps = PageHeroFields & SectionProps;

/**
 * A meta value can carry a second line, which renders smaller and italic --
 * "Ascaya, via Wicked+" over "(agency partner of 8+ years)".
 *
 * Splitting on the authored line break rather than adding note fields keeps
 * the CMS to one input per row, and the break is visible while typing it.
 */
function metaRow(label: string, value: string | null): { label: string; value: ReactNode } | null {
  if (!value) return null;

  const [first, ...rest] = toLines(value);
  if (!first) return null;

  return {
    label,
    value: (
      <>
        <span className={styles.metaValue}>{first}</span>
        {rest.length ? <span className={styles.metaNote}>{rest.join(" ")}</span> : null}
      </>
    ),
  };
}

export default function CaseHero(props: CaseHeroProps) {
  const node = props.media?.node;
  const src = mediaUrl(node);
  const meta = props.meta;

  const rows = [
    metaRow("Client", meta?.client ?? null),
    metaRow("Role", meta?.role ?? null),
    meta?.stack.length ? { label: "Stack", value: meta.stack.join(" · ") } : null,
    metaRow("Timeline", meta?.timeline ?? null),
    meta?.liveUrl
      ? {
          label: "Live",
          value: (
            <a className={styles.liveLink} href={meta.liveUrl} target="_blank" rel="noreferrer">
              {meta.liveUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
            </a>
          ),
        }
      : null,
  ].filter((row): row is { label: string; value: ReactNode } => row !== null);

  return (
    <section
      id={props.id}
      data-component={props.component}
      data-variant="case"
      className={styles.hero}
    >
      {props.title ? (
        <h1 className={styles.title}>
          {toLines(props.title).map((line) => (
            <span key={line} className={styles.titleLine}>
              {line}
            </span>
          ))}
        </h1>
      ) : null}

      {rows.length ? (
        <div className={styles.meta} data-component="MetaBlock">
          <Table orientation="vertical" rows={rows} />
        </div>
      ) : null}

      {src ? (
        <div className={styles.mediaFrame}>
          {isVideo(node) ? (
            <AutoplayVideo className={styles.media} src={src} />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element -- fixed ratio
               frame sized by CSS. */
            <img
              className={styles.media}
              src={src}
              alt={node?.altText ?? props.entryName ?? ""}
              // Above the fold, so it must not be lazy.
              loading="eager"
            />
          )}
        </div>
      ) : null}
    </section>
  );
}
