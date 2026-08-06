# Ascaya — Content architecture for Las Vegas's premier luxury community

**Section label:** Case study · Headless WordPress
**Live site:** ascaya.com
**Client:** Ascaya, via Wicked+ (agency partner of 8+ years)
**Role:** Design engineer — field architecture, headless build, motion, content implementation, CRM integration
**Stack:** WordPress (ACF) · Next.js · Vercel staging · GSAP · Gravity Forms API
**Timeline:** 6 weeks of build, QA, content, and launch (spring 2026)

---

## Overview

Ascaya is a guard-gated luxury residential community in Henderson, Nevada — desert-modern homes and homesites overlooking the Las Vegas valley, with listings that reach into the tens of millions. When Wicked+ won the redesign bid, I owned the technical side end to end: translating a desktop Figma into a component system, architecting the CMS, building the headless front end, implementing the content, and wiring the forms into the client's CRM.

One designer, one project manager, and me. After eight years of working together, Wicked+ runs hands-off until first review — which means the architecture decisions are mine to make and mine to defend.

---

## The first problem is reading the design

Before any code, the real work is deciphering the Figma: which sections across the 20 designed pages are actually the *same component* wearing different content, and which only look similar. Abstract too little and the CMS becomes a junk drawer of one-off blocks. Abstract too much and every component sprouts a dozen conditional fields nobody understands.

My process is visual and happens before anything is priced:

- Annotate the full design, mapping every section to a named component with its ACF fields defined on the spot
- Classify each component by build cost — low (1–2 hrs) vs. high (4–8 hrs) — so the agency can see where the budget lives and make scope tradeoffs *before* the build starts
- Draw a component tree for every page, from page → flexible component → sub-component

Ascaya landed at 25 flexible components for the main site (plus a blog-specific set, and header/footer/modal systems). The site shipped with 31 pages — but only 20 were ever designed. The other 11 I composed directly from the component system: some from rough scratchpad wireframes the CEO handed me mid-project, others (policy pages and the like) from existing templates. No new design, no new components, no change orders. That's the test of the abstraction — a system is right when new pages can be built from it by arrangement alone.

**[Artifact: annotated Figma with ACF field mapping + cost classification]**
**[Artifact: per-page component trees]**

---

## Modeling inventory for the people who maintain it

Real estate sites live or die by their listings model. Ascaya has four distinct inventory types — 112 homesites, 6 Desert Design Study homes, 6 Canyon Residences, 11 amenities — plus 127 blog posts, 22 press items, and a FAQ system, each with different display needs (tables, grids, floor plan viewers, an interactive homesite map).

The tempting shortcut is one bloated post type with conditional fields. I went the other way: separate custom post types where the content genuinely differs, shared taxonomies where it doesn't. It's more work on my end, but the goal is that the content team never has to guess. Every choice in the CMS should feel obvious — clear labels, fields that only appear when they apply, structures that match how the client actually thinks about their inventory.

That's the principle underneath all my CMS work: **the content model is a user interface, and the editor is the user.**

For every templated post type, I enter one complete example myself so the team has a reference to duplicate — and for every non-templated page, I implement the content personally.

---

## The mobile design doesn't exist until I make it

Like most agency projects, the Figma was desktop-only. Filling that gap is part of my role, not a change order.

Example: the residence listing tables. Multi-column tables are hostile on a phone — horizontal scroll is invisible, columns collapse into soup. My call: below the breakpoint, the table transforms into a full-width card grid, each listing stacking its data vertically with the plan link promoted to a visible action. I make calls like this throughout every build and flag the notable ones back to the designer with suggestions — kickoff always includes a full Figma pass together to align styles and define interaction behavior ("what opens what") before I write a line of code.

---

## Motion, performance, and the map

Ascaya's motion is deliberately restrained for the brand: a global hero and header entrance, slide-out panels for listing filters. Luxury reads as composure, not spectacle.

The interactive homesite map — 112 lots with availability states — became the project's performance story. A late contribution to the map from outside my build didn't meet the performance bar, and I rebuilt it before launch. Owning the consequences of the architecture means owning them even when the code isn't originally mine.

Beyond motion, every build ships with the unglamorous layer that makes marketing sites actually work: structured data and SEO schema per template, accessibility as a requirement rather than an audit finding, cookie consent, marketing scripts, and Gravity Forms wired via API into the client's CRM so the data lands where sales lives.

---

## Putting AI where the tedium lives

Ascaya was my first build using Claude Code as a schema partner, and it changed my throughput. The workflow: once I'd decided a component's fields during design annotation, I'd screenshot the section to Claude, workshop the component name, specify the fields — and have it generate both the ACF JSON blob for upload and the matching GraphQL schema entry.

Hand-writing ACF JSON and keeping it in sync with GraphQL was always the most tedious part of my job, and the most error-prone — a missed conditional or a mismatched field key surfaces as a mystery bug days later. Delegating the transcription (while keeping every architectural decision — the fields, the names, the structure — mine) meant fewer missed edge cases and a meaningful share of the 36 hours I came in under estimate.

The principle: AI doesn't decide my content model. It eliminates the gap between deciding and shipping it.

---

## Scoping and delivery

Wicked+ brings me their larger builds for time estimates before they price them. For Ascaya I estimated **136 hours** — and delivered the tracked build in **100**, inside a 6-week window that included QA, content implementation, and launch.

| | |
|---|---|
| Flexible components | 25 (+ blog set, header/footer/modals) |
| Pages | 31 |
| Custom post types | Homesites (112) · Design Study homes (6) · Canyon Residences (6) · Amenities (11) |
| Editorial content | 127 blog posts · 22 press items · 10 FAQs |
| Estimate → actual | 136 hrs → 100 hrs tracked |
| Post-launch audit | 100 accessibility · 100 SEO (Lighthouse) |

---

## Impact

The first internal reveal is always the moment. the Wicked+ CEO saw the build and couldn't wait to put it in front of the client and launch. The site shipped on schedule that spring, the content team took over day-to-day updates with a model built for their confidence, and the audit numbers held: 100 accessibility, 100 SEO.

The quieter impact is the eight-year pattern this project continues: an agency that hands me a Figma and a deadline, trusts the architecture sight-unseen until first review, and comes back for the next one.

---

## Reflection

The component abstraction question — "are these two sections the same component?" — never has a formula. Every answer trades editor flexibility against system complexity, and the right answer depends on who maintains the site after you leave. I optimize for the person in the CMS six months from now. That costs me hours during the build and saves everyone else hours forever.
