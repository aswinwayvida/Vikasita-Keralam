"""Vector diagram primitives and the nine required figures."""

from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import Flowable

ORANGE = HexColor("#FF7900")
ORANGE_DARK = HexColor("#D96200")
PALE_ORANGE = HexColor("#FFF3E8")
BLUE = HexColor("#243D95")
PALE_BLUE = HexColor("#EDF0F9")
INK = HexColor("#1A1F36")
MUTED = HexColor("#5B6478")
LINE = HexColor("#D5DBE7")
SOFT = HexColor("#F7F8FB")
WHITE = HexColor("#FFFFFF")
GREEN = HexColor("#1E7A4B")
PALE_GREEN = HexColor("#E9F5EF")
RED = HexColor("#B3261E")
PALE_RED = HexColor("#FCEDEC")

SANS = "Sans"
SANS_B = "SansB"
SANS_I = "SansI"


def wrap_text(text, font, size, width):
    words = text.split()
    lines, cur = [], ""
    for word in words:
        trial = (cur + " " + word).strip()
        if pdfmetrics.stringWidth(trial, font, size) <= width or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


class Diagram(Flowable):
    def __init__(self, width, height, painter):
        Flowable.__init__(self)
        self.width = width
        self.height = height
        self.painter = painter

    def wrap(self, availWidth, availHeight):
        return self.width, self.height

    def draw(self):
        c = self.canv
        c.saveState()
        c.setFillColor(WHITE)
        c.rect(0, 0, self.width, self.height, stroke=0, fill=1)
        self.painter(Draw(c, self.width, self.height))
        c.restoreState()


class Draw:
    """Top-left origin drawing helpers."""

    def __init__(self, canvas, width, height):
        self.c = canvas
        self.w = width
        self.h = height

    def _y(self, top, height):
        return self.h - top - height

    def rect(self, x, top, w, h, fill=WHITE, stroke=LINE, radius=5, lw=0.8, dash=None):
        c = self.c
        c.saveState()
        c.setLineWidth(lw)
        c.setStrokeColor(stroke if stroke is not None else WHITE)
        c.setFillColor(fill)
        if dash:
            c.setDash(dash, 0)
        if radius:
            c.roundRect(x, self._y(top, h), w, h, radius, stroke=1 if stroke else 0, fill=1)
        else:
            c.rect(x, self._y(top, h), w, h, stroke=1 if stroke else 0, fill=1)
        c.restoreState()

    def text(self, x, top, s, size=8.0, font=SANS, color=INK, align="left", width=None, leading=None):
        c = self.c
        leading = leading or size * 1.28
        lines = []
        for para in str(s).split("\n"):
            if width:
                lines.extend(wrap_text(para, font, size, width) or [""])
            else:
                lines.append(para)
        c.saveState()
        c.setFillColor(color)
        c.setFont(font, size)
        y = self.h - top - size
        for line in lines:
            if align == "center" and width:
                c.drawCentredString(x + width / 2.0, y, line)
            elif align == "right" and width:
                c.drawRightString(x + width, y, line)
            else:
                c.drawString(x, y, line)
            y -= leading
        c.restoreState()
        return len(lines) * leading

    def box(self, x, top, w, h, title=None, body=None, fill=WHITE, stroke=LINE,
            title_color=INK, body_color=MUTED, size=8.0, radius=5, accent=None,
            align="center", lw=0.8, title_size=None):
        self.rect(x, top, w, h, fill=fill, stroke=stroke, radius=radius, lw=lw)
        if accent:
            self.c.saveState()
            self.c.setFillColor(accent)
            self.c.roundRect(x, self._y(top, h), 3.2, h, 1.6, stroke=0, fill=1)
            self.c.restoreState()
        pad = 8
        inner = w - 2 * pad
        ts = title_size or size
        cursor = top + 7
        if title:
            th = self.text(x + pad, cursor, title, size=ts, font=SANS_B, color=title_color,
                           align=align, width=inner)
            cursor += th + (1.0 if body else 0)
        if body:
            self.text(x + pad, cursor, body, size=size - 0.6, font=SANS, color=body_color,
                      align=align, width=inner)

    def pill(self, x, top, w, h, s, fill=PALE_BLUE, color=BLUE, size=6.6, font=SANS_B, stroke=None):
        self.rect(x, top, w, h, fill=fill, stroke=stroke, radius=h / 2.0, lw=0.6)
        self.c.saveState()
        self.c.setFillColor(color)
        self.c.setFont(font, size)
        self.c.drawCentredString(x + w / 2.0, self._y(top, h) + h / 2.0 - size * 0.36, s)
        self.c.restoreState()

    def diamond(self, cx, top, w, h, s, fill=PALE_ORANGE, stroke=ORANGE_DARK, size=7.6):
        c = self.c
        cy = self._y(top, h) + h / 2.0
        p = c.beginPath()
        p.moveTo(cx, cy + h / 2.0)
        p.lineTo(cx + w / 2.0, cy)
        p.lineTo(cx, cy - h / 2.0)
        p.lineTo(cx - w / 2.0, cy)
        p.close()
        c.saveState()
        c.setFillColor(fill)
        c.setStrokeColor(stroke)
        c.setLineWidth(0.9)
        c.drawPath(p, stroke=1, fill=1)
        c.restoreState()
        self.text(cx - w / 2.0 + 10, top + h / 2.0 - size * 0.85, s, size=size, font=SANS_B,
                  color=INK, align="center", width=w - 20, leading=size * 1.2)

    def polyline(self, pts, color=MUTED, lw=1.1, dash=None, head=True, head_size=5.0):
        c = self.c
        c.saveState()
        c.setStrokeColor(color)
        c.setLineWidth(lw)
        if dash:
            c.setDash(dash, 0)
        p = c.beginPath()
        p.moveTo(pts[0][0], self.h - pts[0][1])
        for px, py in pts[1:]:
            p.lineTo(px, self.h - py)
        c.drawPath(p, stroke=1, fill=0)
        if head and len(pts) >= 2:
            import math
            (x1, y1), (x2, y2) = pts[-2], pts[-1]
            ang = math.atan2(-(y2 - y1), x2 - x1)
            c.setFillColor(color)
            hx, hy = x2, self.h - y2
            a1 = ang + math.radians(152)
            a2 = ang - math.radians(152)
            q = c.beginPath()
            q.moveTo(hx, hy)
            q.lineTo(hx + head_size * math.cos(a1), hy + head_size * math.sin(a1))
            q.lineTo(hx + head_size * math.cos(a2), hy + head_size * math.sin(a2))
            q.close()
            c.drawPath(q, stroke=0, fill=1)
        c.restoreState()

    def label(self, x, top, s, size=6.6, color=MUTED, font=SANS_I, bg=WHITE):
        c = self.c
        width = pdfmetrics.stringWidth(s, font, size) + 4
        c.saveState()
        if bg is not None:
            c.setFillColor(bg)
            c.rect(x - 2, self._y(top, size * 1.4), width, size * 1.4, stroke=0, fill=1)
        c.setFillColor(color)
        c.setFont(font, size)
        c.drawString(x, self.h - top - size, s)
        c.restoreState()


def legend(d, top=0, items=None, x=0):
    items = items or [
        ("Implemented in code", BLUE, "solid"),
        ("Partially implemented", ORANGE, "solid"),
        ("Not implemented / proposed", LINE, "dash"),
    ]
    cx = x
    for text, color, kind in items:
        d.rect(cx, top + 2.6, 9, 9, fill=color if kind == "solid" else WHITE,
               stroke=color, radius=2, lw=1.0, dash=[2, 2] if kind == "dash" else None)
        w = pdfmetrics.stringWidth(text, SANS, 6.4) + 6
        d.text(cx + 12, top, text, size=6.4, color=MUTED)
        cx += 12 + w + 12
    return cx


def role_creation(d):
    x, bw = 26, 232
    cx = x + bw / 2.0
    steps = [
        ("Settings", "Admin shell, desktop workspace"),
        ("Role & Access Settings", "Roles tab is the default landing tab"),
        ("Roles List", "Create Role in the page header"),
        ("Create New Role form", "Full page route /admin/settings_/new-role"),
        ("Role details", "Name, description, allowed assignment levels, status"),
        ("Module permissions", "7 modules, 29 actions, prerequisites auto-applied"),
        ("Data access scope", "Per module: own / below / same level"),
        ("Review and save", "Client-side validation before commit"),
    ]
    y, h, gap = 6, 34, 13
    for i, (t, b) in enumerate(steps):
        d.box(x, y, bw, h, title=t, body=b, accent=BLUE if i < 5 else ORANGE,
              title_size=7.8, size=7.4)
        if i < len(steps) - 1:
            d.polyline([(cx, y + h), (cx, y + h + gap)], color=LINE, lw=1.1)
        y += h + gap
    dec_top = y
    d.polyline([(cx, dec_top - gap), (cx, dec_top)], color=LINE, lw=1.1)
    d.diamond(cx, dec_top, 226, 44, "Validation passes?", size=7.6)
    err_top = dec_top + 2
    d.box(300, err_top, 148, 44, title="Field errors shown",
          body="Name required, duplicate name, level and permission minimums",
          fill=PALE_RED, stroke=HexColor("#E7B4B0"), title_color=RED, size=6.4, title_size=7.2)
    d.polyline([(cx + 113, dec_top + 22), (300, dec_top + 22)], color=RED, lw=1.0, head=False)
    d.label(cx + 117, dec_top + 8, "No", color=RED, font=SANS_B)
    d.polyline([(448, err_top), (462, err_top), (462, steps and 6 + 4 * (34 + 13) + 17),
                (x + bw, 6 + 4 * (34 + 13) + 17)], color=RED, lw=0.9, dash=[3, 2])
    d.label(392, 6 + 4 * (34 + 13) + 4, "returns to form", color=RED)
    ok_top = dec_top + 44 + 16
    d.polyline([(cx, dec_top + 44), (cx, ok_top)], color=LINE, lw=1.1)
    d.label(cx + 6, dec_top + 46, "Yes", font=SANS_B)
    d.box(x, ok_top, bw, h, title="Persist role",
          body="Browser localStorage key vk-managed-roles",
          fill=PALE_GREEN, stroke=HexColor("#B8DCC8"), title_color=GREEN, size=6.9, title_size=7.5)
    last = ok_top + h + gap
    d.polyline([(cx, ok_top + h), (cx, last)], color=LINE, lw=1.1)
    d.box(x, last, bw, h, title="Role available for assignment",
          body="Appears in user and bulk-assignment role pickers",
          fill=PALE_BLUE, stroke=HexColor("#C3CBE6"), title_color=BLUE, size=6.9, title_size=7.5)
    d.rect(300, dec_top + 58, 152, 58, fill=SOFT, stroke=LINE, radius=4)
    d.text(308, dec_top + 66, "Validation rules", size=6.8, font=SANS_B, color=INK)
    d.text(308, dec_top + 78, "name required; no duplicate name (case-insensitive); at least one level; at least one permission",
           size=6.0, color=MUTED, width=138, leading=7.4)
    return last + h + 4


def role_editing(d):
    x, bw = 26, 236
    cx = x + bw / 2.0
    y, h, gap = 6, 33, 12
    seq = [
        ("Roles List", "Search, filter and open an existing role"),
        ("Role details drawer", "Overview, permissions, data access, assigned users"),
    ]
    for t, b in seq:
        d.box(x, y, bw, h, title=t, body=b, accent=BLUE, title_size=7.8, size=7.2)
        d.polyline([(cx, y + h), (cx, y + h + gap)], color=LINE, lw=1.1)
        y += h + gap
    dec = y
    d.diamond(cx, dec, 220, 42, "Protected system role?", size=7.4)
    d.box(300, dec - 2, 150, 46, title="Read-only",
          body="Create, edit and delete blocked for built-in roles",
          fill=PALE_BLUE, stroke=HexColor("#C3CBE6"), title_color=BLUE, size=6.4, title_size=7.2)
    d.polyline([(cx + 110, dec + 21), (300, dec + 21)], color=BLUE, lw=1.0)
    d.label(cx + 114, dec + 6, "Yes", color=BLUE, font=SANS_B)
    y = dec + 42 + 16
    d.polyline([(cx, dec + 42), (cx, y)], color=LINE, lw=1.1)
    d.label(cx + 6, dec + 44, "No", font=SANS_B)
    steps = [
        ("Edit module permissions", "Tick or clear actions; prerequisites cascade"),
        ("Edit data access scope", "Independent scope toggles per module"),
        ("Impact preview", "Assigned-user count available on the role record"),
        ("Save changes", "updatedAt refreshed, toast confirmation"),
        ("Role record updated", "Stored in vk-managed-roles"),
        ("Next permission check uses new rules", "No live session refresh exists today"),
    ]
    for i, (t, b) in enumerate(steps):
        d.box(x, y, bw, h, title=t, body=b, accent=ORANGE,
              fill=PALE_ORANGE if i == len(steps) - 1 else WHITE, title_size=7.6, size=7.0)
        if i < len(steps) - 1:
            d.polyline([(cx, y + h), (cx, y + h + gap)], color=LINE, lw=1.1)
        y += h + gap
    d.rect(300, dec + 60, 152, 58, fill=SOFT, stroke=LINE, radius=4)
    d.text(308, dec + 68, "Propagation today", size=6.8, font=SANS_B, color=INK)
    d.text(308, dec + 80, "Permissions are read from local storage at render time. Signed-in users keep their cached session; no server-side re-evaluation.",
           size=6.0, color=MUTED, width=138, leading=7.4)
    return y


def role_assignment(d):
    x, bw = 26, 236
    cx = x + bw / 2.0
    y, h, gap = 6, 32, 12
    steps = [
        ("User Management", "Settings, Users tab, or bulk selection"),
        ("Select user(s)", "Single row action or multi-select toolbar"),
        ("Open Assign Role", "Route /admin/settings_/assign-role"),
        ("Choose role", "One role per user; None means Unassigned"),
        ("Optional overrides", "Per-user permission grid on the same screen"),
    ]
    for t, b in steps:
        d.box(x, y, bw, h, title=t, body=b, accent=BLUE, title_size=7.6, size=7.0)
        d.polyline([(cx, y + h), (cx, y + h + gap)], color=LINE, lw=1.1)
        y += h + gap
    dec = y
    d.diamond(cx, dec, 224, 44, "Within delegation authority?", size=7.0)
    d.box(300, dec - 4, 150, 52, title="Blocked",
          body="Escalation guard relies on delegationPolicies constants",
          fill=PALE_RED, stroke=HexColor("#E7B4B0"), title_color=RED, size=6.2, title_size=7.2)
    d.polyline([(cx + 112, dec + 22), (300, dec + 22)], color=RED, lw=1.0)
    d.label(cx + 116, dec + 7, "No", color=RED, font=SANS_B)
    y = dec + 44 + 14
    d.polyline([(cx, dec + 44), (cx, y)], color=LINE, lw=1.1)
    d.label(cx + 6, dec + 46, "Yes", font=SANS_B)
    tail = [
        ("Save assignment", "assignedRole written on the managed user record"),
        ("Effective access", "Role permissions x data scope x organisation unit"),
    ]
    for i, (t, b) in enumerate(tail):
        d.box(x, y, bw, 34, title=t, body=b, accent=GREEN if i else ORANGE,
              fill=PALE_GREEN if i == 0 else PALE_BLUE,
              stroke=HexColor("#B8DCC8") if i == 0 else HexColor("#C3CBE6"),
              title_color=GREEN if i == 0 else BLUE, title_size=7.5, size=6.8)
        if i < len(tail) - 1:
            d.polyline([(cx, y + 34), (cx, y + 34 + gap)], color=LINE, lw=1.1)
        y += 34 + gap
    d.rect(300, dec + 62, 152, 62, fill=SOFT, stroke=LINE, radius=4)
    d.text(308, dec + 70, "Multi-role?", size=6.8, font=SANS_B, color=INK)
    d.text(308, dec + 82, "Not supported. The user record holds a single assignedRole string; there is no role-membership table.",
           size=6.0, color=MUTED, width=138, leading=7.4)
    return y


def access_evaluation(d):
    x, bw = 20, 250
    cx = x + bw / 2.0
    y, h, gap = 6, 30, 9
    steps = [
        ("1  Request routed to a screen", "Direct URL or in-app navigation"),
        ("2  Admin session valid?", "localStorage session, 8-hour expiry"),
        ("3  Account active?", "Status flag on the managed user record"),
        ("4  Role resolved?", "assignedRole is present and known"),
        ("5  Module permission?", "e.g. applications.view"),
        ("6  Action permission?", "e.g. applications.edit"),
        ("7  Data scope configured?", "own / below / same level"),
        ("8  Organisation unit match?", "Location assignment intersects scope"),
    ]
    tops = []
    for i, (t, b) in enumerate(steps):
        d.box(x, y, bw, h, title=t, body=b, accent=BLUE if i < 2 else ORANGE,
              fill=PALE_BLUE if i < 2 else WHITE, title_size=7.4, size=6.6)
        tops.append(y)
        if i < len(steps) - 1:
            d.polyline([(cx, y + h), (cx, y + h + gap)], color=LINE, lw=1.0)
        y += h + gap
    rail_x = 400
    d.polyline([(rail_x, tops[0] + 15), (rail_x, tops[-1] + 15)], color=RED, lw=0.9,
               dash=[2, 2], head=False)
    for yy in tops:
        d.polyline([(x + bw, yy + 15), (rail_x, yy + 15)], color=RED, lw=0.8, dash=[2, 2], head=False)
        d.text(rail_x + 6, yy + 11, "deny", size=5.9, font=SANS_I, color=RED)
    d.box(rail_x - 20, y, 90, 40, title="DENY", body="Default deny",
          fill=PALE_RED, stroke=HexColor("#E7B4B0"), title_color=RED, size=6.2, title_size=9)
    d.polyline([(rail_x, tops[-1] + 15), (rail_x, y - 2)], color=RED, lw=0.9, dash=[2, 2])
    d.polyline([(cx, tops[-1] + h), (cx, y)], color=GREEN, lw=1.3)
    d.box(x, y, bw, 34, title="ALLOW", body="Return the records permitted for that unit",
          fill=PALE_GREEN, stroke=HexColor("#B8DCC8"), title_color=GREEN, size=6.8, title_size=8.2)
    d.rect(20, y + 46, 300, 44, fill=SOFT, stroke=LINE, radius=4)
    d.text(28, y + 54, "Enforcement status", size=6.8, font=SANS_B, color=INK)
    d.text(28, y + 66, "Steps 2 to 8 are evaluated in the browser only. No server-side guard, API middleware or row-level filter exists in the repository.",
           size=6.0, color=MUTED, width=284, leading=7.4)
    return y + 96


def designation_creation(d):
    x, bw = 26, 236
    cx = x + bw / 2.0
    y, h, gap = 6, 33, 12
    steps = [
        ("Settings", "Designations tab"),
        ("Designation Master", "Grouped by organisation level with rank and parent"),
        ("Create Designation", "Dialog opens with level preselected"),
        ("Select organisation level", "State, Region, Org District, Mandalam, Area, Booth"),
        ("Enter designation name", "Mandatory field, no other constraint"),
        ("Optional parent designation", "Rank derived: parent rank + 1, else 1 or 2"),
    ]
    for t, b in steps:
        d.box(x, y, bw, h, title=t, body=b, accent=BLUE, title_size=7.6, size=7.0)
        d.polyline([(cx, y + h), (cx, y + h + gap)], color=LINE, lw=1.1)
        y += h + gap
    dec = y
    d.diamond(cx, dec, 222, 42, "Name entered?", size=7.4)
    d.box(300, dec - 2, 150, 42, title="Blocked",
          body="Name required toast; dialog stays open",
          fill=PALE_RED, stroke=HexColor("#E7B4B0"), title_color=RED, size=6.2, title_size=7.2)
    d.polyline([(cx + 111, dec + 21), (300, dec + 21)], color=RED, lw=1.0)
    d.label(cx + 115, dec + 6, "No", color=RED, font=SANS_B)
    y = dec + 42 + 14
    d.polyline([(cx, dec + 42), (cx, y)], color=LINE, lw=1.1)
    d.label(cx + 6, dec + 44, "Yes", font=SANS_B)
    tail = [
        ("Persist designation", "vk-custom-designations plus override / hidden lists"),
        ("Available in dropdowns", "Filtered to the selected organisation level"),
    ]
    for i, (t, b) in enumerate(tail):
        d.box(x, y, bw, 34, title=t, body=b, accent=ORANGE,
              fill=PALE_ORANGE if i == 0 else PALE_BLUE,
              stroke=HexColor("#F3CDA9") if i == 0 else HexColor("#C3CBE6"),
              title_color=ORANGE_DARK if i == 0 else BLUE, title_size=7.5, size=6.8)
        if i < len(tail) - 1:
            d.polyline([(cx, y + 34), (cx, y + 34 + gap)], color=LINE, lw=1.1)
        y += 34 + gap
    d.rect(300, dec + 54, 152, 66, fill=SOFT, stroke=LINE, radius=4)
    d.text(308, dec + 62, "Validation gaps", size=6.8, font=SANS_B, color=INK)
    d.text(308, dec + 74, "No duplicate-name check, no reserved-name check, and deletion does not test whether users are already assigned.",
           size=6.0, color=MUTED, width=138, leading=7.4)
    return y


def designation_assignment(d):
    x, bw = 22, 244
    cx = x + bw / 2.0
    y, h, gap = 6, 31, 11
    steps = [
        ("User Management", "Create user or edit existing user"),
        ("Select organisation level", "Required before the designation list unlocks"),
        ("Designation dropdown", "Only that level's designations are offered"),
        ("Select location units", "Region, org district, mandalam, area, booth"),
        ("Assign a role", "Optional here; None saves as Unassigned"),
        ("Save user", "Designation and role stored independently"),
    ]
    for t, b in steps:
        d.box(x, y, bw, h, title=t, body=b, accent=BLUE, title_size=7.6, size=7.0)
        d.polyline([(cx, y + h), (cx, y + h + gap)], color=LINE, lw=1.1)
        y += h + gap
    dec = y
    d.diamond(cx, dec, 226, 46, "Designation belongs to level?", size=7.0)
    d.box(300, dec - 4, 150, 46, title="Blocked on save",
          body="Selected designation does not belong to the selected organisation level.",
          fill=PALE_RED, stroke=HexColor("#E7B4B0"), title_color=RED, size=6.0, title_size=7.2)
    d.polyline([(cx + 113, dec + 23), (300, dec + 23)], color=RED, lw=1.0)
    d.label(cx + 117, dec + 8, "No", color=RED, font=SANS_B)
    y = dec + 46 + 12
    d.polyline([(cx, dec + 46), (cx, y)], color=LINE, lw=1.1)
    d.label(cx + 6, dec + 48, "Yes", font=SANS_B)
    d.box(x, y, bw, 50, title="Effective identity",
          body="Designation describes the party post. Permissions still come only from the assigned role.",
          fill=PALE_BLUE, stroke=HexColor("#C3CBE6"), title_color=BLUE, size=6.6, title_size=7.6, accent=GREEN)
    d.rect(300, dec + 54, 152, 60, fill=SOFT, stroke=LINE, radius=4)
    d.text(308, dec + 62, "Level change behaviour", size=6.8, font=SANS_B, color=INK)
    d.text(308, dec + 74, "Changing the level clears the designation selection. A designation is never silently re-mapped, and the role is left untouched.",
           size=6.0, color=MUTED, width=138, leading=7.4)
    return y + 54


def organisation_hierarchy(d):
    W = d.w
    rows = [
        ("Kerala State", "1", "Single statewide root", "verified", "STATE-KL"),
        ("Region", "3", "South, Central, North", "verified", "REG-SOUTH / CENTRAL / NORTH"),
        ("Revenue District", "14", "Geographical reference only", "verified", "Thiruvananthapuram to Kasaragod"),
        ("BJP Organisational District", "30", "Mapped from the 14 revenue districts", "partial", "TVM City / North / South"),
        ("Mandalam", "140", "Constituency based, not stored as data", "partial", "Mapped to assembly constituency"),
        ("Area", "varies", "No canonical dataset in the repository", "missing", "Created ad hoc in Location Master"),
        ("Booth", "varies", "Six placeholder booths per constituency", "missing", "Generated, not official"),
    ]
    y = 4
    rh = 60
    for i, (name, count, note, status, sample) in enumerate(rows):
        d.rect(0, y, W, rh - 6, fill=SOFT if i % 2 == 0 else WHITE, stroke=None, radius=4)
        d.rect(0, y, 3.4, rh - 6, fill=BLUE, stroke=None, radius=2)
        d.text(10, y + 7, name, size=8.2, font=SANS_B, color=INK, width=160)
        d.pill(W - 82, y + 7, 72, 14, count, fill=PALE_ORANGE, color=ORANGE_DARK, size=6.4)
        d.text(10, y + 24, note, size=6.6, color=MUTED, width=214)
        d.text(236, y + 24, sample, size=6.3, color=MUTED, width=170)
        tag = {"verified": ("In code", GREEN, PALE_GREEN),
               "partial": ("Partial", ORANGE_DARK, PALE_ORANGE),
               "missing": ("Not modelled", MUTED, HexColor("#EEF0F4"))}[status]
        d.pill(W - 82, y + 28, 72, 13, tag[0], fill=tag[2], color=tag[1], size=6.0)
        if i < len(rows) - 1:
            d.polyline([(8, y + rh - 11), (12, y + rh - 5), (16, y + rh - 11)],
                       color=HexColor("#A9B3C6"), lw=1.0, head=False)
        y += rh
    d.text(0, y + 2, "Organisation level is a position in this tree. Designation is a party post attached to one level. Neither implies a system role.",
           size=6.4, color=MUTED, width=W)
    return y + 16


def settings_ia(d):
    W = d.w
    d.box(W / 2.0 - 80, 0, 160, 30, title="Settings", body="Admin workspace root",
          fill=PALE_BLUE, stroke=HexColor("#C3CBE6"), title_color=BLUE, title_size=9.5, size=6.4)
    cols = [
        ("Roles", ["Roles List", "Create Role", "Edit Role", "Permission Matrix", "Data Access", "Assignments"], BLUE),
        ("Users", ["User List", "Create User", "Edit User", "Assign Role", "User Details", "Bulk Actions"], ORANGE),
        ("Designations", ["Designation List", "Create Designation", "Edit Designation", "Enable / Disable"], BLUE),
        ("Location", ["Organisation Levels", "Regions", "Org Districts", "Mandalams", "Areas", "Booths"], ORANGE),
    ]
    cw = 110
    gap = (W - 4 * cw) / 3.0
    top = 38
    for i, (title, items, color) in enumerate(cols):
        x = i * (cw + gap)
        d.polyline([(W / 2.0, 30), (W / 2.0, 34), (x + cw / 2.0, 34), (x + cw / 2.0, top)],
                   color=LINE, lw=1.0, head_size=3.6)
        d.box(x, top, cw, 26, title=title, fill=PALE_ORANGE if color == ORANGE else PALE_BLUE,
              stroke=HexColor("#F3CDA9") if color == ORANGE else HexColor("#C3CBE6"),
              title_color=ORANGE_DARK if color == ORANGE else BLUE, title_size=8.4)
        yy = top + 32
        for item in items:
            if not item:
                yy += 22
                continue
            d.rect(x, yy, cw, 18, fill=WHITE, stroke=LINE, radius=3, lw=0.7)
            d.polyline([(x + cw / 2.0, yy - 6), (x + cw / 2.0, yy)], color=LINE, lw=0.8, head_size=3)
            d.text(x + 7, yy + 5, item, size=6.4, color=INK, width=cw - 12)
            yy += 22
    y = top + 32 + 6 * 22 + 10
    d.text(0, y, "All four tabs live in one component (RoleAccessSettings). Roles, Users and Designations persist to local storage; Location edits are in-memory only.",
           size=6.3, color=MUTED, width=W)
    return y + 16


def er_model(d):
    W = d.w
    bw, bh = 132, 46
    gx = 37
    col = [0, bw + gx, 2 * (bw + gx)]
    row = [0, 78, 156, 238]
    boxes = {
        "user": (col[0], row[0], "User", "id, name, status\norgLevel, designationEn", BLUE),
        "roleassign": (col[1], row[0], "Role Assignment", "user to role (1:1)\nembedded on user record", ORANGE),
        "role": (col[2], row[0], "Role", "id, name, status\nsystem flag, preset", BLUE),
        "designation": (col[0], row[1], "Designation", "id, name, orgLevel\nparent, rank, status", BLUE),
        "locationassign": (col[1], row[1], "Location Assignment", "region, org district\nmandalam, area, booth", ORANGE),
        "permission": (col[2], row[1], "Permission", "module.action key\ne.g. applications.edit", BLUE),
        "orglevel": (col[0], row[2], "Organisation Level", "state, region, district\nmandalam, area, booth", BLUE),
        "orgunit": (col[1], row[2], "Organisation Unit", "node in the hierarchy\nparent to child", BLUE),
        "module": (col[2], row[2], "Module", "7 modules\nschemes to designations", BLUE),
        "scope": (col[1], row[3], "Data Access Scope", "own, below, same level\n(above defined, not exposed)", ORANGE),
        "action": (col[2], row[3], "Action", "29 actions\nview, create, edit", BLUE),
    }
    for key, (x, y, title, body, color) in boxes.items():
        d.rect(x, y, bw, bh, fill=WHITE, stroke=color, radius=4, lw=1.0)
        d.rect(x, y, bw, 3, fill=color, stroke=None, radius=1)
        d.text(x + 7, y + 7, title, size=7.3, font=SANS_B, color=color)
        d.text(x + 7, y + 21, body, size=5.9, color=MUTED, width=bw - 14, leading=7.2)

    def R(k):
        x, y, *_ = boxes[k]
        return x + bw, y + bh / 2.0

    def L(k):
        x, y, *_ = boxes[k]
        return x, y + bh / 2.0

    def B(k):
        x, y, *_ = boxes[k]
        return x + bw / 2.0, y + bh

    def T(k):
        x, y, *_ = boxes[k]
        return x + bw / 2.0, y

    d.polyline([R("user"), L("roleassign")], color=BLUE, lw=1.0)
    d.polyline([R("roleassign"), L("role")], color=BLUE, lw=1.0)
    d.label(R("user")[0] + 9, R("user")[1] - 10, "1:1", color=BLUE)
    d.label(R("roleassign")[0] + 9, R("roleassign")[1] - 10, "N:1", color=BLUE)

    d.polyline([B("user"), T("designation")], color=BLUE, lw=1.0)
    d.polyline([B("designation"), T("orglevel")], color=BLUE, lw=1.0)
    d.label(B("designation")[0] + 5, B("designation")[1] + 3, "N:1", color=BLUE)

    d.polyline([L("locationassign"), R("designation")], color=ORANGE, lw=0.9)
    d.polyline([B("locationassign"), T("orgunit")], color=BLUE, lw=1.0)
    d.label(B("locationassign")[0] + 5, B("locationassign")[1] + 3, "N:1", color=BLUE)

    d.polyline([B("role"), T("permission")], color=BLUE, lw=1.0)
    d.label(B("role")[0] + 5, B("role")[1] + 3, "1:N", color=BLUE)
    d.polyline([B("permission"), T("module")], color=BLUE, lw=1.0)
    d.polyline([B("module"), T("action")], color=BLUE, lw=1.0)
    d.label(B("module")[0] + 5, B("module")[1] + 3, "1:N", color=BLUE)

    # scope applies to permissions and is bounded by organisation units
    gap_x = col[2] - 18
    d.polyline([R("scope"), (gap_x, R("scope")[1]), (gap_x, L("permission")[1]), L("permission")],
               color=ORANGE, lw=0.9, dash=[3, 2])
    d.label(gap_x - 42, (R("scope")[1] + L("permission")[1]) / 2.0 - 8, "applies to", color=ORANGE)
    d.polyline([L("scope"), (col[1] - 9, L("scope")[1]), (col[1] - 9, L("orgunit")[1]), L("orgunit")],
               color=ORANGE, lw=0.9, dash=[3, 2])
    d.label(L("scope")[0] - 4, (L("orgunit")[1] + L("scope")[1]) / 2.0 - 9, "bounded by", color=ORANGE)

    y = row[3] + bh + 12
    d.rect(0, y, W, 46, fill=SOFT, stroke=LINE, radius=4, dash=[3, 2])
    d.text(9, y + 8, "Audit Log (not implemented)", size=7.4, font=SANS_B, color=MUTED)
    d.text(9, y + 21, "An access audit trail would record actor, target, before and after values, timestamp and source for role, permission, designation and assignment changes. No such table, writer or viewer exists in the repository.",
           size=6.1, color=MUTED, width=W - 18, leading=7.4)
    y2 = y + 56
    d.text(0, y2, "Conceptual model. The repository has no database schema: entities reflect the TypeScript interfaces and local-storage records that actually exist.",
           size=6.2, color=MUTED, width=W)
    return y2 + 14
