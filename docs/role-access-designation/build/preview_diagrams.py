import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas as pdfcanvas

import diagrams as D

pdfmetrics.registerFont(TTFont("Sans", r"C:\Windows\Fonts\segoeui.ttf"))
pdfmetrics.registerFont(TTFont("SansB", r"C:\Windows\Fonts\segoeuib.ttf"))
pdfmetrics.registerFont(TTFont("SansI", r"C:\Windows\Fonts\segoeuii.ttf"))
pdfmetrics.registerFontFamily("Sans", normal="Sans", bold="SansB", italic="SansI", boldItalic="SansB")

FIGURES = [
    ("D1 Role creation", D.role_creation),
    ("D2 Role editing", D.role_editing),
    ("D3 Role assignment", D.role_assignment),
    ("D4 Data access evaluation", D.access_evaluation),
    ("D5 Designation creation", D.designation_creation),
    ("D6 Designation assignment", D.designation_assignment),
    ("D7 Organisation hierarchy", D.organisation_hierarchy),
    ("D8 Settings IA", D.settings_ia),
    ("D9 ER model", D.er_model),
]

out = os.path.join(os.path.dirname(__file__), "..", "..", "..", "tmp", "pdfs", "diagram-preview.pdf")
c = pdfcanvas.Canvas(out, pagesize=A4)
for name, fn in FIGURES:
    c.setFont("SansB", 10)
    c.drawString(20 * mm, A4[1] - 15 * mm, name)
    width, height = 470, 560
    c.saveState()
    c.translate(20 * mm, A4[1] - 22 * mm - height)
    fig = D.Diagram(width, height, fn)
    fig.canv = c
    # painter returns used height; use full frame anyway
    fn(D.Draw(c, width, height))
    c.restoreState()
    c.setFont("Sans", 7)
    c.drawString(20 * mm, 12 * mm, "height used: see next page")
    c.showPage()
c.save()
print(out)
