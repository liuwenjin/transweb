# 院系文档权限与审批 OA 系统 · 产品需求说明书（PRD）

本目录为基于《院系文档权限与审批 OA 系统 · 项目建设说明（周期预算补充版）》与 TransWeb 现有技术架构编写的详细 PRD。

## 交付文件

| 文件 | 说明 |
| --- | --- |
| `院系文档权限与审批OA系统_产品需求说明书_V1.0.docx` | 正式交付版（Word，含封面、文档控制、目录页码、页眉页脚） |
| `院系文档权限与审批OA系统_产品需求说明书_V1.0.pdf` | 便于分发与打印的 PDF |
| `院系文档权限与审批OA系统_产品需求说明书_V1.0.md` | 合并版 Markdown，便于检索、评审与版本对比 |
| `01` ~ `12` 分章 Markdown | 分章源文件，按章节维护 |
| `build_prd.py` | 排版脚本：Markdown → DOCX（含目录页码测量）→ PDF |

## 文档结构

1 引言 · 2 产品定位与范围 · 3 用户角色与权限模型 · 4 角色的功能列表 · 5 功能需求详述（78 项）·
6 用例说明书（30 个用例，18 个详细说明）· 7 业务规则与状态机 · 8 信息架构与数据模型 ·
9 接口设计 · 10 页面与交互说明 · 11 非功能需求 · 12 实施计划与里程碑 · 13 验收标准与交付物 ·
14 风险与应对 · 15 提请确认事项 · 附录 A~E。

## 重新生成

```bash
PY="/Applications/DeepSeek Harness.app/Contents/Resources/runtime/primary-runtime/dependencies/python/bin/python3"
$PY build_prd.py --pdf            # 重新测量章级页码并生成 docx + pdf
$PY build_prd.py --reuse-pages    # 沿用 _pages.json 中的页码，快速重排
```

依赖：python-docx、LibreOffice Kit（由工作区运行时提供）。修改分章 Markdown 后重新生成即可；若正文增删导致分页变化，请勿使用 `--reuse-pages`。
