/**
 * Helpers for the shapes WPGraphQL for ACF actually returns.
 *
 * These exist because a few ACF field types do not come back as the obvious
 * scalar, and every one of them is a quiet source of bugs if handled ad hoc at
 * each call site. Each helper below is here because the live schema was checked,
 * not because it seemed likely.
 */

/**
 * Select fields always return a list, even when the field is single-value.
 * `variant` set to "home" arrives as `["home"]`, not `"home"`.
 *
 * Use for single selects. Multi-selects should keep their array.
 */
export function selectValue(value: readonly string[] | string | null | undefined): string | null {
  if (typeof value === "string") return value || null;
  return value?.[0] ?? null;
}

/**
 * Order a multi-select by a canonical list rather than by the order the editor
 * happened to click. This is what guarantees "Headless WP · Next.js · GSAP"
 * always reads in that order, with the CMS first and GSAP last.
 *
 * Values not in `order` are dropped, so a removed choice cannot leak through.
 */
export function orderedSelect(
  value: readonly string[] | null | undefined,
  order: readonly string[],
): string[] {
  if (!value?.length) return [];
  return order.filter((choice) => value.includes(choice));
}

/**
 * Everything that means "start a new line" in authored copy.
 *
 * Three of these turn up in practice:
 *   - a typed <br>, <br/> or <br />, because that is a natural thing to reach for
 *   - U+2028 LINE SEPARATOR, which WordPress inserts for a soft break
 *   - CRLF or CR, from pressing Enter on Windows
 *
 * All are normalised to \n so callers deal with one thing. Only <br> is treated
 * as markup; any other tag stays literal text, which is what keeps this safe
 * without dangerouslySetInnerHTML or an HTML parser.
 *
 * Built with `new RegExp` from an escaped string rather than a regex literal:
 * a literal U+2028 in a source file is itself a parse error in some toolchains,
 * which is half the reason this exists.
 */
const LINE_BREAKS = new RegExp("<br\\s*/?>|[\\u2028\\u2029]|\\r\\n|\\r", "gi");

export function normalizeLines(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.replace(LINE_BREAKS, "\n");
}

/**
 * Split authored copy into its lines, dropping blanks.
 *
 * Render the result as separate elements rather than relying on white-space, so
 * the break is structural and cannot be collapsed by a stylesheet.
 */
export function toLines(value: string | null | undefined): string[] {
  const normalized = normalizeLines(value);
  if (!normalized) return [];
  return normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * The one tag an authored value may contain besides <br>: a link.
 *
 * Returned as SEGMENTS rather than HTML, so nothing is ever handed to
 * dangerouslySetInnerHTML. The caller renders real elements from these, which
 * means a tag this does not recognise stays literal text exactly as it does
 * today -- the safe-subset rule the file already followed, widened by one tag
 * rather than abandoned.
 *
 * Only the href survives from the source markup. Any other attribute an editor
 * typed -- onclick, style, a second href -- is dropped on the floor, because it
 * is never read.
 */
export interface TextSegment {
  text: string;
  /** Present when this run is a link. Already validated. */
  href?: string;
}

/**
 * Schemes a link may use.
 *
 * An allow-list, not a block-list: `javascript:` is the obvious one to keep
 * out, but so is `data:`, and so is whatever the next one turns out to be. A
 * value starting with `/` or `#` is a path on this site and needs no scheme.
 */
function safeHref(raw: string): string | null {
  const href = raw.trim();
  if (!href) return null;
  if (href.startsWith("/") || href.startsWith("#")) return href;

  return /^(https?:|mailto:|tel:)/i.test(href) ? href : null;
}

// `[\s\S]` rather than `.` with the dotAll flag: the flag needs a newer
// compile target than this project sets, and the character class is the same
// thing with no config change behind it.
const ANCHOR = /<a\s+[^>]*?href\s*=\s*["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;

/**
 * Split authored text into plain runs and links.
 *
 * A single run with no href is the overwhelming case, and callers can treat
 * that as "just text" without branching.
 */
export function toSegments(value: string | null | undefined): TextSegment[] {
  const text = normalizeLines(value);
  if (!text) return [];

  const segments: TextSegment[] = [];
  let last = 0;

  for (const match of text.matchAll(ANCHOR)) {
    const [whole, rawHref, label] = match;
    const at = match.index ?? 0;
    const href = safeHref(rawHref);

    if (at > last) segments.push({ text: text.slice(last, at) });

    // A rejected scheme keeps the label and loses the link, rather than
    // dropping the words an editor wrote.
    segments.push(href ? { text: label, href } : { text: label });
    last = at + whole.length;
  }

  if (last < text.length) segments.push({ text: text.slice(last) });

  return segments.filter((segment) => segment.text.length > 0);
}

/**
 * The usable URL for an attachment.
 *
 * WPGraphQL resolves `sourceUrl` for images only -- on a video or any other
 * file it is null, while `mediaItemUrl` is populated for everything. Reaching
 * for `sourceUrl` alone silently drops every video on the site.
 */
export function mediaUrl(
  node: { sourceUrl?: string | null; mediaItemUrl?: string | null } | null | undefined,
): string | null {
  return node?.sourceUrl ?? node?.mediaItemUrl ?? null;
}

/** True when an attachment is a video, based on its mime type. */
export function isVideo(node: { mimeType?: string | null } | null | undefined): boolean {
  return node?.mimeType?.startsWith("video/") ?? false;
}

/**
 * True when an attachment is an SVG, which on this site means an icon rather
 * than artwork -- the one image type sized to a fixed box instead of to its
 * column.
 *
 * Mime type is the only usable signal: WordPress does not rasterise SVG, so
 * `mediaDetails` comes back with width and height null and there is nothing
 * intrinsic to measure. Sizing therefore has to come from CSS.
 */
export function isSvg(node: { mimeType?: string | null } | null | undefined): boolean {
  return node?.mimeType === "image/svg+xml";
}

/**
 * Taxonomy fields return a connection, not a term. The ACF fields on the term
 * are only reachable through an inline fragment on the concrete term type.
 */
export interface TermConnection<T> {
  nodes: T[];
}

export function firstTerm<T>(connection: TermConnection<T> | null | undefined): T | null {
  return connection?.nodes?.[0] ?? null;
}
