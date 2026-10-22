import Link from "next/link";
import parse, {
  domToReact,
  Element,
  type DOMNode,
  type HTMLReactParserOptions,
} from "html-react-parser";

/**
 * Authored rich text from a wysiwyg field, parsed into real elements.
 *
 * html-react-parser builds a React tree from the markup, so nothing here goes
 * near dangerouslySetInnerHTML -- the same stance RichLine takes for plain
 * fields, extended to fields where the editor writes actual HTML.
 *
 * Anchors are rewritten to the site's link rules rather than passed through:
 * an internal path gets client-side navigation, anything external opens away.
 * Script, style and iframe elements are dropped outright -- a wysiwyg field is
 * authored by Kelly in her own CMS, but there is no reason to render the three
 * tags that could ever do more than display.
 *
 * The wrapper div is what a stylesheet targets; the elements inside carry no
 * classes of their own, so type comes from inheritance and spacing from
 * descendant rules.
 */

const DROPPED_TAGS = new Set(["script", "style", "iframe"]);

export default function RichText({
  value,
  className,
}: {
  value: string | null | undefined;
  className?: string;
}) {
  if (!value) return null;

  const options: HTMLReactParserOptions = {
    replace(node) {
      if (!(node instanceof Element)) return undefined;

      if (DROPPED_TAGS.has(node.name)) return <></>;

      if (node.name === "a") {
        const href = node.attribs?.href ?? "";
        const children = domToReact(node.children as DOMNode[], options);

        // Internal paths get client-side navigation; anything else opens
        // away. The same rule RichLine and BuildTable's link cell follow.
        if (href.startsWith("/")) {
          return <Link href={href}>{children}</Link>;
        }

        const away = /^https?:/i.test(href);

        return (
          <a
            href={href}
            target={away ? "_blank" : undefined}
            rel={away ? "noreferrer" : undefined}
          >
            {children}
          </a>
        );
      }

      return undefined;
    },
  };

  return <div className={className}>{parse(value, options)}</div>;
}
