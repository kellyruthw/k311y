# k311y.com

My portfolio site. I'm Kelly Warpechowski, a design engineer. The site pairs a headless WordPress back end with a Next.js front end, and the UI is built to read like a Figma working file: a sidebar layer tree, selection states, and marching-ants marquees around the components on the page.

**Live site:** [k311y.com](https://k311y.com)

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) · React 19 · TypeScript strict · React Compiler |
| Styles | SCSS Modules. Abstracts (tokens, mixins, functions) are auto-prepended, so component files never `@use` them |
| Motion | GSAP + ScrollTrigger via `@gsap/react` |
| Content | WordPress + WPGraphQL + ACF flexible content |
| SEO | Yoast, mapped onto Next's Metadata API in `lib/seo.ts`, plus a generated sitemap |

## Highlights

### The Figma metaphor is driven by the data
The sidebar's layer tree isn't authored anywhere. [`lib/navTree.ts`](lib/navTree.ts) builds it from the page's own sections, so reordering sections in WordPress reorders the tree, and a deleted section can't leave a stale node behind. Selecting a node draws [`SelectionMarquee`](components/SidebarNav/SelectionMarquee.tsx) as a single fixed overlay: a dashed marquee with a component chip on every instance of that type. The sections themselves never reflow.

### One content model behind every page
A single ACF flexible-content field group backs the home page, `/about`, `/process`, case studies, and projects. [`Renderer.tsx`](components/Renderer/Renderer.tsx) maps each section's GraphQL `__typename` to a component through a `Record` typed on the union. Adding a layout without registering it is a compile error, not a blank space on the page.

### A GraphQL client in one file
There's no Apollo, urql, or codegen. [`lib/graphql.ts`](lib/graphql.ts) is `fetch` plus composed fragments, and each fragment exports its TypeScript interface right next to its query string so the two can't drift apart. Pages call loaders in `lib/queries/` rather than the client, which let the whole site run on fixtures before WordPress had any content.

### Schema and animation discipline
[`lib/schema.md`](lib/schema.md) is the manifest and the record of decisions. It lists every field, every approved variant, and every approved animation. A field is proposed and approved there before it appears in a fragment, the ACF JSON, or a component. Nothing moves without a brief, so components with no brief stay deliberately static.

### A print-first resume route
`/resume` is a print stylesheet built on the site's tokens and statically prerendered from typed content. It's the only page that doesn't need WordPress to build. Job-tailored versions are local only: they're gitignored, read off disk instead of imported, and served from a `page.dev.tsx` route that [`next.config.ts`](next.config.ts) includes only in development. Production never builds them at all.

### The front end owns its URLs
WordPress permalinks look like `/case-study/ascaya/`, but this site serves `/case-studies/ascaya`. Canonicals, `og:url`, and [`app/sitemap.ts`](app/sitemap.ts) are all built from this app's routes, and Yoast's canonical and sitemap are deliberately ignored.

### Details that took debugging
- **Content starts hidden until JavaScript reveals it.** `styles/base/_globals.scss` sets the pre-animation state so the finished layout never flashes before GSAP runs. A `<noscript>` block in `app/layout.tsx` reverses this for readers without scripting.
- **ScrollTrigger re-measures after client-side navigation.** ScrollTrigger caches pixel offsets and only re-measures on `load`, which a router navigation never fires. [`ScrollRefresh`](components/UI/ScrollRefresh/ScrollRefresh.tsx) refreshes the triggers after each route change, so animations fire at the right scroll position whether you load a page directly or arrive through a link.
- **The mobile menu is hidden with CSS, not a JS media query.** A breakpoint can't be read during server rendering, so checking it in JavaScript would either break hydration or force the whole nav onto the client.

## Repo layout

```
app/              routes. (site) is the main group; /dev is a token specimen page; /resume prints
components/       one directory per component, co-located .module.scss
lib/              GraphQL client, fragments, loaders, SEO mapping, and schema.md
styles/           abstracts (tokens, mixins, functions), base, and the section rhythm
acf-json/         ACF field groups, synced from wp-admin
_content-source/  authored copy and build notes, the source for what WordPress holds
public/fonts/     Google Sans Flex + AOT Serial Mono
```

## Local development

The front end builds from a WordPress install, so it won't run without one. Environment variables are documented in [`.env.example`](.env.example). The scripts are `dev`, `build`, `build:fresh` (clears `.next/cache` first), and `lint`. The lint baseline is zero problems, so any output means something new was introduced.

## Usage

The code is public so you can see how the site is built. It is not open source. The case study content, client work, and personal branding are not licensed for reuse.

© Kelly Warpechowski. All rights reserved.
