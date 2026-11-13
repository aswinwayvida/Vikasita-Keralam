# Role & Access Control and Designation Management

**Project:** Vikasita Keralam - Admin Platform  
**Document:** VK-RCD-MGT-001  
**Version:** 1.0  
**Date:** 13 November 2026  
**Document type:** Current-state management guide, source-code verified  
**Scope:** Roles, access control, permissions, user assignment, designations and organisation levels  
**Implementation status:** Client prototype. No server-side authorisation enforcement was verified in this repository.

> This is a documentation-only deliverable. No application page, module, route, component, permission, designation, API, data record or configuration was changed.

---

## Document control

| Item | Detail |
|---|---|
| Prepared for | Vikasita Keralam programme office, product leadership, engineering and administration |
| Evidence base | Direct inspection of the Vikasita Keralam source repository |
| Reference format | HRMS - Role & Access Management document supplied by the requester |
| Source of truth | Vikasita Keralam code and data definitions, not the reference document |
| Review trigger | Any change to roles, permission actions, data scope, designations or organisation levels |
| Persistence verified | Browser `localStorage`; no backend API or database table was verified for these records |
| Enforcement verified | UI and client state only; no server-side access guard or query-level data filter was verified |

### Status language used in this document

| Status | Meaning |
|---|---|
| **Implemented** | Verified in source code and available through the current UI or client workflow. |
| **Partially implemented** | Some workflow exists, but important validation, enforcement or consistency is missing. |
| **UI only / stored** | A control or value exists, but no verified runtime or server-side enforcement was found. |
| **Not implemented / not verified** | No corresponding implementation or enforcement was found in the inspected repository. |

---

## 1. Purpose

The Role & Access module controls what an administrator can assign and what a user is permitted to view or manage in Vikasita Keralam. The current implementation provides:

- A role catalogue with search, status, assignment counts and actions.
- Role creation and editing with module permissions.
- A seven-module permission catalogue covering 29 actions.
- Automatic permission prerequisites, such as View before Create, Edit or Delete.
- A separate administrative-permission layer for role management, access assignment and access delegation.
- Per-module data-access scopes: Own Records, Below My Level, Same Level - Peers and Above My Level.
- Role assignment to one or many users through search, filters and multi-select.
- Duplication of an existing role without changing the original.
- Role activation and deactivation.
- A designation catalogue with organisation-level filtering, parent-derived rank, status and reordering.
- A mobile settings mirror for roles and designations.

### HRMS-to-Vikasita mapping

The supplied HRMS document uses a company/department/employee vocabulary. Vikasita Keralam uses a different domain vocabulary. The equivalents used in this document are:

| HRMS concept | Vikasita Keralam equivalent |
|---|---|
| Company | Organisation level or organisational unit |
| Department | Module and its permitted actions; organisational scope where selected |
| Employee | Admin user or party worker |
| Employee designation | Party designation from the designation catalogue |
| Own + Team records | Own Records, Below My Level and Same Level - Peers, selected per module |
| Custom company/department/employee access | Per-module data scope plus organisation and location assignment |

The organisation level, designation, role and data scope are separate concepts. A designation does not automatically grant system permissions. A role does not automatically define the user's party rank. Data scope does not replace module permission. The effective access policy should combine all of them, but only the client-side configuration was verified.

### Verified system map

```text
Admin Settings  /admin/settings
  |- Roles and Control       -> Roles tab, Users tab
  |- Designations            -> Designation catalogue
  |- Organisational Charts   -> Hierarchy reference
  `- Location Management     -> Organisation units and assignments

Role authoring
  |- /admin/settings_/new-role       -> full-page create/edit
  |- RoleEditorDialog                -> dialog create/edit
  `- /admin/settings_/assign-role    -> user role and permission override

Mobile mirror
  |- MobileRolesPage                 -> list, create/edit, duplicate, delete, assign workers
  `- MobileSettingsPage              -> designations and organisation-level view
```

---

## 2. Role List

The Roles tab at `/admin/settings?tab=roles` displays the role catalogue. The verified desktop table fields are:

| Field | Description |
|---|---|
| **Role Name** | Role label shown to administrators. |
| **Description** | Purpose of the role, or an empty value when none has been entered. |
| **Users Count** | Number stored in the role record as `assignedUsers`. |
| **Status** | Active or Inactive. |
| **Actions** | Row actions for the selected role. |

The role table also supports row selection, search, column visibility, column ordering, CSV export and CSV import. The mobile list mirrors the main actions in a compact card layout.

### Verified row actions

| Action | Behaviour | Rule or limitation |
|---|---|---|
| **Edit** | Opens the role editor. The full-page route uses `?editRoleId=`. | Built-in system roles are protected, except the page-level Admin, Sub Admin and Support Admin records. |
| **Assign** | Opens the user-assignment drawer with search and organisation filters. | One role value is stored on each user record. |
| **Duplicate** | Creates an editable copy of the role and its permissions. The name becomes `<role> (copy)`, then `(copy) 2`, `3`, and so on. | The original role is unchanged. |
| **Delete** | Removes the role after confirmation. | Built-in roles are protected. Page-level Admin, Sub Admin and Support Admin can be deleted. |
| **Status control** | Moves a custom role between Active and Inactive. | Deactivation blocks new assignments; existing assignments remain. If users are assigned, an acknowledgement is required. |

### Page-level built-in roles

These three records are created or maintained by the Role & Access page:

| Display name | Internal ID | Organisation scope | Administrative permissions | Purpose |
|---|---|---|---|---|
| **Admin** | `system_state_admin` | State | Role management, Access assignment, Access delegation | Full page administration. |
| **Sub Admin** | `system_sub_admin` | State | Role management, Access assignment | Statewide sub-administration without delegation. |
| **Support Admin** | `system_support_admin` | State | None | Citizen requests, support cases and follow-ups. |

### Seeded access-role presets

The data model also defines six access-role presets. Their user counts are seed values in source, not live employment counts.

| Seeded role | Assignment level | Administrative permissions | Seed assigned users |
|---|---|---|---:|
| State Admin | State | Role management, Access assignment, Access delegation | 4 |
| District Admin | District | Access assignment | 14 |
| Constituency Admin | Assembly Constituency | Access assignment | 42 |
| Local Body Admin | Local Body | Access assignment | 118 |
| Booth Admin | Booth | None | 326 |
| User (`party_worker`) | Ward, Booth, Party Organisational Unit | None | 1,284 |

The Roles & Access page filters system roles and displays its three page-level built-ins plus custom roles. The six presets remain part of the role data and preset logic.

---

## 3. Creating a Role

The administrator can start role creation from the Roles tab. The inspected implementation contains two desktop authoring paths and one mobile path:

1. **Full-page role editor** at `/admin/settings_/new-role`.
2. **Role editor dialog** used by the roles page for create and edit.
3. **Mobile role form** inside `MobileRolesPage`.

The full-page and dialog paths do not expose exactly the same fields. This is recorded as an implementation inconsistency, not as intended behaviour.

### New Role fields

| Field | Required | Verified behaviour |
|---|---:|---|
| **Role Name** | Yes | Must not be blank. Dialog and mobile paths reject a duplicate name case-insensitively. The full-page save handler checks a non-empty name but does not contain the same duplicate-name check. |
| **Description** | No | Free text describing the role purpose. |
| **Status** | No | Active or Inactive. The mobile form and dialog expose this control; the full-page create handler initialises new roles as Active. |
| **Allowed Assignment Levels** | Yes in the role dialog | State, Region, Organisational District, Mandalam, Area or Booth. The full-page create handler currently writes `state` only. |
| **Module Permissions** | Yes | At least one module/action permission is required. |
| **Data Access** | Yes by module default | Every module defaults to Own Records. Multiple scopes can be combined. |
| **Administrative Permissions** | No | Role management, Access assignment and Access delegation. The full-page create handler currently writes an empty list. |

### Creation workflow

```text
Roles list
  -> New Role or Create New Role
  -> Enter role identity
  -> Select allowed assignment levels where the editor supports them
  -> Select module and action permissions
  -> Select data access for each module
  -> Optionally grant administrative permissions
  -> Set status
  -> Save
  -> Assign users or skip
  -> Role becomes available in the catalogue
```

### Validation rules

- Role name is mandatory.
- The role dialog and mobile form reject duplicate names case-insensitively.
- At least one allowed assignment level is required in the dialog.
- At least one module permission is required.
- View is automatically added as a prerequisite for Create, Edit or Delete.
- Removing View removes every permission that depends on it.
- Schemes View Details requires Schemes View List.
- Saving the full-page editor opens the Assign Users sheet; assignment may be skipped.

### Implementation status

**Partially implemented.** The create and save workflow exists, but field coverage differs by authoring surface. A role created through the full-page route is fixed to the State assignment level and receives no administrative permissions unless edited through another path.

---

## 4. Module Permissions

Module permissions define what a role can do. The repository defines seven modules and 29 underlying actions.

| Module | Permission ID | Actions | Prerequisite |
|---|---|---|---|
| Applicant Profile | `applicant_profile` | View, Create, Edit, Delete | Create, Edit and Delete require View |
| Applications | `applications` | View, Create, Edit, Delete | Create, Edit and Delete require View |
| Schemes | `schemes` | View List, View Details, Create, Edit, Delete | View Details requires View List; Create, Edit and Delete require View List and View Details |
| Role & Access | `roles` | View, Create, Edit, Delete | Create, Edit and Delete require View |
| Designation | `designations` | View, Create, Edit, Delete | Create, Edit and Delete require View |
| Users (`party_workers`) | `party_workers` | View, Create, Edit, Delete, View Teams | Create, Edit, Delete and View Teams require View |
| Request (`help_desk`) | `help_desk` | View, Assign Team Member, Respond/Reply | Assign and Respond/Reply require View |

### Matrix presentation

The primary matrix exposes Create, View, Edit and Delete. Module-specific actions are represented as follows:

- **Schemes:** the View matrix column maps to View List and View Details.
- **Users:** View Teams is exposed as a separate Team row or secondary matrix control.
- **Request:** Assign and Respond/Reply are exposed as secondary actions.

### Permission keys

The code stores module permissions as `module.action`, for example:

```text
schemes.view_list
schemes.view_details
party_workers.view_teams
help_desk.assign_team_member
applications.create
roles.edit
designations.delete
```

Scoped permissions use `module.scope.action`, for example `applications.below_level.view`.

### Select-all behaviour

The editor provides Select All for module permissions and per-module All controls for data access. The administrator can later remove individual actions. Unsupported actions are not rendered for a module.

### Implementation status

**Implemented in the client.** The permission catalogue, matrix interaction, prerequisite cascade and scoped-permission serialization are present. **Server-side enforcement is not verified.**

---

## 5. Data Access

Module permission controls *what* a user can do. Data access controls *whose records* the action may apply to. Data access is configured separately for each module and can be combined.

| Access scope | Intended meaning | Current implementation |
|---|---|---|
| **Own Records** | Records created by or explicitly assigned to the signed-in user. | Default for every module; stored in `dataAccess`. |
| **Below My Level** | Records belonging to subordinate organisational units. | Selectable and stored; query-level enforcement not verified. |
| **Same Level - Peers** | Records belonging to peer units at the same organisational level. | Selectable and stored; query-level enforcement not verified. |
| **Above My Level** | Records belonging to superior organisational units. | Defined in the model and available in the full assign-role route; excluded from several create/edit surfaces. |

### Selection rules

- Every module starts with Own Records.
- The administrator may select multiple scopes for the same module.
- Scopes are stored in a canonical order.
- The full-page role editor, user editor and mobile matrix expose Own, Below and Peers, but exclude Above.
- `/admin/settings_/assign-role` can initialise all four scopes, including Above, especially for the Admin preset.
- The code stores scoped keys such as `applications.own_records.view` and `applications.below_level.edit`.

### Interpretation still requiring approval

The repository does not define all boundary semantics explicitly. The following rules require an approved business decision before backend implementation:

- Whether **Below My Level** includes every descendant unit or only direct children.
- Whether **Same Level - Peers** means one organisation unit or the whole organisational level.
- Whether **Above My Level** includes all ancestors or only direct managers.
- Whether record ownership, assignee, location and organisation unit are all evaluated, or only one of them.
- How overlapping scopes are combined when a user is assigned to multiple locations.
- Whether read, edit, delete, export and approval are filtered independently.

### Implementation status

**Stored in the client; not verified as enforced.** The UI and data model support the vocabulary, but no backend query filter or authorisation guard was found in the inspected repository.

---

## 6. Clone Existing or Duplicate a Role

Vikasita Keralam uses **Duplicate** rather than a separate Clone menu.

| Step | Behaviour |
|---|---|
| 1 | Open the role row action menu. |
| 2 | Select Duplicate. |
| 3 | The role name becomes `<role> (copy)`, then `(copy) 2`, `(copy) 3`, and so on. |
| 4 | Permissions, administrative permissions and per-module data access are copied. |
| 5 | The copied role opens in an editable state on the desktop. |
| 6 | The original role remains unchanged. |

On mobile, Duplicate immediately creates a new Active custom role with the next copy name. The administrator can then edit it.

**Status:** Implemented in the client. The copied role starts with zero assigned users.

---

## 7. Editing a Role

The administrator can edit a custom role or an editable page-level built-in role. The editor supports:

- Role name.
- Description.
- Allowed assignment levels, where the editor surface exposes them.
- Module and action permissions.
- Per-module data access.
- Administrative permissions, where the editor surface exposes them.
- Active or Inactive status, where the editor surface exposes it.

When the role has assigned users, the desktop editor displays a warning such as **"Saving permission changes applies the updated role to every user currently assigned to it."** The save button can show the affected user count.

**Rule:** Permission changes are applied to the role record and therefore affect every user whose `assignedRole` points to that role. The code does not create a per-user snapshot of the role permissions.

**Status:** Implemented in the client. Propagation is by role lookup, not by a server-side permission service.

---

## 8. Deactivating, Reactivating and Deleting a Role

### Deactivate

Deactivating a custom role keeps the role record and its existing user assignments, but blocks new assignments. If the role has assigned users, the confirmation requires the administrator to acknowledge that the affected users must be reviewed and reassigned where required.

### Reactivate

Reactivating changes the status back to Active and makes the role available for assignment again.

### Delete

Deleting a role removes it from the role catalogue after confirmation. The desktop role-table delete action uses a browser confirmation. The mobile delete flow uses a bottom-sheet confirmation.

### Important limitations

- Built-in system roles are protected from deletion, except the page-level Admin, Sub Admin and Support Admin records, which the page allows the administrator to delete.
- The desktop role delete action does not verify whether users are still assigned.
- The mobile delete warning states that assigned users will lose the role, but the code does not perform a full reassignment workflow.
- Deleting a role does not delete user profiles.

**Status:** Deactivation and reactivation are implemented. Safe deletion with complete assignment remediation is **partially implemented**.

---

## 9. User Assignment

The **Users** tab displays the people who can receive roles.

### Verified user-table fields

| Field | Description |
|---|---|
| **User** | Name and profile identity. |
| **Role** | Currently assigned role value. |
| **Area** | Local-body or area reference. |
| **Organisational District** | Party organisational district. |
| **Contact** | Mobile or other displayed contact value. |
| **Status** | Active, Pending, Verified or Inactive, depending on the user record. |
| **Actions** | Edit, view, assign role, activate/deactivate and delete, depending on the row control. |

### Assignment workflow - Roles tab drawer

```text
Roles tab
  -> Assign on a role
  -> Search users by name, designation, constituency or district
  -> Filter by designation, region, organisational district, mandalam, area and booth
  -> Select one or more users
  -> Save assignment
  -> assignedUsers count is updated on the role
```

The drawer provides Select All and Deselect All for the filtered result. It displays the current role holders as pre-selected when their assignment matches the role display name.

### Assignment workflow - full assign-role route

`/admin/settings_/assign-role` provides a broader user-permission screen:

- Role options: Admin, Sub Admin, Support Admin, Specific Role.
- A module-permission matrix.
- Per-module data-access selection.
- Save and Update.

This route can store per-user permission overrides in addition to the role label.

### Mobile assignment

The mobile roles page assigns party workers through `assignedWorkerIds` and updates `assignedUsers`. It supports worker search and district filtering.

### Assignment rules and limitations

- **One role per user.** The user record stores a single `assignedRole` value. A multi-role membership model was not verified.
- **Role-level propagation.** Updating the role affects all users whose role label resolves to that role.
- **Bulk assignment.** Multiple selected users can receive the same role.
- **Deselection side effect.** In the desktop role-assignment drawer, a user previously assigned to the role but left unselected is reassigned to **Sub Admin**, not left unassigned. This is a confirmed implementation limitation.
- **Status check.** User activation and deactivation are separate from role status.

**Status:** Assignment is implemented in the client. Removal semantics and server enforcement are incomplete.

---

## 10. Important Access Rules

1. **View before action.** A role must have View before Create, Edit or Delete in the same module.
2. **Prerequisites cascade.** Removing the prerequisite removes dependent permissions.
3. **Module and data access are separate.** A module action does not define record visibility, and a data scope does not grant an action.
4. **Administrative permissions are separate.** Role management, access assignment and access delegation are not ordinary module actions.
5. **Deny by default is the intended policy.** Effective access should be allowed only when an active user, active role, module action and matching data scope exist.
6. **One role value per user is the current model.** Per-user overrides exist on the assign-role route, but a formal multi-role model was not verified.
7. **Role changes affect existing holders.** Editing a role changes the permission set read through that role for all assigned users.
8. **Deactivation is a guard, not a role deletion.** Existing assignments remain, but new assignments should be blocked.
9. **Designation does not grant access automatically.** A designation is organisational identity. A role grants system permissions.
10. **System roles are protected.** The client blocks deletion of built-in role records, with the page-level Admin/Sub Admin/Support Admin exception noted above.
11. **Server enforcement is mandatory for security.** The current client-side checks and stored values must not be treated as production authorisation.

### Intended access-evaluation chain

```text
1. Session is valid
2. User account is active
3. Assigned role is resolved
4. Module permission exists
5. Specific action is permitted
6. Data scope is resolved for the module
7. Organisation or location scope matches
8. Allow, otherwise deny
9. Record the access decision where audit is required
```

**Verified status:** Steps 1-3 are represented in the client. Steps 4-7 are configured and stored. A server-side implementation of the full chain was not verified.

---

## 11. Users Page

The Users tab is the Vikasita equivalent of the HRMS Employees page. It allows an administrator to:

- View users and their assigned roles.
- Search users.
- Filter by designation, region, organisational district, mandalam, area, booth, role and status.
- Edit user details.
- Assign or change a role.
- Activate or deactivate a user.
- Delete a user record.
- Export or import user data as CSV.

### User detail and role changes

The user editor captures the user's name, contact details, organisation level, designation, role and assignment scope, depending on the route or dialog. The designation picker is filtered by the selected organisation level. Changing the organisation level resets the designation field.

### Removing access

- Deactivating a user prevents active use without deleting their profile.
- Deleting a user removes the user record; this is different from unassigning a role.
- The role-assignment drawer's deselection behaviour currently moves an affected user to **Sub Admin**. It is not a clean "Unassigned" operation.
- Removing or changing a role must not delete the user's profile or other records. This is a required business rule; the current routes support user records separately from roles.

**Status:** User listing, filtering, editing and role assignment are implemented in the client. A complete, audited role-removal flow is **partially implemented**.

---

## 12. Designation Management

A designation describes the user's organisational identity, such as State President, District Secretary or Booth Committee Member. It is maintained in the Designations tab and the mobile Designations screen.

### Designation list fields

| Field | Description |
|---|---|
| **Designation** | Name of the party designation. |
| **Organisation Level** | State, Region, Organisational District, Mandalam, Area or Booth. |
| **Assigned Users** | User count computed by matching the designation name against user records. The desktop column is hidden by default. |
| **Status** | Active or Disabled. |
| **Actions** | Move up, move down, edit, disable/enable and delete. |

### Create or edit designation

| Field | Required | Behaviour |
|---|---:|---|
| **Designation Name** | Yes | Must not be blank. No case-insensitive duplicate-name validation was verified. |
| **Organisation Level** | Yes | Determines the level filter used when assigning a user. |
| **Parent Designation** | No | Must belong to the same organisation level. Rank is derived as `parent.rank + 1`; a top-level designation receives rank 1. |

### Designation workflow

```text
Settings
  -> Designations tab
  -> Create New Designation
  -> Enter name and organisation level
  -> Optionally choose a same-level parent designation
  -> Save
  -> Designation becomes available for user assignment at that level
```

### Status and ordering

- Active designations appear in the user designation picker.
- Disabled designations are hidden from new user assignment.
- Move Up and Move Down change the displayed rank order within the filtered catalogue.
- Bulk enable, disable and delete are available on desktop.
- Deleting a designation removes it from the catalogue after confirmation; the inspected desktop handler does not check for assigned users first.
- On mobile, deletion is stored as a hidden designation ID.

### Storage

Desktop designations are stored under `vikasita_managed_designations_v1`. Mobile custom designations, overrides and hidden IDs use separate `localStorage` keys. No designation API or database table was verified.

### Implementation status

**Partially implemented.** The catalogue, level filter, parent rank, status and user-picker filtering exist. Duplicate prevention, safe deletion of assigned designations and server persistence are incomplete or not verified.

---

## 13. Designation Catalogue

Two designation seed sources exist in the repository. They are not identical.

### 13.1 Desktop Designation Master default catalogue

The designation master in `RoleAccessSettings.tsx` seeds 32 designations:

| Organisation level | Count | Seeded designations |
|---|---:|---|
| State | 7 | President, Vice President, General Secretary, General Secretary (Organisation), Secretary, Treasurer, Executive Member |
| Region | 4 | President, In-charge, Coordinator, Cluster In-charge |
| Organisational District | 7 | President, Vice President, General Secretary, General Secretary (Organisation), Secretary, Treasurer, Executive Member |
| Mandalam | 6 | President, Vice President, General Secretary, Secretary, Treasurer, Committee Member |
| Area | 4 | Kendra Convener, Area Coordinator, Area In-charge, Area Committee Member |
| Booth | 4 | President, Secretary, Committee Member, Worker |

### 13.2 Party-designation seed catalogue

`partyDesignations` in the shared party-worker data contains a different set of 30 designations for the role-organisation levels:

| Organisation level | Count | Seeded designations |
|---|---:|---|
| State | 6 | State President, Vice President, General Secretary, Secretary, Treasurer, Committee Member |
| Region | 3 | Regional President, Regional In-charge, Regional Coordinator |
| Organisational District | 6 | District President, Vice President, General Secretary, Secretary, Treasurer, Committee Member |
| Mandalam | 6 | Mandalam President, Vice President, General Secretary, Secretary, Treasurer, Committee Member |
| Area | 4 | Area President, Area Secretary, Area Coordinator, Area Committee Member |
| Booth | 5 | Booth President, Booth Secretary, Booth Agent, Booth Committee Member, Karyakarta |

The legacy party-designation list also contains levels for Assembly Constituency, Local Body, Ward and Party Organisational Unit. Those are assignment levels in the broader access model, but not part of the six-level `roleOrganisationLevels` list.

### Confirmed data gap

The desktop Designation Master, mobile designation screen, new-user designation picker and shared party-designation register do not use one canonical catalogue. Names such as **President** versus **State President**, **Executive Member**, **Karyakarta** and **Booth Agent** differ between sources. This can produce inconsistent role names, picker options and reports.

**Recommendation:** Approve one master designation catalogue and migrate all screens to it before production.

---

## 14. Organisation Levels and Hierarchy

### 14.1 Role organisation levels

The role model uses six organisation levels:

```text
State
  -> Region
  -> Organisational District
  -> Mandalam
  -> Area
  -> Booth
```

### 14.2 Location master reference values

The Location Management screen contains reference counts for 1 State, 3 Regional Clusters, 30 Organisational Districts, 140 Assembly Constituencies as Mandalams, Local Area Clusters and 25,000+ Booth Units. These are configuration/reference figures in the UI data, not live counts from a backend.

### 14.3 Confirmed hierarchy inconsistency

The region data is not consistent across the repository:

- `partyRegions` defines three regions: South, Central and North.
- The user form region options also define three regions.
- The Location Management reference table defines four region rows: Northern, Central, Southern and Far Southern.
- The location rows still total 30 organisational districts, so the district total is consistent even though the region grouping differs.

This must be reconciled before role assignment, designation filtering or reporting is migrated to a server.

### 14.4 Legacy assignment levels

The broader assignment-level vocabulary also contains:

- District (government district)
- Assembly Constituency
- Local Body
- Ward
- Party Organisational Unit

These are not identical to the six role-organisation levels. The document uses **Organisation Level** for the role hierarchy and **Assignment Level** for the broader user-location model.

### Organisation grid

| Level | Parent | Typical use | Verified reference |
|---|---|---|---|
| State | None | Statewide administration | 1 unit |
| Region | State | Regional administration | 3 or 4 depending on source; inconsistency confirmed |
| Organisational District | Region | District administration | 30 units |
| Mandalam | Organisational District | Constituency-based organisational unit | 140 reference units |
| Area | Mandalam | Local area coordination | Configurable |
| Booth | Area or constituency context | Booth-level work | 25,000+ reference units |

---

## 15. Role versus Designation

| Dimension | Role | Designation |
|---|---|---|
| Primary purpose | Functional system access | Organisational identity |
| Grants module permissions | Yes | No, unless a role is separately assigned |
| Grants administrative permissions | Yes, when configured | No |
| Linked to organisation level | Through allowed assignment levels | Yes, one organisation level per designation |
| Assigned to users | Yes | Yes |
| Drives data visibility | Through per-module data scope | Indirectly, through organisation/location placement |
| Status effect | Inactive blocks new role assignments | Disabled hides the designation from new user assignment |
| Deletion effect | Removes the role; users must be reviewed | Removes or hides the designation option; assigned users are not automatically remediated |
| Current model | Single role value per user | One designation value per user |

**Business rule:** Designation and role must remain independent unless an approved rule explicitly creates a mapping. The current code uses designation-based role presets in some generated data, so this boundary needs an explicit product decision.

---

## 16. Requirements and Implementation Status

| ID | Requirement | Priority | Status | Evidence |
|---|---|---|---|---|
| R-01 | View the role catalogue with search, filters, status and counts | High | Implemented | `RoleAccessSettings.tsx` |
| R-02 | Create a custom role | High | Partially implemented | Two desktop authoring paths with different fields; mobile form |
| R-03 | Edit role name, description, permissions and data scope | High | Implemented | `RoleEditorDialog.tsx`, `new-role.tsx` |
| R-04 | Enforce unique role names | High | Partially implemented | Dialog/mobile check; full-page save does not |
| R-05 | Assign 7 modules and 29 actions | High | Implemented | `party-workers.ts` |
| R-06 | Enforce permission prerequisites | High | Implemented | `withPrerequisites`, `withoutDependentPermissions` |
| R-07 | Configure per-module data access | High | Stored in client | `RoleDataAccess`, `dataAccessOptions` |
| R-08 | Grant administrative permissions separately | Medium | Implemented in dialog | `administrativePermissionOptions` |
| R-09 | Duplicate a role and its permissions | Medium | Implemented | `nextRoleCopyName`, duplicate handlers |
| R-10 | Activate and deactivate roles | Medium | Implemented | Role status dialog |
| R-11 | Delete a role safely | High | Partially implemented | Confirmation exists; assignment remediation does not |
| R-12 | Assign one role to many users | High | Implemented in client | Users tab, assign drawer, assign-role route |
| R-13 | Support multiple roles per user | Medium | Not implemented / not verified | Single `assignedRole` value |
| R-14 | Maintain a designation catalogue | High | Implemented in client | Designation tab, mobile screen |
| R-15 | Filter designations by organisation level | High | Implemented | User editor, designation screen |
| R-16 | Derive designation rank from a parent | Medium | Implemented | `parent.rank + 1` |
| R-17 | Prevent duplicate designations | Medium | Not verified | No duplicate check found |
| R-18 | Protect designation deletion when users are assigned | High | Not implemented | Delete confirmation has no assignment check |
| R-19 | Enforce effective access on the server | Critical | Not verified | No API/query guard found |
| R-20 | Record an audit trail for access changes | High | Not implemented | No audit store found |
| R-21 | Provide a canonical designation catalogue | High | Not implemented | Two inconsistent seed lists |
| R-22 | Provide consistent region hierarchy | Medium | Not implemented | Three-region and four-region definitions |

---

## 17. Confirmed Gaps and Open Decisions

### Confirmed gaps

| Gap | Impact | Priority | Recommended action |
|---|---|---|---|
| No verified server-side RBAC | Client controls can be bypassed | Critical | Enforce module, action and scope in backend APIs and queries |
| Data scope not verified in data queries | Own/Below/Peer visibility may be advisory | Critical | Apply verified scope filters to every list, detail and export endpoint |
| No audit log | Access changes cannot be traced | High | Store actor, target, timestamp, before/after values and reason |
| Single role per user | Cannot combine duties without overrides | Medium | Decide whether multi-role or one-role-plus-overrides is the target |
| Deselecting a role holder reassigns to Sub Admin | Unexpected privilege change | Critical | Replace with explicit Unassigned or reviewed transfer flow |
| Role deletion does not remediate users | Users can retain stale role labels | High | Block deletion or require reassignment before commit |
| No designation duplicate check | Ambiguous picker options and reporting | Medium | Add unique name + level validation |
| Designation deletion ignores assigned users | Dangling designation references | High | Block deletion or require reassignment |
| Two designation catalogues | Inconsistent labels and counts | High | Approve one master data source |
| Region grouping inconsistency | Assignment and reporting mismatch | Medium | Reconcile 3-region and 4-region definitions |
| Two desktop role editors with different fields | Roles may lack levels/admin rights depending on path | High | Consolidate into one canonical editor |
| Above scope hidden in several surfaces | Role behaviour differs by authoring path | Medium | Decide whether Above is supported and expose it consistently |
| No verified backend persistence | Records are browser-local and device-specific | Critical | Define database schema, migration and ownership |

### Decisions required before production build

1. Is one role plus per-user overrides the intended model, or must users hold multiple roles?
2. What exactly do Below, Peer and Above mean across the State-Region-District-Mandalam-Area-Booth hierarchy?
3. Does a designation ever imply a default role, or must the two remain strictly independent?
4. Which persistence service replaces `localStorage`, and who owns migration?
5. Which role/deletion/designation changes require dual approval or audit?
6. Is the page-level Admin/Sub Admin/Support Admin trio a permanent exception to system-role protection?
7. Which region model is authoritative: three regions or four operational regions?

---

## 18. Source References

### Core data and model

- `src/data/role-management.ts` - managed role model, status, role drafts, administrative permissions, data-access options, scoped permissions, copy names, built-in roles, page-level Admin/Sub Admin roles and local storage.
- `src/data/party-workers.ts` - seven permission modules, 29 actions, prerequisites, assignment levels, role-organisation levels, role presets, party designations and delegation policy.

### Desktop role and designation UI

- `src/routes/admin.settings.tsx` - Settings route and tab entry points.
- `src/components/admin/RoleAccessSettings.tsx` - role table, users table, assignment drawer, designation master, status dialogs, export/import and local storage.
- `src/components/admin/RoleEditorDialog.tsx` - dialog role creation/editing, allowed levels, module matrix, data access and administrative permissions.
- `src/components/admin/RoleViewDialog.tsx` - role detail view.
- `src/routes/admin.settings_.new-role.tsx` - full-page role creation and editing.
- `src/routes/admin.settings_.assign-role.tsx` - user role assignment and per-user permission overrides.
- `src/routes/admin.settings_.new-user.tsx` - user creation/editing with organisation level, designation and role.
- `src/routes/admin.settings_.user-details.tsx` - user detail route.

### Mobile UI

- `src/components/admin/MobileRolesPage.tsx` - mobile role list, create/edit, duplicate, delete and worker assignment.
- `src/components/admin/MobileRolePermissionMatrix.tsx` - mobile permission and data-access matrix.
- `src/components/admin/MobileSettingsPage.tsx` - mobile designations and settings mirror.

### Audit statement

This document was prepared from direct inspection of the files above. No application code, UI, route, permission, designation, organisation mapping, API, database record or configuration was changed. The document does not claim server-side enforcement that was not found.
