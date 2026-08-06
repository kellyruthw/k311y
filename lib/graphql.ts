/**
 * The entire GraphQL client. There is no Apollo, no urql, no codegen -- just
 * fetch and template literals, the same approach as the ascaya-next build.
 *
 * Queries are composed from the fragments in lib/fragments/, each of which
 * exports its own TypeScript interface alongside the query string so the two
 * cannot drift apart unnoticed.
 *
 * Pages never call this directly. They call a loader in lib/queries/, which is
 * what lets the whole site run on fixtures until WordPress has content.
 */

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string; path?: (string | number)[] }[];
}

/** Thrown for every failure mode so callers have one thing to catch. */
export class GraphQLRequestError extends Error {
  constructor(
    message: string,
    readonly operation: string,
  ) {
    super(`[${operation}] ${message}`);
    this.name = "GraphQLRequestError";
  }
}

/**
 * Pull a readable operation name out of a query for error messages.
 * Falls back to the first field selected, so even anonymous queries say
 * something more useful than "GraphQL error".
 */
function describeOperation(query: string): string {
  const named = query.match(/(?:query|mutation)\s+(\w+)/);
  if (named?.[1]) return named[1];

  const firstField = query.match(/\{\s*(\w+)/);
  return firstField?.[1] ?? "anonymous";
}

/**
 * How long a cached response stays valid, in seconds.
 *
 * This is not arbitrary. Two obvious alternatives are both wrong here:
 *
 *   cache: "no-store"   makes the route dynamic, so nothing prerenders at all.
 *   cache: "force-cache" with no expiry is worse in a quieter way -- Next keeps
 *                       those entries in .next/cache between builds, so a
 *                       rebuild happily serves content WordPress no longer has,
 *                       with nothing in the output to suggest anything is off.
 *
 * A finite revalidate keeps routes static and lets entries expire. Run
 * `npm run build:fresh` to bypass the cache entirely.
 */
const DEFAULT_REVALIDATE = 60;

/**
 * POST a query to WPGraphQL and return its `data`.
 *
 * Pass `revalidate` to override the default for one call rather than reaching
 * for a global setting that is easy to forget is there.
 */
export async function fetchGraphQL<T>(
  query: string,
  variables: Record<string, unknown> = {},
  options: { revalidate?: number } = {},
): Promise<T> {
  const operation = describeOperation(query);
  const endpoint = process.env.WORDPRESS_GRAPHQL_URL;

  if (!endpoint) {
    throw new GraphQLRequestError(
      "Missing WORDPRESS_GRAPHQL_URL. Copy .env.example to .env.local and restart the dev server.",
      operation,
    );
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: options.revalidate ?? DEFAULT_REVALIDATE },
    });
  } catch (cause) {
    // Usually the Local site being stopped, but never assume: keep the original
    // error attached, or a build failure here is impossible to diagnose.
    const detail = cause instanceof Error ? `${cause.name}: ${cause.message}` : String(cause);
    throw new GraphQLRequestError(
      `Could not reach ${endpoint} (${detail}). Is the Local site running?`,
      operation,
    );
  }

  if (!response.ok) {
    throw new GraphQLRequestError(`HTTP ${response.status} ${response.statusText}`, operation);
  }

  const body = (await response.json()) as GraphQLResponse<T>;

  // WPGraphQL answers 200 with an errors array, so this must be checked
  // explicitly. Skipping it is how a mistyped field becomes a blank section
  // instead of a build failure.
  if (body.errors?.length) {
    throw new GraphQLRequestError(body.errors.map((error) => error.message).join(" | "), operation);
  }

  if (!body.data) {
    throw new GraphQLRequestError("Response contained no data.", operation);
  }

  return body.data;
}
