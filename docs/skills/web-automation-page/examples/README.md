# 示例 flow

| 文件 | 后端 | 说明 |
| --- | --- | --- |
| `login-demo.flow.json` | inpage | 同源登录：填表 → 提交 → 等 URL → 断言 → 提取用户 ID |
| `multi-page.flow.json` | playwright | 跨域、多标签页、截图 |
| `transweb-init.flow.json` | inpage | 案例：用 `eval` 调用 TransWeb 页面自身的 `webCpu` / `aigcInterface` |

## 生成与校验

```bash
# 同源承载页（类似 initAdmin.html）
node docs/skills/web-automation-page/scripts/generate.mjs \
  docs/skills/web-automation-page/examples/login-demo.flow.json \
  --out autoflow-dist --mode inpage

node docs/skills/web-automation-page/scripts/validate.mjs \
  docs/skills/web-automation-page/examples/login-demo.flow.json \
  --inpage autoflow-dist/loginDemo.html

# 跨域/多页：Playwright + 控制台 + 本地服务
node docs/skills/web-automation-page/scripts/generate.mjs \
  docs/skills/web-automation-page/examples/multi-page.flow.json \
  --out autoflow-dist --mode playwright --with-server

node docs/skills/web-automation-page/scripts/validate.mjs \
  docs/skills/web-automation-page/examples/multi-page.flow.json \
  --runner autoflow-dist/multiPageAudit.run.mjs \
  --console autoflow-dist/multiPageAudit.console.html \
  --server autoflow-dist/serve-multiPageAudit.mjs
```

## 注意

- 示例里的选择器（`#email`、`h1` 等）是演示用的占位符。真实使用前先 `inspect.mjs` 探测目标页，替换成稳定选择器。
- `multi-page.flow.json` 的 `example.com` 只是域名示例；请改成你有权访问的站点。
- `login-demo` 需要 `PASSWORD` 环境变量（Playwright）或页面弹窗输入（inpage）。
- `transweb-init` 只能在 `admin.html` 同源部署下运行，且依赖 TransWeb 自己的 `webCpu` 全局对象；它是案例，不是通用模板。
