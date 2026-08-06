# k311y.com

Portfolio for Kelly Warpechowski. A headless WordPress back end with a Next.js
front end, whose UI is built to read as a Figma working file — a sidebar
component tree, selection states, marching-ants marquees.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) · React 19 · TypeScript strict |
| Styles | SCSS Modules. Abstracts are auto-prepended — no `@use` in component files |
| Motion | GSAP + ScrollTrigger via `@gsap/react` |
| Content | WordPress + WPGraphQL + ACF flexible content |
| SEO | Yoast, mapped onto Next's Metadata in `lib/seo.ts` |

## Running it

The front end reads from a WordPress install, so that has to be up first — the
build fetches at compile time and will fail with a clear error if it cannot
reach the endpoint.

```bash
cp .env.example .env.local   # then fill in WORDPRESS_GRAPHQL_URL
npm install
npm run dev
```

| script | |
|---|---|
| `npm run dev` | dev server on :3000 |
| `npm run build` | production build |
| `npm run build:fresh` | same, after clearing `.next/cache` |
| `npm run lint` | ESLint |

**Known lint baseline: 2 problems (1 error, 1 warning)**, both long-standing, in
`SelectionMarquee.tsx` and `WorkCardGrid.tsx`. Any other count means something
new was introduced.

## Environment

Everything is documented in `.env.example`. In short:

- `WORDPRESS_GRAPHQL_URL` — required, the WPGraphQL endpoint.
- `NEXT_PUBLIC_SITE_URL` — optional. Defaults to the production origin, which is
  correct for production and harmless in dev. Set it only for a staging build
  that must canonicalise somewhere else.
- `NEXT_PUBLIC_GA_ID` — optional GA4 Measurement ID (`G-…`). Unset renders no
  tag at all, which is what you want in dev so local traffic does not report
  into the live property.

## How the content model works

One ACF flexible-content field group (`acf-json/group_sections.json`) backs every
page. Home, `/about`, `/process`, case studies and projects all render through
the same section renderer, so a new layout is a new component rather than a new
template.

**`lib/schema.md` is the manifest and the record of decisions.** It names every
field, every approved variant and every approved animation. Two rules the
codebase holds to:

- **Schema discipline** — a field is proposed in the manifest and approved before
  it exists in a fragment, in ACF JSON or in a component.
- **Animation discipline** — nothing moves without a brief. Components with no
  brief (`FullWidthMedia`, `TabbedMediaCopy`) are deliberately static.

## Layout of the repo

```
app/            routes. (site) is the main group; /dev is a token specimen page
components/     one directory per component, co-located .module.scss
lib/            queries, fragments, ACF helpers — and schema.md
styles/         abstracts (tokens, mixins), base, and the section rhythm
acf-json/       ACF field groups, synced from wp-admin
_content-source/  authored copy and build notes, the source for what WP holds
public/fonts/   Google Sans Flex + AOT Serial Mono
```

## Two things that surprise people

**Content is hidden until JavaScript reveals it.** `styles/base/_globals.scss`
sets the pre-animation state, so anything with an entrance starts at
`opacity: 0`. That avoids a flash of the finished layout before GSAP runs, at the
cost that a broken timeline shows as *missing content* rather than missing
motion. A section that is mysteriously blank is almost always this. A `<noscript>`
block in `app/layout.tsx` reverses it for readers without scripting.

**URLs are the front end's, not WordPress's.** WP permalinks are
`/case-study/ascaya/`; this site serves `/case-studies/ascaya`. Canonicals,
`og:url` and `app/sitemap.ts` are all built from this app's routes for that
reason, and Yoast's own sitemap is disabled in wp-admin so it cannot compete.
