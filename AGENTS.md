# 项目协作规则（AI 智能体必须遵守）

## 样式修改规则

- 润色项目中的 Vue 组件、修改组件样式时，**禁止使用 `:deep`（`:deep()` / `::v-deep` / `>>>` / `/deep/`）深度选择器**。
- 需要覆盖子组件或第三方组件样式时，优先通过组件对外暴露的 props / class / 插槽等常规方式处理，而不是使用深度选择器。
- 该规则自始至终有效，适用于所有 Vue 组件的样式润色与修改工作。

## 当前样式结构（2026-11-20 手动调整后）

- **公共样式**：`static/common/site.css`，四个页面共用。原 `common/govuk.css`、`common/hara-site.css`、`common/on-staff.css` 已合并进该文件并删除，不要重新引用或恢复这三份文件。
- **Agent / Skill 广场**：`static/common/hub.css`，agentHub.html 与 skillHub.html 共用。
- **工作流页**：`static/common/workflow.css`。
- **首页专属**：`static/index.html` 内联样式，其中 `#onStaffSkin` 是首页最后加载的皮肤层。
- **页眉尺寸**：桌面 72px；Agent / Skill 广场与工作流页移动端 64px（`hub.css` / `workflow.css` 中的 `html:root body.hara` 覆盖），首页移动端仍为 56px；语言切换 40×40；页眉主按钮（`.hub-btn` / `.wf-btn`）与登录区 `#loginMenuItem` 均为 40px 高；首页主 CTA `.hero-cta` 52px；工作流二级导航 `.wf-subnav` 40px。
- **登录组件**：`static/components/loginBar.vue` 的「ON STAFF · 登录条与用户浮窗」层负责登录区外观（朱砂 `#c33a1e`、40px、直角）。浮窗为纸片卡：`#fcfaf3` 底、`#ded7c7` 细线、2px 朱砂顶线、无圆角；外壳与移动端定位放在文件末尾的非 scoped 规则中（Element 可能把 popper 挂到 body 下）。`site.css` 已不再声明 `#loginMenuItem .login-main-btn` / `.user-trigger-btn` 的背景、描边与字号，避免 ID 优先级压过组件样式。
- 页面只应引用 `site.css` + 对应页面样式；新增公共规则放 `site.css`，不要写回各页内联块。
- **移动端筛选**：Agent / Skill 广场的 `#mobile-categories` 已从 `hub-aside` 移到 `hub-main` 内、搜索框上方；移动端 `.hub-aside` 隐藏。`#mobile-categories` 在桌面端仍隐藏，左侧 `#pc-categories` 不变。
- **首页常见疑问**：问题列表为卡片式（参考 workflow.html 的 FAQ）：隐藏编号与 +/−，右侧 chevron；卡片 `#f5f1e6`、1px `var(--line)`、24px 内边距、16px 间距；问题与答案 16px（移动端 15px）。相关规则在 `index.html` 的 `#onStaffSkin` 内，`site.css` 不再保留 `.faq-*` 卡片样式。
