# TransWeb —— 无代码生成 AI Agent，可绑定技能与工作流

> **一句话理解：** 选择一份资料，一键生成专属 AI Agent——每个 Agent 都能绑定 AI 技能或工作流；技能一句话即可生成，多个技能还能可视化编排成工作流。做完一键导出成网页，分享给任何人用。
>
> 不用写 Prompt，不用搭数据库，不用懂技术。

---

## 目录

- [一、它是什么（30 秒快速理解）](#一它是什么)
- [二、四个核心概念（先认识积木）](#二四个核心概念)
- [三、产品地图：这些页面分别干什么、之间什么关系](#三产品地图)
- [四、它帮你解决什么](#四它帮你解决什么)
- [五、为什么选它](#五为什么选它)
- [六、能做什么、边界在哪](#六能做什么边界在哪)
- [七、给部署者 / 开发者（技术速览）](#七给部署者--开发者技术速览)

---

## 一、它是什么

TransWeb 是一个 **B/S 架构、无代码生成 AI Agent** 的在线平台：每个 Agent 都支持绑定「AI 技能（Skill）」或「AI 工作流（Workflow）」——技能可以一句话无代码生成，多个技能还能可视化编排成工作流，统一在一套运行时里。

**30 秒快速理解（三步）：**

1. **造 Agent**：选择一份资料（PDF / Word / Markdown / TXT），一键生成专属「Agent」——自动读懂资料、建知识库、配人设。
2. **绑能力**：给 Agent 绑定「技能」（一句话无代码生成），或把多个技能可视化编排成「工作流」后绑定。
3. **导出分发**：Agent 一键导出为独立网页 / 链接 / 二维码，发给学生、同事、客户直接用。

---

## 二、四个核心概念

理解 TransWeb 只需要记住四个词：

| 概念 | 一句话解释 | 类比 |
| --- | --- | --- |
| **Agent（助理）** | 核心成品：**包含**知识库 + 人设规则，**可以使用** Skill / Workflow | 一个「配了资料和手册、会干活的员工」 |
| **Skill（技能）** | 一套「怎么干这件事」的说明，供 Agent 使用 | 一张「岗位操作卡」 |
| **Workflow（工作流）** | 多个 Skill 可视化编排成的「工作流」，供 Agent 使用 | 一条「生产线」 |
| **知识库（Knowledge Base）** | 你给的资料，变成 Agent 的「记忆」 | Agent 的「资料库/记忆」 |

它们的关系：

```
             ┌────────────────── Agent（AI 助理）──────────────────┐
             │  包含：知识库（记忆）＋ 人设规则（性格与规矩）          │
             │  可以使用：Skill（技能）／ Workflow（工作流）          │
             └──────────────────────────────────────────────────────┘
                                     │ 使用
                     ┌───────────────┴───────────────┐
                     ▼                               ▼
               Skill（技能）                   Workflow（工作流）
             一句话无代码生成             多个 Skill 可视化编排 / 首尾相接
```

> **一句话记法：** Agent 是「成品」——包含知识库与人设规则，能直接使用技能或工作流来持续干活。

---

## 三、产品地图

平台页面很多，但按「你在做什么」其实只有一条主线 + 两条辅线：

```
                          TransWeb 平台
                               │
        ┌──────────────────────┼──────────────────────────┐
     造「Agent」              造「技能」                 串「工作流」
        ▼                      ▼                          ▼
  Trans-Agent             Skill 生成器               Trans-Workflow
  creator.html            skill.html                workflow/index.html
  index.html（落地页）      agent.html
  选资料一键生成
        │                      │                          │
        └──── 技能 / 工作流 + 知识库 + 人设 = Agent ◄──────┘
                               │
              ┌────────────────┴────────────────┐
           逛现成技能                           学用法 & 抄成品
              ▼                                  ▼
         SkillHub                         使用文档 / 示例工作流
         skillHub.html                     workflow/docs/  ·  docs/examples/
```

### 主线：三条「生成」入口

| 页面 | 它是什么 | 输入 → 输出 |
| --- | --- | --- |
| `creator.html` / `index.html` | **Trans-Agent（Agent 生成器）** | 选一份资料 → 一键生成「Agent」（知识库 + 人设 + 绑定技能/工作流） |
| `skill.html` / `agent.html` | **Skill 生成器** | 一句话需求 → 一个可复用的「技能」 |
| `workflow/index.html` | **Trans-Workflow（工作流引擎）** | 多个技能 → 一条「工作流」，可编排、可回溯、可导出 |

> `index.html` 是 Trans-Agent 的对外落地页（与 `creator.html` 相同）；`workflow/` 下的 `math.html`、`mathFlow.html` 是面向「数学教研」这一垂直场景的专属工作流。

### 辅线一：逛现成的

| 页面 | 它是什么 |
| --- | --- |
| `skillHub.html` | **SkillHub**：全学科 AI 技能导航，在线预览 + 直接运行（傅里叶波形、几何推演、出题组卷、GeoGebra 脚本生成……） |

### 辅线二：学习与抄成品

| 页面 | 它是什么 |
| --- | --- |
| `workflow/docs/` | **使用文档**：快速开始、核心概念、构建指南、FAQ |
| `workflow/docs/examples/` | **20+ 成品工作流**：学术论文、合同审核、数学出题、物理仿真、微课脚本……打开即可参考/复用 |

### 后台：管理 & 初始化（通常只有管理员用）

| 页面 | 它是什么 |
| --- | --- |
| `admin.html` | 管理员界面（Skill 生成器的管理端） |
| `initialize.html` / `initAdmin.html` | 初始化 / 初始化管理员账号 |

> ⚠️ **安全告警**：以上为管理员/初始化页面，**发布到互联网前必须删除 `admin.html` 和 `initAdmin.html`**（`initialize.html` 等其它后台页面也建议一并处理），否则任何人可直接访问初始化/管理入口。

> 其余 `preview.html`（预览容器）、`proxy.html`（跨域代理）、`template.html` / `transApp.html`（应用模板）为框架内部支撑页面，普通用户无需关心。

---

## 四、它帮你解决什么

| 以前的状态 | 用了之后 |
| --- | --- |
| 每次都要重新描述一遍需求 | AI 记住你的资料和你的工作方式 |
| 资料散落在文档、笔记、网盘里 | 资料变成 AI 的「记忆」，随问随答 |
| 每次复制粘贴 Prompt、反复调教 | 技能一次配好，反复调用 |
| AI 只会聊天，聊完就没了 | AI 按固定流程完成任务，产出可用的结果 |

**一句话总结痛点：** 想让 AI 真正「懂你的资料、按你的规矩干活」，过去需要写代码、搭数据库、反复调 Prompt。

**它的回答是：** 上传资料 / 说句需求 → 自动生成 → 得到直接可用的 Agent、技能或工作流。

---

## 五、为什么选它

| 理由 | 说明 |
| --- | --- |
| **快** | 传统方式 3–5 天起步；这里 3 分钟出结果 |
| **省** | 按量计费、闲置零成本，没有看不懂的套餐和隐藏订阅 |
| **稳** | 回答有据可查（带原文引用），资料加密隔离、不用于训练模型 |

**产品特质：**

- **资料一键成 Agent**：上传一份资料，自动生成带知识库与人设的专属 Agent，可绑定技能 / 工作流。

- **单文件部署**：一个 HTML 文件 = 编辑器 + 工作流引擎 + 运行环境，零依赖、双击即用。
- **过程透明 + 人工干预（Human-in-the-Loop）**：中间结果可见、可暂停、可手动改，AI 与人协同。
- **节点级回溯**：某一步不满意，只重跑这一步，不用从头再来。
- **数据 100% 私有**：执行痕迹与产物本地持久化，资产归你所有。
- **一键导出**：把编排好的成果导出为独立网页，跨角色零门槛分发。

---

## 六、能做什么、边界在哪

**能做什么：**

- **生成**：资料 → Agent；需求 → 技能；多技能 → 工作流；资料 → 知识库。
- **分发**：链接分享、二维码访问、下载独立网页、嵌入 iframe。
- **编辑**：可视化编辑生成结果，可删除/调整元素、保存、复制、发布。
- **配置**：换 AI 模型与供应商、绑定多知识库、设价格与佣金。
- **克隆**：从 URL 或本地文件克隆现成应用，改一改就能用。
- **多语言**：界面与生成内容支持中文 / 英文。

**做不到什么（能力边界）：**

- **不替代专业判断**：AI 输出不构成法律、医疗、金融等专业意见。
- **不保证 100% 准确**：结果由模型自动产出，重要结论请对照原始资料核对。
- **不用于训练模型**：你的资料不会被用于模型训练，也不会被其他用户检索到。

---

## 七、给部署者 / 开发者（技术速览）

> 普通用户到上一节即可；这一节是给「要在自己服务器上跑起来」的人。

### 技术栈

- **后端**：Node.js + Express（入口 `webServer.js`），Session / 限流 / 上传 / HTTPS SNI 多证书。
- **数据层**：MongoDB（主）；MySQL / Neo4j 可选，通过 XML 配置自动生成 REST 接口。
- **前端**：`static/` 目录下的纯 HTML + Vue 3（运行时编译 SFC），集成 ECharts、GeoGebra、MathBox、JSXGraph、Mermaid、Phaser、CodeMirror 等可视化组件。
- **构建**：Gulp（`gulpfile.js`，terser 压缩合并组件脚本）。
- **模型接入**：`interface/config/` 统一适配多家大模型与图片/语音供应商，支持自定义模型与 BYO-Key。

### 目录结构

```
transweb/
├── webServer.js          # 服务端入口（Express + HTTPS + 路由/支付/微信）
├── gulpfile.js           # 前端组件打包任务
├── package.json          # 依赖与脚本（npm run init / npm run test）
├── scripts/
│   └── init.js           # 初始化脚本（生成运行时目录与 .env）
├── .env.example          # 环境变量样例（密钥/数据库/模型 Key）
├── LICENSE               # ISC 许可证
├── README.md
├── SECURITY.md
├── custom/               # 框架核心：DB 连接、Restful 路由、Bucket、WebTool、Adapter
├── interface/            # 业务接口（user/gpt/admin）与模型适配配置
│   ├── config/           # common.js / interface.js / appConfig.js
│   └── xml/              # MySQL/Neo4j 查询配置
└── static/               # 前端全部页面与组件（见「产品地图」）
    ├── transweb/         # 运行时核心：webCpu.js / aigcPlugin.js / vueSfcEditor.js / 组件 / 模板
    ├── webApps/          # 文档/Agent 相关 Vue 组件
    ├── workflow/         # 工作流引擎与文档/示例
    └── bucket/           # 应用 / 素材 / 个人空间
```

### 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 初始化运行环境（创建运行时目录 + 生成 .env）
npm run init           # 即 node scripts/init.js

# 3. 配置环境变量
#    编辑 .env，按注释填写 SESSION_SECRET、MongoDB、ADMIN_* 等必填项

# 4. 启动服务
node webServer.js      # HTTP: PORT（默认 80）；HTTPS: SSLPORT（默认 443）

# 5.（可选）构建前端组件
npm run test           # 即 gulp，压缩合并组件脚本
```

启动后访问 `http://localhost/`，前端由 `static/` 静态托管。

> ⚠️ **上线前安全必做**：把服务对外发布到互联网之前，务必删除后台与初始化页面：
> - `static/admin.html`
> - `static/initAdmin.html`
> - 同类页面如 `static/initialize.html` 也建议一并删除
>
> 否则任何人无需登录即可访问初始化/管理入口，可创建管理员账号或操作后台。

### 运行时目录与数据文件（已被 .gitignore 排除）

下列目录/文件保存运行时状态或敏感信息，**不会**随仓库分发，`npm run init` 会自动创建缺失项：

| 路径 | 用途 | 备注 |
| --- | --- | --- |
| `.env` | 环境变量/密钥 | 由 `.env.example` 复制生成，勿提交 |
| `ca/` | HTTPS 证书与私钥 | 启用 HTTPS（`SSLPORT`）时需自行放入证书 |
| `personal/appData/`、`personal/permission/` | 用户应用/权限数据 | 运行时生成 |
| `static/bucket/personal/` | 用户个人空间（文档/应用） | 运行时生成 |
| `wxPayLog/` | 微信支付流水日志 | 运行时生成 |
| `interface/config/logined.js`、`guest.js` | 登录/访客会话 | 需以 `var data={}\n module.exports = data;` 形式存在 |
| `temp_uploads/`、`temp/`、`tmp/` | 上传/临时目录 | 运行时生成 |

> 全新 clone 后务必先执行 `npm run init`，否则 `webServer.js` 启动时会因缺少 `interface/config/logined.js` 等文件报错。

### 环境变量（关键项，完整见 `.env.example`）

| 分组 | 变量 |
| --- | --- |
| 服务 | `PORT`、`HOST`、`SSLPORT` |
| 数据库 | `MONGO_HOST`、`MONGO_PORT`、`MONGO_DATABASE`、`MONGO_USERNAME`、`MONGO_APP_PWD` |
| 会话 | `SESSION_SECRET` |
| 管理员 | `ADMIN_ACCOUNT`、`POWER_ADMIN`、`ADMIN_KEY` |
| 微信支付 | `WX_PAY_APP_ID`、`WX_PAY_APP_SECRET`、`WX_PAY_APP_KEY`、`WX_PAY_MCH_ID` |
| 模型/语音/搜索 | `API_KEY_DEEPSEEK`、`API_KEY_TONGYI`、`API_KEY_ZHIPU_*`、`API_KEY_VOLCANO_*`、`API_KEY_SERPAPI`、`API_KEY_AZURE_SPEECH` 等 |

> 密钥均通过 `custom/env.js` 从环境变量读取；生产部署请务必轮换历史默认值并妥善保管 `.env`。

---

## License

ISC
