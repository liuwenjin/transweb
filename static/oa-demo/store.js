/**
 * 院系文档权限与审批 OA · 三角色演示数据与业务动作
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

  const KEY = "oa-demo-state-v3";
  const DAY = 24 * 60 * 60 * 1000;
  const HOUR = 60 * 60 * 1000;
  const now = Date.now();
  const at = (days, hours) => new Date(now + (days || 0) * DAY + (hours || 0) * HOUR).toISOString();
  const uid = (prefix) => prefix + "-" + Math.random().toString(36).slice(2, 7).toUpperCase();

  const PERSONA = {
    staff: { account: "20230001", name: "李知远", title: "讲师", deptId: "D01", deptName: "教务办公室", role: "staff", roleName: "普通用户" },
    approver: { account: "20180006", name: "王慧敏", title: "院办主任", deptId: "D03", deptName: "院办公室", role: "approver", roleName: "审批人" },
    docadmin: { account: "20150012", name: "陈静", title: "文档管理员", deptId: "D03", deptName: "院办公室", role: "docadmin", roleName: "文档管理员" }
  };

  const APPROVERS = [
    { account: "20180006", name: "王慧敏", title: "院办主任" },
    { account: "20160001", name: "赵启明", title: "分管副院长" }
  ];

  const DEPTS = [
    { id: "D01", name: "教务办公室" },
    { id: "D02", name: "科研办公室" },
    { id: "D03", name: "院办公室" },
    { id: "D04", name: "学生工作办公室" }
  ];

  const USERS = [
    { account: "20230001", name: "李知远", deptId: "D01", deptName: "教务办公室", title: "讲师" },
    { account: "20220008", name: "张倩", deptId: "D02", deptName: "科研办公室", title: "科研秘书" },
    { account: "20210015", name: "周明", deptId: "D01", deptName: "教务办公室", title: "副教授" },
    { account: "20190021", name: "刘洋", deptId: "D04", deptName: "学生工作办公室", title: "辅导员" },
    { account: "20180006", name: "王慧敏", deptId: "D03", deptName: "院办公室", title: "院办主任" },
    { account: "20160001", name: "赵启明", deptId: "D03", deptName: "院办公室", title: "分管副院长" },
    { account: "20150012", name: "陈静", deptId: "D03", deptName: "院办公室", title: "文档管理员" }
  ];

  const CATEGORIES = [
    { id: "CAT-ZD", code: "ZD", name: "制度文件", children: [
      { id: "CAT-ZD-JX", code: "ZD-JX", name: "教学管理" },
      { id: "CAT-ZD-XZ", code: "ZD-XZ", name: "行政管理" }
    ]},
    { id: "CAT-XZ", code: "XZ", name: "行政材料", children: [
      { id: "CAT-XZ-WJ", code: "XZ-WJ", name: "发文与函件" },
      { id: "CAT-XZ-HY", code: "XZ-HY", name: "会议纪要" }
    ]},
    { id: "CAT-YW", code: "YW", name: "业务文档", children: [
      { id: "CAT-YW-JX", code: "YW-JX", name: "教学运行" },
      { id: "CAT-YW-KY", code: "YW-KY", name: "科研管理" }
    ]},
    { id: "CAT-NB", code: "NB", name: "内部资料", children: [
      { id: "CAT-NB-NB", code: "NB-NB", name: "内部参考" },
      { id: "CAT-NB-ZL", code: "NB-ZL", name: "专项材料" }
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
      id: "", no: "", title: "", cat: "", catName: "", dept: "D03", deptName: "院办公室",
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
        id: "D-1001", no: "YX-ZD-2026-0001", title: "本科教学管理制度汇编", cat: "CAT-ZD-JX", catName: CAT_MAP["CAT-ZD-JX"],
        owner: "陈静", ownerAccount: "20150012", classification: "internal", visibility: "all",
        tags: ["教学", "制度"], summary: "收录本科教学运行、学籍管理、考试管理等 12 项制度，作为院系教学管理的基本依据。",
        status: "ACTIVE", version: 2, downloads: 128, createdAt: at(-160), updatedAt: at(-30), archivedAt: at(-28),
        approvalId: "APR-2026-001",
        versions: [
          version(1, "本科教学管理制度汇编（2025版）.pdf", "2.1 MB", "陈静", -150, "2025 版首次归档"),
          version(2, "本科教学管理制度汇编（2026修订）.pdf", "2.4 MB", "陈静", -30, "补充考试管理与推免细则")
        ],
        timeline: [
          timeline(-150, "陈静", "上传文档", "创建文档并生成 V1"),
          timeline(-149, "王慧敏", "审批通过", "归档审批通过"),
          timeline(-30, "陈静", "上传新版本", "更新为 2026 修订版 V2"),
          timeline(-6, "李知远", "下载文档", "下载 2026 修订版")
        ]
      }),
      mkDoc({
        id: "D-1002", no: "YX-ZD-2026-0002", title: "2026 年度教学工作计划", cat: "CAT-ZD-JX", catName: CAT_MAP["CAT-ZD-JX"],
        tags: ["教学", "计划"], summary: "明确 2026 年教学重点任务、时间节点与责任部门。",
        status: "ACTIVE", version: 1, downloads: 86, createdAt: at(-70), updatedAt: at(-18), archivedAt: at(-17),
        versions: [version(1, "2026年度教学工作计划.pdf", "1.2 MB", "陈静", -18, "定稿归档")],
        timeline: [timeline(-18, "陈静", "上传文档", "创建文档"), timeline(-17, "王慧敏", "审批通过", "归档审批通过")]
      }),
      mkDoc({
        id: "D-1003", no: "YX-ZD-2026-0003", title: "研究生推免实施细则", cat: "CAT-ZD-JX", catName: CAT_MAP["CAT-ZD-JX"],
        classification: "sensitive", visibility: "user", tags: ["研究生", "推免", "敏感"],
        summary: "推免资格、综合测评与名额分配细则，仅限参与推免工作人员查阅。",
        status: "ACTIVE", version: 3, downloads: 12, createdAt: at(-200), updatedAt: at(-9), archivedAt: at(-8),
        versions: [
          version(1, "推免实施细则（2024）.pdf", "1.6 MB", "陈静", -190, "2024 版"),
          version(2, "推免实施细则（2025）.pdf", "1.7 MB", "陈静", -100, "2025 修订"),
          version(3, "推免实施细则（2026）.pdf", "1.8 MB", "陈静", -9, "2026 修订，调整名额分配")
        ],
        timeline: [timeline(-9, "陈静", "上传新版本", "更新为 2026 版 V3"), timeline(-8, "赵启明", "审批通过", "敏感文档归档审批")]
      }),
      mkDoc({
        id: "D-1004", no: "YX-XZ-2026-0004", title: "院系经费报销指引", cat: "CAT-XZ-WJ", catName: CAT_MAP["CAT-XZ-WJ"],
        tags: ["财务", "报销"], summary: "差旅、会议、材料等常见报销场景的办理流程与材料清单。",
        status: "ACTIVE", version: 1, downloads: 64, createdAt: at(-90), updatedAt: at(-40), archivedAt: at(-39),
        versions: [version(1, "院系经费报销指引.pdf", "980 KB", "陈静", -40, "定稿归档")]
      }),
      mkDoc({
        id: "D-1005", no: "YX-YW-2026-0005", title: "实验室安全检查记录（2026Q3）", cat: "CAT-YW-KY", catName: CAT_MAP["CAT-YW-KY"],
        tags: ["实验室", "安全"], summary: "第三季度实验室安全检查记录、隐患整改与复查结论。",
        status: "ACTIVE", version: 1, downloads: 23, createdAt: at(-40), updatedAt: at(-5), archivedAt: at(-4),
        versions: [version(1, "实验室安全检查记录-2026Q3.pdf", "3.2 MB", "陈静", -5, "汇总归档")]
      }),
      mkDoc({
        id: "D-1006", no: "YX-ZD-2026-0006", title: "教职工年度考核办法（征求意见稿）", cat: "CAT-ZD-XZ", catName: CAT_MAP["CAT-ZD-XZ"],
        owner: "李知远", ownerAccount: "20230001", dept: "D01", deptName: "教务办公室",
        tags: ["考核", "征求意见"], summary: "拟修订的年度考核办法，尚在征求意见阶段，未正式归档。",
        status: "DRAFT", version: 1, downloads: 0, createdAt: at(-3), updatedAt: at(-2), archivedAt: null,
        versions: [version(1, "年度考核办法（征求意见稿）.docx", "460 KB", "李知远", -3, "初稿")],
        timeline: [timeline(-2, "李知远", "编辑文档", "补充教学工作量计算说明")]
      }),
      mkDoc({
        id: "D-1007", no: "YX-NB-2026-0007", title: "学科建设专项材料", cat: "CAT-NB-ZL", catName: CAT_MAP["CAT-NB-ZL"],
        classification: "sensitive", visibility: "user", tags: ["学科建设", "专项", "敏感"],
        summary: "学科评估支撑材料与经费测算，仅限专项工作组成员查阅。",
        status: "ACTIVE", version: 1, downloads: 5, createdAt: at(-50), updatedAt: at(-6), archivedAt: at(-5),
        versions: [version(1, "学科建设专项材料（2026）.pdf", "8.6 MB", "陈静", -6, "专项材料归档")]
      }),
      mkDoc({
        id: "D-1008", no: "YX-YW-2026-0008", title: "教学成果奖申报材料", cat: "CAT-YW-JX", catName: CAT_MAP["CAT-YW-JX"],
        owner: "李知远", ownerAccount: "20230001", dept: "D01", deptName: "教务办公室",
        tags: ["教学成果", "申报"], summary: "2026 年校级教学成果奖申报书、支撑材料与成果总结。",
        status: "SUBMITTED", version: 1, downloads: 3, createdAt: at(-6), updatedAt: at(-1), archivedAt: null,
        approvalId: "APR-2026-003",
        versions: [version(1, "教学成果奖申报材料.pdf", "6.4 MB", "李知远", -1, "提交归档审批")],
        timeline: [timeline(-1, "李知远", "提交归档", "提交至院办初审")]
      }),
      mkDoc({
        id: "D-1009", no: "YX-YW-2026-0009", title: "学生实习基地合作协议", cat: "CAT-YW-JX", catName: CAT_MAP["CAT-YW-JX"],
        classification: "sensitive", visibility: "user", tags: ["实习", "协议", "敏感"],
        summary: "与 6 家实习基地签订的合作协议扫描件与续签计划。",
        status: "ACTIVE", version: 1, downloads: 9, createdAt: at(-120), updatedAt: at(-20), archivedAt: at(-19),
        versions: [version(1, "实习基地合作协议汇编.pdf", "12.3 MB", "陈静", -20, "协议归档")]
      }),
      mkDoc({
        id: "D-1010", no: "YX-XZ-2026-0010", title: "院系会议室使用登记表", cat: "CAT-XZ-HY", catName: CAT_MAP["CAT-XZ-HY"],
        tags: ["会议室", "登记"], summary: "2026 年会议室使用登记与协调记录。",
        status: "ACTIVE", version: 1, downloads: 41, createdAt: at(-30), updatedAt: at(-2), archivedAt: at(-1),
        versions: [version(1, "会议室使用登记表-2026.xlsx", "220 KB", "陈静", -2, "月度汇总")]
      }),
      mkDoc({
        id: "D-1011", no: "YX-NB-2026-0011", title: "新入职教师培训手册", cat: "CAT-NB-NB", catName: CAT_MAP["CAT-NB-NB"],
        owner: "李知远", ownerAccount: "20230001", dept: "D01", deptName: "教务办公室",
        tags: ["新教师", "培训"], summary: "新入职教师培训安排、导师制要求与教学规范。",
        status: "RETURNED", version: 1, downloads: 0, createdAt: at(-10), updatedAt: at(-3), archivedAt: null,
        approvalId: "APR-2026-004",
        versions: [version(1, "新入职教师培训手册.pdf", "2.2 MB", "李知远", -4, "提交归档审批")],
        timeline: [timeline(-3, "王慧敏", "退回", "请补充培训课时安排与考核方式")]
      }),
      mkDoc({
        id: "D-1012", no: "YX-XZ-2026-0012", title: "2025 年度工作总结", cat: "CAT-XZ-WJ", catName: CAT_MAP["CAT-XZ-WJ"],
        tags: ["总结", "年度"], summary: "2025 年度院系工作总结与 2026 年工作要点。",
        status: "ACTIVE", version: 1, downloads: 77, createdAt: at(-300), updatedAt: at(-100), archivedAt: at(-99),
        versions: [version(1, "2025年度工作总结.pdf", "1.4 MB", "陈静", -100, "定稿归档")]
      }),
      mkDoc({
        id: "D-1013", no: "YX-YW-2025-0013", title: "旧版课程大纲（2019）", cat: "CAT-YW-JX", catName: CAT_MAP["CAT-YW-JX"],
        tags: ["课程大纲", "历史"], summary: "2019 版课程大纲，已被 2025 版替代。",
        status: "RECYCLED", version: 1, downloads: 0, createdAt: at(-500), updatedAt: at(-4),
        deletedAt: at(-3), purgeAt: at(27), prevStatus: "ACTIVE",
        versions: [version(1, "课程大纲2019.pdf", "3.8 MB", "陈静", -500, "历史版本")],
        timeline: [timeline(-3, "陈静", "删除文档", "已被新版替代，移入回收站")]
      }),
      mkDoc({
        id: "D-1014", no: "YX-XZ-2024-0014", title: "2024 年招生简章", cat: "CAT-XZ-WJ", catName: CAT_MAP["CAT-XZ-WJ"],
        tags: ["招生", "简章"], summary: "2024 年招生简章，已过有效期。",
        status: "EXPIRED", version: 1, downloads: 54, createdAt: at(-420), updatedAt: at(-30),
        validUntil: at(-10), archivedAt: at(-400),
        versions: [version(1, "2024年招生简章.pdf", "5.1 MB", "陈静", -400, "定稿归档")]
      }),
      mkDoc({
        id: "D-1015", no: "YX-ZD-2026-0015", title: "院系印章使用管理规定", cat: "CAT-ZD-XZ", catName: CAT_MAP["CAT-ZD-XZ"],
        tags: ["印章", "规定"], summary: "印章保管、使用审批与登记要求。",
        status: "ACTIVE", version: 1, downloads: 31, createdAt: at(-80), updatedAt: at(-12), archivedAt: at(-11),
        versions: [version(1, "院系印章使用管理规定.pdf", "760 KB", "陈静", -12, "定稿归档")]
      })
    ];

    const grants = [
      {
        id: "G-001", effect: "allow", subjectType: "user", subjectId: "20230001", subjectName: "李知远",
        objectType: "document", objectId: "D-1002", objectName: "2026 年度教学工作计划",
        rights: ["view", "download"], source: "document", reason: "承担教学计划编制工作",
        validFrom: at(-10), validUntil: at(20), status: "active", grantBy: "陈静",
        approvalId: "APR-2026-001", uses: 3, maxUses: null
      },
      {
        id: "G-002", effect: "allow", subjectType: "dept", subjectId: "D02", subjectName: "科研办公室",
        objectType: "category", objectId: "CAT-NB", objectName: "内部资料",
        rights: ["view"], source: "approval", reason: "学科建设联合工作查阅内部资料",
        validFrom: at(-24), validUntil: at(6), status: "active", grantBy: "陈静",
        approvalId: "APR-2025-086", uses: 0, maxUses: null
      },
      {
        id: "G-003", effect: "allow", subjectType: "user", subjectId: "20230001", subjectName: "李知远",
        objectType: "document", objectId: "D-1007", objectName: "学科建设专项材料",
        rights: ["view"], source: "approval", reason: "专项工作组材料查阅",
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
        objectType: "document", objectId: "D-1003", objectName: "研究生推免实施细则",
        rights: ["view", "download"], source: "document", reason: "2025 年推免工作",
        validFrom: at(-60), validUntil: at(-1), status: "expired", grantBy: "陈静",
        approvalId: "APR-2025-070", uses: 6, maxUses: null
      },
      {
        id: "G-006", effect: "allow", subjectType: "user", subjectId: "20220008", subjectName: "张倩",
        objectType: "document", objectId: "D-1009", objectName: "学生实习基地合作协议",
        rights: ["view", "download"], source: "approval", reason: "实习基地续签核对",
        validFrom: at(-15), validUntil: at(45), status: "active", grantBy: "陈静",
        approvalId: "APR-2025-095", uses: 1, maxUses: null
      }
    ];

    const instances = [
      mkInstance({
        id: "APR-2026-001", no: "SP-2026-0001", type: "DOC_ARCHIVE", title: "《本科教学管理制度汇编》归档审批",
        status: "APPROVED", creator: "陈静", creatorAccount: "20150012", deptName: "院办公室", docId: "D-1001",
        createdAt: at(-32), submittedAt: at(-32), finishedAt: at(-30), currentNode: 2,
        form: [
          { label: "文档标题", value: "本科教学管理制度汇编" },
          { label: "文档编号", value: "YX-ZD-2026-0001" },
          { label: "所属分类", value: "制度文件 / 教学管理" },
          { label: "密级", value: "内部" },
          { label: "可见范围", value: "全院" },
          { label: "归档说明", value: "2026 修订版定稿归档，供全院查阅。" }
        ],
        nodes: [
          mkNode("院办初审", [mkTask("20180006", "王慧敏", "approved", "材料齐全，同意归档。", -31)], "approved"),
          mkNode("分管领导终审", [mkTask("20160001", "赵启明", "approved", "同意。", -30)], "approved")
        ],
        history: [
          { at: at(-32), actor: "陈静", action: "提交审批", comment: "提交归档审批" },
          { at: at(-31), actor: "王慧敏", action: "同意", comment: "材料齐全，同意归档。" },
          { at: at(-30), actor: "赵启明", action: "同意", comment: "同意。" }
        ]
      }),
      mkInstance({
        id: "APR-2026-002", no: "SP-2026-0002", type: "PERM_GRANT", title: "《研究生推免实施细则》查看权限申请",
        status: "RUNNING", creator: "李知远", creatorAccount: "20230001", deptName: "教务办公室", docId: "D-1003",
        createdAt: at(-1), submittedAt: at(-1), dueAt: at(0, 18), priority: "urgent",
        form: [
          { label: "申请对象", value: "研究生推免实施细则（YX-ZD-2026-0003）" },
          { label: "申请权限", value: "查看" },
          { label: "申请期限", value: "30 天" },
          { label: "申请用途", value: "承担 2026 年推免材料审核工作，需要查阅实施细则与名额分配口径。" }
        ],
        payload: { objectType: "document", objectId: "D-1003", rights: ["view"], days: 30 },
        nodes: [mkNode("院办初审", [mkTask("20180006", "王慧敏", "pending")])],
        history: [{ at: at(-1), actor: "李知远", action: "提交申请", comment: "申请查看《研究生推免实施细则》30 天" }]
      }),
      mkInstance({
        id: "APR-2026-003", no: "SP-2026-0003", type: "DOC_ARCHIVE", title: "《教学成果奖申报材料》归档审批",
        status: "RUNNING", creator: "李知远", creatorAccount: "20230001", deptName: "教务办公室", docId: "D-1008",
        createdAt: at(-1), submittedAt: at(-1), dueAt: at(2), priority: "normal",
        form: [
          { label: "文档标题", value: "教学成果奖申报材料" },
          { label: "文档编号", value: "YX-YW-2026-0008" },
          { label: "所属分类", value: "业务文档 / 教学运行" },
          { label: "密级", value: "内部" },
          { label: "可见范围", value: "全院" },
          { label: "归档说明", value: "校级教学成果奖申报材料定稿，需归档留存。" }
        ],
        nodes: [
          mkNode("院办初审", [mkTask("20180006", "王慧敏", "pending")]),
          mkNode("分管领导终审", [mkTask("20160001", "赵启明", "waiting")], "waiting")
        ],
        history: [{ at: at(-1), actor: "李知远", action: "提交归档", comment: "提交至院办初审" }]
      }),
      mkInstance({
        id: "APR-2026-004", no: "SP-2026-0004", type: "DOC_ARCHIVE", title: "《新入职教师培训手册》归档审批",
        status: "RETURNED", creator: "李知远", creatorAccount: "20230001", deptName: "教务办公室", docId: "D-1011",
        createdAt: at(-5), submittedAt: at(-5), dueAt: at(-3), currentNode: 0,
        form: [
          { label: "文档标题", value: "新入职教师培训手册" },
          { label: "文档编号", value: "YX-NB-2026-0011" },
          { label: "所属分类", value: "内部资料 / 内部参考" },
          { label: "密级", value: "内部" },
          { label: "可见范围", value: "本部门" },
          { label: "归档说明", value: "新入职教师培训使用，需归档。" }
        ],
        nodes: [mkNode("院办初审", [mkTask("20180006", "王慧敏", "returned", "请补充培训课时安排与考核方式后再提交。", -3)], "returned")],
        history: [
          { at: at(-5), actor: "李知远", action: "提交归档", comment: "提交至院办初审" },
          { at: at(-3), actor: "王慧敏", action: "退回", comment: "请补充培训课时安排与考核方式后再提交。" }
        ]
      }),
      mkInstance({
        id: "APR-2026-005", no: "SP-2026-0005", type: "SENSITIVE_DOWNLOAD", title: "《学科建设专项材料》下载审批",
        status: "RUNNING", creator: "李知远", creatorAccount: "20230001", deptName: "教务办公室", docId: "D-1007",
        createdAt: at(0, -2), submittedAt: at(0, -2), dueAt: at(0, 6), priority: "urgent",
        form: [
          { label: "文档", value: "学科建设专项材料（YX-NB-2026-0007）" },
          { label: "密级", value: "敏感" },
          { label: "下载用途", value: "撰写学科建设年度进展报告，需要引用专项材料中的经费与成果数据。" },
          { label: "使用范围", value: "本人" },
          { label: "有效期", value: "24 小时，仅可下载 1 次" }
        ],
        payload: { objectType: "document", objectId: "D-1007", rights: ["download"], hours: 24 },
        nodes: [mkNode("院办初审", [mkTask("20180006", "王慧敏", "pending")])],
        history: [{ at: at(0, -2), actor: "李知远", action: "提交申请", comment: "申请下载敏感文档" }]
      }),
      mkInstance({
        id: "APR-2026-006", no: "SP-2026-0006", type: "PERM_GRANT", title: "科研办公室申请「业务文档」下载权限",
        status: "RUNNING", creator: "张倩", creatorAccount: "20220008", deptName: "科研办公室", docId: null,
        createdAt: at(-1), submittedAt: at(-1), dueAt: at(1), priority: "normal",
        form: [
          { label: "申请对象", value: "业务文档（分类）" },
          { label: "申请部门", value: "科研办公室" },
          { label: "申请权限", value: "查看、下载" },
          { label: "申请期限", value: "60 天" },
          { label: "申请用途", value: "科研管理需要调阅教学运行类业务文档，用于项目结题材料核对。" }
        ],
        payload: { objectType: "category", objectId: "CAT-YW", subjectType: "dept", subjectId: "D02", rights: ["view", "download"], days: 60 },
        nodes: [mkNode("院办初审", [mkTask("20180006", "王慧敏", "pending")])],
        history: [{ at: at(-1), actor: "张倩", action: "提交申请", comment: "申请跨部门资料权限" }]
      }),
      mkInstance({
        id: "APR-2026-007", no: "SP-2026-0007", type: "DOC_ARCHIVE", title: "《旧版课程大纲（2019）》归档审批",
        status: "REJECTED", creator: "陈静", creatorAccount: "20150012", deptName: "院办公室", docId: "D-1013",
        createdAt: at(-5), submittedAt: at(-5), dueAt: at(-4), currentNode: 0,
        form: [
          { label: "文档标题", value: "旧版课程大纲（2019）" },
          { label: "文档编号", value: "YX-YW-2025-0013" },
          { label: "归档说明", value: "历史版本，申请归档保留。" }
        ],
        nodes: [mkNode("院办初审", [mkTask("20180006", "王慧敏", "rejected", "版本过旧，建议直接作废，不再归档。", -4)], "rejected")],
        history: [
          { at: at(-5), actor: "陈静", action: "提交归档", comment: "提交至院办初审" },
          { at: at(-4), actor: "王慧敏", action: "驳回", comment: "版本过旧，建议直接作废，不再归档。" }
        ]
      }),
      mkInstance({
        id: "APR-2026-008", no: "SP-2026-0008", type: "GENERAL", title: "对外提供《2025 年度工作总结》审批",
        status: "APPROVED", creator: "王慧敏", creatorAccount: "20180006", deptName: "院办公室", docId: "D-1012",
        createdAt: at(-12), submittedAt: at(-12), dueAt: at(-10), currentNode: 1, finishedAt: at(-10),
        form: [
          { label: "材料名称", value: "2025 年度工作总结" },
          { label: "接收单位", value: "学校发展规划处" },
          { label: "提供方式", value: "加盖院系公章的 PDF" },
          { label: "用途说明", value: "学校年度考核材料汇总。" }
        ],
        nodes: [mkNode("院办审核", [mkTask("20180006", "王慧敏", "approved", "同意提供。", -11)], "approved")],
        history: [
          { at: at(-12), actor: "王慧敏", action: "提交审批", comment: "提交对外提供材料审批" },
          { at: at(-11), actor: "王慧敏", action: "同意", comment: "同意提供。" }
        ]
      })
    ];

    const notifications = [
      { id: uid("MSG"), account: "20230001", type: "APPR_RETURN", title: "归档审批被退回", body: "《新入职教师培训手册》被王慧敏退回：请补充培训课时安排与考核方式。", at: at(-3), read: false, link: { role: "staff", tab: "mine" } },
      { id: uid("MSG"), account: "20230001", type: "GRANT_EXPIRE", title: "授权即将到期", body: "您对《学科建设专项材料》的查看授权将于明天到期，如需继续使用请发起续期申请。", at: at(0, -4), read: false, link: { role: "staff", tab: "perm" } },
      { id: uid("MSG"), account: "20230001", type: "APPR_TASK", title: "审批已提交", body: "《教学成果奖申报材料》已提交院办初审，当前处理人王慧敏。", at: at(-1), read: false, link: { role: "staff", tab: "approvals" } },
      { id: uid("MSG"), account: "20230001", type: "DOC_ARCHIVED", title: "文档已归档", body: "《2026 年度教学工作计划》已完成归档，可在文档中心查阅。", at: at(-17), read: true, link: { role: "staff", tab: "docs" } },
      { id: uid("MSG"), account: "20180006", type: "APPR_TASK", title: "新待办：教学成果奖申报材料", body: "李知远提交《教学成果奖申报材料》归档审批，请在 2 天内处理。", at: at(-1), read: false, link: { role: "approver", tab: "todo", instanceId: "APR-2026-003" } },
      { id: uid("MSG"), account: "20180006", type: "APPR_TASK", title: "新待办：敏感文档下载", body: "李知远申请下载《学科建设专项材料》，请尽快处理。", at: at(0, -2), read: false, link: { role: "approver", tab: "todo", instanceId: "APR-2026-005" } },
      { id: uid("MSG"), account: "20180006", type: "APPR_TASK", title: "新待办：跨部门权限申请", body: "科研办公室申请「业务文档」查看与下载权限，期限 60 天。", at: at(-1), read: false, link: { role: "approver", tab: "todo", instanceId: "APR-2026-006" } },
      { id: uid("MSG"), account: "20180006", type: "APPR_PASS", title: "审批已完成", body: "《2025 年度工作总结》对外提供审批已办结。", at: at(-10), read: true, link: { role: "approver", tab: "records" } },
      { id: uid("MSG"), account: "20150012", type: "GRANT_EXPIRE", title: "授权即将到期", body: "科研办公室对「内部资料」的查看授权将于 6 天后到期。", at: at(0, -6), read: false, link: { role: "docadmin", tab: "grants" } },
      { id: uid("MSG"), account: "20150012", type: "APPR_TASK", title: "新增审批事项", body: "科研办公室提交跨部门权限申请，待院办初审。", at: at(-1), read: false, link: { role: "docadmin", tab: "records" } },
      { id: uid("MSG"), account: "20150012", type: "DOC_ARCHIVED", title: "归档完成", body: "《实验室安全检查记录（2026Q3）》已归档。", at: at(-4), read: true, link: { role: "docadmin", tab: "library" } }
    ];

    const announcements = [
      { id: "ANN-01", title: "关于启用文档权限与审批 OA 的通知", body: "即日起，院系制度文件、行政材料与业务文档统一在 OA 中管理，原共享文件夹停止新增资料。", at: at(-7), pinned: true },
      { id: "ANN-02", title: "敏感文档下载审批流程说明", body: "敏感文档默认不可下载，需在文档详情页提交下载申请，经院办审批后 24 小时内有效。", at: at(-3), pinned: false }
    ];

    return {
      __v: 3,
      persona: PERSONA,
      approvers: APPROVERS,
      depts: DEPTS,
      users: USERS,
      categories: CATEGORIES,
      docs,
      grants,
      instances,
      notifications,
      announcements,
      counters: { doc: 1015, instance: 8, grant: 6, message: notifications.length, category: 8 },
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
    roleOf(account) {
      if (account === this.persona.staff.account) return "staff";
      if (account === this.persona.docadmin.account) return "docadmin";
      if (account === this.persona.approver.account || account === "20160001") return "approver";
      return "staff";
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
      const role = this.roleOf(account);
      if (grant.subjectType === "user") return grant.subjectId === account;
      if (grant.subjectType === "role") return grant.subjectId === role;
      if (grant.subjectType === "dept") return grant.subjectId === doc.dept;
      return false;
    },
    activeGrantsFor(account) {
      return this.grants.filter((g) => g.status === "active" && new Date(g.validUntil).getTime() >= Date.now() && (
        (g.subjectType === "user" && g.subjectId === account) ||
        (g.subjectType === "role" && g.subjectId === this.roleOf(account))
      ));
    },
    hasGrant(account, doc, right) {
      if (!doc) return false;
      return this.grants.some((g) => this.grantMatches(g, account, doc, right));
    },
    canView(doc, account) {
      if (!doc) return false;
      const role = this.roleOf(account);
      if (role === "docadmin" || role === "approver") return true;
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
          { label: "可见范围", value: doc.visibility === "all" ? "全院" : doc.visibility === "dept" ? "本部门" : "指定人员" },
          { label: "归档说明", value: (extra && extra.reason) || "文档定稿，申请归档。" }
        ],
        nodes: [
          mkNode("院办初审", [mkTask("20180006", "王慧敏", "pending")]),
          mkNode("分管领导终审", [mkTask("20160001", "赵启明", "waiting")], "waiting")
        ],
        history: [{ at: new Date().toISOString(), actor: user.name, action: "提交归档", comment: "提交至院办初审" }]
      });
      doc.approvalId = inst.id;
      doc.timeline.unshift(timeline(0, user.name, "提交归档", "提交至院办初审"));
      this.instances.unshift(inst);
      this.notify("20180006", "新待办：文档归档", "《" + doc.title + "》待院办初审。", "APPR_TASK", { role: "approver", tab: "todo", instanceId: inst.id });
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
        nodes: [mkNode("院办初审", [mkTask("20180006", "王慧敏", "pending")])],
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
          creatorAccount: this.persona.docadmin.account,
          deptName: this.persona.docadmin.deptName,
          docId: doc ? doc.id : null,
          dueAt: at(1),
          form: [
            { label: "授权对象", value: objectName },
            { label: "被授权" + (payload.subjectType === "dept" ? "部门" : payload.subjectType === "role" ? "角色" : "人"), value: subjectName },
            { label: "权限项", value: grant.rights.join("、") },
            { label: "期限", value: (payload.days || 30) + " 天" },
            { label: "授权用途", value: payload.reason || "—" },
            { label: "风险提示", value: sensitive ? "敏感文档授权，需院办审批" : crossDept ? "跨部门授权，需院办审批" : "期限超过 90 天，需院办审批" }
          ],
          payload: { objectType: payload.objectType, objectId: payload.objectId, subjectType: payload.subjectType, subjectId: payload.subjectId, rights: grant.rights, days: payload.days, reason: payload.reason },
          nodes: [mkNode("院办初审", [mkTask("20180006", "王慧敏", "pending")])],
          history: [{ at: new Date().toISOString(), actor: actor || "陈静", action: "提交审批", comment: "提交授权审批" }]
        });
        grant.approvalId = inst.id;
        this.instances.unshift(inst);
        this.notify("20180006", "新待办：授权审批", "「" + objectName + "」授权待院办初审。", "APPR_TASK", { role: "approver", tab: "todo", instanceId: inst.id });
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
        nodes: [mkNode("院办初审", [mkTask("20180006", "王慧敏", "pending")])],
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
        nodes: [mkNode("院办初审", [mkTask("20180006", "王慧敏", "pending")])],
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
      this.ui.toast = { message, type: type || "success", seq: (this.ui.toast ? this.ui.toast.seq : 0) + 1 };
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
          __v: 3, persona: this.persona, approvers: this.approvers, depts: this.depts, users: this.users,
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
    const base = saved && saved.__v === 3 ? saved : seed();
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
      visibility: (v) => ({ all: "全院", dept: "本部门", user: "指定人员", private: "仅本人", role: "指定角色" }[v] || v),
      size: (v) => v || "—"
    };
    return store;
  }

  window.OaDemo = window.OaDemo || {};
  window.OaDemo.createStore = createStore;
  window.OaDemo.KEY = KEY;
})();
