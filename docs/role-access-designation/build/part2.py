"""Scope, stakeholders, existing system analysis, requirement catalogue."""

from reportlab.platypus import PageBreak, Spacer, Paragraph
from common import *


def scope_stakeholders():
    s = []
    s += h1("4", "Scope and Stakeholders")
    s.append(Paragraph("4.1  Capabilities examined", H2))
    s.append(P("Each capability below was traced from a route or component to its data module. The right-hand column states the strongest claim the code supports."))
    s.append(table([
        ["Capability", "Primary location", "Evidence status"],
        ["Role library, create, edit, duplicate, delete", "RoleAccessSettings.tsx, admin.settings_.new-role.tsx", "UI Only"],
        ["Module and action permission matrix", "party-workers.ts, RoleAccessSettings.tsx", "Implemented as client configuration"],
        ["Prerequisite and cascade rules", "permissionPrerequisites, togglePermission", "Implemented"],
        ["Data access scope per module", "role-management.ts, new-role.tsx", "Partially Implemented"],
        ["Designation master", "RoleAccessSettings.tsx, role-management.ts", "Partially Implemented"],
        ["Organisation levels and locations", "RoleAccessSettings.tsx, admin-dashboard-metrics.ts", "Partially Implemented"],
        ["User creation and editing", "admin.settings_.new-user.tsx", "UI Only"],
        ["Role assignment", "admin.settings_.assign-role.tsx, RoleAccessSettings.tsx", "UI Only"],
        ["Server-side authorisation", "not found", "Not Implemented"],
        ["Access audit trail", "not found", "Not Implemented"],
    ], [204, 180, 97]))
    s.append(Paragraph("4.2  Explicitly out of scope", H2))
    s += bullets([
        "Citizen-facing eligibility questionnaire, scheme directory and application submission.",
        "Matched-scheme results, document verification workflow and helpdesk case handling, except where they consume a permission.",
        "Party-worker directory, leaderboard and volunteer modules, except as data sources for user records.",
        "Desktop admin dashboard metrics, mobile preview rendering and the statewide communications surfaces.",
        "Any change to notification content, branding or translation strings.",
    ])
    s.append(Paragraph("4.3  Actors found in the implementation", H2))
    s.append(P("The system does not model a rich set of actors. Two enumerations exist and neither matches the organisational vocabulary used in the interface."))
    s.append(table([
        ["Actor construct", "Values", "Where defined", "Practical effect"],
        ["Session role", "STATE_ADMIN (single literal)", "admin-auth.ts", "Every signed-in administrator is treated as a state administrator."],
        ["ActorRole (delegation)", "state_admin, party_worker", "party-workers.ts", "Only state_admin may delegate; every other actor is a plain user."],
        ["UI role selector", "Admin, Sub Admin, Support Admin, Specific Role", "assign-role route, new-user route", "A label stored on the user record; it does not alter evaluation."],
        ["Seeded user categories", "state_admin, district_admin, constituency_admin, local_body_admin, booth_admin, party_worker", "RoleAccessSettings seeds", "Demonstrative population counts only."],
        ["Party designations", "30 entries", "party-workers.ts", "Organisational identity, not permission."],
    ], [104, 148, 118, 111]))
    s.append(Paragraph("4.4  Four concepts that must stay separate", H2))
    s.append(P("The single most important clarification in this document is that the following are different things, stored in different fields, and must not be conflated in the interface or the data model."))
    s.append(table([
        ["Concept", "What it answers", "Stored as", "Grants permission?"],
        ["<b>Organisation level</b>", "Where in the hierarchy does this person sit?", "orgLevel on the user; level on a designation", "No"],
        ["<b>Designation</b>", "What party post does this person hold?", "designationEn on the user; ManagedDesignation records", "No, unless a role is attached"],
        ["<b>System role</b>", "Which modules and actions may this person use?", "assignedRole on the user; ManagedRole records", "Yes"],
        ["<b>Data access scope</b>", "Whose records may this person see?", "dataAccess and scopedPermissions on the role", "Bounds the role; does not grant"],
        ["<b>Location assignment</b>", "Which units does this person operate over?", "regionEn, orgDistrictEn, mandalamEn, areaEn, boothEn on the user", "No, but bounds every scope"],
    ], [104, 152, 156, 69]))
    s += callout("Decision required",
                 "The current code attaches a system role to most designations automatically. If the business agrees that a "
                 "designation must never grant permission, that behaviour has to be removed rather than documented as a "
                 "convention. See Section 20, gap G-04.",
                 accent=RED, bg=colors.HexColor("#FCEDEC"))
    return s


def existing_system():
    s = []
    s += h1("5", "Existing System Analysis")
    s.append(Paragraph("5.1  Architecture and runtime", H2))
    s.append(P(
        "The application is a React single-page application built with TanStack Router and TanStack Start, bundled by Vite "
        "and served through a Cloudflare Workers entry point. Styling uses Tailwind with a shared component library. "
        "There is no database client, no ORM, no API route collection and no authentication service in the repository. "
        "The server entry in src/server.ts only normalises server-side rendering errors; it does not authorise requests."))
    s.append(table([
        ["Layer", "Present?", "Evidence"],
        ["React UI and TanStack route tree", "Yes", "src/routes/*, src/components/*"],
        ["SSR entry / edge worker", "Yes, rendering only", "src/server.ts, wrangler configuration"],
        ["API or service layer", "No", "No route handlers, controllers or fetchers for access data"],
        ["Database or ORM", "No", "No client, schema, migration or query builder"],
        ["Auth provider", "No", "Session created locally in admin-auth.ts"],
        ["Server-side authorisation", "No", "No middleware, guard or policy engine"],
        ["Audit store", "No", "No access-audit table, writer or viewer"],
    ], [166, 96, 219]))
    s.append(Paragraph("5.2  Where the access domain lives", H2))
    s.append(table([
        ["File", "Responsibility", "Key symbols"],
        ["src/data/party-workers.ts", "Canonical permission catalogue, presets, designations, delegation policy, scope vocabulary", "permissionModules, permissionPrerequisites, rolePresets, partyDesignations, delegationPolicies, hasScopedAccess"],
        ["src/data/role-management.ts", "Managed role and designation types, storage adapters, scope keys, built-in role seeds", "ManagedRole, RoleDraft, dataAccessOptions, loadManagedRoles, saveManagedRoles, builtInManagedRoles"],
        ["src/components/admin/RoleAccessSettings.tsx", "The whole settings workspace: four tabs, role CRUD, designation CRUD, user CRUD, bulk operations", "RoleAccessSettings, ManagedDesignation, loadManagedUsers, saveManagedUsers"],
        ["src/routes/admin.settings_.new-role.tsx", "Full-page create and edit role with the permission matrix", "dataAccessChoices, scopedPermissions, handleSave"],
        ["src/routes/admin.settings_.new-user.tsx", "Create and edit user with level, designation and location cascade", "ORG_LEVEL_OPTIONS, DESIGNATIONS_BY_ORG_LEVEL, handleSave"],
        ["src/routes/admin.settings_.assign-role.tsx", "Bulk and single role assignment with a per-user permission grid", "primaryMatrixRows, ROLE_OPTIONS"],
        ["src/routes/admin.settings.tsx", "Settings shell and tab routing", "validateSearch, SettingsPage"],
        ["src/lib/admin-auth.ts", "Session create, read, expire, clear", "createAdminSession, isAdminAuthenticated"],
        ["src/data/users.ts", "User shape and fallback resolvers for district, region and org district", "AppUser, getUserOrgDistrict, getUserRegion"],
        ["src/data/admin-dashboard-metrics.ts", "Dashboard hierarchy used for organisational reporting", "orgHierarchyData, OrgLevel"],
    ], [128, 190, 163]))
    s.append(Paragraph("5.3  Authentication and session", H2))
    s.append(P(
        "Sign-in compares the submitted credentials against a hard-coded pair in the login route, then writes "
        "vk-admin-session to local storage. The stored object carries a username, the literal role STATE_ADMIN and an "
        "expiry eight hours ahead. The protected admin route reads that object on mount and redirects to the login page "
        "if it is absent, malformed or expired. There is no password hashing, no token, no refresh and no server "
        "verification. Clearing browser storage signs the user out."))
    s.append(table([
        ["Property", "Value observed"],
        ["Storage key", "vk-admin-session"],
        ["Session payload", "username, role = STATE_ADMIN, expiresAt"],
        ["Duration", "8 hours from creation"],
        ["Validation", "JSON parse, role equality, expiry comparison"],
        ["Server involvement", "None"],
    ], [140, 341]))
    s.append(Paragraph("5.4  Persistence map", H2))
    s.append(P("All durable state in the access domain is browser-local. The table lists the keys that were found and what each holds."))
    s.append(table([
        ["Storage key", "Holds", "Written by"],
        ["vk-admin-session", "Administrator session", "admin-auth.ts"],
        ["vk-managed-roles", "Custom and edited role records", "saveManagedRoles"],
        ["vk-deleted-managed-role-ids", "Tombstones for deleted roles", "deleteManagedRole"],
        ["vk-custom-organisation-levels", "Administrator-created organisation levels", "saveCustomOrganisationLevels"],
        ["vk-custom-designations", "Designation records created in the master", "role-management adapters"],
        ["vikasita_managed_designations_v1", "The designation master actually rendered by the settings tab", "saveManagedDesignations"],
        ["vk-designation-overrides", "Renamed or re-levelled designations", "role-management adapters"],
        ["vk-hidden-designation-ids", "Designations hidden from pickers", "role-management adapters"],
        ["vk-managed-desktop-users", "Managed users, including assigned role and designation", "saveManagedDesktopUsers"],
        ["vk_newly_created_designation", "One-shot hand-off after creating a designation (session storage)", "designation save handler"],
    ], [156, 220, 105]))
    s += callout("Observation",
                 "Two different keys describe designations: vk-custom-designations and vikasita_managed_designations_v1. "
                 "The Designation Master tab reads and writes the second; other adapters read the first. This is the root "
                 "of the duplication described in Section 8.",
                 accent=ORANGE, bg=PALE_ORANGE)
    s.append(Paragraph("5.5  Capability inventory", H2))
    s.append(P("The following inventory records what each capability does, who can reach it, what it reads or writes, and what is missing."))
    rows = [
        ["Capability", "Current behaviour", "Access", "Reads / writes", "Status"],
        ["View role library", "Lists built-in and custom roles with level, user count and status chips", "Any signed-in admin", "Roles from seeds plus vk-managed-roles", "UI Only"],
        ["Create role", "Form with name, description, levels, permission matrix and scope column", "Any signed-in admin", "Writes a ManagedRole", "UI Only"],
        ["Edit role", "Same form pre-filled; built-in roles are read-only", "Any signed-in admin", "Rewrites the role, refreshes updatedAt", "Partially Implemented"],
        ["Duplicate role", "Copies permissions and scopes under a new id", "Any signed-in admin", "Writes a new ManagedRole", "UI Only"],
        ["Delete role", "Removes the record and writes a tombstone id", "Any signed-in admin", "vk-managed-roles, tombstones", "Partially Implemented"],
        ["Assign permission", "Matrix of 7 modules by up to 5 actions, with prerequisite cascade", "Any signed-in admin", "permissions and scopedPermissions arrays", "Implemented"],
        ["Set data scope", "Independent toggles per module; above-level hidden", "Any signed-in admin", "dataAccess map on the role", "Partially Implemented"],
        ["Designation master", "List grouped by level, create, edit, enable, disable, delete", "Any signed-in admin", "vikasita_managed_designations_v1", "Partially Implemented"],
        ["Organisation location", "Six sub-tabs for levels, regions, districts, mandalams, areas, booths", "Any signed-in admin", "In-memory state only", "UI Only"],
        ["Create user", "Name, level, designation, location, role, optional overrides", "Any signed-in admin", "vk-managed-desktop-users", "UI Only"],
        ["Assign role", "Single or bulk assignment with optional per-user permission grid", "Any signed-in admin", "assignedRole and overrides", "UI Only"],
        ["Enforce access", "No route guard beyond session presence; no data filter", "Not applicable", "Not applicable", "Not Implemented"],
    ]
    s.append(table(rows, [86, 176, 70, 92, 57]))
    s.append(Paragraph("5.6  Known limitations", H2))
    s += bullets([
        "Permission checks are performed for presentation only. The shared evaluator is documented in code as intended for server-side use once an API exists.",
        "Location master edits are held in component state and are lost on reload; they do not persist to any key.",
        "The settings workspace exposes every capability to every signed-in administrator; there is no per-screen guard.",
        "Deleting a designation does not check whether users still reference it, leaving dangling designation names on user records.",
        "Duplicate designation names are accepted, including within the same organisation level.",
        "Changing a role does not invalidate the cached session or force a re-evaluation for affected users.",
    ])
    return s


def requirements():
    s = []
    s += h1("6", "Business Requirements")
    s.append(P(
        "The catalogue below is the normative requirement set for role, permission, designation and organisational access. "
        "Priority uses MoSCoW. Status describes today\u2019s code, not the requirement\u2019s importance. Source identifies the "
        "file or symbol that evidences the current state."))
    s.append(Paragraph("6.1  FR-01 Role management", H2))
    s.append(table([
        ["ID", "Requirement", "Priority", "Status", "Source"],
        ["FR-01.1", "An administrator can view every role with its name, allowed levels, assigned user count and status.", "Must", "UI Only", "RoleAccessSettings roles tab"],
        ["FR-01.2", "An administrator can create a role with a unique name, at least one assignment level and at least one permission.", "Must", "UI Only", "saveRole validation"],
        ["FR-01.3", "An administrator can edit a custom role; built-in system roles are protected from edit and delete.", "Must", "Partially Implemented", "RoleAccessSettings, system flag"],
        ["FR-01.4", "An administrator can deactivate a role so it remains visible but cannot be newly assigned.", "Should", "Partially Implemented", "status field; assignment does not filter"],
        ["FR-01.5", "An administrator can assign a role to a user and revoke it.", "Must", "UI Only", "assign-role route"],
        ["FR-01.6", "An administrator can view a role\u2019s detail, including which users hold it.", "Should", "Partially Implemented", "assignedUsers counter"],
        ["FR-01.7", "Only an actor with role-management permission may create, edit or delete roles.", "Must", "Not Implemented", "No server guard"],
        ["FR-01.8", "A duplicate role name is rejected case-insensitively.", "Must", "Implemented", "saveRole duplicate check"],
    ], [38, 196, 42, 90, 115]))
    s.append(Paragraph("6.2  FR-02 Permission management", H2))
    s.append(table([
        ["ID", "Requirement", "Priority", "Status", "Source"],
        ["FR-02.1", "Permissions are granted per module and per action across the seven configured modules.", "Must", "Implemented", "permissionModules"],
        ["FR-02.2", "Selecting a dependent action automatically selects its prerequisites.", "Must", "Implemented", "withPrerequisites"],
        ["FR-02.3", "Removing a prerequisite removes every action that depends on it, transitively.", "Must", "Implemented", "withoutDependentPermissions"],
        ["FR-02.4", "Permission groups are presented as readable matrix columns rather than raw keys.", "Should", "Implemented", "primaryMatrixColumns"],
        ["FR-02.5", "Default permissions are seeded from role presets for the built-in roles.", "Should", "Implemented", "rolePresets"],
        ["FR-02.6", "Existing role permissions can be updated and the change is reflected for holders.", "Must", "Partially Implemented", "Persisted, but no session refresh"],
        ["FR-02.7", "Conflicting or mutually exclusive permissions are detected and blocked.", "Could", "Not Implemented", "No conflict rule defined"],
        ["FR-02.8", "An actor cannot grant a permission that exceeds their own delegation authority.", "Must", "Partially Implemented", "delegationPolicies constants only"],
    ], [38, 196, 42, 90, 115]))
    s.append(Paragraph("6.3  FR-03 Data access control", H2))
    s.append(table([
        ["ID", "Requirement", "Priority", "Status", "Source"],
        ["FR-03.1", "Record visibility is configurable per module using a defined scope vocabulary.", "Must", "Partially Implemented", "dataAccessOptions"],
        ["FR-03.2", "Organisation-based restrictions are applied to list queries.", "Must", "Not Implemented", "No query layer"],
        ["FR-03.3", "Restrictions are applied to detail views and direct links, not only lists.", "Must", "Not Implemented", "No route guard"],
        ["FR-03.4", "Restrictions are applied in APIs and backend queries.", "Must", "Not Implemented", "No API"],
        ["FR-03.5", "The effective policy is deny-by-default when no scope is configured.", "Must", "Proposed", "hasScopedAccess returns false without a grant"],
    ], [38, 196, 42, 90, 115]))
    s.append(Paragraph("6.4  FR-04 Designation management", H2))
    s.append(table([
        ["ID", "Requirement", "Priority", "Status", "Source"],
        ["FR-04.1", "An administrator can view the designation master grouped by organisation level.", "Must", "Implemented", "Designation Master tab"],
        ["FR-04.2", "An administrator can create a designation with a name and organisation level.", "Must", "Partially Implemented", "handleSaveDesignation"],
        ["FR-04.3", "An administrator can edit a designation\u2019s name, level and parent.", "Should", "Implemented", "handleSaveDesignation"],
        ["FR-04.4", "An administrator can activate or deactivate a designation.", "Should", "Implemented", "handleToggleDesignationStatus"],
        ["FR-04.5", "Designations are associated with exactly one organisation level and ranked within it.", "Must", "Implemented", "rank derivation"],
        ["FR-04.6", "Designation pickers offer only active designations for the selected level.", "Must", "Implemented", "activeDesignations filter"],
        ["FR-04.7", "Duplicate designation names within a level are rejected.", "Should", "Not Implemented", "Name-only validation"],
        ["FR-04.8", "A designation cannot be deleted while users are assigned to it.", "Should", "Not Implemented", "No dependency check"],
    ], [38, 196, 42, 90, 115]))
    s.append(Paragraph("6.5  FR-05 Organisational access", H2))
    s.append(table([
        ["ID", "Requirement", "Priority", "Status", "Source"],
        ["FR-05.1", "Users are assigned to one organisation level from a controlled list.", "Must", "Implemented", "ORG_LEVEL_OPTIONS"],
        ["FR-05.2", "Users are assigned to one or more organisational units (region, district, mandalam, area, booth).", "Must", "Implemented", "new-user location cascade"],
        ["FR-05.3", "Reporting relationships are resolvable from the assignment.", "Should", "Not Implemented", "No parent-user link"],
        ["FR-05.4", "Eligible data visibility is derived from level and location assignment.", "Must", "Not Implemented", "No evaluator at query time"],
        ["FR-05.5", "Multiple assignments are supported and their union is used for visibility.", "Should", "Partially Implemented", "Multi-select stored; union not applied"],
    ], [38, 196, 42, 90, 115]))
    s.append(Paragraph("6.6  FR-06 User assignment", H2))
    s.append(table([
        ["ID", "Requirement", "Priority", "Status", "Source"],
        ["FR-06.1", "A user record carries exactly one system role.", "Must", "Implemented", "assignedRole"],
        ["FR-06.2", "A user record carries exactly one designation, filtered by level.", "Must", "Implemented", "designationEn plus validation"],
        ["FR-06.3", "A user record carries an organisation level.", "Must", "Implemented", "orgLevel"],
        ["FR-06.4", "A user record carries one or more organisational locations.", "Must", "Implemented", "regionEn, orgDistrictEn, mandalamEn, areaEn, boothEn"],
        ["FR-06.5", "Changing the organisation level clears an incompatible designation.", "Must", "Implemented", "level change handler"],
        ["FR-06.6", "Reassigning a user to another unit preserves role and designation and is auditable.", "Should", "Partially Implemented", "Reassignment works; no audit"],
        ["FR-06.7", "Revoking a role takes effect immediately for the affected user.", "Must", "Not Implemented", "No session invalidation"],
    ], [38, 196, 42, 90, 115]))
    s.append(Paragraph("6.7  Requirement summary", H2))
    s.append(table([
        ["Group", "Requirements", "Implemented", "Partially", "UI only", "Not implemented", "Proposed"],
        ["FR-01 Role management", "8", "1", "3", "3", "1", "0"],
        ["FR-02 Permissions", "8", "4", "2", "0", "1", "0"],
        ["FR-03 Data access", "5", "0", "1", "0", "3", "1"],
        ["FR-04 Designations", "8", "4", "2", "0", "2", "0"],
        ["FR-05 Organisation", "5", "2", "1", "0", "2", "0"],
        ["FR-06 User assignment", "7", "4", "1", "0", "2", "0"],
        ["<b>Total</b>", "<b>41</b>", "<b>15</b>", "<b>10</b>", "<b>3</b>", "<b>11</b>", "<b>1</b>"],
    ], [140, 58, 60, 50, 46, 68, 59]))
    return s
