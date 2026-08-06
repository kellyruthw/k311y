# Palette Town — The site where I'm my own client

**Section label:** Case study · Headless commerce
**Live site:** palettetown.co
**Role:** Founder — and the designer, engineer, and content team
**Stack:** Headless Shopify · Next.js · Vercel · Gelato (print-on-demand) · Firebase · Klaviyo API · Claude (API + Code)
**Scope:** Full migration from WordPress/WooCommerce — storefront, fulfillment, transactional email, SEO, content ops

---

## Overview

Palette Town is my own shop: hand-drawn vector art prints inspired by the Pokémon TCG, fulfilled print-on-demand through Gelato. It's the one project where I hold every role at once — client, designer, engineer, and the content team who has to live inside whatever architecture I choose.

That makes it my most honest case study. Every opinion I have about content systems gets tested here, on me, monthly.

---

## Killing my own WordPress build

The original store ran on WordPress with a custom theme I'd built. I migrated it to headless Shopify + Next.js for two reasons — one about customers, one about me.

**The customer reason: checkout trust.** I noticed my own behavior as a shopper — I reach for Shop Pay every time it's offered. For a small fan-art shop, an unfamiliar checkout is a place where trust leaks; Shopify's checkout is one strangers already recognize and autofill. Moving the store meant meeting buyers inside a purchase flow they've completed a hundred times before.

**The operator reason: editing friction.** My blog posts can display 100+ card entries each, and building them in the WordPress admin was genuinely painful — the backend rendered so slowly that content work I should have been able to do in an afternoon dragged across days. The CMS I'd built was fighting the content I most needed to produce.

---

## The tradeoff I chose on purpose

Here's the uncomfortable part: my entire professional thesis is that the content model is a user interface and the editor is the user — and I chose a stack with no CMS.

I miss it. I don't write markdown comfortably, and going headless with local content meant giving up the editing experience I build for every client. But I made the trade with open eyes: checkout trust and content-ops velocity mattered more to a team of one than an admin UI. The architecture question is never "what's best" — it's "what's best for who maintains this," and for Palette Town, the maintainer is me, with different constraints than a client's content team.

So I rebuilt the editorial layer a different way: as **conventions plus AI** instead of admin screens. I defined a set of blog components with clear rules, and Claude knows which components to use for each type of post — I describe the post, Claude writes the structured markdown against my component system. The "CMS" became a component vocabulary and a collaborator who speaks it fluently.

And for everything else, I built my own back office.

---

## Building my own back office

The migration didn't leave me CMS-less — it let me replace a general-purpose admin with a purpose-built one that does exactly three things my shop needs, and nothing else.

**The vote-to-audience pipeline.** Palette Town's "What's Next" feature lets visitors vote on which card I should draw into a poster next, leaving their email with their vote. Votes land in Firebase — my first production database outside MySQL — and sync to Klaviyo through its API. The result: every future poster launches with a warm email list of the exact people who asked for it. The product roadmap and the marketing segmentation are the same system.

**Live vote operations.** My admin panel shows incoming votes and user-suggested cards, and lets me add or remove candidates from the ballot — changes push to the production site live. Curating the vote is a 30-second task instead of a deploy.

**The editorial pipeline.** The panel's blog section monitors my trusted Pokémon TCG news sources and lists new headlines. When several outlets cover the same story, I select the related coverage, and the Claude API reads the set and drafts an original article synthesizing the shared information — with the panel tracking the full source set behind every published post. I review the draft, drop in a thumbnail I create in Figma, and hit post — which deploys automatically. A news post goes from "noticed" to "published" in minutes, with my editorial judgment at both ends and the tedium nowhere.

Architecturally, the panel started as a page on the main site — and got promoted. It now lives as its own app in its own folder, deployed by Vercel to an admin subdomain with authenticated access, cleanly separated from the storefront. When I split it out, I also extracted the site's styling into a shared global layer both apps draw from — so the panel's function-first UI can converge on the shop's branding as it matures, without a rewrite. It shipped fast because it had a job to do; the architecture already accounts for the polish.

I am one person running a storefront, a fan-art practice, a blog, and an email list. The back office is why that's possible.

---

## Content operations at card scale

The migration unlocked the workflow I actually wanted. Working locally with Claude Code, I ran content operations that were impractical inside a slow admin:

- Renamed every image file to an SEO-purposeful convention
- Generated appropriate titles and alt text across the catalog
- Cross-checked posts against the card sets to confirm nothing was missed

Work that used to be error-prone and manual became fast and, for the first time, **error-free** — the completeness checks caught what my eyes skimmed past. This is where I landed on the principle that now runs through all my builds: AI doesn't make my content decisions; it eliminates the distance between deciding and shipping.

---

## The unglamorous commerce layer

A storefront isn't done when it renders. The migration included the full production checklist:

- **DNS cutover** from the old host to Vercel — while preserving the existing email routing untouched, because breaking the shop's email to launch the shop's website is not a trade anyone should make
- **Gelato fulfillment integration** and live order testing end to end
- **Transactional email templates** patched so customer-facing messages render correctly with store metadata
- **Google Merchant Center**: diagnosed a feed rejection caused by the default myshopify.com URLs appearing in the US feed and resolved it at the feed-configuration level to get products approved
- **Structured data**: product JSON-LD maintained against Google's evolving requirements, with Search Console as the feedback loop
- **SEO packages** written for the full print catalog (~23 products), informed by Search Console query data rather than guesswork

---

## Impact

[Stats to confirm: GSC impressions/clicks trend since migration · order volume direction · Merchant Center approval status]

The qualitative shift is the one I feel: content work that used to be the bottleneck is now the fast part, the store checks out through a flow customers already trust, and the whole stack is one I can change in an afternoon — because when you're your own client, every architectural regret is a bill addressed to you.
