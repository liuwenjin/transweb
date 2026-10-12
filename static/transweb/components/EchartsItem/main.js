webCpu.regComponent("EchartsItem", {
  script: "script.js"
}, (container, data, task) => {
  // 1. 容器校验与获取
  const dom = typeof container === 'string' ? document.getElementById(container) : container;
  if (!dom) {
    console.error('RenderError: Invalid container element.');
    return null;
  }

  // 2. 挂载/复用 ECharts 实例 (指定 SVG 渲染模式)
  let chartInstance = echarts.getInstanceByDom(dom);
  if (!chartInstance) {
    chartInstance = echarts.init(dom, null, { renderer: 'svg' });
    window.addEventListener('resize', () => chartInstance.resize());
  }

  // 3. 内部全局主题与样式规范（与业务数据彻底隔离）
  const STYLE_CONFIG = {
    colorPalette: [
      '#5470c6', '#91cc75', '#fac858', '#ee6666', 
      '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'
    ],
    textStyle: {
      fontFamily: 'Helvetica Neue, Helvetica, PingFang SC, Arial, sans-serif',
      color: '#333333'
    },
    titleStyle: {
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 600, color: '#1f2937' }
    },
    grid: {
      top: 60,
      left: '5%',
      right: '5%',
      bottom: '10%',
      containLabel: true
    },
    axisStyle: {
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisTick: { show: false },
      axisLabel: { color: '#6b7280', fontSize: 12 },
      splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151', fontSize: 12 },
      extraCssText: 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-radius: 6px;'
    }
  };

  // 4. 基础 Option 骨架
  const baseOption = {
    color: STYLE_CONFIG.colorPalette,
    textStyle: STYLE_CONFIG.textStyle,
    title: { text: data.title.text || data.title || '', ...STYLE_CONFIG.titleStyle },
    tooltip: STYLE_CONFIG.tooltip,
    legend: { bottom: 10, textStyle: { color: '#6b7280', fontSize: 12 } }
  };

  const chartType = data.type || 'line';

  // 5. 多图表类型适配逻辑矩阵
  switch (chartType) {
    // ------------------ 1. 标准直角坐标系图表 ------------------
    case 'line':
    case 'bar':
    case 'scatter':
    case 'candlestick':
    case 'boxplot':
      baseOption.tooltip.trigger = 'axis';
      baseOption.grid = STYLE_CONFIG.grid;
      baseOption.xAxis = {
        type: 'category',
        data: data.categories || [],
        ...STYLE_CONFIG.axisStyle
      };
      baseOption.yAxis = {
        type: 'value',
        ...STYLE_CONFIG.axisStyle
      };
      
      baseOption.series = data.series.map((s) => ({
        name: s.name,
        type: chartType,
        data: s.data,
        smooth: chartType === 'line',
        symbolSize: chartType === 'scatter' ? 10 : 6,
        barMaxWidth: 30,
        ...(chartType === 'candlestick' && {
          itemStyle: {
            color: '#ef4444', color0: '#22c55e',
            borderColor: '#ef4444', borderColor0: '#22c55e'
          }
        })
      }));
      break;

    // ------------------ 2. 二维热力图 (Heatmap) ------------------
    case 'heatmap':
      baseOption.grid = STYLE_CONFIG.grid;
      baseOption.xAxis = { type: 'category', data: data.categories || [], ...STYLE_CONFIG.axisStyle };
      baseOption.yAxis = { type: 'category', data: data.yCategories || [], ...STYLE_CONFIG.axisStyle };
      baseOption.visualMap = {
        min: 0,
        max: Math.max(...(data.series[0]?.data.map(item => item[2]) || [100])),
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        inRange: { color: ['#f0f9ff', '#0284c7'] }
      };
      baseOption.series = [{
        type: 'heatmap',
        data: data.series[0]?.data || [],
        label: { show: true }
      }];
      break;

    // ------------------ 3. 极坐标系 / 扇形图 ------------------
    case 'pie':
      baseOption.series = [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, formatter: '{b}: {c}' },
        data: data.series[0]?.data || []
      }];
      break;

    case 'radar':
      baseOption.radar = {
        indicator: data.indicators || [],
        axisName: { color: '#6b7280' },
        splitArea: { areaStyle: { color: ['#f9fafb', '#fff'] } },
        splitLine: STYLE_CONFIG.axisStyle.splitLine
      };
      baseOption.series = [{
        type: 'radar',
        data: data.series.map(s => ({ name: s.name, value: s.data }))
      }];
      break;

    // ------------------ 4. 树状 / 层次结构图 ------------------
    case 'tree':
      baseOption.series = [{
        type: 'tree',
        data: data.treeData || [],
        top: '10%', left: '10%', bottom: '10%', right: '20%',
        symbolSize: 8,
        label: { position: 'left', verticalAlign: 'middle', align: 'right', fontSize: 12 },
        leaves: { label: { position: 'right', verticalAlign: 'middle', align: 'left' } },
        expandAndCollapse: true
      }];
      break;

    case 'treemap':
    case 'sunburst':
      baseOption.series = [{
        type: chartType,
        data: data.treeData || [],
        radius: chartType === 'sunburst' ? [0, '75%'] : undefined,
        label: { show: true, fontSize: 11 }
      }];
      break;

    // ------------------ 5. 关系网络与网络流图 ------------------
    case 'graph':
      baseOption.series = [{
        type: 'graph',
        layout: 'force',
        data: data.nodes || [],
        links: data.links || [],
        roam: true,
        label: { show: true, position: 'right' },
        force: { repulsion: 100 }
      }];
      break;

    case 'sankey':
      baseOption.series = [{
        type: 'sankey',
        data: data.nodes || [],
        links: data.links || [],
        emphasis: { focus: 'adjacency' },
        lineStyle: { color: 'gradient', curveness: 0.5 }
      }];
      break;

    // ------------------ 6. 多维/路径/仪表盘 ------------------
    case 'parallel':
      baseOption.parallelAxis = (data.parallelAxis || []).map((axis, idx) => ({
        dim: idx,
        name: axis.name,
        type: axis.type || 'value'
      }));
      baseOption.parallel = { left: '10%', right: '10%', bottom: '15%', top: '20%' };
      baseOption.series = [{
        type: 'parallel',
        lineStyle: { width: 2 },
        data: data.series[0]?.data || []
      }];
      break;

    case 'themeRiver':
      baseOption.singleAxis = {
        type: 'time',
        bottom: '15%',
        ...STYLE_CONFIG.axisStyle
      };
      baseOption.series = [{
        type: 'themeRiver',
        data: data.series[0]?.data || []
      }];
      break;

    case 'gauge':
      baseOption.series = [{
        type: 'gauge',
        progress: { show: true },
        detail: { valueAnimation: true, formatter: '{value}' },
        data: data.series[0]?.data || []
      }];
      break;

    case 'funnel':
      baseOption.series = [{
        type: 'funnel',
        left: '15%', width: '70%',
        label: { show: true, position: 'inside' },
        data: data.series[0]?.data || []
      }];
      break;

    case 'wordCloud':
      baseOption.series = [{
        type: 'wordCloud',
        shape: 'circle',
        gridSize: 8,
        sizeRange: [12, 50],
        rotationRange: [-45, 90],
        textStyle: {
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
          color: () => 'rgb(' + [
            Math.round(Math.random() * 160),
            Math.round(Math.random() * 160),
            Math.round(Math.random() * 160)
          ].join(',') + ')'
        },
        data: data.series[0]?.data || []
      }];
      break;

    default:
      console.warn(`[render2DShape] Unsupported chart type: ${chartType}`);
      return null;
  }

  // 6. 渲染图表
  chartInstance.setOption(baseOption, true);
  task.chart = chartInstance;
  return chartInstance;
});