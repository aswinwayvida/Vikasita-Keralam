"""Assemble and render the final PDF."""

import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import common
from common import Doc, DOC_META, TOTAL_PAGES, CONTENT_W
from reportlab.platypus import KeepTogether, Paragraph, Table, Spacer
import part1, part2, part3, part4, part5

OUT_DIR = os.path.abspath(os.path.join(HERE, ".."))
FINAL = os.path.join(OUT_DIR, "Vikasita_Keralam_Role_Access_Designation_BRD_Workflow_IA.pdf")
TEMP = os.path.abspath(os.path.join(HERE, "..", "..", "..", "tmp", "pdfs", "build-pass.pdf"))


def story():
    s = []
    s += part1.cover()
    s += part1.contents()
    s += part1.document_control()
    s += part1.executive_summary()
    s += part1.business_context()
    s += part2.scope_stakeholders()
    s += part2.existing_system()
    s += part2.requirements()
    s += part3.roles_permissions()
    s += part3.designations()
    s += part3.hierarchy()
    s += part3.data_access()
    s += part4.role_workflows()
    s += part4.designation_workflows()
    s += part4.information_architecture()
    s += part4.er_section()
    s += part4.matrices()
    s += part5.user_stories()
    s += part5.acceptance()
    s += part5.risks()
    s += part5.gaps()
    s += part5.recommendations()
    s += part5.decisions()
    s += part5.appendix()
    return s


def flat(seq):
    out = []
    for item in seq:
        if isinstance(item, list):
            out.extend(flat(item))
        else:
            out.append(item)
    return out


def group_headings(items):
    """Keep a section heading with its rule and the short text that follows it."""
    out = []
    i, n = 0, len(items)
    while i < n:
        it = items[i]
        if isinstance(it, Paragraph) and getattr(it, "_toc", None):
            block = [it]
            j = i + 1
            while j < n and (isinstance(items[j], Spacer) or getattr(items[j], "_decor", False)):
                block.append(items[j])
                j += 1
            total, count = 0.0, 0
            while j < n and count < 3 and isinstance(items[j], Paragraph):
                nxt = items[j]
                try:
                    _, h = nxt.wrap(CONTENT_W, 600)
                except Exception:
                    h = 10 ** 6
                if total + h > 220:
                    break
                block.append(nxt)
                total += h
                count += 1
                j += 1
            out.append(KeepTogether(block))
            i = j
        else:
            out.append(it)
            i += 1
    return out


def build(path):
    doc = Doc(path)
    doc.multiBuild(group_headings(flat(story())))
    return doc.page


def main():
    common.register_fonts()
    os.makedirs(os.path.dirname(TEMP), exist_ok=True)
    pages = build(TEMP)
    TOTAL_PAGES[0] = pages
    build(FINAL)
    try:
        from pypdf import PdfReader
        n = len(PdfReader(FINAL).pages)
    except Exception:
        n = pages
    print("FINAL:", FINAL)
    print("PAGES:", n)
    return n


if __name__ == "__main__":
    main()
