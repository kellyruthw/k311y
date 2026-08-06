# k311y.com — Content Model

*Field architecture for the portfolio CMS (headless WordPress + ACF + WPGraphQL), written in my own annotation style, because even my case studies are structured content rather than pages.*

*This document describes the model **as built**. The first draft of it was written before the design existed and guessed at a fair amount; where the built model disagrees with that guess, the built model wins and the reasoning is recorded at the bottom. The field-level truth lives in `lib/schema.md`. This is the readable version.*

---

## Custom post types

### `case_study`
The Work entries. Separate from pages because they share a schema, a card representation, and a route.

GraphQL `caseStudy` / `caseStudies` · route `/case-studies/[slug]`

**Meta** (field group: Case Study Meta)
- `section_label` — text. The label the nav tree gives this entry
- `client`, `role`, `timeline` — text. MetaBlock rows
- `stack` — repeater to `stack_item` (text). Rendered as chips
- `live_url` — url, optional
- `thesis` — textarea, optional

**Card** (same group, second tab)
- `card_summary` — textarea. The card's display title
- `card_category` — text. The card's mono eyebrow, e.g. "Headless WordPress"
- `card_media` — image or mp4. Video renders muted and looped
- `sort_order` — number, ascending, ties break on title
- `featured_on_home` — true/false. Controls appearance in WorkCardGrid

**Body** — the `sections` flexible content field.

### `project`
Ant Farm, Star Crossed, and whatever's next. A lighter schema than case studies on purpose. These are love letters, not evidence files.

GraphQL `project` / `projects` · route `/projects/[slug]`

`tagline` (text) · `card_category` (text) · `status` (text, optional) · `card_media` (image or mp4) · `sort_order` (number) · `sections` (the same flexible content field).

Shared body schema, different editorial expectations.

### Pages
Home, About, How I work, Colophon. All composed from the same `sections` field. No page templates with hardcoded layouts. If a page can't be built from the component system, the component system is wrong.

Home is the proof of that rule: it is an ordinary WordPress page. Its hero, its tabbed card grid, and its 31-row build table are all just layouts in `sections`, which is why reordering them in the editor reorders the site and the nav tree at the same time.

### No `build` post type
The first draft gave the build table its own CPT. It doesn't have one. The 31 rows are a repeater on Home instead.

The cost I accepted, written down so I can't pretend I didn't see it: no list view, no search, no bulk edit across 31 rows, and ACF repeaters get sluggish at that length. What I bought for it: the table is one editing surface in the place it renders, rather than 31 posts that exist only to be a table. For a set this size that closes, it was the right trade. If it ever reaches 60 rows it stops being.

---

## Taxonomies

### `collaborator` (on the BuildTable rows)
Every agency I've worked through, authored once.

- Term name is the display name, e.g. "Milk & Butter", ampersand, per their brand
- `company_url` — url. The legend link target. Wicked+ links out
- `marker_colour` — select: blue (Wicked+) / pink (Milk & Butter) / green (Digital Media Management)

Every collaboration uses the same star glyph and only the colour changes. The legend under the table is **derived**, not authored: it is the set of terms the rows actually use, so it can never list an agency that appears nowhere or omit one that does, and the glyph colours match between row and legend because both read the same term.

Why a taxonomy rather than a second repeater: rows store a term ID, so renaming an agency updates every row and the legend at once, and adding a fourth is one screen with no schema change. A repeater would force rows to match on a name string, which breaks silently on rename.

### `discipline` and `stack_tag` are cut
Both were in the first draft to power filtering. Nothing in the built design filters. Two taxonomies with no interface attached to them are two more things to maintain and explain, so they went. If a filter ever earns its place, the terms are recoverable from the content in an afternoon.

---

## Flexible components — `sections`

Twelve layouts, one field group, one Renderer. A layout authored on a page, a case study, or a project resolves to the same GraphQL type, which is what lets one renderer serve every route.

**No wysiwyg anywhere.** The first draft had a `Prose` component doing most of the work, and it was the thing most worth killing: a wysiwyg is a blank cheque that turns a content model back into a page builder. Every paragraph is now a deliberate repeater entry.

**Every prose field is multi-line and every authored break is kept.** Where a heading breaks across two lines ("Desktop gets designed. / Mobile gets decided.") is an editorial decision, not something to hand to the container width. Components render each authored line as its own element, so no stylesheet can collapse the break and no HTML gets injected.

### The twelve

**`PageHero`** — `variant`: home / case / simple. The home variant carries the split headline (`headline_lead` + `headline_tail` + `headline_highlight`) and the CURRENTLY table. The case variant carries the chips, title, media and the MetaBlock. One hero, three jobs.

**`IntroCopy`** — `kicker` · `paragraphs[]` · `emphasis_line`, the yellow text tier, roughly one per page.

**`TextSection`** — `kicker` · `heading` · `paragraphs[]`. Standalone prose, and what `Prose` should have been all along.

**`MediaCopy`** — the workhorse. Media beside structured copy, flippable via `media_side`, with `media_type` of image / video / table and a `before_after` variant. Its body is `copy_blocks[]`: leave the label empty for prose, fill it for the labelled pairs ("Problem" / "My solution").

**`FullWidthMedia`** — `width`: wide / full · optional browser `frame` for site captures · `zoom_lens` hover magnifier, off on touch and on reduced motion. This is the first draft's `ArtifactMedia`, renamed to what it actually does.

**`CalloutList`** — header trio · `columns`: 2 / 3 / 4 · `cards[]` with optional media. Equal media heights per row, and no hover state: a card that lifts under the cursor promises a click it does not have.

**`LargeList`** — header trio · `items[]`. Oversized zero-padded numerals, full-width bordered rows, spec register.

**`SplitStatement`** — `quote` · `highlight_phrases[]` promoted to yellow mono boxes · `variant`: scroll / static. The one-sentence beliefs. Supersedes the first draft's `ThesisLine`.

**`NextCase`** — `next_ref` to a case study, auto kicker "NEXT CASE STUDY · {name}". Authored per page, so it earns a nav node.

**`WorkCardGrid`** (Home) — a `tabs[]` repeater, each tab naming its label, its count display, and its source post type. Cards come from that CPT, filtered on `featured_on_home`, ordered by `sort_order`.

**`BuildTable`** (Home) — `label` · `count_display` · `caption` · 31 `rows[]`. Columns YEAR · SITE · ROLE · STACK · NOTES · LINK, sorted year descending then repeater order.

**`QuestionCTA`** — `notes[]`, 1 to 3. Blue stickies, tape, opposing rotations with the middle straightest. The whole sticky is the link.

**`MetaBlock`** is the thirteenth thing, and it authors nothing. It has no fields and no layout. `PageHero` in its case variant renders the entry's meta through the Table primitive. Keeping it out of the layout list means it cannot be forgotten, duplicated, or placed somewhere the design never puts it.

### Cut from the first draft
`Prose` (a blank cheque), `SectionHeader` (it was a header trio pretending to be a component, and now it is a header trio on the components that need one), `StatTable` (it was Table in vertical mode), `CTABlock` (QuestionCTA does the job with a point of view), `ComponentTreeInteractive` (the sidebar nav is this, on every page, for real, rather than a diagram of it).

Still owed, and honestly scoped: `Carousel` (Samesurf's exploration rounds), `Accordion` (Palette Town's commerce checklist, and the site's only accordion per doctrine), `ProcessSteps` (the How I work methodology).

---

## The shared primitive: `Table`

Not an ACF entry. One React component every table on the site renders through, so there is one implementation of the borders, the mono type, and the mobile transform.

Vertical takes label/value rows and serves MetaBlock and MediaCopy's table mode. Horizontal takes columns and rows and serves BuildTable and the hero's CURRENTLY table.

On mobile the horizontal orientation collapses into stacked full-width cards with the data stacking vertically and the link promoted to a visible action. That is a deliberate self-reference: it is the same move the Ascaya case study is about.

---

## Global chrome

Not components, no nav nodes, no layouts.

**`SidebarNav`** authors nothing. The tree is derived from each page's `sections` array, in order. Reordering sections reorders the tree; deleting one cannot leave a node behind. This is the part of the site I most want read as a claim: the navigation is a view of the content model, not a menu maintained beside it.

The constitution, since it is load-bearing:
- **Squares** are pages
- **Circles** are flexible components, in page order, grouped by type
- **Diamonds** are CPT-fed subcomponents (Card, TableRow, MetaBlock)
- **Chrome gets no node**
- **Count chips** render only above 1
- **State is live**: hovering a node marches ants around every matching section, and the Card diamond's chip ticks between counts with the active tab

**`SiteFooter`** is an ACF options page: `tab_label`, `availability_line`, and a `links[]` repeater. Edited once, identical everywhere, no animation.

---

## Estimate

Written before the build, kept unedited, because a revised estimate is not an estimate:

> 7 low-cost components (7 × 1.5 avg = ~10.5 hrs) + 5 high-cost (5 × 6 avg = ~30 hrs) + CPT/taxonomy setup and GraphQL wiring (~6 hrs) + page composition and content entry (~12 hrs, though the content is already written, because someone made me write it all first).
>
> **Estimated: ~58 hrs.**

What that estimate did not have a line for, and what I would price differently next time: the sidebar nav's selection system, which is a component in the estimate and a small application in practice, and the schema discipline itself, which cost real hours up front and paid them back the first time a field changed.

**Tracked actual: TBD**, and going on the colophon either way, because that's the kind of receipt I keep.

---

## Notes for the build

- ACF JSON and the GraphQL fragments are generated through my Claude workflow: screenshot the designed component, confirm the name, specify the fields, generate both blobs. Same as Ascaya.
- The manifest is the source of truth. Nothing is queried, no ACF JSON is written, and no component is built until its entry in `lib/schema.md` says APPROVED. When the fragment, the JSON, and the component props drift apart, the manifest is what they get reconciled against.
- Field keys are `field_<layout>_<field>`, derived and never randomised. Changing a key orphans content.
- No em-dashes in authored copy. Numerals over spelled-out numbers.
