# k311y.com — Claude Code build handoff (v2, Kelly-confirmed)

You are building Kelly Warpechowski's portfolio: a headless WordPress + Next.js site whose interface mimics a Figma working file (dot-grid canvas, left "layers panel" nav, component-tree navigation). Design is complete in Figma; defer to Figma layouts for spacing/sizing decisions. Kelly is a design engineer and will read all code: keep it comprehensible, consistently structured, and free of cleverness that obscures.

## 0 · Stack (confirmed)
- Next.js App Router + TypeScript (strict). Single app, single repo
- SCSS with CSS Modules. Tokens as CSS custom properties
- Data: WordPress + ACF + WPGraphQL (https://www.wpgraphql.com/) from the start. No extra GraphQL client library: native fetch() POST to the WPGraphQL endpoint (env: WORDPRESS_GRAPHQL_URL). SSG
- GSAP + ScrollTrigger only. NO Lenis, no smooth-scroll library
- Every animation gated behind prefers-reduced-motion with complete static fallbacks (accessibility target: 100)

## 0.5 · SCHEMA DISCIPLINE — read before writing any component
Kelly uploads the ACF JSON to WordPress and enters content in parallel with your build. You do not have free rein over the schema. For EVERY component, in this exact order:
1. **Propose fields** in `/lib/schema.md` (the single manifest): component name, each field's name, type, conditional logic, and which GraphQL fragment it belongs to. Field names: snake_case, matching the names in section 2 below where already defined — do not rename established fields
2. **Wait for Kelly's approval** of the manifest entry before proceeding
3. **Write the GraphQL fragment first** (in `/lib/fragments/`), so Kelly can begin entering content in WP while you build
4. **Generate the ACF JSON** for that field group into `/acf-json/` for Kelly's upload
5. **Then build the component**, typed to the fragment's shape exactly
Never query a field that isn't in the manifest. Never let the fragment, the ACF JSON, and the component props drift apart — the manifest is truth.

## 0.6 · ANIMATION DISCIPLINE
Do not invent motion. The animations documented below are approved; anything else waits for Kelly's per-component animation brief before you build that component. When a component's brief hasn't arrived, build it static with a clean mount point for motion to be added.

## 1 · Conventions (exact)
```
/components/PageHero/PageHero.tsx + pageHero.module.scss   ← PascalCase file, camelCase scss
/app/(site)/…  /case-studies/[slug]  /projects/[slug]  /colophon
/lib/schema.md · /lib/types.ts · /lib/fragments/ · /acf-json/ · /styles/ 
```
Fonts (Kelly supplies the files; self-host via @font-face, woff2, font-display: swap):
- **Grift** → `--font-display`: headlines AND body copy
- **AOT Serial Mono** → `--font-mono`: links, kickers, labels, table text, chips
Spacing: 5px scale. SCSS function `space($n)` → $n * 5px; use multiples of 5 everywhere; defer to Figma for specific values.
Tokens (values from Kelly's Figma; structure final):
canvas near-black · raised surface · ink/ink-soft · grid-dot · panel purple + node lavender · select yellow (#F2EC4B-ish) · 3 marker colors (Wicked+ / Milk & Butter / DMM).
Semantic color law: yellow = the thing not to miss (highlight box in display layer, colored text in body, ~1 body use per page max) · purple = component/system chrome only · marker colors = agency attribution only.

## 2 · Components

### Shared primitive: `Table`
One table component powers every table on the site. Fields/props: `orientation: 'vertical' | 'horizontal'` · `show_headers` (bool) · vertical: `rows[] {label, value, value_note?}` (the Ascaya spec-table: MetaBlock, StatTable-style, MediaCopy table mode) · horizontal: `columns[]` + `rows[][]` (BuildTable, and the hero's CURRENTLY table which is horizontal with show_headers false… actually CURRENTLY shows its label row — match Figma). Mono type, bordered cells, raised surface. Mobile (horizontal only): transforms into stacked full-width cards, data stacking vertically, link promoted to a visible action — deliberate self-reference to the Ascaya case study; implement it well.

### Global chrome (no nav-tree nodes)
**`SidebarNav`** — the layers panel; the hardest and most important build:
- Purple panel, yellow-highlighted wordmark, white page squares (mono): Home · Work · Projects · About · Process · Contact; Work + Projects anchor to Home's WorkCardGrid and select the matching tab; COLOPHON small at panel bottom
- Current page expands to its tree: square → circles (flexible components, page order, type-grouped) → diamonds (CPT-fed subs). Case pages nest Work > Entry > tree
- Count chips (purple pill) only when count > 1. Home's Card diamond chip is stateful: 5 ⇄ 2 with active tab, odometer-tick animation
- Hover/focus node → all matching sections get the selection state: dashed marquee (SVG rect, animated dash-offset, slow marching ants), light tint, component chip pinned top-right. Section hover lights its node. Repeated types light all instances
- Scroll-spy soft-lights current section's node; clicking a node scrolls to its first section
- Collapsed rail on scroll (mark + dots, expands on hover/focus); mobile: tap-to-open drawer
- Buttons, keyboard nav, aria-current
**`SiteFooter`** — HIRE ME tab + "Currently open to design engineering roles." + mono buttons (mailto / LinkedIn / Resume). Identical everywhere, no animation.

### The 9 flexible components
All render `data-component` + `id`, accept selection state, and support optional header trio (`kicker` mono-caps, `heading`, `intro`). No em-dashes, numerals over words in all seeded copy.

**`PageHero`** `variant: home | case | simple`
- home: `headline_lead`, `headline_reveal` (mono, yellow box), `subhead`, `nowline_items[]` (renders CURRENTLY via Table horizontal + blinking yellow cursor). Approved animation: headline sets → annotation-stroke swipe reveals the second line (clip-path inset + SVG stroke dash-offset) → subhead fade → NowLine → sidebar tree draws itself (connectors sketch, nodes pop, staggered)
- case: `kicker_chips[]`, `title`, `media` + MetaBlock
- simple: `kicker`, `title`, `intro?`

**`MetaBlock`** — CPT-fed diamond under PageHero. No own fields; renders entry meta (`client, role, stack[], timeline, live_url, related_build?`) via Table (vertical).

**`IntroCopy`** — `kicker` (default OVERVIEW) · `paragraphs[]` · `emphasis_line?` (yellow text tier).

**`TextSection`** — header trio? · `paragraphs[]`. Standalone prose only.

**`MediaCopy`** — header trio? · `media_type: image | video | table` (conditional `media_image` / `media_video`{mp4, poster} / `table_rows[]` via Table vertical) · `copy_blocks[] {block_label?, block_text}` · `list_items[]?` · `media_side: left | right` · `variant: default | before_after` (`media_before/after` + labels). Video = muted loop w/ poster; media lazy-loads.

**`FullWidthMedia`** — `media` · `caption` · `width: wide | full` · `frame` (browser chrome bool) · `zoom_lens` (hover magnifier; off on touch + reduced motion).

**`CalloutList`** — header trio? · `columns: 2|3|4` · `cards[] {card_title, card_body, card_media?, card_icon?}`. Equal media heights per row. *(Amended in build: no hover raise. A card that lifts under the cursor promises a click it does not have. The lift stays on QuestionCTA and WorkCardGrid, which are genuinely links.)*

**`LargeList`** — header trio? · `items[] {item_title?, item_text}`. Oversized zero-padded numerals (01.), full-width bordered rows, spec register.

**`ThesisLine`** — `quote` · `highlight_phrases[]` (substrings → yellow mono highlight boxes) · `variant: scroll | static`. Approved animation (scroll, Home only): halves translate in from opposite sides on scrub, lock stacked center, joining comma fades in at lock, brief pin. Static: no motion.

**`NextCase`** — `next_ref` · auto kicker "NEXT CASE STUDY · {name}" · `title` · `link_label` · `media`. Tab-labeled block, wholly clickable. Authored per page → gets a nav node.

### Home-only sections
**`WorkCardGrid`** — `tabs[] {tab_label, count_display, source: case_study | project, intro_line?}`. Raised active tab; equalized panel heights on switch (2 project cards render larger). Cards: media (image/muted loop) + mono eyebrow (name · category) + display title. Hover: media scales in fixed frame + pink annotation sticky rotates in at corner with stack chips. Nav: circle + `Card` diamond (stateful chip).
**`BuildTable`** — `label` ("FEATURED SITES I'VE BUILT") + `count_display` ("30+") + rows from `build` CPT via Table (horizontal, headers). Columns YEAR · SITE(+marker) · ROLE · STACK · NOTES · LINK. Sort year desc then sort_order. Two footnote lines + marker legend (glyphs/colors identical rows↔legend; Wicked+ links out; "Milk & Butter" with ampersand). Hover row highlight; thumbnail peek if `thumb`. Nav: circle + `TableRow` diamond.
**`QuestionCTA`** — `notes[] (1–3) {question, link_label, link_url}`. Blue stickies, tape pieces, opposing rotations (middle straightest), mono link + arrow, small "Kelly Warpechowski" attribution label, WHOLE sticky clickable, hover lift + corner peel.

## 3 · CPTs (register via ACF JSON; expose to GraphQL per WPGraphQL conventions)
**case_study**: title, slug, section_label, client, role, stack[], timeline, live_url?, related_build?, card_summary, card_category, card_media, sort_order, featured_on_home, thesis, sections[] (flexible content)
**project**: title, slug, tagline, card_category, status, card_media, sort_order, sections[]
**build**: year (string, supports "2022–24"), name, url?, role, cms?, framework?, motion(bool→"· GSAP"), notes, via_name?, via_url?, case_study_slug?, thumb?, row_type: site|employer, recognizable, sort_order — seed content reference: build-table.md (31 rows, copy exact)

## 4 · Templates + content sources
- Home: PageHero(home) → WorkCardGrid → BuildTable → ThesisLine(scroll: "The content model is a user interface," / "the editor is the user.") → QuestionCTA ×3 (gets built? → /process · build for love? → /projects tab anchor · how I got here? → /about) → SiteFooter. Copy: home.md
- /case-studies/[slug]: sections[] renderer; Ascaya from ascaya-build-sheet.md (as-built section wins), Palette Town from palette-town-build-sheet.md
- /projects/[slug]: same renderer (content later)
- /about, /process: same renderer over page section arrays (about.md, process-how-i-work.md; skim-layer restructure comes later — build plumbing now)
- /colophon: standalone page now; intercepted-route panel is a later milestone

## 5 · Build order
1. Scaffold, fonts (@font-face Grift + AOT Serial Mono), tokens, space() scale, dot-grid canvas
2. schema.md manifest seeded from section 2 field names → Kelly approves → fragments + ACF JSON for the CPTs and the 9 components
3. Table primitive, then the 9 components (static where no animation brief) at a /dev scratch page
4. SidebarNav (full selection system)
5. Home
6. Ascaya (validate against Kelly's pixel-complete Figma)
7. Palette Town, then remaining pages as content arrives

## 6 · Rules Kelly will hold you to
- Follow SCHEMA DISCIPLINE and ANIMATION DISCIPLINE above; when uncertain, ask, don't assume
- No em-dashes in rendered copy; numerals over spelled-out numbers
- Nothing hardcoded that belongs to content; everything flows from GraphQL shapes in the manifest
- If the codebase drifts past easy comprehension, restructure before continuing — Kelly reviews everything
- Restraint doctrine: no unspecified motion
- The Figma selection idiom (marching ants, chip, tint) is the site's signature; polish it
- Accessibility 100: landmarks, focus states, keyboard tree nav, reduced-motion fallbacks, alt text from data
