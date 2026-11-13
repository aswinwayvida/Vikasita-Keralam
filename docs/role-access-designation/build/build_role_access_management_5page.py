# -*- coding: utf-8 -*-
"""Render the condensed 5-page Role & Access Control / Designation brief.

Reads nothing from the application at runtime; content is a curated summary of
docs/role-access-designation/Role_Access_Control_and_Designation_Management.md,
which was verified against the source repository.
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfgen import canvas as pdfcanvas
from reportlab.platypus import (BaseDocTemplate, Frame, PageTemplate, Paragraph,
                                Spacer, Table, TableStyle, PageBreak, KeepTogether)

from reportlab.pdfbase.ttfonts import TTFont

pdfmetrics.registerFont(TTFont("Mono", os.path.join(r"C:\Windows\Fonts", "consola.ttf")))
pdfmetrics.registerFont(TTFont("MonoB", os.path.join(r"C:\Windows\Fonts", "consolab.ttf")))
pdfmetrics.registerFontFamily("Mono", normal="Mono", bold="MonoB", italic="Mono", boldItalic="MonoB")

from common import (ORANGE, ORANGE_DARK, PALE_ORANGE, BLUE, PALE_BLUE, INK, MUTED,
                    LINE, SOFT, GREEN, RED, CONTENT_W, P, BODY, CAP, bullets, table,
                    callout, rule)

FONT_DIR = r"C:\Windows\Fonts"

BLUE_DEEP = colors.HexColor("#182B6B")
LINE_SOFT = colors.HexColor("#E3E7EF")

TITLE = ParagraphStyle("t5", fontName="SansB", fontSize=20.5, leading=24, textColor=BLUE, spaceAfter=2)
SUBTITLE = ParagraphStyle("s5", fontName="SansB", fontSize=9.6, leading=13, textColor=ORANGE_DARK, spaceAfter=4)
EYEBROW = ParagraphStyle("e5", fontName="SansB", fontSize=6.8, leading=9, textColor=ORANGE, spaceAfter=4)
META = ParagraphStyle("m5", fontName="Sans", fontSize=6.9, leading=9.4, textColor=MUTED, spaceAfter=2)
H1S = ParagraphStyle("h15", fontName="SansB", fontSize=14, leading=17.5, textColor=BLUE, spaceBefore=0, spaceAfter=1)
H2S = ParagraphStyle("h25", fontName="SansB", fontSize=9.2, leading=11.8, textColor=INK, spaceBefore=7.5, spaceAfter=3.2, keepWithNext=1)
BUL5 = ParagraphStyle("b5", fontName="Sans", fontSize=7.7, leading=10.5, textColor=INK, leftIndent=11, bulletIndent=2, spaceAfter=2.2, alignment=TA_LEFT)
FINE = ParagraphStyle("f5", fontName="Sans", fontSize=6.4, leading=8.6, textColor=MUTED)
CELL5 = ParagraphStyle("c5", fontName="Sans", fontSize=6.95, leading=9.2, textColor=INK)
CODE = ParagraphStyle("code5", fontName="Mono", fontSize=6.9, leading=9.6, textColor=BLUE_DEEP)
KPIN = ParagraphStyle("kn", fontName="SansB", fontSize=15, leading=17, textColor=BLUE, alignment=TA_CENTER)
KPIL = ParagraphStyle("kl", fontName="Sans", fontSize=6.2, leading=8, textColor=MUTED, alignment=TA_CENTER)


class Brief(BaseDocTemplate):
    def __init__(self, filename):
        BaseDocTemplate.__init__(
            self, filename, pagesize=A4,
            leftMargin=20 * mm, rightMargin=20 * mm,
            topMargin=22 * mm, bottomMargin=17 * mm,
            title="Vikasita Keralam - Role & Access Control and Designation Management (5-page brief)",
            author="Vikasita Keralam Programme Office",
            subject="Condensed current-state logic, functionality and priority gaps",
            creator="Vikasita Keralam documentation build")
        frame = Frame(20 * mm, 17 * mm, CONTENT_W, A4[1] - 39 * mm, id="body",
                      leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates([PageTemplate(id="body", frames=[frame], onPage=self.deco)])

    def deco(self, canv, doc):
        canv.saveState()
        canv.setFillColor(BLUE)
        canv.rect(0, A4[1] - 5.2 * mm, A4[0], 5.2 * mm, stroke=0, fill=1)
        canv.setFillColor(ORANGE)
        canv.rect(0, A4[1] - 6.4 * mm, A4[0], 1.2 * mm, stroke=0, fill=1)

        canv.setFont("SansB", 6.6)
        canv.setFillColor(BLUE)
        canv.drawString(20 * mm, A4[1] - 11.9 * mm, "VIKASITA KERALAM")
        brand_w = pdfmetrics.stringWidth("VIKASITA KERALAM", "SansB", 6.6)
        canv.setFont("Sans", 6.6)
        canv.setFillColor(MUTED)
        canv.drawString(20 * mm + brand_w + 3.6 * mm, A4[1] - 11.9 * mm,
                        "Role & Access Control and Designation Management  \u00b7  condensed brief")
        canv.drawRightString(A4[0] - 20 * mm, A4[1] - 11.9 * mm, "VK-RCD-MGT-001  \u00b7  v1.0")
        canv.setStrokeColor(LINE)
        canv.setLineWidth(0.5)
        canv.line(20 * mm, A4[1] - 14.2 * mm, A4[0] - 20 * mm, A4[1] - 14.2 * mm)

        canv.line(20 * mm, 13.2 * mm, A4[0] - 20 * mm, 13.2 * mm)
        canv.setFont("Sans", 6.3)
        canv.setFillColor(MUTED)
        canv.drawString(20 * mm, 9.4 * mm,
                        "Source-code verified  \u00b7  documentation only  \u00b7  no application code changed")
        canv.drawRightString(A4[0] - 20 * mm, 9.4 * mm, "Page %d" % doc.page)
        canv.restoreState()


def heading(num, title):
    return [Paragraph("%s  %s" % (num, title), H1S)] + rule(ORANGE, 42, 2.0, 4.5)


def kpi_strip():
    items = [("7", "permission<br/>modules"), ("29", "permission<br/>actions"),
             ("4", "data access<br/>scopes"), ("1", "role value<br/>per user"),
             ("6", "organisation<br/>levels"), ("62", "seeded<br/>designations")]
    cells, widths = [], []
    for value, label in items:
        cells.append([Paragraph(value, KPIN), Paragraph(label, KPIL)])
    data = [cells]
    w = CONTENT_W / 6.0
    widths = [w] * 6
    t = Table(data, colWidths=widths)
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BACKGROUND", (0, 0), (-1, -1), SOFT),
        ("BOX", (0, 0), (-1, -1), 0.5, LINE),
        ("LINEAFTER", (0, 0), (-2, -1), 0.5, LINE),
        ("TOPPADDING", (0, 0), (-1, -1), 5.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5.5),
        ("LEFTPADDING", (0, 0), (-1, -1), 2),
        ("RIGHTPADDING", (0, 0), (-1, -1), 2),
    ]))
    return t


def code_block(lines):
    inner = [Paragraph(l.replace(" ", "&nbsp;"), CODE) for l in lines]
    t = Table([[inner]], colWidths=[CONTENT_W])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F5F7FC")),
        ("BOX", (0, 0), (-1, -1), 0.5, LINE),
        ("LINEBEFORE", (0, 0), (0, -1), 2.2, BLUE),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return t


def tiny_table(rows, widths, font=6.95, pad=3.1, zebra=True):
    return table(rows, widths, font=font, pad=pad, zebra=zebra)


def page_one():
    s = []
    s.append(Paragraph("CONDENSED BRIEF  \u00b7  PRODUCT AND ENGINEERING", EYEBROW))
    s.append(Paragraph("Role &amp; Access Control and<br/>Designation Management", TITLE))
    s.append(Paragraph("Five pages covering the logic, functionality and decisions that matter \u2014 "
                       "condensed from the 19-page source-verified guide.", SUBTITLE))
    s.append(Paragraph("Document VK-RCD-MGT-001  \u00b7  v1.0  \u00b7  13 November 2026  \u00b7  "
                       "evidence: direct inspection of the Vikasita Keralam repository", META))
    s.append(Spacer(1, 7))
    s.append(kpi_strip())
    s.append(Spacer(1, 9))

    s.append(Paragraph("What the module does", H2S))
    s.append(P("The Role &amp; Access area decides what an administrator can assign and what a signed-in user may "
               "see or change. It maintains a role catalogue, a seven-module permission matrix, per-module record "
               "visibility, bulk user assignment, and a separate designation catalogue tied to organisation levels.",
               ParagraphStyle("p1", parent=BODY, fontSize=8.1, leading=11.6, spaceAfter=4)))
    s.append(P("Four concepts are deliberately independent: <b>role</b> (system permissions), <b>designation</b> "
               "(organisational identity), <b>organisation level</b> (position in the hierarchy) and <b>data scope</b> "
               "(whose records). A designation never grants access on its own, and a data scope never grants an action.",
               ParagraphStyle("p1b", parent=BODY, fontSize=8.1, leading=11.6, spaceAfter=4)))

    s.append(Paragraph("How an access decision is meant to resolve", H2S))
    s.append(code_block([
        "1  session valid          4  module permission exists   7  organisation / location scope matches",
        "2  user account active     5  specific action permitted  8  allow, otherwise deny",
        "3  role resolved           6  data scope resolved        9  record the decision where audit is required",
    ]))
    s.append(Spacer(1, 5))
    s.append(P("Only steps 1\u20136 exist in the client today. Steps 7\u20139 have no verified server-side "
               "implementation.", FINE))

    s.append(Paragraph("How to read the status labels", H2S))
    s.append(tiny_table([
        ["Label", "Meaning"],
        ["<b>Implemented</b>", "Verified in source and reachable in the current UI or client workflow."],
        ["<b>Partially implemented</b>", "Workflow exists but validation, enforcement or consistency is missing."],
        ["<b>Stored in client</b>", "The value is captured, but no runtime or server-side enforcement was found."],
        ["<b>Not implemented / not verified</b>", "No corresponding implementation was found in the repository."],
    ], [104, CONTENT_W - 104]))

    s.append(Paragraph("Where it lives in the app", H2S))
    s.append(code_block([
        "Admin Settings   /admin/settings",
        "  Roles and Control      Roles tab, Users tab, assignment drawer",
        "  Designations           designation catalogue and organisation level filter",
        "  Organisational charts  hierarchy reference",
        "  Location management    organisation units and user-location assignment",
        "",
        "Role authoring  /admin/settings_/new-role, RoleEditorDialog, /admin/settings_/assign-role",
        "Mobile mirror   MobileRolesPage, MobileRolePermissionMatrix, MobileSettingsPage",
    ]))
    s.append(Spacer(1, 7))

    s.append(Paragraph("What the remaining pages cover", H2S))
    s += bullets([
        "<b>Page 2 — role lifecycle:</b> authoring surfaces, create fields, validation, propagation, duplicate, "         "status and delete behaviour.",
        "<b>Page 3 — permission logic:</b> the seven modules and 29 actions, prerequisite cascade, permission key "         "format, the four data scopes and the administrative layer.",
        "<b>Page 4 — people and hierarchy:</b> user assignment and its defect, the designation model, the two "         "catalogues, six organisation levels and the region mismatch.",
        "<b>Page 5 — delivery:</b> implementation status, priority gaps, the files that carry the logic and the "         "decisions needed before build.",
    ], BUL5)
    s.append(Spacer(1, 8))
    s.append(Spacer(1, 2))
    s += callout("Documentation only \u2014 prototype, not production authorisation",
                 "Every role, permission, data scope and designation record is held in browser "
                 "<b>localStorage</b>. No backend API, database table, server guard or query-level data filter was "
                 "verified. Client-side checks must not be treated as a security boundary.",
                 accent=ORANGE, bg=PALE_ORANGE)
    return s


def page_two():
    s = []
    s += heading("1", "Role lifecycle")
    s.append(P("A role is a named bundle of module permissions, per-module data scopes and optional administrative "
               "permissions. Three authoring surfaces exist and they are <b>not equivalent</b>.", 
               ParagraphStyle("p2", parent=BODY, fontSize=8.0, leading=11.4, spaceAfter=4)))

    s.append(Paragraph("Authoring surfaces", H2S))
    s.append(tiny_table([
        ["Surface", "Where", "What it can set"],
        ["Full-page editor", "<font name='Mono' size='6.5'>/admin/settings_/new-role</font>",
         "Name, description, permissions, data scope. Writes the <b>State</b> level only and no administrative "
         "permissions on create."],
        ["Editor dialog", "<font name='Mono' size='6.5'>RoleEditorDialog.tsx</font>",
         "Name, description, allowed levels, module matrix, data scopes and administrative permissions."],
        ["Mobile form", "<font name='Mono' size='6.5'>MobileRolesPage.tsx</font>",
         "Name, status, permissions and data scopes; also duplicate, delete and worker assignment."],
    ], [58, 132, CONTENT_W - 190]))

    s.append(Paragraph("New role fields", H2S))
    s.append(tiny_table([
        ["Field", "Req.", "Verified behaviour"],
        ["Role name", "Yes", "Blank rejected. Dialog and mobile reject duplicates case-insensitively; the full-page "
                             "save handler does <b>not</b> run the same duplicate check."],
        ["Status", "No", "Active or Inactive. The full-page create handler always initialises Active."],
        ["Allowed assignment levels", "Dialog only", "State, Region, Organisational District, Mandalam, Area, Booth. "
                                                      "The full-page create handler writes <font name='Mono' size='6.5'>state</font> only."],
        ["Module permissions", "Yes", "At least one action. View is added automatically as a prerequisite."],
        ["Data access", "Yes", "Defaults to Own Records per module; several scopes can be combined."],
        ["Administrative permissions", "No", "Role management, Access assignment, Access delegation. The full-page "
                                              "create handler writes an empty list."],
    ], [82, 44, CONTENT_W - 126]))

    s.append(Paragraph("Lifecycle rules developers must preserve", H2S))
    s += bullets([
        "<b>View before action.</b> Create, Edit and Delete require View in the same module; Schemes: View Details "
        "requires View List. Removing View removes every dependent permission.",
        "<b>Duplicate, not clone.</b> The copy is named <i>&lt;role&gt; (copy)</i>, then <i>(copy) 2</i>, <i>3</i>\u2026; "
        "permissions, scopes and administrative rights are copied and the copy starts with zero users.",
        "<b>Edits propagate.</b> Permissions are read through the role at runtime \u2014 there is no per-user snapshot, "
        "so an edit immediately changes every holder.",
        "<b>Deactivate is a guard, not a delete.</b> Existing holders keep the role; new assignments are blocked and the "
        "administrator must acknowledge the affected count.",
        "<b>Delete has no remediation.</b> Confirmation is shown, but holders are not reassigned and users keep a stale "
        "role label.",
    ], BUL5)

    s.append(Paragraph("Built-in and seeded roles", H2S))
    s.append(tiny_table([
        ["Role", "Level", "Administrative permissions", "Users"],
        ["Admin  <font name='Mono' size='6.2'>system_state_admin</font>", "State",
         "Management, assignment, delegation", "\u2014"],
        ["Sub Admin  <font name='Mono' size='6.2'>system_sub_admin</font>", "State",
         "Management, assignment", "\u2014"],
        ["Support Admin  <font name='Mono' size='6.2'>system_support_admin</font>", "State", "None", "\u2014"],
        ["State Admin  (preset)", "State", "Management, assignment, delegation", "4"],
        ["District Admin  (preset)", "District", "Access assignment", "14"],
        ["Constituency Admin  (preset)", "Assembly Constituency", "Access assignment", "42"],
        ["Local Body Admin  (preset)", "Local Body", "Access assignment", "118"],
        ["Booth Admin  (preset)", "Booth", "None", "326"],
        ["User / party_worker  (preset)", "Ward, Booth, Party Unit", "None", "1,284"],
    ], [176, 108, CONTENT_W - 336, 44]))
    s.append(Spacer(1, 2))
    s.append(P("The first three are page-level built-ins; the rest are seeded presets. User counts are seed data, "
               "not live employment figures.", FINE))

    s.append(Spacer(1, 5))
    s.append(Spacer(1, 3))
    s += callout("Two confirmed exceptions to system-role protection",
                 "The three page-level roles above <b>can be deleted</b> unlike other built-in roles, and a role "
                 "created from the full-page route is locked to State with no administrative permissions.",
                 accent=RED, bg=colors.HexColor("#FDF1F0"))
    return s


def page_three():
    s = []
    s += heading("2", "Permission and data-scope logic")
    s.append(Paragraph("Module permissions answer <b>what</b> a role can do; data access answers <b>whose</b> records "
                       "the action may touch. They are configured independently for every module.",
               ParagraphStyle("p3", parent=BODY, fontSize=8.0, leading=11.4, spaceAfter=4)))

    s.append(Paragraph("Seven modules, 29 actions", H2S))
    s.append(tiny_table([
        ["Module", "Permission ID", "Actions", "Prerequisite"],
        ["Applicant Profile", "<font name='Mono' size='6.5'>applicant_profile</font>", "View, Create, Edit, Delete", "View first"],
        ["Applications", "<font name='Mono' size='6.5'>applications</font>", "View, Create, Edit, Delete", "View first"],
        ["Schemes", "<font name='Mono' size='6.5'>schemes</font>", "View List, View Details, Create, Edit, Delete",
         "List \u2192 Details \u2192 C/E/D"],
        ["Role &amp; Access", "<font name='Mono' size='6.5'>roles</font>", "View, Create, Edit, Delete", "View first"],
        ["Designation", "<font name='Mono' size='6.5'>designations</font>", "View, Create, Edit, Delete", "View first"],
        ["Users", "<font name='Mono' size='6.5'>party_workers</font>", "View, Create, Edit, Delete, View Teams", "View first"],
        ["Request / help desk", "<font name='Mono' size='6.5'>help_desk</font>", "View, Assign Team Member, Respond/Reply",
         "View first"],
    ], [72, 96, 152, CONTENT_W - 320]))

    s.append(Paragraph("How permissions are stored", H2S))
    s.append(code_block([
        "module.action                 schemes.view_details   party_workers.view_teams",
        "module.scope.action           applications.below_level.view   applications.own_records.edit",
    ]))
    s.append(Spacer(1, 4))
    s.append(P("The matrix shows Create / View / Edit / Delete; module-specific actions are surfaced as secondary "
               "controls (Schemes view list and details, Users View Teams, Request assign and reply). Select All exists "
               "for modules and per-module All for data access, and individual actions can be removed afterwards.",
               ParagraphStyle("p3b", parent=BODY, fontSize=7.6, leading=10.4, spaceAfter=2)))

    s.append(Paragraph("Four data-access scopes", H2S))
    s.append(tiny_table([
        ["Scope", "Intended meaning", "Behaviour today"],
        ["Own Records", "Records created by or explicitly assigned to the signed-in user",
         "Default on every module; stored in <font name='Mono' size='6.5'>dataAccess</font>."],
        ["Below My Level", "Records of subordinate organisational units",
         "Selectable and stored; no query-level enforcement verified."],
        ["Same Level \u2013 Peers", "Records of peer units at the same level",
         "Selectable and stored; no query-level enforcement verified."],
        ["Above My Level", "Records of superior organisational units",
         "Defined in the model and available on the full assign-role route, but hidden from most editors."],
    ], [76, 186, CONTENT_W - 262]))

    s.append(Spacer(1, 3))
    s += bullets([
        "Scopes combine per module and are persisted in a canonical order; a module can carry Own + Below + Peers.",
        "Role dialog, user editor and mobile matrix expose Own, Below and Peers \u2014 <b>Above is omitted</b>, so "
        "behaviour differs by authoring path.",
        "Boundaries are undefined and need approval: does Below include all descendants, are peers one unit or the "
        "whole level, and are read, edit, delete and export filtered independently?",
    ], BUL5)

    s.append(Paragraph("Administrative permissions, not module actions", H2S))
    s.append(tiny_table([
        ["Permission", "Grants"],
        ["Role management", "Create, edit and delete roles and change their status"],
        ["Access assignment", "Assign roles to users and maintain their role value"],
        ["Access delegation", "Allow another administrator to manage access in turn"],
    ], [118, CONTENT_W - 118]))
    s.append(Spacer(1, 2))
    s.append(P("Admin holds all three, Sub Admin holds management and assignment, Support Admin holds none, and a role "
               "created from the full-page editor starts with none.", FINE))

    s.append(Spacer(1, 6))
    s += callout("Keep the three layers separate",
                 "<b>Module permission</b> = what may be done. <b>Data scope</b> = whose records it may touch. "
                 "<b>Administrative permission</b> = the ability to manage roles, assign roles or delegate access, "
                 "which is not an ordinary module action.",
                 accent=BLUE, bg=PALE_BLUE)
    return s


def page_four():
    s = []
    s += heading("3", "User assignment, designations and hierarchy")

    s.append(Paragraph("User assignment", H2S))
    s += bullets([
        "<b>One role value per user.</b> The user record stores a single <font name='Mono' size='6.5'>assignedRole</font>; "
        "a multi-role membership model was not verified.",
        "<b>Bulk assignment.</b> The drawer searches by name, designation, constituency or district and filters by "
        "designation, region, organisational district, mandalam, area and booth, with select/deselect all. Saving "
        "updates the role's <font name='Mono' size='6.5'>assignedUsers</font> count.",
        "<b>Per-user overrides</b> are possible on <font name='Mono' size='6.5'>/admin/settings_/assign-role</font>, "
        "which also exposes all four data scopes.",
        "<b>Confirmed defect:</b> in the desktop drawer, deselecting a user who already holds the role reassigns them "
        "to <b>Sub Admin</b> instead of leaving them unassigned \u2014 an unintended privilege change.",
    ], BUL5)

    s.append(Paragraph("Designation model", H2S))
    s.append(tiny_table([
        ["Field", "Rule"],
        ["Designation name", "Required. No case-insensitive duplicate check was verified."],
        ["Organisation level", "Required; State, Region, Organisational District, Mandalam, Area or Booth. Filters the "
                               "designation picker shown when assigning a user."],
        ["Parent designation", "Optional and must be at the same level. Rank is derived as "
                               "<font name='Mono' size='6.5'>parent.rank + 1</font>; a top-level designation gets rank 1."],
        ["Status and order", "Active or Disabled; Disabled hides the option from new assignment. Move up/down changes "
                             "display order within the filtered catalogue."],
        ["Deletion", "Removes or hides the option after confirmation; the desktop handler does <b>not</b> check for "
                     "assigned users, so references can dangle."],
        ["Storage", "<font name='Mono' size='6.5'>vikasita_managed_designations_v1</font> on desktop; separate keys for "
                    "mobile custom records, overrides and hidden IDs."],
    ], [78, CONTENT_W - 78]))

    s.append(Paragraph("Two catalogues, one hierarchy", H2S))
    s.append(tiny_table([
        ["Source", "Count", "Divergent labels to note"],
        ["Desktop Designation Master", "32", "President, Vice President, Executive Member, Kendra Convener, Worker"],
        ["Shared party-designation register", "30", "State President, District President, Karyakarta, Booth Agent"],
    ], [150, 42, CONTENT_W - 192]))
    s.append(Spacer(1, 3))
    s.append(P("Neither list is canonical: the same organisational role can appear under different names in the "
               "designation master, the party register, the new-user picker and mobile. <b>One catalogue must be "
               "approved and migrated before production.</b>", ParagraphStyle("p4", parent=BODY, fontSize=7.6,
                                                                               leading=10.4, spaceAfter=3)))

    s.append(P("Hierarchy: State \u2192 Region \u2192 Organisational District \u2192 Mandalam \u2192 Area \u2192 Booth. "
               "Reference figures in the location master are 1 state, 30 organisational districts, 140 "
               "constituency-based mandalams, configurable areas and 25,000+ booths.", ParagraphStyle(
                   "p4b", parent=BODY, fontSize=7.6, leading=10.4, spaceAfter=3)))
    s.append(P("<b>Known inconsistency:</b> the region layer is defined as three regions (South, Central, North) in "
               "party data and user forms, but as four rows (Northern, Central, Southern, Far Southern) in the location "
               "master. District totals still reconcile at 30.", ParagraphStyle("p4c", parent=BODY, fontSize=7.6,
                                                                                leading=10.4, spaceAfter=3)))

    s.append(Paragraph("Role versus designation", H2S))
    s.append(tiny_table([
        ["Dimension", "Role", "Designation"],
        ["Purpose", "Functional system access", "Organisational identity"],
        ["Grants permissions", "Yes, module and administrative", "No \u2014 access requires a role"],
        ["Organisation link", "Through allowed assignment levels", "One organisation level per designation"],
        ["On deletion", "Users must be reviewed; no automatic fix", "Assigned users are not remediated"],
    ], [92, 178, CONTENT_W - 270]))
    return s


def page_five():
    s = []
    s += heading("4", "Delivery status, gaps and developer handoff")

    s.append(Paragraph("Implementation status", H2S))
    s.append(tiny_table([
        ["Requirement", "Status", "Evidence"],
        ["Role catalogue, search, status, counts", "Implemented", "RoleAccessSettings.tsx"],
        ["Create a custom role", "Partially", "Two desktop paths differ in fields"],
        ["Edit name, description, permissions, scope", "Implemented", "RoleEditorDialog, new-role"],
        ["Unique role names", "Partially", "Full-page save has no duplicate check"],
        ["7 modules / 29 actions with prerequisites", "Implemented", "party-workers.ts"],
        ["Per-module data access", "Stored in client", "RoleDataAccess, dataAccessOptions"],
        ["Duplicate, activate, deactivate a role", "Implemented", "nextRoleCopyName, status dialog"],
        ["Delete a role safely", "Partially", "No assignment remediation"],
        ["Multiple roles per user", "Not implemented", "Single assignedRole"],
        ["Designation catalogue, level filter, rank", "Implemented", "Designation master, mobile screen"],
        ["Duplicate designation prevention", "Not verified", "No duplicate check found"],
        ["Protect designation delete when assigned", "Not implemented", "No assignment check"],
        ["Server-side access enforcement", "Not verified", "No API or query guard"],
        ["Audit trail for access changes", "Not implemented", "No audit store"],
    ], [214, 82, CONTENT_W - 296]))

    s.append(Paragraph("Confirmed gaps by priority", H2S))
    s.append(tiny_table([
        ["Priority", "Gap and required action"],
        ["<b>Critical</b>", "No server-side RBAC and no query-level scope filtering \u2014 enforce module, action and "
                            "scope in every API and list query. All records are device-local localStorage."],
        ["<b>Critical</b>", "Deselecting a role holder reassigns them to Sub Admin \u2014 replace with an explicit "
                            "Unassigned or reviewed-transfer flow."],
        ["<b>High</b>", "No audit log; role and designation deletion ignore assigned users; two designation catalogues; "
                        "two role editors with different fields; Above scope hidden inconsistently."],
        ["<b>Medium</b>", "Single role per user; duplicate designation names allowed; region grouping defined as both "
                          "three and four regions."],
    ], [52, CONTENT_W - 52]))

    s.append(Paragraph("Files that carry the logic", H2S))
    s.append(tiny_table([
        ["File", "Responsibility"],
        ["<font name='Mono' size='6.4'>src/data/role-management.ts</font>",
         "Role model, status, admin permissions, data-access options, scoped keys, copy names, built-ins, storage"],
        ["<font name='Mono' size='6.4'>src/data/party-workers.ts</font>",
         "7 modules / 29 actions, prerequisites, assignment levels, presets, party designations"],
        ["<font name='Mono' size='6.4'>src/components/admin/RoleAccessSettings.tsx</font>",
         "Role and user tables, assignment drawer, designation master, status dialogs, import/export"],
        ["<font name='Mono' size='6.4'>src/components/admin/RoleEditorDialog.tsx</font>",
         "Dialog editor: levels, module matrix, data access, administrative permissions"],
        ["<font name='Mono' size='6.4'>src/routes/admin.settings_.new-role.tsx</font>",
         "Full-page editor: State-only level, no administrative permissions on create"],
        ["<font name='Mono' size='6.4'>src/routes/admin.settings_.assign-role.tsx</font>",
         "Per-user overrides and all four data scopes"],
        ["<font name='Mono' size='6.4'>src/components/admin/MobileRolesPage.tsx</font>",
         "Mobile role list, create/edit, duplicate, delete, worker assignment"],
        ["<font name='Mono' size='6.4'>src/components/admin/MobileSettingsPage.tsx</font>",
         "Mobile designation catalogue and settings mirror"],
    ], [232, CONTENT_W - 232], font=6.6, pad=2.6))

    s.append(Spacer(1, 2))
    s += callout("Decisions required before a production build",
                 "1. One role plus overrides, or true multi-role?  2. Exact meaning of Below / Peer / Above across the "
                 "six levels?  3. Can a designation ever imply a default role?  4. Which service replaces localStorage, "
                 "and who owns migration?  5. Which changes require dual approval or audit?",
                 accent=BLUE, bg=PALE_BLUE)

    s.append(Paragraph("Prepared from direct inspection of the listed files. No application code, route, permission, "
                       "designation, mapping, API or database record was modified. The full 19-page guide remains the "
                       "detailed reference.", FINE))
    return s


def build(out_path):
    doc = Brief(out_path)
    story = []
    for i, page in enumerate([page_one, page_two, page_three, page_four, page_five]):
        if i:
            story.append(PageBreak())
        story += page()
    doc.build(story)
    return out_path


if __name__ == "__main__":
    from common import register_fonts
    register_fonts()
    target = os.path.abspath(os.path.join(HERE, "..",
                                          "Role_Access_Control_and_Designation_Management_5Page.pdf"))
    build(target)
    print("WROTE", target)
