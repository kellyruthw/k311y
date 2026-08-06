# Palette Town — build sheet (composed from the 9-component vocabulary)
*Same format as Ascaya. All copy de-dashed, plain voice, skim layers on every section. Flags marked [KELLY] need your input.*

---

## 1 · PageHero (case) + MetaBlock
**Kicker chips:** CASE STUDY · HEADLESS SHOPIFY
**Title:** The site where I'm my own client
**Media:** storefront capture (or a loop of the What's Next voting UI)
**MetaBlock:**
- Client: Palette Town (my own shop)
- Role: Founder, and the designer, engineer, and content team
- Stack: Headless Shopify · Next.js · Vercel · Gelato · Firebase · Klaviyo API · Claude (API + Code)
- Timeline: Full migration from WordPress/WooCommerce
- Live: palettetown.co

## 2 · IntroCopy
**Kicker:** OVERVIEW
**Paragraphs:**
1. Palette Town is my own shop: hand-drawn vector art prints inspired by the Pokémon TCG, fulfilled print-on-demand through Gelato. It's the one project where I hold every role at once. Client, designer, engineer, and the content team who has to live inside whatever architecture I choose.
2. That makes it my most honest case study. Every opinion I have about content systems gets tested here, on me, monthly.

## 3 · MediaCopy (image)
**Kicker:** WHY SHOPIFY
**Heading:** Meeting buyers in a checkout they already trust
**Copy blocks:**
- (The customer reason) I noticed my own behavior as a shopper: I reach for Shop Pay every time it's offered. For a small fan-art shop, an unfamiliar checkout is where trust leaks. Moving the store meant meeting buyers inside a purchase flow they've completed a hundred times before.
- (The operator reason) My blog posts can display 100+ card entries each, and building them in the WordPress admin was painful. The backend rendered so slowly that content work I should have finished in an afternoon dragged across days.
**Media:** Shop Pay checkout capture
*[KELLY]: the two reasons could also split into 2 MediaCopys if one image can't carry both.*

## 4 · TextSection
**Kicker:** THE TRADEOFF
**Heading:** I chose a stack with no CMS
**Paragraphs:**
1. My entire professional thesis is that the content model is a user interface and the editor is the user. And for my own store, I gave up the admin entirely. I miss it. I don't write markdown comfortably, and going headless with local content meant losing the editing experience I build for every client.
2. I made the trade with open eyes: checkout trust and content velocity mattered more to a team of 1 than an admin UI. The architecture question is never what's best. It's what's best for who maintains this, and here the maintainer is me, with different constraints than a client's content team.
3. So I rebuilt the editorial layer a different way: as conventions plus AI instead of admin screens. I defined a set of blog components with clear rules, and Claude knows which components to use for each type of post. I describe the post, Claude writes the structured markdown against my component system.

## 5 · CalloutList (cards ×3, with admin screenshots)
**Kicker:** BACK OFFICE
**Heading:** A purpose-built admin instead of a general-purpose one
**Intro:** The migration didn't leave me without tools. I built my own panel that does exactly 3 things my shop needs.
**Card 1:** Votes become an audience → The What's Next feature lets visitors vote on the next poster and leave their email with the vote. Votes land in Firebase and sync to Klaviyo, so every future poster launches with a warm list of the people who asked for it. → image: voting dashboard
**Card 2:** Live curation in 30 seconds → The panel shows incoming votes and user-suggested cards, and I can add or remove ballot candidates with changes pushing to production live. → image: vote cards UI
**Card 3:** News to published in minutes → The panel monitors my trusted Pokémon TCG news sources. I select related coverage, the Claude API drafts an original synthesis with the source set tracked per post, I add a Figma thumbnail, and posting deploys automatically. → image: combine-into-post flow

## 6 · TextSection
**Paragraphs (no kicker, continuation):**
1. The panel started as a page on the main site and got promoted: it now lives as its own app on an admin subdomain with authenticated access, and the site's styling moved into a shared global layer both apps draw from. It shipped fast because it had a job to do, and the architecture already accounts for the reskin.
2. I am 1 person running a storefront, a fan-art practice, a blog, and an email list. The back office is why that's possible.

## 7 · ThesisLine
**Quote:** AI doesn't decide my content model. It eliminates the gap between deciding and shipping.

## 8 · MediaCopy (image)
**Kicker:** CONTENT OPS
**Heading:** Card-scale content work, finally error-free
**Copy blocks:**
- (The workflow) Working locally with Claude Code, I renamed every image file to an SEO convention, generated titles and alt text across the catalog, and cross-checked posts against the card sets to confirm nothing was missed.
- (The result) Work that used to be manual and error-prone became fast and, for the first time, error-free. The completeness checks caught what my eyes skimmed past.
**Media:** [KELLY] before/after file naming, or a blog post at card scale

## 9 · CalloutList (cards ×3, no images or small icons)
**Kicker:** PRODUCTION
**Heading:** The storefront checklist nobody sees
**Card 1:** Launch and fulfillment → DNS cutover to Vercel with the shop's email routing preserved, Gelato fulfillment integrated and order-tested end to end.
**Card 2:** Search and schema → A Merchant Center feed rejection diagnosed and fixed at the configuration level, product JSON-LD maintained against Google's requirements, SEO packages written for all 23 prints from Search Console data.
**Card 3:** Email and CRM → Transactional templates patched to render store metadata correctly, and the Klaviyo pipeline segmenting the audience by the posters they voted for.

## 10 · MediaCopy (table) or TextSection
**Kicker:** IMPACT
**Heading:** [KELLY: pending your GSC decision. With numbers: "Impressions up since the migration" + table. Without: qualitative heading like "The bottleneck became the fast part."]
**Copy:** The qualitative shift is the one I feel: content work that used to be the bottleneck is now the fast part, the store checks out through a flow customers already trust, and the whole stack is one I can change in an afternoon. When you're your own client, every architectural regret is a bill addressed to you.
**Table rows if used:** Prints (23) · [GSC trend] · [orders direction] · Merchant Center (approved)

## 11 · LargeList
**Kicker:** REFLECTION
1. Being my own client is the fastest feedback loop I've ever had. Every architecture opinion gets tested on me, monthly, and the ones that survive are the ones I bring to client work.
2. The admin panel taught me that purpose-built beats general-purpose when the team is 1. The next step is the reskin: the shared styling layer already exists, so the panel can adopt the shop's branding without a rewrite.
3. The editorial pipeline tracks its sources per post but doesn't display them publicly yet. That's changing: source attribution is going onto the blog, both for readers and because it's the right way to run a synthesis pipeline.
*[KELLY]: these are drafted from things you've told me. Rewrite freely; item 3 especially should only ship if the attribution work is actually planned.*

## 12 · NextCase
**Kicker:** NEXT CASE STUDY · HARLAND WEST HOLLYWOOD
**Title:** Motion as a tour
**link_label:** [KELLY: "Watch the site move" / "Tour the motion build" / your call]

---

## Rail
Work > Palette Town > PageHero (MetaBlock ◇) · IntroCopy · MediaCopy ·3 · TextSection ·2 · CalloutList ·2 · ThesisLine · LargeList · NextCase
*(No FullWidthMedia on this page unless an artifact earns one; the accordion is dead, replaced by slot 9's cards.)*
