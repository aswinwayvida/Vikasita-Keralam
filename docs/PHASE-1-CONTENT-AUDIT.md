# Vikasita Keralam — Phase 1 Content Audit

**Audit date:** 3 August 2026

**Decision:** Phase 1 is limited to Central Government scheme discovery, eligibility guidance, helpdesk-assisted applications, applicant support, and volunteer participation.

## Phase 1 content retained

### Public portal

- Home page focused on finding schemes and getting application assistance
- Eligibility checker
- Helpdesk and assisted application journey
- Scheme catalogue, featured schemes, and scheme details
- Volunteer information and registration
- Contact information
- Malayalam and English language controls
- SahAI voice assistant where it supports scheme discovery and application guidance

### Administration

- Application dashboard and application management
- Scheme management
- Volunteer management
- Growth and organisational reporting
- WhatsApp/outreach tools
- Copilot and settings

## Content hidden for Phase 1

### Public portal

- Janashabdam links in the desktop/mobile header and footer
- Public issue-tracking navigation
- Raise an Issue calls to action
- Janashabdam and issue-tracking service pillars on the home page
- Issue and resolved-issue statistics
- Citizen Voices content block
- Janashabdam Success Stories content block
- Direct Janashabdam routes; these now redirect to the home page

### Administration

- Public Pulse sidebar entry and dashboard
- Issue Management sidebar entry and dashboard
- Open-issue and resolved-issue KPI cards
- Issue series in the dashboard activity chart
- District issue leaderboard
- Recent issue activity
- Direct `/admin/issues` and `/admin/public-pulse` access; these now redirect to `/admin`

## Content changes made during cleanup

- Reframed home-page hero text and calls to action around schemes and helpdesk support.
- Reduced the home-page service presentation to scheme/eligibility/helpdesk and volunteer information.
- Replaced the internal-facing Current Phase label with a localized, public-facing services label.
- Simplified public statistics to remove issue-reporting metrics.
- Rebuilt the public impact strip as three equal, centred columns as refined elevated cards across the hero-to-content transition so hidden Janashabdam metrics do not leave empty space or a background-colour seam.
- Increased logo legibility while keeping the public header compact, and added scroll-aware header hiding to maximise page-content visibility.
- Changed the admin trend chart to show applications only while Janashabdam is disabled.
- Added the same feature control to public and admin Janashabdam entry points.
- Stored the original Lovable logo and hero assets inside the repository so the local, GitHub, and published builds use the same files.

## Implementation note

`src/config/features.ts` is the single control point. `FEATURES.janashabdam` is currently `false`.

Janashabdam routes, components, translations, and mock data remain in the source code but are not available through the Phase 1 user interface. This is intentional, keeps the change reversible, and avoids deleting work that may be reviewed for a later phase.

Some helpdesk and volunteer forms reuse generic district, panchayat, ward, name, phone, and location labels stored under `t.janashabdam.form`. These are shared translation keys only; they do not expose the Janashabdam service.

## Re-enabling in a future phase

1. Set `FEATURES.janashabdam` to `true`.
2. Review the public and admin issue workflows, data model, permissions, privacy, and document-security controls.
3. Build and test every Janashabdam route before publishing.

## Validation checklist

| Area                            | Expected Phase 1 result                                                  |
| ------------------------------- | ------------------------------------------------------------------------ |
| `/`                             | No Janashabdam, Raise an Issue, Citizen Voices, or issue-success content |
| `/eligibility`                  | Eligibility journey remains available                                    |
| `/helpdesk`                     | Helpdesk journey remains available                                       |
| `/volunteer`                    | Volunteer information and registration remain available                  |
| `/janashabdam` and child routes | Redirect to `/`                                                          |
| `/admin`                        | Application-focused dashboard without issue widgets                      |
| `/admin/issues`                 | Redirect to `/admin`                                                     |
| `/admin/public-pulse`           | Redirect to `/admin`                                                     |

## Publishing workflow

1. Develop and test locally.
2. Run the production build.
3. Commit and push to GitHub `main`.
4. Allow Lovable to sync the GitHub change.
5. Publish manually in Lovable.
6. Validate the external published URL. Lovable's embedded editor preview is not used as the final acceptance check because it has previously failed to load styles while the published site remained correct.

## Deferred from this cleanup

This audit records content visibility only. Dependency-security remediation, production API integrations, automated scheme updates, direct application submission, full application-status tracking, and the production Malayalam AI agent remain separate implementation workstreams.
## Responsive layout hardening - 2026-08-04

- Constrained the shared public layout, page root and media elements to the available viewport width.
- Moved the full desktop header navigation from the 1024 px breakpoint to 1280 px to prevent the logo, menu and actions from competing for space.
- Added a compact mobile/tablet header logo and a stacked mobile action area.
- Reduced narrow-screen hero heading sizes and allowed long Malayalam CTA labels to wrap.
- Made the schemes search action full-width on small screens and allowed the eligibility toolbar to wrap.
- Constrained the SahAI panel to the viewport and enabled safe wrapping for long conversation content.
- Verified the homepage, schemes, eligibility, helpdesk, volunteer and contact routes with zero document-level horizontal overflow in the desktop preview.
- Capped the desktop homepage hero creative by both column width and viewport height, tightened its vertical spacing, balanced the desktop side gutters, right-aligned the creative, overlaid the carousel controls, and reduced the stats overlap depth so the complete image remains visible without covering the first slide CTA on short or zoomed browser windows.
