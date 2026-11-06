/**
 * 中国电子教育学会 公文与审批 OA · 演示数据与业务动作
 * ------------------------------------------------------------------
 * 一份可持久化的前端 mock store，供三个角色组件共享：
 *   - 普通用户提交归档 / 申请权限 → 审批人待办出现任务；
 *   - 审批人同意 / 退回 / 驳回 → 文档状态、授权、通知同步变化；
 *   - 文档管理员上传 / 版本 / 归档 / 授权 → 普通用户与审批人立即可见。
 *
 * 所有数据保存在 localStorage，刷新不丢失；演示壳提供“重置数据”。
 * 依赖：Vue 3 全局构建（Vue.reactive）。
 */
(function () {
  "use strict";

  const KEY = "oa-demo-state-v4";
  const DAY = 24 * 60 * 60 * 1000;
  const HOUR = 60 * 60 * 1000;
  const now = Date.now();
  const at = (days, hours) => new Date(now + (days || 0) * DAY + (hours || 0) * HOUR).toISOString();
  const uid = (prefix) => prefix + "-" + Math.random().toString(36).slice(2, 7).toUpperCase();

  const CAPS = ["staff", "approver", "docadmin"];

  // 学会实际岗位角色；同一岗位可拥有多种功能权限（查阅 / 审批 / 文档管理）
  const ROLE_DEFS = [
    {
      key: "president", account: "20120001", name: "孙建国", title: "理事长",
      deptId: "D06", deptName: "理事会", caps: ["staff", "approver"],
      desc: "主持理事会 · 重大事项终审"
    },
    {
      key: "vicePresident", account: "20160001", name: "赵启明", title: "副理事长",
      deptId: "D06", deptName: "理事会", caps: ["staff", "approver"],
      desc: "分管工作审核 · 重要发文复核"
    },
    {
      key: "standingMember", account: "20190021", name: "刘洋", title: "常务理事",
      deptId: "D06", deptName: "理事会", caps: ["staff", "approver"],
      desc: "常务理事会决策 · 会员与重要事项审议"
    },
    {
      key: "secretaryGeneral", account: "20180006", name: "王慧敏", title: "秘书长",
      deptId: "D01", deptName: "秘书处", caps: ["staff", "approver", "docadmin"],
      desc: "主持秘书处工作 · 公文与文档管理"
    },
    {
      key: "deputySecretary", account: "20220008", name: "张倩", title: "副秘书长",
      deptId: "D01", deptName: "秘书处", caps: ["staff", "approver"],
      desc: "协助秘书长 · 公文复核与综合协调"
    },
    {
      key: "branchLiaison", account: "20210015", name: "周明", title: "职业教育分会联络人",
      deptId: "D05", deptName: "职业教育分会", caps: ["staff", "approver"],
      desc: "分会材料报送 · 分会事项初审"
    },
    {
      key: "archivist", account: "20150012", name: "陈静", title: "档案管理员",
      deptId: "D01", deptName: "秘书处", caps: ["staff", "docadmin"],
      desc: "公文归档 · 档案借阅与授权台账"
    },
    {
      key: "specialist", account: "20230001", name: "李知远", title: "秘书处专员",
      deptId: "D01", deptName: "秘书处", caps: ["staff"],
      desc: "公文起草 · 资料查阅 · 流程发起"
    }
  ];

  const roleOfKey = (key) => ROLE_DEFS.find((r) => r.key === key);
  const PERSONA = {
    staff: roleOfKey("specialist"),
    approver: roleOfKey("secretaryGeneral"),
    docadmin: roleOfKey("archivist")
  };
  const APPROVERS = ROLE_DEFS.filter((r) => r.caps.indexOf("approver") !== -1);

  const DEPTS = [
    { id: "D01", name: "秘书处" },
    { id: "D02", name: "学术部" },
    { id: "D03", name: "会员部" },
    { id: "D04", name: "培训部" },
    { id: "D05", name: "职业教育分会" },
    { id: "D06", name: "理事会" }
  ];

  const USERS = ROLE_DEFS.map((r) => ({
    account: r.account, name: r.name, deptId: r.deptId, deptName: r.deptName, title: r.title, caps: r.caps
  }));

  const CATEGORIES = [
    { id: "CAT-GW", code: "GW", name: "公文管理", children: [
      { id: "CAT-GW-SW", code: "GW-SW", name: "收文" },
      { id: "CAT-GW-FW", code: "GW-FW", name: "发文" },
      { id: "CAT-GW-HY", code: "GW-HY", name: "会议纪要" }
    ]},
    { id: "CAT-ZD", code: "ZD", name: "制度文件", children: [
      { id: "CAT-ZD-ZL", code: "ZD-ZL", name: "学会治理" },
      { id: "CAT-ZD-CW", code: "ZD-CW", name: "财务管理" }
    ]},
    { id: "CAT-YW", code: "YW", name: "业务文档", children: [
      { id: "CAT-YW-XS", code: "YW-XS", name: "学术活动" },
      { id: "CAT-YW-FH", code: "YW-FH", name: "分会与会员" }
    ]},
    { id: "CAT-NB", code: "NB", name: "内部资料", children: [
      { id: "CAT-NB-NB", code: "NB-NB", name: "内部参考" },
      { id: "CAT-NB-PS", code: "NB-PS", name: "评审材料" }
    ]}
  ];

  const CAT_MAP = {};
  CATEGORIES.forEach((c) => {
    CAT_MAP[c.id] = c.name;
    (c.children || []).forEach((s) => { CAT_MAP[s.id] = c.name + " / " + s.name; });
  });

  function version(no, name, size, by, day, note) {
    return { no, name, size, by, at: at(day), note };
  }

  function timeline(day, actor, action, note) {
    return { at: at(day), actor, action, note };
  }

  function mkDoc(o) {
    return Object.assign({
      id: "", no: "", title: "", cat: "", catName: "", dept: "D01", deptName: "秘书处",
      owner: "陈静", ownerAccount: "20150012", classification: "internal", visibility: "all",
      tags: [], summary: "", status: "ACTIVE", version: 1, versions: [], fileType: "PDF",
      size: "1.8 MB", downloads: 0, createdAt: at(-60), updatedAt: at(-10), archivedAt: at(-9),
      validUntil: at(300), approvalId: null, deletedAt: null, purgeAt: null,
      prevStatus: null, timeline: []
    }, o);
  }

  function mkTask(account, name, status, comment, handledDay) {
    return {
      account, name, status: status || "pending",
      comment: comment || "", handledAt: handledDay === undefined ? null : at(handledDay)
    };
  }

  function mkNode(name, tasks, status) {
    return { id: uid("N"), name, mode: "all", status: status || "pending", tasks, comment: "" };
  }

  function mkInstance(o) {
    return Object.assign({
      id: "", no: "", type: "DOC_ARCHIVE", title: "", status: "RUNNING",
      creator: "", creatorAccount: "", deptName: "", docId: null,
      form: [], payload: {}, nodes: [], currentNode: 0, dueAt: at(2),
      priority: "normal", history: [], cc: [], createdAt: at(0), submittedAt: at(0),
      finishedAt: null, round: 1, urgeCount: 0
    }, o);
  }

  function seed() {
    const docs = [
      mkDoc({
        id: "D-1001", no: "XH-ZD-2026-0001", title: "中国电子教育学会章程（2026修订稿）", cat: "CAT-ZD-ZL", catName: CAT_MAP["CAT-ZD-ZL"],
        owner: "陈静", ownerAccount: "20150012", dept: "D01", deptName: "秘书处", classification: "internal", visibility: "all",
        tags: ["章程", "学会治理"], summary: "学会宗旨、业务范围、会员、组织机构、资产管理与章程修改程序的 2026 修订稿。",
        status: "ACTIVE", version: 2, downloads: 128, createdAt: at(-160), updatedAt: at(-30), archivedAt: at(-28),
        approvalId: "APR-2026-001",
        versions: [
          version(1, "中国电子教育学会章程（2025修订稿）.pdf", "1.8 MB", "陈静", -150, "2025 修订稿归档"),
          version(2, "中国电子教育学会章程（2026修订稿）.pdf", "2.0 MB", "陈静", -30, "补充会员服务与分支机构条款")
        ],
        timeline: [
          timeline(-150, "陈静", "上传文档", "创建文档并生成 V1"),
          timeline(-149, "王慧敏", "审批通过", "秘书处初审通过"),
          timeline(-30, "陈静", "上传新版本", "更新为 2026 修订稿 V2"),
          timeline(-6, "李知远", "下载文档", "下载 2026 修订稿")
        ]
      }),
      mkDoc({
        id: "D-1002", no: "XH-GW-2026-0002", title: "第八届理事会2026年度工作计划", cat: "CAT-GW-FW", catName: CAT_MAP["CAT-GW-FW"],
        tags: ["理事会", "年度计划"], summary: "第八届理事会 2026 年度重点工作、会议安排与分支机构任务分工。",
        status: "ACTIVE", version: 1, downloads: 86, createdAt: at(-70), updatedAt: at(-18), archivedAt: at(-17),
        versions: [version(1, "第八届理事会2026年度工作计划.pdf", "1.2 MB", "陈静", -18, "理事长会议审议后归档")]
      }),
      mkDoc({
        id: "D-1003", no: "XH-NB-2026-0003", title: "评审专家库名单（2026）", cat: "CAT-NB-PS", catName: CAT_MAP["CAT-NB-PS"],
        classification: "sensitive", visibility: "user", tags: ["专家库", "评审", "敏感"],
        summary: "学会课题与教学成果评审专家名单、联系方式与回避规则，仅限评审工作人员查阅。",
        status: "ACTIVE", version: 3, downloads: 12, createdAt: at(-200), updatedAt: at(-9), archivedAt: at(-8),
        versions: [
          version(1, "评审专家库名单（2024）.xlsx", "260 KB", "陈静", -190, "2024 版"),
          version(2, "评审专家库名单（2025）.xlsx", "280 KB", "陈静", -100, "2025 增补"),
          version(3, "评审专家库名单（2026）.xlsx", "310 KB", "陈静", -9, "2026 年度更新")
        ],
        timeline: [timeline(-9, "陈静", "上传新版本", "更新为 2026 版 V3"), timeline(-8, "王慧敏", "审批通过", "敏感文档归档审批")]
      }),
      mkDoc({
        id: "D-1004", no: "XH-ZD-2026-0004", title: "学会财务报销管理办法", cat: "CAT-ZD-CW", catName: CAT_MAP["CAT-ZD-CW"],
        tags: ["财务", "报销"], summary: "差旅、会议、培训、采购等常见报销场景的办理流程、标准与材料清单。",
        status: "ACTIVE", version: 1, downloads: 64, createdAt: at(-90), updatedAt: at(-40), archivedAt: at(-39),
        versions: [version(1, "学会财务报销管理办法.pdf", "980 KB", "陈静", -40, "秘书处审议后归档")]
      }),
      mkDoc({
        id: "D-1005", no: "XH-YW-2026-0005", title: "职业教育分会2026年度活动方案", cat: "CAT-YW-FH", catName: CAT_MAP["CAT-YW-FH"],
        owner: "周明", ownerAccount: "20210015", dept: "D05", deptName: "职业教育分会",
        tags: ["职业教育", "分会活动"], summary: "职业教育分会年度论坛、师资培训与校企走访安排。",
        status: "ACTIVE", version: 1, downloads: 23, createdAt: at(-40), updatedAt: at(-5), archivedAt: at(-4),
        versions: [version(1, "职业教育分会2026年度活动方案.pdf", "2.3 MB", "周明", -5, "分会理事会审议后归档")]
      }),
      mkDoc({
        id: "D-1006", no: "XH-ZD-2026-0006", title: "学会会费收支报告（2026上半年）", cat: "CAT-ZD-CW", catName: CAT_MAP["CAT-ZD-CW"],
        owner: "李知远", ownerAccount: "20230001", dept: "D01", deptName: "秘书处",
        tags: ["会费", "收支"], summary: "2026 年上半年会费收缴、支出执行与结余情况，待提交常务理事会审议。",
        status: "DRAFT", version: 1, downloads: 0, createdAt: at(-3), updatedAt: at(-2), archivedAt: null,
        versions: [version(1, "学会会费收支报告（2026上半年）.docx", "460 KB", "李知远", -3, "初稿")],
        timeline: [timeline(-2, "李知远", "编辑文档", "补充会费收缴明细")]
      }),
      mkDoc({
        id: "D-1007", no: "XH-NB-2026-0007", title: "电子教育研究课题立项评审结果（未公开）", cat: "CAT-NB-PS", catName: CAT_MAP["CAT-NB-PS"],
        classification: "sensitive", visibility: "user", tags: ["课题评审", "未公开", "敏感"],
        summary: "2026 年度课题立项评审打分、排名与拟立项名单，公示前仅限评审工作组查阅。",
        status: "ACTIVE", version: 1, downloads: 5, createdAt: at(-50), updatedAt: at(-6), archivedAt: at(-5),
        versions: [version(1, "课题立项评审结果（未公开）.pdf", "3.6 MB", "陈静", -6, "评审结果归档")]
      }),
      mkDoc({
        id: "D-1008", no: "XH-YW-2026-0008", title: "2026年学术年会组织方案", cat: "CAT-YW-XS", catName: CAT_MAP["CAT-YW-XS"],
        owner: "李知远", ownerAccount: "20230001", dept: "D01", deptName: "秘书处",
        tags: ["学术年会", "组织方案"], summary: "年会主题、分论坛设置、嘉宾邀请、会务分工与预算安排。",
        status: "SUBMITTED", version: 1, downloads: 3, createdAt: at(-6), updatedAt: at(-1), archivedAt: null,
        approvalId: "APR-2026-003",
        versions: [version(1, "2026年学术年会组织方案.pdf", "4.4 MB", "李知远", -1, "提交归档审批")],
        timeline: [timeline(-1, "李知远", "提交归档", "提交至秘书处初审")]
      }),
      mkDoc({
        id: "D-1009", no: "XH-YW-2026-0009", title: "校企合作备忘录（华为技术）", cat: "CAT-YW-XS", catName: CAT_MAP["CAT-YW-XS"],
        classification: "sensitive", visibility: "user", tags: ["校企合作", "备忘录", "敏感"],
        summary: "与华为技术有限公司就联合实验室、师资培训与教材建设签署的合作备忘录。",
        status: "ACTIVE", version: 1, downloads: 9, createdAt: at(-120), updatedAt: at(-20), archivedAt: at(-19),
        versions: [version(1, "校企合作备忘录（华为技术）.pdf", "8.2 MB", "陈静", -20, "合作备忘录归档")]
      }),
      mkDoc({
        id: "D-1010", no: "XH-GW-2026-0010", title: "秘书处周例会纪要（第38期）", cat: "CAT-GW-HY", catName: CAT_MAP["CAT-GW-HY"],
        owner: "王慧敏", ownerAccount: "20180006", dept: "D01", deptName: "秘书处",
        tags: ["例会", "会议纪要"], summary: "秘书处本周重点工作、年会筹备进度与各分会材料报送情况。",
        status: "ACTIVE", version: 1, downloads: 41, createdAt: at(-30), updatedAt: at(-2), archivedAt: at(-1),
        versions: [version(1, "秘书处周例会纪要（第38期）.pdf", "320 KB", "王慧敏", -2, "例会纪要归档")]
      }),
      mkDoc({
        id: "D-1011", no: "XH-NB-2026-0011", title: "新员工入职手册", cat: "CAT-NB-NB", catName: CAT_MAP["CAT-NB-NB"],
        owner: "李知远", ownerAccount: "20230001", dept: "D01", deptName: "秘书处",
        tags: ["新员工", "培训"], summary: "秘书处新员工入职指引、公文流转规范、会员服务流程与保密要求。",
        status: "RETURNED", version: 1, downloads: 0, createdAt: at(-10), updatedAt: at(-3), archivedAt: null,
        approvalId: "APR-2026-004",
        versions: [version(1, "新员工入职手册.pdf", "2.2 MB", "李知远", -4, "提交归档审批")],
        timeline: [timeline(-3, "王慧敏", "退回", "请补充学会概况、会员服务流程与保密要求")]
      }),
      mkDoc({
        id: "D-1012", no: "XH-GW-2026-0012", title: "学会2025年度工作总结", cat: "CAT-GW-FW", catName: CAT_MAP["CAT-GW-FW"],
        owner: "孙建国", ownerAccount: "20120001", dept: "D06", deptName: "理事会",
        tags: ["年度总结", "理事会"], summary: "2025 年度学会党建、学术交流、会员服务、分支机构和财务工作回顾。",
        status: "ACTIVE", version: 1, downloads: 77, createdAt: at(-300), updatedAt: at(-100), archivedAt: at(-99),
        versions: [version(1, "学会2025年度工作总结.pdf", "1.4 MB", "孙建国", -100, "理事会审议后归档")]
      }),
      mkDoc({
        id: "D-1013", no: "XH-ZD-2025-0013", title: "旧版学会章程（2020）", cat: "CAT-ZD-ZL", catName: CAT_MAP["CAT-ZD-ZL"],
        tags: ["章程", "历史"], summary: "2020 年第六届第二次会员代表大会通过的章程版本，已被 2026 修订稿替代。",
        status: "RECYCLED", version: 1, downloads: 0, createdAt: at(-500), updatedAt: at(-4),
        deletedAt: at(-3), purgeAt: at(27), prevStatus: "ACTIVE",
        versions: [version(1, "中国电子教育学会章程（2020）.pdf", "1.6 MB", "陈静", -500, "历史版本")],
        timeline: [timeline(-3, "陈静", "删除文档", "已被 2026 修订稿替代，移入回收站")]
      }),
      mkDoc({
        id: "D-1014", no: "XH-GW-2024-0014", title: "2024年学会通讯录", cat: "CAT-GW-FW", catName: CAT_MAP["CAT-GW-FW"],
        tags: ["通讯录", "历史"], summary: "2024 年度理事、分会联络人与秘书处工作人员通讯录，已过有效期。",
        status: "EXPIRED", version: 1, downloads: 54, createdAt: at(-420), updatedAt: at(-30),
        validUntil: at(-10), archivedAt: at(-400),
        versions: [version(1, "2024年学会通讯录.xlsx", "180 KB", "陈静", -400, "年度通讯录归档")]
      }),
      mkDoc({
        id: "D-1015", no: "XH-ZD-2026-0015", title: "学会印章使用管理规定", cat: "CAT-ZD-ZL", catName: CAT_MAP["CAT-ZD-ZL"],
        tags: ["印章", "用印"], summary: "学会公章、财务章、合同章的使用范围、审批流程与登记要求。",
        status: "SUBMITTED", version: 1, downloads: 31, createdAt: at(-80), updatedAt: at(-12), archivedAt: null,
        approvalId: "APR-2026-009",
        versions: [version(1, "学会印章使用管理规定.pdf", "760 KB", "陈静", -12, "定稿待归档")]
      }),
      mkDoc({
        id: "D-1016", no: "XH-GW-2026-0016", title: "秘书处会议纪要（2026年第10期）", cat: "CAT-GW-HY", catName: CAT_MAP["CAT-GW-HY"],
        owner: "王慧敏", ownerAccount: "20180006", dept: "D01", deptName: "秘书处",
        tags: ["会议纪要", "秘书处"], summary: "秘书处关于年会筹备、会员发展、分会年度考核工作的会议纪要。",
        status: "ACTIVE", version: 1, downloads: 18, createdAt: at(-15), updatedAt: at(-2), archivedAt: at(-1),
        versions: [version(1, "秘书处会议纪要-2026年第10期.pdf", "420 KB", "王慧敏", -2, "会议纪要归档")]
      }),
      mkDoc({
        id: "D-1017", no: "XH-GW-2026-0017", title: "副理事长分管工作要点", cat: "CAT-GW-FW", catName: CAT_MAP["CAT-GW-FW"],
        owner: "赵启明", ownerAccount: "20160001", dept: "D06", deptName: "理事会",
        tags: ["工作要点", "分管"], summary: "副理事长分管学术交流、教材建设与校企合作的年度工作要点。",
        status: "DRAFT", version: 1, downloads: 0, createdAt: at(-4), updatedAt: at(-1), archivedAt: null,
        versions: [version(1, "副理事长分管工作要点.docx", "360 KB", "赵启明", -1, "初稿")]
      }),
      mkDoc({
        id: "D-1018", no: "XH-YW-2026-0018", title: "职业教育分会实训基地建设方案", cat: "CAT-YW-FH", catName: CAT_MAP["CAT-YW-FH"],
        owner: "周明", ownerAccount: "20210015", dept: "D05", deptName: "职业教育分会",
        tags: ["实训基地", "分会"], summary: "职业教育分会实训基地建设目标、合作院校、经费测算与实施计划。",
        status: "SUBMITTED", version: 1, downloads: 9, createdAt: at(-12), updatedAt: at(-4), archivedAt: null,
        versions: [version(1, "职业教育分会实训基地建设方案.pdf", "2.8 MB", "周明", -4, "提交分会初审")],
        approvalId: "APR-2026-011"
      }),
      mkDoc({
        id: "D-1019", no: "XH-NB-2026-0019", title: "学会十四五发展规划中期评估", cat: "CAT-NB-NB", catName: CAT_MAP["CAT-NB-NB"],
        owner: "孙建国", ownerAccount: "20120001", dept: "D06", deptName: "理事会",
        tags: ["规划", "评估"], summary: "学会十四五规划中期目标完成情况、问题分析与下一阶段举措。",
        status: "SUBMITTED", version: 1, downloads: 22, createdAt: at(-20), updatedAt: at(-6), archivedAt: null,
        versions: [version(1, "学会十四五发展规划中期评估.pdf", "4.6 MB", "孙建国", -6, "提交理事长终审")],
        approvalId: "APR-2026-010"
      }),
      mkDoc({
        id: "D-1020", no: "XH-YW-2026-0020", title: "学术年会论文评审材料清单", cat: "CAT-YW-XS", catName: CAT_MAP["CAT-YW-XS"],
        owner: "张倩", ownerAccount: "20220008", dept: "D01", deptName: "秘书处",
        tags: ["学术年会", "论文评审"], summary: "年会投稿论文清单、评审专家分配与评审意见回收情况。",
        status: "SUBMITTED", version: 1, downloads: 6, createdAt: at(-9), updatedAt: at(-3), archivedAt: null,
        versions: [version(1, "学术年会论文评审材料清单.xlsx", "680 KB", "张倩", -3, "提交副秘书长初审")],
        approvalId: "APR-2026-012"
      })
    ];

    const grants = [
      {
        id: "G-001", effect: "allow", subjectType: "user", subjectId: "20230001", subjectName: "李知远",
        objectType: "document", objectId: "D-1002", objectName: "第八届理事会2026年度工作计划",
        rights: ["view", "download"], source: "document", reason: "参与年度计划编制",
        validFrom: at(-10), validUntil: at(20), status: "active", grantBy: "陈静",
        approvalId: "APR-2026-001", uses: 3, maxUses: null
      },
      {
        id: "G-002", effect: "allow", subjectType: "dept", subjectId: "D05", subjectName: "职业教育分会",
        objectType: "category", objectId: "CAT-NB", objectName: "内部资料",
        rights: ["view"], source: "approval", reason: "分会联合工作查阅内部资料",
        validFrom: at(-24), validUntil: at(6), status: "active", grantBy: "陈静",
        approvalId: "APR-2025-086", uses: 0, maxUses: null
      },
      {
        id: "G-003", effect: "allow", subjectType: "user", subjectId: "20230001", subjectName: "李知远",
        objectType: "document", objectId: "D-1007", objectName: "电子教育研究课题立项评审结果（未公开）",
        rights: ["view"], source: "approval", reason: "评审工作组材料查阅",
        validFrom: at(-29), validUntil: at(1), status: "active", grantBy: "陈静",
        approvalId: "APR-2025-091", uses: 2, maxUses: null
      },
      {
        id: "G-004", effect: "allow", subjectType: "role", subjectId: "approver", subjectName: "审批人",
        objectType: "category", objectId: "CAT-YW", objectName: "业务文档",
        rights: ["view"], source: "role", reason: "审批需要查看业务文档",
        validFrom: at(-60), validUntil: at(120), status: "active", grantBy: "系统", approvalId: null, uses: 0, maxUses: null
      },
      {
        id: "G-005", effect: "allow", subjectType: "user", subjectId: "20230001", subjectName: "李知远",
        objectType: "document", objectId: "D-1003", objectName: "评审专家库名单（2026）",
        rights: ["view", "download"], source: "document", reason: "2025 年评审工作",
        validFrom: at(-60), validUntil: at(-1), status: "expired", grantBy: "陈静",
        approvalId: "APR-2025-070", uses: 6, maxUses: null
      },
      {
        id: "G-006", effect: "allow", subjectType: "user", subjectId: "20220008", subjectName: "张倩",
        objectType: "document", objectId: "D-1009", objectName: "校企合作备忘录（华为技术）",
        rights: ["view", "download"], source: "approval", reason: "校企合作续签核对",
        validFrom: at(-15), validUntil: at(45), status: "active", grantBy: "陈静",
        approvalId: "APR-2025-095", uses: 1, maxUses: null
      }
    ];

    const instances = [
      mkInstance({
        id: "APR-2026-001", no: "SP-2026-0001", type: "DOC_ARCHIVE", title: "《中国电子教育学会章程（2026修订稿）》归档审批",
        status: "APPROVED", creator: "陈静", creatorAccount: "20150012", deptName: "秘书处", docId: "D-1001",
        createdAt: at(-32), submittedAt: at(-32), finishedAt: at(-30), currentNode: 2,
        form: [
          { label: "文档标题", value: "中国电子教育学会章程（2026修订稿）" },
          { label: "文档编号", value: "XH-ZD-2026-0001" },
          { label: "所属分类", value: "制度文件 / 学会治理" },
          { label: "密级", value: "内部" },
          { label: "可见范围", value: "全体会员" },
          { label: "归档说明", value: "章程修订稿经会员代表大会审议通过，申请归档。" }
        ],
        nodes: [
          mkNode("秘书处初审", [mkTask("20180006", "王慧敏", "approved", "修订条款已逐条核对。", -31)], "approved"),
          mkNode("副理事长终审", [mkTask("20160001", "赵启明", "approved", "同意提交理事会备案。", -30)], "approved")
        ],
        history: [
          { at: at(-32), actor: "陈静", action: "提交审批", comment: "提交归档审批" },
          { at: at(-31), actor: "王慧敏", action: "同意", comment: "修订条款已逐条核对。" },
          { at: at(-30), actor: "赵启明", action: "同意", comment: "同意提交理事会备案。" }
        ]
      }),
      mkInstance({
        id: "APR-2026-002", no: "SP-2026-0002", type: "PERM_GRANT", title: "《评审专家库名单（2026）》查看权限申请",
        status: "RUNNING", creator: "李知远", creatorAccount: "20230001", deptName: "秘书处", docId: "D-1003",
        createdAt: at(-1), submittedAt: at(-1), dueAt: at(0, 18), priority: "urgent",
        form: [
          { label: "申请对象", value: "评审专家库名单（2026）（XH-NB-2026-0003）" },
          { label: "申请权限", value: "查看" },
          { label: "申请期限", value: "30 天" },
          { label: "申请用途", value: "承担 2026 年度课题评审秘书工作，需要核对专家名单与回避规则。" }
        ],
        payload: { objectType: "document", objectId: "D-1003", rights: ["view"], days: 30, reason: "课题评审秘书工作" },
        nodes: [mkNode("秘书处初审", [mkTask("20180006", "王慧敏", "pending")])],
        history: [{ at: at(-1), actor: "李知远", action: "提交申请", comment: "申请查看评审专家库名单 30 天" }]
      }),
      mkInstance({
        id: "APR-2026-003", no: "SP-2026-0003", type: "DOC_ARCHIVE", title: "《2026年学术年会组织方案》归档审批",
        status: "RUNNING", creator: "李知远", creatorAccount: "20230001", deptName: "秘书处", docId: "D-1008",
        createdAt: at(-1), submittedAt: at(-1), dueAt: at(2),
        form: [
          { label: "文档标题", value: "2026年学术年会组织方案" },
          { label: "文档编号", value: "XH-YW-2026-0008" },
          { label: "所属分类", value: "业务文档 / 学术活动" },
          { label: "密级", value: "内部" },
          { label: "可见范围", value: "全体会员" },
          { label: "归档说明", value: "学术年会组织方案定稿，申请归档。" }
        ],
        nodes: [
          mkNode("秘书处初审", [mkTask("20180006", "王慧敏", "pending")]),
          mkNode("副理事长终审", [mkTask("20160001", "赵启明", "waiting")], "waiting")
        ],
        history: [{ at: at(-1), actor: "李知远", action: "提交归档", comment: "提交至秘书处初审" }]
      }),
      mkInstance({
        id: "APR-2026-004", no: "SP-2026-0004", type: "DOC_ARCHIVE", title: "《新员工入职手册》归档审批",
        status: "RETURNED", creator: "李知远", creatorAccount: "20230001", deptName: "秘书处", docId: "D-1011",
        createdAt: at(-5), submittedAt: at(-5), dueAt: at(-3), currentNode: 0,
        form: [
          { label: "文档标题", value: "新员工入职手册" },
          { label: "文档编号", value: "XH-NB-2026-0011" },
          { label: "所属分类", value: "内部资料 / 内部参考" },
          { label: "密级", value: "内部" },
          { label: "可见范围", value: "秘书处" },
          { label: "归档说明", value: "新员工入职培训使用，申请归档。" }
        ],
        nodes: [mkNode("秘书处初审", [mkTask("20180006", "王慧敏", "returned", "请补充学会概况、会员服务流程与保密要求后再提交。", -3)], "returned")],
        history: [
          { at: at(-5), actor: "李知远", action: "提交归档", comment: "提交至秘书处初审" },
          { at: at(-3), actor: "王慧敏", action: "退回", comment: "请补充学会概况、会员服务流程与保密要求后再提交。" }
        ]
      }),
      mkInstance({
        id: "APR-2026-005", no: "SP-2026-0005", type: "SENSITIVE_DOWNLOAD", title: "《电子教育研究课题立项评审结果（未公开）》下载审批",
        status: "RUNNING", creator: "李知远", creatorAccount: "20230001", deptName: "秘书处", docId: "D-1007",
        createdAt: at(0, -2), submittedAt: at(0, -2), dueAt: at(0, 6), priority: "urgent",
        form: [
          { label: "文档", value: "电子教育研究课题立项评审结果（未公开）" },
          { label: "密级", value: "敏感" },
          { label: "下载用途", value: "撰写课题评审工作报告，需要引用立项名单与评审结论。" },
          { label: "使用范围", value: "本人" },
          { label: "有效期", value: "24 小时，仅可下载 1 次" }
        ],
        payload: { objectType: "document", objectId: "D-1007", rights: ["download"], hours: 24, reason: "撰写评审工作报告" },
        nodes: [mkNode("秘书处初审", [mkTask("20180006", "王慧敏", "pending")])],
        history: [{ at: at(0, -2), actor: "李知远", action: "提交申请", comment: "申请下载未公开评审结果" }]
      }),
      mkInstance({
        id: "APR-2026-006", no: "SP-2026-0006", type: "PERM_GRANT", title: "职业教育分会申请「业务文档」查看与下载权限",
        status: "RUNNING", creator: "周明", creatorAccount: "20210015", deptName: "职业教育分会", docId: null,
        createdAt: at(-1), submittedAt: at(-1), dueAt: at(1),
        form: [
          { label: "申请对象", value: "业务文档（分类）" },
          { label: "申请部门", value: "职业教育分会" },
          { label: "申请权限", value: "查看、下载" },
          { label: "申请期限", value: "60 天" },
          { label: "申请用途", value: "分会年度活动与实训基地建设需要调阅学会业务文档。" }
        ],
        payload: { objectType: "category", objectId: "CAT-YW", subjectType: "dept", subjectId: "D05", rights: ["view", "download"], days: 60, reason: "分会活动与实训基地建设" },
        nodes: [mkNode("秘书处初审", [mkTask("20180006", "王慧敏", "pending")])],
        history: [{ at: at(-1), actor: "周明", action: "提交申请", comment: "申请跨分会资料权限" }]
      }),
      mkInstance({
        id: "APR-2026-007", no: "SP-2026-0007", type: "DOC_ARCHIVE", title: "《旧版学会章程（2020）》归档审批",
        status: "REJECTED", creator: "陈静", creatorAccount: "20150012", deptName: "秘书处", docId: "D-1013",
        createdAt: at(-5), submittedAt: at(-5), dueAt: at(-4), currentNode: 0,
        form: [
          { label: "文档标题", value: "旧版学会章程（2020）" },
          { label: "文档编号", value: "XH-ZD-2025-0013" },
          { label: "归档说明", value: "历史版本，申请归档保留。" }
        ],
        nodes: [mkNode("秘书处初审", [mkTask("20180006", "王慧敏", "rejected", "已被 2026 修订稿替代，建议作废，不再归档。", -4)], "rejected")],
        history: [
          { at: at(-5), actor: "陈静", action: "提交归档", comment: "提交至秘书处初审" },
          { at: at(-4), actor: "王慧敏", action: "驳回", comment: "已被 2026 修订稿替代，建议作废，不再归档。" }
        ]
      }),
      mkInstance({
        id: "APR-2026-008", no: "SP-2026-0008", type: "GENERAL", title: "对外提供《2025年度工作总结》审批",
        status: "APPROVED", creator: "王慧敏", creatorAccount: "20180006", deptName: "秘书处", docId: "D-1012",
        createdAt: at(-12), submittedAt: at(-12), finishedAt: at(-10), currentNode: 1,
        form: [
          { label: "材料名称", value: "学会2025年度工作总结" },
          { label: "接收单位", value: "业务主管单位教育部相关司局" },
          { label: "提供方式", value: "加盖学会公章的 PDF" },
          { label: "用途说明", value: "社会组织年度检查材料报送。" }
        ],
        nodes: [mkNode("秘书处审核", [mkTask("20180006", "王慧敏", "approved", "同意提供。", -11)], "approved")],
        history: [
          { at: at(-12), actor: "王慧敏", action: "提交审批", comment: "提交对外提供材料审批" },
          { at: at(-11), actor: "王慧敏", action: "同意", comment: "同意提供。" }
        ]
      }),
      mkInstance({
        id: "APR-2026-009", no: "SP-2026-0009", type: "DOC_ARCHIVE", title: "《学会印章使用管理规定》归档审批",
        status: "RUNNING", creator: "陈静", creatorAccount: "20150012", deptName: "秘书处", docId: "D-1015",
        createdAt: at(-2), submittedAt: at(-2), dueAt: at(0, 12), currentNode: 1, priority: "urgent",
        form: [
          { label: "文档标题", value: "学会印章使用管理规定" },
          { label: "文档编号", value: "XH-ZD-2026-0015" },
          { label: "所属分类", value: "制度文件 / 学会治理" },
          { label: "密级", value: "内部" },
          { label: "可见范围", value: "秘书处及分会" },
          { label: "归档说明", value: "用印管理制度修订定稿，申请归档。" }
        ],
        nodes: [
          mkNode("秘书处初审", [mkTask("20180006", "王慧敏", "approved", "条款已核对，同意提交终审。", -1)], "approved"),
          mkNode("副理事长终审", [mkTask("20160001", "赵启明", "pending")])
        ],
        history: [
          { at: at(-2), actor: "陈静", action: "提交审批", comment: "提交归档审批" },
          { at: at(-1), actor: "王慧敏", action: "同意", comment: "条款已核对，同意提交终审。" }
        ]
      }),
      mkInstance({
        id: "APR-2026-010", no: "SP-2026-0010", type: "DOC_ARCHIVE", title: "《学会十四五发展规划中期评估》归档审批",
        status: "RUNNING", creator: "陈静", creatorAccount: "20150012", deptName: "秘书处", docId: "D-1019",
        createdAt: at(-6), submittedAt: at(-6), dueAt: at(2), currentNode: 2,
        form: [
          { label: "文档标题", value: "学会十四五发展规划中期评估" },
          { label: "文档编号", value: "XH-NB-2026-0019" },
          { label: "所属分类", value: "内部资料 / 内部参考" },
          { label: "密级", value: "内部" },
          { label: "可见范围", value: "理事会" },
          { label: "归档说明", value: "规划中期评估报告，需理事长终审后归档。" }
        ],
        nodes: [
          mkNode("秘书处初审", [mkTask("20180006", "王慧敏", "approved", "材料完整。", -5)], "approved"),
          mkNode("副理事长终审", [mkTask("20160001", "赵启明", "approved", "同意提交常务理事会审议。", -4)], "approved"),
          mkNode("理事长终审", [mkTask("20120001", "孙建国", "pending")])
        ],
        history: [
          { at: at(-6), actor: "陈静", action: "提交审批", comment: "提交归档审批" },
          { at: at(-5), actor: "王慧敏", action: "同意", comment: "材料完整。" },
          { at: at(-4), actor: "赵启明", action: "同意", comment: "同意提交常务理事会审议。" }
        ]
      }),
      mkInstance({
        id: "APR-2026-011", no: "SP-2026-0011", type: "DOC_ARCHIVE", title: "《职业教育分会实训基地建设方案》归档审批",
        status: "RUNNING", creator: "李知远", creatorAccount: "20230001", deptName: "秘书处", docId: "D-1018",
        createdAt: at(-1), submittedAt: at(-1), dueAt: at(1), currentNode: 0,
        form: [
          { label: "文档标题", value: "职业教育分会实训基地建设方案" },
          { label: "文档编号", value: "XH-YW-2026-0018" },
          { label: "所属分类", value: "业务文档 / 分会与会员" },
          { label: "密级", value: "内部" },
          { label: "可见范围", value: "分会及秘书处" },
          { label: "归档说明", value: "分会实训基地建设方案，需分会联络人初审后归档。" }
        ],
        nodes: [
          mkNode("分会联络人初审", [mkTask("20210015", "周明", "pending")]),
          mkNode("秘书处复核", [mkTask("20180006", "王慧敏", "waiting")], "waiting")
        ],
        history: [{ at: at(-1), actor: "李知远", action: "提交归档", comment: "提交至分会联络人初审" }]
      }),
      mkInstance({
        id: "APR-2026-012", no: "SP-2026-0012", type: "DOC_ARCHIVE", title: "《学术年会论文评审材料清单》归档审批",
        status: "RUNNING", creator: "李知远", creatorAccount: "20230001", deptName: "秘书处", docId: "D-1020",
        createdAt: at(-1), submittedAt: at(-1), dueAt: at(1), currentNode: 0,
        form: [
          { label: "文档标题", value: "学术年会论文评审材料清单" },
          { label: "文档编号", value: "XH-YW-2026-0020" },
          { label: "所属分类", value: "业务文档 / 学术活动" },
          { label: "密级", value: "内部" },
          { label: "可见范围", value: "评审工作组" },
          { label: "归档说明", value: "年会论文评审材料清单，需副秘书长初审。" }
        ],
        nodes: [
          mkNode("副秘书长初审", [mkTask("20220008", "张倩", "pending")]),
          mkNode("秘书长复核", [mkTask("20180006", "王慧敏", "waiting")], "waiting")
        ],
        history: [{ at: at(-1), actor: "李知远", action: "提交归档", comment: "提交至副秘书长初审" }]
      }),
      mkInstance({
        id: "APR-2026-013", no: "SP-2026-0013", type: "GENERAL", title: "2026年度第二批会员入会审议",
        status: "RUNNING", creator: "王慧敏", creatorAccount: "20180006", deptName: "秘书处", docId: null,
        createdAt: at(-1), submittedAt: at(-1), dueAt: at(2), currentNode: 0,
        form: [
          { label: "审议事项", value: "2026年度第二批会员入会" },
          { label: "提交单位", value: "学会秘书处" },
          { label: "申请人数", value: "单位会员 6 家、个人会员 18 人" },
          { label: "说明", value: "按学会章程第十条，会员入会需经理事会授权机构研究并提出意见，报理事会或常务理事会讨论通过。" }
        ],
        nodes: [
          mkNode("常务理事审议", [mkTask("20190021", "刘洋", "pending")]),
          mkNode("秘书长复核", [mkTask("20180006", "王慧敏", "waiting")], "waiting")
        ],
        history: [{ at: at(-1), actor: "王慧敏", action: "提交审议", comment: "提交常务理事会审议会员入会名单" }]
      })
    ];

    const notifications = [
      { id: uid("MSG"), account: "20230001", type: "APPR_RETURN", title: "归档审批被退回", body: "《新员工入职手册》被王慧敏退回：请补充学会概况、会员服务流程与保密要求。", at: at(-3), read: false, link: { role: "staff", tab: "mine" } },
      { id: uid("MSG"), account: "20230001", type: "GRANT_EXPIRE", title: "授权即将到期", body: "您对《电子教育研究课题立项评审结果（未公开）》的查看授权将于明天到期。", at: at(0, -4), read: false, link: { role: "staff", tab: "perm" } },
      { id: uid("MSG"), account: "20230001", type: "APPR_TASK", title: "审批已提交", body: "《2026年学术年会组织方案》已提交秘书处初审，当前处理人王慧敏。", at: at(-1), read: false, link: { role: "staff", tab: "approvals" } },
      { id: uid("MSG"), account: "20180006", type: "APPR_TASK", title: "新待办：学术年会组织方案", body: "李知远提交《2026年学术年会组织方案》归档审批，请在 2 天内处理。", at: at(-1), read: false, link: { role: "approver", tab: "todo", instanceId: "APR-2026-003" } },
      { id: uid("MSG"), account: "20180006", type: "APPR_TASK", title: "新待办：未公开评审结果下载", body: "李知远申请下载《电子教育研究课题立项评审结果（未公开）》，请尽快处理。", at: at(0, -2), read: false, link: { role: "approver", tab: "todo", instanceId: "APR-2026-005" } },
      { id: uid("MSG"), account: "20180006", type: "APPR_TASK", title: "新待办：分会权限申请", body: "职业教育分会申请「业务文档」查看与下载权限，期限 60 天。", at: at(-1), read: false, link: { role: "approver", tab: "todo", instanceId: "APR-2026-006" } },
      { id: uid("MSG"), account: "20150012", type: "GRANT_EXPIRE", title: "授权即将到期", body: "职业教育分会对「内部资料」的查看授权将于 6 天后到期。", at: at(0, -6), read: false, link: { role: "docadmin", tab: "grants" } },
      { id: uid("MSG"), account: "20150012", type: "APPR_TASK", title: "新增审批事项", body: "职业教育分会提交权限申请，待秘书处初审。", at: at(-1), read: false, link: { role: "docadmin", tab: "records" } },
      { id: uid("MSG"), account: "20160001", type: "APPR_TASK", title: "新待办：印章管理规定归档", body: "《学会印章使用管理规定》已完成秘书处初审，待副理事长终审。", at: at(-1), read: false, link: { role: "approver", tab: "todo", instanceId: "APR-2026-009" } },
      { id: uid("MSG"), account: "20120001", type: "APPR_TASK", title: "新待办：十四五规划归档", body: "《学会十四五发展规划中期评估》已通过秘书处与副理事长审核，待理事长终审。", at: at(-4), read: false, link: { role: "approver", tab: "todo", instanceId: "APR-2026-010" } },
      { id: uid("MSG"), account: "20210015", type: "APPR_TASK", title: "新待办：实训基地建设方案", body: "李知远提交《职业教育分会实训基地建设方案》归档审批，待分会联络人初审。", at: at(-1), read: false, link: { role: "approver", tab: "todo", instanceId: "APR-2026-011" } },
      { id: uid("MSG"), account: "20220008", type: "APPR_TASK", title: "新待办：论文评审材料清单", body: "《学术年会论文评审材料清单》待副秘书长初审。", at: at(-1), read: false, link: { role: "approver", tab: "todo", instanceId: "APR-2026-012" } },
      { id: uid("MSG"), account: "20190021", type: "APPR_TASK", title: "新待办：会员入会审议", body: "2026 年度第二批会员入会名单待常务理事会审议。", at: at(-1), read: false, link: { role: "approver", tab: "todo", instanceId: "APR-2026-013" } }
    ];

    const announcements = [
      { id: "ANN-01", title: "关于启用学会公文与审批 OA 的通知", body: "即日起，学会公文、制度文件、会议纪要与分会材料统一在 OA 中管理，原共享目录停止新增资料。", at: at(-7), pinned: true },
      { id: "ANN-02", title: "评审材料与专家名单下载审批说明", body: "评审专家库名单、未公开评审结果等敏感资料默认不可下载，需在文档详情页提交下载申请，经秘书处审批后 24 小时内有效。", at: at(-3), pinned: false }
    ];

    return {
      __v: 4,
      roles: ROLE_DEFS,
      persona: PERSONA,
      approvers: APPROVERS,
      depts: DEPTS,
      users: USERS,
      currentUser: null,
      categories: CATEGORIES,
      docs,
      grants,
      instances,
      notifications,
      announcements,
      counters: { doc: 1020, instance: 13, grant: 6, message: notifications.length, category: 8 },
      intent: { seq: 0, role: "", tab: "", docId: null, instanceId: null, action: "" }
    };
  }

  const STATUS = {
    DRAFT: { label: "草稿", cls: "tw-bg-slate-100 tw-text-slate-600 tw-border-slate-200" },
    SUBMITTED: { label: "审批中", cls: "tw-bg-amber-50 tw-text-amber-700 tw-border-amber-200" },
    RETURNED: { label: "被退回", cls: "tw-bg-rose-50 tw-text-rose-700 tw-border-rose-200" },
    ACTIVE: { label: "已归档", cls: "tw-bg-emerald-50 tw-text-emerald-700 tw-border-emerald-200" },
    EXPIRED: { label: "已过期", cls: "tw-bg-slate-100 tw-text-slate-500 tw-border-slate-200" },
    RECYCLED: { label: "回收站", cls: "tw-bg-slate-100 tw-text-slate-500 tw-border-slate-200" },
    DELETED: { label: "已删除", cls: "tw-bg-slate-100 tw-text-slate-400 tw-border-slate-200" }
  };

  const INST_STATUS = {
    DRAFT: { label: "草稿", cls: "tw-bg-slate-100 tw-text-slate-600 tw-border-slate-200" },
    RUNNING: { label: "审批中", cls: "tw-bg-amber-50 tw-text-amber-700 tw-border-amber-200" },
    RETURNED: { label: "已退回", cls: "tw-bg-rose-50 tw-text-rose-700 tw-border-rose-200" },
    REJECTED: { label: "已驳回", cls: "tw-bg-rose-50 tw-text-rose-700 tw-border-rose-200" },
    WITHDRAWN: { label: "已撤回", cls: "tw-bg-slate-100 tw-text-slate-500 tw-border-slate-200" },
    APPROVED: { label: "已通过", cls: "tw-bg-emerald-50 tw-text-emerald-700 tw-border-emerald-200" },
    CANCELLED: { label: "已终止", cls: "tw-bg-slate-100 tw-text-slate-500 tw-border-slate-200" }
  };

  const INST_TYPE = {
    DOC_ARCHIVE: { label: "文档归档", icon: "docs", cls: "tw-bg-indigo-50 tw-text-indigo-700" },
    PERM_GRANT: { label: "权限调整", icon: "shield", cls: "tw-bg-sky-50 tw-text-sky-700" },
    SENSITIVE_DOWNLOAD: { label: "敏感下载", icon: "lock", cls: "tw-bg-rose-50 tw-text-rose-700" },
    GENERAL: { label: "通用事项", icon: "clipboard", cls: "tw-bg-slate-100 tw-text-slate-600" }
  };

  const CLASS_META = {
    public: { label: "公开", cls: "tw-bg-emerald-50 tw-text-emerald-700 tw-border-emerald-200" },
    internal: { label: "内部", cls: "tw-bg-sky-50 tw-text-sky-700 tw-border-sky-200" },
    sensitive: { label: "敏感", cls: "tw-bg-rose-50 tw-text-rose-700 tw-border-rose-200" }
  };

  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function fmtDate(v) {
    if (!v) return "—";
    const d = new Date(v);
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  function fmtDateTime(v) {
    if (!v) return "—";
    const d = new Date(v);
    return fmtDate(v) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }
  function fromNow(v) {
    if (!v) return "—";
    const diff = new Date(v).getTime() - Date.now();
    const abs = Math.abs(diff);
    if (abs < HOUR) return diff >= 0 ? Math.max(1, Math.round(diff / 60000)) + " 分钟后" : Math.round(-diff / 60000) + " 分钟前";
    if (abs < DAY) return diff >= 0 ? Math.round(diff / HOUR) + " 小时后" : Math.round(-diff / HOUR) + " 小时前";
    return diff >= 0 ? Math.round(diff / DAY) + " 天后" : Math.round(-diff / DAY) + " 天前";
  }
  function daysLeft(v) {
    if (!v) return null;
    return Math.ceil((new Date(v).getTime() - Date.now()) / DAY);
  }

  const api = {
    // ---------- 基础查询 ----------
    personaOf(role) { return this.persona[role]; },
    catName(id) { return CAT_MAP[id] || "未分类"; },
    leafCategories() {
      const out = [];
      this.categories.forEach((c) => (c.children || []).forEach((s) => out.push({ id: s.id, name: c.name + " / " + s.name, parentId: c.id })));
      return out;
    },
    approverByAccount(account) { return this.approvers.find((a) => a.account === account); },
    userByAccount(account) { return this.users.find((u) => u.account === account); },
    deptName(id) { const d = this.depts.find((x) => x.id === id); return d ? d.name : id; },
    docById(id) { return this.docs.find((d) => d.id === id); },
    instanceById(id) { return this.instances.find((i) => i.id === id); },
    grantById(id) { return this.grants.find((g) => g.id === id); },

    // ---------- 权限判定 ----------
    roleByKey(key) { return this.roles.find((r) => r.key === key) || null; },
    roleByAccount(account) { return this.roles.find((r) => r.account === account) || null; },
    capsOf(account) {
      const role = this.roleByAccount(account);
      return role ? role.caps : ["staff"];
    },
    roleOf(account) {
      const caps = this.capsOf(account);
      return caps[0] || "staff";
    },
    grantMatches(grant, account, doc, right) {
      if (grant.effect !== "allow") return false;
      if (grant.status !== "active") return false;
      if (new Date(grant.validUntil).getTime() < Date.now()) return false;
      if (right && grant.rights.indexOf(right) === -1) return false;
      if (grant.objectType === "document" && grant.objectId !== doc.id) return false;
      if (grant.objectType === "category") {
        const cat = doc.cat || "";
        if (grant.objectId === "CAT-NB" ? cat.indexOf("CAT-NB") !== 0 : cat.indexOf(grant.objectId) !== 0) return false;
      }
      if (grant.subjectType === "user") return grant.subjectId === account;
      if (grant.subjectType === "role") return this.capsOf(account).indexOf(grant.subjectId) !== -1;
      if (grant.subjectType === "dept") return grant.subjectId === doc.dept;
      return false;
    },
    activeGrantsFor(account) {
      return this.grants.filter((g) => g.status === "active" && new Date(g.validUntil).getTime() >= Date.now() && (
        (g.subjectType === "user" && g.subjectId === account) ||
        (g.subjectType === "role" && this.capsOf(account).indexOf(g.subjectId) !== -1)
      ));
    },
    hasGrant(account, doc, right) {
      if (!doc) return false;
      return this.grants.some((g) => this.grantMatches(g, account, doc, right));
    },
    canView(doc, account) {
      if (!doc) return false;
      const caps = this.capsOf(account);
      if (caps.indexOf("docadmin") !== -1 || caps.indexOf("approver") !== -1) return true;
      if (doc.status === "RECYCLED" || doc.status === "DELETED") return false;
      if (doc.ownerAccount === account) return true;
      if (doc.classification !== "sensitive") return true;
      return this.hasGrant(account, doc, "view");
    },
    canDownload(doc, account) {
      if (!this.canView(doc, account)) return { ok: false, reason: "无权查看" };
      if (doc.classification !== "sensitive") return { ok: true };
      const g = this.grants.find((x) => this.grantMatches(x, account, doc, "download") && (x.maxUses === null || (x.uses || 0) < x.maxUses));
      return g ? { ok: true, grant: g } : { ok: false, reason: "sensitive" };
    },
    visibleDocs(account) {
      return this.docs.filter((d) => this.canView(d, account));
    },

    // ---------- 文档动作 ----------
    nextDocNo(catId) {
      const cat = this.leafCategories().find((c) => c.id === catId) || { id: catId, name: this.catName(catId) };
      const code = (catId || "CAT").split("-").slice(1).join("") || "DOC";
      this.counters.doc += 1;
      const year = new Date().getFullYear();
      return "YX-" + code + "-" + year + "-" + String(this.counters.doc).slice(-4).padStart(4, "0");
    },
    uploadDoc(payload, account) {
      const user = this.userByAccount(account) || this.persona.staff;
      const doc = mkDoc({
        id: "D-" + (++this.counters.doc),
        no: payload.no || ("YX-" + new Date().getFullYear() + "-" + String(this.counters.doc).padStart(4, "0")),
        title: payload.title,
        cat: payload.cat,
        catName: this.catName(payload.cat),
        dept: payload.dept || user.deptId,
        deptName: this.deptName(payload.dept || user.deptId),
        owner: user.name,
        ownerAccount: user.account,
        classification: payload.classification || "internal",
        visibility: payload.visibility || "all",
        tags: payload.tags || [],
        summary: payload.summary || "",
        status: "DRAFT",
        version: 1,
        fileType: payload.fileType || "PDF",
        size: payload.size || "1.6 MB",
        downloads: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        archivedAt: null,
        validUntil: payload.validUntil || at(365),
        versions: [version(1, payload.fileName || (payload.title + ".pdf"), payload.size || "1.6 MB", user.name, 0, "首次上传")],
        timeline: [timeline(0, user.name, "上传文档", "创建文档并生成 V1")]
      });
      this.docs.unshift(doc);
      this.audit(user.name, "上传文档", doc.title, "成功");
      this.persist();
      return doc;
    },
    updateDoc(docId, patch) {
      const doc = this.docById(docId);
      if (!doc) return null;
      Object.assign(doc, patch, { updatedAt: new Date().toISOString() });
      this.persist();
      return doc;
    },
    submitArchive(docId, account, extra) {
      const doc = this.docById(docId);
      const user = this.userByAccount(account) || this.persona.staff;
      if (!doc) return null;
      doc.status = "SUBMITTED";
      doc.updatedAt = new Date().toISOString();
      const inst = mkInstance({
        id: uid("APR"),
        no: "SP-" + new Date().getFullYear() + "-" + String(++this.counters.instance).padStart(4, "0"),
        type: "DOC_ARCHIVE",
        title: "《" + doc.title + "》归档审批",
        status: "RUNNING",
        creator: user.name,
        creatorAccount: user.account,
        deptName: doc.deptName,
        docId: doc.id,
        dueAt: at(2),
        priority: extra && extra.priority ? extra.priority : "normal",
        form: [
          { label: "文档标题", value: doc.title },
          { label: "文档编号", value: doc.no },
          { label: "所属分类", value: doc.catName },
          { label: "密级", value: CLASS_META[doc.classification].label },
          { label: "可见范围", value: doc.visibility === "all" ? "全体会员" : doc.visibility === "dept" ? "本部门" : "指定人员" },
          { label: "归档说明", value: (extra && extra.reason) || "文档定稿，申请归档。" }
        ],
        nodes: [
          mkNode("秘书处初审", [mkTask("20180006", "王慧敏", "pending")]),
          mkNode("副理事长终审", [mkTask("20160001", "赵启明", "waiting")], "waiting")
        ],
        history: [{ at: new Date().toISOString(), actor: user.name, action: "提交归档", comment: "提交至秘书处初审" }]
      });
      doc.approvalId = inst.id;
      doc.timeline.unshift(timeline(0, user.name, "提交归档", "提交至秘书处初审"));
      this.instances.unshift(inst);
      this.notify("20180006", "新待办：文档归档", "《" + doc.title + "》待秘书处初审。", "APPR_TASK", { role: "approver", tab: "todo", instanceId: inst.id });
      this.audit(user.name, "提交归档", doc.title, "成功");
      this.persist();
      return inst;
    },
    recordDownload(doc, account) {
      if (!doc) return null;
      doc.downloads = (doc.downloads || 0) + 1;
      const grant = this.grants.find((g) => g.maxUses && this.grantMatches(g, account, doc, "download") && (g.uses || 0) < g.maxUses);
      if (grant) {
        grant.uses = (grant.uses || 0) + 1;
        if (grant.uses >= grant.maxUses) grant.status = "used";
      }
      doc.timeline.unshift(timeline(0, (this.userByAccount(account) || {}).name || "用户", "下载文档", "下载记录已写入审计"));
      this.persist();
      return doc;
    },
    startGeneral(payload, account) {
      const user = this.userByAccount(account) || this.persona.staff;
      const inst = mkInstance({
        id: uid("APR"),
        no: "SP-" + new Date().getFullYear() + "-" + String(++this.counters.instance).padStart(4, "0"),
        type: "GENERAL",
        title: payload.title || "通用审批事项",
        status: "RUNNING",
        creator: user.name,
        creatorAccount: user.account,
        deptName: this.deptName(user.deptId),
        dueAt: at(2),
        form: [
          { label: "事项标题", value: payload.title || "—" },
          { label: "接收单位", value: payload.recipient || "—" },
          { label: "事项说明", value: payload.reason || "—" }
        ],
        nodes: [mkNode("秘书处初审", [mkTask("20180006", "王慧敏", "pending")])],
        history: [{ at: new Date().toISOString(), actor: user.name, action: "提交审批", comment: payload.reason || "" }]
      });
      this.instances.unshift(inst);
      this.notify("20180006", "新待办：通用审批", user.name + " 提交「" + inst.title + "」。", "APPR_TASK", { role: "approver", tab: "todo", instanceId: inst.id });
      this.persist();
      return inst;
    },
    archiveDoc(docId, actor) {
      const doc = this.docById(docId);
      if (!doc) return null;
      doc.status = "ACTIVE";
      doc.archivedAt = new Date().toISOString();
      doc.updatedAt = doc.archivedAt;
      doc.timeline.unshift(timeline(0, actor || "陈静", "归档", "文档归档，进入正式库"));
      this.notify(doc.ownerAccount, "文档已归档", "《" + doc.title + "》已完成归档。", "DOC_ARCHIVED", { role: "staff", tab: "docs", docId: doc.id });
      this.persist();
      return doc;
    },
    unarchiveDoc(docId, actor) {
      const doc = this.docById(docId);
      if (!doc) return null;
      doc.status = "DRAFT";
      doc.archivedAt = null;
      doc.timeline.unshift(timeline(0, actor || "陈静", "取消归档", "文档恢复为草稿状态"));
      this.persist();
      return doc;
    },
    deleteDoc(docId, actor, reason) {
      const doc = this.docById(docId);
      if (!doc) return null;
      doc.prevStatus = doc.status;
      doc.status = "RECYCLED";
      doc.deletedAt = new Date().toISOString();
      doc.purgeAt = at(30);
      doc.timeline.unshift(timeline(0, actor || "陈静", "删除文档", reason || "移入回收站"));
      this.persist();
      return doc;
    },
    restoreDoc(docId, actor) {
      const doc = this.docById(docId);
      if (!doc) return null;
      doc.status = doc.prevStatus || "DRAFT";
      doc.deletedAt = null;
      doc.purgeAt = null;
      doc.timeline.unshift(timeline(0, actor || "陈静", "恢复文档", "从回收站恢复"));
      this.persist();
      return doc;
    },
    purgeDoc(docId, actor) {
      const doc = this.docById(docId);
      if (!doc) return null;
      doc.status = "DELETED";
      doc.timeline.unshift(timeline(0, actor || "陈静", "彻底删除", "文档不可恢复"));
      this.persist();
      return doc;
    },
    addVersion(docId, payload, actor) {
      const doc = this.docById(docId);
      if (!doc) return null;
      const no = doc.version + 1;
      doc.version = no;
      doc.versions.push(version(no, payload.fileName || (doc.title + "-V" + no + ".pdf"), payload.size || "1.9 MB", actor || "陈静", 0, payload.note || "更新版本"));
      doc.fileType = payload.fileType || doc.fileType;
      doc.size = payload.size || doc.size;
      doc.updatedAt = new Date().toISOString();
      doc.timeline.unshift(timeline(0, actor || "陈静", "上传新版本", "生成 V" + no + "：" + (payload.note || "")));
      this.persist();
      return doc;
    },
    rollbackVersion(docId, versionNo, actor) {
      const doc = this.docById(docId);
      if (!doc) return null;
      const target = doc.versions.find((v) => v.no === versionNo);
      if (!target) return null;
      const no = doc.version + 1;
      doc.version = no;
      doc.versions.push(version(no, target.name, target.size, actor || "陈静", 0, "回滚至 V" + versionNo));
      doc.updatedAt = new Date().toISOString();
      doc.timeline.unshift(timeline(0, actor || "陈静", "版本回滚", "以 V" + versionNo + " 内容生成 V" + no));
      this.persist();
      return doc;
    },

    // ---------- 授权 ----------
    createGrant(payload, actor) {
      const doc = payload.objectType === "document" ? this.docById(payload.objectId) : null;
      const objectName = doc ? doc.title : this.catName(payload.objectId);
      const subjectName = payload.subjectType === "user" ? (this.userByAccount(payload.subjectId) || {}).name || payload.subjectName
        : payload.subjectType === "dept" ? this.deptName(payload.subjectId)
        : payload.subjectId === "staff" ? "普通用户" : payload.subjectId === "approver" ? "审批人" : "文档管理员";
      const categoryDocs = payload.objectType === "category"
        ? this.docs.filter((d) => d.cat.indexOf(payload.objectId) === 0) : [];
      const sensitive = doc ? doc.classification === "sensitive" : categoryDocs.some((d) => d.classification === "sensitive");
      const crossDept = payload.subjectType === "dept" && (doc ? doc.dept !== payload.subjectId : true);
      const needApproval = sensitive || crossDept || Number(payload.days) > 90 || payload.forceApproval;
      const grant = {
        id: uid("G"), effect: "allow", subjectType: payload.subjectType, subjectId: payload.subjectId, subjectName,
        objectType: payload.objectType, objectId: payload.objectId, objectName,
        rights: payload.rights || ["view"], source: payload.source || "document", reason: payload.reason || "",
        validFrom: new Date().toISOString(), validUntil: at(Number(payload.days) || 30),
        status: needApproval ? "pending" : "active", grantBy: actor || "陈静",
        approvalId: null, uses: 0, maxUses: payload.maxUses || null
      };
      if (needApproval) {
        const inst = mkInstance({
          id: uid("APR"),
          no: "SP-" + new Date().getFullYear() + "-" + String(++this.counters.instance).padStart(4, "0"),
          type: "PERM_GRANT",
          title: "「" + objectName + "」授权审批",
          status: "RUNNING",
          creator: actor || "陈静",
          creatorAccount: (this.users.find((u) => u.name === (actor || "陈静")) || this.persona.docadmin).account,
          deptName: (this.users.find((u) => u.name === (actor || "陈静")) || this.persona.docadmin).deptName,
          docId: doc ? doc.id : null,
          dueAt: at(1),
          form: [
            { label: "授权对象", value: objectName },
            { label: "被授权" + (payload.subjectType === "dept" ? "部门" : payload.subjectType === "role" ? "角色" : "人"), value: subjectName },
            { label: "权限项", value: grant.rights.join("、") },
            { label: "期限", value: (payload.days || 30) + " 天" },
            { label: "授权用途", value: payload.reason || "—" },
            { label: "风险提示", value: sensitive ? "敏感文档授权，需秘书处审批" : crossDept ? "跨分会授权，需秘书处审批" : "期限超过 90 天，需秘书处审批" }
          ],
          payload: { objectType: payload.objectType, objectId: payload.objectId, subjectType: payload.subjectType, subjectId: payload.subjectId, rights: grant.rights, days: payload.days, reason: payload.reason },
          nodes: [mkNode("秘书处初审", [mkTask("20180006", "王慧敏", "pending")])],
          history: [{ at: new Date().toISOString(), actor: actor || "陈静", action: "提交审批", comment: "提交授权审批" }]
        });
        grant.approvalId = inst.id;
        this.instances.unshift(inst);
        this.notify("20180006", "新待办：授权审批", "「" + objectName + "」授权待秘书处初审。", "APPR_TASK", { role: "approver", tab: "todo", instanceId: inst.id });
        this.persist();
        return { status: "pending", grant, instance: inst };
      }
      this.grants.unshift(grant);
      if (grant.subjectType === "user") {
        this.notify(grant.subjectId, "新授权已生效", "您已获得「" + objectName + "」的" + grant.rights.join("、") + "权限，有效期至 " + fmtDate(grant.validUntil) + "。", "GRANT_ACTIVE", { role: "staff", tab: "perm" });
      }
      this.audit(actor || "陈静", "授予权限", objectName + " → " + subjectName, "成功");
      this.persist();
      return { status: "active", grant };
    },
    revokeGrant(grantId, actor, reason) {
      const grant = this.grantById(grantId);
      if (!grant) return null;
      grant.status = "revoked";
      grant.revokedAt = new Date().toISOString();
      grant.revokeReason = reason || "管理员收回";
      this.audit(actor || "陈静", "收回权限", grant.objectName + " → " + grant.subjectName, "成功");
      this.persist();
      return grant;
    },

    // ---------- 审批申请 ----------
    requestPermission(payload, account) {
      const user = this.userByAccount(account) || this.persona.staff;
      const doc = payload.objectType === "document" ? this.docById(payload.objectId) : null;
      const objectName = doc ? doc.title : this.catName(payload.objectId);
      const inst = mkInstance({
        id: uid("APR"),
        no: "SP-" + new Date().getFullYear() + "-" + String(++this.counters.instance).padStart(4, "0"),
        type: "PERM_GRANT",
        title: "「" + objectName + "」权限申请",
        status: "RUNNING",
        creator: user.name,
        creatorAccount: user.account,
        deptName: this.deptName(user.deptId),
        docId: doc ? doc.id : null,
        dueAt: at(2),
        form: [
          { label: "申请对象", value: objectName + (doc ? "（" + doc.no + "）" : "（分类）") },
          { label: "申请权限", value: (payload.rights || ["view"]).join("、") },
          { label: "申请期限", value: (payload.days || 30) + " 天" },
          { label: "申请用途", value: payload.reason || "—" }
        ],
        payload: { objectType: payload.objectType, objectId: payload.objectId, rights: payload.rights, days: payload.days, reason: payload.reason },
        nodes: [mkNode("秘书处初审", [mkTask("20180006", "王慧敏", "pending")])],
        history: [{ at: new Date().toISOString(), actor: user.name, action: "提交申请", comment: payload.reason || "" }]
      });
      this.instances.unshift(inst);
      this.notify("20180006", "新待办：权限申请", user.name + " 申请「" + objectName + "」权限。", "APPR_TASK", { role: "approver", tab: "todo", instanceId: inst.id });
      this.persist();
      return inst;
    },
    requestSensitiveDownload(docId, reason, account) {
      const doc = this.docById(docId);
      const user = this.userByAccount(account) || this.persona.staff;
      const inst = mkInstance({
        id: uid("APR"),
        no: "SP-" + new Date().getFullYear() + "-" + String(++this.counters.instance).padStart(4, "0"),
        type: "SENSITIVE_DOWNLOAD",
        title: "《" + doc.title + "》下载审批",
        status: "RUNNING",
        creator: user.name,
        creatorAccount: user.account,
        deptName: this.deptName(user.deptId),
        docId: doc.id,
        dueAt: at(1),
        priority: "urgent",
        form: [
          { label: "文档", value: doc.title + "（" + doc.no + "）" },
          { label: "密级", value: "敏感" },
          { label: "下载用途", value: reason || "—" },
          { label: "使用范围", value: "本人" },
          { label: "有效期", value: "24 小时，仅可下载 1 次" }
        ],
        payload: { objectType: "document", objectId: doc.id, rights: ["download"], hours: 24 },
        nodes: [mkNode("秘书处初审", [mkTask("20180006", "王慧敏", "pending")])],
        history: [{ at: new Date().toISOString(), actor: user.name, action: "提交申请", comment: reason || "" }]
      });
      this.instances.unshift(inst);
      this.notify("20180006", "新待办：敏感文档下载", user.name + " 申请下载《" + doc.title + "》。", "APPR_TASK", { role: "approver", tab: "todo", instanceId: inst.id });
      this.persist();
      return inst;
    },

    // ---------- 审批处理 ----------
    todoFor(account) {
      const out = [];
      this.instances.forEach((inst) => {
        if (inst.status !== "RUNNING") return;
        const node = inst.nodes[inst.currentNode];
        if (!node) return;
        node.tasks.forEach((t) => {
          if (t.account === account && t.status === "pending") out.push({ instance: inst, node, task: t });
        });
      });
      return out.sort((a, b) => new Date(a.instance.dueAt) - new Date(b.instance.dueAt));
    },
    doneFor(account) {
      const out = [];
      this.instances.forEach((inst) => {
        inst.nodes.forEach((node) => {
          node.tasks.forEach((t) => {
            if (t.account === account && t.status !== "pending" && t.status !== "waiting") {
              out.push({ instance: inst, node, task: t });
            }
          });
        });
      });
      return out.sort((a, b) => new Date(b.task.handledAt || 0) - new Date(a.task.handledAt || 0));
    },
    instancesFor(account) {
      return this.instances.filter((i) => i.creatorAccount === account || i.nodes.some((n) => n.tasks.some((t) => t.account === account)));
    },
    handleTask(instanceId, account, action, payload) {
      const inst = this.instanceById(instanceId);
      if (!inst) return { ok: false, message: "实例不存在" };
      if (inst.status !== "RUNNING") return { ok: false, message: "流程已结束" };
      const node = inst.nodes[inst.currentNode];
      const task = node && node.tasks.find((t) => t.account === account && t.status === "pending");
      if (!task) return { ok: false, message: "任务已被处理" };
      const actor = (this.approverByAccount(account) || {}).name || account;
      const comment = (payload && payload.comment) || "";
      const time = new Date().toISOString();
      payload = payload || {};

      if (action === "approve") {
        task.status = "approved";
        task.comment = comment || "同意";
        task.handledAt = time;
        inst.history.push({ at: time, actor, action: "同意", comment: task.comment });
        const allDone = node.tasks.every((t) => t.status === "approved");
        if (allDone) {
          node.status = "approved";
          const next = inst.nodes[inst.currentNode + 1];
          if (next) {
            inst.currentNode += 1;
            next.status = "pending";
            next.tasks.forEach((t) => { if (t.status === "waiting") t.status = "pending"; });
            inst.dueAt = at(1);
            next.tasks.forEach((t) => this.notify(t.account, "新待办：审批流转", "《" + inst.title + "》已流转至「" + next.name + "」。", "APPR_TASK", { role: "approver", tab: "todo", instanceId: inst.id }));
          } else {
            inst.status = "APPROVED";
            inst.finishedAt = time;
            this.applyEffect(inst);
            this.notify(inst.creatorAccount, "审批已通过", "您提交的《" + inst.title + "》已审批通过。", "APPR_PASS", { role: "staff", tab: "approvals", instanceId: inst.id });
          }
        }
      } else if (action === "return") {
        task.status = "returned";
        task.comment = comment;
        task.handledAt = time;
        node.status = "returned";
        inst.status = "RETURNED";
        inst.history.push({ at: time, actor, action: "退回", comment });
        const doc = inst.docId && this.docById(inst.docId);
        if (doc) doc.status = "RETURNED";
        this.notify(inst.creatorAccount, "审批被退回", "《" + inst.title + "》被退回：" + comment, "APPR_RETURN", { role: "staff", tab: "approvals", instanceId: inst.id });
      } else if (action === "reject") {
        task.status = "rejected";
        task.comment = comment;
        task.handledAt = time;
        node.status = "rejected";
        inst.status = "REJECTED";
        inst.finishedAt = time;
        inst.history.push({ at: time, actor, action: "驳回", comment });
        const doc = inst.docId && this.docById(inst.docId);
        if (doc) doc.status = "DRAFT";
        this.notify(inst.creatorAccount, "审批被驳回", "《" + inst.title + "》被驳回：" + comment, "APPR_REJECT", { role: "staff", tab: "approvals", instanceId: inst.id });
      } else if (action === "transfer") {
        const target = this.approverByAccount(payload.targetAccount);
        if (!target) return { ok: false, message: "请选择转办人" };
        task.account = target.account;
        task.name = target.name;
        inst.history.push({ at: time, actor, action: "转办", comment: "转办给 " + target.name + "：" + (comment || "—") });
        this.notify(target.account, "新待办：转办任务", actor + " 将《" + inst.title + "》转办给您。", "APPR_TASK", { role: "approver", tab: "todo", instanceId: inst.id });
      } else if (action === "addsign") {
        const targets = (payload.targets || []).map((a) => this.approverByAccount(a)).filter(Boolean);
        if (!targets.length) return { ok: false, message: "请选择加签人" };
        targets.forEach((t) => {
          if (!node.tasks.some((x) => x.account === t.account)) node.tasks.push(mkTask(t.account, t.name, "pending"));
          this.notify(t.account, "新待办：加签", actor + " 加签您参与《" + inst.title + "》审批。", "APPR_TASK", { role: "approver", tab: "todo", instanceId: inst.id });
        });
        inst.history.push({ at: time, actor, action: "加签", comment: "加签：" + targets.map((t) => t.name).join("、") });
      }
      this.audit(actor, "审批处理", inst.title + "：" + action, "成功");
      this.persist();
      return { ok: true, instance: inst };
    },
    applyEffect(inst) {
      if (inst.type === "DOC_ARCHIVE") {
        const doc = this.docById(inst.docId);
        if (doc) {
          doc.status = "ACTIVE";
          doc.archivedAt = new Date().toISOString();
          doc.timeline.unshift(timeline(0, "系统", "归档完成", "审批通过，文档归档"));
        }
      } else if (inst.type === "PERM_GRANT") {
        const p = inst.payload || {};
        const doc = p.objectType === "document" ? this.docById(p.objectId) : null;
        this.grants.unshift({
          id: uid("G"), effect: "allow", subjectType: p.subjectType || "user", subjectId: p.subjectId || inst.creatorAccount,
          subjectName: p.subjectType === "dept" ? this.deptName(p.subjectId) : (this.userByAccount(p.subjectId || inst.creatorAccount) || {}).name || inst.creator,
          objectType: p.objectType, objectId: p.objectId, objectName: doc ? doc.title : this.catName(p.objectId),
          rights: p.rights || ["view"], source: "approval", reason: p.reason || "审批通过自动授权",
          validFrom: new Date().toISOString(), validUntil: at(p.days || 30), status: "active",
          grantBy: inst.creator, approvalId: inst.id, uses: 0, maxUses: null
        });
        this.notify(p.subjectId || inst.creatorAccount, "授权已生效", "「" + (doc ? doc.title : this.catName(p.objectId)) + "」授权已审批通过。", "GRANT_ACTIVE", { role: "staff", tab: "perm" });
      } else if (inst.type === "SENSITIVE_DOWNLOAD") {
        const doc = this.docById(inst.docId);
        if (doc) {
          this.grants.unshift({
            id: uid("G"), effect: "allow", subjectType: "user", subjectId: inst.creatorAccount, subjectName: inst.creator,
            objectType: "document", objectId: doc.id, objectName: doc.title,
            rights: ["download"], source: "temporary", reason: "敏感文档下载（一次性）",
            validFrom: new Date().toISOString(), validUntil: at(1), status: "active",
            grantBy: "系统", approvalId: inst.id, uses: 0, maxUses: 1
          });
          this.notify(inst.creatorAccount, "下载申请已通过", "《" + doc.title + "》下载授权已生效，24 小时内可下载 1 次。", "APPR_PASS", { role: "staff", tab: "docs", docId: doc.id });
        }
      }
    },
    withdrawInstance(instanceId, account) {
      const inst = this.instanceById(instanceId);
      if (!inst || inst.creatorAccount !== account) return { ok: false, message: "仅发起人可撤回" };
      if (inst.status !== "RUNNING") return { ok: false, message: "当前状态不可撤回" };
      const handled = inst.nodes.some((n) => n.tasks.some((t) => t.status === "approved" || t.status === "returned" || t.status === "rejected"));
      if (handled) return { ok: false, message: "已有节点处理，不可撤回" };
      inst.status = "WITHDRAWN";
      inst.finishedAt = new Date().toISOString();
      inst.nodes.forEach((n) => { n.status = "cancelled"; n.tasks.forEach((t) => { if (t.status === "pending" || t.status === "waiting") t.status = "cancelled"; }); });
      inst.history.push({ at: new Date().toISOString(), actor: inst.creator, action: "撤回", comment: "发起人撤回审批" });
      const doc = inst.docId && this.docById(inst.docId);
      if (doc && doc.status === "SUBMITTED") doc.status = "DRAFT";
      this.persist();
      return { ok: true };
    },
    urgeInstance(instanceId, account) {
      const inst = this.instanceById(instanceId);
      if (!inst || inst.status !== "RUNNING") return { ok: false, message: "当前状态不可催办" };
      const node = inst.nodes[inst.currentNode];
      inst.urgeCount = (inst.urgeCount || 0) + 1;
      inst.history.push({ at: new Date().toISOString(), actor: (this.userByAccount(account) || {}).name || "用户", action: "催办", comment: "已提醒当前处理人" });
      if (node) node.tasks.forEach((t) => { if (t.status === "pending") this.notify(t.account, "审批催办提醒", "《" + inst.title + "》等待您处理，发起人已催办。", "APPR_URGE", { role: "approver", tab: "todo", instanceId: inst.id }); });
      this.persist();
      return { ok: true };
    },

    // ---------- 通知 ----------
    notify(account, title, body, type, link) {
      if (!account) return;
      this.notifications.unshift({ id: uid("MSG"), account, type: type || "INFO", title, body, at: new Date().toISOString(), read: false, link: link || null });
    },
    unreadFor(account) { return this.notifications.filter((n) => n.account === account && !n.read).length; },
    notificationsFor(account) { return this.notifications.filter((n) => n.account === account); },
    markRead(id) { const n = this.notifications.find((x) => x.id === id); if (n) { n.read = true; this.persist(); } },
    markAllRead(account) { this.notifications.forEach((n) => { if (n.account === account) n.read = true; }); this.persist(); },

    // ---------- 统计 ----------
    docStats() {
      const live = this.docs.filter((d) => d.status !== "RECYCLED" && d.status !== "DELETED");
      return {
        total: live.length,
        active: live.filter((d) => d.status === "ACTIVE").length,
        pending: live.filter((d) => d.status === "SUBMITTED").length,
        sensitive: live.filter((d) => d.classification === "sensitive").length,
        downloads: live.reduce((s, d) => s + (d.downloads || 0), 0),
        recycled: this.docs.filter((d) => d.status === "RECYCLED").length
      };
    },
    categoryStats() {
      return this.categories.map((c) => {
        const docs = this.docs.filter((d) => d.cat.indexOf(c.id) === 0 && d.status !== "DELETED");
        return { id: c.id, name: c.name, count: docs.length, downloads: docs.reduce((s, d) => s + (d.downloads || 0), 0) };
      });
    },
    topDownloads(n) {
      return this.docs.filter((d) => d.status !== "DELETED").slice().sort((a, b) => b.downloads - a.downloads).slice(0, n || 5);
    },
    expiringGrants(days) {
      const limit = days || 7;
      return this.grants.filter((g) => {
        if (g.status !== "active") return false;
        const left = daysLeft(g.validUntil);
        return left !== null && left >= 0 && left <= limit;
      }).sort((a, b) => new Date(a.validUntil) - new Date(b.validUntil));
    },
    approvalStats() {
      const all = this.instances;
      const done = all.filter((i) => ["APPROVED", "REJECTED", "RETURNED", "WITHDRAWN"].indexOf(i.status) >= 0);
      const returned = all.filter((i) => i.status === "RETURNED" || i.status === "REJECTED").length;
      const avgHours = (() => {
        const arr = all.filter((i) => i.finishedAt && i.submittedAt).map((i) => (new Date(i.finishedAt) - new Date(i.submittedAt)) / HOUR);
        return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
      })();
      return {
        total: all.length,
        running: all.filter((i) => i.status === "RUNNING").length,
        done: done.length,
        returnedRate: all.length ? Math.round(returned / all.length * 100) : 0,
        avgHours,
        byType: Object.keys(INST_TYPE).map((k) => ({ type: k, label: INST_TYPE[k].label, count: all.filter((i) => i.type === k).length }))
      };
    },

    // ---------- 审计（简化） ----------
    audit(actor, action, object, result) {
      this.lastAudit = { at: new Date().toISOString(), actor, action, object, result };
      const doc = this.docs.find((d) => d.title === object || (d.no && object && object.indexOf(d.no) >= 0));
      if (doc && ["下载文档", "授予权限", "收回权限", "审批处理"].indexOf(action) >= 0) {
        doc.timeline.unshift({ at: new Date().toISOString(), actor, action, note: object });
      }
    },

    // ---------- 导航 / UI ----------
    goto(role, tab, extra) {
      this.intent.role = role;
      this.intent.tab = tab || this.intent.tab || "home";
      this.intent.docId = (extra && extra.docId) || null;
      this.intent.instanceId = (extra && extra.instanceId) || null;
      this.intent.action = (extra && extra.action) || "";
      this.intent.seq += 1;
    },
    toast(message, type) {
      const seq = (this.ui.toast ? this.ui.toast.seq : 0) + 1;
      this.ui.toast = { message, type: type || "success", seq };
      if (this._toastTimer) clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => {
        if (this.ui.toast && this.ui.toast.seq === seq) this.ui.toast = null;
      }, 3200);
    },
    confirm(opts) {
      return new Promise((resolve) => {
        this.ui.dialog = Object.assign({
          open: true, title: "确认操作", text: "", okText: "确定", cancelText: "取消", danger: false
        }, opts || {}, { resolve });
      });
    },
    closeDialog(ok) {
      const d = this.ui.dialog;
      if (d && d.resolve) d.resolve(ok);
      this.ui.dialog = { open: false, resolve: null };
    },
    persist() {
      try {
        const data = {
          __v: 4, persona: this.persona, approvers: this.approvers, depts: this.depts, users: this.users,
          categories: this.categories, docs: this.docs, grants: this.grants, instances: this.instances,
          notifications: this.notifications, announcements: this.announcements, counters: this.counters
        };
        localStorage.setItem(KEY, JSON.stringify(data));
      } catch (e) { /* 忽略存储异常 */ }
    },
    reset() {
      try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    }
  };

  function createStore() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { saved = null; }
    const base = saved && saved.__v === 4 ? saved : seed();
    // 角色定义始终以当前代码为准，避免旧缓存缺少新岗位
    base.roles = ROLE_DEFS;
    base.persona = PERSONA;
    base.approvers = APPROVERS;
    base.users = USERS;
    base.currentUser = null;
    const state = Vue.reactive(base);
    state.ui = Vue.reactive({
      toast: null,
      dialog: { open: false, resolve: null }
    });
    const store = Object.assign(state, api);
    store.h = {
      fmtDate, fmtDateTime, fromNow, daysLeft,
      status: (s) => STATUS[s] || STATUS.ACTIVE,
      instStatus: (s) => INST_STATUS[s] || INST_STATUS.RUNNING,
      type: (t) => INST_TYPE[t] || INST_TYPE.GENERAL,
      classification: (c) => CLASS_META[c] || CLASS_META.internal,
      rights: (arr) => (arr || []).map((r) => ({ view: "查看", download: "下载", edit: "编辑", manage: "管理" }[r] || r)).join("、"),
      visibility: (v) => ({ all: "全体会员", dept: "本分支机构", user: "指定人员", private: "仅本人", role: "指定角色" }[v] || v),
      size: (v) => v || "—"
    };
    return store;
  }

  window.OaDemo = window.OaDemo || {};
  window.OaDemo.createStore = createStore;
  window.OaDemo.KEY = KEY;
})();
