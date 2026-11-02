---
name: web-automation-page
description: 为任意网页（单个/多个/跨域）生成自动化：inpage 承载页（类似 initAdmin.html）、Playwright 脚本、运行控制台；含页面探测与静态校验。
---

# 任意网页自动化生成器

把“在哪些页面、按什么顺序、做什么、等什么、怎么算成功”变成可运行的自动化产物。同一份 **flow spec** 可编译成两种后端：

| 后端 | 适用 | 产物 | 运行方式 |
| --- | --- | --- | --- |
| **inpage** | 同源、单页/同源多页 | `<name>.html`（自包含，类似 `initAdmin.html`） | 浏览器打开即跑 |
| **playwright** | 任意站点、跨域、多标签页、需要上传/截图/视频 | `<name>.run.mjs` + 控制台 + 可选本地服务 | `node <name>.run.mjs` 或控制台一键运行 |

> 浏览器同源策略是硬边界：普通 HTML 不能读取跨域 iframe 的 DOM。跨域/多页必须走 Playwright（或浏览器扩展/用户脚本，见 `references/modes.md`）。

## 何时使用

- “打开某个页面，自动登录/填表/点按钮/抓数据/截图”；
- “在 A 页面操作后跳到 B 页面继续”，或跨多个站点、多个标签页；
- 把已有的手工流程、录屏步骤、SOP 变成可重复执行的脚本；
- 为内部系统生成初始化页（像 `initAdmin.html` 那样打开即自动执行）。

不适用：需要破解验证码、绕过访问控制、批量注册/爬取受保护数据等未授权场景。

## 开始前先读

1. `references/flow-schema.md`：flow spec 的全部字段、动作、变量/秘密、模式判定。**写 spec 前必读。**
2. `references/modes.md`：inpage vs Playwright vs 扩展/用户脚本；同源、跨域、多页、登录态、验证码的边界。
3. `references/selectors-and-waits.md`：选择器、Shadow DOM、iframe、等待与断言。
4. `references/patterns.md`：登录、向导、跨页、抓取、上传、长列表等配方。
5. `references/case-transweb-initadmin.md`：原始 `initAdmin` 链路的逐段分析（app-specific `eval` 案例）。

## 工作流

### 0. 需求澄清（缺什么问什么）

必须确认：

1. **目标**：URL 列表；是否跨域；是否需要多个标签页/登录态。
2. **步骤**：每步“做什么 → 等什么 → 成功长什么样”，失败时停下还是继续。
3. **凭据**：账号/密码/token 从哪来（环境变量、部署方注入、人工输入）；**不要**让 AI 把真实密码写进 spec。
4. **选择器**：是否有稳定 `data-testid`/`name`；是否在 iframe / Shadow DOM 里。
5. **限制**：验证码、短信/2FA、频率限制、ToS、是否允许自动化。
6. **交付**：只要页面？只要脚本？控制台？是否要截图/视频/报告。

如果用户只给一句“帮我自动化这个网站”，先探测页面并列出计划，再问缺失项；不要凭空编选择器。

### 1. 探测页面

```bash
node docs/skills/web-automation-page/scripts/inspect.mjs https://example.com/login \
  --out autoflow-dist/login.inspect.json --screenshot autoflow-dist/login.png
```

- 有 Playwright：真实浏览器渲染，输出标题、表单、可交互元素、候选选择器、iframe、密码/验证码提示。
- 没有 Playwright：退化为 `fetch` 静态解析，并明确警告“看不到 JS 渲染内容”。
- 报告里的候选选择器按稳定性排序（`data-testid` → `name`/`id` → 稳定 class → `text=` → CSS 路径），仍需人工确认唯一性。

### 2. 写 flow spec

先写 spec（参考 `examples/`），不要直接手写生成的 HTML/runner。最小示例：

```json
{
  "version": 2,
  "name": "loginDemo",
  "title": "登录并检查仪表盘",
  "mode": "inpage",
  "baseUrl": "/",
  "vars": { "email": "demo@example.com" },
  "secrets": ["PASSWORD"],
  "steps": [
    { "action": "goto", "url": "/login" },
    { "action": "waitFor", "selector": "#email" },
    { "action": "fill", "selector": "#email", "value": "{{email}}" },
    { "action": "fill", "selector": "#password", "value": "{{secret.PASSWORD}}" },
    { "action": "click", "selector": "button[type=submit]" },
    { "action": "waitFor", "url": "**/dashboard", "timeout": 30000 },
    { "action": "assert", "selector": "h1", "contains": "仪表盘" }
  ]
}
```

### 3. 生成

```bash
# 同源页面：生成自包含承载页（类似 initAdmin.html）
node docs/skills/web-automation-page/scripts/generate.mjs flow.json --out static/auto

# 任意/跨域/多页：生成 Playwright 脚本 + 控制台
node docs/skills/web-automation-page/scripts/generate.mjs flow.json --out autoflow-dist

# 控制台一键运行（本地 Node 服务）
node docs/skills/web-automation-page/scripts/generate.mjs flow.json \
  --out autoflow-dist --with-server
```

`mode=auto` 的判定：全部相对 URL 且没有 `page` 切页 → inpage（同源多页用 `goto`）；绝对 URL 或 `page` 切页 → Playwright。可用 `--mode` 覆盖。

### 4. 校验

```bash
node docs/skills/web-automation-page/scripts/validate.mjs flow.json \
  --inpage autoflow-dist/loginDemo.html

node docs/skills/web-automation-page/scripts/validate.mjs flow.json \
  --runner autoflow-dist/loginDemo.run.mjs \
  --console autoflow-dist/loginDemo.console.html \
  --server autoflow-dist/serve-loginDemo.mjs
```

- **error**：结构/模式/语法/产物缺失，必须修。
- **warning**：固定 `wait`、动态选择器、`eval`、未声明的 secret、跨域风险等，逐条评估。
- 校验器会执行 runner 的 `--dry-run`（不启动浏览器）；这不是浏览器实跑。

### 5. 运行与自测

**inpage**：把 HTML 放到与目标页**同源**的路径下打开；第一次会提示输入 `secrets`。测试：

- 已登录 / 未登录；
- 目标元素缺失、慢网、点击后跳转；
- iframe 内操作、Shadow DOM；
- 结果断言与变量提取。

**Playwright**：

```bash
npm i -D playwright && npx playwright install chromium
node autoflow-dist/loginDemo.run.mjs --headed --slowmo 200
# 或控制台
node autoflow-dist/serve-loginDemo.mjs   # http://127.0.0.1:4173/
```

测试：有头/无头、断网、登录过期、验证码、多标签页、截图/视频落盘。

### 6. 交付

输出：spec、生成文件、运行命令、secret 注入方式、已验证项、未验证项、已知限制（验证码/2FA/跨域/频控）。
没有在浏览器里跑过，就必须写明“未做浏览器实跑验证”。

## 硬性规则

- **只自动化你有权操作的页面**；遵守目标站 ToS、robots、频率限制；不要绕过验证码/访问控制。
- **spec 里不写密码/token**。用 `secrets: ["PASSWORD"]` + `{{secret.PASSWORD}}`：
  - Playwright：同名环境变量；
  - inpage：打开页面时弹窗输入（仅内存），或部署前设置 `window.AUTOFLOW_SECRETS`。
- **inpage 只做同源**。跨域 iframe 读不到 DOM；不要试图用 `iframe.contentDocument` 绕过。
- **用 `waitFor` / `assert`，不要用 `wait` 猜异步**。固定等待只用于动画/节流，且要短。
- **一个步骤只做一件事**；失败默认停止，只有明确可忽略时才 `onError: "continue"`。
- **选择器优先稳定属性**：`data-testid`、`name`、`id`、`role`/`aria-label`、`text=`；避免动态 id/深层 `nth-child`。
- **`eval` 只用于可信 spec**：它能执行任意页面代码；不要从用户输入拼 `eval`。
- **本地服务只绑定 127.0.0.1**；生成的控制台/承载页默认 `noindex`，上线前删除或加访问控制。
- 不改 `webCpu.js` / 目标站源码来实现单个流程；自动化是外挂层。
- 遵守项目 `AGENTS.md`：本 Skill 只产出原生 HTML/JS/Node 脚本，不碰 Vue 组件样式与 `:deep`。

## 输入 / 输出契约

**输入**：目标 URL（一个或多个）、步骤与等待条件、登录/凭据来源、成功判定、交付形态、授权与限制。
**输出**：

1. `flow.json`（可评审、可复用）；
2. 同源承载页 `*.html`，或 Playwright `*.run.mjs`；
3. 可选控制台 `*.console.html` + 本地服务 `serve-*.mjs`；
4. `validate.mjs` 报告；
5. 运行/回滚说明（如何停用、如何改选择器、如何注入 secret）。

## 文件地图

```text
docs/skills/web-automation-page/
├── SKILL.md
├── references/
│   ├── flow-schema.md           # spec 契约（先读）
│   ├── modes.md                 # 后端选型与跨域边界
│   ├── selectors-and-waits.md   # 选择器/等待/断言
│   ├── patterns.md              # 可复制配方
│   └── case-transweb-initadmin.md
├── assets/
│   ├── runtime.js               # inpage 执行器 + 承载页 UI
│   ├── inpage.tpl.html
│   ├── runner.tpl.mjs           # Playwright 执行器模板
│   ├── console.tpl.html
│   └── server.tpl.mjs
├── scripts/
│   ├── generate.mjs
│   ├── inspect.mjs
│   ├── validate.mjs
│   ├── selftest.mjs
│   └── lib/flow.mjs
└── examples/
    ├── login-demo.flow.json     # 同源登录
    ├── multi-page.flow.json     # 跨域多页
    └── transweb-init.flow.json  # app-specific eval 案例
```

## 快速命令

```bash
# 探测
node scripts/inspect.mjs <url> --out report.json
# 生成（自动选后端）
node scripts/generate.mjs flow.json --out out
# 生成 inpage
node scripts/generate.mjs flow.json --out static/auto --mode inpage
# 生成 Playwright + 控制台 + 本地服务
node scripts/generate.mjs flow.json --out out --mode playwright --with-server
# 校验
node scripts/validate.mjs flow.json --inpage out/x.html --runner out/x.run.mjs
# 自检（生成器 + 运行时 + 服务）
node scripts/selftest.mjs
```
