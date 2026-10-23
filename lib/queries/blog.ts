import { fetchGraphQL } from "@/lib/graphql";
import { SEO_FRAGMENT, type YoastSeo } from "@/lib/seo";

/**
 * The blog ("Revival"), read from ordinary WordPress posts.
 *
 * Posts are the one post type on the site whose body is Gutenberg HTML rather
 * than flexible sections: a diary entry is prose, and prose is what the block
 * editor is for. The hub page at /blog is still a normal page with a PageHero,
 * loaded through getPage() like every other page -- this file only knows about
 * the posts themselves.
 *
 * DRAFTS, AND WHY THEY ARE LOCAL-ONLY BY CONSTRUCTION
 *
 * WPGraphQL returns unpublished posts only to an authenticated request. The
 * auth comes from WORDPRESS_AUTH in .env.local -- "user:application password",
 * sent as Basic auth -- and that variable is deliberately never set on Vercel.
 * No code path decides "am I in production": a deployment without the secret
 * CANNOT see drafts, which is a stronger guarantee than an environment check
 * that someone could misconfigure.
 *
 * A draft has no slug until it is published (WordPress assigns it on publish),
 * so entries link by slug when one exists and by databaseId otherwise, and
 * getBlogPost() accepts either.
 */

const previewAuth = (): Record<string, string> | undefined => {
  const credentials = process.env.WORDPRESS_AUTH;
  if (!credentials) return undefined;
  return { Authorization: `Basic ${Buffer.from(credentials).toString("base64")}` };
};

/** The image WordPress calls the featured image; the card's thumbnail. */
interface FeaturedImageNode {
  node: {
    sourceUrl: string | null;
    altText: string | null;
    mediaDetails: { width: number | null; height: number | null } | null;
  } | null;
}

const ENTRY_FIELDS = `
  databaseId
  slug
  status
  title
  date
  excerpt
  content
  categories(first: 1) { nodes { name } }
  featuredImage { node { sourceUrl altText mediaDetails { width height } } }
`;

const ENTRIES_QUERY = `
  query BlogEntries($stati: [PostStatusEnum]) {
    posts(first: 100, where: { stati: $stati, orderby: { field: DATE, order: DESC } }) {
      nodes {
        ${ENTRY_FIELDS}
      }
    }
  }
`;

const POST_QUERY = `
  query BlogPost($id: ID!, $idType: PostIdType!) {
    post(id: $id, idType: $idType) {
      ${ENTRY_FIELDS}
      modified
      ${SEO_FRAGMENT}
    }
  }
`;

const SLUGS_QUERY = `
  query BlogSlugs {
    posts(first: 100, where: { stati: [PUBLISH] }) {
      nodes { slug }
    }
  }
`;

interface EntryNode {
  databaseId: number;
  slug: string | null;
  status: string | null;
  title: string | null;
  date: string | null;
  excerpt: string | null;
  content: string | null;
  categories: { nodes: { name: string | null }[] } | null;
  featuredImage: FeaturedImageNode | null;
}

interface PostNode extends EntryNode {
  modified: string | null;
  seo: YoastSeo | null;
}

export interface BlogImage {
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
}

export interface BlogEntry {
  databaseId: number;
  /** The route segment: the slug once published, the databaseId while a draft. */
  key: string;
  href: string;
  title: string;
  /** ISO, as WordPress reports it. Null never survives mapping; see below. */
  date: string;
  /** Plain text, tags stripped: the card never renders markup. */
  excerpt: string;
  /** Changelog position, oldest = 1. Formatted by entryNumber(). */
  number: number;
  /**
   * The post's WordPress category, named on the entry's tab: "Revival / 001".
   * WordPress files an uncategorised post under "Uncategorized", which is a
   * default rather than a decision, so it falls back to the blog's own name.
   */
  category: string;
  readingTimeMinutes: number;
  isDraft: boolean;
  image: BlogImage | null;
}

export interface BlogPost extends BlogEntry {
  /** Gutenberg HTML, rendered through RichText. */
  content: string;
  modified: string | null;
  seo: YoastSeo | null;
}

/** "1" -> "001": the changelog's version numbers. */
export function entryNumber(value: number): string {
  return String(value).padStart(3, "0");
}

const stripTags = (html: string): string =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&#?\w+;/g, (entity) => {
      const named: Record<string, string> = {
        "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"',
        "&#039;": "'", "&#8217;": "’", "&#8216;": "‘",
        "&#8220;": "“", "&#8221;": "”", "&nbsp;": " ", "&hellip;": "…",
      };
      return named[entity] ?? entity;
    })
    .replace(/\s+/g, " ")
    .trim();

/**
 * Words over 225 a minute, floored at one. The figure is a reading aid, not a
 * promise, so a cheap word count is the right amount of engineering.
 */
const readingTime = (html: string | null): number =>
  Math.max(1, Math.round(stripTags(html ?? "").split(" ").filter(Boolean).length / 225));

const toImage = (featured: FeaturedImageNode | null): BlogImage | null => {
  const node = featured?.node;
  if (!node?.sourceUrl) return null;
  return {
    url: node.sourceUrl,
    alt: node.altText ?? "",
    width: node.mediaDetails?.width ?? null,
    height: node.mediaDetails?.height ?? null,
  };
};

const toEntry = (node: EntryNode, number: number): BlogEntry => {
  const key = node.slug?.trim() || String(node.databaseId);

  const categoryName = node.categories?.nodes[0]?.name?.trim();
  const category =
    categoryName && categoryName.toLowerCase() !== "uncategorized" ? categoryName : "Revival";

  return {
    category,
    databaseId: node.databaseId,
    key,
    href: `/changeblog/${key}`,
    title: node.title ?? "",
    date: node.date ?? new Date().toISOString(),
    excerpt: stripTags(node.excerpt ?? ""),
    number,
    readingTimeMinutes: readingTime(node.content),
    isDraft: node.status !== "publish",
    image: toImage(node.featuredImage),
  };
};

/**
 * Every entry, newest first, numbered oldest-first so 001 never changes when
 * a new post ships. Drafts appear only when WORDPRESS_AUTH is set locally.
 */
export async function getBlogEntries(): Promise<BlogEntry[]> {
  const headers = previewAuth();

  const data = await fetchGraphQL<{ posts: { nodes: EntryNode[] } | null }>(
    ENTRIES_QUERY,
    { stati: headers ? ["PUBLISH", "DRAFT"] : ["PUBLISH"] },
    { headers },
  );

  const nodes = data.posts?.nodes ?? [];

  // Oldest post = 001. The list arrives newest-first, so the number counts
  // down from the total rather than up from zero.
  return nodes.map((node, index) => toEntry(node, nodes.length - index));
}

/** Published slugs only: what generateStaticParams prerenders. */
export async function getBlogSlugs(): Promise<string[]> {
  const data = await fetchGraphQL<{ posts: { nodes: { slug: string | null }[] } | null }>(
    SLUGS_QUERY,
  );

  return (data.posts?.nodes ?? [])
    .map((node) => node.slug?.trim() ?? "")
    .filter(Boolean);
}

/**
 * One post, by slug or (for a slugless draft) by databaseId. The entry list is
 * fetched alongside to carry the changelog number, which lives in the ordering
 * rather than on the post.
 */
export async function getBlogPost(key: string): Promise<BlogPost | null> {
  const headers = previewAuth();
  const isId = /^\d+$/.test(key);

  const [data, entries] = await Promise.all([
    fetchGraphQL<{ post: PostNode | null }>(
      POST_QUERY,
      { id: key, idType: isId ? "DATABASE_ID" : "SLUG" },
      { headers },
    ),
    getBlogEntries(),
  ]);

  const node = data.post;
  if (!node) return null;

  // Without auth WPGraphQL can still resolve a draft the request should not
  // see as null fields rather than null post in some versions; status is the
  // honest check either way.
  if (!headers && node.status !== "publish") return null;

  const number =
    entries.find((entry) => entry.databaseId === node.databaseId)?.number ?? entries.length + 1;

  return {
    ...toEntry(node, number),
    content: node.content ?? "",
    modified: node.modified,
    seo: node.seo,
  };
}
