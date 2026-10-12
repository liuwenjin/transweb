// 实体交付仪式感：动态 Loading 下载拦截动效
const triggerPackDownload = async (btnElement, name) => {
  if (btnElement.classList.contains('tw-pointer-events-none')) return;

  const iconBox = btnElement.querySelector('.btn-icon-box');
  const textBox = btnElement.querySelector('.btn-text-box');

  const originalIcon = iconBox ? iconBox.innerHTML : '📦';
  const originalText = textBox ? textBox.innerText : '打包下载离线静态组件';

  btnElement.classList.add('tw-pointer-events-none', 'tw-opacity-80');
  if (iconBox) {
    iconBox.innerHTML = '⚙️';
    iconBox.classList.add('tw-inline-block', 'animate-spin-slow');
  }
  if (textBox) textBox.innerText = '正在封装物理流水线资产...';

  // 刚性实体压缩封包耗时
  await new Promise(resolve => setTimeout(resolve, 1400));

  try {
    const response = await fetch(`https://transweb.cn/workflow/${name || 'index.html'}`);
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);
    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = name || 'trans-workflow.html';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('打包交付失败:', error);
  } finally {
    btnElement.classList.remove('tw-pointer-events-none', 'tw-opacity-80');
    if (iconBox) {
      iconBox.innerHTML = originalIcon;
      iconBox.classList.remove('tw-inline-block', 'animate-spin-slow');
    }
    if (textBox) textBox.innerText = originalText;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNavPanel = document.getElementById('mobileNavPanel');

  if (!mobileMenuBtn || !mobileNavPanel) return;

  // 切换菜单显示/隐藏
  const toggleMenu = (show) => {
    const isHidden = mobileNavPanel.classList.contains('tw-hidden');
    const forceHide = typeof show === 'boolean' ? !show : !isHidden;

    if (forceHide) {
      // 隐藏面板：同时加上 tw-hidden 和 md:tw-hidden
      mobileNavPanel.classList.add('tw-hidden', 'md:tw-hidden');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
    } else {
      // 显示面板：同时移除 tw-hidden 和 md:tw-hidden
      mobileNavPanel.classList.remove('tw-hidden', 'md:tw-hidden');
      mobileMenuBtn.setAttribute('aria-expanded', 'true');
    }
  };

  // 1. 点击汉堡按钮切换
  mobileMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation(); 
    toggleMenu();
  });

  // 2. 点击菜单内部的链接时，自动收起菜单
  const menuLinks = mobileNavPanel.querySelectorAll('a, button');
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      setTimeout(() => toggleMenu(false), 150);
    });
  });

  // 3. 点击页面其他空白区域，自动收起菜单
  document.addEventListener('click', (e) => {
    const isClickInsideMenu = mobileNavPanel.contains(e.target);
    const isClickBtn = mobileMenuBtn.contains(e.target);

    // 检测只要面板不含有 tw-hidden 并且没包含 md:tw-hidden，就执行关闭
    const isCurrentlyVisible = !mobileNavPanel.classList.contains('tw-hidden') && !mobileNavPanel.classList.contains('md:tw-hidden');

    if (!isClickInsideMenu && !isClickBtn && isCurrentlyVisible) {
      toggleMenu(false);
    }
  });
});

// 锚点平滑过渡
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const hash = this.getAttribute('href');
    if (hash === "#" || hash === "") return;
    const target = document.querySelector(hash);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// 工业级控制台 Iframe 自适应 ResizeObserver 动态 transform 缩放机制
const initIframeResizer = () => {
  const wrapper = document.getElementById('iframeWrapper');
  const container = document.getElementById('workflowIframe');
  const minWidth = 600;

  if (!wrapper || !container) return;

  const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      const currentWidth = entry.contentRect.width;
      if (currentWidth < minWidth) {
        const scale = currentWidth / minWidth;
        container.style.width = `${minWidth}px`;
        container.style.height = `${minWidth / scale}px`;
        container.style.transform = `scale(${scale})`;
        container.style.transformOrigin = 'top left';
      } else {
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.transform = 'none';
      }
    }
  });
  resizeObserver.observe(wrapper);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initIframeResizer);
} else {
  initIframeResizer();
}

function switchScenario(url, description, element) {
  // 1. 切换 iframe 地址
  const iframe = document.getElementById('workflowIframe');
  if (iframe) iframe.src = url;

  // 2. 动态更新顶栏的当前状态描述文字
  const manifesto = document.getElementById('workflow-manifesto');
  if (manifesto) manifesto.textContent = description;

  // 3. 重置所有标签的样式（恢复到未选中暗色状态）
  document.querySelectorAll('.scenario-tab').forEach(tab => {
    tab.classList.remove('tw-bg-slate-800/80', 'tw-border-emerald-500/30', 'tw-shadow-md', 'tw-text-white');
    tab.classList.add('tw-bg-slate-950/40', 'tw-border-slate-800/80', 'tw-text-[#94A3B8]');

    // 恢复子元素的文字颜色
    const title = tab.querySelector('.font-title');
    if (title) {
      title.classList.remove('tw-text-emerald-400');
      title.classList.add('tw-text-slate-300');
    }
  });

  // 4. 为当前点击的标签赋予激活高亮样式
  element.classList.remove('tw-bg-slate-950/40', 'tw-border-slate-800/80', 'hover:tw-bg-slate-800/40', 'hover:tw-border-slate-700', 'tw-text-[#94A3B8]');
  element.classList.add('tw-bg-slate-800/80', 'tw-border-emerald-500/30', 'tw-shadow-md', 'tw-text-white');

  const activeTitle = element.querySelector('.font-title');
  if (activeTitle) {
    activeTitle.classList.remove('tw-text-slate-300');
    activeTitle.classList.add('tw-text-emerald-400');
  }
}

window.addEventListener('message', function (event) {
  // 收到消息后，判断是不是我们约定的下载指令
  if (event.data && event.data.action === 'CROSS_DOMAIN_DOWNLOAD') {
    // 在本地主页面域下安全执行下载，100% 不会报 SecurityError
    WebTool.downloadString(event.data.blob, event.data.name, event.data.mimeType);
  }
});