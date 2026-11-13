"""Workflows, information architecture, ER model and matrices."""

import diagrams as D
from reportlab.platypus import PageBreak, Spacer, Paragraph
from common import *


def role_workflows():
    s = []
    s += h1("11", "Role and Access Workflows")
    s.append(P(
        "The four workflows below describe the current behaviour end to end. Each diagram is annotated with the point at "
        "which the process leaves the browser, because that is where every control currently stops."))

    s.append(Paragraph("11.1  Role creation", H2))
    s.append(P(
        "Creation is a full-page flow reached from the roles tab. The actor enters identity, chooses the levels at which "
        "the role may be held, then works through a matrix. Validation runs on save and blocks the commit if any of three "
        "conditions fail. A duplicate name is compared case-insensitively across existing roles, including protected ones."))
    s.append(figure("11.1", "Role creation workflow", D.role_creation, 532, D))
    s.append(table([
        ["Attribute", "Detail"],
        ["Actor", "Any holder of a valid admin session; the session role is always STATE_ADMIN"],
        ["Entry point", "Settings, Role and Access Settings, Roles tab, Create Role"],
        ["Preconditions", "An active session; nothing else is checked"],
        ["Inputs", "Role name, description, allowed assignment levels, status, module permissions, data access scopes"],
        ["Validation", "Name required; name unique case-insensitively; at least one assignment level; at least one permission"],
        ["Save behaviour", "Written to vk-managed-roles with created and updated timestamps"],
        ["Duplicate handling", "Blocked by name; Duplicate copies an existing role under a new id"],
        ["Postcondition", "The role appears in role pickers and can be assigned immediately"],
        ["Failure state", "Inline field errors; the form stays open and no record is written"],
    ], [118, 363], pad=3.5))

    s.append(Paragraph("11.2  Role editing and its impact on holders", H2))
    s.append(P(
        "Editing is where an access-management design is most likely to fail quietly. A role change is persisted, but no "
        "session is invalidated, no cache is cleared and no notification is sent. A user who is signed in continues with "
        "the permissions that were resolved when their screen loaded. Until evaluation is server-side and stateless, this "
        "gap cannot be closed by the interface alone."))
    s.append(figure("11.2", "Role editing workflow and the protection boundary", D.role_editing, 430, D))
    s.append(table([
        ["Rule", "Implemented behaviour"],
        ["Protected roles", "Built-in roles refuse edit and delete; three top-level roles are exempt so administration remains possible"],
        ["Permission propagation", "The stored role is updated; nothing re-evaluates it for signed-in users"],
        ["Assigned users", "A count is held on the role record; it is not recomputed from the user list"],
        ["Audit history", "None. The record carries only createdAt and updatedAt"],
        ["Concurrent edits", "Last write wins; there is no version check"],
    ], [140, 341]))

    s.append(Paragraph("11.3  Role assignment", H2))
    s.append(P(
        "Assignment is single-role. The user record carries one assignedRole string; there is no membership table, so a "
        "user cannot hold two roles and there is no notion of a primary or secondary role. Bulk assignment exists and "
        "applies the same role to every selected user. The assignment screen also offers a per-user permission grid, "
        "which means an individual can be granted permissions that their role does not contain \u2014 an override that is "
        "stored on the user and invisible from the role record."))
    s.append(figure("11.3", "Role assignment workflow", D.role_assignment, 382, D))
    s += callout("Open question for approval",
                 "Personal overrides break the statement \u201ca role defines what a user may do\u201d. Either overrides become a "
                 "supported second mechanism with their own audit and review, or the grid is removed from the assignment "
                 "screen. See Section 21, decision D-03.",
                 accent=ORANGE, bg=PALE_ORANGE)

    s.append(Paragraph("11.4  Permission evaluation", H2))
    s.append(P(
        "The evaluation chain below is what a production system must perform on every request. In the current code only "
        "the session-presence check exists, and it happens once, on mount, in the browser. Steps three to eight are "
        "described in the data model and partially exposed in the interface, but they are never executed against a real "
        "record."))
    s.append(figure("11.4", "Permission and data-access evaluation, with deny-by-default", D.access_evaluation, 410, D))
    s.append(table([
        ["Check", "Implemented today", "Required"],
        ["Session present and unexpired", "Yes, client-side", "Yes, server-side"],
        ["Account active", "Field exists, not checked", "Reject disabled users"],
        ["Role resolved", "String stored, not validated", "Reject unknown or inactive role"],
        ["Module permission", "Not checked on route entry", "Reject route and data call"],
        ["Action permission", "Not checked on handler", "Reject mutation"],
        ["Data scope configured", "Stored, not applied", "Default deny when absent"],
        ["Organisation unit match", "Not evaluated", "Filter rows before return"],
        ["Audit", "None", "Record allow and deny for sensitive actions"],
    ], [148, 152, 181]))
    s.append(P(
        "Negative scenarios that must be specified and tested: direct URL entry to a module without view permission; a "
        "crafted identifier for a record outside scope; an export that bypasses list filtering; an approval action on a "
        "record the actor may read but not approve; and a disabled role still held by a signed-in user."))
    return s


def designation_workflows():
    s = []
    s += h1("12", "Designation Workflows")
    s.append(Paragraph("12.1  Designation creation", H2))
    s.append(P(
        "The workflow is short and entirely local. Its weakness is validation depth rather than length: a name and a "
        "level are enough to create a record that immediately appears in every matching picker."))
    s.append(figure("12.1", "Designation creation workflow", D.designation_creation, 430, D))
    s.append(table([
        ["Attribute", "Detail"],
        ["Actor", "Any holder of a valid admin session"],
        ["Preconditions", "None beyond the session"],
        ["Required fields", "Name and organisation level"],
        ["Optional fields", "Parent designation, used only to derive rank"],
        ["Duplicate handling", "Not validated; duplicates are accepted"],
        ["Status handling", "New records are Active; disable is a separate action"],
        ["Postcondition", "The designation appears in pickers for its level; a session hand-off value is written"],
    ], [118, 363]))

    s.append(Paragraph("12.2  Designation assignment to a user", H2))
    s.append(P(
        "Assignment happens inside the user form. The organisation level is chosen first and the designation list is "
        "filtered to it, which is the correct dependency order. A designation that does not belong to the selected level "
        "is rejected on save even if it was injected into the form. Changing the level afterwards clears the selection "
        "rather than silently retaining an invalid pairing."))
    s.append(figure("12.2", "Designation assignment workflow", D.designation_assignment, 376, D))
    s.append(table([
        ["Behaviour", "Implementation"],
        ["Level before designation", "The designation picker is disabled until a level is selected"],
        ["Filtering", "Active designations for the selected level only"],
        ["Cross-level guard", "Save is blocked with an explicit message if the pairing is invalid"],
        ["Level change", "Clears the designation selection"],
        ["Role coupling", "The role is chosen separately and is never derived from the designation in this form"],
        ["Persistence", "Designation is copied into designationEn and designationMl on the user record"],
    ], [140, 341]))
    s += callout("Inconsistency to resolve",
                 "The Create User form does not use the Designation Master that the Designation tab edits. It reads a "
                 "separate constant. Adding a designation in the master therefore may not make it available in Create User. "
                 "See Section 20, gap G-05.",
                 accent=RED, bg=colors.HexColor("#FCEDEC"))
    return s


def information_architecture():
    s = []
    s += h1("13", "Information Architecture")
    s.append(P(
        "The settings workspace is a single component with four tabs, reached from the admin shell. One tab, Roles, also "
        "owns full-page routes for create-role, create-user and assign-role. The result is a shallow structure with a "
        "small number of deep leaves, which is appropriate for the current scope but will not scale once delegated "
        "administrators need their own landing views."))
    s.append(figure("13.1", "Settings information architecture as implemented", D.settings_ia, 240, D))
    s.append(table([
        ["Route", "Component", "Contents", "Status"],
        ["/admin/settings", "SettingsPage", "Shell with tab query parameter and sub-tab routing", "Implemented"],
        ["?tab=roles", "RoleAccessSettings", "Role list, table actions, drawers, bulk operations", "Implemented"],
        ["?tab=users", "RoleAccessSettings", "User list, filters, bulk assignment entry", "Implemented"],
        ["?tab=designations", "RoleAccessSettings", "Designation master grouped by level", "Implemented"],
        ["?tab=location", "RoleAccessSettings", "Levels, regions, districts, mandalams, areas, booths", "UI Only"],
        ["/admin/settings_/new-role", "New role page", "Full-page matrix with scope column", "Implemented"],
        ["/admin/settings_/new-user", "New user page", "Level, designation, location and role cascade", "Implemented"],
        ["/admin/settings_/assign-role", "Assign role page", "Bulk and single assignment with overrides", "Implemented"],
        ["/admin/settings_/user-details", "User details page", "Read view of a managed user", "Implemented"],
    ], [142, 88, 181, 70]))
    s.append(P(
        "Three navigation gaps are worth noting. There is no route or screen for an organisation hierarchy editor, even "
        "though a hierarchy is displayed on the dashboard. There is no role-detail route: the drawer and the edit form are "
        "the only views. And there is no delegation console, so a regional administrator has no entry point even if the "
        "permission model were extended to support one."))
    s.append(table([
        ["Node in the target architecture", "Exists?", "Note"],
        ["Settings, Role and Access Settings", "Yes", "Single component, four tabs"],
        ["Roles List, Create, Edit", "Yes", "Create and edit are full-page routes"],
        ["Role Details", "Partial", "Drawer only; no addressable route"],
        ["Module Permissions", "Yes", "Matrix inside the role form"],
        ["Data Access Permissions", "Partial", "Per-module scope column; above-level suppressed"],
        ["Role Assignments", "Yes", "Bulk and individual assignment"],
        ["Designation Master, list, create, edit", "Yes", "Dialog based"],
        ["Organisation Levels", "Partial", "Editable but memory-only"],
        ["Organisational Locations", "Partial", "Regions to booths, memory-only"],
        ["Hierarchy Relationships", "No", "Displayed on the dashboard, not editable"],
        ["User Management, list, create, edit", "Yes", "User list plus full-page forms"],
        ["Delegation console", "No", "Delegation policy exists only as constants"],
    ], [206, 58, 217]))
    return s


def er_section():
    s = []
    s += h1("14", "Entity Relationship Diagram")
    s.append(P(
        "No database schema exists in the repository, so the model below is conceptual. Every entity corresponds to a "
        "TypeScript interface or a stored record that was actually found; no table or column name is invented. Cardinality "
        "reflects how the data is stored today, including the places where a proper relational structure is collapsed into "
        "a single field."))
    s.append(figure("14.1", "Role, permission, designation and organisation relationships", D.er_model, 374, D))
    s.append(table([
        ["Entity", "Purpose", "Key fields", "Relationships"],
        ["User", "A managed administrator or party functionary", "id, name, status, orgLevel, designationEn, assignedRole", "One role, one designation, many location assignments"],
        ["Role", "A named grant of permissions", "id, name, status, system, presetId, permissions, dataAccess", "Many permissions; held by many users"],
        ["Role Assignment", "The link between a user and a role", "assignedRole on the user", "Collapsed; one to one in practice, many to one from roles"],
        ["Permission", "A single module.action grant", "module, action, scopes", "Belongs to a role; references a module and action"],
        ["Module", "A functional area", "id, label, actions", "One to many actions"],
        ["Action", "A permitted operation inside a module", "id, label, prerequisites", "Many to one module; declares prerequisites"],
        ["Data Access Scope", "The visibility bound for a module", "scope id, module, enabled", "Attached to a role; bounded by organisation units"],
        ["Designation", "A party post at one level", "id, name, orgLevel, parent, rank, status", "Many to one organisation level; one to many users"],
        ["Organisation Level", "A tier of the hierarchy", "id, label, position", "One to many designations and units"],
        ["Organisation Unit", "A node in the hierarchy", "id, name, parent", "Many to one parent; referenced by location assignments"],
        ["Location Assignment", "The units a user operates over", "region, orgDistrict, mandalam, area, booth", "Collapsed into five string fields on the user"],
        ["Audit Log", "A record of access changes", "actor, target, before, after, timestamp", "Not implemented"],
    ], [92, 150, 146, 93]))
    s.append(P(
        "Two modelling decisions are visible in the diagram and both should be corrected before persistence is built. "
        "Role assignment is collapsed onto the user as a single string, which prevents multiple roles and prevents a "
        "query for \u201call holders of this role\u201d. Location assignment is collapsed into five display-name strings, which "
        "prevents a stable reference to a unit and makes renames destructive."))
    return s


def matrices():
    s = []
    s += h1("15", "Permissions and Designation Matrices")
    s.append(Paragraph("15.1  Module and action matrix", H2))
    s.append(P(
        "The matrix reports what the permission catalogue supports, not what any individual holds. Where an action is "
        "absent from the module it is marked Not Available; the dashboard-level actions that the business has discussed "
        "but which are not modelled are marked Not Confirmed and must not be assumed."))
    s.append(table([
        ["Module", "View", "Create", "Edit", "Delete", "Assign", "Respond", "Export", "Approve", "Scope"],
        ["Schemes", "Yes (list, detail)", "Yes", "Yes", "Yes", "Not Available", "Not Available", "Not Confirmed", "Not Available", "Yes"],
        ["Users", "Yes", "Yes", "Yes", "Yes", "Not Available", "Not Available", "Not Confirmed", "Not Confirmed", "Yes"],
        ["Applications", "Yes", "Yes", "Yes", "Yes", "Not Available", "Not Available", "Not Confirmed", "Not Confirmed", "Yes"],
        ["Requests", "Yes", "Not Available", "Not Available", "Not Available", "Yes", "Yes", "Not Confirmed", "Not Available", "Yes"],
        ["Applicant Profile", "Yes", "Yes", "Yes", "Yes", "Not Available", "Not Available", "Not Confirmed", "Not Available", "Yes"],
        ["Role and Access", "Yes", "Yes", "Yes", "Yes", "Not Available", "Not Available", "Not Confirmed", "Not Available", "Yes"],
        ["Designation", "Yes", "Yes", "Yes", "Yes", "Not Available", "Not Available", "Not Confirmed", "Not Available", "Yes"],
    ], [74, 62, 44, 40, 44, 42, 50, 46, 46, 33]))
    s.append(P(
        "Two observations follow. First, export and approval are not first-class permissions anywhere, yet both are "
        "capabilities the business is likely to delegate. Second, the requests module uses assign and respond instead of "
        "edit, so a generic \u201cedit\u201d grant will not enable helpdesk work."))
    s.append(Paragraph("15.2  Designation matrix", H2))
    s.append(P(
        "The master holds 32 seeded designations across six levels, with rank derived from list order. Live assignment "
        "counts are not computed anywhere in the code, so they are reported as Not available rather than estimated."))
    rows = [["Level", "Designation", "Rank", "Status", "Assigned users", "Source"]]
    master = [
        ("State", ["President", "Vice President", "General Secretary", "General Secretary (Organisation)",
                   "Secretary", "Treasurer", "Executive Member"]),
        ("Region", ["President", "In-charge", "Coordinator", "Cluster In-charge"]),
        ("Organisational District", ["President", "Vice President", "General Secretary",
                                     "General Secretary (Organisation)", "Secretary", "Treasurer", "Executive Member"]),
        ("Mandalam", ["President", "Vice President", "General Secretary", "Secretary", "Treasurer", "Committee Member"]),
        ("Area", ["Kendra Convener", "Area Coordinator", "Area In-charge", "Area Committee Member"]),
        ("Booth", ["President", "Secretary", "Committee Member", "Worker"]),
    ]
    for level, names in master:
        for i, name in enumerate(names):
            rows.append([level if i == 0 else "", name, str(i + 1), "Active", "Not available", "DEFAULT_DESIGNATIONS_BY_LEVEL"])
    s.append(table(rows, [78, 132, 34, 38, 62, 137]))
    s.append(P(
        "The legacy register in party-workers.ts holds 30 entries across nine levels, including three levels that the "
        "master does not cover: assembly constituency, local body and organisational unit. Where the two registers "
        "overlap, names differ: the legacy register prefixes the level (\u201cMandalam President\u201d) where the master does not. "
        "A single authoritative register is required."))
    s.append(Paragraph("15.3  Access scope matrix", H2))
    s.append(P(
        "Scope selection is uniform across modules because it is generated from the same scope list. The table therefore "
        "records availability rather than a per-module design decision, and the empty column is the finding."))
    s.append(table([
        ["Module", "Own records", "Below my level", "Same level (peers)", "Above my level"],
        ["Schemes", "Selectable", "Selectable", "Selectable", "Not exposed"],
        ["Users", "Selectable", "Selectable", "Selectable", "Not exposed"],
        ["Applications", "Selectable", "Selectable", "Selectable", "Not exposed"],
        ["Requests", "Selectable", "Selectable", "Selectable", "Not exposed"],
        ["Applicant Profile", "Selectable", "Selectable", "Selectable", "Not exposed"],
        ["Role and Access", "Selectable", "Selectable", "Selectable", "Not exposed"],
        ["Designation", "Selectable", "Selectable", "Selectable", "Not exposed"],
    ], [132, 84, 88, 92, 85]))
    s.append(P(
        "\u201cSelectable\u201d means the scope can be stored against a role. It does not mean the scope is applied when a list or "
        "record is served."))
    return s
