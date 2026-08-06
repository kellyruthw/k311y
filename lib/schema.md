# Schema manifest

The single source of truth for every field on the site. Nothing is queried, no
ACF JSON is written, and no component is built until its entry here says
**APPROVED**.

## How to read an entry

| column | meaning |
|---|---|
| field | the ACF field name, `snake_case`. WPGraphQL exposes it as `camelCase`. |
| type | the ACF field type |
| req | required in the WordPress editor |
| conditional | when the field is shown, based on another field's value |

Each entry also names the three artefacts that must agree with it: the fragment
file, the flexible-content layout key, and the GraphQL type WPGraphQL generates.
There is no per-component ACF file. All twelve layouts live in the one
`acf-json/group_sections.json`, which is why the key prefix is what identifies a
component's fields inside it.

## Conventions

- **Field keys** are `field_<group>_<field>`, derived from the names below and
  never randomised. Changing a key orphans existing content.
- **Layout GraphQL types** follow WPGraphQL-ACF's pattern:
  `<Group><FlexField><Layout>Layout`. The group is named `PageSections` and the
  field `sections`, so every layout resolves to `PageSectionsSections<Layout>Layout`
  regardless of which post type it is authored on. One union, one Renderer map.
- **No em-dashes** in any authored copy. Numerals over spelled-out numbers.
- Optional fields are `T | null` in TypeScript, never `undefined`.

## Status

**APPROVED** and written to `acf-json/`. Sync in wp-admin to load them.

| file | contents |
|---|---|
| `post_type_6a70235a63cc8.json` | `case-study` post type (authored by Kelly in the ACF UI) |
| `taxonomy_collaborator.json` | `collaborator` taxonomy |
| `group_collaborator.json` | term fields: url, colour, glyph |
| `group_case_study_meta.json` | 12 fields across Meta and Card tabs |
| `group_project_meta.json` | 5 fields |
| `group_sections.json` | the flexible content field, 13 layouts |
| `group_site_footer.json` | options page fields |

Not in the repo yet: the `project` post type, which predates the JSON sync.
Open ACF -> Post Types -> Project -> Update and it will export itself.

Two mu-plugins support this, both in the WordPress install:
`k311y-acf-json.php` (sync path) and `k311y-options.php` (the Site Footer
options page, with its GraphQL name).

---

# 1 · Post types and taxonomies

Registered by ACF (6.8.6 supports this natively), exported to `acf-json/` as
`post_type_*.json` and `taxonomy_*.json`. No CPT UI plugin needed.

> **Fix required:** the existing `work` post type registers the same GraphQL
> singular and plural name, which shadows the collection query
> (`{ work { nodes } }` fails). It is replaced by `case_study` below and should
> be deleted in wp-admin once the new type syncs.

## `case_study`
GraphQL: `caseStudy` / `caseStudies` · route `/case-studies/[slug]` · ACF: `acf-json/post_type_6a70235a63cc8.json`

| field | type | req | conditional | notes |
|---|---|---|---|---|
| — | — | — | — | uses the post title as `title` and the post slug as `slug` |
| section_label | text | yes | — | label shown on the nav tree node for this entry |
| client | text | yes | — | MetaBlock row |
| role | text | yes | — | MetaBlock row |
| stack | repeater -> `stack_item` (text) | yes | — | MetaBlock row, rendered as chips |
| timeline | text | yes | — | MetaBlock row |
| live_url | url | no | — | MetaBlock row, external link |
| related_build | post object -> `build` | no | — | links the case study to its BuildTable row |
| card_summary | textarea | yes | — | WorkCardGrid card display title |
| card_category | text | yes | — | WorkCardGrid mono eyebrow, e.g. "Headless WordPress" |
| card_media | image \| file (mp4) | yes | — | WorkCardGrid card media. Video renders muted + looped |
| sort_order | number | yes | — | ascending. Ties break on title |
| featured_on_home | true/false | yes | — | controls appearance in WorkCardGrid |
| thesis | textarea | no | — | feeds a `SplitStatement` on the case page |
| sections | flexible content | yes | — | the 9 layouts below |

> The handoff also listed `related_build`, pointing at a `build` post. Since the
> BuildTable is now a repeater rather than a post type there is no post to point
> at, so the link runs one way only: a BuildTable row references a case study.

## `project`
GraphQL: `project` / `projects` · route `/projects/[slug]` · ACF: `acf-json/group_project_meta.json` · key prefix `field_project_`

| field | type | req | conditional | notes |
|---|---|---|---|---|
| tagline | text | yes | — | |
| card_category | text | yes | — | WorkCardGrid mono eyebrow. Fallback tab label when the hero authors no chips |
| status | select | no | — | `concept` \| `in_progress` \| `playable`. Authored, not yet rendered anywhere |
| card_media | image \| file (mp4) | yes | — | |
| sort_order | number | yes | — | |
| role | textarea | no | — | MetaBlock row. First line is the value, a second renders smaller and italic |
| timeline | textarea | no | — | MetaBlock row, same two-line rule |
| live_url | url | no | — | adds the link row to the MetaBlock |
| stack | repeater -> `stack_item` | no | — | one technology per row, joined with " · " |
| sections | flexible content | yes | — | the same 13 layouts every post type gets |

> **On the MetaBlock.** `role`, `timeline`, `live_url` and `stack` are named
> after the `case_study` fields they mirror, and are read by the same
> `HeroMeta` shape, so `CaseHero` draws the box for either post type without
> knowing which it is looking at. Its docstring said "the case-study and
> project hero" from the start; only the loader was missing.
>
> They are optional here where a case study requires them: a project is a
> personal thing and may genuinely have no timeline worth stating. Every row
> drops out on its own when empty.
>
> There is no `client` field, and that is the one row a project never gets.
> Nobody commissioned Ant Farm.

> **On the tab.** A project's tab is derived exactly as a case study's is:
> the hero's `kicker_chips`, joined with a middot, with no chip beside it.
> `card_category` is only the fallback for a hero that authored none.
>
> The two post types differ in what they can say, not in how they look. Where
> a case study reads "Case study · Headless WordPress", a project reads
> "Project · Next.js + PixiJS" -- one label, one shape, one component.

> **No `build` post type.** The handoff specified one, but the 31 BuildTable
> rows are authored as a repeater on the Home page instead. The row fields moved
> into the `BuildTable` entry in section 4.

## Taxonomy: `collaborator`
GraphQL: `collaborator` / `collaborators` · ACF: `acf-json/taxonomy_collaborator.json`
Field group: `acf-json/group_collaborator.json` · key prefix `field_collaborator_`

Each agency Kelly has worked through, authored **once**. Attached to the
`collaborator` field inside BuildTable rows.

| field | type | req | conditional | notes |
|---|---|---|---|---|
| — | — | — | — | term name is the display name, e.g. "Milk & Butter" (ampersand, not "and") |
| company_url | url | yes | — | legend link target. Wicked+ links out |
| marker_colour | select | yes | — | `blue` \| `pink` \| `green` |

Every collaboration uses the same star glyph. Only the colour changes:

| value | token | hex | agency in Figma |
|---|---|---|---|
| blue | `$color-marker-wicked` | `#1f9fd2` | Wicked+ |
| pink | `$color-marker-milkbutter` | `#e253a4` | Milk & Butter |
| green | `$color-marker-dmm` | `#91e82e` | Digital Media Management |

Seed terms: Wicked+, Milk & Butter, Digital Media Management.

> Why a taxonomy rather than a second repeater: rows store a term ID, so
> renaming an agency updates every row and the legend at once, and adding a
> fourth is one screen with no schema change. A repeater would force rows to
> match on a name string, which breaks silently on rename.

---

# 2 · Shared primitive: `Table`

Not an ACF entry. A React component every table on the site renders through,
so there is one implementation of borders, mono type and the mobile transform.

```ts
type TableProps =
  | { orientation: "vertical";   showHeaders?: boolean; rows: { label: string; value: string; valueNote?: string | null }[] }
  | { orientation: "horizontal"; showHeaders?: boolean; columns: string[]; rows: string[][] }
```

Used by: MetaBlock (vertical), MediaCopy in table mode (vertical), BuildTable
(horizontal), PageHero home nowline (horizontal).

Mobile, horizontal only: collapses into stacked full-width cards, data stacking
vertically, link promoted to a visible action. This is a deliberate
self-reference to the Ascaya case study.

### `mobile` — how a horizontal table behaves below `tablet`

A prop, not a field. Nothing about it is authored: it is a build-time decision
about presentation, and putting it in ACF would be offering an editor a choice
whose right answer is fixed by the row count.

| value | behaviour |
|---|---|
| `cards` | the default above. Every row becomes a stacked full-width card |
| `deck` | the rows become one horizontally swipeable deck of cards |

`deck` exists because `cards` does not survive length. BuildTable has 31 rows,
which stack to roughly 8,000px -- more of Home than everything else on it put
together, to say something the reader could take in from one card and a count.
As a deck the same section is about 430px and is swiped rather than scrolled.

Only BuildTable passes it. The Home hero's CURRENTLY table has one row and stays
`cards`; a deck of one is not a deck.

The primitive draws one presentation or the other rather than letting a consumer
undo the first: its card rules are gated on `:not([data-mobile="deck"])`, so the
deck starts from the plain table rules instead of out-specifying a second
layout. That is the whole reason this is a prop rather than a stylesheet
override in BuildTable.

**A card needs an image.** A row with no `thumb` is not shown in the deck at
all, which on the current content hides 9 of the 31 rows -- the deck is 22
cards. This is the one place on the site where a breakpoint changes what
content exists rather than how it is arranged, so it is recorded here rather
than left in a stylesheet: an editor adding a row without a thumbnail will not
see it on a phone, and nothing in wp-admin will say so.

The rule is derived, not authored. It asks whether the row rendered a
thumbnail, so there is no second field to set and no way for a flag to
disagree with the media it describes.

**What the deck keeps.** Every column, including `notes` and `link`. The
stacked-card proposal that preceded this dropped both to save height; the deck
solves height by not stacking, so nothing has to be hidden. `notes` is the only
field that says what a site *is* -- 30 of the 31 rows carry one -- and `link`
becomes the card's own action rather than a column.

**What is not settled.** A deck is good for browsing and poor for finding: there
is no way to reach the 2013 rows except by swiping past twenty. Shipped as-is
deliberately, to be looked at before deciding whether it needs a companion list.

---

# 3 · Flexible components

Ten layouts. The handoff calls them "the 9 flexible components" but lists ten;
`MetaBlock` is the extra, and it authors no fields of its own, which is probably
the reason for the count.

All render `data-component` and `id`, accept selection state, and support an
optional header trio: `kicker` (mono caps), `heading`, `intro`.

**Every prose field is multi-line and every authored break is kept.** The Ascaya
frame breaks nearly every heading across two lines ("Desktop gets designed. /
Mobile gets decided."), and where the break falls is an editorial decision, not
something to leave to the container width.

Components render each authored line as its own element, the same way the Home
hero does, so no stylesheet can collapse the break and no HTML is injected.
`lib/acf.ts` `toLines()` normalises `<br>`, U+2028 and CRLF alike, so it does
not matter how the break was typed.

## Entrances

Seven components share one entrance, briefed across several sessions but adding
up to a single decision: **the block's parts fade in and rise a little, on a
short stagger, once, as the section reaches the viewport.** It is recorded here
rather than seven times over, because restating it per component invites the
seven copies to drift.

| component | what staggers, in order | hook |
|---|---|---|
| `PageHero` (simple) | head (kicker + H1), then the intro paragraphs | `data-hero-simple` |
| `PageHero` (background_media) | H1, intro, CTA -- over a backdrop that grows. See the variant's own note | `data-bg-copy` |
| `TextSection` | the kicker/heading block, then each paragraph | `data-enter-block` |
| `MediaCopy` | media, then copy | `data-media-half` / `data-copy-half` |
| `CalloutList` | the head, then each card | `data-enter-block` |
| `LargeList` | the head, then each row | `data-list-head` / `data-list-item` |
| `QuestionCTA` | each sticky note | `data-note` |

`WorkCardGrid` follows the same shape but is gated behind the home hero, and has
its own note in section 4. `MediaCopy` is deliberately the quietest of them --
Kelly's brief was "subtle", and a media block that announces itself competes with
the media.

Four rules hold across all of them:

- **`once`, and on the way down only.** These are arrivals, not scrubbed
  relationships. The only two scrubbed things on the site are `SplitStatement`
  and `SiteFooter`, and both are scrubbed because they are *about* the scroll
  rather than about appearing.
- **The start state is CSS, not JS.** `styles/base/_globals.scss` hides every
  hook above before any script runs, so nothing is ever seen in its finished
  position for a frame and then moved. The consequence is worth stating plainly:
  if the JS chain breaks, the content does not appear at all rather than
  appearing unanimated. A section that is mysteriously blank is this, and the
  first thing to check is whether its timeline ran.
- **`<noscript>` in `app/layout.tsx` reverses that pre-state**, so a reader with
  scripting off gets the finished page rather than an empty one.
- **Reduced motion renders the finished state directly.** Every one of these is
  inside a `gsap.matchMedia()` gated on `(prefers-reduced-motion: no-preference)`.

Two components animate but are NOT part of this: `IntroCopy`, which scrubs word
by word, and `SiteFooter`, which is scrubbed. Both are noted where they live.

`FullWidthMedia` has no entrance, deliberately. It is a full-bleed image, and a
full-bleed image that fades in draws attention to the fade rather than to itself.
Per ANIMATION DISCIPLINE that stays true until someone briefs otherwise.

## `PageHero`
Fragment `lib/fragments/pageHero.ts` -> `PageHeroFields` · key prefix `field_page_hero_`
Layout `page_hero` · GraphQL `PageSectionsSectionsPageHeroLayout`

| field | type | req | conditional | notes |
|---|---|---|---|---|
| variant | select | yes | — | `home` \| `case` \| `simple` \| `split` \| `stacked` \| `background_media` |

> **On the case variant:** `title` is the page's H1, and it is the descriptive
> line ("Content architecture for Las Vegas's premier luxury community"), not
> the entry name. The name comes from the post title and appears in the chips
> and the nav. Every case study and project shares this hero layout.

> **On the split variant:** a full-height opener, `min-height: 100vh`, with the
> media on 4 of the 8 content columns and the copy on the other 4. It authors
> almost nothing of its own: `kicker`, `title`, `intro` and `media` are the same
> fields the simple and case variants already use, so copy can move between
> variants without being retyped and no second set of keys exists to drift.
> `media_side` is named after MediaCopy's field of the same name and takes the
> same two values, because it is the same decision.
>
> The CTA is an in-page anchor, not a link out. `cta_link` holds a fragment
> (`#text-section-2`) matching the id a section renders, which is why it is a
> text field and not ACF's `url` type -- `url` rejects a bare fragment. Those
> ids are derived by `Renderer.sectionId()` from component name and page
> position, so reordering the sections on a page changes them and any authored
> anchor has to be revisited.

> **On the stacked variant:** the same full-height opener as `split`, arranged
> the other way round: the H1 runs across 7 of the 8 columns and the media and
> copy sit in a row beneath it, 4 columns each. It authors nothing of its own
> at all -- every field it uses is one `split` already had, which is the whole
> reason it is a variant and not a layout.
>
> Its CTA is plain type in `$color-text-select`, where `split` uses the white
> `mono-button`. Figma draws them differently and they are doing different
> jobs: one closes a full-height statement, the other is a quiet aside under a
> paragraph. Figma sets both at 18px mono, which `$sizes` has no entry for, so
> both take the nearest token rather than adding one.
| headline_lead | textarea | yes | variant = home | "Design engineer building the sites you see". Grift Bold 90/100, white. Line breaks are meaningful |
| headline_tail | text | yes | variant = home | "and the systems you don't." AOT Serial Mono Light 58, -0.12em |
| headline_highlight | text | no | variant = home | substring of `headline_tail` set in black. Invisible on the black canvas until the yellow box wipes in behind it |
| paragraph | textarea | yes | variant = home | the `paragraph-large` style. Figma: Grift Medium 24/1.5 |
| table_name | text | no | variant = home | label on the tab above the table, e.g. "Currently" |
| table_orientation | select | no | variant = home | `horizontal` \| `vertical` |
| table_show_headers | true/false | no | variant = home | |
| table_columns | repeater -> `column_label` | no | orientation = horizontal | |
| table_rows | repeater -> `cells` (repeater -> `cell_value`) | no | orientation = horizontal | |
| table_vertical_rows | repeater -> `row_label`, `row_value`, `row_value_note` | no | orientation = vertical | |
| kicker_chips | repeater -> `chip_label` (text) | no | variant = case | |
| title | text | yes | variant = case, simple, split, stacked | |
| media | image \| file (mp4) | yes | variant = case, split, stacked | |
| kicker | text | no | variant = simple, split, stacked | |
| intro | textarea | no | variant = simple, split, stacked | |
| media_side | select | yes | variant = split, stacked | `left` \| `right`. Same field name and values as MediaCopy's |
| cta_label | text | no | variant = split, stacked | the whole CTA is optional: no label, no button |
| cta_link | text | no | variant = split, stacked | an in-page fragment, e.g. `#text-section-2`. Text, not `url`, which rejects a bare fragment. 60px below the intro |

### The `background_media` variant — APPROVED

Figma: file `pxGuXqgJdSpBMKa0Z7Q1tO`, node `128:554` (the About frame). Requested
because `/about` currently authors `stacked`, and its opener has to fit inside
100vh, which that arrangement cannot do with this much copy: `stacked` gives the
H1 its own full-width row and then puts media and copy in a row beneath it, so
the three stack vertically and overflow.

`background_media` layers instead of stacking. The media becomes a backdrop
bleeding off one edge, dimmed into the canvas by a gradient, and the H1, intro
and CTA sit over it in a single column. Nothing is beside anything, so the
height is set by the copy alone and 100vh holds.

**It authors nothing new. There are no fields to approve, only a choice to add.**

| field | already exists on | reused as |
|---|---|---|
| title | case, simple, split, stacked | the H1, unchanged |
| intro | simple, split, stacked | the paragraph under it |
| media | case, split, stacked | the backdrop rather than a column |
| media_side | split, stacked | which edge the media bleeds off |
| cta_label / cta_link | split, stacked | the yellow mono line, exactly as `stacked` renders it |
| kicker | simple, split, stacked | optional, unused in this frame |

So the change is three things, and no new keys:

1. `variant` gains a sixth choice, `background_media` -> "Background media".
2. The six fields above gain one more OR clause in their conditional logic.
   Every one of them already lists `split` and `stacked`; this adds a third.
3. Nothing else. **The fragment does not change** -- `PAGE_HERO_FRAGMENT`
   already selects all six, and `PageHeroFields` already types them. Only the
   `// variant: split` grouping comments need their lists widening.

That is the whole point of proposing it as a variant rather than a layout. A
new layout would have meant a new key prefix, a new GraphQL type, a new
Renderer entry and six duplicate fields that could drift from these.

**Composition, from the frame.** Media bleeds off the right and is masked by a
vertical gradient, transparent at the top to the canvas black at ~88% of its
height, so the copy over its lower half reads against black rather than photo.
Copy sits on the left: H1 in `title` (90px, already capped at 100), intro in
`paragraph-large` (Grift Medium 24), then the CTA 60px below it in
`$color-text-select` at 18px mono -- the same treatment and the same nearest
token `stacked` already uses, since `$sizes` has no 18px mono entry.

The gradient is not authored. It is a fixed property of the variant, the way
the browser frame on `FullWidthMedia` is, and an opacity field would be a knob
whose only correct setting is the one the design already made.

**The two open questions, as settled by Kelly**

1. **`media_side` is kept.** It already exists on the field, it means what it
   means on `split` and `stacked`, and the copy being a single column makes
   flipping the backdrop a real choice. Default `right`, as the frame draws it.
2. **`height: 100vh`, not `min-height`.** This variant is the one place on the
   site that fixes its height rather than flooring it, and the reason is the
   CTA: it is an in-page anchor telling a reader where to go next, so it has to
   be *on screen*. A `min-height` that grows with the copy would let the CTA
   fall below the fold, which defeats the component.
   
   That is a deliberate departure from `split` and `stacked`, whose stylesheets
   argue for `min-height` on the grounds that a fixed height clips when copy
   outgrows it. Both are right about their own case. Here the risk is accepted
   and bounded: the content column is bottom-anchored, so a shorter viewport
   eats the empty space above the H1 rather than the copy, and the fixed height
   is released below the `tablet` breakpoint where three stacked blocks cannot
   share one screen anyway.

**The grid.** Read back from the frame's coordinates against the column maths,
every element lands on the 8-column content grid exactly:

| element | Figma x | content columns | as built |
|---|---|---|---|
| H1 | 367 -> 1528 | 1 to 7 | 1 to 7 |
| media backdrop | 702 -> 1698 | 3 to 8 | **4 to 8** |
| intro + CTA | 367 -> 1016 | 1 to 4 | 1 to 4 |

The media is on the grid rather than bled to the viewport edge: 1698 is exactly
where content column 8 ends.

> **The backdrop is narrower than the frame draws it**, by one column, on
> Kelly's call during the build. It starts at column 4 rather than 3, so it
> clears the 4-column copy beneath it entirely instead of overlapping its last
> column. Mirrored, that is columns 1 to 5 rather than 1 to 6.

Approved animation (home only), in order:

1. `headline_lead` fades in.
2. `headline_tail` fades in. Its `headline_highlight` substring is black on a
   black canvas, so those words are present but unreadable.
3. The yellow box wipes left to right behind the highlight, as if the words were
   being marked up. They become readable as it passes.
4. `subhead` fades, then the nowline, then the sidebar tree draws itself
   (connectors sketch, nodes pop, staggered).

Reduced-motion renders the finished state directly: box already drawn, nothing
animating, no flash of unreadable black text.

Approved animation (simple), separately briefed and separately timed: the head
-- kicker and H1 -- fades up, then the intro paragraphs follow on a stagger,
overlapping the tail of it so the two read as one arrival.

Its timings are deliberately not the home hero's. WorkCardGrid sequences itself
behind the home sequence's total length, so retuning a prose page's opener must
not move a section on a different route.

Approved animation (background_media), briefed separately again: the H1, intro
and CTA arrive on the shared stagger while **the backdrop grows upward from its
own bottom edge** behind them.

The grow is a `clip-path: inset()` easing to zero, not a scale. That is the whole
reason the picture is undistorted: insetting from the top and releasing it
uncovers the image upward at its true proportions, where a scale would stretch it
while it moved. The copy starts before the grow finishes -- the two are one
movement, and a backdrop that settled first would make the text read as a second
event.

On mount rather than on scroll. It is a page opener; by the time it could be
scrolled to, it has already happened.

## `MetaBlock`
No fields, no layout, nothing to author.

`PageHero` in its case variant renders the entry's `client`, `role`, `stack`,
`timeline` and `live_url` through Table (vertical), beside the hero media, as
drawn in the Ascaya frame.

It appears in the nav as a **diamond under PageHero**, not a circle of its own,
which is the as-built rule: a CPT-fed subcomponent is a diamond. Keeping it out
of the layout list means it cannot be forgotten, duplicated, or placed somewhere
the design never puts it.

## `IntroCopy`
Fragment `lib/fragments/caseSections.ts` -> `IntroCopyFields` · key prefix `field_intro_copy_`
Layout `intro_copy` · GraphQL `PageSectionsSectionsIntroCopyLayout`

| field | type | req | conditional | notes |
|---|---|---|---|---|
| kicker | text | no | — | no fallback. Empty renders nothing |
| paragraphs | repeater -> `paragraph_text` (textarea) | yes | — | |
| emphasis_line | text | no | — | yellow text tier. Roughly one per page |

Approved animation: the paragraphs sit at 30% opacity and each word reaches full
opacity as the reader scrolls, **scrubbed**, finishing when the component's
centre meets the centre of the viewport.

Scrubbed rather than `once`, and the one place on the site where reading speed
and scroll position are treated as the same thing. Because it scrubs, scrolling
back up un-reads it, which is correct: the effect is a position indicator, not an
arrival.

## `TextSection`
Fragment `lib/fragments/caseSections.ts` -> `TextSectionFields` · key prefix `field_text_section_`
Layout `text_section` · GraphQL `PageSectionsSectionsTextSectionLayout`

| field | type | req | conditional | notes |
|---|---|---|---|---|
| kicker | text | no | — | mono caps |
| heading | textarea | no | — | line breaks are honoured |
| paragraphs | repeater -> `paragraph_text` (textarea) | yes | — | the body. Line breaks are honoured |

> **No `intro` here either.** It was the first paragraph under a different
> name. `CalloutList` and `LargeList` keep theirs, because there an intro is a
> lead line above a genuinely different kind of body -- cards and numbered rows
> -- rather than more of the same prose.

## `MediaCopy`
Fragment `lib/fragments/caseSections.ts` -> `MediaCopyFields` · key prefix `field_media_copy_`
Layout `media_copy` · GraphQL `PageSectionsSectionsMediaCopyLayout`

| field | type | req | conditional | notes |
|---|---|---|---|---|
| kicker | text | no | — | mono caps |
| heading | textarea | no | — | line breaks are honoured |
| copy_blocks | repeater -> `block_label?` (text), `block_text` (textarea) | no | — | the body. Empty label = plain prose, filled = a mono-labelled block |
| list_items | repeater -> `item_text` | no | — | |
| media_type | select | yes | — | `image` \| `video` \| `table` |
| media_image | image | yes | media_type = image | lazy loaded |
| media_video | file (mp4) | yes | media_type = video | muted loop |
| media_video_poster | image | yes | media_type = video | |
| table_name | text | no | media_type = table | label on the tab above the table |
| table_orientation | select | no | media_type = table | `vertical` \| `horizontal` |
| table_show_headers | true/false | no | media_type = table | |
| table_columns | repeater -> `column_label` | no | orientation = horizontal | |
| table_rows | repeater -> `cells` (repeater -> `cell_value`) | no | orientation = horizontal | |
| table_vertical_rows | repeater -> `row_label`, `row_value`, `row_value_note` | no | orientation = vertical | |
| copy_blocks | repeater -> `block_label` (text, opt), `block_text` (textarea) | yes | — | |
| list_items | repeater -> `item_text` (text) | no | — | |
| media_side | select | yes | — | `left` \| `right` |
| variant | select | yes | — | `default` \| `before_after` |
| media_before | image | yes | variant = before_after | |
| media_after | image | yes | variant = before_after | |
| label_before | text | no | variant = before_after | |
| label_after | text | no | variant = before_after | |

The section advertises `data-media` with what its media half is actually showing
(`image`, `video`, `table`, or `before_after`, which wins over `media_type`).
A video section following another video section takes extra top spacing from
that attribute alone: two moving sections stacked read as one restless block,
and a still image already provides the edge that a video does not. No section
inspects its neighbours to do this. CSS does.

> **No `intro` here.** It duplicated an unlabelled `copy_block`, with no rule
> saying which to reach for. `copy_blocks` is the body: leave the label empty
> for prose, fill it for the mono-labelled pairs the MOBILE section uses
> ("Problem" / "My solution"). It is optional, because a section is sometimes
> just a heading and a list.

## `TabbedMediaCopy` — PARKED

Not approved, not built, and not currently being pursued. No fragment, no ACF
JSON, no component. Kept here rather than discarded because the shape and the
three open questions below are the expensive part, and they are worth having
already written down whenever this comes back.

Picking it up again means: settle the three questions, approve, then fragment ->
ACF JSON -> component, and correct the layout counts in the preamble and in
section 3 in the same pass.

Fragment `lib/fragments/caseSections.ts` -> `TabbedMediaCopyFields` · key prefix `field_tabbed_media_copy_`
Layout `tabbed_media_copy` · GraphQL `PageSectionsSectionsTabbedMediaCopyLayout`

MediaCopy with the copy half turned into a switch. Each entry is a headline, its
copy, and the media that belongs to it. The headlines all stay visible; opening
one reveals its copy and swaps the media beside it.

| field | type | req | conditional | notes |
|---|---|---|---|---|
| kicker | text | no | — | mono caps |
| heading | textarea | no | — | line breaks are honoured |
| intro | textarea | no | — | lead line above the stack. Line breaks are honoured |
| media_side | select | yes | — | `left` \| `right`, default `left`. Flippable, as MediaCopy is, so alternating sections can zigzag |
| entries | repeater, min 2 | yes | — | subfields below |

### `entries` subfields

| field | type | req | conditional | notes |
|---|---|---|---|---|
| item_heading | text | yes | — | the tab itself. This is what gets clicked |
| item_text | textarea | yes | — | the copy revealed when this entry is open. Line breaks are honoured |
| media | image \| file (mp4) | yes | — | shown while this entry is open. Video renders muted and looped, through `AutoplayVideo` |

**Minimum 2 entries**, enforced in ACF. A switch with one position is not a
switch, and the design has no state to show for it.

**The first entry is open on load.** No `default_open` field: a second way to say
which one leads is a second thing to get wrong, and the answer is always the one
the editor dragged to the top.

### Three things to settle before this is approved

1. **The accordion doctrine.** A vertical stack of headlines where the active one
   expands is an accordion wearing a different name. The design docket reserves
   `Accordion` for Palette Town's commerce checklist as "the site's only
   accordion, per doctrine". Either this component becomes that pattern and
   Palette Town composes from it (one behaviour, one implementation), or the
   doctrine narrows to mean "only one accordion that is purely a checklist". My
   recommendation is the first: this is the more useful of the two, and a
   checklist is this component with the media left empty.

2. **Which ARIA pattern.** Exactly one entry is open at all times and opening one
   closes another, which is tabs, not disclosure. Proposed: the tabs pattern at
   `aria-orientation="vertical"`, roving tabindex, arrow keys to move between
   headlines, with each headline owning the copy that follows it. The media frame
   is the other half of the open panel and is labelled by the open headline. The
   alternative, independent disclosures, would let a reader open two headlines
   whose media cannot both be shown.

3. **Poster frames.** `MediaCopy` gives video an authored poster; `CalloutList`
   and `LargeList` do not, and lean on `preload="metadata"` for a first frame.
   Under reduced motion the poster is the entire static fallback, and here the
   media is the payload rather than decoration, so this is the component most
   likely to want one. Left off the table above to match the nearer precedent.
   Say the word and it becomes a fourth subfield.

### Motion

No animation brief exists for this component, so per ANIMATION DISCIPLINE it gets
built static: the swap is instant, with a clean mount point for a transition. If
you want the media to cross-fade or the copy to open on a height tween, that is a
brief, and it can arrive after the component is standing.

## `FullWidthMedia`
Fragment `lib/fragments/caseSections.ts` -> `FullWidthMediaFields` · key prefix `field_full_width_media_`
Layout `full_width_media` · GraphQL `PageSectionsSectionsFullWidthMediaLayout`

| field | type | req | conditional | notes |
|---|---|---|---|---|
| media | image \| file (mp4) | yes | — | |
| caption | text | no | — | |
| width | select | yes | — | `wide` \| `full` |
| frame | true/false | yes | — | browser chrome around the media |
| zoom_lens | true/false | yes | — | hover magnifier. Off on touch and on reduced motion |

## `CalloutList`
Fragment `lib/fragments/caseSections.ts` -> `CalloutListFields` · key prefix `field_callout_list_`
Layout `callout_list` · GraphQL `PageSectionsSectionsCalloutListLayout`

| field | type | req | conditional | notes |
|---|---|---|---|---|
| kicker | text | no | — | mono caps |
| heading | textarea | no | — | line breaks are honoured |
| intro | textarea | no | — | lead line above the body. Line breaks are honoured |
| columns | select | yes | — | `2` \| `3` \| `4` |
| cards | repeater -> `card_title`, `card_media` (opt), `card_body` | yes | — | equal media heights per row |

`card_media` takes an image or an mp4, the same shape as `card_media` on the
post types and `thumb` on a BuildTable row. There is no icon field: the design
never uses one, and an unused field is one more thing to explain later.

## `LargeList`
Fragment `lib/fragments/caseSections.ts` -> `LargeListFields` · key prefix `field_large_list_`
Layout `large_list` · GraphQL `PageSectionsSectionsLargeListLayout`

| field | type | req | conditional | notes |
|---|---|---|---|---|
| kicker | text | no | — | mono caps |
| heading | textarea | no | — | line breaks are honoured |
| intro | textarea | no | — | lead line above the body. Line breaks are honoured |
| media | image \| file (mp4) | no | — | optional. Always sits left, never right |
| items | repeater -> `item_title` (opt), `item_text`, `item_media` (opt) | yes | — | oversized zero-padded numerals (01.), full-width bordered rows |

> **On `item_media`.** The artifact belonging to one step, sitting under that
> step's copy rather than beside the list. This is what the design docket calls
> `ProcessSteps` -- "numbered methodology with inline artifacts" -- and it is a
> field on LargeList rather than a fourteenth layout because the two differ by
> exactly this one thing. A separate component would have duplicated the
> numerals, the bordered rows and the header trio to gain a per-row image.
>
> The section's own `media` is unrelated and still means what it meant: one
> image beside the whole list, which moves the list to columns 5 to 8. A
> LargeList can carry both, though nothing does yet.

`media` changes the layout rather than decorating it. Absent, the list runs the
full 8 content columns, which is the original design and stays the default.
Present, the media takes columns 1 to 4 and the numbered list moves to 5 to 8.

There is no `media_side`. MediaCopy owns the flippable arrangement; here the
numerals are the left edge of a spec register when they are alone, and the media
becomes that edge when it is there. A right-hand option would mean two different
left edges for the same component.

### APPROVED — panel and pinning

Three requests, and they are three different KINDS of thing. Splitting them out
because the first is ready to build, the second needs an animation brief, and
the third runs into the colour law.

| field | type | req | conditional | notes |
|---|---|---|---|---|
| in_panel | true/false | yes | — | render inside the tab + bordered panel shell. `kicker` becomes the tab's label |
| pinned | true/false | yes | — | the copy holds still while the list scrolls past it |

No new keys beyond these. Everything else -- `kicker`, `heading`, `intro`,
`media`, `items` -- is what the component already authors.

#### 1 · `in_panel` — ready to build

Renders the section inside `components/UI/Tab` on the bordered panel, the same
shell BuildTable, Timeline and WorkCardGrid use. `kicker` becomes the tab's
label and stops rendering above the heading, which is the locked decision in
`_content-source/page-component-map.md`: *a tabbed section names itself through
its tab, not through a nested SectionHeader*.

`kicker` is optional today and stays optional -- but with `in_panel` on and no
kicker there is no label, so the tab would be an empty stub. Proposed: ACF makes
`kicker` required when `in_panel` is true, so the editor is told rather than
finding out on the front end.

> **The count chip is derived, not authored.** BuildTable and Timeline author a
> `count_display` because theirs is editorial -- "30+" is not 31, and "14 years"
> is not a row count. A LargeList's chip could only ever be the number of items,
> which the component already knows. Authoring it would be offering an editor a
> field whose only correct value is one it can compute. Say if you want it off
> entirely rather than derived.

#### 2 · `pinned` — needs an animation brief

The layout is unambiguous and I can build it today: copy on columns 1-2, list on
columns 4-8, column 3 left as the gutter between them. That is a real change of
proportion from the current 6-column header over an 8-column list, and it is
what makes the copy read as a caption to the list rather than a heading over it.

**Settled: the copy is sticky, and the list marks its place.** As each item
crosses the reading line its TITLE is set in `$color-text-select` and the
previous one returns to white, so the yellow moves down the list as you scroll
and the pinned copy beside it holds still.

`position: sticky` for the copy -- not a ScrollTrigger pin. The section stays in
normal flow, there is no pin-spacer to maintain, and it survives a resize with
no refresh. The highlight is a scroll-spy, not a tween: nothing is animated on
scroll, an item is simply current or it is not.

That is why the spy is NOT gated behind reduced motion, and this is the same
call SidebarNav's scroll-spy already makes: telling a reader where they are is
an indicator, and switching it off leaves them with less information rather than
less motion. Only the colour TRANSITION sits inside `motion-safe`, so a reduced
motion reader gets the same highlight arriving instantly.

The spy uses a midpoint test rather than IntersectionObserver, for the reason
SidebarNav states at length: `intersectionRatio` is measured against the
element's own height, so a tall row scores a fraction where a short one scores
1, and the long items could never win.

> **`pinned` and `media` both restructure the layout, and they disagree.**
> `media` already moves the list to columns 5-8 and takes 1-4 for itself.
> `pinned` wants 4-8 for the list and 1-2 for the copy. Both set at once is two
> rules for the same columns. Proposed: ACF hides `media` when `pinned` is on,
> so the conflict cannot be authored rather than being resolved silently at
> render. `item_media` is unaffected -- it sits inside a row and has no quarrel
> with either.

#### 3 · `background` — dropped

Not being built. The colour law stands as written, and nothing here needs an
exemption from it. Left recorded rather than deleted because the reasoning is
the expensive part if it comes back: the choice was a select over existing
surface tokens (`canvas` / `raised` / `raised-strong`) versus a free colour
field, and the open question underneath it was whether the change is static per
section or scrolled per item.

> **`kicker` cannot be conditionally required.** ACF's `required` is a static
> property, so it cannot be switched on by `in_panel`. Stated in the field's
> instructions instead, and the component renders the panel without a tab
> rather than an empty one when the kicker is missing.

## `SplitStatement`
Fragment `lib/fragments/splitStatement.ts` -> `SplitStatementFields` · key prefix `field_split_statement_`
Layout `split_statement` · GraphQL `PageSectionsSectionsSplitStatementLayout`

Supersedes both `ThesisLine` (handoff) and `PullQuote` (the current Figma label).

| field | type | req | conditional | notes |
|---|---|---|---|---|
| quote | textarea | yes | — | the full statement, both halves |
| highlight_phrases | repeater -> `phrase` (text) | no | — | substrings promoted to yellow mono highlight boxes |
| variant | select | yes | — | `scroll` \| `static` |

Approved animation (scroll, Home only): halves translate in from opposite sides
on scrub, lock stacked centre, brief pin. `static` has no motion, and is what
reduced-motion falls back to.

The component no longer inserts a comma between the halves. It used to append
one to the first line automatically, which read correctly only when the break
fell at a clause boundary -- on "Claude eliminated the gap between, / deciding
and shipping features" it landed after a preposition. Punctuation belongs in the
authored `quote` now, so the line break can fall wherever the sentence wants it.

## `NextCase`
Fragment `lib/fragments/caseSections.ts` -> `NextCaseFields` · key prefix `field_next_case_`
Layout `next_case` · GraphQL `PageSectionsSectionsNextCaseLayout`

| field | type | req | conditional | notes |
|---|---|---|---|---|
| next_ref | post object -> `case_study` | yes | — | kicker auto-composes "NEXT CASE STUDY · {name}" |
| title | text | no | — | overrides the referenced entry's title |
| link_label | text | yes | — | |
| media | image | no | — | falls back to the referenced entry's `card_media` |

Authored per page, so it gets its own nav node. Tab-labelled block, wholly clickable.

---

# 4 · Home-only sections

Authored on the Home page, not inside a case study.

## `WorkCardGrid`
Fragment `lib/fragments/workCardGrid.ts` -> `WorkCardGridFields` · key prefix `field_work_card_grid_`
Layout `work_card_grid` · GraphQL `PageSectionsSectionsWorkCardGridLayout`

| field | type | req | conditional | notes |
|---|---|---|---|---|
| tabs | repeater -> `tab_label`, `source` (select `case_study` \| `project`), `count_display` | yes | — | three fields at 33% each, one line per tab. Figma shows 2 tabs: "Selected work" (5) and "Projects" (2) |

Cards come from the chosen post type, filtered on `featured_on_home`, ordered by
`sort_order`. Figma renders 2 large cards (650px) then 3 small (420px).
Nav: circle plus a stateful `Card` diamond whose chip ticks 5 to 2 with the tab.

Approved animation, on entering the viewport **and after the hero has finished**:

On Home the hero's timeline runs on mount while this one runs on scroll, and on
a tall screen that is the same moment -- so the two entrances played over each
other. The grid now waits, through `lib/heroTiming.ts`: the hero says when it
is done and this section asks, so neither has to know the other's timings. The
gate resolves immediately wherever no hero is animating, which is every page but
Home, and reduced motion everywhere.


1. The section rises 24px and fades in -- tabs and panel together, so the chrome
   arrives as one object rather than assembling itself in pieces.
2. Its cards fade in on a 0.07s stagger, overlapping the tail of the rise so the
   two read as one movement.

The rise plays `once`, on the way down only: it is an arrival, not a scrubbed
relationship like SplitStatement's, and nothing here should track the scroll
position after it has happened.

**Switching tabs re-staggers the cards, and only the cards.** The section is
already in place by then, and lifting it again would move the page under a
reader who did nothing but press a tab.

Only the OPEN tab's cards are ever touched. The other panel's sit behind a
`hidden` attribute, and animating elements with no layout would leave them
faded when that tab is opened later -- invisible for a reason nothing on screen
explains.

Timings live together at the top of the component rather than inline, because
they are tuned against each other: the stagger reads as a run only while it
stays shorter than the fade it is staggering. Currently 0.6s rise, 0.6s card
fade, 0.12s between cards.

## `BuildTable`
Fragment `lib/fragments/buildTable.ts` -> `BuildTableFields` · key prefix `field_build_table_`
Layout `build_table` · GraphQL `PageSectionsSectionsBuildTableLayout`

| field | type | req | conditional | notes |
|---|---|---|---|---|
| label | text | yes | — | tab title, "FEATURED SITES I'VE BUILT" |
| count_display | text | no | — | "30+" |
| caption | textarea | no | — | the line under the table |
| rows | repeater | yes | — | 31 rows. Subfields below |

### `rows` subfields

| field | type | req | conditional | notes |
|---|---|---|---|---|
| year | text | yes | — | text not number, so "2022-2024" is valid |
| site | text | yes | — | SITE column |
| role | select, multiple | yes | — | `design` \| `build` \| `ops`. Rendered joined with " + " |
| stack | select, multiple | no | — | 10 choices. Rendered joined with " · ". Empty on design-only rows |
| notes | text | no | — | NOTES column |
| link_label | text | no | — | "View site" or "Case study" |
| link | url | no | — | LINK target. Internal links are fine, e.g. `/case-studies/ascaya` |
| is_collaboration | true/false | yes | — | shows the star next to the site name |
| collaborator | taxonomy -> `collaborator` (single) | yes | is_collaboration = true | supplies the star colour and the legend entry. Sits on the same line as the checkbox |
| thumb | image \| file (mp4) | no | — | hover thumbnail peek. Component branches on mime type, same as `card_media` |

Sorted year descending, then by the order rows appear in the repeater.
Columns YEAR · SITE (+marker) · ROLE · STACK · NOTES · LINK, rendered through
Table (horizontal, headers on).

The legend under the table is **derived**, not authored: it is the set of
`collaborator` terms actually used by rows, so it can never list an agency that
appears nowhere, or omit one that does. Glyph colours are identical between rows
and legend because both read the same term.

Nav: circle plus a `TableRow` diamond.

Seed content: `_content-source/build-table.md`, 31 rows, copy exact. Supplied,
and the table is marked locked in that file.

> Dropped from the handoff's spec: `sort_order` (repeater drag order is the
> order, and a second number can visibly disagree with the editor), `row_type`
> and `recognizable` (nothing in the Figma frame renders either), and the
> `cms` / `framework` / `motion` split (one `stack` text field instead).

## `Timeline`
Fragment `lib/fragments/timeline.ts` -> `TimelineFields` · key prefix `field_timeline_`
Layout `timeline` · GraphQL `PageSectionsSectionsTimelineLayout`

| field | type | req | conditional | notes |
|---|---|---|---|---|
| label | text | yes | — | tab title. Same field and job as BuildTable's |
| count_display | text | no | — | the chip on the tab, e.g. "14 years" |
| entries | repeater | yes | — | in the order they should read, oldest first. Subfields below |

### `entries` subfields

| field | type | req | conditional | notes |
|---|---|---|---|---|
| entry_date | text | yes | — | text not a date picker, so "2013-2015" is valid. Set in `numeral` |
| entry_company | text | yes | — | |
| entry_body | textarea | no | — | one paragraph per authored line, through Prose |
| entry_media | image \| file (mp4) | no | — | genuinely optional: the 2012 entry in Figma has none |

> **Why `entries` and not `items`.** WPGraphQL-ACF names a repeater's row type
> after the field alone, not the layout it sits in, so every repeater called
> `items` anywhere in this group resolves to one shared
> `PageSectionsSectionsItems`. LargeList already has an `items` repeater with
> `item_title` / `item_text`, and it wins: a Timeline named `items` silently
> came back carrying LargeList's fields.
>
> That sharing is deliberate elsewhere and worth keeping -- `table_columns`,
> `table_rows`, `cells`, `table_vertical_rows` and `paragraphs` are each
> declared in two layouts with **identical** subfields, so one row type across
> both is correct. The rule is the one this entry follows: repeaters may share
> a name only when they share a shape. Different subfields need a different
> name.

`label` + `count_display` rather than the kicker/heading/intro trio, per the
locked decision in `_content-source/page-component-map.md`: a tabbed section
names itself through its tab, not through a nested SectionHeader.

Entries alternate either side of a 1px centre line: odd items left and aligned
right, even items right and aligned left. Which side an entry falls on is
**derived from its position**, never authored -- an editor reordering the
repeater re-alternates the whole run, and there is no way to end up with two
entries on the same side.

Sides come from position rather than a field for the same reason LargeList
numbers by position: a second source of truth for something the order already
says is a way for the two to disagree.

Renders inside the bordered panel with a tab, the same shell as BuildTable and
WorkCardGrid, through the shared `components/UI/Tab`.

Nav: circle, no diamond. Its items are repeater rows rather than a CPT, the
same as CalloutList's cards.

## `QuestionCTA`
Fragment `lib/fragments/questionCta.ts` -> `QuestionCtaFields` · key prefix `field_question_cta_`
Layout `question_cta` · GraphQL `PageSectionsSectionsQuestionCtaLayout`

| field | type | req | conditional | notes |
|---|---|---|---|---|
| notes | repeater (min 1, max 3) -> `question`, `link_label`, `link_url` | yes | — | blue stickies, tape, opposing rotations with the middle straightest |

Whole sticky is clickable. Hover lifts and peels a corner. A small
"Kelly Warpechowski" attribution label sits on each.

---

# 5 · Global chrome

No nav-tree nodes, no flexible-content layouts. Options pages, so they are
edited once and appear everywhere.

## `SiteFooter`
ACF options page · `acf-json/group_site_footer.json` · key prefix `field_site_footer_`
GraphQL: `siteFooter` on the options type

| field | type | req | conditional | notes |
|---|---|---|---|---|
| tab_label | text | yes | — | "HIRE ME" |
| availability_line | text | yes | — | "Currently open to design engineering roles." |
| links | repeater -> `link_label`, `link_url` | yes | — | Figma: `kellyruthw@gmail.com` (mailto), LinkedIn, Resume |

Identical on every page.

Approved animation: the block rises into place on scroll, **scrubbed**, over a
range equal to its own height -- from its top entering the viewport to its
bottom meeting the viewport's, which is the document's end. So it lands exactly
as the page runs out, and scrolling back up sends it down again rather than
leaving it finished.

The tab and body move together inside a wrapper the footer clips. That clip is
load-bearing: a transformed element still contributes to the document's
scrollable area, so holding the block a full height below its place without it
would add a screen of empty page to scroll through before anything moved.

## `SidebarNav`
No ACF fields. The tree is derived: pages are static, component circles come
from each page's `sections` array in order, diamonds come from CPT-fed
subcomponents. Count chips render only when a count is greater than 1.

---

# 6 · Decided

- **Home** is a normal WordPress `page` using the same `sections` flexible
  content as case studies and projects. One renderer, one field group.
  `/about` and `/process` were built on that shape and did not need a line of
  page-specific layout. `/colophon` is deferred, and its nav link is hidden
  until it exists -- see Phase 4 in `_content-source/design-docket.md`.
- **BuildTable data** lives in a repeater on Home, not a `build` post type. The
  cost accepted: no list view, search or bulk edit across the 31 rows, and ACF
  repeaters get sluggish at that length.
- **Collaborations** are a `collaborator` taxonomy, authored once, with the
  legend derived from the terms used.
- **`case_study.related_build`** is dropped. With no `build` post to point at,
  the relationship runs one way: a BuildTable row links to a case study via its
  `link` field.
- **Home hero headline** is `headline_lead` + `headline_tail` +
  `headline_highlight`, with the wipe animation described above.
- **Footer email** is `kellyruthw@gmail.com`.
- **Sidebar wordmark** ships as an inline SVG of outlined Salmond, exported from
  Figma. No third webfont, no licensing question. Needs an `aria-label` since it
  stops being live text.

# 7 · Waiting on Kelly

Everything this section originally listed is done: the manifest is approved,
`_content-source/` is fully populated, the wordmark ships as
`public/logo-kelly-warpechowski.svg`, the old `work` post type is deleted, and
the motion currently in the codebase is all briefed. That last one is worth
spelling out, because ANIMATION DISCIPLINE only ever named three sequences.

**Motion as built.** This paragraph used to say there were three approved
sequences and that everything else moving was a hover state. That stopped being
true, and is corrected here rather than left to mislead.

The original three remain: PageHero home, the SplitStatement scroll moment, and
the SidebarNav selection system. Since then Kelly has briefed, component by
component, the shared entrance now written up under **Entrances** in section 3 --
seven components that fade and rise into place -- plus three that stand alone:
`IntroCopy`'s scrubbed word reveal, `SiteFooter`'s scrubbed rise, and the
`background_media` hero's growing backdrop. `Timeline`'s branches grow on scroll
on mobile.

The hover states this manifest specifies are unchanged: the BuildTable `thumb`
peek, the WorkCardGrid card raise, the QuestionCTA lift and corner peel, the
NextCase and Tab states.

Nothing has been invented -- every item above traces to a request. ANIMATION
DISCIPLINE is unchanged by any of it: a component that wants motion not on this
list still needs a brief first, and `FullWidthMedia` and `TabbedMediaCopy` stay
static precisely because none exists.

**One item left, and it is a WordPress chore rather than a decision:** export
the `project` post type from wp-admin so its JSON joins the repo. It predates
the sync path, so it is the one registration not under version control. ACF ->
Post Types -> Project -> Update.
