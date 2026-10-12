webCpu.regComponent(
  "JSXGraph",
  {
    script: {
      jsxgraph: "jsxgraphcore.js",
      math: "math.js"
    },
    css: {
      jsxgraph: "jsxgraph.css"
    }
  },
  function (element, data, task) {
    element.id = element.id || `jsxgraph_${Math.random().toString(36).substring(2, 9)}`;

    // 1. 动态注入响应式容器样式（兼容移动端与桌面端）
    element.style.width = '100%';
    element.style.maxWidth = '100%';
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.style.touchAction = 'none'; // 阻止移动端页面默认下拉刷新和缩放，提升拖拽体验

    // 如果容器没有定义高度，给一个移动端友好的默认宽高比
    if (!element.style.height && !element.offsetHeight) {
      element.style.height = '60vh'; // 默认占据屏幕高度的 60%
    }

    /**
     * JSXGraph JSON DSL 渲染引擎 (支持移动端自适应)
     */
    class JSXGraphRenderer {
      constructor(containerId) {
        this.containerId = containerId;
        this.board = null;
        this.currentDsl = null;
        this.registry = new Map();
        this.animationRegistry = new Map();
        this.resizeObserver = null;
        this.resizeTimer = null;
      }

      render(dsl) {
        this.verifyDependencies();
        if (!this.validateDSL(dsl)) return null;

        this.destroy();
        this.currentDsl = dsl;

        this.board = this.createBoard(dsl.board || {});
        if (!this.board) return null;

        if (Array.isArray(dsl.elements)) {
          dsl.elements.forEach((elem) => this.createElement(elem));
        }

        this.board.update();

        if (Array.isArray(dsl.animations)) {
          dsl.animations.forEach((anim) => this.registerAnimation(anim));
        }

        if (Array.isArray(dsl.actions)) {
          dsl.actions.forEach((action) => this.createAction(action));
        }

        this.board.update();

        // 开启移动端自适应监听
        this.setupResponsiveListener();

        return this.board;
      }

      createBoard(boardSchema) {
        const containerEl = document.getElementById(this.containerId);
        if (!containerEl) {
          console.error(`[JSXGraphRenderer] 未找到容器 [${this.containerId}]`);
          return null;
        }

        const rawBox = boardSchema.boundingbox || [-6, 6, 6, -6];
        const sanitizedBox = this.sanitizeBoundingBox(rawBox, containerEl);

        // 判断是否为移动端
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        return window.JXG.JSXGraph.initBoard(this.containerId, {
          boundingbox: sanitizedBox,
          axis: boardSchema.axis !== false,
          grid: boardSchema.grid !== false,
          keepaspectratio: true, // 核心：保持像素比 1:1，防椭圆
          showCopyright: false,
          showNavigation: boardSchema.showNavigation || false,

          // --- 移动端特化增强配置 ---
          pan: {
            enabled: true,
            needShift: false, // 移动端直接单指拖拽平移
            needTwoFingers: false
          },
          zoom: {
            factorX: 1.25,
            factorY: 1.25,
            wheel: true,
            needShift: false,
            pinch: true // 开启移动端双指缩放
          },
          // 增大部分元素的感应范围，提升移动端手指触控体验
          attributes: {
            point: { size: isMobile ? 5 : 3 },
            line: { snapSizeX: 0.2, snapSizeY: 0.2 }
          }
        });
      }

      createElement(elem) {
        const { id, type, parents, attributes = {} } = elem;

        try {
          let resolvedParents = parents;

          if (type === 'line' || type === 'segment') {
            resolvedParents = parents.map((p) => {
              if (typeof p === 'string' && !p.startsWith('$expr:')) {
                const targetPt = this.registry.get(p);
                if (!targetPt) return null;
                return targetPt;
              }

              if (Array.isArray(p)) {
                const ptX = this.resolveValue(p[0]);
                const ptY = this.resolveValue(p[1]);
                return this.board.create('point', [ptX, ptY], { visible: false });
              }

              return this.resolveValue(p);
            });

            if (resolvedParents.some((p) => !p)) return null;
          } else {
            resolvedParents = this.resolveValue(parents);
          }

          const instance = this.board.create(type, resolvedParents, attributes);
          if (id && instance) {
            this.registry.set(id, instance);
          }
          return instance;
        } catch (error) {
          console.error(`[JSXGraphRenderer] 创建元素失败 [${id || type}]:`, error);
          return null;
        }
      }

      createAction(action) {
        const { id, type = 'button', parents = [], attributes = {} } = action;

        const resolvedParents = parents.map((p) => {
          if (typeof p === 'string' && p.startsWith('$action:')) {
            const actionString = p.replace('$action:', '').trim();
            return () => this.executeAction(actionString);
          }
          return this.resolveValue(p);
        });

        const instance = this.board.create(type, resolvedParents, attributes);
        if (id && instance) {
          this.registry.set(id, instance);
        }
      }

      resolveValue(param) {
        if (Array.isArray(param)) {
          return param.map((item) => this.resolveValue(item));
        }

        if (typeof param === 'string' && param.startsWith('$expr:')) {
          let rawExpr = param.replace('$expr:', '').trim().replace(/\\([a-zA-Z]+)/g, '$1');

          return (xValue) => {
            const context = { x: xValue !== undefined ? xValue : 0 };

            this.registry.forEach((instance, id) => {
              if (typeof instance.Value === 'function') {
                context[id] = instance.Value();
              }
              if (window.JXG && instance.elementClass === window.JXG.OBJECT_CLASS_POINT) {
                context[`${id}_x`] = instance.X();
                context[`${id}_y`] = instance.Y();
              }
            });

            const isStringExpr = /['"]/.test(rawExpr);

            if (isStringExpr) {
              try {
                let cleanedJS = rawExpr.replace(/\^/g, '**');
                const keys = Object.keys(context);
                const values = Object.values(context);

                const dynamicFn = new Function(
                  ...keys,
                  `
                const { 
                  abs, sqrt, sin, cos, tan, acos, asin, atan, atan2, 
                  PI, pow, max, min, round, floor, ceil 
                } = Math;
                return ${cleanedJS};
                `
                );
                return dynamicFn(...values);
              } catch (e) {
                return '';
              }
            } else {
              try {
                const sanitizedExpr = this.sanitizeExpression(rawExpr);
                const compiledExpr = window.math.compile(sanitizedExpr);
                return compiledExpr.evaluate(context);
              } catch (e) {
                return 0;
              }
            }
          };
        }

        if (typeof param === 'string' && this.registry.has(param)) {
          return this.registry.get(param);
        }

        return param;
      }

      registerAnimation(animConfig) {
        const { id, target, type, params = {} } = animConfig;
        if (!target) return;

        const targetElement = this.registry.get(target);
        if (!targetElement) return;

        this.animationRegistry.set(id, {
          start: () => this.runAnimation(targetElement, type, params),
          stop: () => this.stopAnimation(targetElement)
        });
      }

      runAnimation(element, type, params = {}) {
        const { destination, duration = 2000, steps = 50 } = params;

        switch (type) {
          case 'moveGlider':
          case 'animatePoint': {
            const interval = Math.floor(duration / steps);
            if (typeof element.startAnimation === 'function') {
              element.startAnimation(1, steps, interval);
            }
            break;
          }
          case 'moveTo': {
            if (Array.isArray(destination) && destination.length === 2) {
              if (typeof element.moveTo === 'function') {
                element.moveTo(destination, duration);
              }
            }
            break;
          }
          case 'fade': {
            const { startOpacity = 0, endOpacity = 1 } = params;
            element.setAttribute({ opacity: startOpacity });

            let currentStep = 0;
            const totalSteps = 20;
            const opacityStep = (endOpacity - startOpacity) / totalSteps;

            const timer = setInterval(() => {
              currentStep++;
              const newOpacity = startOpacity + opacityStep * currentStep;
              element.setAttribute({ opacity: newOpacity });

              if (this.board) this.board.update();

              if (currentStep >= totalSteps) {
                clearInterval(timer);
              }
            }, duration / totalSteps);
            break;
          }
        }
      }

      stopAnimation(element) {
        if (element && typeof element.stopAnimation === 'function') {
          element.stopAnimation();
        }
      }

      executeAction(actionString) {
        const startMatch = actionString.match(/^startAnimation\('(.+)'\)$/);
        if (startMatch) {
          const anim = this.animationRegistry.get(startMatch[1]);
          if (anim && typeof anim.start === 'function') anim.start();
          return;
        }

        const stopMatch = actionString.match(/^stopAnimation\('(.+)'\)$/);
        if (stopMatch) {
          const anim = this.animationRegistry.get(stopMatch[1]);
          if (anim && typeof anim.stop === 'function') anim.stop();
          return;
        }

        if (actionString === 'resetSliders') {
          this.registry.forEach((instance) => {
            if (window.JXG && instance.type === window.JXG.OBJECT_TYPE_SLIDER && instance.defaultInterval) {
              instance.setValue(instance.defaultInterval[2]);
            }
          });
          if (this.board) this.board.update();
        }
      }

      sanitizeExpression(expr) {
        return expr.replace(/(\d)([a-zA-Z])/g, '$1 * $2').replace(/²/g, '^2').replace(/³/g, '^3');
      }

      /**
       * 针对移动端容器缩放矫正 boundingbox
       */
      sanitizeBoundingBox(rawBox, containerEl) {
        if (!Array.isArray(rawBox) || rawBox.length !== 4) {
          return [-6, 6, 6, -6];
        }

        let [xmin, ymax, xmax, ymin] = rawBox;
        const rect = containerEl.getBoundingClientRect();
        const width = rect.width || 300;
        const height = rect.height || 300;
        const containerRatio = width / height;

        const ySpan = ymax - ymin;
        const targetXSpan = ySpan * containerRatio;
        const xCenter = (xmin + xmax) / 2;

        xmin = xCenter - targetXSpan / 2;
        xmax = xCenter + targetXSpan / 2;

        return [xmin, ymax, xmax, ymin];
      }

      /**
       * 设置响应式与屏幕旋转监听
       */
      setupResponsiveListener() {
        const containerEl = document.getElementById(this.containerId);
        if (!containerEl) return;

        const handleResize = () => {
          if (!this.board || !this.currentDsl) return;

          // 获取当前最新尺寸并重调画布
          this.board.resizeContainer(containerEl.clientWidth, containerEl.clientHeight);

          // 重新计算并应用不拉伸的 boundingbox
          const rawBox = this.currentDsl.board?.boundingbox || [-6, 6, 6, -6];
          const newBox = this.sanitizeBoundingBox(rawBox, containerEl);
          this.board.setBoundingBox(newBox, true);

          this.board.update();
        };

        // 1. 使用 ResizeObserver 监听容器尺寸变化（包括 Flexbox 伸缩、父级调整等）
        if (window.ResizeObserver) {
          this.resizeObserver = new ResizeObserver(() => {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(handleResize, 100); // 100ms 防抖
          });
          this.resizeObserver.observe(containerEl);
        }

        // 2. 监听屏幕旋转事件 (Orientation Change)
        window.addEventListener('orientationchange', handleResize);
      }

      validateDSL(dsl) {
        return dsl && typeof dsl === 'object' && dsl.board && Array.isArray(dsl.elements);
      }

      verifyDependencies() {
        if (!window.JXG) throw new Error('[JSXGraphRenderer] 缺少 window.JXG');
        if (!window.math) throw new Error('[JSXGraphRenderer] 缺少 window.math');
      }

      destroy() {
        if (this.resizeObserver) {
          this.resizeObserver.disconnect();
          this.resizeObserver = null;
        }
        if (this.board) {
          window.JXG.JSXGraph.freeBoard(this.board);
          this.board = null;
        }
        this.registry.clear();
        this.animationRegistry.clear();
      }
    }

    // 初始化与绑定
    task.renderer = new JSXGraphRenderer(element.id);
    task.renderer.render(data);

    task.reloadScene = function () {
      if (this.renderer) this.renderer.render(data);
    };

    task.destroyScene = function () {
      if (this.renderer) this.renderer.destroy();
    };
  }
);
