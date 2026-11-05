# 院系文档权限与审批 OA · 三角色交互演示

三个**独立 Vue 3 单文件组件**，分别对应普通用户、审批人、文档管理员。组件使用 Tailwind 样式、内置演示数据，可在无后端环境下完整走查 PRD 中的核心用例。

![三角色演示](preview.png)

## 快速开始

在项目根目录启动服务（`static/` 为站点根目录）：

```bash
node webServer.js
# 或仅演示前端：
python3 -m http.server 8765 --directory static
```

访问：

- 入口（带角色切换）：`http://localhost/oa-demo/index.html`
- 普通用户：`/oa-demo/index.html#staff`
- 审批人：`/oa-demo/index.html#approver`
- 文档管理员：`/oa-demo/index.html#docadmin`

> 页面通过 HTTP 访问；`file://` 方式无法 fetch `.vue` 组件。

## 文件结构

```
static/oa-demo/
├── index.html                     # 演示壳：角色切换、演示场景、全局提示/确认
├── app.js                         # 壳应用：12 个跨角色演示场景
├── loader.js                      # 轻量 SFC 加载器（fetch .vue → Vue 运行时编译）
├── store.js                       # 共享 mock 数据与业务动作（localStorage 持久化）
├── icons.js                       # oa-icon 图标组件（线性 SVG）
└── components/
    ├── StaffPanel.vue             # 普通用户（独立组件）
    ├── ApproverPanel.vue          # 审批人（独立组件）
    └── DocAdminPanel.vue          # 文档管理员（独立组件）
```

## 三个组件的能力

| 组件 | 角色 | 覆盖能力 |
| --- | --- | --- |
| `StaffPanel.vue` | 李知远 · 讲师 | 工作台、文档检索与预览、水印下载、上传文档、提交归档、发起审批、撤回与催办、权限申请、到期提醒、通知 |
| `ApproverPanel.vue` | 王慧敏 / 赵启明 | 待办 / 已办、审批详情、同意、退回、驳回、转办、加签、催办、审批记录、审批单打印导出、统计 |
| `DocAdminPanel.vue` | 陈静 · 文档管理员 | 文档库、批量归档/授权/删除、版本上传与回滚、归档/取消归档、分类管理、授权台账、到期预警、回收站、审批记录、统计 |

三个组件均以 `props.store` 接收共享数据源；不传时可由宿主自行创建（见下文「组件接入」）。

## 12 个演示场景

进入页面后点击右上角 **「演示场景」**，会**自动切换角色并打开对应页面/弹窗**，按以下顺序走查即可覆盖主链路：

| # | 场景 | 角色 | 对应用例 |
| --- | --- | --- | --- |
| 1 | 上传文档并提交归档 | 普通用户 | UC-004 |
| 2 | 处理归档审批（同意 → 流转终审） | 审批人 | UC-013 |
| 3 | 退回、驳回与加签 | 审批人 | UC-008 / UC-014 |
| 4 | 敏感文档下载审批 | 普通用户 | UC-023 |
| 5 | 申请文档权限 | 普通用户 | UC-010 |
| 6 | 文档授权与权限台账 | 文档管理员 | UC-008 / UC-009 |
| 7 | 版本更新与回滚 | 文档管理员 | UC-006 |
| 8 | 回收站恢复与清理 | 文档管理员 | UC-018 |
| 9 | 批量归档与批量授权 | 文档管理员 | UC-019 |
| 10 | 撤回与催办 | 普通用户 | UC-014 |
| 11 | 转办与加签 | 审批人 | UC-014 |
| 12 | 跨部门共享审批 | 文档管理员 | UC-030 |

### 建议演示路径（跨角色闭环）

1. **普通用户** → 我的文档 → 对《教职工年度考核办法（征求意见稿）》点「提交归档」→「提交审批」。
2. **审批人**（王慧敏）→ 待办中出现《教职工年度考核办法》→ 同意 → 流程流转至赵启明。
3. 审批人左上角切换为 **赵启明** → 继续同意 → 普通用户「我的文档」中该文档变为 **已归档**。
4. **普通用户** → 文档中心 → 打开《学科建设专项材料》（敏感）→「申请下载」→ 填写用途提交。
5. **审批人** → 同意 → 普通用户在「权限申请」中看到 **24 小时 / 1 次** 下载授权；回到文档可下载（生成带水印的演示文件）。
6. **文档管理员** → 授权台账 → 新增授权：选择敏感文档或跨部门 → 提交后进入审批，审批人待办同步增加。
7. 演示结束可在「演示场景」底部或右上角刷新按钮 **重置数据**。

## 用例覆盖

- 已覆盖：UC-001（登录态展示）、003、004、005、006、007、008、009、010、012、013、014、015、018、019、020、021、023、030。
- 未覆盖：UC-002、011、016、017、022、024、025、026、027、028、029 —— 属于系统管理员 / 审计员 / 运维职责，不在本次三个角色组件范围内。

## 数据如何流转（store.js）

共享 mock store 是三个组件联动的关键：

```
普通用户上传 → DRAFT
提交归档      → 生成 DOC_ARCHIVE 实例（院办初审 → 分管领导终审），文档 SUBMITTED
审批人同意     → 节点通过；全部通过后文档 ACTIVE，发起人收到通知
退回 / 驳回    → 文档 RETURNED / DRAFT，发起人可修改重提或重新发起
敏感下载申请   → 生成 SENSITIVE_DOWNLOAD 实例；通过后写入 24h / 1 次临时授权
文档管理员授权 → 敏感 / 跨部门 / 期限 > 90 天 → 生成 PERM_GRANT 实例；否则立即生效
```

实现要点：

- 数据保存在 `localStorage`（key：`oa-demo-state-v3`），刷新不丢失；重置按钮清除。
- 所有动作都会同步更新文档状态、审批实例、授权、通知与文档时间线。
- 演示下载会生成一个带水印信息的 `.txt` 文件，便于展示「下载留痕」。
- 审批单「打印 / 导出 PDF」调用浏览器打印，可用于演示打印版式。

## 组件接入说明

### 依赖

- Vue 3 全局构建（含运行时模板编译器）：`/transweb/components/ElementVueItem/vue.global.js`
- Tailwind：演示页通过 `/common/tailwindcss.js`（本地 Play CDN）加载，配置 `prefix: "tw-"`，组件内所有工具类均为 `tw-` 前缀。
- 全局图标组件 `oa-icon`：由 `icons.js` 注册（`app.component("oa-icon", OaIcon)`）。

### 单独使用

```js
import StaffPanel from "./components/StaffPanel.vue"; // 需 Vue SFC 编译环境
// 或者沿用本目录 loader：
const options = await OaDemo.load("/oa-demo/components/StaffPanel.vue");
app.component("StaffPanel", options);
app.component("oa-icon", window.OaIcon);

const store = OaDemo.createStore();
// 模板中使用：<StaffPanel :store="store" />
```

组件契约：

| 项目 | 说明 |
| --- | --- |
| props | `store`（必填）：由 `OaDemo.createStore()` 创建，或替换为真实接口适配层 |
| 事件 | 无向外事件；所有交互写入 store，宿主可通过 store 状态联动 |
| 样式 | 组件内 `<style>` 仅包含少量 hover / 弹层 / 水印 / 打印样式，不与 Tailwind 工具类冲突 |
| 响应式 | 面向 1280px 及以上桌面端设计；窄屏下内容可横向滚动 |

### 替换为真实接口

`store.js` 的 `api` 对象集中了全部业务动作（`uploadDoc`、`submitArchive`、`handleTask`、`createGrant`、`requestPermission` 等）。接入后端时，只需把这些方法替换为 `/oa/...` 接口调用，并保持返回结构一致，三个组件无需修改。

## 样式说明

- 项目既有编译版 Tailwind 使用 `tw-` 前缀且缺少 `hover:` 变体，因此演示页改用本地 Play CDN（`static/common/tailwindcss.js`）+ `prefix: "tw-"`，既保持前缀约定，又能使用 hover / focus / 任意值等能力。
- 生产环境建议改为 Tailwind CLI/PostCSS 预编译（保留 `prefix: "tw-"`），移除 Play CDN。
- 遵循 `AGENTS.md`：组件样式中**未使用** `:deep()`、`::v-deep`、`>>>`、`/deep/` 深度选择器。

## 已知限制

- 纯前端演示，不连接真实数据库与统一身份认证；登录态为页面内模拟。
- 文档预览为版式模拟，上传不会真正解析文件；下载生成演示文本文件。
- 审批时限、统计图表使用演示数据；接入后端后由接口返回真实值。
- 附件预览、导出 PDF 为前端模拟；生产环境由服务端生成。
