# k311y.com — Page-by-page component map
*Every page as an ordered component stack. Component vocabulary revised: no wysiwyg — structured pieces only. New components implied by this map are marked ★. This is the wireframe; your design research decides what each component actually looks like.*

## Revised component vocabulary
- `PageHero` — page-level opener; variants for home / case study / simple
- `SectionHeader` — mono label + headline + optional intro
- `TextSection` ★ — kicker (optional) + heading (optional) + paragraphs (repeater). Replaces wysiwyg prose: every paragraph is a deliberate entry
- `MediaCopy` ★ — media beside structured copy (heading + paragraphs + optional list); flippable sides. The workhorse
- `ArtifactMedia` — standalone media: image / video / gallery / before-after; contained / wide / full-bleed; optional browser frame
- `Carousel` ★ — sequential media with captions (exploration rounds, iterations)
- `Accordion` ★ — labeled expandable rows (dense checklists that shouldn't dominate the page)
- `CalloutList` — titled items; styles: bullets / numbered / cards (2–4 up)
- `ThesisLine` — one big-type sentence with breathing room
- `StatTable` — label/value rows, numeral-first
- `MetaBlock` — case study meta (role, stack, timeline, live link)
- `ProcessSteps` — numbered methodology steps with inline artifacts
- `QuestionCTA` ★ — your invention from the About closer: question + link, usually paired
- `WorkCardGrid` / `ProjectCardGrid` — entry cards
- `BuildTable` — reverse-chron table of 30+ builds with marker legend; sub: `TableRow` (build CPT)
- `ComponentTreeInteractive` — hover a node, its live section highlights
- `NextCase` ★ — footer nav between case studies, keeps the tour moving

---

## Home
1. `PageHero` (one-off design) — headline + swipe reveal + subhead + NowLine + component tree nav
2. `WorkCardGrid` — now tabbed: `tabs` repeater (tab_label + count_display + source CPT) rendering "SELECTED WORK · 5" / "PROJECTS · 2"; sub: `Card` (case_study or project CPT per active tab)
3. `BuildTable` — tab from own fields ("FEATURED SITES I'VE BUILT · 30+") · sub: `TableRow` (build CPT)
4. `ThesisLine` — the two-sided scroll moment
5. `QuestionCTA` ×3 — blue sticky notes: "Curious how all of this gets built?" → Process · "Want to see what I build for love?" → Projects · "Wondering how I got here?" → About
6. Footer CTA

*Decision (locked): the Work index page is cut. Home's WorkCardGrid + BuildTable absorbed its job; the nav's Work item anchors to Home's WorkCardGrid section. The "sometimes I'm just the designer" line moves to About or an intro line above the cards.*

*Decision (locked): section tabs on WorkCardGrid and BuildTable are the components' own `label` + `count_display` fields, not nested SectionHeader components. SectionHeader remains standalone for genuinely freestanding headers (About, Process). Sidebar tree shows no SectionHeader under Home; Card and TableRow appear as CPT-driven sub-component diamonds.*

## Case study: Ascaya
1. `PageHero` (case variant) — title + `MetaBlock` + full-bleed site capture
2. `TextSection` — overview
3. `SectionHeader` — "The first problem is reading the design"
4. `MediaCopy` — abstraction judgment copy + annotated-Figma artifact
5. `ArtifactMedia` (wide) — cost classification + component trees
6. `TextSection` — the 20-designed / 11-composed proof
7. `SectionHeader` + `TextSection` — inventory modeling (CPTs vs. taxonomies)
8. `ThesisLine` — "The content model is a user interface…"
9. `MediaCopy` (before-after) — listing table → mobile card grid
10. `TextSection` — motion, performance, the map story
11. `MediaCopy` — Claude schema workflow (screenshot-to-schema loop)
12. `StatTable` — components, pages, CPTs, 136→100, Lighthouse
13. `TextSection` — impact
14. `ThesisLine` — reflection closer
15. `NextCase` → Palette Town

## Case study: Palette Town
1. `PageHero` + `MetaBlock` + storefront capture
2. `TextSection` — overview ("my most honest case study")
3. `MediaCopy` — checkout-trust reasoning + Shop Pay flow capture
4. `MediaCopy` — editing-friction story + old-admin pain framing
5. `ThesisLine` — the tradeoff ("…and I chose a stack with no CMS")
6. `TextSection` — conventions + AI as the rebuilt editorial layer
7. `SectionHeader` — "Building my own back office"
8. `MediaCopy` ×3 — vote pipeline / live vote ops / editorial pipeline, each with its admin screenshot
9. `TextSection` — panel architecture (subdomain, shared styling layer)
10. `Accordion` — the unglamorous commerce layer (DNS, Gelato, email, Merchant Center, schema, SEO)
11. `TextSection` or `StatTable` — impact (pending your GSC decision)
12. `NextCase` → Harland

## Craft spotlight: Harland
1. `PageHero` — full-bleed video capture of the site in motion (this page should *move*)
2. `TextSection` — "The brief was a feeling"
3. `ArtifactMedia` (video, full-bleed) — the reveal
4. `MediaCopy` (video) — the keyhole, copy centered, imagery streaming outside
5. `TextSection` — mobile: tone down, don't scale down
6. `TextSection` — "What I'd do differently — and then did"
7. `QuestionCTA` — "See the restraint version" → Ascaya
8. `NextCase` → TerraTrue

## Case study: TerraTrue
1. `PageHero` + `MetaBlock`
2. `TextSection` — overview + problem statement
3. `CalloutList` (cards) — context + constraints
4. `MediaCopy` — early friction + original Data Spec artifact
5. `CalloutList` (numbered) — design principles
6. `ArtifactMedia` (wide) — progressive flow diagram
7. `MediaCopy` — designing clarity one decision at a time + screens
8. `MediaCopy` — progressive complexity + data types/retention screens
9. `CalloutList` (3-up cards) — impact
10. `TextSection` — $15M Series A line
11. `CalloutList` (numbered) — lessons from designing systems
12. `TextSection` — hard lessons (give this one visual weight — it's the page's memory)
13. `NextCase` → Samesurf

## Case study: Samesurf
1. `PageHero` + `MetaBlock`
2. `TextSection` — overview + problem + constraints
3. `MediaCopy` — framing questions + sticky-note artifact
4. `TextSection` — "rethinking navigation, not just adding a feature"
5. `CalloutList` (two groups) — principles / deprioritized
6. `MediaCopy` — persistent-space evaluation + notes artifact
7. `Carousel` — exploration concepts (nav densities, pull-tab, floating vs. fixed)
8. `CalloutList` — key refinements
9. `MediaCopy` — final solution + session UI
10. `ArtifactMedia` (gallery) — desktop + portrait prototypes
11. `TextSection` — impact + evidence
12. `ThesisLine` — "Clarity early prevents compounding complexity"
13. `NextCase` → back to Ascaya (the loop closes)

## Project detail pages (project CPT, same `sections` field as case studies)
**Ant Farm:** `PageHero` (simple) → `TextSection` (overview from projects draft) → `MediaCopy` (sim captures) → `ArtifactMedia` (TDD excerpts) → `TextSection` (the comprehension-checkpoint story, linking to Process) → `QuestionCTA` → Star Crossed
**Star Crossed:** `PageHero` (simple) → `TextSection` (overview) → `ArtifactMedia` (gallery: Sky, Star Lab, Codex mockups) → `MediaCopy` (design tokens + DESIGN-SYSTEM.md excerpt) → `QuestionCTA` → back to Work

*Decision (locked): the Projects index page is cut, same logic as the Work index — Home's tabbed WorkCardGrid absorbed it. Ant Farm and Star Crossed are promoted to project detail pages (the project CPT's `sections` field already supports this, zero schema change). Nav "Projects" + sticky CTA #2 anchor to Home's section with the Projects tab active. The "What I build for love" line becomes the tab panel's intro; the Neopets origin stays on About.*

*Decision (locked): tabs do NOT appear as nodes in the sidebar tree — they're fields (chrome), same rule as section labels, and the sidebar's Work/Projects page items already route to each tab. Instead the tree is stateful: the `Card` diamond under `WorkCardGrid` carries a count chip that flips with the active tab (5 ⇄ 2, small odometer-tick animation on switch), and hover-highlighting governs whichever card set is currently shown. The chip does triple duty: sub-component count, tab-state indicator, and visual echo of the section chips' yellow-pill grammar. No new shapes added to the tree constitution.*

## About
1. `SectionHeader` — "The short version"
2. `MediaCopy` — the long version + a photo of you (yes, a real one)
3. `TextSection` — "What drives it"
4. `QuestionCTA` ×2 — your closer

## How I work
1. `SectionHeader` — intro (two workflows, same destination)
2. `ProcessSteps` — Figma to field architecture, 6 steps, artifacts inline
3. `SectionHeader` — "When nothing exists"
4. `ProcessSteps` or `MediaCopy` sequence — scratchpad → plan → comprehension checkpoint → the Kelly punch
5. `TextSection` — "Why I work this way"
6. `QuestionCTA` — "See it applied" → Ascaya

## Colophon (right-side inspect panel · intercepted route)
*Completes the Figma chrome: layers left (nav), canvas center, inspect right (colophon). Opens as a slide-in panel over the current page via Next.js intercepted route; renders as a standalone page on direct load/refresh of /colophon, so it stays shareable.*
1. `SectionHeader` — "How this site is built"
2. `TextSection` — stack + approach (same architecture I sell)
3. **Annotation-mode toggle** — "Show components": the page behind the panel reveals every section's component chip + fields
4. `ComponentTreeInteractive` — this site's own content model
5. `StatTable` — estimate vs. tracked actual (~58 hrs vs. TBD)
6. `CalloutList` — the tree constitution (squares pages, circles flexible, diamonds CPT-fed, chrome no node, state live)
7. `TextSection` — AI disclosure: how Claude fits the workflow
8. `CalloutList` — type, semantic color rules, tools, thanks
9. **k-terminal easter egg** — prompt: k311y %
10. `QuestionCTA` — "This is what I'd build for you" → contact

---

*Component reuse check: every page composes from the shared vocabulary; no page needed a one-off. 17 components across 11 pages — leaner than Ascaya's 25, as it should be.*
