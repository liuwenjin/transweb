const pcCatContainer = document.getElementById('pc-categories');
const mobileCatContainer = document.getElementById('mobile-categories');
const gradeFiltersContainer = document.getElementById('grade-filters');
const agentGrid = document.getElementById('agent-grid');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');
const filterStatus = document.getElementById('filter-status');
const resultCount = document.getElementById('result-count');
const backdrop = document.getElementById('drawer-backdrop');
const drawer = document.getElementById('drawer-container');
const iframe = document.getElementById('drawer-iframe');
const drawerTitle = document.getElementById('drawer-title');
const drawerUrl = document.getElementById('drawer-url');
const externalLink = document.getElementById('drawer-external-link');
const closeBtn = document.getElementById('close-drawer-btn');
const loading = document.getElementById('drawer-loading');

let drawerReturnFocus = null;
let drawerCloseTimer = null;

/* =========================
   中英切换：页面文案统一走 window.__t__()
   （词典在 i18n/agentHub.zh.json 与 i18n/agentHub.en.json，
    JS 动态生成的文案在 agentHub.html 的 __PAGE_I18N__.zh 里）
========================= */

// 分类名是数据里的中文键，展示时按词典翻译；没收录的分类直接显示原名
const CATEGORY_KEYS = {
  '全部': 'cat.all',
  '热门': 'cat.hot',
  '动态演示': 'sh.cat.dynamic',
  '备课制卷': 'sh.cat.examprep',
  '几何图形': 'sh.cat.geometry',
  '代数函数': 'sh.cat.algebra',
  '应用题': 'sh.cat.word',
  '趣味数学': 'sh.cat.fun',
  // 接口返回的实际分类
  '其他': 'sh.cat.other',
  '创作生成类': 'sh.cat.generate',
  '创意写作类': 'sh.cat.writing',
  '学习辅导类': 'sh.cat.tutoring',
  'mermaid': 'sh.cat.mermaid'
};

function t(key, fallback) {
  if (typeof window.__t__ === 'function') {
    const value = window.__t__(key, fallback);
    if (value !== undefined && value !== null) return value;
  }
  return fallback !== undefined ? fallback : key;
}

function tf(key, vars, fallback) {
  return String(t(key, fallback === undefined ? key : fallback)).replace(/\{(\w+)\}/g, (whole, name) => (
    vars && vars[name] !== undefined ? vars[name] : whole
  ));
}

function categoryLabel(category) {
  return t(CATEGORY_KEYS[category], category);
}

// 列表数据来自接口（含用户填写的名称与简介），输出到 HTML 前统一转义
function esc(value) {
  return String(value === undefined || value === null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 1. 全局打开抽屉函数
window.openDrawer = function (url, title) {
  if (!url) return;

  title = title || t('drawer.fallbackTitle', '智能体运行预览');

  if (drawerCloseTimer) {
    clearTimeout(drawerCloseTimer);
    drawerCloseTimer = null;
  }

  drawerReturnFocus = document.activeElement;
  drawer.setAttribute('aria-hidden', 'false');

  drawerTitle.textContent = title;
  drawerUrl.textContent = url;
  externalLink.href = url;

  // 显示 Loading 提示
  loading.style.display = 'flex';
  loading.style.opacity = '1';

  // 赋能与打开抽屉
  iframe.src = url;

  backdrop.classList.remove('opacity-0', 'pointer-events-none');
  backdrop.classList.add('opacity-100');

  drawer.classList.remove('translate-x-full');
  drawer.classList.add('translate-x-0');

  // 锁定背景滚动（移动端缩放后实际滚动的是 .page-scroll）
  document.body.style.overflow = 'hidden';
  document.querySelector('.page-scroll')?.classList.add('is-locked');

  // 把键盘焦点移入浮层，避免焦点仍停留在背景页面
  window.setTimeout(function () {
    if (closeBtn) closeBtn.focus();
  }, 100);
};

// 2. 全局关闭抽屉函数
window.closeDrawer = function () {
  backdrop.classList.remove('opacity-100');
  backdrop.classList.add('opacity-0', 'pointer-events-none');

  drawer.classList.remove('translate-x-0');
  drawer.classList.add('translate-x-full');

  document.body.style.overflow = '';
  document.querySelector('.page-scroll')?.classList.remove('is-locked');

  // 延迟清空 src 释放内存
  drawerCloseTimer = setTimeout(() => {
    drawerCloseTimer = null;
    iframe.src = 'about:blank';
    drawer.setAttribute('aria-hidden', 'true');
  }, 300);

  // 关闭后把焦点还给触发「立即运行」的链接
  if (drawerReturnFocus && typeof drawerReturnFocus.focus === 'function') {
    drawerReturnFocus.focus({ preventScroll: true });
  }
  drawerReturnFocus = null;
};

// 3. Iframe 加载完成后隐藏 Loading
iframe.addEventListener('load', () => {
  if (iframe.src !== 'about:blank') {
    loading.style.opacity = '0';
    setTimeout(() => {
      loading.style.display = 'none';
    }, 200);
  }
});

// 4. 事件监听绑定
closeBtn.addEventListener('click', closeDrawer);
backdrop.addEventListener('click', closeDrawer);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDrawer();
    return;
  }

  // 抽屉是模态浮层：Tab 焦点限制在抽屉内部，避免跑到背景页面
  if (e.key !== 'Tab' || drawer.getAttribute('aria-hidden') === 'true') return;

  const focusable = [...drawer.querySelectorAll('a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])')]
    .filter((el) => el.offsetParent !== null || el.tagName === 'IFRAME');

  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});

// 5. 事件委托：自动拦截含有 [data-url] 或 class="run-btn" 的元素点击
document.body.addEventListener('click', (e) => {
  const runBtn = e.target.closest('.run-btn') || e.target.closest('[data-url]');
  if (runBtn) {
    e.preventDefault();
    const url = runBtn.dataset.url || runBtn.getAttribute('href');
    const title = runBtn.dataset.title || t('drawer.fallbackTitleShort', '智能体运行');
    if (url && url !== '#') {
      openDrawer(url, title);
    }
  }
});




function renderCategories() {
  if (pcCatContainer) {
    pcCatContainer.innerHTML = categories.map(cat => `
                <button
                    type="button"
                    data-category="${esc(cat)}"
                    aria-pressed="${currentCategory === cat}"
                    class="hub-cat ${currentCategory === cat ? 'is-active' : ''}">
                    <span>${esc(categoryLabel(cat))}</span>
                    <span class="hub-cat__count">${getCategoryCount(cat)}</span>
                </button>
            `).join('');

    pcCatContainer.querySelectorAll('[data-category]').forEach(btn => {
      btn.addEventListener('click', () => selectCategory(btn.dataset.category));
    });
  }

  if (mobileCatContainer) {
    mobileCatContainer.innerHTML = categories.map(cat => `
                <button
                    type="button"
                    data-category="${esc(cat)}"
                    aria-pressed="${currentCategory === cat}"
                    class="hub-cat-chip ${currentCategory === cat ? 'is-active' : ''}">
                    <span>${esc(categoryLabel(cat))}</span><span class="hub-cat-chip__count">${getCategoryCount(cat)}</span>
                </button>
            `).join('');

    mobileCatContainer.querySelectorAll('[data-category]').forEach(btn => {
      btn.addEventListener('click', () => selectCategory(btn.dataset.category));
    });
  }
}

function getCategoryCount(cat) {
  let list = [...agents];
  if (currentGrade !== "全部学段") {
    list = list.filter(a => a.grades.includes(currentGrade));
  }
  if (cat === "全部") return list.length;
  if (cat === "热门") return list.filter(a => a.hot).length;
  return list.filter(a => a.category === cat).length;
}

function render() {
  let filteredAgents = [...agents];

  if (searchQuery.trim() !== "") {
    const searchResults = fuse.search(searchQuery);
    filteredAgents = searchResults.map(result => result.item);
  }

  if (currentCategory !== "全部") {
    if (currentCategory === "热门") {
      filteredAgents = filteredAgents.filter(agent => agent.hot);
    } else {
      filteredAgents = filteredAgents.filter(agent => agent.category === currentCategory);
    }
  }

  if (currentGrade !== "全部学段") {
    filteredAgents = filteredAgents.filter(agent => agent.grades.includes(currentGrade));
  }

  let statusText = tf('status.category', { cat: categoryLabel(currentCategory) },
    `正在展示: [${currentCategory}] 分类`);
  if (searchQuery.trim() !== "") {
    statusText += tf('status.search', { q: searchQuery }, ` · 关于 "${searchQuery}" 的搜索结果`);
  }

  filterStatus.innerText = statusText;
  resultCount.innerText = tf('count.items', { n: filteredAgents.length }, `共 ${filteredAgents.length} 个项目`);

  if (filteredAgents.length === 0) {
    agentGrid.classList.add('hidden');
    emptyState.classList.remove('hidden');
    emptyState.classList.add('flex');
  } else {
    agentGrid.classList.remove('hidden');
    emptyState.classList.add('hidden');
    emptyState.classList.remove('flex');

    // 修改了卡片的模板结构中的 Class: 引入毛玻璃、高级投影、平滑动效与 18px 正文
    agentGrid.innerHTML = filteredAgents.map(source => {
      const agent = localizedAgent(source);
      return `
                    <article class="group relative rounded-[24px] border border-white/60 dark:border-white/5 bg-white/50 dark:bg-slate-900/40 backdrop-blur-2xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 hover:bg-white/80 dark:hover:bg-slate-800/60 transition-all duration-500 ease-out-expo flex flex-col justify-between overflow-hidden">
                        
                        <!-- 装饰性柔光背景 -->
                        <div class="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/5 dark:bg-brand-400/5 blur-3xl rounded-full pointer-events-none group-hover:bg-brand-500/10 transition-colors duration-500"></div>

                        <div class="relative z-10">
                            <div class="flex items-start justify-between gap-4">
                                <div class="flex items-center gap-5">
                                    <div class="w-16 h-16 rounded-[20px] bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-white/80 dark:border-white/5 flex items-center justify-center text-3xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] group-hover:scale-105 transition-transform duration-500 ease-out-expo">
                                        ${agent.icon}
                                    </div>
                                    <div>
                                        <h3 class="font-bold text-[20px] text-slate-800 dark:text-slate-100 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors duration-300 tracking-tight">${esc(agent.name)}</h3>
                                        <div class="flex flex-wrap items-center gap-2 mt-1.5">
                                            <span class="inline-flex items-center rounded-lg bg-emerald-500/10 dark:bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-brand-600 dark:text-brand-400 tracking-wide">${esc(agent.category)}</span>
                                        </div>
                                    </div>
                                </div>
                                ${agent.hot ? `
                                <span class="flex h-2.5 w-2.5 relative mt-2" title="${esc(t('card.popular', '热门推荐'))}">
                                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 duration-1000"></span>
                                    <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </span>` : ''}
                            </div>
                            
                            <p title="${esc(agent.desc)}" class="mt-6 text-[18px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2 prose-reading font-medium">
                                ${esc(agent.desc)}
                            </p>

                            <div class="mt-4 flex flex-wrap gap-2">
                                ${agent.tags.map(tag => `
                                    <span class="cursor-pointer text-sm font-medium text-slate-400/80 dark:text-slate-500 hover:text-brand-500 dark:hover:text-brand-400 transition-colors duration-300" data-tag="${esc(tag)}" role="button" tabindex="0">#${esc(tag)}</span>
                                `).join('')}
                            </div>
                        </div>

                        <div class="mt-8 pt-5 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-sm text-slate-400 relative z-10 font-medium">
                            <span class="flex items-center gap-1.5"><i data-lucide="eye" class="w-4 h-4"></i> ${esc(tf('card.preview', { n: agent.views }, `预览 ${agent.views} 次`))}</span>
                            ${agent.url && agent.url !== '#' ? `<a href="${esc(agent.url)}" target="_blank" rel="noopener noreferrer" data-url="${esc(agent.url)}" data-title="${esc(agent.name)}" title="${esc(tf('card.runTitle', { name: agent.name }, `运行 ${agent.name}`))}" class="inline-flex cursor-pointer items-center gap-1.5 font-bold text-brand-500 dark:text-brand-400 hover:text-brand-600 dark:hover:text-brand-300 group/link transition-colors duration-300 run-btn">
                                ${esc(t('card.run', '立即运行'))}
                                <i data-lucide="arrow-up-right" class="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform duration-300"></i>
                            </a>` : `<span class="inline-flex items-center gap-1.5 font-bold text-slate-400" aria-disabled="true">${esc(t('card.soon', '暂未开放'))}</span>`}
                        </div>
                    </article>
                `;
    }).join('');

    // 点标签即按标签搜索
    agentGrid.querySelectorAll('[data-tag]').forEach(tagEl => {
      const run = () => setSearchQuery(tagEl.dataset.tag);
      tagEl.addEventListener('click', run);
      tagEl.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          run();
        }
      });
    });
  }
  lucide.createIcons();
}

// 卡片文案：接口数据没有英文译名时回退到原文
function localizedAgent(agent) {
  const isEn = (window.__APP_LANG__ || 'zh') === 'en';
  return {
    ...agent,
    name: isEn && agent.nameEn ? agent.nameEn : agent.name,
    desc: isEn && agent.descEn ? agent.descEn : agent.desc,
    tags: (isEn && agent.tagsEn ? agent.tagsEn : agent.tags) || [],
    category: categoryLabel(agent.category)
  };
}

function selectCategory(cat) {
  currentCategory = cat;
  renderCategories();
  render();
}

function selectGrade(grade) {
  currentGrade = grade;
  renderCategories();
  render();
}

function setSearchQuery(tag) {
  searchInput.value = tag;
  searchQuery = tag;
  render();
}

// 分类来自接口数据，首屏只保留两个固定分类；API 返回后由 renderCategories 补全
let categories = ["全部", "热门"];
const gradeCategories = ["全部学段", "小学", "初中", "高中", "大学", "其他"];

// 已发布的 Agent 由接口填充；接口失败时展示空状态，避免出现与页面定位不符的占位内容
let agents = [];

let currentCategory = "全部";
let currentGrade = "全部学段";
let searchQuery = "";

const fuseOptions = {
  keys: [
    { name: 'name', weight: 0.4 },
    { name: 'nameEn', weight: 0.4 },
    { name: 'desc', weight: 0.3 },
    { name: 'descEn', weight: 0.3 },
    { name: 'grades', weight: 0.2 },
    { name: 'tags', weight: 0.1 },
    { name: 'tagsEn', weight: 0.1 }
  ],
  threshold: 0.35,
  includeScore: true
};
let fuse = new Fuse(agents, fuseOptions);

// 切换中英后重绘分类、卡片与状态文案（接口数据保持不变，只换界面文案）
window.addEventListener('applangchange', function () {
  if (!agentGrid) return;
  renderCategories();
  render();
});

document.addEventListener('DOMContentLoaded', function () {
  aigcInterface.init();
  if (typeof webCpu !== 'undefined') {
    let adapter = webCpu.initAdapter({
      documentList: {
        url: "https://transweb.cn/user/getPublishedList",
        method: "get",
      }
    });

    adapter.documentList({
      pageSize: 500,
      pageNo: 1,
      type: { $ne: "未定义" },
      appAgent: webCpu.appConfig.publishInfo.folderName,
      appName: "agentGenerator"
    }, (res) => {
      if (res && res.data) {
        categories = ["全部", "热门"];
        agents = res.data.map(item => {
          item.category = item.type || item.category || "其他";
          item.grades = JSON.parse(item.grades || "[]") || ["其他"];
          item.tags = JSON.parse(item.tags || "[]") || [];
          if (categories.indexOf(item.category) === -1) {
            categories.push(item.category);
          }
          item.views = item.usageCount || 0;
          item.hot = item.usageCount > 300 || false;
          item.url = `https://transweb.cn/agent.html?id=${item.documentId}&solo=true`;
          item.icon = item.icon || "🤖";
          item.desc = item.introduce || item.description || t('card.noDesc', '暂无描述');
          return item;
        });

        agents = agents.sort((a, b) => b.views - a.views);

        fuse = new Fuse(agents, fuseOptions);

        render();
        renderCategories();
      }
      else {
        if (typeof WebTool !== 'undefined') WebTool.showMask(t('status.error', '获取 Agent 列表失败，请刷新重试'), 5000);
        console.log("获取 Agent 列表失败", res);
        // 接口异常时也展示空状态，避免页面只剩一片空白
        render();
        renderCategories();
      }
    });
  }

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    render();
  });

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
  });

  // 首屏不渲染空列表：等接口返回后由 render() 填充，避免空状态一闪而过
  renderCategories();
  lucide.createIcons();
});

document.addEventListener('DOMContentLoaded', function () {
  let qParams = WebTool.urlQuery(location.href);
  // ?lang= 只用于中英切换，不应触发跳到 agent 页
  delete qParams.lang;
  if (Object.keys(qParams).length !== 0) {
    location.href = WebTool.attachParams("agent.html", qParams);
  }
});