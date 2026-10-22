# Helpdesk Locator Implementation

## Status

Implemented for local preview. This change has not been committed or pushed.

## Source and data snapshot

- Reference page: `https://www.vikasitakeralam.com/auth/helpdesk-locator`
- Reviewed on: 2026-08-03
- Locations captured: 30
- Districts represented: 14
- Phone contacts captured: 59

This is a prototype data snapshot. The operations team must verify office names, addresses and phone numbers before production release. The data should later move to an admin-managed source or API so updates do not require a code deployment.

## User-facing changes

1. Removed the request form and token-style submission flow from the Helpdesk menu page.
2. Added a searchable directory of helpdesk offices.
3. Added a district filter covering all Kerala districts.
4. Each location card now provides:
   - office name and district;
   - full address;
   - direct call actions for every listed phone number;
   - copy-address action;
   - Google Maps directions action.
5. Results show a visible match count and advise users to confirm timing by phone before visiting.
6. Malayalam remains the default interface, with equivalent English labels through the existing language switch.

## SahAI locator mode

The approved SahAI call-to-action opens the existing assistant in a dedicated helpdesk-locator mode.

- SahAI asks only for a district or place.
- Typed or spoken place names use the same verified location dataset as the directory.
- Up to three matching helpdesks are returned inside the assistant.
- Each result includes direct call and directions actions.
- The locator conversation is intentionally restricted to location discovery and does not request Aadhaar, documents or other sensitive information.
- The privacy rule remains an internal interaction constraint and is not repeated across the interface.

## Implementation files

- `src/data/helpdesk-locations.ts`: typed location records, district list and matching helpers.
- `src/routes/helpdesk.tsx`: directory page, search, filters and location cards.
- `src/components/public/SahAI.tsx`: locator event, conversation mode and result cards.

## Validation completed

- Production build completed successfully.
- Desktop directory loads all 30 offices.
- Free-text search for `Kozhikode` returns the three Kozhikode offices.
- SahAI typed search for `Thodupuzha` returns Idukki North with both phone numbers and directions.
- Mobile layout was checked at 390 x 844 px; search controls and cards stack correctly.
- Approved SahAI branding and voice-first prompt remain in place.

## Next production steps

1. Verify the snapshot against the official organisation-maintained contact list.
2. Add an admin workflow with edit history and approval for location changes.
3. Add latitude and longitude values for precise distance-based ranking.
4. Connect voice transcription and text-to-speech services after privacy, consent and Malayalam quality review.
5. Add analytics for searches that return no match so aliases can be improved safely.

## Interface refinement - 2026-08-04

- Shortened the page heading while retaining the full service explanation below it.
- Reduced SahAI to one contextual reference on the Helpdesk page; the global floating trigger is hidden on this route only.
- Changed the contextual action label to a direct speaking action instead of repeating the SahAI name.
- Reordered the desktop controls to show the district selector on the left and the wider search field on the right.
- Mobile controls stack with district first and search second.

## Locator panel refinement - 2026-08-04

- Expanded the effective SahAI conversation area in locator mode.
- Hidden the unrelated eligibility shortcut, generic quick prompts and repeated microphone notice while locating a helpdesk.
- Reduced the locator microphone control and footer height while retaining voice and typing controls.
- Constrained the district/search panel to a balanced 896 px maximum width; the district selector remains left and search remains right.

## Global SahAI panel refinement - 2026-08-04

- Applied the compact voice footer to SahAI on every public route, not only the helpdesk locator.
- Moved eligibility and quick-prompt shortcuts into the scrollable conversation area.
- Starter shortcuts automatically leave the visible flow once a conversation begins.
- A persistent **മെനു / Topics** control reopens those shortcuts at any time without clearing the conversation.
- Removed the repeated microphone/privacy notice from the fixed panel area.
- Preserved voice input, typed input, voice-reply controls and eligibility navigation.
