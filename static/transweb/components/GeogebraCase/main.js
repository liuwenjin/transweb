webCpu.regComponent(
  "GeogebraCase",
  {
    script: {
      deployggb: "deployggb.js",
      fflate: "fflate.js",
      exportSvg: "web3d/js/canvas-to-svg.umd.min.js"
    },
  },
  function (container, data, task) {
    task.orderList = [
      "evalCommand",
      "evalLaTex",
      "evalCommandGetLabels",
      "evalCommandCAS",
    ];

    const typeMap = {
      showToolbar: v => v === "true" || v === true,
    };

    /** 🧹 清理 GeoGebra 脚本文本 **/
    function cleanGGBScript(text) {
      return String(text || "")
        .replace(
          /\b(SetValue|SetClickScript|SetConditionToShowObject|StartAnimation|Button|If|TextTool)\b.*?\n?/g,
          ""
        )
        .replace(/SetColor\(([^,]+),\s*#([0-9A-Fa-f]{6})\)/g, 'SetColor($1,"#$2")')
        .replace(/\n{2,}/g, "\n")
        .replace(/;+/g, "")
        .trim();
    }

    task.updateScript = function (newScript) {
      let applet = this._ggbApplet;
			applet.setXML('');  
      this.executeScript(applet, newScript);
    }

    /** 🧠 执行 GeoGebra 指令 **/
    task.executeScript = function (applet, block) {
      if (!block) return;
      
      const safe = cleanGGBScript(block.value || block);
      safe
        .split(/\n+/)
        .map(c => c.trim())
        .filter(Boolean)
        .forEach(cmd => {
          try {
            applet.evalCommand(cmd);
          } catch (e) {
            console.warn("执行失败：", cmd, e);
          }
        });
    };

    task.updateGeogebra = function (content) {
      this.data = content || this.data || {};
      const container = this.container;

      if (!container) {
        console.warn("❗ GeoGebra 容器不存在");
        return;
      }

      // 🧹 若已有实例，安全注销旧监听器，避免重复绑定
      if (this._ggbApplet && typeof this._ggbApplet.unregisterAddListener === "function") {
        try {
          this._ggbApplet.unregisterAddListener();
        } catch (e) { }
      }

      // 🔥 主动清空容器，确保重新渲染干净
      container.innerHTML = "";

      // 👇 临时 Hook window.addEventListener，将交互事件设为 passive，提升流畅度
      const origAddEvent = window.addEventListener;
      window.addEventListener = function (type, listener, options) {
        if (["wheel", "mousewheel", "touchstart", "touchmove"].includes(type)) {
          options = options === false ? false : Object.assign({}, options, { passive: true });
        }
        origAddEvent.call(this, type, listener, options);
      };

      // 📏 等容器尺寸 ready 再初始化 GeoGebra
      const waitForContainerReady = (callback, maxTries = 12) => {
        let tries = 0;
        const check = () => {
          const { offsetWidth: w, offsetHeight: h } = container;
          if (w > 100 && h > 100) callback(w, h);
          else if (++tries < maxTries) setTimeout(check, 120);
          else callback(w || 320, h || 320);
        };
        check();
      };

      waitForContainerReady((width, height) => {
        const appName = this.data.appName || "suite";
        const params = {
          appName: "suite",
          width,
          height,
          // === 默认视图参数 ===
          showToolBar: WebTool.urlQuery(location.href, 'showToolBar') || false,
          showAlgebraView: false,
          showAlgebraInput: false,
          showAxes: true,      // ✅ 默认显示坐标轴（第一重保证）
          showGrid: false,
          showMenuBar: WebTool.urlQuery(location.href, 'showMenuBar') || false,
          borderColor: "transparent",

          // === 交互能力 ===
          enableShiftDragZoom: true,
          enable3D: true,
          enableLabelDrags: false,
          errorDialogsActive: false,

          perspective: appName === "3d" ? "T" : "G",

          // === 渲染容器 ===
          scaleContainerClass: "ggb-container",

          // === 加载完成回调 ===
          appletOnLoad: (api) => {
            this._ggbApplet = api;
            webCpu.currentGgbApplet = api;
            setTimeout(() => {
              // 读取初始坐标系
              try {
                const props = JSON.parse(api.getViewProperties?.(1) || "{}");
                this._initialCoordSystem = {
                  xmin: props.xMin,
                  xmax: props.xMax,
                  ymin: props.yMin,
                  ymax: props.yMax,
                };
              } catch (e) {
                console.warn("❗ 无法获取初始坐标系:", e);
              }

              // 强制设定最终尺寸
              container.style.width = width + "px";
              container.style.height = height + "px";
              $(container).find(".applet_scaler").css("transform", "scale(1)");

              // === 强制显示坐标轴（第二重保证）===
              try {
                api.setAxesVisible(1, true, true, true);
              } catch (e) {
                console.warn("❗ setAxesVisible 调用失败", e);
              }

              // 若携带 base64 图形，加载
              if (this.data.ggbBase64) {
                try {
                  api.setBase64(this.data.ggbBase64);
                } catch (e) {
                  console.warn("加载 base64 失败", e);
                }
              }

              // 执行用户脚本（若有）
              const scripts = Array.isArray(this.data.script) ? this.data.script : [this.data.script];
              scripts.forEach((s) => {
                if (s && typeof this.executeScript === "function") {
                  this.executeScript(api, s);
                }
              });
            }, 300);
          },
        };

        // 移除用户可能覆盖尺寸的参数
        delete this.data.params?.width;
        delete this.data.params?.height;

        const finalParams = webCpu.attachAttribute(this.data.params || {}, params);

        finalParams.appName = data.appName || finalParams.appName || "suite";

        try {
          const applet = new GGBApplet(finalParams, true);
          applet.inject(container.id || container);
        } catch (e) {
          console.error("GeoGebra 初始化失败", e);
        }
      });

      // 🔄 1秒后恢复 window.addEventListener
      setTimeout(() => {
        window.addEventListener = origAddEvent;
      }, 1000);
    };




    /** 🚀 初始化渲染 **/
    setTimeout(() => task.updateGeogebra(), 200);
  }
);
