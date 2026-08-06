# TerraTrue — Privacy Workflow Design System

**Section label:** Case study · Product design
**Company:** TerraTrue — B2B privacy and compliance software
**Role:** Founding UX/UI Designer — design systems, product design, branding
**Used by:** Product, engineering, legal, and privacy teams
**Context:** Centralized data collection across teams, powering downstream privacy reviews and regulatory compliance
**Related build:** I also designed and built TerraTrue's headless marketing site with Gatsby, my first headless build, alongside this role

---

## Overview

TerraTrue helps product teams accurately document how their features use personal data, so companies can comply with global privacy regulations like GDPR and CCPA. I joined as the founding designer, when only product concepts existed, working in one-week design-and-build sprints toward a product whose users — product managers and engineers — are not privacy experts.

**The problem:** How might we help non-experts accurately document how their product uses personal data, without overwhelming them or creating ambiguity that could lead to compliance risk?

---

## Early content and designs added friction

The original Data Spec framed privacy decisions at too high a level for non-privacy stakeholders. Questions assumed prior knowledge, repeated themselves, and lacked a clear sense of progression. The first concept required written explanations from users; the first iteration replaced them with heavy accordions that demanded too much clicking to compare options — and still intimidated first-time users.

**[Artifact: original Data Spec concept and first iteration]**

The lesson hiding in those failures: UX polish wasn't the fix, because the underlying structure was wrong.

---

## We needed a new way to ask complex questions

Reframing the problem produced the design principles that carried the rest of the work:

- Break complex privacy concepts into smaller, approachable steps
- Introduce complexity progressively, not all at once
- Build a system that scales across launches and teams

The Data Spec was restructured as a guided flow — Basics → Data Subjects → Data Uses → Data Types → Third Parties → Consent → Review — where each step captures a single decision, and earlier answers shape what comes next. Cognitive load drops; accuracy is preserved.

**[Artifact: progressive question system flow]**

---

## Designing clarity one decision at a time

With the flow defined, each screen was designed to support one focused decision: plain-language prompts (non-legal, non-technical), visual grouping over dense lists, and a clear primary action. Complexity waited its turn — heavier decisions like data types and retention only appeared after users understood *why* they were collecting data, at which point they felt manageable instead of overwhelming.

**[Artifact: Data Spec screens — basics, data types, retention]**

---

## Impact: reducing friction without sacrificing compliance

- **Approachable questions** — lowered the barrier for non-privacy experts to complete required reviews with confidence
- **Aligned teams** — created a shared language across product, legal, and privacy stakeholders
- **Quicker approvals** — enabled faster, more consistent launch approvals

This work contributed to TerraTrue's ability to scale enterprise workflows — part of the foundation that led to a successful $15M Series A.

---

## Lessons from designing systems, not just screens

1. UX polish isn't enough when the underlying structure is wrong — reframing the problem unlocks meaningful improvements.
2. Progressive disclosure helps non-experts build confidence before encountering complexity.
3. Designing systems, not just screens, allows scaling across teams and provides consistency throughout the product.

---

## Hard lessons: a custom design system is not a one-week task

This was my first time designing a product from the ground up, and I didn't know how to manage evolving requirements once components were already shipped. As the project progressed, requirements grew and component structures needed to change — or we'd have had to sacrifice clarity. The result was rework, friction, and a clear lesson in how fragile systems become when boundaries aren't set.

It was uncomfortable. It also fundamentally changed how I approach design work today.
