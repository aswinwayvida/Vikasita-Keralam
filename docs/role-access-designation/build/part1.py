"""Cover, document control, contents, executive summary, business context."""

from reportlab.lib.units import mm
from reportlab.platypus import Spacer, Paragraph, PageBreak, NextPageTemplate, Table, TableStyle, KeepTogether
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib import colors

from common import *


def cover():
    story = []
    story.append(Spacer(1, 26 * mm))
    story.append(Paragraph("VIKASITA KERALAM", ParagraphStyle(
        "brand", fontName="SansB", fontSize=9, leading=12, textColor=ORANGE,
        charSpace=0)))
    story.append(Spacer(1, 10))
    story.append(Paragraph("Role, Access and<br/>Designation", ParagraphStyle(
        "ct", fontName="SansB", fontSize=30, leading=35, textColor=BLUE)))
    story += rule(ORANGE, 64, 3, 10)
    story.append(Paragraph("Business Requirements, RBAC Workflows<br/>and Information Architecture", ParagraphStyle(
        "cs", fontName="SansL", fontSize=17, leading=23, textColor=INK)))
    story.append(Spacer(1, 10 * mm))
    story.append(Paragraph(
        "A source-verified assessment of role management, module and action permissions, "
        "data access scope, the designation master and the organisational hierarchy that "
        "together determine who can see and do what across the Vikasita Keralam admin platform.",
        ParagraphStyle("cd", fontName="Sans", fontSize=9.6, leading=15.5, textColor=MUTED)))
    story.append(Spacer(1, 14 * mm))
    meta = [
        ("Document reference", DOC_META["code"]),
        ("Version", DOC_META["version"]),
        ("Date", DOC_META["date"]),
        ("Classification", DOC_META["classification"]),
        ("Prepared for", "Product leadership, engineering, state administration"),
        ("Basis", "Static analysis of the repository at D:\\Vikasita-Keralam"),
    ]
    t = kv_table(meta, widths=(120, 250))
    t.hAlign = "LEFT"
    story.append(t)
    story.append(Spacer(1, 12 * mm))
    story.append(Paragraph(
        "<b>Status:</b> Draft for approval. Findings describe the code as it exists today; "
        "recommendations are proposals that require product and engineering sign-off.",
        ParagraphStyle("cn", fontName="Sans", fontSize=7.6, leading=11, textColor=MUTED)))
    story.append(NextPageTemplate("body"))
    story.append(PageBreak())
    return story


def document_control():
    s = []
    s += h1("1", "Document Control")
    s.append(P("This section records how the document was produced, which evidence standards were applied, and what the reader should treat as confirmed fact versus recommendation."))
    s.append(Paragraph("1.1  Version history", H2))
    s.append(table([
        ["Version", "Date", "Author", "Change"],
        ["1.0", DOC_META["date"], "Business Analysis and Solution Architecture", "Initial issue following source-code analysis."],
    ], [50, 78, 150, 203]))
    s.append(Paragraph("1.2  Purpose", H2))
    s.append(P(
        "Vikasita Keralam is a citizen-facing welfare and party-operations platform with a desktop administrative "
        "workspace. Access to that workspace is currently governed by a client-side prototype: roles, designations, "
        "users and location masters are authored in the browser and persisted in local storage. Before the platform "
        "moves to production, the programme needs one agreed description of how access is meant to work, what has "
        "actually been built, and where the two diverge. This document provides that description and the requirements "
        "needed to close the gap."))
    s.append(Paragraph("1.3  Intended audience", H2))
    s += bullets([
        "<b>Product leadership</b> \u2014 to approve the permission model, the designation model and the release scope.",
        "<b>Engineering</b> \u2014 to implement server-side authorisation, persistence and audit against a single specification.",
        "<b>State administration</b> \u2014 to confirm which organisational posts may create roles, assign roles and see data beyond their own unit.",
        "<b>Quality assurance</b> \u2014 to derive test cases from the acceptance criteria in Section 18.",
    ])
    s.append(Paragraph("1.4  Scope", H2))
    s.append(P(
        "In scope: role definition and lifecycle, module and action permissions, data access scope, designation master, "
        "organisation levels and hierarchy, user-to-role, user-to-designation and user-to-location assignment, and the "
        "navigation structure that exposes them. Out of scope: citizen-facing eligibility, schemes, applications "
        "processing, helpdesk operations and mobile screens, except where they consume a permission or a designation."))
    s.append(Paragraph("1.5  Source-code analysis methodology", H2))
    s.append(P(
        "The repository was read directly. Entry points were located from the TanStack route tree, then each screen was "
        "traced to the data modules and helper functions it imports. Every functional claim in this document is tied to "
        "a named file and symbol in Section 23. Where a behaviour could not be located, the document says so "
        "explicitly. No application code, data or configuration was modified."))
    s.append(Paragraph("1.6  Evidence taxonomy", H2))
    s.append(P("Every requirement and finding carries one of these status labels; they are not interchangeable."))
    s.append(table([
        ["Status", "Meaning"],
        ["<b>Implemented</b>", "The behaviour exists and was verified in source code, including its data source and effect."],
        ["<b>Partially Implemented</b>", "A working slice exists, but a rule, validation, guard or persistence step is missing."],
        ["<b>UI Only</b>", "The interface exists and behaves convincingly, but there is no durable data layer or server enforcement behind it."],
        ["<b>Not Implemented</b>", "No corresponding implementation was found in the repository."],
        ["<b>Proposed</b>", "A recommendation that requires approval; it is not a description of current behaviour."],
    ], [92, 389]))
    s.append(Paragraph("1.7  Assumptions and limitations", H2))
    s += bullets([
        "The repository is a front-end prototype. There is no database, no API service and no server-side session store; "
        "conclusions about persistence refer to browser local storage.",
        "Live usage counts, audit history and production role assignments cannot be observed from source code. Where a "
        "figure is a seeded or generated value, it is labelled as such.",
        "Organisational counts (regions, districts, mandalams) are reported exactly as configured in code. They are not "
        "asserted to be the officially notified structure.",
        "Screens outside the Settings workspace are referenced only where they consume a permission or a designation.",
    ])
    return s


def contents():
    s = []
    s.append(Paragraph("Contents", ParagraphStyle("tochead", fontName="SansB", fontSize=16, leading=20, textColor=BLUE)))
    s.append(Spacer(1, 10))
    toc = TableOfContents()
    toc.levelStyles = [ParagraphStyle("tocx", fontName="Sans", fontSize=8.8, leading=14.6,
                                      textColor=INK, leftIndent=0, firstLineIndent=0)]
    toc.dotsMinLevel = 0
    s.append(toc)
    s.append(Spacer(1, 12))
    s += callout("How to read the requirement tables",
                 "Requirement IDs are stable and should be quoted in tickets. The Source column names the file or symbol "
                 "that evidences the row; where a row is a proposal, the source describes the closest existing behaviour "
                 "and the status column says Proposed.",
                 accent=BLUE, bg=PALE_BLUE)
    s.append(PageBreak())
    return s


def executive_summary():
    s = []
    s += h1("2", "Executive Summary")
    s.append(P("Vikasita Keralam already has the shape of a complete access-management product: a role library, a permission matrix over seven modules, four data-access scopes, a designation master keyed to organisation level, a location master that mirrors the party hierarchy, and user records that carry a role, a designation and a set of location assignments."))
    s.append(P("What it does not yet have is a boundary. Every rule is authored and evaluated in the browser. A session is a JSON object in local storage with an eight-hour expiry and a hard-coded role of STATE_ADMIN. Roles, designations, users and overrides are stored in local-storage keys, and the shared access evaluator carries an explicit comment that it is intended for server-side enforcement \u201conce an API exists\u201d. Consequently the platform can demonstrate granular access control but cannot yet enforce it."))
    s.append(P("That distinction matters commercially as well as technically. The programme intends to delegate administration to regional, district, mandalam, area and booth functionaries. Delegation is only safe when three separate concepts are kept apart: the <b>role</b> that grants module and action permissions, the <b>designation</b> that records a party post, and the <b>data access scope</b> that bounds which records a person may see. The current implementation blurs the first and second by auto-generating a system role for every designation, which means a party post can silently carry permissions."))
    s.append(P("The recommended path is not a rebuild. It is to freeze the model described here, move evaluation and persistence to the server, remove the designation-to-role shortcut, and add an audit trail. Sections 20 and 21 set out the gaps and the sequence."))
    s.append(Paragraph("2.1  Position at a glance", H2))
    s.append(table([
        ["Dimension", "Current state"],
        ["Permission modules", "7 modules covering schemes, users, applications, requests, applicant profiles, roles and designations"],
        ["Permission actions", "29 discrete actions; 21 of them declare prerequisite chains that are enforced in the UI"],
        ["Data access scopes", "4 defined (own records, below my level, same level peers, above my level); 3 exposed in the create and edit flows"],
        ["Designations", "30 legacy register entries across 9 levels, plus 32 seeded master records across 6 role levels"],
        ["Organisation levels", "6 role organisation levels and 7 assignment levels; the two lists are not identical"],
        ["Hierarchy configured", "1 state, 3 regions, 14 revenue districts; the 30 organisational districts exist as a mapping, not as hierarchy nodes"],
        ["Users", "Managed in the browser only; a single assigned role per user; seeded counts are demonstrative"],
        ["Server-side enforcement", "None. No API, middleware, database or row-level filter exists in the repository"],
        ["Audit of access changes", "Not implemented. An unrelated operational activity log exists for issues and applications"],
    ], [128, 353]))
    s.append(Paragraph("2.2  What this means for the business", H2))
    s += bullets([
        "<b>Delegation is currently unsafe.</b> Any signed-in administrator can create a role with any permission and assign it, because no server checks the actor and the delegation policy table only recognises two actors.",
        "<b>Visibility cannot be promised.</b> Data-access scope is stored per module but never applied to a query, so \u201cbelow my level\u201d and \u201csame level\u201d currently change nothing outside the settings screens.",
        "<b>Designation and permission are conflated.</b> Twenty-two auto-generated designation roles mean a party post can arrive with scheme and application permissions attached.",
        "<b>The model is otherwise sound.</b> The entity set, scope vocabulary and matrix structure are coherent and can be retained once enforcement moves server-side.",
    ])
    return s


def business_context():
    s = []
    s += h1("3", "Business Context and Objectives")
    s.append(Paragraph("3.1  Why centralised role and access management is needed", H2))
    s.append(P(
        "The platform serves two very different populations. Citizens interact with eligibility checks, schemes and "
        "applications; party functionaries operate an administrative workspace that verifies documents, supports "
        "applications, routes helpdesk requests and maintains worker records. The second population is large, "
        "geographically distributed and organised in a hierarchy, and it changes frequently after organisational "
        "reviews. Access therefore has to be administered by people who are close to the work, without giving any one "
        "of them control of the whole platform."))
    s.append(P(
        "Today that administration happens in a single settings workspace used by a state-level administrator. That is "
        "adequate for a prototype and inadequate for production: it concentrates power, cannot express delegation, and "
        "provides no record of who granted what."))
    s.append(Paragraph("3.2  Business objectives", H2))
    s.append(table([
        ["#", "Objective", "Success measure"],
        ["O1", "Prevent unauthorised access to administrative functions", "Every admin route and data call rejects an actor without the required module and action permission, on the server."],
        ["O2", "Control which modules a user can open", "A user without <i>view</i> on a module cannot reach its route, list or detail screen, including by direct URL."],
        ["O3", "Control which actions a user may perform inside a module", "Create, edit, delete, assign and respond are independently grantable and independently enforced."],
        ["O4", "Restrict data visibility by organisational assignment", "List and detail queries return only records inside the actor\u2019s permitted scope and location units."],
        ["O5", "Let authorised administrators create custom roles", "A delegated administrator can define a role within their own permission ceiling and no higher."],
        ["O6", "Support designation assignment by organisational level", "The designation list offered to a user is filtered to the selected level, and only active designations appear."],
        ["O7", "Keep designation and system permission separate", "Assigning or changing a designation never changes a user\u2019s effective permissions unless an explicit rule says so."],
        ["O8", "Make access management auditable", "Every create, edit, assignment and revocation of a role, designation or permission produces an immutable audit record."],
    ], [26, 208, 247]))
    s.append(Paragraph("3.3  Design principles", H2))
    s += bullets([
        "<b>Deny by default.</b> Absence of a permission is a denial, not an implicit allowance.",
        "<b>Server decides.</b> The interface may hide what a user cannot do, but the server must refuse it.",
        "<b>Least privilege.</b> A role starts empty; permissions are added deliberately.",
        "<b>Separation of concerns.</b> Organisation level, designation, role and data scope are four different things and must be stored and edited separately.",
        "<b>No silent escalation.</b> An administrator cannot grant a permission they do not themselves hold.",
        "<b>Legible to administrators.</b> Every screen states which level, designation and role is being applied, and what that combination permits.",
    ])
    return s
