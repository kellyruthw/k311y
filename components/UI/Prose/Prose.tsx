import { toLines } from "@/lib/acf";

/**
 * Authored prose, one paragraph per line.
 *
 * Every break an editor types is a paragraph break, so each becomes its own
 * <p>. Wrapping them in spans inside a single <p> looked the same but told
 * screen readers and search engines it was one continuous paragraph, and left
 * no element for paragraph spacing to attach to.
 *
 * Headings deliberately do not use this: a heading is one heading however many
 * lines it is set across, so those keep block-level spans.
 */
export default function Prose({
  value,
  className,
}: {
  value: string | null | undefined;
  className?: string;
}) {
  return toLines(value).map((line) => (
    <p key={line} className={className}>
      {line}
    </p>
  ));
}
