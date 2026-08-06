import type { ReactNode } from "react";
import styles from "./tab.module.scss";

/**
 * The tab that sits on top of a bordered block.
 *
 * One object across the site: a table's label, the footer's HIRE ME, the case
 * hero's "Case study · Headless WordPress", NextCase's label, and the
 * WorkCardGrid's switchable tabs. Only the last of those is interactive, which
 * is why `active` is optional -- a tab with no active state is just a label.
 *
 * Renders a <button> when it can be clicked and a <span> when it cannot, so the
 * tab strip never puts unclickable buttons in the tab order.
 */

export interface TabProps {
  children: ReactNode;
  /** Shown in a chip on the right, e.g. a count. */
  count?: string | number | null;
  /** Omit entirely for a static label. */
  active?: boolean;
  onClick?: () => void;
  className?: string;
  id?: string;
  controls?: string;
}

export default function Tab({
  children,
  count,
  active,
  onClick,
  className,
  id,
  controls,
}: TabProps) {
  const interactive = typeof onClick === "function";

  const body = (
    <>
      <span className={styles.label}>{children}</span>
      {count !== null && count !== undefined && count !== "" ? (
        <span className={styles.count}>{count}</span>
      ) : null}
    </>
  );

  const shared = {
    className: [styles.tab, className].filter(Boolean).join(" "),
    "data-active": active === undefined ? undefined : String(active),
  };

  if (!interactive) {
    return <span {...shared}>{body}</span>;
  }

  return (
    <button
      {...shared}
      type="button"
      id={id}
      role="tab"
      aria-selected={active}
      aria-controls={controls}
      onClick={onClick}
    >
      {body}
    </button>
  );
}
