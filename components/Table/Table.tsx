import type { ReactNode } from "react";
import Tab from "@/components/UI/Tab/Tab";
import RichLine from "@/components/UI/RichLine/RichLine";
import styles from "./table.module.scss";

/**
 * The one table on the site. BuildTable, MetaBlock, MediaCopy's table mode and
 * the PageHero nowline all render through it, so borders, mono type and the
 * mobile transform have a single implementation.
 *
 * The two orientations are genuinely different shapes, so they are a union
 * rather than one loose type with everything optional.
 */

export interface TableRowCell {
  /** Rendered as-is when a string. Nodes allow links, markers and chips. */
  content: ReactNode;
  /** Sort/label text, used by the mobile card layout and by screen readers. */
  label?: string;
}

interface TableBaseProps {
  /** Label on the tab above the table, e.g. "CURRENTLY". */
  name?: string | null;
  showHeaders?: boolean;
  /** Shown in a chip beside the name, e.g. "30+". */
  countDisplay?: string | null;
  className?: string;
  /**
   * How a horizontal table presents itself below `tablet`, where its columns
   * cannot survive.
   *
   *   cards  the default: every row becomes a stacked full-width card, one
   *          field per line. Right for a table of two or three rows.
   *   deck   the rows become a horizontally swipeable deck of cards. Right for
   *          a long table, where stacking turns 31 rows into 8,000px of page.
   *
   * Declared here rather than inferred from the row count, so a table's mobile
   * behaviour is a decision someone made and can be read off the call site. It
   * only ever changes what happens below the breakpoint; both look identical
   * above it, and it is ignored on a vertical table, which does not transform.
   */
  mobile?: "cards" | "deck";
}

interface VerticalTableProps extends TableBaseProps {
  orientation: "vertical";
  rows: { label: string; value: ReactNode; valueNote?: string | null }[];
}

interface HorizontalTableProps extends TableBaseProps {
  orientation: "horizontal";
  columns: string[];
  rows: TableRowCell[][];
}

export type TableProps = VerticalTableProps | HorizontalTableProps;

/**
 * Table used to draw its own tab, a near-copy of components/UI/Tab that had
 * quietly drifted to a different padding -- so the hero's CURRENTLY label and
 * the WorkCardGrid's tabs, which are the same object in Figma, did not match on
 * screen. There is one implementation now, and this is a thin wrapper for the
 * "no name, no tab" rule rather than a second version of the thing.
 */
function TableTab({ name, countDisplay }: { name?: string | null; countDisplay?: string | null }) {
  if (!name) return null;

  return <Tab count={countDisplay}>{name}</Tab>;
}

export default function Table(props: TableProps) {
  const { name, countDisplay, className, mobile = "cards" } = props;
  const wrapperClass = [styles.wrapper, className].filter(Boolean).join(" ");

  if (props.orientation === "vertical") {
    return (
      <div className={wrapperClass} data-orientation="vertical">
        <TableTab name={name} countDisplay={countDisplay} />
        <table className={styles.table}>
          <tbody>
            {props.rows.map((row) => (
              <tr key={row.label} className={styles.row}>
                <th scope="row" className={styles.rowLabel}>
                  {row.label}
                </th>
                <td className={styles.cell}>
                  {typeof row.value === "string" ? <RichLine value={row.value} /> : row.value}
                  {row.valueNote ? <span className={styles.note}>{row.valueNote}</span> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const { columns, rows, showHeaders = true } = props;

  return (
    <div className={wrapperClass} data-orientation="horizontal" data-mobile={mobile}>
      <TableTab name={name} countDisplay={countDisplay} />

      {/*
        Mobile turns each row into a stacked card. The column name has to travel
        with the cell for that to read, so it is carried on a data attribute and
        drawn by CSS rather than duplicated in the markup.
      */}
      <table className={styles.table}>
        {showHeaders ? (
          <thead className={styles.head}>
            <tr>
              {columns.map((column) => (
                // The same attribute the body cells carry, so a consumer that
                // hides or reorders a column names it once and reaches the
                // header with it too. Without this a header could only be
                // addressed by position, which stops being true the moment a
                // column moves.
                <th key={column} scope="col" className={styles.columnLabel} data-column={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {rows.map((cells, rowIndex) => (
            <tr key={rowIndex} className={styles.row}>
              {cells.map((cell, cellIndex) => (
                <td key={cellIndex} className={styles.cell} data-column={columns[cellIndex] ?? ""}>
                  {/*
                    A cell is either an element a component built -- BuildTable's
                    site and link cells -- or an authored string. Only the string
                    can carry a link an editor typed, so only the string is
                    parsed; an element is passed straight through untouched.
                  */}
                  {typeof cell.content === "string" ? (
                    <RichLine value={cell.content} />
                  ) : (
                    cell.content
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
