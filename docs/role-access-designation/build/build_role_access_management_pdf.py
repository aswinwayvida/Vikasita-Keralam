from __future__ import annotations

import html
import os
import re
from statistics import mean
from typing import Iterable, Sequence

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas as pdfcanvas
from reportlab.platypus import (
    BaseDocTemplate,
    CondPageBreak,
    Flowable,
    Frame,
    HRFlowable,
    Image,
    KeepTogether,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Preformatted,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
DOC_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE_MD = os.path.join(DOC_DIR, "Role_Access_Control_and_Designation_Management.md")
OUTPUT_PDF = os.path.join(DOC_DIR, "Role_Access_Control_and_Designation_Management.pdf")
LOGO_PATH = os.path.join(ROOT, "public", "vikasita-logo.png")

BLUE = colors.HexColor("#243D95")
BLUE_DARK = colors.HexColor("#182B6B")
BLUE_SOFT = colors.HexColor("#EDF1FA")
ORANGE = colors.HexColor("#FF7900")
ORANGE_SOFT = colors.HexColor("#FFF3E7")
INK = colors.HexColor("#232B3A")
MUTED = colors.HexColor("#5B6577")
LINE = colors.HexColor("#DDE2EA")
PALE = colors.HexColor("#F7F9FC")
WHITE = colors.white

PAGE_W, PAGE_H = A4
LM = 52
RM = 52
TM = 72
BM = 58
CONTENT_W = PAGE_W - LM - RM

FONT = "SegoeUI"
FONT_BOLD = "SegoeUI-Bold"
FONT_SEMI = "SegoeUI-Semibold"
FONT_ITALIC = "SegoeUI-Italic"
FONT_BI = "SegoeUI-BoldItalic"
MONO = "Consolas"
MONO_BOLD = "Consolas-Bold"
FONTS = {
    FONT: r"C:\Windows\Fonts\segoeui.ttf",
    FONT_BOLD: r"C:\Windows\Fonts\segoeuib.ttf",
    FONT_SEMI: r"C:\Windows\Fonts\seguisb.ttf",
    FONT_ITALIC: r"C:\Windows\Fonts\segoeuii.ttf",
    FONT_BI: r"C:\Windows\Fonts\segoeuiz.ttf",
    MONO: r"C:\Windows\Fonts\consola.ttf",
    MONO_BOLD: r"C:\Windows\Fonts\consolab.ttf",
}
for name, path in FONTS.items():
    pdfmetrics.registerFont(TTFont(name, path))
pdfmetrics.registerFontFamily(FONT, normal=FONT, bold=FONT_BOLD, italic=FONT_ITALIC, boldItalic=FONT_BI)

STYLES = {
    "body": ParagraphStyle(
        "body", fontName=FONT, fontSize=9.4, leading=13.8, textColor=INK,
        spaceAfter=5.5, alignment=TA_LEFT, splitLongWords=1, allowWidows=0, allowOrphans=0,
    ),
    "bullet": ParagraphStyle(
        "bullet", fontName=FONT, fontSize=9.4, leading=13.4, textColor=INK,
        leftIndent=15, bulletIndent=3, spaceAfter=3.2, bulletFontName=FONT_BOLD,
        bulletFontSize=8, bulletColor=ORANGE,
    ),
    "number": ParagraphStyle(
        "number", fontName=FONT, fontSize=9.4, leading=13.4, textColor=INK,
        leftIndent=17, bulletIndent=2, spaceAfter=3.2, bulletFontName=FONT_BOLD,
        bulletFontSize=8.2, bulletColor=BLUE,
    ),
    "h2": ParagraphStyle(
        "H2", fontName=FONT_BOLD, fontSize=15.6, leading=19, textColor=BLUE,
        spaceBefore=10, spaceAfter=2, keepWithNext=1,
    ),
    "h3": ParagraphStyle(
        "H3", fontName=FONT_SEMI, fontSize=10.8, leading=14, textColor=BLUE_DARK,
        spaceBefore=8, spaceAfter=2.5, keepWithNext=1,
    ),
    "th": ParagraphStyle(
        "TH", fontName=FONT_SEMI, fontSize=7.5, leading=9.5, textColor=WHITE,
        alignment=TA_LEFT, splitLongWords=1,
    ),
    "td": ParagraphStyle(
        "TD", fontName=FONT, fontSize=7.75, leading=9.9, textColor=INK,
        alignment=TA_LEFT, splitLongWords=1,
    ),
    "td_b": ParagraphStyle(
        "TD_B", fontName=FONT_SEMI, fontSize=7.75, leading=9.9, textColor=BLUE_DARK,
        alignment=TA_LEFT, splitLongWords=1,
    ),
    "quote": ParagraphStyle(
        "quote", fontName=FONT, fontSize=9.1, leading=13, textColor=BLUE_DARK,
        alignment=TA_LEFT,
    ),
    "code": ParagraphStyle(
        "code", fontName=MONO, fontSize=7.55, leading=10.1, textColor=colors.HexColor("#1E2B45"),
    ),
    "toc_title": ParagraphStyle(
        "toc_title", fontName=FONT_BOLD, fontSize=22, leading=26, textColor=BLUE,
        spaceAfter=2,
    ),
}


def esc(text: str) -> str:
    return html.escape(text, quote=False)


INLINE_RE = re.compile(r"(\*\*[^*]+?\*\*|`[^`]+?`|(?<![\w*])\*[^*\n]+?\*(?![\w*]))")


def inline(text: str) -> str:
    text = text.replace("\u2013", "-").replace("\u2014", "-").replace("\u2011", "-")
    text = text.replace("\u2018", "'").replace("\u2019", "'").replace("\u201c", '"').replace("\u201d", '"')
    return "<br/>".join(_inline_line(one) for one in text.split("\n"))


def _inline_line(text: str) -> str:
    out: list[str] = []
    for part in INLINE_RE.split(text):
        if not part:
            continue
        if part.startswith("**") and part.endswith("**") and len(part) > 4:
            out.append(f"<b>{esc(part[2:-2])}</b>")
        elif part.startswith("`") and part.endswith("`") and len(part) > 2:
            out.append(f'<font name="{MONO}" size="8.0" color="#1E2B45">{esc(part[1:-1])}</font>')
        elif part.startswith("*") and part.endswith("*") and len(part) > 2:
            out.append(f"<i>{esc(part[1:-1])}</i>")
        else:
            out.append(esc(part))
    return "".join(out)
def plain(text: str) -> str:
    text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = re.sub(r"(?<![\w*])\*([^*\n]+)\*(?![\w*])", r"\1", text)
    return text


class Rule(Flowable):
    def __init__(self, width: float, color=ORANGE, thickness: float = 1.6, space_before: float = 1, space_after: float = 7):
        super().__init__()
        self.width = width
        self.color = color
        self.thickness = thickness
        self.space_before = space_before
        self.space_after = space_after

    def wrap(self, availWidth, availHeight):
        return self.width, self.thickness + self.space_before + self.space_after

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        y = self.space_after + self.thickness / 2
        self.canv.line(0, y, self.width, y)


class CodeBlock(Flowable):
    def __init__(self, text: str, width: float):
        super().__init__()
        self.text = text.rstrip("\n")
        self.width = width
        self.pad_x = 10
        self.pad_y = 8
        self.inner = Preformatted(text, STYLES["code"])
        self._h = 0

    def wrap(self, availWidth, availHeight):
        _, self._h = self.inner.wrap(self.width - 2 * self.pad_x - 3, availHeight)
        return self.width, self._h + 2 * self.pad_y

    def draw(self):
        c = self.canv
        c.saveState()
        c.setFillColor(colors.HexColor("#F5F7FB"))
        c.roundRect(0, 0, self.width, self._h + 2 * self.pad_y, 4, stroke=0, fill=1)
        c.setFillColor(ORANGE)
        c.rect(0, 0, 3, self._h + 2 * self.pad_y, stroke=0, fill=1)
        c.setStrokeColor(LINE)
        c.setLineWidth(0.5)
        c.roundRect(0, 0, self.width, self._h + 2 * self.pad_y, 4, stroke=1, fill=0)
        c.translate(self.pad_x + 2, self.pad_y)
        self.inner.drawOn(c, 0, 0)
        c.restoreState()


class Callout(Flowable):
    def __init__(self, text: str, width: float, background=ORANGE_SOFT, bar=ORANGE, text_color=BLUE_DARK):
        super().__init__()
        self.para = Paragraph(text, ParagraphStyle("callout", parent=STYLES["quote"], textColor=text_color))
        self.width = width
        self.background = background
        self.bar = bar
        self._h = 0

    def wrap(self, availWidth, availHeight):
        _, self._h = self.para.wrap(self.width - 26, availHeight)
        return self.width, self._h + 14

    def draw(self):
        c = self.canv
        c.saveState()
        c.setFillColor(self.background)
        c.roundRect(0, 0, self.width, self._h + 14, 4, stroke=0, fill=1)
        c.setFillColor(self.bar)
        c.rect(0, 0, 3, self._h + 14, stroke=0, fill=1)
        self.para.drawOn(c, 13, 7)
        c.restoreState()


def parse_blocks(lines: Sequence[str]):
    blocks = []
    i = 0
    n = len(lines)
    while i < n:
        line = lines[i].rstrip("\n")
        s = line.strip()
        if not s:
            i += 1
            continue
        if s.startswith("```"):
            j = i + 1
            buf = []
            while j < n and not lines[j].strip().startswith("```"):
                buf.append(lines[j].rstrip("\n"))
                j += 1
            blocks.append(("code", "\n".join(buf)))
            i = j + 1
            continue
        m = re.match(r"^(#{1,4})\s+(.*)$", s)
        if m:
            blocks.append(("h" + str(len(m.group(1))), m.group(2).strip()))
            i += 1
            continue
        if s == "---":
            blocks.append(("hr", ""))
            i += 1
            continue
        if s.startswith(">"):
            buf = []
            while i < n and lines[i].strip().startswith(">"):
                buf.append(re.sub(r"^\s*>\s?", "", lines[i]))
                i += 1
            blocks.append(("quote", " ".join(x.strip() for x in buf).strip()))
            continue
        if s.startswith("|"):
            rows = []
            while i < n and lines[i].strip().startswith("|"):
                raw = lines[i].strip()
                if raw.count("|") >= 2:
                    cells = [c.strip() for c in raw.strip("|").split("|")]
                    rows.append(cells)
                i += 1
            if len(rows) >= 2 and all(re.match(r"^:?-{2,}:?$", c.replace(" ", "")) for c in rows[1]):
                align = []
                for c in rows[1]:
                    cc = c.replace(" ", "")
                    align.append("right" if cc.endswith(":") and not cc.startswith(":") else "left")
                blocks.append(("table", {"header": rows[0], "align": align, "rows": rows[2:]}))
            continue
        if re.match(r"^[-*]\s+", s):
            items = []
            while i < n and re.match(r"^[-*]\s+", lines[i].strip()):
                items.append(re.sub(r"^[-*]\s+", "", lines[i].strip()))
                i += 1
            blocks.append(("ul", items))
            continue
        if re.match(r"^\d+\.\s+", s):
            items = []
            while i < n and re.match(r"^\d+\.\s+", lines[i].strip()):
                items.append(re.sub(r"^\d+\.\s+", "", lines[i].strip()))
                i += 1
            blocks.append(("ol", items))
            continue
        parts = [s]
        prev_raw = line.rstrip("\n")
        i += 1
        while i < n:
            rawn = lines[i].rstrip("\n")
            nxt = rawn.strip()
            if (not nxt or nxt.startswith("|") or nxt.startswith("```") or nxt.startswith(">")
                    or re.match(r"^#{1,4}\s+", nxt) or re.match(r"^[-*]\s+", nxt) or re.match(r"^\d+\.\s+", nxt) or nxt == "---"):
                break
            parts.append(("\n" if prev_raw.endswith("  ") else " ") + nxt)
            prev_raw = rawn
            i += 1
        blocks.append(("p", "".join(parts)))
    return blocks


def table_widths(header: Sequence[str], rows: Sequence[Sequence[str]], avail: float) -> list[float]:
    cols = len(header)
    natural = []
    floors = []
    for c in range(cols):
        vals = [plain(r[c]) if c < len(r) else "" for r in [header] + list(rows)]
        max_len = max(len(v) for v in vals)
        avg_len = mean(len(v) for v in vals)
        max_token = max((len(tok) for v in vals for tok in re.split(r"[\s/]+", v)), default=1)
        nat = (0.6 * min(max_len, 75) + 0.4 * min(avg_len, 55)) * 3.65 + 12
        natural.append(max(46.0, min(225.0, nat)))
        floors.append(min(130.0, max(42.0, max_token * 4.9 + 13)))
    total_floors = sum(floors)
    if total_floors > avail:
        floors = [f * avail / total_floors for f in floors]
    total = sum(natural)
    widths = [w * avail / total for w in natural]
    for _ in range(6):
        deficit = sum(max(0.0, floors[idx] - w) for idx, w in enumerate(widths))
        flexible = [idx for idx, w in enumerate(widths) if w > floors[idx]]
        if deficit <= 0 or not flexible:
            break
        extra = sum(widths[idx] - floors[idx] for idx in flexible)
        for idx in flexible:
            widths[idx] -= deficit * (widths[idx] - floors[idx]) / extra
        widths = [max(floors[idx], w) for idx, w in enumerate(widths)]
    scale = avail / sum(widths)
    return [w * scale for w in widths]


def make_table(header, rows, align, avail):
    cols = len(header)
    widths = table_widths(header, rows, avail)
    tdata = []
    tdata.append([Paragraph(inline(c), STYLES["th"]) for c in header])
    for r in rows:
        rr = list(r) + [""] * (cols - len(r))
        tdata.append([Paragraph(inline(c) if c else "&nbsp;", STYLES["td"]) for c in rr[:cols]])
    table = Table(tdata, colWidths=widths, repeatRows=1, hAlign="LEFT", splitByRow=1)
    cmds = [
        ("BACKGROUND", (0, 0), (-1, 0), BLUE),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.45, LINE),
        ("LINEBELOW", (0, 0), (-1, 0), 0.8, BLUE),
        ("LEFTPADDING", (0, 0), (-1, -1), 5.2),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5.2),
        ("TOPPADDING", (0, 0), (-1, -1), 4.4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4.8),
    ]
    for r in range(1, len(tdata)):
        if r % 2 == 0:
            cmds.append(("BACKGROUND", (0, r), (-1, r), PALE))
    for c, a in enumerate(align):
        if a == "right":
            cmds.append(("ALIGN", (c, 1), (c, -1), "RIGHT"))
    table.setStyle(TableStyle(cmds))
    return table


class Doc(BaseDocTemplate):
    def __init__(self, filename, **kw):
        super().__init__(
            filename,
            pagesize=A4,
            leftMargin=LM,
            rightMargin=RM,
            topMargin=TM,
            bottomMargin=BM,
            title="Role & Access Control and Designation Management",
            author="Vikasita Keralam",
            subject="Current-state role, access control, permission, designation and organisation hierarchy documentation",
            creator="Vikasita Keralam documentation build",
            **kw,
        )
        frame = Frame(LM, BM, CONTENT_W, PAGE_H - TM - BM, id="body", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        cover_frame = Frame(LM, BM, CONTENT_W, PAGE_H - TM - BM, id="cover", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates([
            PageTemplate(id="cover", frames=[cover_frame], onPage=self.draw_cover),
            PageTemplate(id="body", frames=[frame], onPage=self.draw_header_footer),
        ])
        self._toc_seq = 0

    def draw_cover(self, c: pdfcanvas.Canvas, doc):
        c.saveState()
        c.setFillColor(WHITE)
        c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
        # Brand bands
        c.setFillColor(BLUE)
        c.rect(0, PAGE_H - 10, PAGE_W, 10, stroke=0, fill=1)
        c.setFillColor(ORANGE)
        c.rect(0, PAGE_H - 10, 148, 10, stroke=0, fill=1)
        c.setFillColor(BLUE)
        c.rect(0, 0, 6, PAGE_H, stroke=0, fill=1)

        if os.path.exists(LOGO_PATH):
            c.drawImage(LOGO_PATH, 54, PAGE_H - 132, width=218, height=72, preserveAspectRatio=True, mask="auto")

        y = PAGE_H - 210
        c.setFillColor(ORANGE)
        c.setFont(FONT_SEMI, 8.2)
        c.drawString(55, y, "MANAGEMENT DOCUMENT  /  VERSION 1.0")
        y -= 34
        c.setFillColor(BLUE)
        c.setFont(FONT_BOLD, 30)
        for line in ["Role & Access Control", "and Designation", "Management"]:
            c.drawString(55, y, line)
            y -= 37
        c.setFillColor(ORANGE)
        c.rect(55, y + 6, 64, 3, stroke=0, fill=1)
        y -= 18
        c.setFillColor(MUTED)
        c.setFont(FONT, 10.4)
        for line in ["Current-state guide to roles, permissions, data access,", "designation management and organisational hierarchy."]:
            c.drawString(55, y, line)
            y -= 15

        # Metadata card
        card_y = 268
        card_h = 156
        c.setFillColor(colors.HexColor("#F7F9FD"))
        c.setStrokeColor(colors.HexColor("#DEE4EF"))
        c.setLineWidth(0.8)
        c.roundRect(55, card_y, PAGE_W - 110, card_h, 6, stroke=1, fill=1)
        meta = [
            ("PROJECT", "Vikasita Keralam - Admin Platform"),
            ("DOCUMENT ID", "VK-RCD-MGT-001"),
            ("DATE", "13 November 2026"),
            ("SCOPE", "Roles, access, designations and organisation levels"),
            ("EVIDENCE", "Direct source-code inspection"),
            ("STATUS", "Current state, v1.0"),
        ]
        for idx, (label, value) in enumerate(meta):
            col = idx % 2
            row = idx // 2
            x = 75 + col * ((PAGE_W - 150) / 2)
            yy = card_y + card_h - 30 - row * 43
            c.setFillColor(ORANGE)
            c.setFont(FONT_SEMI, 7.2)
            c.drawString(x, yy, label)
            c.setFillColor(INK)
            c.setFont(FONT, 8.9)
            c.drawString(x, yy - 14, value)

        # Documentation-only notice
        c.setFillColor(ORANGE_SOFT)
        c.roundRect(55, 178, PAGE_W - 110, 48, 4, stroke=0, fill=1)
        c.setFillColor(ORANGE)
        c.rect(55, 178, 3, 48, stroke=0, fill=1)
        c.setFillColor(BLUE_DARK)
        c.setFont(FONT_SEMI, 8.5)
        c.drawString(70, 208, "DOCUMENTATION ONLY")
        c.setFont(FONT, 8.4)
        c.drawString(70, 192, "No application code, UI, module, route, permission or configuration was changed.")

        c.setFillColor(BLUE)
        c.rect(0, 0, PAGE_W, 24, stroke=0, fill=1)
        c.setFillColor(ORANGE)
        c.rect(0, 24, 148, 3, stroke=0, fill=1)
        c.setFillColor(WHITE)
        c.setFont(FONT, 7.7)
        c.drawString(55, 9, "Vikasita Keralam  |  Internal management document")
        c.drawRightString(PAGE_W - 55, 9, "Source-code verified")
        c.restoreState()

    def draw_header_footer(self, c: pdfcanvas.Canvas, doc):
        c.saveState()
        c.setStrokeColor(colors.HexColor("#E4E8F0"))
        c.setLineWidth(0.6)
        c.line(LM, PAGE_H - 42, PAGE_W - RM, PAGE_H - 42)
        c.setFillColor(BLUE)
        c.setFont(FONT_SEMI, 7.2)
        c.drawString(LM, PAGE_H - 34, "VIKASITA KERALAM")
        c.setFillColor(MUTED)
        c.setFont(FONT, 7.2)
        c.drawRightString(PAGE_W - RM, PAGE_H - 34, "Role & Access Control and Designation Management  |  v1.0")
        c.setStrokeColor(colors.HexColor("#E4E8F0"))
        c.line(LM, 40, PAGE_W - RM, 40)
        c.setFillColor(MUTED)
        c.setFont(FONT, 6.8)
        c.drawString(LM, 28, "Internal management document  |  Prepared 13 November 2026")
        c.setFillColor(ORANGE)
        c.rect(LM, 37.2, 28, 1.4, stroke=0, fill=1)
        c.restoreState()

    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph) and flowable.style.name == "H2":
            text = flowable.getPlainText()
            key = "h2-" + re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(text, key, level=0, closed=False)
            self.notify("TOCEntry", (0, text, self.page, key))


class NumberedCanvas(pdfcanvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_states = []

    def showPage(self):
        self._saved_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        total = len(self._saved_states)
        for state in self._saved_states:
            self.__dict__.update(state)
            self._draw_total(total)
            super().showPage()
        super().save()

    def _draw_total(self, total):
        if self.getPageNumber() == 1:
            return
        self.saveState()
        self.setFillColor(MUTED)
        self.setFont(FONT, 6.8)
        self.drawRightString(PAGE_W - RM, 28, f"Page {self.getPageNumber()} of {total}")
        self.restoreState()


def cover_story():
    return [
        Spacer(1, 1),
        NextPageTemplate("body"),
        PageBreak(),
    ]


def toc_story():
    story = [Spacer(1, 6), Paragraph("Contents", STYLES["toc_title"]), Rule(CONTENT_W, ORANGE, 2.2, 2, 12)]
    toc = TableOfContents()
    toc.levelStyles = [
        ParagraphStyle(
            "TOC0", fontName=FONT, fontSize=9.6, leading=18.5, textColor=INK,
            leftIndent=0, firstLineIndent=0, spaceBefore=0, spaceAfter=0,
        )
    ]
    toc.dotsMinLevel = 0
    story.append(toc)

    story.append(Spacer(1, 26))
    story.append(Paragraph(
        "DOCUMENT AT A GLANCE",
        ParagraphStyle("glance_label", fontName=FONT_SEMI, fontSize=7.4, leading=10, textColor=ORANGE),
    ))
    story.append(Spacer(1, 6))
    stat_style = ParagraphStyle(
        "stat", fontName=FONT, fontSize=7.0, leading=10, textColor=MUTED, alignment=1,
    )
    stats = Table(
        [[
            Paragraph('<font name="SegoeUI-Bold" size="21" color="#243D95">18</font><br/><font name="SegoeUI-Semibold" size="6.8" color="#5B6577">SECTIONS</font>', stat_style),
            Paragraph('<font name="SegoeUI-Bold" size="21" color="#243D95">7</font><br/><font name="SegoeUI-Semibold" size="6.8" color="#5B6577">PERMISSION MODULES</font>', stat_style),
            Paragraph('<font name="SegoeUI-Bold" size="21" color="#243D95">29</font><br/><font name="SegoeUI-Semibold" size="6.8" color="#5B6577">PERMISSION ACTIONS</font>', stat_style),
            Paragraph('<font name="SegoeUI-Bold" size="21" color="#243D95">4</font><br/><font name="SegoeUI-Semibold" size="6.8" color="#5B6577">DATA-ACCESS SCOPES</font>', stat_style),
        ]],
        colWidths=[CONTENT_W / 4] * 4,
        hAlign="LEFT",
        style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F7F9FD")),
            ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#DEE4EF")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E6EAF2")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
        ]),
    )
    story.append(stats)
    story.append(Spacer(1, 12))
    story.append(Paragraph(
        "Prepared from direct source-code inspection. Every requirement is labelled Implemented, Partially implemented, Stored/UI only or Not verified.",
        ParagraphStyle("glance_note", fontName=FONT, fontSize=7.4, leading=10.5, textColor=MUTED),
    ))
    story.append(PageBreak())
    return story


def build():
    with open(SOURCE_MD, "r", encoding="utf-8") as fh:
        md = fh.read()
    lines = md.splitlines()
    blocks = parse_blocks(lines)

    story = []
    story.extend(cover_story())
    story.extend(toc_story())

    def table_flow(payload):
        return make_table(payload["header"], payload["rows"], payload["align"], CONTENT_W)

    skip_first_h1 = True
    i = 0
    while i < len(blocks):
        kind, payload = blocks[i]
        if kind == "h1":
            if skip_first_h1:
                skip_first_h1 = False
                i += 1
                continue
            story.append(Spacer(1, 4))
            story.append(Paragraph(inline(payload), ParagraphStyle("H1x", parent=STYLES["h2"], fontSize=18)))
            i += 1
            continue
        if kind == "h2":
            j = i + 1
            while j < len(blocks) and blocks[j][0] == "hr":
                j += 1
            next_is_h3 = j < len(blocks) and blocks[j][0] == "h3"
            need = 210 if next_is_h3 else (95 if payload.strip().lower().startswith("document control") else 118)
            story.append(CondPageBreak(need))
            story.append(Paragraph(inline(payload), STYLES["h2"]))
            story.append(Rule(CONTENT_W, ORANGE, 1.5, 0, 7))
            i += 1
            continue
        if kind == "h3":
            group = [Paragraph(inline(payload), STYLES["h3"])]
            j = i + 1
            while j < len(blocks) and blocks[j][0] == "hr":
                j += 1
            consumed = i + 1
            if j < len(blocks):
                nk, np = blocks[j]
                if nk == "p":
                    group.append(Paragraph(inline(np), STYLES["body"]))
                    consumed = j + 1
                    k = consumed
                    while k < len(blocks) and blocks[k][0] == "hr":
                        k += 1
                    if k < len(blocks) and blocks[k][0] == "table":
                        group.extend([Spacer(1, 3), table_flow(blocks[k][1])])
                        consumed = k + 1
                    elif k < len(blocks) and blocks[k][0] == "code":
                        group.extend([Spacer(1, 2), CodeBlock(blocks[k][1], CONTENT_W)])
                        consumed = k + 1
                elif nk == "table":
                    group.extend([Spacer(1, 3), table_flow(np)])
                    consumed = j + 1
                elif nk == "code":
                    group.extend([Spacer(1, 2), CodeBlock(np, CONTENT_W)])
                    consumed = j + 1
                elif nk == "ul":
                    for item in np:
                        group.append(Paragraph(inline(item), STYLES["bullet"], bulletText="\u2022"))
                    group.append(Spacer(1, 2))
                    consumed = j + 1
                elif nk == "ol":
                    for idx, item in enumerate(np, 1):
                        group.append(Paragraph(inline(item), STYLES["number"], bulletText=f"{idx}."))
                    group.append(Spacer(1, 2))
                    consumed = j + 1
            story.append(KeepTogether(group))
            if consumed > i + 1:
                story.append(Spacer(1, 7))
            i = consumed
            continue
        if kind == "h4":
            story.append(Paragraph(inline(payload), ParagraphStyle("H4x", parent=STYLES["h3"], fontSize=9.6)))
            i += 1
            continue
        if kind == "p":
            if payload.startswith("**Project:**"):
                i += 1
                continue
            story.append(Paragraph(inline(payload), STYLES["body"]))
            i += 1
            continue
        if kind == "ul":
            for item in payload:
                story.append(Paragraph(inline(item), STYLES["bullet"], bulletText="\u2022"))
            story.append(Spacer(1, 2))
            i += 1
            continue
        if kind == "ol":
            for idx, item in enumerate(payload, 1):
                story.append(Paragraph(inline(item), STYLES["number"], bulletText=f"{idx}."))
            story.append(Spacer(1, 2))
            i += 1
            continue
        if kind == "table":
            story.append(Spacer(1, 3))
            story.append(table_flow(payload))
            story.append(Spacer(1, 9))
            i += 1
            continue
        if kind == "code":
            story.append(Spacer(1, 2))
            story.append(CodeBlock(payload, CONTENT_W))
            story.append(Spacer(1, 9))
            i += 1
            continue
        if kind == "quote":
            story.append(Spacer(1, 2))
            story.append(Callout(inline(payload), CONTENT_W))
            story.append(Spacer(1, 9))
            i += 1
            continue
        if kind == "hr":
            story.append(Spacer(1, 5))
        i += 1

    doc = Doc(OUTPUT_PDF)
    doc.multiBuild(story, canvasmaker=NumberedCanvas)
    print(OUTPUT_PDF)

if __name__ == "__main__":
    build()
