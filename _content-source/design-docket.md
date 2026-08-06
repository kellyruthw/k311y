# Design docket — sequenced by component unlock
*Rule: design components, compose pages. Each phase lists what it unlocks; later pages should require zero new components, only arrangement.*

## Already designed (Home + system)
Nav tree system (states, chip, marquee selection) · PageHero (home one-off) · tabbed WorkCardGrid + Card · BuildTable + TableRow + markers/legend · ThesisLine (scroll moment) · QuestionCTA stickies · footer CTA + HIRE ME tab · dot-grid canvas, semantic color rules

## Phase 1 — Ascaya as the template case study (biggest unlock)
Designing this one page produces most of the remaining library:
- [ ] `PageHero` case variant + `MetaBlock` (incl. Related-build line, live link, stack chips)
- [ ] `TextSection` (kicker + heading + paragraphs)
- [ ] `MediaCopy` (media/copy split, flippable; before-after variant for the mobile-table story)
- [ ] `ArtifactMedia` (contained / wide / full-bleed; browser-frame option for site captures)
- [ ] `StatTable` (should inherit BuildTable's styling — near-free)
- [ ] `CalloutList` (cards ×3 with images, for the content-modeling columns; moved up from Phase 2 — TerraTrue's impact cards reuse this design)
- [ ] `NextCase` footer nav
- [ ] Case-page ThesisLine treatment (quieter than Home's scroll moment?)
- [ ] The sidebar tree for a 13-component page: rail grouping/scroll behavior

## Phase 2 — Three components, four pages fall
With Phase 1 done, the remaining case studies need only:
- [ ] `Carousel` (Samesurf exploration rounds)
- [ ] `CalloutList` bullets/numbered styles (card style done in Phase 1)
- [ ] `Accordion` (Palette Town's commerce checklist; the site's only accordion, per doctrine)
Then Harland, Palette Town, TerraTrue, Samesurf = composition passes, no new design.
Project pages (Ant Farm, Star Crossed, + CleverKeeping if added) = pure composition.

## Phase 3 — Prose pages
- [ ] `ProcessSteps` (numbered methodology with inline artifacts) — Process page's only new component
- [ ] Freestanding `SectionHeader` (non-tab context: About, Process)
- [ ] About photo treatment (MediaCopy variant) — otherwise About is free

## Phase 4 — Colophon inspect panel
*Deferred, not dropped — still wanted, and everything below stands. The nav's
Colophon link was hidden on 2026-08-05 because `/colophon` has no route, so the
link 404s from every page on the site; not offering it yet beats offering a
dead one. Unhiding is one element in `SidebarNav.tsx`, where a comment points
back here, and `.colophon` is still in the stylesheet. The page composition is
in `page-component-map.md` under "Colophon".*

- [ ] Panel chrome (right-side slide-in, scroll, close; standalone-page fallback layout)
- [ ] Annotation-mode toggle + the annotated-canvas state it triggers
- [ ] k-terminal easter egg (k311y % prompt)
- [ ] Estimate table (StatTable reuse)
- [ ] Restore the nav link once the route exists

## Open design decisions carried from earlier
- [ ] Nav collapsed state on scroll + mobile answer (drawer?)
- [ ] Tab-switch height behavior (equalize panels vs. scroll anchor)
- [ ] Marker glyph consistency: table rows vs. legend, per agency
- [ ] Work nav item styling (page square vs. anchor variant)
- [ ] CleverKeeping: in or out of Projects tab (+ stack for eyebrow, demo-data thumbnail)

## Parallel writing queue (not design, still owed)
De-dash pass on 7 copy files · artifact exports from Figma · Comparably descriptor · resume rebuild · content-model reconciliation to final component vocabulary
