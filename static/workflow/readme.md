# Minimalist AI Workflow（极简 AI 工作流）

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

一个基于 [TransWeb 在线 Skill 基座](https://transweb.cn/?appName=appGenerator&agent=4140329349) 与 Node.js 构建的轻量级、无服务器（Serverless）同步 AI Skill 工作流编排程序。

项目通过 **多模态多层级 DataURL 动态注入技术**，将开发态源码（包含关系编辑器与核心视图）一键编译压缩至单文件 HTML 容器中，实现真正的**“零部署、本地即开即用、完全去中心化”**。所有编排逻辑、回溯控制器与人机交互状态完全在本地浏览器运行。

本项目专为 **意图驱动编程（Intent-Driven Programming）** 与 **Vibe Coding / 人机协同（Loop Engineering）** 的独立开发者与极客打造，适用于快速搭建多 Skill 协作任务流，并输出具有高度可移植性、可独立分发的最终交互式网页成果。

> 📌 每个 Skill 均可通过 TransWeb 在线基座，使用自然语言以 Vibe 方式直接创建和维护。基座体验入口：https://transweb.cn/?appName=appGenerator&agent=4140329349

---

## 📖 目录

- [项目特性](#-项目特性)
- [项目文件结构](#-项目文件结构)
- [准备工作](#-准备工作)
- [快速上手](#-快速上手)
- [核心设计原理](#-核心设计原理)
- [常见问题](#-常见问题)
- [贡献指南](#-贡献指南)
- [开源协议](#-开源协议)
- [联系方式](#-联系方式)

---

## 🌟 项目特性

- **🔗 多 Skill 同步串联**：支持多个 AI Skill 节点流水线式无缝交接，前一个 Skill 的输出（DataId / InputItem）自动作为下一个 Skill 的初始输入。
- **👁️ 执行过程透明、可干预**：每个 Skill 节点内嵌于高隔离性的 Iframe 容器中，执行状态、网络日志、URL 变更、数据载荷全程可见，开发者可随时介入修改。
- **🔄 节点级回溯与重触发**：支持在工作流的任意中间节点一键“重新触发”或“状态重置”，无需从头开始，极大提升调试与交互效率。
- **🎛️ 动态自由编排**：允许在界面上动态新增、删除、调换 Skill 节点，随时重新生成步骤流。编排完成后可导出新版工作流 HTML 文件，方便分享或归档。
- **💾 自动持久化运行结果**：工作流执行过程数据及最终产出自动存储在您个人的 TransWeb Skill 基座后台数据库中，可随时登录各 Skill 查看、编辑或导出，数据所有权完全归属您。
- **📦 动态自由命名与零污染母版**：**[New]** 编译时支持通过命令行参数指定输出文件名（自动补全 `.html` 后缀），自动保护 `index.html` 母版不受污染，具备完全的**构建幂等性与多版本并行分发能力**。

---

## 📂 项目文件结构

- **`index.html`（主体容器/母版）**：全自包含的单文件 HTML 容器。作为编译母版，**无需任何 Web 服务器**，直接双击即可在浏览器中独立运行完整工作流。
- **`code.vue`（工作流源码）**：开发态核心业务逻辑组件，包含 UI 视图层、多步骤状态机渲染、重置事件处理，以及底层的 **Iframe 通信监听与关系链链入逻辑**。
- **`relationEditor.vue`（关系编辑器）**：**[New]** 独立的关系链编辑器组件，在构建时会被自动压缩并作为 Base64 缓存流深层注入到 `code.vue` 的配置域中。
- **`config.json`（集群配置文件）**：集中管理 Skill 集群的元数据（如“行业认知”“长文章”“课程课件”等 Skill 的 ID 与标签）以及默认工作流的初始化执行顺序。
- **`build.js`（自动化编译脚本）**：基于 Node.js 原生 API 的高级构建工具，**零 npm 依赖**。支持动态参数解析与严谨级断言校验，一键完成“多层级 Base64 嵌套平替 + 配置级注入”，严防静默失败。

---

## 🧰 准备工作

1. 确保本地已安装 [Node.js](https://nodejs.org/)（推荐 v14.0.0 或更高版本）。
2. 访问 [TransWeb 在线基座](https://transweb.cn/?appName=appGenerator&Skill=4140329349) 并注册/登录。
3. 使用自然语言创建一个或多个 AI Skill，记录下每个 Skill 的唯一 ID（例如 `Skill_id_0`）。  
   *（您可以在 Skill 的编辑页面或地址栏中找到该 ID）*

---

## 🛠️ 快速上手

### 1. 配置工作流

打开 `config.json`，根据您的 Skill 集群定义 `apps`（可选的 Skill 库）和 `accountData`（默认执行的工作流路径）：
```json
{
  "title": "行业认知工作流",
  "apps": [
    { "value": "Skill_id_0", "label": "行业认知" },
    { "value": "Skill_id_1", "label": "长文章" },
    { "value": "Skill_id_2", "label": "课程课件" }
  ],
  "accountData": {
    "appId": "Skill_id_0",
    "workflow": ["Skill_id_1", "Skill_id_2"]
  }
}
```
> ⚠️ *请将示例中的 `Skill_id_*` 替换为您的真实 Skill ID。*

### 2. 一键动态编译

在项目根目录下打开终端，你可以根据分发需求选择以下编译指令：

#### A. 标准构建（默认回退）
```bash
node build.js
```
*将在本地生成或更新默认的 `index.html`。*

#### B. 自定义命名分发（推荐）
```bash
node build.js marketing-workflow
# 或者带后缀名：node build.js marketing-workflow.html
```
*脚本会自动净化非法字符，补全 `.html` 后缀，并将成果输出为 `marketing-workflow.html`，同时不影响你的 `index.html` 母版。*

#### 🔍 编译流水线内幕：
1. **多层级深嵌套平替**：先将 `relationEditor.vue` 编译为 Base64 Data URL 注入到 `code.vue` 的 `relationEditor.url` 中。
2. **顶层容器合成**：将完整的 `code.vue`（含深层嵌套流）整体进行 Base64 编码，精准平替主体容器中的 `app.task.template`。
3. **数据幂等注入**：将 `config.json` 序列化为单行 JSON 字符串，平替容器中的 `app.task.data`。
4. **断言防御校验**：脚本执行全流程断言，一旦缓冲区修改前后未匹配或特征码缺失，将拒绝写入磁盘，防止发生静默失败。

### 3. 运行预览
编译完成后，直接双击打开生成的 HTML 文件（如 `marketing-workflow.html`），或者使用任意静态 Web 插件（如 Live Server）预览即可。

---

## ⚙️ 核心设计原理

### 1. 独立运行与记忆，基座负责时序
工作流程序仅负责任务流的编排配置和执行状态监听。每个 Skill 运行于 TransWeb 基座提供的安全沙盒 Iframe 中，拥有独立的记忆、编辑修改、结果版本管理以及文档导出功能。基座会根据地址栏中的工作流参数，自动将当前 Skill 的执行结果传递给下一个 Skill 节点，确保任务有序进行。

### 2. 最终成果的“可交互性”
本项目的核心价值在于，工作流所生成的**输出结果（即最终的网页产物）是完全具备交互属性的**。用户拿到这个独立的 HTML 后，可以直接在浏览器内实现节点回溯、重新触发和动态修改，而非死板的静态报告。

### 3. 双域兼容的 Iframe 状态监听器
`code.vue` 中内建了一套高兼容性的生命周期钩子，用于实时捕获 Skill 所在 Iframe 的 URL 变动及数据载荷：
- **同域环境**：直接监听 `iframe.contentWindow.location.href`。
- **跨域环境**：安全监听跨域消息总线 `window.addEventListener('message', ...)`，当收到 `IFRAME_URL_CHANGE` 事件时，工作流自动更新状态机。

---

## ❓ 常见问题

**Q: 我的数据会被上传到哪里？安全性如何？**
> **A:** 所有工作流编排与界面逻辑完全运行在您的本地浏览器中，不会上传至任何第三方服务器。Skill 的执行与结果存储由 TransWeb 基座提供，数据加密存储在您个人的 TransWeb 账户下。真正做到逻辑本地化，数据私有化。

**Q: 为什么我在 `config.json` 中填入 Skill ID 后工作流无法正常加载？**
> **A:** 请依次确认：
> 1. 确认该 Skill ID 已在 TransWeb 平台正确创建，且您在当前浏览器已登录该基座账户。
> 2. `build.js` 执行时未报出 `❌ [Error]`，且对应的目标 HTML 文件已成功生成。
> 3. 检查网络状态是否正常，如果启用了某些代理或 VPN，可尝试暂时退出。

**Q: 支持哪些浏览器？**
> **A:** 推荐使用 Chrome、Edge、Safari、Firefox 等现代浏览器。请确保浏览器未禁用 Iframe 的跨域通信权限及弹出窗口。

---

## 🤝 贡献指南

欢迎任何关于 AI Skill 编排、Vibe Coding 实践、轻量化前端架构的 Issue 与 Pull Request！
如有功能建议或 BUG 反馈，请通过 GitHub Issue 模板提交，我们会高效跟进。

---

## 📝 开源协议

本项目基于 **MIT License** 开源，您可以自由使用、修改和分发，但需保留原始版权声明。

---

## 📮 联系方式

- **项目地址**：[https://github.com/liuwenjin/trans-workflow](https://github.com/liuwenjin/trans-workflow)
- **问题反馈**：[Issues 页面](https://github.com/liuwenjin/trans-workflow/issues)
- **站长邮箱**：[neilking@163.com](mailto:neilking@163.com)