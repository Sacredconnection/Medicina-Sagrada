# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing Next.js App Router application with TypeScript, WordPress REST API content, and WooCommerce Store API commerce data.

## Users

The primary audience is people looking for Indigenous medicines and Amazonian Indigenous crafts, including ayahuasca practitioners, spiritual seekers, and universalists.

## Product Purpose

Medicina Sagrada is a digital storefront and editorial experience for discovering and purchasing Indigenous medicines and crafts. It offers products such as rapé, sananga, and Amazonian Indigenous crafts while connecting the customer's purchase with support for the forest peoples who produce them.

Success means helping the right visitors find trustworthy products, understand their origin and meaning, and purchase with confidence that the relationship with the Indigenous communities is being respected and supported.

## Positioning

The declared position is to offer original Indigenous medicines sourced directly from ten ethnic groups, with competitive prices and high quality, while making the social connection to the peoples of the forest explicit to the customer.

The number of ethnic groups, sourcing claims, quality claims, pricing claims, and their public proof remain to be documented before they are treated as verified evidence in the interface.

## Operating Context

Visitors may arrive with an interest in spiritual practice, Indigenous knowledge, traditional medicines, or Amazonian craft. The site must support discovery, product evaluation, learning about origin, and purchase through the existing WordPress/WooCommerce ecosystem.

## Capabilities and Constraints

- Preserve the existing Next.js frontend as the technical base.
- Preserve public URL structures and the current WordPress/WooCommerce integration unless a later decision explicitly changes them.
- Support editorial content from WordPress and public catalog data from WooCommerce.
- The initial product scope includes rapé, sananga, Indigenous medicines, and Amazonian Indigenous crafts.
- Legal, age, health-claim, shipping, geographic-sales, consent, and community-representation requirements are not yet fully specified and must be confirmed before launch.
- Exact information about the ten ethnic groups, sourcing relationships, revenue/support model, and evidence of origin is still an open product decision.

## Brand Commitments

- The product name is Medicina Sagrada.
- The experience must communicate respect for Indigenous peoples, traditional knowledge, and the forest communities represented by the products.
- Product origin and the relationship with the producing communities should be understandable to customers rather than hidden behind generic commerce language.

## Ethnicity Color System

The following stakeholder-provided colors are the canonical visual accents for each ethnicity represented in the interface:

| Ethnicity | Accent color | Text on accent |
| --- | --- | --- |
| Apurinã | `#83bc43` | Black `#000000` |
| Caboclo | `#997052` | Black `#000000` |
| Huni Kuin | `#bfa771` | Black `#000000` |
| Katukina | `#79bc43` | Black `#000000` |
| Kuntanawa | `#606161` | White `#ffffff` |
| Nukini | `#dc9c41` | Black `#000000` |
| Puyanawa | `#ba9b80` | Black `#000000` |
| Shanenawa | `#0568a7` | White `#ffffff` |
| Shawãdawa | `#ec2326` | Black `#000000` |
| Yawanawá | `#2f2f2a` | White `#ffffff` |

Usage contract:

- Whenever an interface element explicitly represents one ethnicity, its corresponding color should stand out as the contextual accent for that element.
- Use the exact hexadecimal value consistently; do not approximate, exchange, or automatically derive replacements.
- The ethnicity accent complements the global Medicina Sagrada palette. It does not replace the site's primary brand colors or need to fill the entire component.
- Suitable applications include category indicators, filters, labels, badges, dividers, selected states, restrained backgrounds, and other contextual highlights.
- In the desktop “Rapé do mês” card, the product-information surface must use the accent assigned to the product's explicitly identified ethnicity and update whenever the featured product changes.
- On surfaces containing multiple ethnicities, apply each accent only to the content associated with that ethnicity.
- Do not infer an ethnicity from unstructured product copy when the catalog data does not identify it explicitly.
- Use the documented black or white foreground whenever text appears directly on an ethnicity accent. Each pair selects the higher-contrast neutral and passes WCAG AA for normal text.
- These colors are stakeholder-defined visual associations for this project and must not be presented as official cultural symbolism unless that status is separately verified.

## Evidence on Hand

- Existing frontend code in this project, including the home, catalog, product, editorial, diagnostic, and SEO routes.
- Existing WordPress and WooCommerce integration code.
- Existing Medicina Sagrada logo asset at `public/assets/logo/medicina-sagrada-logo-01.svg`.
- The product and sourcing statements above are stakeholder-provided positioning, not independently verified evidence yet.

## Product Principles

- Make origin and relationship visible.
- Treat Indigenous knowledge and representation with respect.
- Help visitors choose with clarity and confidence.
- Connect commerce with tangible support for the peoples of the forest.
- Preserve trustworthy content and technical continuity while the visual experience is rebuilt.

## Accessibility & Inclusion

No product-specific accessibility standard or audience accommodation has been confirmed yet. The site should retain baseline web accessibility and this section should be updated when the relevant user needs and launch requirements are defined.
