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

  const ROLE_META = {
    staff: { label: "普通用户", short: "普通用户", icon: "user", desc: "文档查阅 · 上传归档 · 发起审批" },
    approver: { label: "审批人", short: "审批人", icon: "task", desc: "待办处理 · 退回驳回 · 审批记录" },
    docadmin: { label: "文档管理员", short: "文档管理员", icon: "folder", desc: "文档库 · 版本 · 授权台账" }
  };

  const SCENARIOS = [
    { id: "s1", role: "staff", tab: "mine", action: "upload", title: "上传文档并提交归档", desc: "普通用户上传 → 提交归档 → 生成审批待办", uc: "UC-004" },
    { id: "s2", role: "approver", tab: "todo", instanceId: "APR-2026-003", title: "处理归档审批", desc: "查看材料 → 同意 → 流转至终审", uc: "UC-013" },
    { id: "s3", role: "approver", tab: "todo", instanceId: "APR-2026-002", title: "退回、驳回与加签", desc: "填写意见、选择退回节点、转办或加签", uc: "UC-008 / UC-014" },
    { id: "s4", role: "staff", tab: "docs", docId: "D-1007", action: "download", title: "敏感文档下载审批", desc: "无下载权限 → 提交申请 → 审批通过后一次性下载", uc: "UC-023" },
    { id: "s5", role: "staff", tab: "perm", action: "newRequest", title: "申请文档权限", desc: "填写用途与期限 → 审批 → 授权生效", uc: "UC-010" },
    { id: "s6", role: "docadmin", tab: "grants", action: "newGrant", title: "文档授权与权限台账", desc: "新增授权 → 敏感/跨部门走审批 → 台账可导出", uc: "UC-008 / UC-009" },
    { id: "s7", role: "docadmin", tab: "library", docId: "D-1001", action: "versions", title: "版本更新与回滚", desc: "上传新版本 → 查看历史 → 回滚生成新版本", uc: "UC-006" },
    { id: "s8", role: "docadmin", tab: "recycle", title: "回收站恢复与清理", desc: "查看保留期 → 恢复文档 → 确认彻底删除", uc: "UC-018" },
    { id: "s9", role: "docadmin", tab: "library", action: "batch", title: "批量归档与批量授权", desc: "多选文档 → 批量归档 / 授权 → 结果清单", uc: "UC-019" },
    { id: "s10", role: "staff", tab: "approvals", instanceId: "APR-2026-003", action: "withdraw", title: "撤回与催办", desc: "首节点未处理可撤回；停滞任务可催办", uc: "UC-014" },
    { id: "s11", role: "approver", tab: "todo", instanceId: "APR-2026-005", title: "转办与加签", desc: "将任务转办他人、加签会签、抄送领导", uc: "UC-014" },
    { id: "s12", role: "docadmin", tab: "grants", action: "crossDept", title: "跨部门共享审批", desc: "跨部门授权 → 提交院办审批 → 台账生效", uc: "UC-030" }
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
        roleMeta: ROLE_META,
        scenarios: SCENARIOS,
        menuOpen: false,
        showGuide: true
      };
    },
    computed: {
      panel() { return this.panels[this.role]; },
      persona() { return this.store.persona[this.role]; },
      unread() { return this.store.unreadFor(this.persona.account); },
      approverPending() {
        return this.store.todoFor("20180006").length + this.store.todoFor("20160001").length;
      },
      expiring() { return this.store.expiringGrants(7).length; },
      roleTabs() {
        return ["staff", "approver", "docadmin"].map((key) => ({
          key,
          label: ROLE_META[key].label,
          icon: ROLE_META[key].icon,
          badge: key === "approver" ? this.approverPending
            : key === "docadmin" ? this.expiring
            : this.store.unreadFor(this.store.persona.staff.account)
        }));
      }
    },
    created() {
      window.__oaStore = this.store;
      const hash = (location.hash || "").replace("#", "");
      if (ROLE_META[hash]) this.role = hash;
      this.loadAll();
      window.addEventListener("keydown", this.onKey);
    },
    beforeUnmount() {
      window.removeEventListener("keydown", this.onKey);
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
      switchRole(key) {
        if (!ROLE_META[key]) return;
        this.role = key;
        location.hash = key;
        this.menuOpen = false;
        this.store.goto(key, this.store.intent.tab || "home", {
          docId: this.store.intent.docId,
          instanceId: this.store.intent.instanceId,
          action: ""
        });
      },
      openScenario(s) {
        this.role = s.role;
        location.hash = s.role;
        this.menuOpen = false;
        this.$nextTick(() => {
          this.store.goto(s.role, s.tab, {
            docId: s.docId || null,
            instanceId: s.instanceId || null,
            action: s.action || ""
          });
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
      onKey(e) {
        if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
        if (e.key === "1") this.switchRole("staff");
        if (e.key === "2") this.switchRole("approver");
        if (e.key === "3") this.switchRole("docadmin");
        if (e.key === "Escape") { this.menuOpen = false; this.showGuide = false; }
      },
      handleToastClose() {
        this.store.ui.toast = null;
      }
    },
    template: `
<div class="tw-h-screen tw-flex tw-flex-col tw-overflow-hidden tw-text-slate-900">
  <header class="tw-h-14 tw-flex tw-items-center tw-gap-5 tw-px-5 tw-bg-slate-900 tw-text-white tw-shrink-0 tw-relative tw-z-40">
    <div class="tw-flex tw-items-center tw-gap-3 tw-shrink-0">
      <div class="tw-w-9 tw-h-9 tw-rounded-xl tw-bg-gradient-to-br tw-from-indigo-500 tw-to-sky-500 tw-flex tw-items-center tw-justify-center tw-font-bold tw-text-sm tw-shadow-lg">OA</div>
      <div class="tw-leading-tight">
        <div class="tw-text-sm tw-font-semibold tw-tracking-wide">院系文档权限与审批 OA</div>
        <div class="tw-text-[11px] tw-text-slate-400">Document &amp; Approval · 三角色演示</div>
      </div>
      <span class="tw-ml-1 tw-px-2 tw-py-0.5 tw-rounded-full tw-text-[11px] tw-bg-emerald-500/15 tw-text-emerald-300 tw-border tw-border-emerald-500/30">演示环境</span>
    </div>

    <nav class="tw-flex tw-items-center tw-gap-1 tw-ml-2">
      <button v-for="tab in roleTabs" :key="tab.key" @click="switchRole(tab.key)"
        :class="['tw-relative tw-flex tw-items-center tw-gap-2 tw-px-3.5 tw-py-2 tw-rounded-lg tw-text-[13px] tw-transition',
                 role === tab.key ? 'tw-bg-white tw-text-slate-900 tw-font-semibold tw-shadow-sm' : 'tw-text-slate-300 tw-hover:bg-white/10']">
        <oa-icon :name="tab.icon" class="tw-w-4 tw-h-4"></oa-icon>
        <span>{{ tab.label }}</span>
        <span v-if="tab.badge" :class="['tw-min-w-4 tw-h-4 tw-px-1 tw-rounded-full tw-text-[10px] tw-flex tw-items-center tw-justify-center',
              role === tab.key ? 'tw-bg-rose-500 tw-text-white' : 'tw-bg-rose-500/90 tw-text-white']">{{ tab.badge }}</span>
      </button>
    </nav>

    <div class="tw-flex-1"></div>

    <span class="tw-hidden tw-xl-flex tw-items-center tw-gap-1.5 tw-text-[11px] tw-text-slate-400">
      <oa-icon name="key" class="tw-w-3.5 tw-h-3.5"></oa-icon> 快捷键 1 / 2 / 3 切换角色
    </span>

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

    <div class="tw-flex tw-items-center tw-gap-2.5 tw-pl-4 tw-border-l tw-border-white/10">
      <div class="tw-w-8 tw-h-8 tw-rounded-full tw-bg-white/10 tw-flex tw-items-center tw-justify-center tw-text-[12px] tw-font-semibold">{{ persona.name.slice(0, 1) }}</div>
      <div class="tw-leading-tight tw-hidden tw-lg-block">
        <div class="tw-text-[13px]">{{ persona.name }}</div>
        <div class="tw-text-[10px] tw-text-slate-400">{{ persona.title }} · {{ persona.deptName }}</div>
      </div>
    </div>
  </header>

  <div v-if="showGuide" class="tw-flex tw-items-center tw-gap-2 tw-px-5 tw-py-1.5 tw-bg-indigo-50 tw-text-indigo-700 tw-text-[11px] tw-border-b tw-border-indigo-100 tw-shrink-0">
    <oa-icon name="sparkles" class="tw-w-3.5 tw-h-3.5"></oa-icon>
    <span class="tw-flex-1">演示提示：点击右上角「演示场景」按用例顺序走查；也可用 <b>1 / 2 / 3</b> 切换角色。所有数据保存在浏览器本地，可随时重置。</span>
    <button @click="showGuide = false" class="tw-text-indigo-400 tw-hover:text-indigo-700"><oa-icon name="x" class="tw-w-3.5 tw-h-3.5"></oa-icon></button>
  </div>

  <main class="tw-flex-1 tw-min-h-0 tw-relative">
    <div v-if="loading" class="tw-absolute tw-inset-0 tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-4 tw-bg-slate-100">
      <div class="tw-w-10 tw-h-10 tw-rounded-full tw-border-2 tw-border-slate-200 tw-border-t-indigo-500 oa-spin"></div>
      <div class="tw-text-sm tw-text-slate-500">正在加载三角色组件…</div>
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
