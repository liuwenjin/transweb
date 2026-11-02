# 源码拆解：initAdmin 自动化链路

> 分析对象（截至当前工作区）：
> `static/initAdmin.html`、`static/assets/animationScripts/initAdmin.js`、`initTools.js`、`static/admin.html`、`static/clone.html`，以及 `static/transweb/webCpu.js`、`static/transweb/components/CardItem/main.js` 中的运行时。
>
> 这是**原始 aScript 实现**的案例研究；通用 Skill 的 inpage/Playwright 运行时不依赖 `webCpu`。
> 它展示了“应用自身暴露了全局对象时，用 `eval` 调用页面方法”的写法，见 `examples/transweb-init.flow.json`。

## 1. 一句话总览

`initAdmin.html` 本身**没有任何业务 UI**，它只做三件事：设置标题、加载 i18n、把 `admin.html?aScript=initAdmin.js` 装进全屏 iframe。真正的自动化发生在 iframe 里：`webCpu` 加载脚本 → 按 `timeEvents` 自动登录管理员 → 打开“加载脚本”弹窗 → 写入 Agent 脚本 → 保存发布目录 → 跳到 `clone.html?aScript=initTools.js` 继续批量克隆 15 个公共工具。

```
initAdmin.html (iframe 包装)
  └─ iframe: /admin.html?aScript=assets/animationScripts/initAdmin.js&lang=zh
       ├─ /index.js           → webCpu 运行时，读取 aScript
       ├─ initAdmin.js        → JSONP 自调用 transweb_events({timeEvents})
       └─ 页面本体           → webCpu.updateView(body, personalInfo.js)
             │
             ├─ 3s  自动登录（loginRegCard.task.confirmCallback）
             ├─ 4s  未登录则 location.reload()（用刷新提交登录态）
             ├─ 5s  personalInfoCard.task.loadAgentScript() 打开弹窗
             ├─ 6s  设置 loadScriptCard.vueItem.type / valueMap
             ├─ 7s  点击 .loadScriptBtn
             └─ 10s _confirmLoadScript(cb) → setAppConfig(publishInfo.folderName)
                       └─ location.href = /clone.html?aScript=assets/animationScripts/initTools.js
                            └─ initTools.js：index=0..14，逐个 manifest → clone → setAppConfig
```

## 2. `initAdmin.html`（包装页）

| 行 | 内容 | 作用 / 问题 |
| --- | --- | --- |
| 5-9 | viewport、no-cache | 防止初始化页被缓存；`user-scalable=no` 影响可访问性 |
| 10-12 | title / robots / description | `noindex, nofollow`，但仍需上线前删除 |
| 180-187 | `window.__PAGE_TITLE__` + `/i18n/loader.js` | loader 同步设置 `window.lang`、`window.__APP_LANG__` |
| 189-218 | Tailwind CDN + `tw-` 前缀配置 | 当前页面完全没用到；可删，减少外网依赖 |
| 221-225 | 只有一个 `<iframe id="adminFrame">` | 无 `title` 属性；无加载失败兜底 |
| 227-236 | 读取 `__APP_LANG__ || lang || "zh"`，拼 `aScript` 与 `lang` | 相对路径 `assets/...` 以页面 origin 解析 |

要点：

- 包装页的 URL 是稳定的对外入口；目标页换版本、换路由都不影响入口。
- 它不加载 `/index.js`，所以**包装页自身不能执行 aScript**；脚本在 iframe 内部运行。
- 大量 CSS（`.contentItemArea`、`.bottomInfo`、`.agentMenuArea`、`.waiting`、`__export-mask` 等）是从模板复制的死代码，与当前页面无关。生成新页面时只保留 iframe 铺满所需样式。
- 没有 `sandbox` 属性、没有 iframe `title`、没有加载超时提示；这些是模板可以顺手改进的点。

## 3. `initAdmin.js`（脚本）

逐段：

```js
localStorage.clear();                       // 清空登录态/语言/草稿，强制走首次初始化
let isLogined = false;
let agentScriptUrl = "/webApps/document/agentList/TransWeb.agentScript.js";
let nextStepUrl = "/clone.html?aScript=assets/animationScripts/initTools.js";
```

```js
{ offset: 3, callback: ... }   // 有 loginRegCard → confirmCallback({account,checkNumber}) 自动登录
                               // 没有该卡片 → isLogined = true（说明已登录）
{ offset: 4, callback: ... }   // if (!isLogined) location.reload();
```

这里的逻辑值得注意：

- `isLogined` **只在“没有登录卡片”时被置 true**。触发了自动登录后它仍是 false，所以 4s 时一定会刷新一次。
- 刷新的真实用途是“让服务端 session 生效并重新渲染页面”。刷新后若已登录，登录卡片不再出现，`isLogined` 才为 true，流程继续。
- 如果登录请求慢于 1s，会进入“登录未完成就刷新”的循环；脚本每次重载都从 0s 重新开始。**这是该脚本最大的脆弱点。**
- 账号与密码以明文硬编码在脚本里（仅本地初始化用途，具体值见源码，不要复制到文档/示例）。生产环境绝不能保留。

```js
{ offset: 5, callback: ... }   // personalInfoCard.task.loadAgentScript()
{ offset: 6, callback: ... }   // loadScriptCard.vueItem.type = "webScript"
                               // valueMap["webScript"] = agentScriptUrl
{ offset: 7, event: { object: [".loadScriptBtn", 1], type: "click" } }
```

- 第 5 步没有判空：`personalInfoCard` 未渲染时会抛错。运行时在 `triggerTimeEvent` 里 `try/catch` 后**继续下一步**，所以表现是“静默跳过”，不是中断。
- 第 6 步依赖第 5 步已经打开弹窗并注册 `loadScriptCard`；同样没有判空。
- 第 7 步点击后，`loadScriptCard` 内部会异步解析脚本内容；但第 10 步之前有 3 秒缓冲，属于“用固定延时等异步”。

```js
{ offset: 10, callback: ... }  // _confirmLoadScript(cb)
    cb:
      webCpu.CardItem.dismissMask(webCpu.cards.personalInfoCard);
      let folderName = localStorage.folderName;
      // 优先用 aboutInfoCard.task.vueItem.info.folderName
      aigcInterface.adapter.setAppConfig({
        docName: "publishInfo.folderName",
        documentId: folderName + ""
      }, tData => { location.href = nextStepUrl; });
```

- `_confirmLoadScript` 是 `loadAgentScript.vue` 的内部方法；它跳过二次确认，直接 `updateLoginInfo` 写入 agentList。
- 回调里先关遮罩、再取 `folderName`（localStorage 兜底，about 卡片优先）、再写服务端配置，**最后才跳转**。顺序是对的：配置没写成功就不应该进入下一步。
- `setAppConfig` 是回调式，跳转放在回调里；如果写成同步跳转，配置大概率丢。

## 4. `initTools.js`（链式批量）

```js
let tools = ["adminPoints", "characterProfile", ..., "vueCodeEditor"]; // 15 个
let index = Number(WebTool.urlQuery(location.href, "index")) || 0;
let toolName = tools[index] || "adminPoints";
let jsonPath = `/bucket/publicApps/${tools[index]}/manifest.json`;
```

```js
{ offset: 1, callback }  // cloneAppItem.task.vueItem.manifestUrl = jsonPath
{ offset: 2, event }     // 点击 .manifestFetchBtn
{ offset: 4, event }     // 点击 .confirmCloneBtn
{ offset: 8, callback }  // 读 currentAppUrl → 取 id → setAppConfig({docName: keyMap[toolName]||toolName, documentId:id})
                         // 若还有下一个：location.href = pathname?aScript=...&index=index+1
                         // 最后一个：$message 成功提示
```

- `keyMap` 把 4 个工具映射到 `aigcAppFlow.requirement / contentQuality / pageTemplate / improveTemplate`；其余工具直接用工具名作为配置键。
- 链式契约：下一页必须还是 `clone.html`（能加载 `cloneAppItem`），并且 URL 必须带上同一个 `aScript` 和自增的 `index`。
- 同样全是固定延时（1/2/4/8s），且 `cloneAppItem` 未就绪、`currentAppUrl` 为空时没有兜底；`documentId` 可能是 `null`。
- 结束条件靠 `index + 1 < tools.length`，没有“已完成”持久化；刷新会从 URL 的 index 继续，但如果手动打开无 index 的 `clone.html`，会从 0 重新开始。

## 5. `admin.html` 与 `clone.html`（目标页）

### admin.html

- 加载 `/index.js`，`DOMContentLoaded` 后 `aigcInterface.init()`，再 `webCpu.updateView(document.body, { url: "/mainApp/app/personalInfo.js", key: "transweb_personalInfo" })`。
- 这是一个**通用容器页**：页面内容完全由 `personalInfo.js` 决定；`admin.html` 自己只提供 TDK。
- 现有 TDK 有冲突：第 10 行 `noindex, nofollow`，第 16 行又写 `index, follow`；canonical 指向 `skill.html`。复制模板时不要沿用这个错误。

### clone.html

- 多一行 `admin/getAppConfig?callback=webCpu.appConfigCallback`，用 JSONP 预先拉取应用配置。
- 渲染 `/webApps/document/cloneAppItem.vue`，`cardName: "cloneAppItem"`，所以脚本能拿到 `webCpu.cards.cloneAppItem`。
- 这是“**直接页**”模式的样板：页面同时承担渲染与自动化，不需要 iframe 包装。

## 6. 运行时关键实现（为什么要这样写脚本）

| 能力 | 位置 | 结论 |
| --- | --- | --- |
| 读取 `aScript` 并执行 | `webCpu.js:8568-8577, 10769` | 只有加载运行时的页面才支持 |
| JSONP 脚本加载 | `webCpu.js:36-75` | 脚本文件必须自己调用全局回调 |
| 时间轴 | `CardItem/main.js:1740-2274` | offset 是绝对秒；condition 无限重试；动作同步 |
| 动作优先级 | `CardItem/main.js:1530-1560` | callback > animation > event，多写会静默忽略 |
| 元素解析 | `CardItem/main.js:1303-1337` | `[selector, 1-based index]`，先容器后全局 |
| 输入阻塞 | `CardItem/main.js:1721-1738` | 只有 inputText 会等输入完成 |
| 完成回调 | `CardItem/main.js:2123-2151` | 结果面板 + 父窗口 postMessage |
| 终止 | `CardItem/main.js:2078-2082` | `window._timeFlow.stop()` |
| postMessage 接收 | `webCpu.js:10810-10830` | 校验 origin，只认同源/白名单 |
| 录制器 | `webCpu.js:8590-8870` | 生成可 JSON 化的 event 列表 + 播放器 |

## 7. 这套模式的优点与代价

**优点**

- 不改目标页业务代码，自动化是“外挂脚本”。
- 脚本是静态文件，可 review、可 diff、可回滚（删掉 `?aScript` 即停用）。
- 运行时自带进度横幅、暂停/终止、完成结果面板。
- 录制器可以快速得到初版，再逐步加固。

**代价 / 风险**

1. **时间驱动**：固定 offset 在慢网/慢机器上必然不稳。必须把“等结果”改成 `condition`。
2. **无隔离**：脚本与页面同上下文，能读写一切；`aScript` 是安全敏感入口。
3. **无事务**：失败不会回滚已写入的配置/已克隆的数据；需要幂等设计或补偿步骤。
4. **静默失败**：元素找不到只 `console.warn`；回调抛错被吞。必须自己加 guard 和可见提示。
5. **链式状态在 URL**：丢参数/刷新会从头开始；要显式持久化进度。
6. **页面耦合**：依赖 `cardName`、`vueItem` 方法、DOM 类名；目标页重构会悄悄破坏脚本。

## 8. 安全与发布

- `initAdmin.js` 里是明文默认管理员凭据；仓库提交 `55b7e00` 已明确“对外发布前删除 `admin.html` / `initAdmin.html`”。
- `static/robots.txt` 对 `/admin.html`、`/initAdmin.html`、`/initialize.html`、`/proxy.html` 做了 Disallow；但 `Disallow` 只防收录，不防访问，**删除或加鉴权才是根治**。
- `localStorage.clear()` 会清掉用户登录态与语言；只允许在“首次初始化”页面使用。
- `?aScript=` 可加载同源任意 JS；不要把它接到用户可控的输入上。
- 生成的新页面应默认 `noindex, nofollow`，并在页面顶部注释“内部页面，上线前删除”。

## 9. 如果要改造这套流程

优先级从高到低：

1. 用 `condition` 替换 3/4/5/6/7/10s 这类固定等待；至少替换登录、弹窗注册、克隆完成三处。
2. 给每个 `webCpu.cards.*` 访问加 `cardReady` 判断；失败时提示并 `window._timeFlow.stop()`，而不是静默继续。
3. 用 `sessionStorage`/URL 记录 `index` 与尝试次数，防刷新死循环。
4. 把明文凭据改为构建期注入的占位符；生产包中剔除 init 页面。
5. 用 `validate.mjs` 把上述规则变成 CI 检查，防止后续改动退化。


## 10. 映射到通用 flow spec

原始 aScript 的 `timeEvents` 与通用 spec 的对应关系：

| 原始写法 | 通用 spec |
| --- | --- |
| `timeEvents[].offset` | 步骤顺序 + `waitFor`；不再依赖绝对秒数 |
| `callback` 里调用 `webCpu.cards.*` | `eval`（从 `ctx.win` 取页面全局） |
| `event: { object, type: "click" }` | `click` + `selector` |
| `event: { object, type: "inputText", text }` | `fill` + `value` |
| `location.href = next` | `goto` 或 `eval` 里跳转 |
| 固定 3/4/5/6/7/10s | `waitFor` selector / text / url + `timeout` |
| `location.reload()` 重试 | 显式 `retry` + 断言；不要靠刷新 |

生成 inpage 案例：

```bash
node docs/skills/web-automation-page/scripts/generate.mjs \
  docs/skills/web-automation-page/examples/transweb-init.flow.json \
  --out static/auto --mode inpage
```

生成的 `transwebInitCase.html` 与原始 `initAdmin.html` 的差异：

- 不依赖 `/index.js` 的 aScript 机制，而是内联通用 runtime；
- 登录/弹窗/确认用 `eval` 调页面自身方法，`waitFor` 等状态；
- 步骤失败会停在原地并显示错误，不会静默继续；
- secrets 由运行时弹窗输入，不写进文件；
- 仍受同源限制：只能放在与 `admin.html` 同源的路径下。

> 原始 `initAdmin.js` 的固定延时、reload 重试、明文凭据、无判空等问题，在通用版里都应被替换；不要直接复用到生产。
