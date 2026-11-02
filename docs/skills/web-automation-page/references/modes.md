# 后端选型与边界

同一份 flow spec 可以编译成不同后端。选错后端的典型后果：inpage 打开一片空白、跨域读不到 DOM、登录态丢了、iframe 被站点拒绝。

## 1. 一张表

| 能力 | inpage（承载页） | Playwright（Node） | 用户脚本 / 扩展 |
| --- | --- | --- | --- |
| 同源页面 | ✅ | ✅ | ✅ |
| 跨域页面 | ❌（同源策略） | ✅ | ✅（需授权/安装） |
| 多标签页 | ❌（只在 iframe 内导航） | ✅ | 视实现 |
| 复用用户已登录的浏览器 | ✅（同源） | ❌（默认全新 profile） | ✅ |
| 文件上传 / 截图 / 视频 / trace | ❌（截图/上传不支持） | ✅ | 部分 |
| 安装成本 | 无（打开 HTML） | Node + Playwright + 浏览器 | 安装扩展/脚本 |
| 适合 | 内部同源系统初始化、演示 | 任意站点、CI、跨域、稳定复跑 | 个人在已登录页面上临时用 |

## 2. inpage 的硬边界

### 2.1 同源

浏览器只允许父页面访问**同源** iframe 的 `contentDocument`。因此：

- `https://app.example.com/auto.html` 里的 iframe 可以驱动 `https://app.example.com/login`；
- 不能驱动 `https://admin.example.com/`、`https://third-party.com/`；
- 也不能靠 `postMessage` 让目标页“自己操作自己”——目标页没有安装运行时，不会执行你的步骤。

生成器/校验器会尽量拦截跨域 inpage；运行时也会在 `contentDocument` 为空时明确报“跨域，请用 Playwright”。

### 2.2 被 iframe 拒绝

即使同源，目标页仍可能禁止被嵌入：

- 响应头 `X-Frame-Options: DENY / SAMEORIGIN`；
- CSP `frame-ancestors 'none'`；
- 目标页自身的 JS 检测 `window.top !== window` 后跳走。

现象：iframe 空白或跳到登录/错误页。处理：

1. 改用 **Playwright**（不受 iframe 限制，推荐）；
2. 或手工改造目标站：把 `runtime.js` 内联进目标页，用 `AutoFlow.createEngine({ getDoc: () => document, getWin: () => window, ... })` 直接驱动当前页（本 Skill 不自动生成这种“直接页”，因为要改目标站源码）。

### 2.3 Cookie / SameSite

inpage 使用用户浏览器里的 Cookie，通常已登录；但如果目标站 Cookie 是 `SameSite=Strict` 且承载页与目标页不完全同站，仍可能丢登录态。同源部署最稳。

### 2.4 同源多页

同源 iframe 内的导航（点击链接、`goto`）不会销毁承载页；引擎在下一步继续轮询新文档即可。限制：

- `target=_blank` 打开的新标签页无法接管；
- 跨域跳转后无法继续；
- `beforeunload` 确认框需要人工处理。

## 3. Playwright 的边界与优势

### 3.1 默认全新会话

`chromium.launch()` + `newContext()` 不共享你日常浏览器的 Cookie。所以：

- 每次运行都要在流程里登录；或
- 手动登录一次，导出 `storageState`，在 runner 里复用（需要小改 runner：`browser.newContext({ storageState: "state.json" })`）；
- 对于 SSO/2FA，推荐“人工登录一次 + storageState 复用”。

生成器目前不自动管理 storageState；这是有意的：避免把登录态文件误提交。

### 3.2 多页/多标签

`pages` + 步骤上的 `"page": "admin"` 会在同一 `context` 里新建标签页，共享 Cookie/Storage。适合：

- A 站登录后到 B 站管理后台；
- 同时对照两个页面；
- 打开新窗口后继续操作。

### 3.3 能力上限

Playwright 能做但 spec 未直接暴露的：网络拦截/ mock、下载、PDF、权限（摄像头/剪贴板）、多浏览器（Firefox/WebKit）、并发。需要时在生成的 runner 上扩展，或单独写 Playwright 脚本。

## 4. 什么时候用用户脚本 / 扩展

仅当：

- 只能在你**已登录的真实浏览器**里跑；
- 目标站跨域且你不想装 Node/Playwright；
- 流程短、一次性。

代价：安装/权限提示、站点改版易碎、难以在 CI 复跑。本 Skill 不生成扩展；需要时建议用 Tampermonkey 用户脚本，把同一份步骤翻译成 DOM 操作即可。

## 5. 验证码 / 2FA / 风控

- **不要**尝试绕过验证码或风控。
- 可选方案：
  1. 人工完成验证码后再继续（inpage 的“暂停/继续”或 Playwright `--headed` + 手动操作，但这会脱离自动流程）；
  2. 用 storageState 复用已通过验证的会话；
  3. 改用官方 API / 测试账号 / 沙箱环境；
  4. 接受失败并输出可诊断日志。

生成器会在 `inspect` 报告里提示密码框/验证码，但不会替你处理。

## 6. 选型清单

1. 目标是否与承载页同源、且允许 iframe？→ 是：inpage。
2. 是否跨域、多标签、要上传/截图/视频/CI？→ 是：Playwright。
3. 是否只能复用本机已登录浏览器、且不装 Node？→ 用户脚本/扩展（手工）。
4. 是否遇到 `X-Frame-Options`/CSP？→ 直接页或 Playwright。
5. 是否有验证码/2FA？→ 先设计人工兜底，再决定自动化范围。
