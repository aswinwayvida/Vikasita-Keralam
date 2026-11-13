"""Shared styles, helpers and document template."""

import os
from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT, TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, Frame, PageTemplate, Paragraph,
                                Spacer, Table, TableStyle, KeepTogether, PageBreak)

ORANGE = colors.HexColor("#FF7900")
ORANGE_DARK = colors.HexColor("#D96200")
PALE_ORANGE = colors.HexColor("#FFF3E8")
BLUE = colors.HexColor("#243D95")
PALE_BLUE = colors.HexColor("#EDF0F9")
INK = colors.HexColor("#1A1F36")
MUTED = colors.HexColor("#5B6478")
LINE = colors.HexColor("#D5DBE7")
SOFT = colors.HexColor("#F7F8FB")
GREEN = colors.HexColor("#1E7A4B")
RED = colors.HexColor("#B3261E")

FONTS = {
    "Sans": r"C:\Windows\Fonts\segoeui.ttf",
    "SansB": r"C:\Windows\Fonts\segoeuib.ttf",
    "SansI": r"C:\Windows\Fonts\segoeuiit.ttf",
    "SansL": r"C:\Windows\Fonts\segoeuil.ttf",
}


def register_fonts():
    import diagrams as D
    pdfmetrics.registerFont(TTFont("Sans", r"C:\Windows\Fonts\segoeui.ttf"))
    pdfmetrics.registerFont(TTFont("SansB", r"C:\Windows\Fonts\segoeuib.ttf"))
    pdfmetrics.registerFont(TTFont("SansI", r"C:\Windows\Fonts\segoeuii.ttf"))
    pdfmetrics.registerFont(TTFont("SansL", r"C:\Windows\Fonts\segoeuil.ttf"))
    pdfmetrics.registerFontFamily("Sans", normal="Sans", bold="SansB",
                                  italic="SansI", boldItalic="SansB")
    D.SANS, D.SANS_B, D.SANS_I = "Sans", "SansB", "SansI"
    return D


CONTENT_W = A4[0] - 40 * mm

BODY = ParagraphStyle("body", fontName="Sans", fontSize=9, leading=13.7, textColor=INK,
                      spaceAfter=6, alignment=TA_JUSTIFY)
LEAD = ParagraphStyle("lead", parent=BODY, fontSize=10, leading=16, textColor=MUTED,
                      spaceAfter=8)
BUL = ParagraphStyle("bul", parent=BODY, leftIndent=14, bulletIndent=3, spaceAfter=3.5,
                     alignment=TA_LEFT)
SMALL = ParagraphStyle("small", parent=BODY, fontSize=7.8, leading=11, spaceAfter=3)
H1 = ParagraphStyle("h1", fontName="SansB", fontSize=18, leading=22, textColor=BLUE,
                    spaceBefore=0, spaceAfter=3, keepWithNext=1)
H2 = ParagraphStyle("h2", fontName="SansB", fontSize=11.2, leading=14.5, textColor=INK,
                    spaceBefore=13, spaceAfter=5, keepWithNext=1)
H3 = ParagraphStyle("h3", fontName="SansB", fontSize=9.2, leading=12.5, textColor=BLUE,
                    spaceBefore=9, spaceAfter=3, keepWithNext=1)
CAP = ParagraphStyle("cap", fontName="SansI", fontSize=7.2, leading=10, textColor=MUTED,
                     spaceBefore=4, spaceAfter=10, alignment=TA_LEFT)
NOTE = ParagraphStyle("note", fontName="Sans", fontSize=7.4, leading=10.5, textColor=MUTED)
TH = ParagraphStyle("th", fontName="SansB", fontSize=7.2, leading=9.4, textColor=colors.white)
TD = ParagraphStyle("td", fontName="Sans", fontSize=7.4, leading=10.0, textColor=INK)
TDB = ParagraphStyle("tdb", parent=TD, fontName="SansB")
TOC1 = ParagraphStyle("toc1", fontName="Sans", fontSize=9, leading=15, textColor=INK)
TOCH = ParagraphStyle("toch", fontName="SansB", fontSize=10, leading=16, textColor=BLUE)


def P(text, style=None):
    return Paragraph(text, style or BODY)


def bullets(items, style=None, color=ORANGE):
    out = []
    for item in items:
        out.append(Paragraph(item, style or BUL, bulletText="\u2022"))
    return out


def h1(num, title):
    p = Paragraph('%s  %s' % (num, title), H1)
    p._toc = '%s  %s' % (num, title)
    return [p] + rule(ORANGE, 46, 2.2, 6)


def rule(color=ORANGE, width=46, thickness=2.2, space=6):
    t = Table([[""]], colWidths=[width], rowHeights=[thickness])
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), color),
                           ("TOPPADDING", (0, 0), (-1, -1), 0),
                           ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
                           ("LEFTPADDING", (0, 0), (-1, -1), 0),
                           ("RIGHTPADDING", (0, 0), (-1, -1), 0)]))
    t.hAlign = "LEFT"
    t._decor = True
    return [Spacer(1, space), t, Spacer(1, space + 2)]


def table(rows, widths, header=True, font=7.4, zebra=True, pad=4.2, align="LEFT"):
    data = []
    for r_i, row in enumerate(rows):
        line = []
        for cell in row:
            if isinstance(cell, str):
                style = TH if (header and r_i == 0) else TD
                line.append(Paragraph(cell, style))
            else:
                line.append(cell)
        data.append(line)
    t = Table(data, colWidths=widths, repeatRows=1 if header else 0, hAlign=align)
    cmds = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), pad),
        ("BOTTOMPADDING", (0, 0), (-1, -1), pad),
        ("LINEBELOW", (0, 0), (-1, -1), 0.35, LINE),
        ("BOX", (0, 0), (-1, -1), 0.5, LINE),
    ]
    if header:
        cmds += [("BACKGROUND", (0, 0), (-1, 0), BLUE),
                 ("LINEBELOW", (0, 0), (-1, 0), 1.1, ORANGE)]
    if zebra:
        start = 1 if header else 0
        for i in range(start, len(rows)):
            if (i - start) % 2 == 1:
                cmds.append(("BACKGROUND", (0, i), (-1, i), SOFT))
    t.setStyle(TableStyle(cmds))
    return t


def callout(title, body, accent=ORANGE, bg=PALE_ORANGE, width=CONTENT_W):
    inner = []
    if title:
        inner.append(Paragraph('<b>%s</b>' % title, ParagraphStyle(
            "cot", fontName="SansB", fontSize=8.4, leading=11, textColor=INK, spaceAfter=2)))
    inner.append(Paragraph(body, ParagraphStyle(
        "cob", fontName="Sans", fontSize=8, leading=11.6, textColor=MUTED)))
    t = Table([[inner]], colWidths=[width])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("LINEBEFORE", (0, 0), (0, -1), 2.6, accent),
        ("BOX", (0, 0), (-1, -1), 0.4, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    return [Spacer(1, 2), t, Spacer(1, 8)]


def figure(num, title, painter, height, D):
    fig = D.Diagram(470, height, painter)
    cap = Paragraph('Figure %s \u2014 %s' % (num, title), CAP)
    return [Spacer(1, 4), KeepTogether([fig, cap])]


def kv_table(pairs, widths=(126, CONTENT_W - 126)):
    rows = [[Paragraph('<b>%s</b>' % k, TD), Paragraph(v, TD)] for k, v in pairs]
    t = Table(rows, colWidths=list(widths))
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BACKGROUND", (0, 0), (0, -1), SOFT),
        ("LINEBELOW", (0, 0), (-1, -1), 0.35, LINE),
        ("BOX", (0, 0), (-1, -1), 0.5, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 4.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4.5),
    ]))
    return t


TOTAL_PAGES = [0]
DOC_META = {
    "title": "Vikasita Keralam \u2014 Role, Access, Designation: BRD, Workflows and Information Architecture",
    "code": "VK-BRD-RBAC-001",
    "version": "1.0",
    "date": "13 November 2026",
    "classification": "Internal \u2014 planning and approval",
}


class Doc(BaseDocTemplate):
    def __init__(self, filename, **kw):
        BaseDocTemplate.__init__(
            self, filename, pagesize=A4,
            leftMargin=20 * mm, rightMargin=20 * mm,
            topMargin=23 * mm, bottomMargin=18 * mm,
            title=DOC_META["title"], author="Vikasita Keralam Programme Office",
            subject="Business Requirements, RBAC Workflows and Information Architecture",
            creator="Vikasita Keralam documentation build", **kw)
        body_frame = Frame(20 * mm, 18 * mm, CONTENT_W, A4[1] - 41 * mm, id="body",
                           leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        cover_frame = Frame(20 * mm, 18 * mm, CONTENT_W, A4[1] - 36 * mm, id="cover",
                            leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates([
            PageTemplate(id="cover", frames=[cover_frame], onPage=self.cover_page),
            PageTemplate(id="body", frames=[body_frame], onPage=self.body_page),
        ])

    def cover_page(self, canv, doc):
        canv.saveState()
        canv.setFillColor(ORANGE)
        canv.rect(0, A4[1] - 8 * mm, A4[0], 8 * mm, stroke=0, fill=1)
        canv.setFillColor(BLUE)
        canv.rect(0, A4[1] - 8 * mm, A4[0], 1.6 * mm, stroke=0, fill=1)
        canv.setFillColor(PALE_BLUE)
        canv.circle(A4[0] - 6 * mm, A4[1] - 40 * mm, 62 * mm, stroke=0, fill=1)
        canv.setFillColor(colors.white)
        canv.circle(A4[0] - 6 * mm, A4[1] - 40 * mm, 44 * mm, stroke=0, fill=1)
        self._cover_map(canv)
        canv.setStrokeColor(LINE)
        canv.setLineWidth(0.5)
        canv.line(20 * mm, 33 * mm, A4[0] - 20 * mm, 33 * mm)
        canv.setFont("Sans", 6.4)
        canv.setFillColor(MUTED)
        canv.drawString(20 * mm, 27.5 * mm,
                        "Prepared from direct inspection of the source repository. "
                        "No application code, data or configuration was modified.")
        canv.setFillColor(BLUE)
        canv.rect(0, 0, A4[0], 8 * mm, stroke=0, fill=1)
        canv.setFillColor(ORANGE)
        canv.rect(0, 8 * mm, A4[0], 1.6 * mm, stroke=0, fill=1)
        canv.setFont("Sans", 6.6)
        canv.setFillColor(colors.white)
        canv.drawString(20 * mm, 3.1 * mm,
                        "VIKASITA KERALAM  \u00b7   PROGRAMME OFFICE")
        canv.drawRightString(A4[0] - 20 * mm, 3.1 * mm,
                             "INTERNAL \u2014 PLANNING AND APPROVAL")
        canv.restoreState()

    def _cover_map(self, canv):
        """Four-part document map drawn at a fixed position on the cover."""
        parts = [
            ("PART A", "Business requirements",
             "Requirements catalogue, business objectives, rules and stakeholder scope."),
            ("PART B", "Access workflows",
             "Role creation, editing, assignment, permission evaluation and enforcement."),
            ("PART C", "Information architecture",
             "Settings navigation, organisational hierarchy and the entity model."),
            ("PART D", "Scenarios and acceptance",
             "User stories, acceptance criteria, risks, gaps and open decisions."),
        ]
        canv.setFont("SansB", 6.4)
        canv.setFillColor(ORANGE)
        canv.drawString(20 * mm, 88 * mm, "IN THIS DOCUMENT")
        canv.setStrokeColor(LINE)
        canv.setLineWidth(0.5)
        canv.line(58 * mm, 89.4 * mm, A4[0] - 20 * mm, 89.4 * mm)
        gap = 4 * mm
        box_w = (CONTENT_W - 3 * gap) / 4.0
        box_h = 34 * mm
        y0 = 46 * mm
        inner_w = box_w - 8.4 * mm
        for i, (label, title, desc) in enumerate(parts):
            x = 20 * mm + i * (box_w + gap)
            canv.setFillColor(SOFT)
            canv.setStrokeColor(LINE)
            canv.setLineWidth(0.5)
            canv.roundRect(x, y0, box_w, box_h, 1.6 * mm, stroke=1, fill=1)
            canv.setFillColor(ORANGE)
            canv.rect(x, y0, 1.2 * mm, box_h, stroke=0, fill=1)
            canv.setFont("SansB", 5.9)
            canv.setFillColor(ORANGE_DARK)
            canv.drawString(x + 4.6 * mm, y0 + box_h - 5.8 * mm, label)

            canv.setFont("SansB", 7.4)
            canv.setFillColor(BLUE)
            ty = y0 + box_h - 11.8 * mm
            line = ""
            for w in title.split():
                trial = (line + " " + w).strip()
                if line and pdfmetrics.stringWidth(trial, "SansB", 7.4) > inner_w:
                    canv.drawString(x + 4.6 * mm, ty, line)
                    ty -= 3.5 * mm
                    line = w
                else:
                    line = trial
            if line:
                canv.drawString(x + 4.6 * mm, ty, line)

            canv.setFont("Sans", 6.2)
            canv.setFillColor(MUTED)
            ty = y0 + 12.6 * mm
            line = ""
            for w in desc.split():
                trial = (line + " " + w).strip()
                if line and pdfmetrics.stringWidth(trial, "Sans", 6.2) > inner_w:
                    canv.drawString(x + 4.6 * mm, ty, line)
                    ty -= 2.9 * mm
                    line = w
                else:
                    line = trial
            if line:
                canv.drawString(x + 4.6 * mm, ty, line)

    def afterFlowable(self, flowable):
        marker = getattr(flowable, "_toc", None)
        if marker:
            key = "sec-" + marker.split("  ")[0].strip().replace(".", "_")
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(marker, key, level=0, closed=0)
            self.notify("TOCEntry", (0, marker, self.page, key))

    def body_page(self, canv, doc):
        canv.saveState()
        canv.setFont("SansB", 6.8)
        canv.setFillColor(BLUE)
        canv.drawString(20 * mm, A4[1] - 13 * mm, "VIKASITA KERALAM")
        canv.setFont("Sans", 6.8)
        canv.setFillColor(MUTED)
        brand_w = pdfmetrics.stringWidth("VIKASITA KERALAM", "SansB", 6.8)
        canv.drawString(20 * mm + brand_w + 4.5 * mm, A4[1] - 13 * mm,
                        "Role, Access and Designation \u2014 BRD, Workflows and Information Architecture")
        canv.drawRightString(A4[0] - 20 * mm, A4[1] - 13 * mm, DOC_META["code"] + "  \u00b7  v" + DOC_META["version"])
        canv.setStrokeColor(LINE)
        canv.setLineWidth(0.5)
        canv.line(20 * mm, A4[1] - 15 * mm, A4[0] - 20 * mm, A4[1] - 15 * mm)
        canv.line(20 * mm, 13.5 * mm, A4[0] - 20 * mm, 13.5 * mm)
        canv.setFont("Sans", 6.8)
        canv.setFillColor(MUTED)
        canv.drawString(20 * mm, 9.5 * mm, "Internal \u2014 for product, engineering and administration review")
        total = TOTAL_PAGES[0]
        label = "Page %d of %d" % (doc.page, total) if total else "Page %d" % doc.page
        canv.drawRightString(A4[0] - 20 * mm, 9.5 * mm, label)
        canv.restoreState()
