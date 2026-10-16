<template>
  <div
    ref="rootElementItem"
    class="treeEditorArea"
    :status="status"
    :agent="agent"
    :mode="mode"
  >
    <div class="topOptionArea" v-if="!headerHidden && !topHeaderHidden">
      <div class="topInfoList">
        <el-button
          v-if="headerHidden"
          @click="handleClickBack"
          text
          type="primary"
          ><el-icon><arrow-left-bold /></el-icon
        ></el-button>
        <span class="logoArea">
          <el-image
            :style="{
              width: '40px',
              height: '40px',
              marginTop: '-3px',
              borderRadius: '100%',
              'vertical-align': 'middle',
            }"
            fit="contain"
            :src="logoSrc"
            class="logoImageItem"
          ></el-image>

          <el-dropdown
            v-if="appList.length > 1 && !isIframe"
            :style="{ marginLeft: flag === 1 ? '-3px' : '' }"
          >
            <span
              class="el-dropdown-link subTextItem"
              :style="{
                marginLeft: currentApp.name === 'homePageApp' ? '15px' : '5px',
              }"
            >
              <span class="ellipsis titleItem" v-html="appLabel"></span>
              <el-icon class="el-icon--right" v-if="!isIframe">
                <arrow-down />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <slot v-for="item in appList">
                  <el-dropdown-item
                    v-if="currentApp.name !== item.name"
                    @click="switchAppItem(item.name)"
                    >{{ item.meta ? item.meta.label : "..." }}</el-dropdown-item
                  >
                </slot>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <span
            v-else
            class="subTextItem ellipsis"
            @click="switchAppItem(currentApp.name)"
            :style="{
              marginLeft: currentApp.name === 'homePageApp' ? '15px' : '15px',
            }"
            v-html="appLabel"
          ></span>
          <span
            v-if="!flag"
            class="descSpanItem ellipsis"
            :title="appDesc"
            v-html="appDesc"
          ></span>
          <!-- Primary Menu -->
        </span>
        <div
          v-if="menuData && menuData.length !== 0"
          :style="{
            display: 'inline-block',
            'margin-left': flag ? '90px' : '350px',
          }"
          class="menuListArea hidden md:tw-flex tw-items-center tw-space-x-3"
        >
          <slot v-for="item in menuData" :key="item.label">
            <a
              :href="item.src"
              class="no-underline-on-hover tw-relative tw-py-3 tw-px-1 tw-text-gray-900 tw-font-semibold tw-transition-transform tw-transition-colors tw-duration-300 hover:no-underline tw-transform hover:translate-y-1 hover:text-orange-600"
            >
              {{ item.label }}
            </a>
          </slot>
        </div>
        <div class="loginRegItem" ref="loginRegItem"></div>
      </div>
    </div>
    <div
      :style="{ height: isSolo || topHeaderHidden ? '100%' : '' }"
      class="treeEditorContainer"
      ref="editorContainerItem"
    >
      <div ref="menuAreaItem" v-if="!foldFlag" class="leftMenuArea"></div>
      <div
        class="treeItemEditorArea"
        id="treeItemEditorContainer"
        ref="treeItemEditorContainer"
      >
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    let folderName = localStorage.getItem("folderName");
    let agentId =
      WebTool.urlQuery(location.href, "agent") || window.agent || "4140329349";
    return {
      appName: "cardNotes",
      status: 1,
      lang: lang,
      isIframe: window.parent !== window,
      shareInfo: {
        name: "",
        id: "",
        status: false,
        link: "",
      },
      documentMeta: {},
      fragments: [],
      currentIndex: 0,
      isSolo: WebTool.urlQuery(location.href, "solo"),
      currentSettings: {
        publishStatus: false,
        publishTime: 1742783130557,
        price: 0,
        editorAgent: "",
      },
      priceOptions: [0, 1000, 2000, 5000, 10000, 20000],
      checkLoginPromise: null,
      handleSliderStatus: false,
      recordingStatus: false,
      topHeaderHidden: WebTool.urlQuery(location.href, "headerHidden"),
      currentApp: {},
      currentContent: [],
      agent: agentId,
      currentDocumentId: WebTool.urlQuery(location.href, "id"),
      appList: [],
      dbInfo: {
        dbName: "myDatabase",
        storeName: "myStore",
        key: "latest",
      },
      menuData: [],
      indexDB: null,
      dbStore: null,
      indexString: "",
      indexTitle: "",
      mode: "edit",
      // editMode: WebTool.urlQuery(location.href, "editMode"),
      logoPath: "/webApps/document/logo.png",
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
      pptModeEditor: {
        url: webCpu.documentPrefix + "/webApps/document/container.vue",
        className: "ElementVueItem",
        cardName: "agentContainerCard",
      },
      loadingTips: `<div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>`,
      defaultImage: "",
      isVisible: false,
      selectedFiles: [],
      oneKeyApp: {
        url: "/webApps/document/input.vue",
        className: "ElementVueItem",
        cardName: "oneKeyCard",
        destroyed: false,
        dsl: {
          data: {},
          style: {
            padding: "0px 10px",
          },
          promise: {},
        },
      },
      effectSwitch: false,
      dialogStyle: {
        background: "linear-gradient(to bottom right, #6951FF, #10EDC5)",
        maxWidth: "1000px",
        width: "98%",
        maxHeight: "95%",
        boxShadow: "2px 2px 2px #999",
        borderRadius: "20px",
        borderTop: "solid 1px #ddd",
        borderLeft: "solid 1px #ddd",
        overflow: "hidden",
      },
      id: WebTool.urlQuery(location.href, "id"),
      countdownTimer: null,
      contentMap: {},
      currentData: {},
      currentKey: 1,
      timeout: 0,
      foldFlag: false,
      domainFlag: true,
      flag: WebTool.adjustSize([false, false, true]),
      currentClassName: "",
      editorUrl: "https://transweb.cn/index.html",
      localBook: "",
      layout: "",
      loginRegItem: {
        url: webCpu.documentPrefix + "/mainApp/app/loginRegItem.js",
        key: "transweb_loginRegItem",
        cardName: "loginRegCard",
      },
      loginReg: {
        url: webCpu.documentPrefix + "/mainApp/app/loginReg.js",
        key: "transweb_loginReg",
      },
      appList: [],
      resolution: ["100%", "100%"],
      resolutionMap: {
        小红书: [1024, 1024],
        抖音: [768, 1344],
        Bilibili: [1344, 768],
        视频号: [768, 1344],
      },
      isPartner: false,
      interface: {
        setDocumentAttribute: {
          url: webCpu.documentPrefix + "/user/setDocumentStatus",
          method: "post",
          dataType: "json",
        },
        getOpenid: {
          url: webCpu.documentPrefix + "/wxGetOpenid",
          requestType: "get",
          dataType: "json",
        },
        generateContent: {
          url: webCpu.documentPrefix + "/gpt/aiGatewayRequest",
          method: "post",
          timeout: 5 * 60 * 1000,
        },
        getUserInfo: {
          url: webCpu.documentPrefix + "/user/getLoginInfo",
          method: "get",
          dataType: "json",
        },
        publishPptItem: {
          url: webCpu.documentPrefix + "/user/publishPptItem",
          method: "post",
          dataType: "json",
        },
        _saveDocumentData: {
          url:
            webCpu.documentPrefix +
            "/bucket/personal/{{folderName}}/document/{{name}}?bucketExtra=true",
          method: "put",
          dataType: "json",
        },
        saveDocumentData: {
          url:
            webCpu.documentPrefix +
            "/bucket/personal/{{folderName}}/document/{{name}}",
          method: "put",
          dataType: "json",
        },
        deleteDocumentData: {
          url: webCpu.documentPrefix + "/user/deleteDocumentData",
          method: "post",
          dataType: "json",
        },
        confirmSubscriptionOrder: {
          url: webCpu.documentPrefix + "/user/confirmSubscriptionOrder",
          method: "post",
          dataType: "json",
        },
        removeDocumentItem: {
          url:
            webCpu.documentPrefix +
            "/bucket/personal/{{folderName}}/document/{{name}}",
          method: "delete",
          dataType: "json",
        },
        getInteractionList: {
          url: webCpu.documentPrefix + "/user/getInteractionList",
          method: "get",
          dataType: "json",
        },
        getAgents: {
          url:
            webCpu.documentPrefix + "/webApps/document/pptSelector/agents.js",
          method: "jsonp",
          query: {
            callback: "transweb_pptViewerApp",
          },
          dataType: "json",
        },
      },
      custom: WebTool.urlQuery(location.href, "custom"),
      interactionList: [],
      introduce: "",
      foreign:
        location.host === "transweb.ai" ||
        WebTool.urlQuery(location.href, "foreign"),
      myShareList: webCpu.appConfig.agentListApp,
      moduleEditor: {
        url: webCpu.documentPrefix + "/mainApp/app/moduleEditor/main.vue",
        className: "ElementVueItem",
        cardName: "moduleManagerItem",
        dsl: {
          style: {
            paddingLeft: "30px",
            paddingRight: "30px",
            paddingTop: "20px",
          },
          params: {
            name: "module.js",
            folderName: folderName,
          },
          url:
            webCpu.documentPrefix +
            "/bucket/personal/{{folderName}}/app/{{name}}",
          requestType: "_jsonp",
          query: "transweb_layout_collection",
          dataFilter: function (tData) {
            this.defaultData = this.defaultData || {};
            if (tData && !tData.ret) {
              this.defaultData.appList = tData;
            } else {
              this.defaultData.appList = [];
            }

            return this.defaultData;
          },
          data: {
            templatePath:
              webCpu.documentPrefix + `/bucket/personal/${folderName}/layout`,
            appList: [],
          },
        },
      },
      rechargeApp: {
        url: webCpu.documentPrefix + "/mainApp/app/recharge.vue",
        className: "ElementVueItem",
        dsl: {
          data: {
            tokenRate: 1,
            serviceName: "TransWeb 智能服务",
            serviceDesc: "按 AI 算力消耗计费，每 1 token 扣除 1/10 积分。",
            productList: [
              {
                title: "个人体验版",
                description:
                  "包含基础功能(通用 Agent 应用生成，Agent 应用内容版本管理功能等)。",
                price: 500,
                tokens: 5000,
              },
              {
                title: "专业迭代版",
                description: "包含更多高级功能（比如高阶 Agent 应用定制等）。",
                price: 2000,
                tokens: 21000,
              },
              {
                title: "企业专享版",
                description:
                  "包含全部功能；以及 token 分成的权益（联系客户签订协议获得）。",
                price: 30000,
                tokens: 350000,
              },
            ],
          },
        },
      },
      userInfo: {
        tokenUsed: 0,
        tokenLimit: 0,
      },
      defaultAvatar: webCpu.documentPrefix + "/assets/images/logo.png",
      isLogined: false,
      breadcrumbsHidden: false,
      nodeIndex: WebTool.urlQuery(location.href, "nodeIndex"),
      cardIndex: WebTool.urlQuery(location.href, "cardIndex"),
      timer: null,
      addImageApp: {
        url: webCpu.documentPrefix + "/webApps/document/addImageApp.vue",
        className: "ElementVueItem",
      },
      addVideoApp: {
        url: webCpu.documentPrefix + "/webApps/document/addVideoApp.vue",
        className: "ElementVueItem",
      },
      addAgentApp: {
        url: webCpu.documentPrefix + "/webApps/document/addAgentApp.vue",
        className: "ElementVueItem",
      },
      api: window.electronAPI || window.__electronAPI__ || null,
    };
  },
  created() {
    this.initAdapter();
    this.currentApp.publishInfo = this.currentApp.publishInfo || {
      user:
        currentAgentData["name_" + lang] ||
        currentAgentData.name ||
        webCpu.messages[lang].anonymous,
      introduce:
        currentAgentData["introduce_" + lang] || currentAgentData.introduce,
      folderName: currentAgentData.folderName,
      avatar: currentAgentData.image,
    };
  },
  computed: {
    headerHidden() {
      return window.iframeEnable && window.parent !== window;
    },
    userName() {
      let name =
        this.userInfo["name_" + lang] ||
        this.userInfo.name ||
        this.$t("anonymous");
      return name;
    },
    pointsTips() {
      let str = `<span>${this.userInfo.tokenUsed.toLocaleString("en-US")}</span>
                  /<span style="margin-left: 5px">${this.userInfo.tokenLimit.toLocaleString(
                    "en-US"
                  )}</span>`;
      return str;
    },
    appLabel() {
      let appMap = {};
      this.appList.map((item) => {
        appMap[item.name] = item;
      });
      this.currentApp = appMap[this.appName] || this.currentApp || {};
      let meta = this.currentApp.meta || {};
      let label = meta.label || webCpu.messages[lang].anonymous;
      return label;
    },
    appDesc() {
      let appMap = {};
      this.appList.map((item) => {
        appMap[item.name] = item;
      });
      this.currentApp = appMap[this.appName] || this.currentApp || {};
      let meta = this.currentApp.meta || {};
      let desc = meta.description || this.$t("functionDesc");
      return WebTool.getSpanText(desc);
    },
    logoSrc() {
      this.currentApp = this.currentApp || {};
      this.currentApp.publishInfo = this.currentApp.publishInfo || {
        user:
          currentAgentData["name_" + lang] ||
          currentAgentData.name ||
          webCpu.messages[lang].anonymous,
        introduce:
          currentAgentData["introduce_" + lang] || currentAgentData.introduce,
        folderName: currentAgentData.folderName,
        avatar: currentAgentData.image,
      };
      let src =
        this.currentApp &&
        this.currentApp.publishInfo &&
        this.currentApp.publishInfo.avatar
          ? this.currentApp.publishInfo.avatar
          : this.logoPath;
      if (
        !window.agent &&
        !(this.currentApp.publishInfo && this.currentApp.publishInfo.avatar)
      ) {
        src = this.logoPath;
      } else {
        src = this.currentApp.publishInfo.avatar || this.defaultAvatar;
      }
      return src;
    },
    isOwner() {
      let ret = false;
      if (this.documentMeta) {
        ret = this.documentMeta.folderName === localStorage.folderName;
      }
      return ret;
    },
    tokenOwner() {
      let ret =
        this.currentSettings.editorAgent &&
        this.currentSettings.editorAgent === localStorage.folderName;
      ret = ret || (!this.currentSettings.editorAgent && this.isOwner);
      return ret;
    },
    editable() {
      let ret = false;
      if (this.documentMeta) {
        ret =
          localStorage.folderName &&
          this.documentMeta.folderName === localStorage.folderName;
      }
      // ret = ret && !(this.currentSettings.editorAgent && this.currentSettings.editorAgent !== localStorage.folderName)
      localStorage.editable = ret;
      return ret;
    },
  },
  mounted() {
    this.$nextTick(() => {
      let r = WebTool.urlQuery(location.href, "r");

      if (r) {
        this.currentApp.resolution = JSON.parse(r);
      }

      this.resolution = this.currentApp.resolution ||
        this.resolution || ["100%", "100%"];
      if (
        typeof this.resolution[0] === "string" &&
        this.resolution[0].search("%") === -1
      ) {
        this.resolution[0] = Number(this.resolution[0]);
      }
      if (
        typeof this.resolution[1] === "string" &&
        this.resolution[1].search("%") === -1
      ) {
        this.resolution[1] = Number(this.resolution[1]);
      }
      this.currentApp.resolution = this.resolution;

      this.currentApp.appType = this.currentApp.appType || "single";

      $(".fileNameTitle .titleSpan").on("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault(); // 阻止浏览器插入换行
        }
      });
      this.initView();
    });
  },
  methods: {
    saveProjectData() {
      let tData = {
        content: this.currentContent,
        app: this.currentApp,
        documentMeta: this.documentMeta,
      };
      const blob = new Blob([JSON.stringify(tData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      let tItem = this.currentContent[0].content || this.currentContent[0];
      tItem.title = tItem.title.slice(0, 8);
      a.download =
        (tItem.title || "transwebProject") + "." + this.shareInfo.id + ".proj";
      a.click();
      URL.revokeObjectURL(url);
      this.$message({
        type: "success",
        message: "保存成功。",
      });
    },
    openProjectData() {
      let inputRef = this.$refs.hiddenProjectInput;
      inputRef.click();
    },
    async projectFileSelected(event) {
      const file = event.target.files[0];
      if (!file) return;
      try {
        const text = await file.text(); // 也可用 FileReader
        let tData = JSON.parse(text);

        this.previewAppItem(tData.content, tData.app, tData.documentMeta);
        this.$message({
          type: "success",
          message: "打开成功。",
        });
        console.log("JSON 数据：", tData);
      } catch (e) {
        console.error("解析失败：", e);
        this.$message({
          type: "warning",
          message: "内容解析失败。",
        });
      }
      event.target.files.length = 0;
      event.target.value = "";
    },
    initView() {
      if (
        this.currentContent &&
        this.currentContent.length !== 0 &&
        this.currentApp
      ) {
        this.shareInfo.status = true;
        this.documentMeta = this.documentMeta || {};
        if (
          this.documentMeta.folderName !== localStorage.folderName &&
          this.documentMeta.rootAccount !== localStorage.folderName
        ) {
          this.mode = "view";
        }

        if (
          this.documentMeta.rootAccount === localStorage.folderName ||
          this.currentSettings.editorAgent === localStorage.folderName
        ) {
          this.mode = "edit";
        }

        if (
          this.currentContent[0].content.platform &&
          this.resolutionMap[this.currentContent[0].content.platform]
        ) {
          this.resolution =
            this.resolutionMap[this.currentContent[0].content.platform];
        }

        this.displayPptViewer(this.currentContent, this.currentApp, null, true);
        localStorage.docType = true;
        this.shareInfo.link =
          location.origin + location.pathname + "?id=" + this.shareInfo.id;
        if (localStorage.folderName) {
          this.shareInfo.link += "&fromAccount=" + localStorage.folderName;
        }
        this.currentContent[0] = this.currentContent[0] || {};
        let cc = this.currentContent[0].content || {};
        cc = cc[0] || cc;
        if (this.currentContent[0].content.isSolo) {
          this.isSolo = true;
        }
        this.shareInfo.name =
          cc.title ||
          cc.name ||
          this.documentMeta.fileName ||
          this.$t("anonymous");
      } else {
        this.displayOneKeyApp();
        localStorage.docType = false;
        if (this.id) {
          this.$message({
            type: "warning",
            message: webCpu.messages[lang].linkErrorTips,
          });
        }
      }
      this.$nextTick(() => {
        let service = WebTool.urlQuery(location.href, "service");
        if (service) {
          this.openPriceInfo(Number(service));
        }
      });
      this.updateLoginStatus();
      let _self = this;
      webCpu.mitt.on("pointsChange", function (value) {
        _self.updateLoginStatus();
      });

      webCpu.mitt.on("openProject", function (value) {
        _self.openProjectData();
      });

      webCpu.mitt.on("exportSlider", function (value) {
        _self.exportSingleSlider(value);
      });

      webCpu.mitt.on("openPriceInfo", function (value) {
        _self.openPriceInfo();
      });

      webCpu.mitt.on("rechargeAccount", function (value) {
        _self.rechargeAccount(value);
      });

      webCpu.mitt.on("subscriptionSuccess", function (value) {
        console.log("subscriptionSuccess", value);
        _self.confirmSubscriptionOrder(value);
      });

      webCpu.mitt.on("openArticleDialog", function (value) {
        _self.displayArticleDialog(value);
      });

      webCpu.mitt.on("handleDeal", function (value) {
        _self.checkLogined(function () {
          let app = _self.currentPriceApp;
          if (app && app.card && app.card.task && app.card.task.vueItem) {
            app.card.task.vueItem.activePaypal(value);
          }
          // check out!
        });
      });

      webCpu.mitt.on("contentUpdated", function (d) {
        // _self.updateLoginStatus();
        _self.fragments = _self.currentContent = d;
      });

      webCpu.mitt.on("storeComponent", function (d) {
        d = d.content || d;
        _self.storeComponent(d[0].content);
      });

      webCpu.mitt.on("setDataMap", (d) => {
        this.setDataMap(d);
      });

      // saveContent
      webCpu.mitt.on("saveContent", function (d) {
        _self.fragments = _self.currentContent = d.data || d.content || d;
        if (
          !d.app &&
          localStorage.folderName === _self.documentMeta.folderName &&
          !d.copy
        ) {
          _self._shareItem(
            false,
            () => {
              let tItem = _self.currentPptApp.card.task.vueItem;
              if (
                d &&
                tItem &&
                d.toIndex !== undefined &&
                tItem.index !== d.toIndex
              ) {
                tItem.switchToFragment(d.toIndex);
              }
            },
            "message"
          );
        } else {
          _self.saveDocumentItem(
            (tData) => {
              location.href = `${location.origin}?id=${tData.documentId}`;
            },
            d,
            d.copy
          );
        }
      });

      this.isLogined = false;
      // playSliderItem
      webCpu.mitt.on("playSliderItem", function (d) {
        _self.clickPlayButton(Number(d));
      });

      webCpu.mitt.on("fragmentIndexChange", function (value) {
        if (
          _self.currentPptApp &&
          _self.currentPptApp.card &&
          _self.currentPptApp.card.task
        ) {
          let vueItem = _self.currentPptApp.card.task.vueItem;
          _self.fragments = vueItem.fragments;
          _self.currentIndex = value;
          _self.setIndexTitle();
          _self.setIndexString();
        }
      });

      WebTool.urlToBase64(this.rechargeApp.url, function (str) {
        _self.rechargeApp.url = str;
      });

      this.getInteractionList();
    },
    handleTitleChange(e) {
      let elem = e.currentTarget;
      this.fragments[0].content.title = elem.innerText;
      this.shareInfo.name = elem.innerText.trim();
      this.setDocumentAttribute(
        {
          key: "name",
          value: this.shareInfo.name,
        },
        (tData) => {
          if (tData.ret === 0) {
            this.$message({
              type: "success",
              message: "标题修改成功。",
            });
          }
        }
      );
    },
    openBillDialog(type) {
      let titleMap = {
        income: "积分收入记录",
        expenses: "积分消费记录",
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
    openPosterDialog() {
      let content = this.currentContent[0].content;
      dialogMap.openDocumentApp(
        this.currentSettings.posterAppFile || webCpu.appConfig.appDefaultPoster,
        {
          dialogTitle: "[海报]" + content.title,
          data: {
            accountData: {
              appId: WebTool.urlQuery(location.href, "id"),
              名称: content.title,
              一句描述: content.description,
              亮点介绍: content.introduce,
              几句话: this.documentMeta.aigcRecord.length,
              创作者: this.documentMeta.userName,
              头像: this.userInfo.image,
            },
          },
        }
      );
    },
    updatePosterContainer() {
      let elem = this.$refs.qrPosterContainer;
      elem.innerHTML = "";
      if (localStorage.userInfo && this.editable) {
        userInfo = JSON.parse(localStorage.userInfo) || {};
      }
      let posterItem = this.currentApp.contentPosterItem || {};
      let url = this.shareInfo.link;
      let app = {
        url: posterItem.url || "/webApps/document/contentPosterApp.vue",
        className: posterItem.className || "ElementVueItem",
        dsl: posterItem.dsl || {
          style: {
            width: 900,
            height: 900,
          },
          data: {
            contentTitle: this.shareInfo.name,
            url: url,
            image: "",
            author: this.documentMeta.userName,
            appName:
              this.currentApp.publishInfo.user +
              " - " +
              this.currentApp.meta.label,
          },
        },
      };
      webCpu.updateView(elem, app);
    },
    getInteractionList(id) {
      id = id || WebTool.urlQuery(location.href, "id");
      if (!id) {
        return false;
      }
      this.adapter.getInteractionList(
        {
          documentId: id,
        },
        (tData) => {
          this.interactionList = tData.data;
        }
      );
    },
    copyDocumentId() {
      WebTool.copyString(this.shareInfo.id);
      this.$message({
        type: "success",
        message: webCpu.messages[lang].copySuccessTips,
      });
    },
    async downloadPosterItem() {
      let elem = $(this.$refs.qrPosterContainer).find(
        ".ElementVueItem._task_container"
      )[0];
      await WebTool.transformImage(elem, this.shareInfo.name);
    },
    addAgentItem(elem, context, params, style) {
      let app = JSON.parse(JSON.stringify(this.addAgentApp));
      app.style = {
        padding: "30px 40px",
      };
      app.dsl = {
        data: {
          promptContext: context,
          params: {
            fromAccount: this.documentMeta.fromAccount,
            rootAccount: this.documentMeta.rootAccount,
          },
        },
      };

      webCpu.renderCardDialog(
        elem,
        app,
        params || {
          title: webCpu.messages[lang].addAgent,
          closeType: "back",
          renderMode: "stack",
          titleStyle: {
            background: "var(--el-color-primary-light-9)",
            color: "var(--el-color-primary)",
          },
        },
        style || {
          backgroundColor: "rgba(200, 200, 200, 0.1)",
          border: "solid 1px #eee",
        }
      );
    },
    addVideoItem(elem, context, params, style) {
      let app = JSON.parse(JSON.stringify(this.addVideoApp));
      app.style = {
        padding: "30px 40px",
      };

      app.dsl = {
        data: {
          promptContext: context,
        },
      };
      webCpu.renderCardDialog(
        elem,
        app,
        params || {
          title: webCpu.messages[lang].addVideo,
          closeType: "back",
          renderMode: "stack",
          titleStyle: {
            background: "var(--el-color-primary-light-9)",
            color: "var(--el-color-primary)",
          },
        },
        style || {
          backgroundColor: "rgba(200, 200, 200, 0.1)",
          border: "solid 1px #eee",
        }
      );
    },
    addImageItem(elem, context, params, style) {
      let app = JSON.parse(JSON.stringify(this.addImageApp));
      app.style = {};
      app.style.padding = "30px 40px";
      params = params || {
        title: webCpu.messages[lang].addImage,
        closeType: "back",
        renderMode: "stack",
        titleStyle: {
          background: "var(--el-color-primary-light-9)",
          color: "var(--el-color-primary)",
        },
      };
      style = style || {
        backgroundColor: "rgba(200, 200, 200, 0.1)",
        border: "solid 1px #eee",
      };
      app.dsl = {
        data: {
          promptContext: context,
          publishInfo: this.currentApp.publishInfo,
          params: {
            fromAccount: this.documentMeta.fromAccount,
            rootAccount: this.documentMeta.rootAccount,
          },
        },
      };
      webCpu.renderCardDialog(elem, app, params, style);
    },
    redo() {
      let app = this.currentPptApp;
      if (app.card) {
        app.card.task.vueItem.redo();
      }
    },
    undo() {
      let app = this.currentPptApp;
      if (app.card) {
        app.card.task.vueItem.undo();
      }
    },
    initQrCode(c, url) {
      $(c).find(".hostQrCode>span.qrCodeCanvas").html("");
      $(c).find(".hostQrCode>span.qrCodeCanvas").qrcode({
        render: "canvas",
        text: url,
        width: 260, // 二维码的宽度
        height: 260, // 二维码的高度
        background: "#ffffff", // 二维码的后景色
        foreground: "#000000", // 二维码的前景色
        // src: "img/logo.png", // 二维码中间的图片
      });
    },
    sliderOptionClick(key) {
      let vueItem = this.currentPptApp.card.task.vueItem;
      this.handleSliderStatus = true;
      if (typeof vueItem[key] === "function") {
        vueItem[key](() => {
          this.handleSliderStatus = false;
        });
      }
    },
    handleImageError(e) {
      e.target.src = this.defaultAvatar;
    },
    exportImageItem(arr, div) {
      arr =
        arr ||
        this.fragments.map((d, index) => {
          return index;
        });

      let tArr = this.fragments.map((d, index) => {
        return index;
      });
      let vueItem = this.currentPptApp.card.task.vueItem;
      if (!div) {
        div = document.createElement("div");
        this.$refs.rootElementItem.appendChild(div);

        $(div).css({
          position: "absolute",
          zIndex: -1,
          display: "block",
          width: this.resolution[0] + "px",
          height: "auto",
        });
      }
      let t = tArr.length - arr.length;
      if (arr.length === 0) {
        vueItem.mode = "edit";
        vueItem.index = this.currentIndex || 0;
        vueItem.updateContent();
        let cc = this.fragments[tArr[0]].content;
        let fName = cc.title || cc.name;
        let tName = fName + ".png";

        let url = this.shareInfo.link;

        console.log("qr code url:", url);
        let tElem = document.createElement("div");
        $(tElem).css({
          float: "left",
          width: "100%",
          height: "auto",
          position: "relative",
        });
        let meta = this.currentApp.meta || {};
        tElem.innerHTML = `<div class="hostQrCode">
            <span
              class="tipsArea"
            >
              <span style="display: inline-block; width: 100%">${
                meta.scanQrTips || webCpu.messages[lang]["scanQrcodeTips"]
              }</span>
              <span>${webCpu.messages[lang]["bandInfoTips"]} ${
          location.host
        }</span>
            </span>
            <span class="qrCodeCanvas"></span>
          </div>`;

        div.appendChild(tElem);

        this.initQrCode(div, url);

        let canvas = div.querySelector("canvas");
        let img = document.createElement("img");
        img.src = canvas.toDataURL();
        let pSelector = $(canvas).parent();
        $(canvas).remove();
        img.style.width = "100%";
        img.type = "qrCode";
        pSelector.append(img);

        html2canvas(tElem).then((tCanvas) => {
          const iData = tCanvas.toDataURL("image/png");
          let iItem = document.createElement("img");
          iItem.src = iData;
          $(iItem).css({
            float: "left",
            position: "relative",
            width: "100%",
            height: "auto",
          });

          $(tElem).remove();

          div.appendChild(iItem);

          let tTemplate = div.innerHTML;
          $(div).remove();
          let card = {
            url: "/webApps/document/configExportImage.vue",
            className: "ElementVueItem",
            dsl: {
              data: {
                name: tName,
                url: url,
                fragments: this.fragments,
                resolution: this.currentApp.resolution || this.resolution,
                contentTemplate: tTemplate,
              },
            },
          };
          let callback1 = function () {
            let vueItem = card.card.task.vueItem;
            vueItem.confirmExportImage();
          };
          let callback2 = function () {
            let vueItem = card.card.task.vueItem;
            vueItem.confirmExportZip();
          };
          webCpu.CardItem.renderCardDialog(this._parent.card, card, {
            title: webCpu.messages[lang].exportSlider,
            dialogName: "exportSliderDialog",
            menu: [
              {
                label: `<span style="display: inline-block; padding: 0px 10px; font-size: 14px;"><i class="bi bi-download" style="margin-right: 5px"></i>${webCpu.messages[lang].exportLongImage}</span>`,
                action: callback1,
              },
              {
                label: `<span style="display: inline-block; padding: 0px 10px; font-size: 14px;"><i class="bi bi-download" style="margin-right: 5px"></i>${webCpu.messages[lang].exportImageZip}</span>`,
                action: callback2,
              },
            ],
            titleStyle: {
              background: "var(--el-color-primary-light-9)",
              color: "var(--el-color-primary)",
            },
            closeType: "back",
          });
        });
      } else {
        let n = arr.shift();
        t = tArr.length - arr.length;
        let progress = t + "/" + tArr.length;
        if (t === tArr.length) {
          progress = webCpu.messages[lang].completedTips;
        }
        let pValue = ((t * 100) / tArr.length).toFixed(2);

        let tStr = `<div class="progress">
            <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="${pValue}" aria-valuemin="0" aria-valuemax="100" style="width: ${pValue}%"></div>
          </div>
           <div style='margin-top: 10px; font-size: 12px; color: #777; text-align: center;'>${webCpu.messages[lang].exportImageTips}
            <span style='font-weight: 800; display: inline-block; padding: 0px 5px;'>${progress}</span>
          </div>
              `;

        let tApp = {
          className: "TemplateItem",
          task: {
            style: {
              paddingTop: "10px",
            },
            template: tStr,
          },
        };

        webCpu.CardItem.renderCardDialog(this._parent.card, tApp, {
          title: webCpu.messages[lang].exportSlider,
          dialogName: "exportSliderDialog",
          titleStyle: {
            background: "var(--el-color-primary-light-9)",
            color: "var(--el-color-primary)",
          },
          closeType: "back",
        });

        vueItem.mode = "view";
        vueItem.index = n;
        vueItem.updateContent();
        let timeout = 800;
        let dsl = this.fragments[n].content.dsl || [];
        let image = this.fragments[n].content.image || [];
        if (dsl.length > 0) {
          timeout = 3500;
        }

        this.$nextTick(() => {
          let pdfContainer = $(".contentViewerArea .pptAppContent").parent()[0];
          let iframe = $(pdfContainer).find("iframe")[0];

          if (iframe) {
            setTimeout(() => {
              pdfContainer = $(".contentViewerArea .pptAppContent").parent()[0];
              let iframe = $(pdfContainer).find("iframe")[0];
              this.replaceIframeItem(iframe, () => {});
            }, 500);
            timeout = 2500;
          }

          setTimeout(() => {
            pdfContainer = $(".contentViewerArea .pptAppContent").parent()[0];
            pdfContainer.style.borderRadius = "0px";
            pdfContainer.style.border = "none";
            pdfContainer.style.backgroundColor = "transparent";
            console.log("index", vueItem.index, "n", n);
            if (pdfContainer) {
              this.replaceSliderCanvas(pdfContainer);
              this.transfromSlider(pdfContainer, (img) => {
                div.appendChild(img);
                this.exportImageItem(arr, div);
              });
            } else {
              arr.unshift(n);
              this.exportImageItem(arr, div);
            }
          }, timeout);
        });
      }
    },
    transfromSlider(pdfContainer, callback) {
      html2canvas(pdfContainer, {
        backgroundColor: "none",
      }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        console.log(pdfContainer);
        let imageItem = document.createElement("img");
        imageItem.src = imgData;
        $(imageItem).css({
          float: "left",
          position: "relative",
          width: "100%",
          height: "auto",
          marginBottom: "10px",
        });
        if (typeof callback === "function") {
          callback(imageItem);
        }
      });
    },
    replaceSliderCanvas(pdfContainer) {
      let cArr = $(pdfContainer).find("canvas");
      for (let i = 0; i < cArr.length; i++) {
        let canvas = cArr[i];
        let img = document.createElement("img");

        img.src = canvas.toDataURL();

        let pSelector = $(canvas).parent();
        $(canvas).remove();
        img.style.width = "100%";
        pSelector.append(img);
      }
    },
    replaceIframeItem(iframe, callback) {
      let url = iframe.src;
      let elem = iframe.parentNode;
      let resolution = this.currentApp.resolution || this.resolution;
      let size = Math.min(resolution[0] - 80, resolution[1] - 220);
      let qrCodeApp = {
        url: "/plugins/elementVueItem/pageCard.vue",
        className: "ElementVueItem",
        dsl: {
          data: {
            cardStyle: {
              backgroundColor: "transparent",
              textAlign: "center",
            },
            info: {
              source: url,
            },
            optionMap: {
              source: {
                style: {
                  width: size + "px",
                  height: size + "px",
                  border: "solid 20px #fff",
                  borderRadius: "10px",
                  display: "inline-block",
                },
              },
            },
            config: [
              {
                prop: "source",
                type: "qrCode",
              },
            ],
          },
        },
      };
      webCpu.updateView(elem, qrCodeApp, function (c, d, t) {
        if (typeof callback === "function") {
          callback(c, d, t);
        }
      });
    },
    switchPage(attr) {
      let params = WebTool.getQueryParams(location.href);
      let origin = location.origin + location.pathname;
      params = webCpu.attachAttribute(attr, params);
      delete params.record;
      delete params.aScript;
      delete params.input;
      delete params.auto;
      location.href = WebTool.attachParams(origin, params);
      if (window.parent !== window) {
        this.handleClickBack();
      }
    },
    handleEntryContent(type, value) {
      let app = this.oneKeyApp;
      if (app.card && app.card.task && app.card.task.vueItem) {
        let vueItem = app.card.task.vueItem;
        if (type === "text") {
          vueItem.textContent = value;
          vueItem.docType = false;
        } else {
          //
        }
      } else {
        WebTool.copyString(value);
        // this.$message({
        //   type: "success",
        //   message: webCpu.messages[lang].copySuccessTips,
        // });
      }
    },
    getMindJson(jm) {
      if (!webCpu.cards.jsonEditorCard) {
        return false;
      }
      let vueItem = webCpu.cards.jsonEditorCard.task.vueItem;
      jm = vueItem.jm || window.jm;
      let tData = jm.get_data("node_tree");
      let content = WebTool.reverseJsMind(tData.data);
      return content;
    },
    openContentEditor() {
      this.currentRaw.value = this.fragments[0].content;
      this.openJsonEditor();
      // if (this.currentRaw.type !== "json") {
      //   this.openMarkdownEditor();
      // } else {
      //   this.openJsonEditor();
      // }
    },
    openJsonEditor() {
      let editor = {
        url: "/plugins/elementVueItem/pageCard.vue",
        className: "ElementVueItem",
        cardName: "jsonEditorCard",
        dsl: {
          data: {
            info: {
              content: {},
            },
            mode: "edit",
            optionMap: {
              content: {
                style: {
                  width: "100%",
                  height: "100%",
                },
              },
            },
            config: [
              {
                prop: "content",
                type: "mindmap",
              },
            ],
          },
        },
      };

      if (typeof this.currentRaw.value === "string") {
        editor.dsl.data.info.content = WebTool.stringToObject(
          this.currentRaw.value,
          true,
          {
            "\\\\": "\\\\",
            "\\n": "\\n",
          }
        );
      } else {
        editor.dsl.data.info.content = this.currentRaw.value;
      }

      let card = this._parent.card;
      let style = WebTool.copyObject(this.dialogStyle);

      style.height = "100%";
      style.width = "100%";
      // style.paddingBottom = "50px";
      style.maxWidth = "";
      style.maxHeight = "";
      style.borderRadius = "0px";
      if (this.flag) {
        style.width = "100%";
        style.height = "100%";
        style.maxWidth = "";
        style.maxHeight = "";
      }
      let _self = this;
      let copyContent = function () {
        let content = _self.getMindJson();
        console.log("json of node_tree: ", content);
        WebTool.copyString(JSON.stringify(content));
        _self.$message({
          type: "success",
          message: webCpu.messages[lang].copySuccessTips,
        });
      };
      let saveContent = function () {
        let notifyItem = _self.$notify({
          type: "info",
          message: webCpu.messages[lang].saving,
        });
        setTimeout(() => {
          let content = _self.getMindJson();
          content = WebTool.copyObject(content, true);
          content = content[0] || content;
          _self.currentRaw.value = WebTool.objectToString(content, true);
          try {
            if (true || _self.currentRaw.type === "json") {
              let json = content;
              _self.updateFragments(json);
            }
            // else {
            //   let content = _self.getOutlineByText(_self.currentRaw.value);
            //   _self.splitContentFragment(content);
            // }
            _self.updateAgentContent(_self.fragments);

            _self.shareInfo.name =
              content.title || content.name || this.$t("anonymous");
            _self._shareItem(true, () => {
              if (notifyItem && notifyItem.close) {
                notifyItem.close();
                location.reload();
              }
            });
            webCpu.CardItem.dismissMask(card);
          } catch (e) {
            console.log("err", e);
            _self.$message({
              type: "warning",
              message: webCpu.messages[lang].contentFormatError,
            });
          }
        }, 500);
      };
      webCpu.CardItem.renderCardDialog(
        card,
        editor,
        {
          title: webCpu.messages[lang].edit,
          titleStyle: {
            background: "var(--el-color-primary-light-9)",
            color: "var(--el-color-primary)",
          },
          dialogName: "editContentDialog",
          closeType: "back",
          menu: [
            // {
            //   label: `<span style='padding: 0px 10px; font-size: 14px;'><i class="bi bi-clipboard" style="margin-right: 5px;"></i>${webCpu.messages[lang].copyBtn}</span>`,
            //   callback: copyContent,
            // },
            {
              label: `<span style='padding: 0px 10px; font-size: 14px;'><i class="bi bi-cloud-upload" style="margin-right: 5px;"></i>${webCpu.messages[lang].save}</span>`,
              callback: saveContent,
            },
          ],
        },
        style
      );
    },
    openMarkdownEditor() {
      let editor = {
        className: "CodeEditor",
        dsl: {
          options: {
            lineNumbers: true,
            value: "",
            mode: this.currentRaw.type === "json" ? "jsObj" : "markdown",
          },
          data: this.currentRaw.value,
        },
      };
      let card = this._parent.card;
      let style = WebTool.copyObject(this.dialogStyle);
      style.height = "95%";
      style.width = "98%";
      style.maxWidth = "1200px";
      style.maxHeight = "1000px";
      if (this.flag) {
        style.width = "100%";
        style.height = "100%";
        style.maxWidth = "";
        style.maxHeight = "";
      }
      let _self = this;
      let copyContent = function () {
        _self.copyRawContent(editor.card.task.data);
      };
      let saveContent = function () {
        _self.currentRaw.value = editor.card.task.data;
        try {
          let content = _self.getOutlineByText(_self.currentRaw.value);
          _self.splitContentFragment(content);

          _self._shareItem(true, () => {
            _self.updateAgentContent(_self.fragments);
          });
          webCpu.CardItem.dismissMask(card);
        } catch (e) {
          _self.$message({
            type: "warning",
            message: webCpu.messages[lang].contentFormatError,
          });
        }
      };
      webCpu.CardItem.renderCardDialog(
        card,
        editor,
        {
          title: webCpu.messages[lang].edit,
          titleStyle: {
            background: "var(--el-color-primary-light-9)",
            color: "var(--el-color-primary)",
          },
          dialogName: "editContentDialog",
          closeType: "back",
          menu: [
            {
              label: `<span style='padding: 0px 10px; font-size: 14px;'><i class="bi bi-clipboard" style="margin-right: 5px;"></i>${webCpu.messages[lang].copyBtn}</span>`,
              callback: copyContent,
            },
            {
              label: `<span style='padding: 0px 10px; font-size: 14px;'><i class="bi bi-cloud-upload" style="margin-right: 5px;"></i>${webCpu.messages[lang].save}</span>`,
              callback: saveContent,
            },
          ],
        },
        style
      );
    },
    copyRawContent(v) {
      let t = `(${v || this.currentRaw.value})`;
      t = beautifier.js(t, { indent_size: 2 });
      t = t.replace(/^\(/, "");
      t = t.replace(/\)$/, "");
      t = t.replace(/\r?\n/g, "\n");
      // t = t.replace(/\n/g, "\r\n");
      WebTool.copyString(t);
      this.$message({
        type: "success",
        message: webCpu.messages[lang].copySuccessTips,
      });
    },
    rechargeAccount(data, planId) {
      const ua = navigator.userAgent.toLowerCase();
      let isWechat = /micromessenger/i.test(ua);
      let code = WebTool.urlQuery(location.href, "code");
      if (code && isWechat && !localStorage.openid) {
        this.adapter.getOpenid({ code }, (res) => {
          if (res.openid) {
            localStorage.openid = res.openid;
            this._rechargeAccount(res.openid, data, planId);
          } else {
            this.$message({
              type: "warning",
              message: "当前环境不支持微信支付。",
            });
          }
        });
      } else if (localStorage.openid || !isWechat) {
        this._rechargeAccount(localStorage.openid, data, planId);
      } else {
        const redirectUri = encodeURIComponent(
          "https://transweb.cn?payEntry=true"
        );
        let appId = "wxfd4f37f3f8ca5dca";
        const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_base&state=PAY#wechat_redirect`;
        window.location.href = authUrl;
      }
    },
    _rechargeAccount(openid, data, planId) {
      data = data || {};
      if (planId !== undefined) {
        data.selected = planId || 0;
      }
      if (!this.flag) {
        this.renderRechargeDialog(null, openid, data);
      } else {
        this.dialogStyle.height = "750px";
        this.dialogStyle.width = "98%";
        this.renderRechargeDialog(null, openid, data);
      }
    },
    confirmSubscriptionOrder(value) {
      let _self = this;
      this.adapter.confirmSubscriptionOrder(
        {
          planInfo: value,
        },
        function (tData) {
          _self.$message({
            type: "success",
            message: webCpu.messages[lang].subscriptionSuccess,
          });
          _self.updateLoginStatus();
        }
      );
    },
    openPriceInfo(index) {
      let app = {
        url: "/webApps/document/price.vue",
        className: "ElementVueItem",
        cardName: "priceInfoItem",
        dsl: {
          data: {
            index: index || 0,
          },
        },
      };
      let nameMap = {
        1: "1 month subscription",
        2: "3 month subscription",
        3: "1 year subscription",
      };
      let title = this.$t("priceMenu");
      if (index) {
        title = nameMap[index];
      }
      this.currentPriceApp = app;
      this.openAppDialog(app, title, "stack");
    },
    getUserInfo(callback) {
      let _self = this;
      this.adapter.getUserInfo({}, function (tData) {
        if (tData.ret === 0) {
          let appData = tData.data.appData;
          if (appData) {
            // webCpu.appData = webCpu.appData || {};
            // webCpu.appData.accountData = appData.accountData;
            // webCpu.appData.permission = appData.permission;
            delete tData.data.appData;
          }

          _self.userInfo = tData.data;
        }
        if (typeof callback === "function") {
          callback(tData);
        }
      });
    },
    setDocumentAttribute(attr, callback) {
      attr = attr || {};
      attr.table = "pptItem";
      attr.cKey = "documentId";
      this.shareInfo = this.shareInfo || {};
      attr.documentId = this.shareInfo.id || this.documentMeta.documentId;
      let _self = this;
      this.adapter.setDocumentAttribute(attr, function (tData) {
        if (tData.ret === 0) {
          if (typeof callback === "function") {
            callback(tData);
          }
        } else {
          _self.$message({
            type: "warning",
            message: _self.$t("operationFailedTips"),
          });
        }
      });
    },
    handlePublishStatusChange(v) {
      this.setDocumentAttribute(
        {
          key: "publishStatus",
          value: v,
          timeKey: "publishTime",
        },
        (tData) => {
          if (tData.ret === 0) {
            this.currentSettings.publishTime = tData.data.publishTime;
            this.$message({
              type: "success",
              message: webCpu.messages[lang].publishStatusTips,
            });
            if (v) {
              this.setAppImage();
            }
          } else {
            this.currentSettings.publishStatus =
              !this.currentSettings.publishStatus;
          }
        }
      );
    },
    setAppImage(elem) {
      elem =
        elem ||
        $(webCpu.currentCard.task.container).find(
          ".appContainerArea>.el-card>.el-card__body"
        )[0];
      WebTool.transformImage(
        elem,
        "appImage",
        "jpg",
        {
          download: false,
        },
        (img) => {
          this._setAppImage(img);
        }
      );
    },
    _setAppImage(img) {
      WebTool.compressAndResizeBase64(img.src, 1000, 1000, 1).then(
        (newBase64) => {
          console.log(
            "压缩后Base64大小(KB):",
            Math.round(newBase64.length / 1024)
          );
          this.setDocumentAttribute(
            {
              key: "image",
              value: newBase64,
            },
            (rData) => {
              this.$message({
                type: "success",
                message: "应用截图已上传成功！",
              });
            }
          );
        }
      );
    },
    handleEditorChange(v) {
      this.setDocumentAttribute(
        {
          key: "editorAgent",
          value: v,
        },
        (tData) => {
          this.$message({
            type: "success",
            message: webCpu.messages[lang].editorSuccessTips,
          });
        }
      );
    },
    handleTaxChange(v, older) {
      let taxRate = Number(v);
      if (!taxRate && taxRate !== 0) {
        this.currentSettings.taxRate = 0;
        this.$message({
          type: "warning",
          message: webCpu.messages[lang].priceErrorTips,
        });
      }
      if (taxRate < 0) {
        taxRate = 0;
        this.$message({
          type: "warning",
          message: webCpu.messages[lang].marginErrorTips1 || "-",
        });
      }

      this.currentSettings.taxRate = taxRate || 0;
      this.setDocumentAttribute(
        {
          key: "taxRate",
          value: this.currentSettings.margin,
        },
        (tData) => {
          if (tData.ret === 0) {
            this.$message({
              type: "success",
              message: webCpu.messages[lang].marginSuccessTips,
            });
          } else {
          }
        }
      );
    },
    handlePointsPriceChange(v, older) {
      let price = Number(v);
      if (!price && price !== 0) {
        this.currentSettings.price = 0;
        this.$message({
          type: "warning",
          message: webCpu.messages[lang].priceErrorTips,
        });
      }
      if (price < 0) {
        price = 0;
        this.$message({
          type: "warning",
          message: webCpu.messages[lang].priceErrorTips1,
        });
      }
      if (price > 20000) {
        price = 20000;
        this.$message({
          type: "warning",
          message: webCpu.messages[lang].priceErrorTips2,
        });
      }
      this.currentSettings.price = Math.floor(price) || 0;
      this.setDocumentAttribute(
        {
          key: "price",
          value: this.currentSettings.price,
        },
        (tData) => {
          if (tData.ret === 0) {
            this.$message({
              type: "success",
              message: webCpu.messages[lang].priceSuccessTips,
            });
          } else {
          }
        }
      );
    },
    handleSwitchChange(v) {
      let vueItem = this.currentPptApp.card.task.vueItem;
      vueItem.effectSwitch = this.effectSwitch;
      vueItem.updateContent();
    },
    checkLogined(callback, eCallback) {
      // 如果已有登录检查 Promise，复用它
      if (this.checkLoginPromise) {
        this.checkLoginPromise.then(callback).catch(eCallback);
        return;
      }

      // 创建唯一的登录检查 Promise
      this.checkLoginPromise = new Promise((resolve, reject) => {
        this.getUserInfo((tData) => {
          if (tData.ret === 0) {
            localStorage.logined = true;
            localStorage.folderName = tData.data.folderName;
            resolve(tData);
          } else {
            // 登录失败逻辑（保持你的原样）
            this.$message({
              type: "warning",
              message: webCpu.messages[lang].loginTips,
            });

            if (
              webCpu.cards.oneKeyCard &&
              webCpu.cards.oneKeyCard.task.vueItem
            ) {
              let card =
                webCpu.cards.oneKeyCard.task.vueItem.$refs.inputContentItem;
              webCpu.CardItem.dismissMask(card);
            }

            let currentCard = webCpu.currentCard;
            if (currentCard && currentCard.task && currentCard.task.vueItem) {
              let vueItem = currentCard.task.vueItem;
              if (typeof vueItem.dismissLoadingTips === "function") {
                vueItem.dismissLoadingTips();
              }
            }

            if (this.loginRegItem.card && this.loginRegItem.card.task) {
              let vItem = this.loginRegItem.card.task.vueItem;
              if (vItem) vItem.handleClickBtn();
            }

            reject(tData);
          }
        });
      }).finally(() => {
        // 无论成功或失败，都释放锁
        this.checkLoginPromise = null;
      });
      // 让调用方继续执行之前的逻辑
      this.checkLoginPromise.then(callback).catch(eCallback);
    },
    shareItem(flag, type, callback) {
      data = this.currentContent;
      if (!data || data.length === 0) {
        return false;
      }
      let _self = this;
      this.shareInfo.loading = true;
      this.getUserInfo(function (tData) {
        if (tData.ret === 0) {
          if (type === "new") {
            _self.newItem(flag, callback);
          } else {
            _self._shareItem(flag);
          }
        } else {
          _self.shareInfo.loading = false;
          if (_self.mode === "edit") {
            _self.$message({
              type: "warning",
              message: webCpu.messages[lang].loginTips,
            });
            let vItem = _self.loginRegItem.card.task.vueItem;
            vItem.handleClickBtn();
          }
        }
      });
    },
    openAppDialog(app, title, mode, menu, closeCallback) {
      let card = this._parent.card;
      let style = JSON.parse(JSON.stringify(this.dialogStyle));
      style.background = "#fff";
      let tStyle = {};
      if (
        title === this.$t("myPpt") ||
        title === this.$t("mySubscriptions") ||
        title === this.$t("personalInfo")
      ) {
        style.maxWidth = "1200px";
        style.background = "#f2f2f2";
        style.width = "100%";
      } else if (title === this.$t("myModule")) {
        style.width = "100%";
        style.height = "100%";
        style.maxWidth = "100%";
        style.maxHeight = "100%";
        style.borderRadius = "0px";
      } else {
        style.width = this.flag ? "100%" : "900px";
        style.height = "100%";
      }

      if (this.flag && title !== this.$t("myModule")) {
        tStyle.width = 600;
        tStyle.height =
          (tStyle.width * (document.body.clientHeight - 0)) /
          document.body.clientWidth;
        tStyle.maxWidth = "";
        tStyle.maxHeight = "";
        style.height = "100%";
        style.maxHeight = "";
      }

      webCpu.CardItem.renderCardDialog(
        card,
        app,
        {
          dialogName: "menuItemDialog",
          title: title,
          titleStyle: {
            background: "var(--el-color-primary-light-9)",
            color: "var(--el-color-primary)",
          },
          closeType: "back",
          closeCallback: closeCallback,
          renderMode: mode,
          menu: menu,
        },
        style,
        tStyle
      );
    },
    renderRechargeDialog(card, openid, data) {
      card = card || this._parent.card;
      data = data || {};
      let app = WebTool.copyObject(this.rechargeApp);
      let _self = this;
      app.dsl = app.dsl || {};
      app.dsl.data = app.dsl.data || {};
      if (data) {
        webCpu.attachAttribute(data, app.dsl.data);
        if (data.selected === undefined) {
          app.dsl.data.productList = app.dsl.data.productList.map((item) => {
            delete item.title;
            delete item.description;
            delete item.tips;
            return item;
          });
        }
      }
      app.dsl.data.openid = openid;
      app.dsl.methods = {
        successCallback: function () {
          _self.$message({
            type: "success",
            message: webCpu.messages[lang].rechargeSuccessTips,
          });
          let vItem = app.card.task.vueItem;
          clearTimeout(vItem.timer);
          webCpu.CardItem.dismissMask(card);
          _self.updatePointsInfo();
        },
      };
      webCpu.CardItem.renderCardDialog(
        card,
        app,
        {
          title: webCpu.messages[lang].rechargeTips,
          titleStyle: {
            background: "var(--el-color-primary-light-9)",
            color: "var(--el-color-primary)",
          },
          renderMode: "stack",
          closeType: "back",
          headerHidden: true,
          dialogName: "rechargeDialog",
          closeCallback: function () {
            if (app.card && app.card.task && app.card.task.vueItem) {
              clearTimeout(app.card.task.vueItem.timer);
              _self.updatePointsInfo();
              if (app.card.task.vueItem.orderState !== "SUCCESS") {
                app.card.task.vueItem.cancleOrder();
              }
              webCpu.CardItem.dismissMask(card);
            }
          },
        },
        this.dialogStyle
      );
    },
    openSubscriptionsDialog() {
      let app = WebTool.copyObject(this.myShareList);
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
      this._openShareDialog(app, this.$t("mySubscriptions"));
    },
    openShareDialog() {
      let app = WebTool.copyObject(this.myShareList);
      this.currentShareApp = app;
      this._openShareDialog(app, this.$t("myPpt"));
    },
    _openShareDialog(app, title) {
      let _self = this;
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
      this.openAppDialog(app, title);
    },
    switchAppItem(name) {
      let url = location.origin + location.pathname;
      let params = WebTool.urlQuery(location.href);
      delete params.id;
      if (name) {
        params.appName = name;
      }
      if (
        this.currentApp.publishInfo &&
        this.currentApp.publishInfo.folderName
      ) {
        params.agent = this.currentApp.publishInfo.folderName;
      }

      delete params.record;
      delete params.aScript;
      delete params.input;
      delete params.auto;
      url = WebTool.attachParams(url, params);
      location.href = url;
    },
    removeShareItem(d) {
      let query = {
        _id: d._id,
        key: "_id",
        table: "pptItem",
      };
      let _self = this;
      this.adapter.deleteDocumentData(query, function (rData) {
        if (_self.currentShareApp.card) {
          webCpu.fresh(_self.currentShareApp.card.task);
        }
      });
      if (d.document) {
        let arr = d.document.split("/");
        this.adapter.removeDocumentItem(
          {},
          function (tData) {
            if (tData.code === 0) {
              _self.$message({
                type: "success",
                message: webCpu.messages[lang].removeSuccessTips,
              });
            }
          },
          {
            folderName: localStorage.folderName,
            name: arr[arr.length - 1],
          }
        );
      }
    },
    updatePointsInfo() {
      let app = this.loginRegItem;
      let card = webCpu.cards.loginRegItem || app.card;
      if (card) {
        this.checkLogined((tData) => {
          if (tData.ret === 0) {
            card.task.vueItem.userData = tData.data;
          }
        });
      } else {
        this.updateLoginStatus();
      }
    },
    updateLoginStatus() {
      let app = this.loginRegItem;
      app.dsl = app.dsl || {};
      app.dsl.dialogCard = "documentEditor";
      app.dsl.methods = app.dsl.methods || {};
      let arr = [
        {
          label: this.$t("myPpt"),
        },
        {
          label: this.$t("historyRecord"),
          action: function (d, callback) {
            let id = "";
            if (webCpu.currentVueItem && webCpu.currentVueItem.query) {
              webCpu.currentVueItem.query = webCpu.currentVueItem.query || {};
              id = webCpu.currentVueItem.query.documentId || "";
            }
            dialogMap.openDocumentApp(
              webCpu.appConfig.aigcHistory,
              {
                data: {
                  content: {
                    isSolo: true,
                  },
                  query: {
                    documentId: id,
                  },
                },
              },
              {
                title: this.$t("historyRecord"),
                callback: callback,
              },
              {
                width: "100%",
                height: "100%",
              }
            );
          },
        },
      ];
      let userInfo = JSON.parse(localStorage.userInfo || "{}");

      if (userInfo.role && userInfo.role.indexOf("partner") !== -1) {
        this.isPartner = true;
      }

      app.dsl.data = {
        position: "top",
        loginedMenu: arr,
      };
      let _self = this;
      app.dsl.methods.exitCallback = function () {
        _self.isLogined = false;
      };
      app.dsl.methods.switchRoleData = function (userInfo) {
        userInfo = userInfo || JSON.parse(localStorage.userInfo || "{}");
        if (userInfo.role && userInfo.role.indexOf("partner") !== -1) {
          _self.isPartner = true;

          this.loginedMenu = [
            {
              label: this.$t("myPpt"),
            },
            {
              label: this.$t("historyRecord"),
            },
            {
              label: this.$t("personalInfo"),
            },
            {
              label: this.$t("myModule"),
            },
          ];
        }
      };
      app.dsl.methods.handleClickMenu = function (d) {
        let style = JSON.parse(JSON.stringify(_self.dialogStyle || {}));
        style.width = "95%";
        style.maxWidth = "95%";
        style.height = "95%";
        if (d.label === this.$t("myPpt")) {
          _self.openShareDialog();
        } else if (d.label === this.$t("mySubscriptions")) {
          _self.openSubscriptionsDialog();
        } else if (d.label === this.$t("historyRecord")) {
          d.loading = true;
          dialogMap.openDocumentApp(
            webCpu.appConfig.aigcHistory,
            {
              data: {
                content: {
                  isSolo: true,
                },
                query: {
                  documentId: _self.shareInfo.id || "",
                },
              },
            },
            {
              title: d.label,
              callback: () => {
                d.loading = false;
              },
            },
            {
              width: "100%",
              height: "100%",
            }
          );
        } else if (d.label === this.$t("myModule")) {
          _self.openModuleDialog();
        } else if (d.label === this.$t("personalInfo")) {
          _self.openPersonDialog();
        }
      };

      _self.isLogined = true;
      // _self.$forceUpdate();
      app.dsl.userInfoCallback = function (data) {
        if (!data) {
          _self.isPartner = false;
          _self.isLogined = false;
          return false;
        } else {
          _self.isLogined = true;
          _self.userInfo = data;
        }
        webCpu.attachAttribute(data, _self.userInfo);
        if (typeof this.vueItem !== "undefined") {
          this.vueItem.switchRoleData(data);
        }
        if (data && data.appData && localStorage.docType === "true") {
          if (typeof data.appData.accountData === "string") {
            try {
              data.appData.accountData = JSON.parse(data.appData.accountData);
            } catch (e) {
              console.log(e, data.appData.accountData);
            }
          }
          if (
            _self.currentPptApp &&
            _self.currentPptApp.card &&
            _self.currentPptApp.card.task &&
            _self.currentPptApp.card.task.vueItem
          ) {
            let tItem = _self.currentPptApp.card.task.vueItem;
            if (tItem.currentApp) {
              if (typeof tItem.currentApp.contentApp === "string") {
                tItem.currentApp.contentApp = {
                  url: tItem.currentApp.contentApp,
                  className: "ElementVueItem",
                };
              }

              tItem.currentApp.contentApp = tItem.currentApp.contentApp || {};
              tItem.currentApp.contentApp.dsl =
                tItem.currentApp.contentApp.dsl || {};
              tItem.currentApp.contentApp.dsl.data = {
                accountData: data.appData.accountData || {},
              };
            } else if (tItem.currentApp.startApp) {
              if (typeof tItem.currentApp.startApp === "string") {
                tItem.currentApp.startApp = {
                  url: tItem.currentApp.startApp,
                  className: "ElementVueItem",
                };
              }
              tItem.currentApp.startApp.dsl =
                tItem.currentApp.startApp.dsl || {};
              tItem.currentApp.startApp.dsl.data = {
                accountData: data.appData.accountData || {},
              };
            }
            if (webCpu.isContainerUpdated !== "true") {
              tItem.updateContent();
              webCpu.isContainerUpdated = "true";
            }
            console.log("userInfoCallback updateContent");
          } else {
            webCpu.isContainerUpdated = "false";
          }
          webCpu.appData = data.appData;
          delete data.appData;
        } else {
          webCpu.isContainerUpdated = "false";
        }

        if (
          webCpu.cards.portfolioApp &&
          webCpu.cards.portfolioApp.task &&
          webCpu.cards.portfolioApp.task.vueItem
        ) {
          webCpu.cards.portfolioApp.task.vueItem.folderName =
            localStorage.folderName;
        }
      };

      this.$nextTick(() => {
        let elem = this.$refs.loginRegItem;
        webCpu.updateView(elem, app);

        if (webCpu.cards.portfolioApp) {
          let vueItem = webCpu.cards.portfolioApp.task.vueItem;
          vueItem.folderName = localStorage.folderName;
        }
      });
    },
    saveDocumentItem(callback, data, flag) {
      this.getUserInfo((tData) => {
        if (tData.ret === 0) {
          let localDocFlag = data.documentMeta.localDocFlag;
          delete data.documentMeta.localDocFlag;
          if (!data.app) {
            if (
              localStorage.folderName !== this.documentMeta.folderName &&
              !localDocFlag
            ) {
              //记录来源信息
              this.documentMeta = this.documentMeta || {};
              this.documentMeta.from = this.shareInfo.id;
              this.documentMeta.versionArray =
                this.documentMeta.versionArray || [];
              // let content = this.fragments[0].content;

              this.documentMeta.fromAccount =
                this.documentMeta.folderName ||
                WebTool.urlQuery(location.href, "from");
              this.documentMeta.rootFlag =
                this.documentMeta.rootAccount === localStorage.folderName || "";
              if (this.documentMeta.rootFlag) {
                this.documentMeta.root = this.shareInfo.id;
              }
              this.shareInfo.id = "";
              this.shareInfo.folderName = localStorage.folderName;
              this.documentMeta.folderName = localStorage.folderName;
            }
            this._shareItem(false, callback);
          } else {
            let id = data.documentMeta.documentId || "";
            if (
              !flag &&
              this.shareInfo &&
              !localDocFlag &&
              localStorage.folderName === this.documentMeta.folderName
            ) {
              id = this.shareInfo.id || data.documentMeta.documentId || "";
            }
            if (flag && !id) {
              data.documentMeta = data.documentMeta || {};
              if (!data.documentMeta.root) {
                data.documentMeta.root = this.shareInfo.id;
                data.documentMeta.rootAccount = data.documentMeta.folderName;
                data.documentMeta.rootFlag = 0;
              } else {
                data.documentMeta.from = this.shareInfo.id;
                data.documentMeta.fromAccount = data.documentMeta.folderName;
                data.documentMeta.rootFlag = 0;
              }
            }

            this.saveContentData(
              data,
              id,
              (rData) => {
                if (
                  typeof callback === "function" &&
                  (flag ||
                    localDocFlag ||
                    localStorage.folderName !== this.documentMeta.folderName)
                ) {
                  callback(rData);
                  if (flag) {
                    this.$message({
                      type: "success",
                      message: this.$t("copyAppSuccessTips"),
                    });
                  }
                }
              },
              () => {
                this.$message({
                  type: "warning",
                  message: this.$t("saveFildedTips1"),
                });
              }
            );
          }
        } else {
          this.$message({
            type: "warning",
            message: "登录已失效，请重新登录。",
          });
        }
      });
    },
    newItem(flag, callback) {
      this.documentMeta.rootFlag = 1;
      this.documentMeta.rootAccount = localStorage.folderName || "";
      this.documentMeta.folderName = localStorage.folderName || "";
      this.documentMeta.root = this.shareInfo.id;
      this.shareInfo.id = "";
      this.documentMeta.time = new Date().getTime();
      this._shareItem(flag, callback);
    },
    storeComponent(content) {
      this.openModuleDialog(content);
    },
    saveDocumentFile(data, callback) {},
    publishDocumentData(data, callback) {},
    _shareItem(flag, callback, how) {
      if (this.mode === "view") {
        this.shareInfo.loading = false;
        return false;
      }
      if (this.documentMeta.folderName !== localStorage.folderName) {
        this.$message({
          type: "warning",
          message: this.$t("saveFildedTips1"),
        });
        this.shareInfo.loading = false;
        return false;
      }
      this.documentMeta = this.documentMeta || {};
      if (!this.documentMeta.rootFlag) {
        delete this.currentApp.responderMap;
        delete this.rawContent;
      }
      this.documentMeta.fileName =
        this.documentMeta.fileName || this.shareInfo.name;
      currentAgentData = currentAgentData || {};
      this.currentApp.publishInfo = this.currentApp.publishInfo || {
        user:
          currentAgentData["name_" + lang] ||
          currentAgentData.name ||
          webCpu.messages[lang].anonymous,
        introduce:
          currentAgentData["introduce_" + lang] || currentAgentData.introduce,
        folderName: currentAgentData.folderName,
        avatar: currentAgentData.image,
      };

      let cData = {
        content: this.fragments,
        app: this.currentApp,
        documentMeta: this.documentMeta,
        rawContent: this.rawContent || {},
      };

      this.saveContentData(
        cData,
        this.shareInfo.id,
        (rData) => {
          this.documentMeta.id = rData.documentId;
          this.shareInfo.id = rData.documentId;

          this.shareInfo.link =
            location.origin + location.pathname + "?id=" + rData.documentId;
          this.currentSettings = {
            publishStatus: false,
            publishTime: 0,
            price: 0,
          };
          if (localStorage.folderName) {
            this.shareInfo.link += "&fromAccount=" + localStorage.folderName;
          }
          this.updateDocumentMata();
          localStorage.setItem(
            "currentDocumentMeta",
            JSON.stringify(this.documentMeta)
          );
          if (typeof callback === "function") {
            callback(rData);
          }
          this.shareInfo.status = true;
          this.shareInfo.loading = false;
          if (flag) {
            this.$message({
              type: "success",
              message:
                typeof flag === "string"
                  ? flag
                  : webCpu.messages[lang].saveSuccessTips,
            });
          }
          if (window.parent !== window && how !== "message") {
            location.href = this.shareInfo.link + "&iframeEnable=true";
          }
        },
        () => {
          this.shareInfo.loading = false;
          if (flag) {
            this.$message({
              type: "warning",
              message: this.$t("saveFildedTips1"),
            });
          }
        }
      );
    },
    saveContentData(data, id, callback, errCallback) {
      if (!data.app || !data.content) {
        return false;
      }
      data.documentMeta = data.documentMeta || {};
      let content = data.content[0] ? data.content[0].content : data.content;
      let fingerprint = MurmurHash.rule(JSON.stringify(content), 31);
      data.documentMeta.versionArray = data.documentMeta.versionArray || [];

      if (data.documentMeta.versionArray.indexOf(fingerprint) === -1) {
        data.documentMeta.versionArray.push(fingerprint);
      }

      if (!id && !data.documentMeta.localDocFlag) {
        data.documentMeta.folderName = localStorage.folderName;
        data.documentMeta.userName = localStorage.userName;
      } else {
        data.documentMeta.rootFlag = 0;
      }

      if (
        data.app.contentApp &&
        data.app.contentApp.dsl &&
        data.app.contentApp.dsl.data
      ) {
        delete data.app.contentApp.dsl.data.accountData;
      }

      let sParams = {
        platformUrl: content.platformUrl || "",
        apiKey: content.apiKey || "",
        apiSecret: content.apiSecret || "",
        apiName: content.apiName || "",
        model: content.model || "",
        inputPrice: content.inputPrice,
        outputPrice: content.outputPrice,
        prompt: content.prompt || "",
      };

      let t = {
        content: data.content,
        app: data.app,
        documentMeta: data.documentMeta || {},
        rawContent: data.rawContent || {},
        appName: data.app.name,
      };
      let str = WebTool.objectToString(t) + "_" + new Date().getTime();

      let name = content.title || data.name || t.documentMeta.name;
      let introduce =
        content.introduce || data.introduce || t.documentMeta.introduce;

      id = id || MurmurHash.rule(str, 32);

      let code = content.code;
      if (code) {
        let tQuery = {};
        let dsl = webCpu.getDslObj(code);
        if (dsl && typeof dsl.data === "function") {
          try {
            dsl.data = dsl.data();
            tQuery = dsl.data.query || {};

            if (tQuery.apiName && (tQuery.model || tQuery.platformUrl)) {
              sParams = {
                platformUrl: tQuery.url || "",
                apiKey: tQuery.apiKey || "",
                apiSecret: tQuery.apiSecret || "",
                apiName: tQuery.apiName || "",
                model: tQuery.model || "",
                inputPrice: tQuery.inputPrice,
                outputPrice: tQuery.outputPrice,
              };
              if (content.prompt) {
                sParams.prompt = content.prompt;
              }
            }
          } catch (e) {
            console.log("执行content code中的dsl.data函数时出错：", e);
          }
        }

        if (tQuery.apiName !== "custom") {
          tQuery.documentId = id;
        }

        let opList = {
          ops: [
            {
              op: "js.data.update",
              path: "title",
              value: name,
            },
            {
              op: "js.data.update",
              path: "icon",
              value:
                content.icon || data.icon || t.documentMeta.icon || "未定义",
            },
            {
              op: "js.data.update",
              path: "introduce",
              value: introduce,
            },
            {
              op: "js.data.update",
              path: "query",
              raw: true,
              value: `${JSON.stringify(tQuery)}`,
            },
          ],
        };

        const result = VueSfcEditorPlugin.applyWithResult(code, opList);
        if (result && result.code) {
          content.code = result.code;
        }
      }

      let params = {
        folderName: localStorage.folderName,
        name: id,
        appName: data.app.name,
      };
      data.app.publishInfo = data.app.publishInfo || {};
      data.app.meta = data.app.meta || {};
      let url = this.interface.saveDocumentData.url.bindData(params);

      let options = {
        id: id,
        name: name,
        document: url.replace(webCpu.documentPrefix, ""),
        from: data.documentMeta.from || "",
        fromAccount:
          WebTool.urlQuery(location.href, "from") ||
          data.documentMeta.fromAccount ||
          "",
        rootFlag: data.documentMeta.rootFlag || 0,
        rootAccount: data.documentMeta.rootAccount,
        root: data.documentMeta.root,
        rootUser: data.documentMeta.rootUser,
        appName: data.app.name,
        appLabel: data.app.meta.label || this.$t("anonymous"),
        appAgent: data.app.publishInfo.folderName,
        appOwner: data.app.publishInfo.user,
        folderName: localStorage.folderName,
        creator: localStorage.userName,
        avatar: this.userInfo.image,
        type: data.type || t.documentMeta.type || content.type || "未定义",
        category:
          data.category ||
          t.documentMeta.category ||
          content.category ||
          "未定义",
        grades:
          data.grades || t.documentMeta.grades || content.grades || "未定义",
        tags: data.tags || t.documentMeta.tags || content.tags || "未定义",
        icon: data.icon || t.documentMeta.icon || content.icon || "未定义",
        title: data.title || t.documentMeta.title || content.title || "未定义",
        description:
          data.description ||
          t.documentMeta.description ||
          content.description ||
          "未定义",
        introduce: introduce,
        rawContent: t.rawContent,
      };

      if (sParams) {
        Object.assign(options, sParams);
      }

      this.adapter.publishPptItem(options, (tData) => {
        console.log("tData of publishPptItem: ", tData);
        if (tData.ret === 0 || tData.code === 0) {
          this.saveDocumentData(t, id, (rData) => {
            if (rData.code === 0) {
              rData.documentId = id;
              if (typeof callback === "function") {
                callback(rData);
              }
              this.$message({
                type: "success",
                message: "保存成功。",
              });
              console.log("Document 保存成功。");
            } else {
              if (typeof errCallback === "function") {
                errCallback();
              }
            }
          });
        } else {
          if (typeof errCallback === "function") {
            errCallback();
          }
        }
      });
    },
    saveDocumentData(tData, name, callback) {
      if (typeof tData !== "object") {
        tData = {};
      }
      let tMeta = tData.documentMeta || {};
      let folderName = tMeta.folderName || localStorage.folderName;
      this.lastDocumentData = tData;

      if (typeof tData !== "string") {
        tData = WebTool.objectToString(tData, true);
      }
      tData = `transweb_${name}(${tData});`;
      let file = new File([tData], name, {
        type: "text/plain;charsst=utf8",
      });

      let formData = new FormData();
      formData.append("file", file);
      if (location.hostname === "") {
        formData = {
          _file: tData,
          _name: name,
        };
      }
      this.adapter.saveDocumentData(
        formData,
        function (dd) {
          if (typeof callback === "function") {
            callback(dd);
          }
        },
        {
          folderName: folderName,
          name: name,
        }
      );
    },
    copyLink() {
      WebTool.copyString(this.shareInfo.link);
      this.$message({
        type: "success",
        message: webCpu.messages[lang].copySuccessTips,
      });
    },
    handleClickAigc() {
      this.handleClickBack();
    },
    initAdapter() {
      var config = this.interface || {};
      this.interface.generateContent.onTimeout = (url) => {
        this.$message({
          type: "warning",
          message: "请求超时，请稍后再试",
        });
        this.recoverTransformStatus();
      };
      this.adapter = webCpu.initAdapter(config);
      return this.adapter;
    },
    handleCommand(code) {
      let vItem = this.currentPptApp.card.task.vueItem;
      vItem.index = code;
      vItem.className = this.fragments[vItem.index].className || "";
      vItem.updateContent();
    },
    setDataMap(params, id) {
      let data = webCpu.currentDocumentData;
      if (localStorage.folderName !== data.documentMeta.folderName) {
        this.$message({
          type: "warning",
          message: "暂无编辑权限",
        });
        return false;
      }
      this.checkLogined(() => {
        let t = {
          content: data.content,
          app: data.app,
          documentMeta: data.documentMeta || {},
          rawContent: data.rawContent || {},
          appName: data.app.name,
        };
        let arr = [];
        for (let k in params) {
          if (typeof params[k] === "string") {
            arr.push({
              op: "js.data.update",
              path: k,
              value: params[k],
            });
          } else {
            arr.push({
              op: "js.data.update",
              path: k,
              raw: true,
              value: `${JSON.stringify(params[k])}`,
            });
          }
        }
        let opList = {
          ops: arr,
        };
        let content = t.content[0] ? t.content[0].content : t.content;
        let code = content.code;
        if (code) {
          let dsl = webCpu.getDslObj(code);
          if (dsl && typeof dsl.data === "function") {
            try {
              dsl.data = dsl.data();
            } catch (e) {}
          }
          const result = VueSfcEditorPlugin.applyWithResult(code, opList);
          if (result && result.code) {
            content.code = result.code;
          }
          id = id || WebTool.urlQuery(location.href, "id");
          this.saveDocumentData(t, id, (rData) => {
            this.$message({
              type: "success",
              message: "设置成功",
            });
          });
        }
      });
    },
    displayArticleDialog(name) {
      let key = name;
      if (lang === "en") {
        name = name + "_en";
      }
      let path = this.mdMap[name];
      let app = {
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
      };
      webCpu.CardItem.renderCardDialog(
        this._parent,
        app,
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
        }
      );
    },
    setIndexString() {
      let str = `${this.currentIndex + 1} / ${this.fragments.length}`;
      this.indexString = str;
      return str;
    },
    setIndexTitle() {
      let index = this.currentIndex;
      if (!this.fragments[index]) {
        return false;
      }
      this.fragments[index].content = this.fragments[index].content || {};
      let str = this.fragments[index].content.title || "#" + (index + 1);
      this.indexTitle = str;

      let cName = this.fragments[index].className;
      if (cName && !this.indexTitle) {
        this.indexTitle = str + "#" + cName;
      }
      return str;
    },
    htmlToText(html) {
      let tElement = document.createElement("div");
      tElement.innerHTML = html;
      return tElement.textContent;
    },
    recoverTransformStatus() {
      if (
        this.oneKeyApp.card &&
        this.oneKeyApp.card.task &&
        this.oneKeyApp.card.task.vueItem
      ) {
        let vueItem = this.oneKeyApp.card.task.vueItem;
        vueItem.isTransforming = false;
        webCpu.CardItem.dismissMask(vueItem._parent.card);
      }
    },
    transformContent(str, flag) {
      let ret = false;
      let _self = this;
      try {
        this.currentRaw = this.currentRaw || {
          type: "json",
        };
        this.currentRaw.type = "json";

        let json = WebTool.extractJSON(str);
        console.log("extract json: ", json, str);

        json = WebTool.copyObject(json, true);
        this.currentRaw.value = WebTool.objectToString(json, true);
        this.updateFragments(json);
        let d = this.fragments[0].content;
        if (this.shareInfo) {
          this.shareInfo.name = d.title || d.name || this.$t("anonymous");
        }
        ret = true;
      } catch (e) {
        if (!flag) {
          _self.$message({
            type: "warning",
            message: webCpu.messages[lang].aiRequestError,
          });
        }
      }
      return ret;
    },
    aigcText(tQuery, callback, macros, from, errCallback) {
      let query = JSON.parse(
        JSON.stringify(aigcInterface.interface.aigcGateway.query)
      );
      if (typeof tQuery === "string") {
        tQuery = {
          content: "你是一个 AI 助手",
          context: tQuery,
        };
      }

      query.apiName = tQuery.apiName || query.apiName;
      query.model = tQuery.model || query.model;

      webCpu.attachAttribute(tQuery, query);
      macros = macros || {};
      for (let k in macros) {
        let target = macros[k];
        if (typeof target === "function") {
          target = macros[k](macros);
        }
        const regex = new RegExp(`{{${k}}}`, "g");
        query.content = query.content.replace(regex, target);
      }
      let pInfo = this.currentApp.publishInfo || "{}";
      if (typeof pInfo === "string") {
        pInfo = JSON.parse(pInfo);
      }
      query.agentId = pInfo.folderName;
      let param = {};
      let apiInfo = JSON.parse(localStorage.getItem("apiInfo") || "{}") || {};
      if (apiInfo.apiMap && apiInfo.current && !tQuery.apiName) {
        param = apiInfo.apiMap[apiInfo.current] || {};
        webCpu.attachAttribute(param, query);
      }

      let apiName = WebTool.urlQuery(location.href, "apiName");
      let model = WebTool.urlQuery(location.href, "model");

      if (apiName) {
        query.apiName = apiName;
      }
      if (model) {
        query.model = model;
      }

      if (param.platform && !tQuery.apiName) {
        query.apiName = param.platform;
        delete query.platform;
        if (param.platform !== "custom" && param.platform !== "ollama") {
          delete query.url;
        }
      }

      if (query.apiName === "custom" && WebTool.urlQuery(location.href, "id")) {
        delete query.apiKey;
        delete query.apiSecret;
        delete query.inputPrice;
        delete query.outputPrice;
        delete query.url;
        query.documentId = WebTool.urlQuery(location.href, "id");
        // delete query.content;
      }

      let meta = this.documentMeta || {};
      query.fromAccount =
        WebTool.urlQuery(location.href, "from") || meta.fromAccount || "";
      query.rootAccount =
        WebTool.urlQuery(location.href, "rootAccount") ||
        meta.rootAccount ||
        "";
      console.log("aigc params", query);
      let countData = {
        start: new Date().getTime(),
        model: query.model,
        apiName: query.apiName,
      };
      try {
        this.adapter.generateContent(
          query,
          (tData) => {
            countData.end = new Date().getTime();
            console.log(
              "aigc duration: ",
              countData.end - countData.start,
              countData
            );
            let aigcDuration = countData.end - countData.start;
            if (!tData || !tData.usage) {
              tData = tData || {};
              this.recoverTransformStatus();
              this.$message({
                type: "warning",
                message: tData.message || "当前 AI 服务调用失败, 请稍后再试",
              });
              if (typeof errCallback === "function") {
                errCallback();
              }
              return false;
            }
            if (typeof callback === "function") {
              callback(tData);
              this.$nextTick(() => {
                if (this.fragments && this.fragments[0]) {
                  let content = this.fragments[0].content;
                  tData.usage = tData.usage || {};
                  let fingerprint = MurmurHash.rule(
                    JSON.stringify(content),
                    31
                  );
                  this.documentMeta = this.documentMeta || {};
                  this.documentMeta.aigcRecord =
                    this.documentMeta.aigcRecord || [];
                  let item = {
                    apiName: tData.apiName,
                    model: tData.model,
                    id: tData.id,
                    total_tokens: tData.usage.total_tokens,
                    prompt: tQuery.context,
                    pointsCost: tData.usage.pointsCost,
                    fingerprint: fingerprint,
                    aigcDuration: aigcDuration,
                    userName: localStorage.userName,
                    folderName: localStorage.folderName,
                  };
                  if (from === "window") {
                    console.log("aigc request in app: ", item);
                  } else {
                    this.documentMeta.aigcRecord.push(item);
                  }
                } else {
                  console.log("tData.usage.result:", tData.usage.result);
                }
                webCpu.mitt.emit("taskDone", {
                  inputText: tQuery.context,
                  outputText: tData.usage.result,
                });
              });
            }
          },
          "json",
          errCallback
        );
      } catch (e) {
        this.recoverTransformStatus();
      }
    },
    generateContent(text, callback, aiEnable) {
      if (!aiEnable) {
        callback({
          ret: 0,
          usage: {
            result: text,
          },
        });
        return false;
      }
      if (this.currentApp.appPrompts) {
        this.currentApp.appPrompts = this.htmlToInnerText(
          this.currentApp.appPrompts
        );
      }
      let content =
        this.currentApp.appPrompts || webCpu.messages[lang].pptPrompts;
      if (typeof content === "function") {
        content = content();
      }

      let examStr = this.currentApp.contentExample;

      if (examStr) {
        if (typeof examStr !== "string") {
          examStr = JSON.stringify(examStr);
        }
        content += `\n ### JSON 示例: \n ${examStr}`;
      }

      let vueItem = this.oneKeyApp.card.task.vueItem;
      let macros = vueItem.currentApp.promptMacro;
      if (typeof vueItem.currentApp.promptMacro === "function") {
        macros = vueItem.currentApp.promptMacro();
      }

      let _self = this;

      console.log("提示词模板: ", content);

      this.aigcText(
        {
          content: content,
          context: text,
        },
        (tData) => {
          if (tData.ret !== undefined && tData.ret !== 0) {
            let tips = _self.foreign
              ? webCpu.messages[lang].subscriptionExpiredTips
              : webCpu.messages[lang].notEnoughPoints;
            if (tData.ret === 1) {
              tips = webCpu.messages[lang].getHTMLContentError;
            }
            _self.$message({
              type: "warning",
              message: tips,
            });

            if (tData.ret === 2) {
              if (_self.foreign) {
                _self.openPriceInfo();
              } else {
                _self.rechargeAccount();
              }
            }
            _self.recoverTransformStatus();
            return false;
          } else {
            if (typeof callback === "function") {
              callback(tData);
            }
          }
        },
        null,
        macros
      );
    },
    switchNextFragment(app, from) {
      app = app || this.currentPptApp;
      if (app && app.card && app.card.task && app.card.task.vueItem) {
        let item = app.card.task.vueItem;
        item.switchNextFragment(from);
      }
    },
    switchLastFragment(app, from) {
      app = app || this.currentPptApp;
      if (app && app.card && app.card.task && app.card.task.vueItem) {
        let item = app.card.task.vueItem;
        item.switchLastFragment(from);
      }
    },
    htmlToInnerText(html) {
      const temp = document.createElement("div");
      temp.innerHTML = html;
      return temp.innerText; // 或 textContent
    },
    getOutlineByText(text) {
      let options = {
        parseImgDimensions: true,
        tables: true,
        smoothLivePreview: true,
        tablesHeaderId: true,
        ghCodeBlocks: false,
        tasklists: true,
      };
      var converter = new showdown.Converter(options);
      this.markdown = text;
      let html = converter.makeHtml(text);
      return html;
    },
    clickPlayButton(index) {
      if (this.flag || window.parent !== window) {
        this.$message({
          type: "warning",
          message: webCpu.messages[lang].playFiledTips,
        });
        return false;
      }
      let content = this.currentContent;
      let app = WebTool.copyObject(this.pptModeEditor);
      app.dsl = app.dsl || {};
      app.dsl.data = app.dsl.data || {};
      app.dsl.data.content = content;

      if (
        this.currentPptApp &&
        this.currentPptApp.card &&
        this.currentPptApp.card.task &&
        this.currentPptApp.card.task.vueItem
      ) {
        app.dsl.data.index = this.currentPptApp.card.task.vueItem.index;
      }

      if (typeof index === "number") {
        app.dsl.data.index = index;
      }
      app.dsl.data.mode = "view";
      app.dsl.data.resolution = this.resolution;
      app.dsl.data.fullScreenFlag = true;
      app.dsl.data.withoutIndex = true;

      app.dsl.methods = app.dsl.methods || {};
      app.dsl.methods.exitFullscreenCallback = function () {
        if (
          _self.currentPptApp &&
          _self.currentPptApp.card &&
          _self.currentPptApp.card.task
        ) {
          _self.currentPptApp.card.task.vueItem.initEvents();
          _self.currentPptApp.card.task.vueItem.fullScreenFlag = false;
        }
        webCpu.CardItem.dismissMask(card);
        _self.dialogPptItem = null;
      };
      delete this.currentApp.card;
      app.dsl.data.currentApp = WebTool.copyObject(this.currentApp);

      let _self = this;
      let card = this._parent.card;
      if (card.task && card.task.mask) {
        card.task.mask.innerHTML = "";
      }

      let callback1 = function () {
        _self.switchLastFragment(app, "switch");
      };
      let callback2 = function () {
        _self.switchNextFragment(app, "switch");
      };
      this.dialogPptItem = app;
      webCpu.CardItem.renderCardDialog(
        card,
        app,
        {
          fullScreen: !this.flag,
          // fullScreen: true,
          closeType: "left",
          titleStyle: {
            background: "#000",
          },
          menu: [
            {
              label:
                '<i class="bi bi-arrow-left" style="margin-right: 5px; padding: 0px 15px; "></i>',
              action: callback1,
            },
            {
              label:
                '<i class="bi bi-arrow-right" style="margin-right: 5px; padding: 0px 15px; "></i>',
              action: callback2,
            },
          ],
          callback: function (c, d, t) {
            let pArea = t._parent.task.titleArea.parentNode;
            $(pArea).css("border-bottom", "none");
            $(pArea).find(".leftEmptyArea").css({
              color: "#ddd",
              border: "none",
            });
            $(pArea).find(".rightEmptyArea").css({
              color: "#ddd",
              border: "none",
            });
            $(pArea).find(".leftEmptyArea:hover").css({
              background: "transparent",
            });
            $(pArea).find(".rightEmptyArea:hover").css({
              background: "transparent",
            });
          },
        },
        {
          // background: !this.flag ? "#000" : "#fff",
          background: "#000",
          padding: "0px",
        }
      );
    },
    openModuleDialog(content) {
      let app = WebTool.copyObject(this.moduleEditor);
      if (content && content.code) {
        this.checkLogined(() => {
          app.dsl.mountedCallback = function () {
            let vueItem = app.card.task.vueItem;
            vueItem.newItemDialog.dsl.data.editorMap.prompt.disabled = true;
            vueItem.openNewAppDialog("copy", content, "入库");
          };

          app.dsl.params.folderName = localStorage.folderName;
          this.openAppDialog(app, this.$t("myModule"), "stack");
        });
      } else {
        app.dsl.params.folderName = localStorage.folderName;
        this.openAppDialog(app, this.$t("myModule"), "stack");
      }
    },
    openPersonDialog() {
      let app = {
        url: "/mainApp/app/personalInfo.js",
        key: "transweb_personalInfo",
      };
      let menu = [
        {
          label: this.$t("previewAppsHome"),
          action: function () {
            let url = location.origin + location.pathname;
            url = WebTool.attachParams(url, {
              agent: localStorage.folderName,
            });
            window.open(url, "_blank");
          },
        },
      ];
      this.openAppDialog(app, this.$t("personalInfo"), "", menu);
    },
    openRespenderDocument(id) {
      if (id) {
        let url = `/?id=${id}`;
        window.open(url, "_blank");
      }
    },
    updateModuleView() {
      let tApp = this.oneKeyApp;
      if (tApp.card && tApp.card.task && tApp.card.task.vueItem) {
        let vueItem = tApp.card.task.vueItem;

        this.$nextTick(() => {
          vueItem.updateModulePreview();
        });
      }
    },
    displayPptViewer(content, app, toView, docFlag) {
      this.fragments = content;
      this.status = 3;
      this.currentContent = this.fragments;
      this.currentApp = app || this.currentApp;
      delete this.currentApp.card;
      this.$nextTick(() => {
        if (docFlag) {
          this.updateAgentContent(content, docFlag);
        } else {
          this.shareItem(false, "new", (tData) => {
            let url = location.origin + location.pathname;
            let params = WebTool._urlQuery(location.href);
            delete params.agent;
            delete params.appName;
            delete params.record;
            delete params.aScript;
            delete params.input;
            delete params.auto;
            params.id = tData.documentId;
            location.href = WebTool.attachParams(url, params);
          });
        }
      });
    },
    transFragmentContent(item) {
      let ret = {
        className: "",
        title: "",
        list: [],
        image: [],
        video: [],
        iframe: [],
        dsl: [],
        pre: [],
        table: [],
        p: [],
      };

      item = item || this.fragments[this.index || 0] || {};
      ret.className = item.className || "";
      item.list = item.list || [];
      if (item && item.header) {
        let tArr = item.header.innerHTML.split("#");
        ret.title = tArr[0];
      }
      for (let i = 0; i < item.list.length; i++) {
        let d = item.list[i] || {};
        if (d.nodeName === "P") {
          let arr = d.querySelectorAll("img");
          if (arr.length !== 0) {
            for (j = 0; j < arr.length; j++) {
              let img = arr[j];
              ret.image.push(img.src);
            }
          } else {
            let text = d.textContent || "";
            text = text.trim();
            text = text.replace(/\&nbsp;/g, "");
            if (!text) {
              continue;
            }
            ret.p.push(text);

            let arr = d.textContent.split(/:|：/);
            let key = (arr[0] || "").trim();
            let value = text.replace(arr[0] + ":", "");
            value = value.replace(arr[0] + "：", "");

            if (key !== value && arr[1]) {
              value = value[0] !== "0" ? Number(value) || value : value;
            } else {
              value = "";
              key = text;
            }

            ret.list.push({
              type: "text",
              key: key,
              value: value,
              content: d.textContent,
            });
          }
        } else if (d.nodeName === "BLOCKQUOTE") {
          let text = d.outerHTML || "";
          text = text.trim();
          text = text.replace(/\&nbsp;/g, "");
          ret.p.push(text);
          ret.list.push(text);
        }

        if (d.querySelector && d.querySelector("video")) {
          let vArr = d.querySelectorAll("video");
          for (j = 0; j < vArr.length; j++) {
            let video = vArr[j];
            ret.video.push(video.children[0].src);
          }
        }

        if (
          (d.querySelector && d.querySelector("iframe")) ||
          d.nodeName === "IFRAME"
        ) {
          let iframe = d.querySelector("iframe") || d;
          let src = iframe.src;
          ret.iframe.push(src);
        }

        if (d.nodeName === "TABLE" || d.nodeName === "PRE") {
          let cItem = {};
          if (d.nodeName === "TABLE") {
            cItem = this.filterChartData(d);
          } else {
            cItem = this.filterDslData(d);
          }

          if (cItem) {
            ret.chart = ret.chart || [];
            ret.dsl = ret.dsl || [];
            ret.chart.push(cItem);
            ret.dsl.push(cItem);
          }
        } else {
        }
      }
      let tIndex = this.findListItem(item.list);
      if (tIndex !== -1) {
        ret.list = this.adjustList(item.list);
        ret.p = ret.p.slice(0, tIndex);
        let arr = this.checkLastSection(item.list);
        ret.p = ret.p.concat(arr);
      }

      for (let k in ret) {
        if (!ret[k] || ret[k].length === 0) {
          delete ret[k];
        }
      }

      return ret;
    },
    filterChartData(table) {
      let ret = {
        name: "",
        dataMap: [],
        data: [],
      };
      let header = table.rows[0].childNodes;
      for (let j = 1; j < header.length; j++) {
        let item = {
          value: [],
          name: header[j].textContent,
        };
        ret.data.push(item);
      }
      ret.name = header[0].textContent;
      let arr = table.rows;
      for (let i = 1; i < arr.length; i++) {
        let temp = arr[i].childNodes;
        for (let k = 1; k < temp.length; k++) {
          ret.data[k - 1].value.push(Number(temp[k].textContent));
        }
        ret.dataMap.push(temp[0].textContent);
      }
      return ret;
    },
    filterDslData(pre) {
      let item = null;
      try {
        item = eval(`(${pre.textContent})`);
      } catch (e) {}
      if (typeof item !== "object") {
        item = null;
      }
      return item;
    },
    checkLastSection(list) {
      let tIndex = this.findListItem(list, 1);
      let ret = [];
      if (tIndex !== -1 && tIndex !== list.length - 1) {
        let d = list[tIndex].children;
        let item = d[d.length - 1];
        let text = item.innerHTML || "";
        if (text.search(/:$/) !== -1) {
          ret = list.slice(tIndex + 2, list.length);
        } else {
          ret = list.slice(tIndex + 1, list.length);
        }
      }
      let temp = ret;
      ret = [];
      temp.map((item) => {
        let text = item.innerHTML || "";
        text = text.replace(/\&nbsp;/g, "");
        text = text.trim();
        if (item.nodeName === "P") {
          ret.push(text);
        }
        return text;
      });
      return ret;
    },
    getKeyValue(text, d) {
      let ret = null;
      text = text.trim();
      text = text.replace(/\&nbsp;/g, "");
      if (text) {
        let arr = d.textContent.split(/:|：/);
        let key = (arr[0] || "").trim();
        let value = text.replace(arr[0] + ":", "");
        value = value.replace(arr[0] + "：", "");

        if (key !== value && arr[1]) {
          value = value[0] !== "0" ? Number(value) || value : value;
        } else {
          value = "";
          key = text;
        }
        ret = {
          key: key,
          value: value,
        };
      }
      return ret;
    },
    getKvList(d) {
      let ret = [];
      if (d.children && d.children.length !== 0) {
        for (let t = 0; t < d.children.length; t++) {
          let text = d.children[t].innerHTML || "";
          let tItem = this.getKeyValue(text, d.children[t]);
          if (tItem) {
            ret.push({
              content: text,
              key: tItem.key,
              value: tItem.value,
            });
          }
        }
      }
      return ret;
    },
    adjustList(list, ret) {
      ret = ret || [];
      let i = this.findListItem(list);
      if (list.length > 0 && i !== -1) {
        let d = list[i];
        let tData = list[i + 1] || {};
        for (let t = 0; t < d.children.length - 1; t++) {
          let text = d.children[t].innerHTML || "";
          let tItem = this.getKeyValue(text, d.children[t]);
          if (tItem) {
            ret.push({
              content: text,
              key: tItem.key,
              value: tItem.value,
            });
          }
        }
        let tElem = d.children[d.children.length - 1];
        let temp = tElem.innerHTML;
        if (tData.nodeName === "P" && temp.search(/\:$/) !== -1) {
          ret.push({
            content: temp + tData.innerHTML,
            key: temp.replace(/\:$/, ""),
            value: tData.innerHTML,
          });
          let tArr = list.slice(i + 2, list.length);
          this.adjustList(tArr, ret);
        } else {
          let tItem = this.getKeyValue(temp, tElem);
          if (tItem) {
            ret.push({
              content: temp,
              key: tItem.key,
              value: tItem.value,
            });
          }
          let tArr = list.slice(i + 1, list.length);
          this.adjustList(tArr, ret);
        }
      }
      return ret;
    },
    findListItem(list, flag) {
      let n = -1;
      if (!flag) {
        for (let i = 0; i < list.length; i++) {
          let d = list[i];
          if (d.nodeName === "UL" || d.nodeName === "OL") {
            n = i;
            break;
          }
        }
      } else {
        for (let i = list.length - 1; i > -1; i--) {
          let d = list[i];
          if (d.nodeName === "UL" || d.nodeName === "OL") {
            n = i;
            break;
          }
        }
      }
      return n;
    },
    jsonToFragments(json) {
      this.fragments = json;
      if (json && !json.constructor.name !== "Array") {
        this.fragments = [json];
      }
      this.fragments = this.fragments.map((item) => {
        if (!item.content) {
          item = {
            content: JSON.parse(JSON.stringify(item)),
          };
        }
        return item;
      });
      return this.fragments;
    },
    htmlToFragment(container) {
      this.fragments = [];
      let arr = container.childNodes;
      for (let i = 0; i < arr.length; i++) {
        let item = arr[i];
        let text = item.innerHTML || "";
        text = text.replace(/\<br\>/g, "");
        text = text.replace(/\&nbsp;/g, "");
        text = text.trim();
        // if (!text && item.nodeName.search(/^HR/) === -1) {
        //   continue;
        // }
        if (item.nodeName.search(/^H/) !== -1) {
          let arr = item.textContent.split("#");
          // item.innerHTML = item.innerHTML.split("#")[0];
          let tArr = arr[0].split(":");
          item.innerHTML = tArr[tArr.length - 1];
          let tData = {
            index: this.fragments.length,
            className: arr[1],
            header: item,
            list: [],
          };
          this.fragments.push(tData);
          if (tData.className) {
            this.classNameMap[tData.className] =
              this.classNameMap[tData.className] || [];
            this.classNameMap[tData.className].push(tData);
          }
        } else {
          let fragment = this.fragments[this.fragments.length - 1];
          if (fragment && fragment.list) {
            fragment.list.push(item);
          }
        }
      }
      this.transferContent();
    },
    splitContentFragment(content) {
      let container = document.createElement("div");
      container.innerHTML = content;
      this.classNameMap = {};
      this.fragments = [];
      let arr = container.childNodes;
      if (arr.length === 1) {
        let temp = $(arr[0]).find("code")[0] || arr[0];
        let str = temp.textContent.trim();
        str = str.replace(/^\`\`\`/g, "");
        str = str.replace(/\`\`\`$/g, "");
        str = str.replace(/^json/i, "");
        try {
          let json = JSON.parse(str);
          this.currentRaw.type = "json";
          this.currentRaw.value = WebTool.objectToString(str, true);
          this.updateFragments(json);
        } catch (e) {
          this.currentRaw.type = "markdown";
          this.currentRaw.value = content;
          this.htmlToFragment(container);
        }
      } else {
        this.htmlToFragment(container);
      }

      return this.fragments;
    },
    transferContent() {
      for (let i = 0; i < this.fragments.length; i++) {
        this.fragments[i].content = this.transFragmentContent(
          this.fragments[i]
        );
      }
    },
    displayOneKeyApp(elem, status) {
      elem = elem || this.$refs.menuAreaItem;
      let app = this.oneKeyApp;
      app.dsl = app.dsl || {};

      if (status === 2) {
        app.dsl.data = {
          pptFileSpan: 24,
          moduleSpan: 24,
          status: 2,
        };
      }

      app.dsl.data = app.dsl.data || {};

      app.dsl.data.currentApp = this.currentApp;

      app.dsl.data.meta = this.currentApp.meta || {};

      let _self = this;
      app.dsl.promise.destroyed = function () {
        app.destroyed = true;
      };
      app.dsl.methods = app.dsl.methods || {};
      app.dsl.methods.confirmStartTask = function () {
        this.isTransforming = true;
        let _that = this;
        let text = this.textContent;
        if (this.textFromImage) {
          text += this.textFromImage;
        }
        if (!text) {
          this.$message({
            type: "warning",
            message: webCpu.messages[lang].emptyTextTips,
          });
          _that.isTransforming = false;
          return false;
        }
        _self.checkLogined(
          (tData) => {
            if (tData.ret === 0) {
              if (tData.tokenLimit - tData.tokenUsed <= 0) {
                console.log("Token 已用完");
                WebTool.showMask("你的可用 Token 已用完，请充值后重试。", 3000);
                this.renderRechargeDialog();
                let currentCard = webCpu.currentCard;
                if (
                  currentCard &&
                  currentCard.task &&
                  currentCard.task.vueItem
                ) {
                  let vueItem = currentCard.task.vueItem;
                  if (typeof vueItem.dismissLoadingTips === "function") {
                    vueItem.dismissLoadingTips();
                  }
                }
                return false;
              }

              _self.generateContent(
                text,
                function (tData) {
                  if (!tData || !tData.usage || !tData.usage.result) {
                    _self.$message({
                      type: "warning",
                      message: webCpu.messages[lang].emptyTextTips,
                    });
                    _that.isTransforming = false;
                    _self.status = 1;
                    return false;
                  }
                  let str = tData.usage.result;
                  let ret = _self.transformContent(str, !_that.aiEnable);
                  if (!ret && _that.aiEnable) {
                    _that.isTransforming = false;
                    _self.status = 1;
                    return false;
                  } else if (!ret) {
                    _self.splitContentFragment(str);
                  }

                  if (_self.fragments.length === 0) {
                    let tElem = document.createElement("div");
                    tElem.innerHTML = str;
                    for (let i = 0; i < tElem.childNodes.length; i++) {
                      let item = tElem.childNodes[i];
                      let tStr = item.innerHTML || item.textContent;
                      if (tStr) {
                        let arr = tStr.split("\n");
                        arr.map((d) => {
                          if (d) {
                            _self.fragments.push({
                              content: {
                                title: d,
                              },
                            });
                          }
                        });
                      }
                    }
                  }
                  if (_self.fragments[0] && !_self.shareInfo.name) {
                    let dd = _self.fragments[0].content;
                    _self.shareInfo.name =
                      dd.title || dd.name || _self.$t("anonymous");
                  }
                  if (_self.fragments.length !== 0) {
                    _self.$nextTick(() => {
                      let vueItem = webCpu.cards.oneKeyCard.task.vueItem;
                      let elem = vueItem.$refs.inputContentItem;
                      if (
                        elem &&
                        webCpu.cards.generateProgressPanelCard &&
                        webCpu.cards.generateProgressPanelCard.task
                      ) {
                        let tItem =
                          webCpu.cards.generateProgressPanelCard.task.vueItem;
                        tItem.finishSmoothly(1000, () => {
                          _self.displayPptViewer(_self.fragments);
                          webCpu.CardItem.dismissMask(elem);
                        });
                      } else {
                        _self.displayPptViewer(_self.fragments);
                      }
                    });
                  } else {
                    _self.$message({
                      type: "warning",
                      message: webCpu.messages[lang].generateContentError,
                    });
                    _that.isTransforming = false;
                    _self.status = 1;
                  }
                },
                _that.aiEnable
              );
            } else {
              _that.isTransforming = false;
            }
          },
          () => {
            _that.isTransforming = false;
          }
        );
      };
      webCpu.updateView(elem, app);
    },
    handleClickBack() {
      window.parent.postMessage(
        {
          type: "message",
          value: "dismissCurrentService",
        },
        "*"
      );
    },

    updateDocumentMata() {
      let app = this.currentPptApp;
      if (!app || !app.card || !app.card.task.vueItem) {
        return false;
      }
      let vueItem = app.card.task.vueItem;
      this.documentMeta.folderName =
        this.documentMeta.folderName || localStorage.folderName;
      vueItem.documentMeta = this.documentMeta;

      vueItem.content = vueItem.fragments = this.fragments;
      if (vueItem.currentCard && vueItem.currentCard.task) {
        vueItem.currentCard.task.vueItem.documentMeta = this.documentMeta;
        vueItem.currentCard.task.vueItem.context = this.fragments;
      }
    },
    updateFragments(json) {
      this.fragments = [];
      this.jsonToFragments =
        this.currentApp.jsonToFragments || this.jsonToFragments;
      if (typeof this.jsonToFragments === "function") {
        this.fragments = this.jsonToFragments(json, this);
      }
      return this.fragments;
    },
    previewAppItem(content, currentApp, documentMeta) {
      let app = WebTool.copyObject(this.pptModeEditor);
      app.dsl = app.dsl || {};
      app.dsl.data = app.dsl.data || {};
      app.dsl.style = {
        padding: "5px 20px",
      };
      app.dsl.data.content = content;
      app.dsl.data.fragments = content;
      app.dsl.data.localDocFlag = true;

      app.dsl.data.resolution = this.resolution;

      app.dsl.data.documentMeta = documentMeta || this.documentMeta || {};
      app.dsl.data.documentMeta.localDocFlag = true;
      // app.dsl.data.appType = app.dsl.data.appType || "single";
      app.dsl.data.interface = app.dsl.data.interface || {};
      app.dsl.data.interface.generateContent = JSON.parse(
        JSON.stringify(this.interface.generateContent)
      );
      app.dsl.data.mode = this.mode;
      app.dsl.data.index = this.currentIndex || 0;

      currentApp = currentApp || this.currentApp;

      if (currentApp) {
        if (!currentApp.url && currentApp.startApp) {
          currentApp.url = currentApp.startApp.url;
          currentApp.className = currentApp.startApp.className;
        }
        app.dsl.data.currentApp = WebTool.copyObject(currentApp);
        currentApp.localDocFlag = true;
      }

      app.dsl.methods = app.dsl.methods || {};

      webCpu.CardItem.renderCardDialog(document.body, app, {
        title: content[0].content.title,
        titleStyle: {
          background: "var(--el-color-primary-light-9)",
          color: "var(--el-color-primary)",
        },
        closeType: "back",
      });
    },
    updateAgentContent(content, flag) {
      if (!content) {
        this.$message({
          type: "warning",
          message: webCpu.messages[lang].emptyContentTips,
        });
        return false;
      }
      delete this.pptModeEditor.card;
      let app = this.currentPptApp || WebTool.copyObject(this.pptModeEditor);

      app.dsl = app.dsl || {};
      app.dsl.data = app.dsl.data || {};
      app.dsl.data.content = content;
      app.dsl.data.status = this.status;
      app.dsl.data.fragments = content;
      app.dsl.data.isDocumentStatus = flag;

      app.dsl.data.resolution = this.resolution;

      app.dsl.data.documentMeta = this.documentMeta;
      // app.dsl.data.appType = app.dsl.data.appType || "single";
      app.dsl.data.interface = app.dsl.data.interface || {};
      app.dsl.data.interface.generateContent = JSON.parse(
        JSON.stringify(this.interface.generateContent)
      );
      app.dsl.data.mode = this.mode;
      app.dsl.data.index = this.currentIndex || 0;
      if (
        this.currentApp.contentApp &&
        this.currentApp.contentApp.dsl &&
        this.currentApp.contentApp.dsl.data
      ) {
        delete this.currentApp.contentApp.dsl.data.accountData;
      }
      app.dsl.data.currentApp = WebTool.copyObject(this.currentApp);
      app.dsl.methods = app.dsl.methods || {};
      let elem = this.$refs.treeItemEditorContainer;

      webCpu.updateView(elem, app);
      this.currentPptApp = app;
    },
  },
};
</script>

<style scoped>
.treeEditorArea {
  position: relative;
  height: 100%;
  width: 100%;
  padding: 0px 0px;
  float: left;
  background: linear-gradient(to bottom right, #6951ff, #10edc5);
}

.topOptionArea {
  height: 50px;
  line-height: 50px;
  z-index: 999;
  width: 100%;
  padding: 0px 10px;
  backdrop-filter: blur(10px); /* 增加背景模糊度 */
  -webkit-backdrop-filter: blur(10px); /* 针对 Safari 浏览器 */
  position: relative;
  color: #fff;
  float: left;
}

.treeEditorArea[agent="4140329349"]
  .topOptionArea
  .logoArea
  .logoImageItem
  img {
  filter: brightness(0) invert(1);
}

/* .treeEditorArea[status="1"] .topOptionArea {
  padding: 0px calc(50% - 360px);
} */

.topInfoList {
  position: relative;
  height: 50px;
  line-height: 50px;
}

.exportOptionArea {
  float: right;
  display: inline-block;
  width: 200px;
  margin-top: 9px;
  margin-right: 0px;
  transform: scale(0.9);
}
.exportOptionArea .el-input__wrapper {
  width: calc(100% - 50px);
}

.descSpanItem {
  font-size: 12px;
  margin-left: 20px;
  font-weight: normal;
  display: inline-block;
}

.fileNameTitle {
  float: left;
  display: inline-block;
  vertical-align: middle;
  color: #666;
  font-size: 12px;
}

.optionItemsArea {
  float: right;
  display: inline-block;
}

.settingPopoverItem {
  margin-left: 5px;
}

.treeEditorArea[mode="view"] .exportItemBtn {
  margin-left: -5px;
}

.exportItemBtn {
  display: inline-block;
  margin-right: 0px;
  vertical-align: middle;
  transform: scale(0.8);
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    transform: translateX(0%);
    opacity: 0.5;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

.tw-animate-shimmer {
  animation: shimmer 1s ease-in-out infinite;
}

.indexItemArea {
  float: right;
  color: #939393;
}
.indexItemArea > .indexItem {
  display: inline-block;
  height: 40px;
  padding: 0px 10px;
  margin-right: 10px;
  float: left;
  line-height: 40px;
  vertical-align: middle;
}
.indexItemArea > .currentTitle > .currentTipsItem {
  display: inline-block;
  vertical-align: middle;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 200px;
  text-indent: 0px;
  margin-left: 10px;
}
.indexItemArea > .currentTitle {
  text-indent: 10px;
  display: inline-block;
  vertical-align: middle;
  padding-right: 10px;
  font-size: 12px;
  max-width: calc(100% - 60px);
  min-width: 120px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  float: left;
}

.indexItemArea > .currentTitle > .indexFlagArea {
  display: inline-block;
  vertical-align: middle;
  height: 40px;
  line-height: 40px;
  width: auto;
  text-align: left;
}

.treeEditorArea[status="2"] .aiInfoArea {
  display: none;
}

.CardItem_mask .forbidTips {
  width: 100%;
  background: transparent;
  top: -7px;
  left: -2px;
  text-align: left;
  font-size: 10px;
  padding: 3px;
  text-shadow: none;
  box-shadow: none;
  mix-blend-mode: overlay;
  border: none;
}

.menuListArea {
  text-shadow: 1px 1px 1px #fff, -1px 1px 1px #fff, 1px -1px 1px #fff,
    -1px -1px 1px #fff;
}

.interactionList {
  display: inline-block;
  vertical-align: middle;
  font-size: 12px;
  margin-left: 20px;
}

.shareOptionArea .el-input-group__prepend {
  background-color: transparent !important;
}

.shareLinkItem {
  border: solid 1px #f2f2f2;
  border-radius: 5px;
  transform: scale(0.7);
  transform-origin: 0px center;
  width: 95%;
}

.el-dropdown-link:focus-visible {
  outline: none !important;
}

.no-underline-on-hover:hover {
  text-decoration: none; /* 悬停时隐藏下划线 */
}

a:hover {
  color: #0ca598;
}

.resolutionSelect {
  width: 100px;
}

.settingItem .settingSpan {
  float: left;
}
.settingItem .settingEditor {
  float: right;
  margin-top: 3px;
  display: inline-block;
}

.switchBtnArea {
  margin: 0px 10px;
}

.buttonList .el-button {
  width: 110px;
}

.titleItem {
  font-size: 14px;
  text-indent: 10px;
  display: inline-block;
  float: right;
  line-height: 50px;
  height: 50px;
}

.tokenInfoArea {
  position: relative;
  float: right;
  font-size: 12px;
  font-weight: normal;
  margin-left: 10px;
  display: inline-block;
  color: #999;
}

.tokenInfoArea:after {
  content: "";
  position: absolute;
  right: 0px;
  top: 15px;
  height: 20px;
  width: 0px;
}

.tokenInfoArea > span {
  font-weight: normal;
  color: #333;
}

.tokenInfoArea .el-button {
  margin-top: -2px;
}

.el-divider--vertical {
  border-left: 1px var(--el-color-info) var(--el-border-style);
}

.el-switch--small .el-switch__core {
  height: 22px;
  border-radius: 12px;
  padding: 0px 3px;
}

.treeEditorContainer {
  vertical-align: middle;
  display: inline-block;
  width: 100%;
  height: calc(100% - 50px);
  position: relative;
}

.optionButtonArea
  .el-radio-button__original-radio:checked
  + .el-radio-button__inner,
.optionButtonArea .el-radio-button:first-child .el-radio-button__inner,
.optionButtonArea .el-radio-button__inner {
  border: none;
}
.optionButtonArea
  .el-radio-button__original-radio:checked
  + .el-radio-button__inner {
  box-shadow: none;
}

.leftMenuArea {
  position: absolute;
  left: 0px;
  padding-left: 0px;
  height: 100%;
  z-index: 99;
  overflow: hidden;
}

.posterAppId.el-input-group--append > .el-input__wrapper {
  width: calc(100% - 50px);
}

.treeEditorArea[status="2"] .currentImageItem {
  position: absolute;
  bottom: 5px;
  right: 10px;
}

.treeEditorArea[status="2"] .currentImageItem {
  position: absolute;
  bottom: 5px;
  right: 10px;
}

.treeEditorContainer .optionButtonArea {
  padding-left: 10px;
  padding-right: 10px;
  width: calc(100% - 40px);
  background: rgb(255, 255, 255, 1);
}

.textInfoArea p {
  word-wrap: break-word;
  word-break: break-all;
}

.treeEditorArea[status="2"] .el-textarea .el-textarea__inner {
  height: 100%;
}

.treeEditorArea[status="2"] .pptExampleArea {
  display: none;
}

.menuTreeArea {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
}

.menuTreeArea .el-tree {
  background-color: rgb(255, 255, 255, 1);
}

.el-tree-node__children
  .el-tree-node.is-focusable.is-current
  > .el-tree-node__content
  > .custom-tree-node {
  border-left: solid 2px var(--el-color-primary-light-3);
}

.spinner-border {
  vertical-align: middle;
  margin-top: 60px;
}

.optionButtonArea .el-radio-button {
  margin-bottom: 0px;
  vertical-align: middle;
}

.logoArea {
  font-weight: 900;
  font-size: 18px;
  position: absolute;
}
.logoImageItem {
  cursor: pointer;
}
.classNameSpan {
  max-width: 200px;
  display: inline-block;
}

.treeEditorArea[status="1"] .optionButtonArea {
  display: none;
}

.subTextItem {
  font-size: 14px;
  font-weight: normal;
  vertical-align: middle;
  display: inline-block;
  margin-left: 0px;
  cursor: pointer;
  max-width: 160px;
}
.el-dropdown-link.subTextItem {
  margin-top: 0px;
}

.subTextItem .titleItem {
  float: left;
  display: inline-block;
  max-width: 140px;
  color: #fff;
}

.subTextItem i {
  margin-top: 18px;
  margin-left: 0px;
}

.logoArea::before {
  /* content: ""; */
  width: 35px;
  height: 50px;
  overflow: hidden;
  background: url(./logo.png) no-repeat;
  background-size: cover;
  background-position: -5px 0px;
  display: inline-block;
  vertical-align: middle;
}

span[prop="title"] .el-input__wrapper {
  box-shadow: none;
  border-radius: 0px;
}

@media (max-width: 780px) {
  .shareLinkItem {
    display: none;
  }
}

.editor-container {
  padding-left: 5px;
}

.noRightsSpan {
  color: #888;
  display: inline-block;
  margin-top: 40px;
}

.timeoutFlagItem {
  padding: 0px 2px 0px 10px;
  display: inline-block;
  min-width: 50px;
  font-size: 12px;
  text-align: center;
  color: #999;
}

span[prop="title"] .el-input__wrapper:before {
  content: "";
  display: inline-block;
  vertical-align: middle;
  position: absolute;
  left: 0px;
  height: 15px;
  width: 0px;
  border-left: solid 2px var(--el-color-primary-light-3);
}

.ArticleEditor .toolbar-container {
  border-bottom: dashed 1px var(--el-color-primary-light-7);
}

.el-tree {
  position: relative;
  height: 100%;
}

.el-tree > .el-tree-node {
  position: relative;
  height: 100%;
}

.el-tree-node {
  border-bottom: solid 1px var(--el-color-primary-light-9);
}

.effectSwitch {
  font-size: 12px;
}

.effectSwitch .el-switch {
  margin-left: 5px;
}

.el-tree-node__children {
  height: calc(100% - 50px);
  overflow: auto;
}

.loginRegItem {
  display: inline-block;
  width: 140px;
  height: 50px;
  line-height: 50px;
  float: right;
  margin-top: 0px;
}

.loginRegItem .el-dropdown {
  height: 50px;
  line-height: 50px;
}

.tipsItem {
  font-size: 12px;
  color: rgba(250, 0, 0, 0.5);
  display: inline-block;
  width: 100%;
  text-indent: 5px;
}

.el-tree-node > .el-tree-node__content {
  height: 40px;
}

.el-tree-node.is-expanded > .el-tree-node__content {
  height: 40px;
}

.custom-tree-node {
  position: relative;
  width: 100%;
  display: inline-block;
  padding-right: 10px;
}

.custom-tree-node > span.labelText {
  text-indent: 15px;
  display: inline-block;
  vertical-align: middle;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: calc(100% - 70px);
}

.optionButtonArea
  .el-radio-button__original-radio:checked
  + .el-radio-button__inner {
  background: transparent;
  color: var(--el-radio-button-checked-border-color, var(--el-color-primary));
}

.CardItem_mask .el-card__body span[prop="background"] .el-image {
  background-color: var(--el-color-primary-light-5);
}

.optionButtonArea .el-radio-button__inner {
  color: #999;
  background: transparent;
}

.optionButtonArea .el-radio-button:first-child .el-radio-button__inner {
  border-right: solid 1px #ddd;
}

.selectModuleBtn {
  float: right;
  margin-left: 0px;
  margin-top: -2px;
  margin-right: 10px;
}

.optionButtonArea {
  position: absolute;
  left: 270px;
  top: 0px;
  width: calc(100% - 270px);
  height: 40px;
  line-height: 40px;
  z-index: 3;
}

.shareOptionArea {
  float: left;
  display: inline-block;
  width: 310px;
  padding-right: 30px;
  margin-right: -2px;
}
.qrCodeItem {
  position: absolute;
  right: 0px;
  top: 0px;
  width: 40px;
  line-height: 40px;
  height: 40px;
  text-align: center;
  z-index: 1098;
}

.saveDocumentBtn {
  margin-left: -75px;
  margin-right: 0px;
  display: inline-block;
}

.el-tree-node__expand-icon {
  display: none;
}

.menuTreeArea .el-tree-node > .el-tree-node__content {
  background-color: transparent;
}

.optionsItemArea {
  float: left;
}

.menuTreeArea > .el-tree > .el-tree-node > .el-tree-node__content {
  background-color: rgba(255, 255, 255, 1);
  border-bottom: solid 1px #f2f2f2;
}
.el-tree--highlight-current
  .el-tree-node__children
  .el-tree-node.is-current
  > .el-tree-node__content {
  color: var(--el-color-primary-light-3) !important;
}

.fileNameSapn {
  vertical-align: middle;
  max-width: 300px;
  display: inline-block;
  vertical-align: middle;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: -3px;
  overflow: hidden;
  font-size: 900;
}

.keyPoint,
.box-card {
  overflow: auto !important;
}

.switchBtn {
  margin-top: -2px;
}

.loadAiBtn {
  margin-top: 8px;
  margin-right: 10px;
  float: right;
}

/* .treeEditorArea .el-input-group__prepend {
  padding: 0px 10px;
}

.treeEditorArea .el-input-group__append .el-button--primary span {
  color: var(--el-color-primary);
} */

.aboutOptionsArea {
  position: absolute;
  bottom: 0px;
  width: 100%;
  height: 40px;
  line-height: 40px;
}

.loginRegItem .loginContentArea {
  text-align: right;
  height: 50px !important;
  line-height: 50px !important;
}

.aboutOptionsArea .el-dropdown {
  height: 40px !important;
  line-height: 40px !important;
  padding-left: 10px;
}

.aboutOptionsArea > div {
  width: 100%;
  height: 40px;
  line-height: 40px;
  display: inline-block;
}

.ellipsis[contenteditable] {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 100%;
  display: inline-block;
  vertical-align: middle;
}

.aboutOptionsArea > div > .el-button {
  float: right;
  margin-top: 10px;
}

.treeItemEditorArea {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 3;
  text-align: center;
}

.treeEditorArea[status="1"] .treeEditorContainer {
  padding-top: 0px;
}

.tempLogoItem {
  position: absolute;
  z-index: 3;
  display: inline-block;
  bottom: 0px;
  left: -1px;
  padding: 5px 10px;
  background: rgba(100, 100, 100, 0.5);
  color: #fff;
  border-top-right-radius: 8px;
}

.indexInfoArea {
  float: right;
}

.textNumberInfo {
  background: rgba(20, 20, 20, 0.6);
  display: inline-block;
  padding: 3px;
  transform: scale(0.7);
  transform-origin: 100% 100%;
  color: #fff;
}

.fileNameTitle .titleSpan {
  line-height: 20px;
  padding-left: 5px;
  padding-right: 5px;
  margin-top: -2px;
}

.fileNameTitle .titleSpan:focus-visible {
  outline: none;
  display: inline-block;
  border-bottom: solid 1px #333;
}

.selectModuleArea {
  position: relative;
  display: inline-block;
  width: 80px;
  vertical-align: middle;
  height: 40px;
  line-height: 40px;
  text-align: center;
}

.treeEditorArea[status="1"] .leftMenuArea {
  width: 100%;
}

.treeEditorArea[status="2"] .leftMenuArea {
  width: 250px;
  left: 10px;
}

.treeEditorArea[status="1"] .treeEditorContainer {
  padding-left: 0px;
}

.treeEditorArea[status="2"] .treeEditorContainer {
  padding-left: 260px;
}

.treeEditorArea[status="1"] .treeItemEditorArea {
  display: none;
}
.treeEditorArea[status="2"] .treeItemEditorArea {
  display: inline-block;
}

.treeEditorArea[status="2"][mode="edit"] .treeItemEditorArea {
  border-left: solid 1px #fff;
  padding-left: 10px;
  padding-right: 10px;
  background: rgba(255, 255, 255, 0.2); /* 设置透明背景 */
  backdrop-filter: blur(10px); /* 添加模糊效果 */
  -webkit-backdrop-filter: blur(10px); /* 兼容部分旧版浏览器 */
  border-top-left-radius: 10px; /* 边框圆角 */
  border-bottom-left-radius: 10px; /* 边框圆角 */
  border: 1px solid rgba(255, 255, 255, 0.3); /* 边框透明 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 添加阴影效果 */
}

.tipsArea {
  float: left;
  width: calc(100% - 350px);
  display: inline-block;
  font-size: 30px;
  text-align: left;
  margin-top: 20px;
  padding-top: 30px;
  color: #666;
}
.tipsArea > span {
  width: 100%;
  margin-top: 40px;
  text-indent: 40px;
  display: inline-block;
}

.hostQrCode {
  position: relative;
  float: left;
  width: 100%;
  padding: 30px 0px;
  text-align: center;
  background: #f2f2f2;
}

.el-popper__arrow {
  display: none;
}

.qrCodeCanvas {
  width: 300px;
  height: 300px;
  display: inline-block;
  float: right;
  padding: 20px;
  border-radius: 10px;
  background: #fff;
  margin-right: 40px;
}
</style>
