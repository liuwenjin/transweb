# Flow spec（通用自动化流程）

一份 JSON 描述“在哪些页面、按什么顺序、做什么、等什么、怎么判定成功”。生成器把它编译成两种后端：

- `inpage`：同源页面内运行，产出一个类似 `initAdmin.html` 的自包含页面（零依赖）。
- `playwright`：任意站点 / 跨域 / 多标签页，产出 Node 脚本（需要 Playwright）。

## 顶层字段

| 字段 | 必填 | 默认 | 说明 |
| --- | --- | --- | --- |
| `version` | 否 | `2` | 当前只支持 2 |
| `name` | 是 | — | 文件基名，`^[A-Za-z][A-Za-z0-9_-]*$` |
| `title` | 是 | — | 字符串或 `{ zh, en }` |
| `description` | 否 | 标题 | 页面说明 |
| `mode` | 否 | `auto` | `auto` / `inpage` / `playwright` / `both` |
| `baseUrl` | 否 | — | 相对 URL 的基准；inpage 默认用承载页 origin |
| `vars` | 否 | `{}` | 非敏感变量默认值，可在运行时覆盖 |
| `secrets` | 否 | `[]` | 敏感变量名列表；**不要写值** |
| `pages` | 否 | 单页 | 命名页面：`[{ "id": "main", "url": "/login" }]` |
| `defaultTimeout` | 否 | `15000` | 单步默认超时（毫秒） |
| `steps` | 是 | — | 步骤数组 |

`mode=auto` 的判定：

- 所有 URL 都是相对路径，且没有步骤使用 `page` 切页 → `inpage`（同源多页也用 `goto` 顺序导航）。
- 存在绝对 URL（`http(s)://`）或步骤用到 `page` 切页 → `playwright`。
- 需要两者都产出 → 显式 `mode=both`。

> 生成器不知道承载页最终部署在哪个 origin。绝对 URL 一律按“可能跨域”处理，默认走 Playwright；如果确认同源，可显式 `mode=inpage`。
>
> **Playwright 模式必须提供绝对 `baseUrl` 或 `pages[0].url`**（如 `https://example.com`）；相对路径/`/` 无法确定目标 origin，校验会直接报错。

## 步骤通用字段

| 字段 | 默认 | 说明 |
| --- | --- | --- |
| `action` | 必填 | 见下表 |
| `description` | — | 日志/控制台展示用 |
| `timeout` | `defaultTimeout` | 本步超时（毫秒） |
| `retry` | — | `{ "count": 2, "interval": 1000 }`，失败重试次数/间隔 |
| `onError` | `stop` | `stop` 或 `continue`（记录后继续） |
| `page` | `main` | 仅 Playwright：切换到哪个命名页面（不存在则新建） |

## 动作

| action | 必填 | 可选 | 语义 |
| --- | --- | --- | --- |
| `goto` | `url` | — | 导航；相对 URL 用 `baseUrl` 解析 |
| `click` | `selector` | `index`、`button`、`clickCount`、`modifiers`、`force` | 点击第 index 个匹配（1-based） |
| `fill` | `selector`、`value` | `clear`（默认 true）、`typingDelay`、`blur` | 写入输入框/textarea/contenteditable |
| `press` | `key` | `selector`、`submit` | 按键；`submit:true` 时在 Enter 后提交所在表单（inpage） |
| `select` | `selector`、`value` 或 `values` | `index` | 下拉选择；数组表示多选 |
| `check` | `selector` | `checked`（默认 true）、`index` | 勾选/取消 |
| `hover` | `selector` | `index` | 悬停 |
| `scroll` | `selector` 或 `x`/`y` | `behavior` | 元素滚入视口，或滚动窗口 |
| `wait` | `ms` | — | 固定等待；仅用于动画/节流，不用于等异步结果 |
| `waitFor` | `selector` / `text` / `url` 之一 | `state`、`timeout` | 轮询直到条件成立 |
| `assert` | `selector` / `text` / `url` 之一 | `attr`、`value`、`equals`、`contains`、`matches`、`not`、`index` | 断言；默认读文本 |
| `extract` | `selector`、`as` | `attr`、`prop`、`html`、`multiple`、`index` | 把文本/属性/值存进变量 |
| `eval` | `script` | `as` | 在目标页执行代码；**仅可信 spec** |
| `screenshot` | — | `path`、`fullPage` | 仅 Playwright；默认存 `autoflow-output/<name>/` |
| `upload` | `selector`、`path` | — | 仅 Playwright；设置文件输入 |
| `frame` | `selector` | — | 切换进 iframe；`null` 回到顶层 |
| `log` | `message` | — | 输出一条日志 |
| `setVar` | `name`、`value` | — | 设置变量 |

### 定位器

- 默认 CSS：`.login-form input[name="email"]`。
- XPath：`xpath=//button[text()="登录"]` 或 `//button[...]`。
- 文本：`text=登录`（先精确匹配，再包含匹配）。
- Shadow DOM：`my-card >>> button`（inpage 走 shadowRoot；Playwright 自动转换为 `>>`）。
- `index` 从 1 开始；越界视为错误。
- Playwright 额外支持 `role=button[name="登录"]`、`testid=submit` 等引擎选择器；inpage 不支持。

### 等待语义

- `waitFor.selector.state`：`visible`（默认）/ `attached` / `hidden` / `detached`。
- `waitFor.url` 支持 glob：`**/dashboard`、`https://example.com/app/*`。
- `waitFor.text` 匹配页面正文文本（inpage 用 `document.body.innerText`；Playwright 在目标页执行同样的检查）。
- inpage 每 200ms 轮询；Playwright 用原生 auto-wait + `waitFor`。
- 异步结果不要用 `wait` 猜；用 `waitFor` / `assert`。

### 变量与秘密

- 插值：`{{name}}`、`{{user.email}}`（点路径）、`{{secret.PASSWORD}}`。
- `vars` 可被运行时覆盖：
  - inpage：`window.AUTOFLOW_VARS = { ... }`；缺 secret 时会弹窗输入。
  - Playwright：`--var name=value`；secret 从同名环境变量读取。
- **spec 里永远不写密码/token**；只写 `secrets` 名和 `{{secret.X}}`。

### `eval` 约定

- inpage：`new AsyncFunction("ctx", script)`，可用 `ctx.doc`、`ctx.win`、`ctx.vars`、`ctx.secrets`、`ctx.setVar(k,v)`。
- Playwright：在目标页里执行，脚本里可用 `vars`、`document`；返回值写入 `as`。
- **`script` 不做 `{{var}}` 插值**（避免破坏 JS 语法）；用 `ctx.vars.x` / `vars.x` / `ctx.secrets.X` 取值。
- 只允许在可信 spec 中使用；生成器/校验器会标记它。
- 目标站 CSP 禁止 `unsafe-eval` 时，Playwright 的 eval 也会失败；改用 selectors。

## 页面与多页

```json
{
  "baseUrl": "https://app.example.com",
  "pages": [
    { "id": "main", "url": "/login" },
    { "id": "admin", "url": "https://admin.example.com" }
  ],
  "steps": [
    { "action": "goto", "url": "/login" },
    { "action": "fill", "selector": "#email", "value": "{{email}}" },
    { "action": "fill", "selector": "#password", "value": "{{secret.PASSWORD}}" },
    { "action": "click", "selector": "button[type=submit]" },
    { "action": "waitFor", "url": "**/dashboard" },
    { "action": "waitFor", "page": "admin", "selector": "h1" }
  ]
}
```

- `page` 不是动作；步骤上用 `"page": "admin"` 切页。首次使用会新建标签页并导航到 `pages[].url`（若配置）。
- inpage 不支持步骤级 `page` 切页；同源多页请用 `goto` 顺序导航：iframe 换文档后，下一步继续轮询新文档。
- `pages` 在 inpage 中只用于 `pages[0]` 的初始地址；多页/跨域最终会受同源策略限制。

## 输出产物

| 模式 | 文件 |
| --- | --- |
| inpage | `<name>.html`（内联 runtime + flow，单文件可分发） |
| playwright | `<name>.run.mjs`（Node 脚本，内联 flow） |
| 两者 | `<name>.flow.json`（规范源，便于评审/再生成） |
| 可选 | `<name>.console.html` + `serve-<name>.mjs`（本地控制台，可一键运行 Playwright） |

## 完整示例

```json
{
  "version": 2,
  "name": "loginDemo",
  "title": "登录并检查仪表盘",
  "mode": "inpage",
  "baseUrl": "/",
  "vars": { "email": "demo@example.com" },
  "secrets": ["PASSWORD"],
  "defaultTimeout": 20000,
  "steps": [
    { "action": "goto", "url": "/login" },
    { "action": "waitFor", "selector": "#email" },
    { "action": "fill", "selector": "#email", "value": "{{email}}" },
    { "action": "fill", "selector": "#password", "value": "{{secret.PASSWORD}}" },
    { "action": "click", "selector": "button[type=submit]" },
    { "action": "waitFor", "url": "**/dashboard", "timeout": 30000 },
    { "action": "assert", "selector": "h1", "contains": "仪表盘" },
    { "action": "extract", "selector": ".user-id", "as": "userId" },
    { "action": "log", "message": "当前用户：{{userId}}" }
  ]
}
```
