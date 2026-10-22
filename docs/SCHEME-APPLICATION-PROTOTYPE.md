# Scheme information and guided-application prototype

## Ownership and scope

- Platform manager: **BJP Keralam**.
- This phase is a demonstration prototype.
- No paid, production or official government API has been purchased or connected.
- The prototype must never describe a Vikasita Keralam record as a government application or government acknowledgement.

## Existing backend API audit

The supplied Swagger contract at `http://13.203.188.84:8000/docs` contains useful internal APIs for schemes, applications, documents, locations, users, volunteers, statistics and WhatsApp.

Relevant endpoints include:

- `GET /api/v1/schemes/`
- `GET /api/v1/schemes/{scheme_id}`
- `POST /api/v1/schemes/check-eligibility-form`
- `POST /api/v1/applications/`
- `GET /api/v1/applications/{application_id}`
- `POST /api/v1/applications/{application_id}/documents`
- `PUT /api/v1/applications/{application_id}/status`
- Location hierarchy and application/statistics endpoints.

The contract is an internal Vikasita Keralam backend. It does not provide evidence of myScheme synchronisation, ministry submission, official acknowledgement generation or government status polling.

### Current API limitations

- Eligibility checks only age, gender and community.
- Application creation requires Aadhaar and voter ID, which is unsuitable for a public prototype using real data.
- Available statuses are internal workflow statuses: Pending, In Review, Approved, Rejected and Completed.
- There is no official PDF-form generator, DigiLocker/eSign connector, government adapter or SahAI AI/voice endpoint.

## Implemented prototype experience

### Enhanced scheme information

Route: `/schemes/:id`

- Scheme summary, ministry and application-support mode.
- Benefit and initial eligibility cards.
- Scheme-specific document-readiness checklist.
- Four-stage application-assistance path.
- SahAI guidance and expected review time.
- A single site-wide demonstration disclaimer remains in the footer; the working pages avoid repetitive warnings.
- Direct entry to the guided-application flow.

Detailed prototype guidance is included for PM-KISAN, Ayushman Bharat PM-JAY, PM Ujjwala Yojana, PM Awas Yojana, MUDRA and PM Jeevan Jyoti Bima Yojana. Other catalogue entries use category-specific fallback guidance.

### Guided application assistance

Route: `/apply/:schemeId`

The flow contains four steps:

1. Contact details, mobile verification and preferred assistance channel.
2. Minimal application profile: age, income band and occupation.
3. Document-readiness checklist without uploads.
4. Review, applicant consent and assistance-request creation.

SahAI provides Malayalam or English voice guidance for every step. A user can replay instructions, turn voice guidance off, or switch to a physical helpdesk.

### Application-flow behaviour

- Mobile verification is included using controlled internal testing behaviour; the test value is not displayed or documented in the interface.
- The working page uses a compact header and form layout so the active step and SahAI panel fit together on a standard desktop viewport.
- Repetitive prototype, privacy and caution panels were removed from the application, scheme-details and eligibility pages.
- No request is sent to the supplied backend or any government system in this phase.
- Only the last four mobile digits are stored with the local assistance record.
- A local `VK-HELP-YYYY-XXXXXX` reference is generated after applicant consent.
- The footer remains the single site-wide demonstration disclaimer.

## Future integration boundary

Production adapters can later implement the same user experience for:

- authorised myScheme catalogue synchronisation;
- official scheme-specific submissions;
- assisted PDF generation and submission;
- government acknowledgement storage;
- official application-status webhooks or polling;
- secure document vault, malware scanning, encryption and retention controls;
- audited consent and role-based access.

Until an authorised adapter exists, the UI must keep the workflow in helpdesk-assistance mode and use an official-site handoff where required.
