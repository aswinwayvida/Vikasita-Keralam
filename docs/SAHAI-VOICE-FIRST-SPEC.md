# SahAI — Voice-First Assistant Specification

**Prepared:** 3 August 2026

**Status:** Local interaction prototype; awaiting approval before Git commit or push

## Brand decision

- Display name: **SahAI**
- The name is always written in English, including when the interface language is Malayalam.
- Malayalam remains SahAI's primary conversation language.
- SahAI identifies itself as an AI assistant and does not imply that it is a human operator.

## Intended experience

SahAI is designed for ordinary and elderly applicants who may find typing difficult. Voice is therefore the primary input and output; keyboard input remains an optional fallback.

The assistant should feel patient, respectful and familiar without using manipulative language or pretending to have human emotions.

## Local prototype behaviour

- Separate circular press-to-talk microphone control with a slow idle pulse, stronger listening pulse and animated listening bars.
- SahAI avatar display crops the outer kasavu detailing, retains the inner gold circle and enlarges the digital-guide face for visibility at 40–48 px; no element sits on or overlaps the face.
- Microphone access is requested only after the applicant taps the microphone.
- No camera access is requested by SahAI.
- Malayalam speech recognition uses the `ml-IN` browser locale.
- Spoken replies are enabled by default through browser speech synthesis.
- Applicants can disable spoken replies.
- Applicants can reveal or hide keyboard input at any time.
- Quick actions cover scheme discovery, application help, application status, volunteering and PM-KISAN.
- Janashabdam and public-issue prompts have been removed from the Phase 1 assistant.

## Eligibility conversation prototype

SahAI asks one question at a time:

1. Preferred name
2. Age
3. District
4. Occupation
5. Approximate household annual income

It then presents a small set of schemes for further checking. Every suggestion is explicitly described as preliminary, not a final eligibility decision. Document and rule validation must occur before an application is submitted.

## Assisted application target journey

The production journey should:

1. Confirm the selected scheme.
2. Explain why each requested detail is required.
3. Collect only the minimum information necessary.
4. Read important captured values back for confirmation.
5. Mask Aadhaar, identity and account numbers on screen and in spoken confirmations.
6. Check required documents and validation rules.
7. Show and read an application summary.
8. Obtain explicit confirmation before submission.
9. Return a receipt/reference number and explain the next step.
10. Allow a helpdesk or authorised volunteer to take over when SahAI cannot proceed safely.

## Privacy and production requirements

- Raw voice recording should not be stored by default.
- The current browser speech APIs are suitable for interaction prototyping, not the final production architecture.
- Production speech recognition, text-to-speech and language-model services require an approved vendor, consent flow, retention policy, security review and Malayalam quality testing.
- Sensitive documents must use secure upload, encryption, access control, audit logging and masking.
- SahAI must never claim final eligibility when authoritative rules or required records have not been verified.

## Current limitation

The scheme suggestions and responses in this local version are demonstrative. They are based on simple prototype logic and the current local scheme dataset. No real government API, production eligibility engine, form-submission API or application-tracking service is connected yet.
