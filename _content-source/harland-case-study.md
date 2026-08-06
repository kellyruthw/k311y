# Harland West Hollywood — Motion as a tour

**Section label:** Craft spotlight · Motion & interaction
**Live site:** harlandwesthollywood.com
**Client:** Harland, via Wicked+
**Role:** Design engineer — headless build, motion design & implementation, field architecture, content, CRM
**Motion stack:** GSAP (ScrollTrigger, pinning) · Lenis smooth scroll

---

## The brief was a feeling

Harland is a luxury condominium property in West Hollywood — the kind of building you notice driving past. The client's ask wasn't a feature list; it was that the site should *tell a story*. My translation: the user shouldn't scroll a website, they should tour it — the way they'd tour the residences, room by room, with someone pacing the reveal.

Every motion decision on the site descends from that one metaphor. I designed and implemented all of it: this is the same full-ownership build as my other Wicked+ projects — field architecture through content entry — but motion is the story here.

---

## Two interactions that carry the tour

**The reveal.** Tall imagery unveils upward as the user scrolls into each section, triggered on the component's entry into view, riding Lenis's smoothed scroll. The effect is less "content loading" and more "walking into a room" — the space opens as you arrive. Because the trigger is component-based, it works with the flexible CMS architecture: content editors can rearrange sections and the choreography holds.

**The keyhole.** Harland's brand carries a keyhole design element, and I turned it into the site's signature moment: on scroll, the keyhole pins and grows from a small aperture toward full frame — the copy holds centered inside it while lifestyle imagery streams upward around the outside. The user is standing in the middle of something magical, the life of the building moving past them, seeing themselves in it. It's the brand element doing narrative work instead of decorating a corner.

---

## Mobile: tone down, don't scale down

Every animated site picks a fight with mobile, and the losing strategy is scaling desktop choreography onto a small screen — copy becomes unreadable inside imagery flying in every direction. My rule is that mobile gets *less* motion, not smaller motion. Reveals simplify, pins release earlier or dissolve entirely, and anything that competes with reading gets cut. A phone screen is already an intimate space; it doesn't need the tour to shout.

---

## What I'd do differently — and then did

Harland is the site I point to when someone asks what I can do with motion. It's also the site that taught me not to do all of it.

Wicked+ loved the animations, and they serve the brand — but not every component needs choreography, and smooth scroll is a real tax on users who came for information, not atmosphere. A luxury property site sells a lifestyle *and* holds listings; the person hunting for square footage shouldn't have to ride the tour to get there. Motion that delights on first visit can be friction on the third.

Ascaya, built directly after Harland, is that lesson shipped: hover states, a hero entrance, slide-out filters — and composure everywhere else. The two sites together are my range: I can build the spectacle, and I know when the braver choice is restraint.
