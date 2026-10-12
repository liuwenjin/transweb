document.addEventListener('DOMContentLoaded', function () {
  let qParams = WebTool.urlQuery(location.href);
  if (Object.keys(qParams).length !== 0) {
    location.href = WebTool.attachParams("agent.html", qParams);
  }
  else {
    initWorkflowPage();
  }
});

const WORKFLOWS = [
  { id: 'wf-1', title: '数学题目配图助理', description: '智能解析数学题意，自动规划并生成动态几何绘图脚本', category: '数据可视化', iconKey: 'ruler', url: 'https://transweb.cn/workflow/docs/examples/ggb-agent.html', nodes: ['题意理解', '作图规划', '脚本生成与渲染'] },
  { id: 'wf-1.1', title: 'MathBox 3D 可视化 Agent', description: '基于自然语言解析几何与函数逻辑，自动输出高质感三维动态渲染代码', category: '数据可视化', iconKey: 'box', url: 'https://transweb.cn/workflow/docs/examples/mathbox-agent.html', nodes: ['意图解析与规划', 'MathBox 渲染输出'] },
  { id: 'wf-2', title: '学术论文助理', description: '全流程辅助学术研究，涵盖课题可行性评估、综述生成至投前审查', category: '学术科研', iconKey: 'graduation-cap', hot: '热门', url: 'https://transweb.cn/workflow/docs/examples/academic-paper.html', nodes: ['可行性分析', '文献综述生成', '实验方案生成', '初版论文撰写', '投前审查'] },
  { id: 'wf-3', title: '深度图文创作', description: '专注于公众号等自媒体场景，实现从爆款选题到深度长文润色', category: '内容创作', iconKey: 'newspaper', url: 'https://transweb.cn/workflow/docs/examples/long-article.html', nodes: ['内容策划', '长文章生成', '内容润色'] },
  { id: 'wf-4', title: '全渠道营销矩阵助理', description: '协同多 AI 构建全网营销生态，高效输出长文、短视频及视觉素材', category: '内容创作', iconKey: 'bot', url: 'https://transweb.cn/workflow/docs/examples/marketing-workflow.html', nodes: ['痛点分析', '长文章', '短文笔记', '视频脚本', 'SVG插画'] },
  { id: 'wf-5', title: '寓言故事生成工作流', description: '结合故事叙事与视觉表达，一键生成富有教育意义的插画故事', category: '内容创作', iconKey: 'palette', url: 'https://transweb.cn/workflow/docs/examples/parables-workflow.html', nodes: ['寓言故事', '封面插画'] },
  { id: 'wf-6', title: '数形结合演示助理', description: '解析数学抽象概念，一键转化为直观的数形结合交互演示动画', category: '教学备课', iconKey: 'bar-chart-3', url: 'https://transweb.cn/workflow/docs/examples/canvas-agent.html', nodes: ['动画脚本', '技术方案', '动画实现'] },
  { id: 'wf-7', title: '法律合同风控审核', description: '自动化解析法律合同，精准识别商务漏洞与法务合规风险并导出报告', category: '法律合规', iconKey: 'scale', url: 'https://transweb.cn/workflow/docs/examples/contract-review.html', nodes: ['结构化', '基础校验', '商务风险', '合规法务', '汇总报告'] },
  { id: 'wf-8', title: '高转化落地页生成器', description: '输入产品核心优势，快速构建并润色高转化率的商业 Landing Page', category: '内容创作', iconKey: 'monitor', hot: '推荐', url: 'https://transweb.cn/workflow/docs/examples/landpage-workflow.html', nodes: ['文案生成', '落地页生成', '润色落地页'] },
  { id: 'wf-9', title: '数学文化与微课设计', description: '深度挖掘数学知识点背景，输出跨学科建模方案与微课教学设计', category: '教学备课', iconKey: 'landmark', url: 'https://transweb.cn/workflow/docs/examples/micro-lecture.html', nodes: ['动画脚本', '技术方案', '动画实现'] },
  { id: 'wf-10', title: '爆款图文封面设计', description: '智能匹配选题风格，批量生成兼具美感与吸引力的小红书图文封面', category: '内容创作', iconKey: 'image', hot: '热门', url: 'https://transweb.cn/workflow/docs/examples/canvas-agent.html', nodes: ['笔记文案', '生成封面', '润色封面'] },
  { id: 'wf-11', title: '物理知识点动态仿真', description: '将抽象物理原理与定量描述一键转化为可视化物理仿真模拟动画', category: '教学备课', iconKey: 'flask-conical', url: 'https://transweb.cn/workflow/docs/examples/physics-simulation.html', nodes: ['仿真方案', '仿真实现'] },
  { id: 'wf-12', title: '分层变式题库生成', description: '围绕核心教学知识点，梯度生成从基础巩固到压轴拓展的变式题集', category: '教学备课', iconKey: 'pencil', url: 'https://transweb.cn/workflow/docs/examples/tiered-lesson.html', nodes: ['概念讲解', '基础巩固题目', '能力提升题目', '压轴探索题目'] },
  { id: 'wf-13', title: '数学建模与数据分析', description: '一键解析海量数据，完成数学建模并导出专业级可视化演示报告', category: '数据可视化', iconKey: 'trending-up', url: 'https://transweb.cn/workflow/docs/examples/mathematical-model.html', nodes: ['数学建模', '可视化'] },
  { id: 'wf-14', title: '中考数学全真模拟试卷生成', description: '紧扣中考大纲与命题趋势，智能生成含全题型解析与矢量配图的高质量模拟试卷', category: '教学备课', iconKey: 'pen-tool', hot: '推荐', url: 'https://transweb.cn/workflow/docs/examples/math-exam-paper.html', nodes: ['智能出题', '试卷排版'] },
  { id: 'wf-15', title: '数学可视化助理', description: '根据数学公式或可视化要求，生成动态几何绘图脚本并渲染出可交互的图形', category: '数据可视化', iconKey: 'ruler', url: 'https://transweb.cn/workflow/docs/examples/math-visual.html', nodes: ['作图规划', '脚本生成与渲染'] },
  { id: 'wf-16', title: '错题专项变式题助理', description: '分析错题，生成针对性变式题目，帮助学生巩固知识点并提升解题能力', category: '教学备课', iconKey: 'book-open', url: 'https://transweb.cn/workflow/docs/examples/practice4missed.html', nodes: ['错题分析', '出题练习'] }
];

const CATEGORY_TONE = {
  '教学备课': { icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300', chip: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' },
  '内容创作': { icon: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300', chip: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' },
  '数据可视化': { icon: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300', chip: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300' },
  '学术科研': { icon: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300', chip: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300' },
  '法律合规': { icon: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300', chip: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300' }
};

function toneOf(category) {
  return CATEGORY_TONE[category] || CATEGORY_TONE['教学备课'];
}

let activeCategory = '全部';
let searchQuery = '';
let searchTimer = null;

const workflowGrid = document.getElementById('workflow-grid');
const searchInput = document.getElementById('search-input');
const categoryTags = document.getElementById('category-tags');
const resultCount = document.getElementById('result-count');
const clearFilterBtn = document.getElementById('clear-filter');
const emptyState = document.getElementById('empty-state');

function renderCategories() {
  const categories = ['全部', ...new Set(WORKFLOWS.map(w => w.category))];
  categoryTags.innerHTML = categories.map(cat => `
    <button class="shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${cat === activeCategory
      ? 'bg-brand-600 text-white border border-brand-600'
      : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-brand-600 hover:text-brand-600 dark:hover:text-brand-300'
    }" data-category="${cat}">${cat}</button>
  `).join('');

  categoryTags.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.category;
      renderCategories();
      applyFilter();
    });
  });
}

function runWorkflow(url) {
  if (url) window.open(url, '_blank', 'noopener');
}

function miniNodeMap(nodes) {
  return nodes.map((node, i) => `
    <span class="inline-flex items-center gap-1">
      <span class="whitespace-nowrap rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">${node}</span>
      ${i < nodes.length - 1 ? '<i data-lucide="arrow-right" class="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0"></i>' : ''}
    </span>
  `).join('');
}

function renderWorkflows(workflows) {
  if (workflows.length === 0) {
    workflowGrid.innerHTML = '';
    emptyState.classList.remove('hidden');
    emptyState.classList.add('flex');
    resultCount.textContent = '共 0 条流水线';
    return;
  }

  emptyState.classList.add('hidden');
  emptyState.classList.remove('flex');
  resultCount.textContent = `共 ${workflows.length} 条流水线`;

  workflowGrid.innerHTML = workflows.map(w => {
    const tone = toneOf(w.category);
    return `
      <article class="group relative flex flex-col justify-between rounded-2xl bg-[#F6F9F7] dark:bg-slate-900/70 border border-gray-100 dark:border-slate-800 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-brand-600/40 transition-all duration-300 cursor-pointer" data-url="${w.url}">
        ${w.hot ? `<span class="absolute top-0 right-0 z-10 rounded-bl-xl rounded-tr-2xl bg-orange-500 px-3 py-1 text-xs font-bold text-white shadow-sm">🔥 ${w.hot}</span>` : ''}
        <div>
          <div class="mb-3.5 flex items-center gap-2.5">
            <span class="inline-flex h-11 w-11 items-center justify-center rounded-xl ${tone.icon}">
              <i data-lucide="${w.iconKey}" class="w-5 h-5"></i>
            </span>
            <span class="px-3 py-1 rounded-full ${tone.chip} text-xs font-semibold">${w.category}</span>
          </div>

          <h3 class="text-lg font-bold text-slate-800 dark:text-white flex items-center justify-between gap-2 group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
            <span>${w.title}</span>
            <i data-lucide="external-link" class="w-4 h-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"></i>
          </h3>
          <p class="mt-2 text-sm leading-relaxed text-gray-600 dark:text-slate-400 line-clamp-2">${w.description}</p>

          <div class="mt-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 px-3 py-3">
            <div class="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">流程 · ${w.nodes.length} 步</div>
            <div class="flex flex-wrap items-center gap-1.5">${miniNodeMap(w.nodes)}</div>
          </div>
        </div>

        <button class="mt-5 inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-brand-600 hover:bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors" data-action="run" data-url="${w.url}">
          ⚡ 免费运行此工作流
        </button>
      </article>
    `;
  }).join('');

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  workflowGrid.querySelectorAll('article[data-url]').forEach(card => {
    card.addEventListener('click', () => runWorkflow(card.dataset.url));
  });
}

function applyFilter() {
  const q = searchQuery.toLowerCase().trim();
  const filtered = WORKFLOWS.filter(w => {
    const matchesCategory = activeCategory === '全部' || w.category === activeCategory;
    const matchesQuery = !q || w.title.toLowerCase().includes(q) || w.description.toLowerCase().includes(q) || w.nodes.some(n => n.toLowerCase().includes(q));
    return matchesCategory && matchesQuery;
  });

  clearFilterBtn.classList.toggle('hidden', activeCategory === '全部' && !searchQuery);
  renderWorkflows(filtered);
}

function resetFilters() {
  searchQuery = '';
  activeCategory = '全部';
  if (searchInput) searchInput.value = '';
  renderCategories();
  applyFilter();
}

function initWorkflowPage() {
  renderCategories();
  applyFilter();

  const themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
    });
  }

  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIconOpen = document.getElementById('menu-icon-open');
  const menuIconClose = document.getElementById('menu-icon-close');
  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', () => {
      const isHidden = mobileMenu.classList.contains('hidden');
      if (isHidden) {
        mobileMenu.classList.remove('hidden');
        menuIconOpen.classList.add('hidden');
        menuIconClose.classList.remove('hidden');
      } else {
        mobileMenu.classList.add('hidden');
        menuIconOpen.classList.remove('hidden');
        menuIconClose.classList.add('hidden');
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(applyFilter, 150);
    });
  }

  if (clearFilterBtn) {
    clearFilterBtn.addEventListener('click', resetFilters);
  }

  const emptyResetBtn = document.getElementById('empty-reset');
  if (emptyResetBtn) {
    emptyResetBtn.addEventListener('click', resetFilters);
  }

  const searchKbd = document.getElementById('search-kbd');
  if (searchKbd) {
    const isMac = /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);
    searchKbd.textContent = isMac ? '⌘ K' : 'Ctrl K';
  }

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (searchInput) searchInput.focus();
    }
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      if (searchInput) searchInput.focus();
    }
  });
}
