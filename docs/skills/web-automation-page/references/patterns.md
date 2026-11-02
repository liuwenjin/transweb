# 可复制配方

以下片段都能直接放进 flow spec 的 `steps`（省略外层字段）。示例默认 `version: 2`。

---

## 1. 登录后断言（同源 inpage）

```json
{
  "action": "goto",
  "url": "/login"
},
{
  "action": "waitFor",
  "selector": "[data-testid=login-form]",
  "timeout": 20000
},
{
  "action": "fill",
  "selector": "[name=email]",
  "value": "{{email}}"
},
{
  "action": "fill",
  "selector": "[name=password]",
  "value": "{{secret.PASSWORD}}"
},
{
  "action": "click",
  "selector": "button[type=submit]"
},
{
  "action": "waitFor",
  "url": "**/dashboard",
  "timeout": 30000
},
{
  "action": "assert",
  "selector": "h1",
  "contains": "仪表盘"
}
```

要点：

- 密码只出现在 `{{secret.PASSWORD}}`，spec 的 `secrets: ["PASSWORD"]` 声明。
- 点击后先等 URL 或目标元素，不要 `wait 3000`。
- 如果登录失败会停在原页，`waitFor` 超时并截图（Playwright）。

---

## 2. 同源多页（iframe 内导航）

```json
{
  "action": "goto",
  "url": "/list"
},
{
  "action": "click",
  "selector": "a[data-testid=detail]",
  "index": 1
},
{
  "action": "waitFor",
  "selector": "[data-testid=detail-title]",
  "timeout": 20000
},
{
  "action": "assert",
  "selector": "[data-testid=detail-title]",
  "contains": "订单详情"
},
{
  "action": "goto",
  "url": "/list"
}
```

inpage 的 iframe 换文档后，下一步会自动在新文档里查选择器；不需要重新加载承载页。

---

## 3. 跨域多标签页（Playwright）

```json
{
  "version": 2,
  "name": "crossSiteAudit",
  "title": "跨站巡检",
  "mode": "playwright",
  "baseUrl": "https://app.example.com",
  "pages": [
    { "id": "main", "url": "https://app.example.com/" },
    { "id": "admin", "url": "https://admin.example.com/" }
  ],
  "steps": [
    { "action": "goto", "url": "/" },
    { "action": "waitFor", "selector": "h1" },
    { "action": "extract", "selector": "h1", "as": "appTitle" },
    { "page": "admin", "action": "waitFor", "selector": "h1" },
    { "action": "assert", "selector": "h1", "contains": "Admin" },
    { "action": "screenshot", "fullPage": true }
  ]
}
```

- 第一次在某页执行步骤时创建标签页，并导航到 `pages[].url`（除非当前步骤是 `goto`）。
- 同一 `context` 内 Cookie 共享；不同 origin 的 Cookie 互不影响。
- `screenshot` 存到 `autoflow-output/<name>/`。

---

## 4. 表格/列表抓取

```json
{
  "action": "waitFor",
  "selector": "table tbody tr"
},
{
  "action": "extract",
  "selector": "table tbody tr",
  "multiple": true,
  "as": "rows"
},
{
  "action": "extract",
  "selector": "table tbody tr",
  "index": 1,
  "attr": "data-id",
  "as": "firstId"
},
{
  "action": "log",
  "message": "共 {{rows.length}} 行，首行 ID={{firstId}}"
}
```

点路径可以访问数组/对象的自有属性，所以 `{{rows.length}}`、`{{user.email}}` 都可用。

---

## 5. 上传 + 截图（Playwright）

```json
{
  "action": "upload",
  "selector": "input[type=file]",
  "path": "./fixtures/report.pdf"
},
{
  "action": "click",
  "selector": "button[data-testid=submit]"
},
{
  "action": "waitFor",
  "text": "上传成功",
  "timeout": 60000
},
{
  "action": "screenshot",
  "path": "autoflow-output/upload-ok.png",
  "fullPage": true
}
```

- 上传路径相对于运行命令的 `cwd`。
- inpage 不支持 upload/screenshot；会明确报错。

---

## 6. 可选步骤（失败继续）

```json
{
  "action": "click",
  "selector": "[data-testid=close-ad]",
  "onError": "continue"
},
{
  "action": "waitFor",
  "selector": "[data-testid=main]"
}
```

只对“没有也不影响主流程”的步骤用 `continue`；否则会掩盖真实失败。

---

## 7. 弹窗/二次确认

```json
{ "action": "click", "selector": "[data-testid=delete]" },
{ "action": "waitFor", "selector": "[role=dialog]" },
{ "action": "assert", "selector": "[role=dialog]", "contains": "确认删除" },
{ "action": "click", "selector": "[role=dialog] button[data-testid=confirm]" },
{ "action": "waitFor", "text": "删除成功" }
```

浏览器原生 `confirm()` 在 Playwright 中需要监听 `dialog` 事件；spec 未暴露，必要时扩展 runner（`page.on("dialog", d => d.accept())`）。

---

## 8. iframe 内操作

```json
{ "action": "frame", "selector": "iframe[data-testid=payment]" },
{ "action": "waitFor", "selector": "input[name=card]" },
{ "action": "fill", "selector": "input[name=card]", "value": "{{cardNumber}}" },
{ "action": "frame", "selector": null },
{ "action": "click", "selector": "button[data-testid=pay]" }
```

跨域 iframe：inpage 直接报错；Playwright 可操作（frameLocator）。

---

## 9. 应用内 API（eval 案例）

目标页暴露了全局对象（如 `webCpu` / `appStore`）时，DOM 点击可能不如直接调用方法稳定：

```json
{
  "action": "eval",
  "description": "调用页面自身方法",
  "script": "var w = ctx.win;\nvar card = w.webCpu && w.webCpu.cards.loginRegCard;\nif (!card || !card.task) return 'skip';\ncard.task.confirmCallback({ account: ctx.vars.email, checkNumber: ctx.secrets.PASSWORD });\nreturn 'ok';",
  "as": "loginResult"
}
```

- inpage 的 eval 运行在**承载页**，目标页对象必须从 `ctx.win` / `ctx.doc` 访问；不要直接写 `document`（那是承载页）。
- Playwright 的 eval 运行在目标页，直接写 `document` 即可；参数通过 `vars` 传入。
- eval 只用于可信 spec；不要把用户输入拼进脚本。

完整案例见 `examples/transweb-init.flow.json` 与 `references/case-transweb-initadmin.md`。

---

## 10. 幂等初始化（像 initAdmin 那样）

初始化脚本经常要“第一次创建、第二次跳过”。思路：

1. 先探测状态（元素/接口/全局变量）→ 用 `waitFor` 或 `eval` 返回标志；
2. 已初始化则跳过剩余步骤（当前 spec 没有 if；用独立 flow 或 `eval` 内部判断 + 直接 return）；
3. 写配置/跳转放在回调里，确认成功再进下一步；
4. 记录进度（URL 参数 / localStorage），刷新后能续跑；
5. 失败时给出可见提示，而不是静默继续。

`case-transweb-initadmin.md` 里有原始实现的逐段分析。

---

## 11. 长列表 / 无限滚动

spec 是线性步骤，没有循环。三种做法：

1. **固定次数**：重复 `scroll` + `waitFor` + `extract`（提取最后一次/累加需 eval）。
2. **eval 循环**：在 Playwright 的 eval 里滚动并收集，直到高度不变：

```json
{
  "action": "eval",
  "script": "for (let i = 0; i < 20; i++) { window.scrollTo(0, document.body.scrollHeight); await new Promise(r => setTimeout(r, 800)); } return document.querySelectorAll('.row').length;",
  "as": "rowCount"
}
```

3. **扩展 runner**：写 `for` 循环，最灵活。

---

## 12. 失败与恢复

- Playwright 失败自动截图 `autoflow-output/<name>/failure-step-N.png`。
- 结果 JSON 在 `autoflow-output/<name>/result.json`。
- 控制台会显示日志与退出码；`--headed --slowmo 300` 适合定位。
- 需要重试时优先 `retry`；有副作用的操作先确认幂等。

---

## 13. 本地控制台

```bash
node generate.mjs flow.json --out out --with-server
node out/serve-<name>.mjs
# 打开 http://127.0.0.1:4173/
```

- 只监听 127.0.0.1；没有鉴权，等同本机执行权限。
- “运行”启动 runner，“停止”发 SIGTERM，日志走 SSE。
- 没装 Playwright 时，运行会失败并显示安装命令。
