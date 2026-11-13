# -*- coding: utf-8 -*-
"""Build the 5-page Role Control and Designation workflow brief."""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, Frame, PageTemplate, Paragraph,
                                Spacer, Table, TableStyle, PageBreak)
from reportlab.lib.enums import TA_LEFT, TA_CENTER

import diagrams as D
from common import (ORANGE, ORANGE_DARK, PALE_ORANGE, BLUE, PALE_BLUE, INK, MUTED,
                    LINE, SOFT, GREEN, RED, CONTENT_W, P, BODY, CAP,
                    table, callout, bullets, figure, rule)

FONT_DIR = r"C:\Windows\Fonts"


def register():
    pdfmetrics.registerFont(TTFont("Sans", os.path.join(FONT_DIR, "segoeui.ttf")))
    pdfmetrics.registerFont(TTFont("SansB", os.path.join(FONT_DIR, "segoeuib.ttf")))
    pdfmetrics.registerFont(TTFont("SansI", os.path.join(FONT_DIR, "segoeuii.ttf")))
    pdfmetrics.registerFont(TTFont("SansL", os.path.join(FONT_DIR, "segoeuil.ttf")))
    pdfmetrics.registerFontFamily("Sans", normal="Sans", bold="SansB",
                                  italic="SansI", boldItalic="SansB")
    D.SANS, D.SANS_B, D.SANS_I = "Sans", "SansB", "SansI"


# ---------------------------------------------------------------- styles
EYEBROW = ParagraphStyle("eyebrow", fontName="SansB", fontSize=7.2, leading=9,
                         textColor=ORANGE, spaceAfter=5)
TITLE = ParagraphStyle("title", fontName="SansB", fontSize=23, leading=26,
                       textColor=BLUE, spaceAfter=2)
SUBTITLE = ParagraphStyle("subtitle", fontName="SansB", fontSize=11, leading=14,
                          textColor=ORANGE_DARK, spaceAfter=7)
SECTION = ParagraphStyle("section", fontName="SansB", fontSize=7.0, leading=9,
                         textColor=ORANGE, spaceBefore=6, spaceAfter=4)
H1 = ParagraphStyle("h1b", fontName="SansB", fontSize=15.5, leading=19, textColor=BLUE,
                    spaceBefore=0, spaceAfter=2)
H2 = ParagraphStyle("h2b", fontName="SansB", fontSize=9.4, leading=12, textColor=INK,
                    spaceBefore=9, spaceAfter=4, keepWithNext=1)
BULLET = ParagraphStyle("bul5", fontName="Sans", fontSize=7.7, leading=10.6, textColor=INK,
                        leftIndent=12, bulletIndent=2, spaceAfter=2.4, alignment=TA_LEFT)
TINY = ParagraphStyle("tiny", fontName="Sans", fontSize=6.5, leading=8.6, textColor=MUTED)
CELL = ParagraphStyle("cell", fontName="Sans", fontSize=7.15, leading=9.5, textColor=INK)
CARDT = ParagraphStyle("cardt", fontName="SansB", fontSize=7.4, leading=9.4, textColor=BLUE,
                       spaceAfter=2)
CARDB = ParagraphStyle("cardb", fontName="Sans", fontSize=6.4, leading=8.4, textColor=MUTED)
BIGNUM = ParagraphStyle("bignum", fontName="SansB", fontSize=17, leading=19, textColor=BLUE,
                        alignment=TA_CENTER)
NUMLAB = ParagraphStyle("numlab", fontName="Sans", fontSize=6.6, leading=8.4, textColor=MUTED,
                        alignment=TA_CENTER)


# ---------------------------------------------------------------- template
class Brief(BaseDocTemplate):
    def __init__(self, filename):
        BaseDocTemplate.__init__(
            self, filename, pagesize=A4,
            leftMargin=20 * mm, rightMargin=20 * mm,
            topMargin=23 * mm, bottomMargin=18 * mm,
            title="Vikasita Keralam - Role Control and Designation (5-page workflow brief)",
            author="Vikasita Keralam Programme Office",
            subject="Role and Control workflows, Designation management and requirements",
            creator="Vikasita Keralam documentation build")
        frame = Frame(20 * mm, 18 * mm, CONTENT_W, A4[1] - 41 * mm, id="body",
                      leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates([PageTemplate(id="body", frames=[frame], onPage=self.deco)])

    def deco(self, canv, doc):
        canv.saveState()
        canv.setFillColor(BLUE)
        canv.rect(0, A4[1] - 5.4 * mm, A4[0], 5.4 * mm, stroke=0, fill=1)
        canv.setFillColor(ORANGE)
        canv.rect(0, A4[1] - 6.6 * mm, A4[0], 1.2 * mm, stroke=0, fill=1)

        canv.setFont("SansB", 6.8)
        canv.setFillColor(BLUE)
        canv.drawString(20 * mm, A4[1] - 12.4 * mm, "VIKASITA KERALAM")
        brand_w = pdfmetrics.stringWidth("VIKASITA KERALAM", "SansB", 6.8)
        canv.setFont("Sans", 6.8)
        canv.setFillColor(MUTED)
        canv.drawString(20 * mm + brand_w + 4.0 * mm, A4[1] - 12.4 * mm,
                        "Role Control and Designation  \u00b7  Workflow and requirements brief")
        canv.drawRightString(A4[0] - 20 * mm, A4[1] - 12.4 * mm, "VK-RCD-WF-005  \u00b7  v1.0")
        canv.setStrokeColor(LINE)
        canv.setLineWidth(0.5)
        canv.line(20 * mm, A4[1] - 15 * mm, A4[0] - 20 * mm, A4[1] - 15 * mm)

        canv.line(20 * mm, 13.6 * mm, A4[0] - 20 * mm, 13.6 * mm)
        canv.setFont("Sans", 6.6)
        canv.setFillColor(MUTED)
        canv.drawString(20 * mm, 9.6 * mm,
                        "Verified against the source repository  \u00b7  documentation only  \u00b7  no application code changed")
        canv.drawRightString(A4[0] - 20 * mm, 9.6 * mm, "Page %d of 5" % doc.page)
        canv.restoreState()

# ---------------------------------------------------------------- diagrams
def system_map(d):
    d.box(4, 26, 120, 60, title="Admin Settings", body="/admin/settings",
          accent=BLUE, fill=PALE_BLUE, stroke=colors.HexColor("#C3CBE6"),
          title_color=BLUE, size=6.6, title_size=8.4)
    d.polyline([(124, 56), (140, 56)], color=LINE, head=False)
    d.polyline([(140, 30), (140, 82)], color=LINE, head=False)
    items = [
        ("Roles and Control", "Roles and Users tabs, role editor", True),
        ("Designations", "Catalogue, parent rank, status", False),
        ("Organisational Charts", "Hierarchy reference view", False),
        ("Location Management", "Org units and assignments", False),
    ]
    for i, (t, b, primary) in enumerate(items):
        col, row = i % 2, i // 2
        x = 152 + col * 160
        top = 14 + row * 36
        d.polyline([(140, top + 16), (x, top + 16)], color=LINE, head=True, head_size=4)
        d.box(x, top, 150, 32, title=t, body=b,
              accent=BLUE if primary else ORANGE,
              fill=PALE_BLUE if primary else D.WHITE,
              stroke=colors.HexColor("#C3CBE6") if primary else LINE,
              title_color=BLUE, size=6.2, title_size=7.5)
    d.text(4, 96, "Tabs are addressable by query string: ?tab=roles | users | designations | location. "
                  "The mobile settings mirror reuses the same data model and storage keys.",
           size=6.3, color=MUTED, width=462, leading=8.2)


def role_lifecycle(d):
    steps = [
        ("Roles List", "Search, filter, bulk select"),
        ("Create New Role", "Route /admin/settings_/new-role"),
        ("Permissions", "7 modules, 29 actions"),
        ("Data access", "Own / Below / Peers per module"),
        ("Save", "Create Role, then Assign Users"),
    ]
    x0, w, gap, h, top = 1, 86, 9.5, 50, 28
    for i, (t, b) in enumerate(steps):
        x = x0 + i * (w + gap)
        d.box(x, top, w, h, title=t, body=b, accent=BLUE if i < 2 else ORANGE,
              title_size=7.5, size=6.5)
        if i < len(steps) - 1:
            d.polyline([(x + w, top + h / 2), (x + w + gap, top + h / 2)],
                       color=LINE, lw=1.0, head=True, head_size=4)
    d.rect(x0, 2, 468, 20, fill=D.PALE_RED, stroke=colors.HexColor("#E7B4B0"), radius=3)
    d.text(8, 7, "Validation gates: unique role name  \u00b7  at least one module permission  \u00b7  "
                 "View is added before Create, Edit or Delete  \u00b7  Schemes View Details requires View List",
           size=6.2, color=RED, width=454, leading=7.4)
    lo = x0 + 4 * (w + gap) + w / 2
    mid = x0 + 1 * (w + gap) + w / 2
    d.polyline([(lo, top + h), (lo, top + h + 18), (mid, top + h + 18), (mid, top + h)],
               color=ORANGE_DARK, lw=0.9, dash=[3, 2], head=True, head_size=4)
    d.label(mid + 64, top + h + 12, "edit and re-save", color=ORANGE_DARK, font=D.SANS_B)


def assign_eval(d):
    d.text(2, 0, "A  \u00b7  ASSIGN A ROLE", size=6.8, font=D.SANS_B, color=BLUE)
    steps = [
        ("Users tab", "Single row or bulk selection"),
        ("Assign Role", "/admin/settings_/assign-role"),
        ("Choose role", "One role per user; None = Unassigned"),
        ("Optional overrides", "Per-user permission grid"),
        ("Save assignment", "assignedRole on the user record"),
    ]
    top, h, gap = 14, 30, 6
    for i, (t, b) in enumerate(steps):
        y = top + i * (h + gap)
        d.box(2, y, 212, h, title=t, body=b, accent=BLUE if i < 2 else ORANGE,
              title_size=7.3, size=6.4)
        if i < len(steps) - 1:
            d.polyline([(108, y + h), (108, y + h + gap)], color=LINE, lw=0.9,
                       head=True, head_size=3.6)

    d.text(246, 0, "B  \u00b7  EVALUATE ACCESS  \u2014  DENY BY DEFAULT", size=6.8,
           font=D.SANS_B, color=BLUE)
    gates = [
        ("1  Session valid", "localStorage admin session"),
        ("2  Account active", "status flag on managed user"),
        ("3  Role resolved", "assignedRole known"),
        ("4  Module permission", "module.action present"),
        ("5  Action permission", "view / create / edit / delete"),
        ("6  Data scope", "own, below or peers"),
        ("7  Org unit match", "location intersects scope"),
    ]
    gt, gh, gg = 14, 22, 4
    for i, (t, b) in enumerate(gates):
        y = gt + i * (gh + gg)
        d.box(246, y, 186, gh, title=t, body=b, accent=BLUE if i < 3 else ORANGE,
              title_size=6.9, size=5.8)
        if i < len(gates) - 1:
            d.polyline([(339, y + gh), (339, y + gh + gg)], color=LINE, lw=0.8,
                       head=True, head_size=3.4)

    c = d.c
    c.saveState()
    c.setFillColor(D.PALE_RED)
    c.setStrokeColor(colors.HexColor("#E7B4B0"))
    c.setLineWidth(0.7)
    c.roundRect(438, d.h - 188, 28, 174, 4, stroke=1, fill=1)
    c.translate(453, d.h - 101)
    c.rotate(90)
    c.setFillColor(RED)
    c.setFont("SansB", 6.3)
    c.drawCentredString(0, 0, "DENY")
    c.restoreState()

    d.text(2, 202, "Steps A1-A3 and B1-B3 exist in the client. The module, action and data-scope gates "
                   "(B4-B7) are rendered and stored, but no server-side enforcement was found in the repository.",
           size=6.3, color=MUTED, width=430, leading=8.2)


def designation_lifecycle(d):
    steps = [
        ("Designation Master", "Settings, Designations tab"),
        ("Create or Edit", "Name, level, parent"),
        ("Organisation level", "State to Booth"),
        ("Parent designation", "Optional; sets rank"),
        ("Save and rank", "Active or Disabled"),
    ]
    x0, w, gap, h, top = 1, 86, 9.5, 50, 8
    for i, (t, b) in enumerate(steps):
        x = x0 + i * (w + gap)
        d.box(x, top, w, h, title=t, body=b, accent=ORANGE if i else BLUE,
              fill=PALE_ORANGE if i == 4 else D.WHITE, title_size=7.4, size=6.4)
        if i < len(steps) - 1:
            d.polyline([(x + w, top + h / 2), (x + w + gap, top + h / 2)],
                       color=LINE, lw=1.0, head=True, head_size=4)
    d.rect(x0, 66, 468, 24, fill=D.PALE_BLUE, stroke=colors.HexColor("#C3CBE6"), radius=3)
    d.text(7, 71, "Rank is derived from the parent (parent rank + 1). Reorder moves a designation up or down; "
                  "bulk enable, disable and delete are available. Designations are filtered by organisation level "
                  "when a user is created.",
           size=6.2, color=BLUE, width=454, leading=7.6)

# ---------------------------------------------------------------- pages
def page_one():
    s = []
    s.append(P("VIKASITA KERALAM  \u00b7  ADMIN PLATFORM  \u00b7  WORKING BRIEF", EYEBROW))
    s.append(P("Role Control and Designation", TITLE))
    s.append(P("Workflows and requirements as implemented", SUBTITLE))
    s.append(P("A five-page summary of how roles, permissions, data access and designations actually work in "
               "the Vikasita Keralam repository today. It records what is built, where it lives, which rules "
               "the code enforces, and what must still be decided. It is not a proposal for new functionality "
               "and it changes nothing in the application.", BODY))
    s += rule(ORANGE, 52, 2.4, 4)

    meta = [[
        Paragraph("DOCUMENT", TINY), Paragraph("EVIDENCE BASE", TINY),
        Paragraph("VERSION", TINY), Paragraph("SCOPE", TINY)],
        [Paragraph("<b>5-page workflow brief</b>", CELL), Paragraph("Source-code inspection", CELL),
         Paragraph("v1.0  \u00b7  13 Nov 2026", CELL), Paragraph("Roles, access, designations only", CELL)]]
    t = Table(meta, colWidths=[118, 132, 108, 123.9])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), SOFT),
        ("BOX", (0, 0), (-1, -1), 0.5, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.35, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    s.append(t)
    s.append(Spacer(1, 10))

    s.append(P("WHAT THIS DOCUMENT COVERS", SECTION))
    cards = [
        ("01", "Role control", "Create, edit and govern roles across seven permission modules."),
        ("02", "Assignment", "Users, status, role selection and the access-evaluation chain."),
        ("03", "Designation", "Catalogue, parent rank and organisation-level filtering."),
        ("04", "Organisation", "Levels, location and the data-scope vocabulary."),
        ("05", "Requirements", "Requirement status, confirmed gaps and open decisions."),
    ]
    cells = []
    for num, title, body in cards:
        cells.append([Paragraph('<font color="#FF7900"><b>%s</b></font>' % num, CARDT),
                      Paragraph(title, CARDT), Paragraph(body, CARDB)])
    t = Table([cells], colWidths=[88, 98, 98, 98, 99.9])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BACKGROUND", (0, 0), (-1, -1), SOFT),
        ("BOX", (0, 0), (-1, -1), 0.5, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.35, LINE),
        ("LINEABOVE", (0, 0), (-1, 0), 2.0, ORANGE),
        ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    s.append(t)
    s.append(Spacer(1, 9))

    s.append(P("HOW STATUS IS RECORDED", SECTION))
    legend = [
        ("Implemented in code", "Workflow and validation verified in the client source.", BLUE, PALE_BLUE),
        ("Prototype persistence", "Logic is real, but records live in browser localStorage only.", ORANGE, PALE_ORANGE),
        ("Not verified", "No server-side API, query guard or database constraint was found.", MUTED, SOFT),
    ]
    cells = []
    for label, body, accent, bg in legend:
        cells.append([Paragraph('<font color="%s"><b>%s</b></font>' %
                                (accent.hexval().replace("0x", "#"), label), CARDT),
                      Paragraph(body, CARDB)])
    t = Table([cells], colWidths=[481.9 / 3.0] * 3)
    style = [("VALIGN", (0, 0), (-1, -1), "TOP"),
             ("BOX", (0, 0), (-1, -1), 0.5, LINE),
             ("INNERGRID", (0, 0), (-1, -1), 0.35, LINE),
             ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6),
             ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 6)]
    for i, item in enumerate(legend):
        style.append(("BACKGROUND", (i, 0), (i, 0), item[3]))
        style.append(("LINEABOVE", (i, 0), (i, 0), 2.0, item[2]))
    t.setStyle(TableStyle(style))
    s.append(t)
    s.append(Spacer(1, 8))

    s.append(P("VERIFIED SYSTEM MAP", SECTION))
    s += figure("1", "Where role and designation management lives", system_map, 122, D)
    s.append(Spacer(1, 2))

    s.append(P("KEY FIGURES AT A GLANCE", SECTION))
    figs = [("7", "permission modules"), ("29", "module actions"), ("6", "organisation levels"),
            ("32", "seeded designations"), ("6", "built-in roles"), ("3", "admin permissions")]
    row1 = [[Paragraph(n, BIGNUM), Paragraph(l, NUMLAB)] for n, l in figs[:3]]
    row2 = [[Paragraph(n, BIGNUM), Paragraph(l, NUMLAB)] for n, l in figs[3:]]
    t = Table([row1, row2], colWidths=[160.6] * 3)
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BOX", (0, 0), (-1, -1), 0.5, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.35, LINE),
        ("BACKGROUND", (0, 0), (-1, -1), SOFT),
        ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    s.append(t)
    s.append(Spacer(1, 6))
    s += callout("Scope boundary",
                     "This brief covers the Settings area only: Roles and Control, Designations, Users, Location, "
                     "Organisational Charts and the mobile settings mirror. It does not document schemes, applications, "
                     "applicant profiles or any other module except where a permission touches it.",
                     accent=BLUE, bg=PALE_BLUE)
    return s


def page_two():
    s = []
    s.append(P("01  \u00b7  ROLE CONTROL", EYEBROW))
    s.append(P("Roles: create, edit and govern access", H1))
    s += rule(ORANGE, 44, 2.2, 4)
    s.append(P("Roles are the functional permission layer. Every role carries a name, a status, one or more allowed "
               "assignment levels, a module-by-action permission matrix and a separate set of administrative "
               "permissions. Data access is configured per module on the same record.", BODY))

    s += figure("2", "Role lifecycle with validation gates", role_lifecycle, 104, D)

    s.append(P("Verified workflow", H2))
    rows = [
        ["#", "Step and screen", "What happens", "Rule enforced"],
        ["1", "Roles list<br/>/admin/settings?tab=roles",
         "Default tab of Role and Access Settings. Shows role count, filters, bulk selection, import and export.",
         "Admin shell access required."],
        ["2", "Create New Role<br/>/admin/settings_/new-role",
         "Full-page editor. Edit mode is the same route with ?editRoleId=.",
         "Role name is required."],
        ["3", "Identity<br/>Name, Description, Status",
         "Captures the role label, purpose and Active or Inactive state. Allowed assignment levels are selected here.",
         "Duplicate names are rejected case-insensitively."],
        ["4", "Module permissions<br/>7 modules, 29 actions",
         "Create, view, edit and delete per module; Schemes adds View List and View Details; Users adds View Teams; "
         "Request adds Assign and Respond.",
         "At least one module permission. View is auto-added before Create, Edit or Delete."],
        ["5", "Data access<br/>per module",
         "Own, Below and Peers can be combined for each module; All selects the three levels.",
         "Selections are stored in canonical order."],
        ["6", "Administrative permissions",
         "Role management, Access assignment and Access delegation are granted independently of module rights.",
         "Optional; used for role authoring and delegation."],
        ["7", "Save and assign<br/>Assign Users sheet",
         "Saving writes the role, then opens user assignment with search, filters and multi-select.",
         "Skip is allowed; the role still becomes assignable."],
    ]
    s.append(table(rows, [16, 112, 200, 153.9], pad=2.7))
    s.append(Paragraph("Source: src/components/admin/RoleAccessSettings.tsx, src/routes/admin.settings_.new-role.tsx, "
                       "src/data/role-management.ts", CAP))

    s.append(P("Module permission catalogue", H2))
    rows = [
        ["Module", "Actions", "Permission key"],
        ["Applicant Profile", "create  \u00b7  edit  \u00b7  view  \u00b7  delete", "applicant_profile.view"],
        ["Applications", "view  \u00b7  create  \u00b7  edit  \u00b7  delete", "applications.edit"],
        ["Schemes", "view_list  \u00b7  view_details  \u00b7  create  \u00b7  edit  \u00b7  delete", "schemes.view_details"],
        ["Roles", "view  \u00b7  create  \u00b7  edit  \u00b7  delete", "roles.manage"],
        ["Designations", "view  \u00b7  create  \u00b7  edit  \u00b7  delete", "designations.edit"],
        ["Users (party_workers)", "view  \u00b7  create  \u00b7  edit  \u00b7  delete  \u00b7  view_teams", "party_workers.view_teams"],
        ["Request (help_desk)", "view  \u00b7  assign_team_member  \u00b7  respond_reply", "help_desk.assign_team_member"],
    ]
    s.append(table(rows, [98, 250, 133.9], pad=2.6))
    s.append(Paragraph("Source: permissionModules and permissionPrerequisites in src/data/party-workers.ts", CAP))

    s.append(P("Business rules the code enforces", H2))
    s += bullets([
        "<b>Prerequisites cascade.</b> A role cannot hold Create, Edit or Delete without View; Schemes View Details "
        "requires View List. Removing View strips the dependants.",
        "<b>Built-in roles are protected.</b> State Admin, District Admin, Constituency Admin, Local Body Admin, "
        "Booth Admin and Party Worker are marked system and cannot be deleted; custom roles can be deactivated or deleted.",
        "<b>Deactivation is a guard, not a delete.</b> The role record and its users stay; the confirmation states "
        "that new assignments are blocked.",
        "<b>One role per user today.</b> The user record stores a single assignedRole string; there is no role-membership table.",
    ], BULLET)
    return s


def page_three():
    s = []
    s.append(P("02  \u00b7  ASSIGNMENT AND EVALUATION", EYEBROW))
    s.append(P("Assigning roles and evaluating access", H1))
    s += rule(ORANGE, 44, 2.2, 4)
    s.append(P("Assignment connects a person to a role. Evaluation is the chain that should decide whether a request "
               "is allowed. In the repository the assignment side is complete in the client; the evaluation side is "
               "rendered and stored but was not verified as a server-enforced gate.", BODY))

    s += figure("3", "Assignment path and the access-evaluation chain", assign_eval, 226, D)

    s.append(P("Data access vocabulary", H2))
    rows = [
        ["Scope", "Intended meaning", "Today"],
        ["Own records", "Records created by or explicitly assigned to the signed-in user.", "Default for every module."],
        ["Below my level", "Records belonging to subordinate organisation units.", "Selectable; not enforced in a query found."],
        ["Same level \u2014 peers", "Records belonging to peer units at the same organisation level.", "Selectable; not enforced in a query found."],
        ["Above my level", "Records belonging to superior units.", "Defined in the type; hidden from the desktop create-role grid."],
    ]
    s.append(table(rows, [96, 226, 159.9], pad=3.6))
    s.append(Paragraph("Source: dataAccessOptions and RoleDataAccess in src/data/role-management.ts", CAP))

    s.append(P("Assignment rules", H2))
    s += bullets([
        "<b>Single role.</b> The Assign Role screen writes one role per user; the picker also offers None, which leaves the user unassigned.",
        "<b>Per-user overrides.</b> The same screen carries a permission grid so an individual can be adjusted without creating a new role.",
        "<b>Status change is reviewed.</b> Moving a user between Active, Pending and Inactive opens an acknowledgement dialog before the record is written.",
        "<b>Bulk assignment.</b> Selecting several users applies one role to all of them; the users tab also exposes role and status filters.",
        "<b>Separate option list.</b> /admin/settings_/assign-role uses its own ROLE_OPTIONS labels (Admin, Sub Admin, Support Admin, Specific Role) rather than the permissionModules action ids. This is a consistency risk, not a verified runtime failure.",
    ], BULLET)

    s += callout("Confirmed limitation",
                     "Role, user and designation records are written to browser localStorage keys "
                     "(vk-managed-roles, vikasita_managed_designations_v1, managed users). No backend API, database "
                     "constraint or query-level data filter was found for these records. Access must therefore be "
                     "treated as a client prototype until server enforcement is implemented.",
                     accent=RED, bg=D.PALE_RED)
    return s


def page_four():
    s = []
    s.append(P("03  \u00b7  DESIGNATION MANAGEMENT", EYEBROW))
    s.append(P("Designations: organisational identity", H1))
    s += rule(ORANGE, 44, 2.2, 4)
    s.append(P("A designation describes where a person sits in the party structure. It is deliberately separate from "
               "the role: a designation does not grant module permissions unless a role does. The Designations tab "
               "maintains the catalogue and the rank order used when a user is created.", BODY))

    s += figure("4", "Designation lifecycle and rank derivation", designation_lifecycle, 94, D)

    s.append(P("Seeded designation catalogue", H2))
    rows = [
        ["Organisation level", "Seeded", "Designations"],
        ["State", "7", "President, Vice President, General Secretary, General Secretary (Organisation), Secretary, Treasurer, Executive Member"],
        ["Region", "4", "President, In-charge, Coordinator, Cluster In-charge"],
        ["Organisational District", "7", "President, Vice President, General Secretary, General Secretary (Organisation), Secretary, Treasurer, Executive Member"],
        ["Mandalam", "6", "President, Vice President, General Secretary, Secretary, Treasurer, Committee Member"],
        ["Area", "4", "Kendra Convener, Area Coordinator, Area In-charge, Area Committee Member"],
        ["Booth", "4", "President, Secretary, Committee Member, Worker"],
    ]
    s.append(table(rows, [110, 42, 329.9], pad=3.4))
    s.append(Paragraph("Source: DEFAULT_DESIGNATIONS_BY_LEVEL in src/components/admin/RoleAccessSettings.tsx. "
                       "A second seeded list, partyDesignations, exists in src/data/party-workers.ts with slightly "
                       "different labels and counts.", CAP))

    s.append(P("Designation compared with role", H2))
    rows = [
        ["Dimension", "Role", "Designation"],
        ["Purpose", "Functional system access", "Organisational identity"],
        ["Grants module permissions", "Yes, by design", "No, unless a role is also assigned"],
        ["Linked to organisation level", "Allowed assignment levels", "One level per designation"],
        ["Drives data visibility", "Through per-module data scope", "Only by placing the user in a unit"],
        ["Deactivation effect", "Blocks new assignments", "Hides the option for new users"],
    ]
    s.append(table(rows, [128, 176, 177.9], pad=3.6))

    s.append(P("Designation rules", H2))
    s += bullets([
        "<b>Parent sets rank.</b> Rank is derived from the parent designation (parent rank + 1); reorder actions move a record up or down the list.",
        "<b>Level filters the picker.</b> Creating a user shows only designations for the selected organisation level; changing the level resets the designation.",
        "<b>Validation is explicit.</b> Saving a user with a designation from another level is rejected with the message that the designation does not belong to the selected organisation level.",
        "<b>Status is controlled.</b> Designations are Active or Disabled and can be bulk enabled, disabled or deleted.",
    ], BULLET)

    s += callout("Storage today",
                 "Designations are written to browser localStorage (vikasita_managed_designations_v1); custom "
                 "organisation levels use vk-custom-organisation-levels. No server-side designation table was found.",
                 accent=ORANGE, bg=PALE_ORANGE)
    return s


def page_five():
    s = []
    s.append(P("04  \u00b7  REQUIREMENTS AND GAPS", EYEBROW))
    s.append(P("Requirements catalogue and confirmed gaps", H1))
    s += rule(ORANGE, 44, 2.2, 4)
    s.append(P("The table records the requirement, its priority, what the repository actually implements and the file "
               "that evidences it. Status words are used strictly: implemented means verified in the client; stored "
               "means the value is written but not enforced; not verified means no implementation was found.", BODY))

    s.append(P("Requirements", H2))
    IMP = '<font color="#1E7A4B"><b>Implemented</b></font>'
    STORE = '<font color="#D96200"><b>Stored</b></font>'
    NV = '<font color="#5B6478"><b>Not verified</b></font>'
    NI = '<font color="#B3261E"><b>Not implemented</b></font>'
    rows = [
        ["ID", "Requirement", "Priority", "Status", "Evidence"],
        ["FR-01", "View the role catalogue with search, filters and counts", "High", IMP, "RoleAccessSettings, Roles tab"],
        ["FR-02", "Create a custom role from a full-page editor", "High", IMP, "admin.settings_.new-role.tsx"],
        ["FR-03", "Edit an existing role and its permission matrix", "High", IMP, "RoleEditorDialog"],
        ["FR-04", "Activate, deactivate, duplicate or delete a role", "Medium", IMP, "RoleAccessSettings handlers"],
        ["FR-05", "Assign 7 modules and 29 actions to a role", "High", IMP, "permissionModules"],
        ["FR-06", "Enforce permission prerequisites automatically", "High", IMP, "withPrerequisites, togglePermission"],
        ["FR-07", "Configure data access per module", "High", STORE, "dataAccess on ManagedRole"],
        ["FR-08", "Grant administrative permissions separately", "Medium", IMP, "administrativePermissionOptions"],
        ["FR-09", "Assign one role to one or many users", "High", IMP, "admin.settings_.assign-role.tsx"],
        ["FR-10", "Maintain the designation catalogue", "High", IMP, "managed designations, localStorage"],
        ["FR-11", "Derive and reorder designation rank", "Medium", IMP, "RoleAccessSettings handlers"],
        ["FR-12", "Filter designations by organisation level", "High", IMP, "admin.settings_.new-user.tsx"],
        ["FR-13", "Enforce permissions on the server", "Critical", NV, "no API or route guard found"],
        ["FR-14", "Record an access audit trail", "High", NI, "no audit store in the codebase"],
    ]
    s.append(table(rows, [38, 186, 52, 82, 123.9], pad=3.1))

    s.append(P("Confirmed gaps", H2))
    rows = [
        ["Gap", "Impact", "Priority", "Recommendation"],
        ["No server-side RBAC", "Client controls can be bypassed", "Critical", "Enforce module and action checks in the API"],
        ["Data scope not applied to queries", "Visibility rules are advisory", "Critical", "Apply own, below and peer filters in data access"],
        ["No audit log", "Access changes cannot be traced", "High", "Record actor, target, before and after values"],
        ["Single role per user", "Combined duties need overrides", "Medium", "Decide whether multi-role is required"],
        ["Two designation seed lists", "Labels and counts differ by screen", "Medium", "Consolidate on one catalogue"],
    ]
    s.append(table(rows, [138, 136, 60, 147.9], pad=3.2))

    s.append(P("Decisions required before build", H2))
    s += bullets([
        "Should a user hold multiple roles, or is one role plus per-user overrides the intended model?",
        "Does \u201cBelow my level\u201d include every descendant unit or only direct children, and does \u201cpeers\u201d mean one unit or the whole level?",
        "Should a designation ever imply a default role, or must the two remain strictly independent?",
        "Which persistence target replaces localStorage, and who owns migration of existing role and designation records?",
    ], BULLET)

    s.append(Spacer(1, 4))
    s.append(P("Prepared from direct inspection of the repository. No application code, role, designation, mapping, "
               "API or database record was modified by this document.", TINY))
    return s


def build(out_path):
    register()
    doc = Brief(out_path)
    story = []
    for i, page in enumerate([page_one, page_two, page_three, page_four, page_five]):
        if i:
            story.append(PageBreak())
        story += page()
    doc.build(story)
    return out_path


if __name__ == "__main__":
    target = os.path.abspath(os.path.join(HERE, "..",
                                          "Vikasita_Keralam_Role_Control_Designation_5Page.pdf"))
    build(target)
    print("WROTE", target)
