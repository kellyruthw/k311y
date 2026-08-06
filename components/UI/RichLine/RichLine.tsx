import Link from "next/link";
import { toSegments } from "@/lib/acf";

/**
 * An authored line, rendered with the one inline tag the content model allows.
 *
 * Editors write `<a href="...">label</a>` in a plain text field and get a real
 * link; everything else they type stays literal text, exactly as it did before.
 * The parsing is in lib/acf.ts and hands back segments, not markup, so nothing
 * here goes near dangerouslySetInnerHTML and no attribute an editor wrote is
 * ever passed through to the DOM.
 *
 * A line with no link renders as a bare string with no wrapper, so the common
 * case adds no element to the page.
 */
export default function RichLine({ value }: { value: string | null | undefined }) {
  const segments = toSegments(value);
  if (!segments.length) return null;

  if (segments.length === 1 && !segments[0].href) return segments[0].text;

  return (
    <>
      {segments.map((segment, index) => {
        if (!segment.href) return segment.text;

        // Internal paths get client-side navigation; anything else opens away.
        // The same rule BuildTable's link cell follows.
        if (segment.href.startsWith("/")) {
          return (
            <Link key={index} href={segment.href}>
              {segment.text}
            </Link>
          );
        }

        const away = /^https?:/i.test(segment.href);

        return (
          <a
            key={index}
            href={segment.href}
            target={away ? "_blank" : undefined}
            rel={away ? "noreferrer" : undefined}
          >
            {segment.text}
          </a>
        );
      })}
    </>
  );
}
