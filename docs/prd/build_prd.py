#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 markdown 章节编译为排版规范的 PRD DOCX。

用法：
    python3 build_prd.py            # 生成 docx（含目录页码）
    python3 build_prd.py --no-pages # 跳过页码测量，快速生成
    python3 build_prd.py --pdf      # 同时导出 PDF
"""

import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor

from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT, WD_TAB_LEADER
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PARTS = [
    "01-引言与范围.md",
    "03-角色与权限模型.md",
    "04-角色功能列表.md",
    "05-功能需求详述.md",
    "06-用例说明书.md",
    "07-规则与数据模型.md",
    "09-接口页面与非功能.md",
    "12-实施验收与附录.md",
]

OUT_NAME = "院系文档权限与审批OA系统_产品需求说明书_V1.0.docx"
PDF_NAME = "院系文档权限与审批OA系统_产品需求说明书_V1.0.pdf"

NODE = "/Applications/DeepSeek Harness.app/Contents/Resources/runtime/primary-runtime/dependencies/node/bin/node"
LO_CLI = "/Applications/DeepSeek Harness.app/Contents/Resources/app.asar.unpacked/dsh/node_modules/@deepseek-ai/libreoffice-kit/lib/cli.js"

INK = RGBColor(0x1F, 0x28, 0x33)
NAVY = RGBColor(0x1F, 0x38, 0x64)
BLUE = RGBColor(0x2E, 0x54, 0x96)
GRAY = RGBColor(0x5A, 0x64, 0x72)
LIGHT = RGBColor(0x8A, 0x94, 0xA3)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)

BODY_EA = "宋体"
BODY_ASCII = "Times New Roman"
HEAD_EA = "黑体"
CODE_ASCII = "Courier New"

CONTENT_W = 17.0  # cm


# --------------------------------------------------------------------------
# 底层 XML helpers
# --------------------------------------------------------------------------

def _el(tag, **attrs):
    e = OxmlElement(tag)
    for k, v in attrs.items():
        e.set(qn(k), str(v))
    return e


def set_run_font(run, size=None, bold=None, color=None, ea=BODY_EA, ascii_font=BODY_ASCII,
                 italic=None):
    run.font.name = ascii_font
    rPr = run._r.get_or_add_rPr()
    rFonts = rPr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = _el("w:rFonts")
        rPr.insert(0, rFonts)
    rFonts.set(qn("w:ascii"), ascii_font)
    rFonts.set(qn("w:hAnsi"), ascii_font)
    rFonts.set(qn("w:eastAsia"), ea)
    if size is not None:
        run.font.size = Pt(size)
    if bold is not None:
        run.bold = bold
    if italic is not None:
        run.italic = italic
    if color is not None:
        run.font.color.rgb = color


def shade_cell(cell, hexcolor):
    tcPr = cell._tc.get_or_add_tcPr()
    for old in tcPr.findall(qn("w:shd")):
        tcPr.remove(old)
    tcPr.append(_el("w:shd", **{"w:val": "clear", "w:color": "auto", "w:fill": hexcolor}))


def set_cell_margins(table, top=40, left=80, bottom=40, right=80):
    tblPr = table._tbl.tblPr
    for old in tblPr.findall(qn("w:tblCellMar")):
        tblPr.remove(old)
    mar = _el("w:tblCellMar")
    for side, val in (("top", top), ("left", left), ("bottom", bottom), ("right", right)):
        mar.append(_el("w:" + side, **{"w:w": val, "w:type": "dxa"}))
    tblPr.append(mar)


def set_table_borders(table, color="C3CDDD", sz=4, inside=True):
    tblPr = table._tbl.tblPr
    for old in tblPr.findall(qn("w:tblBorders")):
        tblPr.remove(old)
    borders = _el("w:tblBorders")
    sides = ["top", "left", "bottom", "right"]
    if inside:
        sides += ["insideH", "insideV"]
    for side in sides:
        borders.append(_el("w:" + side, **{"w:val": "single", "w:sz": sz,
                                          "w:space": 0, "w:color": color}))
    tblPr.append(borders)


def set_no_borders(table):
    tblPr = table._tbl.tblPr
    for old in tblPr.findall(qn("w:tblBorders")):
        tblPr.remove(old)
    borders = _el("w:tblBorders")
    for side in ("top", "left", "bottom", "right", "insideH", "insideV"):
        borders.append(_el("w:" + side, **{"w:val": "nil"}))
    tblPr.append(borders)


def set_table_width(table, total_cm):
    tblPr = table._tbl.tblPr
    for old in tblPr.findall(qn("w:tblW")):
        tblPr.remove(old)
    tblPr.append(_el("w:tblW", **{"w:w": int(total_cm * 567), "w:type": "dxa"}))
    for old in tblPr.findall(qn("w:tblLayout")):
        tblPr.remove(old)
    tblPr.append(_el("w:tblLayout", **{"w:type": "fixed"}))


def set_col_widths(table, widths_cm):
    total = sum(widths_cm)
    scale = CONTENT_W / total if total > CONTENT_W else 1.0
    widths = [w * scale for w in widths_cm]
    set_table_width(table, sum(widths))
    grid = table._tbl.tblGrid
    for i, gc in enumerate(grid.findall(qn("w:gridCol"))):
        gc.set(qn("w:w"), str(int(widths[i] * 567)))
    for row in table.rows:
        for i, cell in enumerate(row.cells):
            cell.width = Cm(widths[i])


def set_row_cant_split(row):
    trPr = row._tr.get_or_add_trPr()
    trPr.append(_el("w:cantSplit"))


def set_repeat_header(row):
    trPr = row._tr.get_or_add_trPr()
    trPr.append(_el("w:tblHeader", **{"w:val": "true"}))


def set_cell_valign(cell, val="center"):
    tcPr = cell._tc.get_or_add_tcPr()
    for old in tcPr.findall(qn("w:vAlign")):
        tcPr.remove(old)
    tcPr.append(_el("w:vAlign", **{"w:val": val}))


def add_bookmark(paragraph, name, bid):
    start = _el("w:bookmarkStart", **{"w:id": bid, "w:name": name})
    end = _el("w:bookmarkEnd", **{"w:id": bid})
    paragraph._p.insert(0, start)
    paragraph._p.append(end)


def add_internal_link(paragraph, anchor, text, size, bold=False, color=NAVY, font_ea=BODY_EA):
    hyperlink = _el("w:hyperlink", **{"w:anchor": anchor})
    run = paragraph.add_run()
    run._r.getparent().remove(run._r)
    hyperlink.append(run._r)
    run.text = text
    set_run_font(run, size=size, bold=bold, color=color, ea=font_ea)
    paragraph._p.append(hyperlink)


def add_page_field(paragraph, instr, size=9, color=GRAY):
    run = paragraph.add_run()
    set_run_font(run, size=size, color=color)
    fld_begin = _el("w:fldChar", **{"w:fldCharType": "begin"})
    instr_el = _el("w:instrText", **{"xml:space": "preserve"})
    instr_el.text = " %s " % instr
    fld_sep = _el("w:fldChar", **{"w:fldCharType": "separate"})
    text_el = _el("w:t")
    text_el.text = "1"
    fld_end = _el("w:fldChar", **{"w:fldCharType": "end"})
    run._r.append(fld_begin)
    run._r.append(instr_el)
    run._r.append(fld_sep)
    run._r.append(text_el)
    run._r.append(fld_end)


# --------------------------------------------------------------------------
# markdown 解析
# --------------------------------------------------------------------------

class Block:
    def __init__(self, kind, payload=None, widths=None):
        self.kind = kind          # heading / para / bullet / ordered / table / code / quote / hr
        self.payload = payload
        self.widths = widths


QUOTE_RE = re.compile(r'"([^"\n]{1,400})"')


def smart_quotes(text):
    prev = None
    while prev != text:
        prev = text
        text = QUOTE_RE.sub("\u201c\\1\u201d", text)
    return text


def parse_markdown(text):
    lines = text.splitlines()
    blocks = []
    i = 0
    pending_widths = None
    n = len(lines)
    while i < n:
        line = lines[i]
        stripped = line.strip()

        if not stripped:
            i += 1
            continue

        m = re.match(r"^<!--\s*widths:\s*([\d.,\s]+?)\s*-->$", stripped)
        if m:
            pending_widths = [float(x) for x in m.group(1).split(",") if x.strip()]
            i += 1
            continue

        if stripped.startswith("```"):
            i += 1
            buf = []
            while i < n and not lines[i].strip().startswith("```"):
                buf.append(lines[i])
                i += 1
            i += 1
            blocks.append(Block("code", "\n".join(buf)))
            continue

        m = re.match(r"^(#{1,4})\s+(.*)$", stripped)
        if m:
            blocks.append(Block("heading", (len(m.group(1)), smart_quotes(m.group(2).strip()))))
            i += 1
            continue

        if stripped.startswith("|") and i + 1 < n and re.match(
                r"^\|?[\s:\-|]+\|?$", lines[i + 1].strip()) and "-" in lines[i + 1]:
            rows = []
            header = [smart_quotes(c.strip()) for c in stripped.strip("|").split("|")]
            i += 2
            while i < n and lines[i].strip().startswith("|"):
                cells = [smart_quotes(c.strip()) for c in lines[i].strip().strip("|").split("|")]
                rows.append(cells)
                i += 1
            blocks.append(Block("table", (header, rows), pending_widths))
            pending_widths = None
            continue

        if stripped.startswith("> "):
            buf = []
            while i < n and lines[i].strip().startswith("> "):
                buf.append(smart_quotes(lines[i].strip()[2:].strip()))
                i += 1
            blocks.append(Block("quote", buf))
            continue

        if re.match(r"^-{3,}$", stripped):
            blocks.append(Block("hr"))
            i += 1
            continue

        if re.match(r"^[-*]\s+", stripped):
            blocks.append(Block("bullet", smart_quotes(re.sub(r"^[-*]\s+", "", stripped))))
            i += 1
            continue

        if re.match(r"^\d+\.\s+", stripped):
            blocks.append(Block("ordered", smart_quotes(stripped)))
            i += 1
            continue

        buf = [stripped]
        i += 1
        while i < n:
            nxt = lines[i].strip()
            if (not nxt or nxt.startswith("#") or nxt.startswith("|") or nxt.startswith(">")
                    or nxt.startswith("```") or re.match(r"^[-*]\s+", nxt)
                    or re.match(r"^\d+\.\s+", nxt) or nxt.startswith("<!--")):
                break
            buf.append(nxt)
            i += 1
        blocks.append(Block("para", smart_quotes("".join(buf))))
    return blocks


def split_inline(text):
    parts = re.split(r"(\*\*.+?\*\*|`[^`]+`)", text)
    out = []
    for part in parts:
        if not part:
            continue
        if part.startswith("**") and part.endswith("**") and len(part) > 4:
            out.append((part[2:-2], "bold"))
        elif part.startswith("`") and part.endswith("`") and len(part) > 2:
            out.append((part[1:-1], "code"))
        else:
            out.append((part, "normal"))
    return out


def add_rich_text(paragraph, text, size=10.5, color=INK, bold=False, ea=BODY_EA):
    for seg, kind in split_inline(text):
        run = paragraph.add_run(seg)
        if kind == "code":
            set_run_font(run, size=size - 0.5, color=RGBColor(0x9C, 0x27, 0x32),
                         ea=ea, ascii_font=CODE_ASCII)
        else:
            set_run_font(run, size=size, bold=(bold or kind == "bold"), color=color, ea=ea)


# --------------------------------------------------------------------------
# 样式与页面
# --------------------------------------------------------------------------

def setup_styles(doc):
    normal = doc.styles["Normal"]
    normal.font.name = BODY_ASCII
    normal.font.size = Pt(10.5)
    normal.font.color.rgb = INK
    rPr = normal.element.get_or_add_rPr()
    rFonts = rPr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = _el("w:rFonts")
        rPr.insert(0, rFonts)
    rFonts.set(qn("w:ascii"), BODY_ASCII)
    rFonts.set(qn("w:hAnsi"), BODY_ASCII)
    rFonts.set(qn("w:eastAsia"), BODY_EA)
    pf = normal.paragraph_format
    pf.line_spacing = 1.45
    pf.space_before = Pt(0)
    pf.space_after = Pt(3)
    pf.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    specs = {
        "Heading 1": (20, NAVY, 0, 12),
        "Heading 2": (14, BLUE, 14, 7),
        "Heading 3": (12, NAVY, 11, 5),
        "Heading 4": (11, RGBColor(0x33, 0x3D, 0x4B), 8, 4),
    }
    for name, (size, color, before, after) in specs.items():
        st = doc.styles[name]
        st.font.name = BODY_ASCII
        st.font.size = Pt(size)
        st.font.bold = True
        st.font.color.rgb = color
        rPr = st.element.get_or_add_rPr()
        rFonts = rPr.find(qn("w:rFonts"))
        if rFonts is None:
            rFonts = _el("w:rFonts")
            rPr.insert(0, rFonts)
        rFonts.set(qn("w:ascii"), BODY_ASCII)
        rFonts.set(qn("w:hAnsi"), BODY_ASCII)
        rFonts.set(qn("w:eastAsia"), HEAD_EA)
        pf = st.paragraph_format
        pf.space_before = Pt(before)
        pf.space_after = Pt(after)
        pf.line_spacing = 1.25
        pf.keep_with_next = True
        pf.alignment = WD_ALIGN_PARAGRAPH.LEFT

    doc.styles["Heading 1"].paragraph_format.page_break_before = True


def setup_page(doc):
    sec = doc.sections[0]
    sec.page_width = Cm(21)
    sec.page_height = Cm(29.7)
    sec.top_margin = Cm(2.3)
    sec.bottom_margin = Cm(2.2)
    sec.left_margin = Cm(2.0)
    sec.right_margin = Cm(2.0)
    sec.header_distance = Cm(1.1)
    sec.footer_distance = Cm(1.1)
    sec.different_first_page_header_footer = True
    return sec


def _hf_table(container, cols, widths, bottom_line=False):
    table = container.add_table(rows=1, cols=cols, width=Cm(CONTENT_W))
    table.autofit = False
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_no_borders(table)
    set_cell_margins(table, top=0, left=0, bottom=60 if bottom_line else 0, right=0)
    set_col_widths(table, widths)
    if bottom_line:
        tblPr = table._tbl.tblPr
        for old in tblPr.findall(qn("w:tblBorders")):
            tblPr.remove(old)
        borders = _el("w:tblBorders")
        for side, val in (("top", "nil"), ("left", "nil"), ("right", "nil"),
                          ("insideH", "nil"), ("insideV", "nil")):
            borders.append(_el("w:" + side, **{"w:val": val}))
        borders.append(_el("w:bottom", **{"w:val": "single", "w:sz": 4,
                                          "w:space": 0, "w:color": "D5DCE7"}))
        tblPr.append(borders)
    return table


def _clear_container(container):
    for p in list(container.paragraphs):
        p._p.getparent().remove(p._p)


def setup_header_footer(sec, meta):
    header = sec.header
    _clear_container(header)
    ht = _hf_table(header, 2, [11.5, 5.5], bottom_line=True)
    c0, c1 = ht.rows[0].cells
    p0 = c0.paragraphs[0]
    p0.paragraph_format.space_after = Pt(2)
    r0 = p0.add_run(meta["title"] + "　产品需求说明书")
    set_run_font(r0, size=8.5, color=LIGHT)
    p1 = c1.paragraphs[0]
    p1.paragraph_format.space_after = Pt(2)
    p1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r1 = p1.add_run("V" + meta["version"].lstrip("Vv"))
    set_run_font(r1, size=8.5, color=LIGHT)

    footer = sec.footer
    _clear_container(footer)
    ft = _hf_table(footer, 3, [5.5, 6.0, 5.5])
    f0, f1, f2 = ft.rows[0].cells
    pf0 = f0.paragraphs[0]
    rf0 = pf0.add_run("内部资料 · 请勿外传")
    set_run_font(rf0, size=8, color=LIGHT)
    pf1 = f1.paragraphs[0]
    pf1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = pf1.add_run("第 ")
    set_run_font(r, size=9, color=GRAY)
    add_page_field(pf1, "PAGE")
    r = pf1.add_run(" 页 / 共 ")
    set_run_font(r, size=9, color=GRAY)
    add_page_field(pf1, "NUMPAGES")
    r = pf1.add_run(" 页")
    set_run_font(r, size=9, color=GRAY)
    pf2 = f2.paragraphs[0]
    pf2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    rf2 = pf2.add_run("院系 OA 项目组")
    set_run_font(rf2, size=8, color=LIGHT)

    sec.first_page_header.paragraphs[0].text = ""
    sec.first_page_footer.paragraphs[0].text = ""


# --------------------------------------------------------------------------
# 页面构件
# --------------------------------------------------------------------------

def front_title(doc, text, size=20, space_before=0):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r = p.add_run(text)
    set_run_font(r, size=size, bold=True, color=NAVY, ea=HEAD_EA)
    return p


def rule(doc, color="C9D6E8", sz=6, space=4):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(space)
    p.paragraph_format.space_after = Pt(space)
    p.paragraph_format.line_spacing = Pt(1)
    pPr = p._p.get_or_add_pPr()
    pBdr = _el("w:pBdr")
    pBdr.append(_el("w:bottom", **{"w:val": "single", "w:sz": sz,
                                   "w:space": 1, "w:color": color}))
    pPr.append(pBdr)
    return p


def add_table(doc, header, rows, widths=None, font_size=9):
    cols = len(header)
    table = doc.add_table(rows=1, cols=cols)
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    if widths is None or len(widths) != cols:
        widths = heuristic_widths(header, rows)

    hdr = table.rows[0]
    set_repeat_header(hdr)
    set_row_cant_split(hdr)
    for i, text in enumerate(header):
        cell = hdr.cells[i]
        shade_cell(cell, "1F3864")
        set_cell_valign(cell)
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(1)
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
        add_rich_text(p, text, size=font_size, color=WHITE, bold=True, ea=HEAD_EA)

    for ridx, row in enumerate(rows):
        r = table.add_row()
        set_row_cant_split(r)
        for i in range(cols):
            text = row[i] if i < len(row) else ""
            cell = r.cells[i]
            set_cell_valign(cell)
            if ridx % 2 == 1:
                shade_cell(cell, "F3F6FB")
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            p.paragraph_format.line_spacing = 1.2
            p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
            add_rich_text(p, text, size=font_size, color=INK)

    set_table_borders(table)
    set_cell_margins(table)
    set_col_widths(table, widths)

    spacer = doc.add_paragraph()
    spacer.paragraph_format.space_before = Pt(0)
    spacer.paragraph_format.space_after = Pt(0)
    spacer.paragraph_format.line_spacing = Pt(6)
    return table


def add_kv_table(doc, rows, widths=None):
    """“项目 / 内容”式键值表：首列为标签，无表头，跨页更自然。"""
    table = doc.add_table(rows=0, cols=2)
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    widths = widths or [3.4, 13.2]
    for row in rows:
        r = table.add_row()
        set_row_cant_split(r)
        label = row[0] if len(row) > 0 else ""
        value = row[1] if len(row) > 1 else ""
        c0, c1 = r.cells
        shade_cell(c0, "EDF2F9")
        set_cell_valign(c0, "top")
        set_cell_valign(c1, "top")
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_before = Pt(2)
        p0.paragraph_format.space_after = Pt(2)
        p0.paragraph_format.line_spacing = 1.2
        r0 = p0.add_run(label)
        set_run_font(r0, size=9, bold=True, color=NAVY)
        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_before = Pt(2)
        p1.paragraph_format.space_after = Pt(2)
        p1.paragraph_format.line_spacing = 1.25
        add_rich_text(p1, value, size=9)
    set_table_borders(table)
    set_cell_margins(table)
    set_col_widths(table, widths)
    spacer = doc.add_paragraph()
    spacer.paragraph_format.space_before = Pt(0)
    spacer.paragraph_format.space_after = Pt(0)
    spacer.paragraph_format.line_spacing = Pt(6)
    return table


def add_fr_cards(doc, rows):
    """编号/功能/角色/优先级/描述 五列表 → 两列需求卡片，长描述更易读。"""
    table = doc.add_table(rows=1, cols=2)
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    widths = [4.6, 12.0]

    hdr = table.rows[0]
    set_repeat_header(hdr)
    set_row_cant_split(hdr)
    for i, text in enumerate(["需求条目", "需求描述与验收要点"]):
        cell = hdr.cells[i]
        shade_cell(cell, "1F3864")
        set_cell_valign(cell)
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.space_after = Pt(1)
        p.paragraph_format.line_spacing = 1.15
        add_rich_text(p, text, size=9, color=WHITE, bold=True, ea=HEAD_EA)

    for ridx, row in enumerate(rows):
        code = row[0] if len(row) > 0 else ""
        name = row[1] if len(row) > 1 else ""
        role = row[2] if len(row) > 2 else ""
        prio = row[3] if len(row) > 3 else ""
        desc = row[4] if len(row) > 4 else ""

        r = table.add_row()
        set_row_cant_split(r)
        left, right = r.cells
        for c in (left, right):
            set_cell_valign(c, "top")
            if ridx % 2 == 1:
                shade_cell(c, "F3F6FB")

        p0 = left.paragraphs[0]
        p0.paragraph_format.space_before = Pt(2)
        p0.paragraph_format.space_after = Pt(1)
        p0.paragraph_format.line_spacing = 1.1
        r_code = p0.add_run(code)
        set_run_font(r_code, size=8, bold=True, color=BLUE)
        r_gap = p0.add_run("　")
        set_run_font(r_gap, size=8)
        r_prio = p0.add_run(prio)
        prio_color = {"P0": RGBColor(0xB0, 0x3A, 0x2E),
                      "P1": RGBColor(0xB7, 0x79, 0x1F),
                      "P2": RGBColor(0x6B, 0x72, 0x80)}.get(prio, GRAY)
        set_run_font(r_prio, size=8, bold=True, color=prio_color)

        p1 = left.add_paragraph()
        p1.paragraph_format.space_before = Pt(0)
        p1.paragraph_format.space_after = Pt(1)
        p1.paragraph_format.line_spacing = 1.15
        r_name = p1.add_run(name)
        set_run_font(r_name, size=10, bold=True, color=INK)

        p2 = left.add_paragraph()
        p2.paragraph_format.space_before = Pt(0)
        p2.paragraph_format.space_after = Pt(2)
        p2.paragraph_format.line_spacing = 1.1
        r_role = p2.add_run(role)
        set_run_font(r_role, size=8, color=GRAY)

        pd = right.paragraphs[0]
        pd.paragraph_format.space_before = Pt(2)
        pd.paragraph_format.space_after = Pt(2)
        pd.paragraph_format.line_spacing = 1.3
        add_rich_text(pd, desc, size=9)

    set_table_borders(table)
    set_cell_margins(table)
    set_col_widths(table, widths)

    spacer = doc.add_paragraph()
    spacer.paragraph_format.space_before = Pt(0)
    spacer.paragraph_format.space_after = Pt(0)
    spacer.paragraph_format.line_spacing = Pt(6)
    return table


def visual_len(text):
    total = 0
    for ch in text:
        total += 2 if ord(ch) > 127 else 1
    return total


def heuristic_widths(header, rows):
    weights = []
    for i in range(len(header)):
        lens = [visual_len(header[i])]
        for row in rows[:40]:
            if i < len(row):
                lens.append(visual_len(row[i]))
        longest = max(lens)
        avg = sum(lens) / len(lens)
        score = max(6, min(64, longest)) ** 0.62
        if avg < 4:
            score = min(score, 4.5)
        weights.append(score)
    total = sum(weights)
    widths = [CONTENT_W * w / total for w in weights]
    widths = [max(1.25, w) for w in widths]
    s = sum(widths)
    return [w * CONTENT_W / s for w in widths]


def add_code_block(doc, code):
    table = doc.add_table(rows=1, cols=1)
    table.autofit = False
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_row_cant_split(table.rows[0])
    cell = table.rows[0].cells[0]
    shade_cell(cell, "F6F8FA")
    set_col_widths(table, [CONTENT_W])
    set_table_borders(table, color="DCE3EC", sz=4)
    set_cell_margins(table, top=80, left=120, bottom=80, right=120)
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.05
    for idx, line in enumerate(code.split("\n")):
        if idx > 0:
            p = cell.add_paragraph()
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.05
        run = p.add_run(line if line else " ")
        set_run_font(run, size=8.5, color=RGBColor(0x2B, 0x33, 0x40),
                     ea="宋体", ascii_font=CODE_ASCII)
        t = run._r.find(qn("w:t"))
        if t is not None:
            t.set(qn("xml:space"), "preserve")
    spacer = doc.add_paragraph()
    spacer.paragraph_format.space_before = Pt(0)
    spacer.paragraph_format.space_after = Pt(0)
    spacer.paragraph_format.line_spacing = Pt(6)


def add_callout(doc, lines):
    table = doc.add_table(rows=1, cols=1)
    table.autofit = False
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_row_cant_split(table.rows[0])
    cell = table.rows[0].cells[0]
    shade_cell(cell, "EEF3FA")
    set_col_widths(table, [CONTENT_W])
    set_cell_margins(table, top=80, left=140, bottom=80, right=120)
    tblPr = table._tbl.tblPr
    for old in tblPr.findall(qn("w:tblBorders")):
        tblPr.remove(old)
    borders = _el("w:tblBorders")
    borders.append(_el("w:left", **{"w:val": "single", "w:sz": 18, "w:space": 0,
                                    "w:color": "2E5496"}))
    for side in ("top", "bottom", "right"):
        borders.append(_el("w:" + side, **{"w:val": "nil"}))
    borders.append(_el("w:insideH", **{"w:val": "nil"}))
    borders.append(_el("w:insideV", **{"w:val": "nil"}))
    tblPr.append(borders)

    for idx, line in enumerate(lines):
        p = cell.paragraphs[0] if idx == 0 else cell.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(1)
        p.paragraph_format.line_spacing = 1.3
        p.paragraph_format.left_indent = Cm(0.1)
        add_rich_text(p, line, size=9.5, color=RGBColor(0x1E, 0x33, 0x55))
    spacer = doc.add_paragraph()
    spacer.paragraph_format.space_before = Pt(0)
    spacer.paragraph_format.space_after = Pt(0)
    spacer.paragraph_format.line_spacing = Pt(6)


def add_label(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.first_line_indent = Cm(0)
    p.paragraph_format.space_before = Pt(5)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.3
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    set_run_font(r, size=10.5, bold=True, color=NAVY)
    return p


def add_para(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.first_line_indent = Cm(0.74)
    add_rich_text(p, text, size=10.5)
    return p


def add_bullet(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Cm(0.95)
    p.paragraph_format.first_line_indent = Cm(-0.35)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.4
    r = p.add_run("•  ")
    set_run_font(r, size=10.5, color=BLUE)
    add_rich_text(p, text, size=10.5)
    return p


def add_ordered(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Cm(1.0)
    p.paragraph_format.first_line_indent = Cm(-0.55)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.4
    add_rich_text(p, text, size=10.5)
    return p


def add_heading(doc, level, text, bid):
    p = doc.add_paragraph(style="Heading %d" % level)
    p.paragraph_format.line_spacing = 1.2
    run = p.add_run(text)
    set_run_font(run, size={1: 20, 2: 14, 3: 12, 4: 11}[level],
                 bold=True,
                 color={1: NAVY, 2: BLUE, 3: NAVY, 4: RGBColor(0x33, 0x3D, 0x4B)}[level],
                 ea=HEAD_EA)
    if level == 1:
        pPr = p._p.get_or_add_pPr()
        pBdr = _el("w:pBdr")
        pBdr.append(_el("w:bottom", **{"w:val": "single", "w:sz": 8,
                                       "w:space": 6, "w:color": "B7C7DE"}))
        pPr.append(pBdr)
    name = "_Toc900%03d" % bid
    add_bookmark(p, name, 1000 + bid)
    return p, name


# --------------------------------------------------------------------------
# 封面 / 文档控制 / 目录
# --------------------------------------------------------------------------

def build_cover(doc, meta):
    band = doc.add_table(rows=1, cols=1)
    band.autofit = False
    cell = band.rows[0].cells[0]
    shade_cell(cell, "1F3864")
    set_col_widths(band, [CONTENT_W])
    cell.height = Cm(0.45)
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    p.add_run(" ")

    for _ in range(4):
        sp = doc.add_paragraph()
        sp.paragraph_format.space_after = Pt(0)
        sp.paragraph_format.line_spacing = Pt(10)

    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run("PRODUCT　REQUIREMENTS　DOCUMENT")
    set_run_font(r, size=9, color=LIGHT, bold=True, ascii_font="Arial")

    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run(meta["title"])
    set_run_font(r, size=30, bold=True, color=NAVY, ea=HEAD_EA)

    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(18)
    r = p.add_run(meta["subtitle"])
    set_run_font(r, size=17, bold=False, color=BLUE, ea=HEAD_EA)

    rule(doc, color="2E5496", sz=12, space=4)

    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(30)
    r = p.add_run("面向院系内部 · 校园内网私有化部署 · 资料权限与审核审批全程留痕")
    set_run_font(r, size=10, color=GRAY)

    meta_rows = [
        ("文档版本", meta["version"]),
        ("文档密级", "内部资料（请勿外传）"),
        ("编制依据", "《院系文档权限与审批 OA 系统 · 项目建设说明（周期预算补充版）》"),
        ("适用范围", "院系领导、业务负责人、系统管理员、开发测试与实施人员"),
        ("编制日期", meta["date"]),
    ]
    t = doc.add_table(rows=0, cols=2)
    t.autofit = False
    t.alignment = WD_TABLE_ALIGNMENT.LEFT
    for label, value in meta_rows:
        row = t.add_row()
        c0, c1 = row.cells
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_before = Pt(2)
        p0.paragraph_format.space_after = Pt(2)
        r0 = p0.add_run(label)
        set_run_font(r0, size=9, color=LIGHT)
        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_before = Pt(2)
        p1.paragraph_format.space_after = Pt(2)
        r1 = p1.add_run(value)
        set_run_font(r1, size=9.5, color=INK)
    set_no_borders(t)
    set_cell_margins(t, top=20, left=0, bottom=20, right=0)
    set_col_widths(t, [2.9, 13.5])

    for _ in range(3):
        sp = doc.add_paragraph()
        sp.paragraph_format.space_after = Pt(0)
        sp.paragraph_format.line_spacing = Pt(12)

    rule(doc, color="D5DCE7", sz=4, space=2)
    p = doc.add_paragraph()
    r = p.add_run("院系文档权限与审批 OA 项目组")
    set_run_font(r, size=9, color=GRAY)
    p = doc.add_paragraph()
    r = p.add_run("2026 年 11 月")
    set_run_font(r, size=9, color=GRAY)

    doc.add_page_break()


def build_control_page(doc, meta):
    front_title(doc, "文档控制", size=18)
    rule(doc, color="D5DCE7", sz=4, space=2)
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(6)
    add_rich_text(p, "本文档为院系文档权限与审批 OA 系统的产品需求说明书，用于明确首期建设范围、角色与权限、功能需求、用例、数据模型、接口与验收标准。文档经院系业务负责人与项目决策人确认后，作为设计、开发、测试与验收的共同依据。",
                  size=10)

    front_title(doc, "修订记录", size=12, space_before=10)
    add_table(doc,
              ["版本", "日期", "修订说明", "编制", "审核"],
              [["V1.0", meta["date"], "首次发布，覆盖首期全部 P0 需求、角色功能列表与用例说明书", "项目组", "待签署"]],
              widths=[1.6, 3.0, 7.6, 2.2, 2.2],
              font_size=9)

    front_title(doc, "分发范围", size=12, space_before=6)
    add_table(doc,
              ["分发对象", "份数", "形式", "用途"],
              [["院系领导及项目决策人", "1", "电子版", "范围、周期与验收决策"],
               ["院系业务负责人", "1", "电子版", "确认分类、权限与审批事项"],
               ["系统管理员", "1", "电子版", "配置与日常管理依据"],
               ["学校信息化部门", "1", "电子版", "认证对接、内网与安全合规确认"],
               ["承建方项目组", "1", "电子版", "设计、开发、测试与实施"]],
              widths=[4.6, 1.6, 2.2, 8.2],
              font_size=9)

    front_title(doc, "审批签署", size=12, space_before=6)
    add_table(doc,
              ["角色", "姓名", "签字", "日期"],
              [["院系负责人", "", "", ""],
               ["系统管理员", "", "", ""],
               ["项目负责人", "", "", ""],
               ["学校信息化部门", "", "", ""]],
              widths=[5.0, 4.0, 4.0, 3.6],
              font_size=9)

    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    add_rich_text(p, "编制说明：本文档中的功能编号、用例编号与验收项为唯一标识，后续变更须在修订记录中登记并保持编号稳定；涉及范围、周期与预算的调整，按第 12.5 节变更管理执行。", size=9, color=GRAY)
    doc.add_page_break()


def build_toc(doc, headings, pages=None):
    pages = pages or {}
    front_title(doc, "目　录", size=18)
    rule(doc, color="D5DCE7", sz=4, space=2)
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(10)
    add_rich_text(p, "条目可点击跳转；页码与页脚一致。二级标题见 PDF 书签与 Word 导航窗格。", size=8.5, color=LIGHT)

    for level, text, anchor in headings:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.2
        p.paragraph_format.left_indent = Cm(0)
        add_internal_link(p, anchor, text, size=11, bold=True, color=NAVY)
        page = pages.get(anchor)
        if page:
            p.paragraph_format.tab_stops.add_tab_stop(
                Cm(16.9), WD_TAB_ALIGNMENT.RIGHT, WD_TAB_LEADER.DOTS)
            run = p.add_run("\t")
            set_run_font(run, size=8.5, color=LIGHT)
            run2 = p.add_run(str(page))
            set_run_font(run2, size=9, color=GRAY)
    doc.add_page_break()


# --------------------------------------------------------------------------
# 组装
# --------------------------------------------------------------------------

def read_meta():
    text = open(os.path.join(BASE_DIR, PARTS[0]), encoding="utf-8").read()
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    meta = {"title": "院系文档权限与审批 OA 系统",
            "subtitle": "产品需求说明书（PRD）",
            "version": "V1.0",
            "date": "2026 年 11 月"}
    body = text
    if m:
        for line in m.group(1).splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip()] = v.strip()
        body = text[m.end():]
    return meta, body


def load_blocks():
    meta, first = read_meta()
    blocks = parse_markdown(first)
    for part in PARTS[1:]:
        with open(os.path.join(BASE_DIR, part), encoding="utf-8") as f:
            blocks.extend(parse_markdown(f.read()))
    return meta, blocks


def collect_headings(blocks, max_level=2):
    headings = []
    bid = 0
    for b in blocks:
        if b.kind == "heading" and b.payload[0] <= 2:
            bid += 1
            if b.payload[0] <= max_level:
                headings.append((b.payload[0], b.payload[1], "_Toc900%03d" % bid))
    return headings


def build(blocks, meta, out_path, limit=None, toc_pages=None):
    doc = Document()
    setup_styles(doc)
    sec = setup_page(doc)
    setup_header_footer(sec, meta)

    props = doc.core_properties
    props.title = meta["title"] + " " + meta["subtitle"]
    props.subject = "院系文档权限与审批 OA 系统产品需求说明书"
    props.author = "院系文档权限与审批 OA 项目组"
    props.keywords = "PRD, 文档权限, 审批, OA, 统一身份认证"
    props.comments = "依据项目建设说明与 TransWeb 技术架构编制"

    build_cover(doc, meta)
    build_control_page(doc, meta)
    headings = collect_headings(blocks, max_level=1)
    build_toc(doc, headings, toc_pages)

    bid = 0
    for idx, b in enumerate(blocks):
        if limit is not None and idx > limit:
            break
        if b.kind == "heading":
            level, text = b.payload
            if level <= 2:
                bid += 1
                add_heading(doc, level, text, bid)
            else:
                add_heading_no_bookmark(doc, level, text)
        elif b.kind == "para":
            text = b.payload.strip()
            if re.fullmatch(r"\*\*[^*]+\*\*", text):
                add_label(doc, text[2:-2])
            else:
                add_para(doc, b.payload)
        elif b.kind == "bullet":
            add_bullet(doc, b.payload)
        elif b.kind == "ordered":
            add_ordered(doc, b.payload)
        elif b.kind == "code":
            add_code_block(doc, b.payload)
        elif b.kind == "quote":
            add_callout(doc, b.payload)
        elif b.kind == "table":
            header, rows = b.payload
            cols = len(header)
            if (cols == 5 and header[0] == "编号" and header[1] == "功能"
                    and "需求描述" in header[4]):
                add_fr_cards(doc, rows)
            elif cols == 2 and header[0] == "项目" and header[1] == "内容":
                add_kv_table(doc, rows, widths=b.widths)
            elif cols == 3 and header == ["功能", "编号", "说明与边界"]:
                add_table(doc, header, rows, widths=[3.8, 5.2, 7.6], font_size=9)
            else:
                size = 9 if cols <= 5 else 8.5
                add_table(doc, header, rows, widths=b.widths, font_size=size)
        elif b.kind == "hr":
            rule(doc, color="D5DCE7", sz=4, space=2)

    doc.save(out_path)
    return out_path


def add_heading_no_bookmark(doc, level, text):
    p = doc.add_paragraph(style="Heading %d" % level)
    p.paragraph_format.line_spacing = 1.2
    run = p.add_run(text)
    set_run_font(run, size={3: 12, 4: 11}.get(level, 11), bold=True,
                 color=NAVY if level == 3 else RGBColor(0x33, 0x3D, 0x4B), ea=HEAD_EA)
    return p


def render_page_count(docx_path, work_dir, tag):
    out_dir = os.path.join(work_dir, "render_%s" % tag)
    cmd = [NODE, LO_CLI, "render", "--input", docx_path,
           "--output-dir", out_dir, "--pages", "1"]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    try:
        data = json.loads(proc.stdout.strip().splitlines()[-1])
        return int(data["pageCount"])
    except Exception as exc:
        raise RuntimeError("render failed for %s: %s %s" % (docx_path, proc.stdout, proc.stderr)) from exc


def compute_page_map(blocks, meta, work_dir, workers=4):
    headings = collect_headings(blocks, max_level=1)
    positions = []
    bid = 0
    for idx, b in enumerate(blocks):
        if b.kind == "heading" and b.payload[0] <= 2:
            bid += 1
            if b.payload[0] == 1:
                positions.append((idx, "_Toc900%03d" % bid))

    def task(item):
        idx, anchor = item
        path = os.path.join(work_dir, "prefix_%s.docx" % anchor[-3:])
        build(blocks, meta, path, limit=idx)
        count = render_page_count(path, work_dir, anchor[-3:])
        return anchor, count

    pages = {}
    with ThreadPoolExecutor(max_workers=workers) as pool:
        for anchor, count in pool.map(task, positions):
            pages[anchor] = count
            print("  page %-3d %s" % (count, anchor), flush=True)
    return pages


def export_pdf(docx_path, pdf_path):
    if os.path.exists(pdf_path):
        os.remove(pdf_path)
    proc = subprocess.run([NODE, LO_CLI, "convert", "--input", docx_path,
                           "--output", pdf_path], capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr or proc.stdout)
    print(proc.stdout.strip())


def main():
    meta, blocks = load_blocks()
    out = os.path.join(BASE_DIR, OUT_NAME)
    pages = {}
    pages_file = os.path.join(BASE_DIR, "_pages.json")
    if "--reuse-pages" in sys.argv and os.path.exists(pages_file):
        with open(pages_file, encoding="utf-8") as f:
            pages = json.load(f)
        print("reuse pages:", len(pages))
    elif "--no-pages" not in sys.argv:
        work_dir = tempfile.mkdtemp(prefix=".prd_pages_", dir=BASE_DIR)
        print("measuring heading pages ...", flush=True)
        pages = compute_page_map(blocks, meta, work_dir, workers=1)
        with open(pages_file, "w", encoding="utf-8") as f:
            json.dump(pages, f)
        shutil.rmtree(work_dir, ignore_errors=True)
    build(blocks, meta, out, toc_pages=pages)
    print("built:", out)
    print("headings:", sum(1 for b in blocks if b.kind == "heading" and b.payload[0] <= 2))
    print("tables:", sum(1 for b in blocks if b.kind == "table"))
    print("blocks:", len(blocks))
    if "--pdf" in sys.argv:
        export_pdf(out, os.path.join(BASE_DIR, PDF_NAME))


if __name__ == "__main__":
    main()
