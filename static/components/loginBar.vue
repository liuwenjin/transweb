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
                  :src="userData.image"
                  ><i class="bi bi-pencil-square"></i
                ></el-avatar>
              </div>
              <span class="menuItemList">
                <span v-for="d in loginedMenu" :key="d.label">
                  <el-button 
                    class="actionGridBtn"
                    :loading="d.loading" 
                    :disabled="d.loading" 
                    @click="handleClickMenu(d)">{{
                    d.label
                  }}</el-button>
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
    if (typeof this.switchRoleData === "function") {
      this.switchRoleData();
    }
    this.$nextTick(() => {
      this.updatePopoverWidth();
    });
  },
  beforeUnmount() {
    window.removeEventListener("applangchange", this.onLangChange);
    window.removeEventListener("resize", this.updatePopoverWidth);
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
    handlePopoverShow() {
      this.popoverShow = true;
      this.updatePopoverWidth();
    },
    // 根据触发按钮的右边缘位置计算浮窗宽度：
    // 浮窗为 bottom-end（右对齐），宽度 = min(460, 触发按钮右边缘 - 左边距)。
    // 移动端保证最小宽度 360px，同时尽量宽且不越过左侧边界。
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
   原研哉「白与空」设计系统（仅重写样式，未改动模板与交互逻辑）
   - 纸白 #fafafc / 墨色 #1a1a1e / 淡墨 #6e6e73 / 细线 #e7e7eb
   - 直角卡片，主按钮墨色水滴微光，点击 1px 下沉
   ========================================================================== */
.loginContentArea {
  --paper: #fafafc;
  --card: #ffffff;
  --field: #f8f8fa;
  --field-hover: #f4f4f6;
  --ink: #1a1a1e;
  --ash: #6e6e73;
  --ash-2: #a5a5aa;
  --line: #e7e7eb;
  --border: #ebebef;
  --border-strong: #9999a0;
  --red: #a0554a;
  --serif: "Source Han Serif SC", "Noto Serif SC", "Songti SC", "STSong", serif;
  --sans: Inter, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial,
    "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  --shadow-card: 0 20px 70px rgba(20, 20, 30, 0.055),
    0 2px 8px rgba(20, 20, 30, 0.025);
  --ease-out: cubic-bezier(0.2, 0.7, 0.2, 1);
}

/* ==========================================================================
   Base Layout Container
   ========================================================================== */
.loginContentArea {
  text-align: right;
  line-height: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  height: 30px;
  font-family: var(--sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ==========================================================================
   未登录「登录 / 注册」按钮：墨色
   ========================================================================== */
.login-main-btn.el-button {
  height: 32px !important;
  padding: 0 12px !important;
  border-radius: 0px !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  letter-spacing: 0.1em;
  background: var(--ink) !important;
  border: 1px solid var(--ink) !important;
  color: #ffffff !important;
  box-shadow: none !important;
  transition: all 0.3s var(--ease-out) !important;
}

.login-main-btn.el-button:hover {
  background: #2b2b31 !important;
  border-color: #2b2b31 !important;
  color: #ffffff !important;
  box-shadow: 0 6px 18px rgba(20, 20, 30, 0.18) !important;
}

.login-main-btn.el-button:active {
  transform: translateY(1px) !important;
}

/* ==========================================================================
   Popover 卡片：纸白纸片，直角
   ========================================================================== */
.saas-premium-popover.el-popper {
  padding: 0 !important;
  background: var(--card) !important;
  border: 1px solid var(--border) !important;
  border-radius: 0px !important;
  right: 0px !important;
  box-shadow: var(--shadow-card) !important;
  overflow: hidden;
  transition: all 0.35s var(--ease-out);
}

/* ==========================================================================
   登录后触发按钮
   ========================================================================== */
.user-trigger-btn {
  height: 30px !important;
  line-height: 30px !important;
  padding: 0 10px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  border-radius: 0px !important;
  width: calc(100% - 10px);
  background: var(--card) !important;
  border: 1px solid var(--line) !important;
  color: var(--ink) !important;
  box-shadow: none !important;
  transition: all 0.3s var(--ease-out) !important;
}

.user-trigger-btn:hover {
  background: var(--field-hover) !important;
  border-color: var(--border-strong) !important;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(20, 20, 30, 0.08) !important;
}

.loginContentArea[popovershow="true"] > .user-trigger-btn {
  background: var(--ink) !important;
  color: #ffffff !important;
  border-color: var(--ink) !important;
  box-shadow: 0 4px 12px rgba(20, 20, 30, 0.18) !important;
}

/* ==========================================================================
   触发按钮内的积分徽章
   ========================================================================== */
.pointsValueTips {
  font-size: 13px;
  font-weight: 600;
  color: var(--ash);
  margin-left: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.pointsValueTips .icon {
  display: inline-block;
  vertical-align: middle;
}

/* 积分图标统一收拢为墨色 */
.pointsValueTips .icon path {
  fill: var(--ink) !important;
}

.pointsValueTips .unit {
  font-size: 11px;
  font-weight: 500;
  color: var(--ash-2);
  margin-left: 1px;
}

/* ==========================================================================
   Popover 用户信息卡
   ========================================================================== */
.mySpaceInfo {
  padding: 24px;
  background: var(--card);
  border-radius: 0px;
}

.loginContentArea .el-popper {
  max-height: 460px !important;
}

.personalInfoItem {
  padding: 16px 0;
  font-size: 14px;
  color: var(--ash);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--line);
  transition: background-color 0.2s ease;
}

.itemLabel {
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  letter-spacing: 0.04em;
  color: var(--ash-2);
  min-width: 80px;
  white-space: nowrap;
}

.itemContent {
  flex: 1;
  font-weight: 600;
  margin-left: 15px;
  color: var(--ink);
  padding: 0 12px;
}

.pointsValue {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI",
    Roboto, sans-serif;
  color: var(--ink);
  padding: 0 12px;
  font-variant-numeric: tabular-nums;
}

.pointsValue.primaryValue {
  color: var(--ink);
  font-size: 16px;
  font-weight: 700;
}

/* ==========================================================================
   头像编辑区
   ========================================================================== */
.avaterEdit {
  padding-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.avatarContainer {
  position: relative;
  display: inline-block;
  flex: 0 0 auto;
}

.user-large-avatar {
  cursor: pointer;
  border: 1px solid var(--line) !important;
  box-shadow: none;
  transition: all 0.3s ease !important;
  background-color: var(--field) !important;
}

.user-large-avatar:hover {
  transform: scale(1.03);
  box-shadow: 0 8px 20px rgba(20, 20, 30, 0.1);
}

/* ==========================================================================
   网格菜单按钮
   ========================================================================== */
.menuItemList {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  flex: 1 1 auto;
  min-width: 0;
  margin-left: 16px;
  float: none;
}

.menuItemList > span {
  margin-bottom: 0;
  display: block;
}

.menuItemList > span:nth-child(2n) {
  margin-left: 0;
}

.actionGridBtn.el-button {
  width: 100% !important;
  height: 38px !important;
  border-radius: 0px !important;
  background: var(--field) !important;
  border: 1px solid var(--line) !important;
  color: var(--ash) !important;
  font-weight: 500 !important;
  font-size: 13px !important;
  box-shadow: none !important;
  padding: 0 10px !important;
  overflow: hidden;
  transition: all 0.25s var(--ease-out) !important;
}

.actionGridBtn.el-button:hover {
  background: var(--card) !important;
  color: var(--ink) !important;
  border-color: var(--border-strong) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(20, 20, 30, 0.08) !important;
}

.actionGridBtn.el-button:active {
  transform: translateY(1px) !important;
}

/* 长英文文案（如 "AIGC History"）超长时优雅省略，避免溢出 */
.actionGridBtn.el-button :deep(.el-button__text) {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* ==========================================================================
   次级 / 主操作按钮
   ========================================================================== */
.subtleBtn.el-button {
  background: var(--field) !important;
  border: 1px solid transparent !important;
  color: var(--ash) !important;
  font-weight: 500 !important;
  letter-spacing: 0.04em;
  padding: 0 14px !important;
  transition: all 0.2s ease !important;
}

.subtleBtn.el-button:hover {
  background: var(--field-hover) !important;
  color: var(--ink) !important;
}

.primaryGradientBtn.el-button {
  background: var(--ink) !important;
  border: 1px solid var(--ink) !important;
  color: #ffffff !important;
  font-weight: 500 !important;
  letter-spacing: 0.04em;
  padding: 0 16px !important;
  box-shadow: none !important;
  transition: all 0.25s ease !important;
}

.primaryGradientBtn.el-button:hover {
  background: #2b2b31 !important;
  border-color: #2b2b31 !important;
  color: #ffffff !important;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(20, 20, 30, 0.16) !important;
}

.primaryGradientBtn.el-button:active {
  transform: translateY(1px) !important;
}

/* ==========================================================================
   退出登录 / 底部操作
   ========================================================================== */
.exitLogined {
  margin-top: 12px;
  padding-top: 16px;
  padding-bottom: 0;
  display: block;
}

.exitLogined .el-button.exitButton {
  padding: 0;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--red);
  transition: all 0.2s ease;
}

.exitLogined .el-button.exitButton:hover {
  color: #8a453c;
  opacity: 0.9;
}

.el-avatar {
  background-color: transparent;
}

.avatarContainer .el-avatar {
  padding: 0px;
}

.exitLogined .el-button.modifyButton {
  padding: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--ash-2);
  transition: all 0.2s ease;
}

.exitLogined .el-button.modifyButton:hover {
  color: var(--ink);
}

/* ==========================================================================
   昵称编辑态
   ========================================================================== */
.nickNameEdit > span[contenteditable="true"] {
  border-bottom: 1px solid var(--ink);
  outline: none;
  background: var(--field-hover);
  padding: 2px 8px;
  border-radius: 0px;
}

/* ==========================================================================
   无障碍：键盘焦点可见
   ========================================================================== */
.loginContentArea .el-button:focus-visible,
.loginContentArea .el-avatar:focus-visible,
.loginContentArea [contenteditable="true"]:focus {
  outline: 1px solid var(--ink);
  outline-offset: 3px;
}

/* ==========================================================================
   移动端适配：浮窗宽度与内容布局
   ========================================================================== */
@media (max-width: 767px) {
  .mySpaceInfo {
    padding: 20px 16px;
  }

  /* 移动端按钮更紧凑，保证 "AIGC History" 等英文完整显示 */
  .actionGridBtn.el-button {
    padding: 0 8px !important;
    font-size: 12px !important;
  }
}

/* ==========================================================================
   无障碍：动效敏感用户降级
   ========================================================================== */
@media (prefers-reduced-motion: reduce) {
  .saas-premium-popover.el-popper,
  .user-trigger-btn,
  .user-large-avatar,
  .actionGridBtn.el-button,
  .subtleBtn.el-button,
  .primaryGradientBtn.el-button {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transform: none !important;
  }
}

</style>