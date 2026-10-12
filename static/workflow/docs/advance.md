# 🛠️ 二次开发进阶

本技术文档面向已掌握该组件基本配置（如更换默认 Skill 列表、修改 UI 样式）的进阶开发者。文档将深度剖析核心架构，并指导如何在不破坏系统稳定性的前提下，进行跨域数据通信扩展、流程控制链改造及多前端脚手架适配。

---

## 一、 核心架构与核心数据流向

理解数据和状态在组件、父页面、以及 Iframe 内部 Skill 之间的流转，是进行二次开发的前提。

### 1.1 数据结构定义

组件通过三大核心响应式数据来控制工作流状态：

* **`apps`**: 可选的 Skill 资产元数据池。
* **`accountData.workflow`**: 当前编排的线性工作流节点 ID 队列（例如：`[Skill_A_ID, Skill_B_ID]`）。
* **`stepData`**: 运行时的步骤实例状态数组。动态追加首尾，其内部结构为：

```javascript
{
  appId: "...",            // 当前步骤绑定的 Skill ID
  currentNodeUrl: "...",    // 该步骤的初始加载 URL（带 workflow 全路径参数）
  resultUrl: "..."         // 当前步骤完成后，捕获到的产出/结果 URL
}
```
---

### 1.2 核心数据流（Data Flow）拓扑图

```text
[ 用户编排 / 选择 Skill ]
          │
          ▼ 触发 Watcher
   [ initStepData() ] ───────► 生成运行时队列 stepData (首项为 appId, 尾随 workflow 节点)
          │
          ▼ 驱动
   [渲染 <el-steps> & <iframe> ]
          │
      ┌───┴────────────────────────────────────────┐
      ▼ (同域情况)                                  ▼ (跨域情况)
  iframe.onload 监听                            window.addEventListener('message')
      │                                            │
      └───────────────────► [ checkUrl(url) ] ◄────┘
                                   │
                                   ▼ 解析 URL 参数 (dataId / inputItem)
                        [ 填充当前步的 resultUrl ]
                                   │
                                   ▼ 激活下游
                       [ 驱动下一步 continueWorkflow() ]
```

---

## 二、 高级核心机制：跨域与状态监听（Iframe Monitor）

组件通过 `initIframeMonitor` 方法实现对嵌入 Skill 状态的捕获。这也是二开最常需要定制的模块。

### 2.1 跨域通信协议标准

当工作流内嵌的 Skill 页面与主站非同源（即 `location.origin !== webCpu.documentPrefix`）时，组件强制进入 **HTML5 postMessage 监听模式**。

二开扩展或对接第三方 Skill 平台时，**第三方 Skill 页面在完成任务（如生成报告、跑完数据）后，必须向父窗口投递如下格式的 Payload**：

```javascript
window.parent.postMessage({
  type: "IFRAME_URL_CHANGE",
  url: "https://www.transweb.cn?id=当前SkillID&workflow=A,B,C&dataId=PRODUCED_DATA_XYZ"
}, "*");

```
---

### 2.2 状态链条解析器：`checkUrl` 内部逻辑

在 `checkUrl` 函数中，核心逻辑依赖于以下两个关键参数的互斥与联动：

* `dataId`：代表**当前节点**已经成功产出了数据实体。组件捕获后，会将其赋值给当前步骤的 `resultUrl`，激活 UI 上的“下一步”按钮。
* `inputItem`：代表下游 Skill **已成功接收并载入**了上游的数据。

> ⚠️ **二开避坑指南**：原代码中 `stepIndex = workflow.indexOf(id) + 1` 用于计算当前步骤高亮。若您的业务支持同一个 Skill 在工作流中**重复出现**（例如：`Skill_A -> Skill_B -> Skill_A`），`indexOf(id)` 将永远返回第一个索引，导致高亮错乱。
> **进阶修改建议**：改用精确的 `activeStepIndex` 状态由 Iframe 显式投递，或在 `stepData` 实例化时为每个节点分发唯一的 `instanceId`。

---

## 三、 业务逻辑扩展点（Extension Points）

### 3.1 改造多分支与条件流（Conditional Workflow）

目前组件仅支持**单向线性工作流**（Linear Workflow）。若要扩展为类似“根据 Skill A 的输出结果分流到 Skill B 或 Skill C”的条件分支流：

1. **修改数据结构**：将 `accountData.workflow` 从一维字符串数组更改为图结构或带条件的 Ojbect 数组。

2. **重写** `continueWorkflow()`：

```javascript
continueWorkflow() {
   let currentNode = this.stepData[this.activeStepIndex];
   let params = WebTool.urlQuery(currentNode.resultUrl);

   // 二开扩展：根据当前产出数据特征，动态计算下一个合法的 appId
   let nextAppId = this.calculateNextRoute(params, currentNode); 

   // 动态插入或跳转到目标节点
   // ... 
}
```

---

### 3.2 动态拦截与脚手架 Dialog 扩展

组件依赖全局注入的 `webCpu.renderCardDialog` 方法拉起弹窗。在其他没有 `webCpu` 全局对象的工程（如标准的 Vite + Vue 3 项目）中二次开发时，应将其替换为 **Element Plus 的 `el-dialog**` 或 **自定义轻量级组件**。

**解耦改造示例**：将 `newSkillDialog` 替换为更符合单文件组件（SFC）规范的实现：

```javascript
// 推荐替换方案：弃用外部 webCpu 动态渲染 DOM，使用 Vue 标准的声明式弹窗
<el-dialog v-model="localSkillDialogVisible" title="新增可用 Skill">
   <iframe src="https://transweb.cn?headerHidden=true" ref="newSkillIframe"></iframe>
   <template #footer>
     <el-button @click="confirmAddSkill">确认添加</el-button>
   </template>
</el-dialog>
```

---

## 四、 样式定制与移动端响应式（Tailwind 进阶）

组件深度配合了 Tailwind CSS 与 Element UI 的混合样式。

* **断点响应布局**：组件通过 `this.flag`（检测 `WebTool.adjustSize`）来切换扁平/紧凑布局。
* 当 `flag === true`（通常代表移动端或小窗环境）时，表单父容器自动变为 `tw-flex-col`（纵向排列），且 Select 选择器切换为带边框的 `mobile-select-bordered` 类。
* 当 `flag === false`（PC 端）时，呈现为横向胶囊样式的 `configuration-wrapper`，通过无边框的 `custom-select-no-border` 保持一体化视觉。


* **穿透修改样式**：由于 Element Plus 默认使用 Shadow DOM 或特定的类名隔离，组件在 `<style scoped>` 中大量使用了 `:deep()` 穿透器（例如 `:deep(.el-select__wrapper)`）。二开调整主题色或圆角时，请务必保持穿透器的使用，否则样式无法覆盖。

---

## 五、 平滑升级与高可用合规规范

为了保证后续升级该组件时，您的二次开发代码不被覆盖，请务必遵守以下二开规范：

1. **方法覆写隔离（Method Interceptors）**：
若需在工作流导出（`exportWorkflow`）或重置（`resetWorkflow`）前后增加前置审计或后置数据埋点，不要直接改写原本的函数体，建议采用高阶函数或事件派发（Event Emitting）形式：
```javascript
// 推荐做法：在执行原生逻辑后，向上层父组件派发自定义事件
exportWorkflow() {
  // 原有逻辑...
  WebTool.exportWorkflow(config, (name) => {
    this.$message.success("工作流已导出，文件名: " + name);
    this.$emit('workflow-exported', config); // 预留的扩展钩子
  });
}
```
---

2. **安全性（Security）防范**：
组件中的标题修改使用了 `contenteditable="true"` 特性。在 `handleTitleChange` 中，开发者直接获取了 `elem.innerText` 并赋给 `this.title`。
* **进阶防范**：由于 `innerText` 虽能过滤大部分 HTML 标签，但当数据后续需要落库或展示在其他非 Vue 模板（如原生 `innerHTML` 渲染）的页面时，容易引发 **XSS（跨站脚本攻击）**。
* **防范规范**：在向后端存储 `this.title` 之前，必须调用系统自带的安全过滤组件，或者对文本进行特殊的 HTML 实体转义编码。