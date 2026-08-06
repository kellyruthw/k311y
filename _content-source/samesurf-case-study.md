# Samesurf — Video Chat Integration

**Section label:** Case study · Product design
**Company:** Samesurf — B2B cobrowsing software
**Role:** Strategy, UX & UI Design
**Used by:** Banks, support teams, and contract-based businesses
**Context:** Enables shared browsing without exposing sensitive data
**Related build:** Before this project, I designed and built Samesurf's marketing site as a headless WordPress + Gatsby build

---

## Overview

Samesurf lets a support agent and a customer browse the same screen in real time, without exposing sensitive data. The project: embed video and call functionality directly into the cobrowsing platform to reduce friction during live customer support sessions.

**The problem:** How might we introduce video and call chat without disrupting existing workflows or overwhelming users — especially on mobile?

**Constraints:** Video and call chat were entirely new capabilities. Desktop and mobile had to work equally well. The existing navigation was already overloaded, and screen real estate was limited.

---

## Before designing solutions: what should video chat actually enable?

When I joined the project, video chat was broadly defined — no shared understanding of required actions or how it should operate within existing cobrowsing workflows. Before designing interfaces, I focused on the current product flow, the roles involved, and the constraints video would introduce: existing host and guest workflows from session start to end, entry points and session states across devices, the interface elements a video-enabled session requires, and mobile and desktop layout constraints.

The focus for this phase: define which elements must remain persistent, prioritize controls by user role and context, reduce cognitive load in constrained layouts, and establish clear structure *before* introducing visual design.

**[Artifact: framing questions — "which controls compete for space?", "what breaks first on mobile?"]**

---

## Video chat required rethinking navigation, not just adding a feature

Early exploration made one thing clear: video couldn't simply be layered onto the existing interface. Navigation was already doing too much at once, and adding video without restructuring would have increased friction — especially on mobile, where layouts exposed structural issues that desktop had been hiding. Users also arrived with expectations: they wanted the familiar video behaviors of tools like Zoom.

What that meant for the work: video chat had to feel native, not bolted on; navigation needed restructuring to support new modes; and familiar patterns would reduce cognitive load.

---

## Design direction: simplify first, then layer in video

Rather than treating video chat as an isolated feature, the direction shifted toward simplifying the overall interface to *make room* for new functionality — revisiting navigation, entry flows, and control placement before designing the video experience itself.

**Principles guiding the work:** familiar patterns over novelty · intentional control hierarchy (primary actions take precedent in small spaces) · mobile-first constraints (design for the tightest space first).

**What we intentionally deprioritized:** advanced video and microphone controls, supporting every edge case in the first pass, and in-app tutorials.

---

## Evaluating which controls deserved persistent space

I evaluated how users accessed core cobrowsing actions and whether those actions needed to remain visible at all times. Redundant controls were consolidated; less-frequent actions moved deliberately behind a second interaction to reduce visual noise on smaller screens. Every candidate control faced the same questions: does this need to be immediately accessible, or can it be contextual? If two actions lead to the same outcome, do both need to exist? Will users recognize this as interactive without instruction? How frequently is it actually used during a session?

**[Artifact: control evaluation notes and navigation concepts]**

With direction set, I explored multiple layouts and control systems — different navigation densities, floating vs. fixed video controls, pull-tab interactions to minimize obstruction, distinct modes for cobrowse vs. video. Exploration revealed that overly combined controls felt cluttered, certain actions could be deprioritized, and a slim, purpose-driven navigation performed best in stakeholder testing.

---

## Narrowing toward a clearer, more predictable interface

Through weekly stakeholder reviews, I iterated on layouts, flows, and interaction states. Feedback centered on clarity, predictability, and ensuring hosts could manage sessions without cognitive overload. Key refinements: a simplified navigation hierarchy, clear separation between modes (video, cobrowse, upload & share), explicit states for mic, video, and user roles, and restructured user actions (invite, users, pass control).

The approach moved forward because it matched user expectations, scaled across desktop and mobile, and its clean organization supported enterprise-level trust.

**[Artifact: iteration rounds and final session UI]**

---

## Final solution: an embedded video experience that supports existing workflows

The final design introduced video chat as a seamless extension of Samesurf's cobrowsing experience. Navigation and entry flows were reworked to prioritize clarity, while controls remained familiar and accessible across devices. The key elements: video and microphone in a simplified nav system, a clear onboarding flow for joining sessions, host and guest role clarity, and a pull-tab UI that minimizes screen obstruction.

**[Artifact: desktop and portrait prototypes]**

---

## Impact: reduced friction and improved alignment across teams

With final approval, the Figma file was prepped for engineering — states, prototypes, variables, and notes. The work created a clear, cohesive vision for how video chat could live within Samesurf's platform, and stakeholders aligned around scope, priorities, and technical requirements earlier than before.

**Evidence of impact:** strong validation from the CEO, CTO, and Sales; clearer technical conversations around constraints; engineering-ready files and documented workflows; and a reusable component and variable system.

**What this enabled next:** faster implementation once engineering began, and a scalable foundation for future real-time features.

---

## Reflection: clarity early prevents future compounding complexity

This project reinforced how critical early structure and prioritization are when introducing new features. By addressing navigation and workflow clarity first, the team avoided adding video in a way that would have increased friction — and the compounding cost that comes with it.
