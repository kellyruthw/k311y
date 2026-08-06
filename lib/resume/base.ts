import type { ResumeContent } from "./types";

/**
 * The public resume, served at /resume. Content v3, from
 * _content-source/resume-build-handoff.md, transcribed verbatim.
 *
 * "Do not rewrite copy" is the handoff's instruction and it is load-bearing:
 * these lines were written to be read across a desk, and every number in them
 * is one Kelly can stand behind. Fixing a phrase here is a content decision, not
 * a build decision.
 *
 * The copy laws this file is held to, all of which are already correct below:
 * "frontend" is one word; no em-dashes anywhere; numerals over spelled-out
 * numbers; "Wicked+" and "Milk + Butter" exactly as written.
 */
export const baseResume: ResumeContent = {
  variant: "base",
  name: "Kelly Warpechowski",
  title: "Design Engineer",

  // tel: needs the E.164 form to be dialable from a phone, while the label stays
  // the way it is written on paper.
  contact: [
    { label: "kellyruthw@gmail.com", href: "mailto:kellyruthw@gmail.com" },
    { label: "414-732-4116", href: "tel:+14147324116" },
    { label: "k311y.com", href: "https://k311y.com" },
  ],

  summary:
    "Design engineer with 14 years shipping marketing sites end to end, from Figma handoff to production. I design component systems, model CMS schemas that non-engineers can use, and build the frontend myself in React, Next.js, and GSAP. Recent work spans luxury hospitality brands and my own headless commerce product, with AI-assisted pipelines handling the repetitive parts.",

  experience: [
    {
      title: "Design Engineer, Founder",
      company: "Heartcore Studio",
      location: "Tehachapi, CA",
      dates: "July 2021 - Present",
      bullets: [
        "Build headless WordPress + Next.js marketing sites for luxury hospitality and real estate brands via Wicked+, an 8+ year agency partnership: Ascaya, Harland West Hollywood, Treasure Island SF. Own field architecture, component builds, GSAP motion, and deployment from static desktop-only Figma files.",
        "Model ACF schemas and flexible component libraries that let brand and content teams compose pages with guardrails; train content teams on the system.",
        "Built an AI-assisted schema pipeline with Claude Code: annotated Figma screenshot in, production ACF JSON and GraphQL out. Ships TypeScript/Next.js.",
        "Designed and built Palette Town, a headless Shopify art brand, end to end: custom admin panel, Claude API editorial pipeline, structured data. Migration results on matched 83-day windows: +32% clicks, +23% impressions, 1,100+ ranking queries at 99% non-branded, 169 countries, $0 ad spend.",
        "Lead web design for Uptempo marketing campaigns; most recent gated campaign converted at 15%.",
      ],
      clientsLine:
        "Clients include: GoDaddy, Uptempo, FitOn, VidMob, Samesurf, The Famous Group",
    },
    {
      title: "Developer, Founding Product Designer",
      company: "TerraTrue",
      location: "Los Angeles, CA",
      dates: "June 2019 - July 2021",
      bullets: [
        "Led UX/UI for a 0-1 privacy compliance product with 10+ major features spanning GDPR and CCPA workflows; refined a custom design system with engineering built on reusable components.",
        "Pitched, designed, and built the headless marketing site (React, GraphQL, WordPress) to improve SEO and site performance.",
      ],
      clientsLine:
        "Clients include: Robinhood, Roku, Lyft, Wish, OfferUp, Foursquare",
    },
    {
      title: "Product Designer & Developer",
      company: "First Media",
      location: "Los Angeles, CA",
      dates: "March 2019 - June 2019",
      bullets: [
        "Designed landing pages that converted viewers into paid users for HelloFresh and EveryPlate; shipped CMS features that improved the editorial team's workflow.",
      ],
    },
    {
      title: "Web Developer & Designer, Contract",
      company: "ATTN:",
      location: "Los Angeles, CA",
      dates: "Nov 2018 - Feb 2019",
      bullets: [
        "Built micro-sites promoting TV shows for Amazon, Focus Features, and ABC. An interactive Redbox signup experience drove 30k+ conversions in its first week.",
      ],
    },
    {
      title: "Marketing & Product Designer",
      company: "Collide",
      location: "Culver City, CA",
      dates: "Jan 2017 - Aug 2017",
      bullets: [
        "Designed the UX/UI for a 0-1 desktop app with live streaming, messaging, and search, connecting fans with celebrities and creators through micro transactions.",
      ],
    },
    {
      title: "Senior Frontend Developer",
      company: "OMNI Digital Agency",
      location: "Torrance, CA",
      dates: "Sept 2016 - Jan 2017",
      bullets: [
        "Led frontend development for high-ticket projects, including a VOD catalog and subscription model; provided technical guidance and managed project scope for a team of Jr. developers.",
      ],
    },
    {
      title: "Marketing Designer & Developer",
      company: "TigerConnect",
      location: "Santa Monica, CA",
      dates: "Sept 2015 - Sept 2016",
      bullets: [
        "Designed and developed Marketo landing pages that generated MQLs for the sales team.",
        "Deployed heatmaps to gather user interaction data that informed design and development decisions, cutting the site bounce rate 30%.",
      ],
    },
    {
      title: "Web Designer & Developer",
      company: "Digital Media Management",
      location: "Beverly Hills, CA",
      dates: "Oct 2014 - Sept 2015",
      bullets: [
        "Designed and developed WordPress editorial sites for Lionsgate and celebrity clients receiving 1M+ monthly views; mobile optimization strategies cut the mobile bounce rate 65%.",
      ],
    },
    {
      title: "Jr. Web Designer & Developer",
      company: "Lightburn",
      location: "Milwaukee, WI",
      dates: "June 2012 - Jan 2013",
      bullets: [
        "Designed corporate websites in Photoshop and developed approved mockups with HTML/CSS in an internal CMS.",
      ],
    },
  ],

  skills: [
    {
      label: "Languages",
      items: ["TypeScript", "JavaScript", "HTML", "CSS/SASS", "PHP", "GraphQL"],
    },
    {
      label: "Frameworks",
      items: ["React", "Next.js (App Router)", "Tailwind", "GSAP"],
    },
    {
      label: "CMS",
      items: [
        "Headless WordPress",
        "ACF",
        "WPGraphQL",
        "Shopify (headless)",
      ],
    },
    { label: "Platforms", items: ["Vercel", "Netlify", "GitHub"] },
    { label: "AI", items: ["Claude Code", "Claude API pipelines"] },
  ],

  education: [
    {
      credential: "B.A. Interactive Media Design",
      school: "Alverno College",
    },
  ],

  metaDescription:
    "Design engineer with 14 years shipping marketing sites end to end, from Figma handoff to production. React, Next.js, GSAP, and headless WordPress.",

  updated: "2026-08-06",
};
