# TransWeb —— 无代码生成 AI Agent，可绑定技能与工作流

> **一句话理解：** 选择一份资料，一键生成专属 AI Agent——每个 Agent 都能绑定 AI 技能或工作流；技能一句话即可生成，多个技能还能可视化编排成工作流。做完一键导出成网页，分享给任何人用。
>
> 不用写 Prompt，不用搭数据库，不用懂技术。

---

## 目录

- [一、它是什么（30 秒快速理解）](#一它是什么)
- [二、五个核心概念（先认识积木）](#二五个核心概念)
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

## 二、五个核心概念

理解 TransWeb，只需要掌握五个核心概念。它们分别解决 AI 应用中的五个问题：**谁来干活、会干什么、按什么流程干、依据什么资料、遵循什么规则。**

### 1. 五个概念，各司其职

| 概念 | 核心作用 | 通俗类比 |
| --- | --- | --- |
| **Agent（助理）** | 面向用户的 AI 助理，可以与用户对话，并调用 Skill 或 Workflow 完成任务 | 一位能理解需求、调用能力的员工 |
| **Skill（技能）** | 封装一项具体任务的执行方法，可独立运行，也可供 Agent 调用 | 一张岗位操作卡 |
| **Workflow（工作流）** | 将多个 Skill 按照设定的步骤和逻辑进行可视化编排，实现多步骤任务协作 | 一条有明确工序的生产线 |
| **知识库（Knowledge Base）** | 为 Agent 或 Skill 提供可检索、可引用的专属资料 | 员工可以查阅的资料库 |
| **人设提示词（System Prompt）** | 定义 Agent 或 Skill 的角色定位、行为规则、表达方式和执行约束 | 一份角色说明与工作守则 |

### 2. 五个概念，如何协同工作？

可以把它们理解为一个完整的 AI 工作体系：

- **Agent 是执行主体**：理解用户需求，并根据任务需要调用相应的能力。
- **Skill 是具体能力**：把某项任务的做法封装起来，让 AI 能够按既定要求完成工作。
- **Workflow 是任务流程**：当任务涉及多个步骤或多项技能时，通过可视化编排组织执行顺序与协作关系。
- **知识库是资料依据**：为回答和任务执行提供业务文档、专业知识或其他参考资料。
- **人设提示词是行为规则**：告诉 Agent 或 Skill 应当以什么身份工作、如何处理任务，以及需要遵守哪些约束。

其中，Agent、Skill 和 Workflow 负责组织任务执行；知识库提供所需资料；人设提示词约束 AI 的行为。它们共同构成一个可配置、可复用的 AI 应用。

### 3. 它们之间的关系

```text
                    用户需求
                       │
                       ▼
                Agent（助理）
                沟通理解需求、组织执行
                       │
                 调用能力完成任务
                       │
                ┌──────┴──────┐
                ▼             ▼
           Skill（技能）   Workflow（工作流）
           执行具体任务     编排多步骤任务
                │             │
                └──────┬──────┘
                       ▼
                  任务执行结果

    ┌───────────────────────────────────┐
    │ 人设提示词：定义角色、行为与执行规则 │
    │ 知识库：提供业务资料与专业知识       │
    └───────────────────────────────────┘
         为 Agent / Skill 提供相应支持
```

**配置关系补充：**

- **Agent 和 Skill 都可以拥有独立的人设提示词**，分别定义自身的角色与行为规则。
- **Agent 和 Skill 都可以绑定知识库**，根据任务需要使用相关资料；每个对象可绑定 0～255 个知识库。
- **Agent 可以直接使用 Skill，也可以调用 Workflow**，将单项能力或多步骤流程组合起来。
- **Skill 可以独立运行，也可以被 Agent 或 Workflow 复用**，统一通过 Skill 的ID 进行调用。

### 4. 用一个实际案例理解

假设你要创建一个“数学可视化演示课件”：

1. **Agent**：负责与用户聊天，聊天过程中，逐步生成数学可视化演示脚本和演示知识点讲解。
2. **Skill**：将可视化演示脚本转成实际演示网页，将演示知识点讲解内容转成可视化图表。
3. **Workflow**：将演示知识点讲解内容生成、演示 PPT生成、动态可视化演示网页等形成完整的课件生成流程。
4. **知识库**：存放可视化演示或讲解知识的范围说明、知识点的补充资料等。
5. **人设提示词**：规定助理的专业角色、输出格式、风险提示方式，以及不能擅自作出的判断。

最终，用户面对的是一个可以使用的数学教学助理，而不是五个彼此孤立的配置项。

### 一句话记住

**Agent 决定谁来干活，Skill 决定具体怎么干，Workflow 决定多项 Skill 任务如何串联，知识库提供资料依据，人设提示词规定行为方式。**

在 TransWeb 中，你可以把这些要素组合起来，将专业知识和任务方法封装成可使用、可复用的 AI 助理与应用能力。

---

## 三、产品地图

平台页面很多，但按「你在做什么」其实只有一条主线 + 一条辅线：

```
                          TransWeb 平台
                               │
        ┌──────────────────────┼──────────────────────────┐
     造「Agent」              造「技能」                 串「工作流」
        ▼                      ▼                          ▼
  Trans-Agent             Skill 生成器               Trans-Workflow
  creator.html            skill.html             workflow/index.html
  index.html（落地页）      agent.html
  选资料一键生成
        │                      │                        │
        └──── 技能 / 工作流 + 知识库 + 人设 = Agent ◄──────┘
                               │
                               ▼
                       SkillHub（逛现成技能）
                       skillHub.html
```

### 主线：三条「生成」入口

| 页面 | 它是什么 | 输入 → 输出 |
| --- | --- | --- |
| `creator.html` / `index.html` | **Trans-Agent（Agent 生成器）** | 选一份资料 → 一键生成「Agent」（知识库 + 人设 + 绑定技能/工作流） |
| `skill.html` / `agent.html` | **Skill 生成器** | 一句话需求 → 一个可复用的「技能」 |
| `workflow/index.html` | **Trans-Workflow（工作流引擎）** | 多个技能 → 一条「工作流」，可编排、可回溯、可导出 |

> `index.html` 是 Trans-Agent 的对外落地页（与 `creator.html` 相同）；`workflow/` 下的 `math.html`、`mathFlow.html` 是面向「数学教研」这一垂直场景的专属工作流。

### 辅线：逛现成的

| 页面 | 它是什么 |
| --- | --- |
| `skillHub.html` | **SkillHub**：全学科 AI 技能导航，在线预览 + 直接运行（傅里叶波形、几何推演、出题组卷、GeoGebra 脚本生成……） |

### 后台：管理 & 初始化（通常只有管理员用）

| 页面 | 它是什么 |
| --- | --- |
| `admin.html` | 管理员界面（管理端：管理 Agent/Skill 运行环境） |
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
| **快** | 传统方式 3–5 天起步；这里约 3 分钟出结果 |
| **省** | 按量计费、闲置零成本，没有看不懂的套餐和隐藏订阅 |
| **稳** | 回答基于资料内容（可结合原文），资料按账号隔离，不用于公共模型训练 |

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
- **分发**：Agent / Skill 支持导出到本地；可链接分享、二维码访问、下载独立网页、嵌入 iframe。
- **编辑**：可视化编辑生成结果，可删除/调整元素、保存、复制、发布。
- **配置**：换 AI 模型与供应商、绑定多知识库、设价格与佣金。
- **克隆移植**：**自己的 Agent / Skill 可自由克隆**；跨账户移植时，只能由所属账户**手动导出**后、主动发给需要拷贝的用户，对方在 `skill.html` 输入框右下方的「克隆」按钮导入即可。支持同环境（同一域名）不同账户、不同环境（不同域名）两种场景。
- **多语言**：界面与生成内容支持中文 / 英文。

**做不到什么（能力边界）：**

- **不替代专业判断**：AI 输出不构成法律、医疗、金融等专业意见。
- **不保证 100% 准确**：结果由模型自动产出，重要结论请对照原始资料核对。
- **不用于训练模型**：你的资料不会被用于公共模型训练，也不会被其他用户检索到。

---

## 七、给部署者 / 开发者（技术速览）

> 普通用户到上一节即可；这一节是给「要在自己服务器上跑起来」的人。

### 技术栈

- **后端**：Node.js + Express（入口 `webServer.js`），Session / 限流 / 上传 / HTTPS SNI 多证书。
- **数据层**：MongoDB（主）；MySQL / Neo4j 可选，通过 XML 配置自动生成 REST 接口。
- **前端**：`static/` 目录下的纯 HTML + Vue 3（运行时编译 SFC），集成 ECharts、GeoGebra、MathBox、JSXGraph、Mermaid、Phaser、CodeMirror 等可视化组件。
- **构建**：Gulp（`gulpfile.js`，terser 压缩合并组件脚本）。
- **模型接入**：`interface/config/` 统一适配多家大模型与图片/语音供应商，支持自定义模型与 BYO-Key；
  文本、图片生成、图片输入三类默认模型可分别配置（`defaultModel` / `defaultImageModel` / `defaultImageInputModel`）。
- **部署**：`transweb-service` 安装包（npm / GitHub Releases），提供 `transweb` CLI 管理初始化、启停、配置、模型与密钥。

### 目录结构

```
transweb/
├── webServer.js          # 服务端入口（Express + HTTPS + 路由/支付/微信）
├── gulpfile.js           # 前端组件打包任务
├── package.json          # 依赖与脚本（npm run init / npm run test）
├── scripts/
│   ├── init.js           # 初始化脚本（生成运行时目录与 .env）
│   └── i18n-extract.js   # 从页面标注里抽取中文词条（生成 i18n/*.zh.json）
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

### 静态页中英切换

首页（`index.html`）、Skill 广场（`skillHub.html`）、工作流（`workflow.html`）三页共用一套切换规则：
`?lang=en` 优先，其次 `localStorage.appLang`，默认中文；切换时同步地址栏，刷新后保持上次选择。

| 文件 | 作用 |
| --- | --- |
| `static/i18n/page.js` | Skill 广场 / 工作流两页共用的切换引擎（渲染标注、标题与 meta、`applangchange` 事件、`__t__()`） |
| `static/i18n/en.json` | 全站共用英文词条（导航、页脚、隐私政策 / 服务条款 / 无障碍声明） |
| `static/i18n/skillHub.zh.json`、`skillHub.en.json` | 技能广场页词条 |
| `static/i18n/workflow.zh.json`、`workflow.en.json` | 工作流页词条 |
| `scripts/i18n-extract.js` | 从页面标注里重新抽取 `*.zh.json`，避免页面中文与词典漂移 |

页面标注约定：`data-i18n`（纯文本）、`data-i18n-html`（含 `<span>` 等行内标签）、
`data-i18n-aria`、`data-i18n-alt`、`data-i18n-title`、`data-i18n-placeholder`。
改完页面里的中文文案后重跑一次抽取脚本：

```bash
node scripts/i18n-extract.js static/skillHub.html
node scripts/i18n-extract.js static/workflow.html
```

JS 动态生成的文案（分类名、卡片上的「N 步 / 免费运行」等）走 `window.__t__()` / `window.__tf__()`；
中文放在页面内联的 `window.__PAGE_I18N__.zh`，英文放在对应的 `*.en.json`。
列表类内容（发布的 Skill、工作流卡片标题与简介）按作者填写的原文展示，只翻译界面文案。

### 快速开始

**方式一：安装包（推荐，自托管部署）**

```bash
npm install -g transweb-service@1.5.6   # 或使用 GitHub Release 的 .tgz

transweb init        # 初始化数据库（会清空数据，需确认）
transweb start       # 启动 MongoDB 与 Web 服务；首次会打开初始化页面
transweb status      # 查看地址、局域网访问、初始化状态
```

- 首次初始化会自动安装应用依赖（约 543 个包）并下载 MongoDB 6.0.x（约 58MB）；
- 服务目录默认 `~/.transweb-service`（配置、数据库、日志、证书都在这里），升级 npm 包不丢数据；
- 局域网其他设备可直接访问 `transweb status` 里显示的地址；
- 重装或切换 Node 版本后若提示 `transweb: No such file or directory`，先执行 `hash -r`；
  仍失败见安装包内 `README-INSTALL.md` 的「故障排查」；
- HTTPS 证书不随包分发：把证书放到 `<npm 全局目录>/transweb-service/app/ca/cn/{key.pem,cert.pem}`，缺失时自动跳过 8443。

常用命令：

```bash
transweb config list|get|set|unset <common|app> <path>   # common.js / appConfig.js（点路径）
transweb env list|get|set|unset [KEY]                    # .env 环境变量（密钥默认打码，--show 明文）
transweb wxpay list|check|set|unset                      # 微信支付全参数（AppID/商户号/密钥/回调/接口地址）
transweb access list|set|document|set-table              # 文档读取权限（public / login / owner）
transweb cors on|off|status                              # 跨站请求许可（默认开启）
transweb admin status|hide|show                          # 后台页移出/恢复站点目录
transweb default model|image|image-input                 # 三类默认模型
transweb model list|add|update|remove                    # 模型费率（支持 --from）
transweb api list|add|update|remove                      # API 网关与 Key（--key-stdin 可避免密钥进历史）
transweb logs [web|mongo] [--lines 50]                   # 查看服务 / MongoDB 日志
transweb root accessKey                                  # root 管理账号 + 万能验证
transweb sync static|bucket|code|all                     # 同步源码到已安装服务（需二次确认）
transweb mongodb status|install
transweb uninstall [--purge]
```

> `transweb model add ... -from 国内` 与 `--from 国内` 等价（单横线长参数会自动纠正）。
> `transweb root accessKey --json` 可用于脚本读取；等价于分别执行 `transweb env get ADMIN_ACCOUNT` 与 `transweb env get POWER_ADMIN`。

### 激活功能模块（至少 1 个 API + 1 个模型）

服务启动后还不会自动具备 AI 能力；必须至少配置 **1 个 apiName** 和 **1 个 model**，Agent / 技能 / 工作流才能调用模型。

> 配置优先级：**root 管理账号（最高）** → 算力供应方 → model → 微信支付 / 登录验证码。

#### 1. 配置算力供应方（apiName）：平台 URL + apiKey

一个算力供应方对应一个 apiName；至少配置 1 个。

```bash
transweb api add dmxapi \
  --url https://api.example.com/v1/chat/completions \
  --key sk-xxxx
```

- `apiName` 是自定义接入名（示例用 `dmxapi`，也可以叫 `深度求索`），后续模型通过 `--api-name` 引用；
- `--url` 填平台的 **Chat Completions** 接口地址（不是平台首页）；
- `--key` 写入 `.env` 的 `API_KEY_` + apiName（英文名转大写，如 `dmxapi` → `API_KEY_DMXAPI`；中文名会生成哈希变量名），`common.js` 只保留 `env.opt(...)` 引用，不落明文；
- 不想让 Key 进入 shell 历史时，可省略 `--key` 按提示输入（不回显），或用 `printf '%s' "$KEY" | transweb api add ... --key-stdin`。

配置后的结构：

```js
// common.js
apiConfig: {
  dmxapi: {
    url: "https://api.example.com/v1/chat/completions",
    authorization: "Bearer " + env.opt("API_KEY_DMXAPI")
  }
}
```

#### 2. 配置 model：apiName + 费率 + 来源

```bash
transweb model add claude-fable-5 \
  --api-name dmxapi \
  --input 0.05 \
  --output 0.25 \
  --context 200000 \
  --from 国外
```

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `--api-name` | 是 | 引用第 1 步配置的 apiName |
| `--input` / `--output` | 是 | **费率**：积分与 token 的比例，表示 **1 个 AI token 消耗多少积分**；输入、输出分别计费，只有一个统一费率时两处填相同值 |
| `--context` | 是 | 模型上下文窗口（token），如 `128000`、`200000` |
| `--from` | 否 | 模型来源：`国内` 或 `国外`，默认 `国外`；前端按此分组展示 |

例如 `--input 0.05 --output 0.25` 表示：1 个输入 token 计 0.05 积分，1 个输出 token 计 0.25 积分。
前端展示时会换算成「每百万 token 积分」，但 `tokenRateMap` 中保存的始终是 **每 1 token** 的积分数。

配置后的结构：

```js
// common.js
tokenRateMap: {
  "claude-fable-5": {
    apiName: "dmxapi",
    input: 0.05,       // 1 个输入 token 的积分
    output: 0.25,      // 1 个输出 token 的积分
    context: 200000,
    from: "国外"       // 国内 / 国外
  }
}
```

#### 3. 设为默认模型（否则前端仍使用内置默认值）

```bash
transweb default model --model claude-fable-5
# 或显式指定 apiName
transweb default model --api-name dmxapi --model claude-fable-5
```

图片生成 / 图片输入模型分别用 `transweb default image` / `transweb default image-input` 配置。

> 以上命令默认会在 Web 服务运行时自动重启使配置生效；加 `--no-restart` 只改配置。
> 检查结果：`transweb api list`、`transweb model list`、`transweb default list`。
> 多个 API / 模型可重复执行 `transweb api add` / `transweb model add`，同名时加 `--force` 覆盖。

#### 4. 获取 root 管理账号与万能验证

管理端首次登录可使用 **root 管理账号 + 万能验证**，无需短信验证码：

```bash
transweb root accessKey            # 显示 root 管理账号与登录所需的万能验证
transweb root accessKey --json     # 输出 JSON，便于脚本读取
```

- `root 管理账号`：对应 `.env` 的 `ADMIN_ACCOUNT`，安装包默认 `transweb`；
- `万能验证`：对应 `.env` 的 `POWER_ADMIN`，安装包默认 `transweb$harness`，仅对 root 管理账号生效；
- 登录管理端时选择「验证码登录」，账号填 root 管理账号，验证码填万能验证即可。

> 以上为安装包默认值；源码部署请以 `.env` 实际值为准（`.env.example` 中为 `xxx`，需先填写）。

> 该命令与 `transweb env get ADMIN_ACCOUNT`、`transweb env get POWER_ADMIN` 读取同一份 `.env`；
> 修改后需 `transweb restart` 生效。

> 初始化页面 `static/assets/animationScripts/initAdmin.js` 内置了 `transweb` / `transweb$harness` 用于自动登录；
> 修改 `ADMIN_ACCOUNT` / `POWER_ADMIN` 时需同步修改该文件，否则初始化页自动登录会失败。生产环境请限制后台页访问并妥善保管 `.env`。
> `POWER_ADMIN` 含 `$`，在 shell 中赋值请用单引号（如 `transweb env set POWER_ADMIN 'transweb$harness'`），否则 `$harness` 会被展开为空。

#### 5. 微信支付与登录验证码（按需）

微信支付（APIv2）：

```bash
transweb wxpay list
transweb wxpay set appId wx...
transweb wxpay set mchId ...
transweb wxpay set appKey ...        # 32 位 APIv2 密钥
transweb wxpay set notify https://<域名>/receiveWxNotify
transweb wxpay check
```

- 必填：`WX_PAY_APP_ID`、`WX_PAY_MCH_ID`、`WX_PAY_APP_KEY`、`WX_PAY_ORDER_URL`、`WX_PAY_QUERY_URL`；
- 按需：`WX_PAY_APP_SECRET`（网页授权取 openid）、`WX_PAY_NOTIFY`（公网 HTTPS 回调）、`WX_PAY_APP_ID001` / `WX_PAY_APP_SECRET001`（小程序通道）；
- 安装时生成的 `WX_PAY_APP_KEY` 是随机值，正式收款前替换为商户平台 APIv2 密钥；`WX_PAY_APP_KEY` 为空会导致 Web 启动报错。

用户登录验证码（螺丝帽短信）：

```bash
transweb env set SEND_MESSAGE_API_KEY <key>
```

- 对应 `.env` 的 `SEND_MESSAGE_API_KEY`；未配置时手机验证码登录 / 注册不可用；
- `transweb env set` 默认会重启 Web 服务，加 `--no-restart` 可只改配置。

**方式二：源码开发**

```bash
npm install            # 安装依赖
npm run init           # 创建运行时目录 + 生成 .env
# 编辑 .env，填写 SESSION_SECRET、MongoDB、ADMIN_* 等必填项
node webServer.js      # HTTP: PORT（默认 80）；HTTPS: SSLPORT（默认 443）
npm run test           # （可选）gulp 压缩合并组件脚本
```

> ⚠️ **上线前安全必做**：后台页面（`static/admin.html`、`static/initAdmin.html`）不能暴露到公网。
> 安装包用户执行 `transweb admin hide`（`init` / 首次 `start` 会自动恢复，自动初始化完成后自动隐藏）；
> 源码部署请手动删除或加访问控制。个人空间文件 `static/bucket/personal/` 的读取权限跟随 `documentAccess`（`public` / `login` / `owner`），写操作始终要求本人登录；`public` 级别下未登录可按 URL 读取具体文件，但目录浏览仍需登录。

### 同步源码到已安装服务（开发调试）

如果已经用安装包跑着服务，又改了当前仓库的代码，可以用 `transweb sync` 直接同步到已安装的服务，不必每次重新打包：

```bash
transweb sync static   # 只同步 static/ 前端资源（不含 bucket）
transweb sync bucket   # 只同步 static/bucket 应用与素材（跳过 personal 用户数据）
transweb sync code     # 只同步 static 以外的服务端源码（server 为别名）
transweb sync all      # 前端 + 服务端

transweb sync bucket --dry-run   # 只预览，不写入
transweb sync all --source /path/to/transweb
```

- 同步前会打印风险提示，并要求输入 `yes` 再次确认；`--yes` 可跳过确认（仅供自动化）；
- 永不覆盖 `.env`、`interface/config/appConfig.js`、`interface/config/logined.js`、`interface/config/common.js` / `guest.js`、`*.log`、`bucket/personal` 等运行时数据；
- 默认跳过 `node_modules`、`ca/`、`personal/`、`logs/`、`wxPayLog/`、`temp*`、`tmp/`、`dist/` 与后台页；
- `bucket` 模式只同步 `static/bucket` 下的 `apps` / `assets` / `publicApps` 等资源，**始终跳过 `static/bucket/personal`**（用户个人空间），适用于只更新内置应用与素材的场景；
- 只覆盖/新增文件，不删除目标端多余文件，也不会自动回滚；
- `code` / `all` 同步后会自动重启 Web 服务；`static` / `bucket` 只刷新浏览器即可；`package.json` / lock 有变化时只提示安装依赖，不自动重启；
- `--include-admin` 可同步 `admin.html` / `initAdmin.html`（默认跳过，避免重新暴露后台）；`--no-restart` 只同步不重启。

> 该命令由 `transweb-service` 安装包提供；旧版本请先升级到包含 `transweb sync` 的版本。

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
| 服务 | `PORT`、`HOST`、`SSLPORT`、`TRUST_PROXY`（反代后置 1）、`TRANSWEB_DISABLE_ADMIN`（1 = 始终关闭后台页；留空 = 初始化前放行、初始化后自动关闭） |
| 数据库 | `MONGO_HOST`、`MONGO_PORT`、`MONGO_DATABASE`、`MONGO_USERNAME`、`MONGO_APP_PWD` |
| 会话 | `SESSION_SECRET` |
| 管理员 | `ADMIN_ACCOUNT`、`POWER_ADMIN`、`ADMIN_KEY` |
| 微信支付 | `WX_PAY_APP_ID`、`WX_PAY_APP_SECRET`、`WX_PAY_APP_KEY`（APIv2 32 位）、`WX_PAY_MCH_ID`、`WX_PAY_NOTIFY`、`WX_PAY_ORDER_URL`、`WX_PAY_QUERY_URL`、`WX_PAY_APP_ID001` / `WX_PAY_APP_SECRET001`（小程序通道） |
| 短信 / 系统接口 | `SEND_MESSAGE_API_KEY`（螺丝帽短信）、`JEV_API_ENDPOINT` |
| 模型/语音/搜索 | `API_KEY_DEEPSEEK`、`API_KEY_TONGYI`、`API_KEY_ZHIPU_*`、`API_KEY_VOLCANO_*`、`API_KEY_SERPAPI`、`API_KEY_AZURE_SPEECH` 等 |

> 密钥均通过 `custom/env.js` 从环境变量读取；生产部署请务必轮换历史默认值并妥善保管 `.env`。

### 应用配置（`interface/config/common.js`）

| 字段 | 作用 |
| --- | --- |
| `crossOrigin` | 跨站请求许可（CORS）：`{ allow, origin, credentials }`。默认 `allow: true`（允许跨站）；改完需 `transweb restart` |
| `documentAccess` | 文档读取权限：`public` / `login` / `owner`，可用 `tables` 按集合覆盖；同一规则也约束 `static/bucket/personal/` 的读取（`document` 目录对应 document 表，`app`/`webApps`/`layout`/`other` 对应 pptItem 表） |

跨站开关可用命令修改，例如：

```bash
transweb cors on                                     # 允许全部来源（*）
transweb cors on --origin "https://a.com,https://b.com"   # 只允许指定来源
transweb cors off                                    # 关闭跨站（默认是开启）
```

默认允许跨站；执行 `transweb cors off` 后不再返回 CORS 头，并直接拒绝带外部 `Origin` 的跨站请求（同源页面、curl 与服务端调用不受影响）。
`POST` / `PUT` / `PATCH` / `DELETE` 的 CSRF 同源校验共用这套策略与端口判定，避免「CORS 已放行、CSRF 仍 403」。

文档读取权限（`documentAccess`）同样可用命令调整：

```bash
transweb access list                                # 查看默认级别与集合覆盖
transweb access set login                           # 默认级别：所有人登录后可获取
transweb access document owner                      # 文档集合：仅发布者登录后可获取
transweb access skill public                        # 技能/Agent（同一张 pptItem 表）
transweb access get pptItem                         # 查看某个集合的生效级别
transweb access unset-table document                # 移除集合覆盖，回退默认级别
```

> 级别含义：`public` 免登陆获取、`login` 所有人登录获取、`owner` 发布者登录获取。
> 写命令默认会重启 Web 服务使其生效；加 `--no-restart` 只改配置。

---

## License

ISC
