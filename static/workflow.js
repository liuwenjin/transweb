// 切换中英后重绘分类、卡片与计数
window.addEventListener('applangchange', function () {
  if (!workflowGrid) return;
  renderCategories();
  applyFilter();
});

document.addEventListener('DOMContentLoaded', function () {
  let qParams = WebTool.urlQuery(location.href);
  // ?lang= 只用于中英切换，不应触发跳到 agent 页
  delete qParams.lang;
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

WORKFLOW_EN = {
    "wf-1": ["Math Diagram Assistant",
             "Reads the maths problem, plans the figure and writes a dynamic geometry script automatically",
             "Data visualization", null,
             ["Understand the problem", "Plan the drawing", "Generate and render"]],
    "wf-1.1": ["MathBox 3D Visualization Agent",
               "Turns natural-language geometry and function logic into high-quality 3D animated rendering code",
               "Data visualization", null,
               ["Parse intent & plan", "Render with MathBox"]],
    "wf-2": ["Academic Paper Assistant",
             "Supports the whole research pipeline: feasibility review, literature review and pre-submission checks",
             "Research", "Hot",
             ["Feasibility check", "Literature review", "Experiment plan", "First draft", "Pre-submission review"]],
    "wf-3": ["Long-form Article Writer",
             "Built for newsletters and social accounts: from a high-performing topic to a polished long read",
             "Content creation", null,
             ["Content planning", "Long-form draft", "Polishing"]],
    "wf-4": ["Multi-channel Marketing Assistant",
             "Coordinates several AIs to produce long articles, short videos and visuals for an omni-channel campaign",
             "Content creation", null,
             ["Pain-point analysis", "Long article", "Short posts", "Video script", "SVG illustration"]],
    "wf-5": ["Fable Story Generator",
             "Combines storytelling with illustration to produce an educational illustrated story in one run",
             "Content creation", null,
             ["Fable story", "Cover illustration"]],
    "wf-6": ["Math Visualisation Presenter",
             "Turns abstract maths concepts into intuitive, interactive demonstration animations",
             "Lesson prep", null,
             ["Animation script", "Technical plan", "Animation build"]],
    "wf-7": ["Contract Risk Review",
             "Parses contracts automatically, flags commercial gaps and compliance risks, then exports a report",
             "Legal & compliance", null,
             ["Structure", "Basic checks", "Commercial risk", "Compliance", "Summary report"]],
    "wf-8": ["High-converting Landing Page",
             "Describe your product's edge and get a polished, high-converting commercial landing page",
             "Content creation", "Recommended",
             ["Copywriting", "Build the page", "Polish the page"]],
    "wf-9": ["Math Culture & Micro-lessons",
             "Digs into the background of a topic and produces cross-subject modelling plans and micro-lesson designs",
             "Lesson prep", null,
             ["Animation script", "Technical plan", "Animation build"]],
    "wf-10": ["Viral Cover Designer",
              "Matches the style of your topic and generates attractive social-post covers in batches",
              "Content creation", "Hot",
              ["Note copy", "Generate covers", "Polish covers"]],
    "wf-11": ["Physics Simulation",
              "Turns abstract physical principles and quantitative descriptions into visual simulation animations",
              "Lesson prep", null,
              ["Simulation plan", "Simulation build"]],
    "wf-12": ["Tiered Variant Problem Bank",
              "Builds a graded set of variants around a core topic, from basic consolidation to stretch problems",
              "Lesson prep", null,
              ["Concept explanation", "Basic problems", "Skill-building problems", "Challenge problems"]],
    "wf-13": ["Math Modeling & Data Analysis",
              "Parses large datasets, builds a mathematical model and exports a professional visual report",
              "Data visualization", null,
              ["Math modeling", "Visualization"]],
    "wf-14": ["Mock Exam Paper Generator",
              "Follows the exam syllabus and question trends to generate a full mock paper with worked solutions and vector diagrams",
              "Lesson prep", "Recommended",
              ["Generate questions", "Lay out the paper"]],
    "wf-15": ["Math Visualization Assistant",
              "Takes a formula or a visual brief and generates a dynamic geometry script, rendered as an interactive figure",
              "Data visualization", null,
              ["Plan the drawing", "Generate and render"]],
    "wf-16": ["Wrong-answer Variant Coach",
              "Analyses a wrong answer and generates targeted variants to consolidate the concept and improve problem solving",
              "Lesson prep", null,
              ["Error analysis", "Practice questions"]],
};

// 英文文案与数据分开放：新增一条工作流时，在 WORKFLOW_EN 里补一行即可
WORKFLOWS.forEach(workflow => {
  const translated = WORKFLOW_EN[workflow.id];
  if (!translated) return;

  const [title, description, category, hot, nodes] = translated;
  workflow.titleEn = title;
  workflow.descEn = description;
  workflow.categoryEn = category;
  if (hot) workflow.hotEn = hot;
  workflow.nodesEn = nodes;
});

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

/* =========================
   中英切换：页面文案统一走 window.__t__()
   （词典在 i18n/workflow.zh.json 与 i18n/workflow.en.json，
    JS 动态生成的文案在 workflow.html 的 __PAGE_I18N__.zh 里）
========================= */

const CATEGORY_EN = {
  '数据可视化': 'Data visualization',
  '学术科研': 'Research',
  '内容创作': 'Content creation',
  '教学备课': 'Lesson prep',
  '法律合规': 'Legal & compliance'
};

function isEn() {
  return (window.__APP_LANG__ || 'zh') === 'en';
}

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

function esc(value) {
  return String(value === undefined || value === null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function categoryLabel(category) {
  if (category === '全部') return t('wf.cat.all', '全部');
  if (!isEn()) return category;
  return CATEGORY_EN[category] || category;
}

// 卡片文案：切到英文时换成英文译名，没有译名就保留原文
function localizedWorkflow(workflow) {
  const en = isEn();
  return {
    ...workflow,
    title: en && workflow.titleEn ? workflow.titleEn : workflow.title,
    description: en && workflow.descEn ? workflow.descEn : workflow.description,
    categoryLabel: categoryLabel(workflow.category),
    hot: en && workflow.hotEn ? workflow.hotEn : workflow.hot,
    nodes: (en && workflow.nodesEn ? workflow.nodesEn : workflow.nodes) || []
  };
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
  if (!categoryTags) return;

  const categories = ['全部', ...new Set(WORKFLOWS.map(w => w.category))];
  categoryTags.innerHTML = categories.map(cat => `
    <button class="wf-cat ${cat === activeCategory ? 'is-active' : ''}" data-category="${esc(cat)}" aria-pressed="${cat === activeCategory}">${esc(categoryLabel(cat))}</button>
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
    <span>${esc(node)}</span>${i < nodes.length - 1 ? '<i>→</i>' : ''}
  `).join('');
}

function renderWorkflows(workflows) {
  if (workflows.length === 0) {
    workflowGrid.innerHTML = '';
    emptyState.classList.remove('hidden');
    emptyState.classList.add('flex');
    resultCount.textContent = tf('wf.count', { n: 0 }, '共 0 个工作流');
    return;
  }

  emptyState.classList.add('hidden');
  emptyState.classList.remove('flex');
  resultCount.textContent = tf('wf.count', { n: workflows.length }, `共 ${workflows.length} 个工作流`);

  workflowGrid.innerHTML = workflows.map(item => {
    const w = localizedWorkflow(item);
    return `
      <article class="wf-card" data-url="${esc(w.url)}" data-title="${esc(w.title)}">
        <div>
          <span class="wf-card__category">${esc(w.categoryLabel)}</span>${w.hot ? `<span class="wf-card__hot">${esc(w.hot)}</span>` : ''}
        </div>
        <h3 class="wf-card__title"><a class="wf-card__link" href="${esc(w.url)}" target="_blank" rel="noopener noreferrer">${esc(w.title)}</a></h3>
        <p class="wf-card__desc">${esc(w.description)}</p>
        <div class="wf-card__flow">
          <div class="wf-card__flow-label">${esc(tf('wf.card.steps', { n: w.nodes.length }, `共 ${w.nodes.length} 步`))}</div>
          <div class="wf-card__nodes">${miniNodeMap(w.nodes)}</div>
        </div>
        <div class="wf-card__footer">
          <span>${esc(t('wf.card.meta', '单文件运行 · 本地数据'))}</span>
          <a class="wf-card__run" href="${esc(w.url)}" target="_blank" rel="noopener noreferrer">${esc(t('wf.card.run', '免费运行'))} <i>→</i></a>
        </div>
      </article>
    `;
  }).join('');

  workflowGrid.querySelectorAll('article[data-url]').forEach(card => {
    card.addEventListener('click', (event) => {
      // 卡片内的标题链接与「免费运行」链接自行处理跳转，避免重复打开
      if (event.target.closest('a')) return;
      runWorkflow(card.dataset.url);
    });
  });
}

function applyFilter() {
  const q = searchQuery.toLowerCase().trim();
  const filtered = WORKFLOWS.filter(w => {
    const matchesCategory = activeCategory === '全部' || w.category === activeCategory;
    if (!q) return matchesCategory;

    // 中英两套文案都参与匹配，切到英文后搜英文也能命中
    const haystack = [w.title, w.titleEn, w.description, w.descEn, w.category, categoryLabel(w.category),
    ...(w.nodes || []), ...(w.nodesEn || [])]
      .filter(Boolean).join(' ').toLowerCase();
    return matchesCategory && haystack.includes(q);
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

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const siteHeader = document.querySelector('.wf-header');
  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', () => {
      const isHidden = mobileMenu.classList.contains('hidden');
      if (isHidden) {
        mobileMenu.classList.remove('hidden');
        mobileMenuToggle.setAttribute('aria-expanded', 'true');
        if (siteHeader) siteHeader.classList.add('nav-open');
      } else {
        mobileMenu.classList.add('hidden');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        if (siteHeader) siteHeader.classList.remove('nav-open');
      }
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        if (siteHeader) siteHeader.classList.remove('nav-open');
      });
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
