# Resume Build Handoff: HTML/CSS Resume with Print-to-PDF

## What this is

Build Kelly's resume as a single HTML page with a print stylesheet, styled with the k311y.com design system. The browser's print-to-PDF is the export pipeline. One source of truth, 2 outputs: a web page (eventually k311y.com/resume) and a submittable PDF.

## Why HTML instead of Figma

Figma's PDF export fragments text into positioned runs or outlines it into vectors. Reading order scrambles, and ATS scanners and AI parsers reconstruct soup. Browsers print semantic HTML in document order, producing a PDF with a clean, ordered, selectable text layer. This build must parse like a plain Word doc and look like Kelly designed it.

## Hard requirements (parseability)

These are non-negotiable. The PDF gets machine-read before human-read.

1. Semantic HTML in true document order. The DOM order IS the reading order: name, title, contact, summary, experience (newest first), skills, education. No CSS order tricks that diverge visual order from DOM order in ways that change meaning.
2. Real text everywhere. No text baked into SVGs or images. No icon fonts carrying meaning.
3. Single column for the experience section. Sidebar layouts are allowed only if the DOM order still reads correctly when linearized (test it). When in doubt, stack.
4. Standard Unicode punctuation only. The interpunct separator (·) is fine. No decorative glyphs inside body text.
5. Fonts embedded via @font-face with proper Unicode cmaps so the PDF text layer maps to real characters. Test: copy-paste from the final PDF into a plain text editor must reproduce the resume verbatim.
6. Links as real anchors: mailto for email, https for k311y.com.
7. No headers/footers injected by the browser (set print margins to suppress, or instruct printing with headers/footers off).

## Print stylesheet spec

- `@page { size: letter; margin: 0.5in 0.6in; }` (tune margins to taste, but keep at least 0.4in)
- `@media print` overrides: kill any nav/site chrome, kill hover states, set exact colors with `print-color-adjust: exact` only where needed (prefer near-black text on white; this is a resume, not a poster)
- Page break discipline: `break-inside: avoid` on each role entry (header + bullets stay together); `break-after: avoid` on section headings so a heading never orphans at a page bottom
- Target: 2 pages exactly at letter size. If content runs to a third page, tighten spacing before touching content
- Base font size around 9.5 to 10.5pt for body in print; test legibility on paper, not just screen

## Design system (from k311y.com)

Use the portfolio's tokens, not its chrome. The resume is a document, not a Figma-metaphor canvas. No dot grid, no sidebar, no marching ants. What carries over:

- Type: Grift for display and body. AOT Serial Mono for labels, kickers, and the contact line. Section headings ("Experience", "Skills", "Education") are candidates for mono treatment as kickers.
- Spacing: the 5px scale. All margins/padding in 5px increments.
- Color: near-black on white. If any accent appears (rules, the interpunct dots, link underlines), it should be a single restrained pull from the portfolio palette. Motion restraint doctrine applies to color here: restraint is a feature.
- Weight hierarchy does the work: name largest, role titles bold, company lines regular, bullets regular. No more than 3 sizes on the page beyond the name.

## Copy laws (enforced site-wide, apply here too)

- "frontend" is one word, always. Never "front end" or "front-end".
- No em-dashes anywhere.
- Numerals over spelled-out numbers.
- Ampersand vs "and" is intentional per name: "Wicked+" never "Wicked". "Milk + Butter" as written.
- Role headers are 2 stacked lines: job title on line 1, then "Company · Location · Dates" on line 2.
- Plain talk. If a phrase would not survive being said across a desk, it does not ship.

## Acceptance tests

1. Print to PDF from Chrome. Run `pdftotext resume.pdf -` (or copy-paste all). Output must read top to bottom in correct order with zero scrambling, and every word must survive.
2. Both pages break cleanly: no orphaned headings, no role entry split across pages.
3. Selectable text in any PDF viewer. Searching "Wicked+" and "TypeScript" in the PDF finds them.
4. Visual check at 100% zoom and printed on paper.

## Resume content (v3, final)

Render exactly this content. Do not rewrite copy.

---

# Kelly Warpechowski

Design Engineer
kellyruthw@gmail.com · 414-732-4116 · k311y.com

Design engineer with 14 years shipping marketing sites end to end, from Figma handoff to production. I design component systems, model CMS schemas that non-engineers can use, and build the frontend myself in React, Next.js, and GSAP. Recent work spans luxury hospitality brands and my own headless commerce product, with AI-assisted pipelines handling the repetitive parts.

## Experience

**Design Engineer, Founder**
Heartcore Studio · Tehachapi, CA · July 2021 - Present

- Build headless WordPress + Next.js marketing sites for luxury hospitality and real estate brands via Wicked+, an 8+ year agency partnership: Ascaya, Harland West Hollywood, Treasure Island SF. Own field architecture, component builds, GSAP motion, and deployment from static desktop-only Figma files.
- Model ACF schemas and flexible component libraries that let brand and content teams compose pages with guardrails; train content teams on the system.
- Built an AI-assisted schema pipeline with Claude Code: annotated Figma screenshot in, production ACF JSON and GraphQL out. Ships TypeScript/Next.js.
- Designed and built Palette Town, a headless Shopify art brand, end to end: custom admin panel, Claude API editorial pipeline, structured data. Migration results on matched 83-day windows: +32% clicks, +23% impressions, 1,100+ ranking queries at 99% non-branded, 169 countries, $0 ad spend.
- Lead web design for Uptempo marketing campaigns; most recent gated campaign converted at 15%.

Clients include: GoDaddy, Uptempo, FitOn, VidMob, Samesurf, The Famous Group

**Developer, Founding Product Designer**
TerraTrue · Los Angeles, CA · June 2019 - July 2021

- Led UX/UI for a 0-1 privacy compliance product with 10+ major features spanning GDPR and CCPA workflows; refined a custom design system with engineering built on reusable components.
- Pitched, designed, and built the headless marketing site (React, GraphQL, WordPress) to improve SEO and site performance.

Clients include: Robinhood, Roku, Lyft, Wish, OfferUp, Foursquare

**Product Designer & Developer**
First Media · Los Angeles, CA · March 2019 - June 2019

- Designed landing pages that converted viewers into paid users for HelloFresh and EveryPlate; shipped CMS features that improved the editorial team's workflow.

**Web Developer & Designer, Contract**
ATTN: · Los Angeles, CA · Nov 2018 - Feb 2019

- Built micro-sites promoting TV shows for Amazon, Focus Features, and ABC. An interactive Redbox signup experience drove 30k+ conversions in its first week.

**Marketing & Product Designer**
Collide · Culver City, CA · Jan 2017 - Aug 2017

- Designed the UX/UI for a 0-1 desktop app with live streaming, messaging, and search, connecting fans with celebrities and creators through micro transactions.

**Senior Frontend Developer**
OMNI Digital Agency · Torrance, CA · Sept 2016 - Jan 2017

- Led frontend development for high-ticket projects, including a VOD catalog and subscription model; provided technical guidance and managed project scope for a team of Jr. developers.

**Marketing Designer & Developer**
TigerConnect · Santa Monica, CA · Sept 2015 - Sept 2016

- Designed and developed Marketo landing pages that generated MQLs for the sales team.
- Deployed heatmaps to gather user interaction data that informed design and development decisions, cutting the site bounce rate 30%.

**Web Designer & Developer**
Digital Media Management · Beverly Hills, CA · Oct 2014 - Sept 2015

- Designed and developed WordPress editorial sites for Lionsgate and celebrity clients receiving 1M+ monthly views; mobile optimization strategies cut the mobile bounce rate 65%.

**Jr. Web Designer & Developer**
Lightburn · Milwaukee, WI · June 2012 - Jan 2013

- Designed corporate websites in Photoshop and developed approved mockups with HTML/CSS in an internal CMS.

## Skills

**Languages:** TypeScript, JavaScript, HTML, CSS/SASS, PHP, GraphQL
**Frameworks:** React, Next.js (App Router), Tailwind, GSAP
**CMS:** Headless WordPress, ACF, WPGraphQL, Shopify (headless)
**Platforms:** Vercel, Netlify, GitHub
**AI:** Claude Code, Claude API pipelines

## Education

B.A. Interactive Media Design, Alverno College

---

## Build notes

- Deliverable: a standalone `resume.html` (inline CSS is fine) that Kelly opens in Chrome and prints to PDF. If building inside the portfolio repo instead, it becomes a route at /resume with the same print stylesheet, SSG like everything else.
- Future tailored variants will reuse this shell with swapped content. Keep content and presentation separable enough that a second content file drops in cleanly.
- Reduced-motion is moot (no motion). Dark mode is moot (print is white). Do not add either.
