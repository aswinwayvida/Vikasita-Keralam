"""Roles and permissions, designations, hierarchy, data access."""

import diagrams as D
from reportlab.platypus import PageBreak, Spacer, Paragraph
from common import *


def roles_permissions():
    s = []
    s += h1("7", "Roles and Permission Model")
    s.append(Paragraph("7.1  Module catalogue", H2))
    s.append(P(
        "Seven modules are configured. The action set is deliberately uneven: schemes distinguishes list from detail "
        "visibility, requests uses assign and respond rather than edit, and users carries an additional team-visibility "
        "action. Any requirement that assumes uniform create-read-update-delete across modules is therefore wrong."))
    s.append(table([
        ["Module", "Label in UI", "Actions", "Count"],
        ["schemes", "Schemes", "view_list, view_details, create, edit, delete", "5"],
        ["party_workers", "Users", "view, create, edit, delete, view_teams", "5"],
        ["applications", "Applications", "view, create, edit, delete", "4"],
        ["help_desk", "Request", "view, assign_team_member, respond_reply", "3"],
        ["applicant_profile", "Applicant Profile", "create, edit, view, delete", "4"],
        ["roles", "Role and Access", "view, create, edit, delete", "4"],
        ["designations", "Designation", "view, create, edit, delete", "4"],
    ], [92, 106, 238, 45]))
    s.append(Paragraph("7.2  Prerequisite and cascade rules", H2))
    s.append(P(
        "Twenty-one actions declare prerequisites. The UI enforces them in both directions: granting a dependent action "
        "silently grants its prerequisites, and revoking a prerequisite removes every transitive dependent. This is the "
        "strongest implemented rule set in the domain and should be preserved when evaluation moves to the server."))
    s.append(table([
        ["Dependent action", "Requires", "Direction"],
        ["schemes.view_details", "schemes.view_list", "Grant implies prerequisite"],
        ["schemes.create / edit / delete", "view_list, view_details", "Grant implies prerequisites"],
        ["party_workers.create / edit / delete", "party_workers.view", "Grant implies prerequisite"],
        ["party_workers.view_teams", "party_workers.view", "Grant implies prerequisite"],
        ["applications.create / edit / delete", "applications.view", "Grant implies prerequisite"],
        ["help_desk.assign_team_member / respond_reply", "help_desk.view", "Grant implies prerequisite"],
        ["applicant_profile.create / edit / delete", "applicant_profile.view", "Grant implies prerequisite"],
        ["roles.create / edit / delete", "roles.view", "Grant implies prerequisite"],
        ["designations.create / edit / delete", "designations.view", "Grant implies prerequisite"],
    ], [186, 152, 143]))
    s.append(Paragraph("7.3  Role presets", H2))
    s.append(P("Seven presets seed the built-in library and the designation-derived roles. They are starting points, not enforced templates."))
    s.append(table([
        ["Preset", "Intended holder", "Seeded permissions"],
        ["State Admin", "Statewide administration", "Schemes view and edit, users full except delete, applications view/create/edit"],
        ["District Admin", "District operations", "Schemes view only, users view/create/edit plus teams, applications view/create/edit"],
        ["Constituency Admin", "Constituency operations", "Same shape as District Admin"],
        ["Local Body Admin", "Local body follow-up", "Schemes view, users view/create, applications view/create/edit"],
        ["Booth Admin", "Booth-level assistance", "Schemes view, users view, applications view/create"],
        ["User (party worker)", "Everyday worker", "Schemes view, applications view/create"],
        ["Custom", "Any bespoke role", "None; the administrator starts from the current selection"],
    ], [92, 120, 269]))
    s.append(Paragraph("7.4  Built-in and protected roles", H2))
    s.append(P(
        "The library combines preset-derived access roles with the designation-derived roles described in 7.5. A system "
        "flag marks built-ins as protected: create, edit and delete are refused, with a small number of exceptions for "
        "the state administrator, sub-administrator and support administrator roles so that the top of the hierarchy "
        "remains operable. Protection is a UI rule; no server enforces it."))
    s.append(Paragraph("7.5  Role and designation coupling", H2))
    s.append(P(
        "This is the most consequential design decision in the current implementation. For every designation whose level "
        "belongs to the six role levels, the platform synthesises a system role with the same name and the permissions of "
        "the matching preset. Twenty-two designations fall inside those six levels, so twenty-two roles appear in the "
        "library that nobody consciously created."))
    s += callout("Why this conflicts with the requirement",
                 "A party post is an organisational fact. A system role is a permission grant. Deriving one from the other "
                 "means appointing a Mandalam Secretary can change what a person may see and edit without anyone deciding "
                 "that it should. The requirement in FR-06 and business rule BR-01 is that designation never grants "
                 "permission. The current behaviour must be removed or explicitly approved as an exception.",
                 accent=RED, bg=colors.HexColor("#FCEDEC"))
    s.append(Paragraph("7.6  Delegation policy", H2))
    s.append(P(
        "A delegation policy table defines what an actor may hand out. It recognises only two actors: state_admin, which "
        "may grant anything statewide including access management, and party_worker, which may grant nothing. District, "
        "mandalam and booth administrators exist as labels and as seeded user categories but have no delegation policy, "
        "so delegated administration cannot be expressed today."))
    s.append(table([
        ["Actor", "Statewide delegation", "Access management", "Grantable actions"],
        ["state_admin", "Yes", "Yes", "All (wildcard)"],
        ["party_worker", "No", "No", "None"],
        ["Any other label", "Undefined", "Undefined", "Undefined; falls back to no delegation"],
    ], [120, 120, 110, 131]))
    return s


def designations():
    s = []
    s += h1("8", "Designation Management")
    s.append(Paragraph("8.1  Three designation registers", H2))
    s.append(P(
        "Designations are stored three times, in three shapes, for three different consumers. This is not a stylistic "
        "issue: the registers disagree on naming, and only one of them is edited by the Designation Master."))
    s.append(table([
        ["Register", "Location", "Shape", "Count", "Consumed by"],
        ["Legacy designation catalogue", "partyDesignations in party-workers.ts", "id, en, ml, level", "30 across 9 levels", "Designation-derived roles, assignment flows"],
        ["Seeded master", "DEFAULT_DESIGNATIONS_BY_LEVEL in RoleAccessSettings.tsx", "level to name list", "32 across 6 levels", "Designation Master tab, persisted to vikasita_managed_designations_v1"],
        ["User form map", "DESIGNATIONS_BY_ORG_LEVEL in admin.settings_.new-user.tsx", "level to name list", "32 across 6 levels", "Designation dropdown in Create User"],
    ], [84, 130, 74, 68, 125]))
    s.append(P(
        "The master and the user form contain the same 32 names, duplicated as separate constants. The legacy catalogue "
        "uses different conventions: at Mandalam level it offers \u201cMandalam President\u201d and \u201cMandalam Secretary\u201d where the "
        "master offers \u201cPresident\u201d and \u201cSecretary\u201d. Until one register is authoritative, a designation chosen in one "
        "screen may not match the designation reported in another."))
    s.append(Paragraph("8.2  Designation record", H2))
    s.append(table([
        ["Field", "Type", "Required", "Behaviour"],
        ["id", "String", "Yes", "Generated as DESIG-<timestamp> for new records; seeded records use DESIG-001 style ids"],
        ["name", "String", "Yes", "Trimmed; no uniqueness check, including within the same level"],
        ["orgLevel", "String", "Yes", "One of State, Region, Organisational District, Mandalam, Area, Booth"],
        ["parentDesignation", "String", "No", "Must match the name of another designation at the same level to affect rank"],
        ["rank", "Number", "Derived", "Parent rank plus one; otherwise 1, or 2 when a parent was named but not found"],
        ["status", "Active or Disabled", "Yes", "Disabled records remain visible in the master but are excluded from pickers"],
    ], [104, 96, 60, 221]))
    s.append(Paragraph("8.3  Lifecycle", H2))
    s.append(P(
        "Creation opens a dialog, captures a name, a level and an optional parent, computes the rank, and prepends the "
        "record to the master. Editing replaces name, level and parent and recomputes rank. Enable and disable toggle "
        "status in place. Delete removes the record after a confirmation prompt. A successful save also writes a "
        "one-shot session value so the caller can preselect the new designation when returning to a user form."))
    s.append(Paragraph("8.4  Validation as implemented", H2))
    s.append(table([
        ["Rule", "Implemented", "Note"],
        ["Name is mandatory", "Yes", "Error toast; the dialog stays open"],
        ["Name is trimmed", "Yes", "Surrounding whitespace removed"],
        ["Name is unique within a level", "No", "Duplicates are accepted"],
        ["Name is unique across levels", "No", "Duplicates are accepted"],
        ["Organisation level is valid", "Yes", "Chosen from a fixed list"],
        ["Parent exists at the same level", "Partial", "If not found, rank silently becomes 2"],
        ["Deletion checks assigned users", "No", "Users keep a stale designation string"],
        ["Disabled designations excluded from pickers", "Yes", "Filtered against active records"],
    ], [214, 76, 191]))
    s.append(Paragraph("8.5  Impact of change", H2))
    s += bullets([
        "Renaming a designation does not rewrite the designation string already copied onto user records, so historical users appear to hold a designation that no longer exists.",
        "Changing a designation\u2019s level does not revalidate the users assigned to it; they remain on the old level with a designation now belonging to another.",
        "Because designation-derived roles exist, a rename can also change role names that users still reference by id.",
        "Disabling a designation prevents new assignment but does not revoke it from existing holders.",
    ])
    return s


def hierarchy():
    s = []
    s += h1("9", "Organisational Hierarchy")
    s.append(Paragraph("9.1  Hierarchy as configured", H2))
    s.append(P(
        "The dashboard hierarchy data stops at revenue district. Organisational districts, mandalams, areas and booths are "
        "not nodes in that tree: the org districts exist as a lookup that maps a revenue district to one to three "
        "organisational districts, and the lower levels exist only inside the settings location master, which holds them "
        "in memory."))
    s.append(figure("9.1", "Organisation hierarchy and the strength of each level in the current code",
                    D.organisation_hierarchy, 445, D))
    s.append(table([
        ["Level", "Count in code", "Source", "Status"],
        ["Kerala State", "1", "orgHierarchyData", "Implemented"],
        ["Region", "3", "orgHierarchyData, partyRegions", "Implemented"],
        ["Revenue District", "14", "orgHierarchyData, geo module", "Implemented"],
        ["BJP Organisational District", "30", "ORG_DISTRICTS_MAP in users.ts", "Partial: mapping only"],
        ["Mandalam", "140 assumed", "scopeTypeOptions maps label to assembly constituency", "Partial: no node data"],
        ["Area", "Configurable", "Location master state", "Not modelled"],
        ["Booth", "Configurable", "Booth directory generator", "Not modelled: placeholder"],
    ], [132, 84, 196, 69]))
    s.append(Paragraph("9.2  Two level vocabularies", H2))
    s.append(P(
        "Two different level enumerations are in use, and they do not agree. Role assignment levels describe geography and "
        "administrative units; role organisation levels describe the party structure. The interface mixes both, which is "
        "why the same screen can offer \u201cDistrict\u201d and \u201cOrganisational District\u201d as if they were comparable."))
    s.append(table([
        ["Role organisation levels (6)", "Assignment levels (7)", "Difference"],
        ["State", "State", "Aligned"],
        ["Region", "(absent)", "Regions exist for roles but cannot be chosen as an assignment level"],
        ["Organisational District", "District", "Same word, different concept"],
        ["Mandalam", "Assembly Constituency", "Party structure versus electoral geography"],
        ["(absent)", "Local Body", "Not a party level"],
        ["(absent)", "Ward", "Not a party level"],
        ["Area", "(absent)", "Areas have no assignment level"],
        ["Booth", "Booth", "Aligned"],
    ], [146, 146, 189]))
    s.append(P(
        "The consequence is practical. A role can be restricted to the six party levels, while a user is described with "
        "one of seven geographic or administrative levels. The two lists are matched only by string comparison in a few "
        "places, so a user at \u201cDistrict\u201d is not automatically recognised as being at \u201cOrganisational District\u201d."))
    s.append(Paragraph("9.3  Geographic versus organisational", H2))
    s.append(P(
        "Kerala has 14 revenue districts. The party organises across 30 organisational districts, several of which split a "
        "revenue district. Both concepts are real and both are needed, but they answer different questions: revenue "
        "district is where a citizen lives and where government schemes are administered; organisational district is "
        "which party unit a functionary reports to. The data model should carry both, with the organisational district "
        "linked to its parent revenue district rather than replacing it."))
    s.append(Paragraph("9.4  Missing structure", H2))
    s += bullets([
        "<b>Mandalam.</b> The label is mapped to assembly constituency for scoping, but there is no record set of 140 mandalams, no parent link and no identifier.",
        "<b>Area and Booth.</b> Both are created ad hoc in the location master and discarded on reload. The booth directory generates six booths per constituency as placeholder data and must not be presented as official.",
        "<b>Reporting lines.</b> No user-to-user reporting relationship exists, so \u201cbelow my level\u201d cannot be resolved to specific people.",
        "<b>Unit identifiers.</b> Location assignments are stored as display names joined into a string, not as references to unit records.",
    ])
    return s


def data_access():
    s = []
    s += h1("10", "Data Access Scope")
    s.append(Paragraph("10.1  The four scopes", H2))
    s.append(P("Four scopes are defined. Their meanings are stated in the interface and in code comments, but no query applies them."))
    s.append(table([
        ["Scope id", "Label", "Intended meaning", "Exposed in create/edit"],
        ["own_records", "Own Records", "Records created by, or explicitly assigned to, the current user", "Yes"],
        ["below_level", "Below My Level", "Records belonging to organisationally subordinate users or units", "Yes"],
        ["same_level", "Same Level \u2014 Peers", "Records belonging to users at the same relevant organisational level", "Yes"],
        ["above_level", "Above My Level", "Records belonging to organisationally superior users or units", "No: filtered out"],
    ], [72, 92, 246, 71]))
    s += callout("Important",
                 "The above-level scope is defined in the data model and has translations, but both the create-role and "
                 "create-user screens remove it from the choices. It cannot be granted through the interface today. Either "
                 "the scope is removed from the vocabulary or the control is restored with a clear policy on when upward "
                 "visibility is legitimate.",
                 accent=BLUE, bg=PALE_BLUE)
    s.append(Paragraph("10.2  How scope is selected and stored", H2))
    s.append(P(
        "Scope is configured per module, not per role. Each module row in the permission matrix carries its own set of "
        "scope toggles, and every action within that module can be granted independently at each selected scope. The "
        "combination is stored as a flat string key of the form module.scope.action, for example "
        "applications.below_level.edit. A separate dataAccess map records which scopes are enabled for each module, and a "
        "scopedPermissions array records the individual keys."))
    s.append(table([
        ["Aspect", "Implementation"],
        ["Granularity", "Module, then scope, then action"],
        ["Selection", "Independent toggles; multiple scopes may be combined for one module"],
        ["Key format", "module.scope.action"],
        ["Storage", "dataAccess map plus scopedPermissions array on the role record"],
        ["Default for a new role", "All supported scoped keys selected when the administrator uses \u201cselect all\u201d"],
        ["Enforcement", "None at query time"],
    ], [140, 341]))
    s.append(Paragraph("10.3  Semantics that remain undefined", H2))
    s.append(P("The following questions cannot be answered from the code. Each needs a business decision before server-side enforcement is written."))
    s.append(table([
        ["Question", "Why it matters", "Current answer"],
        ["Does \u201cbelow\u201d mean all descendants or only direct reports?", "Determines whether a state administrator sees a booth worker through four levels", "Not defined"],
        ["Do \u201cpeers\u201d mean the same unit or everyone at that level statewide?", "A peer scope could expose every district in Kerala", "Not defined"],
        ["Does \u201cabove\u201d stop at the line manager or extend to the top?", "Upward visibility is a sensitive capability", "Not defined; scope not exposed"],
        ["How are overlapping scopes combined?", "Union would be permissive; intersection would be restrictive", "Multiple scopes can be selected; combination rule absent"],
        ["Does scope apply equally to read, edit, delete, export and approve?", "Editing another unit\u2019s record may be acceptable where reading it is not", "One scope set per module; no per-action scope distinction"],
        ["How is a record attributed to a unit?", "Scope needs an owner or unit on every record", "No ownership field on access-controlled records"],
    ], [150, 220, 111]))
    return s
