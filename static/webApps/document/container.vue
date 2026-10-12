<template>
  <div
    :flag="flag"
    :appType="currentApp.appType"
    :fullScreenFlag="fullScreenFlag"
    class="contentContainerArea"
    ref="rootElement"
    :style="{
      'padding-bottom': withoutIndex ? '0px' : '45px',
      'border-top': headerHidden ? 'none' : '',
    }"
  >
    <slot v-if="fragments && fragments.length !== 0">
      <div
        ref="contentViewerItem"
        :mode="mode"
        :effectSwitch="effectSwitch"
        :style="{
          paddingLeft:
            !fullScreenFlag && currentApp.appType !== 'single'
              ? '220px'
              : '0px',
          display: currentApp.appType === 'single' ? 'block' : '',
        }"
        class="contentViewerArea"
      ></div>
      <div
        v-if="currentApp.appType !== 'single'"
        :style="{
          width: flag ? '100%' : '',
          left: flag ? '0px' : '',
        }"
        class="settingsViewArea"
      >
        <div ref="settingsContainer" class="settingsContainerArea">
          <div class="layoutListArea">
            <div
              ref="layoutContainerItem"
              class="layoutContainer"
              :key="i"
              :active="index === i"
              :style="{ 'aspect-ratio': resolution[0] / resolution[1] }"
              v-for="(item, i) in fragments"
            >
              <span
                v-if="mode === 'edit'"
                class="btn-group buttonOptions"
                role="group"
                ><button
                  @click="removeSliderItem(i)"
                  class="btn btn-warning"
                  :disabled="fragments.length === 1"
                  type="button"
                  :title="$t('removeTips')"
                >
                  <i class="bi bi-dash-lg"></i></button
                ><button
                  @click="playSliderItem(i)"
                  class="btn btn-info"
                  type="button"
                  :title="$t('playSliderTips')"
                >
                  <i class="bi bi-play"></i></button
                ><button
                  @click="addSliderItem(i)"
                  class="btn btn-primary"
                  type="button"
                  :title="$t('addTips')"
                >
                  <i class="bi bi-plus-lg"></i></button
              ></span>
              <div
                class="layoutItem"
                ref="layoutItem"
                :index="i"
                :draggable="!flag && mode === 'edit'"
                v-viewer="{
                  content: fragments[i].content,
                  style: fragments[i].style,
                }"
                @click="handleCommand(i)"
              ></div>
              <div
                :index="i"
                ref="dragePositionItem"
                class="dragePositionArea"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </slot>
    <el-empty v-else :description="$t('contentErrorTips')" />
  </div>
</template>

<script>
export default {
  data() {
    webCpu.documentPrefix = webCpu.documentPrefix || location.origin;
    return {
      content: "",
      tempPrefix: "",
      flag: WebTool.adjustSize([false, false, true]),
      index: 0,
      mode: "edit",
      withoutIndex: true,
      status: 1,
      defaultImage: "",
      iframeEnable: window.iframeEnable,
      autoPlayFlag: false,
      resolution: ["100%", "100%"],
      recordingStatus: false,
      addImageApp: {
        url: "/webApps/document/addImageApp.vue",
        className: "ElementVueItem",
      },
      addVideoApp: {
        url: "/webApps/document/addVideoApp.vue",
        className: "ElementVueItem",
      },
      addAgentApp: {
        url: "/webApps/document/addAgentApp.vue",
        className: "ElementVueItem",
      },
      configAppView: {
        url: "/webApps/document/configAppView.vue",
        className: "ElementVueItem",
      },
      defaultParams: {
        backgroundImage: null,
        backgroundColor: "",
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: 0,
      },
      foreign:
        location.host === "transweb.ai" ||
        WebTool.urlQuery(location.href, "foreign"),
      currentKey: "",
      effectSwitch: false,
      localFlag: false,
      currentApp: null,
      baseWidth: 0,
      editMode: WebTool.urlQuery(location.href, "editMode"),
      appType: "",
      fullScreenFlag: false,
      currentCard: null,
      _parentItem: "",
      defaultTimeout: 5,
      baseLength: 30,
      dragendFlag: true,
      interface: {
        removeImageBackground: {
          url: "/gpt/aiGatewayRequest",
          method: "post",
          query: {
            apiName: "novitaAi",
            image: "",
          },
        },
        generatePptContent: {
          url: "/gpt/aiGatewayRequest",
          method: "post",
          query: {
            // apiName: "月之暗面-通用",
            // apiName: "智谱-glm-4",
            // apiName: "抖音豆包(Doubao-lite-128k)",
            // apiName: "天宫-通用",
            // model: "moonshot-v1-128k",
            context: "",
          },
        },
        getUserInfo: {
          url: webCpu.documentPrefix + "/user/getLoginInfo",
          method: "get",
          dataType: "json",
        },
        imageToBase64: {
          url: webCpu.documentPrefix + "/user/imageToBase64",
          method: "get",
        },
        aiGenerateImage: {
          url: webCpu.documentPrefix + "/gpt/aiGatewayRequest",
          method: "post",
          query: {
            apiName: "智谱-ppt-image",
            content: "",
          },
        },
      },
      cardSelectorApp: {
        url: webCpu.documentPrefix + "/webApps/document/pptSelector/main.vue",
        className: "ElementVueItem",
        style: {
          padding: "10px 20px",
        },
        dsl: {
          url: webCpu.documentPrefix +  "/webApps/document/pptSelector/index.json",
          requestType: "get",
          dataType: "json",
          dataFilter: function (d) {
            let ret = this.defaultData;
            ret.appList = d[this.index || 0].data;
            return ret;
          },
          data: {
            appList: [],
          },
        },
      },
      settingTitle: "",
      stackLength: 50,
      currentSubtitle: "",
      useModule: false,
      fragments: [],
      pptApp: {},
      imageMap: {},
      viewerMap: {},
      appList: [],
      transformRadio: 1,
      adjustTop: "0px",
      recordingInfo: {
        mediaRecorder: null,
        status: false,
        source: "",
        startTime: "",
        timeMap: {},
      },
      isIframe: window.parent !== window,
      undoStack: [],
      redoStack: [],
      hashMap: {},
      classNameMap: {},
      restoreInfo: {
        changed: false,
        time: 0,
        min: 1000 * 2,
      },
      buttonIcon: {
        remove: "bi bi-dash-lg",
        add: "bi bi-plus-lg",
        play: "bi bi-dash-lg",
        trash: "bi bi-trash-fill",
        sliderHandler: "bi bi-gear",
        aigc: "bi bi-stars",
      },
    };
  },
  mounted() {
    this.initAdapter();
    
    let _self = this;
    this.fragments = this.content;
    this.fragments = this.fragments.map((item, index) => {
      item.index = index;
      return item;
    });
    this.defaultParams = this.currentApp.defaultParams || this.defaultParams;
    webCpu.mitt.emit("contentUpdated", _self.fragments);
    webCpu.mitt.on("addImageItem", function (value) {
      let tContent = _self.fragments[_self.index].content;
      tContent.image = tContent.image || [];
      tContent.image.push(value.dataUrl);
      _self.freshCrurrentSlider(tContent);
      _self.restoreInfo.changed = true;
      webCpu.mitt.emit("contentUpdated", _self.fragments);
      _self.recordState();
    });

    webCpu.mitt.off("switchViewer");
    webCpu.mitt.on("switchViewer", function (v) {
      _self.switchToFragment(v);
    });

    webCpu.mitt.on("addVideoItem", function (value) {
      let tContent = _self.fragments[_self.index].content;
      tContent.iframe = tContent.iframe || [];
      tContent.iframe.push(value.dataUrl);
      _self.freshCrurrentSlider(tContent);
      _self.restoreInfo.changed = true;
      webCpu.mitt.emit("contentUpdated", _self.fragments);
      _self.recordState();
    });

    this.baseWidth = this.$refs.rootElement.clientWidth;
    if (this.fragments !== 0) {
      this.$nextTick(() => {
        if (localStorage.logined === "false" || webCpu.isContainerUpdated === "false") {
          this.updateContent(this.spanIndex);
          if (this.currentApp.name === "cardNotes") {
            this.initEvents();
          }
          this.withoutIndex = true;
          webCpu.isContainerUpdated = "true";
        }
      });
    }
    this.recordState();
  },
  unmounted() {
    if (this.recordingInfo.status) {
      this.recordingInfo.mediaRecorder.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  },
  directives: {
    viewer: {
      mounted: function (el, param) {
        let content = JSON.parse(JSON.stringify(param.value.content));
        let app = param.instance.currentApp;
        param.instance.updateViewerContent(el, app, content, param.value.style);
      },
      updated: function (el, param) {
        if (
          param.instance.mode === "view" ||
          JSON.stringify(param.value) === JSON.stringify(param.oldValue)
        ) {
          return false;
        }
        let content = JSON.parse(JSON.stringify(param.value.content));
        let app = param.instance.currentApp;
        param.instance.updateViewerContent(el, app, content, param.value.style);
      },
    },
  },
  computed: {
    indexString() {
      let str = this.setIndexString();
      return str;
    },
    headerHidden() {
      return !this.editable && window.iframeEnable && window.parent !== window;
    },
    indexTitle() {
      let str = this.setIndexTitle();
      return str;
    },
    editable() {
      let ret = false;
      if (this.documentMeta) {
        ret =
          localStorage.folderName &&
          this.documentMeta.folderName === localStorage.folderName;
      }
      // ret = ret && !(this.currentSettings.editorAgent && this.currentSettings.editorAgent !== localStorage.folderName)
      return ret;
    },
  },
  methods: {
    downloadImageItem() {},
    htmlToText(html) {
      let tElement = document.createElement("div");
      tElement.innerHTML = html;
      return tElement.innerText;
    },
    copyObject(d) {
      return JSON.parse(JSON.stringify(d));
    },
    getUserInfo(callback) {
      let _self = this;
      this.adapter.getUserInfo({}, function (tData) {
        if (tData.ret === 0) {
          _self.userInfo = tData.data;
        }
        if (typeof callback === "function") {
          callback(tData);
        }
      });
    },
    recordState(flag) {
      let time = new Date().getTime();
      if (time - this.restoreInfo.time < this.restoreInfo.min) {
        console.log("备份频率过快。");
        if (this.restoreInfo.changed) {
          setTimeout(() => {
            console.log("备份...");
            this.recordState(flag);
          }, 2000);
        }
        return false;
      } else {
        this.restoreInfo.time = time;
        this.restoreInfo.changed = false;
      }
      // 记录当前状态到撤销栈
      if (this.fragments.length === 0) {
        return false;
      }
      let arr = this.copyObject(this.fragments);
      arr[0].flag = true;
      this.undoStack.push(arr);
      if (this.undoStack.length > this.stackLength) {
        this.undoStack.shift();
      }
      // 清空重做栈
      this.redoStack = [];
      webCpu.mitt.emit("contentUpdated", this.fragments);
    },
    undo() {
      if (this.undoStack.length > 1) {
        // 弹出当前状态并设置为新状态
        let item = this.undoStack.pop();
        item = this.copyObject(item);
        this.redoStack.push(item);
        if (this.redoStack.length > this.stackLength) {
          this.redoStack.shift();
        }
        this.fragments = this.copyObject(
          this.undoStack[this.undoStack.length - 1]
        );
        this.updateContent();
      }
    },
    redo() {
      if (this.redoStack.length > 0) {
        // 弹出最近的状态并设置为新状态
        let item = this.copyObject(this.redoStack.pop());
        this.undoStack.push(item);
        this.fragments = this.copyObject(
          this.undoStack[this.undoStack.length - 1]
        );
        this.updateContent();
      }
    },
    initAdapter() {
      var config = this.interface || {};
      this.adapter = webCpu.initAdapter(config);
      return this.adapter;
    },

    attachOptionButtons(elem, buttonList, style, param, flag) {
      if (!elem) {
        return false;
      }
      $(elem).children("._label_box").remove();
      let span = document.createElement("span");
      span.setAttribute("class", "btn-group");
      span.setAttribute("role", "group");
      let button = null;

      for (let i = 0; i < buttonList.length; i++) {
        if (buttonList[i].children) {
          let group = document.createElement("div");

          group.setAttribute("class", "btn-group dropup");
          if (buttonList[i].dropType) {
            group.setAttribute("class", "btn-group " + buttonList[i].dropType);
          }
          group.setAttribute("role", "group");
          button = document.createElement("button");
          button.setAttribute("class", "btn btn-secondary dropup-toggle");
          button.setAttribute("data-toggle", "dropdown");
          if (buttonList[i].dropup) {
            button.setAttribute("class", "btn btn-secondary dropdown-toggle");
            button.setAttribute("data-toggle", "dropup");
          }
          button.setAttribute("aria-expanded", "false");
          if ((button.innerHTML = buttonList[i].label)) {
            button.innerHTML = buttonList[i].label;
            button.setAttribute("title", buttonList[i].label);
          } else {
            button.innerHTML = `<i class="${buttonList[i].class}"></i>`;
            button.setAttribute("title", buttonList[i].tips);
          }

          span.appendChild(group);
          group.appendChild(button);
          let dropdownMenu = document.createElement("div");
          dropdownMenu.setAttribute("class", "dropdown-menu");
          for (let j = 0; j < buttonList[i].children.length; j++) {
            let item = buttonList[i].children[j];
            let tElem = document.createElement("a");
            tElem.innerHTML = item.label;
            tElem.setAttribute("title", item.label);
            tElem.setAttribute("class", "dropdown-item");
            dropdownMenu.appendChild(tElem);
          }
          group.appendChild(dropdownMenu);
        } else {
          button = document.createElement("button");
          button.setAttribute("class", "btn btn-secondary");
          $(button).attr("type", "button");
          if (buttonList[i].label) {
            button.innerHTML = buttonList[i].label;
            button.setAttribute("title", buttonList[i].label);
          } else {
            button.innerHTML = `<i class="${buttonList[i].class}"></i>`;
            button.setAttribute("title", buttonList[i].tips);
          }
          span.appendChild(button);
        }
      }
      webCpu.attachLabel(elem, span.outerHTML, style, param, flag);
    },
    setIndexString() {
      let str = `${this.index + 1} / ${this.fragments.length}`;
      // this.indexString = str;
      return str;
    },
    setIndexTitle() {
      if (!this.fragments[this.index]) {
        return false;
      }
      let str = this.fragments[this.index].content.title || "#" + this.index;
      // this.indexTitle = str;
      let cName = this.fragments[this.index].className;
      if (cName && !str) {
        str = str + "#" + cName;
      }
      return str;
    },
    fullscreenCallback() {},
    exitFullscreenCallback() {},
    closeFullScreen() {
      this.toggleFullScreen();
    },
    toggleFullScreen() {
      var doc = window.document;
      var docEl = doc.documentElement;
      var requestFullScreen =
        docEl.requestFullscreen ||
        docEl.mozRequestFullScreen ||
        docEl.webkitRequestFullScreen ||
        docEl.msRequestFullscreen;
      var exitFullScreen =
        doc.exitFullscreen ||
        doc.mozCancelFullScreen ||
        doc.webkitExitFullscreen ||
        doc.msExitFullscreen;
      if (
        !doc.fullscreenElement &&
        !doc.mozFullScreenElement &&
        !doc.webkitFullscreenElement &&
        !doc.msFullscreenElement
      ) {
        requestFullScreen.call(docEl);
      } else {
        exitFullScreen.call(doc);
      }
    },
    initEvents() {
      const pageContainer = this.$refs.contentViewerItem;
      let startX = 0;
      let isDragging = false;
      let _self = this;
      try {
        document.removeEventListener(
          "fullscreenchange",
          handleFullScreenChange
        );
        document.addEventListener("fullscreenchange", handleFullScreenChange);
        document.removeEventListener(
          "webkitfullscreenchange",
          handleFullScreenChange
        );
        document.addEventListener(
          "webkitfullscreenchange",
          handleFullScreenChange
        );
        document.removeEventListener(
          "mozfullscreenchange",
          handleFullScreenChange
        );
        document.addEventListener(
          "mozfullscreenchange",
          handleFullScreenChange
        );

        window.onresize = function (e) {
          handleWindowResize(e);
        };

        if (this.mode === "edit" && !this.flag) {
          $(".layoutContainer").on("dragover", function (e) {
            let itemSelector = $(e.currentTarget).find(".layoutItem");
            let tIndex = Number(itemSelector.attr("index"));
            if (_self.dragTarget !== tIndex) {
              $(".dragePositionArea").attr("active", false);
              itemSelector
                .parent()
                .find(".dragePositionArea")
                .attr("active", true);
              _self.dragPosition = Number(itemSelector.attr("index")) + 1;
            }
            console.log("dragover _self.dragPosition", _self.dragPosition);
          });

          $(".layoutContainer").on("dragleave", function (e) {
            if (!_self.dragendFlag) {
              return false;
            }
            $(".dragePositionArea").attr("active", false);
            _self.dragPosition = -1;
            console.log("dragleave", _self.dragPosition);
          });

          $(".layoutItem").on("dragend", function (e) {
            console.log("dragend event:", e);

            $(".dragePositionArea").attr("active", false);
            if (
              _self.dragPosition !== -1 &&
              _self.dragPosition !== _self.dragTarget
            ) {
              //Todo 移动数据
              _self.moveSliderItem(_self.dragTarget, _self.dragPosition);
              console.log(
                "drag from: ",
                _self.dragTarget,
                "to: ",
                _self.dragPosition
              );
            }
            _self.dragendFlag = true;
          });

          $(".layoutItem").on("dragstart", function (e) {
            _self.dragendFlag = false;
            _self.dragTarget = Number($(e.target).attr("index"));
            console.log("draging start:", _self.dragTarget);
          });
        }

        $(".contentViewerArea").off("mousemove");
        $(".contentViewerArea").on("mousemove", function (e) {});

        //防抖函数
        let debounce = function (func, wait) {
          var timeout;
          return function () {
            var context = this,
              args = arguments;
            var later = function () {
              timeout = null;
              func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
          };
        };

        let handleWindowResize = debounce(function (event) {
          _self.updateContent();
        }, 250); // 250毫秒内只执行一次

        function handleFullScreenChange() {
          if (
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullscreenElement
          ) {
            console.log("进入全屏模式");
            if (typeof _self.fullscreenCallback === "function") {
              _self.fullscreenCallback();
            }
          } else {
            console.log("退出全屏模式");
            if (typeof _self.exitFullscreenCallback === "function") {
              _self.exitFullscreenCallback();
            }
          }
        }

        function handleTouchStart(event) {
          startX = event.touches[0].clientX;
          isDragging = true;
        }

        function handleTouchMove(event) {
          if (!isDragging) return;
          const currentX = event.touches[0].clientX;
          const deltaX = currentX - startX;

          if (deltaX > 40) {
            // 右划
            _self.switchLastFragment("switch");
          } else if (deltaX < -40) {
            // 左划
            _self.switchNextFragment("switch");
          }
          event.stopPropagation();
          event.preventDefault();
        }
        function handleTouchEnd() {
          isDragging = false;
        }
        this.$nextTick(() => {
          let pageContainer = this.$refs.contentViewerItem;
          if (this.currentApp.appType !== "single") {
            $(pageContainer).off("touchstart");
            $(pageContainer).on("touchstart", handleTouchStart);
            $(pageContainer).off("touchmove");
            $(pageContainer).on("touchmove", handleTouchMove);
            $(pageContainer).off("touchend");
            $(pageContainer).on("touchend", handleTouchEnd);
          }
        });

        let elem = window;
        $(elem).off("keydown");
        $(elem).on("keydown", function (e) {
          if (_self.mode !== "edit") {
            let code = e.keyCode;
            if (code === 33 || code === 37 || code === 38) {
              _self.state = 0;

              _self.switchLastFragment("switch");
            } else if (code === 34 || code === 39 || code === 40) {
              this.state = 0;
              _self.switchNextFragment("switch");
            }
          } else {
            if (
              (e.ctrlKey || e.metaKey) &&
              (e.keyCode === 0x06 || e.code === "KeyZ")
            ) {
              if (e.shiftKey) {
                console.log("执行从新操作");
                _self.redo();
              } else {
                // 执行撤销操作
                _self.undo();
                console.log("执行撤销操作");
              }
            }
          }
          // e.preventDefault();
        });
      } catch (e) {}
    },
    handleCommand(code) {
      if (this.flag) {
        return false;
      }
      this.index = code;
      this.updateContent();
    },
    switchNextFragment(from, flag) {
      this.switchContentFragment(1, from);
      if (!flag && this._parentItem && webCpu.cards[this._parentItem]) {
        let vueItem = webCpu.cards[this._parentItem].task.vueItem;
        if (vueItem && typeof vueItem.switchNextFragment === "function") {
          vueItem.switchNextFragment(from);
        }
      }
    },
    updateViewerContent(elem, app, content) {
      app.dsl = app.dsl || {};
      let basicStyle = {
        width: this.resolution[0],
        height: this.resolution[1],
        borderRadius: "10px",
        overflow: "hidden",
      };
      let index = Number(elem.getAttribute("index"));
      let d = this.fragments[index];

      app.dsl.style = app.dsl.style || {};
      webCpu.attachAttribute(basicStyle, app.dsl.style);
      app.dsl.style.border = "none";
      app.dsl.content = content;
      app.dsl.data = app.dsl.data || {};
      app.dsl.data.content = content;
      // app.dsl.data.style = style || null;
      app.dsl.data.index = index;

      let style = JSON.parse(JSON.stringify(d.style || {}));
      //adjust style params to css style
      this.setAppStyle(app, style);

      app.dsl.data.context = this.fragments;
      app.dsl.transformRadio = this.transformRadio;
      let _self = this;

      var prepareApp = function (c, d, t) {
        let textSelector = $(c).find(".textInfoArea");
        WebTool.setElemScale(textSelector[0]);
        content.image = content.image || [];
      };
      if (app.card && app.card.task.cardBody.parentNode === elem) {
        this.$nextTick(() => {
          webCpu[app.className].updateView(app.card.task, app.dsl.data);
        });
      } else {
        webCpu.updateView(elem, app, prepareApp);
      }
      let str = `<span class="textNumberInfo">${index + 1}</span>`;
      if (this.flag) {
        str = "";
      }
      webCpu.CardItem.setForbidArea(app.card, str);
    },
    transformList(content) {
      let list = content.list;
      let tList = [];
      let i = 0;

      while (i < list.length) {
        let k = list[i].content;
        if (k.search(":") === k.length - 1 || k.search("：") === k.length - 1) {
          let key = k.replace(":", "");
          key = k.replace("：", "");
          if (key.length > 10) {
            i++;
            continue;
          }
          let item = {
            content: key,
            key: key,
          };
          let tArr = [];
          let j = 0;
          for (j = i + 1; j < list.length; j++) {
            let t = list[j].content;
            if (t.search(":") === -1 && t.search("：") === -1) {
              tArr.push(t);
            } else {
              break;
            }
          }
          item.value = tArr.join("<br/> ");
          item.content = key + ":" + item.value;
          tList.push(item);
          i = j;
        } else if (k.search(":") !== -1 || k.search("：") !== -1) {
          let arr = k.split("：");
          if (arr.length === 1) {
            arr = k.split(":");
          }
          if (arr[0].length > 10) {
            i++;
            continue;
          }
          let value = k.slice(arr[0].length + 1, k.length);
          tList.push({
            content: k,
            key: arr[0],
            value: value,
          });
          i++;
        } else {
          // tList.push({
          //   content: k,
          //   key: k,
          //   value: "",
          // });
          i++;
        }
      }
      content.tList = tList;
      if (tList.length > 1) {
        content.list = tList;
      } else {
        content.tList = [];
      }
      return content;
    },
    moveSliderItem(from, to) {
      console.log("before move", this.fragments);
      let item = WebTool.copyObject(this.fragments[from]);
      this.addSliderItem(to - 1, item);
      if (from > to) {
        this.fragments.splice(from + 1, 1);
      } else {
        this.fragments.splice(from, 1);
      }
      console.log("after move", this.fragments);
      this.$nextTick(() => {
        this.updateView(from);
        this.updateView(to);
        if (from > to) {
          this.updateView(from + 1);
          this.updateView(from - 1);
          this.updateView(to + 1);
        } else {
          this.updateView(from + 1);
          this.updateView(to - 1);
          this.updateView(to + 1);
        }
        this.updateContent();
      });
      this.restoreInfo.changed = true;
      this.recordState(true);
    },
    switchLastFragment(from, flag) {
      this.switchContentFragment(-1, from);
      if (this._parentItem && webCpu.cards[this._parentItem]) {
        let vueItem = webCpu.cards[this._parentItem].task.vueItem;
        if (
          !flag &&
          vueItem &&
          typeof vueItem.switchNextFragment === "function"
        ) {
          vueItem.switchNextFragment(from);
        }
      }
    },
    switchToFragment(n) {
      this.index = n % this.fragments.length;
      this.updateContent();
      webCpu.CardItem.dismissMask(this._parent.card);
    },
    switchContentFragment(n, flag) {
      this.index = (this.index + n) % this.fragments.length;
      if (this.index < 0) {
        this.index = this.fragments.length - 1;
      }

      this.updateContent();
      webCpu.CardItem.dismissMask(this._parent.card);
    },
    attachIframeEvents(arr, iframe, scriptDelay) {
      let str = `transweb_events(${WebTool.objectToString(arr)});`;
      var base64 = btoa(unescape(encodeURIComponent(str)));
      let dUrl = "data:application/javascript;base64," + base64;
      iframe.src = WebTool.attachParams(iframe.src, {
        aScript: dUrl,
      });
    },
    updateViewerContent(elem, app, content) {
      app.dsl = app.dsl || {};
      let basicStyle = {
        width: this.resolution[0],
        height: this.resolution[1],
        borderRadius: "10px",
        overflow: "hidden",
      };
      let index = Number(elem.getAttribute("index"));
      let d = this.fragments[index];

      app.dsl.style = app.dsl.style || {};
      webCpu.attachAttribute(basicStyle, app.dsl.style);
      app.dsl.style.border = "none";
      app.dsl.content = content;
      app.dsl.data = app.dsl.data || {};
      app.dsl.data.content = content;
      // app.dsl.data.style = style || null;
      app.dsl.data.index = index;

      let style = JSON.parse(JSON.stringify(d.style || {}));
      //adjust style params to css style
      this.setAppStyle(app, style);

      app.dsl.data.context = this.fragments;
      app.dsl.transformRadio = this.transformRadio;
      let _self = this;

      var prepareApp = function (c, d, t) {
        let textSelector = $(c).find(".textInfoArea");
        WebTool.setElemScale(textSelector[0]);
      };
      if (app.card && app.card.task.cardBody.parentNode === elem) {
        this.$nextTick(() => {
          webCpu[app.className].updateView(app.card.task, app.dsl.data);
        });
      } else {
        webCpu.updateView(elem, app, prepareApp);
      }
      let str = `<span class="textNumberInfo">${index + 1}</span>`;
      if (this.flag) {
        str = "";
      }
      webCpu.CardItem.setForbidArea(app.card, str);
    },
    updateView(index, app, elem) {
      index = typeof index === "number" ? index : this.index;
      let arr = this.$refs.layoutItem || [];
      elem = elem || arr[index];
      if (!elem) {
        return false;
      }
      app = app || this.currentApp;
      delete app.card;
      let d = this.fragments[index || this.index || 0] || this.fragments[0];
      let content = JSON.parse(JSON.stringify(d.content));
      this.updateViewerContent(elem, app, content, d.style);
    },
    removeSliderItem(index) {
      this.fragments.splice(index, 1);
      this.$nextTick(() => {
        this.fragments = this.fragments.map((item, i) => {
          if (i > index - 1 && i < this.fragments.length) {
            this.updateView(i);
          }
          item.index = i;
          return item;
        });
        if (this.index === index) {
          if (this.index > this.fragments.length - 1) {
            this.index = this.fragments.length - 1;
          }
        }
        this.$nextTick(() => {
          this.updateContent();
          this.restoreInfo.changed = true;
          this.recordState(true);
        });
      });
    },
    playSliderItem(index) {
      webCpu.mitt.emit("playSliderItem", index);
    },
    addSliderItem(index, item) {
      // let tArr1 = this.copyObject(this.fragments.splice(0, index + 1));
      // let tArr2 = this.copyObject(this.fragments);
      item = item || {
        content: {
          title: "幻灯片标题",
          list: [
            {
              content: "要点信息",
            },
          ],
        },
      };
      this.fragments.splice(index + 1, 0, item);
      // tArr1.push(item);

      // this.fragments = tArr1.concat(tArr2);
      this.fragments = this.fragments.map((item, i) => {
        item.index = i;
        return item;
      });
      this.$nextTick(() => {
        this.restoreInfo.changed = true;
        this.recordState(true);
        this.updateView(index + 1);
      });
    },
    exportCurrent(callback) {
      let _selector = $(".contentViewerArea .pptAppContent>._label_box");
      _selector.hide();
      _selector = $(".contentViewerArea .exportHiddenItem");
      _selector.hide();
      this.$nextTick(() => {
        this._exportCurrent(() => {
          _selector.css({
            display: "inline-block",
          });
          if (typeof callback === "function") {
            callback();
          }
        });
      });
    },
    _exportCurrent(callback) {
      let option = this.currentCard.exportOption || {};
      let selector =
        option.selector || ".contentViewerArea>.CardItem div._task_container";
      let pdfContainer = $(selector)[0];
      let boxShadowStyle = $(selector).css("boxShadow");
      $(selector).css("boxShadow", "none");
      let div = document.createElement("div");
      this.$refs.rootElement.appendChild(div);
      this.mode = "view";
      $(div).css({
        position: "absolute",
        zIndex: -1000,
        left: -3000,
        display: "block",
        width: this.resolution[0] + "px",
        height: "auto",
      });
      if (pdfContainer) {
        this.$nextTick(() => {
          let cArr = this.replaceSliderCanvas(pdfContainer);
          this.transfromSlider(pdfContainer, (tImg) => {
            $(selector).css("boxShadow", boxShadowStyle);

            div.appendChild(tImg);
            this.recoverSliderCanvas(cArr);
            let tElem = document.createElement("div");
            $(tElem).css({
              float: "left",
              width: "100%",
              height: "auto",
              position: "relative",
            });
            let meta = this.currentApp.meta || {};
            const scanQrTips = (window.WebTool && window.WebTool.sanitizeHtml)
              ? window.WebTool.sanitizeHtml(meta.scanQrTips || webCpu.messages[lang]["scanQrcodeTips"])
              : (meta.scanQrTips || webCpu.messages[lang]["scanQrcodeTips"]);
            tElem.innerHTML = `<div class="hostQrCode">
            <span
              class="tipsArea"
            >
              <span style="display: inline-block; width: 100%">${scanQrTips}</span>
              <span>${webCpu.messages[lang]["bandInfoTips"]} ${
              location.host
            }</span>
            </span>
            <span class="qrCodeCanvas"></span>
          </div>`;
            div.appendChild(tElem);
            let url =
              location.origin +
              location.pathname +
              "?id=" +
              this.documentMeta.id;
            this.initQrCode(div, url);
            let canvas = div.querySelector("canvas");
            let img = document.createElement("img");
            img.src = canvas.toDataURL();
            let pSelector = $(canvas).parent();
            $(canvas).remove();
            img.style.width = "100%";
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
              $(pSelector.children()[0]).remove();
              pSelector.append(canvas);
              div.appendChild(iItem);
              this.mode = "edit";
              let tTemplate = div.innerHTML;
              $(div).remove();
              if (typeof callback === "function") {
                callback();
              }

              let callback1 = function () {
                let vueItem = card.card.task.vueItem;
                vueItem.confirmExportImage();
              };
              let cc = this.fragments[0].content;
              let card = {
                url: "/webApps/document/configExportImage.vue",
                className: "ElementVueItem",
                dsl: {
                  data: {
                    name: this.documentMeta.fileName || cc.title || cc.name,
                    url: url,
                    fragments: this.fragments,
                    resolution: this.resolution,
                    contentTemplate: tTemplate,
                  },
                },
              };
              let tCard = webCpu.cards.documentEditor;
              webCpu.CardItem.renderCardDialog(tCard, card, {
                title: webCpu.messages[lang].exportSlider,
                dialogName: "exportSliderDialog",
                menu: [
                  {
                    label: `<span style="display: inline-block; padding: 0px 10px; font-size: 14px;"><i class="bi bi-download"></i>${webCpu.messages[lang].exportLongImage}</span>`,
                    action: callback1,
                  },
                ],
                titleStyle: {
                  background: "var(--el-color-primary-light-9)",
                  color: "var(--el-color-primary)",
                },
                closeType: "back",
              });
            });
          });
        });
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
    transfromSlider(pdfContainer, callback) {
      html2canvas(pdfContainer, {
        backgroundColor: "none",
        useCORS: "true",
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
    recoverSliderCanvas(arr) {
      for (let i = 0; i < arr.length; i++) {
        $(arr[i].img).remove();
        arr[i].pSelector.append(arr[i].canvas);
      }
    },
    replaceSliderCanvas(pdfContainer) {
      let cArr = $(pdfContainer).find("canvas");
      let tArr = [];
      for (let i = 0; i < cArr.length; i++) {
        let canvas = cArr[i];
        let img = document.createElement("img");

        img.src = canvas.toDataURL();

        let pSelector = $(canvas).parent();
        let item = {
          pSelector: pSelector,
          img: img,
          canvas: canvas,
        };
        tArr.push(item);
        $(canvas).remove();
        img.style.width = "100%";
        pSelector.append(img);
      }
      return tArr;
    },
    initEditor(c) {
      let tSelector = $(c).find(".contentInfoArea h1");
      let pSelector = $(c).find(".listInfoItem");
      if (this.currentApp.name === "cardNotes") {
        tSelector.attr("contentEditable", true);
        pSelector.find(".listItemText").attr("contentEditable", true);
      }

      $(c).find('[contenteditable="true"]').off("paste");
      $(c)
        .find('[contenteditable="true"]')
        .on("paste", function (e) {
          e.preventDefault();
          var text =
            (e.originalEvent || e).clipboardData.getData("text/plain") ||
            prompt("在这里输入文本");
          document.execCommand("insertText", false, text);
        });

      if (this.currentApp.name === "cardNotes") {
        let tContainer = $(c).find(".pptAppContent")[0];
        let myArr = [];
        myArr = [
          {
            class: this.buttonIcon.sliderHandler,
            tips: webCpu.messages[lang].sliderHandlerTips,
            dropType: "dropleft",
            children: [
              { label: webCpu.messages[lang].exportSlider },
              { label: webCpu.messages[lang].setSlider },
            ],
          },
        ];
        this.attachOptionButtons(
          tContainer,
          myArr,
          {
            width: "50px",
            right: "10px",
            top: "10px",
            textAlign: "left",
          },
          { parent: c },
          true
        );
        let d = this.fragments[this.index];
        if (!d && this.fragments[this.index - 1]) {
          this.index--;
          d = this.fragments[this.index];
        } else if (!d && this.fragments[this.index + 1]) {
          this.index++;
          d = this.fragments[this.index];
        }
        if (!d) {
          return false;
        }
        let tContent = d.content;
        tContent.image = tContent.image || [];
        tContent.dsl = tContent.dsl || [];
        myArr = [
          {
            label: webCpu.messages[lang].addImage,
          },
          {
            label: webCpu.messages[lang].addSection,
          },
          {
            label: webCpu.messages[lang].addVideo,
          },
          {
            label: webCpu.messages[lang].addAgent,
          },
        ];
        if (tContent.iframe && tContent.iframe[0]) {
          myArr = [
            {
              label: webCpu.messages[lang].addImage,
            },
            {
              label: webCpu.messages[lang].addSection,
            },
          ];
        }

        tContainer = $(c).find(".contentInfoArea .titleItemArea")[0];
        this.attachOptionButtons(
          tContainer,
          myArr,
          {
            width: "397px",
            marginTop: "0px",
            textAlign: "left",
          },
          { parent: c },
          true
        );

        let iframeArea = $(c).find(".contentInfoArea>.iframeItemArea")[0];
        if (iframeArea) {
          this.attachOptionButtons(
            iframeArea,
            [
              {
                class: this.buttonIcon.trash,
                tips: webCpu.messages[lang].removeTips,
              },
            ],
            {
              width: "80px",
              right: "10px",
              top: "10px",
              textAlign: "left",
            },
            { parent: c },
            true
          );
        }

        iSelector = $(c).find(".imageInfoArea .el-image");
        for (let j = 0; j < iSelector.length; j++) {
          let iElem = iSelector[j];
          let bArr = [
            { label: webCpu.messages[lang].removeBg },
            { label: webCpu.messages[lang].removeTips },
          ];
          tContent._image = tContent._image || [];
          if (tContent._image[j] && tContent._image[j] !== tContent.image[j]) {
            bArr = [
              { label: webCpu.messages[lang].rawImage },
              { label: webCpu.messages[lang].removeTips },
            ];
          }
          this.attachOptionButtons(
            iElem,
            bArr,
            {
              width: "250px",
              marginTop: "0px",
              textAlign: "left",
            },
            { parent: c },
            true
          );
        }

        pSelector = $(c).find(".listInfoItem");
        for (let i = 0; i < pSelector.length; i++) {
          this.attachOptionButtons(
            pSelector[i],
            [
              {
                tips: webCpu.messages[lang].removeTips,
                class: this.buttonIcon.remove,
              },
              {
                tips: webCpu.messages[lang].addTips,
                class: this.buttonIcon.add,
              },
              // {
              //   tips: webCpu.messages[lang].aiGenerateText,
              //   class: this.buttonIcon.aigc,
              // },
            ],
            {
              width: "120px",
              bottom: "0px",
            },
            { parent: pSelector[i].parentNode.parentNode },
            true
          );
        }
      }
      if (this.currentApp.name === "cardNotes") {
        this.initEditorEvent(c);
      }
    },
    initEditorEvent(elem) {
      let _self = this;
      if (this.index < 0) {
        this.index = 0;
      }
      let tContent = this.fragments[this.index].content;
      let tSelector = $(elem).find(".contentInfoArea h1");
      tSelector.on("keyup", function (e) {
        let tNode = this.cloneNode(true);
        let text = tNode.innerHTML;
        tContent.title = text;
        _self.updateView();
        _self.restoreInfo.changed = true;
        _self.recordState();
      });
      let pSelector = $(elem).find(".listItemText");
      if (
        typeof this.sectionIndex === "number" &&
        pSelector.eq(this.sectionIndex)[0]
      ) {
        pSelector.eq(this.sectionIndex)[0].focus();
        pSelector.eq(this.sectionIndex).click();
      } else if (tSelector[0]) {
        tSelector[0].focus();
        tSelector.click();
      }
      pSelector.off("click");
      pSelector.on("click", function (e) {
        let index = this.getAttribute("index");
        _self.sectionIndex = Number(index);
      });
      pSelector.off("keyup");
      pSelector.on("keyup", function (e) {
        let index = this.getAttribute("index");
        if (tContent.list[index]) {
          if (tContent.tList && tContent.tList.length !== 0) {
            let flag = this.getAttribute("flag");
            tContent.tList[index][flag] = this.innerHTML;
            tContent.tList[index].content =
              tContent.tList[index]["key"] +
              ":" +
              tContent.tList[index]["value"];
          } else {
            tContent.list[index].content = this.innerHTML;
          }
          _self.sectionIndex = Number(index);
          _self.freshCrurrentSlider(tContent, true);
        }
      });
      $(elem).find(".dropdown-item").off("click");
      $(elem)
        .find(".dropdown-item")
        .on("click", function () {
          let text = this.innerText;
          if (text === webCpu.messages[lang].exportSlider) {
            _self.exportCurrent();
            // webCpu.mitt.emit("exportSlider", [_self.index]);
          } else if (text === webCpu.messages[lang].setSlider) {
            _self.configSliderItem();
          } else {
          }
        });
      $(elem).find("button").off("click");
      $(elem)
        .find("button")
        .on("click", function () {
          let text = this.getAttribute("title");
          let pNode =
            this.parentNode.parentNode.parentNode.parentNode.parentNode;
          let pSelector = $(pNode);
          let index = Number(pSelector.attr("index"));
          if (pSelector.attr("class") !== "listInfoItem") {
            index = -1;
          }
          //Todo add image
          tContent.list = tContent.list || [];
          let tArr = tContent.list.map((item) => {
            return item.content;
          });
          let context = tContent.title + "; " + tArr.join(";");
          if (
            text === webCpu.messages[lang].removeTips &&
            pNode.className === "listInfoItem"
          ) {
            // 删除段落
            if (index === _self.sectionIndex) {
              _self.sectionIndex = undefined;
            }

            tContent.list.splice(index, 1);
            _self.freshCrurrentSlider(tContent);
          } else if (
            text === webCpu.messages[lang].aiGenerateText &&
            pNode.className === "listInfoItem"
          ) {
            //todo: AI generate text
            _self.aiContinueWriting(index);
          } else if (
            (text === webCpu.messages[lang].addTips &&
              pNode.className === "listInfoItem") ||
            text === webCpu.messages[lang].addSection
          ) {
            // 新增段落
            let item = {
              content: "",
              key: webCpu.messages[lang].defaultNewKey,
              value: webCpu.messages[lang].defaultNewValue,
            };
            item.content = item.key + ":" + item.value;
            if (!tContent.tList || tContent.tList.length === 0) {
              item = {
                content: webCpu.messages[lang].defaultNewText,
              };
            }
            _self.sectionIndex = index + 1;
            if (typeof index !== "number" || index === -1) {
              tContent.list = tContent.list || [];
              tContent.list.unshift(item);
            } else {
              let t1 = tContent.list.slice(0, index + 1);

              let t2 = tContent.list.splice(
                index + 1,
                tContent.list.length - index
              );
              t1.push(item);
              tContent.list = t1.concat(t2);
            }
            _self.freshCrurrentSlider(tContent);
          } else if (text === webCpu.messages[lang].removeBg) {
            if (_self.foreign) {
              _self.removeBg(this, tContent, function () {
                _self.freshCrurrentSlider(tContent);
              });
            } else {
              _self.confirmCostTips(
                webCpu.messages[lang].removeBgDialog,
                1200,
                () => {
                  _self.removeBg(this, tContent, function () {
                    _self.freshCrurrentSlider(tContent);
                    webCpu.mitt.emit("pointsChange");
                  });
                }
              );
            }
          } else if (text === webCpu.messages[lang].rawImage) {
            let pNode =
              this.parentNode.parentNode.parentNode.parentNode.parentNode;
            let imageIndex = $(pNode).index();
            tContent._image = tContent._image || [];
            tContent.image[imageIndex] =
              tContent._image[imageIndex] || tContent.image[imageIndex];
            _self.freshCrurrentSlider(tContent);
          } else if (text === webCpu.messages[lang].addImage) {
            //Todo add Image
            _self.addImageItem(_self.currentCard.task.container, context);
          } else if (text === webCpu.messages[lang].addAgent) {
            //Todo add video
            _self.addAgentItem(_self.currentCard.task.container, context);
          } else if (text === webCpu.messages[lang].addVideo) {
            //Todo add video
            _self.addVideoItem(_self.currentCard.task.container, context);
          } else if (text === webCpu.messages[lang].removeTips) {
            // 删除图片
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
                let pNode =
                  this.parentNode.parentNode.parentNode.parentNode.parentNode;
                if (pNode.className !== "el-image") {
                  tContent.iframe = [];
                } else {
                  let imageIndex = $(pNode).index();
                  tContent.r_image = tContent.r_image || {};
                  tContent._image = tContent._image || {};
                  tContent.image.map((item, i) => {
                    if (i > imageIndex) {
                      tContent.r_image[i - 1] = tContent.r_image[i];
                      tContent._image[i - 1] = tContent._image[i];
                    }
                    return item;
                  });
                  tContent.image.splice(imageIndex, 1);
                  delete tContent.r_image[tContent.image.length];
                  delete tContent._image[tContent.image.length];
                }

                _self.freshCrurrentSlider(tContent);
              });
          } else {
          }
        });
    },
    freshCrurrentSlider(tContent, flag) {
      if (!flag) {
        this.updateContent();
      }
      this.updateView();
      this.restoreInfo.changed = true;
      this.recordState();
    },
    configSliderItem(callback) {
      let app = this.configAppView;
      let d = this.fragments[this.index || 0] || this.fragments[0];
      app.dsl = app.dsl || {};
      app.dsl.data = app.dsl.data || {};
      let tParams = this.currentApp.defaultParams || this.defaultParams;
      app.dsl.data._defaultParams = JSON.parse(JSON.stringify(tParams));
      app.dsl.data.current = d.style || JSON.parse(JSON.stringify(tParams));
      let vApp = this.pptApp;
      if (vApp.card) {
        delete vApp.card;
      }

      if (
        vApp.dsl.data &&
        vApp.dsl.data.content &&
        vApp.dsl.data.content.viewer
      ) {
        delete vApp.dsl.data.content.viewer.card;
      }
      vApp = WebTool.copyObject(vApp);

      this.initAppItem(vApp, d.content || {});

      vApp.dsl.data.mode = "view";

      app.style = app.style || {};
      app.style.padding = "0px 0px";

      app.dsl.data.app = vApp;

      if (typeof callback === "function") {
        callback();
      }

      let _self = this;

      let tCallback1 = function () {
        let value = app.card.task.vueItem.current;
        _self.confirmSetting(value);
      };

      let tCallback2 = function () {
        let value = app.card.task.vueItem.current;
        _self.applyToAll(value);
      };

      webCpu.renderCardDialog(
        document.body,
        app,
        {
          dialogName: "configSliderDialog",
          title: webCpu.messages[lang].setSlider,
          titleStyle: {
            background: "var(--el-color-primary-light-9)",
            color: "var(--el-color-primary)",
          },
          menu: [
            {
              label: `<span style="display:inline-block; padding: 0px 10px; font-size: 14px;">${webCpu.messages[lang].confirmYes}</span>`,
              action: tCallback1,
            },
            {
              label: `<span style="display:inline-block; padding: 0px 10px; font-size: 14px;">${webCpu.messages[lang].confirmAll}</span>`,
              action: tCallback2,
            },
          ],
          closeType: "back",
        },
        {
          backgroundColor: "#fff",
          border: "solid 1px #eee",
        }
      );
    },
    confirmSetting(value) {
      webCpu.CardItem.dismissMask(document.body);
      this.fragments[this.index].style = value;
      this.updateContent();
      this.updateView();
      this.restoreInfo.changed = true;
      webCpu.mitt.emit("contentUpdated", this.fragments);
      this.recordState();
    },
    applyToAll(value) {
      this.$confirm(
        webCpu.messages[lang].confirmApplyAll,
        webCpu.messages[lang].confirmDialogTitle,
        {
          confirmButtonText: webCpu.messages[lang].confirmYes,
          cancelButtonText: webCpu.messages[lang].confirmNo,
          type: "warning",
        }
      ).then(() => {
        webCpu.CardItem.dismissMask(document.body);
        this.fragments = this.fragments.map((item) => {
          item.style = WebTool.copyObject(value);
          return item;
        });
        this.updateContent();
        this.updateView();
        this.restoreInfo.changed = true;
        webCpu.mitt.emit("contentUpdated", this.fragments);
        this.recordState();
      });
    },
    getWritingContext() {
      let str = "";
      for (let i = 0; i < this.fragments.length; i++) {
        let content = this.fragments[i].content;
        if (content.title !== webCpu.messages[lang].mindMap) {
          str += "## " + content.title + "\n";
          let list = content.list;
          for (let j = 0; j < list.length; j++) {
            str += "- " + list[j].content + "\n\n";
          }
        }
      }
      return str;
    },
    aiContinueWriting(index) {
      $(".listInfoItem>._label_box .btn-secondary").attr("disabled", true);
      // node.setAttribute("disabled", true);
      let content = this.fragments[this.index].content;
      content.list[index].key =
        content.list[index].key || content.list[index].content;

      content.list[index].key = content.list[index].key.replace(/[\.。]$/, "");
      let text = content.list[index].key;
      let query = this.interface.generatePptContent.query;
      query.content =
        webCpu.messages[lang].writingPrompts +
        " :  " +
        text +
        ` (${content.title})`;

      query.context = query.context || this.getWritingContext();
      query.appName = this.currentApp.name;

      let _self = this;
      if (!content.list[index].detail) {
        this.adapter.generatePptContent(query, function (tData) {
          $(".listInfoItem>._label_box .btn-secondary").attr("disabled", false);

          if (tData.ret === 0) {
            content.list[index].detail = tData.usage.result;
            _self.displayDetailInfo(index);
          } else {
            _self.$message({
              type: "warning",
              message: webCpu.messages[lang].noRights,
            });
          }
        });
      } else {
        _self.displayDetailInfo(index);
      }
    },
    displayDetailInfo(index) {
      let content = this.fragments[this.index].content;
      let key = content.list[index].key || content.list[index].content;
      let title = content.list[index].content;
      let detail = content.list[index].detail;
      let markdown = `${detail}`;
      let app = {
        className: "MarkdownArticle",
        style: {
          width: 500,
          height: 300,
        },
        dsl: {
          style: {
            padding: "20px 40px",
          },
          data: markdown,
        },
      };
      let _self = this;
      let callback = function () {
        _self.aiContinueWriting(_self.index);
      };
      webCpu.CardItem.renderCardDialog(this.currentCard.task.container, app, {
        title: key,
        closeType: "back",
        titleStyle: {
          background: "var(--el-color-primary-light-9)",
          color: "var(--el-color-primary)",
        },
        menu: [
          {
            label: `<span style="font-size: 14px; display: inline-block; padding: 0px 5px;">${webCpu.messages[lang].fresh}</span>`,
            action: callback,
          },
        ],
      });
    },
    addAgentItem(elem, context, params, style) {
      let app = JSON.parse(JSON.stringify(this.addAgentApp));
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
          title: webCpu.messages[lang].addAgent,
          closeType: "back",
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
        },
      };
      webCpu.renderCardDialog(elem, app, params, style);
    },
    removeBg(btn, tContent, callback) {
      let pNode = btn.parentNode.parentNode.parentNode.parentNode.parentNode;
      let imageIndex = $(pNode).index();
      let base = tContent.image[imageIndex];
      tContent.r_image = tContent.r_image || {};
      let _self = this;
      if (tContent.r_image[imageIndex]) {
        tContent.image[imageIndex] = tContent.r_image[imageIndex];
        _self.updateContent();
        return true;
      }
      let query = {
        apiName: "novitaAi",
        image: base,
        agent: this.currentApp.publishInfo.folderName,
      };
      let from = WebTool.urlQuery(location.href, "from");
      if (from) {
        query.fromAccount = from;
      }

      $(btn).attr("disabled", true);
      $(btn).attr("title", webCpu.messages[lang].removingImageLoading);
      $(btn).html(webCpu.messages[lang].removingImageLoading);
      if (base.split(";").length > 1) {
        query = {
          apiName: "novitaAi",
          image: base.split(";")[1].replace("base64,", ""),
          appName: _self.currentApp.name,
        };
        // let v = JSON.parse(d.publishInfo);
      }
      _self.adapter.removeImageBackground(query, function (tData) {
        if (tData.url) {
          _self.$message({
            type: "success",
            message: webCpu.messages[lang].removingImageSucces,
          });

          tContent._image = tContent._image || {};
          tContent._image[imageIndex] =
            tContent._image[imageIndex] || tContent.image[imageIndex];
          tContent.image[imageIndex] = tData.url;
          tContent.r_image[imageIndex] = tData.url;
          if (typeof callback === "function") {
            callback();
          }
          // webCpu.mitt.emit("pointsChange");
        } else {
          let tips = _self.foreign
            ? webCpu.messages[lang].subscriptionExpiredTips
            : webCpu.messages[lang].notEnoughPoints;
          _self.$message({
            type: "warning",
            message: tips,
          });
          $(btn).attr("disabled", false);
          $(btn).attr("title", webCpu.messages[lang].removeBg);
          $(btn).html(webCpu.messages[lang].removeBg);
          if (_self.foreign) {
            webCpu.mitt.emit("openPriceInfo");
          } else {
            webCpu.mitt.emit("rechargeAccount");
          }
        }
      });
    },
    confirmCostTips(name, value, callback) {
      this.getUserInfo((data) => {
        if (!this.userInfo.vipTimeout) {
          callback(value);
          return false;
        }
        let money = value / 1000;
        if (lang === "en") {
          money *= 14;
        }
        let mag = `${name}${webCpu.messages[lang].costTips} ${value || 0} ${
          webCpu.messages[lang].costTips1
        }  ${money.toFixed(1)} ${webCpu.messages[lang].costTips2} `;

        this.$confirm(mag, webCpu.messages[lang].confirmDialogTitle, {
          confirmButtonText: webCpu.messages[lang].confirmYes,
          cancelButtonText: webCpu.messages[lang].confirmNo,
          type: "warning",
        }).then(() => {
          if (typeof callback === "function") {
            callback(value);
          }
        });
      });
    },
    initAppItem(app, content) {
      app.dsl = app.dsl || {};
      let basicStyle = {
        width: this.resolution[0],
        height: this.resolution[1],
        boxShadow: "none",
      };
      app.dsl.style = app.dsl.style || {};
      webCpu.attachAttribute(basicStyle, app.dsl.style);
      if (this.currentApp.name === "cardNotes") {
        content.list = content.list || [];
      }
      // app.dsl.content = content;
      app.dsl.data = app.dsl.data || {};
      app.dsl.data.content = content;
      app.dsl.data.index = this.index;
      app.dsl.data.context = this.fragments;
      app.dsl.data.isDocumentStatus = this.isDocumentStatus;
      app.dsl.data.documentMeta = this.documentMeta;
      app.dsl.data.aiAdapter = {
        aigcText: this.adapter.generatePptContent,
        aigcImage: this.adapter.aiGenerateImage,
        removeBg: this.adapter.removeImageBackground,
      };
      app.dsl.promise = app.dsl.promise || {};
      app.dsl.methods = app.dsl.methods || {};
      app.dsl.transformRadio = this.transformRadio;
    },
    prepareAppView(c, content, callback) {
      if (typeof callback === "function") {
        callback();
      }
      let selector = $(c).find(".textInfoContainer");
      content.image = content.image || [];
      content.dsl = content.dsl || [];
      content.iframe = content.iframe || [];
      let _self = this;
      _self.$nextTick(() => {
        WebTool.setElemScale(selector.find(".textInfoArea")[0]);
      });

      let tArr = selector.find("p");
      for (let i = 0; i < tArr.length; i++) {
        tArr[i].setAttribute("from", "list");
      }
      if (content.viewer && content.viewer.dsl && !content.dismissViewer) {
        content.viewer.dsl.data = content.viewer.dsl.data || {};
        content.viewer.dsl.data.content = content.viewer.dsl.data.content || {};
        content.viewer.dsl.data.content.list =
          content.viewer.dsl.data.content.list || content.list || [];

        let tElem = selector.find(".textInfoArea")[0];
        webCpu.updateView(tElem, content.viewer, function (cc, dd, tt) {
          if (_self.mode === "edit") {
            _self.initEditor(c);
          }
        });
      } else if (_self.mode === "edit") {
        _self.initEditor(c);
      }
    },
    setAppStyle(app, style) {
      if (!style || typeof style === "string") {
        return false;
      }

      style = JSON.parse(JSON.stringify(style));
      let tParams = this.currentApp.defaultParams || this.defaultParams;
      let params = JSON.parse(JSON.stringify(tParams));
      style = webCpu.attachAttribute(style, params);
      if (typeof style.backgroundImage === "string") {
        if (style.backgroundImage !== "") {
          style.backgroundImage = `url(${style.backgroundImage})`;
        } else {
          style.backgroundImage = "none";
        }
        style.backgroundSize = "auto";
        style.backgroundPosition = "center";
        // style.backgroundColor = "transparent";
      } else {
        style.backgroundImage = "none";
      }

      style.paddingTop += "px";
      style.paddingLeft += "px";
      style.paddingBottom += "px";
      style.paddingRight += "px";
      app.dsl.data.style = style;
    },
    updateContent(spanIndex, callback) {
      this.index = this.index || 0;
      this.spanIndex =
        typeof spanIndex === "number" ? spanIndex : this.spanIndex || -1;
      if (!this.fragments || this.fragments.length === 0) {
        return false;
      }
      this.sectionIndex = -1;
      let _self = this;
      let d = this.fragments[this.index];
      if (!d && this.fragments[this.index - 1]) {
        this.index--;
        d = this.fragments[this.index];
      } else if (!d && this.fragments[this.index + 1]) {
        this.index++;
        d = this.fragments[this.index];
      }
      if (!d) {
        return false;
      }
      d = WebTool.copyObject(d);
      let content = d.content || {};

      let app = this.currentApp;
      app.dsl = app.dsl || {};

      if (app.dsl.data && app.dsl.data.content && app.dsl.data.content.viewer) {
        delete app.dsl.data.content.viewer.card;
      }

      if (!app.card) {
        app = WebTool.copyObject(app);
      }
      
      this.pptApp = app;
      app.dsl = app.dsl || {};
      app.dsl.data = app.dsl.data || {};
      app.dsl.methods = app.dsl.methods || {};
      app.dsl.methods.getContentAuthor = function () {
        this.content = this.content || {};
        this.content.author = this.documentMeta.userName;
        if (this.documentMeta.apiName) {
          this.content.author = `${this.content.author}( ${this.documentMeta.apiName} AI 辅助制作 )`;
        } else {
          this.content.author = `${this.content.author}( AI 辅助制作 )`;
        }
        return this.content.author || "";
      };

      d.style = d.style || {};
      let style = JSON.parse(
        JSON.stringify(
          d.style || this.currentApp.defaultParams || this.defaultParams
        )
      );
      
      this.setAppStyle(app, style);
      app.dsl.data.fullScreenFlag = this.fullScreenFlag;
      delete this.currentApp.card;
      app.dsl.data.currentApp = WebTool.copyObject(this.currentApp);
      this.$nextTick(() => {
        let elem = this.$refs.contentViewerItem;
        this.initAppItem(app, content);
        let currentAppParams = localStorage.currentAppParams;
        localStorage.currentAppParams = "";
        if (currentAppParams) {
          try {
            currentAppParams = JSON.parse(currentAppParams);
            webCpu.attachAttribute(currentAppParams, app);
          } catch (e) {}
        }
        localStorage.editable = this.editable;
        if (this.currentApp.contentApp) {
          app.dsl = app.dsl || {};
          webCpu.attachAttribute(this.currentApp.contentApp.dsl, app.dsl);
        }
        if (_self.currentCard) {
          _self.currentCard.task.methods = _self.currentCard.task.methods || {};
          _self.currentCard.task.methods.getContentAuthor =
            app.dsl.methods.getContentAuthor;

          if(!webCpu[app.className || "ElementVueItem"] || typeof webCpu[app.className || "ElementVueItem"].updateView !== "function"){
            console.error("Component " + (app.className || "ElementVueItem") + " does not exist or does not have updateView method.");
            return;
          }

          webCpu[app.className || "ElementVueItem"].updateView(
            _self.currentCard.task,
            app.dsl.data
          );
          webCpu.currentCard = _self.currentCard;
          _self.prepareAppView(
            _self.currentCard.task.container,
            content,
            callback
          );
        } else {
          delete app.card;
          app.contentApp = app.contentApp || {}
          app.url = app.contentApp.url || app.url || app.contentApp ;


          webCpu.updateView(elem, app, function (c, d, t) {
            _self.currentCard = t.card;
            _self.currentCard.task.methods =
              _self.currentCard.task.methods || {};
            _self.currentCard.task.methods.getContentAuthor =
              app.dsl.methods.getContentAuthor;
            _self.prepareAppView(c, content, callback);
          });
          this.$nextTick(() => {
            webCpu.currentCard = app.card || webCpu.currentCard;
            console.log("From container.vue: ", webCpu.currentCard);
          });
        }
      });
      webCpu.mitt.emit("fragmentIndexChange", this.index);
    },
  },
};
</script>

<style scoped>
.contentContainerArea {
  position: relative;
  height: 100%;
  width: 100%;
  border-top: solid 0px #f5f5f5;
  float: left;
}

.contentContainerArea[fullScreenFlag="true"] {
  border-top: none;
}

.contentContainerArea[fullScreenFlag="true"] .settingsViewArea {
  display: none;
}

.pptOptionsArea {
  position: absolute;
  bottom: 0px;
  left: 0px;
  height: 40px;
  line-height: 40px;
  width: 100%;
}
.pptOptionsContainter {
  position: relative;
  width: 100%;
  height: 100%;
  border-left: solid 1px #f2f2f2;
  border-right: solid 1px #f2f2f2;
  border-top: solid 1px #f2f2f2;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}

.indexItem {
  display: inline-block;
  height: 40px;
  padding: 0px 10px;
  margin-right: 10px;
  float: left;
  line-height: 40px;
  vertical-align: middle;
}

.indexItem .el-dropdown-link {
  padding-left: 10px;
}

.currentTips {
  color: #999;
  margin-right: 10px;
  float: left;
  display: inline-block;
  vertical-align: middle;
  margin-top: -2px;
}

.pptContentContainer blockquote,
.MarkdownArticle blockquote {
  background-color: #f5f2f0;
  border-left: 8px solid #b4d5ff;
  display: block;
  font-size: 40px !important;
  line-height: 1.5;
  margin: 10px 0;
  padding: 10px;
}
.pptContentContainer > .pContentArea {
  padding: 0px 20px;
}

.commonSettingItem {
  display: none;
  vertical-align: middle;
  border-left: solid 1px #f2f2f2;
  text-align: center;
  padding: 0px 5px;
}
.commonSettingItem > .el-button {
  margin-top: -5px;
}

.currentTitle {
  text-indent: 10px;
  display: inline-block;
  vertical-align: middle;
  font-size: 12px;
  max-width: calc(100% - 60px);
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  float: left;
  border-left: solid 1px #f2f2f2;
}

.indexFlagArea {
  display: inline-block;
  vertical-align: middle;
  height: 40px;
  line-height: 45px;
  margin-right: 10px;
  width: 90px;
  text-align: left;
}
.switchBtnArea {
  display: inline-block;
  vertical-align: middle;
  height: 40px;
  line-height: 40px;
  margin-left: -15px;
  margin-right: 5px;
  text-align: left;
}

.switchOptions .switchBtnArea {
  height: 25px;
  line-height: 25px;
  margin-left: 0px;
  margin-right: 0px;
  padding-right: 0px;
}

.switchOptions {
  position: absolute;
  z-index: 10003;
  right: 0px;
  border-bottom: solid 1px rgba(200, 200, 200, 0.7);
  border-left: solid 1px rgba(200, 200, 200, 0.7);
  border-bottom-left-radius: 5px;
  border-top-right-radius: 5px;
  top: 5px;
  padding: 2px 10px 5px 10px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.7);
}

.dragePositionArea {
  position: absolute;
  bottom: -18px;
  width: 100%;
  height: 20px;
}

.dragePositionArea[active="true"] {
  background: red;
}

.optionSwitchArea {
  position: absolute;
  z-index: 10003;
  display: inline-block;
  text-align: center;
  height: 40px;
  width: 40px;
  line-height: 40px;
  right: 15px;
  top: 10px;
  background-color: rgba(255, 255, 255, 0.7);
  border: solid 1px #ddd;
  border-radius: 100%;
}
.switchIconBtn {
  cursor: pointer;
}

.optionSwitchArea:hover .switchIconBtn {
  color: #999;
}

.moduleTips {
  font-size: 12px;
  margin-right: 5px;
  color: #999;
  margin-right: 5px;
}

.currentTipsItem {
  display: inline-block;
  vertical-align: middle;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 200px;
  text-indent: 0px;
}

.layoutContainer {
  position: relative;
  width: 205px;
  aspect-ratio: 16 / 9;
  margin-bottom: 15px;
  border: none;
}

.pptAppContent > ._label_box .btn-group > .btn-group:not(:last-child) > .btn,
.pptAppContent
  > ._label_box
  .btn-group
  > .btn:not(:last-child):not(.dropdown-toggle) {
  border-top-right-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
}

.contentContainerArea[flag="true"] .layoutContainer {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
}

.layoutContainer .buttonOptions {
  display: none;
}

.layoutContainer:hover .buttonOptions {
  display: inline-block;
}

.layoutItem {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  display: inline-block;
  float: left;
  border-radius: 5px;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.contentContainerArea[flag="true"] .contentViewerArea,
.contentContainerArea[flag="true"] .layoutContainer:hover .buttonOptions {
  display: none;
}

.layoutContainer .CardItem_mask {
  border-radius: 5px;
}

.contentContainerArea[flag="true"] .layoutContainer .CardItem_mask {
  background-color: rgba(255, 255, 255, 0.1);
  border: solid 2px transparent;
}

.contentContainerArea[flag="false"] .layoutContainer .CardItem_mask {
  background-color: rgba(255, 255, 255, 0.1);
  border: solid 2px transparent;
}

.contentContainerArea[flag="false"] .layoutContainer .CardItem_mask:hover {
  border: solid 2px rgba(240, 0, 0, 0.3);
}

.contentContainerArea[flag="false"]
  .layoutContainer[active="true"]
  .CardItem_mask {
  border: solid 2px rgba(240, 0, 0, 1);
}

.el-switch {
  --el-switch-on-color: var(--el-color-primary);
  --el-switch-off-color: var(--el-text-color-regular);
}

.switchBtn {
  margin-top: 5px;
  float: left;
}
.contentViewerArea,
.pptContentItem {
  position: relative;
  height: 100%;
  width: 100%;
  float: left;
}

.contentViewerArea[mode="edit"]
  .CardItem[cardname="pptAppCard"]
  .contentInfoArea
  h1 {
  border: dashed 1px rgba(150, 150, 150, 0.7);
}
.contentContainerArea[apptype="single"]
  .contentViewerArea[mode="edit"]
  .contentInfoArea
  h1 {
  border: none !important;
}

.contentInfoArea .titleItemArea > ._label_box {
  top: 100% !important;
  margin-top: -30px;
  margin-left: 0px;
}

.contentInfoArea .titleItemArea:hover > ._label_box > div {
  display: inline-block;
}

.textInfoContainer ._label_box {
  top: 100% !important;
  margin-top: -58px;
  margin-left: 5px;
}

.textInfoContainer .listInfoItem > ._label_box {
  left: 100% !important;
  margin-bottom: 0px;
  transform: scale(0.8);
  transform-origin: -380px 38px;
}

.textInfoContainer dl,
.textInfoContainer ol,
.textInfoContainer ul {
  padding-inline-start: 70px;
}

.textInfoContainer .listInfoItem {
  padding-bottom: 0px;
}

.textInfoContainer .listInfoItem > ._label_box > div,
.contentInfoArea .titleItemArea > ._label_box > div,
.imageInfoArea .el-image > ._label_box > div,
.iframeItemArea ._label_box > div {
  display: none !important;
}

.pptAppContent > ._label_box,
.iframeItemArea ._label_box {
  top: 5px !important;
  right: 45px !important;
  left: auto !important;
}

.contentInfoArea > ._label_box > div {
  display: inline-block;
}

.contentViewerArea[mode="edit"] .textInfoContainer .listInfoItem {
  border: dashed 1px rgba(150, 150, 150, 0.7);
}

.contentViewerArea[mode="edit"] .titleItemArea h1 {
  border: dashed 1px rgba(150, 150, 150, 0.7);
}

.contentViewerArea[mode="edit"]
  .CardItem[cardname="pptAppCard"]
  .textInfoContainer
  .listInfoItem:hover
  .listItemText,
.contentViewerArea[mode="edit"]
  .CardItem[cardname="pptAppCard"]
  .contentInfoArea
  .titleItemArea:hover
  h1 {
  background: rgba(20, 20, 20, 0.1);
}

.contentViewerArea[mode="edit"]
  .CardItem[cardname="pptAppCard"]
  .textInfoContainer
  .listInfoItem
  .listItemText:focus-visible,
.contentViewerArea[mode="edit"]
  .CardItem[cardname="pptAppCard"]
  .contentInfoArea
  .titleItemArea
  h1:focus-visible {
  background: rgba(200, 200, 200, 0.1);
}

.contentViewerArea[mode="edit"]
  .CardItem[cardname="pptAppCard"]
  .contentInfoArea
  .titleItemArea:hover
  h1,
.contentViewerArea[mode="edit"]
  .CardItem[cardname="pptAppCard"]
  .contentInfoArea
  .titleItemArea
  h1:focus-visible {
  border: solid 1px transparent;
  outline: -webkit-focus-ring-color auto 1px;
}

.dropdown-item {
  cursor: pointer;
}

.contentInfoArea .titleItemArea:hover > ._label_box > div,
.textInfoContainer .listInfoItem:hover > ._label_box > div,
.imageInfoArea .el-image:hover > ._label_box > div,
.iframeItemArea:hover ._label_box > div {
  display: inline-block !important;
}

.settingsViewArea {
  position: absolute;
  height: 100%;
  width: 210px;
  left: 5px;
  top: 0px;
  border-right: dashed 1px #ccc;
}
.contentContainerArea[flag="true"] .settingsViewArea {
  border-right: none;
}

.settingsContainerArea {
  width: 100%;
  height: 100%;
  padding-top: 5px;
  overflow: auto;
}

.layoutListArea {
  position: relative;
  height: 100%;
  width: 100%;
  display: inline-block;
  float: left;
  overflow: auto;
}

.contentViewerArea[mode="edit"] .mainContentArea .el-image {
  border: dashed 5px rgba(200, 200, 200, 0.2);
}

.MarkdownArticle .sectionTitleArea {
  width: 100%;
  height: 140px;
  line-height: 140px;
  text-align: center;
  position: relative;
  margin-bottom: 25px;
}

.MarkdownArticle .sectionTitleArea::after {
  content: "";
  display: inline-block;
  width: 60px;
  height: 0px;
  border-bottom: solid 10px #cf6758;
  position: absolute;
  bottom: 0px;
  left: calc(50% - 30px);
}

.keywordSpan {
  display: inline-block;
  border: solid 1px #ddd;
}

.spanItem {
  box-sizing: border-box;
  border-radius: 2px;
  display: inline-block;
  line-height: 1;
  margin: -10px 5px 0px 5px;
  min-width: 60px;
  cursor: pointer;
  text-align: center;
  position: relative;
  vertical-align: middle;
  max-width: 100%;
}

.spanInfoArea:hover,
.selectText:hover {
  border: 1px solid #52c41a;
}

.selectText[commenthighlight="true"] {
  border: 1px solid #ffa39e;
  color: #ff4d4f;
}

.spanItem[type="param"] .selectText {
  border: 1px solid #ffc53d;
}

.spanItem[type="param"] .spanInfoArea {
  border: 1px solid #ffc53d;
  color: #ffc53d;
  background: #fffbe6;
}

.spanInfoArea {
  position: absolute;
  top: -10px;
  left: -10px;
  width: 20px;
  height: 20px;
  font-family: OPPOSans;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  padding: 3px;
  line-height: 1;
  display: inline-block;
  text-align: center;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  box-sizing: border-box;
  border-radius: 100%;
  user-select: none;
  color: #1890ff;
}

.contentViewerArea[mode="view"] .spanItem,
.contentViewerArea[mode="edit"][effectSwitch="false"] .spanItem,
.contentViewerArea[mode="view"] .selectText,
.contentViewerArea[mode="edit"][effectSwitch="false"] .selectText {
  border: none;
}

.contentViewerArea[mode="edit"] .textInfoArea[contenteditable="true"] {
  border: dashed 1px rgba(0, 0, 0, 0.2);
}

/* .contentViewerArea[mode="edit"] .textInfoContainer:hover {
  border: solid 1px rgba(0, 0, 0, 0.2);
} */

.contentViewerArea[mode="view"] .spanInfoArea,
.contentViewerArea[mode="edit"][effectSwitch="false"] .spanInfoArea {
  display: none !important;
}

.spanItem .opSpanInfoArea i:nth-child(2) {
  margin: 0px 5px !important;
}

.opSpanInfoArea i:hover {
  color: #1890ff !important;
}

.spanInfoArea[active="true"] .opSpanInfoArea {
  display: inline-block;
}

.spanInfoArea[active="true"] .opSpanInfoArea svg {
  width: 20px;
  height: 20px;
  display: inline-block;
  vertical-align: middle;
}

.spanInfoArea > .spanText {
  width: 20px;
  height: 20px;
  border-radius: 100%;
  display: inline-block;
  cursor: pointer;
  margin-top: -1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.buttonOptions {
  position: absolute;
  left: 50%;
  margin-left: -60px;
  width: 300px;
  display: inline-block;
  bottom: -7px;
  z-index: 999;
  transform: scale(0.4);
  transform-origin: 0px 100%;
}

.buttonOptions .btn {
  width: 90px;
}

.buttonOptions .btn:nth-child(2) {
  margin: 0px 15px;
}

.opSpanInfoArea {
  position: absolute;
  display: none;
  background: rgba(34, 38, 44, 0.45);
  box-sizing: border-box;
  backdrop-filter: blur(8px);
  border-radius: 2px;
  color: #fff;
  left: calc(100% + 6px);
  top: -1px;
  width: 65px;
  z-index: 555;
  padding: 5px;
  line-height: 1;
  height: auto;
  user-select: none;
  white-space: nowrap;
}

.selectText {
  border: 1px solid #91d5ff;
  /* background: #e6f7ff; */
  box-sizing: border-box;
  border-radius: 2px;
  display: inline-block;
  line-height: 1;
  min-width: 60px;
  cursor: pointer;
  padding: 5px;
  max-width: 100%;
  text-align: center;
  user-select: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.MarkdownArticle .pptContentItem > p:has(img) {
  text-align: center;
  padding: 10px 0px;
}

.pptContentItem {
  overflow: auto;
}
</style>