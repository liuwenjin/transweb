# 安全策略（Security Policy）

## 支持版本

项目目前处于早期阶段（v0.0.1），尚无长期支持（LTS）承诺；安全修复随 `main` 分支滚动发布。

| 版本 | 支持情况 |
| --- | --- |
| `main`（最新提交） | ✅ 提供安全修复 |
| 历史提交 | ❌ 不单独提供修复 |

## 报告安全漏洞

如发现安全漏洞，请勿在公开 Issue 中披露细节。请通过 GitHub 的「Security → Report a vulnerability」私密通道，或邮件联系仓库维护者（见提交记录中的作者邮箱）。

我们会在 72 小时内确认，并在修复发布前与你保持沟通；漏洞确认后会在公告中致谢报告者。

## 部署安全须知

- 对外发布到互联网前，**务必删除后台与初始化页面**（`static/admin.html`、`static/initAdmin.html` 等），否则任何人都可访问初始化/管理入口。详见 README「上线前安全必做」。
- 生产部署前请轮换 `.env.example` 中标注为 `TODO(轮换)` 的默认密钥/口令。
- 不要将 `.env`、`ca/`（证书私钥）、`wxPayLog/`、`personal/`、`static/bucket/personal/` 等提交或暴露到公开环境（这些已被 `.gitignore` 排除）。
