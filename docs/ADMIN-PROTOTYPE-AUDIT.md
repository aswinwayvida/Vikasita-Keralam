# Vikasita Keralam Admin Prototype — Audit and Design Record

## Scope and method

The existing production administration system was reviewed in read-only mode. The review covered public frontend assets, the published API specification, the authenticated administrator role and aggregate dashboard statistics. No production record was created, edited, downloaded or deleted. Citizen values were not copied into the prototype.

## Existing platform: useful elements retained

- Collapsible left navigation with a fixed working header.
- Administrator and staff role separation.
- Dedicated scheme and application modules.
- Kerala hierarchy covering district, mandal, local body and ward.
- Application status update workflow.
- Volunteer and phone-role administration.
- Aggregate application and scheme statistics.
- Malayalam/English language support.

## Critical operational gaps observed

1. The administration model is primarily a set of lists and edit screens, not a prioritised work queue.
2. At the time of review, all 409 applications were represented by one `PENDING` state. This does not explain assignment, verification, submission or follow-up progress.
3. Sensitive fields exist in the application model, including Aadhaar and voter identifiers, while a dedicated masking and document-access policy is not evident in the current admin navigation.
4. Applications can be filtered by location, date, status and ID, but there are no visible saved views, assignment filters, aging indicators or SLA controls.
5. Scheme management is manual CRUD. Source freshness, official-source evidence, rule versioning and sync review are not first-class workflows.
6. Location administration is split into multiple separate list pages, increasing navigation effort.
7. Application processing, status updates and miscellaneous entries overlap conceptually.
8. Destructive delete operations exist in the API for applications, schemes, locations and uploaded documents. Routine admin UI should prefer archive/deactivate and audited recovery.
9. No explicit integration-health, API availability or external-portal follow-up dashboard is evident.
10. No dedicated notification centre, document access log, consent indicator or exception queue is evident.

## Prototype information architecture

### Command centre

- Operational overview
- Priority actions
- Application pipeline
- Integration health

### Operations

- Application work queue
- Scheme operations
- Helpdesk network
- Volunteers

### Communication

- Citizen updates

### Governance

- Access and audit

## Prototype decisions

- Replace a passive application table with a searchable, filterable work queue.
- Use clear stages: New, Document check, Ready to submit, External follow-up and Completed.
- Display queue age, assignment and next action directly in the list.
- Mask mobile numbers and identity identifiers by default.
- Treat document opening as an audited action.
- Show scheme application paths explicitly: in-platform, API-assisted, guided PDF or external portal.
- Track scheme source, last verification and review status.
- Consolidate helpdesk coverage, contacts and workload in one network screen.
- Keep SahAI out of the core admin navigation; AI assistance should be contextual and optional.
- Avoid destructive primary actions. Archive/deactivate workflows should be used when backend implementation begins.
- Require a dedicated administrator login before any admin route is rendered.
- Use an expiring browser session and provide an explicit sign-out action for the prototype.

## Authentication note

The current login is a client-side prototype gate using an eight-hour local browser session. It is suitable only for demonstration and interface review. Before deployment with real data, authentication must move to the backend with secure password hashing, rate limiting, server-issued sessions or tokens, role enforcement, session revocation and audit logging.

## Prototype data note

The UI uses local mock records for interactions. The production totals observed during the audit are used only as aggregate reference values. The prototype does not connect to production data.

## Recommended next implementation phase

1. Agree the final application lifecycle and role ownership matrix.
2. Add application detail history, assignment and status transition validation.
3. Define secure document storage, masking, retention and access-log requirements.
4. Add scheme-source adapters and a verification queue.
5. Add helpdesk availability, workload and escalation rules.
6. Replace prototype authentication with backend-enforced role-based access.
7. Connect approved prototype screens to a separate staging API and anonymised test data.
