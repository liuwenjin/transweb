<!--
  中国电子教育学会 公文与审批 OA · 审批处理面板（独立 Vue 3 单文件组件）
  待办处理 · 同意/退回/驳回 · 转办加签 · 审批记录
  依赖：Vue 3、Tailwind（tw- 前缀）、全局组件 oa-icon；props.store 见 ../README.md
-->
<template>
  <div class="tw-h-full tw-flex tw-overflow-hidden tw-bg-slate-100">
    <!-- 侧边导航 -->
    <aside class="tw-w-56 tw-bg-white tw-border-r tw-border-slate-200 tw-flex tw-flex-col tw-shrink-0">
      <div class="tw-px-4 tw-py-4 tw-border-b tw-border-slate-100">
        <div class="tw-flex tw-items-center tw-gap-2.5">
          <div class="tw-w-9 tw-h-9 tw-rounded-xl tw-bg-emerald-50 tw-text-emerald-600 tw-flex tw-items-center tw-justify-center">
            <oa-icon name="task" class="tw-w-5 tw-h-5"></oa-icon>
          </div>
          <div class="tw-leading-tight tw-min-w-0">
            <div class="tw-text-sm tw-font-semibold">{{ me.title }}</div>
            <div class="tw-text-[11px] tw-text-slate-500 tw-truncate">{{ me.name }} · {{ me.deptName }}</div>
          </div>
        </div>
        <div class="tw-mt-3 tw-flex tw-flex-wrap tw-gap-1">
          <span v-for="cap in me.caps" :key="cap" class="tw-px-1.5 tw-py-0.5 tw-rounded tw-bg-emerald-50 tw-text-emerald-700 tw-border tw-border-emerald-100 tw-text-[10px]">{{ capLabel(cap) }}</span>
        </div>
      </div>

      <div class="tw-flex-1 tw-px-3 tw-py-4 tw-overflow-y-auto oa-scroll">
        <div class="tw-text-[11px] tw-text-slate-400 tw-px-2 tw-mb-2 tw-tracking-wide">审批工作</div>
        <button v-for="item in navItems" :key="item.id" @click="go(item.id)"
          :class="['apr-nav tw-w-full tw-flex tw-items-center tw-gap-2.5 tw-px-2.5 tw-py-2 tw-rounded-lg tw-text-[13px] tw-mb-0.5',
                   tab === item.id ? 'tw-bg-emerald-50 tw-text-emerald-700 tw-font-medium' : 'tw-text-slate-600']">
          <oa-icon :name="item.icon" class="tw-w-4 tw-h-4"></oa-icon>
          <span class="tw-flex-1 tw-text-left">{{ item.label }}</span>
          <span v-if="item.badge" class="tw-min-w-4 tw-h-4 tw-px-1 tw-rounded-full tw-bg-rose-500 tw-text-white tw-text-[10px] tw-flex tw-items-center tw-justify-center">{{ item.badge }}</span>
        </button>

        <div class="tw-mt-6 tw-px-2 tw-py-3 tw-rounded-xl tw-bg-emerald-50 tw-border tw-border-emerald-100">
          <div class="tw-flex tw-items-center tw-gap-1.5 tw-text-[11px] tw-text-emerald-700">
            <span class="tw-w-1.5 tw-h-1.5 tw-rounded-full tw-bg-emerald-500"></span>
            审批权限来源
          </div>
          <div class="tw-mt-2 tw-text-[11px] tw-text-emerald-800 tw-leading-relaxed">按审批模板分配，仅可处理分配给本人的任务；处理记录不可修改。</div>
        </div>
      </div>

      <div class="tw-p-3 tw-border-t tw-border-slate-100">
        <div class="tw-flex tw-items-center tw-gap-2 tw-text-[11px] tw-text-slate-400 tw-px-1">
          <oa-icon name="clock" class="tw-w-3.5 tw-h-3.5"></oa-icon>
          时限内处理，超时计入统计
        </div>
      </div>
    </aside>

    <!-- 主区域 -->
    <section class="tw-flex-1 tw-min-w-0 tw-flex tw-flex-col">
      <header class="tw-h-16 tw-bg-white tw-border-b tw-border-slate-200 tw-flex tw-items-center tw-px-6 tw-gap-4 tw-shrink-0">
        <div>
          <div class="tw-text-base tw-font-semibold">{{ pageTitle }}</div>
          <div class="tw-text-[11px] tw-text-slate-500 tw-mt-0.5">{{ pageSubtitle }}</div>
        </div>
        <div class="tw-flex-1"></div>
        <div class="tw-flex tw-items-center tw-gap-2 tw-text-[11px] tw-text-slate-500 tw-px-3 tw-py-1.5 tw-rounded-full tw-bg-slate-50 tw-border tw-border-slate-200">
          <oa-icon name="user" class="tw-w-3.5 tw-h-3.5"></oa-icon>
          当前登录：{{ me.name }}
        </div>
        <div class="tw-relative">
          <button @click="notifOpen = !notifOpen" class="apr-icon-btn tw-relative tw-w-9 tw-h-9 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-text-slate-500">
            <oa-icon name="bell" class="tw-w-5 tw-h-5"></oa-icon>
            <span v-if="unread" class="tw-absolute tw-top-1.5 tw-right-1.5 tw-w-2 tw-h-2 tw-rounded-full tw-bg-rose-500 tw-ring-2 tw-ring-white"></span>
          </button>
          <transition name="oa-pop">
            <div v-if="notifOpen" class="tw-absolute tw-right-0 tw-top-11 tw-w-96 tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-shadow-2xl tw-z-30 tw-overflow-hidden">
              <div class="tw-flex tw-items-center tw-justify-between tw-px-4 tw-py-3 tw-border-b tw-border-slate-100">
                <span class="tw-text-sm tw-font-semibold">通知</span>
                <button @click="readAll" class="tw-text-[11px] tw-text-emerald-600">全部已读</button>
              </div>
              <div class="tw-max-h-80 tw-overflow-y-auto oa-scroll">
                <div v-for="n in myNotifs" :key="n.id" class="tw-px-4 tw-py-3 tw-border-b tw-border-slate-50 tw-cursor-pointer apr-row" @click="openNotif(n)">
                  <div class="tw-flex tw-items-center tw-gap-2">
                    <span :class="['tw-w-1.5 tw-h-1.5 tw-rounded-full', n.read ? 'tw-bg-slate-200' : 'tw-bg-emerald-500']"></span>
                    <span class="tw-text-[12px] tw-font-medium tw-flex-1">{{ n.title }}</span>
                    <span class="tw-text-[10px] tw-text-slate-400">{{ store.h.fromNow(n.at) }}</span>
                  </div>
                  <div class="tw-text-[11px] tw-text-slate-500 tw-mt-1 oa-clamp-2">{{ n.body }}</div>
                </div>
                <div v-if="!myNotifs.length" class="tw-py-10 tw-text-center tw-text-xs tw-text-slate-400">暂无通知</div>
              </div>
            </div>
          </transition>
        </div>
        <div class="tw-w-8 tw-h-8 tw-rounded-full tw-bg-emerald-600 tw-text-white tw-flex tw-items-center tw-justify-center tw-text-xs tw-font-semibold">{{ me.name.slice(0, 1) }}</div>
      </header>

      <div class="tw-flex-1 tw-overflow-y-auto oa-scroll tw-p-6">
        <!-- ==================== 待办 ==================== -->
        <div v-if="tab === 'todo'" class="tw-max-w-5xl tw-mx-auto">
          <div class="tw-flex tw-items-center tw-gap-2 tw-mb-4 tw-flex-wrap">
            <button v-for="f in typeFilters" :key="f.id" @click="typeFilter = f.id"
              :class="['tw-px-3 tw-py-1.5 tw-rounded-full tw-text-[12px] tw-border', typeFilter === f.id ? 'tw-bg-slate-900 tw-text-white tw-border-slate-900' : 'tw-bg-white tw-text-slate-600 tw-border-slate-200']">{{ f.label }}</button>
            <div class="tw-flex-1"></div>
            <span class="tw-text-[11px] tw-text-slate-400">共 {{ todoList.length }} 条待办</span>
            <span class="tw-text-[11px] tw-text-slate-400">·</span>
            <span class="tw-text-[11px] tw-text-rose-500">{{ urgentCount }} 条即将超时</span>
          </div>

          <div class="tw-space-y-3">
            <div v-for="item in todoList" :key="item.instance.id" class="apr-card tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-p-4 tw-cursor-pointer" @click="openDetail(item.instance)">
              <div class="tw-flex tw-items-start tw-gap-3">
                <div :class="['tw-w-10 tw-h-10 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-shrink-0', store.h.type(item.instance.type).cls]">
                  <oa-icon :name="store.h.type(item.instance.type).icon" class="tw-w-5 tw-h-5"></oa-icon>
                </div>
                <div class="tw-flex-1 tw-min-w-0">
                  <div class="tw-flex tw-items-center tw-gap-2">
                    <span class="tw-text-[13px] tw-font-medium tw-truncate">{{ item.instance.title }}</span>
                    <span v-if="item.instance.priority === 'urgent'" class="tw-px-1.5 tw-py-0.5 tw-rounded tw-bg-rose-50 tw-text-rose-600 tw-text-[10px] tw-border tw-border-rose-200">加急</span>
                  </div>
                  <div class="tw-text-[11px] tw-text-slate-500 tw-mt-1">
                    {{ item.instance.no }} · {{ store.h.type(item.instance.type).label }} · {{ item.instance.creator }}（{{ item.instance.deptName }}）
                  </div>
                  <div class="tw-flex tw-items-center tw-gap-3 tw-mt-2 tw-text-[11px] tw-text-slate-500">
                    <span class="tw-flex tw-items-center tw-gap-1"><oa-icon name="task" class="tw-w-3.5 tw-h-3.5"></oa-icon>{{ item.node.name }}</span>
                    <span class="tw-flex tw-items-center tw-gap-1" :class="isUrgent(item.instance.dueAt) ? 'tw-text-rose-600' : ''"><oa-icon name="clock" class="tw-w-3.5 tw-h-3.5"></oa-icon>{{ store.h.fromNow(item.instance.dueAt) }}</span>
                    <span v-if="item.instance.urgeCount" class="tw-text-amber-600">已催办 {{ item.instance.urgeCount }} 次</span>
                  </div>
                </div>
                <div class="tw-flex tw-items-center tw-gap-2 tw-shrink-0">
                  <button class="apr-btn-ghost tw-px-2.5 tw-py-1.5 tw-rounded-lg tw-text-[11px]" @click.stop="quickApprove(item.instance)">快速同意</button>
                  <oa-icon name="chevron-right" class="tw-w-4 tw-h-4 tw-text-slate-300"></oa-icon>
                </div>
              </div>
            </div>
            <div v-if="!todoList.length" class="tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-py-20 tw-text-center">
              <oa-icon name="check-circle" class="tw-w-10 tw-h-10 tw-text-emerald-400 tw-mx-auto"></oa-icon>
              <div class="tw-mt-3 tw-text-sm tw-text-slate-500">{{ me.name }} 的待办已全部处理</div>
              <div class="tw-mt-1 tw-text-[11px] tw-text-slate-400">可在左上角切换审批人，查看另一位审批人的待办</div>
            </div>
          </div>
        </div>

        <!-- ==================== 已办 ==================== -->
        <div v-if="tab === 'done'" class="tw-max-w-5xl tw-mx-auto">
          <div class="tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-overflow-hidden">
            <table class="tw-w-full tw-text-sm">
              <thead><tr class="tw-bg-slate-50 tw-text-[11px] tw-text-slate-500">
                <th class="tw-text-left tw-font-medium tw-px-5 tw-py-2.5">审批事项</th>
                <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-28">处理结果</th>
                <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-44">处理意见</th>
                <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-32">处理时间</th>
                <th class="tw-text-right tw-font-medium tw-px-5 tw-py-2.5 tw-w-16"></th>
              </tr></thead>
              <tbody class="tw-divide-y tw-divide-slate-100">
                <tr v-for="item in doneList" :key="item.instance.id + item.node.id" class="apr-row">
                  <td class="tw-px-5 tw-py-3">
                    <div class="tw-text-[12px] tw-font-medium">{{ item.instance.title }}</div>
                    <div class="tw-text-[10px] tw-text-slate-400 tw-mt-0.5">{{ item.instance.no }} · {{ item.node.name }}</div>
                  </td>
                  <td class="tw-px-3 tw-py-3"><span :class="['tw-px-2 tw-py-0.5 tw-rounded tw-text-[10px] tw-border', resultMeta(item.task.status).cls]">{{ resultMeta(item.task.status).label }}</span></td>
                  <td class="tw-px-3 tw-py-3 tw-text-[11px] tw-text-slate-500 oa-clamp-2">{{ item.task.comment || '—' }}</td>
                  <td class="tw-px-3 tw-py-3 tw-text-[11px] tw-text-slate-500">{{ store.h.fmtDateTime(item.task.handledAt) }}</td>
                  <td class="tw-px-5 tw-py-3 tw-text-right"><button class="tw-text-[11px] tw-text-emerald-600" @click="openDetail(item.instance)">查看</button></td>
                </tr>
              </tbody>
            </table>
            <div v-if="!doneList.length" class="tw-py-16 tw-text-center tw-text-xs tw-text-slate-400">暂无已办记录</div>
          </div>
        </div>

        <!-- ==================== 审批记录 ==================== -->
        <div v-if="tab === 'records'" class="tw-max-w-5xl tw-mx-auto">
          <div class="tw-flex tw-items-center tw-gap-2 tw-mb-4">
            <div class="tw-relative">
              <oa-icon name="search" class="tw-w-4 tw-h-4 tw-text-slate-400 tw-absolute tw-left-3 tw-top-2.5"></oa-icon>
              <input v-model="search" class="apr-input tw-w-72 tw-pl-9 tw-pr-3 tw-py-2 tw-text-sm tw-rounded-lg tw-border tw-border-slate-200 tw-bg-white" placeholder="搜索审批单号或标题" />
            </div>
            <select v-model="statusFilter" class="apr-input tw-px-3 tw-py-2 tw-rounded-lg tw-text-[12px] tw-border tw-border-slate-200 tw-bg-white">
              <option value="">全部状态</option>
              <option value="RUNNING">审批中</option>
              <option value="APPROVED">已通过</option>
              <option value="RETURNED">已退回</option>
              <option value="REJECTED">已驳回</option>
              <option value="WITHDRAWN">已撤回</option>
            </select>
            <div class="tw-flex-1"></div>
            <span class="tw-text-[11px] tw-text-slate-400">共 {{ recordList.length }} 条</span>
          </div>

          <div class="tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-overflow-hidden">
            <table class="tw-w-full tw-text-sm">
              <thead><tr class="tw-bg-slate-50 tw-text-[11px] tw-text-slate-500">
                <th class="tw-text-left tw-font-medium tw-px-5 tw-py-2.5">审批单</th>
                <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-24">类型</th>
                <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-24">状态</th>
                <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-28">发起人</th>
                <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-28">提交时间</th>
                <th class="tw-text-right tw-font-medium tw-px-5 tw-py-2.5 tw-w-32">操作</th>
              </tr></thead>
              <tbody class="tw-divide-y tw-divide-slate-100">
                <tr v-for="inst in recordList" :key="inst.id" class="apr-row">
                  <td class="tw-px-5 tw-py-3">
                    <div class="tw-text-[12px] tw-font-medium tw-flex tw-items-center tw-gap-2">{{ inst.title }} <span v-if="inst.priority === 'urgent'" class="tw-px-1 tw-rounded tw-bg-rose-50 tw-text-rose-500 tw-text-[10px]">急</span></div>
                    <div class="tw-text-[10px] tw-text-slate-400 tw-mt-0.5">{{ inst.no }}</div>
                  </td>
                  <td class="tw-px-3 tw-py-3 tw-text-[11px] tw-text-slate-500">{{ store.h.type(inst.type).label }}</td>
                  <td class="tw-px-3 tw-py-3"><span :class="['tw-px-2 tw-py-0.5 tw-rounded tw-text-[10px] tw-border', store.h.instStatus(inst.status).cls]">{{ store.h.instStatus(inst.status).label }}</span></td>
                  <td class="tw-px-3 tw-py-3 tw-text-[11px] tw-text-slate-500">{{ inst.creator }}</td>
                  <td class="tw-px-3 tw-py-3 tw-text-[11px] tw-text-slate-500">{{ store.h.fmtDate(inst.submittedAt) }}</td>
                  <td class="tw-px-5 tw-py-3 text-right">
                    <div class="tw-flex tw-items-center tw-justify-end tw-gap-2">
                      <button class="tw-text-[11px] tw-text-slate-500" @click="openDetail(inst)">详情</button>
                      <button class="tw-text-[11px] tw-text-emerald-600" @click="openExport(inst)">导出审批单</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="!recordList.length" class="tw-py-16 tw-text-center tw-text-xs tw-text-slate-400">未找到审批记录</div>
          </div>
        </div>

        <!-- ==================== 统计 ==================== -->
        <div v-if="tab === 'stats'" class="tw-max-w-5xl tw-mx-auto tw-space-y-5">
          <div class="tw-grid tw-grid-cols-4 tw-gap-4">
            <div v-for="s in statCards" :key="s.label" class="tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-p-4">
              <div class="tw-text-[11px] tw-text-slate-500">{{ s.label }}</div>
              <div class="tw-mt-2 tw-flex tw-items-end tw-gap-2">
                <span class="tw-text-2xl tw-font-semibold">{{ s.value }}</span>
                <span class="tw-text-[10px] tw-text-slate-400 tw-mb-1">{{ s.unit }}</span>
              </div>
              <div class="tw-mt-2 tw-text-[10px]" :class="s.trend === 'up' ? 'tw-text-rose-500' : 'tw-text-emerald-600'">{{ s.hint }}</div>
            </div>
          </div>

          <div class="tw-grid tw-grid-cols-3 tw-gap-5">
            <div class="tw-col-span-2 tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-p-5">
              <div class="tw-flex tw-items-center tw-justify-between">
                <div class="tw-text-sm tw-font-semibold">近 6 个月办结量</div>
                <span class="tw-text-[11px] tw-text-slate-400">单位：件</span>
              </div>
              <div class="tw-mt-6 tw-flex tw-items-end tw-justify-between tw-gap-4 tw-h-48">
                <div v-for="m in monthly" :key="m.label" class="tw-flex-1 tw-flex tw-flex-col tw-items-center tw-gap-2">
                  <div class="tw-text-[11px] tw-text-slate-500">{{ m.value }}</div>
                  <div class="tw-w-full tw-rounded-t-lg tw-bg-emerald-500/80" :style="{ height: (m.value / maxMonthly * 100) + '%', minHeight: '6px' }"></div>
                  <div class="tw-text-[11px] tw-text-slate-400">{{ m.label }}</div>
                </div>
              </div>
            </div>

            <div class="tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-p-5">
              <div class="tw-text-sm tw-font-semibold">事项分布</div>
              <div class="tw-mt-4 tw-space-y-3">
                <div v-for="t in typeStats" :key="t.type">
                  <div class="tw-flex tw-items-center tw-justify-between tw-text-[11px]">
                    <span class="tw-text-slate-600">{{ t.label }}</span>
                    <span class="tw-text-slate-400">{{ t.count }} 件</span>
                  </div>
                  <div class="tw-mt-1.5 tw-h-1.5 tw-rounded-full tw-bg-slate-100 tw-overflow-hidden">
                    <div class="tw-h-full tw-rounded-full tw-bg-emerald-500" :style="{ width: (t.count / Math.max(1, instTotal) * 100) + '%' }"></div>
                  </div>
                </div>
              </div>
              <div class="tw-mt-5 tw-p-3 tw-rounded-xl tw-bg-slate-50 tw-text-[11px] tw-text-slate-500 tw-leading-relaxed">
                超时与退回率计入部门统计；连续超时将由系统管理员提醒。
              </div>
            </div>
          </div>

          <div class="tw-bg-white tw-rounded-xl tw-border tw-border-slate-200">
            <div class="tw-px-5 tw-py-4 tw-border-b tw-border-slate-100 tw-text-sm tw-font-semibold">最近处理</div>
            <div class="tw-divide-y tw-divide-slate-50">
              <div v-for="item in doneList.slice(0, 5)" :key="item.instance.id + '-s'" class="tw-px-5 tw-py-3 tw-flex tw-items-center tw-gap-3">
                <span :class="['tw-px-2 tw-py-0.5 tw-rounded tw-text-[10px] tw-border', resultMeta(item.task.status).cls]">{{ resultMeta(item.task.status).label }}</span>
                <span class="tw-text-[12px] tw-text-slate-700 tw-flex-1 tw-truncate">{{ item.instance.title }}</span>
                <span class="tw-text-[11px] tw-text-slate-400">{{ store.h.fromNow(item.task.handledAt) }}</span>
              </div>
              <div v-if="!doneList.length" class="tw-py-10 tw-text-center tw-text-xs tw-text-slate-400">暂无处理记录</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== 审批详情 ==================== -->
    <div v-if="detail" class="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-6">
      <div class="tw-absolute tw-inset-0 tw-bg-slate-900/50" @click="detail = null"></div>
      <div class="tw-relative tw-w-full tw-max-w-5xl tw-max-h-[88vh] tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-flex tw-flex-col tw-overflow-hidden">
        <div class="tw-flex tw-items-start tw-gap-3 tw-px-5 tw-py-4 tw-border-b tw-border-slate-100 tw-shrink-0">
          <div :class="['tw-w-10 tw-h-10 tw-rounded-xl tw-flex tw-items-center tw-justify-center', store.h.type(detail.type).cls]">
            <oa-icon :name="store.h.type(detail.type).icon" class="tw-w-5 tw-h-5"></oa-icon>
          </div>
          <div class="tw-flex-1 min-w-0">
            <div class="tw-flex tw-items-center tw-gap-2">
              <span class="tw-text-sm tw-font-semibold">{{ detail.title }}</span>
              <span :class="['tw-px-1.5 tw-py-0.5 tw-rounded tw-text-[10px] tw-border', store.h.instStatus(detail.status).cls]">{{ store.h.instStatus(detail.status).label }}</span>
              <span v-if="detail.priority === 'urgent'" class="tw-px-1.5 tw-py-0.5 tw-rounded tw-bg-rose-50 tw-text-rose-600 tw-text-[10px] tw-border tw-border-rose-200">加急</span>
            </div>
            <div class="tw-text-[11px] tw-text-slate-500 tw-mt-1">{{ detail.no }} · {{ store.h.type(detail.type).label }} · {{ detail.creator }}（{{ detail.deptName }}）· 提交于 {{ store.h.fmtDateTime(detail.submittedAt) }}</div>
          </div>
          <button class="apr-icon-btn tw-w-8 tw-h-8 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-text-slate-400" @click="detail = null"><oa-icon name="x" class="tw-w-4 tw-h-4"></oa-icon></button>
        </div>

        <div class="tw-flex-1 tw-overflow-y-auto oa-scroll">
          <div class="tw-grid tw-grid-cols-3 tw-gap-0 tw-h-full">
            <div class="tw-col-span-2 tw-p-5 tw-border-r tw-border-slate-100 tw-space-y-5">
              <div>
                <div class="tw-text-[11px] tw-text-slate-400 tw-mb-2">表单信息</div>
                <div class="tw-rounded-xl tw-border tw-border-slate-100 tw-divide-y tw-divide-slate-50">
                  <div v-for="(f, i) in detail.form" :key="i" class="tw-flex tw-px-3.5 tw-py-2.5 tw-text-[12px]">
                    <span class="tw-w-24 tw-text-slate-500 tw-shrink-0">{{ f.label }}</span>
                    <span class="tw-text-slate-800 tw-flex-1">{{ f.value }}</span>
                  </div>
                </div>
              </div>

              <div v-if="relatedDoc(detail)">
                <div class="tw-text-[11px] tw-text-slate-400 tw-mb-2">关联文档</div>
                <div class="tw-rounded-xl tw-border tw-border-slate-100 tw-p-3.5 tw-flex tw-items-center tw-gap-3">
                  <div class="tw-w-10 tw-h-10 tw-rounded-lg tw-bg-indigo-50 tw-text-indigo-600 tw-flex tw-items-center tw-justify-center"><oa-icon name="docs" class="tw-w-5 tw-h-5"></oa-icon></div>
                  <div class="tw-flex-1 tw-min-w-0">
                    <div class="tw-text-[12px] tw-font-medium tw-truncate">{{ relatedDoc(detail).title }}</div>
                    <div class="tw-text-[10px] tw-text-slate-400 tw-mt-0.5">{{ relatedDoc(detail).no }} · V{{ relatedDoc(detail).version }} · {{ relatedDoc(detail).size }}</div>
                  </div>
                  <button class="tw-px-2.5 tw-py-1.5 tw-rounded-lg tw-text-[11px] tw-text-indigo-600 tw-bg-indigo-50" @click="openDocPreview(relatedDoc(detail))">预览</button>
                </div>
              </div>

              <div>
                <div class="tw-text-[11px] tw-text-slate-400 tw-mb-2">附件（{{ attachments.length }}）</div>
                <div class="tw-space-y-1.5">
                  <div v-for="a in attachments" :key="a.name" class="tw-flex tw-items-center tw-gap-2 tw-px-3 tw-py-2 tw-rounded-lg tw-bg-slate-50 tw-text-[11px]">
                    <oa-icon name="file" class="tw-w-4 tw-h-4 tw-text-slate-400"></oa-icon>
                    <span class="tw-flex-1 tw-text-slate-700">{{ a.name }}</span>
                    <span class="tw-text-slate-400">{{ a.size }}</span>
                    <button class="tw-text-indigo-600" @click="store.toast('附件预览（演示）：' + a.name, 'info')">预览</button>
                  </div>
                </div>
              </div>

              <div>
                <div class="tw-text-[11px] tw-text-slate-400 tw-mb-2">审批意见与操作记录</div>
                <div class="tw-space-y-2">
                  <div v-for="(h, i) in detail.history.slice().reverse()" :key="i" class="tw-flex tw-gap-2 tw-text-[11px]">
                    <span class="tw-text-slate-400 tw-w-28 tw-shrink-0">{{ store.h.fmtDateTime(h.at) }}</span>
                    <span class="tw-text-slate-700 tw-w-16 tw-shrink-0">{{ h.actor }}</span>
                    <span class="tw-text-slate-500">{{ h.action }}<span v-if="h.comment">：{{ h.comment }}</span></span>
                  </div>
                </div>
              </div>
            </div>

            <div class="tw-p-5 tw-space-y-4 tw-bg-slate-50/60">
              <div class="tw-flex tw-items-center tw-justify-between">
                <div class="tw-text-[11px] tw-text-slate-400">审批流程</div>
                <span class="tw-text-[11px]" :class="isUrgent(detail.dueAt) ? 'tw-text-rose-600' : 'tw-text-slate-500'">{{ store.h.fromNow(detail.dueAt) }}</span>
              </div>
              <div class="tw-space-y-1">
                <div v-for="(node, idx) in detail.nodes" :key="node.id" class="tw-flex tw-gap-3">
                  <div class="tw-flex tw-flex-col tw-items-center tw-w-5 tw-shrink-0">
                    <span :class="['tw-w-5 tw-h-5 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-[10px]',
                      node.status === 'approved' ? 'tw-bg-emerald-500 tw-text-white' : node.status === 'pending' ? 'tw-bg-amber-500 tw-text-white' : node.status === 'returned' || node.status === 'rejected' ? 'tw-bg-rose-500 tw-text-white' : 'tw-bg-slate-200 tw-text-slate-500']">
                      <oa-icon v-if="node.status === 'approved'" name="check" class="tw-w-3 tw-h-3"></oa-icon>
                      <span v-else>{{ idx + 1 }}</span>
                    </span>
                    <span v-if="idx < detail.nodes.length - 1" class="tw-w-px tw-flex-1 tw-bg-slate-200 tw-my-1"></span>
                  </div>
                  <div class="tw-flex-1 tw-pb-3">
                    <div class="tw-flex tw-items-center tw-gap-2">
                      <span class="tw-text-[12px] tw-font-medium">{{ node.name }}</span>
                      <span v-if="node.status === 'pending'" class="tw-px-1.5 tw-py-0.5 tw-rounded tw-bg-amber-100 tw-text-amber-700 tw-text-[10px]">处理中</span>
                    </div>
                    <div v-for="t in node.tasks" :key="t.account" class="tw-mt-1.5 tw-flex tw-items-start tw-gap-2">
                      <span class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-white tw-border tw-border-slate-200 tw-text-slate-500 tw-flex tw-items-center tw-justify-center tw-text-[10px] tw-shrink-0">{{ t.name.slice(0, 1) }}</span>
                      <div class="tw-text-[11px]">
                        <div class="tw-text-slate-700">{{ t.name }} <span class="tw-text-slate-400">· {{ taskLabel(t.status) }}</span></div>
                        <div v-if="t.comment" class="tw-text-slate-500 tw-mt-0.5">“{{ t.comment }}”</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="myTask(detail)" class="tw-pt-2 tw-border-t tw-border-slate-200">
                <div class="tw-text-[11px] tw-text-slate-400 tw-mb-2">我的处理意见</div>
                <textarea v-model="comment" rows="3" class="apr-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[12px] tw-border tw-border-slate-200" placeholder="填写审批意见（退回、驳回时必填）"></textarea>
              </div>
              <div v-else class="tw-rounded-xl tw-bg-white tw-border tw-border-slate-200 tw-p-3 tw-text-[11px] tw-text-slate-500">
                <div class="tw-flex tw-items-center tw-gap-1.5 tw-text-slate-700 tw-font-medium tw-mb-1"><oa-icon name="info" class="tw-w-3.5 tw-h-3.5"></oa-icon>当前无待处理任务</div>
                此审批单当前不在您的待办中，可查看流程与处理记录。
              </div>
            </div>
          </div>
        </div>

        <div class="tw-flex tw-items-center tw-gap-2 tw-px-5 tw-py-3.5 tw-bg-white tw-border-t tw-border-slate-100 tw-shrink-0">
          <button class="apr-btn-ghost tw-px-3 tw-py-2 tw-rounded-lg tw-text-[12px] tw-flex tw-items-center tw-gap-1.5" @click="openExport(detail)">
            <oa-icon name="print" class="tw-w-4 tw-h-4"></oa-icon>导出审批单
          </button>
          <button v-if="detail.status === 'RUNNING'" class="apr-btn-ghost tw-px-3 tw-py-2 tw-rounded-lg tw-text-[12px] tw-text-amber-700" @click="urge(detail)">催办</button>
          <div class="tw-flex-1"></div>
          <div v-if="myTask(detail)" class="tw-flex tw-items-center tw-gap-2">
            <button class="apr-btn-ghost tw-px-3 tw-py-2 tw-rounded-lg tw-text-[12px]" @click="openAction('transfer')">转办</button>
            <button class="apr-btn-ghost tw-px-3 tw-py-2 tw-rounded-lg tw-text-[12px]" @click="openAction('addsign')">加签</button>
            <button class="tw-px-3 tw-py-2 tw-rounded-lg tw-text-[12px] tw-text-rose-600 tw-bg-rose-50" @click="openAction('return')">退回</button>
            <button class="tw-px-3 tw-py-2 tw-rounded-lg tw-text-[12px] tw-text-rose-600 tw-bg-rose-50" @click="openAction('reject')">驳回</button>
            <button class="tw-px-4 tw-py-2 tw-rounded-lg tw-text-[12px] tw-text-white tw-bg-emerald-600" @click="approve">同意</button>
          </div>
          <button v-else class="apr-btn-primary tw-px-4 tw-py-2 tw-rounded-lg tw-text-[12px] tw-text-white" @click="detail = null">关闭</button>
        </div>
      </div>
    </div>

    <!-- ==================== 退回 / 驳回 / 转办 / 加签 ==================== -->
    <div v-if="actionOpen" class="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-6">
      <div class="tw-absolute tw-inset-0 tw-bg-slate-900/60" @click="actionOpen = false"></div>
      <div class="tw-relative tw-w-full tw-max-w-lg tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-overflow-hidden">
        <div class="tw-px-5 tw-py-4 tw-border-b tw-border-slate-100">
          <div class="tw-text-sm tw-font-semibold">{{ actionTitle }}</div>
          <div class="tw-text-[11px] tw-text-slate-500 tw-mt-0.5">{{ actionHint }}</div>
        </div>
        <div class="tw-p-5 tw-space-y-4">
          <div v-if="actionType === 'transfer' || actionType === 'addsign'">
            <label class="apr-label">{{ actionType === 'transfer' ? '转办给' : '加签人（可多选）' }}</label>
            <div class="tw-space-y-2">
              <label v-for="a in otherApprovers" :key="a.account" class="tw-flex tw-items-center gap-2 tw-px-3 tw-py-2 tw-rounded-lg tw-border tw-border-slate-200 tw-cursor-pointer">
                <input v-if="actionType === 'addsign'" type="checkbox" class="tw-w-4 tw-h-4 tw-accent-emerald-600" :value="a.account" v-model="actionTargets" />
                <input v-else type="radio" name="transfer" :value="a.account" v-model="actionTarget" />
                <span class="tw-text-[12px] tw-text-slate-700">{{ a.name }} · {{ a.title }}</span>
              </label>
            </div>
          </div>
          <div v-if="actionType === 'return'">
            <label class="apr-label">退回至</label>
            <select v-model="actionReturnTo" class="apr-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200 tw-bg-white">
              <option value="creator">发起人（修改后重新提交）</option>
              <option value="prev">上一审批环节</option>
            </select>
          </div>
          <div>
            <label class="apr-label">意见说明 <span v-if="actionType !== 'addsign'" class="tw-text-rose-500">*</span></label>
            <textarea v-model="actionComment" rows="3" class="apr-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200" :placeholder="actionPlaceholder"></textarea>
          </div>
          <div class="tw-flex tw-items-start tw-gap-2 tw-px-3 tw-py-2.5 tw-rounded-lg tw-bg-amber-50 tw-text-[11px] tw-text-amber-700">
            <oa-icon name="alert" class="tw-w-3.5 tw-h-3.5 tw-mt-0.5"></oa-icon>
            <span>{{ actionWarn }}</span>
          </div>
        </div>
        <div class="tw-flex tw-items-center tw-justify-end tw-gap-2 tw-px-5 tw-py-4 tw-bg-slate-50">
          <button @click="actionOpen = false" class="apr-btn-ghost tw-px-4 tw-py-2 tw-rounded-lg tw-text-[12px]">取消</button>
          <button @click="submitAction" class="tw-px-4 tw-py-2 tw-rounded-lg tw-text-[12px] tw-text-white" :class="actionType === 'approve' ? 'tw-bg-emerald-600' : 'tw-bg-rose-600'">{{ actionOk }}</button>
        </div>
      </div>
    </div>

    <!-- ==================== 关联文档预览 ==================== -->
    <div v-if="docPreview" class="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-6">
      <div class="tw-absolute tw-inset-0 tw-bg-slate-900/50" @click="docPreview = null"></div>
      <div class="tw-relative tw-w-full tw-max-w-lg tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-overflow-hidden">
        <div class="tw-flex tw-items-center tw-gap-2 tw-px-5 tw-py-4 tw-border-b tw-border-slate-100">
          <oa-icon name="docs" class="tw-w-4 tw-h-4 tw-text-indigo-600"></oa-icon>
          <span class="tw-text-sm tw-font-semibold tw-flex-1 tw-truncate">{{ docPreview.title }}</span>
          <button class="tw-text-slate-400" @click="docPreview = null"><oa-icon name="x" class="tw-w-4 tw-h-4"></oa-icon></button>
        </div>
        <div class="tw-p-5 space-y-3">
          <div class="tw-text-[11px] tw-text-slate-500">{{ docPreview.no }} · {{ docPreview.catName }} · V{{ docPreview.version }}</div>
          <div class="tw-text-[12px] tw-text-slate-700 tw-leading-relaxed">{{ docPreview.summary }}</div>
          <div class="tw-px-3 tw-py-2.5 tw-rounded-lg tw-bg-amber-50 tw-text-[11px] tw-text-amber-700">审批人可查看任务关联文档，但不获得额外下载权限。</div>
        </div>
        <div class="tw-flex tw-justify-end tw-px-5 tw-py-3.5 tw-bg-slate-50">
          <button @click="docPreview = null" class="apr-btn-primary tw-px-4 tw-py-2 tw-rounded-lg tw-text-[12px] tw-text-white">关闭</button>
        </div>
      </div>
    </div>

    <!-- ==================== 导出审批单 ==================== -->
    <div v-if="exportInstance" class="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-6">
      <div class="tw-absolute tw-inset-0 tw-bg-slate-900/60" @click="exportInstance = null"></div>
      <div class="tw-relative tw-w-full tw-max-w-2xl tw-max-h-[90vh] tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-flex tw-flex-col tw-overflow-hidden">
        <div class="tw-flex tw-items-center tw-justify-between tw-px-5 tw-py-3.5 tw-border-b tw-border-slate-100">
          <div class="tw-text-sm tw-font-semibold">审批单预览</div>
          <button class="tw-text-slate-400" @click="exportInstance = null"><oa-icon name="x" class="tw-w-4 tw-h-4"></oa-icon></button>
        </div>
        <div class="tw-flex-1 tw-overflow-y-auto oa-scroll tw-bg-slate-100 tw-p-6">
          <div class="apr-print-sheet tw-bg-white tw-mx-auto tw-px-10 tw-py-8 tw-shadow-sm">
            <div class="tw-text-center tw-text-lg tw-font-semibold">中国电子教育学会 · 公文与审批 OA 审批单</div>
            <div class="tw-text-center tw-text-[11px] tw-text-slate-500 tw-mt-1">{{ exportInstance.no }}</div>
            <div class="tw-h-px tw-bg-slate-200 tw-my-5"></div>
            <table class="tw-w-full tw-text-[11px] tw-border-collapse">
              <tbody>
                <tr><td class="tw-w-24 tw-py-1.5 tw-text-slate-500">事项名称</td><td class="tw-py-1.5">{{ exportInstance.title }}</td></tr>
                <tr><td class="tw-py-1.5 tw-text-slate-500">事项类型</td><td class="tw-py-1.5">{{ store.h.type(exportInstance.type).label }}</td></tr>
                <tr><td class="tw-py-1.5 tw-text-slate-500">发起人</td><td class="tw-py-1.5">{{ exportInstance.creator }}（{{ exportInstance.deptName }}）</td></tr>
                <tr><td class="tw-py-1.5 tw-text-slate-500">提交时间</td><td class="tw-py-1.5">{{ store.h.fmtDateTime(exportInstance.submittedAt) }}</td></tr>
                <tr><td class="tw-py-1.5 tw-text-slate-500">当前状态</td><td class="tw-py-1.5">{{ store.h.instStatus(exportInstance.status).label }}</td></tr>
              </tbody>
            </table>
            <div class="tw-mt-4 tw-text-[11px] tw-text-slate-500">表单内容</div>
            <table class="tw-w-full tw-text-[11px] tw-border-collapse tw-mt-1">
              <tbody>
                <tr v-for="(f, i) in exportInstance.form" :key="i">
                  <td class="tw-w-24 tw-py-1.5 tw-text-slate-500 tw-border-t tw-border-slate-100">{{ f.label }}</td>
                  <td class="tw-py-1.5 tw-border-t tw-border-slate-100">{{ f.value }}</td>
                </tr>
              </tbody>
            </table>
            <div class="tw-mt-4 tw-text-[11px] tw-text-slate-500">审批记录</div>
            <table class="tw-w-full tw-text-[11px] tw-border-collapse tw-mt-1">
              <thead><tr class="tw-text-slate-500"><th class="tw-text-left tw-font-normal tw-py-1.5 tw-border-b tw-border-slate-100">环节</th><th class="tw-text-left tw-font-normal tw-py-1.5 tw-border-b tw-border-slate-100">审批人</th><th class="tw-text-left tw-font-normal tw-py-1.5 tw-border-b tw-border-slate-100">结果</th><th class="tw-text-left tw-font-normal tw-py-1.5 tw-border-b tw-border-slate-100">意见</th><th class="tw-text-left tw-font-normal tw-py-1.5 tw-border-b tw-border-slate-100">时间</th></tr></thead>
              <tbody>
                <tr v-for="(node, idx) in exportInstance.nodes" :key="idx">
                  <td class="tw-py-1.5 tw-border-b tw-border-slate-50">{{ node.name }}</td>
                  <td class="tw-py-1.5 tw-border-b tw-border-slate-50">{{ node.tasks.map(t => t.name).join('、') }}</td>
                  <td class="tw-py-1.5 tw-border-b tw-border-slate-50">{{ node.status === 'approved' ? '同意' : node.status === 'returned' ? '退回' : node.status === 'rejected' ? '驳回' : '处理中' }}</td>
                  <td class="tw-py-1.5 tw-border-b tw-border-slate-50">{{ node.tasks.map(t => t.comment).filter(Boolean).join('；') || '—' }}</td>
                  <td class="tw-py-1.5 tw-border-b tw-border-slate-50">{{ store.h.fmtDate(node.tasks[0] && node.tasks[0].handledAt) }}</td>
                </tr>
              </tbody>
            </table>
            <div class="tw-mt-8 tw-flex tw-justify-between tw-text-[11px] tw-text-slate-500">
              <span>导出人：{{ me.name }}</span>
              <span>导出时间：{{ store.h.fmtDateTime(new Date().toISOString()) }}</span>
            </div>
            <div class="tw-mt-3 tw-text-[10px] tw-text-slate-400">本审批单由系统生成，含水印与操作记录，仅限学会内部使用。</div>
          </div>
        </div>
        <div class="tw-flex tw-items-center tw-justify-between tw-px-5 tw-py-3.5 tw-bg-white tw-border-t tw-border-slate-100">
          <span class="tw-text-[11px] tw-text-slate-400">导出行为将写入审计日志</span>
          <div class="tw-flex tw-gap-2">
            <button @click="exportInstance = null" class="apr-btn-ghost tw-px-4 tw-py-2 tw-rounded-lg tw-text-[12px]">关闭</button>
            <button @click="printSheet" class="apr-btn-primary tw-px-4 tw-py-2 tw-rounded-lg tw-text-[12px] tw-text-white tw-flex tw-items-center tw-gap-1.5"><oa-icon name="print" class="tw-w-4 tw-h-4"></oa-icon>打印 / 导出 PDF</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ApproverPanel",
  props: { store: { type: Object, required: true } },
  data() {
    return {
      tab: "todo",
      typeFilter: "all",
      statusFilter: "",
      search: "",
      notifOpen: false,
      detail: null,
      comment: "",
      actionOpen: false,
      actionType: "return",
      actionComment: "",
      actionTarget: "",
      actionTargets: [],
      actionReturnTo: "creator",
      docPreview: null,
      exportInstance: null,
      monthly: [
        { label: "5 月", value: 12 },
        { label: "6 月", value: 18 },
        { label: "7 月", value: 9 },
        { label: "8 月", value: 22 },
        { label: "9 月", value: 16 },
        { label: "10 月", value: 25 }
      ]
    };
  },
  computed: {
    me() {
      return this.store.currentUser || this.store.persona.approver;
    },
    navItems() {
      return [
        { id: "todo", label: "我的待办", icon: "inbox", badge: this.store.todoFor(this.me.account).length },
        { id: "done", label: "我的已办", icon: "check-circle", badge: 0 },
        { id: "records", label: "审批记录", icon: "clipboard", badge: 0 },
        { id: "stats", label: "审批统计", icon: "chart", badge: 0 }
      ];
    },
    pageTitle() {
      return { todo: "我的待办", done: "我的已办", records: "审批记录", stats: "审批统计" }[this.tab];
    },
    pageSubtitle() {
      return {
        todo: "仅显示分配给当前审批人的任务",
        done: "我处理过的任务与意见",
        records: "学会审批实例与流转记录",
        stats: "办结量、退回率与处理时长"
      }[this.tab];
    },
    todoAll() { return this.store.todoFor(this.me.account); },
    todoList() {
      let list = this.todoAll;
      if (this.typeFilter !== "all") list = list.filter(i => i.instance.type === this.typeFilter);
      return list.slice().sort((a, b) => {
        const pa = a.instance.priority === "urgent" ? 0 : 1;
        const pb = b.instance.priority === "urgent" ? 0 : 1;
        if (pa !== pb) return pa - pb;
        return new Date(a.instance.dueAt) - new Date(b.instance.dueAt);
      });
    },
    urgentCount() { return this.todoAll.filter(i => this.isUrgent(i.instance.dueAt)).length; },
    typeFilters() {
      return [
        { id: "all", label: "全部" },
        { id: "DOC_ARCHIVE", label: "文档归档" },
        { id: "PERM_GRANT", label: "权限调整" },
        { id: "SENSITIVE_DOWNLOAD", label: "敏感下载" },
        { id: "GENERAL", label: "通用事项" }
      ];
    },
    doneList() { return this.store.doneFor(this.me.account); },
    recordList() {
      let list = this.store.instances.slice();
      if (this.statusFilter) list = list.filter(i => i.status === this.statusFilter);
      if (this.search) {
        const q = this.search.toLowerCase();
        list = list.filter(i => (i.title + i.no + i.creator).toLowerCase().indexOf(q) >= 0);
      }
      return list;
    },
    unread() { return this.store.unreadFor(this.me.account); },
    myNotifs() { return this.store.notificationsFor(this.me.account).slice(0, 8); },
    attachments() {
      if (!this.detail) return [];
      if (this.detail.type === "DOC_ARCHIVE") return [
        { name: "归档材料说明.pdf", size: "320 KB" },
        { name: "支撑材料清单.xlsx", size: "48 KB" }
      ];
      if (this.detail.type === "SENSITIVE_DOWNLOAD") return [{ name: "下载用途说明.docx", size: "26 KB" }];
      if (this.detail.type === "PERM_GRANT") return [{ name: "权限申请说明.pdf", size: "180 KB" }];
      return [];
    },
    otherApprovers() { return this.store.approvers.filter(a => a.account !== this.me.account); },
    maxMonthly() { return Math.max.apply(null, this.monthly.map(m => m.value)); },
    instTotal() { return this.store.instances.length; },
    statCards() {
      const s = this.store.approvalStats();
      return [
        { label: "待我处理", value: this.todoAll.length, unit: "件", hint: this.urgentCount + " 件即将超时", trend: "up" },
        { label: "近 30 天办结", value: this.doneList.length, unit: "件", hint: "含同意、退回与驳回", trend: "down" },
        { label: "平均处理时长", value: s.avgHours, unit: "小时", hint: "目标 ≤ 16 小时", trend: "down" },
        { label: "退回 / 驳回率", value: s.returnedRate, unit: "%", hint: "逐月下降", trend: "down" }
      ];
    },
    typeStats() { return this.store.approvalStats().byType; },
    actionTitle() {
      return { return: "退回审批", reject: "驳回审批", transfer: "转办任务", addsign: "加签会签" }[this.actionType];
    },
    actionHint() {
      return {
        return: "退回后发起人可修改并重新提交，审批轮次加 1",
        reject: "驳回将终止流程，发起人需重新发起",
        transfer: "将当前任务转交给其他审批人处理",
        addsign: "增加会签人，需全部同意后进入下一环节"
      }[this.actionType];
    },
    actionPlaceholder() {
      return this.actionType === "addsign" ? "说明加签原因（选填）" : "请填写具体意见，将展示在审批轨迹中";
    },
    actionWarn() {
      return {
        return: "退回必须填写理由；退回后本轮审批任务将关闭。",
        reject: "驳回不可撤销，请确认材料确实不符合要求。",
        transfer: "转办后原任务从您的待办中移除，仍保留转办记录。",
        addsign: "加签人将收到待办，所有会签人同意后流转。"
      }[this.actionType];
    },
    actionOk() {
      return { return: "确认退回", reject: "确认驳回", transfer: "确认转办", addsign: "确认加签" }[this.actionType];
    }
  },
  watch: {
    "store.intent.seq"() { this.applyIntent(); }
  },
  mounted() { this.applyIntent(); },
  methods: {
    capLabel(cap) { return { staff: "文档查阅", approver: "审批处理", docadmin: "文档管理" }[cap] || cap; },
    go(tab) { this.tab = tab; this.detail = null; },
    applyIntent() {
      const it = this.store.intent;
      if (!it || it.role !== "approver") return;
      if (it.seq === this._lastSeq) return;
      this._lastSeq = it.seq;
      if (it.tab) this.tab = ["todo", "done", "records", "stats"].indexOf(it.tab) >= 0 ? it.tab : "todo";
      if (it.instanceId) {
        const inst = this.store.instanceById(it.instanceId);
        if (inst) {
          this.tab = "todo";
          this.openDetail(inst);
        }
      }
    },
    isUrgent(due) { return new Date(due).getTime() - Date.now() < 24 * 3600 * 1000; },
    taskLabel(status) {
      return { pending: "待处理", approved: "已同意", returned: "已退回", rejected: "已驳回", waiting: "待流转", cancelled: "已取消" }[status] || status;
    },
    resultMeta(status) {
      if (status === "approved") return { label: "同意", cls: "tw-bg-emerald-50 tw-text-emerald-700 tw-border-emerald-200" };
      if (status === "returned") return { label: "退回", cls: "tw-bg-amber-50 tw-text-amber-700 tw-border-amber-200" };
      if (status === "rejected") return { label: "驳回", cls: "tw-bg-rose-50 tw-text-rose-700 tw-border-rose-200" };
      if (status === "transferred") return { label: "转办", cls: "tw-bg-slate-100 tw-text-slate-600 tw-border-slate-200" };
      return { label: status, cls: "tw-bg-slate-100 tw-text-slate-600 tw-border-slate-200" };
    },
    openDetail(inst) {
      this.detail = inst;
      this.comment = "";
    },
    relatedDoc(inst) {
      return inst && inst.docId ? this.store.docById(inst.docId) : null;
    },
    openDocPreview(doc) { this.docPreview = doc; },
    myTask(inst) {
      if (!inst || inst.status !== "RUNNING") return null;
      const node = inst.nodes[inst.currentNode];
      if (!node) return null;
      return node.tasks.find(t => t.account === this.me.account && t.status === "pending") || null;
    },
    approve() {
      const inst = this.detail;
      if (!inst) return;
      const res = this.store.handleTask(inst.id, this.me.account, "approve", { comment: this.comment || "同意" });
      if (!res.ok) { this.store.toast(res.message, "error"); return; }
      const next = res.instance.nodes[res.instance.currentNode];
      const nextApprover = next && next.status === "pending" ? next.tasks.filter(t => t.status === "pending").map(t => t.name).join("、") : "";
      this.store.toast(nextApprover ? "已同意，流程流转至 " + nextApprover + "（可在左上角切换审批人继续）。" : "已同意，流程已办结。");
      this.detail = null;
      this.tab = "done";
    },
    quickApprove(inst) {
      this.store.confirm({
        title: "同意该审批？",
        text: "将按模板规则同意《" + inst.title + "》，操作不可撤销。",
        okText: "同意"
      }).then(ok => {
        if (!ok) return;
        const res = this.store.handleTask(inst.id, this.me.account, "approve", { comment: "材料齐全，同意。" });
        if (res.ok) this.store.toast("已同意。");
        else this.store.toast(res.message, "error");
      });
    },
    openAction(type) {
      this.actionType = type;
      this.actionComment = "";
      this.actionTarget = "";
      this.actionTargets = [];
      this.actionReturnTo = "creator";
      this.actionOpen = true;
    },
    submitAction() {
      const type = this.actionType;
      const inst = this.detail;
      if (!inst) return;
      if (type !== "addsign" && (!this.actionComment || this.actionComment.trim().length < 4)) {
        this.store.toast("请填写不少于 4 字的意见说明。", "error");
        return;
      }
      let payload = { comment: this.actionComment.trim() };
      if (type === "transfer") {
        if (!this.actionTarget) { this.store.toast("请选择转办人。", "error"); return; }
        payload.targetAccount = this.actionTarget;
      }
      if (type === "addsign") {
        if (!this.actionTargets.length) { this.store.toast("请选择加签人。", "error"); return; }
        payload.targets = this.actionTargets.slice();
      }
      const res = this.store.handleTask(inst.id, this.me.account, type, payload);
      if (!res.ok) { this.store.toast(res.message, "error"); return; }
      this.actionOpen = false;
      if (type === "addsign") {
        this.store.toast("已加签，等待会签人处理。");
        return;
      }
      this.detail = null;
      this.store.toast({ return: "已退回，发起人可修改后重新提交。", reject: "已驳回，流程终止。", transfer: "已转办。" }[type]);
      this.tab = type === "transfer" ? "todo" : "done";
    },
    urge(inst) {
      const res = this.store.urgeInstance(inst.id, this.me.account);
      this.store.toast(res.ok ? "已催办当前处理人。" : res.message, res.ok ? "success" : "error");
    },
    openExport(inst) {
      this.exportInstance = inst;
      this.store.audit(this.me.name, "导出审批单", inst.no, "成功");
    },
    printSheet() {
      window.print();
    },
    openNotif(n) {
      this.store.markRead(n.id);
      this.notifOpen = false;
      if (n.link && n.link.tab) this.tab = n.link.tab;
      if (n.link && n.link.instanceId) {
        const inst = this.store.instanceById(n.link.instanceId);
        if (inst) { this.tab = "todo"; this.openDetail(inst); }
      }
    },
    readAll() { this.store.markAllRead(this.me.account); }
  }
};
</script>

<style>
.apr-nav:hover { background: #f8fafc; }
.apr-row:hover { background: #f8fafc; }
.apr-card { transition: box-shadow .18s ease, transform .18s ease, border-color .18s ease; }
.apr-card:hover { box-shadow: 0 10px 28px -14px rgba(15, 23, 42, .25); transform: translateY(-1px); border-color: #cbd5e1; }
.apr-icon-btn:hover { background: #f1f5f9; color: #334155; }
.apr-btn-primary { background: #059669; transition: background .15s ease; }
.apr-btn-primary:hover { background: #047857; }
.apr-btn-ghost { background: #fff; border: 1px solid #e2e8f0; color: #475569; transition: background .15s ease; }
.apr-btn-ghost:hover { background: #f8fafc; }
.apr-input:focus { outline: none; border-color: #34d399; box-shadow: 0 0 0 3px rgba(16, 185, 129, .12); background: #fff; }
.apr-label { display: block; font-size: 11px; color: #64748b; margin-bottom: 6px; }
@media print {
  body * { visibility: hidden; }
  .apr-print-sheet, .apr-print-sheet * { visibility: visible; }
  .apr-print-sheet { position: fixed; left: 0; top: 0; width: 100%; box-shadow: none !important; }
}
</style>
