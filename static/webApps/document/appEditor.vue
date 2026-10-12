<template>
  <div ref="appContainerArea" :style="{ padding: isSolo || content.isSolo ? '0px' : ''}" class="tw-w-full tw-h-full tw-pt-10 appContainerArea tw-relative tw-animate-fadeIn">
    <el-card :style="paddingStyle" class="tw-w-full tw-h-full tw-shadow-lg tw-rounded-xl tw-border-0 tw-transform tw-transition-transform tw-duration-500">
      <div ref="appContentItem" class="tw-w-full tw-h-full">
        ...
      </div>
    </el-card>

    <!-- 毛玻璃高亮层：仅在编辑模式 + 有 hover 时显示 -->
    <div v-if="editMode && highlightRect" :type="highlightRect.type" class="editor-highlight" :style="{
    left: highlightRect.x + 'px',
    top: highlightRect.y + 'px',
    width: highlightRect.width + 'px',
    height: highlightRect.height + 'px'
  }">
      <span style="float: right; margin-right: 40px; font-size: 12px; color: #999;" v-if="highlightRect && highlightRect.type==='dialog' && highlightRect.cfg.id">{{highlightRect.cfg.id}}</span>
      <div v-if="editMode && highlightRect && (highlightRect.type==='appItem' || highlightRect.type==='dialog')" class="editor-delete-btn-layer" @click.stop="handleDeleteClick">
        ✕
      </div>
    </div>

    <slot v-if="!isSolo && !content.isSolo">
      <div class="componentInfoArea tw-absolute tw-left-4 tw-top-4 tw-text-gray-500 tw-text-sm tw-font-medium tw-transition-opacity tw-duration-300">
        <span v-if="editable && editable !== 'false'" class="settingPopoverItem publishStatusArea tw-align-middle tw-leading-none">
          <el-dropdown v-if="!inIframe" class="opOptionItem tw-align-middle tw-leading-none" trigger="click" :persistent="true" :teleported="false" append-to="parent" style="margin-left: 5px; display: inline-block;">
            <span class="el-dropdown-link">
              <el-button text size="small">
                <el-icon>
                  <el-icon>
                    <memo />
                  </el-icon>
                </el-icon>
              </el-button>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="saveContent('saveContent', true)">
                  <el-icon>
                    <document-copy />
                  </el-icon>{{ "复制" }}
                </el-dropdown-item>
                <el-dropdown-item @click="downloadApp()">
                  <el-icon>
                    <download />
                  </el-icon>{{ "下载" }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-dropdown class="moreOptionItem tw-align-middle tw-leading-none" trigger="click" :persistent="true" :teleported="false" append-to="parent" style="margin-left: 5px; display: inline-block;">
            <span class="el-dropdown-link">
              <el-button text size="small">
                <el-icon>
                  <edit />
                </el-icon>
              </el-button>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="openConfigDialog()">{{ $t("selectModel") }}</el-dropdown-item>
                <el-dropdown-item @click="openPromptEditor()">{{ $t("editPrompt") }}</el-dropdown-item>
                <el-dropdown-item @click="editContentCode()">{{ $t("editResultApp") }}</el-dropdown-item>
                <el-dropdown-item v-if="isPartner" @click="openKnowledgesDialog()">📚 添加可选知识库</el-dropdown-item>
                <el-dropdown-item v-if="isPartner" @click="editLoadingCode()">{{ $t("editLoadingApp") }}</el-dropdown-item>
                <el-dropdown-item v-if="isPartner" @click="openCodeEditor()">{{ $t("editCode") }}</el-dropdown-item>

              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <span v-if="!inIframe" class="tw-align-middle tw-leading-none" style="margin-left: 10px; display: inline-block;">

            <el-popover placement="bottom-start" :width="300" :teleported="false" append-to="parent" trigger="click">
              <template #reference>
                <el-button size="small" text type="primary">
                  <el-icon>
                    <setting />
                  </el-icon>
                </el-button>
              </template>
              <template #default>
                <div style="width: 100%">
                  <div class="settingItem">
                    <span class="settingSpan">{{ "创意版权稅" }}:</span>
                    <el-input-number :min="0" :max="1" :step="0.1" v-model="currentSettings.taxRate" @change="handleTaxChange" placeholder="请输入创意版权税率" size="small" class="settingEditor">
                    </el-input-number>
                  </div>
                  <div class="settingItem">
                    <span class="settingSpan">{{ $t("publishStatus") }}:</span>
                    <span class="settingEditor">
                      <span class="publishTimeSpan" v-if="
                        currentSettings.publishStatus &&
                        currentSettings.publishTime
                      ">
                        {{ new Date(currentSettings.publishTime).toLocaleString() }}
                      </span>
                      <el-switch style="margin-right: -4px" v-model="currentSettings.publishStatus" @change="handlePublishStatusChange"></el-switch>
                    </span>
                  </div>
                  <div class="settingItem">
                    <span class="settingSpan">应用截图:</span>
                    <div class="settingEditor">
                      <div class="buttonList">
                        <el-button style="width: 80px; float: left;" size="small" @click="updateAppImage()">更新截图</el-button>
                        <el-button style="width: 80px; float: right;" size="small" @click="triggerFileInput()">本地图片</el-button>
                      </div>
                      <div class="appImage">
                        <el-image :preview-src-list="[currentSettings.appImage]" fit="contain" :src="currentSettings.appImage"></el-image>
                      </div>
                    </div>
                  </div>

                  <div class="settingItem">
                    <span class="settingSpan">应用名称:</span>
                    <span class="ellipsis titleSpan settingEditor" :contenteditable="true" :title="content.title" v-html="sanitizeHtml(content.title)" @blur="handleTitleChange"></span>
                  </div>

                  <div class="settingItem">
                    <span class="settingSpan">功能介绍:</span>
                    <span style="line-height: 1.5;" class="titleSpan settingEditor" :contenteditable="true" :title="content.introduce" v-html="sanitizeHtml(content.introduce)" @blur="handleIntroduceChange"></span>
                  </div>

                  <div class="settingItem">
                    <span class="settingSpan">应用图标:</span>
                    <span class="ellipsis titleSpan settingEditor" :contenteditable="true" :title="content.icon" v-html="sanitizeHtml(content.icon)" @blur="handleIconChange"></span>
                  </div>

                  <div class="settingItem">
                    <span class="settingSpan">标签列表:</span>
                    <span class="titleSpan settingEditor" :contenteditable="true" :title="(content.tags || []).join(',')" v-html="sanitizeHtml((content.tags || []).join(','))" @blur="handleTagsChange"></span>
                  </div>

                  <div class="settingItem">
                    <span class="settingSpan">适用群体:</span>
                    <el-select multiple collapse-tags collapse-tags-tooltip allow-create :teleported="false" filterable size="small" @change="handleGradesChange" v-model="content.grades">
                      <el-option v-for="item in gradeOptions" :label="item" :key="item" :value="item">{{item}}</el-option>
                    </el-select>
                  </div>

                  <div class="settingItem">
                    <span class="settingSpan">应用类型:</span>
                    <el-select size="small" :teleported="false" @change="handleTypeChange" v-model="content.type">
                      <el-option v-for="item in typeOptions" :label="item" :key="item" :value="item">{{item}}</el-option>
                    </el-select>
                  </div>

                  <div class="settingItem">
                    <span class="settingSpan">所属科目:</span>
                    <span class="ellipsis titleSpan settingEditor" :contenteditable="true" :title="content.category" v-html="sanitizeHtml(content.category)" @blur="handleCategoryChange"></span>
                  </div>

                  <div class="settingItem">
                    <span class="settingSpan">创作者:</span>
                    <span class="ellipsis titleSpan settingEditor" :contenteditable="true" :title="content.title" v-html="sanitizeHtml(currentSettings.creator)" @blur="handleAuthorChange"></span>
                  </div>
                </div>
              </template>
            </el-popover>
          </span>
        </span>
        <span v-else-if="!inIframe && !flag" class="titleItemArea tw-pl-3 tw-pr-2 tw-align-middle tw-leading-none">
          {{
            appTips
          }}
        </span>
        <span class="entryNextAgent tw-align-middle tw-leading-none" style="margin-left: 10px; display: inline-block;">
          <span @click="openCurrentPage()" v-if="inIframe" class="tw-pr-2 tw-align-middle tw-cursor-pointer">{{ content.title }}

          </span>
          <el-input clearable v-model="currentIdInput" size="small" :style="{ width: flag ? '200px': '320px'}" :placeholder="flag ? '输入 Agent ID' : '输入 Skill ID'">
            <template #prepend>
              <el-icon>
                <arrow-right-bold />
              </el-icon>
            </template>
            <template #append>
              <el-button size="small" icon="Link" @click="entryNextAgent()">

              </el-button>
            </template>
          </el-input>
        </span>
      </div>
      <div v-if="!inIframe" class="buttonOptionArea tw-absolute tw-right-4 tw-top-2 tw-flex tw-gap-2 tw-pr-3">
        <el-button slot="reference" size="small" @click="backHome()" text type="primary">
          新建 AI Skill <i class="bi bi-chevron-right"></i>
        </el-button>
      </div>
    </slot>
    <input ref="hiddenFileInput" type="file" accept="image/*" class="tw-hidden" @change="onFileSelected($event)" data-edit-id="109" />
    <el-dialog v-model="configDialog.visible" class="custom-dragging-style" :title="configDialog.title" width="400">
      <el-form :label-width="configDialog.formData.labelWidth" label-position="left" :model="configDialog.value">
        <el-form-item :label="configDialog.formData.data[0].label">
          <el-select size="small" @change="handleChangeConfig(configDialog.formData.data[0])" :placeholder="configDialog.formData.data[0].placeholder" v-model="configDialog.value[configDialog.formData.data[0].prop]">
            <el-option :key="d.label" v-for="d in configDialog.formData.apiNameOptions || []" :value="d.value" :label="d.label" clearable>{{d.label}}
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="configDialog.value.apiName === 'custom'" :label="configDialog.formData.data[1].label">
          <el-input size="small" placeholder="输入 API 的 URL" v-model="configDialog.value[configDialog.formData.data[1].prop]" clearable></el-input>
        </el-form-item>
        <el-form-item :label="configDialog.formData.data[2].label">
          <el-select size="small" v-if="configDialog.value.apiName !== 'custom'" @change="handleChangeConfig(configDialog.formData.data[2])" :placeholder="configDialog.formData.data[2].placeholder" v-model="configDialog.value[configDialog.formData.data[2].prop]" clearable>
            <el-option :key="d.value" v-for="d in configDialog.formData.modelMap[configDialog.value.apiName] || []" :value="d.value" :label="d.label">{{d.label}}
            </el-option>
          </el-select>
          <el-input size="small" v-else placeholder="输入模型参数名称" v-model="configDialog.value[configDialog.formData.data[2].prop]" clearable></el-input>
        </el-form-item>
        <el-form-item v-if="configDialog.value.apiName === 'custom'" :label="configDialog.formData.data[3].label">
          <el-input size="small" type="password" :placeholder="configDialog.formData.data[3].placeholder" v-model="configDialog.value[configDialog.formData.data[3].prop]" clearable></el-input>
        </el-form-item>
        <el-form-item label="价格(输入)">
          <span v-if="configDialog.value.apiName !== 'custom'">
            {{currentPrice.in || "[需联系创作者]"}}
          </span>
          <el-input-number style="margin-right: 5px;" :min="1000" size="small" v-else v-model="configDialog.value.inputPrice"></el-input-number>
          (积分 / 百万 tokens)
        </el-form-item>
        <el-form-item label="价格(输出)">
          <span v-if="configDialog.value.apiName !== 'custom'">
            {{currentPrice.out || "[需联系创作者]"}}
          </span>
          <el-input-number :min="1000" style="margin-right: 5px;" size="small" v-else v-model="configDialog.value.outputPrice"></el-input-number>
          (积分 / 百万 tokens)
        </el-form-item>
        <el-form-item label="佣金比例">
          {{ taxRate.base }} (创作者: {{ taxRate.author }}, 平台: {{ taxRate.platform }})
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="configDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="confirmSelected()">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="knowledgesDialog.visible" :title="knowledgesDialog.title" width="600" class="custom-dragging-style">
      <div class="knowledges-dialog-body">
        <div v-for="(kb, index) in content.knowledges" :key="index" class="knowledge-item">
          <div class="knowledge-item-header">
            <span class="knowledge-item-title">知识库 {{ index + 1 }}</span>
            <el-button type="danger" text size="small" @click="removeKnowledge(index)">删除</el-button>
          </div>
          <el-form label-width="70px" label-position="left" :model="kb">
            <el-form-item label="名称">
              <el-input v-model.trim="kb.name" size="small" placeholder="知识库名称" clearable></el-input>
            </el-form-item>
            <el-form-item label="ID">
              <el-input v-model.trim="kb.id" size="small" placeholder="知识库 ID" clearable>
                <template #append>
                  <el-button size="small" icon="Link" @click="openKnowledgeIndex(kb)">索引</el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="描述">
              <el-input v-model="kb.description" size="small" type="textarea" :rows="2" placeholder="知识库描述（选填）" clearable></el-input>
            </el-form-item>
          </el-form>
        </div>
        <el-button type="primary" plain size="small" class="add-knowledge-btn" @click="addKnowledge">+ 添加知识库</el-button>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="knowledgesDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="confirmKnowledges">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        // 模式 & 高亮相关
        editMode: false, // false = 使用模式，true = 编辑模式
        highlightRect: null, // { x, y, width, height }
        lastHoveredEl: null,
        currentIdInput: "",
        typeOptions: ["创作生成类", "创意写作类", "营销推广类", "学习辅导类", "社交互动类", "其他"],
        gradeOptions: ["小学", "初中", "高中", "大学", "职场", "其他"],
        runtimeTemplate: "", // 实际拿去给 webCpu 渲染的模板（带 data-edit-id）
        nodeCounter: 0, // 自增 id
        nodeMap: {}, // 可选：后面要做 AST 可用
        isDownloading: false,
        defaultModel: "Kimi-K2-Instruct",
        defaultPlatform: "白山云",
        knowledgesDialog: {
          visible: false,
          title: "配置可选知识库",
          data: [{
            id: "",
            name: "",
            description: ""
          }]
        },
        configDialog: {
          visible: false,
          editMode: false,
          value: {
            apiName: "",
            model: ""
          },
          title: "配置 AI 算力",
          formData: {
            labelWidth: 100,
            taxRateMap: {
              "白山云": 0.1,
              "modelRouter": 0.1
            },
            priceMap: {},
            modelMap: {
              "国外": [],
              "国内": []
            },
            apiNameOptions: [{
              label: "国外(默认)",
              value: "国外"
            }, {
              label: "国内(默认)",
              value: "国内"
            }, {
              label: "自定义",
              value: "custom"
            }],
            data: [{
              label: "算力供应商",
              prop: "apiName",
              placeholder: "选择一个平台"
            }, {
              label: "API URL",
              prop: "url",
              placeholder: "请输入 API 的 URL"
            }, {
              label: "模型名称",
              prop: "model",
              placeholder: "选择一个模型"
            }, {
              label: "API Key",
              prop: "apiKey",
              placeholder: "请输入 API Key"
            }]
          },
        },
        content: {
          title: "我的应用",
          description: "功能描述",
          code: "<div><div>测试1</div><div>测试2</div></div>",
          apiName: ""
        },
        flag: WebTool.adjustSize([false, false, true]),
        documentMeta: {},
        currentSettings: {
          publishStatus: false,
        },
        priceOptions: [0, 1000, 2000, 5000, 10000, 20000],
        isPartner: false,
        isPreviewing: false,
        isSolo: WebTool.urlQuery(location.href, 'solo'),
        isLogined: localStorage.folderName,
        inIframe: window.parent !== window,
        appItem: {
          className: "ElementVueItem",
          task: {
            template: "",
            data: {
              accountData: null
            },
            style: {
              width: "100%",
              height: "100%",
              overflow: "auto"
            },
          },
        },
        interface: {
          setDocumentAttribute: {
            url: "/user/setDocumentStatus",
            method: "post",
            dataType: "json",
          },
        },
        changeDescription: "",
        isCopying: false,
        loading: false
      };
    },
    mounted() {
      // 组件挂载后初始化逻辑
      this.init();
      this.adapter = webCpu.initAdapter(this.interface);
      if (aigcInterface && aigcInterface.interface && aigcInterface.interface.aigcGateway) {
        this.defaultModel = aigcInterface.interface.aigcGateway.query.model;
        this.defaultPlatform = aigcInterface.interface.aigcGateway.query.apiName;
        aigcInterface.updateModelList((tData) => {
          this.configDialog.formData.priceMap = tData.priceMap || this.configDialog.formData.priceMap;
          this.configDialog.formData.modelMap = tData.modelMap || this.configDialog.formData.modelMap;
        });
      }
      webCpu.mitt.on("persona-prompt", (d) => {
        this.openPromptEditor();
      });

      webCpu.mitt.on("knowledge-base", (d) => {
        this.openKnowledgesDialog();
      });
      // 支持极简工作流
      this.setupWorkflow();
    },
    computed: {
      taxRate() {
        math.config({
          number: 'BigNumber',
          precision: 20 // 根据业务调整精度
        })
        let rate = this.currentSettings.taxRate || 0.1;
        return {
          base: rate,
          author: math.evaluate(`0.7 * ${rate}`),
          platform: math.evaluate(`0.3 * ${rate}`)
        }
      },
      appTips() {
        this.currentSettings = this.currentSettings || {};
        let tips = `${this.content.title}（创作者: ${ this.currentSettings.creator || '匿名' }）`;
        return tips;
      },
      currentPrice() {
        let tPrice = this.configDialog.formData.priceMap[this.configDialog.value.model || this.defaultModel] || {};
        return tPrice;
      },
      isSingleAgent() {
        let ret = false;
        let code = this.content.code;
        try {
          let dsl = webCpu.getDslData(code);
          if (dsl && typeof dsl.methods.handleGenerate === "function") {
            ret = true;
          }
        } catch (e) {}
        return ret;
      },
      paddingStyle() {
        let ret = {
          paddingTop: '0px',
          paddingLeft: '0px',
          paddingRight: '0px',
          paddingBottom: '0px'
        };
        if (this.isSolo || this.content.isSolo) {
          ret.paddingTop = "0px";
          ret.paddingLeft = "0px";
          ret.paddingRight = "0px";
          ret.paddingBottom = "0px";
        }
        return ret;
      },
      editable() {
        let ret = false;
        ret = localStorage.editable && localStorage.editable !== 'false';
        if (!ret && this.documentMeta) {
          ret =
            localStorage.folderName &&
            this.documentMeta.folderName === localStorage.folderName;
        }
        return ret;
      },
    },
    watch: {
      // 切回使用模式时，清除高亮
      editMode(val) {
        const appArea = this.$refs.appContainerArea;
        if (!val) {
          this.highlightRect = null;
          this.lastHoveredEl = null;
          $(appArea).find("[data-has-dialog=true]").attr("dialogDisabled", "");
        } else {
          $(appArea).find("[data-has-dialog=true]").attr("dialogDisabled", true);
        }
      }
    },
    methods: {
      sanitizeHtml(html) {
        return window.WebTool && typeof window.WebTool.sanitizeHtml === "function"
          ? window.WebTool.sanitizeHtml(html)
          : html;
      },
      entryResultItem(documentId, dataId, from) {
        let params = WebTool.urlQuery(location.href);
        if (params.id === documentId && params.dataId === dataId) {
          return false;
        }
        let url = webCpu.documentPrefix;
        params.id = documentId;
        params.dataId = dataId;
        params.auto = from === "timer";
        delete params.inputItem;
        url = WebTool.attachParams(url, params);
        location.href = url;
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'IFRAME_URL_CHANGE',
            url: url
          }, '*');
        }
      },
      entryNextAgent(from) {
        let arr = webCpu.currentVueItem.versionList || [];
        let i = webCpu.currentVueItem.currentVersionIndex || 0;
        let id = (arr[i] || {})._id;
        let agentId = this.currentIdInput || webCpu.appConfig.defaultAgentId;
        console.log("this.currentIdInput", this.currentIdInput);
        let params = WebTool.urlQuery(location.href);
        let url = `https://transweb.cn/`;
        params.id = agentId;
        if (id) {
          let w = params.workflow;
          if (w) {
            params.auto = true;
            if (!this.currentIdInput) {
              //最后的节点
              this.entryResultItem(arr[i].documentId, id, from);
            } else {
              params.inputItem = id;
              url = WebTool.attachParams(url, params);
              if (window.parent !== window) {
                window.parent.postMessage({
                  type: 'IFRAME_URL_CHANGE',
                  url: url
                }, '*');
              }
              //location.href = url;
            }
          } else {
            params = {
              auto: true,
              inputItem: id,
              id: agentId
            }
            url = WebTool.attachParams(url, params);
            window.open(url, "blank");
          }

        } else {
          this.$confirm(
            "当前 Agent 未成功生成内容，就直接跳转吗？",
            webCpu.messages[lang].confirmDialogTitle, {
              confirmButtonText: webCpu.messages[lang].confirmYes,
              cancelButtonText: webCpu.messages[lang].confirmNo,
              type: "warning",
            }
          ).then(() => {
            delete params.inputItem;
            delete params.dataItem;
            url = WebTool.attachParams(url, params);
            location.href = url;
          });
        }
      },
      openCurrentPage() {
        let url = location.origin;
        let params = WebTool.urlQuery(location.href);
        delete params.workflow;
        delete params.headerHidden;
        delete params.solo;
        url = WebTool.attachParams(url, params);
        window.open(url, "blank");
      },
      watchTaskResult: function() {
        this.isWatching = true;
        webCpu.mitt.on("accountDataModified", (value) => {
          console.log("accountDataModified: ", value);
          if (!this.isWatching) {
            return false;
          }

          let i = webCpu.currentVueItem.currentVersionIndex || 0;
          let id = WebTool.urlQuery(location.href, "id");
          let dataId = WebTool.urlQuery(location.href, "dataId");
          let w = WebTool.urlQuery(location.href, "workflow") || "";
          w = w.split(',') || [];

          if (!(w.indexOf(id) === w.length - 1 && dataId)) {
            this.entryNextAgent("timer");
          } else {
            console.log("当前已显示工作流最后一步的结果页...");
          }
          this.isWatching = false;

        });
      },
      setupWorkflow: function() {
        let w = WebTool.urlQuery(location.href, "workflow");
        let dataId = WebTool.urlQuery(location.href, "dataId");
        if (!w) {
          return false;
        }
        let arr = [];
        try {
          arr = JSON.parse(w);
        } catch (e) {
          arr = w.split(",");
        }
        let id = this.documentMeta.documentId || WebTool.urlQuery(location.href, "id");
        let index = arr.indexOf(id);
        this.currentIdInput = arr[index + 1] || "";
        if (!dataId) {
          this.watchTaskResult();
        }
        webCpu.mitt.on("accountDataModified", (value) => {
          if (!this.isWatching) {
            aigcInterface.getResultByVersion(value, item => {
              if (item && item._id && item._id !== dataId) {
                this.entryResultItem(item.documentId, item._id, "mitt")
              }
            })
          }
        });
      },
      triggerFileInput: function(e) {
        e = e || window.event;
        e.stopPropagation();
        e.preventDefault();
        this.$refs.hiddenFileInput.click();
      },
      setAppImage(newBase64) {
        this.setDocumentAttribute({
            key: "image",
            value: newBase64,
          },
          (rData) => {
            this.currentSettings.appImage = newBase64;
            this.$message({
              type: "success",
              message: "应用截图已上传成功！",
            });
          });
      },
      onFileSelected(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
          let image = e.target.result;
          if (image.length > 100 * 1024) {
            WebTool.compressAndResizeBase64(
              image,
              400,
              400,
              1
            ).then((base64) => {
              this.setAppImage(base64);
            });
          } else {
            this.setAppImage(image);
          }
        };
        reader.readAsDataURL(file);
      },
      downloadApp() {
        let documentId = WebTool.urlQuery(location.href, "id");
        this.isDownloading = true;
        WebTool.downloadApp(documentId, () => {
          this.isDownloading = false;
        });
      },
      openPromptEditor(mdString, card) {
        let id = this.documentMeta.documentId || WebTool.urlQuery(location.href, "id");
        aigcInterface.getAgentPrompt(id).then(prompt => {
          prompt = !prompt || prompt === "-" ?  "# role \n 待定":prompt;
          this._openPromptEditor(prompt, card);
        });
      },
      _openPromptEditor(mdString, card) {
        let json = WebTool.markdownToObject(mdString);
        aigcInterface.renderAgentApp(webCpu.appConfig.promptEditor, json, {
          title: this.$t("editPrompt"),
          type: "dialog",
          callback: (tData) => {
            webCpu.currentPrompt = WebTool.objectToMarkdown(tData);
            webCpu.CardItem.dismissMask(document.body);
            this.setDocumentAttribute({
                key: "prompt",
                value: webCpu.currentPrompt
              },
              (tData) => {
                if (tData.ret === 0) {
                  this.$message({
                    type: "success",
                    message: "提示词修改成功。",
                  });
									location.reload();
                }
              }
            );
          }
        });
      },
      init() {
        // 初始化方法，未来可扩展
        try {
          this.updateAppItem();
        } catch (e) {
          this.changeDescription = "请修复异常: " + e;
        }
        let userInfo = JSON.parse(localStorage.userInfo || "{}");

        if (userInfo.role && userInfo.role.indexOf("partner") !== -1) {
          this.isPartner = true;
        } else {
          this.isPartner = false;
        }
        this.currentSettings = JSON.parse(localStorage.currentSettings || '{}');
      },
      updateAppItem(flag) {
        let elem = this.$refs.appContentItem;
        let app = JSON.parse(JSON.stringify(this.appItem));
        if (!flag) {
          const {
            template,
            nodeMap
          } = this.instrumentTemplate(this.content.code);
          this.runtimeTemplate = template;
          this.content.code = template;
          this.nodeMap = nodeMap;
        }
        app.task.template = this.content.code;
        app.task.data.accountData = this.accountData || {};
        app.task.data.content = app.task.data.content || {};
        app.task.data.content.isSolo = this.content.isSolo;
        webCpu.updateView(elem, app, (c, d, t) => {
          console.log("webCpu.currentCard: ", webCpu.currentCard);
          webCpu.currentVueItem = app.task.vueItem;
        });
        this.currentItem = app;
      },
      updateAppImage() {
        let elem = $(this.$refs.appContainerArea).find(
          ".el-card>.el-card__body"
        )[0];
        WebTool.transformImage(elem, "appImage", "jpg", {}, (img) => {
          WebTool.compressAndResizeBase64(img.src, 1000, 1000, 1).then(
            (newBase64) => {
              console.log(
                "压缩后Base64大小(KB):",
                Math.round(newBase64.length / 1024)
              );
              this.setAppImage(newBase64);
            }
          );
        });
      },
      downloadAppImage() {
        let elem = $(this.$refs.appContainerArea).find(
          ".el-card>.el-card__body"
        )[0];
        WebTool.transformImage(elem, "appImage", "jpg", {
          download: true
        });
      },
      setDocumentAttribute(attr, callback) {
        attr = attr || {};
        attr.table = "pptItem";
        attr.cKey = "documentId";
        attr.documentId = WebTool.urlQuery(location.href, "id") || attr.documentId || this.documentMeta.documentId;
        let _self = this;
        this.adapter.setDocumentAttribute(attr, function(tData) {
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
      instrumentTemplate(raw) {
        const len = raw.length;
        let i = 0;
        let templateCount = 0; // 记录遇到了第几个顶层 template
        let isInTemplate = false; // 当前是否在第一个 template 内部

        // 1. 预扫描已有 ID 逻辑保持不变
        let maxId = 0;
        raw.replace(/data-edit-id\s*=\s*"(\d+)"/g, (_, n) => {
          const v = parseInt(n, 10);
          if (!isNaN(v) && v > maxId) maxId = v;
        });
        let id = maxId + 1;

        const nodeMap = {};
        const out = [];

        function buildTag({
          tagName,
          rawAttrs = "",
          selfClose = false,
          editId = null
        }) {
          let attrs = rawAttrs.trim();
          if (attrs) {
            attrs = attrs.startsWith(" ") ? attrs : " " + attrs;
          }
          // 仅在明确传入 editId 时添加属性
          if (editId != null && !/data-edit-id\s*=/.test(attrs)) {
            attrs += ` data-edit-id="${editId}"`;
          }
          return `<${tagName}${attrs}${selfClose ? " /" : ""}>`;
        }

        while (i < len) {
          const ch = raw[i];

          if (ch !== "<") {
            out.push(ch);
            i++;
            continue;
          }

          // --- 处理闭合标签 </xxx> ---
          if (raw[i + 1] === "/") {
            let j = i + 2;
            const nameStart = j;
            while (j < len && /[A-Za-z0-9\-_]/.test(raw[j])) j++;
            const tagName = raw.slice(nameStart, j).toLowerCase();
            while (j < len && raw[j] !== ">") j++;

            if (tagName === "template" && templateCount === 1) {
              isInTemplate = false; // 退出第一个 template 块
            }

            out.push(raw.slice(i, j + 1));
            i = j + 1;
            continue;
          }

          // --- 处理注释 ---
          if (raw.startsWith("!--", i + 1)) {
            const end = raw.indexOf("-->", i + 3);
            const move = end !== -1 ? end + 3 : i + 1;
            out.push(raw.slice(i, move));
            i = move;
            continue;
          }

          // --- 处理起始标签 <xxx ---
          let j = i + 1;
          while (j < len && /\s/.test(raw[j])) j++;
          const nameStart = j;
          while (j < len && /[A-Za-z0-9\-_]/.test(raw[j])) j++;
          const tagName = raw.slice(nameStart, j);
          const lowerName = tagName.toLowerCase();

          if (!tagName) {
            out.push("<");
            i++;
            continue;
          }

          // 跳过 script/style 及其内部
          if (lowerName === "script" || lowerName === "style") {
            const endTag = `</${lowerName}>`;
            const endIndex = raw.indexOf(endTag, j);
            const move = endIndex !== -1 ? endIndex + endTag.length : len;
            out.push(raw.slice(i, move));
            i = move;
            continue;
          }

          // 扫描属性
          let k = j;
          let inSingle = false,
            inDouble = false,
            braceDepth = 0;
          while (k < len) {
            const c = raw[k];
            if (!inDouble && c === "'") inSingle = !inSingle;
            else if (!inSingle && c === '"') inDouble = !inDouble;
            else if (!inSingle && !inDouble) {
              if (raw.startsWith("{{", k)) {
                braceDepth++;
                k++;
              } else if (raw.startsWith("}}", k)) {
                braceDepth--;
                k++;
              } else if (braceDepth === 0 && (c === ">" || (c === "/" && raw[k + 1] === ">"))) break;
            }
            k++;
          }

          const isSelfClose = raw[k] === "/";
          const rawAttrs = raw.slice(j, k);

          // --- 核心逻辑判断 ---
          let currentEditId = null;

          if (lowerName === "template") {
            // 顶层 template 标签本身：计数但不加 ID
            templateCount++;
            if (templateCount === 1) {
              isInTemplate = !isSelfClose; // 如果是自闭合 <template /> 则不算进入内部
            }
          } else if (isInTemplate && templateCount === 1) {
            // 只有在第一个 template 内部的标签才加 ID
            currentEditId = id++;
            nodeMap[currentEditId] = {
              tag: tagName
            };
          }

          out.push(buildTag({
            tagName,
            rawAttrs,
            selfClose: isSelfClose,
            editId: currentEditId
          }));

          i = k + (isSelfClose ? 2 : 1);
        }

        return {
          template: out.join(""),
          nodeMap
        };
      },
      handleTitleChange(e) {
        let elem = e.currentTarget;
        this.content.title = elem.innerText.trim();
        this.saveContent();
      },
      handleIntroduceChange(e) {
        let elem = e.currentTarget;
        this.content.introduce = elem.innerText.trim();
        this.saveContent();
      },
      handleIconChange(e) {
        let elem = e.currentTarget;
        this.content.icon = elem.innerText.trim();
        this.saveContent();
      },
      handleTagsChange(e) {
        let elem = e.currentTarget;
        let tags = elem.innerText.split(',');
        tags = tags.map(item => {
          return item.trim();
        })
        this.content.tags = tags;
        this.setDocumentAttribute({
            key: "tags",
            value: tags,
          },
          (rData) => {
            this.$message({
              type: "success",
              message: "标签更新成功！",
            });
          });
      },
      handleGradesChange(v) {
        if (!v) {
          return false;
        }
        this.setDocumentAttribute({
            key: "grades",
            value: v,
          },
          (rData) => {
            this.$message({
              type: "success",
              message: "受众群体更新成功！",
            });
          });
      },
      handleTypeChange(v) {
        if (!v) {
          return false;
        }
        this.content.type = v.trim();
        this.setDocumentAttribute({
            key: "type",
            value: v,
          },
          (rData) => {
            this.$message({
              type: "success",
              message: "类型更新成功！",
            });
          });
      },
      handleCategoryChange(e) {
        let elem = e.currentTarget;
        this.content.category = elem.innerText.trim();
        this.setDocumentAttribute({
            key: "category",
            value: this.content.category,
          },
          (rData) => {
            this.$message({
              type: "success",
              message: "所属科目更新成功！",
            });
          });
      },
      handleAuthorChange(e) {
        let elem = e.currentTarget;
        this.currentSettings.creator = elem.innerText.trim();
        this.setDocumentAttribute({
            key: "creator",
            value: this.currentSettings.creator,
          },
          (rData) => {
            this.$message({
              type: "success",
              message: "创作者名称更新成功！",
            });
          });
      },
      updateLatestVersion(type) {
        let dsl = webCpu.getDslObj(this.content.code);
        let data = dsl.data();
        type = type || "text";
        let id = WebTool.urlQuery(location.href, "id");
        aigcInterface.adapter.getAppTemplate({}, (code) => {
          let opList = {
            ops: [{
              op: "js.data.update",
              path: "title",
              value: data.title,
            }, {
              op: "js.data.update",
              path: "introduce",
              value: data.introduce,
            }, {
              op: "js.data.update",
              path: "query",
              raw: true,
              value: `{
                documentId: "${id}"
              }`,
            }, {
              op: "js.data.update",
              path: "inputPlaceholder",
              value: data.inputPlaceholder,
            }, {
              op: "js.data.update",
              path: "icon",
              value: data.icon,
            }, {
              op: "js.data.update",
              path: "exampleList",
              raw: true,
              value: JSON.stringify(data.exampleList)
            }, {
              op: "js.data.update",
              path: "currentAppItem",
              raw: true,
              value: JSON.stringify(data.currentAppItem)
            }]
          };

          const result = VueSfcEditorPlugin.applyWithResult(code, opList);

          this.content.code = result.code;
          this.currentCode = result.code;

          this.updateAppItem();

          this.saveContent();

        }, {
          url: webCpu.appConfig.templateMap[type] || webCpu.appConfig.templateMap["text"]
        });
      },
      dismissLoadingTips() {
        if (this.currentItem.card && this.currentItem.card.task && this.currentItem.card.task.vueItem) {
          let item = this.currentItem.card.task.vueItem;
          item.loading = false;
        }

      },
      openConfigDialog() {
        this.configDialog.value = this.configDialog.value || {};
        let code = this.content.code;
        try {
          let dsl = webCpu.getDslObj(code);
          if (dsl && typeof dsl.data === "function") {
            let d = dsl.data();
            d.query = d.query || {};
            this.configDialog.value.apiName = this.configDialog.value.apiName || this.content.apiName || "";
            this.configDialog.value.model = this.configDialog.value.model || this.content.model || "";
            if (d.query.apiName === "custom") {
              this.configDialog.value.url = d.query.url;
              this.configDialog.value.apiKey = d.query.apiKey;
              this.configDialog.value.apiSecret = d.query.apiSecret;
              this.configDialog.value.inputPrice = d.query.inputPrice || 1000;
              this.configDialog.value.outputPrice = d.query.outputPrice || 1000;
            } else if (this.configDialog.value.model) {
              let item = this.configDialog.formData.priceMap[
                this.configDialog.value.model
              ] || {};
              this.configDialog.value.apiName = item.from || "国内";
            }
          }
        } catch (e) {}
        this.configDialog.visible = true;

      },
      confirmSelected() {
        let code = this.content.code;
        if (this.configDialog.value.apiName && this.configDialog.value.apiName !== "custom") {
          delete this.configDialog.value.apiKey;
          delete this.configDialog.value.url;
          delete this.configDialog.value.apiSecret;
          delete this.configDialog.value.appId;
          this.configDialog.value.model = this.configDialog.value.model || this.configDialog.formData.modelMap[this.configDialog.value.apiName][0].value;
        }

        if (this.configDialog.value.model) {
          this.configDialog.value.apiName = this.configDialog.formData.priceMap[this.configDialog.value.model].apiName || this.configDialog.value.apiName;
        }

        this.configDialog.value.documentId = WebTool.urlQuery(location.href, "id");
        let opList = {
          ops: [{
            op: "js.data.update",
            path: "query",
            raw: true,
            value: `${JSON.stringify(this.configDialog.value)}`,
          }]
        };

        this.configDialog.editMode = false;
        const result = VueSfcEditorPlugin.applyWithResult(code, opList);
        this.content.code = result.code;
        this.currentCode = result.code;
        this.updateAppItem();
        this.saveContent();
        this.$message({
          type: "success",
          message: "AI 模型接入成功"
        });
        this.configDialog.visible = false;
      },
      handleChangeConfig(item) {
        if (item.prop === "apiName") {
          this.configDialog.value.model = "";
        }
      },
      handlePublishStatusChange(v) {
        this.setDocumentAttribute({
            key: "publishStatus",
            value: v,
            timeKey: "publishTime",
            documentId: this.documentMeta.documentId
          },
          (tData) => {
            if (tData.ret === 0) {
              this.currentSettings.publishTime = tData.data.publishTime;
              this.$message({
                type: "success",
                message: webCpu.messages[lang].publishStatusTips,
              });
            } else {
              this.currentSettings.publishStatus = !this.currentSettings.publishStatus;
            }
          });
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
        this.setDocumentAttribute({
            key: "taxRate",
            value: this.currentSettings.taxRate,
          },
          (tData) => {
            if (tData.ret === 0) {
              this.$message({
                type: "success",
                message: webCpu.messages[lang].marginSuccessTips,
              });
            } else {}
          }
        );
      },
      saveContent(command, flag) {
        if (!localStorage.folderName) {
          this.$message({
            type: "warning",
            message: this.$t("loginTips")
          });
          dialogMap.openLoginDialog(document.body);
          return false;
        }
        command = command || "saveContent";
        let content = JSON.parse(JSON.stringify(this.content));
        delete content.isSolo;
        let params = {
          app: this.currentApp,
          documentMeta: this.documentMeta,
          content: [{
            content: content,
          }],
          copy: flag,
        }
        if (flag) {
          this.isCopying = true;
          delete params.documentMeta.documentId;
        }
        console.log("copy command params: ", params)
        webCpu.mitt.emit(command, params);
      },
      backHome() {
        let params = WebTool._urlQuery(location.href);
        delete params.id;
        if (
          this.currentApp &&
          this.currentApp.publishInfo &&
          this.currentApp.publishInfo.folderName
        ) {
          params.agent = this.currentApp.publishInfo.folderName;
          params.appName = this.currentApp.name;
        }
        let url = location.origin + location.pathname;
        url = WebTool.attachParams(url, params);
        location.href = url;
      },
      previewAppStr(appStr, card, menu) {
        let app = {
          className: "ElementVueItem",
          task: {
            template: appStr,
            style: {
              width: "100%",
              height: "100%",
              border: "solid 1px #ddd",
              borderRadius: "5px",
              padding: "10px 20px",
              boxShadow: "2px 2px 2px #333",
              overflow: "auto"
            },
          },
        };
        let param = {
          appDsl: app,
          callback: function(c) {
            webCpu.previewAppData(c, this.appDsl, "appData");
          },
          titleStyle: {
            background: "var(--el-color-primary-light-9)",
            color: "var(--el-color-primary)",
          },
          menu: menu,
          closeType: "back",
        };
        webCpu.CardItem.htmlDialog(
          card,
          webCpu.messages[lang].confirmPreview,
          "",
          param, {
            width: "100%",
          }
        );
      },
      editLoadingCode() {
        if (webCpu.currentVueItem && webCpu.currentVueItem.loadingProgressApp && webCpu.currentVueItem.loadingProgressApp.task && webCpu.currentVueItem.loadingProgressApp.task.template) {
          let vueUrl = webCpu.currentVueItem.loadingProgressApp.task.template;
          aigcInterface.renderAgentApp(webCpu.appConfig.vueCodeEditor, {
            vueUrl: vueUrl
          }, {
            type: "dialog",
            title: this.$t("editLoadingApp"),
            callback: (content) => {

              let tCode = content.code;
              dataUrl = WebTool.stringToDataURL(tCode);
              let opList = {
                ops: [{
                  op: "js.data.update",
                  path: "loadingProgressApp",
                  raw: true,
                  value: `{
									className: "ElementVueItem",
									task: {
										template: "${dataUrl}"
									}
								}`
                }]
              }
              const result = VueSfcEditorPlugin.applyWithResult(this.content.code, opList);

              this.content.code = result.code;
              this.currentCode = result.code;
              this.updateAppItem();
              webCpu.CardItem.dismissMask(document.body);
              this.saveContent();
            }
          });
        } else {
          this.$message({
            type: "warning",
            message: "当前 Agent 没不支持有所属加载逻辑代码。"
          });
        }
      },
      editContentCode() {
        if (webCpu.currentVueItem && webCpu.currentVueItem.currentAppItem && webCpu.currentVueItem.currentAppItem.task && webCpu.currentVueItem.currentAppItem.task.template) {
          let dataUrl = webCpu.currentVueItem.currentAppItem.task.template;
          let code = WebTool.parseDataUrl(dataUrl);
          aigcInterface.renderAgentApp(webCpu.appConfig.vueCodeEditor, {
            code: code
          }, {
            title: this.$t("editResultApp"),
            type: "dialog",
            callback: (content) => {
              let tCode = content.code;
              dataUrl = WebTool.stringToDataURL(tCode);
              let opList = {
                ops: [{
                  op: "js.data.update",
                  path: "currentAppItem",
                  raw: true,
                  value: `{
									className: "ElementVueItem",
									task: {
										style: {
											overflow: "auto",
										},
										template: "${dataUrl}"
									}
								}`
                }]
              }
              const result = VueSfcEditorPlugin.applyWithResult(this.content.code, opList);

              this.content.code = result.code;
              this.currentCode = result.code;
              this.updateAppItem();
              webCpu.CardItem.dismissMask(document.body);
              this.saveContent();
            }
          });
        } else {
          this.$message({
            type: "warning",
            message: "当前 Agent 不支持修改所属内容结构代码。"
          });
        }
      },
      openCodeEditor(code, card) {
        code = code || this.content.code;
        card = card || document.body;
        let app = {
          className: "CodeEditor",
          dsl: {
            changeCallback: function(dd) {},
            data: code,
            options: {
              lineNumbers: true,
              value: "",
              mode: "vue",
            },
          },
        };
        let _self = this;
        let confirmCallback = function() {
          _self.content.code = app.card.task.data;
          _self.currentCode = app.card.task.data;
          _self.updateAppItem();
          webCpu.CardItem.dismissMask(document.body);
          _self.saveContent();
        }
        let previewApp = function() {
          let code = app.card.task.data;
          _self.previewAppStr(code, webCpu.cards.codeEditorDialog);
        }
        webCpu.CardItem.renderCardDialog(
          card,
          app, {
            title: this.$t("editCode"),
            titleStyle: {
              background: "var(--el-color-primary-light-9)",
              color: "var(--el-color-primary)",
            },
            closeType: "back",
            dialogName: "codeEditorDialog",
            menu: [{
              label: "预览",
              action: previewApp,
            }, {
              label: "确认",
              action: confirmCallback,
            }],
          }, {
            width: "100%",
            height: "100%",
          }
        );
        this.dismissLoadingTips();
      },
      _openCodeEditor(code) {
        code = code || this.content.code;
        let dslData = webCpu.getDslData(code);
        let dataUrl = dslData.data().currentAppItem.task.template;
        let opList = {
          ops: [{
            op: "js.data.update",
            path: "currentAppItem",
            raw: true,
            value: `{}`
          }]
        }
        const result = VueSfcEditorPlugin.applyWithResult(code, opList);
        aigcInterface.renderAgentApp(webCpu.appConfig.vueCodeEditor, {
          code: result.code
        }, {
          callback: (content) => {
            let opList = {
              ops: [{
                op: "js.data.update",
                path: "currentAppItem",
                raw: true,
                value: `{
									className: "ElementVueItem",
									task: {
										style: {
											overflow: "auto",
										},
										template: "${dataUrl}"
									}
								}`
              }]
            }
            const result = VueSfcEditorPlugin.applyWithResult(content.code, opList);
            this.content.code = result.code;
            this.currentCode = result.code;
            this.updateAppItem();
            webCpu.CardItem.dismissMask(document.body);
            this.saveContent();
          },
          title: this.$t("editCode"),
          type: "dialog"
        });
      },
      createKnowledgeItem() {
        return {
          id: "",
          name: "",
          description: ""
        };
      },
      openKnowledgesDialog() {
        this.content.knowledges = this.content.knowledges || [];
        if (!this.content.knowledges.length) {
          this.content.knowledges.push(this.createKnowledgeItem());
        }
        this.knowledgesDialog.visible = true;
      },
      addKnowledge() {
        this.content.knowledges.push(this.createKnowledgeItem());
      },
      removeKnowledge(index) {
        this.content.knowledges.splice(index, 1);
      },
      openKnowledgeIndex(kb) {
        const id = String((kb && kb.id) || "").trim();
        let url = `${location.origin}?id=${webCpu.appConfig.knowledgeApp}`;
        if (id) {
          url += `&dataId=${id}`;
        }
        window.open(url, "_blank");
      },
      confirmKnowledges() {
        let list = this.content.knowledges || [];
        let knowledges = list
          .map((item) => {
            return {
              id: String(item.id || "").trim(),
              name: String(item.name || "").trim(),
              description: String(item.description || "").trim(),
            };
          })
          .filter((item) => {
            return item.id || item.name;
          });

        if (!knowledges.length) {
          this.$message({
            type: "warning",
            message: "请至少配置一个知识库",
          });
          return false;
        }

        let invalid = knowledges.some((item) => {
          return !item.id || !item.name;
        });
        if (invalid) {
          this.$message({
            type: "warning",
            message: "知识库的名称和 ID 不能为空",
          });
          return false;
        }

        this.content.knowledges = knowledges;
        this.setDocumentAttribute({
            key: "knowledges",
            value: knowledges,
          },
          (tData) => {
            this.$message({
              type: "success",
              message: "可选知识库配置成功！",
            });
            this.knowledgesDialog.visible = false;
          });
      }
    }
  };
</script>

<style scoped>
  /* ============================================
     DESIGN TOKENS — 白与空 · 原研哉设计规范
     ============================================ */
  .appContainerArea {
    --muse-primary: #1a1a1e;
    --muse-primary-hover: #2b2b31;
    --muse-primary-active: #000000;
    --muse-primary-soft: rgba(26, 26, 30, 0.04);
    --muse-primary-ring: rgba(26, 26, 30, 0.16);

    --muse-bg: #fafafc;
    --muse-card: #f8f8fa;
    --muse-surface: #ffffff;

    --muse-text: #1a1a1e;
    --muse-text-secondary: #6e6e73;
    --muse-text-tertiary: #a5a5aa;

    --muse-border: #e7e7eb;
    --muse-border-strong: #9999a0;
    --muse-hover: rgba(26, 26, 30, 0.05);

    --glass-bg: #ffffff;
    --glass-shadow: 0 1px 2px rgba(20, 20, 30, 0.04),
      0 8px 24px rgba(20, 20, 30, 0.06);
    --glass-shadow-hover: 0 2px 4px rgba(20, 20, 30, 0.05),
      0 12px 32px rgba(20, 20, 30, 0.09);

    --radius-xs: 0px;
    --radius-sm: 0px;
    --radius-md: 0px;
    --radius-lg: 0px;
    --radius-xl: 0px;
    --radius-2xl: 0px;
    --radius-3xl: 0px;
    --radius-card: 0px;
    --radius-full: 2px;

    --duration-fast: 0.12s;
    --duration-base: 0.18s;
    --duration-slow: 0.28s;
    --ease-out: cubic-bezier(0.22, 1, 0.36, 1);

    --font-system: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
      "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
  }

  .appContainerArea[data-theme="dark"] {
    --muse-primary: #1a1a1e;
    --muse-primary-hover: #3a3a40;
    --muse-primary-active: #000000;
    --muse-primary-soft: rgba(26, 26, 30, 0.10);
    --muse-primary-ring: rgba(26, 26, 30, 0.16);

    --muse-bg: #16161a;
    --muse-card: #1f1f24;
    --muse-surface: #2b2b31;

    --muse-text: #fafafc;
    --muse-text-secondary: #a5a5aa;
    --muse-text-tertiary: #6e6e73;

    --muse-border: rgba(250, 250, 252, 0.10);
    --muse-border-strong: rgba(250, 250, 252, 0.20);
    --muse-hover: rgba(250, 250, 252, 0.12);

    --glass-bg: rgba(26, 26, 30, 0.72);
    --glass-shadow: 0 1px 2px rgba(0, 0, 0, 0.5), 0 8px 24px rgba(0, 0, 0, 0.5);
    --glass-shadow-hover: 0 2px 4px rgba(0, 0, 0, 0.55),
      0 12px 32px rgba(0, 0, 0, 0.55);
  }

  /* 页面背景 — 纸白 + 细点纹理 */
  .appContainerArea {
    position: relative;
    font-family: var(--font-system);
    color: var(--muse-text);
    background-color: var(--muse-bg);
    background-image: radial-gradient(
        ellipse 70% 55% at 15% 0%,
        rgba(26, 26, 30, 0.03) 0%,
        transparent 55%
      ),
      radial-gradient(
        ellipse 55% 45% at 100% 100%,
        rgba(26, 26, 30, 0.02) 0%,
        transparent 55%
      ),
      radial-gradient(
        circle at 1px 1px,
        rgba(148, 163, 184, 0.22) 1px,
        transparent 0
      );
    background-size: auto, auto, 26px 26px;
  }

  .edit-mode-toggle {
    position: absolute;
    top: 10px;
    right: 12px;
    z-index: 1100;
  }

  /* 毛玻璃高亮层 */
  .editor-highlight {
    position: absolute;
    z-index: 1000;
    pointer-events: none;
    border-radius: 4px;
    background: rgba(26, 26, 30, 0.02);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(26, 26, 30, 0.1);
    box-shadow: 0 0 0 1px rgba(26, 26, 30, 0.2);
    transition: all 0.08s ease-out;
    cursor: pointer;
  }

  .buttonOptionArea {
    position: absolute;
    display: inline-block;
    right: 0px;
  }

  .componentInfoArea {
    position: absolute;
    display: inline-block;
    text-align: left;
    color: #999;
    font-size: 12px;
    left: 0px;
    top: 10px;
  }

  .titleItemArea,
  .publishStatusArea {
    display: inline-block;
    vertical-align: middle;
  }

  .titleItemAre {
    margin-right: 10px;
  }

  .publishStatusArea {
    margin-left: 5px;
    padding-left: 5px;
  }

  .publishStatusArea .el-switch {
    transform: scale(0.8);
    transform-origin: 0;
  }

  .appContainerArea>.el-card>.el-card__body {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 0px !important;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* scale 需要 transform */
  .tw-transform {
    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
  }

  /* hover:tw-scale-105 */
  .hover\:tw-scale-105:hover,
  .hover\:tw-scale-101:hover {
    --tw-scale-x: 1.05;
    --tw-scale-y: 1.05;
    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
  }

  .hover\:tw-scale-101:hover {
    --tw-scale-x: 1.01;
    --tw-scale-y: 1.01;
  }


  .editor-delete-btn-layer {
    position: absolute;
    width: 22px;
    height: 22px;
    background: #ff4d4f;
    color: white;
    font-size: 12px;
    border-radius: 12px;
    align-items: center;
    justify-content: center;
    display: flex;
    top: 8px !important;
    right: 8px !important;
    cursor: pointer;
    z-index: 99999;
    /* 最高层，绝对能点击 */
    pointer-events: auto;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.25);
  }

  .editor-delete-btn-layer:hover {
    background: #ff7875;
  }

  .editor-highlight[type=appItem] .editor-delete-btn-layer {
    display: flex;
  }

  .editor-remove-btn {
    display: inline-block;
    cursor: pointer;
    z-index: 99999;
    /* 最高层，绝对能点击 */
    pointer-events: auto;
  }

  .el-dropdown-menu {
    max-height: 500px;
  }

  .settingItem {
    display: block;
    position: relative;
    float: left;
    width: 100%;
    margin-bottom: 10px;
    text-align: left;
    font-size: 12px;
    height: auto;
    line-height: 30px;
  }

  .el-popper {
    max-height: 400px !important;
    overflow: auto !important;
  }

  .settingItem .el-select {
    width: calc(100% - 90px);
    display: inline-block;
    vertical-align: middle;
    float: right;
  }

  .settingItem .el-switch {
    transform: scale(0.9);
    transform-origin: 0px center;
  }

  .settingItem .publishTimeSpan {
    color: #999;
    transform: scale(0.9);
    transform-origin: 0px center;
    display: inline-block;
    vertical-align: middle;
  }

  .settingItem .settingSpan {
    float: left;
  }

  .settingItem .settingEditor .appImage .el-image {
    width: 100%;
    height: 80px;
    margin-top: 5px;
    background-color: #f3f3f5;
  }

  .settingItem .settingEditor {
    float: right;
    margin-top: 3px;
    width: 180px;
    text-align: right;
    display: inline-block;
  }

  .appContainerArea .el-card {
    border: none;
    box-shadow: none;
    border-radius: 0px;
  }

  .custom-dragging-style {
    border: 2px dashed var(--el-color-primary);
  }

  .knowledges-dialog-body {
    max-height: 60vh;
    overflow-y: auto;
    padding-right: 4px;
  }

  .knowledge-item {
    border: 1px solid #e7e7eb;
    border-radius: 0px;
    padding: 12px;
    margin-bottom: 12px;
    background: #F8FAF9;
  }

  .knowledge-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .knowledge-item-title {
    font-size: 13px;
    font-weight: 600;
    color: #1a1a1e;
  }

  .knowledge-item .el-form-item {
    margin-bottom: 12px;
  }

  .knowledge-item .el-form-item:last-child {
    margin-bottom: 0;
  }

  .add-knowledge-btn {
    width: 100%;
  }

  .entryNextAgent .el-input-group__prepend {
    padding: 0px 8px;
  }

  /* hover:tw-shadow-lg */
  .hover\:tw-shadow-lg:hover {
    --tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1),
      0 4px 6px -4px rgb(0 0 0 / 0.1);
    --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color),
      0 4px 6px -4px var(--tw-shadow-color);
    box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
      var(--tw-ring-shadow, 0 0 #0000),
      var(--tw-shadow);
  }

  .tw-animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }

  /* ============================================
     白与空 统一 · 墨色控件与 Element Plus
     ============================================ */
  .editor-highlight {
    border-color: rgba(26, 26, 30, 0.3) !important;
    box-shadow: 0 0 0 1px rgba(26, 26, 30, 0.3) !important;
    background: rgba(26, 26, 30, 0.03) !important;
  }

  .custom-dragging-style {
    border-color: var(--muse-primary, #1a1a1e) !important;
  }

  .settingItem .settingEditor .appImage .el-image {
    background-color: var(--muse-card, #f8f8fa);
  }

  .knowledge-item {
    border: 1px solid var(--muse-border, #fafafc);
    background: var(--muse-surface, #ffffff);
    box-shadow: var(--glass-shadow, 0 8px 24px rgba(20, 20, 30, 0.06));
  }

  .knowledge-item-title {
    color: var(--muse-text, #1a1a1e);
  }

  /* 主按钮：墨色直角 */
  :deep(.el-button--primary) {
    --el-button-bg-color: var(--muse-primary, #1a1a1e);
    --el-button-border-color: var(--muse-primary, #1a1a1e);
    --el-button-hover-bg-color: var(--muse-primary-hover, #2b2b31);
    --el-button-hover-border-color: var(--muse-primary-hover, #2b2b31);
    --el-button-active-bg-color: var(--muse-primary-active, #000000);
    --el-button-active-border-color: var(--muse-primary-active, #000000);
    --el-button-text-color: #ffffff;
    border-radius: 0px;
    font-weight: 600;
  }

  :deep(.el-button--primary:not(.is-disabled):hover) {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(26, 26, 30, 0.20);
  }

  :deep(.el-button--primary:not(.is-disabled):active) {
    transform: translateY(0) scale(0.98);
  }

  /* 弹窗：16px 圆角玻璃卡片 */
  :deep(.el-dialog) {
    border-radius: var(--radius-3xl, 16px) !important;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(20, 20, 30, 0.16) !important;
  }

  :deep(.el-dialog__header) {
    margin-right: 0;
    padding: 20px 24px 12px;
    border-bottom: 1px solid var(--muse-border, #fafafc);
  }

  :deep(.el-dialog__title) {
    font-weight: 700;
    font-size: 1.125rem;
    color: var(--muse-text, #1a1a1e);
  }

  :deep(.el-dialog__body) {
    padding: 20px 24px;
    color: var(--muse-text, #1a1a1e);
  }

  :deep(.el-dialog__footer) {
    padding: 12px 24px 20px;
    border-top: 1px solid var(--muse-border, #fafafc);
  }

  /* 输入 / 选择器：直角 + 墨色焦点环 */
  :deep(.el-select__wrapper),
  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner) {
    border-radius: var(--radius-lg, 10px);
  }

  :deep(.el-input__wrapper.is-focus),
  :deep(.el-select__wrapper.is-focused),
  :deep(.el-textarea__inner:focus) {
    box-shadow: 0 0 0 1px var(--muse-primary, #1a1a1e) inset !important;
  }

  :deep(.el-form-item__label) {
    color: var(--muse-text-secondary, #6e6e73);
    font-weight: 500;
  }

  /* 标签：墨色浅底胶囊 */
  :deep(.el-tag) {
    --el-tag-bg-color: var(--muse-primary-soft, #f3f3f5);
    --el-tag-border-color: var(--muse-primary-ring, #e7e7eb);
    --el-tag-text-color: var(--muse-primary-hover, #2b2b31);
    border-radius: 0px;
    font-weight: 500;
  }

  /* 开关：墨色 */
  :deep(.el-switch.is-checked .el-switch__core) {
    background-color: var(--muse-primary, #1a1a1e);
    border-color: var(--muse-primary, #1a1a1e);
  }

  /* Tailwind 蓝色工具类对齐墨色 */
  .tw-text-blue-600,
  .tw-text-blue-500 {
    color: #1a1a1e !important;
  }

  .tw-bg-blue-50 {
    background-color: #f3f3f5 !important;
  }

  .tw-bg-blue-500,
  .tw-bg-blue-600 {
    background-color: #1a1a1e !important;
  }

  .tw-border-blue-200 {
    border-color: #e7e7eb !important;
  }
</style>
