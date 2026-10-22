# Schemes Directory — Local Preview Record

**Prepared:** 3 August 2026

**Status:** Local preview only; awaiting approval before Git commit or push

## Objective

Add a dedicated public Schemes menu and catalogue while preserving the existing Vikasita Keralam structure, Malayalam-first experience, colours, typography, helpdesk journey, and volunteer journey.

## Reference reviewed

The current [myScheme](https://www.myscheme.gov.in/) experience was reviewed for discovery patterns, particularly:

- prominent scheme-name search;
- category-based browsing;
- clear movement from discovery to eligibility and application guidance;
- citizen-focused hero imagery representing different beneficiary groups.

The Vikasita Keralam implementation uses these patterns as product-design reference only. The layout, wording, cards, visual composition, and code are original to this project. No myScheme hero artwork has been copied into the repository.

## Local changes

- Added **Schemes** after **Home** and before **Eligibility** in desktop and mobile navigation.
- Added Schemes to footer quick links.
- Added `/schemes` as a bilingual public catalogue.
- Added search across scheme name, ministry, benefit, and eligibility text.
- Added eight category filters:
  - Agriculture
  - Women & Child
  - Health
  - Education
  - Housing
  - Skills & Employment
  - Social Welfare
  - Business & MSME
- Added result counts and empty-search recovery.
- Added benefit and eligibility summaries to each scheme card.
- Connected cards to the existing scheme-detail pages and helpdesk.
- Changed the home-page Featured Schemes “View all” action to `/schemes`.
- Changed the scheme-focused home hero action to open `/schemes`.
- Added an original scheme-search and category-chip overlay to the existing scheme hero image, inspired by myScheme’s discovery-first banner approach.

## Slider image update

- Kept the first Modi–Rajeev Chandrasekhar slide unchanged.
- Replaced the scheme slide image with an original scene of an elderly Kerala couple receiving assisted application support at a digital helpdesk.
- Replaced the volunteer slide image with an original ward-level help-camp scene where Kerala volunteers guide an elderly woman and a working citizen.
- Both generated images avoid readable identity documents, Aadhaar cards, copied government artwork, logos, and embedded text.
- Previous slider assets remain in the repository for rollback; the new files use versioned `-v2` filenames.

## Current data scope

The preview lists the 18 schemes currently stored in `src/data/schemes.ts`. This is local seed data, not a complete or automatically updated government scheme catalogue.

Before production rollout, scheme information must be validated against authoritative Central Government sources and connected to an approved update process or official API where available.

## Local validation completed

- Production build passes.
- `/schemes` loads all 18 current records.
- Navigation order is Home → Schemes → Eligibility → Helpdesk → Volunteer → Contact.
- Agriculture filter returns two current records.
- Searching for “Kisan” within Agriculture returns PM-KISAN.
- No horizontal overflow was detected in the current preview viewport.
- No commit or GitHub/Lovable push has been made for this feature.
