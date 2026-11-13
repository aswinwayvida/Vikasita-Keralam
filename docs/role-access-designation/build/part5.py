"""User stories, acceptance criteria, risks, gaps, recommendations, decisions, appendix."""

from reportlab.platypus import PageBreak, Spacer, Paragraph
from common import *


def user_stories():
    s = []
    s += h1("16", "User Stories")
    s.append(P("Stories are written from the perspective of the actor who performs the work, not the developer. Priority follows MoSCoW."))
    s.append(table([
        ["ID", "Story", "Priority"],
        ["US-01", "As a state administrator, I want to create a role with a clear name and an explicit set of module permissions, so that I can delegate a defined job without granting everything.", "Must"],
        ["US-02", "As a state administrator, I want to edit an existing role and see how many users it affects, so that I understand the blast radius before I save.", "Must"],
        ["US-03", "As a state administrator, I want dependent permissions to be added and removed together, so that I cannot create a role that can edit but not view.", "Must"],
        ["US-04", "As a state administrator, I want to deny a module to a role, so that a functionary cannot open a screen that is not part of their job.", "Must"],
        ["US-05", "As a state administrator, I want to restrict a role to records below the holder\u2019s level, so that a district office does not see another district\u2019s work.", "Must"],
        ["US-06", "As a state administrator, I want to create a designation at a specific organisation level, so that the post appears only where it belongs.", "Must"],
        ["US-07", "As a state administrator, I want the designation list to filter by the level I selected, so that I cannot pair a booth post with a state user.", "Must"],
        ["US-08", "As a state administrator, I want to assign one role to a user and change it later, so that a transfer does not require recreating the account.", "Must"],
        ["US-09", "As a regional administrator, I want to move a user from one mandalam to another while keeping their role and designation, so that reorganisation does not break their access.", "Should"],
        ["US-10", "As a state administrator, I want to revoke access immediately, so that a departing functionary cannot use a signed-in session.", "Must"],
        ["US-11", "As a security reviewer, I want every unauthorised attempt to be refused by the server and recorded, so that I can investigate and prove compliance.", "Must"],
        ["US-12", "As a district administrator, I want to create a role that uses only permissions I already hold, so that I cannot escalate myself or others.", "Should"],
        ["US-13", "As an auditor, I want a history of who changed which permission and when, so that access decisions are accountable.", "Should"],
    ], [42, 376, 63]))
    return s


def acceptance():
    s = []
    s += h1("17", "Acceptance Criteria")
    s.append(P("Each criterion is testable as written. The final column records whether the current code satisfies it, which determines whether the item is a regression test or new work."))
    rows = [["ID", "Given / When / Then", "Met today?"]]
    acs = [
        ("AC-01", "<b>Designation filtering.</b> Given the actor selects an organisation level, when the designation list opens, then only active designations associated with that level are offered.", "Yes"),
        ("AC-02", "<b>Module permission.</b> Given a user lacks view permission on a module, when they attempt to reach its route directly, then the request is refused and no data is returned.", "No"),
        ("AC-03", "<b>Data scope.</b> Given a user holds own-records scope only, when a list is requested, then only records owned by or assigned to that user are returned.", "No"),
        ("AC-04", "<b>Role permission update.</b> Given an authorised administrator changes a role, when the change is saved, then holders are subject to the new permissions on their next request.", "No: cached session"),
        ("AC-05", "<b>Duplicate role.</b> Given a role named District Coordinator exists, when an administrator saves a role named district coordinator, then the save is rejected and the existing role is untouched.", "Yes"),
        ("AC-06", "<b>Minimum content.</b> Given a role with no assignment level or no permission, when the administrator saves, then the save is blocked with a field-level message.", "Yes"),
        ("AC-07", "<b>Prerequisite cascade.</b> Given edit is granted without view, when the grant is applied, then view is added automatically.", "Yes"),
        ("AC-08", "<b>Prerequisite removal.</b> Given view is revoked while edit is held, when the revocation is applied, then edit and every transitive dependent are removed.", "Yes"),
        ("AC-09", "<b>Designation level guard.</b> Given a booth designation is injected into a state user form, when the form is saved, then the save is rejected with an explicit message.", "Yes"),
        ("AC-10", "<b>Level change.</b> Given a designation has been selected, when the organisation level changes, then the designation selection is cleared.", "Yes"),
        ("AC-11", "<b>Duplicate designation.</b> Given a designation named Treasurer exists at Mandalam, when another Treasurer is created at Mandalam, then the save is rejected.", "No"),
        ("AC-12", "<b>Delete with holders.</b> Given three users hold a designation, when the designation is deleted, then the delete is blocked or the holders are reassigned first.", "No"),
        ("AC-13", "<b>Disabled designation.</b> Given a designation is disabled, when a user form is opened, then the designation is not offered but existing holders are unaffected.", "Yes"),
        ("AC-14", "<b>Privilege escalation.</b> Given a district administrator holds only applications view, when they attempt to grant applications delete, then the grant is refused.", "No"),
        ("AC-15", "<b>Revocation.</b> Given a role is removed from a user, when that user next requests a protected screen, then access is refused without waiting for session expiry.", "No"),
        ("AC-16", "<b>Default deny.</b> Given no scope is configured for a module, when a record is requested, then access is denied rather than allowed.", "No"),
        ("AC-17", "<b>Above-level scope.</b> Given above-level is not an available scope, when an administrator reviews the scope controls, then the scope does not appear as a selectable option.", "Yes"),
        ("AC-18", "<b>Location persistence.</b> Given an administrator adds an area in the location master, when the page is reloaded, then the area is still present.", "No"),
        ("AC-19", "<b>Audit.</b> Given any role or designation change, when the change succeeds, then an immutable audit record exists with actor, target, before and after.", "No"),
        ("AC-20", "<b>Session expiry.</b> Given a session older than eight hours, when any admin route is opened, then the user is redirected to sign in.", "Yes"),
    ]
    for code, text, met in acs:
        rows.append([code, text, met])
    s.append(table(rows, [40, 366, 75]))
    return s


def risks():
    s = []
    s += h1("18", "Risks and Dependencies")
    s.append(table([
        ["ID", "Risk", "Likelihood", "Impact", "Mitigation"],
        ["R-01", "Privilege escalation: a delegated administrator grants permissions beyond their own", "High", "High", "Server-side delegation ceiling evaluated against the actor\u2019s own grants"],
        ["R-02", "Designation-derived roles grant unplanned permissions", "High", "High", "Remove automatic role synthesis; require explicit role assignment"],
        ["R-03", "Over-broad peer visibility exposes other districts", "Medium", "High", "Define peers as same unit, not same level, pending approval"],
        ["R-04", "Cross-district data leakage through lists or exports", "High", "High", "Row-level filtering at query time; export goes through the same filter"],
        ["R-05", "UI and backend enforcement diverge", "High", "High", "Single policy module evaluated server-side; UI consumes the same decision"],
        ["R-06", "Stale permissions after a role edit", "High", "Medium", "Stateless evaluation per request; no permission cache in the session"],
        ["R-07", "Users remain attached to deleted or disabled designations", "Medium", "Medium", "Dependency check before delete; reassignment workflow on disable"],
        ["R-08", "Missing audit makes investigation impossible", "High", "High", "Immutable append-only audit store with actor, target and diff"],
        ["R-09", "Incomplete hierarchy prevents scope calculation", "High", "High", "Publish mandalam, area and booth masters with stable identifiers"],
        ["R-10", "Two level vocabularies cause mismatched assignments", "High", "Medium", "One canonical level enumeration shared by role, user and designation"],
        ["R-11", "Location data lost on reload", "Certain", "Medium", "Persist location master with the same rigour as roles"],
        ["R-12", "Local-storage tampering changes effective permissions", "High", "High", "Server-authoritative permissions; browser holds no policy"],
    ], [38, 210, 52, 42, 139]))
    s.append(Paragraph("18.1  Dependencies", H2))
    s += bullets([
        "A server-side identity provider and session service, without which none of the enforcement requirements can be met.",
        "An agreed canonical organisation master covering state, region, revenue district, organisational district, mandalam, area and booth, with stable identifiers.",
        "A decision on whether revenue district and organisational district coexist or whether one is derived from the other.",
        "A data-ownership convention for every access-controlled record, so that scope can be evaluated.",
        "A retention and privacy position for the audit trail, including how long actor and subject identifiers are kept.",
    ])
    return s


def gaps():
    s = []
    s += h1("19", "Gap Analysis")
    s.append(P("Priorities are Critical, High, Medium and Low. A gap marked Critical prevents production release of delegated administration. Confirmed defects are distinguished from enhancements in the recommendation column."))
    s.append(table([
        ["ID", "Area", "Current implementation", "Expected behaviour", "Priority", "Recommendation"],
        ["G-01", "Server enforcement", "No API or middleware; access is presentation only", "Every route and data call authorises the actor", "Critical", "Defect. Build a policy module and call it on every request."],
        ["G-02", "Persistence", "Roles, users and designations live in local storage", "Durable, transactional, multi-user storage", "Critical", "Defect. Move to a server data store with migrations."],
        ["G-03", "Audit", "No access audit exists", "Immutable record of every access change", "Critical", "Defect. Append-only audit with before and after values."],
        ["G-04", "Designation to role", "22 system roles synthesised from designations", "Designation never grants permission", "Critical", "Defect. Remove synthesis; migrate affected users to explicit roles."],
        ["G-05", "Designation register", "Three registers with divergent names", "One authoritative master consumed everywhere", "High", "Defect. Consolidate and migrate."],
        ["G-06", "Data scope application", "Scopes stored but never evaluated", "Scopes filter every query", "Critical", "Defect. Implement row-level filtering."],
        ["G-07", "Above-level scope", "Defined but hidden from both forms", "Consistent vocabulary or complete removal", "Medium", "Enhancement. Decide and align model with UI."],
        ["G-08", "Delegation policy", "Two actors only; no district-level ceiling", "Per-actor delegation ceiling enforced server-side", "High", "Defect. Extend policy to every administrative actor."],
        ["G-09", "Role change propagation", "No cache invalidation or re-evaluation", "Next request reflects new permissions", "High", "Defect. Stateless evaluation per request."],
        ["G-10", "Multiple roles", "Single assignedRole string", "Agreed model with explicit precedence", "Medium", "Enhancement. Decide whether multiple roles are required."],
        ["G-11", "Designation validation", "Name-only check; duplicates allowed", "Unique within level; dependency-safe delete", "High", "Defect. Add uniqueness and dependency checks."],
        ["G-12", "Location persistence", "In-memory only", "Persisted master with stable ids", "High", "Defect. Persist and model units as records."],
        ["G-13", "Hierarchy coverage", "Stops at revenue district plus a mapping", "Full tree with mandalam, area and booth nodes", "High", "Defect. Publish canonical masters."],
        ["G-14", "Level vocabulary", "Two enumerations that disagree", "One canonical enumeration", "High", "Defect. Merge models."],
        ["G-15", "Export and approval", "Not modelled as permissions", "Grantable and enforced if the business needs them", "Medium", "Enhancement. Confirm requirement first."],
        ["G-16", "Personal overrides", "Per-user grid on the assignment screen", "Either supported with audit, or removed", "Medium", "Enhancement or defect depending on decision D-03."],
        ["G-17", "Role details view", "Drawer only, no route", "Addressable detail with holders", "Low", "Enhancement."],
        ["G-18", "Booth data", "Six generated booths per constituency", "Official booth master", "High", "Defect. Replace placeholder with published data."],
    ], [34, 78, 124, 108, 46, 91]))
    return s


def recommendations():
    s = []
    s += h1("20", "Recommendations")
    s.append(P("The sequence below protects the work already done. The data model, the permission catalogue and the matrix interface are sound and should be retained; what changes is where decisions are made and where state lives."))
    s.append(table([
        ["Phase", "Action", "Outcome"],
        ["1. Freeze the model", "Approve the four-concept separation, the seven-module catalogue and the three exposed scopes. Publish this document as the reference.", "One agreed vocabulary before any code changes."],
        ["2. Move identity", "Replace the local session with a server session and a real credential check. Keep the eight-hour policy if it suits operations.", "Tampering with local storage no longer grants access."],
        ["3. Move policy", "Port permissionModules, permissionPrerequisites and the delegation policy to a shared server module. Expose one authorisation call used by every route.", "Single source of truth for allow and deny."],
        ["4. Enforce on data", "Add unit and ownership fields to access-controlled records. Apply scope filters in every list, detail, export and approval path.", "Visibility promises become true."],
        ["5. Remove the shortcut", "Stop synthesising roles from designations. Migrate affected users to explicit roles after review.", "Designation becomes organisational identity only."],
        ["6. Consolidate masters", "Publish one designation register and one organisation master with stable identifiers, consumed by every screen.", "No divergent names or lost locations."],
        ["7. Add audit", "Write an immutable audit record for role, permission, designation and assignment changes, with a read-only viewer.", "Decisions become accountable."],
        ["8. Delegate", "Introduce per-actor delegation ceilings and a delegation console for regional and district administrators.", "Administration scales beyond the state office."],
    ], [88, 244, 149]))
    s.append(Paragraph("20.1  What to keep", H2))
    s += bullets([
        "The seven-module, twenty-nine-action catalogue with uneven action sets, which reflects real job shapes rather than a generic CRUD template.",
        "The prerequisite graph and its bidirectional cascade, which prevents the most common misconfiguration.",
        "The per-module scope column, which allows a role to read widely but edit narrowly.",
        "The level-first designation picker with an explicit cross-level guard on save.",
        "The separation of an organisation level field from a designation field on the user record, which is the foundation the rest of the model needs.",
    ])
    s.append(Paragraph("20.2  What to stop", H2))
    s += bullets([
        "Storing policy in the browser, including a role literal in the session object.",
        "Deriving permission from organisational identity.",
        "Treating the settings workspace as implicitly available to every signed-in administrator.",
        "Maintaining parallel designation constants in three files.",
        "Reporting a data-access setting that no query honours.",
    ])
    return s


def decisions():
    s = []
    s += h1("21", "Open Decisions")
    s.append(P("These items cannot be resolved from the code. Each needs a named owner and a decision date before the corresponding requirement can be built."))
    s.append(table([
        ["ID", "Decision required", "Options", "Owner", "Blocks"],
        ["D-01", "Does a designation ever grant permission?", "Never; or only through an explicit, separately approved mapping", "State administration", "G-04, FR-06"],
        ["D-02", "What does \u201cbelow my level\u201d include?", "All descendants; or direct children only", "Product and state administration", "G-06, R-03"],
        ["D-03", "Are per-user permission overrides permitted?", "Allow with audit; or remove the grid", "Security and product", "G-16"],
        ["D-04", "What does \u201cpeers\u201d mean?", "Same unit; or everyone at the same level statewide", "State administration", "G-06"],
        ["D-05", "Can a user hold more than one role?", "Single role; or multiple with precedence rules", "Product", "G-10"],
        ["D-06", "Is above-level visibility ever legitimate?", "Remove the scope; or expose with approval workflow", "Security", "G-07"],
        ["D-07", "Do revenue and organisational districts coexist?", "Both, linked; or organisational derived from revenue", "Organisation", "G-13, G-14"],
        ["D-08", "Are export and approval permissions required?", "Model them now; or defer with a documented gap", "Product", "G-15"],
        ["D-09", "How long is audit retained and who may read it?", "Policy decision", "Compliance", "G-03"],
        ["D-10", "Which office owns designation naming?", "State office; or distributed with review", "State administration", "G-05"],
    ], [36, 156, 148, 72, 69]))
    return s


def appendix():
    s = []
    s += h1("22", "Appendix \u2014 Source Code References")
    s.append(P(
        "Every claim in this document is traceable to the files below. Paths are repository-relative. Symbols are named "
        "exactly as they appear in the source. No line numbers are cited, because they change; the symbol is the stable "
        "reference."))
    s.append(table([
        ["File", "Symbols inspected", "What it evidences"],
        ["src/data/party-workers.ts", "permissionModules, permissionModulesBase, permissionPrerequisites, withPrerequisites, withoutDependentPermissions, rolePresets, assignmentLevels, roleOrganisationLevels, partyDesignations, delegationPolicies, canDelegateAction, scopeTypeOptions, partyRegions, AccessGrant, hasScopedAccess", "Permission catalogue, prerequisites, presets, designations, delegation, scope vocabulary and the shared evaluator"],
        ["src/data/role-management.ts", "ManagedRole, RoleDraft, DataAccessScope, dataAccessOptions, scopedPermissionKey, allScopedPermissionKeysWithExtras, builtInManagedRoles, partyDesignationManagedRoles, loadManagedRoles, saveManagedRoles, managedRoleStorageKey, deletedManagedRoleStorageKey, customOrganisationLevelStorageKey, customDesignationStorageKey", "Role and scope types, storage adapters, designation-derived role synthesis"],
        ["src/components/admin/<br/>RoleAccessSettings.tsx", "RoleAccessSettings, ManagedDesignation, MANAGED_DESIGNATIONS_KEY, DEFAULT_DESIGNATIONS_BY_LEVEL, loadManagedDesignations, saveManagedDesignations, saveRole, handleSaveDesignation, handleToggleDesignationStatus, handleDeleteDesignation, MANAGED_USERS_KEY", "The settings workspace, validation, role protection, designation lifecycle, user persistence"],
        ["src/routes/<br/>admin.settings_.new-role.tsx", "dataAccessChoices, supportedScopedPermissionKeys, primaryMatrixColumns, handleSave", "Full-page role form and the suppression of above-level scope"],
        ["src/routes/<br/>admin.settings_.new-user.tsx", "ORG_LEVEL_OPTIONS, DESIGNATIONS_BY_ORG_LEVEL, getOrgLevelForDesignation, handleSave", "User creation, level-first designation filtering, cross-level guard"],
        ["src/routes/<br/>admin.settings_.assign-role.tsx", "primaryMatrixRows, secondaryMatrixRows, ROLE_OPTIONS, getMatrixColumnActionIds", "Assignment screen, per-user overrides, role labels"],
        ["src/routes/admin.settings.tsx", "validateSearch, SettingsPage", "Settings shell and tab parameters"],
        ["src/routes/admin.tsx", "ProtectedAdminRoute, isAdminAuthenticated", "The only route guard in the application"],
        ["src/lib/admin-auth.ts", "ADMIN_SESSION_KEY, ADMIN_SESSION_DURATION_MS, createAdminSession, getAdminSession, clearAdminSession", "Client-side session with the hard-coded STATE_ADMIN role"],
        ["src/routes/auth.login.tsx", "handleSubmit, DEMO_USERNAME, DEMO_PASSWORD constants", "Credential comparison against hard-coded values"],
        ["src/data/users.ts", "AppUser, getUserDesignation, getUserRegion, ORG_DISTRICTS_MAP, getUserOrgDistrict", "User shape, revenue to organisational district mapping, fallback resolvers"],
        ["src/data/<br/>admin-dashboard-metrics.ts", "OrgLevel, orgHierarchyData", "The configured hierarchy tree, which stops at revenue district"],
        ["src/server.ts", "default fetch handler, normalizeCatastrophicSsrResponse", "SSR entry only; no authorisation"],
        ["docs/<br/>ADMIN-PROTOTYPE-AUDIT.md", "Audit findings", "Independent confirmation that the admin workspace is a client-side prototype"],
    ], [128, 208, 145]))
    s.append(Paragraph("22.1  Verification statement", H2))
    s.append(P(
        "The following were confirmed by direct inspection: the absence of an API layer, database client, migration or "
        "server-side guard; the set of local-storage keys; the seven-module and twenty-nine-action catalogue; the "
        "twenty-one prerequisite declarations; the four scope definitions and the suppression of above-level; the "
        "thirty-two seeded designations across six levels and the thirty legacy entries across nine levels; the "
        "twenty-two designation-derived roles; the three regions, fourteen revenue districts and thirty mapped "
        "organisational districts; and the presence of an operational activity log that is unrelated to access audit."))
    s.append(P(
        "Where a behaviour could not be located \u2014 server enforcement, audit of access changes, reporting relationships, "
        "ownership of records and persistence of the location master \u2014 this document says so rather than inferring it. "
        "Those statements are findings about the absence of implementation, not opinions about design."))
    s.append(Spacer(1, 10))
    s += callout("End of document",
                 "Vikasita Keralam, Role, Access and Designation: Business Requirements, Workflows and Information "
                 "Architecture. Reference " + DOC_META["code"] + ", version " + DOC_META["version"] + ", issued " +
                 DOC_META["date"] + ". Findings reflect the repository at the time of analysis and should be re-verified "
                 "before implementation begins.",
                 accent=BLUE, bg=PALE_BLUE)
    return s
