<template>
  <div class="tw-font-sans">
    <!-- Hero -->
    <section class="slognArea tw-text-white tw-text-center tw-py-20 tw-px-4">
      <h1
        class="tw-text-3xl md:tw-text-2xl tw-font-bold tw-mb-4"
        v-html="
          $t('sloganLabel', {
            fast: '<span>极速</span>',
            ai: '<span>AI</span>',
          })
        "
      ></h1>
      <p
        class="tw-text-lg md:tw-text-xl tw-mb-8"
        v-html="$t('slogan1Label')"
      ></p>
      <div class="tw-flex tw-justify-center tw-gap-4 tw-flex-wrap">
        <el-button
          @click="startBuildApp()"
          size="large"
          type="primary"
          class="buildAppBtn"
          ><svg
            class="tw-w-6 tw-h-6 tw-mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            ></path></svg
          >{{ $t("confirmButton") }}</el-button
        >
        <el-button
          @click="viewIntroduceVideo()"
          style="margin-top: 5px"
          round
          size="large"
          type="text"
          class="viewVideoButton"
          ><i class="bi bi-play icon-play" style="font-size: 40px"></i
          >{{ $t("viewVideoButton") }}</el-button
        >
      </div>
    </section>

    <!-- 三步流程 -->
    <section
      ref="stepListContainer"
      class="relative tw-bg-white tw-py-16 tw-px-4"
    >
      <div class="relative tw-max-w-6xl tw-mx-auto stepCardsArea">
        <h2 class="tw-text-2xl tw-font-bold tw-text-center tw-mb-16">
          3 步构建专属 AI 应用
        </h2>

        <!-- 使用 Element Plus 响应式布局 -->
        <el-row :gutter="24" justify="center">
          <el-col
            v-for="(step, i) in steps"
            :key="i"
            :xs="24"
            :sm="24"
            :md="8"
            :lg="8"
            class="tw-flex tw-flex-col tw-items-center tw-text-center tw-mb-8 md:tw-mb-0"
          >
            <div
              :class="`tw-flex tw-flex-col tw-items-center tw-z-10 tw-flex-1 stepItem-${
                i + 1
              }`"
            >
              <!-- 圆圈图标 -->
              <div
                style="margin: auto"
                :class="`step-icon-container tw-w-20 tw-h-20 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-shadow-xl tw-text-4xl tw-bg-gradient-to-br tw-from-white tw-to-gray-50 tw-border-4 tw-border-gray-200 tw-z-10 step-${
                  i + 1
                }`"
              >
                {{ step.icon }}
              </div>

              <!-- 文字说明 -->
              <div class="tw-mt-4 tw-max-w-[10rem]">
                <h3 class="tw-font-bold tw-mb-2">{{ step.title }}</h3>
                <p class="tw-text-sm">{{ step.description }}</p>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </section>

    <!-- 特性介绍 -->
    <section class="tw-bg-gray-50 tw-py-16 tw-px-4">
      <div
        class="tw-max-w-6xl tw-mx-auto tw-flex md:tw-grid-cols-2 tw-gap-8 tw-items-center"
      >
        <el-image
          style="max-width: 500px; width: 100%; height: auto"
          src="/assets/images/rocket.png"
          fit="contain"
        ></el-image>
        <div
          style="
            display: inline-block;
            max-width: 500px;
            width: 100%;
            height: auto;
          "
        >
          <h2 class="tw-text-2xl tw-font-bold tw-mb-4">
            构建过程智能高效，自动化部署
          </h2>
          <ul
            class="tw-space-y-3 tw-text-gray-700 tw-text-base tw-leading-relaxed tw-pr-5"
          >
            <li>✅ 支持 AI 分析需求描述，并生成应用模板</li>
            <li>✅ 支持 AI 辅助生成功能组件(积木)</li>
            <li>✅ 超高自由度的组件拼装，智能编译，极速整合</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 用户评价 -->
    <section class="tw-bg-white tw-py-20 tw-px-4 tw-max-w-6xl tw-mx-auto">
      <h2 class="tw-text-4xl tw-font-bold tw-text-center tw-mb-12">
        我们的用户正在 <span class="tw-text-pink-500">Transweb</span> 打造他们的
        AI 应用
      </h2>

      <el-row :gutter="24" justify="center">
        <el-col
          v-for="(quote, index) in testimonials"
          :key="index"
          :xs="24"
          :sm="12"
          :md="8"
          class="tw-mb-8"
        >
          <el-card
            shadow="hover"
            class="tw-h-full tw-rounded-2xl tw-p-6 tw-transition-all tw-duration-300 hover:tw-shadow-2xl hover:tw-scale-105"
          >
            <div class="tw-flex tw-flex-col tw-h-full">
              <p
                class="tw-italic tw-text-gray-700 tw-leading-relaxed tw-mb-6 tw-flex-grow"
              >
                “{{ quote.content }}”
              </p>
              <div class="roleItemInfo" style="width: 100%">
                <span
                  style="margin-right: 5px"
                  class="tw-font-semibold tw-text-gray-900"
                  >{{ quote.author || "匿名用户" }}</span
                >
                <span class="tw-text-sm tw-text-gray-500">{{
                  quote.role || "用户"
                }}</span>
              </div>
              <el-rate
                style="width: 100%; text-align: right"
                v-model="quote.rating"
                disabled
                show-score
                text-color="#f59e0b"
                score-template="{value} 分"
              ></el-rate>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <section class="tw-bg-gray-50 tw-py-16 tw-px-4">
      <h2 class="tw-text-2xl tw-font-bold tw-text-center tw-mb-12">
        AI 应用示例【智能备考评测】
      </h2>
      <div
        class="tw-max-w-6xl tw-mx-auto md:tw-grid-cols-2 tw-gap-8 tw-items-center tw-flex"
      >
        <el-image
          style="max-width: 500px; width: 100%; height: auto"
          src="/assets/images/examPreparation.png"
          fit="contain"
        ></el-image>
        <div>
          <h5 class="tw-text-xl tw-font-bold tw-mb-4">
            生成具备智能备考评测功能的动态网页文档
          </h5>
          <ul
            class="tw-space-y-3 tw-text-gray-700 tw-text-base tw-leading-relaxed tw-pr-5"
          >
            <li>支持使用指定的平台大模型或智能体生成内容</li>
            <li>支持生成动态网页文档的二维码海报</li>
            <li>
              <a
                target="blank"
                class="text-success"
                href="https://transweb.cn/?agent=1714628260&appName=examPreparation"
                >点击试用</a
              >
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="tw-bg-white tw-py-16 tw-px-4">
      <h2 class="tw-text-2xl tw-font-bold tw-text-center tw-mb-12">
        动态网页文档示例《人教版七年级数学上下册》
      </h2>
      <div
        class="tw-max-w-6xl tw-mx-auto md:tw-grid-cols-2 tw-gap-8 tw-items-center tw-flex"
      >
        <div
          style="
            display: inline-block;
            max-width: 500px;
            width: 100%;
            height: auto;
          "
        >
          <h5 class="tw-text-xl tw-font-bold tw-mb-4">
            检测学员对七年级数学知识掌握薄弱项
          </h5>
          <ul
            class="tw-space-y-3 tw-text-gray-700 tw-text-base tw-leading-relaxed tw-pr-5"
          >
            <li>支持参与检测相关的人机互动流程</li>
            <li>支持发布者进行积分定价和编辑权限控制</li>
            <li>支持权限持有者编辑网页的多维数据</li>
            <li>
              <a
                target="blank"
                class="text-success"
                href="https://transweb.cn/?id=96beed164dcd459a601454469335a552"
                >点击预览</a
              >
            </li>
          </ul>
        </div>
        <el-image
          style="max-width: 500px; width: 100%; height: auto"
          src="/assets/images/documentExample.png"
          fit="contain"
        ></el-image>
      </div>
    </section>

    <!-- Footer -->
    <footer
      class="tw-bg-gray-50 tw-text-center tw-text-gray-500 tw-py-8 tw-text-sm tw-border-t tw-border-gray-200"
    >
      <p>
        © 2025 Transweb •
        <a
          href="#"
          @click="displayArticleDialog('privacy')"
          class="text-success hover:tw-underline"
          >{{ $t("privacy") }}</a
        >
        •
        <a
          href="#"
          @click="displayArticleDialog('terms')"
          class="text-success hover:tw-underline"
          >{{ $t("terms") }}</a
        >
      </p>
      <p>
        <a class="text-success" href="https://beian.miit.gov.cn/" target="blank"
          >互联网ICP备案：京ICP备17026815号-1</a
        >
      </p>
    </footer>
  </div>
</template>

<script>
export default {
  style: {
    width: 1200,
    height: 1000,
    overflow: "auto",
  },
  name: "LandingPage",
  data() {
    return {
      videoUrl:
        "https://transweb-1254183942.cos.ap-beijing.myqcloud.com/videos/introduce.mp4",
      mdMap: {
        about: "/assets/about.md",
        privacy: "/assets/privacy.md",
        terms: "/assets/terms.md",
        contact: "/assets/contact.md",
        about_en: "/assets/about_en.md",
        privacy_en: "/assets/privacy_en.md",
        terms_en: "/assets/terms_en.md",
        contact_en: "/assets/contact_en.md",
      },
      flag: WebTool.adjustSize([false, false, true]),
      steps: [
        {
          icon: "📄",
          title: "选择模板",
          description: "挑选应用模板，支持自定义模板",
        },
        {
          icon: "🧩",
          title: "配置和拼装",
          description: "配置基本信息 + 拼装功能积木",
        },
        {
          icon: "⚡",
          title: "一键上线",
          description: "立即部署分享链接，访问即用",
        },
      ],
      testimonials: [
        {
          content: "我不会写代码，但做了个快速组卷 AI 工具，大家都在用。",
          author: "Judy",
          role: "老师",
          avatar: "https://transweb.cn/webApps/document/logo.png",
          rating: 5,
        },
        {
          content: "3 分钟内就构建了一个专业笔记助手，太快了！",
          author: "Alex",
          role: "产品经理",
          avatar: "https://transweb.cn/webApps/document/logo.png",
          rating: 4.5,
        },
        {
          content: "再也不用写复杂代码，太好用了！",
          author: "小张",
          role: "创业者",
          avatar: "https://transweb.cn/webApps/document/logo.png",
          rating: 5,
        },
      ],
      wavePath: "",
      connector: (function (elem) {
        let svg,
          group,
          ro,
          defs,
          styleInserted = false;
        const connections = new Map();
        const DEFAULTS = {
          stroke: "#5EB970",
          strokeWidth: 2,
          arrow: "none", // "none" | "start" | "end" | "both"
          dashed: false,
          dashArray: "8,6",
          wave: false,
          animate: false,
          speed: 1,
          fromAnchor: "rightCenter",
          toAnchor: "leftCenter",
        };

        function ensureStyle() {
          if (styleInserted) return;
          const s = document.createElement("style");
          s.textContent = `
      @keyframes connector-dashmove { to { stroke-dashoffset: -1000; } }
    `;
          document.head.appendChild(s);
          styleInserted = true;
        }

        function init(container) {
          if (svg) return;
          ensureStyle();
          svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          svg.id = "connector-svg";
          Object.assign(svg.style, {
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            overflow: "visible",
            zIndex: 1,
          });

          defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
          svg.appendChild(defs);

          group = document.createElementNS("http://www.w3.org/2000/svg", "g");
          group.classList.add("pathGroup");
          svg.appendChild(group);

          container.appendChild(svg);

          ro = new ResizeObserver(() => scheduleUpdate());
          window.addEventListener("resize", scheduleUpdate);
          window.addEventListener("scroll", scheduleUpdate, true);
        }

        function toSvgCoords(clientX, clientY) {
          const pt = svg.createSVGPoint();
          pt.x = clientX;
          pt.y = clientY;
          const ctm = svg.getScreenCTM();
          return ctm
            ? pt.matrixTransform(ctm.inverse())
            : {
                x: clientX,
                y: clientY,
              };
        }

        function getElementAnchor(el, anchor = "center") {
          const r = el.getBoundingClientRect();
          let cx = r.left,
            cy = r.top;
          if (anchor === "center") {
            cx = r.left + r.width / 2;
            cy = r.top + r.height / 2;
          } else if (anchor === "rightCenter") {
            cx = r.left + r.width;
            cy = r.top + r.height / 2;
          } else if (anchor === "leftCenter") {
            cx = r.left;
            cy = r.top + r.height / 2;
          } else if (anchor === "topCenter") {
            cx = r.left + r.width / 2;
            cy = r.top;
          } else if (anchor === "bottomCenter") {
            cx = r.left + r.width / 2;
            cy = r.top + r.height;
          }
          return toSvgCoords(cx, cy);
        }

        function makeBezierD(p1, p2) {
          const dx = Math.abs(p2.x - p1.x);
          const curvature = Math.min(0.5, dx / 200);
          const cp1 = {
            x: p1.x + (p2.x > p1.x ? dx * curvature : -dx * curvature),
            y: p1.y,
          };
          const cp2 = {
            x: p2.x - (p2.x > p1.x ? dx * curvature : -dx * curvature),
            y: p2.y,
          };
          return `M ${p1.x} ${p1.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${p2.x} ${p2.y}`;
        }

        function makeWaveD(p1, p2, opts = {}) {
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 2) return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;

          const steps = Math.max(6, Math.min(60, Math.round(distance / 12)));
          const freq = opts.freq || 2;
          const ampBase = opts.amp || Math.min(20, distance / 10);

          const angle = Math.atan2(dy, dx);
          const nx = -Math.sin(angle);
          const ny = Math.cos(angle);

          const points = [];
          for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const wave = Math.sin(t * Math.PI * 2 * freq);
            const offset = wave * ampBase;
            const x = p1.x + dx * t + nx * offset;
            const y = p1.y + dy * t + ny * offset;
            points.push([x, y]);
          }

          let d = `M ${points[0][0]} ${points[0][1]}`;
          for (let i = 1; i < points.length - 1; i++) {
            const cx = points[i][0],
              cy = points[i][1];
            const nxp = (points[i][0] + points[i + 1][0]) / 2;
            const nyp = (points[i][1] + points[i + 1][1]) / 2;
            d += ` Q ${cx} ${cy} ${nxp} ${nyp}`;
          }
          const last = points[points.length - 1];
          d += ` T ${last[0]} ${last[1]}`;
          return d;
        }

        // 🔑 箭头创建：每次都用 strokeColor
        function ensureMarker(id, strokeColor) {
          let marker = defs.querySelector(`#${id}`);
          if (!marker) {
            marker = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "marker"
            );
            marker.setAttribute("id", id);
            marker.setAttribute("markerWidth", "4");
            marker.setAttribute("markerHeight", "4");
            marker.setAttribute("refX", "4");
            marker.setAttribute("refY", "2");
            marker.setAttribute("orient", "auto");
            marker.setAttribute("markerUnits", "strokeWidth");

            const p = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "path"
            );
            p.setAttribute("d", "M 0 0 L 4 2 L 0 4 z");
            marker.appendChild(p);
            defs.appendChild(marker);
          }
          const path = marker.querySelector("path");
          path.setAttribute("fill", strokeColor); // ⚡ 直接使用线条颜色
          return `url(#${id})`;
        }

        function create(id, fromEl, toEl, userOpts = {}) {
          if (!svg) init();

          if (connections.has(id)) {
            console.warn("Connector.create: id exists:", id);
            return connections.get(id);
          }

          const opts = Object.assign({}, DEFAULTS, userOpts);
          if (typeof opts.arrow === "boolean") {
            opts.arrow = opts.arrow ? "end" : "none";
          }

          const path = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
          );
          path.setAttribute("stroke", opts.stroke);
          path.setAttribute("stroke-width", opts.strokeWidth);
          path.setAttribute("fill", "none");

          if (opts.dashed || opts.animate) {
            path.setAttribute("stroke-dasharray", opts.dashArray);
          }

          if (opts.arrow === "end" || opts.arrow === "both") {
            path.setAttribute(
              "marker-end",
              ensureMarker(`arrow-end-${id}`, opts.stroke)
            );
          }
          if (opts.arrow === "start" || opts.arrow === "both") {
            path.setAttribute(
              "marker-start",
              ensureMarker(`arrow-start-${id}`, opts.stroke)
            );
          }

          if (opts.animate) {
            if (!path.getAttribute("stroke-dasharray")) {
              path.setAttribute("stroke-dasharray", opts.dashArray);
            }
            const dur = Math.max(0.05, 1 / (opts.speed || 1));
            path.style.animation = `connector-dashmove ${dur}s linear infinite`;
          }

          group.appendChild(path);

          const conn = {
            id,
            from: fromEl,
            to: toEl,
            pathEl: path,
            opts,
          };
          connections.set(id, conn);

          try {
            ro.observe(fromEl);
          } catch (e) {}
          try {
            ro.observe(toEl);
          } catch (e) {}

          update(id);
          return conn;
        }

        function update(id) {
          const conn = connections.get(id);
          if (!conn) return;
          const { from, to, pathEl, opts } = conn;
          const p1 = getElementAnchor(from, opts.fromAnchor);
          const p2 = getElementAnchor(to, opts.toAnchor);

          const d = opts.wave
            ? makeWaveD(p1, p2, {
                amp: opts.amp,
                freq: opts.freq,
              })
            : makeBezierD(p1, p2);
          pathEl.setAttribute("d", d);
        }

        function updateAll() {
          connections.forEach((_, id) => update(id));
        }

        function remove(id) {
          const conn = connections.get(id);
          if (!conn) return;
          try {
            conn.pathEl.remove();
          } catch (e) {}
          connections.delete(id);
        }

        function list() {
          return Array.from(connections.keys());
        }

        let raf = null;

        function scheduleUpdate() {
          if (raf) cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => {
            updateAll();
            raf = null;
          });
        }

        function dispose() {
          if (raf) cancelAnimationFrame(raf);
          raf = null;
          window.removeEventListener("resize", scheduleUpdate);
          window.removeEventListener("scroll", scheduleUpdate, true);
          if (ro) {
            try { ro.disconnect(); } catch (e) {}
            ro = null;
          }
          if (svg && svg.parentNode) {
            try { svg.parentNode.removeChild(svg); } catch (e) {}
            svg = null;
          }
          connections.clear();
        }

        return {
          init,
          create,
          update,
          updateAll,
          remove,
          list,
          dispose,
        };
      })(),
    };
  },
  mounted() {
    if (!this.flag) {
      this.drawWavePath();
    }
  },
  beforeUnmount() {
    if (this.connector && typeof this.connector.dispose === "function") {
      this.connector.dispose();
    }
  },
  methods: {
    drawWavePath() {
      let sContainer = this.$refs.stepListContainer;
      this.connector.init(sContainer); // 初始化 SVG 层
      const A = document.querySelector(".step-1");
      const B = document.querySelector(".step-2");
      const C = document.querySelector(".step-3");

      // 创建一条连接
      this.connector.create("A-B", A, B, {
        stroke: "#666666",
        strokeWidth: 2,
        dashed: false,
        dashArray: "8,6",
        arrow: "end",
        speed: 0.1,
        wave: true,
        animate: true,
      });
      this.connector.create("B-C", B, C, {
        stroke: "#5EB970",
        strokeWidth: 2,
        arrow: "end",
        dashed: true,
        arrow: "end",
        speed: 0.1,
        wave: true,
        animate: true,
      });

      // 手动更新
      this.connector.updateAll();
    },
    /** 动态生成波浪路径 */
    generateWavePath(width, height, amplitude, count) {
      if (count < 2) return "";
      const stepGap = width / (count - 1);
      let path = `M 0 ${height}`;
      for (let i = 1; i < count; i++) {
        const x = stepGap * i;
        const cpX = x - stepGap / 2;
        const cpY = i % 2 === 0 ? height - amplitude : height + amplitude;
        path += ` Q ${cpX} ${cpY}, ${x} ${height}`;
      }
      return path;
    },
    /** 更新路径（容器宽度变化时调用） */
    updateWavePath() {
      this.$nextTick(() => {
        const container = this.$el.querySelector(".stepCardsArea");
        if (container) {
          const width = container.offsetWidth;
          this.wavePath = this.generateWavePath(
            width,
            20,
            20,
            this.steps.length
          );
        }
      });
    },
    startBuildApp() {
      if (localStorage.folderName) dialogMap.newAppDialog();
      else {
        this.$message({
          type: "warning",
          message: this.$t("loginTips"),
        });
        dialogMap.openLoginDialog(document.body, () =>
          dialogMap.newAppDialog()
        );
      }
    },
    displayArticleDialog(name) {
      let key = name,
        path = this.mdMap[lang === "en" ? name + "_en" : name];
      webCpu.CardItem.renderCardDialog(
        document.body,
        {
          className: "MarkdownArticle",
          dsl: {
            url: path,
            requestType: "get",
            dataType: "text",
            style: {
              padding: "30px 20px 10px 20px",
              overflow: "auto",
              background: "#fff",
            },
          },
        },
        {
          dialogName: "articleViewDialog",
          closeType: "back",
          title: webCpu.messages[lang][key],
          titleStyle: {
            background: "var(--el-color-primary-light-9)",
            color: "var(--el-color-primary)",
          },
        },
        {
          width: "800px",
          height: this.flag ? "100%" : "95%",
          borderRadius: "5px",
        }
      );
    },
    viewIntroduceVideo() {
      window.tranformRadio = window.transformRadio || 1;
      let html = `<div class="video-container" style="transform:scale(${
        1 / window.transformRadio
      }); transform-origin:top left; width:${
        window.transformRadio * 100
      }%; height:${
        454 * window.transformRadio
      }px;"><video class="video-js vjs-default-skin" data-setup='{"controls":true,"controlBar":{"playToggle":true,"volumePanel":true,"currentTimeDisplay":true,"timeDivider":true,"durationDisplay":true,"fullscreenToggle":false}}' controls style="width:100%; height:100%;"><source src="${
        this.videoUrl
      }" type="video/mp4"></video></div>`;
      webCpu.CardItem.htmlDialog(
        document.body,
        this.$t("viewVideoButton"),
        html,
        {
          dialogName: "articleViewDialog",
          closeType: "back",
          titleStyle: {
            background: "var(--el-color-primary-light-9)",
            color: "var(--el-color-primary)",
          },
        },
        {
          width: "800px",
          height: "400px",
          borderRadius: "5px",
        }
      );
    },
  },
};
</script>

<style scoped>
video::-webkit-media-controls-fullscreen-button {
  display: none;
}

.slognArea {
  position: relative;
}

.buildAppBtn {
  color: #fff;
  transition: background-color 0.2s ease, transform 0.1s ease;
  padding: 20px 30px;
  border-radius: 50px;
  font-size: 18px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: solid 2px #fff;
  color: #fff;
}

.buildAppBtn:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(255, 111, 0, 0.6);
}

.buildAppBtn {
  animation: pulse 2s infinite ease-in-out;
}

.buildAppBtn:hover {
  animation-play-state: paused;
}

.viewVideoButton {
  color: #fff;
}

.viewVideoButton:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.8),
    0 0 20px rgba(255, 255, 255, 0.6);
}

.viewVideoButton .icon-play {
  transition: transform 0.3s ease-in-out;
}

.viewVideoButton:hover .icon-play {
  transform: scale(1.1);
}

.slognArea {
  text-shadow: 1px 1px 1px #999;
}

.slognArea h1 {
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
}

.slognArea h1 > span {
  color: #0ca598;
  text-shadow: 1px 1px 1px #fff, -1px 1px 1px #fff, 1px -1px 1px #fff,
    -1px -1px 1px #fff;
}

/* 步骤图标容器基础样式 */
.step-icon-container {
  /* 基础样式同方案一 */
  position: relative;
  /* 确保伪元素定位正确 */
  overflow: hidden;
  /* 隐藏超出边界的伪元素 */
}

/* 伪元素光晕 */
.step-icon-container::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(
    circle at center,
    rgba(123, 104, 238, 0.5),
    transparent 70%
  );
  /* 径向渐变，颜色根据主题调整 */
  opacity: 0;
  /* 初始状态隐藏 */
  transition: opacity 0.3s ease-in-out;
  z-index: -1;
}

/* 悬停时显示伪元素并放大 */
.step-icon-container:hover::after {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.3);
  /* 放大以创造光晕效果 */
}

/* 步骤一：文件图标容器 */
.step-icon-container.step-1 {
  border-color: #666666 !important;
}

.step-icon-container.step-1:hover {
  background: linear-gradient(90deg, #666666, #dddddd);
}

/* 步骤二：拼图图标容器 */
.step-icon-container.step-2 {
  border-color: #5eb970 !important;
}

.step-icon-container.step-2:hover {
  background: linear-gradient(90deg, #5eb970, #ffffff);
}

/* 步骤三：闪电图标容器 */
.step-icon-container.step-3 {
  border-color: #facc7f !important;
}

.step-icon-container.step-3:hover {
  background: linear-gradient(90deg, #facc7f, #ffffff);
}

.stepItem-1 {
  color: #666666;
}

.stepItem-2 {
  color: #5eb970;
}

.stepItem-3 {
  color: #fea328;
}
</style>