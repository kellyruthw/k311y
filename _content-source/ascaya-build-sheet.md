# Ascaya — case study template build sheet
*Component by component, top to bottom. Kickers use the deck grammar (mono, all caps). All copy de-dashed. This is the CMS-entry document; the prose file syncs to match once approved.*

---

## 1 · PageHero (case variant) + MetaBlock
**Title:** Ascaya
**Subtitle:** Content architecture for Las Vegas's premier luxury community
**Media:** full-bleed site capture (the hero video loop you have)
**MetaBlock fields:**
- Section label: Case study · Headless WordPress
- Client: Ascaya, via Wicked+ (agency partner of 8+ years)
- Role: Design engineer: field architecture, headless build, motion, content implementation, CRM integration
- Stack: WordPress (ACF) · Next.js · Vercel · GSAP · Gravity Forms API
- Timeline: 6 weeks of build, QA, content, and launch (spring 2026)
- Live: ascaya.com

*Design note: this hero sets the register for all five case pages. Decide here: does the tree rail load expanded to this page's 7 components?*

---

## 2 · TextSection
**Kicker:** OVERVIEW
**Paragraphs:**
1. Ascaya is a guard-gated luxury residential community in Henderson, Nevada. Desert-modern homes and homesites overlook the Las Vegas valley, with listings that reach into the tens of millions. When Wicked+ won the redesign bid, I owned the technical side end-to-end: translating a Figma desktop design into a component system, architecting the CMS, building the headless frontend, implementing the content, and wiring the forms into the client's CRM.
2. One designer, one project manager, and me. I lead the kickoff with the designer where we walk through each page and I confirm interaction expectations, catch inconsistencies while they're still cheap to fix, and define the systems that the build requires. Questions happen async in Slack, with occasional one-off calls to answer complicated functionality. I had 6 weeks to turn 20 designed pages into a live site that a content team could run without me.

---

## 3 · MediaCopy (media right, list enabled)
**Kicker:** READING THE DESIGN
**Heading:** Which sections are actually the same component?
**Paragraphs:**
1. Before any code, the real work is deciphering the Figma: which sections across the 20 designed pages are actually the same component wearing different content, and which only look similar. Abstract too little and the CMS becomes a junk drawer of one-off blocks. Abstract too much and every component sprouts a dozen conditional fields nobody understands.
2. My process is visual and happens before anything is priced:
**List:**
- Annotate the full design, mapping every section to a named component with its ACF fields defined on the spot
- Classify each component by build cost, low (1 to 2 hrs) vs. high (4 to 8 hrs), so the agency can see where the budget lives and make scope tradeoffs before the build starts
- Draw a component tree for every page, from page to flexible component to sub-component
**Media:** annotated Figma artifact (the sticky-note field mapping board)

---

## 4 · ArtifactMedia (wide)
**Media:** per-page component trees + cost classification board
**Caption:** The whole build visible on one board: what exists, what repeats, what it costs, and what fields power it.

---

## 5 · TextSection (no kicker, continuation)
**Paragraphs:**
1. Ascaya landed at 25 flexible components for the main site, plus a blog-specific set and header, footer, and modal systems. The site shipped with 31 pages, but only 20 were ever designed. The other 11 I composed directly from the component system: some from rough scratchpad wireframes the CEO handed me mid-project, others (policy pages and the like) from existing templates. No new design, no new components, no change orders.
2. A system is right when new pages can be built from it by arrangement alone.

---

## 6 · TextSection + CalloutList (cards ×3, with images)
**Kicker:** CONTENT MODELING
**Heading:** 4 post types, built around the content team
**Setup paragraphs:**
1. Real estate sites live or die by their listings model. Ascaya has 4 distinct inventory types (112 homesites, 6 Desert Design Study homes, 6 Canyon Residences, 11 amenities) plus 127 blog posts, 22 press items, and a FAQ system, each with different display needs: tables, grids, floor plan viewers, an interactive homesite map.
2. The tempting shortcut is one catch-all post type. I split each listing type into its own custom post type instead, for 3 reasons.

**Column 1**
- Subhead: Easy to find, easy to edit
- Copy: Each listing type gets its own tab in the WordPress sidebar. Editors never sift through 112 homesites to bulk-edit a residence, and no template carries fields that don't belong to it.
- Image: WP admin sidebar showing the CPT tabs (redacted)

**Column 2**
- Subhead: URLs that build themselves
- Copy: Post types slot into the site's URL structure natively. The link GraphQL returns already matches the frontend, so nothing is hardcoded before the slug. Less static copy in code, more freedom to restructure later.
- Image: URL anatomy diagram (/homesites/cloud-rock-101 with the CPT segment highlighted)

**Column 3**
- Subhead: Parsed apart, kept together
- Copy: Splitting the types makes the CMS easier to parse, while the query still holds everything under one listings component. Conditional fields show only what applies: area for empty homesites, square footage for built residences. Editors see their template. The code keeps one component.
- Image: the conditional fields side by side (homesite editor vs. residence editor)

**Closing line (small text below columns):** For every templated post type I enter a complete example myself so the team has a reference to duplicate; every non-templated page I implement personally.

*Skim test: kicker + heading + 3 subheads = "Content modeling: 4 post types built around the content team. Easy to find and edit. URLs build themselves. Parsed apart, kept together." The whole argument survives a skim.*

---

## 7 · ThesisLine (interior variant: static, quiet)
**Quote:** I optimize for the person in the CMS 6 months from now.

*System note: every case study gets its own thesis line; the homepage keeps "The content model is a user interface, and the editor is the user" exclusively. Assignments: Palette Town → the tradeoff or AI principle · Harland → the restraint line · TerraTrue → the structure lesson · Samesurf → clarity early. One belief per project.*

---

## 8 · MediaCopy (before-after variant)
**Kicker:** MOBILE
**Heading:** Desktop gets designed. Mobile gets decided.
**Paragraphs:**
1. Like most agency projects, the Figma was desktop-only. Filling that gap is part of my role, not a change order.
2. Example: the residence listing tables. Multi-column tables are hostile on a phone. Horizontal scroll is invisible and columns collapse into soup. My call: below the breakpoint, the table transforms into a full-width card grid, each listing stacking its data vertically with the plan link promoted to a visible action. I make calls like this throughout every build and flag the notable ones back to the designer with suggestions.
**Media:** before-after: desktop listing table / mobile card grid
*(Meta note: this site's own BuildTable does the same transform. If annotation mode ever points that out, chef's kiss.)*

---

## 9 · TextSection + CalloutList (cards ×3, with images)
**Kicker:** MOTION + PERFORMANCE
**Heading:** Finishing touches take a site from fine to intentional
**Setup paragraph:**
1. Ascaya's motion is intentionally restrained to match the brand, so most of the work in this phase went into performance and production details.

**Column 1**
- Subhead: Motion that stays composed
- Copy: Motion is deliberately restrained: a global hero and header entrance built with GSAP, and slide-out panels for the listing filters. Nothing competes with the homes.
- Image: hero entrance capture (short loop)

**Column 2**
- Subhead: An interactive map without the lag
- Copy: The homesite map plots 112 lots with live availability. When a late addition to the map introduced performance issues, I had Claude Code review the code and apply fixes, which resolved every error before launch.
- Image: homesite map with availability states

**Column 3**
- Subhead: Production-ready by default
- Copy: Every build ships with the unglamorous layer that makes marketing sites work: structured data and SEO schema per template, accessibility as a requirement, cookie consent, marketing scripts, and Gravity Forms wired via API into the client's CRM.
- Image: schema rich-results test or the structured data snippet

*Skim test: kicker + heading + 3 subheads = "Motion and performance: finishing touches take it from fine to intentional. Composed motion. No-lag map. Production-ready." Survives.*

---

## 10 · MediaCopy (media left)
**Kicker:** AI WORKFLOW
**Heading:** Putting AI where the tedium lives
**Paragraphs:**
1. Ascaya was my first build using Claude Code as a schema partner, and it changed my throughput. The workflow: once I'd decided a component's fields during design annotation, I'd screenshot the section to Claude, workshop the component name, specify the fields, and have it generate both the ACF JSON blob for upload and the matching GraphQL schema entry.
2. Hand-writing ACF JSON and keeping it in sync with GraphQL was always the most tedious part of my job, and the most error-prone. A missed conditional or a mismatched field key surfaces as a mystery bug days later. Delegating the transcription, while keeping every architectural decision mine, meant fewer missed edge cases and a meaningful share of the 36 hours I came in under estimate.
3. The principle: AI doesn't decide my content model. It eliminates the gap between deciding and shipping it.
**Media:** the screenshot-to-schema loop (component screenshot → named fields → ACF JSON + GraphQL output)

---

## 11 · StatTable
**Kicker:** DELIVERY
**Rows:**
- Flexible components → 25 (+ blog set, header/footer/modals)
- Pages → 31 (20 designed, 11 composed from the system)
- Custom post types → Homesites (112) · Design Study homes (6) · Canyon Residences (6) · Amenities (11)
- Editorial content → 127 blog posts · 22 press items · 10 FAQs
- Estimate → actual → 136 hrs → 100 hrs tracked
- Post-launch audit → 100 accessibility · 100 SEO (Lighthouse)

*Design note: inherits BuildTable's spec-sheet styling; near-free.*

---

## 12 · TextSection
**Kicker:** IMPACT
**Heading:** Shipped on schedule, and the agency came back
**Paragraphs:**
1. The first internal reveal is always the moment. The Wicked+ CEO saw the build and couldn't wait to put it in front of the client and launch. The site shipped on schedule that spring, the content team took over day-to-day updates with a model built for their confidence, and the audit numbers held: 100 accessibility, 100 SEO.
2. The quieter impact is the eight-year pattern this project continues: an agency that hands me a Figma and a deadline, trusts the architecture sight-unseen until first review, and comes back for the next one.

---

## 13 · TextSection
**Kicker:** REFLECTION
**Heading:** Good abstraction is a judgment call
**Paragraphs:**
1. The component abstraction question ("are these two sections the same component?") never has a formula. Every answer trades editor flexibility against system complexity, and the right answer depends on who maintains the site after you leave. That costs me hours during the build and saves everyone else hours forever.

---

## 14 · NextCase
**Next:** Palette Town → My own commerce stack, admin panel and all

---

## Case-page tree (8 component types)
PageHero · TextSection · MediaCopy · ArtifactMedia · CalloutList · ThesisLine · StatTable · NextCase
*Decision to ratify: no freestanding SectionHeader on case pages; kickers + headings live on TextSection/MediaCopy. Drops the rail to 7 shapes for a 14-slot page (rail groups repeats: TextSection ×6 shows once with a count chip? Or lists each instance? Decide in Figma.)*

---

## As-built sync (from final Figma, supersedes slots above where they differ)
- Slot 3 kicker/heading: DEFINING A SYSTEM / "The first problem: reading the design" (kicker changed instead of heading; dup resolved)
- Slot 6 heading: "6 additional post types, built around the content team" (counts all CPTs, not just the 4 inventory types)
- ACF editor screenshot added as artifact after the columns; the "complete example" line became its caption
- Slot 10 heading: "Reducing tedious implementation with AI"; artifact is the screenshot-to-schema flow diagram (suggest adding a real ACF JSON corner for texture)
- Slot 13 reflection restructured as CalloutList (numbered ×3), items 2 and 3 are forward-looking AI experiments (Figma components/variables reducing build time; feeding all artboards to Claude to auto-derive the component system)
- NextCase gains `link_label` field ("Learn about my side hustle")
- MediaCopy gains `copy_blocks` repeater (mono label + text; e.g., Problem example / My solution)
- ArtifactMedia gains `zoom_lens` toggle (magnifier, used on the component tree)
- Sidebar for case pages: current page square ("Ascaya") expands to type-grouped tree with count chips (8 types, hover lights all instances); MetaBlock renders as CPT-fed diamond under PageHero
- Rail rules (final): Work > Ascaya nested squares (breadcrumb effect) · chips only when count > 1 · hover a type lights all instances · scroll-spy soft-lights the current section · global chrome gets no node (HIRE ME footer) but per-page-authored components do (NextCase, with its link_label, gets a circle) · rule of thumb: varies per page = authored, identical everywhere = chrome
- Reflection: `LargeList` (Kelly's design: oversized 01/02/03 numerals, bordered full-width rows), not wysiwyg and no longer CalloutList. Final Ascaya rail: PageHero (MetaBlock ◇) · IntroCopy · MediaCopy ·5 · TextSection · FullWidthMedia ·2 · CalloutList ·2 · ThesisLine · LargeList · NextCase. Kelly's original ·2 chip on CalloutList was correct.
- Open: stakes sentence at end of overview; orange emphasis color needs a rule or removal; map + production-column artifact upgrades

## Vocabulary consolidation (locked with Kelly, supersedes earlier component notes)
Final case-page vocabulary, 8 components:
- `PageHero` (case variant; MetaBlock renders as CPT-fed diamond under it)
- `IntroCopy` (the overview treatment, distinct from TextSection)
- `TextSection` (standalone prose only)
- `MediaCopy` — mediaType dropdown: image / video / table (kills CopyTable; table rows appear conditionally) · `copy_blocks` repeater (mono label + text) · optional header fields (kicker, heading, intro)
- `FullWidthMedia` (Kelly's final name; covers image + video, keeps zoom_lens toggle + caption)
- `CalloutList` — card columns only (2 to 4 up, optional image per card) · optional header fields (kicker, heading, intro)
- `LargeList` — full-width numbered rows (display numerals 01/02/03, bordered cells, spec-table register) · items repeater · optional header fields · replaces the numbered CalloutList style; separate component per the shapes-don't-match rule
- `ThesisLine`
- `NextCase` (with link_label)
Principle ratified: consolidate via variant dropdowns when shapes match; give components their own optional header fields instead of include-a-component booleans.
Other syncs: map copy reads "The map component plots 100+ lots with live availability"; stakes sentence added to overview; yellow rule = one color, one meaning, two weights (highlight box in display layer, colored text in body, used sparingly); production-ready artifact preference = Google Rich Results Test screenshot.
