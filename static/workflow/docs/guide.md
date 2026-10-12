# 工作流构建指南

欢迎使用 **Trans-Workflow**。本平台基于统一的工作流模板，支持通过灵活调整 Skill 节点来快速构建并导出全新的定制化工作流。

本教程将在 **10 分钟**内，带你完整体验 AI 工作流构建的核心流程。

> 💡 **核心概念与持久化机制：**
> * **工作流参数**：在 Web 端配置的工作流参数为内存实时状态，**只有在执行“下载导出”后，才会持久化保存至本地**。
> * **Skill 应用**：每个新创建的 Skill 应用均会自动持久化保存于 Skill 基座系统的后台数据库中。
> * **Skill 基座访问地址**：[skill.transweb.cn](https://skill.transweb.cn)
> 
> 

---

## 1. 准备/创建可选 Skill 应用节点

在构建工作流之前，需要先将所需的 Skill 应用加入到当前项目的**可选 Skill 列表**中。打开 Skill 工作流界面（[transweb.cn/workflow](https://transweb.cn/workflow)）后的操作步骤如下。

### 操作步骤：

1. **打开配置窗口**：点击界面右上角的 **“新增”** 按钮，唤起 *“新增可用 Skill”* 对话框。
![唤起新增对话框](https://transweb.cn/workflow/docs/images/guide001.png "唤起新增对话框")
![AI 智能生成](https://transweb.cn/workflow/docs/images/guide002.png "AI 智能生成")
2. **添加 Skill 应用**（提供以下两种方式）：
* **方式 A（AI 智能生成）**：在对话框上方的输入框中，输入具体的 **Skill 需求描述**，点击 **“开始生成”**。等待 1~3 分钟，待应用生成完毕后，点击 **“确认添加”**。
![AI 智能生成等待中](https://transweb.cn/workflow/docs/images/guide003.png "AI 智能生成等待中")

![AI 智能生成等待中](https://transweb.cn/workflow/docs/images/guide004.png "AI 智能生成等待中")

* **方式 B（自选已有应用）**：在对话框下方的 Skill 应用列表中，直接浏览并点击所需的 Skill 实例，在详情页点击 **“确认添加”**。
![已添加 Skill](https://transweb.cn/workflow/docs/images/guide006.png "已添加 Skill")

![Skill 应用界面](https://transweb.cn/workflow/docs/images/guide005.png "Skill 应用界面")

3. **确认列表**：重复上述步骤，将本次工作流所需的所有 Skill 应用全部加入到下拉备选项中。
![备用 Skill 列表](https://transweb.cn/workflow/docs/images/guide007.png "备用 Skill 列表")


---

## 2. 配置工作流节点拓扑

在**工作流 Skill 节点配置区域**，你可以按照业务逻辑顺序，依次组装你的 Skill 链条。

### 操作步骤：

1. **配置首节点**：点击左侧输入框，在弹出的下拉列表中选择一个 Skill 应用作为初始节点。

![配置首节点](https://transweb.cn/workflow/docs/images/guide008.png "配置首节点")

2. **配置后续节点**：点击右侧关联输入框，在下拉列表中依次选择并绑定后续的多个 Skill 应用。

![配置首节点](https://transweb.cn/workflow/docs/images/guide009.png "配置首节点")

按照业务流水线顺序完成 Skill 节点的选择与串联后，当前工作流即宣告构建完成。


---

## 3. 配置节点间关系

在**工作流 Skill 节点配置区域**，点击节点右侧的“编辑”按钮，即可打开关系配置对话框。

关系配置对话框界面如下：
![点击编辑按钮](https://transweb.cn/workflow/docs/images/guide011.png "点击编辑按钮")

### 3.1 关系管理

在工作流中，**默认彼此相邻的 Skill 之间存在依赖关系**。你可以根据业务需求自由配置：

![编辑依赖关系对话框](https://transweb.cn/workflow/docs/images/guide012.png "编辑依赖关系对话框")

* **添加非相邻依赖**：点击右上角的“新增连线”按钮，即可在非相邻的 Skill 之间建立依赖关联。

![新增连线](https://transweb.cn/workflow/docs/images/guide013.png "新增连线")

* **删除相邻依赖**：点击相邻 Skill 之间的连线按钮，在弹出的对话框中将连线属性修改为 `(none)`，即可删除该依赖关系。

![删除相邻 Skill 之间的连线](https://transweb.cn/workflow/docs/images/guide014.png "删除相邻 Skill 之间的连线")

* **管理非相邻依赖**：点击非相邻 Skill 连线上的编号按钮，可展开操作菜单，选择进行“编辑”或“删除”。

![操作非相邻 Skill 之间连线](https://transweb.cn/workflow/docs/images/guide014.png "操作非相邻 Skill 之间连线")



### 3.2 节点数据映射

* **默认数据流向**：上游（左侧）Skill 的**整体输出结果**会自动作为下游（右侧）Skill 的输入数据。
* **自定义字段映射**：修改依赖关系时，你可以灵活指定上游 Skill 输出结果中的**特定属性字段**，将其精准映射传递给下游 Skill 作为输入。


## 4. 导出与持久化工作流

由于线上版本的 Trans-Workflow 处于无状态运行模式（不实时缓存或自动持久化配置参数），因此完成配置后必须手动导出。

### 操作步骤：

* **导出本地文件**：点击界面右上角的 **“下载导出”** 图标按钮。系统会自动生成并下载一个最新的 `.html` 文件存档至本地。

![配置首节点](https://transweb.cn/workflow/docs/images/guide010.png "配置首节点")

支持两种导出模式：编辑和预览模式。
两者导出的页面，唯一区别在于是否默认显示编排节点操作区域或相关按钮。

---

> 🛠️ **开发者进阶提示：**
> 如果你的业务场景需要**实时状态缓存**、**多版本历史持久化**或**自定义节点回滚**等高级功能，建议下载 Trans-Workflow 的开源代码仓库，基于零部署架构进行二次开发。