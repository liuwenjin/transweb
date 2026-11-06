<!--
  中国电子教育学会 公文与审批 OA · 文档查阅面板（独立 Vue 3 单文件组件）
  文档查阅 · 上传归档 · 发起审批 · 权限申请
  依赖：Vue 3、Tailwind（tw- 前缀）、全局组件 oa-icon；props.store 见 ../README.md
-->
<template>
  <div class="tw-h-full tw-flex tw-overflow-hidden tw-bg-slate-100">
    <!-- 侧边导航 -->
    <aside class="tw-w-56 tw-bg-white tw-border-r tw-border-slate-200 tw-flex tw-flex-col tw-shrink-0">
      <div class="tw-px-4 tw-py-4 tw-border-b tw-border-slate-100">
        <div class="tw-flex tw-items-center tw-gap-2.5">
          <div class="tw-w-9 tw-h-9 tw-rounded-xl tw-bg-indigo-50 tw-text-indigo-600 tw-flex tw-items-center tw-justify-center">
            <oa-icon name="user" class="tw-w-5 tw-h-5"></oa-icon>
          </div>
          <div class="tw-leading-tight">
            <div class="tw-text-sm tw-font-semibold">{{ me.title }}</div>
            <div class="tw-text-[11px] tw-text-slate-500">{{ me.name }} · {{ me.deptName }}</div>
          </div>
        </div>
      </div>

      <div class="tw-flex-1 tw-px-3 tw-py-4 tw-overflow-y-auto oa-scroll">
        <div class="tw-text-[11px] tw-text-slate-400 tw-px-2 tw-mb-2 tw-tracking-wide">我的工作</div>
        <button v-for="item in navItems" :key="item.id" @click="go(item.id)"
          :class="['staff-nav tw-w-full tw-flex tw-items-center tw-gap-2.5 tw-px-2.5 tw-py-2 tw-rounded-lg tw-text-[13px] tw-mb-0.5',
                   tab === item.id ? 'tw-bg-indigo-50 tw-text-indigo-700 tw-font-medium' : 'tw-text-slate-600']">
          <oa-icon :name="item.icon" class="tw-w-4 tw-h-4"></oa-icon>
          <span class="tw-flex-1 tw-text-left">{{ item.label }}</span>
          <span v-if="item.badge" class="tw-min-w-4 tw-h-4 tw-px-1 tw-rounded-full tw-bg-rose-500 tw-text-white tw-text-[10px] tw-flex tw-items-center tw-justify-center">{{ item.badge }}</span>
        </button>

        <div class="tw-mt-6 tw-px-2 tw-py-3 tw-rounded-xl tw-bg-slate-50 tw-border tw-border-slate-100">
          <div class="tw-flex tw-items-center tw-gap-1.5 tw-text-[11px] tw-text-emerald-600">
            <span class="tw-w-1.5 tw-h-1.5 tw-rounded-full tw-bg-emerald-500"></span>
            统一身份认证已登录
          </div>
          <div class="tw-mt-2 tw-text-[11px] tw-text-slate-500">账号 {{ me.account }}</div>
          <div class="tw-mt-1 tw-text-[10px] tw-text-slate-400">会话有效期至今日 18:00</div>
        </div>
      </div>

      <div class="tw-p-3 tw-border-t tw-border-slate-100">
        <div class="tw-flex tw-items-center tw-gap-2 tw-text-[11px] tw-text-slate-400 tw-px-1">
          <oa-icon name="shield" class="tw-w-3.5 tw-h-3.5"></oa-icon>
          权限最小化 · 操作全程留痕
        </div>
      </div>
    </aside>

    <!-- 主区域 -->
    <section class="tw-flex-1 tw-min-w-0 tw-flex tw-flex-col">
      <header class="tw-h-16 tw-bg-white tw-border-b tw-border-slate-200 tw-flex tw-items-center tw-px-6 tw-gap-4 tw-shrink-0">
        <div class="tw-min-w-0">
          <div class="tw-text-base tw-font-semibold tw-leading-tight">{{ pageTitle }}</div>
          <div class="tw-text-[11px] tw-text-slate-500 tw-mt-0.5">{{ pageSubtitle }}</div>
        </div>
        <div class="tw-flex-1"></div>

        <div v-if="tab === 'docs' || tab === 'mine'" class="tw-relative">
          <oa-icon name="search" class="tw-w-4 tw-h-4 tw-text-slate-400 tw-absolute tw-left-3 tw-top-2.5"></oa-icon>
          <input v-model="search" class="staff-input tw-w-64 tw-pl-9 tw-pr-3 tw-py-2 tw-text-sm tw-rounded-lg tw-border tw-border-slate-200 tw-bg-slate-50" placeholder="搜索标题、编号或标签" />
        </div>

        <button @click="openStart()" class="staff-btn-primary tw-flex tw-items-center tw-gap-1.5 tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-text-white">
          <oa-icon name="send" class="tw-w-4 tw-h-4"></oa-icon> 发起审批
        </button>

        <div class="tw-relative">
          <button @click="notifOpen = !notifOpen" class="staff-icon-btn tw-relative tw-w-9 tw-h-9 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-text-slate-500">
            <oa-icon name="bell" class="tw-w-5 tw-h-5"></oa-icon>
            <span v-if="unread" class="tw-absolute tw-top-1.5 tw-right-1.5 tw-w-2 tw-h-2 tw-rounded-full tw-bg-rose-500 tw-ring-2 tw-ring-white"></span>
          </button>
          <transition name="oa-pop">
            <div v-if="notifOpen" class="staff-pop tw-absolute tw-right-0 tw-top-11 tw-w-96 tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-shadow-2xl tw-z-30 tw-overflow-hidden">
              <div class="tw-flex tw-items-center tw-justify-between tw-px-4 tw-py-3 tw-border-b tw-border-slate-100">
                <span class="tw-text-sm tw-font-semibold">通知</span>
                <button @click="readAll" class="tw-text-[11px] tw-text-indigo-600">全部已读</button>
              </div>
              <div class="tw-max-h-80 tw-overflow-y-auto oa-scroll">
                <div v-for="n in myNotifs" :key="n.id" class="tw-px-4 tw-py-3 tw-border-b tw-border-slate-50 tw-flex tw-gap-2.5 tw-cursor-pointer" @click="openNotif(n)">
                  <span :class="['tw-w-1.5 tw-h-1.5 tw-rounded-full tw-mt-1.5 tw-shrink-0', n.read ? 'tw-bg-slate-200' : 'tw-bg-indigo-500']"></span>
                  <div class="tw-min-w-0">
                    <div :class="['tw-text-[12px]', n.read ? 'tw-text-slate-500' : 'tw-text-slate-800 tw-font-medium']">{{ n.title }}</div>
                    <div class="tw-text-[11px] tw-text-slate-500 tw-mt-0.5 oa-clamp-2">{{ n.body }}</div>
                    <div class="tw-text-[10px] tw-text-slate-400 tw-mt-1">{{ store.h.fromNow(n.at) }}</div>
                  </div>
                </div>
                <div v-if="!myNotifs.length" class="tw-py-10 tw-text-center tw-text-xs tw-text-slate-400">暂无通知</div>
              </div>
            </div>
          </transition>
        </div>

        <div class="tw-w-8 tw-h-8 tw-rounded-full tw-bg-indigo-600 tw-text-white tw-flex tw-items-center tw-justify-center tw-text-xs tw-font-semibold">{{ me.name.slice(0, 1) }}</div>
      </header>

      <div class="tw-flex-1 tw-overflow-y-auto oa-scroll tw-p-6">
        <!-- ==================== 工作台 ==================== -->
        <div v-if="tab === 'home'" class="tw-max-w-6xl tw-mx-auto tw-space-y-5">
          <div class="tw-bg-white tw-rounded-2xl tw-border tw-border-slate-200 tw-p-6 tw-flex tw-items-center tw-gap-6">
            <div class="tw-flex-1">
              <div class="tw-flex tw-items-center tw-gap-2">
                <h1 class="tw-text-xl tw-font-semibold">{{ greeting }}，{{ me.name }}</h1>
                <span class="tw-px-2 tw-py-0.5 tw-rounded-full tw-bg-emerald-50 tw-text-emerald-700 tw-text-[11px] tw-border tw-border-emerald-200">已认证</span>
              </div>
              <p class="tw-mt-2 tw-text-sm tw-text-slate-500">{{ today }} · 今天有 <span class="tw-text-indigo-600 tw-font-medium">{{ runningCount }}</span> 项审批在进行中，{{ unread }} 条未读通知。</p>
              <div class="tw-mt-4 tw-flex tw-gap-2">
                <button @click="openUpload" class="staff-btn-primary tw-px-3 tw-py-2 tw-rounded-lg tw-text-[12px] tw-text-white tw-flex tw-items-center tw-gap-1.5"><oa-icon name="upload" class="tw-w-4 tw-h-4"></oa-icon>上传文档</button>
                <button @click="openStart()" class="staff-btn-ghost tw-px-3 tw-py-2 tw-rounded-lg tw-text-[12px] tw-flex tw-items-center tw-gap-1.5"><oa-icon name="send" class="tw-w-4 tw-h-4"></oa-icon>发起审批</button>
                <button @click="openPerm()" class="staff-btn-ghost tw-px-3 tw-py-2 tw-rounded-lg tw-text-[12px] tw-flex tw-items-center tw-gap-1.5"><oa-icon name="key" class="tw-w-4 tw-h-4"></oa-icon>申请权限</button>
              </div>
            </div>
            <div class="tw-w-44 tw-h-28 tw-rounded-2xl tw-bg-gradient-to-br tw-from-indigo-500 tw-to-sky-500 tw-flex tw-flex-col tw-items-center tw-justify-center tw-text-white tw-shadow-lg">
              <div class="tw-text-3xl tw-font-semibold">{{ visibleDocs.length }}</div>
              <div class="tw-text-[11px] tw-text-indigo-100 tw-mt-1">份文档可查阅</div>
            </div>
          </div>

          <div class="tw-grid tw-grid-cols-4 tw-gap-4">
            <div v-for="s in stats" :key="s.label" class="tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-p-4 tw-flex tw-items-center tw-gap-3">
              <div :class="['tw-w-10 tw-h-10 tw-rounded-xl tw-flex tw-items-center tw-justify-center', s.cls]">
                <oa-icon :name="s.icon" class="tw-w-5 tw-h-5"></oa-icon>
              </div>
              <div>
                <div class="tw-text-2xl tw-font-semibold tw-leading-none">{{ s.value }}</div>
                <div class="tw-text-[11px] tw-text-slate-500 tw-mt-1">{{ s.label }}</div>
              </div>
            </div>
          </div>

          <div class="tw-grid tw-grid-cols-3 tw-gap-5">
            <div class="tw-col-span-2 tw-space-y-5">
              <div class="tw-bg-white tw-rounded-xl tw-border tw-border-slate-200">
                <div class="tw-flex tw-items-center tw-justify-between tw-px-5 tw-py-4 tw-border-b tw-border-slate-100">
                  <div>
                    <div class="tw-text-sm tw-font-semibold">进行中的审批</div>
                    <div class="tw-text-[11px] tw-text-slate-500 tw-mt-0.5">我发起的流程与当前进度</div>
                  </div>
                  <button @click="go('approvals')" class="tw-text-[11px] tw-text-indigo-600">查看全部</button>
                </div>
                <div v-if="runningInstances.length" class="tw-divide-y tw-divide-slate-50">
                  <div v-for="inst in runningInstances.slice(0, 3)" :key="inst.id" class="tw-px-5 tw-py-3.5 tw-cursor-pointer staff-row" @click="openInstance(inst)">
                    <div class="tw-flex tw-items-center tw-gap-2">
                      <span :class="['tw-px-1.5 tw-py-0.5 tw-rounded tw-text-[10px] tw-border', store.h.instStatus(inst.status).cls]">{{ store.h.instStatus(inst.status).label }}</span>
                      <span class="tw-text-[13px] tw-font-medium tw-flex-1 tw-truncate">{{ inst.title }}</span>
                      <span class="tw-text-[11px] tw-text-slate-400 tw-shrink-0">{{ dueLabel(inst) }}</span>
                    </div>
                    <div class="tw-mt-2 tw-flex tw-items-center tw-gap-2">
                      <div class="tw-flex-1 tw-h-1.5 tw-rounded-full tw-bg-slate-100 tw-overflow-hidden">
                        <div class="tw-h-full tw-rounded-full tw-bg-indigo-500" :style="{ width: progress(inst) + '%' }"></div>
                      </div>
                      <span class="tw-text-[10px] tw-text-slate-400 tw-w-20 tw-text-right">{{ currentNodeName(inst) }}</span>
                    </div>
                  </div>
                </div>
                <div v-else class="tw-py-12 tw-text-center tw-text-xs tw-text-slate-400">暂无进行中的审批</div>
              </div>

              <div class="tw-bg-white tw-rounded-xl tw-border tw-border-slate-200">
                <div class="tw-flex tw-items-center tw-justify-between tw-px-5 tw-py-4 tw-border-b tw-border-slate-100">
                  <div class="tw-text-sm tw-font-semibold">最近更新</div>
                  <button @click="go('docs')" class="tw-text-[11px] tw-text-indigo-600">文档中心</button>
                </div>
                <div class="tw-p-4 tw-grid tw-grid-cols-3 tw-gap-3">
                  <div v-for="doc in recentDocs" :key="doc.id" class="staff-card tw-rounded-xl tw-border tw-border-slate-200 tw-p-3.5 tw-cursor-pointer" @click="openDoc(doc)">
                    <div class="tw-flex tw-items-center tw-gap-2">
                      <div class="tw-w-8 tw-h-8 tw-rounded-lg tw-bg-indigo-50 tw-text-indigo-600 tw-flex tw-items-center tw-justify-center"><oa-icon name="docs" class="tw-w-4 tw-h-4"></oa-icon></div>
                      <span :class="['tw-px-1.5 tw-py-0.5 tw-rounded tw-text-[10px] tw-border', store.h.classification(doc.classification).cls]">{{ store.h.classification(doc.classification).label }}</span>
                    </div>
                    <div class="tw-mt-2.5 tw-text-[12px] tw-font-medium tw-leading-snug oa-clamp-2">{{ doc.title }}</div>
                    <div class="tw-mt-2 tw-text-[10px] tw-text-slate-400">{{ doc.catName }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="tw-space-y-5">
              <div class="tw-bg-white tw-rounded-xl tw-border tw-border-slate-200">
                <div class="tw-flex tw-items-center tw-justify-between tw-px-4 tw-py-3.5 tw-border-b tw-border-slate-100">
                  <div class="tw-text-sm tw-font-semibold">我的通知</div>
                  <span class="tw-text-[11px] tw-text-slate-400">{{ unread }} 未读</span>
                </div>
                <div class="tw-p-2">
                  <div v-for="n in myNotifs.slice(0, 4)" :key="n.id" class="tw-px-2.5 tw-py-2.5 tw-rounded-lg tw-cursor-pointer staff-row" @click="openNotif(n)">
                    <div class="tw-flex tw-items-center tw-gap-2">
                      <span :class="['tw-w-1.5 tw-h-1.5 tw-rounded-full tw-shrink-0', n.read ? 'tw-bg-slate-200' : 'tw-bg-indigo-500']"></span>
                      <span class="tw-text-[12px] tw-font-medium tw-truncate">{{ n.title }}</span>
                    </div>
                    <div class="tw-text-[11px] tw-text-slate-500 tw-mt-1 oa-clamp-2">{{ n.body }}</div>
                  </div>
                </div>
              </div>

              <div class="tw-bg-white tw-rounded-xl tw-border tw-border-slate-200">
                <div class="tw-px-4 tw-py-3.5 tw-border-b tw-border-slate-100 tw-flex tw-items-center tw-gap-2">
                  <oa-icon name="info" class="tw-w-4 tw-h-4 tw-text-amber-500"></oa-icon>
                  <span class="tw-text-sm tw-font-semibold">公告</span>
                </div>
                <div class="tw-p-4 tw-space-y-3">
                  <div v-for="a in announcements" :key="a.id">
                    <div class="tw-text-[12px] tw-font-medium tw-flex tw-items-center tw-gap-1.5">
                      <span v-if="a.pinned" class="tw-px-1 tw-rounded tw-bg-amber-50 tw-text-amber-600 tw-text-[10px]">置顶</span>{{ a.title }}
                    </div>
                    <div class="tw-text-[11px] tw-text-slate-500 tw-mt-1 oa-clamp-2">{{ a.body }}</div>
                    <div class="tw-text-[10px] tw-text-slate-400 tw-mt-1">{{ store.h.fmtDate(a.at) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================== 文档中心 ==================== -->
        <div v-if="tab === 'docs'" class="tw-max-w-6xl tw-mx-auto">
          <div class="tw-flex tw-items-center tw-gap-2 tw-mb-4 tw-flex-wrap">
            <button @click="catFilter = ''" :class="['tw-px-3 tw-py-1.5 tw-rounded-full tw-text-[12px] tw-border', !catFilter ? 'tw-bg-slate-900 tw-text-white tw-border-slate-900' : 'tw-bg-white tw-text-slate-600 tw-border-slate-200']">全部</button>
            <button v-for="c in store.categories" :key="c.id" @click="catFilter = c.id"
              :class="['tw-px-3 tw-py-1.5 tw-rounded-full tw-text-[12px] tw-border', catFilter === c.id ? 'tw-bg-slate-900 tw-text-white tw-border-slate-900' : 'tw-bg-white tw-text-slate-600 tw-border-slate-200']">{{ c.name }}</button>
            <div class="tw-flex-1"></div>
            <select v-model="classFilter" class="staff-input tw-px-3 tw-py-1.5 tw-rounded-lg tw-text-[12px] tw-border tw-border-slate-200 tw-bg-white">
              <option value="">全部密级</option>
              <option value="public">公开</option>
              <option value="internal">内部</option>
              <option value="sensitive">敏感</option>
            </select>
            <span class="tw-text-[11px] tw-text-slate-400">共 {{ filteredDocs.length }} 份</span>
          </div>

          <div v-if="filteredDocs.length" class="tw-grid tw-grid-cols-2 tw-gap-4">
            <div v-for="doc in filteredDocs" :key="doc.id" class="staff-card tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-p-4 tw-flex tw-gap-4 tw-cursor-pointer" @click="openDoc(doc)">
              <div :class="['tw-w-11 tw-h-11 tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-shrink-0', doc.classification === 'sensitive' ? 'tw-bg-rose-50 tw-text-rose-600' : 'tw-bg-indigo-50 tw-text-indigo-600']">
                <oa-icon :name="doc.classification === 'sensitive' ? 'lock' : 'docs'" class="tw-w-5 tw-h-5"></oa-icon>
              </div>
              <div class="tw-flex-1 tw-min-w-0">
                <div class="tw-flex tw-items-start tw-gap-2">
                  <div class="tw-text-[13px] tw-font-medium tw-flex-1 oa-clamp-2">{{ doc.title }}</div>
                  <span :class="['tw-px-1.5 tw-py-0.5 tw-rounded tw-text-[10px] tw-border tw-shrink-0', store.h.classification(doc.classification).cls]">{{ store.h.classification(doc.classification).label }}</span>
                </div>
                <div class="tw-text-[11px] tw-text-slate-500 tw-mt-1">{{ doc.no }} · {{ doc.catName }}</div>
                <div class="tw-text-[11px] tw-text-slate-500 tw-mt-1.5 oa-clamp-2">{{ doc.summary }}</div>
                <div class="tw-flex tw-items-center tw-gap-3 tw-mt-3 tw-text-[10px] tw-text-slate-400">
                  <span>{{ doc.deptName }}</span>
                  <span>V{{ doc.version }}</span>
                  <span>下载 {{ doc.downloads }}</span>
                  <div class="tw-flex-1"></div>
                  <button class="tw-text-[11px] tw-text-indigo-600 tw-flex tw-items-center tw-gap-1" @click.stop="tryDownload(doc)">
                    <oa-icon name="download" class="tw-w-3.5 tw-h-3.5"></oa-icon>下载
                  </button>
                  <button class="tw-text-[11px] tw-text-slate-500 tw-flex tw-items-center tw-gap-1" @click.stop="openDoc(doc)">
                    <oa-icon name="eye" class="tw-w-3.5 tw-h-3.5"></oa-icon>预览
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-py-20 tw-text-center">
            <oa-icon name="search" class="tw-w-10 tw-h-10 tw-text-slate-300 tw-mx-auto"></oa-icon>
            <div class="tw-mt-3 tw-text-sm tw-text-slate-500">未找到相关文档</div>
            <div class="tw-mt-1 tw-text-[11px] tw-text-slate-400">尝试调整关键词，或对敏感文档提交权限申请</div>
            <button @click="openPerm()" class="tw-mt-4 tw-px-3 tw-py-2 tw-rounded-lg tw-bg-indigo-600 tw-text-white tw-text-[12px]">申请权限</button>
          </div>
        </div>

        <!-- ==================== 我的文档 ==================== -->
        <div v-if="tab === 'mine'" class="tw-max-w-6xl tw-mx-auto">
          <div class="tw-flex tw-items-center tw-gap-2 tw-mb-4">
            <button v-for="f in mineFilters" :key="f.id" @click="mineFilter = f.id"
              :class="['tw-px-3 tw-py-1.5 tw-rounded-full tw-text-[12px] tw-border', mineFilter === f.id ? 'tw-bg-slate-900 tw-text-white tw-border-slate-900' : 'tw-bg-white tw-text-slate-600 tw-border-slate-200']">
              {{ f.label }} <span class="tw-opacity-70">{{ f.count }}</span>
            </button>
            <div class="tw-flex-1"></div>
            <button @click="openUpload" class="staff-btn-primary tw-flex tw-items-center tw-gap-1.5 tw-px-3 tw-py-2 tw-rounded-lg tw-text-[12px] tw-text-white">
              <oa-icon name="upload" class="tw-w-4 tw-h-4"></oa-icon>上传文档
            </button>
          </div>

          <div class="tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-overflow-hidden">
            <table class="tw-w-full tw-text-sm">
              <thead>
                <tr class="tw-bg-slate-50 tw-text-[11px] tw-text-slate-500">
                  <th class="tw-text-left tw-font-medium tw-px-5 tw-py-2.5">文档</th>
                  <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-24">状态</th>
                  <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-16">版本</th>
                  <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-28">更新时间</th>
                  <th class="tw-text-right tw-font-medium tw-px-5 tw-py-2.5 tw-w-56">操作</th>
                </tr>
              </thead>
              <tbody class="tw-divide-y tw-divide-slate-100">
                <tr v-for="doc in myDocs" :key="doc.id" class="staff-row">
                  <td class="tw-px-5 tw-py-3.5">
                    <div class="tw-flex tw-items-center tw-gap-2">
                      <span class="tw-text-[13px] tw-font-medium">{{ doc.title }}</span>
                      <span :class="['tw-px-1.5 tw-py-0.5 tw-rounded tw-text-[10px] tw-border', store.h.classification(doc.classification).cls]">{{ store.h.classification(doc.classification).label }}</span>
                    </div>
                    <div class="tw-text-[11px] tw-text-slate-500 tw-mt-0.5">{{ doc.no }} · {{ doc.catName }}</div>
                    <div v-if="doc.status === 'RETURNED'" class="tw-mt-1 tw-text-[11px] tw-text-rose-600">退回原因：{{ returnReason(doc) }}</div>
                  </td>
                  <td class="tw-px-3 tw-py-3.5"><span :class="['tw-px-2 tw-py-0.5 tw-rounded tw-text-[10px] tw-border', store.h.status(doc.status).cls]">{{ store.h.status(doc.status).label }}</span></td>
                  <td class="tw-px-3 tw-py-3.5 tw-text-[12px] tw-text-slate-500">V{{ doc.version }}</td>
                  <td class="tw-px-3 tw-py-3.5 tw-text-[11px] tw-text-slate-500">{{ store.h.fmtDate(doc.updatedAt) }}</td>
                  <td class="tw-px-5 tw-py-3.5">
                    <div class="tw-flex tw-items-center tw-justify-end tw-gap-2">
                      <button @click="openDoc(doc)" class="staff-link tw-text-[11px] tw-text-slate-500">预览</button>
                      <button v-if="doc.status === 'DRAFT' || doc.status === 'RETURNED'" @click="openArchive(doc)" class="staff-link tw-text-[11px] tw-text-indigo-600">{{ doc.status === 'RETURNED' ? '修改重提' : '提交归档' }}</button>
                      <button v-if="doc.status === 'SUBMITTED'" @click="openInstanceById(doc.approvalId)" class="staff-link tw-text-[11px] tw-text-amber-600">查看进度</button>
                      <button v-if="doc.status === 'DRAFT' || doc.status === 'RETURNED'" @click="removeDoc(doc)" class="staff-link tw-text-[11px] tw-text-rose-600">删除</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="!myDocs.length" class="tw-py-16 tw-text-center tw-text-xs tw-text-slate-400">暂无文档，点击右上角上传</div>
          </div>
        </div>

        <!-- ==================== 审批中心 ==================== -->
        <div v-if="tab === 'approvals'" class="tw-max-w-6xl tw-mx-auto">
          <div class="tw-flex tw-items-center tw-gap-2 tw-mb-4">
            <button v-for="f in instFilters" :key="f.id" @click="instFilter = f.id"
              :class="['tw-px-3 tw-py-1.5 tw-rounded-full tw-text-[12px] tw-border', instFilter === f.id ? 'tw-bg-slate-900 tw-text-white tw-border-slate-900' : 'tw-bg-white tw-text-slate-600 tw-border-slate-200']">{{ f.label }}</button>
            <div class="tw-flex-1"></div>
            <button @click="openStart()" class="staff-btn-primary tw-flex tw-items-center tw-gap-1.5 tw-px-3 tw-py-2 tw-rounded-lg tw-text-[12px] tw-text-white">
              <oa-icon name="send" class="tw-w-4 tw-h-4"></oa-icon>发起审批
            </button>
          </div>

          <div class="tw-space-y-3">
            <div v-for="inst in myInstances" :key="inst.id" class="staff-card tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-p-4 tw-cursor-pointer" @click="openInstance(inst)">
              <div class="tw-flex tw-items-center tw-gap-3">
                <div :class="['tw-w-9 tw-h-9 tw-rounded-lg tw-flex tw-items-center tw-justify-center', store.h.type(inst.type).cls]">
                  <oa-icon :name="store.h.type(inst.type).icon" class="tw-w-4 tw-h-4"></oa-icon>
                </div>
                <div class="tw-flex-1 tw-min-w-0">
                  <div class="tw-flex tw-items-center tw-gap-2">
                    <span class="tw-text-[13px] tw-font-medium tw-truncate">{{ inst.title }}</span>
                    <span :class="['tw-px-1.5 tw-py-0.5 tw-rounded tw-text-[10px] tw-border', store.h.instStatus(inst.status).cls]">{{ store.h.instStatus(inst.status).label }}</span>
                  </div>
                  <div class="tw-text-[11px] tw-text-slate-500 tw-mt-1">{{ inst.no }} · {{ store.h.type(inst.type).label }} · 当前环节：{{ currentNodeName(inst) }}</div>
                </div>
                <div class="tw-text-right tw-shrink-0">
                  <div class="tw-text-[11px] tw-text-slate-400">{{ dueLabel(inst) }}</div>
                  <div class="tw-text-[10px] tw-text-slate-400 tw-mt-0.5">提交于 {{ store.h.fmtDate(inst.submittedAt) }}</div>
                </div>
              </div>
              <div class="tw-mt-3 tw-flex tw-items-center tw-gap-2">
                <div class="tw-flex-1 tw-h-1.5 tw-rounded-full tw-bg-slate-100 tw-overflow-hidden">
                  <div :class="['tw-h-full tw-rounded-full', inst.status === 'RETURNED' ? 'tw-bg-rose-400' : 'tw-bg-indigo-500']" :style="{ width: progress(inst) + '%' }"></div>
                </div>
                <button v-if="canWithdraw(inst)" class="tw-text-[11px] tw-text-slate-500 tw-px-2 tw-py-1 tw-rounded tw-bg-slate-100" @click.stop="withdraw(inst)">撤回</button>
                <button v-if="inst.status === 'RUNNING'" class="tw-text-[11px] tw-text-amber-600 tw-px-2 tw-py-1 tw-rounded tw-bg-amber-50" @click.stop="urge(inst)">催办</button>
                <button class="tw-text-[11px] tw-text-indigo-600 tw-px-2 tw-py-1 tw-rounded tw-bg-indigo-50" @click.stop="openInstance(inst)">查看进度</button>
              </div>
            </div>
            <div v-if="!myInstances.length" class="tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-py-20 tw-text-center tw-text-xs tw-text-slate-400">暂无审批记录</div>
          </div>
        </div>

        <!-- ==================== 权限申请 ==================== -->
        <div v-if="tab === 'perm'" class="tw-max-w-6xl tw-mx-auto tw-space-y-5">
          <div class="tw-grid tw-grid-cols-3 tw-gap-4">
            <div class="tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-p-4">
              <div class="tw-text-[11px] tw-text-slate-500">生效中的授权</div>
              <div class="tw-text-2xl tw-font-semibold tw-mt-1">{{ activeGrants.length }}</div>
              <div class="tw-text-[11px] tw-text-slate-400 tw-mt-1">含按角色、按部门授予</div>
            </div>
            <div class="tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-p-4">
              <div class="tw-text-[11px] tw-text-slate-500">7 天内到期</div>
              <div class="tw-text-2xl tw-font-semibold tw-mt-1 tw-text-amber-600">{{ expiring.length }}</div>
              <div class="tw-text-[11px] tw-text-slate-400 tw-mt-1">到期后自动失效</div>
            </div>
            <div class="tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-p-4">
              <div class="tw-text-[11px] tw-text-slate-500">审批中的申请</div>
              <div class="tw-text-2xl tw-font-semibold tw-mt-1 tw-text-indigo-600">{{ pendingRequests.length }}</div>
              <div class="tw-text-[11px] tw-text-slate-400 tw-mt-1">可在审批中心查看进度</div>
            </div>
          </div>

          <div class="tw-grid tw-grid-cols-3 tw-gap-5">
            <div class="tw-col-span-2 tw-bg-white tw-rounded-xl tw-border tw-border-slate-200">
              <div class="tw-flex tw-items-center tw-justify-between tw-px-5 tw-py-4 tw-border-b tw-border-slate-100">
                <div class="tw-text-sm tw-font-semibold">我的授权</div>
                <button @click="openPerm()" class="tw-text-[11px] tw-text-indigo-600 tw-flex tw-items-center tw-gap-1"><oa-icon name="plus" class="tw-w-3.5 tw-h-3.5"></oa-icon>申请权限</button>
              </div>
              <table class="tw-w-full tw-text-sm">
                <thead><tr class="tw-bg-slate-50 tw-text-[11px] tw-text-slate-500">
                  <th class="tw-text-left tw-font-medium tw-px-5 tw-py-2.5">授权对象</th>
                  <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-28">权限</th>
                  <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-24">来源</th>
                  <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-32">有效期至</th>
                  <th class="tw-text-left tw-font-medium tw-px-5 tw-py-2.5 tw-w-20">状态</th>
                </tr></thead>
                <tbody class="tw-divide-y tw-divide-slate-100">
                  <tr v-for="g in activeGrants" :key="g.id" class="staff-row">
                    <td class="tw-px-5 tw-py-3">
                      <div class="tw-text-[12px] tw-font-medium">{{ g.objectName }}</div>
                      <div class="tw-text-[10px] tw-text-slate-400 tw-mt-0.5">{{ g.reason }}</div>
                    </td>
                    <td class="tw-px-3 tw-py-3 tw-text-[11px] tw-text-slate-600">{{ store.h.rights(g.rights) }}</td>
                    <td class="tw-px-3 tw-py-3 tw-text-[11px] tw-text-slate-500">{{ g.source === 'approval' ? '审批授予' : g.source === 'temporary' ? '临时授权' : '管理员授权' }}</td>
                    <td class="tw-px-3 tw-py-3 tw-text-[11px]" :class="daysLeft(g.validUntil) <= 7 ? 'tw-text-amber-600' : 'tw-text-slate-500'">{{ store.h.fmtDate(g.validUntil) }}<span v-if="daysLeft(g.validUntil) <= 7" class="tw-ml-1">（{{ daysLeft(g.validUntil) }} 天）</span></td>
                    <td class="tw-px-5 tw-py-3"><span class="tw-px-2 tw-py-0.5 tw-rounded tw-text-[10px] tw-bg-emerald-50 tw-text-emerald-700 tw-border tw-border-emerald-200">生效中</span></td>
                  </tr>
                  <tr v-for="g in expiredGrants" :key="g.id" class="staff-row tw-opacity-70">
                    <td class="tw-px-5 tw-py-3"><div class="tw-text-[12px] tw-text-slate-500">{{ g.objectName }}</div></td>
                    <td class="tw-px-3 tw-py-3 tw-text-[11px] tw-text-slate-400">{{ store.h.rights(g.rights) }}</td>
                    <td class="tw-px-3 tw-py-3 tw-text-[11px] tw-text-slate-400">—</td>
                    <td class="tw-px-3 tw-py-3 tw-text-[11px] tw-text-slate-400">{{ store.h.fmtDate(g.validUntil) }}</td>
                    <td class="tw-px-5 tw-py-3"><span class="tw-px-2 tw-py-0.5 tw-rounded tw-text-[10px] tw-bg-slate-100 tw-text-slate-500 tw-border tw-border-slate-200">已失效</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="tw-bg-white tw-rounded-xl tw-border tw-border-slate-200">
              <div class="tw-px-4 tw-py-4 tw-border-b tw-border-slate-100 tw-text-sm tw-font-semibold">我的申请</div>
              <div class="tw-p-2">
                <div v-for="inst in myPermRequests" :key="inst.id" class="tw-px-2.5 tw-py-2.5 tw-rounded-lg tw-cursor-pointer staff-row" @click="openInstance(inst)">
                  <div class="tw-flex tw-items-center tw-gap-2">
                    <span class="tw-text-[12px] tw-font-medium tw-truncate tw-flex-1">{{ inst.title }}</span>
                    <span :class="['tw-px-1.5 tw-py-0.5 tw-rounded tw-text-[10px] tw-border', store.h.instStatus(inst.status).cls]">{{ store.h.instStatus(inst.status).label }}</span>
                  </div>
                  <div class="tw-text-[10px] tw-text-slate-400 tw-mt-1">{{ inst.no }} · {{ store.h.fmtDate(inst.submittedAt) }}</div>
                </div>
                <div v-if="!myPermRequests.length" class="tw-py-10 tw-text-center tw-text-[11px] tw-text-slate-400">暂无申请</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== 文档预览 ==================== -->
    <div v-if="docModal" class="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-6">
      <div class="tw-absolute tw-inset-0 tw-bg-slate-900/50" @click="docModal = null"></div>
      <div class="tw-relative tw-w-full tw-max-w-5xl tw-h-[82vh] tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-flex tw-flex-col tw-overflow-hidden">
        <div class="tw-flex tw-items-center tw-gap-3 tw-px-5 tw-py-4 tw-border-b tw-border-slate-100 tw-shrink-0">
          <div class="tw-w-9 tw-h-9 tw-rounded-lg tw-bg-indigo-50 tw-text-indigo-600 tw-flex tw-items-center tw-justify-center"><oa-icon name="docs" class="tw-w-4 tw-h-4"></oa-icon></div>
          <div class="tw-flex-1 tw-min-w-0">
            <div class="tw-flex tw-items-center tw-gap-2">
              <span class="tw-text-sm tw-font-semibold tw-truncate">{{ docModal.title }}</span>
              <span :class="['tw-px-1.5 tw-py-0.5 tw-rounded tw-text-[10px] tw-border', store.h.classification(docModal.classification).cls]">{{ store.h.classification(docModal.classification).label }}</span>
            </div>
            <div class="tw-text-[11px] tw-text-slate-500 tw-mt-0.5">{{ docModal.no }} · V{{ docModal.version }} · {{ docModal.size }}</div>
          </div>
          <button class="tw-w-8 tw-h-8 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-text-slate-400 staff-icon-btn" @click="docModal = null"><oa-icon name="x" class="tw-w-4 tw-h-4"></oa-icon></button>
        </div>
        <div class="tw-flex-1 tw-min-h-0 tw-flex">
          <div class="tw-flex-1 tw-bg-slate-100 tw-p-6 tw-overflow-y-auto oa-scroll">
            <div class="staff-paper tw-relative tw-mx-auto tw-w-[560px] tw-bg-white tw-shadow-lg tw-px-10 tw-py-12">
              <div class="tw-text-center tw-text-lg tw-font-semibold">{{ docModal.title }}</div>
              <div class="tw-text-center tw-text-[11px] tw-text-slate-400 tw-mt-2">文档编号：{{ docModal.no }}　密级：{{ store.h.classification(docModal.classification).label }}　版本：V{{ docModal.version }}</div>
              <div class="tw-h-px tw-bg-slate-200 tw-my-6"></div>
              <p class="tw-text-[13px] tw-leading-relaxed tw-text-slate-700 tw-indent-8">{{ docModal.summary }}</p>
              <p class="tw-text-[13px] tw-leading-relaxed tw-text-slate-700 tw-indent-8 tw-mt-3">第一条　为规范学会公文与文档管理，明确资料范围、审批流程与责任分工，依据学会章程及相关管理规定，结合学会实际制定本文件。</p>
              <p class="tw-text-[13px] tw-leading-relaxed tw-text-slate-700 tw-indent-8 tw-mt-3">第二条　本文件适用于学会秘书处、各分支机构及全体工作人员。公文与文档的查看、下载、编辑与归档，应按照岗位职责与授权范围执行，重要操作全程留痕。</p>
              <p class="tw-text-[13px] tw-leading-relaxed tw-text-slate-700 tw-indent-8 tw-mt-3">第三条　档案管理员负责分类目录、版本与授权管理；秘书长负责秘书处文档的初审；理事长、副理事长负责重要事项终审。</p>
              <p class="tw-text-[13px] tw-leading-relaxed tw-text-slate-700 tw-indent-8 tw-mt-3">第四条　本文件自归档之日起施行，由学会秘书处负责解释。</p>
              <div class="tw-mt-10 tw-text-right tw-text-[11px] tw-text-slate-400">{{ docModal.deptName }}　{{ store.h.fmtDate(docModal.updatedAt) }}</div>
              <div v-if="docModal.classification === 'sensitive'" class="staff-watermark">
                <span v-for="n in 12" :key="n">{{ me.name }} · {{ me.account }}</span>
              </div>
            </div>
          </div>
          <div class="tw-w-72 tw-border-l tw-border-slate-100 tw-p-5 tw-overflow-y-auto oa-scroll tw-shrink-0">
            <div class="tw-text-[11px] tw-text-slate-400 tw-mb-2">文档信息</div>
            <div class="tw-space-y-2.5 tw-text-[12px]">
              <div class="tw-flex tw-justify-between"><span class="tw-text-slate-500">所属分类</span><span class="tw-text-slate-800 tw-text-right">{{ docModal.catName }}</span></div>
              <div class="tw-flex tw-justify-between"><span class="tw-text-slate-500">归属部门</span><span class="tw-text-slate-800">{{ docModal.deptName }}</span></div>
              <div class="tw-flex tw-justify-between"><span class="tw-text-slate-500">所有者</span><span class="tw-text-slate-800">{{ docModal.owner }}</span></div>
              <div class="tw-flex tw-justify-between"><span class="tw-text-slate-500">可见范围</span><span class="tw-text-slate-800">{{ store.h.visibility(docModal.visibility) }}</span></div>
              <div class="tw-flex tw-justify-between"><span class="tw-text-slate-500">归档时间</span><span class="tw-text-slate-800">{{ store.h.fmtDate(docModal.archivedAt) }}</span></div>
              <div class="tw-flex tw-justify-between"><span class="tw-text-slate-500">下载次数</span><span class="tw-text-slate-800">{{ docModal.downloads }}</span></div>
              <div class="tw-flex tw-justify-between"><span class="tw-text-slate-500">有效期至</span><span class="tw-text-slate-800">{{ store.h.fmtDate(docModal.validUntil) }}</span></div>
            </div>
            <div class="tw-mt-5 tw-p-3 tw-rounded-xl tw-bg-slate-50 tw-text-[11px] tw-text-slate-500 tw-leading-relaxed">
              <div class="tw-flex tw-items-center tw-gap-1.5 tw-text-slate-700 tw-font-medium tw-mb-1"><oa-icon name="shield" class="tw-w-3.5 tw-h-3.5"></oa-icon>权限说明</div>
              内部文档全体会员可查阅并留痕；敏感文档需授权后查看，下载需额外审批，文件自动添加水印。
            </div>
            <div class="tw-mt-5 tw-space-y-2">
              <button v-if="canDownloadDoc(docModal)" @click="doDownload(docModal)" class="staff-btn-primary tw-w-full tw-py-2.5 tw-rounded-lg tw-text-[12px] tw-text-white tw-flex tw-items-center tw-justify-center tw-gap-1.5"><oa-icon name="download" class="tw-w-4 tw-h-4"></oa-icon>下载文档</button>
              <button v-else @click="openDownloadReq(docModal)" class="tw-w-full tw-py-2.5 tw-rounded-lg tw-text-[12px] tw-text-white tw-bg-rose-600 tw-flex tw-items-center tw-justify-center tw-gap-1.5"><oa-icon name="lock" class="tw-w-4 tw-h-4"></oa-icon>申请下载</button>
              <button @click="openPerm(docModal)" class="staff-btn-ghost tw-w-full tw-py-2.5 tw-rounded-lg tw-text-[12px]">申请其他权限</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 上传文档 ==================== -->
    <div v-if="uploadOpen" class="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-6">
      <div class="tw-absolute tw-inset-0 tw-bg-slate-900/50" @click="uploadOpen = false"></div>
      <div class="tw-relative tw-w-full tw-max-w-2xl tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-overflow-hidden">
        <div class="tw-flex tw-items-center tw-justify-between tw-px-5 tw-py-4 tw-border-b tw-border-slate-100">
          <div>
            <div class="tw-text-sm tw-font-semibold">上传文档</div>
            <div class="tw-text-[11px] tw-text-slate-500 tw-mt-0.5">上传后进入“我的文档”，可提交归档审批</div>
          </div>
          <button class="tw-w-8 tw-h-8 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-text-slate-400 staff-icon-btn" @click="uploadOpen = false"><oa-icon name="x" class="tw-w-4 tw-h-4"></oa-icon></button>
        </div>
        <div class="tw-p-5 tw-space-y-4">
          <div class="staff-drop tw-rounded-xl tw-border tw-border-dashed tw-border-slate-300 tw-bg-slate-50 tw-px-4 tw-py-6 tw-text-center tw-cursor-pointer" @click="$refs.fileInput.click()">
            <input ref="fileInput" type="file" class="tw-hidden" @change="onFile" />
            <oa-icon name="upload" class="tw-w-7 tw-h-7 tw-text-indigo-500 tw-mx-auto"></oa-icon>
            <div class="tw-mt-2 tw-text-[12px] tw-text-slate-600" v-if="!upload.fileName">点击选择文件，或拖拽到此处</div>
            <div class="tw-mt-2 tw-text-[12px] tw-text-slate-800 tw-font-medium" v-else>{{ upload.fileName }} <span class="tw-text-slate-400 tw-font-normal">（{{ upload.size }}）</span></div>
            <div class="tw-mt-1 tw-text-[10px] tw-text-slate-400">支持 PDF / Word / Excel / PPT / 图片，单文件不超过 50 MB</div>
          </div>
          <div>
            <label class="staff-label">文档标题 <span class="tw-text-rose-500">*</span></label>
            <input v-model="upload.title" class="staff-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200" placeholder="请输入文档标题" />
          </div>
          <div class="tw-grid tw-grid-cols-2 tw-gap-4">
            <div>
              <label class="staff-label">所属分类 <span class="tw-text-rose-500">*</span></label>
              <select v-model="upload.cat" class="staff-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200 tw-bg-white">
                <option value="">请选择分类</option>
                <option v-for="c in store.leafCategories()" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div>
              <label class="staff-label">密级</label>
              <select v-model="upload.classification" class="staff-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200 tw-bg-white">
                <option value="public">公开</option>
                <option value="internal">内部</option>
                <option value="sensitive">敏感（需审批）</option>
              </select>
            </div>
          </div>
          <div>
            <label class="staff-label">可见范围</label>
            <div class="tw-flex tw-gap-2">
              <button v-for="v in visibilityOptions" :key="v.id" @click="upload.visibility = v.id"
                :class="['tw-flex-1 tw-px-3 tw-py-2 tw-rounded-lg tw-text-[12px] tw-border', upload.visibility === v.id ? 'tw-bg-indigo-50 tw-text-indigo-700 tw-border-indigo-300' : 'tw-bg-white tw-text-slate-600 tw-border-slate-200']">{{ v.label }}</button>
            </div>
          </div>
          <div>
            <label class="staff-label">标签（可选）</label>
            <input v-model="upload.tags" class="staff-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200" placeholder="用逗号分隔，如：教学,计划" />
          </div>
          <div>
            <label class="staff-label">摘要</label>
            <textarea v-model="upload.summary" rows="3" class="staff-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200" placeholder="简要说明文档内容与用途"></textarea>
          </div>
        </div>
        <div class="tw-flex tw-items-center tw-justify-end tw-gap-2 tw-px-5 tw-py-4 tw-bg-slate-50">
          <button @click="uploadOpen = false" class="staff-btn-ghost tw-px-4 tw-py-2 tw-rounded-lg tw-text-[12px]">取消</button>
          <button @click="submitUpload" class="staff-btn-primary tw-px-4 tw-py-2 tw-rounded-lg tw-text-[12px] tw-text-white">上传并保存</button>
        </div>
      </div>
    </div>

    <!-- ==================== 提交归档 ==================== -->
    <div v-if="archiveDoc" class="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-6">
      <div class="tw-absolute tw-inset-0 tw-bg-slate-900/50" @click="archiveDoc = null"></div>
      <div class="tw-relative tw-w-full tw-max-w-lg tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-overflow-hidden">
        <div class="tw-px-5 tw-py-4 tw-border-b tw-border-slate-100">
          <div class="tw-text-sm tw-font-semibold">提交归档审批</div>
          <div class="tw-text-[11px] tw-text-slate-500 tw-mt-0.5">提交后文档进入审批中，审批期间不可编辑</div>
        </div>
        <div class="tw-p-5 tw-space-y-4">
          <div class="tw-p-3 tw-rounded-xl tw-bg-slate-50 tw-border tw-border-slate-100">
            <div class="tw-text-[13px] tw-font-medium">{{ archiveDoc.title }}</div>
            <div class="tw-text-[11px] tw-text-slate-500 tw-mt-1">{{ archiveDoc.no }} · {{ archiveDoc.catName }} · V{{ archiveDoc.version }}</div>
          </div>
          <div class="tw-grid tw-grid-cols-2 tw-gap-3">
            <div><label class="staff-label">密级</label><div class="tw-text-[13px] tw-mt-1">{{ store.h.classification(archiveDoc.classification).label }}</div></div>
            <div><label class="staff-label">可见范围</label><div class="tw-text-[13px] tw-mt-1">{{ store.h.visibility(archiveDoc.visibility) }}</div></div>
          </div>
          <div>
            <label class="staff-label">归档说明</label>
            <textarea v-model="archiveForm.reason" rows="3" class="staff-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200" placeholder="说明文档内容与归档用途"></textarea>
          </div>
          <div class="tw-rounded-xl tw-border tw-border-slate-100 tw-p-3">
            <div class="tw-text-[11px] tw-text-slate-500 tw-mb-2">审批流程</div>
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-[11px]">
              <span class="tw-px-2 tw-py-1 tw-rounded tw-bg-amber-50 tw-text-amber-700">秘书处初审 · 王慧敏</span>
              <oa-icon name="arrow-right" class="tw-w-3.5 tw-h-3.5 tw-text-slate-300"></oa-icon>
              <span class="tw-px-2 tw-py-1 tw-rounded tw-bg-slate-100 tw-text-slate-500">副理事长终审 · 赵启明</span>
            </div>
          </div>
        </div>
        <div class="tw-flex tw-items-center tw-justify-end tw-gap-2 tw-px-5 tw-py-4 tw-bg-slate-50">
          <button @click="archiveDoc = null" class="staff-btn-ghost tw-px-4 tw-py-2 tw-rounded-lg tw-text-[12px]">取消</button>
          <button @click="submitArchive" class="staff-btn-primary tw-px-4 tw-py-2 tw-rounded-lg tw-text-[12px] tw-text-white">提交审批</button>
        </div>
      </div>
    </div>

    <!-- ==================== 发起审批 ==================== -->
    <div v-if="startOpen" class="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-6">
      <div class="tw-absolute tw-inset-0 tw-bg-slate-900/50" @click="startOpen = false"></div>
      <div class="tw-relative tw-w-full tw-max-w-2xl tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-overflow-hidden">
        <div class="tw-flex tw-items-center tw-justify-between tw-px-5 tw-py-4 tw-border-b tw-border-slate-100">
          <div>
            <div class="tw-text-sm tw-font-semibold">发起审批</div>
            <div class="tw-text-[11px] tw-text-slate-500 tw-mt-0.5">选择事项类型并填写表单</div>
          </div>
          <button class="tw-w-8 tw-h-8 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-text-slate-400 staff-icon-btn" @click="startOpen = false"><oa-icon name="x" class="tw-w-4 tw-h-4"></oa-icon></button>
        </div>
        <div class="tw-p-5">
          <div class="tw-grid tw-grid-cols-4 tw-gap-2 tw-mb-4">
            <button v-for="t in startTypes" :key="t.type" @click="startForm.type = t.type"
              :class="['tw-px-2 tw-py-3 tw-rounded-xl tw-border tw-text-center', startForm.type === t.type ? 'tw-bg-indigo-50 tw-border-indigo-300' : 'tw-bg-white tw-border-slate-200']">
              <oa-icon :name="t.icon" class="tw-w-5 tw-h-5 tw-mx-auto" :class="startForm.type === t.type ? 'tw-text-indigo-600' : 'tw-text-slate-400'"></oa-icon>
              <div class="tw-text-[11px] tw-mt-1.5" :class="startForm.type === t.type ? 'tw-text-indigo-700 tw-font-medium' : 'tw-text-slate-600'">{{ t.label }}</div>
            </button>
          </div>

          <div v-if="startForm.type === 'DOC_ARCHIVE'" class="tw-space-y-3">
            <div>
              <label class="staff-label">选择文档</label>
              <select v-model="startForm.docId" class="staff-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200 tw-bg-white">
                <option value="">请选择草稿或被退回的文档</option>
                <option v-for="d in archiveCandidates" :key="d.id" :value="d.id">{{ d.title }}（{{ store.h.status(d.status).label }}）</option>
              </select>
            </div>
            <div><label class="staff-label">归档说明</label><textarea v-model="startForm.reason" rows="3" class="staff-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200" placeholder="说明归档用途"></textarea></div>
          </div>

          <div v-else-if="startForm.type === 'PERM_GRANT'" class="tw-space-y-3">
            <div class="tw-rounded-xl tw-bg-slate-50 tw-p-3 tw-text-[12px] tw-text-slate-600">权限申请将生成审批单，由秘书处初审后自动授权。</div>
            <div><label class="staff-label">申请对象</label>
              <select v-model="startForm.objectId" class="staff-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200 tw-bg-white">
                <option value="">请选择文档或分类</option>
                <option v-for="d in visibleDocs" :key="d.id" :value="'document:' + d.id">文档：{{ d.title }}</option>
                <option v-for="c in store.categories" :key="'cat-' + c.id" :value="'category:' + c.id">分类：{{ c.name }}</option>
              </select>
            </div>
            <div><label class="staff-label">申请用途</label><textarea v-model="startForm.reason" rows="3" class="staff-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200" placeholder="说明使用场景与必要性"></textarea></div>
          </div>

          <div v-else-if="startForm.type === 'SENSITIVE_DOWNLOAD'" class="tw-space-y-3">
            <div>
              <label class="staff-label">选择敏感文档</label>
              <select v-model="startForm.docId" class="staff-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200 tw-bg-white">
                <option value="">请选择敏感文档</option>
                <option v-for="d in sensitiveDocs" :key="d.id" :value="d.id">{{ d.title }}</option>
              </select>
            </div>
            <div><label class="staff-label">下载用途</label><textarea v-model="startForm.reason" rows="3" class="staff-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200" placeholder="不少于 20 字，审批通过后 24 小时内可下载 1 次"></textarea></div>
          </div>

          <div v-else class="tw-space-y-3">
            <div><label class="staff-label">事项标题</label><input v-model="startForm.title" class="staff-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200" placeholder="如：对外提供《2025 年度工作总结》" /></div>
            <div><label class="staff-label">接收单位</label><input v-model="startForm.recipient" class="staff-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200" placeholder="填写接收单位或用途" /></div>
            <div><label class="staff-label">事项说明</label><textarea v-model="startForm.reason" rows="3" class="staff-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200" placeholder="说明事项背景与需求"></textarea></div>
          </div>
        </div>
        <div class="tw-flex tw-items-center tw-justify-between tw-px-5 tw-py-4 tw-bg-slate-50">
          <span class="tw-text-[11px] tw-text-slate-400">提交后可在“审批中心”跟踪进度</span>
          <div class="tw-flex tw-gap-2">
            <button @click="startOpen = false" class="staff-btn-ghost tw-px-4 tw-py-2 tw-rounded-lg tw-text-[12px]">取消</button>
            <button @click="submitStart" class="staff-btn-primary tw-px-4 tw-py-2 tw-rounded-lg tw-text-[12px] tw-text-white">提交</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 申请权限 ==================== -->
    <div v-if="permOpen" class="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-6">
      <div class="tw-absolute tw-inset-0 tw-bg-slate-900/50" @click="permOpen = false"></div>
      <div class="tw-relative tw-w-full tw-max-w-lg tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-overflow-hidden">
        <div class="tw-px-5 tw-py-4 tw-border-b tw-border-slate-100">
          <div class="tw-text-sm tw-font-semibold">申请文档权限</div>
          <div class="tw-text-[11px] tw-text-slate-500 tw-mt-0.5">审批通过后自动生效，到期自动失效</div>
        </div>
        <div class="tw-p-5 tw-space-y-4">
          <div>
            <label class="staff-label">申请对象</label>
            <select v-model="permForm.objectKey" class="staff-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200 tw-bg-white">
              <option value="">请选择文档或分类</option>
              <option v-for="d in visibleDocs" :key="d.id" :value="'document:' + d.id">文档：{{ d.title }}</option>
              <option v-for="c in store.categories" :key="'cat-' + c.id" :value="'category:' + c.id">分类：{{ c.name }}</option>
            </select>
          </div>
          <div>
            <label class="staff-label">申请权限</label>
            <div class="tw-flex tw-gap-2">
              <button v-for="r in rightOptions" :key="r.id" @click="toggleRight(r.id)"
                :class="['tw-flex-1 tw-px-3 tw-py-2 tw-rounded-lg tw-text-[12px] tw-border', permForm.rights.indexOf(r.id) >= 0 ? 'tw-bg-indigo-50 tw-text-indigo-700 tw-border-indigo-300' : 'tw-bg-white tw-text-slate-600 tw-border-slate-200']">{{ r.label }}</button>
            </div>
          </div>
          <div class="tw-grid tw-grid-cols-2 tw-gap-4">
            <div><label class="staff-label">期限</label>
              <select v-model.number="permForm.days" class="staff-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200 tw-bg-white">
                <option :value="7">7 天</option><option :value="30">30 天</option><option :value="90">90 天</option><option :value="180">180 天</option>
              </select>
            </div>
            <div><label class="staff-label">审批流程</label><div class="tw-mt-2 tw-text-[12px] tw-text-slate-500">秘书处初审 · 王慧敏</div></div>
          </div>
          <div>
            <label class="staff-label">申请用途 <span class="tw-text-rose-500">*</span></label>
            <textarea v-model="permForm.reason" rows="3" class="staff-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200" placeholder="请说明使用场景与必要性（不少于 10 字）"></textarea>
          </div>
        </div>
        <div class="tw-flex tw-items-center tw-justify-end tw-gap-2 tw-px-5 tw-py-4 tw-bg-slate-50">
          <button @click="permOpen = false" class="staff-btn-ghost tw-px-4 tw-py-2 tw-rounded-lg tw-text-[12px]">取消</button>
          <button @click="submitPerm" class="staff-btn-primary tw-px-4 tw-py-2 tw-rounded-lg tw-text-[12px] tw-text-white">提交申请</button>
        </div>
      </div>
    </div>

    <!-- ==================== 敏感文档下载申请 ==================== -->
    <div v-if="downloadDocTarget" class="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-6">
      <div class="tw-absolute tw-inset-0 tw-bg-slate-900/50" @click="downloadDocTarget = null"></div>
      <div class="tw-relative tw-w-full tw-max-w-lg tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-overflow-hidden">
        <div class="tw-px-5 tw-py-4 tw-border-b tw-border-slate-100 tw-flex tw-items-center tw-gap-2">
          <oa-icon name="lock" class="tw-w-4 tw-h-4 tw-text-rose-500"></oa-icon>
          <div>
            <div class="tw-text-sm tw-font-semibold">敏感文档下载审批</div>
            <div class="tw-text-[11px] tw-text-slate-500 tw-mt-0.5">审批通过后 24 小时内可下载 1 次，文件自动加水印</div>
          </div>
        </div>
        <div class="tw-p-5 tw-space-y-4">
          <div class="tw-p-3 tw-rounded-xl tw-bg-rose-50 tw-border tw-border-rose-100">
            <div class="tw-text-[13px] tw-font-medium">{{ downloadDocTarget.title }}</div>
            <div class="tw-text-[11px] tw-text-rose-600 tw-mt-1">密级：敏感 · 文档编号 {{ downloadDocTarget.no }}</div>
          </div>
          <div>
            <label class="staff-label">下载用途 <span class="tw-text-rose-500">*</span></label>
            <textarea v-model="downloadReason" rows="3" class="staff-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200" placeholder="请说明下载用途与使用范围（不少于 10 字）"></textarea>
          </div>
          <div class="tw-flex tw-items-center tw-gap-2 tw-text-[11px] tw-text-slate-500">
            <oa-icon name="info" class="tw-w-3.5 tw-h-3.5"></oa-icon>
            下载记录将写入审计日志；请勿对外传播。
          </div>
        </div>
        <div class="tw-flex tw-items-center tw-justify-end tw-gap-2 tw-px-5 tw-py-4 tw-bg-slate-50">
          <button @click="downloadDocTarget = null" class="staff-btn-ghost tw-px-4 tw-py-2 tw-rounded-lg tw-text-[12px]">取消</button>
          <button @click="submitDownloadReq" class="tw-px-4 tw-py-2 tw-rounded-lg tw-text-[12px] tw-text-white tw-bg-rose-600">提交审批</button>
        </div>
      </div>
    </div>

    <!-- ==================== 审批实例详情 ==================== -->
    <div v-if="instanceModal" class="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-6">
      <div class="tw-absolute tw-inset-0 tw-bg-slate-900/50" @click="instanceModal = null"></div>
      <div class="tw-relative tw-w-full tw-max-w-2xl tw-max-h-[86vh] tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-flex tw-flex-col tw-overflow-hidden">
        <div class="tw-px-5 tw-py-4 tw-border-b tw-border-slate-100 tw-flex tw-items-start tw-gap-3">
          <div class="tw-flex-1 min-w-0">
            <div class="tw-flex tw-items-center tw-gap-2">
              <span class="tw-text-sm tw-font-semibold">{{ instanceModal.title }}</span>
              <span :class="['tw-px-1.5 tw-py-0.5 tw-rounded tw-text-[10px] tw-border', store.h.instStatus(instanceModal.status).cls]">{{ store.h.instStatus(instanceModal.status).label }}</span>
            </div>
            <div class="tw-text-[11px] tw-text-slate-500 tw-mt-1">{{ instanceModal.no }} · {{ store.h.type(instanceModal.type).label }} · 发起人 {{ instanceModal.creator }}</div>
          </div>
          <button class="tw-w-8 tw-h-8 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-text-slate-400 staff-icon-btn" @click="instanceModal = null"><oa-icon name="x" class="tw-w-4 tw-h-4"></oa-icon></button>
        </div>
        <div class="tw-flex-1 tw-overflow-y-auto oa-scroll tw-p-5 tw-space-y-5">
          <div>
            <div class="tw-text-[11px] tw-text-slate-400 tw-mb-2">表单信息</div>
            <div class="tw-rounded-xl tw-border tw-border-slate-100 tw-divide-y tw-divide-slate-50">
              <div v-for="(f, i) in instanceModal.form" :key="i" class="tw-flex tw-px-3.5 tw-py-2.5 tw-text-[12px]">
                <span class="tw-w-24 tw-text-slate-500 tw-shrink-0">{{ f.label }}</span>
                <span class="tw-text-slate-800 tw-flex-1">{{ f.value }}</span>
              </div>
            </div>
          </div>
          <div>
            <div class="tw-text-[11px] tw-text-slate-400 tw-mb-2">审批流程</div>
            <div class="tw-space-y-1">
              <div v-for="(node, idx) in instanceModal.nodes" :key="node.id" class="tw-flex tw-gap-3">
                <div class="tw-flex tw-flex-col tw-items-center tw-w-5 tw-shrink-0">
                  <span :class="['tw-w-5 tw-h-5 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-[10px]',
                    node.status === 'approved' ? 'tw-bg-emerald-500 tw-text-white' : node.status === 'pending' ? 'tw-bg-amber-500 tw-text-white' : node.status === 'returned' || node.status === 'rejected' ? 'tw-bg-rose-500 tw-text-white' : 'tw-bg-slate-200 tw-text-slate-500']">
                    <oa-icon v-if="node.status === 'approved'" name="check" class="tw-w-3 tw-h-3"></oa-icon>
                    <span v-else>{{ idx + 1 }}</span>
                  </span>
                  <span v-if="idx < instanceModal.nodes.length - 1" class="tw-w-px tw-flex-1 tw-bg-slate-200 tw-my-1"></span>
                </div>
                <div class="tw-flex-1 tw-pb-4">
                  <div class="tw-flex tw-items-center tw-gap-2">
                    <span class="tw-text-[12px] tw-font-medium">{{ node.name }}</span>
                    <span v-if="node.status === 'pending'" class="tw-px-1.5 tw-py-0.5 tw-rounded tw-bg-amber-50 tw-text-amber-600 tw-text-[10px]">处理中</span>
                    <span v-if="node.status === 'returned'" class="tw-px-1.5 tw-py-0.5 tw-rounded tw-bg-rose-50 tw-text-rose-600 tw-text-[10px]">已退回</span>
                  </div>
                  <div v-for="t in node.tasks" :key="t.account" class="tw-mt-1.5 tw-flex tw-items-start tw-gap-2 tw-text-[11px]">
                    <span class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-slate-100 tw-text-slate-500 tw-flex tw-items-center tw-justify-center tw-text-[10px] tw-shrink-0">{{ t.name.slice(0, 1) }}</span>
                    <div>
                      <div class="tw-text-slate-700">{{ t.name }} <span class="tw-text-slate-400">· {{ t.status === 'approved' ? '已同意' : t.status === 'returned' ? '已退回' : t.status === 'rejected' ? '已驳回' : t.status === 'waiting' ? '待流转' : '待处理' }}</span></div>
                      <div v-if="t.comment" class="tw-text-slate-500 tw-mt-0.5">“{{ t.comment }}”</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div class="tw-text-[11px] tw-text-slate-400 tw-mb-2">操作记录</div>
            <div class="tw-space-y-2">
              <div v-for="(h, i) in instanceModal.history.slice().reverse()" :key="i" class="tw-flex tw-gap-2 tw-text-[11px]">
                <span class="tw-text-slate-400 tw-w-28 tw-shrink-0">{{ store.h.fmtDateTime(h.at) }}</span>
                <span class="tw-text-slate-700 tw-w-16 tw-shrink-0">{{ h.actor }}</span>
                <span class="tw-text-slate-500">{{ h.action }}<span v-if="h.comment">：{{ h.comment }}</span></span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="instanceModal.creatorAccount === me.account" class="tw-flex tw-items-center tw-justify-end tw-gap-2 tw-px-5 tw-py-3.5 tw-bg-slate-50 tw-border-t tw-border-slate-100">
          <button v-if="canWithdraw(instanceModal)" @click="withdraw(instanceModal)" class="staff-btn-ghost tw-px-3 tw-py-2 tw-rounded-lg tw-text-[12px]">撤回申请</button>
          <button v-if="instanceModal.status === 'RUNNING'" @click="urge(instanceModal)" class="tw-px-3 tw-py-2 tw-rounded-lg tw-text-[12px] tw-text-amber-700 tw-bg-amber-50">催办</button>
          <button @click="instanceModal = null" class="staff-btn-primary tw-px-4 tw-py-2 tw-rounded-lg tw-text-[12px] tw-text-white">关闭</button>
        </div>
        <div v-else class="tw-flex tw-items-center tw-justify-end tw-px-5 tw-py-3.5 tw-bg-slate-50 tw-border-t tw-border-slate-100">
          <button @click="instanceModal = null" class="staff-btn-primary tw-px-4 tw-py-2 tw-rounded-lg tw-text-[12px] tw-text-white">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "StaffPanel",
  props: { store: { type: Object, required: true } },
  data() {
    return {
      tab: "home",
      search: "",
      catFilter: "",
      classFilter: "",
      mineFilter: "all",
      instFilter: "all",
      notifOpen: false,
      docModal: null,
      uploadOpen: false,
      archiveDoc: null,
      startOpen: false,
      permOpen: false,
      downloadDocTarget: null,
      downloadReason: "",
      instanceModal: null,
      upload: {},
      archiveForm: { reason: "" },
      startForm: { type: "DOC_ARCHIVE", docId: "", reason: "", title: "", recipient: "", objectId: "" },
      permForm: { objectKey: "", rights: ["view"], days: 30, reason: "" },
      startTypes: [
        { type: "DOC_ARCHIVE", label: "文档归档", icon: "docs" },
        { type: "PERM_GRANT", label: "权限申请", icon: "key" },
        { type: "SENSITIVE_DOWNLOAD", label: "敏感下载", icon: "lock" },
        { type: "GENERAL", label: "对外提供材料", icon: "send" }
      ],
      visibilityOptions: [
        { id: "all", label: "全体会员" },
        { id: "dept", label: "本分支机构" },
        { id: "user", label: "指定人员" }
      ],
      rightOptions: [
        { id: "view", label: "查看" },
        { id: "download", label: "下载" },
        { id: "edit", label: "编辑" }
      ]
    };
  },
  computed: {
    me() { return this.store.currentUser || this.store.persona.staff; },
    today() {
      const d = new Date();
      const week = ["日", "一", "二", "三", "四", "五", "六"][d.getDay()];
      return d.getFullYear() + " 年 " + (d.getMonth() + 1) + " 月 " + d.getDate() + " 日 星期" + week;
    },
    greeting() {
      const h = new Date().getHours();
      return h < 6 ? "夜深了" : h < 12 ? "上午好" : h < 18 ? "下午好" : "晚上好";
    },
    navItems() {
      return [
        { id: "home", label: "工作台", icon: "home", badge: 0 },
        { id: "docs", label: "文档中心", icon: "docs", badge: 0 },
        { id: "mine", label: "我的文档", icon: "folder", badge: this.myDocs.filter(d => d.status === "RETURNED").length },
        { id: "approvals", label: "审批中心", icon: "task", badge: this.myInstances.filter(i => i.status === "RETURNED").length },
        { id: "perm", label: "权限申请", icon: "key", badge: this.expiring.length }
      ];
    },
    pageTitle() {
      return { home: "工作台", docs: "文档中心", mine: "我的文档", approvals: "审批中心", perm: "权限申请" }[this.tab] || "工作台";
    },
    pageSubtitle() {
      return {
        home: "查看待办、文档与通知概览",
        docs: "按分类、密级检索可访问的文档",
        mine: "管理我上传的文档与归档进度",
        approvals: "跟踪我发起的审批与处理记录",
        perm: "查看授权、到期提醒与申请进度"
      }[this.tab] || "";
    },
    visibleDocs() { return this.store.visibleDocs(this.me.account).filter(d => d.status !== "RECYCLED" && d.status !== "DELETED"); },
    filteredDocs() {
      let list = this.visibleDocs;
      if (this.catFilter) list = list.filter(d => d.cat.indexOf(this.catFilter) === 0);
      if (this.classFilter) list = list.filter(d => d.classification === this.classFilter);
      if (this.search) {
        const q = this.search.toLowerCase();
        list = list.filter(d => (d.title + d.no + (d.tags || []).join("")).toLowerCase().indexOf(q) >= 0);
      }
      return list;
    },
    recentDocs() {
      return this.visibleDocs.slice().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 3);
    },
    myDocs() {
      let list = this.store.docs.filter(d => d.ownerAccount === this.me.account && d.status !== "DELETED");
      if (this.mineFilter !== "all") list = list.filter(d => d.status === this.mineFilter);
      if (this.search) {
        const q = this.search.toLowerCase();
        list = list.filter(d => (d.title + d.no).toLowerCase().indexOf(q) >= 0);
      }
      return list;
    },
    mineFilters() {
      const base = this.store.docs.filter(d => d.ownerAccount === this.me.account && d.status !== "DELETED");
      return [
        { id: "all", label: "全部", count: base.length },
        { id: "DRAFT", label: "草稿", count: base.filter(d => d.status === "DRAFT").length },
        { id: "SUBMITTED", label: "审批中", count: base.filter(d => d.status === "SUBMITTED").length },
        { id: "RETURNED", label: "被退回", count: base.filter(d => d.status === "RETURNED").length },
        { id: "ACTIVE", label: "已归档", count: base.filter(d => d.status === "ACTIVE").length }
      ];
    },
    myInstances() {
      let list = this.store.instances.filter(i => i.creatorAccount === this.me.account);
      if (this.instFilter !== "all") list = list.filter(i => i.status === this.instFilter);
      return list;
    },
    instFilters() {
      const base = this.store.instances.filter(i => i.creatorAccount === this.me.account);
      return [
        { id: "all", label: "全部" },
        { id: "RUNNING", label: "审批中" },
        { id: "RETURNED", label: "已退回" },
        { id: "APPROVED", label: "已通过" },
        { id: "REJECTED", label: "已驳回" }
      ];
    },
    runningInstances() { return this.myInstances.filter(i => i.status === "RUNNING" || i.status === "RETURNED"); },
    runningCount() { return this.myInstances.filter(i => i.status === "RUNNING").length; },
    stats() {
      return [
        { label: "可查阅文档", value: this.visibleDocs.length, icon: "docs", cls: "tw-bg-indigo-50 tw-text-indigo-600" },
        { label: "我的文档", value: this.store.docs.filter(d => d.ownerAccount === this.me.account && d.status !== "DELETED").length, icon: "folder", cls: "tw-bg-sky-50 tw-text-sky-600" },
        { label: "进行中审批", value: this.runningCount, icon: "task", cls: "tw-bg-amber-50 tw-text-amber-600" },
        { label: "未读通知", value: this.unread, icon: "bell", cls: "tw-bg-rose-50 tw-text-rose-600" }
      ];
    },
    unread() { return this.store.unreadFor(this.me.account); },
    myNotifs() { return this.store.notificationsFor(this.me.account).slice(0, 8); },
    announcements() { return this.store.announcements; },
    activeGrants() {
      return this.store.grants.filter(g => g.status === "active" && new Date(g.validUntil).getTime() >= Date.now() && (
        (g.subjectType === "user" && g.subjectId === this.me.account) ||
        (g.subjectType === "role" && this.store.capsOf(this.me.account).indexOf(g.subjectId) !== -1)
      ));
    },
    expiredGrants() {
      return this.store.grants.filter(g => g.subjectType === "user" && g.subjectId === this.me.account && (g.status !== "active" || new Date(g.validUntil).getTime() < Date.now()));
    },
    expiring() { return this.activeGrants.filter(g => this.daysLeft(g.validUntil) <= 7); },
    myPermRequests() {
      return this.store.instances.filter(i => i.creatorAccount === this.me.account && i.type === "PERM_GRANT");
    },
    pendingRequests() { return this.myPermRequests.filter(i => i.status === "RUNNING"); },
    archiveCandidates() {
      return this.store.docs.filter(d => d.ownerAccount === this.me.account && (d.status === "DRAFT" || d.status === "RETURNED"));
    },
    sensitiveDocs() {
      return this.visibleDocs.filter(d => d.classification === "sensitive");
    }
  },
  watch: {
    "store.intent.seq"() { this.applyIntent(); }
  },
  mounted() { this.upload = this.emptyUpload(); this.applyIntent(); },
  methods: {
    emptyUpload() {
      return { title: "", cat: "", classification: "internal", visibility: "all", tags: "", summary: "", fileName: "", size: "" };
    },
    go(tab) {
      this.tab = tab;
      this.docModal = null;
      this.notifOpen = false;
    },
    applyIntent() {
      const it = this.store.intent;
      if (!it || it.role !== "staff") return;
      if (it.seq === this._lastSeq) return;
      this._lastSeq = it.seq;
      if (it.tab) this.tab = ["home", "docs", "mine", "approvals", "perm"].indexOf(it.tab) >= 0 ? it.tab : "home";
      if (it.docId) {
        const doc = this.store.docById(it.docId);
        if (doc) {
          this.openDoc(doc);
          if (it.action === "download") this.tryDownload(doc);
        }
      }
      if (it.instanceId) {
        const inst = this.store.instanceById(it.instanceId);
        if (inst) this.openInstance(inst);
      }
      if (it.action === "upload") this.openUpload();
      if (it.action === "newRequest") this.openPerm();
      if (it.action === "withdraw") this.tab = "approvals";
    },
    progress(inst) {
      const nodes = inst.nodes || [];
      const done = nodes.filter(n => n.status === "approved").length;
      const current = nodes[inst.currentNode];
      const half = current && current.status === "pending" ? 0.5 : 0;
      return Math.round((done + half) / Math.max(1, nodes.length) * 100);
    },
    dueLabel(inst) {
      if (inst.status === "RUNNING") return this.store.h.fromNow(inst.dueAt);
      return this.store.h.instStatus(inst.status).label;
    },
    currentNodeName(inst) {
      if (inst.status === "APPROVED") return "已办结";
      if (inst.status === "RETURNED") return "已退回";
      if (inst.status === "REJECTED") return "已驳回";
      if (inst.status === "WITHDRAWN") return "已撤回";
      const node = inst.nodes[inst.currentNode];
      return node ? node.name : "—";
    },
    daysLeft(v) { return this.store.h.daysLeft(v); },
    returnReason(doc) {
      const inst = doc.approvalId && this.store.instanceById(doc.approvalId);
      if (!inst) return "—";
      const task = inst.nodes[0] && inst.nodes[0].tasks[0];
      return (task && task.comment) || "—";
    },
    openDoc(doc) { this.docModal = doc; },
    canDownloadDoc(doc) { return this.store.canDownload(doc, this.me.account).ok; },
    tryDownload(doc) {
      const res = this.store.canDownload(doc, this.me.account);
      if (!res.ok) {
        this.docModal = null;
        this.openDownloadReq(doc);
        return;
      }
      this.doDownload(doc);
    },
    doDownload(doc) {
      this.store.recordDownload(doc, this.me.account);
      const text = [
        "中国电子教育学会 · 公文与审批 OA 演示文件",
        "--------------------------------",
        "文档标题：" + doc.title,
        "文档编号：" + doc.no,
        "密级：" + this.store.h.classification(doc.classification).label,
        "下载人：" + this.me.name + "（" + this.me.account + "）",
        "下载时间：" + new Date().toLocaleString("zh-CN"),
        "水印标识：" + this.me.name + " · " + this.me.account,
        "",
        doc.summary,
        "",
        "本文件仅用于学会授权范围内的查阅，请勿对外传播。"
      ].join("\n");
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = doc.title + ".txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      this.store.toast("已开始下载《" + doc.title + "》（含水印），下载记录已写入审计日志。");
      this.docModal = null;
    },
    openDownloadReq(doc) {
      this.downloadDocTarget = doc;
      this.downloadReason = "";
    },
    submitDownloadReq() {
      if (!this.downloadReason || this.downloadReason.trim().length < 10) {
        this.store.toast("请填写不少于 10 字的下载用途。", "error");
        return;
      }
      const inst = this.store.requestSensitiveDownload(this.downloadDocTarget.id, this.downloadReason.trim(), this.me.account);
      this.downloadDocTarget = null;
      this.downloadReason = "";
      this.store.toast("下载申请已提交（" + inst.no + "），待秘书处审批。");
      this.tab = "approvals";
    },
    openUpload() {
      this.upload = this.emptyUpload();
      this.uploadOpen = true;
    },
    onFile(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      this.upload.fileName = file.name;
      this.upload.size = (file.size / 1024 / 1024).toFixed(2) + " MB";
      if (!this.upload.title) this.upload.title = file.name.replace(/\.[^.]+$/, "");
    },
    submitUpload() {
      if (!this.upload.title) { this.store.toast("请填写文档标题。", "error"); return; }
      if (!this.upload.cat) { this.store.toast("请选择所属分类。", "error"); return; }
      const doc = this.store.uploadDoc({
        title: this.upload.title.trim(),
        cat: this.upload.cat,
        classification: this.upload.classification,
        visibility: this.upload.visibility,
        tags: (this.upload.tags || "").split(/[,，]/).map(t => t.trim()).filter(Boolean),
        summary: this.upload.summary || "（未填写摘要）",
        fileName: this.upload.fileName || (this.upload.title + ".pdf"),
        size: this.upload.size || "1.6 MB"
      }, this.me.account);
      this.uploadOpen = false;
      this.store.toast("上传成功，已生成草稿《" + doc.title + "》。");
      this.$nextTick(() => {
        this.store.confirm({
          title: "立即提交归档？",
          text: "文档已保存为草稿。可以现在提交归档审批，也可以稍后在“我的文档”中提交。",
          okText: "立即提交",
          cancelText: "稍后再说"
        }).then((ok) => {
          if (ok) {
            this.tab = "mine";
            this.openArchive(doc);
          }
        });
      });
    },
    openArchive(doc) {
      this.archiveDoc = doc;
      this.archiveForm = { reason: "文档定稿，申请归档留存。" };
    },
    submitArchive() {
      if (!this.archiveForm.reason || this.archiveForm.reason.trim().length < 5) {
        this.store.toast("请填写归档说明。", "error");
        return;
      }
      const inst = this.store.submitArchive(this.archiveDoc.id, this.me.account, { reason: this.archiveForm.reason.trim() });
      this.archiveDoc = null;
      this.store.toast("已提交归档审批（" + inst.no + "），待秘书处初审。");
      this.tab = "mine";
    },
    removeDoc(doc) {
      this.store.confirm({ title: "删除文档", text: "《" + doc.title + "》将移入回收站，30 天内可恢复。", okText: "删除", danger: true }).then((ok) => {
        if (!ok) return;
        this.store.deleteDoc(doc.id, this.me.name, "所有者删除");
        this.store.toast("已移入回收站。");
      });
    },
    openInstanceById(id) {
      const inst = id && this.store.instanceById(id);
      if (inst) this.openInstance(inst);
    },
    openInstance(inst) { this.instanceModal = inst; },
    canWithdraw(inst) {
      if (!inst || inst.status !== "RUNNING" || inst.creatorAccount !== this.me.account) return false;
      return !inst.nodes.some(n => n.tasks.some(t => ["approved", "returned", "rejected"].indexOf(t.status) >= 0));
    },
    withdraw(inst) {
      this.store.confirm({ title: "撤回申请", text: "撤回后流程终止，文档恢复为草稿。确定撤回《" + inst.title + "》？", okText: "撤回" }).then((ok) => {
        if (!ok) return;
        const res = this.store.withdrawInstance(inst.id, this.me.account);
        if (res.ok) {
          this.instanceModal = null;
          this.store.toast("已撤回申请。");
        } else {
          this.store.toast(res.message, "error");
        }
      });
    },
    urge(inst) {
      const res = this.store.urgeInstance(inst.id, this.me.account);
      this.store.toast(res.ok ? "已催办，当前处理人将收到提醒。" : res.message, res.ok ? "success" : "error");
    },
    openNotif(n) {
      this.store.markRead(n.id);
      this.notifOpen = false;
      if (n.link && n.link.tab) this.tab = n.link.tab;
      if (n.link && n.link.instanceId) {
        const inst = this.store.instanceById(n.link.instanceId);
        if (inst) this.openInstance(inst);
      }
      if (n.link && n.link.docId) {
        const doc = this.store.docById(n.link.docId);
        if (doc) this.openDoc(doc);
      }
    },
    readAll() { this.store.markAllRead(this.me.account); },
    openStart() {
      this.startForm = { type: "DOC_ARCHIVE", docId: "", reason: "", title: "", recipient: "", objectId: "" };
      this.startOpen = true;
    },
    submitStart() {
      const f = this.startForm;
      if (f.type === "DOC_ARCHIVE") {
        if (!f.docId) { this.store.toast("请选择要归档的文档。", "error"); return; }
        const doc = this.store.docById(f.docId);
        this.startOpen = false;
        this.openArchive(doc);
        return;
      }
      if (f.type === "PERM_GRANT") {
        this.startOpen = false;
        const [type, id] = (f.objectId || "").split(":");
        this.openPerm();
        if (id) this.permForm.objectKey = type + ":" + id;
        this.permForm.reason = f.reason || "";
        return;
      }
      if (f.type === "SENSITIVE_DOWNLOAD") {
        if (!f.docId) { this.store.toast("请选择敏感文档。", "error"); return; }
        if (!f.reason || f.reason.trim().length < 10) { this.store.toast("请填写不少于 10 字的下载用途。", "error"); return; }
        const inst = this.store.requestSensitiveDownload(f.docId, f.reason.trim(), this.me.account);
        this.startOpen = false;
        this.store.toast("下载申请已提交（" + inst.no + "）。");
        this.tab = "approvals";
        return;
      }
      if (!f.title || !f.reason) { this.store.toast("请填写事项标题与说明。", "error"); return; }
      const inst = this.store.startGeneral({ title: f.title, recipient: f.recipient, reason: f.reason }, this.me.account);
      this.startOpen = false;
      this.store.toast("审批已提交（" + inst.no + "）。");
      this.tab = "approvals";
    },
    openPerm(doc) {
      this.permForm = { objectKey: "", rights: ["view"], days: 30, reason: "" };
      if (doc) this.permForm.objectKey = "document:" + doc.id;
      this.permOpen = true;
    },
    toggleRight(id) {
      const arr = this.permForm.rights;
      const i = arr.indexOf(id);
      if (i >= 0) arr.splice(i, 1); else arr.push(id);
    },
    submitPerm() {
      const f = this.permForm;
      if (!f.objectKey) { this.store.toast("请选择申请对象。", "error"); return; }
      if (!f.rights.length) { this.store.toast("请至少选择一项权限。", "error"); return; }
      if (!f.reason || f.reason.trim().length < 10) { this.store.toast("请填写不少于 10 字的申请用途。", "error"); return; }
      const [type, id] = f.objectKey.split(":");
      const inst = this.store.requestPermission({ objectType: type, objectId: id, rights: f.rights, days: f.days, reason: f.reason.trim() }, this.me.account);
      this.permOpen = false;
      this.store.toast("权限申请已提交（" + inst.no + "），待秘书处审批。");
      this.tab = "perm";
    }
  }
};
</script>

<style>
.staff-nav:hover { background: #f8fafc; }
.staff-row:hover { background: #f8fafc; }
.staff-card { transition: box-shadow .18s ease, transform .18s ease, border-color .18s ease; }
.staff-card:hover { box-shadow: 0 10px 28px -14px rgba(15, 23, 42, .25); transform: translateY(-1px); border-color: #cbd5e1; }
.staff-icon-btn:hover { background: #f1f5f9; color: #334155; }
.staff-btn-primary { background: #4f46e5; transition: background .15s ease; }
.staff-btn-primary:hover { background: #4338ca; }
.staff-btn-ghost { background: #fff; border: 1px solid #e2e8f0; color: #475569; transition: background .15s ease; }
.staff-btn-ghost:hover { background: #f8fafc; }
.staff-input:focus { outline: none; border-color: #818cf8; box-shadow: 0 0 0 3px rgba(99, 102, 241, .12); background: #fff; }
.staff-label { display: block; font-size: 11px; color: #64748b; margin-bottom: 6px; }
.staff-link:hover { color: #4f46e5; }
.staff-drop:hover { border-color: #818cf8; background: #eef2ff; }
.staff-paper { color: #1f2937; }
.staff-watermark { position: absolute; inset: 0; display: grid; grid-template-columns: 1fr 1fr 1fr; place-items: center; transform: rotate(-22deg) scale(1.25); pointer-events: none; overflow: hidden; }
.staff-watermark span { color: rgba(220, 38, 38, .08); font-size: 12px; white-space: nowrap; }
.staff-pop { animation: staff-pop .16s ease; }
@keyframes staff-pop { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
</style>
