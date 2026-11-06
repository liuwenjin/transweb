/**
 * 演示壳：角色切换 + 跨角色场景 + 全局提示 / 确认框
 */
(function () {
  "use strict";

  const FILES = {
    staff: "StaffPanel.vue",
    approver: "ApproverPanel.vue",
    docadmin: "DocAdminPanel.vue"
  };

  // 功能权限（非登录角色）：同一学会岗位可拥有其中一项或多项
  const CAP_META = {
    staff: { label: "查阅", full: "文档查阅", icon: "docs", desc: "文档检索 · 上传归档 · 发起审批" },
    approver: { label: "审批", full: "审批处理", icon: "task", desc: "待办处理 · 退回驳回 · 审批记录" },
    docadmin: { label: "文档管理", full: "文档管理", icon: "folder", desc: "文档库 · 版本 · 授权台账" }
  };

  // 直接访问 #staff/#approver/#docadmin 时，登录页预选的代表性岗位
  const VIEW_DEFAULT = { staff: "specialist", approver: "secretaryGeneral", docadmin: "archivist" };

  const SESSION_KEY = "oa-demo-session-v1";

  const LOGIN_FEATURES = [
    { icon: "shield", title: "权限最小化", desc: "按岗位与分支机构授权，默认不可见" },
    { icon: "clipboard", title: "审批全程留痕", desc: "公文环节、意见、责任人可追溯" },
    { icon: "key", title: "统一身份认证", desc: "沿用学会账号，一次登录" }
  ];

  const SCENARIOS = [
    { id: "s1", as: "specialist", role: "staff", tab: "mine", action: "upload", title: "上传文档并提交归档", desc: "普通用户上传 → 提交归档 → 生成审批待办", uc: "UC-004" },
    { id: "s2", as: "secretaryGeneral", role: "approver", tab: "todo", instanceId: "APR-2026-003", title: "处理归档审批", desc: "查看材料 → 同意 → 流转至终审", uc: "UC-013" },
    { id: "s3", as: "secretaryGeneral", role: "approver", tab: "todo", instanceId: "APR-2026-002", title: "退回、驳回与加签", desc: "填写意见、选择退回节点、转办或加签", uc: "UC-008 / UC-014" },
    { id: "s4", as: "specialist", role: "staff", tab: "docs", docId: "D-1007", action: "download", title: "敏感文档下载审批", desc: "无下载权限 → 提交申请 → 审批通过后一次性下载", uc: "UC-023" },
    { id: "s5", as: "specialist", role: "staff", tab: "perm", action: "newRequest", title: "申请文档权限", desc: "填写用途与期限 → 审批 → 授权生效", uc: "UC-010" },
    { id: "s6", as: "archivist", role: "docadmin", tab: "grants", action: "newGrant", title: "文档授权与权限台账", desc: "新增授权 → 敏感/跨分会走审批 → 台账可导出", uc: "UC-008 / UC-009" },
    { id: "s7", as: "archivist", role: "docadmin", tab: "library", docId: "D-1001", action: "versions", title: "版本更新与回滚", desc: "上传新版本 → 查看历史 → 回滚生成新版本", uc: "UC-006" },
    { id: "s8", as: "archivist", role: "docadmin", tab: "recycle", title: "回收站恢复与清理", desc: "查看保留期 → 恢复文档 → 确认彻底删除", uc: "UC-018" },
    { id: "s9", as: "archivist", role: "docadmin", tab: "library", action: "batch", title: "批量归档与批量授权", desc: "多选文档 → 批量归档 / 授权 → 结果清单", uc: "UC-019" },
    { id: "s10", as: "specialist", role: "staff", tab: "approvals", instanceId: "APR-2026-003", action: "withdraw", title: "撤回与催办", desc: "首节点未处理可撤回；停滞任务可催办", uc: "UC-014" },
    { id: "s11", as: "secretaryGeneral", role: "approver", tab: "todo", instanceId: "APR-2026-005", title: "转办与加签", desc: "将任务转办他人、加签会签、抄送领导", uc: "UC-014" },
    { id: "s12", as: "archivist", role: "docadmin", tab: "grants", action: "crossDept", title: "跨分会共享审批", desc: "跨分会授权 → 提交秘书处审批 → 台账生效", uc: "UC-030" }
  ];

  const App = {
    data() {
      return {
        store: window.OaDemo.createStore(),
        role: "staff",
        ready: false,
        loading: true,
        loadError: "",
        panels: {},
        capMeta: CAP_META,
        scenarios: SCENARIOS,
        menuOpen: false,
        loggedIn: false,
        loginRole: "specialist",
        loginView: "",
        roleMenuOpen: false,
        loginAccount: "",
        loginPassword: "demo123456",
        showPassword: false,
        loginLoading: false,
        loginError: "",
        loginFeatures: LOGIN_FEATURES
      };
    },
    computed: {
      panel() { return this.panels[this.role]; },
      currentRole() {
        return this.store.currentUser || this.store.roleByKey(this.loginRole) || this.store.roles[0];
      },
      caps() { return this.currentRole ? this.currentRole.caps : ["staff"]; },
      loginRoleDef() { return this.store.roleByKey(this.loginRole) || this.store.roles[0]; },
      loginRoles() { return this.store.roles; }
    },
    created() {
      window.__oaStore = this.store;
      const hash = (location.hash || "").replace("#", "");
      const hashView = CAP_META[hash] ? hash : "";
      let saved = null;
      try { saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch (e) { saved = null; }

      const savedRole = saved && this.store.roleByKey(saved.role);
      if (savedRole) {
        this.loggedIn = true;
        this.loginRole = savedRole.key;
        this.store.currentUser = savedRole;
        this.role = savedRole.caps.indexOf(saved.view) !== -1 ? saved.view : savedRole.caps[0];
        this.loginView = this.role;
        location.hash = this.role;
      } else {
        this.loggedIn = false;
        this.loginRole = hashView ? VIEW_DEFAULT[hashView] : "specialist";
        this.loginView = hashView || "";
      }
      this.loginAccount = this.loginRoleDef.account;
      this.loadAll();
    },
    methods: {
      async loadAll() {
        try {
          const entries = await Promise.all(
            Object.keys(FILES).map(async (key) => {
              const options = await window.OaDemo.load("/oa-demo/components/" + FILES[key]);
              return [key, Vue.markRaw(options)];
            })
          );
          const panels = {};
          entries.forEach(([key, options]) => { panels[key] = options; });
          this.panels = panels;
          this.ready = true;
          this.loading = false;
          this.$nextTick(() => this.applyPendingIntent());
        } catch (err) {
          console.error(err);
          this.loadError = err && err.message ? err.message : String(err);
          this.loading = false;
        }
      },
      applyPendingIntent() {
        const intent = this.store.intent;
        if (intent && intent.role === this.role && intent.seq) {
          // 组件 mounted 时会读取 intent；此处仅确保角色切换后再次触发
          this.store.intent.seq += 0;
        }
      },
      selectLoginRole(key) {
        const role = this.store.roleByKey(key);
        if (!role) return;
        this.loginRole = key;
        this.loginAccount = role.account;
        this.loginError = "";
        this.roleMenuOpen = false;
        if (this.loginView && role.caps.indexOf(this.loginView) === -1) this.loginView = role.caps[0];
      },
      enterRole(role, view) {
        const targetView = role.caps.indexOf(view) !== -1 ? view : role.caps[0];
        this.store.currentUser = role;
        this.loginRole = role.key;
        this.loginView = targetView;
        this.role = targetView;
        this.loggedIn = true;
        this.loginAccount = role.account;
        try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ role: role.key, view: targetView })); } catch (e) { /* ignore */ }
        location.hash = targetView;
      },
      setView(view) {
        if (!this.currentRole || this.currentRole.caps.indexOf(view) === -1) return;
        this.role = view;
        this.loginView = view;
        location.hash = view;
        try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ role: this.currentRole.key, view })); } catch (e) { /* ignore */ }
        this.store.goto(view, "home");
      },
      doLogin() {
        if (this.loginLoading) return;
        const account = (this.loginAccount || "").trim();
        if (!account) {
          this.loginError = "请输入账号或选择学会岗位。";
          return;
        }
        if (!this.loginPassword) {
          this.loginError = "请输入密码（演示账号已预填，可直接登录）。";
          return;
        }
        const role = this.store.roleByAccount(account);
        if (!role) {
          this.loginError = "演示环境仅支持预置账号，请从「登录角色」中选择。";
          return;
        }
        const view = this.loginView && role.caps.indexOf(this.loginView) !== -1 ? this.loginView : role.caps[0];
        this.loginLoading = true;
        this.loginError = "";
        this.roleMenuOpen = false;
        setTimeout(() => {
          this.enterRole(role, view);
          this.loginLoading = false;
          this.loginPassword = "demo123456";
          this.showPassword = false;
          this.$nextTick(() => {
            this.store.goto(this.role, "home");
            this.store.toast("登录成功，欢迎 " + role.name + "（" + role.title + "）· " + CAP_META[this.role].full + "。");
          });
        }, 650);
      },
      logout() {
        this.store.confirm({
          title: "退出登录",
          text: "退出后返回统一身份认证登录页，本次演示数据仍会保留在浏览器中。",
          okText: "退出登录"
        }).then((ok) => {
          if (!ok) return;
          const role = this.currentRole;
          try { sessionStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ }
          this.store.currentUser = null;
          this.loggedIn = false;
          this.loginRole = role ? role.key : "specialist";
          this.loginAccount = role ? role.account : "";
          this.loginPassword = "demo123456";
          this.showPassword = false;
          this.menuOpen = false;
        });
      },
      openScenario(s) {
        const role = this.store.roleByKey(s.as || "specialist");
        if (!role) return;
        this.enterRole(role, s.role);
        this.menuOpen = false;
        this.$nextTick(() => {
          this.store.goto(s.role, s.tab, {
            docId: s.docId || null,
            instanceId: s.instanceId || null,
            action: s.action || ""
          });
          this.store.toast("已切换为 " + role.title + " " + role.name + " · " + CAP_META[s.role].full + "。", "info");
        });
      },
      resetDemo() {
        this.store.confirm({
          title: "重置演示数据",
          text: "将清空本次演示产生的文档、审批、授权与通知，并恢复到初始数据。",
          okText: "重置数据",
          danger: true
        }).then((ok) => {
          if (!ok) return;
          try { localStorage.removeItem(window.OaDemo.KEY); } catch (e) { /* ignore */ }
          location.reload();
        });
      },
      handleToastClose() {
        this.store.ui.toast = null;
      }
    },
    template: `
<div v-if="!loggedIn" class="tw-h-screen tw-w-full tw-flex tw-bg-slate-100 tw-overflow-hidden">
  <div class="tw-hidden lg:tw-flex tw-w-[54%] tw-relative tw-bg-slate-900 tw-text-white tw-flex-col tw-justify-between tw-px-14 tw-py-12 tw-overflow-hidden">
    <div class="oa-login-glow oa-login-glow-a"></div>
    <div class="oa-login-glow oa-login-glow-b"></div>
    <div class="tw-relative tw-z-10 tw-flex tw-items-center tw-gap-3">
      <div class="tw-w-11 tw-h-11 tw-rounded-2xl tw-bg-white/10 tw-border tw-border-white/15 tw-flex tw-items-center tw-justify-center tw-text-lg tw-font-bold">OA</div>
      <div>
        <div class="tw-text-sm tw-font-semibold tw-tracking-wide">中国电子教育学会 OA</div>
        <div class="tw-text-[11px] tw-text-slate-400">Document &amp; Approval · 学会内网</div>
      </div>
    </div>

    <div class="tw-relative tw-z-10 tw-max-w-lg">
      <div class="tw-inline-flex tw-items-center tw-gap-1.5 tw-px-3 tw-py-1 tw-rounded-full tw-bg-white/10 tw-border tw-border-white/10 tw-text-[11px] tw-text-slate-300">
        <oa-icon name="shield" class="tw-w-3.5 tw-h-3.5"></oa-icon> 统一身份认证 · 分级授权
      </div>
      <h1 class="tw-mt-6 tw-text-4xl tw-font-semibold tw-leading-tight">让每一份公文<br />都有清晰的流转</h1>
      <p class="tw-mt-4 tw-text-sm tw-text-slate-400 tw-leading-relaxed">从公文起草、审核、签发到归档，过程可追踪、责任可落实。<br />面向学会秘书处、理事会与各分会，部署在学会内网的轻量 OA。</p>
      <div class="tw-mt-8 tw-space-y-4">
        <div v-for="f in loginFeatures" :key="f.title" class="tw-flex tw-items-center tw-gap-3">
          <span class="tw-w-8 tw-h-8 tw-rounded-lg tw-bg-white/10 tw-flex tw-items-center tw-justify-center"><oa-icon :name="f.icon" class="tw-w-4 tw-h-4 tw-text-indigo-300"></oa-icon></span>
          <div>
            <div class="tw-text-[13px] tw-text-slate-200">{{ f.title }}</div>
            <div class="tw-text-[11px] tw-text-slate-500 tw-mt-0.5">{{ f.desc }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="tw-relative tw-z-10 tw-flex tw-items-center tw-gap-3 tw-text-[11px] tw-text-slate-500">
      <span>学会内网私有化部署</span><span class="tw-w-1 tw-h-1 tw-rounded-full tw-bg-slate-700"></span>
      <span>等保 2.0 基础要求</span><span class="tw-w-1 tw-h-1 tw-rounded-full tw-bg-slate-700"></span>
      <span>操作全程留痕</span>
    </div>
  </div>

  <div class="tw-flex-1 tw-flex tw-items-center tw-justify-center tw-px-6 tw-py-10">
    <div class="tw-w-full tw-max-w-[440px]">
      <div class="tw-flex tw-items-center tw-gap-3 tw-mb-6 lg:tw-hidden">
        <div class="tw-w-10 tw-h-10 tw-rounded-xl tw-bg-slate-900 tw-text-white tw-flex tw-items-center tw-justify-center tw-font-bold tw-text-sm">OA</div>
        <div>
          <div class="tw-text-sm tw-font-semibold">中国电子教育学会 OA</div>
          <div class="tw-text-[11px] tw-text-slate-500">学会实际岗位演示</div>
        </div>
      </div>

      <div class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-xl tw-px-8 tw-py-8">
        <div class="tw-text-[11px] tw-text-indigo-600 tw-font-semibold tw-tracking-widest">SIGN IN</div>
        <h2 class="tw-mt-1 tw-text-xl tw-font-semibold">登录工作台</h2>
        <p class="tw-mt-1 tw-text-[12px] tw-text-slate-500">选择学会岗位，使用预置账号登录</p>

        <div class="tw-mt-6">
          <div class="tw-flex tw-items-center tw-justify-between">
            <label class="tw-text-[11px] tw-text-slate-500">登录角色</label>
            <span class="tw-text-[10px] tw-text-slate-400">学会实际岗位</span>
          </div>
          <div class="tw-relative tw-mt-2">
            <button @click="roleMenuOpen = !roleMenuOpen" class="tw-w-full tw-flex tw-items-center tw-gap-2.5 tw-px-3 tw-py-2.5 tw-rounded-xl tw-border tw-border-slate-200 tw-bg-white tw-hover:border-slate-300">
              <span class="tw-w-8 tw-h-8 tw-rounded-full tw-bg-indigo-600 tw-text-white tw-flex tw-items-center tw-justify-center tw-text-[12px] tw-font-semibold tw-shrink-0">{{ loginRoleDef.name.slice(0, 1) }}</span>
              <span class="tw-flex-1 tw-min-w-0 tw-text-left">
                <span class="tw-block tw-text-[13px] tw-font-medium tw-truncate">{{ loginRoleDef.name }} · {{ loginRoleDef.title }}</span>
                <span class="tw-block tw-text-[10px] tw-text-slate-400 tw-mt-0.5">{{ loginRoleDef.deptName }} · {{ loginRoleDef.account }}</span>
              </span>
              <oa-icon name="chevron-down" class="tw-w-4 tw-h-4 tw-text-slate-400 tw-shrink-0"></oa-icon>
            </button>

            <div v-if="roleMenuOpen" class="tw-fixed tw-inset-0 tw-z-10" @click="roleMenuOpen = false"></div>
            <div v-if="roleMenuOpen" class="tw-absolute tw-z-20 tw-mt-1 tw-w-full tw-max-h-64 tw-overflow-y-auto oa-scroll tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-shadow-2xl">
              <button v-for="r in loginRoles" :key="r.key" @click="selectLoginRole(r.key)"
                class="tw-w-full tw-flex tw-items-center tw-gap-2.5 tw-px-3 tw-py-2.5 tw-text-left tw-border-b tw-border-slate-50 tw-hover:bg-slate-50">
                <span class="tw-w-7 tw-h-7 tw-rounded-full tw-bg-slate-100 tw-text-slate-600 tw-flex tw-items-center tw-justify-center tw-text-[11px] tw-font-semibold tw-shrink-0">{{ r.name.slice(0, 1) }}</span>
                <span class="tw-flex-1 tw-min-w-0">
                  <span class="tw-block tw-text-[12px] tw-font-medium tw-text-slate-800">{{ r.name }} · {{ r.title }}</span>
                  <span class="tw-block tw-text-[10px] tw-text-slate-400">{{ r.deptName }}</span>
                </span>
                <span class="tw-flex tw-items-center tw-gap-1">
                  <span v-for="cap in r.caps" :key="cap" class="tw-px-1 tw-py-0.5 tw-rounded tw-bg-slate-100 tw-text-slate-500 tw-text-[9px]">{{ capMeta[cap].label }}</span>
                </span>
                <oa-icon v-if="loginRole === r.key" name="check" class="tw-w-3.5 tw-h-3.5 tw-text-indigo-600"></oa-icon>
              </button>
            </div>
          </div>
          <div class="tw-mt-2 tw-flex tw-items-center tw-gap-1.5 tw-flex-wrap">
            <span class="tw-text-[10px] tw-text-slate-400">可执行功能</span>
            <span v-for="cap in loginRoleDef.caps" :key="cap"
              :class="['tw-px-1.5 tw-py-0.5 tw-rounded tw-text-[10px] tw-border',
                cap === 'staff' ? 'tw-bg-indigo-50 tw-text-indigo-700 tw-border-indigo-100' :
                cap === 'approver' ? 'tw-bg-emerald-50 tw-text-emerald-700 tw-border-emerald-100' :
                'tw-bg-sky-50 tw-text-sky-700 tw-border-sky-100']">{{ capMeta[cap].full }}</span>
          </div>
        </div>

        <div class="tw-mt-4 tw-space-y-3">
          <div class="tw-relative">
            <oa-icon name="user" class="tw-w-4 tw-h-4 tw-text-slate-400 tw-absolute tw-left-3 tw-top-3"></oa-icon>
            <input v-model="loginAccount" @keyup.enter="doLogin" class="oa-login-input tw-w-full tw-pl-10 tw-pr-3 tw-py-2.5 tw-rounded-xl tw-text-[13px] tw-border tw-border-slate-200 tw-bg-slate-50" placeholder="账号 / 手机号" autocomplete="username" />
          </div>
          <div class="tw-relative">
            <oa-icon name="lock" class="tw-w-4 tw-h-4 tw-text-slate-400 tw-absolute tw-left-3 tw-top-3"></oa-icon>
            <input :type="showPassword ? 'text' : 'password'" v-model="loginPassword" @keyup.enter="doLogin" class="oa-login-input tw-w-full tw-pl-10 tw-pr-10 tw-py-2.5 tw-rounded-xl tw-text-[13px] tw-border tw-border-slate-200 tw-bg-slate-50" placeholder="密码" autocomplete="current-password" />
            <button type="button" @click="showPassword = !showPassword" class="tw-absolute tw-right-2.5 tw-top-2.5 tw-text-slate-400 tw-hover:text-slate-600">
              <oa-icon :name="showPassword ? 'eye-off' : 'eye'" class="tw-w-4 tw-h-4"></oa-icon>
            </button>
          </div>
        </div>

        <div v-if="loginError" class="tw-mt-3 tw-flex tw-items-center tw-gap-1.5 tw-text-[11px] tw-text-rose-600">
          <oa-icon name="alert" class="tw-w-3.5 tw-h-3.5"></oa-icon>{{ loginError }}
        </div>

        <button @click="doLogin" :disabled="loginLoading"
          class="oa-login-btn tw-mt-5 tw-w-full tw-py-2.5 tw-rounded-xl tw-text-[13px] tw-font-medium tw-text-white tw-flex tw-items-center tw-justify-center tw-gap-2">
          <span v-if="loginLoading" class="tw-w-4 tw-h-4 tw-rounded-full tw-border-2 tw-border-white/40 tw-border-t-white oa-spin"></span>
          <span>{{ loginLoading ? '正在认证…' : '登 录' }}</span>
        </button>

        <div class="tw-mt-4 tw-flex tw-items-start tw-gap-1.5 tw-text-[10px] tw-text-slate-400 tw-leading-relaxed">
          <oa-icon name="info" class="tw-w-3.5 tw-h-3.5 tw-mt-0.5 tw-shrink-0"></oa-icon>
          <span>演示环境：账号与岗位一一对应，密码已预填且可任意修改；刷新页面保持登录，退出后需重新选择角色。</span>
        </div>
      </div>

      <div class="tw-mt-4 tw-flex tw-items-center tw-justify-between tw-text-[10px] tw-text-slate-400">
        <span>© 2026 中国电子教育学会</span>
        <span class="tw-flex tw-items-center tw-gap-1"><oa-icon name="shield" class="tw-w-3 tw-h-3"></oa-icon>统一身份认证</span>
      </div>
    </div>
  </div>
</div>

<div v-else class="tw-h-screen tw-flex tw-flex-col tw-overflow-hidden tw-text-slate-900">
  <header class="tw-h-14 tw-flex tw-items-center tw-gap-5 tw-px-5 tw-bg-slate-900 tw-text-white tw-shrink-0 tw-relative tw-z-40">
    <div class="tw-flex tw-items-center tw-gap-3 tw-shrink-0">
      <div class="tw-w-9 tw-h-9 tw-rounded-xl tw-bg-gradient-to-br tw-from-indigo-500 tw-to-sky-500 tw-flex tw-items-center tw-justify-center tw-font-bold tw-text-sm tw-shadow-lg">OA</div>
      <div class="tw-leading-tight">
        <div class="tw-text-sm tw-font-semibold tw-tracking-wide">中国电子教育学会 OA</div>
        <div class="tw-text-[11px] tw-text-slate-400">Document &amp; Approval · 学会岗位演示</div>
      </div>
      <span class="tw-ml-1 tw-px-2 tw-py-0.5 tw-rounded-full tw-text-[11px] tw-bg-emerald-500/15 tw-text-emerald-300 tw-border tw-border-emerald-500/30">演示环境</span>
    </div>

    <div v-if="caps.length > 1" class="tw-flex tw-items-center tw-gap-2 tw-ml-3">
      <div class="tw-flex tw-items-center tw-gap-0.5 tw-p-0.5 tw-rounded-lg tw-bg-white/10">
        <button v-for="cap in caps" :key="cap" @click="setView(cap)"
          :class="['tw-flex tw-items-center tw-gap-1 tw-px-2.5 tw-py-1.5 tw-rounded-md tw-text-[11px] tw-transition',
            role === cap ? 'tw-bg-white tw-text-slate-900 tw-font-semibold tw-shadow-sm' : 'tw-text-slate-300 tw-hover:bg-white/10']">
          <oa-icon :name="capMeta[cap].icon" class="tw-w-3.5 tw-h-3.5"></oa-icon>{{ capMeta[cap].full }}
        </button>
      </div>
    </div>

    <div class="tw-flex-1"></div>

    <div class="tw-relative">
      <button @click="menuOpen = !menuOpen"
        class="tw-flex tw-items-center tw-gap-2 tw-px-3 tw-py-2 tw-rounded-lg tw-bg-white/10 tw-text-[13px] tw-hover:bg-white/15">
        <oa-icon name="sparkles" class="tw-w-4 tw-h-4 tw-text-amber-300"></oa-icon>
        演示场景
        <oa-icon name="chevron-down" class="tw-w-3.5 tw-h-3.5 tw-text-slate-400"></oa-icon>
      </button>
      <transition name="oa-pop">
        <div v-if="menuOpen" class="tw-absolute tw-right-0 tw-mt-2 tw-w-[420px] tw-bg-white tw-text-slate-900 tw-rounded-xl tw-shadow-2xl tw-border tw-border-slate-200 tw-overflow-hidden">
          <div class="tw-px-4 tw-py-3 tw-border-b tw-border-slate-100 tw-flex tw-items-center tw-justify-between">
            <div>
              <div class="tw-text-sm tw-font-semibold">跨角色演示场景</div>
              <div class="tw-text-[11px] tw-text-slate-500 tw-mt-0.5">点击后自动切换角色并打开对应页面</div>
            </div>
            <span class="tw-text-[11px] tw-text-slate-400">共 {{ scenarios.length }} 个</span>
          </div>
          <div class="tw-max-h-[420px] tw-overflow-y-auto oa-scroll">
            <button v-for="(s, i) in scenarios" :key="s.id" @click="openScenario(s)"
              class="tw-w-full tw-text-left tw-px-4 tw-py-3 tw-flex tw-items-start tw-gap-3 tw-border-b tw-border-slate-50 tw-hover:bg-slate-50">
              <span class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-slate-100 tw-text-slate-500 tw-text-[11px] tw-flex tw-items-center tw-justify-center tw-shrink-0 tw-mt-0.5">{{ i + 1 }}</span>
              <span class="tw-flex-1 tw-min-w-0">
                <span class="tw-flex tw-items-center tw-gap-2">
                  <span class="tw-text-[13px] tw-font-medium">{{ s.title }}</span>
                  <span class="tw-px-1.5 tw-py-0.5 tw-rounded tw-text-[10px] tw-bg-indigo-50 tw-text-indigo-600">{{ s.uc }}</span>
                </span>
                <span class="tw-block tw-text-[11px] tw-text-slate-500 tw-mt-1">{{ s.desc }}</span>
              </span>
              <oa-icon name="chevron-right" class="tw-w-4 tw-h-4 tw-text-slate-300 tw-mt-1"></oa-icon>
            </button>
          </div>
          <div class="tw-px-4 tw-py-2.5 tw-bg-slate-50 tw-flex tw-items-center tw-justify-between">
            <span class="tw-text-[11px] tw-text-slate-500">数据保存在浏览器本地，可随时重置</span>
            <button @click="resetDemo" class="tw-text-[11px] tw-text-rose-600 tw-flex tw-items-center tw-gap-1">
              <oa-icon name="refresh" class="tw-w-3.5 tw-h-3.5"></oa-icon> 重置数据
            </button>
          </div>
        </div>
      </transition>
    </div>

    <button @click="resetDemo" title="重置演示数据" class="tw-w-9 tw-h-9 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-text-slate-300 tw-hover:bg-white/10">
      <oa-icon name="refresh" class="tw-w-4 tw-h-4"></oa-icon>
    </button>

    <button @click="logout" title="退出登录" class="tw-w-9 tw-h-9 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-text-slate-300 tw-hover:bg-white/10">
      <oa-icon name="logout" class="tw-w-4 tw-h-4"></oa-icon>
    </button>

  </header>

  <main class="tw-flex-1 tw-min-h-0 tw-relative">
    <div v-if="loading" class="tw-absolute tw-inset-0 tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-4 tw-bg-slate-100">
      <div class="tw-w-10 tw-h-10 tw-rounded-full tw-border-2 tw-border-slate-200 tw-border-t-indigo-500 oa-spin"></div>
      <div class="tw-text-sm tw-text-slate-500">正在加载功能面板…</div>
      <div class="tw-flex tw-gap-2">
        <span class="tw-w-24 tw-h-2 tw-rounded-full oa-skeleton"></span>
        <span class="tw-w-16 tw-h-2 tw-rounded-full oa-skeleton"></span>
        <span class="tw-w-20 tw-h-2 tw-rounded-full oa-skeleton"></span>
      </div>
    </div>

    <div v-else-if="loadError" class="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-p-8">
      <div class="tw-max-w-xl tw-bg-white tw-rounded-2xl tw-shadow-xl tw-border tw-border-rose-200 tw-p-8">
        <div class="tw-flex tw-items-center tw-gap-3 tw-text-rose-600">
          <oa-icon name="alert" class="tw-w-6 tw-h-6"></oa-icon>
          <span class="tw-text-lg tw-font-semibold">组件加载失败</span>
        </div>
        <p class="tw-mt-3 tw-text-sm tw-text-slate-600">{{ loadError }}</p>
        <p class="tw-mt-2 tw-text-xs tw-text-slate-400">请确认通过 HTTP 访问（而非 file://），且 /oa-demo/components/ 路径可访问。</p>
        <button @click="loadAll" class="tw-mt-5 tw-px-4 tw-py-2 tw-rounded-lg tw-bg-slate-900 tw-text-white tw-text-sm">重新加载</button>
      </div>
    </div>

    <component v-else-if="panel" :is="panel" :store="store" :key="role"></component>
  </main>

  <transition name="oa-toast">
    <div v-if="store.ui.toast" class="tw-fixed tw-right-6 tw-bottom-6 tw-z-50 tw-flex tw-items-start tw-gap-3 tw-max-w-md tw-px-4 tw-py-3 tw-rounded-xl tw-shadow-2xl tw-bg-slate-900 tw-text-white">
      <oa-icon :name="store.ui.toast.type === 'error' ? 'alert' : store.ui.toast.type === 'info' ? 'info' : 'check-circle'"
        :class="['tw-w-5 tw-h-5 tw-mt-0.5', store.ui.toast.type === 'error' ? 'tw-text-rose-400' : 'tw-text-emerald-400']"></oa-icon>
      <span class="tw-text-[13px] tw-leading-relaxed tw-flex-1">{{ store.ui.toast.message }}</span>
      <button @click="handleToastClose" class="tw-text-slate-400 tw-hover:text-white">
        <oa-icon name="x" class="tw-w-4 tw-h-4"></oa-icon>
      </button>
    </div>
  </transition>

  <div v-if="store.ui.dialog.open" class="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-6">
    <div class="tw-absolute tw-inset-0 tw-bg-slate-900/50" @click="store.closeDialog(false)"></div>
    <div class="tw-relative tw-w-full tw-max-w-md tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-p-6">
      <div class="tw-flex tw-items-center tw-gap-3">
        <div :class="['tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center',
          store.ui.dialog.danger ? 'tw-bg-rose-50 tw-text-rose-600' : 'tw-bg-amber-50 tw-text-amber-600']">
          <oa-icon name="alert" class="tw-w-5 tw-h-5"></oa-icon>
        </div>
        <div class="tw-text-lg tw-font-semibold">{{ store.ui.dialog.title }}</div>
      </div>
      <p class="tw-mt-3 tw-text-sm tw-text-slate-600 tw-leading-relaxed">{{ store.ui.dialog.text }}</p>
      <div class="tw-mt-6 tw-flex tw-justify-end tw-gap-2">
        <button @click="store.closeDialog(false)" class="tw-px-4 tw-py-2 tw-rounded-lg tw-text-sm tw-text-slate-600 tw-bg-slate-100 tw-hover:bg-slate-200">{{ store.ui.dialog.cancelText }}</button>
        <button @click="store.closeDialog(true)"
          :class="['tw-px-4 tw-py-2 tw-rounded-lg tw-text-sm tw-text-white tw-shadow-sm',
            store.ui.dialog.danger ? 'tw-bg-rose-600 tw-hover:bg-rose-700' : 'tw-bg-indigo-600 tw-hover:bg-indigo-700']">{{ store.ui.dialog.okText }}</button>
      </div>
    </div>
  </div>
</div>
`
  };

  const app = Vue.createApp(App);
  app.component("oa-icon", window.OaIcon);
  window.__oa = { app };
  app.mount("#app");
})();
