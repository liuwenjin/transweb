<template>
  <div class="loginContentArea" :flag="flag" :popoverShow="popoverShow">
    <el-button
      size="small"
      @click="handleClickBtn"
      v-if="!logined"
      type="primary"
      class="login-main-btn"
      round
      >{{ t("regLogin") }}</el-button
    >
    <slot v-if="logined && userData.folderName">
      <el-popover
        placement="bottom-end"
        :width="popoverWidth"
        :teleported="false"
        trigger="click"
        :show-arrow="false"
        popper-class="saas-premium-popover"
        @show="handlePopoverShow"
        @hide="popoverShow = false"
      >
        <template #reference>
          <el-button
            :title="
              userData['name_' + lang] || userData.name || t('anonymous')
            "
            class="ellipsis user-trigger-btn"
            round
            ><i
              v-if="popoverShow"
              style="font-size: 18px"
              class="bi bi-box"
            ></i>
            <span v-else class="avatarItem">
              <el-avatar
                style="vertical-align: middle; margin-top: -3px;"
                :size="20"
                :alt="userData.name || t('anonymous')"
                :src="userData.image || 'https://transweb.cn/assets/logo.png'"
              ></el-avatar>
              <span class="pointsValueTips">
                <svg
                  t="1772170087648"
                  class="icon"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="6251"
                  width="12"
                  height="12"
                >
                  <path
                    d="M436.736 389.12c104.448 0 213.504-23.04 279.04-67.072v79.872h60.416V226.816c0-104.96-175.104-161.792-339.456-161.792S97.28 121.856 97.28 226.816v477.696c0 104.96 175.104 161.792 339.456 161.792v-60.416c-173.056 0-279.04-59.392-279.04-101.376v-143.36c65.536 44.032 174.08 67.072 279.04 67.072v-60.416c-173.056 0-279.04-59.392-279.04-101.376V322.56c65.536 43.52 174.08 66.56 279.04 66.56z m0-263.68c173.056 0 279.04 59.392 279.04 101.376S609.28 328.704 436.736 328.704 157.696 269.312 157.696 226.816s106.496-101.376 279.04-101.376z m271.36 296.96c-150.528 0-228.864 57.856-228.864 114.688v306.688c0 57.344 78.848 114.688 228.864 114.688 148.992 0 227.84-56.832 228.864-113.664v-308.224c0-56.32-78.336-114.176-228.864-114.176z m0 60.416c111.104 0 168.448 38.4 168.448 54.272s-57.344 54.272-168.448 54.272-168.448-38.4-168.448-54.272 57.344-54.272 168.448-54.272z m0 415.744c-111.104 0-168.448-38.4-168.448-54.272v-73.216c38.4 20.992 94.72 34.816 168.448 34.816s130.048-13.824 168.448-34.816v73.216c0 15.872-57.344 54.272-168.448 54.272z m0-153.6c-111.104 0-168.448-38.4-168.448-54.272v-73.216c38.4 20.992 94.72 34.816 168.448 34.816s130.048-13.824 168.448-34.816v73.216c0 15.872-57.344 54.272-168.448 54.272z"
                    fill="#0066CC"
                    p-id="6252"
                  ></path>
                </svg>
                <span v-html="pointsValue"></span>
              </span>
            </span>
          </el-button>
        </template>
        <template #default>
          <div class="mySpaceInfo" v-loading="loading">
            <div class="avaterEdit personalInfoItem">
              <div class="avatarContainer">
                <el-avatar
                  class="user-large-avatar"
                  @click="triggerFileInput($event)"
                  :size="72"
                  :alt="userData.name || t('anonymous')"
                  :src="userData.image"
                  ><i class="bi bi-pencil-square"></i
                ></el-avatar>
              </div>
              <span class="menuItemList">
                <span v-for="d in loginedMenu" :key="d.labelKey || d.label">
                  <el-button
                    class="actionGridBtn"
                    :loading="d.loading"
                    :disabled="d.loading"
                    @click="handleClickMenu(d)"
                  >
                    <span class="login-menu-label">{{ menuLabel(d) }}</span>
                  </el-button>
                </span>
              </span>
            </div>
            <div class="nickNameEdit personalInfoItem">
              <span class="itemLabel">{{ t("loginBar.nickname") }}</span>
              <span class="itemContent" ref="nickNameItem">{{
                userData["name_" + lang] || userData.name
              }}</span>
              <el-button
                size="small"
                @click="changeNickName($event)"
                round
                class="optionBtn subtleBtn"
                >{{ t("loginBar.edit") }}</el-button
              >
            </div>
            <div class="pointsInfo personalInfoItem">
              <span class="itemLabel">{{ t("loginBar.pointsBalance") }}</span>
              <span class="pointsValue primaryValue">{{
                Math.floor(
                  userData.tokenLimit - userData.tokenUsed
                ).toLocaleString("en-US")
              }}</span>
              <el-button
                class="optionBtn primaryGradientBtn"
                size="small"
                type="primary"
                @click="rechargeAccount($event)"
                round
                >{{ t("rechargeTips") }}</el-button
              >
            </div>
            <div class="pointsInfo personalInfoItem">
              <span class="itemLabel">{{ t("loginBar.pointsSpent") }}</span>
              <span class="pointsValue">{{
                Math.floor(userData.tokenUsed).toLocaleString("en-US")
              }}</span>
              <el-button
                class="optionBtn subtleBtn"
                size="small"
                @click="openBillDialog('expenses')"
                round
                >{{ t("loginBar.details") }}</el-button
              >
            </div>
            <div class="pointsInfo personalInfoItem">
              <span class="itemLabel">{{ t("loginBar.pointsEarned") }}</span>
              <span class="pointsValue">{{
                userData.tokenLimit.toLocaleString("en-US")
              }}</span>
              <el-button
                class="optionBtn subtleBtn"
                size="small"
                @click="openBillDialog('income')"
                round
                >{{ t("loginBar.details") }}</el-button
              >
            </div>
            <div
              class="apiKeySection personalInfoItem"
              style="border-bottom: none"
            >
              <span class="itemLabel">{{ apiKeyLabel("loginBar.apiKey", "API Key") }}</span>
              <el-button
                class="optionBtn subtleBtn"
                size="small"
                @click="toggleApiKeyList"
                round
                >{{
                  apiKeyShow
                    ? apiKeyLabel("loginBar.apiKeyCollapse", "收起")
                    : apiKeyLabel("loginBar.apiKeyManage", "管理")
                }}</el-button
              >
            </div>
            <div v-if="apiKeyShow" ref="apiKeyPanel" class="apiKeyPanel">
              <div class="apiKeyAddRow">
                <div class="apiKeyField">
                  <svg
                    class="fieldIcon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path
                      d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"
                    />
                  </svg>
                  <input
                    v-model="apiKeyName"
                    class="apiKeyNameInput"
                    type="text"
                    :placeholder="apiKeyLabel('loginBar.apiKeyNamePlaceholder', '输入 Key 名称')"
                    :aria-label="apiKeyLabel('loginBar.apiKeyNamePlaceholder', 'API Key 名称')"
                    maxlength="64"
                    spellcheck="false"
                    autocomplete="off"
                    @keyup.enter="createApiKey"
                  />
                </div>
                <el-button
                  size="small"
                  class="apiKeyAddBtn"
                  :loading="apiKeyCreating"
                  @click="createApiKey"
                  >{{ apiKeyLabel("loginBar.apiKeyAdd", "添加") }}</el-button
                >
              </div>
              <div class="apiKeyList" v-loading="apiKeyLoading">
                <div v-if="!apiKeyList.length" class="apiKeyEmpty">
                  {{ apiKeyLabel("loginBar.apiKeyEmpty", "暂无 API Key") }}
                </div>
                <div
                  v-for="k in apiKeyList"
                  :key="k.keyId"
                  class="apiKeyItem"
                >
                  <div class="apiKeyInfo">
                    <div class="apiKeyName">{{ k.name }}</div>
                    <div class="apiKeyMask">{{ k.maskedKey }}</div>
                    <div class="apiKeyTime">{{ timeToString(k.createdAt) }}</div>
                  </div>
                  <div class="apiKeyActions">
                    <el-button
                      size="small"
                      text
                      class="apiKeyCopyBtn"
                      :disabled="apiKeyCopying"
                      :title="
                        apiKeyLabel('loginBar.apiKeyCopyHint', '一键复制 API Key')
                      "
                      @click="copyApiKey(k)"
                      >{{ apiKeyLabel("loginBar.apiKeyCopy", "复制") }}</el-button
                    >
                    <el-button
                      size="small"
                      text
                      class="apiKeyDeleteBtn"
                      @click="removeApiKey(k)"
                      >{{ apiKeyLabel("loginBar.apiKeyDelete", "删除") }}</el-button
                    >
                  </div>
                </div>
              </div>
            </div>
            <div
              style="border-bottom: none"
              class="exitLogined personalInfoItem"
            >
              <el-button
                @click="exitLogin"
                text
                type="danger"
                class="exitButton"
                >{{ t("exitLogin") }}</el-button
              >
            </div>
          </div>
        </template>
      </el-popover>
    </slot>
    <input
      ref="hiddenFileInput"
      type="file"
      accept="image/*"
      class="tw-hidden"
      @change="onFileSelected($event)"
    />
  </div>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      logined: false,
      position: "down",
      popoverShow: false,
      popoverWidth: 460,
      loading: false,
      loginOffTips: (window.__t__ ? window.__t__("loginBar.logout") : "退出登录中..."),
      flag: WebTool.adjustSize([false, false, true]),
      // 当前语言：优先 creator.html 注入的 window.__APP_LANG__，回退到平台全局 lang
      lang: window.__APP_LANG__ || (typeof lang !== "undefined" ? lang : "zh"),
      transformRadio: window.transformRadio,
      appListApp: {
        url: webCpu.documentPrefix + "/plugins/elementVueItem/infoCardList.vue",
        className: "ElementVueItem",
        dsl: {
          url: webCpu.documentPrefix + "/user/getLoginedData",
          requestType: "post",
          query: {
            table: "pptItem",
            condition: {},
            pageSize: 10,
            pageNo: 1,
            sort: {},
          },
          dataFilter: function (d) {
            let ret = this.defaultData;
            d.data = d.data || [];
            ret.info = d.data.map((item) => {
              const date = new Date(item.time);
              const options = {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
              };

              const formatter = new Intl.DateTimeFormat("zh-CN", options);
              console.log(formatter.format(date));
              item.time = formatter.format(date);
              if (item.publishInfo) {
                let pInfo = JSON.parse(item.publishInfo || "{}");
                item.appOwner = pInfo.user;
              }
              item.appOwner = item.appOwner;
              item._appLabel = item.appOwner
                ? item.appOwner + " - " + (item.appLabel || item.appName)
                : item.appLabel || item.appName;
              ret.page = ret.page || {};
              let pagination = d.pagination || d;
              ret.page.currentPage = pagination.pageNo;
              ret.page.pageSize = pagination.pageSize;
              ret.page.total = pagination.total;
              return item;
            });
            let _self = this;
            this.methods.confirmSearchResult = function () {
              let value = this.filterOption.value;
              _self.query.condition = JSON.stringify({
                name: { $regex: value, $options: "i" },
              });
              webCpu.fresh(_self);
            };
            return ret;
          },
          style: {
            padding: "25px 40px",
          },
          data: {
            filterOption: {
              label: (window.__t__ ? window.__t__("loginBar.filterName") : "名称"),
              value: "",
              status: true,
              buttonText: (window.__t__ ? window.__t__("loginBar.search") : "搜索"),
              placeholder: (window.__t__ ? window.__t__("loginBar.searchPlaceholder") : "请输入名称进行搜索"),
              style: {
                maxWidth: "300px",
              },
            },
            info: [],
            gutter: 20,
            span: WebTool.adjustSize([false, false, true]) ? 24 : 12,
            cardStyle: {
              border: "solid 1px #f3f3f3",
              background: "#ffffff",
              padding: "15px 20px 35px 20px",
              marginBottom: "10px",
            },
            optionMap: {
              _appLabel: {
                class: "ellipsis",
                style: {
                  position: "absolute",
                  display: "inline-block",
                  fontSize: "10px",
                  textAlign: "right",
                  color: "#999",
                  width: "125px",
                  right: "-10px",
                  bottom: "-25px",
                  cursor: "pointer",
                },
              },
              time: {
                style: {
                  position: "absolute",
                  display: "inline-block",
                  fontSize: "10px",
                  color: "#999",
                  width: "135px",
                  left: "0px",
                  bottom: "-25px",
                },
              },
              name: {
                class: "ellipsis",
                style: {
                  position: "relative",
                  display: "inline-block",
                  paddingRight: "150px",
                  width: "100%",
                  cursor: "pointer",
                },
              },
              buttonItem: {
                style: {
                  position: "absolute",
                  width: "40px",
                  right: "-7px",
                },
                content: [
                  {
                    label: webCpu.messages[lang].removeTips,
                    textFlag: true,
                    type: "warning",
                  },
                ],
              },
            },
            config: [
              {
                prop: "name",
                type: "text",
              },
              {
                prop: "time",
                type: "text",
              },
              {
                prop: "_appLabel",
                type: "text",
              },
              {
                prop: "buttonItem",
                type: "button",
              },
            ],
          },
          methods: {
            handleCurrentChange(v) {
              this._parent.query.pageNo = Number(v);
              webCpu.fresh(this._parent);
            },
            handleClickButton: function (d, config) {},
          },
        },
      },
      userData: {
        name: "",
        id: "",
        role: [],
      },
      loginedMenu: [],
      apiKeyShow: false,
      apiKeyLoading: false,
      apiKeyCreating: false,
      apiKeyName: "",
      apiKeyList: [],
      // 明文 Key 只在创建/重新生成时由服务端返回一次，这里仅在内存中缓存本次会话可见的明文，
      // 让刚拿到的 Key 可以一键复制；不落 localStorage，避免明文常驻浏览器。
      apiKeyPlainMap: {},
      apiKeyCopying: false,
    };
  },
  beforeMount() {},
  computed: {
    pointsValue() {
      let v = this.userData.tokenLimit - this.userData.tokenUsed;
      if (v < 0) {
        v = 0;
      } else if (v > 100000000) {
        v =
          Math.floor(v / 100000000).toLocaleString("en-US") +
          " <span class='unit'>" + this.t("loginBar.unitBillion") + "</span>";
      } else if (v > 1000000) {
        v =
          Math.floor(v / 1000000).toLocaleString("en-US") +
          " <span class='unit'>" + this.t("loginBar.unitMillion") + "</span>";
      } else if (v > 10000) {
        v =
          Math.floor(v / 10000).toLocaleString("en-US") +
          " <span class='unit'>" + this.t("loginBar.unitTenThousand") + "</span>";
      } else if (v > 1000) {
        v =
          Math.floor(v / 1000).toLocaleString("en-US") +
          " <span class='unit'>" + this.t("loginBar.unitThousand") + "</span>";
      } else {
        v = v.toLocaleString("en-US");
      }
      return v;
    },
  },
  mounted() {
    // 与父页面 creator.html 的语言状态保持一致（默认中文）
    this.lang = window.__APP_LANG__ === "en" ? "en" : "zh";
    window.addEventListener("applangchange", this.onLangChange);
    window.addEventListener("resize", this.updatePopoverWidth);
    window.addEventListener("resize", this.updatePopoverTop);
    if (typeof this.switchRoleData === "function") {
      this.switchRoleData();
    }
    this.$nextTick(() => {
      this.updatePopoverWidth();
      this.updatePopoverTop();
    });
  },
  beforeUnmount() {
    window.removeEventListener("applangchange", this.onLangChange);
    window.removeEventListener("resize", this.updatePopoverWidth);
    window.removeEventListener("resize", this.updatePopoverTop);
    // 明文 Key 只在内存中短暂保留，组件卸载时立即清空
    this.apiKeyPlainMap = {};
  },
  methods: {
    // 文案翻译：优先读取父页面 creator.html 注入的全局词表（单一数据源）
    t(key, vars) {
      const i18n = window.__I18N__ || {};
      const dict = i18n[this.lang] || i18n.zh || {};
      let str = dict[key] !== undefined ? dict[key] : key;
      if (vars) {
        Object.keys(vars).forEach((k) => {
          str = str.replace(new RegExp("\\{" + k + "\\}", "g"), String(vars[k]));
        });
      }
      return str;
    },
    onLangChange(e) {
      this.lang = e && e.detail && e.detail.lang === "en" ? "en" : "zh";
    },
    // 登录后菜单来自平台注入的纯文本 label；这里按平台词表反查 key，
    // 让菜单名称跟随 loginBar 自己的 lang 响应式切换，而不是停留在初始化时的中文。
    menuKeyForLabel(label) {
      if (!label || !window.webCpu || !webCpu.messages) return "";

      // 平台菜单 label 可能带 emoji，也可能来自不同语言版本；先去掉前缀符号再比对。
      function normalize(value) {
        return String(value || "")
          .replace(/^[^\w\u4e00-\u9fa5]+/, "")
          .trim();
      }

      var target = normalize(label);
      if (!target) return "";

      var dictionaries = [webCpu.messages.zh, webCpu.messages.en];
      var appDict = window.__I18N__ || {};
      if (appDict.zh) dictionaries.push(appDict.zh);
      if (appDict.en) dictionaries.push(appDict.en);

      var keys = [
        "myPpt",
        "historyRecord",
        "personalInfo",
        "myModule",
        "mySubscriptions",
      ];

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        for (var j = 0; j < dictionaries.length; j++) {
          var dict = dictionaries[j];
          if (dict && target === normalize(dict[key])) return key;
        }
      }
      return "";
    },
    menuLabel(d) {
      if (!d) return "";
      var key = d.labelKey || this.menuKeyForLabel(d.label);
      var messages =
        key && window.webCpu && webCpu.messages
          ? webCpu.messages[this.lang]
          : null;
      return (messages && messages[key]) || d.label;
    },
    handlePopoverShow() {
      this.popoverShow = true;
      this.updatePopoverWidth();
      this.$nextTick(() => {
        this.updatePopoverTop();
      });
    },
    // 根据触发按钮的右边缘位置计算浮窗宽度：
    // 浮窗为 bottom-end（右对齐），宽度 = min(460, 触发按钮右边缘 - 左边距)。
    // 移动端保证最小宽度 360px，同时尽量宽且不越过左侧边界。
    // 移动端浮窗紧贴触发按钮下沿；用 body 的实际缩放比例换算成 CSS 坐标，
    // 避免 adjustStyle 缩放后浮窗与按钮之间出现空隙。
    updatePopoverTop() {
      const el = this.$el;
      if (!el || !el.closest) return;
      const header = el.closest("header");
      if (!header) return;

      const trigger =
        header.querySelector(".lang-toggle") ||
        el.querySelector(".user-trigger-btn") ||
        el.querySelector(".login-main-btn");
      const body = document.body;
      const bodyRect = body.getBoundingClientRect();
      const scale = body.offsetWidth
        ? bodyRect.width / body.offsetWidth
        : 1;

      let top = header.offsetHeight;
      if (trigger) {
        const rect = trigger.getBoundingClientRect();
        top = (rect.bottom - bodyRect.top) / (scale || 1);
      }

      const value = Math.round(top) + "px";
      el.style.setProperty("--login-panel-top", value);
      // Popover 可能被 Element 渲染到 body 下，变量写到根节点才能被继承
      document.documentElement.style.setProperty("--login-panel-top", value);
    },

    updatePopoverWidth() {
      const maxWidth = 460;
      const margin = 12;
      const mobileMinWidth = 360;
      const vw =
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth;
      const isMobile = vw < 768;

      let right = vw;
      const root = this.$el;
      const trigger = root && root.querySelector
        ? root.querySelector(".user-trigger-btn")
        : null;
      if (trigger && typeof trigger.getBoundingClientRect === "function") {
        const rect = trigger.getBoundingClientRect();
        if (rect && rect.right > 0) {
          right = rect.right;
        }
      }

      let width = Math.min(maxWidth, right - margin);
      if (isMobile) {
        // 移动端最小宽度 360px，尽量宽且不超过 460px
        width = Math.max(mobileMinWidth, width);
      }
      this.popoverWidth = Math.max(0, width);
    },
    handleClickBtn() {
      this.logined = true;
      this.userData.name = "";
    },
    triggerFileInput(e) {
      e.stopPropagation();
      e.preventDefault();
      this.$refs.hiddenFileInput.click();
    },
    openSubscriptionsDialog() {
      let app = WebTool.copyObject(this.appListApp);
      app.dsl.url = "/user/getSubscriptionsData";
      app.dsl.data = app.dsl.data || {};
      app.dsl.data.config = [
        {
          prop: "name",
          type: "text",
        },
        {
          prop: "time",
          type: "text",
        },
        {
          prop: "_appLabel",
          type: "text",
        },
      ];
      this.currentShareApp = app;
      this.openShareDialog(app, this.t("mySubscriptions"));
    },
    openShareDialog(app, title) {
      title = title || this.t("myPpt");
      app = app || WebTool.copyObject(this.appListApp);
      let _self = this;
      // 搜索筛选区随当前语言实时切换
      if (app.dsl && app.dsl.data && app.dsl.data.filterOption) {
        app.dsl.data.filterOption.label = this.t("loginBar.filterName");
        app.dsl.data.filterOption.buttonText = this.t("loginBar.search");
        app.dsl.data.filterOption.placeholder = this.t("loginBar.searchPlaceholder");
      }
      app.dsl.methods.handleClickButton = function (d, config) {
        if (config.label === webCpu.messages[lang].removeTips) {
          _self
            .$confirm(
              webCpu.messages[lang].confirmRemoveTips,
              webCpu.messages[lang].confirmDialogTitle,
              {
                confirmButtonText: webCpu.messages[lang].confirmYes,
                cancelButtonText: webCpu.messages[lang].confirmNo,
                type: "warning",
              }
            )
            .then(() => {
              _self.removeShareItem(d);
            });
        } else if (config.label === webCpu.messages[lang].editTips) {
          let params = WebTool.getQueryParams(location.href);
          let _id = params.id;
          params.id = d.documentId;
          params.mode = "edit";
          let from = WebTool.urlQuery(location.href, "from");
          if (flag) {
            params.from = from;
          }
          let url = WebTool.attachParams(
            location.origin + location.pathname,
            params
          );
          if ((window.parent === window && _id) || _self.api) {
            location.href = url;
          } else {
            window.open(url, "_blank");
          }
        } else {
        }
      };
      app.dsl.methods.handleClickItem = function (d, config) {
        let from = WebTool.urlQuery(location.href, "from");
        if (config.prop === "documentId") {
          WebTool.copyString(d.documentId);
          this.$message({
            type: "success",
            message: webCpu.messages[lang].copySuccessTips,
          });
        } else {
          let url = `${location.origin + location.pathname}?id=${d.documentId}`;
          if (from) {
            url += "&fromAccount=" + from;
          }

          if (_self.api) {
            location.href = url;
          } else {
            window.open(url, "_blank");
          }
        }
      };
      dialogMap.openAppDialog(app, title);
    },
    openBillDialog(type) {
      const posterInvalidTip = this.t("loginBar.posterInvalid");
      window.transweb_document_data = function () {
        this.$message({
          type: "warning",
          message: posterInvalidTip,
        });
      };
      let titleMap = {
        income: this.t("loginBar.incomeRecords"),
        expenses: this.t("loginBar.expenseRecords"),
      };
      dialogMap.openDocumentApp(webCpu.appConfig.pointsBillApp, {
        dialogTitle: titleMap[type],
        data: {
          query: {
            type: type,
          },
        },
      });
    },
    updateInfo: function (param, callback) {
      webCpu.adapter.updateLoginInfo(
        {
          condition: {
            folderName: localStorage.folderName,
          },
          set: param,
        },
        function (d) {
          if (typeof callback === "function") {
            callback(d);
          }
        }
      );
    },
    modifyPass() {
      let modifyPass = {
        url: "plugins/elementVueItem/infoCardList.vue",
        className: "ElementVueItem",
        dsl: {
          style: {
            padding: "25px 30px 10px 30px",
          },
          methods: {
            handleClickButton: function (d) {},
          },
          data: {
            mode: "edit",
            editorMap: {
              password: {
                type: "input",
                placeholder: webCpu.messages[lang].inputNewPass,
                size: "default",
              },
            },
            optionMap: {
              password: {
                style: {
                  position: "relative",
                  display: "inline-block",
                  width: "100%",
                  marginBottom: "20px",
                },
              },
              buttonGroup: {
                style: {
                  position: "relative",
                  width: "100%",
                },
                content: [
                  {
                    label: webCpu.messages[lang].confirmYes,
                    type: "primary",
                    size: "default",
                    style: {
                      width: "100%",
                    },
                  },
                ],
              },
            },
            config: [
              {
                type: "text",
                prop: "password",
              },
              {
                type: "button",
                prop: "buttonGroup",
              },
            ],
            info: {
              passowrd: "",
            },
            cardStyle: {
              "background-color": "transparent",
            },
          },
        },
      };
      let _parent = this;
      modifyPass.dsl.methods.handleClickButton = function (d) {
        var _self = this;
        if (!d.password || d.password.length < 8) {
          this.$message({
            type: "warning",
            message: _parent.t("loginBar.passwordInvalid"),
          });
          return false;
        }
        _parent.updateInfo(
          {
            password: MurmurHash.rule(d.password, 32),
          },
          function (d) {
            console.log(d);
            _self.$message({
              type: "success",
              message: webCpu.messages[lang].modifyPassTips,
            });
            webCpu.CardItem.dismissMask(document.body);
          }
        );
      };
      webCpu.CardItem.renderCardDialog(
        document.body,
        modifyPass,
        {
          title: webCpu.messages[lang].modifyPass,
          closeType: "back",
          dialogName: "editInfoDialog",
          titleStyle: {
            background: "var(--el-color-primary-light-9)",
            color: "var(--el-color-primary)",
          },
        },
        {
          width: "300px",
          height: "160px",
          border: "solid 1px #ddd",
        }
      );
    },
    changeNickName(e) {
      let elem = this.$refs.nickNameItem;
      elem.setAttribute("contentEditable", true);
      $(elem).off("keydown");
      $(elem).on("keydown", (e) => {
        if (e.key === "Enter") e.preventDefault();
      });

      $(elem).off("paste");
      $(elem).on("paste", (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData)
          .getData("text")
          .replace(/\r?\n/g, " ");
        document.execCommand("insertText", false, text);
      });

      $(elem).attr("active", true);
      $(elem.parentNode).find(".el-button").hide();
      $(elem).on("blur", (event) => {
        //Todo: update nike name;
        this.userData.name = event.target.textContent;
        elem.setAttribute("contentEditable", false);
        $(elem.parentNode).find(".el-button").show();
        this.updateInfo(
          {
            name: this.userData.name,
          },
          (tData) => {
            if (tData.ret === 0) {
              this.$message({
                type: "success",
                message: this.t("loginBar.nicknameUpdated"),
              });
            }
          }
        );
      });
    },
    rechargeAccount(e) {
      if(window.aigcInterface && typeof aigcInterface.renderRechargeDialog === "function") {
         aigcInterface.renderRechargeDialog();
      }
      else {
        webCpu.mitt.emit("rechargeAccount");
      }
    },
    onFileSelected(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (e) => {
        this.userData.image = e.target.result;
        if (this.userData.image.length > 100 * 1024) {
          WebTool.compressAndResizeBase64(
            this.userData.image,
            400,
            400,
            1
          ).then((base64) => {
            this.userData.image = base64;
            this.updateInfo(
              {
                image: this.userData.image,
              },
              (tData) => {
                if (tData.ret === 0) {
                  this.$message({
                    type: "success",
                    message: this.t("loginBar.avatarUpdated"),
                  });
                }
              }
            );
          });
        } else {
          this.updateInfo(
            {
              image: this.userData.image,
            },
            (tData) => {
              if (tData.ret === 0) {
                this.$message({
                  type: "success",
                  message: this.t("loginBar.avatarUpdated"),
                });
              }
            }
          );
        }
        //Todo: update user image
      };
      reader.readAsDataURL(file);
    },
    exitLogin() {
      this.logined = false;
      this.apiKeyList = [];
      this.apiKeyPlainMap = {};
      this.userData = {
        name: "",
        id: "",
        role: [],
      };
    },
    timeToString(timestamp) {
      var date = new Date(timestamp);
      var year = date.getFullYear();
      var month = ("0" + (date.getMonth() + 1)).slice(-2); // 月份是从0开始的
      var day = ("0" + date.getDate()).slice(-2);

      var dateString = `${year}-${month}-${day}`;
      return dateString;
    },
    toggleApiKeyList() {
      this.apiKeyShow = !this.apiKeyShow;
      if (this.apiKeyShow && !this.apiKeyList.length) {
        this.loadApiKeys();
      }
      // 展开时把浮窗滚动条定位到 API Key 列表，让完整列表可见
      if (this.apiKeyShow) {
        this.$nextTick(() => {
          this.scrollToApiKeyList();
        });
      }
    },
    scrollToApiKeyList() {
      const panel = this.$refs.apiKeyPanel;
      if (!panel) return;
      const popover =
        panel.closest(".el-popper") ||
        (this.$el && this.$el.querySelector(".el-popper"));
      if (!popover) return;
      const panelTop = panel.getBoundingClientRect().top;
      const popTop = popover.getBoundingClientRect().top;
      const target = popover.scrollTop + (panelTop - popTop) - 8;
      try {
        popover.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
      } catch (e) {
        popover.scrollTop = Math.max(0, target);
      }
    },
    apiKeyHeaders() {
      return {
        "Content-Type": "application/json",
        "transweb-token": localStorage["transweb-token"] || "",
      };
    },
    // 中文兜底：i18n 词表未加载/缺失时，保证中文版标签不显示原始 key
    apiKeyLabel(key, zh) {
      const v = this.t(key);
      return v === key ? zh : v;
    },
    // 复用平台词表（提示/确认/取消/复制成功等通用文案），缺失时回退中文
    platformTip(key, zh) {
      const messages =
        window.webCpu && webCpu.messages ? webCpu.messages[this.lang] : null;
      return (messages && messages[key]) || zh;
    },
    // HTML 转义：防注入（虽然 API Key 是服务端生成的 hex，仍做防御）
    escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, (c) => {
        const map = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        };
        return map[c];
      });
    },
    // 只在内存中记住本次会话拿到的明文 Key，供列表页一键复制
    cacheApiKey(apiKey, keyId) {
      if (!apiKey || !keyId) return;
      this.apiKeyPlainMap = Object.assign({}, this.apiKeyPlainMap, {
        [keyId]: apiKey,
      });
    },
    notifyCopied() {
      this.$message({
        type: "success",
        message: this.apiKeyLabel("loginBar.apiKeyCopied", "已复制"),
      });
    },
    // 复制到剪贴板：优先异步剪贴板 API（HTTPS/localhost），失败回退 execCommand。
    // 返回 Promise<boolean>，让调用方能在复制失败时给出兜底方案。
    copyText(text) {
      const legacyCopy = () => {
        const input = document.createElement("textarea");
        input.value = text;
        input.readOnly = true;
        input.style.position = "fixed";
        input.style.left = "-999px";
        input.style.top = "10px";
        document.body.appendChild(input);
        input.select();
        input.setSelectionRange(0, input.value.length);
        let ok = false;
        try {
          ok = document.execCommand("copy");
        } catch (e) {
          ok = false;
        }
        document.body.removeChild(input);
        return ok;
      };
      if (
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function" &&
        window.isSecureContext
      ) {
        return navigator.clipboard
          .writeText(text)
          .then(() => true)
          .catch(() => legacyCopy());
      }
      return Promise.resolve(legacyCopy());
    },
    // 一键复制：本会话已知明文的 Key 直接复制；
    // 服务端只存哈希、明文仅在创建时返回一次，其余情况说明原因并走「重新生成并复制」。
    copyApiKey(key) {
      if (!key) return;
      const cached = this.apiKeyPlainMap[key.keyId];
      if (cached) {
        this.copyText(cached).then((ok) => {
          if (ok) {
            this.notifyCopied();
          } else {
            this.$message({
              type: "warning",
              message: this.apiKeyLabel(
                "loginBar.apiKeyCopyFailed",
                "复制失败，请手动选中后复制"
              ),
            });
            this.showNewApiKey(cached, key.keyId);
          }
        });
        return;
      }
      this.$confirm(
        this.apiKeyLabel(
          "loginBar.apiKeyRegenerateTips",
          "出于安全考虑，API Key 明文仅在创建时显示一次，之后无法再次查看。是否重新生成一个新的 Key 并立即复制？重新生成后，当前 Key 会立即失效。"
        ),
        this.platformTip("confirmDialogTitle", "提示"),
        {
          confirmButtonText: this.apiKeyLabel(
            "loginBar.apiKeyRegenerateConfirm",
            "重新生成并复制"
          ),
          cancelButtonText: this.platformTip("confirmNo", "取消"),
          type: "warning",
          closeOnClickModal: false,
        }
      )
        .then(() => this.rotateAndCopyApiKey(key))
        .catch(() => {});
    },
    // 重新生成（轮换）Key 并立即复制；轮换后旧 Key 立即失效，需用户确认后才会走到这里
    rotateAndCopyApiKey(key) {
      if (!key || this.apiKeyCopying) return;
      this.apiKeyCopying = true;
      const failedTips = this.apiKeyLabel(
        "loginBar.apiKeyRegenerateFailed",
        "重新生成失败，请稍后重试"
      );
      fetch(webCpu.documentPrefix + "/apiKey/rotateApiKey", {
        method: "POST",
        credentials: "same-origin",
        headers: this.apiKeyHeaders(),
        body: JSON.stringify({ keyId: key.keyId }),
      })
        .then((r) => {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.json();
        })
        .then((d) => {
          if (!(d && d.ret === 0 && d.data && d.data.apiKey)) {
            throw new Error((d && d.message) || failedTips);
          }
          const apiKey = d.data.apiKey;
          this.cacheApiKey(apiKey, key.keyId);
          return this.copyText(apiKey).then((ok) => {
            if (ok) {
              this.notifyCopied();
            } else {
              // 复制失败：展示明文让用户手动保存
              this.showNewApiKey(apiKey, key.keyId);
            }
          });
        })
        .catch((e) => {
          this.$message({
            type: "error",
            message: (e && e.message) || failedTips,
          });
        })
        .finally(() => {
          this.apiKeyCopying = false;
          this.loadApiKeys();
        });
    },
    loadApiKeys() {
      this.apiKeyLoading = true;
      fetch(webCpu.documentPrefix + "/apiKey/listApiKeys", {
        method: "GET",
        credentials: "same-origin",
        headers: { "transweb-token": localStorage["transweb-token"] || "" },
      })
        .then((r) => {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.json();
        })
        .then((d) => {
          this.apiKeyList = d && d.ret === 0 ? d.data || [] : [];
        })
        .catch(() => {
          this.apiKeyList = [];
        })
        .finally(() => {
          this.apiKeyLoading = false;
        });
    },
    createApiKey() {
      // 防重复提交
      if (this.apiKeyCreating) return;
      const name = (this.apiKeyName || "").trim();
      if (!name) {
        return this.$message({
          type: "warning",
          message: this.apiKeyLabel(
            "loginBar.apiKeyNameRequired",
            "请输入 API Key 名称"
          ),
        });
      }
      this.apiKeyCreating = true;
      fetch(webCpu.documentPrefix + "/apiKey/createApiKey", {
        method: "POST",
        credentials: "same-origin",
        headers: this.apiKeyHeaders(),
        body: JSON.stringify({ name, scopes: ["doc:read", "ai:chat"] }),
      })
        .then((r) => {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.json();
        })
        .then((d) => {
          if (d && d.ret === 0 && d.data && d.data.apiKey) {
            this.apiKeyName = "";
            this.showNewApiKey(d.data.apiKey, d.data.keyId);
            this.loadApiKeys();
          } else {
            this.$message({
              type: "error",
              message:
                (d && d.message) ||
                this.apiKeyLabel("loginBar.apiKeyCreateFailed", "创建失败，请稍后重试"),
            });
          }
        })
        .catch(() => {
          this.$message({
            type: "error",
            message: this.apiKeyLabel("loginBar.apiKeyCreateFailed", "创建失败，请稍后重试"),
          });
        })
        .finally(() => {
          this.apiKeyCreating = false;
        });
    },
    // 展示新建 / 重新生成的 Key：换行不越界 + 一键复制
    showNewApiKey(apiKey, keyId) {
      if (keyId) {
        this.cacheApiKey(apiKey, keyId);
      }
      const safeKey = this.escapeHtml(apiKey);
      const message =
        '<div style="word-break:break-all;font-family:Menlo,Consolas,monospace;font-size:12px;line-height:1.6;background:#f8f8fa;padding:10px 12px;border:1px solid #e7e7eb;user-select:all;">' +
        safeKey +
        "</div>" +
        '<div style="margin-top:8px;font-size:12px;color:#999;">' +
        this.escapeHtml(
          this.apiKeyLabel("loginBar.apiKeyOnlyOnce", "本 Key 仅显示一次，请立即保存。")
        ) +
        "</div>";
      this.$confirm(
        message,
        this.apiKeyLabel("loginBar.apiKeyCreated", "API Key 创建成功"),
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: this.apiKeyLabel("loginBar.apiKeyCopy", "复制"),
          cancelButtonText: this.platformTip("confirmNo", "关闭"),
          type: "success",
          closeOnClickModal: false,
        }
      )
        .then(() => {
          return this.copyText(apiKey).then((ok) => {
            if (ok) {
              this.notifyCopied();
            } else {
              // 复制失败时重新弹出明文，让用户手动选中复制，避免明文直接丢失
              this.$message({
                type: "warning",
                message: this.apiKeyLabel(
                  "loginBar.apiKeyCopyFailed",
                  "复制失败，请手动选中后复制"
                ),
              });
              this.showNewApiKey(apiKey, keyId);
            }
          });
        })
        .catch(() => {});
    },
    removeApiKey(key) {
      this.$confirm(
        this.apiKeyLabel(
          "loginBar.apiKeyDeleteConfirm",
          "删除后该 Key 将立即失效，确定删除？"
        ),
        this.platformTip("confirmDialogTitle", "提示"),
        {
          confirmButtonText: this.platformTip("confirmYes", "确定"),
          cancelButtonText: this.platformTip("confirmNo", "取消"),
          type: "warning",
        }
      )
        .then(() => {
          return fetch(webCpu.documentPrefix + "/apiKey/revokeApiKey", {
            method: "POST",
            credentials: "same-origin",
            headers: this.apiKeyHeaders(),
            body: JSON.stringify({ keyId: key.keyId }),
          }).then((r) => {
            if (!r.ok) throw new Error("HTTP " + r.status);
            return r.json();
          });
        })
        .then((d) => {
          if (d && d.ret === 0) {
            const rest = Object.assign({}, this.apiKeyPlainMap);
            delete rest[key.keyId];
            this.apiKeyPlainMap = rest;
            this.$message({
              type: "success",
              message: this.apiKeyLabel("loginBar.apiKeyDeleted", "已删除"),
            });
            this.loadApiKeys();
          } else {
            this.$message({
              type: "error",
              message:
                (d && d.message) ||
                this.apiKeyLabel("loginBar.apiKeyDeleteFailed", "删除失败，请稍后重试"),
            });
          }
        })
        .catch(() => {});
    },
    handleClickMenu(d) {
      let callback = d.callback || d.action;
      d.loading = true;
      this._parent = this._parent || {};
      d.documentId = this._parent.documentId;
      if (typeof callback === "function") {
        callback(d, ()=> {
          d.loading = false;
        });
      }
      if (d.path) {
        webCpu.router.push({
          path: d.path,
        });
      }
    },
  },
};
</script>

<style scoped>
/* ==========================================================================
   ON STAFF · 登录条与用户浮窗
   参考 index.html 的 #onStaffSkin：纸白 / 松烟墨 / 朱砂 / 细线
   - 浮窗是一张纸片：直角、1px 细线、2px 朱砂顶线、轻投影
   - 标签用等宽小字，数值用宋体，正文用无衬线，形成档案感
   - 交互只做颜色与 1px 边线变化，键盘焦点保持 2px 墨线
   ========================================================================== */
.loginContentArea {
  --os-ink: #191817;
  --os-ink-soft: #2b2b31;
  --os-paper: #f7f4ec;
  --os-paper-2: #efeadd;
  --os-card: #fcfaf3;
  --os-line: #ded7c7;
  --os-gray: #6e6a60;
  --os-light: #a6a196;
  --os-red: #c33a1e;
  --os-red-dark: #a62f17;
  --os-hover: #f3f0e7;
  --os-serif: "Source Han Serif SC", "Noto Serif SC", "Songti SC", "STSong",
    Georgia, serif;
  --os-sans: Inter, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial,
    "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  --os-mono: "SF Mono", "JetBrains Mono", ui-monospace, Menlo, Consolas,
    monospace;
  --os-ease: cubic-bezier(0.2, 0.7, 0.2, 1);

  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  text-align: right;
  line-height: 1;
  font-family: var(--os-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  --el-color-primary: #c33a1e;
  --el-border-radius-base: 0;
}

/* ==========================================================================
   页眉触发按钮
   ========================================================================== */
.login-main-btn.el-button {
  min-width: 40px;
  height: 40px;
  padding: 0 16px;
  border: 1px solid var(--os-red);
  border-radius: 0;
  background: var(--os-red);
  color: #ffffff;
  font-family: var(--os-sans);
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.06em;
  box-shadow: none;
  transition: background-color 0.25s var(--os-ease),
    border-color 0.25s var(--os-ease);
}

.login-main-btn.el-button:hover {
  background: var(--os-red-dark);
  border-color: var(--os-red-dark);
  color: #ffffff;
}

.login-main-btn.el-button:active {
  background: var(--os-red-dark);
  border-color: var(--os-red-dark);
}

.user-trigger-btn.el-button {
  width: calc(100% - 10px);
  min-width: 40px;
  height: 40px;
  padding: 0 10px;
  border: 1px solid var(--os-line);
  border-radius: 0;
  background: transparent;
  color: var(--os-ink);
  font-family: var(--os-sans);
  font-size: 13px;
  font-weight: 500;
  box-shadow: none;
  transition: background-color 0.25s var(--os-ease),
    border-color 0.25s var(--os-ease), color 0.25s var(--os-ease);
}

.user-trigger-btn.el-button:hover {
  background: var(--os-card);
  border-color: var(--os-ink);
  color: var(--os-ink);
}

.loginContentArea[popovershow="true"] > .user-trigger-btn {
  background: var(--os-ink);
  border-color: var(--os-ink);
  color: var(--os-paper);
}

/* 触发按钮内所有元素共用一条垂直中线：
   头像、积分图标、数字与单位都按中心对齐，避免小头像被基线抬高 */
.avatarItem {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 20px;
  min-width: 0;
  line-height: 1;
}

.user-trigger-btn .el-avatar {
  display: block;
  flex: 0 0 auto;
  margin-top: 0 !important;
  border-radius: 0 !important;
  background: var(--os-paper-2) !important;
}

.user-trigger-btn .el-avatar img {
  display: block;
  border-radius: 0;
}

/* 触发按钮内的积分徽章 */
.pointsValueTips {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 20px;
  margin-left: 0;
  color: var(--os-gray);
  font-family: var(--os-mono);
  font-size: 11px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
}

.pointsValueTips .icon {
  display: block;
  flex: 0 0 auto;
  vertical-align: middle;
}

/* 图标本体是蓝色填充，统一收拢为当前文字色 */
.pointsValueTips .icon path {
  fill: currentColor !important;
}

.pointsValueTips .unit {
  margin-left: 1px;
  color: var(--os-light);
  font-size: 9.5px;
}

.loginContentArea[popovershow="true"] > .user-trigger-btn .pointsValueTips {
  color: var(--os-paper-2);
}

.loginContentArea[popovershow="true"] > .user-trigger-btn .pointsValueTips .unit {
  color: var(--os-light);
}

/* ==========================================================================
   浮窗内容：纸片卡
   外壳（背景、描边、投影、定位）在文件末尾的非 scoped 规则中维护，
   这里只负责卡片内部的排版与控件。
   ========================================================================== */
.mySpaceInfo,
.mySpaceInfo *,
.mySpaceInfo *::before,
.mySpaceInfo *::after {
  box-sizing: border-box;
}

.mySpaceInfo {
  --os-ink: #191817;
  --os-ink-soft: #2b2b31;
  --os-paper: #f7f4ec;
  --os-paper-2: #efeadd;
  --os-card: #fcfaf3;
  --os-line: #ded7c7;
  --os-gray: #6e6a60;
  --os-light: #a6a196;
  --os-red: #c33a1e;
  --os-red-dark: #a62f17;
  --os-hover: #f3f0e7;
  --os-serif: "Source Han Serif SC", "Noto Serif SC", "Songti SC", "STSong",
    Georgia, serif;
  --os-sans: Inter, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial,
    "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  --os-mono: "SF Mono", "JetBrains Mono", ui-monospace, Menlo, Consolas,
    monospace;

  position: relative;
  padding: 20px 22px 14px;
  background: var(--os-card);
  color: var(--os-ink);
  font-family: var(--os-sans);
  font-size: 13px;
  line-height: 1.5;
  text-align: left;
}

/* 头像 + 菜单网格 */
.avaterEdit {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 0 0 18px;
  border-bottom: 1px solid var(--os-line);
}

.avatarContainer {
  position: relative;
  display: inline-block;
  flex: 0 0 auto;
}

.user-large-avatar.el-avatar {
  overflow: hidden;
  padding: 0;
  border: 1px solid var(--os-line);
  border-radius: 0 !important;
  background: var(--os-paper-2) !important;
  transition: border-color 0.2s ease;
}

.user-large-avatar.el-avatar img {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 0;
  object-fit: cover;
}

.user-large-avatar.el-avatar:hover {
  border-color: var(--os-ink);
}

.user-large-avatar i {
  font-size: 18px;
}

.menuItemList {
  display: grid;
  flex: 1 1 auto;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  min-width: 0;
  margin: 0 0 0 16px;
  float: none;
}

.menuItemList > span {
  display: block;
  margin: 0;
}

.actionGridBtn.el-button {
  width: 100%;
  height: 36px;
  margin: 0;
  padding: 0 10px;
  overflow: hidden;
  border: 1px solid var(--os-line);
  border-radius: 0;
  background: transparent;
  color: var(--os-ink);
  font-family: var(--os-sans);
  font-size: 12.5px;
  font-weight: 400;
  letter-spacing: 0.02em;
  box-shadow: none;
  transition: background-color 0.2s ease, border-color 0.2s ease,
    color 0.2s ease;
}

.actionGridBtn.el-button:hover {
  background: var(--os-hover);
  border-color: var(--os-ink);
  color: var(--os-ink);
}

.actionGridBtn.el-button:active {
  background: var(--os-paper-2);
}

/* 长英文文案（如 "AIGC History"）在按钮内优雅省略 */
.actionGridBtn.el-button .login-menu-label {
  display: block;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  text-align: center;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* ==========================================================================
   信息行：等宽标签 + 宋体数值
   ========================================================================== */
.personalInfoItem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 0;
  border-bottom: 1px solid var(--os-line);
  color: var(--os-gray);
  font-size: 13px;
}

.itemLabel {
  flex: 0 0 88px;
  min-width: 0;
  color: var(--os-gray);
  font-family: var(--os-mono);
  font-size: 10.5px;
  font-weight: 400;
  letter-spacing: 0.14em;
  line-height: 1.4;
  text-transform: uppercase;
  white-space: nowrap;
}

.itemContent {
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
  color: var(--os-ink);
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.01em;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.pointsValue {
  flex: 1 1 auto;
  min-width: 0;
  padding: 0;
  color: var(--os-ink);
  font-family: var(--os-serif);
  font-size: 19px;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.01em;
  line-height: 1.2;
}

.pointsValue.primaryValue {
  font-size: 22px;
}

/* 昵称编辑态：像在档案卡上直接划线修改 */
.nickNameEdit > span[contenteditable="true"] {
  padding: 2px 6px;
  border-bottom: 1px solid var(--os-ink);
  border-radius: 0;
  outline: none;
  background: var(--os-paper-2);
}

/* ==========================================================================
   行内操作：细线小按钮 / 朱砂主操作
   ========================================================================== */
.subtleBtn.el-button {
  flex: 0 0 auto;
  height: 28px;
  margin: 0;
  padding: 0 11px;
  border: 1px solid var(--os-line);
  border-radius: 0;
  background: transparent;
  color: var(--os-ink);
  font-family: var(--os-sans);
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.06em;
  box-shadow: none;
  transition: background-color 0.2s ease, border-color 0.2s ease,
    color 0.2s ease;
}

.subtleBtn.el-button:hover {
  background: var(--os-ink);
  border-color: var(--os-ink);
  color: var(--os-paper);
}

.subtleBtn.el-button:active {
  background: var(--os-ink-soft);
  border-color: var(--os-ink-soft);
  color: var(--os-paper);
}

.primaryGradientBtn.el-button {
  flex: 0 0 auto;
  height: 28px;
  margin: 0;
  padding: 0 13px;
  border: 1px solid var(--os-red);
  border-radius: 0;
  background: var(--os-red);
  color: #ffffff;
  font-family: var(--os-sans);
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.06em;
  box-shadow: none;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.primaryGradientBtn.el-button:hover {
  background: var(--os-red-dark);
  border-color: var(--os-red-dark);
  color: #ffffff;
}

.primaryGradientBtn.el-button:active {
  background: var(--os-red-dark);
  border-color: var(--os-red-dark);
}

/* ==========================================================================
   退出登录
   ========================================================================== */
.exitLogined {
  display: flex;
  justify-content: flex-start;
  margin-top: 0;
  padding: 12px 0 0;
  border-top: 1px solid var(--os-line);
  border-bottom: 0;
}

.exitLogined .el-button.exitButton {
  height: auto;
  min-height: 0;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--os-red);
  font-family: var(--os-sans);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-decoration-color: rgba(195, 58, 30, 0.35);
  text-underline-offset: 3px;
  transition: color 0.2s ease, text-decoration-color 0.2s ease;
}

.exitLogined .el-button.exitButton:hover {
  background: transparent;
  color: var(--os-red-dark);
  text-decoration-color: currentColor;
}

/* ==========================================================================
   API Key 管理
   ========================================================================== */
.apiKeySection {
  padding-bottom: 12px;
}

.apiKeyPanel {
  margin: 0 0 10px;
  padding: 12px;
  border: 1px solid var(--os-line);
  background: var(--os-paper);
}

.apiKeyAddRow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.apiKeyField {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
}

.apiKeyField .fieldIcon {
  position: absolute;
  top: 50%;
  left: 10px;
  z-index: 1;
  width: 14px;
  height: 14px;
  color: var(--os-gray);
  pointer-events: none;
  transform: translateY(-50%);
  transition: color 0.2s ease;
}

.apiKeyField input {
  width: 100%;
  height: 32px;
  padding: 0 10px 0 32px;
  border: 1px solid var(--os-line);
  border-radius: 0;
  outline: none;
  background: var(--os-card);
  color: var(--os-ink);
  font-family: var(--os-sans);
  font-size: 12px;
  letter-spacing: 0.01em;
  box-shadow: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.apiKeyField input::placeholder {
  color: var(--os-gray);
  font-size: 12px;
}

.apiKeyField input:focus {
  border-color: var(--os-ink);
  box-shadow: 0 0 0 1px var(--os-ink);
}

.apiKeyField:focus-within .fieldIcon {
  color: var(--os-ink);
}

.apiKeyAddBtn.el-button {
  flex: 0 0 auto;
  height: 32px;
  margin: 0;
  padding: 0 12px;
  border: 1px solid var(--os-ink);
  border-radius: 0;
  background: var(--os-ink);
  color: var(--os-paper);
  font-family: var(--os-sans);
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.06em;
  box-shadow: none;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.apiKeyAddBtn.el-button:hover {
  background: var(--os-ink-soft);
  border-color: var(--os-ink-soft);
  color: var(--os-paper);
}

.apiKeyList {
  max-height: 224px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--os-line) transparent;
}

.apiKeyItem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 0;
  border-top: 1px solid var(--os-line);
}

.apiKeyItem .el-button {
  flex: 0 0 auto;
}

.apiKeyInfo {
  flex: 1 1 auto;
  min-width: 0;
  text-align: left;
}

.apiKeyName {
  overflow: hidden;
  color: var(--os-ink);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.01em;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.apiKeyMask {
  margin-top: 3px;
  overflow: hidden;
  color: var(--os-gray);
  font-family: var(--os-mono);
  font-size: 11px;
  letter-spacing: 0;
  line-height: 1.4;
  white-space: nowrap;
  text-overflow: ellipsis;
  user-select: all;
}

.apiKeyTime {
  margin-top: 2px;
  color: var(--os-gray);
  font-family: var(--os-mono);
  font-size: 10px;
  letter-spacing: 0.04em;
}

.apiKeyEmpty {
  padding: 14px 0;
  color: var(--os-gray);
  font-size: 11.5px;
  letter-spacing: 0.04em;
  text-align: center;
}

.apiKeyActions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 6px;
}

.apiKeyCopyBtn.el-button,
.apiKeyDeleteBtn.el-button {
  height: auto;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  font-family: var(--os-sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-decoration-color: rgba(25, 24, 23, 0.28);
  text-underline-offset: 3px;
}

.apiKeyCopyBtn.el-button {
  color: var(--os-ink);
}

.apiKeyCopyBtn.el-button:hover {
  background: transparent;
  color: var(--os-red);
  text-decoration-color: currentColor;
}

.apiKeyDeleteBtn.el-button {
  color: var(--os-gray);
  text-decoration-color: rgba(110, 106, 96, 0.3);
}

.apiKeyDeleteBtn.el-button:hover {
  background: transparent;
  color: var(--os-red);
  text-decoration-color: currentColor;
}

/* ==========================================================================
   滚动条：细线，不抢视觉
   ========================================================================== */
.apiKeyList::-webkit-scrollbar {
  width: 4px;
}

.apiKeyList::-webkit-scrollbar-thumb {
  background: var(--os-line);
}

.apiKeyList::-webkit-scrollbar-track {
  background: transparent;
}

/* ==========================================================================
   键盘焦点
   ========================================================================== */
.loginContentArea .el-button:focus-visible,
.loginContentArea .el-avatar:focus-visible,
.loginContentArea [contenteditable="true"]:focus-visible {
  outline: 2px solid var(--os-ink);
  outline-offset: 3px;
}

/* ==========================================================================
   移动端：内容更紧凑，仍保持一行两个入口
   ========================================================================== */
@media (max-width: 640px) {
  .mySpaceInfo {
    padding: 16px 16px 12px;
  }

  .avaterEdit {
    gap: 14px;
    padding-bottom: 14px;
  }

  .menuItemList {
    gap: 6px;
    margin-left: 12px;
  }

  .actionGridBtn.el-button {
    height: 34px;
    padding: 0 6px;
    font-size: 12px;
  }

  .personalInfoItem {
    padding: 10px 0;
  }

  .itemLabel {
    flex-basis: 72px;
    font-size: 10px;
    letter-spacing: 0.1em;
  }

  .itemContent {
    font-size: 13px;
  }

  .pointsValue {
    font-size: 18px;
  }

  .pointsValue.primaryValue {
    font-size: 20px;
  }

  .subtleBtn.el-button,
  .primaryGradientBtn.el-button {
    padding: 0 9px;
  }

  .apiKeyPanel {
    padding: 10px;
  }

  .apiKeyField input,
  .apiKeyAddBtn.el-button {
    height: 30px;
  }
}

/* ==========================================================================
   动效敏感用户降级
   ========================================================================== */
@media (prefers-reduced-motion: reduce) {
  .loginContentArea *,
  .loginContentArea *::before,
  .loginContentArea *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
</style>

<style>
/* ==========================================================================
   ON STAFF · 浮窗外壳
   Element 可能把 popper 渲染到 body 下，外壳与移动端定位用非 scoped 规则，
   保证不依赖组件的 data-v 作用域；类名只属于登录组件。
   ========================================================================== */
.saas-premium-popover.el-popper {
  box-sizing: border-box !important;
  width: min(440px, calc(100vw - 30px)) !important;
  max-width: calc(100vw - 30px) !important;
  max-height: min(720px, calc(100vh - var(--login-panel-top, 72px) - 24px)) !important;
  padding: 0 !important;
  overflow-x: hidden !important;
  overflow-y: auto !important;
  border: 1px solid #ded7c7 !important;
  border-top: 2px solid #c33a1e !important;
  border-radius: 0 !important;
  background: #fcfaf3 !important;
  color: #191817 !important;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial,
    "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif !important;
  font-size: 13px !important;
  line-height: 1.5 !important;
  box-shadow: 0 18px 40px rgba(27, 27, 25, 0.09) !important;
  scrollbar-width: thin;
  scrollbar-color: #ded7c7 transparent;
}

.saas-premium-popover.el-popper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.saas-premium-popover.el-popper::-webkit-scrollbar-thumb {
  background: #ded7c7;
}

.saas-premium-popover.el-popper::-webkit-scrollbar-track {
  background: transparent;
}

/* 移动端：紧贴触发按钮下沿，左右各留 12px，高度用完剩余视口 */
@media (max-width: 640px) {
  .saas-premium-popover.el-popper {
    position: fixed !important;
    top: var(--login-panel-top, 56px) !important;
    right: 12px !important;
    left: 12px !important;
    width: auto !important;
    max-width: none !important;
    min-width: 0 !important;
    max-height: calc(100vh - var(--login-panel-top, 56px) - 12px) !important;
    max-height: calc(100dvh - var(--login-panel-top, 56px) - 12px) !important;
    margin: 0 !important;
    padding: 0 !important;
    border: 1px solid #ded7c7 !important;
    border-top: 2px solid #c33a1e !important;
    border-radius: 0 !important;
    transform: none !important;
  }
}
</style>
