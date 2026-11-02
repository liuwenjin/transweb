# 选择器、等待与断言

自动化不稳定，90% 是选择器或等待的问题。这里给出一套可执行的标准。

## 1. 选择器优先级

| 优先级 | 写法 | 说明 |
| --- | --- | --- |
| 1 | `[data-testid="submit"]` | 最稳定；前后端约定 |
| 2 | `[name="email"]`、`#login-btn` | 表单/业务 id；注意 id 不要是动态生成 |
| 3 | `[aria-label="登录"]`、`role=button[name="登录"]` | 语义稳定，Playwright 支持 role；inpage 只支持前两种 |
| 4 | `text=登录` | 文案稳定时好用；改文案会断 |
| 5 | `button.primary` | 类名可能被 CSS 重构影响 |
| 6 | `form > div:nth-child(2) > input` | 最脆弱，仅兜底 |

反例（不要用）：

- `#:r1:`、`#el-id-1234-5`、`.css-1x2y3z`：框架动态生成；
- `div:nth-child(3) > div > div > button`：布局一改就断；
- 纯文本很长（超过 40 字）：容易受空格/标点影响。

### 1.1 文本选择器

- `text=登录`：Playwright 先精确再包含；inpage 也是先精确匹配叶子节点，再包含。
- 多个同名按钮：用 `index`（1-based）或更具体的容器限定：
  - `#login-form button[type=submit]`
  - `[data-testid="dialog"] >> text=确定`（Playwright 链式）

### 1.2 XPath

- `xpath=//button[normalize-space()="登录"]`
- `//input[@name="email"]`
- XPath 适合“按文本/属性找”，但可读性差；优先 CSS。

### 1.3 Shadow DOM

- inpage：`my-card >>> button`（逐层 `shadowRoot`）。
- Playwright：生成器会把 `>>>` 转成 `>>`；也可直接写 `my-card >> button`。
- 闭合 shadow root（closed）无法访问；改用组件对外事件/属性或 Playwright 的 `locator` 穿透能力（也有限）。

### 1.4 iframe

```json
{ "action": "frame", "selector": "iframe#payment" },
{ "action": "fill", "selector": "input[name=card]" },
{ "action": "frame", "selector": null }
```

- 连续 `frame` 表示逐层进入；`selector: null` 回到顶层。
- 跨域 iframe：inpage 无法访问；Playwright 的 `frameLocator` 也要求能找到 frame，但可操作跨域 frame（浏览器侧）。
- iframe 内的选择器相对于该 frame 文档。

### 1.5 多元素与 index

- `index` 从 1 开始；不写时取第一个。
- `selector`、`url`、`value`、`path`、`frame` 都支持 `{{var}}` 插值（如 `[data-id="{{orderId}}"]`）；`eval.script` 不做插值，用 `ctx.vars` / `vars`。
- 列表/表格建议先 `waitFor` 容器，再按行定位：

```json
{ "action": "waitFor", "selector": "table tbody tr" },
{ "action": "click", "selector": "table tbody tr", "index": 2, "description": "第二行" }
```

- 严格模式：Playwright 的 `locator` 默认要求唯一；生成器在未写 `index` 时用 `.first()`。如果目标是“必须唯一”，在 spec 里写清 `index` 或更具体的选择器，别依赖隐式 first。

## 2. 等待：只等可观测状态

### 2.1 不要用 sleep 猜

```json
{ "action": "wait", "ms": 5000 }
```

这是最后手段，只用于动画/节流（且建议 ≤ 500ms）。正确做法：

```json
{ "action": "waitFor", "selector": "#dashboard", "timeout": 30000 },
{ "action": "waitFor", "url": "**/dashboard" },
{ "action": "waitFor", "text": "保存成功" }
```

### 2.2 等待类型

| 场景 | 写法 |
| --- | --- |
| 等元素出现/可见 | `waitFor.selector`（默认 `visible`） |
| 等元素挂载（不要求可见） | `state: "attached"` |
| 等加载态消失 | `waitFor.selector` + `state: "detached"` / `"hidden"` |
| 等 SPA 路由跳转 | `waitFor.url` glob |
| 等 toast/文案 | `waitFor.text` |
| 等接口返回后渲染 | 等渲染出的元素，不要等接口（无法观测） |

### 2.3 超时与重试

- 每步 `timeout` 默认 15s；慢系统设 30–60s。
- 瞬时错误（动画、loading）可用：

```json
{
  "action": "click",
  "selector": "[data-testid=save]",
  "retry": { "count": 2, "interval": 1000 }
}
```

- 重试不是万能：如果点击有副作用（提交订单），重试前要确认幂等。必要时把“重试”改成“先断言状态，再决定”。

### 2.4 导航

- `goto` 后至少跟一个 `waitFor`（元素或 URL）。
- `click` 触发跳转时，下一步用 `waitFor` 等新页面；inpage 的 iframe 会换文档，引擎会重新查询。
- Playwright 的 `goto` 默认 `domcontentloaded`；SPA 首屏可能还需要 `waitFor`。

## 3. 断言与提取

### 3.1 断言

```json
{ "action": "assert", "selector": "h1", "contains": "仪表盘" },
{ "action": "assert", "selector": "input[name=email]", "value": true, "equals": "a@b.com" },
{ "action": "assert", "url": "**/dashboard" },
{ "action": "assert", "text": "保存成功", "contains": "成功" }
```

- `equals` 前会做空白归一化；大小写敏感。
- `matches` 是正则字符串（注意 JSON 转义）。
- `not: true` 取反。
- 断言失败会带“实际值（截断）/期望值”，便于排查。

### 3.2 提取

```json
{ "action": "extract", "selector": ".user-id", "as": "userId" },
{ "action": "extract", "selector": "table tbody tr", "multiple": true, "as": "rows" },
{ "action": "extract", "selector": "a.next", "attr": "href", "as": "nextUrl" }
```

- `multiple: true` 得到字符串数组；否则取 `index`（默认 1）。
- 提取值会做空白归一化；保留原始 HTML 用 `html: true`。
- 后续用 `{{userId}}` 插值。

## 4. 调试

1. **有头 + 放慢**：`node x.run.mjs --headed --slowmo 300`。
2. **截图**：失败时 runner 自动存 `autoflow-output/<name>/failure-step-N.png`；也可显式 `screenshot`。
3. **看选择器**：`inspect.mjs` 报告；或在浏览器 Console 里 `document.querySelectorAll("...").length` 确认唯一。
4. **trace**：`--trace`，用 `npx playwright show-trace autoflow-output/<name>/trace.zip`。
5. **inpage 日志**：页面右上“日志”按钮；控制台有 `[autoflow]` 前缀。
6. **先小后大**：先跑 2–3 步验证选择器，再补全流程。

## 5. 常见故障对照

| 现象 | 可能原因 | 处理 |
| --- | --- | --- |
| 找不到元素 | 选择器错/在 iframe/Shadow DOM/延迟渲染 | `inspect`、加 `frame`、加 `waitFor` |
| 点击没反应 | 被遮罩/禁用/需要 hover/事件委托 | 先 `waitFor` 可见、`hover`、`scroll`，或 `force: true`（Playwright） |
| 填了但页面没变 | 受控组件只认 input 事件 | 生成器已派发 input/change；仍不行时用 `press` 逐字输入 |
| 跳转后步骤全失败 | 新文档还没加载 | 下一步 `waitFor` 新元素/URL |
| 登录后仍跳登录 | Cookie/SameSite/域名不对 | 同源部署；Playwright 用 storageState |
| 只能第一次成功 | 数据已存在/按钮变“编辑” | 流程要幂等：先检查状态，或用 `onError: continue` + 断言 |
| 选择器昨天还好今天断了 | 站点改版/动态 class | 改用 `data-testid`/`name`/`role`，或找官方 API |
