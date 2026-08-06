import type { TableProps } from "@/components/Table/Table";
import { selectValue } from "@/lib/acf";

/**
 * The table field set, shared by PageHero and MediaCopy.
 *
 * Both author a table with the same field names, so the selection set, the
 * type, and the mapping onto the Table primitive live here once. Two copies
 * would drift the first time a field is added to one of them.
 */

export const TABLE_FIELDS = `
  tableName
  tableOrientation
  tableShowHeaders
  tableColumns { columnLabel }
  tableRows { cells { cellValue } }
  tableVerticalRows { rowLabel rowValue rowValueNote }
`;

export interface TableFields {
  tableName: string | null;
  /** Single select, returned as a list: "vertical" or "horizontal". */
  tableOrientation: string[] | null;
  tableShowHeaders: boolean | null;
  tableColumns: { columnLabel: string | null }[] | null;
  tableRows: { cells: { cellValue: string | null }[] | null }[] | null;
  tableVerticalRows:
    | { rowLabel: string | null; rowValue: string | null; rowValueNote: string | null }[]
    | null;
}

/**
 * Map authored fields onto the Table primitive.
 *
 * Returns null when there are no rows, so a component can simply not render a
 * table rather than drawing an empty frame.
 */
export function toTableProps(fields: TableFields, countDisplay?: string | null): TableProps | null {
  const orientation = selectValue(fields.tableOrientation) ?? "horizontal";
  const showHeaders = fields.tableShowHeaders ?? false;

  if (orientation === "vertical") {
    const rows = (fields.tableVerticalRows ?? [])
      .filter((row) => row.rowLabel)
      .map((row) => ({
        label: row.rowLabel as string,
        value: row.rowValue ?? "",
        valueNote: row.rowValueNote,
      }));

    if (!rows.length) return null;

    return { orientation: "vertical", name: fields.tableName, countDisplay, showHeaders, rows };
  }

  const rows = (fields.tableRows ?? []).map((row) =>
    (row.cells ?? []).map((cell) => ({ content: cell.cellValue ?? "" })),
  );

  if (!rows.length) return null;

  return {
    orientation: "horizontal",
    name: fields.tableName,
    countDisplay,
    showHeaders,
    columns: (fields.tableColumns ?? []).map((column) => column.columnLabel ?? ""),
    rows,
  };
}
