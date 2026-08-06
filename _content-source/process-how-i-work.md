# How I work

**Section label:** Process

Two workflows, depending on where the project starts. Sometimes a designer hands me a finished Figma and my job is to turn it into a system a content team can run. Sometimes nothing exists and I'm the designer, the engineer, and the product owner at once. Different starting points, same destination: something built with intention that other people can actually use — and maintain.

---

## When the design exists: Figma to field architecture

This is my agency methodology, refined over eight years of headless WordPress builds for luxury hospitality and real estate brands.

**1. Kickoff: read the design with the designer.** Before anything else, a full Figma pass together — aligning styles for consistency, accounting for every UX action ("what opens what"), and surfacing the questions the design hasn't answered yet. Mobile is usually one of them: agency Figmas are desktop-only, so the mobile decisions will be mine, and I'd rather establish that trust early.

**2. Annotate the design into components.** I map every section across every page to a named component, defining its ACF fields right on the design. The judgment call at this stage is the one that decides whether the CMS will be pleasant or painful: which sections are truly the *same component* wearing different content, and which only look similar. Abstract too little and the CMS becomes a junk drawer of one-offs; abstract too much and every component sprouts conditional fields nobody understands.

**3. Classify by cost.** Each component gets a build classification — low cost (1–2 hrs) or high cost (4–8 hrs) — so the agency can see where the budget lives and make scope tradeoffs *before* the build starts, not after. This is also why I'm the person they bring larger builds to for time estimates: the costing isn't a guess, it's a sum.

**4. Draw the component tree for every page.** Page → flexible component → sub-component, for the whole site. When this is done, the entire build is visible on one board: what exists, what repeats, what it costs, and what fields power it.

**[Artifact: annotated Figma with ACF field mapping + cost classification]**
**[Artifact: per-page component trees]**

**5. Generate the schemas with Claude.** The field decisions are mine; the transcription isn't. I screenshot each annotated component to Claude, workshop the name, specify the fields — and have it generate the ACF JSON blob and the matching GraphQL schema entry. What used to be the most tedious, error-prone part of the build now ships without missed edge cases.

**6. Build, decide, and fill.** The headless build itself — including the motion layer, the mobile decisions the Figma never made, structured data and SEO schema, accessibility, cookie consent and marketing scripts, and CRM integration via the Gravity Forms API. Then content: I personally implement every non-templated page, and for each templated post type I enter one complete example for the content team to duplicate. The system isn't done when it renders; it's done when someone who isn't me can run it.

---

## When nothing exists: thinking in Figma, building with Claude

My own products — a storefront, games, internal tools — start from a blank page, and AI has genuinely changed how I work through them.

**Figma is my notebook now.** I used to keep an actual notebook on my desk for scribbling ideas. That's what Figma is for me today — a scratchpad, a place to think. No design system, no colors, no fonts. Just getting ideas out of my head and somewhere I can see them, until the landscape of the thing becomes visible.

**Then I plan with Claude Code.** Once I can see the shape, I explain the problem, the idea, and the outcome I want. Sometimes that's a massive concept that needs breaking into an MVP. Sometimes it's one component and I want several different ways to think about how it could work. Claude drafts; I review.

**I refuse to let the codebase outgrow me.** On Ant Farm, I caught the warning sign: a component I'd used in one place wasn't rendering the same somewhere else — which meant the code had drifted past my comprehension. So I stopped and did a deep dive, restructuring folders and files until the project was something I could follow again — and, more importantly, something another engineer could walk into and understand. I've had a running debate with an engineer friend who's certain, with one hundred percent conviction, that this won't matter — that when outcomes are correct, human-readable code becomes irrelevant. Maybe. I think it's a healthy argument to keep having. But for now, I build codebases I can still read, because I'm the one who has to stand behind them.

**Then the design gets the Kelly punch.** Claude's initial ideas are often good — and never personal. So I screenshot what it built, go back into Figma, and design the actual system: intentional typefaces and sizes, headings that match, real polish. Then I go into the styling and write a good share of it myself — not because I have to, but because I love it, and doing the work by hand is how I keep growing as an engineer.

---

## Why I work this way

My career has mostly been a one-person show. No senior engineer at the next desk, no design crit on Thursdays, no code review culture to absorb by osmosis. What I love about working with AI is honest and a little unglamorous: I'm never smart *enough* yet. There's always another best practice I would have learned on a larger team — and now I have somewhere to learn it. Claude is the bigger team I never had.

But the judgment stays mine. The content models, the component boundaries, the design decisions, the taste — that's the part that doesn't delegate. AI eliminates the distance between deciding and shipping. Deciding is still the job.
