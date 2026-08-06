# BuildTable — "Featured Sites I've Built"
*Reverse chronological. Stack column renders `cms` + `framework` fields together. Open questions at the bottom before this goes into the CPT.*

| Year | Site | Role | Stack | Notes |
|---|---|---|---|---|
| 2026 | Ascaya ✦ | Build | Headless WP · Next.js · GSAP | Luxury community, Las Vegas · case study |
| 2026 | Palette Town | Design + build + ops | Headless Shopify · Next.js · GSAP | My own shop · case study |
| 2026 | Italic | Design + build | WP custom theme · GSAP | Luxury quartz surfaces |
| 2026 | Treasure Island SF ✦ | Build | Headless WP · Next.js · GSAP | Waterfront hotel, San Francisco |
| 2026 | The Sun Rose Residences ✦ | Build | WP custom theme · GSAP | Residences landing, West Hollywood |
| 2025 | Harland West Hollywood ✦ | Build | Headless WP · Next.js · GSAP | Luxury residences, LA · case study |
| 2025 | Taos Ski Valley ✦ | Build | WP custom theme · GSAP | Event signup |
| 2024 | Montage Residences ✦ | Build | WP custom theme | Landing page |
| 2022–24 | Secret Bay ✦ | Build | WordPress | Luxury resort, Dominica · ongoing |
| 2023–24 | Uptempo | Design | — | Marketing performance platform · full web design |
| 2023 | Orli La Jolla ✦ | Build | WP custom theme | Boutique hotel, San Diego |
| 2023 | Samesurf | Design + build | Headless WP · Gatsby | B2B cobrowsing · related case study |
| 2023 | The Famous Group | Design + build | WP custom theme | Experiential creative studio |
| 2022 | The Fileist | Build | WordPress (ecommerce) | Shopify-to-WordPress migration · design by Milk & Butter |
| 2022 | Makkabi Law Group | Design + build | WP custom theme | Law firm |
| 2022 | Beeya Wellness | Design | — | Ecommerce site design |
| 2022 | Adamson Ahdoot | Design + build | WP custom theme | Law firm |
| 2022 | Maravilla Los Cabos ✦ | Build | WP custom theme | Resort residences |
| 2021 | FitOn | Design | — | Landing page |
| 2019 | TerraTrue | Design + build | Headless WP · Gatsby | My first headless build |
| 2019 | So Yummy | Design + build | WP custom theme | Viral food content brand for millennial women |
| 2019 | ATTN: | Design + build | HTML mobile sites | Microsites for Redbox + TV premieres, design for Toms |
| 2018 | Comparably | Design | — | In-house product + email design |
| 2017 | Collide | Design + build | — | Live-streaming startup for celebrities + creators · product, marketing, web |
| 2016 | TigerText | Design + build | WP custom theme | HIPAA-compliant messaging for healthcare (now TigerConnect) |
| 2015 | Cindy Crawford ★ | Design + build | WP custom theme | Cindy's personal website |
| 2015 | The Haute Mess ★ | Design + build | WP custom theme | Ashley Tisdale's editorial site |
| 2015 | Whohaha ★ | Design | — | Comedy platform by Elizabeth Banks |
| 2015 | Skinnygirl ★ | Design + build | WP custom theme | Product locator, North America |
| 2015 | Schwarzkopf ★ | Design + build | WP custom theme | Social contest signup |
| 2015 | Paramount Pictures ★ | Design + build | Tumblr | Campaign sites: TMNT, The DUFF, The Last Five Years |

*Footnotes rendered under the table:*
*"Every build includes the content modeling: custom post types, field architecture (ACF), and the editor experience."*
*"✦ via [Wicked+](link), my agency partner of 8+ years."*
*"★ in-house at Digital Media Management." (Match glyph + color between table rows and legend per agency; legend styling: "Milk & Butter" with ampersand per their brand.)*

---

## Held off the table (for now)
- **Music-for-business client** — done 8 months ago but unlaunched. Recommendation: add the row when it goes live; an unlinked, unlaunched site for a nameable client is an awkward credit until then.
- **Pre-2021 Wicked+ moonlighting** — still unitemized; any nameable site from that era can slot in whenever. The day-job era is now itemized as employer rows (2015–2019), so the table's timeline is complete back to 2015.

## Open questions
None. Table is locked.

## Resolved
- TMNT confirmed (was typed TMNJ); Whohaha marked design-only within the DMM row
- Uptempo restored (the design work earns it), note rewritten per the Notes rule. 31 rows; FitOn is the cut if a trim is ever wanted.
- Section header: FEATURED SITES I'VE BUILT (30+) — evergreen chip, no sync needed with row count
- TerraTrue headless build: 2019 (7 years of headless lineage, predating the hype cycle)
- Secret Bay: Dominica, confirmed
- Ascaya month: case study softened to "spring 2026"; table shows year only
- Treasure Island SF: headless WP · Next.js, confirmed
- Design-only rows: stack stays blank ("—"), role column carries "Design"

## Field notes
- Day-job rows (2016–2019) put the employer in the Site column with representative work in Notes, same pattern as Uptempo. The DMM era (2015) itemizes per site instead, with the ★ marker + legend carrying the employer credit, since those site names earn their own rows. A `row_type` select (site / employer) lets the front end style them subtly differently if wanted.
- `via` fields on the CPT: `via_name` (text) + `via_url` (url). Renders as the ✦ marker + one linked legend line under the table, not per-row text. The Fileist keeps its in-row Milk & Butter note since the fact there is design credit, not sourcing.
- `role` select values, final: Design · Build · Design + build, with "+ ops" as the only suffix (Palette Town). GSAP moved to the Stack column as a `motion` boolean rendering "· GSAP" since it's a technology, not a role. Field architecture is covered by the table footnote since it applies to every build.
- `featured_on_home`: suggest Ascaya, Palette Town, Italic, Harland, Treasure Island, Samesurf, The Famous Group, Montage or Secret Bay — a ~8-row homepage cut skewing recent + recognizable. Full table lives on the Work index.
