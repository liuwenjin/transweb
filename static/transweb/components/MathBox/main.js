webCpu.regComponent(
  "MathBox",
  {
    css: "mathbox.css",
    script: "script.js",
  },
  function (container, data, task) {

    // ==========================================
    // Utils
    // ==========================================

    const safeColor = (val, fallback) => {
      if (typeof val === "string") return val;
      if (typeof val === "number") return "#" + val.toString(16).padStart(6, "0");
      return fallback;
    };

    const isSafeNum = n => typeof n === "number" && Number.isFinite(n);


    // ==========================================
    // DOM
    // ==========================================

    const targetDOM = typeof container === "string"
      ? document.getElementById(container)
      : container;

    if (!targetDOM || !(targetDOM instanceof HTMLElement)) {
      console.error("[MathBox] invalid container");
      return null;
    }

    if (targetDOM.__mathboxInstance__) {
      targetDOM.__mathboxInstance__.destroy();
    }


    // ==========================================
    // 核心依赖探测
    // ==========================================

    const resolveMathBox = () => {
      if (typeof mathBox !== 'undefined') return mathBox;
      if (typeof window !== 'undefined') {
        return window.MathBox?.mathBox || window.mathBox;
      }
      return null;
    };

    const MB = resolveMathBox();
    if (typeof MB !== 'function') {
      console.error('[MathBox] mathBox constructor not found');
      return null;
    }

    const THREE_ENV = window.THREE || null;
    if (!THREE_ENV) {
      console.error("[MathBox] THREE missing");
      return null;
    }

    const ControlsClass = THREE_ENV.OrbitControls || window.OrbitControls || null;


    // ==========================================
    // Config
    // ==========================================

    const config = {
      camera: {
        position: [3, 2, 3],
        lookAt: [0, 0, 0],
        ...(data?.camera || {})
      },
      coordinate: {
        type: data?.coordinate?.type === "polar" ? "polar" : "cartesian",
        range: data?.coordinate?.range || [[-2, 2], [-2, 2], [-2, 2]],
        scale: data?.coordinate?.scale || [1, 1, 1]
      },
      elements: Array.isArray(data?.elements) ? data.elements : []
    };


    let mathbox = null;

    try {

      // ==========================================
      // Init MathBox
      // ==========================================

      const plugins = ["core", "cursor"];
      if (ControlsClass) plugins.push("controls");

      mathbox = MB({
        element: targetDOM,
        plugins,
        controls: ControlsClass ? { klass: ControlsClass } : undefined,
        cameraControls: true,
        autoresize: true
      });

      const three = mathbox.three;

      if (three.camera) {
        three.camera.position.set(...config.camera.position);
      }

      if (three.renderer) {
        three.renderer.setClearColor(0x0f172a, 1);
      }


      // ==========================================
      // Coordinate
      // ==========================================

      const view = mathbox[config.coordinate.type]({
        range: config.coordinate.range,
        scale: config.coordinate.scale
      });


      // ==========================================
      // Render Elements
      // ==========================================

      config.elements.forEach((elem, index) => {

        try {

          // --------------------------
          // expr compile
          // --------------------------

          if (typeof elem.expr === "string") {
            try {
              elem.expr = new Function("return (" + elem.expr + ")")();
            } catch (e) {
              console.warn("expr parse error", index);
              elem.expr = null;
            }
          }


          // --------------------------
          // grid
          // --------------------------

          if (elem.type === "grid") {
            view.grid({
              width: elem.width || 2,
              divideX: elem.divideX || 10,
              divideY: elem.divideY || 10,
              color: safeColor(elem.color, "#334155"),
              opacity: elem.opacity ?? .8
            });
          }


          // --------------------------
          // axes
          // --------------------------

          else if (elem.type === "axes") {
            view
              .axis({ axis: 1, color: safeColor(elem.colors?.[0], "#ef4444") })
              .axis({ axis: 2, color: safeColor(elem.colors?.[1], "#22c55e") })
              .axis({ axis: 3, color: safeColor(elem.colors?.[2], "#3b82f6") });
          }


          // --------------------------
          // curve
          // --------------------------

          else if (elem.type === "curve" && typeof elem.expr === "function") {
            view.interval({
              width: elem.samples || 128,
              channels: 3,
              expr(emit, x, i, time) {
                try {
                  const p = elem.expr(x, i, time);
                  if (Array.isArray(p) && p.length >= 3 &&
                      isSafeNum(p[0]) && isSafeNum(p[1]) && isSafeNum(p[2])) {
                    emit(p[0], p[1], p[2]);
                  } else {
                    emit(x, 0, 0);
                  }
                } catch (e) {
                  emit(x, 0, 0);
                }
              }
            })
            .line({
              color: safeColor(elem.color, "#38bdf8"),
              width: elem.lineWidth || 4
            });
          }


          // --------------------------
          // surface
          // --------------------------

          else if (elem.type === "surface" && typeof elem.expr === "function") {
            view.area({
              width: elem.samplesX || 40,
              height: elem.samplesY || 40,
              channels: 3,
              expr(emit, x, y, i, j, time) {
                try {
                  const p = elem.expr(x, y, i, j, time);
                  if (p && p.length >= 3 &&
                      isSafeNum(p[0]) && isSafeNum(p[1]) && isSafeNum(p[2])) {
                    emit(p[0], p[1], p[2]);
                  } else {
                    emit(x, y, 0);
                  }
                } catch (e) {
                  emit(x, y, 0);
                }
              }
            })
            .surface({
              color: safeColor(elem.color, "#8b5cf6"),
              shaded: elem.shaded ?? true,
              opacity: elem.opacity ?? .85,
              lineX: elem.showGrid ?? true,
              lineY: elem.showGrid ?? true
            });
          }


          // --------------------------
          // scatter  ——  文字模糊修复核心
          // --------------------------

          else if (elem.type === "scatter" && Array.isArray(elem.points)) {

            const points = elem.points.map(p =>
              Array.isArray(p.position) ? p.position : [0, 0, 0]
            );

            // 1. 位置数据源（给 point 和 label 共用）
            const posNode = view.array({
              data: points,
              channels: 3,
              width: points.length,
              live: false
            });

            // 2. 绘制散点
            posNode.point({
              color: safeColor(elem.color, "#f59e0b"),
              size: elem.size || 15
            });

            // 3. 标签处理
            const labels = elem.points.map(p =>
              p.label ? String(p.label) : ""
            );

            if (labels.some(l => l)) {

              // ✅ 修复 1：使用 format（不是 text）传入字符串数组
              // ✅ 修复 2：detail 从默认 24 提升到 48，SDF 纹理分辨率翻倍
              // ✅ 修复 3：sdf 从默认 5 提升到 8，文字边缘更锐利
              const fmtNode = view.format({
                data: labels,
                font: "sans-serif",
                weight: "normal",
                detail: 48,     // 字体纹理分辨率 ↑
                sdf: 8,         // 有符号距离场范围 ↑
                live: false
              });

              // ✅ 修复 4：label 显式绑定 points 和 text，避免数据源混乱
              // ✅ 修复 5：snap: true 开启像素对齐，消除亚像素模糊
              // ✅ 修复 6：size 适当增大，outline 增强可读性
              view.label({
                points: posNode,           // 位置数据源
                text: fmtNode,             // 文本数据源
                color: safeColor(elem.labelColor, "#ffffff"),
                size: elem.labelSize || 18, // 字号适当放大
                snap: true,                 // 🔑 像素对齐，抗模糊核心
                outline: 2,
                background: safeColor(elem.labelBg, "rgba(15,23,42,0.7)"),
                offset: [0, 18],
                zIndex: 2
              });

            }

          }

        } catch (e) {
          console.warn("element error", index, e);
        }

      });


    } catch (e) {
      console.error("[MathBox] init failed", e);
      cleanup();
      return null;
    }


    // ==========================================
    // Cleanup
    // ==========================================

    function cleanup() {
      try {
        if (mathbox) {
          while (mathbox.children && mathbox.children.length) {
            mathbox.remove(mathbox.children[0]);
          }
          if (mathbox.three && mathbox.three.destroy) {
            mathbox.three.destroy();
          }
          mathbox = null;
        }
      } catch (e) { }
      targetDOM.innerHTML = "";
      delete targetDOM.__mathboxInstance__;
    }


    const instance = { mathbox, destroy: cleanup };
    targetDOM.__mathboxInstance__ = instance;
    return instance;

  }
);
