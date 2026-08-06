import type { Metadata } from "next";
import styles from "./dev.module.scss";

export const metadata: Metadata = {
  title: "Dev / k311y",
  robots: { index: false, follow: false },
};

/**
 * The scratch surface. Every component gets built and reviewed here, in every
 * variant, before it is placed on a real page. Right now it proves the
 * foundation: fonts load, tokens resolve, the type scale is fluid, and the
 * abstracts reach a module without an explicit @use.
 */

/**
 * Swatches name their token and are painted by a class, never by an inline hex.
 * The only place a hex literal is allowed to appear is styles/abstracts/_variables.scss.
 */
const SWATCHES = [
  { key: "canvas", token: "$bg-page", note: "page background" },
  { key: "select", token: "$bg-select", note: "the thing not to miss" },
  { key: "chrome", token: "$bg-chrome", note: "system chrome only" },
  { key: "node", token: "$bg-node", note: "chips + diamonds" },
  { key: "note", token: "$bg-note", note: "QuestionCTA stickies" },
  { key: "markerWicked", token: "$color-marker-wicked", note: "Wicked+" },
  { key: "markerMilkbutter", token: "$color-marker-milkbutter", note: "Milk & Butter" },
  { key: "markerDmm", token: "$color-marker-dmm", note: "Digital Media Management" },
] as const;

const TYPE_SPECIMENS = [
  { className: "display", label: "display", spec: "Google Sans Flex Bold 90 / 110, Home hero only" },
  { className: "title", label: "title", spec: "Google Sans Flex Bold 90 / 110, capped 100" },
  { className: "statement", label: "statement", spec: "Google Sans Flex Bold 65 / 110" },
  { className: "paragraphLarge", label: "paragraph-large", spec: "Google Sans Flex Medium 24 / 1.5" },
  { className: "kicker", label: "kicker", spec: "AOT Bold 14, uppercase" },
  { className: "tabLabel", label: "tab-label", spec: "AOT Bold 15, uppercase" },
  { className: "tableCopy", label: "table-copy", spec: "Google Sans Flex Regular 13 / 1.3" },
  { className: "monoChip", label: "mono-chip", spec: "AOT Bold 15, -0.08em" },
  { className: "monoBody", label: "mono-body", spec: "AOT Medium 14, -0.08em" },
  { className: "monoSmall", label: "mono-small", spec: "AOT Regular 13, -0.08em" },
  { className: "monoLink", label: "mono-link", spec: "AOT SemiBold 14, underlined" },
] as const;

export default function DevPage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>Foundation</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionLabel}>Colour</h2>
        <ul className={styles.swatches}>
          {SWATCHES.map((swatch) => (
            <li key={swatch.key} className={styles.swatch}>
              <span className={`${styles.chip} ${styles[swatch.key]}`} />
              <span className={styles.swatchName}>{swatch.token}</span>
              <span className={styles.swatchNote}>{swatch.note}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionLabel}>Type</h2>
        <ul className={styles.specimens}>
          {TYPE_SPECIMENS.map((specimen) => (
            <li key={specimen.label} className={styles.specimen}>
              <span className={styles.specimenSpec}>
                {specimen.label} · {specimen.spec}
              </span>
              <span className={styles[specimen.className]}>
                Design engineer building the sites you see
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionLabel}>Spacing</h2>
        <p className={styles.sectionNote}>
          space(n) returns n x 5px. The bars below are space(1) through space(12).
        </p>
        <ul className={styles.spacing}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((step) => (
            <li key={step} className={styles.spacingRow}>
              <span className={styles.spacingLabel}>space({step})</span>
              <span className={styles.spacingBar} data-step={step} />
              <span className={styles.spacingValue}>{step * 5}px</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
