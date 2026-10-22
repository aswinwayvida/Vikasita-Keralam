# Eligibility Checker and SahAI Guided Flow

## Purpose

The eligibility checker provides a Malayalam-first, elderly-friendly screening experience for the Central Government schemes currently represented in the prototype. It replaces the former three-field category filter with a structured, explainable questionnaire.

This is an initial screening tool. It must not represent a result as final approval; the responsible scheme authority makes the final eligibility decision.

## Entry modes

Both entry modes write to the same applicant profile and use the same deterministic rule engine.

1. **SahAI സംസാരിച്ച് പരിശോധിക്കാം** — voice-first questions, spoken prompts and large visual answer choices.
2. **Guided form** — the same questions without automatic voice prompts.

Applicants can switch modes without losing answers.

## Data collected

- Full name and OTP-verified mobile number
- Age, gender and marital status
- Kerala district and rural/urban/coastal residence
- Social category, minority status and disability status
- Approximate household-income band and ration-card category
- Occupation or current status
- Conditional farmer, student, worker, entrepreneur and maternity questions
- Bank-account availability, housing status, LPG connection and toilet access

The checker does **not** request an Aadhaar number, bank-account number or document upload.

Answers and the verified mobile identity are kept in browser `sessionStorage` only. OTP is required once per active browser session; subsequent scheme checks reuse the verified identity and previously supplied answers. Starting a new applicant check clears the stored profile and requires verification again.

## Conditional flow

- Farmer → agricultural land relationship
- Student → current education level
- Employee/unorganised worker → worker category
- Self-employed/entrepreneur → new or existing enterprise
- Adult woman → maternity-status question
- Person with disability → disability-percentage band

This keeps the questionnaire comprehensive without asking every applicant irrelevant questions.

## Scheme-specific checks and profile reuse

- A check opened from a scheme-detail page always requires full name and a verified mobile number.
- Each scheme has an explicit list of profile fields used by its current screening rules.
- The checker asks only unanswered fields that are relevant to the selected scheme.
- Answers already supplied during the same browser session are reused automatically.
- Returning applicants see their masked verified mobile number and a session-reuse notice.
- The result page evaluates only the selected scheme; the general eligibility entry continues to evaluate the broader scheme directory.
- OTP is requested again only after the applicant starts a new profile or the browser session ends.

## Focused scheme result

- A check opened for one selected scheme shows a direct bilingual outcome instead of the multi-scheme match dashboard.
- A strong match states that the applicant is initially eligible to apply and provides a direct application-assistance action.
- A failed match clearly states that the applicant is currently not eligible based on the submitted information and allows the answers to be edited.
- An uncertain match requests further verification and offers helpdesk assistance.
- Every positive or uncertain outcome states that final eligibility and approval remain with the responsible scheme authority.
- The common eligibility check retains the existing multi-scheme result view.
## Matching model

Each represented scheme has structured criteria. A criterion returns one of three states:

- `met`
- `failed`
- `unknown`

The scheme result is classified as:

- **Strong match**: no failed or unknown criteria
- **Verification required**: no failed criteria, but one or more criteria are unknown
- **Not matched**: one or more criteria conflict with the current profile

Results show the matched reasons, pending verification items, commonly required documents, scheme details and an application-helpdesk action.

## SahAI responsibilities

SahAI is the conversational layer, not the eligibility decision-maker.

1. Speak the current question in Malayalam or English.
2. Listen only after the applicant presses the microphone.
3. Convert a recognised answer into the same structured value used by the form.
4. Ask the next conditional question.
5. Read the result summary and guide the applicant to helpdesk support.

If voice recognition is unavailable or uncertain, the applicant can always use the large visual choices.

## Current limitations

- Browser speech recognition and Malayalam accuracy vary by browser and operating system.
- Scheme rules in this prototype are screening rules and require formal validation against current ministry notifications before production use.
- Document lists are indicative and must be maintained with the corresponding scheme rule.
- No application is submitted from the eligibility checker itself.

## Production hardening checklist

- Validate every criterion with the authoritative ministry notification and record source URL, version and last-reviewed date.
- Add automated test profiles for every strong, possible and rejected rule path.
- Replace browser-dependent speech recognition with an approved Malayalam ASR/TTS service where required.
- Add explicit consent, retention and deletion controls before any server-side profile storage.
- Connect the selected scheme and eligibility summary to the helpdesk case, without transmitting sensitive data unnecessarily.
