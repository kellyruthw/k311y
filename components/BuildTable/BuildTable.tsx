import Link from "next/link";
import Table, { type TableRowCell } from "@/components/Table/Table";
import ThumbCursor from "./ThumbCursor";
import AutoplayVideo from "@/components/UI/AutoplayVideo/AutoplayVideo";
import { firstTerm, isVideo, mediaUrl, orderedSelect, selectValue } from "@/lib/acf";
import {
  ROLE_LABELS,
  ROLE_ORDER,
  STACK_LABELS,
  STACK_ORDER,
  type BuildTableFields,
  type BuildTableRow,
  type CollaboratorTerm,
} from "@/lib/fragments/buildTable";
import styles from "./buildTable.module.scss";
import type { SectionProps } from "@/lib/fragments/sections";

/**
 * BuildTable. Renders through the shared Table primitive in horizontal mode.
 *
 * The legend under the table is derived from the collaborator terms the rows
 * actually use, so it can never list an agency that appears nowhere, or omit
 * one that does.
 */

type BuildTableProps = BuildTableFields & SectionProps;

// "Media" is a deck-only column: it renders nothing above `tablet`, where the
// thumbnail is a hover affordance rather than content. Declared here so the
// cell carries a data-column like every other and can be addressed by name.
const COLUMNS = ["Media", "Year", "Site", "Role", "Stack", "Notes", "Link"];

/** One glyph for every collaboration. Only the colour changes. */
const MARKER = "✦";

/**
 * Rows sort by year, most recent first. A year can be a range like "2022-2024",
 * so the leading four digits are what counts. Array.prototype.sort is stable,
 * so rows sharing a year keep the order they were dragged into in ACF.
 */
function startYear(row: BuildTableRow): number {
  const match = row.year?.match(/\d{4}/);
  return match ? Number(match[0]) : 0;
}

function sortRows(rows: BuildTableRow[]): BuildTableRow[] {
  return [...rows].sort((a, b) => startYear(b) - startYear(a));
}

function collaboratorOf(row: BuildTableRow): CollaboratorTerm | null {
  if (!row.isCollaboration) return null;
  return firstTerm(row.collaborator);
}

/** Agencies in the order they first appear in the table. */
function usedCollaborators(rows: BuildTableRow[]): CollaboratorTerm[] {
  const seen = new Map<string, CollaboratorTerm>();

  for (const row of rows) {
    const term = collaboratorOf(row);
    if (term?.name && !seen.has(term.name)) seen.set(term.name, term);
  }

  return [...seen.values()];
}

function markerClass(term: CollaboratorTerm | null): string {
  const colour = selectValue(term?.collaboratorFields?.markerColour);
  if (colour === "pink") return styles.markerPink;
  if (colour === "green") return styles.markerGreen;
  return styles.markerBlue;
}

/**
 * Roles read "Designer + Engineer + Ops", each label as written: they are job
 * titles now rather than the activities build-table.md phrased as a sentence,
 * and the Stack line beside them already keeps every label's own casing.
 */
function joinRoles(value: string[] | null): string {
  return orderedSelect(value, ROLE_ORDER)
    .map((choice) => ROLE_LABELS[choice] ?? choice)
    .join(" + ");
}

/** Stack keeps every label's own casing: "Headless WP · Next.js · GSAP". */
function joinStack(value: string[] | null): string {
  return orderedSelect(value, STACK_ORDER)
    .map((choice) => STACK_LABELS[choice] ?? choice)
    .join(" · ");
}

function LinkCell({ row }: { row: BuildTableRow }) {
  if (!row.link || !row.linkLabel) return null;

  // Internal paths get client-side navigation; anything else opens away.
  if (row.link.startsWith("/")) {
    return (
      <Link href={row.link} className={styles.link}>
        {row.linkLabel}
      </Link>
    );
  }

  return (
    <a href={row.link} className={styles.link} target="_blank" rel="noreferrer">
      {row.linkLabel}
    </a>
  );
}

/**
 * The thumbnail, in a column of its own.
 *
 * It sat inside the site cell until the deck needed it above the site name AND
 * needed the year beside that name. Both cannot be true while the two share a
 * cell: anything on the name's line also has to clear the image above it. A
 * column of its own is what lets the card place them independently.
 *
 * The column never renders on desktop -- see `[data-column="Media"]` in the
 * stylesheet -- so the table still reads as the six columns Figma draws.
 */
function MediaCell({ row }: { row: BuildTableRow }) {
  const thumb = row.thumb?.node;
  const thumbSrc = mediaUrl(thumb);
  if (!thumbSrc) return null;

  const media = (
    <span
      className={styles.thumbSource}
      data-thumb-src={thumbSrc}
      data-thumb-video={isVideo(thumb) ? "true" : "false"}
      aria-hidden
    >
      {isVideo(thumb) ? (
        <AutoplayVideo className={styles.thumbMedia} src={thumbSrc} />
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element -- a fixed-ratio
           frame sized by the card it sits in, not by intrinsic dimensions. */
        <img className={styles.thumbMedia} src={thumbSrc} alt="" loading="lazy" />
      )}
    </span>
  );

  if (!row.link) return media;

  /**
   * The image goes where the card's link goes. On a card, a picture that does
   * nothing when tapped is the largest dead target on the screen. 11 of the 22
   * cards in the deck have somewhere to go; the rest stay inert, which is the
   * same rule the desktop row hover follows.
   *
   * `tabIndex={-1}` and `aria-hidden` together, and both are needed.
   *
   * The card already carries a visible, labelled link -- "Case study", "View
   * site" -- and this is a second route to the identical destination. Exposed,
   * it would be two tab stops and two announcements on one card with nothing to
   * tell them apart. Hidden without also being removed from the tab order it
   * would be worse than either: a focusable element inside `aria-hidden` is a
   * stop a keyboard can reach and a screen reader cannot describe.
   *
   * So a pointer gets the whole image, a keyboard and a screen reader get the
   * one labelled link, and nobody is offered the same destination twice.
   */
  const linkProps = { className: styles.thumbLink, tabIndex: -1, "aria-hidden": true } as const;

  if (row.link.startsWith("/")) {
    return (
      <Link href={row.link} {...linkProps}>
        {media}
      </Link>
    );
  }

  return (
    <a href={row.link} {...linkProps} target="_blank" rel="noreferrer">
      {media}
    </a>
  );
}

function SiteCell({ row }: { row: BuildTableRow }) {
  const term = collaboratorOf(row);

  return (
    <span className={styles.site}>
      <span className={styles.siteName}>{row.site}</span>

      {term ? (
        <span
          className={`${styles.marker} ${markerClass(term)}`}
          title={`via ${term.name}`}
          aria-label={`via ${term.name}`}
          role="img"
        >
          {MARKER}
        </span>
      ) : null}

      {/*
        The thumbnail is no longer here -- see MediaCell above. On a pointer
        device it is still only a SOURCE: ThumbCursor reads the data attributes
        off the closest row, so it finds them wherever in the row they sit.
      */}
    </span>
  );
}

export default function BuildTable(props: BuildTableProps) {
  const rows = sortRows(props.rows ?? []);
  if (!rows.length) return null;

  const collaborators = usedCollaborators(rows);

  const tableRows: TableRowCell[][] = rows.map((row) => [
    { content: <MediaCell row={row} /> },
    { content: row.year ?? "" },
    { content: <SiteCell row={row} /> },
    { content: joinRoles(row.role) },
    { content: joinStack(row.stack) },
    { content: row.notes ?? "" },
    { content: <LinkCell row={row} /> },
  ]);

  return (
    <section id={props.id} data-component={props.component} className={styles.section}>
      <ThumbCursor>
        <Table
          orientation="horizontal"
          name={props.label}
          countDisplay={props.countDisplay}
          showHeaders
          columns={COLUMNS}
          rows={tableRows}
          className={styles.table}
          // 31 rows. Stacked as cards that is roughly 8,000px of page, which is
          // more of it than the rest of Home put together.
          mobile="deck"
        />
      </ThumbCursor>

      <div className={styles.footer}>
        {props.caption ? <p className={styles.caption}>{props.caption}</p> : null}

        {collaborators.length ? (
          <ul className={styles.legend}>
            {collaborators.map((term) => (
              <li key={term.name} className={styles.legendItem}>
                <span className={`${styles.marker} ${markerClass(term)}`} aria-hidden>
                  {MARKER}
                </span>
                <span className={styles.legendVia}>via</span>
                {term.collaboratorFields?.companyUrl ? (
                  <a
                    href={term.collaboratorFields.companyUrl}
                    className={styles.legendLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {term.name}
                  </a>
                ) : (
                  <span className={styles.legendLink}>{term.name}</span>
                )}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
