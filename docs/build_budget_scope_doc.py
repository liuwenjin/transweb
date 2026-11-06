# -*- coding: utf-8 -*-
"""生成《8 万元预算覆盖范围说明》DOCX。"""
from docx import Document
from docx.shared import Cm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT, WD_LINE_SPACING
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ROW_HEIGHT_RULE, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.section import WD_SECTION
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

# ---------- 基础常量 ----------
INK = RGBColor(0x0B, 0x1F, 0x3A)
NAVY = RGBColor(0x12, 0x35, 0x6B)
BLUE = RGBColor(0x1D, 0x4E, 0xD8)
RED = RGBColor(0xB2, 0x3A, 0x2E)
MUTED = RGBColor(0x5B, 0x66, 0x75)
TEXT = RGBColor(0x1B, 0x24, 0x30)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
LIGHT = RGBColor(0xDC, 0xE6, 0xF5)
HALO = RGBColor(0x9F, 0xB8, 0xE8)
CONTENT_W = 16.6  # cm

HEADER_FILL = "12356B"
ZEBRA_FILL = "F5F7FA"
BORDER = "D9DEE7"
CALLOUT_FILL = "FBECEB"
CALLOUT_BORDER = "EFC9C4"

STATUS_COLORS = {
    "是": RGBColor(0x1E, 0x7B, 0x4F),
    "部分": RGBColor(0xB4, 0x53, 0x09),
    "否": RED,
}


def set_run_font(run, name="宋体", size=10.5, bold=False, color=TEXT, italic=False):
    run.font.name = name
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = color
    rPr = run._element.get_or_add_rPr()
    rFonts = rPr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = OxmlElement("w:rFonts")
        rPr.append(rFonts)
    rFonts.set(qn("w:ascii"), name)
    rFonts.set(qn("w:hAnsi"), name)
    rFonts.set(qn("w:eastAsia"), name)


def style_setup(doc):
    sec = doc.sections[0]
    sec.page_width = Cm(21.0)
    sec.page_height = Cm(29.7)
    sec.top_margin = Cm(2.15)
    sec.bottom_margin = Cm(1.95)
    sec.left_margin = Cm(2.2)
    sec.right_margin = Cm(2.2)
    sec.header_distance = Cm(0.9)
    sec.footer_distance = Cm(0.85)
    sec.different_first_page_header_footer = True

    normal = doc.styles["Normal"]
    normal.font.name = "宋体"
    normal.font.size = Pt(10.5)
    normal.font.color.rgb = TEXT
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "宋体")
    pf = normal.paragraph_format
    pf.line_spacing = 1.55
    pf.space_before = Pt(0)
    pf.space_after = Pt(4)
    pf.widow_control = True

    for name, size, color, before, after in [
        ("Heading 1", 16, INK, 10, 6),
        ("Heading 2", 12.5, NAVY, 12, 4),
        ("Heading 3", 11, BLUE, 8, 3),
    ]:
        st = doc.styles[name]
        st.font.name = "微软雅黑"
        st.font.size = Pt(size)
        st.font.bold = True
        st.font.color.rgb = color
        st._element.rPr.rFonts.set(qn("w:eastAsia"), "微软雅黑")
        st.paragraph_format.space_before = Pt(before)
        st.paragraph_format.space_after = Pt(after)
        st.paragraph_format.keep_with_next = True
        st.paragraph_format.line_spacing = 1.25


def add_header_footer(doc):
    sec = doc.sections[0]
    header = sec.header
    hp = header.paragraphs[0]
    hp.paragraph_format.tab_stops.add_tab_stop(Cm(CONTENT_W), WD_TAB_ALIGNMENT.RIGHT)
    r = hp.add_run("中国电子教育学会公文与审批 OA 项目")
    set_run_font(r, "微软雅黑", 8.5, False, MUTED)
    r = hp.add_run("\t8 万元预算覆盖范围说明")
    set_run_font(r, "微软雅黑", 8.5, False, MUTED)
    pPr = hp._p.get_or_add_pPr()
    pBdr = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), "4")
    bottom.set(qn("w:space"), "4")
    bottom.set(qn("w:color"), "D9DEE7")
    pBdr.append(bottom)
    pPr.append(pBdr)

    footer = sec.footer
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = fp.add_run("第 ")
    set_run_font(r, "宋体", 8.5, False, MUTED)
    add_field(fp, "PAGE")
    r = fp.add_run(" 页 / 共 ")
    set_run_font(r, "宋体", 8.5, False, MUTED)
    add_field(fp, "NUMPAGES")
    r = fp.add_run(" 页")
    set_run_font(r, "宋体", 8.5, False, MUTED)

    fp2 = footer.add_paragraph()
    fp2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = fp2.add_run("内部资料 · 仅供预算决策使用")
    set_run_font(r, "宋体", 7.5, False, RGBColor(0x8A, 0x94, 0xA6))


def add_field(paragraph, instr):
    run = paragraph.add_run()
    fld1 = OxmlElement("w:fldChar")
    fld1.set(qn("w:fldCharType"), "begin")
    it = OxmlElement("w:instrText")
    it.set(qn("xml:space"), "preserve")
    it.text = instr
    fld2 = OxmlElement("w:fldChar")
    fld2.set(qn("w:fldCharType"), "separate")
    t = OxmlElement("w:t")
    t.text = "1"
    fld3 = OxmlElement("w:fldChar")
    fld3.set(qn("w:fldCharType"), "end")
    run._r.append(fld1)
    run._r.append(it)
    run._r.append(fld2)
    run._r.append(t)
    run._r.append(fld3)


def shade(cell, fill):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), fill)
    tcPr.append(shd)


def cell_margins(cell, top=90, bottom=90, left=110, right=110):
    tcPr = cell._tc.get_or_add_tcPr()
    mar = OxmlElement("w:tcMar")
    for side, val in (("top", top), ("bottom", bottom), ("left", left), ("right", right)):
        el = OxmlElement("w:" + side)
        el.set(qn("w:w"), str(val))
        el.set(qn("w:type"), "dxa")
        mar.append(el)
    tcPr.append(mar)


def table_borders(table, color=BORDER, sz=4):
    tblPr = table._tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = OxmlElement("w:" + edge)
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), str(sz))
        el.set(qn("w:space"), "0")
        el.set(qn("w:color"), color)
        borders.append(el)
    tblPr.append(borders)


def cell_border(cell, edge, color, sz=18):
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = tcPr.find(qn("w:tcBorders"))
    if tcBorders is None:
        tcBorders = OxmlElement("w:tcBorders")
        tcPr.append(tcBorders)
    el = OxmlElement("w:" + edge)
    el.set(qn("w:val"), "single")
    el.set(qn("w:sz"), str(sz))
    el.set(qn("w:space"), "0")
    el.set(qn("w:color"), color)
    tcBorders.append(el)


def set_cell_width(cell, cm):
    cell.width = Cm(cm)
    tcPr = cell._tc.get_or_add_tcPr()
    tcW = tcPr.find(qn("w:tcW"))
    if tcW is None:
        tcW = OxmlElement("w:tcW")
        tcPr.append(tcW)
    tcW.set(qn("w:w"), str(int(cm * 567)))
    tcW.set(qn("w:type"), "dxa")


def table_row_no_split(row):
    trPr = row._tr.get_or_add_trPr()
    el = OxmlElement("w:cantSplit")
    trPr.append(el)


def repeat_header(row):
    trPr = row._tr.get_or_add_trPr()
    el = OxmlElement("w:tblHeader")
    el.set(qn("w:val"), "true")
    trPr.append(el)


def add_caption(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    set_run_font(r, "微软雅黑", 8.5, True, RGBColor(0x6B, 0x77, 0x8A))


def add_note(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.left_indent = Cm(0.1)
    pPr = p._p.get_or_add_pPr()
    pBdr = OxmlElement("w:pBdr")
    left = OxmlElement("w:left")
    left.set(qn("w:val"), "single")
    left.set(qn("w:sz"), "10")
    left.set(qn("w:space"), "6")
    left.set(qn("w:color"), "D9DEE7")
    pBdr.append(left)
    pPr.append(pBdr)
    r = p.add_run(text)
    set_run_font(r, "宋体", 8.5, False, MUTED)


def add_table(doc, headers, rows, widths, font_size=9, first_col_bold=True,
              status_col=None, header_fill=HEADER_FILL, zebra=True):
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table_borders(table)
    hdr = table.rows[0]
    table_row_no_split(hdr)
    repeat_header(hdr)
    for i, h in enumerate(headers):
        cell = hdr.cells[i]
        set_cell_width(cell, widths[i])
        shade(cell, header_fill)
        cell_margins(cell, 80, 80, 100, 100)
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        p = cell.paragraphs[0]
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(0)
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        r = p.add_run(h)
        set_run_font(r, "微软雅黑", font_size, True, WHITE)

    for ri, row_data in enumerate(rows):
        row = table.add_row()
        table_row_no_split(row)
        for ci, val in enumerate(row_data):
            cell = row.cells[ci]
            set_cell_width(cell, widths[ci])
            cell_margins(cell, 85, 85, 100, 100)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP
            if zebra and ri % 2 == 1:
                shade(cell, ZEBRA_FILL)
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.25
            p.paragraph_format.space_after = Pt(0)
            color = TEXT
            bold = False
            if ci == 0 and first_col_bold:
                bold = True
                color = INK
            if status_col is not None and ci == status_col:
                color = STATUS_COLORS.get(val.strip(), TEXT)
                bold = True
            r = p.add_run(str(val))
            set_run_font(r, "宋体", font_size, bold, color)
    return table


def callout(doc, title, body, fill=CALLOUT_FILL, border=CALLOUT_BORDER, title_color=RED):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    cell = table.cell(0, 0)
    set_cell_width(cell, CONTENT_W)
    shade(cell, fill)
    cell_border(cell, "left", border, 28)
    cell_border(cell, "top", border, 6)
    cell_border(cell, "bottom", border, 6)
    cell_border(cell, "right", border, 6)
    cell_margins(cell, 140, 140, 180, 160)
    p = cell.paragraphs[0]
    p.paragraph_format.line_spacing = 1.45
    p.paragraph_format.space_after = Pt(0)
    r = p.add_run(title)
    set_run_font(r, "微软雅黑", 10, True, title_color)
    r = p.add_run(body)
    set_run_font(r, "宋体", 9.5, False, TEXT)


def body(doc, text, size=10.5, color=TEXT, bold=False, before=0, after=4, align=WD_ALIGN_PARAGRAPH.JUSTIFY, indent=None):
    p = doc.add_paragraph()
    p.alignment = align
    p.paragraph_format.space_before = Pt(before)
    p.paragraph_format.space_after = Pt(after)
    p.paragraph_format.line_spacing = 1.55
    if indent is not None:
        p.paragraph_format.first_line_indent = Cm(indent)
    r = p.add_run(text)
    set_run_font(r, "宋体", size, bold, color)
    return p


def bullet(doc, text, bold_prefix=None):
    p = doc.add_paragraph(style="List Bullet")
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.45
    p.paragraph_format.left_indent = Cm(0.45)
    if bold_prefix:
        r = p.add_run(bold_prefix)
        set_run_font(r, "宋体", 10, True, INK)
    r = p.add_run(text)
    set_run_font(r, "宋体", 10, False, TEXT)


def h1(doc, text):
    p = doc.add_paragraph(style="Heading 1")
    r = p.add_run(text)
    set_run_font(r, "微软雅黑", 16, True, INK)


def h2(doc, text):
    p = doc.add_paragraph(style="Heading 2")
    r = p.add_run(text)
    set_run_font(r, "微软雅黑", 12.5, True, NAVY)


def cover(doc):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(3)
    r = p.add_run("中国电子教育学会")
    set_run_font(r, "微软雅黑", 11, True, BLUE)
    r = p.add_run("  ·  公文与审批 OA 项目")
    set_run_font(r, "微软雅黑", 11, False, MUTED)

    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(18)
    pPr = p._p.get_or_add_pPr()
    pBdr = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), "18")
    bottom.set(qn("w:space"), "1")
    bottom.set(qn("w:color"), "B23A2E")
    pBdr.append(bottom)
    pPr.append(pBdr)

    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    cell = table.cell(0, 0)
    set_cell_width(cell, CONTENT_W)
    shade(cell, "0B1F3A")
    cell_margins(cell, 520, 520, 480, 480)
    row = table.rows[0]
    row.height = Cm(10.2)
    row.height_rule = WD_ROW_HEIGHT_RULE.EXACTLY
    table_row_no_split(row)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER

    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(10)
    r = p.add_run("BUDGET SCOPE  ·  2026")
    set_run_font(r, "微软雅黑", 9, True, HALO)
    r.font.letter_spacing = Pt(2) if hasattr(r.font, "letter_spacing") else None

    p = cell.add_paragraph()
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run("8 万元预算")
    set_run_font(r, "微软雅黑", 30, True, WHITE)

    p = cell.add_paragraph()
    p.paragraph_format.space_after = Pt(14)
    r = p.add_run("覆盖范围与边界说明")
    set_run_font(r, "微软雅黑", 20, False, LIGHT)

    p = cell.add_paragraph()
    p.paragraph_format.space_after = Pt(8)
    pPr = p._p.get_or_add_pPr()
    pBdr = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), "10")
    bottom.set(qn("w:space"), "1")
    bottom.set(qn("w:color"), "9FB8E8")
    pBdr.append(bottom)
    pPr.append(pBdr)

    p = cell.add_paragraph()
    p.paragraph_format.space_after = Pt(0)
    r = p.add_run("本说明回答一个具体问题：8 万元能建设到什么程度？")
    set_run_font(r, "宋体", 11, False, RGBColor(0xC6, 0xD4, 0xEA))

    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run("中国电子教育学会公文与审批 OA 项目")
    set_run_font(r, "微软雅黑", 14, True, INK)

    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(16)
    r = p.add_run("预算决策 · 采购范围界定 · 供应商报价对比")
    set_run_font(r, "宋体", 10, False, MUTED)

    meta = [
        ("适用项目", "中国电子教育学会公文与审批 OA 系统"),
        ("文档版本", "V1.0"),
        ("编制日期", "2026 年 11 月 6 日"),
        ("评估基准", "10 万可授权用户、私有化部署、含一年质保、人民币含税"),
        ("使用说明", "内部资料，仅供预算决策与采购范围界定使用"),
    ]
    mt = doc.add_table(rows=0, cols=2)
    mt.alignment = WD_TABLE_ALIGNMENT.CENTER
    mt.autofit = False
    for label, value in meta:
        row = mt.add_row()
        table_row_no_split(row)
        c0, c1 = row.cells
        set_cell_width(c0, 3.2)
        set_cell_width(c1, 13.4)
        cell_margins(c0, 60, 60, 0, 80)
        cell_margins(c1, 60, 60, 0, 0)
        p = c0.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(label)
        set_run_font(r, "微软雅黑", 9, True, MUTED)
        p = c1.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(value)
        set_run_font(r, "宋体", 9.5, False, TEXT)

    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(18)
    r = p.add_run("内部资料  ·  请勿外传")
    set_run_font(r, "微软雅黑", 8, True, RGBColor(0xB2, 0x3A, 0x2E))

    doc.add_page_break()


def summary_cards(doc):
    data = [
        ("8 万元", "轻量标准化版本（服务器授权）", "10 万账号 · 公文/审批/文档"),
        ("30–50 万元", "RFQ 全范围合理区间", "含签章、OFD、移动端与交换"),
        ("3–4 个月", "全范围合理周期", "60 天属于高压缩目标"),
    ]
    table = doc.add_table(rows=1, cols=3)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table_borders(table, "FFFFFF", 2)
    for i, (big, title, sub) in enumerate(data):
        cell = table.cell(0, i)
        set_cell_width(cell, CONTENT_W / 3)
        shade(cell, "F5F7FA")
        cell_border(cell, "top", "1D4ED8", 22)
        cell_margins(cell, 180, 170, 150, 130)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(big)
        set_run_font(r, "微软雅黑", 17, True, INK)
        p = cell.add_paragraph()
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(title)
        set_run_font(r, "微软雅黑", 9.5, True, BLUE)
        p = cell.add_paragraph()
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(sub)
        set_run_font(r, "宋体", 8.5, False, MUTED)


def build():
    doc = Document()
    style_setup(doc)
    doc.core_properties.title = "中国电子教育学会公文与审批 OA 项目：8 万元预算覆盖范围说明"
    doc.core_properties.author = "项目组"
    doc.core_properties.subject = "8 万元预算覆盖范围与边界"
    add_header_footer(doc)
    cover(doc)

    h1(doc, "一、结论摘要")
    body(doc, "当前《项目建设说明》按 8 万元、2 个月、10 万可授权用户编制。为避免把“预算上限”误解为“全范围交付”，本说明把 8 万元能够覆盖的内容、不能覆盖的内容以及必须写入合同的边界逐项列出，作为预算决策、采购范围界定和供应商报价对比的依据。")
    body(doc, "8 万元可以交付一套标准化、轻量化的文档与审批 OA 最小可用版本；但不能覆盖 RFQ 要求的完整公文、电子签章、OFD、移动端和深度集成。若按 RFQ 全范围建设，合理预算为 30–50 万元，周期 3–4 个月。", bold=True, color=INK)
    summary_cards(doc)
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(6)
    callout(doc, "一句话结论：", "8 万元在“服务器授权/不限账号”前提下可以启动，但不能完成 RFQ 全范围；若按账号计费，10 万账号的许可费通常已超过 8 万元。")

    h1(doc, "二、评估前提")
    body(doc, "本说明的估算基于以下条件。条件发生变化时，价格和周期都需要重新核算。")
    assumptions = [
        ("用户规模：", "10 万个可授权账号（注册上限），50 并发基线；10 万为容量上限，超出按扩容包付费升级。"),
        ("部署方式：", "学会本地服务器或私有云虚拟机，数据不出本地，含基础安装与备份配置。"),
        ("交付方式：", "以成熟 OA 产品为基础做配置和少量定制，不是从零开发。"),
        ("价格口径：", "人民币含税，含一年远程质保；不含驻场、等保测评和第三方证书年费。"),
        ("人月单价：", "按西安及二线城市 1.2–1.8 万元/人月估算；一线城市约 2–3 万元/人月。"),
        ("估算性质：", "市场合理区间，不是供应商正式报价；实际价格受产品化程度、接口复杂度、付款条件影响。"),
    ]
    for label, text in assumptions:
        bullet(doc, text, label)
    callout(doc, "关键变化：", "可授权用户数调整为 10 万后，账号许可模式成为 8 万元能否成立的关键：服务器授权/不限账号产品可把许可压在 4–6 万元；按账号计费时，10 万账号的许可费通常为 15–40 万元，8 万元不成立。")

    doc.add_page_break()
    h1(doc, "三、8 万元可以覆盖的内容")
    body(doc, "在“成熟产品 + 基础配置 + 轻量实施”的前提下，8 万元可以覆盖以下内容，形成一套可用的最小版本。")
    add_caption(doc, "表 1  8 万元可覆盖范围")
    rows = [
        ("用户与部署", "10 万个可授权账号；本地服务器/私有云部署；基础安装、初始化、备份配置", "10 万为账号上限，不等于 10 万并发；50 并发基线需确认；扩容另付费升级"),
        ("组织与权限", "组织/部门/岗位/角色；按角色和部门配置菜单、数据范围", "以产品既有权限模型为准；不做四级动态权限定制"),
        ("文档管理", "分类、上传、下载、检索、版本、归档、基础借阅", "不含 OFD 版式、全文检索定制、复杂档案销毁流程"),
        ("审批管理", "2–3 个标准模板（如用印、报销、会议）；待办/已办、同意/退回/驳回、简单转办", "固定流程配置；不做拖拽式流程设计器和复杂条件分支"),
        ("公文管理", "基础收文登记、承办、归档；基础发文起草、审批、归档", "不含完整分办/拟办/批办/催办、文号套红、公文交换"),
        ("统一门户", "工作台、待办聚合、通知公告", "标准门户页面，不做个性化门户定制"),
        ("账号与认证", "标准 LDAP/CAS/统一认证对接；或系统内置账号体系", "标准协议可接；自定义接口、多系统单点登录另计"),
        ("日志审计", "登录、文档操作、审批处理日志；基础导出", "不做等保级审计、防篡改、异地日志留存"),
        ("移动端", "响应式 H5 页面查看与审批（若产品支持）", "不含原生 APP、钉钉/企业微信深度集成、原笔迹签批"),
        ("实施与培训", "系统初始化、1–2 场培训、管理员/用户手册", "以远程培训为主；不驻场"),
        ("质保与迁移", "1 年远程质保，工作日 8×5 响应；Excel 导入基础数据", "不含 4 小时响应、24 小时到场；不做历史数据清洗"),
    ]
    add_table(doc, ["类别", "可覆盖内容", "边界与前提"], rows, [3.0, 8.3, 5.3])
    add_note(doc, "注：以上以产品自带标准功能为前提。若需要改代码、接外部系统或新增复杂流程，均会突破 8 万元范围。")
    callout(doc, "判断标准：", "如果需求全部落在上表范围内，8 万元可以成立；只要出现完整公文、电子签章、移动端、外部集成中的任意一项，就应增加预算或降低验收范围。")

    doc.add_page_break()
    h1(doc, "四、8 万元不能覆盖的内容")
    body(doc, "以下内容属于 RFQ 的完整范围或深度定制，8 万元无法覆盖；如需要，应在预算中单列。")
    add_caption(doc, "表 2  8 万元不能覆盖的内容及增量成本")
    rows = [
        ("完整公文管理", "收文分办、拟办、批办、承办、催办；发文会签、签发、编号、套红、分发；公文交换；文号查重与回收", "8–15"),
        ("电子签章", "CA 证书、电子印章、PDF/OFD 签章与验签", "2–5 + 年费"),
        ("OFD 版式", "OFD 转换、版式还原、签章验证", "1–3"),
        ("手写原笔迹", "移动端原笔迹、痕迹防篡改", "1–3"),
        ("移动端 APP/集成", "Android/iOS APP，或钉钉/企业微信/微信深度集成", "2–4"),
        ("可视化流程引擎", "拖拽式设计、自定义表单、条件分支、并行/会签、6 类以上模板", "5–9"),
        ("四级权限", "组织、角色、岗位、数据维度四级模型；跨分会动态授权", "2–4"),
        ("外部系统集成", "会员系统、财务、短信/邮件、上级学会公文交换接口", "2–6"),
        ("等保与安全", "等保 2.0 测评、整改、渗透测试、异地备份", "2–8"),
        ("强运维 SLA", "4 小时响应、24 小时到场、专人驻场", "3–5/年"),
        ("源码与无限定制", "源码交付、后续功能无限改造、长期升级", "另计"),
        ("10 万账号容量/50 并发", "10 万账号容量、50 并发压测、性能调优、扩容包", "5–15 起"),
    ]
    add_table(doc, ["不能覆盖项", "具体内容", "增量成本（万元）"], rows, [3.5, 9.1, 4.0])
    add_note(doc, "注：增量成本为市场参考区间，不是供应商报价；同一功能在不同产品上的定制成本差异可能很大。")
    body(doc, "成本结构判断：完整公文、流程引擎、电子签章/OFD、移动端四项，通常占全范围预算的 60%–75%。8 万元若覆盖其中两项，就会挤占实施、培训与质保。", before=8)

    doc.add_page_break()
    h1(doc, "五、边界事项：需要写进合同的“有条件覆盖”")
    body(doc, "以下事项不是简单的“能”或“不能”，而是取决于产品能力和合同约定。建议在合同附件中逐条写清。")
    add_caption(doc, "表 3  有条件覆盖事项与合同写法")
    rows = [
        ("基础收文/发文", "有条件", "以产品标准公文模块为限：包含登记、承办、归档；不含分办/拟办/批办/催办、会签/签发/套红/交换"),
        ("2–3 个审批模板", "可以", "用印、报销、会议三选二或三，固定流程；新增模板按 __ 元/个计费"),
        ("移动审批", "部分", "仅 H5 查看与审批；APP、钉钉/企微集成不含"),
        ("统一认证", "标准可以", "LDAP/CAS 标准协议；自定义接口、多系统 SSO 另计"),
        ("基础报表", "可以", "标准列表与导出；自定义驾驶舱、多维分析不含"),
        ("一年质保", "远程可以", "8×5 远程支持；4 小时响应、24 小时到场不含"),
        ("10 万可授权用户", "可写入口径", "10 万个可授权账号，50 并发基线；超出按 __ 万元/万账号扩容包付费升级"),
    ]
    add_table(doc, ["事项", "8 万元能否覆盖", "建议合同写法"], rows, [3.2, 3.0, 10.4])
    add_note(doc, "建议：把上表第三列直接作为合同附件条款，避免“有条件”在验收时被解释为“默认包含”。")
    callout(doc, "合同示例：", "“本期包含用印、报销、会议三个标准审批模板；新增模板按 3,000 元/个计费；电子签章、OFD、移动 APP 不在本期范围，后续按补充协议执行。”")

    doc.add_page_break()
    h1(doc, "六、8 万元的成本构成")
    body(doc, "8 万元并不是“软件本身的标价”，而是产品授权、实施、培训、质保和税费的组合。按轻量标准化交付测算，其大致构成如下。")
    add_caption(doc, "表 4  8 万元项目的成本构成")
    rows = [
        ("软件授权/产品许可", "4–6", "仅当产品按服务器/不限账号授权；按账号计费时 10 万账号通常 15–40 万元，8 万元不成立"),
        ("实施配置与基础培训", "2–3", "安装、初始化、2–3 个模板配置、1–2 场培训"),
        ("一年远程质保", "1–1.5", "8×5 远程支持、缺陷修复、基础巡检"),
        ("税费、管理与合理利润", "0.5–1", "含税、项目管理、差旅与合理利润"),
        ("合计", "7.5–11.5", "8 万元处于该区间低端，定制余量很小"),
    ]
    add_table(doc, ["成本项", "金额（万元）", "说明"], rows, [5.6, 4.0, 7.0])
    add_note(doc, "注：许可费区间取决于授权模式。按账号计费时，10 万账号的许可费通常为 15–40 万元，已超过 8 万元总预算；本表仅适用于服务器授权/不限账号产品。")
    body(doc, "如果从零开发，8 万元约等于 5–6 个人月（按 1.4 万元/人月计算），仅够完成一个很小的定制模块，无法同时完成公文、流程、权限、审计、部署和培训。", before=6)
    body(doc, "成本解读：", bold=True, before=8, after=2)
    bullet(doc, "10 万可授权账号是否按账号计费，是成本主因；服务器授权/不限账号产品可把许可压到 4–6 万元；按账号计费通常 15–40 万元，真正拉开差距的还有公文定制、流程、签章、移动端和集成。", "授权模式： ")
    bullet(doc, "8 万元能否成立，关键不在“功能清单有多长”，而在“有多少功能可以使用产品标准能力”。", "标准能力： ")
    bullet(doc, "若报价显著低于 7 万元，应重点核查是否含实施、培训、一年质保、税费和正版组件，避免后期追加。", "低价核查： ")

    doc.add_page_break()
    h1(doc, "七、与 RFQ 必选项的对照")
    body(doc, "下表把 RFQ 的功能项与 8 万元能力逐项对照。“部分”表示只能用标准功能近似，不能按 RFQ 的完整要求验收。")
    add_caption(doc, "表 5  RFQ 功能项与 8 万元覆盖情况")
    rows = [
        ("1", "收文管理", "部分", "仅基础登记、承办、归档；不含分办、拟办、批办、催办全流程"),
        ("2", "发文管理", "部分", "仅起草、审批、归档；不含会签、签发、编号、套红、分发"),
        ("3", "公文交换", "否", "需与上级学会/主管单位接口开发"),
        ("4", "文号与文种", "部分", "标准文号可用；查重、回收需定制"),
        ("5", "电子签章", "否", "需 CA、电子印章、签章组件与证书年费"),
        ("6", "手写原笔迹", "否", "需移动端原笔迹与防篡改能力"),
        ("7", "公文检索与档案", "部分", "基础检索与归档；借阅、销毁需配置或定制"),
        ("8", "可视化流程引擎", "否", "仅固定模板；无拖拽设计器、条件分支、并行会签"),
        ("9", "常规审批", "部分", "仅 2–3 个标准模板"),
        ("10", "审批动作", "部分", "加签、转办、退回可用；会签、督办可能受限"),
        ("11", "移动审批", "部分", "H5 可用；原生 APP、钉钉/企微集成不含"),
        ("12", "审批留痕", "是", "基础操作日志与审批记录"),
        ("13", "统一工作门户", "是", "标准工作台、待办、通知"),
        ("14", "消息提醒", "部分", "站内信/邮件可用；短信/微信需另计"),
        ("15", "会议管理", "部分", "可用通用审批模板，不是完整会议模块"),
        ("16", "资产管理", "否", "RFQ 可选；需额外模块"),
        ("17", "督察督办", "否", "RFQ 可选；需额外模块"),
        ("18", "知识文档管理", "是", "基础分类、上传、检索、版本、归档"),
        ("19", "组织与权限", "部分", "角色/部门可用；四级数据权限需定制"),
        ("20", "日志与审计", "部分", "基础日志；等保级审计需增强"),
        ("21", "会员/分会管理", "否", "RFQ 可选；需定制或对接"),
    ]
    add_table(doc, ["序号", "RFQ 功能项", "覆盖情况", "说明"], rows, [1.1, 3.3, 2.0, 10.2], font_size=8.6, status_col=2)

    h1(doc, "八、风险与建议")
    body(doc, "8 万元不是不能做项目，而是必须把范围收窄、把边界写清。以下风险在低价项目中最常见。")
    add_caption(doc, "表 6  主要风险与应对")
    rows = [
        ("低价中标后追加", "以 8 万元承诺全范围，签约后通过“新增模板、接口、签章、移动端”追加费用", "合同附范围清单与变更单价，逐项列明不含项"),
        ("签章/OFD 缺失", "交付时才发现电子签章、OFD 版式未包含，无法满足公文合规", "把签章、OFD、证书年费单独列入报价或明确排除"),
        ("移动端/集成缩水", "承诺 APP/钉钉集成，实际只交付 H5 或网页", "写明移动端形态、集成范围与验收方式"),
        ("工期延期", "60 天承诺全范围，开发、联调、试点时间不足", "按 3–4 个月排期，或明确 60 天仅适用于标准产品"),
        ("安全/等保缺口", "未含等保测评、整改、渗透测试，上线前被要求补做", "单列等保与安全服务，或明确由甲方负责"),
        ("运维无保障", "8 万元含一年质保，但无响应时效、无驻场、无升级", "明确 8×5 远程、响应时限、升级与超期费用"),
    ]
    add_table(doc, ["风险", "典型表现", "建议"], rows, [3.5, 7.4, 5.7])

    p = body(doc, "结合预算与建设目标，建议按以下三种方案选择：", before=8)
    p.paragraph_format.keep_with_next = True
    add_caption(doc, "表 7  三种预算方案对比")
    rows = [
        ("轻量试点（服务器授权）", "8–20 万元", "10 万账号上限 + 基础文档权限 + 2–3 个审批模板 + 基础公文登记/归档", "2–3 个月", "先上线、验证流程"),
        ("当前说明范围", "18–28 万元", "公文收发 + 审批 + 文档 + 权限 + 审计（不含签章/移动端）", "2.5–3 个月", "推荐，范围与预算匹配"),
        ("RFQ 全范围", "30–50 万元", "增加电子签章、OFD、移动端、公文交换、等保与强 SLA", "3–4 个月", "完整合规交付"),
    ]
    add_table(doc, ["方案", "预算", "范围", "周期", "适用"], rows, [3.5, 2.7, 6.5, 2.0, 1.9], font_size=8.8)

    body(doc, "具体建议：", before=8, bold=True)
    for label, text in [
        ("先定范围，再定价格：", "把“必须有、可以后做、不做”分成三档，8 万元只承诺第一档。"),
        ("要求 POC：", "让供应商用真实公文走一遍收文、发文、用印、归档，确认产品不是演示壳。"),
        ("写清 10 万授权：", "区分可授权账号、并发用户与活跃用户；写明 10 万上限及扩容包单价。"),
        ("单列签章与移动端：", "即使本期不做，也要在合同中锁定后续单价，避免二期被动。"),
        ("保留变更单价：", "新增模板、接口、报表、签章集成按单价结算，不接受“到时再谈”。"),
    ]:
        bullet(doc, text, label)

    h1(doc, "九、合同边界建议")
    body(doc, "如果决定按 8 万元签约，建议把以下内容直接写入合同附件，而不是只写在方案里。")
    clauses = [
        "范围清单：逐项列明“包含/不包含”，与本说明表 1、表 2 一致；不含项不得被解释为默认包含。",
        "用户口径：10 万个可授权账号（注册上限），50 并发基线；超出 10 万按 __ 万元/万账号扩容包付费升级。",
        "变更计价：新增审批模板 __ 元/个，新增接口 __ 元/个，新增报表 __ 元/张，签章/移动端按后续报价。",
        "验收标准：完成 2–3 个审批模板走通、基础收文/发文归档、权限与日志可查，即为本期验收通过。",
        "质保与 SLA：一年远程 8×5，响应 __ 小时；现场支持、4 小时响应、24 小时到场另行报价。",
        "数据与知识产权：数据归学会所有；交付后提供导出能力；源码/二次开发权利如需要，单独约定。",
    ]
    for i, text in enumerate(clauses, 1):
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Cm(0.65)
        p.paragraph_format.first_line_indent = Cm(-0.65)
        p.paragraph_format.line_spacing = 1.45
        p.paragraph_format.space_after = Pt(5)
        r = p.add_run(f"{i:02d}  ")
        set_run_font(r, "微软雅黑", 10, True, BLUE)
        r = p.add_run(text)
        set_run_font(r, "宋体", 9.8, False, TEXT)

    callout(doc, "提醒：", "8 万元合同最怕“范围看起来都包含”。把不含项、变更单价和验收标准写清楚，比压低报价更能控制项目风险。")



    out = "docs/中国电子教育学会OA项目_8万元预算覆盖范围说明_V1.0.docx"
    doc.save(out)
    print("saved", out)


if __name__ == "__main__":
    build()
