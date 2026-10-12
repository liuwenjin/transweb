const pcCatContainer = document.getElementById('pc-categories');
const mobileCatContainer = document.getElementById('mobile-categories');
const gradeFiltersContainer = document.getElementById('grade-filters');
const agentGrid = document.getElementById('agent-grid');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');
const filterStatus = document.getElementById('filter-status');
const resultCount = document.getElementById('result-count');
const themeToggleBtn = document.getElementById('theme-toggle');


const backdrop = document.getElementById('drawer-backdrop');
const drawer = document.getElementById('drawer-container');
const iframe = document.getElementById('drawer-iframe');
const drawerTitle = document.getElementById('drawer-title');
const drawerUrl = document.getElementById('drawer-url');
const externalLink = document.getElementById('drawer-external-link');
const closeBtn = document.getElementById('close-drawer-btn');
const loading = document.getElementById('drawer-loading');

// 1. 全局打开抽屉函数
window.openDrawer = function (url, title = '智能体运行预览') {
  if (!url) return;

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

  // 锁定背景滚动
  document.body.style.overflow = 'hidden';
};

// 2. 全局关闭抽屉函数
window.closeDrawer = function () {
  backdrop.classList.remove('opacity-100');
  backdrop.classList.add('opacity-0', 'pointer-events-none');

  drawer.classList.remove('translate-x-0');
  drawer.classList.add('translate-x-full');

  document.body.style.overflow = '';

  // 延迟清空 src 释放内存
  setTimeout(() => {
    iframe.src = 'about:blank';
  }, 300);
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
  if (e.key === 'Escape') closeDrawer();
});

// 5. 事件委托：自动拦截含有 [data-url] 或 class="run-btn" 的元素点击
document.body.addEventListener('click', (e) => {
  const runBtn = e.target.closest('.run-btn') || e.target.closest('[data-url]');
  if (runBtn) {
    e.preventDefault();
    const url = runBtn.dataset.url || runBtn.getAttribute('href');
    const title = runBtn.dataset.title || '智能体运行';
    if (url && url !== '#') {
      openDrawer(url, title);
    }
  }
});




function renderCategories() {
  pcCatContainer.innerHTML = categories.map(cat => `
                <button 
                    onclick="selectCategory('${cat}')" 
                    class="w-full flex items-center justify-between px-5 py-3.5 rounded-[20px] text-base font-medium transition-all duration-300 ease-out-expo ${currentCategory === cat
      ? 'bg-brand-50/80 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'
      : 'text-slate-500 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-200'
    }"
                >
                    <span>${cat}</span>
                    <span class="text-xs opacity-40 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">${getCategoryCount(cat)}</span>
                </button>
            `).join('');

  mobileCatContainer.innerHTML = categories.map(cat => `
                <button 
                    onclick="selectCategory('${cat}')" 
                    class="whitespace-nowrap px-6 py-2.5 rounded-[24px] text-sm font-medium transition-all duration-300 shrink-0 ${currentCategory === cat
      ? 'bg-brand-500 text-white shadow-[0_4px_12px_rgba(22,163,74,0.3)]'
      : 'bg-white/60 dark:bg-slate-900/40 backdrop-blur-md text-slate-500 dark:text-slate-400 border border-white/60 dark:border-white/5'
    }"
                >
                    ${cat} (${getCategoryCount(cat)})
                </button>
            `).join('');
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

  let statusText = `正在展示: [${currentCategory}] 分类`;
  if (currentGrade !== "全部学段") statusText += ` · [${currentGrade}] 学段`;
  if (searchQuery.trim() !== "") statusText += ` · 关于 "${searchQuery}" 的搜索结果`;

  filterStatus.innerText = statusText;
  resultCount.innerText = `共 ${filteredAgents.length} 个项目`;

  if (filteredAgents.length === 0) {
    agentGrid.classList.add('hidden');
    emptyState.classList.remove('hidden');
    emptyState.classList.add('flex');
  } else {
    agentGrid.classList.remove('hidden');
    emptyState.classList.add('hidden');
    emptyState.classList.remove('flex');

    // 修改了卡片的模板结构中的 Class: 引入毛玻璃、高级投影、平滑动效与 18px 正文
    agentGrid.innerHTML = filteredAgents.map(agent => `
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
                                        <h2 class="font-bold text-[20px] text-slate-800 dark:text-slate-100 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors duration-300 tracking-tight">${agent.name}</h2>
                                        <div class="flex flex-wrap items-center gap-2 mt-1.5">
                                            <span class="inline-flex items-center rounded-lg bg-emerald-500/10 dark:bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-brand-600 dark:text-brand-400 tracking-wide">${agent.category}</span>
                                        </div>
                                    </div>
                                </div>
                                ${agent.hot ? `
                                <span class="flex h-2.5 w-2.5 relative mt-2" title="热门推荐">
                                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 duration-1000"></span>
                                    <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </span>` : ''}
                            </div>
                            
                            <p title="${agent.desc}" class="mt-6 text-[18px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2 prose-reading font-medium">
                                ${agent.desc}
                            </p>

                            <div class="mt-4 flex flex-wrap gap-2">
                                ${agent.tags.map(tag => `
                                    <span class="cursor-pointer text-sm font-medium text-slate-400/80 dark:text-slate-500 hover:text-brand-500 dark:hover:text-brand-400 transition-colors duration-300" onclick="setSearchQuery('${tag}')">#${tag}</span>
                                `).join('')}
                            </div>
                        </div>

                        <div class="mt-8 pt-5 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-sm text-slate-400 relative z-10 font-medium">
                            <span class="flex items-center gap-1.5 opacity-80"><i data-lucide="eye" class="w-4 h-4"></i> 预览 ${agent.views} 次</span>
                            <span data-url="${agent.url}" title="运行 ${agent.name}" class="inline-flex cursor-pointer items-center gap-1.5 font-bold text-brand-500 dark:text-brand-400 hover:text-brand-600 dark:hover:text-brand-300 group/link transition-colors duration-300 run-btn">
                                立即运行 
                                <i data-lucide="arrow-up-right" class="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform duration-300"></i>
                            </span>
                        </div>
                    </article>
                `).join('');
  }
  lucide.createIcons();
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

let categories = ["全部", "热门", "动态演示", "代数函数", "几何图形", "应用题", "备课制卷", "趣味数学"];
const gradeCategories = ["全部学段", "小学", "初中", "高中", "大学", "其他"];

let agents = [
  { id: 11, name: "傅里叶级数波形合成器", category: "动态演示", grades: ["高中", "大学"], desc: "利用 Leafer.js 极速渲染。通过多圆周联动旋转，模拟正弦谐波叠加合成任意波形（方波、三角波），支持鼠标交互调整谐波数量与频率。", tags: ["傅里叶变换", "LeaferJS", "波形合成"], url: "#", icon: "➰", views: "18.4k", hot: true },
  { id: 12, name: "三角函数投影动画生成器", category: "动态演示", grades: ["初中", "高中"], desc: "基于 Leafer.js 的拖拽与联动模型。拖动单位圆上的动点，实时在右侧绘制正弦、余弦、正切函数曲线，将动点轨迹与波形一一对应。", tags: ["三角函数", "单位圆", "动态投影", "LeaferJS"], url: "#", icon: "〰️", views: "16.1k", hot: true },
  { id: 13, name: "蒙特卡洛估算 π 模拟器", category: "动态演示", grades: ["小学", "初中", "高中", "大学"], desc: "利用 Leafer.js 高性能散点渲染（支持百万级图形极速绘制）。向正方形内高频投点，动态统计圆内点数，实时直观演示圆周率估算演算法。", tags: ["蒙特卡洛", "概率统计", "π", "极速渲染"], url: "#", icon: "🎯", views: "12.9k", hot: false },
  { id: 14, name: "GeoGebra to LeaferJS 转换器", category: "备课制卷", grades: ["其他"], desc: "AI 辅助代码转换工具。输入 GeoGebra (ggb) 逻辑，自动将其重构为轻量级的 Leafer.js Canvas 网页原生交互代码，便于嵌入任意教学网站。", tags: ["代码生成", "GGB转换", "H5课件", "LeaferJS"], url: "#", icon: "🔌", views: "14.5k", hot: true },
  { id: 15, name: "圆锥曲线动态连动仪", category: "动态演示", grades: ["高中"], desc: "基于 Leafer.js 的几何约束系统。自由拖动椭圆、双曲线、抛物线的焦点或准线，图形实时随之重绘，并动态输出其偏心率（e）的变化过程。", tags: ["圆锥曲线", "椭圆", "几何轨迹", "解析几何"], url: "#", icon: "🪐", views: "9.8k", hot: false },
  { id: 1, name: "微积分可视化向导", category: "代数函数", grades: ["高中", "大学"], desc: "将抽象的极限、导数及三重积分概念转化为交互式 3D 几何动画，帮助学生直观理解微积分定理。", tags: ["微积分", "3D动画", "可视化"], url: "#", icon: "📈", views: "14.2k", hot: true },
  { id: 2, name: "中考几何模型推演助手", category: "几何图形", grades: ["初中"], desc: "输入复杂的几何图形描述，自动识别经典模型（如半角、手拉手、一线三等角），并输出多解法推导逻辑。", tags: ["初中几何", "模型解题", "多解法"], url: "#", icon: "📐", views: "19.5k", hot: true },
  { id: 3, name: "小学应用题情境重构器", category: "应用题", grades: ["小学"], desc: "将干瘪的“鸡兔同笼”或“行程问题”自动转写为生动的儿童故事，提供“画线段图”和“设未知数”双轨教学课件。", tags: ["小学数学", "思维导图", "情境教学"], url: "#", icon: "🐇", views: "8.9k", hot: false },
  { id: 4, name: "分层作业与试卷生成器", category: "备课制卷", grades: ["小学", "初中", "高中"], desc: "根据老师设定的考察知识点和难度比例，自动从题库和AI生成中，组建包含A/B/C三层难度的个性化测试卷。", tags: ["备课", "分层作业", "LaTeX公式"], url: "#", icon: "📝", views: "22.1k", hot: true },
  { id: 5, name: "数学史与趣味典故大师", category: "趣味数学", grades: ["小学", "初中", "高中", "其他"], desc: "提供数学家逸闻、悖论典故（如芝诺悖论、希尔伯特旅馆）等导入素材，用于活跃课堂氛围、撰写教案引入。", tags: ["课堂导入", "数学史", "素养培养"], url: "#", icon: "🏛️", views: "6.4k", hot: false },
  { id: 7, name: "GeoGebra 脚本极速生成器", category: "几何图形", grades: ["初中", "高中", "大学"], desc: "通过对话描述你想要的动态数学效果，直接生成对应的 GeoGebra 脚本代码或指令，省去复杂的手动建构步骤。", tags: ["GeoGebra", "课件制作", "动态演示"], url: "#", icon: "💻", views: "15.0k", hot: true },
  { id: 9, name: "LaTeX 试题公式美化排版", category: "备课制卷", grades: ["其他"], desc: "扫描或输入手写、截图数学公式，一键转化为完美排版的标准 LaTeX 代码，支持导出为 Word 及 Markdown 格式。", tags: ["LaTeX", "公式转换", "试卷排版"], url: "#", icon: "✨", views: "13.7k", hot: false },
  { id: 10, name: "生活中的数学建模启蒙", category: "趣味数学", grades: ["初中", "高中"], desc: "针对中小学生设计，用数学眼光分析身边事物（如：红绿灯时长设计、外卖配送路线规划），生成跨学科 PBL 案例。", tags: ["数学建模", "PBL项目", "跨学科"], url: "#", icon: "🍕", views: "7.8k", hot: false }
];

let currentCategory = "全部";
let currentGrade = "全部学段";
let searchQuery = "";

const fuseOptions = {
  keys: [
    { name: 'name', weight: 0.4 },
    { name: 'desc', weight: 0.3 },
    { name: 'grades', weight: 0.2 },
    { name: 'tags', weight: 0.1 }
  ],
  threshold: 0.35,
  includeScore: true
};
let fuse = new Fuse(agents, fuseOptions);

document.addEventListener('DOMContentLoaded', function () {
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
      appAgent: "4140329349",
      appName: "appGenerator"
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
          item.desc = item.introduce || item.description || "暂无描述";
          return item;
        });

        agents = agents.sort((a, b) => b.views - a.views);

        fuse = new Fuse(agents, fuseOptions);

        render();
        renderCategories();
      }
      else {
        if (typeof WebTool !== 'undefined') WebTool.showMask("获取 Agent 列表失败，请刷新重试", 5000);
        console.log("获取 Agent 列表失败", res);
      }
    });
  }

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    render();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
  });

  const userTheme = localStorage.getItem("theme");
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (userTheme === "dark" || (!userTheme && systemTheme)) {
    document.documentElement.classList.add("dark");
  }

  themeToggleBtn.addEventListener('click', () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  });

  renderCategories();
  render();
  lucide.createIcons();
});

document.addEventListener('DOMContentLoaded', function () {
  let qParams = WebTool.urlQuery(location.href);
  if (Object.keys(qParams).length !== 0) {
    location.href = WebTool.attachParams("agent.html", qParams);
  }
});