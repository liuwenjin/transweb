<!--
  院系文档权限与审批 OA · 文档管理员工作台（独立 Vue 3 单文件组件）
  文档库 · 版本 · 授权台账 · 回收站 · 统计
  依赖：Vue 3、Tailwind（tw- 前缀）、全局组件 oa-icon；props.store 见 ../README.md
-->
<template>
  <div class="tw-h-full tw-flex tw-overflow-hidden tw-bg-slate-100">
    <!-- 侧边导航 -->
    <aside class="tw-w-56 tw-bg-white tw-border-r tw-border-slate-200 tw-flex tw-flex-col tw-shrink-0">
      <div class="tw-px-4 tw-py-4 tw-border-b tw-border-slate-100">
        <div class="tw-flex tw-items-center tw-gap-2.5">
          <div class="tw-w-9 tw-h-9 tw-rounded-xl tw-bg-sky-50 tw-text-sky-600 tw-flex tw-items-center tw-justify-center">
            <oa-icon name="folder" class="tw-w-5 tw-h-5"></oa-icon>
          </div>
          <div class="tw-leading-tight">
            <div class="tw-text-sm tw-font-semibold">文档管理员</div>
            <div class="tw-text-[11px] tw-text-slate-500">{{ me.name }} · 院办公室</div>
          </div>
        </div>
      </div>

      <div class="tw-flex-1 tw-px-3 tw-py-4 tw-overflow-y-auto oa-scroll">
        <div class="tw-text-[11px] tw-text-slate-400 tw-px-2 tw-mb-2 tw-tracking-wide">文档治理</div>
        <button v-for="item in navItems" :key="item.id" @click="go(item.id)"
          :class="['adm-nav tw-w-full tw-flex tw-items-center tw-gap-2.5 tw-px-2.5 tw-py-2 tw-rounded-lg tw-text-[13px] tw-mb-0.5',
                   tab === item.id ? 'tw-bg-sky-50 tw-text-sky-700 tw-font-medium' : 'tw-text-slate-600']">
          <oa-icon :name="item.icon" class="tw-w-4 tw-h-4"></oa-icon>
          <span class="tw-flex-1 tw-text-left">{{ item.label }}</span>
          <span v-if="item.badge" class="tw-min-w-4 tw-h-4 tw-px-1 tw-rounded-full tw-bg-rose-500 tw-text-white tw-text-[10px] tw-flex tw-items-center tw-justify-center">{{ item.badge }}</span>
        </button>

        <div class="tw-mt-6 tw-px-2 tw-py-3 tw-rounded-xl tw-bg-sky-50 tw-border tw-border-sky-100">
          <div class="tw-flex tw-items-center tw-gap-1.5 tw-text-[11px] tw-text-sky-700">
            <span class="tw-w-1.5 tw-h-1.5 tw-rounded-full tw-bg-sky-500"></span>
            最小权限原则
          </div>
          <div class="tw-mt-2 tw-text-[11px] tw-text-sky-800 tw-leading-relaxed">敏感文档、跨部门授权、期限超过 90 天的授权，需提交院办审批后生效。</div>
        </div>
      </div>

      <div class="tw-p-3 tw-border-t tw-border-slate-100">
        <div class="tw-flex tw-items-center tw-gap-2 tw-text-[11px] tw-text-slate-400 tw-px-1">
          <oa-icon name="refresh" class="tw-w-3.5 tw-h-3.5"></oa-icon>
          备份每日 02:00 自动执行
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
        <div v-if="tab === 'library' || tab === 'grants'" class="tw-relative">
          <oa-icon name="search" class="tw-w-4 tw-h-4 tw-text-slate-400 tw-absolute tw-left-3 tw-top-2.5"></oa-icon>
          <input v-model="search" class="adm-input tw-w-64 tw-pl-9 tw-pr-3 tw-py-2 tw-text-sm tw-rounded-lg tw-border tw-border-slate-200 tw-bg-slate-50" placeholder="搜索文档、授权对象或审批单" />
        </div>
        <button v-if="tab === 'library'" @click="openUpload" class="adm-btn-primary tw-flex tw-items-center tw-gap-1.5 tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-text-white">
          <oa-icon name="upload" class="tw-w-4 tw-h-4"></oa-icon>上传文档
        </button>
        <button v-if="tab === 'grants'" @click="openGrant()" class="adm-btn-primary tw-flex tw-items-center tw-gap-1.5 tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-text-white">
          <oa-icon name="plus" class="tw-w-4 tw-h-4"></oa-icon>新增授权
        </button>
        <div class="tw-relative">
          <button @click="notifOpen = !notifOpen" class="adm-icon-btn tw-relative tw-w-9 tw-h-9 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-text-slate-500">
            <oa-icon name="bell" class="tw-w-5 tw-h-5"></oa-icon>
            <span v-if="unread" class="tw-absolute tw-top-1.5 tw-right-1.5 tw-w-2 tw-h-2 tw-rounded-full tw-bg-rose-500 tw-ring-2 tw-ring-white"></span>
          </button>
          <transition name="oa-pop">
            <div v-if="notifOpen" class="tw-absolute tw-right-0 tw-top-11 tw-w-96 tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-shadow-2xl tw-z-30 tw-overflow-hidden">
              <div class="tw-flex tw-items-center tw-justify-between tw-px-4 tw-py-3 tw-border-b tw-border-slate-100">
                <span class="tw-text-sm tw-font-semibold">通知</span>
                <button @click="readAll" class="tw-text-[11px] tw-text-sky-600">全部已读</button>
              </div>
              <div class="tw-max-h-80 tw-overflow-y-auto oa-scroll">
                <div v-for="n in myNotifs" :key="n.id" class="tw-px-4 tw-py-3 tw-border-b tw-border-slate-50 tw-cursor-pointer adm-row" @click="openNotif(n)">
                  <div class="tw-flex tw-items-center tw-gap-2">
                    <span :class="['tw-w-1.5 tw-h-1.5 tw-rounded-full', n.read ? 'tw-bg-slate-200' : 'tw-bg-sky-500']"></span>
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
        <div class="tw-w-8 tw-h-8 tw-rounded-full tw-bg-sky-600 tw-text-white tw-flex tw-items-center tw-justify-center tw-text-xs tw-font-semibold">{{ me.name.slice(0, 1) }}</div>
      </header>

      <div class="tw-flex-1 tw-overflow-y-auto oa-scroll tw-p-6">
        <!-- ==================== 文档库 ==================== -->
        <div v-if="tab === 'library'" class="tw-max-w-6xl tw-mx-auto">
          <div class="tw-flex tw-items-center tw-gap-2 tw-mb-4 tw-flex-wrap">
            <select v-model="catFilter" class="adm-input tw-px-3 tw-py-2 tw-rounded-lg tw-text-[12px] tw-border tw-border-slate-200 tw-bg-white">
              <option value="">全部分类</option>
              <option v-for="c in store.categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <select v-model="classFilter" class="adm-input tw-px-3 tw-py-2 tw-rounded-lg tw-text-[12px] tw-border tw-border-slate-200 tw-bg-white">
              <option value="">全部密级</option>
              <option value="public">公开</option>
              <option value="internal">内部</option>
              <option value="sensitive">敏感</option>
            </select>
            <select v-model="statusFilter" class="adm-input tw-px-3 tw-py-2 tw-rounded-lg tw-text-[12px] tw-border tw-border-slate-200 tw-bg-white">
              <option value="">全部状态</option>
              <option value="ACTIVE">已归档</option>
              <option value="SUBMITTED">审批中</option>
              <option value="DRAFT">草稿</option>
              <option value="RETURNED">被退回</option>
              <option value="EXPIRED">已过期</option>
            </select>
            <div class="tw-flex-1"></div>
            <button @click="toggleBatch" :class="['tw-px-3 tw-py-2 tw-rounded-lg tw-text-[12px] tw-border', batchMode ? 'tw-bg-slate-900 tw-text-white tw-border-slate-900' : 'tw-bg-white tw-text-slate-600 tw-border-slate-200']">
              {{ batchMode ? '退出批量' : '批量操作' }}
            </button>
            <span class="tw-text-[11px] tw-text-slate-400">共 {{ filteredDocs.length }} 份</span>
          </div>

          <div class="tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-overflow-hidden">
            <table class="tw-w-full tw-text-sm">
              <thead><tr class="tw-bg-slate-50 tw-text-[11px] tw-text-slate-500">
                <th v-if="batchMode" class="tw-w-10 tw-px-3 tw-py-2.5"><input type="checkbox" class="tw-w-4 tw-h-4 tw-accent-sky-600" :checked="allSelected" @change="toggleAll" /></th>
                <th class="tw-text-left tw-font-medium tw-px-5 tw-py-2.5">文档</th>
                <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-24">分类</th>
                <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-20">密级</th>
                <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-20">状态</th>
                <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-14">版本</th>
                <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-24">更新时间</th>
                <th class="tw-text-right tw-font-medium tw-px-5 tw-py-2.5 tw-w-36">操作</th>
              </tr></thead>
              <tbody class="tw-divide-y tw-divide-slate-100">
                <tr v-for="doc in filteredDocs" :key="doc.id" class="adm-row">
                  <td v-if="batchMode" class="tw-px-3 tw-py-3"><input type="checkbox" class="tw-w-4 tw-h-4 tw-accent-sky-600" :value="doc.id" v-model="selected" /></td>
                  <td class="tw-px-5 tw-py-3">
                    <div class="tw-flex tw-items-center tw-gap-2">
                      <span class="tw-text-[12px] tw-font-medium tw-cursor-pointer" @click="openDetail(doc)">{{ doc.title }}</span>
                      <span v-if="doc.status === 'EXPIRED'" class="tw-px-1 tw-rounded tw-bg-slate-100 tw-text-slate-500 tw-text-[10px]">过期</span>
                    </div>
                    <div class="tw-text-[10px] tw-text-slate-400 tw-mt-0.5">{{ doc.no }} · {{ doc.deptName }} · 下载 {{ doc.downloads }}</div>
                  </td>
                  <td class="tw-px-3 tw-py-3 tw-text-[11px] tw-text-slate-500">{{ doc.catName.split(' / ')[0] }}</td>
                  <td class="tw-px-3 tw-py-3"><span :class="['tw-px-1.5 tw-py-0.5 tw-rounded tw-text-[10px] tw-border', store.h.classification(doc.classification).cls]">{{ store.h.classification(doc.classification).label }}</span></td>
                  <td class="tw-px-3 tw-py-3"><span :class="['tw-px-1.5 tw-py-0.5 tw-rounded tw-text-[10px] tw-border', store.h.status(doc.status).cls]">{{ store.h.status(doc.status).label }}</span></td>
                  <td class="tw-px-3 tw-py-3 tw-text-[11px] tw-text-slate-500">V{{ doc.version }}</td>
                  <td class="tw-px-3 tw-py-3 tw-text-[10px] tw-text-slate-500">{{ store.h.fmtDate(doc.updatedAt) }}</td>
                  <td class="tw-px-5 tw-py-3">
                    <div class="tw-flex tw-items-center tw-justify-end tw-gap-1">
                      <button class="adm-icon-btn tw-w-7 tw-h-7 tw-rounded-md tw-flex tw-items-center tw-justify-center tw-text-slate-400" title="查看" @click="openDetail(doc)"><oa-icon name="eye" class="tw-w-3.5 tw-h-3.5"></oa-icon></button>
                      <button class="adm-icon-btn tw-w-7 tw-h-7 tw-rounded-md tw-flex tw-items-center tw-justify-center tw-text-slate-400" title="授权" @click="openGrant({ objectType: 'document', objectId: doc.id })"><oa-icon name="key" class="tw-w-3.5 tw-h-3.5"></oa-icon></button>
                      <button v-if="doc.status !== 'ACTIVE'" class="adm-icon-btn tw-w-7 tw-h-7 tw-rounded-md tw-flex tw-items-center tw-justify-center tw-text-slate-400" title="归档" @click="archive(doc)"><oa-icon name="folder" class="tw-w-3.5 tw-h-3.5"></oa-icon></button>
                      <button v-else class="adm-icon-btn tw-w-7 tw-h-7 tw-rounded-md tw-flex tw-items-center tw-justify-center tw-text-slate-400" title="取消归档" @click="unarchive(doc)"><oa-icon name="restore" class="tw-w-3.5 tw-h-3.5"></oa-icon></button>
                      <button class="adm-icon-btn tw-w-7 tw-h-7 tw-rounded-md tw-flex tw-items-center tw-justify-center tw-text-rose-400" title="删除" @click="removeDoc(doc)"><oa-icon name="trash" class="tw-w-3.5 tw-h-3.5"></oa-icon></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="!filteredDocs.length" class="tw-py-16 tw-text-center tw-text-xs tw-text-slate-400">未找到文档</div>
          </div>

          <transition name="oa-toast">
            <div v-if="batchMode && selected.length" class="tw-fixed tw-left-1/2 tw-bottom-8 tw--translate-x-1/2 tw-z-30 tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2.5 tw-rounded-xl tw-bg-slate-900 tw-text-white tw-shadow-2xl">
              <span class="tw-text-[12px] tw-mr-2">已选 {{ selected.length }} 份</span>
              <button class="tw-px-2.5 tw-py-1.5 tw-rounded-lg tw-bg-white/10 tw-text-[11px]" @click="batchArchive">批量归档</button>
              <button class="tw-px-2.5 tw-py-1.5 tw-rounded-lg tw-bg-white/10 tw-text-[11px]" @click="batchGrant">批量授权</button>
              <button class="tw-px-2.5 tw-py-1.5 tw-rounded-lg tw-bg-rose-500/90 tw-text-[11px]" @click="batchDelete">批量删除</button>
              <button class="tw-px-2 tw-py-1.5 tw-rounded-lg tw-text-slate-400 tw-text-[11px]" @click="selected = []">取消</button>
            </div>
          </transition>
        </div>

        <!-- ==================== 分类管理 ==================== -->
        <div v-if="tab === 'categories'" class="tw-max-w-4xl tw-mx-auto">
          <div class="tw-flex tw-items-center tw-justify-between tw-mb-4">
            <div class="tw-text-[12px] tw-text-slate-500">两级分类；有在库文档的分类不可停用，需先迁移或归档。</div>
            <button @click="openCategory()" class="adm-btn-primary tw-flex tw-items-center tw-gap-1.5 tw-px-3 tw-py-2 tw-rounded-lg tw-text-[12px] tw-text-white"><oa-icon name="plus" class="tw-w-4 tw-h-4"></oa-icon>新增分类</button>
          </div>
          <div class="tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-p-4 tw-space-y-3">
            <div v-for="c in store.categories" :key="c.id" class="tw-rounded-xl tw-border tw-border-slate-100">
              <div class="tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-3 tw-bg-slate-50 tw-rounded-t-xl">
                <oa-icon name="folder" class="tw-w-4 tw-h-4 tw-text-sky-600"></oa-icon>
                <span class="tw-text-[13px] tw-font-medium">{{ c.name }}</span>
                <span class="tw-text-[10px] tw-text-slate-400">{{ c.code }} · {{ categoryCount(c.id) }} 份文档</span>
                <div class="tw-flex-1"></div>
                <button class="tw-text-[11px] tw-text-sky-600" @click="openCategory(c)">新增子类</button>
                <button class="tw-text-[11px] tw-text-slate-500" @click="openRename(c)">重命名</button>
                <button class="tw-text-[11px] tw-text-slate-400" @click="moveCategory(c, -1)">上移</button>
                <button class="tw-text-[11px] tw-text-slate-400" @click="moveCategory(c, 1)">下移</button>
              </div>
              <div class="tw-divide-y tw-divide-slate-50">
                <div v-for="child in c.children" :key="child.id" class="tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-2.5 tw-pl-10">
                  <span class="tw-w-1 h-1 tw-rounded-full tw-bg-slate-300"></span>
                  <span class="tw-text-[12px] tw-text-slate-700">{{ child.name }}</span>
                  <span class="tw-text-[10px] tw-text-slate-400">{{ child.code }} · {{ categoryCount(child.id) }} 份</span>
                  <div class="tw-flex-1"></div>
                  <button class="tw-text-[11px] tw-text-slate-500" @click="openRename(child)">重命名</button>
                  <button class="tw-text-[11px] tw-text-slate-400" @click="disableCategory(child)">停用</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================== 授权台账 ==================== -->
        <div v-if="tab === 'grants'" class="tw-max-w-6xl tw-mx-auto tw-space-y-4">
          <div v-if="expiringGrants.length" class="tw-bg-amber-50 tw-border tw-border-amber-200 tw-rounded-xl tw-px-4 tw-py-3">
            <div class="tw-flex tw-items-center tw-gap-2 tw-text-[12px] tw-text-amber-800">
              <oa-icon name="alert" class="tw-w-4 tw-h-4"></oa-icon>
              <span class="tw-font-medium">{{ expiringGrants.length }} 项授权将在 7 天内到期</span>
              <span class="tw-text-amber-600">{{ expiringGrants.map(g => g.subjectName + ' → ' + g.objectName).join('；') }}</span>
            </div>
          </div>

          <div class="tw-flex tw-items-center tw-gap-2">
            <select v-model="grantStatus" class="adm-input tw-px-3 tw-py-2 tw-rounded-lg tw-text-[12px] tw-border tw-border-slate-200 tw-bg-white">
              <option value="">全部状态</option>
              <option value="active">生效中</option>
              <option value="expired">已失效</option>
              <option value="revoked">已收回</option>
            </select>
            <select v-model="grantSubject" class="adm-input tw-px-3 tw-py-2 tw-rounded-lg tw-text-[12px] tw-border tw-border-slate-200 tw-bg-white">
              <option value="">全部对象类型</option>
              <option value="user">按人员</option>
              <option value="dept">按部门</option>
              <option value="role">按角色</option>
            </select>
            <div class="tw-flex-1"></div>
            <button @click="exportLedger" class="adm-btn-ghost tw-flex tw-items-center tw-gap-1.5 tw-px-3 tw-py-2 tw-rounded-lg tw-text-[12px]"><oa-icon name="download" class="tw-w-4 tw-h-4"></oa-icon>导出台账</button>
          </div>

          <div class="tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-overflow-hidden">
            <table class="tw-w-full tw-text-sm">
              <thead><tr class="tw-bg-slate-50 tw-text-[11px] tw-text-slate-500">
                <th class="tw-text-left tw-font-medium tw-px-5 tw-py-2.5">被授权对象</th>
                <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5">授权对象</th>
                <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-24">权限</th>
                <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-24">来源</th>
                <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-32">有效期</th>
                <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-20">状态</th>
                <th class="tw-text-right tw-font-medium tw-px-5 tw-py-2.5 tw-w-20">操作</th>
              </tr></thead>
              <tbody class="tw-divide-y tw-divide-slate-100">
                <tr v-for="g in filteredGrants" :key="g.id" class="adm-row">
                  <td class="tw-px-5 tw-py-3">
                    <div class="tw-text-[12px] tw-font-medium">{{ g.subjectName }}</div>
                    <div class="tw-text-[10px] tw-text-slate-400 tw-mt-0.5">{{ g.subjectType === 'user' ? '人员' : g.subjectType === 'dept' ? '部门' : '角色' }}</div>
                  </td>
                  <td class="tw-px-3 tw-py-3">
                    <div class="tw-text-[12px]">{{ g.objectName }}</div>
                    <div class="tw-text-[10px] tw-text-slate-400 tw-mt-0.5">{{ g.reason }}</div>
                  </td>
                  <td class="tw-px-3 tw-py-3 tw-text-[11px] tw-text-slate-600">{{ store.h.rights(g.rights) }}</td>
                  <td class="tw-px-3 tw-py-3 tw-text-[11px] tw-text-slate-500">{{ g.approvalId ? '审批授予' : '直接授权' }}</td>
                  <td class="tw-px-3 tw-py-3 tw-text-[11px]" :class="isExpiring(g) ? 'tw-text-amber-600' : 'tw-text-slate-500'">
                    {{ store.h.fmtDate(g.validUntil) }}
                    <span v-if="isExpiring(g)" class="tw-ml-1">（{{ store.h.daysLeft(g.validUntil) }} 天）</span>
                  </td>
                  <td class="tw-px-3 tw-py-3"><span :class="['tw-px-2 tw-py-0.5 tw-rounded tw-text-[10px] tw-border', grantStatusMeta(g).cls]">{{ grantStatusMeta(g).label }}</span></td>
                  <td class="tw-px-5 tw-py-3 text-right">
                    <button v-if="g.status === 'active'" class="tw-text-[11px] tw-text-rose-600" @click="revoke(g)">收回</button>
                    <span v-else class="tw-text-[11px] tw-text-slate-300">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="!filteredGrants.length" class="tw-py-16 tw-text-center tw-text-xs tw-text-slate-400">暂无授权记录</div>
          </div>

          <div class="tw-bg-white tw-rounded-xl tw-border tw-border-slate-200">
            <div class="tw-px-5 tw-py-4 tw-border-b tw-border-slate-100 tw-text-sm tw-font-semibold">审批中的授权</div>
            <div class="tw-divide-y tw-divide-slate-50">
              <div v-for="inst in pendingGrantInstances" :key="inst.id" class="tw-px-5 tw-py-3 tw-flex tw-items-center tw-gap-3">
                <span class="tw-px-1.5 tw-py-0.5 tw-rounded tw-bg-amber-50 tw-text-amber-700 tw-text-[10px] tw-border tw-border-amber-200">审批中</span>
                <span class="tw-text-[12px] tw-text-slate-700 tw-flex-1">{{ inst.title }} <span class="tw-text-[10px] tw-text-slate-400 tw-ml-1">{{ inst.no }}</span></span>
                <span class="tw-text-[11px] tw-text-slate-400">当前：{{ inst.nodes[inst.currentNode] ? inst.nodes[inst.currentNode].name : '—' }}</span>
              </div>
              <div v-if="!pendingGrantInstances.length" class="tw-py-8 tw-text-center tw-text-xs tw-text-slate-400">暂无审批中的授权</div>
            </div>
          </div>
        </div>

        <!-- ==================== 回收站 ==================== -->
        <div v-if="tab === 'recycle'" class="tw-max-w-5xl tw-mx-auto">
          <div class="tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-overflow-hidden">
            <table class="tw-w-full tw-text-sm">
              <thead><tr class="tw-bg-slate-50 tw-text-[11px] tw-text-slate-500">
                <th class="tw-text-left tw-font-medium tw-px-5 tw-py-2.5">文档</th>
                <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-28">删除时间</th>
                <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-28">保留至</th>
                <th class="tw-text-right tw-font-medium tw-px-5 tw-py-2.5 tw-w-36">操作</th>
              </tr></thead>
              <tbody class="tw-divide-y tw-divide-slate-100">
                <tr v-for="doc in recycledDocs" :key="doc.id" class="adm-row">
                  <td class="tw-px-5 tw-py-3">
                    <div class="tw-text-[12px] tw-font-medium">{{ doc.title }}</div>
                    <div class="tw-text-[10px] tw-text-slate-400 tw-mt-0.5">{{ doc.no }} · {{ doc.catName }}</div>
                  </td>
                  <td class="tw-px-3 tw-py-3 tw-text-[11px] tw-text-slate-500">{{ store.h.fmtDate(doc.deletedAt) }}</td>
                  <td class="tw-px-3 tw-py-3 tw-text-[11px] tw-text-slate-500">{{ store.h.fmtDate(doc.purgeAt) }}<span class="tw-text-[10px] tw-text-slate-400 tw-ml-1">（{{ store.h.daysLeft(doc.purgeAt) }} 天）</span></td>
                  <td class="tw-px-5 tw-py-3">
                    <div class="tw-flex tw-items-center tw-justify-end tw-gap-2">
                      <button class="tw-text-[11px] tw-text-sky-600" @click="restore(doc)">恢复</button>
                      <button class="tw-text-[11px] tw-text-rose-600" @click="purge(doc)">彻底删除</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="!recycledDocs.length" class="tw-py-16 tw-text-center tw-text-xs tw-text-slate-400">回收站为空</div>
          </div>
          <div class="tw-mt-3 tw-text-[11px] tw-text-slate-400 tw-flex items-center gap-1.5">
            <oa-icon name="info" class="tw-w-3.5 tw-h-3.5"></oa-icon>
            回收站保留 30 天，到期后由系统自动清理；彻底删除仅系统管理员可执行。
          </div>
        </div>

        <!-- ==================== 审批记录 ==================== -->
        <div v-if="tab === 'records'" class="tw-max-w-5xl tw-mx-auto">
          <div class="tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-overflow-hidden">
            <table class="tw-w-full tw-text-sm">
              <thead><tr class="tw-bg-slate-50 tw-text-[11px] tw-text-slate-500">
                <th class="tw-text-left tw-font-medium tw-px-5 tw-py-2.5">审批单</th>
                <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-24">类型</th>
                <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-24">状态</th>
                <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-28">发起人</th>
                <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-28">提交时间</th>
                <th class="tw-text-right tw-font-medium tw-px-5 tw-py-2.5 tw-w-20">操作</th>
              </tr></thead>
              <tbody class="tw-divide-y tw-divide-slate-100">
                <tr v-for="inst in docRelatedInstances" :key="inst.id" class="adm-row">
                  <td class="tw-px-5 tw-py-3">
                    <div class="tw-text-[12px] tw-font-medium">{{ inst.title }}</div>
                    <div class="tw-text-[10px] tw-text-slate-400 tw-mt-0.5">{{ inst.no }}</div>
                  </td>
                  <td class="tw-px-3 tw-py-3 tw-text-[11px] tw-text-slate-500">{{ store.h.type(inst.type).label }}</td>
                  <td class="tw-px-3 tw-py-3"><span :class="['tw-px-2 tw-py-0.5 tw-rounded tw-text-[10px] tw-border', store.h.instStatus(inst.status).cls]">{{ store.h.instStatus(inst.status).label }}</span></td>
                  <td class="tw-px-3 tw-py-3 tw-text-[11px] tw-text-slate-500">{{ inst.creator }}</td>
                  <td class="tw-px-3 tw-py-3 tw-text-[11px] tw-text-slate-500">{{ store.h.fmtDate(inst.submittedAt) }}</td>
                  <td class="tw-px-5 tw-py-3 tw-text-right"><button class="tw-text-[11px] tw-text-sky-600" @click="openInstance(inst)">查看</button></td>
                </tr>
              </tbody>
            </table>
            <div v-if="!docRelatedInstances.length" class="tw-py-16 tw-text-center tw-text-xs tw-text-slate-400">暂无审批记录</div>
          </div>
        </div>

        <!-- ==================== 统计 ==================== -->
        <div v-if="tab === 'stats'" class="tw-max-w-5xl tw-mx-auto tw-space-y-5">
          <div class="tw-grid tw-grid-cols-4 tw-gap-4">
            <div v-for="s in statCards" :key="s.label" class="tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-p-4">
              <div class="tw-text-[11px] tw-text-slate-500">{{ s.label }}</div>
              <div class="tw-mt-2 tw-text-2xl tw-font-semibold">{{ s.value }}</div>
              <div class="tw-mt-1 tw-text-[10px] tw-text-slate-400">{{ s.hint }}</div>
            </div>
          </div>

          <div class="tw-grid tw-grid-cols-3 tw-gap-5">
            <div class="tw-col-span-2 tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-p-5">
              <div class="tw-flex tw-items-center tw-justify-between">
                <div class="tw-text-sm tw-font-semibold">分类文档分布</div>
                <span class="tw-text-[11px] tw-text-slate-400">共 {{ docStats.total }} 份</span>
              </div>
              <div class="tw-mt-5 tw-space-y-4">
                <div v-for="c in categoryStats" :key="c.id">
                  <div class="tw-flex tw-items-center tw-justify-between tw-text-[11px]">
                    <span class="tw-text-slate-600">{{ c.name }}</span>
                    <span class="tw-text-slate-400">{{ c.count }} 份 · 下载 {{ c.downloads }}</span>
                  </div>
                  <div class="tw-mt-1.5 tw-h-2 tw-rounded-full tw-bg-slate-100 tw-overflow-hidden">
                    <div class="tw-h-full tw-rounded-full tw-bg-sky-500" :style="{ width: (c.count / Math.max(1, docStats.total) * 100) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="tw-bg-white tw-rounded-xl tw-border tw-border-slate-200 tw-p-5">
              <div class="tw-text-sm tw-font-semibold">下载 Top 5</div>
              <div class="tw-mt-4 tw-space-y-3">
                <div v-for="(d, i) in topDownloads" :key="d.id" class="tw-flex tw-items-center tw-gap-2">
                  <span class="tw-w-5 tw-h-5 tw-rounded-full tw-bg-slate-100 tw-text-slate-500 tw-text-[10px] tw-flex tw-items-center tw-justify-center">{{ i + 1 }}</span>
                  <span class="tw-text-[11px] tw-text-slate-600 tw-flex-1 tw-truncate">{{ d.title }}</span>
                  <span class="tw-text-[10px] tw-text-slate-400">{{ d.downloads }}</span>
                </div>
              </div>
              <div class="tw-mt-5 tw-pt-4 tw-border-t tw-border-slate-100">
                <div class="tw-text-[11px] tw-text-slate-500 tw-mb-2">即将到期授权</div>
                <div v-for="g in expiringGrants" :key="g.id" class="tw-text-[11px] tw-text-amber-600 tw-flex tw-items-center tw-justify-between tw-py-0.5">
                  <span class="tw-truncate tw-max-w-[150px]">{{ g.subjectName }}</span>
                  <span>{{ store.h.daysLeft(g.validUntil) }} 天</span>
                </div>
                <div v-if="!expiringGrants.length" class="tw-text-[11px] tw-text-slate-400">暂无</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== 文档详情 ==================== -->
    <div v-if="detail" class="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-6">
      <div class="tw-absolute tw-inset-0 tw-bg-slate-900/50" @click="detail = null"></div>
      <div class="tw-relative tw-w-full tw-max-w-4xl tw-max-h-[88vh] tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-flex tw-flex-col tw-overflow-hidden">
        <div class="tw-flex tw-items-start tw-gap-3 tw-px-5 tw-py-4 tw-border-b tw-border-slate-100 tw-shrink-0">
          <div :class="['tw-w-10 tw-h-10 tw-rounded-xl tw-flex tw-items-center tw-justify-center', detail.classification === 'sensitive' ? 'tw-bg-rose-50 tw-text-rose-600' : 'tw-bg-sky-50 tw-text-sky-600']">
            <oa-icon :name="detail.classification === 'sensitive' ? 'lock' : 'docs'" class="tw-w-5 tw-h-5"></oa-icon>
          </div>
          <div class="tw-flex-1 min-w-0">
            <div class="tw-flex tw-items-center tw-gap-2">
              <span class="tw-text-sm tw-font-semibold">{{ detail.title }}</span>
              <span :class="['tw-px-1.5 tw-py-0.5 tw-rounded tw-text-[10px] tw-border', store.h.classification(detail.classification).cls]">{{ store.h.classification(detail.classification).label }}</span>
              <span :class="['tw-px-1.5 tw-py-0.5 tw-rounded tw-text-[10px] tw-border', store.h.status(detail.status).cls]">{{ store.h.status(detail.status).label }}</span>
            </div>
            <div class="tw-text-[11px] tw-text-slate-500 tw-mt-1">{{ detail.no }} · {{ detail.catName }} · 当前 V{{ detail.version }} · 所有者 {{ detail.owner }}</div>
          </div>
          <div class="tw-flex tw-items-center tw-gap-2">
            <button @click="openVersion(detail)" class="adm-btn-ghost tw-px-2.5 tw-py-1.5 tw-rounded-lg tw-text-[11px]">上传新版本</button>
            <button @click="openGrant({ objectType: 'document', objectId: detail.id })" class="adm-btn-ghost tw-px-2.5 tw-py-1.5 tw-rounded-lg tw-text-[11px]">授权</button>
            <button v-if="detail.status !== 'ACTIVE'" @click="archive(detail)" class="tw-px-2.5 tw-py-1.5 tw-rounded-lg tw-text-[11px] tw-text-white tw-bg-sky-600">归档</button>
            <button v-else @click="unarchive(detail)" class="adm-btn-ghost tw-px-2.5 tw-py-1.5 tw-rounded-lg tw-text-[11px]">取消归档</button>
            <button class="adm-icon-btn tw-w-8 tw-h-8 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-text-slate-400" @click="detail = null"><oa-icon name="x" class="tw-w-4 tw-h-4"></oa-icon></button>
          </div>
        </div>

        <div class="tw-flex tw-items-center tw-gap-1 tw-px-5 tw-border-b tw-border-slate-100 tw-shrink-0">
          <button v-for="t in detailTabs" :key="t.id" @click="detailTab = t.id"
            :class="['tw-px-3 tw-py-2.5 tw-text-[12px] tw-border-b tw-border-0', detailTab === t.id ? 'tw-text-sky-700 tw-border-b-2 tw-border-sky-600 tw-font-medium' : 'tw-text-slate-500']">{{ t.label }}</button>
        </div>

        <div class="tw-flex-1 tw-overflow-y-auto oa-scroll tw-p-5">
          <!-- 概览 -->
          <div v-if="detailTab === 'overview'" class="tw-grid tw-grid-cols-2 tw-gap-5">
            <div class="tw-space-y-3">
              <div class="tw-text-[11px] tw-text-slate-400">基本信息</div>
              <div class="tw-rounded-xl tw-border tw-border-slate-100 tw-divide-y tw-divide-slate-50 tw-text-[12px]">
                <div class="tw-flex tw-px-4 tw-py-2.5"><span class="tw-w-24 tw-text-slate-500">所属分类</span><span class="tw-flex-1">{{ detail.catName }}</span></div>
                <div class="tw-flex tw-px-4 tw-py-2.5"><span class="tw-w-24 tw-text-slate-500">归属部门</span><span class="tw-flex-1">{{ detail.deptName }}</span></div>
                <div class="tw-flex tw-px-4 tw-py-2.5"><span class="tw-w-24 tw-text-slate-500">可见范围</span><span class="tw-flex-1">{{ store.h.visibility(detail.visibility) }}</span></div>
                <div class="tw-flex tw-px-4 tw-py-2.5"><span class="tw-w-24 tw-text-slate-500">文件类型</span><span class="tw-flex-1">{{ detail.fileType }} · {{ detail.size }}</span></div>
                <div class="tw-flex tw-px-4 tw-py-2.5"><span class="tw-w-24 tw-text-slate-500">归档时间</span><span class="tw-flex-1">{{ store.h.fmtDateTime(detail.archivedAt) }}</span></div>
                <div class="tw-flex tw-px-4 tw-py-2.5"><span class="tw-w-24 tw-text-slate-500">有效期至</span><span class="tw-flex-1">{{ store.h.fmtDate(detail.validUntil) }}</span></div>
                <div class="tw-flex tw-px-4 tw-py-2.5"><span class="tw-w-24 tw-text-slate-500">下载次数</span><span class="tw-flex-1">{{ detail.downloads }}</span></div>
              </div>
            </div>
            <div class="tw-space-y-3">
              <div class="tw-text-[11px] tw-text-slate-400">摘要</div>
              <div class="tw-text-[12px] tw-text-slate-700 tw-leading-relaxed tw-p-4 tw-rounded-xl tw-bg-slate-50">{{ detail.summary }}</div>
              <div class="tw-text-[11px] tw-text-slate-400">关联审批</div>
              <div v-if="detail.approvalId && store.instanceById(detail.approvalId)" class="tw-rounded-xl tw-border tw-border-slate-100 tw-p-3 tw-flex tw-items-center tw-gap-2">
                <oa-icon name="clipboard" class="tw-w-4 tw-h-4 tw-text-slate-400"></oa-icon>
                <span class="tw-text-[12px] tw-flex-1">{{ store.instanceById(detail.approvalId).title }}</span>
                <span :class="['tw-px-1.5 tw-py-0.5 tw-rounded tw-text-[10px] tw-border', store.h.instStatus(store.instanceById(detail.approvalId).status).cls]">{{ store.h.instStatus(store.instanceById(detail.approvalId).status).label }}</span>
              </div>
              <div v-else class="tw-text-[12px] tw-text-slate-400">无关联审批</div>
            </div>
          </div>

          <!-- 版本 -->
          <div v-if="detailTab === 'versions'">
            <table class="tw-w-full tw-text-sm">
              <thead><tr class="tw-bg-slate-50 tw-text-[11px] tw-text-slate-500">
                <th class="tw-text-left tw-font-medium tw-px-4 tw-py-2.5 tw-w-16">版本</th>
                <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5">文件</th>
                <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-20">大小</th>
                <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-24">上传人</th>
                <th class="tw-text-left tw-font-medium tw-px-3 tw-py-2.5 tw-w-28">时间</th>
                <th class="tw-text-right tw-font-medium tw-px-4 tw-py-2.5 tw-w-24">操作</th>
              </tr></thead>
              <tbody class="tw-divide-y tw-divide-slate-100">
                <tr v-for="v in detail.versions.slice().reverse()" :key="v.no">
                  <td class="tw-px-4 tw-py-3 tw-text-[12px]">V{{ v.no }}<span v-if="v.no === detail.version" class="tw-ml-1 tw-px-1 tw-rounded tw-bg-emerald-50 tw-text-emerald-600 tw-text-[10px]">当前</span></td>
                  <td class="tw-px-3 tw-py-3 tw-text-[12px] text-slate-700">{{ v.name }}<div class="tw-text-[10px] tw-text-slate-400 tw-mt-0.5">{{ v.note }}</div></td>
                  <td class="tw-px-3 tw-py-3 tw-text-[11px] tw-text-slate-500">{{ v.size }}</td>
                  <td class="tw-px-3 tw-py-3 tw-text-[11px] tw-text-slate-500">{{ v.by }}</td>
                  <td class="tw-px-3 tw-py-3 tw-text-[11px] tw-text-slate-500">{{ store.h.fmtDate(v.at) }}</td>
                  <td class="tw-px-4 tw-py-3 text-right">
                    <button class="tw-text-[11px] tw-text-slate-500 mr-2" @click="store.toast('下载历史版本（演示）：' + v.name, 'info')">下载</button>
                    <button v-if="v.no !== detail.version" class="tw-text-[11px] tw-text-sky-600" @click="rollback(v)">回滚</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 授权 -->
          <div v-if="detailTab === 'grants'">
            <div class="tw-flex justify-end mb-3">
              <button @click="openGrant({ objectType: 'document', objectId: detail.id })" class="adm-btn-primary tw-px-3 tw-py-1.5 tw-rounded-lg tw-text-[11px] tw-text-white">新增授权</button>
            </div>
            <div v-for="g in docGrants" :key="g.id" class="tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-3 tw-rounded-xl tw-border tw-border-slate-100 tw-mb-2">
              <div class="tw-w-9 tw-h-9 tw-rounded-lg tw-bg-slate-100 tw-text-slate-500 tw-flex tw-items-center tw-justify-center"><oa-icon name="user" class="tw-w-4 tw-h-4"></oa-icon></div>
              <div class="tw-flex-1">
                <div class="tw-text-[12px] tw-font-medium">{{ g.subjectName }}</div>
                <div class="tw-text-[10px] tw-text-slate-400 tw-mt-0.5">{{ store.h.rights(g.rights) }} · {{ g.reason }} · 至 {{ store.h.fmtDate(g.validUntil) }}</div>
              </div>
              <span :class="['tw-px-2 tw-py-0.5 tw-rounded tw-text-[10px] tw-border', grantStatusMeta(g).cls]">{{ grantStatusMeta(g).label }}</span>
              <button v-if="g.status === 'active'" class="tw-text-[11px] tw-text-rose-600" @click="revoke(g)">收回</button>
            </div>
            <div v-if="!docGrants.length" class="tw-py-10 tw-text-center tw-text-xs tw-text-slate-400">暂无授权</div>
          </div>

          <!-- 时间线 -->
          <div v-if="detailTab === 'timeline'" class="tw-space-y-3">
            <div v-for="(t, i) in detail.timeline" :key="i" class="tw-flex tw-gap-3">
              <div class="tw-flex tw-flex-col tw-items-center tw-w-4 tw-shrink-0">
                <span class="tw-w-2 tw-h-2 tw-rounded-full tw-bg-sky-500 tw-mt-1.5"></span>
                <span v-if="i < detail.timeline.length - 1" class="tw-w-px tw-flex-1 tw-bg-slate-200 tw-my-1"></span>
              </div>
              <div class="tw-flex-1 tw-pb-2">
                <div class="tw-text-[12px] tw-text-slate-700"><span class="tw-font-medium">{{ t.actor }}</span> {{ t.action }}<span v-if="t.note" class="tw-text-slate-500">：{{ t.note }}</span></div>
                <div class="tw-text-[10px] tw-text-slate-400 tw-mt-0.5">{{ store.h.fmtDateTime(t.at) }}</div>
              </div>
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
            <div class="tw-text-[11px] tw-text-slate-500 tw-mt-0.5">文档管理员可直接设置归属部门、密级与有效期</div>
          </div>
          <button class="tw-w-8 tw-h-8 tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-text-slate-400 adm-icon-btn" @click="uploadOpen = false"><oa-icon name="x" class="tw-w-4 tw-h-4"></oa-icon></button>
        </div>
        <div class="tw-p-5 tw-space-y-4">
          <div class="adm-drop tw-rounded-xl tw-border tw-border-dashed tw-border-slate-300 tw-bg-slate-50 tw-px-4 tw-py-5 tw-text-center tw-cursor-pointer" @click="$refs.fileInput.click()">
            <input ref="fileInput" type="file" class="tw-hidden" @change="onFile" />
            <oa-icon name="upload" class="tw-w-6 tw-h-6 tw-text-sky-500 tw-mx-auto"></oa-icon>
            <div v-if="!upload.fileName" class="tw-mt-2 tw-text-[12px] tw-text-slate-600">点击选择文件</div>
            <div v-else class="tw-mt-2 tw-text-[12px] tw-text-slate-800 tw-font-medium">{{ upload.fileName }} <span class="tw-text-slate-400 tw-font-normal">（{{ upload.size }}）</span></div>
            <div class="tw-mt-1 tw-text-[10px] tw-text-slate-400">单文件不超过 50 MB</div>
          </div>
          <div class="tw-grid tw-grid-cols-2 tw-gap-4">
            <div class="tw-col-span-2"><label class="adm-label">文档标题 <span class="tw-text-rose-500">*</span></label><input v-model="upload.title" class="adm-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200" placeholder="请输入文档标题" /></div>
            <div><label class="adm-label">所属分类 <span class="tw-text-rose-500">*</span></label>
              <select v-model="upload.cat" class="adm-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200 tw-bg-white">
                <option value="">请选择</option>
                <option v-for="c in store.leafCategories()" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div><label class="adm-label">归属部门</label>
              <select v-model="upload.dept" class="adm-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200 tw-bg-white">
                <option v-for="d in store.depts" :key="d.id" :value="d.id">{{ d.name }}</option>
              </select>
            </div>
            <div><label class="adm-label">密级</label>
              <select v-model="upload.classification" class="adm-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200 tw-bg-white">
                <option value="public">公开</option><option value="internal">内部</option><option value="sensitive">敏感</option>
              </select>
            </div>
            <div><label class="adm-label">有效期至</label><input type="date" v-model="upload.validUntil" class="adm-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200" /></div>
            <div class="tw-col-span-2"><label class="adm-label">摘要</label><textarea v-model="upload.summary" rows="2" class="adm-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200" placeholder="文档内容与用途"></textarea></div>
          </div>
        </div>
        <div class="tw-flex tw-items-center tw-justify-end tw-gap-2 tw-px-5 tw-py-4 tw-bg-slate-50">
          <button @click="uploadOpen = false" class="adm-btn-ghost tw-px-4 tw-py-2 tw-rounded-lg tw-text-[12px]">取消</button>
          <button @click="submitUpload" class="adm-btn-primary tw-px-4 tw-py-2 tw-rounded-lg tw-text-[12px] tw-text-white">上传并保存</button>
        </div>
      </div>
    </div>

    <!-- ==================== 新增/编辑分类 ==================== -->
    <div v-if="categoryModal" class="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-6">
      <div class="tw-absolute tw-inset-0 tw-bg-slate-900/50" @click="categoryModal = null"></div>
      <div class="tw-relative tw-w-full tw-max-w-md tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-overflow-hidden">
        <div class="tw-px-5 tw-py-4 tw-border-b tw-border-slate-100">
          <div class="tw-text-sm tw-font-semibold">{{ categoryEditing ? '编辑分类' : '新增分类' }}</div>
        </div>
        <div class="tw-p-5 tw-space-y-4">
          <div v-if="!categoryEditing && categoryParent !== null">
            <label class="adm-label">上级分类</label>
            <div class="tw-text-[13px] tw-text-slate-700">{{ categoryParent ? store.catName(categoryParent).split(' / ')[0] : '新增顶级分类' }}</div>
          </div>
          <div><label class="adm-label">分类名称</label><input v-model="categoryForm.name" class="adm-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200" placeholder="如：实验室管理" /></div>
          <div><label class="adm-label">分类编码</label><input v-model="categoryForm.code" class="adm-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200" placeholder="如：ZD-SYS" /></div>
        </div>
        <div class="tw-flex tw-items-center tw-justify-end tw-gap-2 tw-px-5 tw-py-4 tw-bg-slate-50">
          <button @click="categoryModal = null" class="adm-btn-ghost tw-px-4 tw-py-2 tw-rounded-lg tw-text-[12px]">取消</button>
          <button @click="saveCategory" class="adm-btn-primary tw-px-4 tw-py-2 tw-rounded-lg tw-text-[12px] tw-text-white">保存</button>
        </div>
      </div>
    </div>

    <!-- ==================== 新增授权 ==================== -->
    <div v-if="grantOpen" class="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-6">
      <div class="tw-absolute tw-inset-0 tw-bg-slate-900/50" @click="grantOpen = false"></div>
      <div class="tw-relative tw-w-full tw-max-w-lg tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-overflow-hidden">
        <div class="tw-px-5 tw-py-4 tw-border-b tw-border-slate-100">
          <div class="tw-text-sm tw-font-semibold">新增授权</div>
          <div class="tw-text-[11px] tw-text-slate-500 tw-mt-0.5">敏感文档、跨部门、期限超过 90 天将自动提交审批</div>
        </div>
        <div class="tw-p-5 tw-space-y-4">
          <div class="tw-grid tw-grid-cols-2 tw-gap-3">
            <div><label class="adm-label">授权类型</label>
              <select v-model="grantForm.objectType" class="adm-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200 tw-bg-white">
                <option value="document">按文档</option><option value="category">按分类</option>
              </select>
            </div>
            <div><label class="adm-label">授权对象</label>
              <select v-if="grantForm.objectType === 'document'" v-model="grantForm.objectId" class="adm-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200 tw-bg-white">
                <option value="">选择文档</option>
                <option v-for="d in store.docs" :key="d.id" :value="d.id">{{ d.title }}</option>
              </select>
              <select v-else v-model="grantForm.objectId" class="adm-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200 tw-bg-white">
                <option value="">选择分类</option>
                <option v-for="c in store.categories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
          </div>
          <div class="tw-grid tw-grid-cols-2 tw-gap-3">
            <div><label class="adm-label">被授权类型</label>
              <select v-model="grantForm.subjectType" class="adm-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200 tw-bg-white">
                <option value="user">人员</option><option value="dept">部门</option><option value="role">角色</option>
              </select>
            </div>
            <div><label class="adm-label">被授权对象</label>
              <select v-if="grantForm.subjectType === 'user'" v-model="grantForm.subjectId" class="adm-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200 tw-bg-white">
                <option value="">选择人员</option>
                <option v-for="u in store.users" :key="u.account" :value="u.account">{{ u.name }}（{{ u.deptName }}）</option>
              </select>
              <select v-else-if="grantForm.subjectType === 'dept'" v-model="grantForm.subjectId" class="adm-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200 tw-bg-white">
                <option value="">选择部门</option>
                <option v-for="d in store.depts" :key="d.id" :value="d.id">{{ d.name }}</option>
              </select>
              <select v-else v-model="grantForm.subjectId" class="adm-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200 tw-bg-white">
                <option value="">选择角色</option>
                <option value="staff">普通用户</option><option value="approver">审批人</option><option value="docadmin">文档管理员</option>
              </select>
            </div>
          </div>
          <div>
            <label class="adm-label">权限项</label>
            <div class="tw-flex tw-gap-2">
              <button v-for="r in rightOptions" :key="r.id" @click="toggleRight(r.id)"
                :class="['tw-flex-1 tw-px-3 tw-py-2 tw-rounded-lg tw-text-[12px] tw-border', grantForm.rights.indexOf(r.id) >= 0 ? 'tw-bg-sky-50 tw-text-sky-700 tw-border-sky-300' : 'tw-bg-white tw-text-slate-600 tw-border-slate-200']">{{ r.label }}</button>
            </div>
          </div>
          <div class="tw-grid tw-grid-cols-2 tw-gap-3">
            <div><label class="adm-label">授权期限</label>
              <select v-model.number="grantForm.days" class="adm-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200 tw-bg-white">
                <option :value="7">7 天</option><option :value="30">30 天</option><option :value="60">60 天</option><option :value="90">90 天</option><option :value="180">180 天（需审批）</option>
              </select>
            </div>
            <div><label class="adm-label">审批提示</label><div class="tw-text-[11px] tw-mt-2" :class="grantNeedsApproval ? 'tw-text-amber-600' : 'tw-text-emerald-600'">{{ grantNeedsApproval ? '将提交院办审批后生效' : '保存后立即生效' }}</div></div>
          </div>
          <div><label class="adm-label">授权用途 <span class="tw-text-rose-500">*</span></label><textarea v-model="grantForm.reason" rows="2" class="adm-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200" placeholder="说明授权原因与使用场景"></textarea></div>
        </div>
        <div class="tw-flex tw-items-center tw-justify-end tw-gap-2 tw-px-5 tw-py-4 tw-bg-slate-50">
          <button @click="grantOpen = false" class="adm-btn-ghost tw-px-4 tw-py-2 tw-rounded-lg tw-text-[12px]">取消</button>
          <button @click="submitGrant" class="adm-btn-primary tw-px-4 tw-py-2 tw-rounded-lg tw-text-[12px] tw-text-white">{{ grantNeedsApproval ? '提交审批' : '确认授权' }}</button>
        </div>
      </div>
    </div>

    <!-- ==================== 上传新版本 ==================== -->
    <div v-if="versionDoc" class="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-6">
      <div class="tw-absolute tw-inset-0 tw-bg-slate-900/50" @click="versionDoc = null"></div>
      <div class="tw-relative tw-w-full tw-max-w-md tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-overflow-hidden">
        <div class="tw-px-5 tw-py-4 tw-border-b tw-border-slate-100">
          <div class="tw-text-sm tw-font-semibold">上传新版本</div>
          <div class="tw-text-[11px] tw-text-slate-500 tw-mt-0.5">{{ versionDoc.title }} · 当前 V{{ versionDoc.version }}</div>
        </div>
        <div class="tw-p-5 tw-space-y-4">
          <div class="adm-drop tw-rounded-xl tw-border tw-border-dashed tw-border-slate-300 tw-bg-slate-50 tw-px-4 tw-py-5 tw-text-center tw-cursor-pointer" @click="$refs.versionInput.click()">
            <input ref="versionInput" type="file" class="tw-hidden" @change="onVersionFile" />
            <oa-icon name="upload" class="tw-w-6 tw-h-6 tw-text-sky-500 tw-mx-auto"></oa-icon>
            <div v-if="!versionForm.fileName" class="tw-mt-2 tw-text-[12px] tw-text-slate-600">选择新版本文件</div>
            <div v-else class="tw-mt-2 tw-text-[12px] tw-text-slate-800 tw-font-medium">{{ versionForm.fileName }}</div>
          </div>
          <div><label class="adm-label">变更说明 <span class="tw-text-rose-500">*</span></label><textarea v-model="versionForm.note" rows="2" class="adm-input tw-w-full tw-px-3 tw-py-2 tw-rounded-lg tw-text-[13px] tw-border tw-border-slate-200" placeholder="说明本次修改内容"></textarea></div>
        </div>
        <div class="tw-flex tw-items-center tw-justify-end tw-gap-2 tw-px-5 tw-py-4 tw-bg-slate-50">
          <button @click="versionDoc = null" class="adm-btn-ghost tw-px-4 tw-py-2 tw-rounded-lg tw-text-[12px]">取消</button>
          <button @click="submitVersion" class="adm-btn-primary tw-px-4 tw-py-2 tw-rounded-lg tw-text-[12px] tw-text-white">保存新版本</button>
        </div>
      </div>
    </div>

    <!-- ==================== 审批实例只读 ==================== -->
    <div v-if="instanceModal" class="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-p-6">
      <div class="tw-absolute tw-inset-0 tw-bg-slate-900/50" @click="instanceModal = null"></div>
      <div class="tw-relative tw-w-full tw-max-w-2xl tw-max-h-[86vh] tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-flex tw-flex-col tw-overflow-hidden">
        <div class="tw-flex tw-items-center tw-gap-2 tw-px-5 tw-py-4 tw-border-b tw-border-slate-100">
          <span class="tw-text-sm tw-font-semibold tw-flex-1">{{ instanceModal.title }}</span>
          <span :class="['tw-px-1.5 tw-py-0.5 tw-rounded tw-text-[10px] tw-border', store.h.instStatus(instanceModal.status).cls]">{{ store.h.instStatus(instanceModal.status).label }}</span>
          <button class="tw-text-slate-400" @click="instanceModal = null"><oa-icon name="x" class="tw-w-4 tw-h-4"></oa-icon></button>
        </div>
        <div class="tw-flex-1 tw-overflow-y-auto oa-scroll tw-p-5 tw-space-y-4">
          <div class="tw-rounded-xl tw-border tw-border-slate-100 tw-divide-y tw-divide-slate-50 tw-text-[12px]">
            <div v-for="(f, i) in instanceModal.form" :key="i" class="tw-flex tw-px-4 tw-py-2.5"><span class="tw-w-24 tw-text-slate-500 tw-shrink-0">{{ f.label }}</span><span class="tw-flex-1">{{ f.value }}</span></div>
          </div>
          <div>
            <div class="tw-text-[11px] tw-text-slate-400 tw-mb-2">流程</div>
            <div v-for="(node, i) in instanceModal.nodes" :key="node.id" class="tw-flex tw-items-center tw-gap-2 tw-py-1.5">
              <span :class="['tw-w-5 tw-h-5 tw-rounded-full tw-text-[10px] tw-flex tw-items-center tw-justify-center', node.status === 'approved' ? 'tw-bg-emerald-500 tw-text-white' : node.status === 'pending' ? 'tw-bg-amber-500 tw-text-white' : 'tw-bg-slate-200 tw-text-slate-500']">{{ i + 1 }}</span>
              <span class="tw-text-[12px] tw-text-slate-700">{{ node.name }}</span>
              <span class="tw-text-[11px] tw-text-slate-400">{{ node.tasks.map(t => t.name + '·' + taskLabel(t.status)).join('、') }}</span>
            </div>
          </div>
          <div>
            <div class="tw-text-[11px] tw-text-slate-400 tw-mb-2">记录</div>
            <div v-for="(h, i) in instanceModal.history.slice().reverse()" :key="i" class="tw-text-[11px] tw-text-slate-500 tw-py-1">
              <span class="tw-text-slate-400 tw-mr-2">{{ store.h.fmtDateTime(h.at) }}</span>{{ h.actor }} {{ h.action }}<span v-if="h.comment">：{{ h.comment }}</span>
            </div>
          </div>
        </div>
        <div class="tw-flex justify-end tw-px-5 tw-py-3.5 tw-bg-slate-50">
          <button @click="instanceModal = null" class="adm-btn-primary tw-px-4 tw-py-2 tw-rounded-lg tw-text-[12px] tw-text-white">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DocAdminPanel",
  props: { store: { type: Object, required: true } },
  data() {
    return {
      tab: "library",
      search: "",
      catFilter: "",
      classFilter: "",
      statusFilter: "",
      batchMode: false,
      selected: [],
      notifOpen: false,
      detail: null,
      detailTab: "overview",
      uploadOpen: false,
      grantOpen: false,
      categoryModal: null,
      categoryParent: null,
      categoryEditing: null,
      versionDoc: null,
      instanceModal: null,
      upload: {},
      grantForm: {},
      categoryForm: { name: "", code: "" },
      versionForm: { fileName: "", note: "" },
      grantStatus: "",
      grantSubject: "",
      rightOptions: [
        { id: "view", label: "查看" },
        { id: "download", label: "下载" },
        { id: "edit", label: "编辑" }
      ],
      detailTabs: [
        { id: "overview", label: "概览" },
        { id: "versions", label: "版本" },
        { id: "grants", label: "授权" },
        { id: "timeline", label: "操作时间线" }
      ]
    };
  },
  computed: {
    me() { return this.store.persona.docadmin; },
    navItems() {
      return [
        { id: "library", label: "文档库", icon: "docs", badge: 0 },
        { id: "categories", label: "分类管理", icon: "folder", badge: 0 },
        { id: "grants", label: "授权台账", icon: "key", badge: this.pendingGrantInstances.length },
        { id: "recycle", label: "回收站", icon: "trash", badge: this.recycledDocs.length },
        { id: "records", label: "审批记录", icon: "clipboard", badge: 0 },
        { id: "stats", label: "统计分析", icon: "chart", badge: 0 }
      ];
    },
    pageTitle() {
      return { library: "文档库", categories: "分类管理", grants: "授权台账", recycle: "回收站", records: "审批记录", stats: "统计分析" }[this.tab];
    },
    pageSubtitle() {
      return {
        library: "全院文档的归档、版本、授权与清理",
        categories: "维护两级分类与分类编码",
        grants: "查看、授予与收回文档使用权限",
        recycle: "删除文档保留 30 天，可恢复",
        records: "与文档相关的归档、权限与下载审批",
        stats: "文档分布、下载热度与授权到期"
      }[this.tab];
    },
    filteredDocs() {
      let list = this.store.docs.filter(d => d.status !== "DELETED" && d.status !== "RECYCLED");
      if (this.catFilter) list = list.filter(d => d.cat.indexOf(this.catFilter) === 0);
      if (this.classFilter) list = list.filter(d => d.classification === this.classFilter);
      if (this.statusFilter) list = list.filter(d => d.status === this.statusFilter);
      if (this.search) {
        const q = this.search.toLowerCase();
        list = list.filter(d => (d.title + d.no + d.owner).toLowerCase().indexOf(q) >= 0);
      }
      return list;
    },
    recycledDocs() { return this.store.docs.filter(d => d.status === "RECYCLED"); },
    allSelected() { return this.filteredDocs.length > 0 && this.filteredDocs.every(d => this.selected.indexOf(d.id) >= 0); },
    filteredGrants() {
      let list = this.store.grants.slice();
      if (this.grantStatus) list = list.filter(g => g.status === this.grantStatus);
      if (this.grantSubject) list = list.filter(g => g.subjectType === this.grantSubject);
      if (this.search) {
        const q = this.search.toLowerCase();
        list = list.filter(g => (g.subjectName + g.objectName + (g.reason || "")).toLowerCase().indexOf(q) >= 0);
      }
      return list;
    },
    expiringGrants() { return this.store.expiringGrants(7); },
    pendingGrantInstances() { return this.store.instances.filter(i => i.type === "PERM_GRANT" && i.status === "RUNNING"); },
    docRelatedInstances() { return this.store.instances.filter(i => ["DOC_ARCHIVE", "PERM_GRANT", "SENSITIVE_DOWNLOAD"].indexOf(i.type) >= 0); },
    unread() { return this.store.unreadFor(this.me.account); },
    myNotifs() { return this.store.notificationsFor(this.me.account).slice(0, 8); },
    docStats() { return this.store.docStats(); },
    categoryStats() { return this.store.categoryStats(); },
    topDownloads() { return this.store.topDownloads(5); },
    statCards() {
      const s = this.docStats;
      return [
        { label: "在库文档", value: s.total, hint: "含审批中与已过期" },
        { label: "已归档", value: s.active, hint: "正式库可检索" },
        { label: "敏感文档", value: s.sensitive, hint: "需授权访问" },
        { label: "累计下载", value: s.downloads, hint: "含审批下载" }
      ];
    },
    docGrants() { return this.detail ? this.store.grants.filter(g => (g.objectType === "document" && g.objectId === this.detail.id) || (g.objectType === "category" && this.detail.cat.indexOf(g.objectId) === 0)) : []; },
    grantNeedsApproval() {
      const f = this.grantForm;
      if (!f.objectId) return false;
      const doc = f.objectType === "document" ? this.store.docById(f.objectId) : null;
      const categoryDocs = f.objectType === "category"
        ? this.store.docs.filter(d => d.cat.indexOf(f.objectId) === 0) : [];
      const sensitive = doc ? doc.classification === "sensitive" : categoryDocs.some(d => d.classification === "sensitive");
      const crossDept = f.subjectType === "dept" && (doc ? doc.dept !== f.subjectId : true);
      return Boolean(sensitive || crossDept || Number(f.days) > 90);
    }
  },
  watch: {
    "store.intent.seq"() { this.applyIntent(); }
  },
  mounted() {
    this.resetUpload();
    this.resetGrant();
    this.applyIntent();
  },
  methods: {
    go(tab) { this.tab = tab; this.detail = null; this.notifOpen = false; },
    applyIntent() {
      const it = this.store.intent;
      if (!it || it.role !== "docadmin") return;
      if (it.seq === this._lastSeq) return;
      this._lastSeq = it.seq;
      if (it.tab) this.tab = ["library", "categories", "grants", "recycle", "records", "stats"].indexOf(it.tab) >= 0 ? it.tab : "library";
      if (it.action === "batch") {
        this.tab = "library";
        this.batchMode = true;
        this.selected = this.store.docs.filter(d => d.status === "ACTIVE").slice(0, 2).map(d => d.id);
      }
      if (it.docId) {
        const doc = this.store.docById(it.docId);
        if (doc) {
          this.openDetail(doc);
          if (it.action === "versions") this.detailTab = "versions";
        }
      }
      if (it.action === "newGrant") this.openGrant();
      if (it.action === "crossDept") {
        this.tab = "grants";
        this.openGrant({
          objectType: "category", objectId: "CAT-YW", subjectType: "dept", subjectId: "D02",
          rights: ["view", "download"], days: 60, reason: "科研办公室因项目结题材料核对，需跨部门调阅业务文档。"
        });
      }
    },
    isExpiring(g) {
      const left = this.store.h.daysLeft(g.validUntil);
      return g.status === "active" && left !== null && left >= 0 && left <= 7;
    },
    grantStatusMeta(g) {
      if (g.status === "revoked") return { label: "已收回", cls: "tw-bg-slate-100 tw-text-slate-500 tw-border-slate-200" };
      if (g.status === "used") return { label: "已使用", cls: "tw-bg-slate-100 tw-text-slate-500 tw-border-slate-200" };
      if (g.status !== "active" || new Date(g.validUntil).getTime() < Date.now()) return { label: "已失效", cls: "tw-bg-slate-100 tw-text-slate-500 tw-border-slate-200" };
      return { label: "生效中", cls: "tw-bg-emerald-50 tw-text-emerald-700 tw-border-emerald-200" };
    },
    taskLabel(status) {
      return { pending: "待处理", approved: "已同意", returned: "已退回", rejected: "已驳回", waiting: "待流转", cancelled: "已取消" }[status] || status;
    },
    categoryCount(id) {
      if (id.indexOf("CAT-") === 0) return this.store.docs.filter(d => d.cat.indexOf(id) === 0 && d.status !== "DELETED").length;
      return this.store.docs.filter(d => d.cat === id && d.status !== "DELETED").length;
    },
    toggleBatch() {
      this.batchMode = !this.batchMode;
      if (!this.batchMode) this.selected = [];
    },
    toggleAll(e) { this.selected = e.target.checked ? this.filteredDocs.map(d => d.id) : []; },
    openDetail(doc) { this.detail = doc; this.detailTab = "overview"; },
    archive(doc) {
      this.store.confirm({ title: "归档文档", text: "《" + doc.title + "》将进入正式库并按可见范围可检索。" }).then(ok => {
        if (!ok) return;
        this.store.archiveDoc(doc.id, this.me.name);
        this.store.toast("已归档《" + doc.title + "》。");
      });
    },
    unarchive(doc) {
      this.store.confirm({ title: "取消归档", text: "《" + doc.title + "》将恢复为草稿状态，确定继续？", danger: true }).then(ok => {
        if (!ok) return;
        this.store.unarchiveDoc(doc.id, this.me.name);
        this.store.toast("已取消归档。");
      });
    },
    removeDoc(doc) {
      this.store.confirm({ title: "删除文档", text: "《" + doc.title + "》将移入回收站，30 天内可恢复。", danger: true, okText: "删除" }).then(ok => {
        if (!ok) return;
        this.store.deleteDoc(doc.id, this.me.name, "管理员删除");
        this.store.toast("已移入回收站。");
      });
    },
    restore(doc) {
      this.store.restoreDoc(doc.id, this.me.name);
      this.store.toast("已恢复《" + doc.title + "》。");
    },
    purge(doc) {
      this.store.confirm({ title: "彻底删除", text: "《" + doc.title + "》将不可恢复，操作会写入审计日志。", danger: true, okText: "彻底删除" }).then(ok => {
        if (!ok) return;
        this.store.purgeDoc(doc.id, this.me.name);
        this.store.toast("已彻底删除。");
      });
    },
    batchArchive() {
      if (!this.selected.length) return;
      this.store.confirm({ title: "批量归档", text: "将对选中的 " + this.selected.length + " 份文档执行归档。", okText: "批量归档" }).then(ok => {
        if (!ok) return;
        let n = 0;
        this.selected.forEach(id => {
          const doc = this.store.docById(id);
          if (doc && doc.status !== "ACTIVE") { this.store.archiveDoc(id, this.me.name); n++; }
        });
        this.selected = [];
        this.store.toast("已归档 " + n + " 份文档。");
      });
    },
    batchGrant() {
      if (!this.selected.length) return;
      const docs = this.selected.map(id => this.store.docById(id)).filter(Boolean);
      const sensitive = docs.filter(d => d.classification === "sensitive");
      this.store.confirm({
        title: "批量授权",
        text: "将为选中的 " + docs.length + " 份文档授予“普通用户”查看权限，期限 30 天" + (sensitive.length ? "；其中 " + sensitive.length + " 份敏感文档将提交审批" : "") + "。",
        okText: "确认授权"
      }).then(ok => {
        if (!ok) return;
        let active = 0, pending = 0;
        docs.forEach(d => {
          const res = this.store.createGrant({
            objectType: "document", objectId: d.id, subjectType: "role", subjectId: "staff",
            rights: ["view"], days: 30, reason: "批量授权（演示）"
          }, this.me.name);
          if (res.status === "active") active++; else pending++;
        });
        this.selected = [];
        this.store.toast("批量授权完成：立即生效 " + active + " 份" + (pending ? "，提交审批 " + pending + " 份" : "") + "。");
      });
    },
    batchDelete() {
      if (!this.selected.length) return;
      this.store.confirm({ title: "批量删除", text: "选中的 " + this.selected.length + " 份文档将移入回收站。", danger: true, okText: "删除" }).then(ok => {
        if (!ok) return;
        this.selected.forEach(id => this.store.deleteDoc(id, this.me.name, "批量删除"));
        this.selected = [];
        this.store.toast("已移入回收站。");
      });
    },
    resetUpload() {
      this.upload = { title: "", cat: "", dept: "D03", classification: "internal", validUntil: "", summary: "", fileName: "", size: "" };
    },
    openUpload() { this.resetUpload(); this.uploadOpen = true; },
    onFile(e) {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      this.upload.fileName = f.name;
      this.upload.size = (f.size / 1024 / 1024).toFixed(2) + " MB";
      if (!this.upload.title) this.upload.title = f.name.replace(/\.[^.]+$/, "");
    },
    submitUpload() {
      if (!this.upload.title) { this.store.toast("请填写文档标题。", "error"); return; }
      if (!this.upload.cat) { this.store.toast("请选择分类。", "error"); return; }
      const doc = this.store.uploadDoc({
        title: this.upload.title.trim(),
        cat: this.upload.cat,
        dept: this.upload.dept,
        classification: this.upload.classification,
        visibility: "all",
        summary: this.upload.summary || "（未填写摘要）",
        fileName: this.upload.fileName || (this.upload.title + ".pdf"),
        size: this.upload.size || "1.8 MB",
        validUntil: this.upload.validUntil ? new Date(this.upload.validUntil).toISOString() : undefined
      }, this.me.account);
      this.uploadOpen = false;
      this.store.toast("上传成功，已生成草稿《" + doc.title + "》。");
      this.openDetail(doc);
    },
    openVersion(doc) {
      this.versionDoc = doc;
      this.versionForm = { fileName: "", note: "" };
    },
    onVersionFile(e) {
      const f = e.target.files && e.target.files[0];
      if (f) this.versionForm.fileName = f.name;
    },
    submitVersion() {
      if (!this.versionForm.fileName) { this.store.toast("请选择新版本文件。", "error"); return; }
      if (!this.versionForm.note) { this.store.toast("请填写变更说明。", "error"); return; }
      this.store.addVersion(this.versionDoc.id, { fileName: this.versionForm.fileName, note: this.versionForm.note }, this.me.name);
      this.store.toast("新版本已保存。");
      this.versionDoc = null;
    },
    rollback(v) {
      this.store.confirm({ title: "回滚版本", text: "将以 V" + v.no + " 的内容生成新版本，历史版本仍保留。", okText: "回滚" }).then(ok => {
        if (!ok) return;
        this.store.rollbackVersion(this.detail.id, v.no, this.me.name);
        this.store.toast("已回滚至 V" + v.no + "，并生成新版本。");
      });
    },
    resetGrant() {
      this.grantForm = { objectType: "document", objectId: "", subjectType: "user", subjectId: "", rights: ["view"], days: 30, reason: "" };
    },
    openGrant(prefill) {
      this.resetGrant();
      if (prefill) Object.assign(this.grantForm, prefill);
      this.grantOpen = true;
    },
    toggleRight(id) {
      const arr = this.grantForm.rights;
      const i = arr.indexOf(id);
      if (i >= 0) arr.splice(i, 1); else arr.push(id);
    },
    submitGrant() {
      const f = this.grantForm;
      if (!f.objectId) { this.store.toast("请选择授权对象。", "error"); return; }
      if (!f.subjectId) { this.store.toast("请选择被授权对象。", "error"); return; }
      if (!f.rights.length) { this.store.toast("请选择权限项。", "error"); return; }
      if (!f.reason) { this.store.toast("请填写授权用途。", "error"); return; }
      const res = this.store.createGrant({
        objectType: f.objectType, objectId: f.objectId, subjectType: f.subjectType, subjectId: f.subjectId,
        rights: f.rights, days: f.days, reason: f.reason
      }, this.me.name);
      this.grantOpen = false;
      if (res.status === "pending") {
        this.store.toast("已提交授权审批（" + res.instance.no + "），待院办初审。");
        this.tab = "grants";
      } else {
        this.store.toast("授权已生效。");
      }
    },
    revoke(g) {
      this.store.confirm({ title: "收回授权", text: "将收回「" + g.subjectName + "」对「" + g.objectName + "」的权限。", danger: true, okText: "收回" }).then(ok => {
        if (!ok) return;
        this.store.revokeGrant(g.id, this.me.name, "管理员收回");
        this.store.toast("授权已收回。");
      });
    },
    exportLedger() {
      const rows = this.filteredGrants.map(g => [
        g.subjectName, g.subjectType, g.objectName, this.store.h.rights(g.rights),
        g.source, this.store.h.fmtDate(g.validUntil), this.grantStatusMeta(g).label, g.approvalId || ""
      ]);
      const csv = "\ufeff被授权对象,对象类型,授权对象,权限,来源,有效期至,状态,审批单号\n" + rows.map(r => r.map(x => '"' + String(x).replace(/"/g, '""') + '"').join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "权限台账.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      this.store.toast("权限台账已导出（" + rows.length + " 条），导出行为已记入审计。");
    },
    openCategory(parent) {
      this.categoryEditing = null;
      this.categoryParent = parent ? parent.id : null;
      this.categoryForm = { name: "", code: "" };
      this.categoryModal = true;
    },
    openRename(cat) {
      this.categoryEditing = cat;
      this.categoryParent = null;
      this.categoryForm = { name: cat.name, code: cat.code };
      this.categoryModal = true;
    },
    saveCategory() {
      if (!this.categoryForm.name) { this.store.toast("请填写分类名称。", "error"); return; }
      if (this.categoryEditing) {
        this.categoryEditing.name = this.categoryForm.name;
        this.categoryEditing.code = this.categoryForm.code;
      } else {
        const id = "CAT-" + String(Date.now()).slice(-5);
        const item = { id, name: this.categoryForm.name, code: this.categoryForm.code || id, children: [] };
        if (this.categoryParent) {
          const parent = this.store.categories.find(c => c.id === this.categoryParent);
          if (parent) parent.children = parent.children || [], parent.children.push(item);
        } else {
          this.store.categories.push(item);
        }
      }
      this.store.persist();
      this.categoryModal = null;
      this.store.toast("分类已保存。");
    },
    disableCategory(cat) {
      const n = this.categoryCount(cat.id);
      if (n > 0) {
        this.store.toast("该分类下仍有 " + n + " 份文档，请先迁移或归档。", "error");
        return;
      }
      this.store.confirm({ title: "停用分类", text: "停用后不可再上传到「" + cat.name + "」，历史文档不受影响。", danger: true, okText: "停用" }).then(ok => {
        if (!ok) return;
        cat.disabled = true;
        this.store.persist();
        this.store.toast("分类已停用。");
      });
    },
    moveCategory(cat, dir) {
      const arr = this.store.categories;
      const i = arr.indexOf(cat);
      const j = i + dir;
      if (j < 0 || j >= arr.length) return;
      arr.splice(i, 1);
      arr.splice(j, 0, cat);
      this.store.persist();
    },
    openNotif(n) {
      this.store.markRead(n.id);
      this.notifOpen = false;
      if (n.link && n.link.tab) this.tab = n.link.tab;
      if (n.link && n.link.docId) {
        const doc = this.store.docById(n.link.docId);
        if (doc) this.openDetail(doc);
      }
    },
    readAll() { this.store.markAllRead(this.me.account); },
    openInstance(inst) { this.instanceModal = inst; }
  }
};
</script>

<style>
.adm-nav:hover { background: #f8fafc; }
.adm-row:hover { background: #f8fafc; }
.adm-icon-btn:hover { background: #f1f5f9; color: #334155; }
.adm-btn-primary { background: #0284c7; transition: background .15s ease; }
.adm-btn-primary:hover { background: #0369a1; }
.adm-btn-ghost { background: #fff; border: 1px solid #e2e8f0; color: #475569; transition: background .15s ease; }
.adm-btn-ghost:hover { background: #f8fafc; }
.adm-input:focus { outline: none; border-color: #38bdf8; box-shadow: 0 0 0 3px rgba(14, 165, 233, .12); background: #fff; }
.adm-label { display: block; font-size: 11px; color: #64748b; margin-bottom: 6px; }
.adm-drop:hover { border-color: #38bdf8; background: #f0f9ff; }
</style>
