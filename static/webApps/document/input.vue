<template>
  <div
    class="oneKeyContentArea tw-min-h-screen tw-p-4"
    ref="oneKeyContainer"
    :flag="flag"
    @scroll="handleScroll"
  >
    <div
      v-if="status == 1"
      ref="sloganInfoContainer"
      class="sloganInfoArea tw-text-center tw-py-10"
    >
      <p
        class="z-text tw-text-4xl tw-font-bold tw-bg-clip-text"
        :style="{ fontSize: flag ? '24px' : '' }"
        v-html="
          sanitizeHtml(
            isLogined
              ? meta.extraSlogan || meta.slogan
              : meta.slogan || $t('slogan')
          )
        "
      ></p>
      <p class="tw-mt-2" :style="{ fontSize: flag ? '14px' : '' }">
        {{
          isLogined
            ? meta.extraSlogan1 || meta.slogan1
            : meta.slogan1 || $t("slogan1")
        }}
      </p>
    </div>
    <div
      class="aiGenerateArea tw-w-full tw-flex tw-justify-center"
      ref="aiPromptContainer"
    >
      <div
        ref="inputContentItem"
        class="inputContentArea tw-max-w-2xl tw-w-full tw-relative"
        :docType="docType"
      >
        <el-row :gutter="0">
          <el-col :span="pptFileSpan" style="position: relative">
            <div class="selectPptFile stepItemArea tw-pb-1.5">
              <span v-if="textContent && !isTyping" class="optionsArea">
                <el-button
                  @click="clearInput()"
                  :disabled="!textContent"
                  style="
                    float: right;
                    display: inline-block;
                    vertical-align: middle;
                  "
                  round
                  type="warning"
                  size="small"
                  >{{ $t("clearContent") }}</el-button
                >
              </span>
              <span
                style="
                  display: inline-block;
                  width: 100%;
                  position: relative;
                  float: left;
                  height: 100%;
                "
              >
                <el-input
                  v-model="textContent"
                  :placeholder="meta.inputPlaceholder"
                  :max="9"
                  :min="9"
                  :rows="9"
                  type="textarea"
                  resize="none"
                  :clearable="true"
                >
                </el-input>
              </span>
              <span
                style="
                  position: absolute;
                  text-align: right;
                  width: 300px;
                  bottom: 15px;
                  right: 7px;
                "
              >
                <el-button
                  @click="openConfigDialog"
                  v-if="textContent && !isTyping"
                  type="primary"
                  text
                  size="small"
                  ><el-icon><Setting /></el-icon>算力</el-button
                >
                <!-- <el-select
                  v-if="textContent"
                  v-model="aigcMode"
                  style="
                    margin-right: 10px;
                    margin-left: 3px;
                    width: 100px;
                    display: inline-block;
                  "
                  size="small"
                >
                  <el-option
                    v-for="option in [
                      { label: 'Agent', value: 'single' },
                      { label: '工作流', value: 'multi' },
                    ]"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  ></el-option>
                </el-select> -->
                <el-button
                  round
                  :disabled="isTransforming || isTyping"
                  :loading="isTransforming"
                  :style="{ maxWidth: flag ? '400px' : '300px' }"
                  class="shiny-button tw-bg-gradient-to-r tw-from-[#0066CC] tw-to-[#38BDF8] tw-text-white tw-font-bold tw-rounded-lg tw-shadow-lg hover:tw-shadow-xl tw-transition-all tw-duration-300 tw-transform hover:tw-scale-105"
                  @click="aigcRequest()"
                  type="primary"
                >
                  <el-icon
                    v-if="!isTransforming"
                    style="margin-right: 5px"
                    :size="16"
                  >
                    <magic-stick /> </el-icon
                  >{{ meta.buttonText || $t("confirmButton") }}
                </el-button>
              </span>
            </div>
            <div class="idea-section-container">
              <div class="idea-section-content">
                <h2 class="section-title">
                  {{ meta.exampleData.title }}
                  <el-button
                    circle
                    text
                    size="small"
                    @click="refreshExampleList()"
                    class="more-ideas-button"
                  >
                    <el-icon :size="14">
                      <refresh></refresh>
                    </el-icon>
                  </el-button>
                  <el-dropdown class="clone-app-button" @command="handleCloneCommand" trigger="click">
                    <!-- 触发按钮部分：保持原有的样式和图标 -->
                    <el-button
                      circle
                      text
                      size="small"
                    >
                      <svg
                        data-component="Octicon"
                        aria-hidden="true"
                        focusable="false"
                        class="octicon octicon-terminal mr-2"
                        viewBox="0 0 16 16"
                        width="16"
                        height="16"
                        fill="currentColor"
                        display="inline-block"
                        overflow="visible"
                        style="vertical-align: text-bottom"
                      >
                        <path
                          d="M0 2.75C0 1.784.784 1 1.75 1h12.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25Zm1.75-.25a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V2.75a.25.25 0 0 0-.25-.25ZM7.25 8a.749.749 0 0 1-.22.53l-2.25 2.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L5.44 8 3.72 6.28a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215l2.25 2.25c.141.14.22.331.22.53Zm1.5 1.5h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1 0-1.5Z"
                        ></path>
                      </svg>
                      <span class="el-dropdown-link">克隆</span>
                    </el-button>

                    <!-- 下拉菜单内容 -->
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="cloneSkill">
                          克隆 AI 技能
                        </el-dropdown-item>
                        <el-dropdown-item command="cloneAgent">
                          克隆聊天 Agent
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </h2>

                <div class="ideas-buttons-row">
                  <slot v-for="item in meta.exampleData.list">
                    <button
                      :key="item"
                      @click="inputExmpaleText(item)"
                      class="idea-button"
                    >
                      {{ item.label || item }}
                    </button>
                  </slot>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <div
      class="myAppsArea"
      v-if="myApps.length !== 0"
      style="padding: 20px 20px"
    >
      <h5
        style="
          padding: 10px 20px;
          width: 100%;
          text-align: center;
          font-size: 24px;
        "
      >
        我的 Apps
      </h5>
      <div
        style="
          padding: 20px 20px 0px 20px;
          background: #fff;
          border-radius: 0px;
        "
        class="tw-p-4 md:tw-p-8 tw-font-sans"
      >
        <el-row v-if="myApps.length !== 0" :gutter="24">
          <el-col
            v-for="item in myApps"
            :key="item.id"
            :xs="24"
            :sm="12"
            :lg="8"
            :xl="8"
            class="tw-mb-4"
          >
            <el-card
              style="height: auto; border-radius: 0px"
              shadow="hover"
              @click="openAppLink(item)"
              class="tw-border-0 tw-p-0 tw-rounded-lg tw-overflow-hidden tw-cursor-pointer tw-h-full"
            >
              <div
                class="contentCardItem"
                style="
                  position: relative;
                  width: 100%;
                  float: left;
                  height: auto;
                "
              >
                <el-image
                  style="
                    display: inline-block;
                    width: 50px;
                    height: 50px;
                    float: left;
                    border-radius: 0px;
                    background: #f8f8fa;
                  "
                  :src="item.image"
                  :alt="item.title"
                  fit="contain"
                  :lazy="true"
                  class="tw-h-full tw-w-full tw-block"
                >
                  <template #error>
                    <div
                      class="tw-image-slot tw-h-full tw-flex tw-justify-center tw-items-center tw-bg-gray-200"
                    >
                      <i
                        class="bi bi-image-fill tw-text-gray-500 tw-text-xl"
                      ></i>
                    </div>
                  </template>
                </el-image>
                <span
                  style="
                    display: inline-block;
                    width: calc(100% - 60px);
                    height: 50px;
                    line-height: 50px;
                    float: right;
                  "
                >
                  <h3 class="tw-text-lg tw-font-semibold tw-mb-1 tw-truncate">
                    {{ item.title }}
                  </h3>
                  <div
                    class="tw-flex tw-items-center tw-text-gray-500 tw-text-sm"
                  >
                    <span class="tw-truncate"> 更新时间: </span>
                    <span class="tw-flex tw-items-center">
                      {{ item.time }}
                    </span>
                  </div>
                </span>
              </div>
            </el-card>
          </el-col>
          <el-col
            v-if="myApps.length < myAppCount"
            :xs="24"
            :sm="12"
            :lg="8"
            :xl="8"
            class="tw-mb-4"
          >
            <el-card
              shadow="never"
              style="
                height: auto;
                width: 100%;
                text-align: center;
                border-radius: 0px;
              "
            >
              <div style="width: 100%; height: 100%; padding: 8px">
                <el-button @click="openMoreApps()" type="primary" text
                  >更多</el-button
                >
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-empty :image-size="90" v-else-if="myApps.length === 0"></el-empty>
      </div>
    </div>
    <div class="communityArea">
      <h5
        style="
          padding: 10px 20px;
          width: 100%;
          text-align: center;
          font-size: 24px;
        "
      >
        {{ meta.communityInfo.slogan }}
      </h5>
      <p style="padding: 10px 20px; text-align: center; font-size: 14px">
        {{ meta.communityInfo.slogan1 }}
      </p>
      <div class="tw-min-h-screen tw-font-sans">
        <header
          class="tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-start md:tw-items-center tw-mb-6 tw-space-y-4 md:tw-space-y-0"
        >
          <div class="tw-w-full md:tw-w-96">
            <el-input
              @change="searchAppCards()"
              v-model="meta.communityInfo.searchText"
              :placeholder="meta.communityInfo.searchPlaceholder"
              clearable
              :rounded="true"
              :style="{
                width: !!isPartner ? 'calc( 100% - 100px )' : '100%',
                display: 'inline-block',
                borderRadius: '20px',
                background: '#fff',
              }"
            >
              <template #prefix>
                <i class="bi bi-search"></i>
              </template>
            </el-input>
            <div
              v-if="!!isPartner"
              style="
                width: 80px;
                display: inline-block;
                float: right;
                text-align: right;
              "
              class="tw-w-full md:tw-w-auto tw-justify-end"
            >
              <el-select
                @change="searchAppCards()"
                v-model="meta.communityInfo.selectedOwner"
                placeholder="Owned by everyone"
                class="tw-w-40"
                style="width: 100%; display: inline-block; border-radius: 0px"
              >
                <el-option label="所有" value="all"></el-option>
                <el-option label="我的" value="me"></el-option>
              </el-select>
            </div>
          </div>
        </header>
        <nav
          v-if="false"
          class="tw-mb-6 tw-overflow-x-auto tw-whitespace-nowrap"
        >
          <el-radio-group
            border
            v-model="meta.communityInfo.selectedCategory"
            size="small"
            class="tw-flex tw-flex-nowrap"
            @change="searchAppCards()"
          >
            <el-radio
              border
              v-for="cat in meta.communityInfo.categories"
              :key="cat"
              :label="cat"
              :value="cat"
            ></el-radio>
          </el-radio-group>
        </nav>
        <div
          v-loading="loadingAppCards"
          style="padding: 0px 0px"
          class="tw-p-4 md:tw-p-8 tw-font-sans"
        >
          <slot v-if="meta.communityInfo.appCards.length !== 0">
            <el-row :gutter="24">
              <el-col
                v-for="card in meta.communityInfo.appCards"
                :key="card.id"
                :xs="24"
                :sm="8"
                :lg="6"
                :xl="6"
                class="tw-mb-6"
              >
                <el-card
                  style="border-radius: 0px; background-color: #f8f8fa"
                  shadow="hover"
                  @click="openAppLink(card)"
                  class="tw-border-0 tw-p-0 tw-rounded-lg tw-overflow-hidden tw-cursor-pointer"
                >
                  <div
                    class="tw-relative tw-w-full tw-relative tw-w-full"
                    :style="{ height: flag ? 'auto' : '120px' }"
                  >
                    <el-image
                      style="border-radius: 0px; background: #f8f8fa"
                      :src="card.image"
                      :alt="card.title"
                      fit="contain"
                      :lazy="true"
                      class="tw-h-full tw-w-full tw-block"
                    >
                      <template #error>
                        <div
                          class="tw-image-slot tw-h-full tw-flex tw-justify-center tw-items-center tw-bg-gray-200"
                        >
                          <i
                            class="bi bi-image-fill tw-text-gray-500 tw-text-xl"
                          ></i>
                        </div>
                      </template>
                    </el-image>
                    <div
                      v-if="card.tag"
                      class="tw-absolute tw-top-3 tw-right-3 tw-bg-blue-600 tw-text-white tw-text-xs tw-font-bold tw-py-1 tw-px-2 tw-rounded-full"
                    >
                      {{ card.tag }}
                    </div>
                  </div>
                  <div
                    class="tw-pt-2"
                    style="position: relative; width: 100%; float: left"
                  >
                    <el-avatar
                      style="
                        width: 50px;
                        height: 50px;
                        border-radius: 100%;
                        float: left;
                        background: #f8f8fa;
                        border: solid 1px #fff;
                      "
                      :src="card.avatar"
                    ></el-avatar>
                    <span
                      style="
                        display: inline-block;
                        width: calc(100% - 60px);
                        height: 40px;
                        line-height: 40px;
                        float: right;
                      "
                    >
                      <h3
                        class="tw-text-lg tw-font-semibold tw-mb-1 tw-truncate"
                      >
                        {{ card.title }}
                      </h3>
                      <div
                        class="tw-flex tw-items-center tw-text-gray-500 tw-text-sm"
                      >
                        <span class="tw-truncate">
                          {{ card.author }}
                        </span>
                        <i class="bi bi-dot tw-mx-1"></i>
                        <span class="tw-flex tw-items-center">
                          <i class="bi bi-lightning tw-mr-1"></i>
                          {{ card.usageCount }}
                        </span>
                      </div>
                    </span>
                  </div>
                </el-card>
              </el-col>
            </el-row>
            <div
              v-if="isLoadingMore || !hasMore"
              class="tw-text-center tw-py-4"
            >
              <p v-if="isLoadingMore">正在加载更多...</p>
              <p v-else-if="!hasMore && meta.communityInfo.appCards.length > 0">
                已加载全部数据 🎉
              </p>
            </div>
          </slot>
          <el-empty :image-size="90" v-else></el-empty>
        </div>
      </div>
      <footer
        class="tw-text-center tw-text-gray-500 tw-py-8 tw-text-sm tw-border-t tw-border-gray-1000"
      >
        <p>
          <a
            class="text-success"
            href="https://beian.miit.gov.cn/"
            target="blank"
            >互联网ICP备案：京ICP备17026815号-1</a
          >
        </p>
      </footer>
    </div>
    <el-dialog
      v-model="configDialog.visible"
      class="custom-dragging-style"
      :title="configDialog.title"
      width="400"
    >
      <el-form
        :label-width="configDialog.formData.labelWidth"
        label-position="left"
        :model="configDialog.value"
      >
        <el-form-item :label="configDialog.formData.data[0].label">
          <el-select
            size="small"
            @change="handleChangeConfig(configDialog.formData.data[0])"
            :placeholder="configDialog.formData.data[0].placeholder"
            v-model="configDialog.value[configDialog.formData.data[0].prop]"
          >
            <el-option
              :key="d.label"
              v-for="d in configDialog.formData.apiNameOptions || []"
              :value="d.value"
              :label="d.label"
              clearable
              >{{ d.label }}
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="configDialog.value.apiName === 'custom'"
          :label="configDialog.formData.data[1].label"
        >
          <el-input
            size="small"
            placeholder="输入 API 的 URL"
            v-model="configDialog.value[configDialog.formData.data[1].prop]"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item :label="configDialog.formData.data[2].label">
          <el-select
            size="small"
            v-if="configDialog.value.apiName !== 'custom'"
            @change="handleChangeConfig(configDialog.formData.data[2])"
            :placeholder="configDialog.formData.data[2].placeholder"
            v-model="configDialog.value[configDialog.formData.data[2].prop]"
            clearable
          >
            <el-option
              :key="d.value"
              v-for="d in configDialog.formData.modelMap[
                configDialog.value.apiName
              ] || []"
              :value="d.value"
              :label="d.label"
              >{{ d.label }}
            </el-option>
          </el-select>
          <el-input
            size="small"
            v-else
            placeholder="输入模型参数名称"
            v-model="configDialog.value[configDialog.formData.data[2].prop]"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item
          v-if="configDialog.value.apiName === 'custom'"
          :label="configDialog.formData.data[3].label"
        >
          <el-input
            size="small"
            type="password"
            :placeholder="configDialog.formData.data[3].placeholder"
            v-model="configDialog.value[configDialog.formData.data[3].prop]"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item
          label="价格(输入)"
          v-if="configDialog.value.apiName !== 'custom'"
        >
          <span>
            {{
              configDialog.formData.priceMap[
                configDialog.value.model || defaultModel
              ].in
            }}
          </span>
          (积分 / 百万 tokens)
        </el-form-item>
        <el-form-item
          label="价格(输出)"
          v-if="configDialog.value.apiName !== 'custom'"
        >
          <span>
            {{
              configDialog.formData.priceMap[
                configDialog.value.model || defaultModel
              ].out
            }}
          </span>
          (积分 / 百万 tokens)
        </el-form-item>
        <el-form-item
          v-if="configDialog.value.apiName !== 'custom'"
          label="佣金比例"
        >
          0.1
        </el-form-item>
        <el-form-item v-else label="价格(转发)"> 100 积分 / 次 </el-form-item>
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
  </div>
</template>

<script>
export default {
  data() {
    let textArray = [
      "正在理解你的需求…(预计 20 秒)",
      "正在生成中...(预计 50 秒)",
    ];
    return {
      // --- 新增无限滚动相关状态 ---
      currentPage: 1, // 当前页码
      pageSize: WebTool.adjustSize([8, 6, 4]), // 每页数量
      total: 0, // 总数据量
      isLoadingMore: false, // 标识是否正在加载更多数据
      hasMore: true, // 标识是否还有更多数据
      currentModule: 0,
      pptFileSpan: 24,
      auto: WebTool.urlQuery(location.href, "auto") === "true",
      isPartner: false,
      isLogined: false,
      isTransforming: false,
      flag: WebTool.adjustSize([false, false, true]),
      status: 1,
      limit: 2,
      docType: false,
      aigcMode: "single",
      imageProgress: 25,
      promptConfig: {},
      myApps: [],
      myAppCount: 2,
      loadingAppCards: false,
      loadingText: textArray[0],
      textArray: textArray,
      stepMode: "",
      stepIndex: 0,
      stepTimer: null,
      defaultModel: "Kimi-K2-Instruct",
      defaultPlatform: "白山云",
      configDialog: {
        visible: false,
        editMode: false,
        value: {
          inputType: "",
          apiName: "",
          model: "",
        },
        title: "配置参数",
        formData: {
          labelWidth: 100,
          taxRateMap: {
            白山云: 0.1,
            modelRouter: 0.1,
          },
          priceMap: {},
          modelMap: {
            国外: [],
            国内: [],
          },
          inputTypeOptions: [
            {
              label: "文本",
              value: "text",
            },
            {
              label: "图片",
              value: "image",
            },
            {
              label: "图片+文本",
              value: "textImage",
            },
          ],
          apiNameOptions: [
            {
              label: "国外(默认)",
              value: "国外",
            },
            {
              label: "国内(默认)",
              value: "国内",
            },
            {
              label: "自定义",
              value: "custom",
            },
          ],
          data: [
            {
              label: "算力供应商",
              prop: "apiName",
              placeholder: "选择一个平台",
            },
            {
              label: "API URL",
              prop: "url",
              placeholder: "请输入 API 的 URL",
            },
            {
              label: "模型名称",
              prop: "model",
              placeholder: "选择一个模型",
            },
            {
              label: "API Key",
              prop: "apiKey",
              placeholder: "请输入 API Key",
            },
            {
              label: "输入类型",
              prop: "inputType",
              placeholder: "选择输入类型",
            },
          ],
        },
      },
      stepMap: {
        first: {
          title: "🔍 正在构建你的应用…",
          expectedDuration: 10000,
          enabled: true,
          showPercentInline: true,
          steps: [
            "解析你的需求意图",
            "提炼要解决的问题",
            "拆解最小可用功能",
            "设计页面结构与交互",
            "匹配合适的界面风格",
          ],
        },
        second: {
          title: "🛠 正在生成可运行应用…",
          enabled: true,
          expectedDuration: 30000,
          showPercentInline: true,
          steps: [
            "解析功能描述",
            "构建页面代码结构",
            "生成应用模板",
            "补充交互与状态逻辑",
            "校验并输出最终代码",
          ],
        },
      },
      meta: {
        buttonText: "",
        confirmTips: "",
        slogan: "",
        slogan1: "",
        inputPlaceholder: "请输入",
        communityInfo: {
          slogan: "自由的创新，无需限制",
          slogan1: "探索最新社区应用集合",
          searchText: "",
          searchPlaceholder: "搜索 Apps",
          selectedOwner: "all",
          selectedLanguage: "en",
          // 类别筛选数据
          categories: [
            "所有 Apps",
            "内容创作",
            "数据处理",
            "决策辅助",
            "职场效率",
            "其他",
          ],
          selectedCategory: "", // 默认选中项
          appCards: [],
        },
        exampleData: {
          title: "没有灵感？试试这些",
          list: [
            {
              label: "故事创作，脑洞无限",
              description:
                "输入故事开头或主题，AI 自动生成完整故事，包含人物、情节和高潮。",
              icon: "✍️",
              category: "长文章",
            },
            {
              label: "课程讲义，智能浓缩",
              description:
                "将教材或讲义内容浓缩成逻辑清晰、重点突出的教学文档。",
              icon: "📚",
              category: "课件",
            },
            {
              label: "方案策划，自动排版",
              description:
                "根据初步方案输入，生成结构清楚、语言流畅的可直接使用文档。",
              icon: "📄",
              category: "方案",
            },
            {
              label: "引用整合，学术规范",
              description:
                "自动生成论文所需参考文献和引用格式，减少手工整理负担。",
              icon: "🎓",
              category: "论文",
            },
          ],
          moreText: "更多",
          moreArray: [
            {
              label: "万字长文，逻辑重构",
              description:
                "针对杂乱的访谈录音或万字素材，AI 自动梳理逻辑线索，一键转化为排版精美、具备深度洞察的特稿或深度报道。",
              icon: "✍️",
              category: "长文章",
            },
            {
              label: "故事脚本，冲突建模",
              description:
                "拒绝流水账！设定人物和结局，AI 自动套用经典文学模型，在关键章节埋下伏笔，拉满剧本的戏剧张力。",
              icon: "✍️",
              category: "长文章",
            },
            {
              label: "多源素材，观点对碰",
              description:
                "同时上传多篇立场不同的报告，AI 自动提取争论焦点，帮你快速理清不同流派的分歧点，辅助撰写高质量综述。",
              icon: "✍️",
              category: "长文章",
            },
            {
              label: "洗稿检测，风格漂移",
              description:
                "在保留核心事实的基础上，彻底重写叙述口吻与用词习惯，在规避查重风险的同时，完美适配目标读者的阅读偏好。",
              icon: "✍️",
              category: "长文章",
            },
            {
              label: "文档一键，幻灯大纲",
              description:
                "面对枯燥的长篇 PDF 教材无从下手？AI 直接将其拆解为逻辑分明、自带金句和互动提问的 PPT 演讲大纲。",
              icon: "📚",
              category: "课件",
            },
            {
              label: "知识点，可视化建议",
              description:
                "自动识别课件中的抽象概念，给出最适合的图解方式（如流程图、象限图），并生成可直接用于绘图的提示词。",
              icon: "📚",
              category: "课件",
            },
            {
              label: "学术难点，童话化解",
              description:
                "总是讲不清专业术语？AI 能将量子力学或金融杠杆等硬核概念，翻译成 5 岁小孩都能听懂的童话故事或生活隐喻。",
              icon: "📚",
              category: "课件",
            },
            {
              label: "随堂测试，自动出题",
              description:
                "老师的“减负”利器。根据授课内容秒级生成配套的单选、多选及讨论题，并附带详细的解题思路与评分标准。",
              icon: "📚",
              category: "课件",
            },
            {
              label: "竞标方案，痛点直击",
              description:
                "对比甲方需求书与公司过往案例，AI 自动锁定客户关心的关键指标，精准输出极具说服力的技术投标方案。",
              icon: "📄",
              category: "方案",
            },
            {
              label: "会议纪要，行动闭环",
              description:
                "从杂乱的速记中过滤废话，自动生成包含“议定事项”、“责任人”及“截止日期”的正式纪要，让会议真正落地。",
              icon: "📄",
              category: "方案",
            },
            {
              label: "危机公关，情绪克制",
              description:
                "针对突发负面舆情，起草一份专业、得体且逻辑严密的官方声明，在维护形象的同时有效降低舆论负面影响。",
              icon: "📄",
              category: "方案",
            },
            {
              label: "合同条款，风险筛查",
              description:
                "商务小白必备。扫描合同文本，用大白话指出其中的“责任不对等”、“陷阱条款”或“赔偿漏洞”，防范法律风险。",
              icon: "📄",
              category: "方案",
            },
            {
              label: "摘要升华，学术质感",
              description:
                "将口语化的实验过程描述，重构为符合顶刊要求的、充满专业高级感和逻辑严谨性的学术摘要。",
              icon: "🎓",
              category: "论文",
            },
            {
              label: "引用排版，一键矫正",
              description:
                "不再为格式抓狂。只需输入杂乱的文献信息，AI 瞬间按 APA、MLA 或 GB/T 7714 标准完成精准排列。",
              icon: "🎓",
              category: "论文",
            },
            {
              label: "润色降重，语义替换",
              description:
                "在不改变原意的前提下，通过深度句式重组和近义词替换，有效降低论文查重率，同时提升表达流畅度。",
              icon: "🎓",
              category: "论文",
            },
            {
              label: "开题报告，逻辑闭环",
              description:
                "根据研究方向，自动推导研究意义、现状分析及拟解决的关键问题，为你构建一份严丝合缝的开题草案。",
              icon: "🎓",
              category: "论文",
            },
            {
              label: "小红书感，情绪种草",
              description:
                "自动为产品说明植入大量 Emoji、亲切口吻和热门标签，制造出让人忍不住想点赞收藏的爆款“氛围感”文案。",
              icon: "📱",
              category: "社媒文案",
            },
            {
              label: "短视频，黄金开头",
              description:
                "针对视频完播率低的痛点，设计 5 个能在前 3 秒精准钩住用户注意力、大幅提升停留时长的黄金开头（Hook）。",
              icon: "📱",
              category: "社媒文案",
            },
            {
              label: "推文标题，点击黑马",
              description:
                "基于心理学诱因，自动生成悬念式、反差式等多种风格的爆款标题，显著提升文章在朋友圈的点击率。",
              icon: "📱",
              category: "社媒文案",
            },
            {
              label: "热点关联，借势营销",
              description:
                "输入当前的微博或抖音热搜词，AI 自动脑暴品牌结合点，帮你快人一步产出高互动率的借势推文。",
              icon: "📱",
              category: "社媒文案",
            },
          ],
        },
      },
      placeholder: webCpu.messages[lang].inputUrlTips,
      textContent: "",
      supportGap: "120px",
      email: "liuwenjin886@outlook.com",
      fileList: [],
      textFromImage: "",
      isTyping: false,
      manifestUrl: "bucket/publicApps/agentExample/manifest.json",
      currentImageItem: null,
      requirement: "",
      openedFile: "",
      currentApp: {},
      lang: lang,
      logined: localStorage.folderName,
      condition: {
        folderName: "",
      },
      placeholderTimer: null, // 定时器引用
      placeholderIndex: 0, // 当前索引
      placeholderPrefix: [
        // 轮播内容列表
        "请输入你的应用需求，例如：",
        "试试输入：",
        "尝试描述：",
        "输入需求：",
      ],
      placeholderList: [
        // 轮播内容列表
        "请输入你的应用需求，例如：帮我自动写小红书文案",
        "试试输入：自动回复客户咨询",
        "尝试描述：帮我分析销售数据",
        "输入需求：每天生成工作日报",
      ],
      dialogStyle: {
        background: "#fff",
        maxWidth: "1000px",
        width: "95%",
        maxHeight: "95%",
        boxShadow: "2px 2px 2px #999",
        borderRadius: "5px",
        borderTop: "solid 1px #ddd",
        borderLeft: "solid 1px #ddd",
        overflow: "hidden",
      },
      myShareList: {
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
              item.publishStatus =
                item.publishStatus === "true" ? "已发布" : "";
              if (item.publishInfo) {
                let pInfo = JSON.parse(item.publishInfo || "{}");
                item.appOwner = pInfo.user;
              }
              item.appOwner = item.appOwner;
              item._appLabel = item.appOwner
                ? item.appOwner + " - " + (item.appLabel || item.appName)
                : item.appLabel || item.appName;
              return item;
            });
            ret.page = ret.page || {};
            ret.page.currentPage = d.pagination.pageNo;
            ret.page.pageSize = d.pagination.pageSize;
            ret.page.total = d.pagination.total;
            let _self = this;
            this.methods.confirmSearchResult = function () {
              let value = this.filterOption.value;
              _self.query.pageNo = 1;
              _self.query.condition = JSON.stringify({
                name: {
                  $regex: value,
                  $options: "i",
                },
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
              label: "名称",
              value: "",
              status: true,
              buttonText: "搜索",
              placeholder: "请输入名称进行搜索",
              style: {
                maxWidth: "300px",
              },
            },
            info: [],
            gutter: 20,
            span: WebTool.adjustSize([false, false, true]) ? 24 : 12,
            cardStyle: {
              border: "solid 1px #f8f8fa",
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
              publishStatus: {
                style: {
                  position: "absolute",
                  display: "inline-block",
                  fontSize: "10px",
                  color: "#999",
                  width: "70px",
                  left: "140px",
                  bottom: "-25px",
                  width: "125px",
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
                prop: "publishStatus",
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
      requireQuestionApp: {
        url: "/webApps/document/requireQuestions.vue",
        className: "ElementVueItem",
      },
      generateProgressApp: {
        url:
          webCpu.documentPrefix + "/webApps/document/generateProgressPanel.vue",
        className: "ElementVueItem",
      },
      clonePanelApp: {
        url: webCpu.documentPrefix + "/webApps/document/cloneAppItem.vue",
        className: "ElementVueItem",
      },
      interface: {
        documentList: {
          url: webCpu.documentPrefix + "/user/getPublishedList",
          method: "get",
        },
        deleteDocumentData: {
          url: webCpu.documentPrefix + "/user/deleteDocumentData",
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
        myAppList: {
          url: webCpu.documentPrefix + "/user/getLoginedData",
          method: "post",
        },
      },
    };
  },
  mounted() {
    this.initAdapter();
    this.loadingDefaultConfig();

    this.placeholderList = this.meta.exampleData.list.map((item) => {
      return (
        this.placeholderPrefix[
          Math.floor(Math.random() * this.placeholderPrefix.length)
        ] + item.label
      );
    });

    this.requirement = "";
    let input = WebTool.urlQuery(location.href, "input");

    if (input) {
      this.isTyping = true;
      this.typeInputContent(
        input,
        () => {
          console.log("INPUT", this.textContent);
          this.isTyping = false;
          if (this.auto) {
            this.aigcRequest();
          }
        },
        200
      );
    } else {
      if (this.auto) {
        this.aigcRequest();
      }
    }

    let userInfo = JSON.parse(localStorage.userInfo || "{}");
    if (userInfo.role && userInfo.role.indexOf("partner") !== -1) {
      this.isPartner = true;
    }

    if (localStorage.folderName) {
      this.isLogined = true;
    } else {
      this.isLogined = false;
    }

    // 初始化时加载第一页数据
    this.searchAppCards();
    this.updateMyApps();
    this.$nextTick(() => {
      let h = this.$refs.oneKeyContainer.clientHeight;
      let h1 = this.$refs.sloganInfoContainer.clientHeight;
      let h2 = this.$refs.aiPromptContainer.clientHeight;
      let h3 = this.$refs.bottomInfoContainer
        ? this.$refs.bottomInfoContainer.clientHeight
        : 0;
      this.supportGap = Math.max(h - h1 - h2 - h3 - 35, 70) + "px";
    });
    let _self = this;
    webCpu.mitt.on("confirmTask", function (value) {
      _self.confirmTask(value);
      setTimeout(() => {
        webCpu.CardItem.dismissMask(_self._parent.card);
      }, 1000);
    });

    webCpu.mitt.on("generatePanelClosed", function () {
      _self.isTransforming = false;
    });

    if (
      aigcInterface &&
      aigcInterface.interface &&
      aigcInterface.interface.aigcGateway
    ) {
      this.defaultModel = aigcInterface.interface.aigcGateway.query.model;
      this.defaultPlatform = aigcInterface.interface.aigcGateway.query.apiName;

      aigcInterface.updateModelList((tData) => {
        this.configDialog.formData.priceMap =
          tData.priceMap || this.configDialog.formData.priceMap;
        this.configDialog.formData.modelMap =
          tData.modelMap || this.configDialog.formData.modelMap;
      });
    }

    this.startPlaceholderCarousel();
    if (this.flag) {
      this.adapterExampleData();
    }
  },
  beforeUnmount() {
    // Vue 3 使用 beforeUnmount，Vue 2 使用 beforeDestroy
    this.stopPlaceholderCarousel();
    if (this.$refs.oneKeyContainer) {
      this.$refs.oneKeyContainer.removeEventListener(
        "scroll",
        this.handleScroll
      );
    }
  },
  methods: {
    sanitizeHtml(html) {
      return window.WebTool && typeof window.WebTool.sanitizeHtml === "function"
        ? window.WebTool.sanitizeHtml(html)
        : html;
    },
    confirmStartTask() {},
    handleCloneCommand(command){
      if (command === "cloneSkill") {
        console.log("执行克隆 AI 技能");
        // 这里调用具体的克隆技能逻辑
        this.cloneAppItem("skill");
      } else if (command === "cloneAgent") {
        console.log("执行克隆聊天 Agent");
        // 这里调用具体的克隆 Agent 逻辑
        this.cloneAppItem("agent");
      }
    },
    cloneAppItem(type) {
      let app = this.clonePanelApp;
      if(type === "agent") {
        app.dsl = app.dsl || {};
        app.dsl.data = app.dsl.data || {};
        app.dsl.data.manifestUrl = this.manifestUrl;
      }
      else {
        app.dsl = {}
      }
      if (!localStorage.folderName || !localStorage.logined) {
        this.$message({
          type: "warning",
          message: "请先登录后再克隆应用",
        });
        aigcInterface.openLoginDialog();
        return;
      }
      let style = JSON.parse(JSON.stringify(this.dialogStyle));

      webCpu.renderCardDialog(
        document.body,
        app,
        {
          dialogName: "cloneAppDialog",
          title: "克隆应用",
          titleStyle: {
            background: "var(--el-color-primary-light-9)",
            color: "var(--el-color-primary)",
          },
          closeType: "back"
        },
        style
      );
    },
    adapterExampleData() {
      let arr = this.meta.exampleData.list.slice(0, 2);
      this.meta.exampleData.list = arr;
      arr = this.meta.exampleData.moreArray.slice(2);
      this.meta.exampleData.moreArray = arr.concat(
        this.meta.exampleData.moreArray
      );
    },
    inputExmpaleText(text) {
      this.textContent = text.label + ": " + text.description || text;
      this.$message({
        type: "success",
        message: "已将示例内容填入输入框",
      });
    },
    typeInputContent(input, callback, gap) {
      let i = 1;
      let t = setInterval(() => {
        this.textContent = input.substring(0, i);
        if (this.textContent === input) {
          clearInterval(t);
          this.$nextTick(() => {
            if (typeof callback === "function") {
              callback(this.textContent);
            }
          });
        }
        i++;
      }, gap || 100);
    },
    loadingDefaultConfig() {
      if (localStorage.currentPromptContent && window.parent !== window) {
        this.textContent = localStorage.currentPromptContent;
      }
      if (localStorage.apiDefaultConfig) {
        window.aigcInterface.interface.aigcGateway.query = JSON.parse(
          localStorage.apiDefaultConfig
        );
      }
    },
    // 开启 Placeholder 轮播
    startPlaceholderCarousel() {
      // 初始赋值
      this.meta.inputPlaceholder = this.placeholderList[0];

      // 设置定时器，每 3 秒切换一次
      this.placeholderTimer = setInterval(() => {
        this.placeholderIndex =
          (this.placeholderIndex + 1) % this.placeholderList.length;
        this.meta.inputPlaceholder =
          this.placeholderList[this.placeholderIndex];
      }, 3000);
    },

    // 停止轮播（可选：当用户开始输入时停止）
    stopPlaceholderCarousel() {
      if (this.placeholderTimer) {
        clearInterval(this.placeholderTimer);
        this.placeholderTimer = null;
      }
    },
    openConfigDialog() {
      if (localStorage.apiDefaultConfig) {
        this.configDialog.value = JSON.parse(localStorage.apiDefaultConfig);
      }
      if (this.configDialog.value.model) {
        let item =
          this.configDialog.formData.priceMap[this.configDialog.value.model] ||
          {};
        this.configDialog.value.apiName = item.from || "国内";
      }
      this.configDialog.value = this.configDialog.value || {};
      this.configDialog.visible = true;
    },
    confirmSelected() {
      this.configDialog.value = this.configDialog.value || {};
      if (this.configDialog.value.apiName !== "custom") {
        delete this.configDialog.value.apiKey;
        delete this.configDialog.value.url;
      }
      if (this.configDialog.value.model) {
        this.configDialog.value.apiName =
          this.configDialog.formData.priceMap[this.configDialog.value.model]
            .apiName || this.configDialog.value.apiName;
      } else {
        this.$message({
          type: "warning",
          message: "需要选择一个模型",
        });
      }
      webCpu.appConfig.currentAppType = this.configDialog.value.inputType;
      this.configDialog.value.inputType = "";
      window.aigcInterface.interface.aigcGateway.query =
        this.configDialog.value;
      this.updateWorkflowConfig(this.configDialog.value);
      this.configDialog.visible = false;
    },
    updateWorkflowConfig(query) {
      query = query || {};
      if (query.model && query.apiName) {
        for (let key in webCpu.appConfig.aigcWorkflow) {
          webCpu.appConfig.aigcWorkflow[key].query = query;
        }
      }
      localStorage.apiDefaultConfig = JSON.stringify(query);
    },
    handleChangeConfig(item) {
      if (item.prop === "apiName") {
        this.configDialog.value.model = "";
      }
    },
    aigcRequest() {
      if (typeof gtag === "function") {
        gtag("event", "create_agent");
      }
      if (this.textContent.trim() === "") {
        this.$message({
          type: "warning",
          message: "请输入需求内容",
        });
        return;
      }
      this.isTransforming = true;
      let query = JSON.parse(
        JSON.stringify(aigcInterface.interface.aigcGateway.query)
      );
      let apiName = WebTool.urlQuery(location.href, "apiName") || "";
      query.apiName = apiName;
      let model = WebTool.urlQuery(location.href, "model") || "";
      query.model = model;

      if (this.aigcMode === "multi") {
        aigcInterface.createWorkflow(
          this.textContent,
          (d) => {
            console.log(d);
            location.href = `${webCpu.documentPrefix}?id=${d}`;
          },
          {
            elem: this.$refs.inputContentItem,
          }
        );
      } else if (this.aigcMode === "single") {
        aigcInterface.createAigcApp(
          this.textContent,
          (d) => {
            console.log(d);
            location.href = `${webCpu.documentPrefix}?id=${d}`;
          },
          {
            elem: this.$refs.inputContentItem,
          },
          (e) => {
            this.isTransforming = false;
          }
        );
      } else {
        this._aigcRequest();
      }
    },
    _aigcRequest() {
      this.isTransforming = true;
      this.loadingText = this.textArray[0];
      if (this.requirement) {
        this.loadingText = this.textArray[1];
        this.startStepLoading("second");
        this.confirmStartTask();
      } else {
        this.startStepLoading("first");
        window.aigcRequest(
          {
            content: this.currentApp.requirementPrompt,
            context: this.textContent,
          },
          (tData) => {
            this.isTransforming = false;

            if (typeof gtag === "function") {
              gtag("event", "finish_agent_create");
            }

            if (webCpu.cards.generateProgressPanelCard) {
              let vueItem = webCpu.cards.generateProgressPanelCard.task.vueItem;
              vueItem.finishSmoothly(1000, () => {
                // webCpu.CardItem.dismissMask(elem);
                try {
                  // let json = JSON.parse(tData.usage.result);
                  let json = WebTool.extractJSON(tData.usage.result);
                  this.requirement = `核心需求为${
                    json.key || this.textContent
                  }; MVP功能列表为: ${json.functions.join(",")};界面要求：${
                    json.uiInfo
                  }, 风格需要为，${json.uiStyle}。`;

                  let arr = json.questions || json || [];
                  if (arr.constructor.name !== "Array") {
                    arr = [arr];
                  }
                  this.displayRequireQuestions(arr, json);
                } catch (e) {
                  console.log("error: ", e);
                  // webCpu.CardItem.dismissMask(elem);
                  // webCpu.CardItem.dismissMask(this._parent.card);
                  let pVueItem =
                    webCpu.cards.generateProgressPanelCard.task.vueItem;
                  pVueItem.open(this.stepMap["second"]);
                  this.confirmTask([]);
                }
              });
            }
          }
        );
      }
    },
    displayRequireQuestions(json) {
      let app = this.requireQuestionApp;
      this.isTransforming = false;
      app.dsl = app.dsl || {};
      app.dsl.data = app.dsl.data || {};

      if (json) {
        app.dsl.data.questions = json;
      }
      webCpu.CardItem.renderCardDialog(
        this._parent.card,
        app,
        {
          title: "请选择",
          headerHidden: true,
          closeCallback: () => {
            webCpu.CardItem.dismissMask(this._parent.card);
            webCpu.cards.generateProgressPanelCard.task.vueItem.showBackBtn = true;
          },
        },
        {
          width: "100%",
          maxWidth: "600px",
          height: "450px",
        }
      );
    },
    refreshExampleList(obj) {
      obj = obj || this.meta.exampleData;
      if (!obj || !Array.isArray(obj.moreArray) || !Array.isArray(obj.list)) {
        throw new Error("输入对象结构不正确");
      }

      const length = obj.list.length;
      const candidates = [...obj.moreArray];

      // 随机打乱
      for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
      }

      // 取前 length 个，保证 list 长度不变
      obj.list = candidates.slice(0, length);

      return obj;
    },
    confirmTask(data) {
      this.isTransforming = true;
      this.loadingText = this.textArray[1];
      this.requirement = `${this.textContent}(${this.requirement})`;
      if (data && data.length !== 0) {
        this.textContent = `${this.requirement}\n 需求澄清如下: \n${data.join(
          "\n"
        )}`;
      }
      let pVueItem = webCpu.cards.generateProgressPanelCard.task.vueItem;
      pVueItem.open(this.stepMap["second"]);
      webCpu.cards.generateProgressPanelCard.task.vueItem.showBackBtn = false;
      this.confirmStartTask();
      // this.requirement = "";
    },
    removeInvisibleUnicode(str) {
      let doc = document.createElement("div");
      doc.innerHTML = str;
      return doc.textContent;
    },
    clearInput() {
      this.textContent = "";
      localStorage.currentPromptContent = "";
    },
    openAppLink(card) {
      let url = `${webCpu.documentPrefix}?id=${card.documentId}`;
      if (window.parent !== window || this.api) {
        location.href = url;
      } else {
        window.open(url, "_blank");
      }
    },
    openMoreApps() {
      let app = WebTool.copyObject(this.myShareList);
      app.dsl.query.condition.appAgent = agent;
      app.dsl.query.condition.appName = appName;
      this.currentShareApp = app;
      this._openShareDialog(app, "更多我的 Apps");
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

          if (_self.api || window.parent !== window) {
            location.href = url;
          } else {
            window.open(url, "_blank");
          }
        }
      };
      this.openAppDialog(app, title);
    },
    startStepLoading(mode) {
      let app = this.generateProgressApp;
      app.cardName = "generateProgressPanelCard";
      app.dsl = app.dsl || {};
      app.dsl.data = app.dsl.data || {};
      app.dsl.data.content = this.stepMap[mode] || {};
      let elem = this.$refs.inputContentItem;
      webCpu.CardItem.renderCardDialog(elem, app, {
        dialogName: "progressDialog",
        headerHidden: true,
      });
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
    openAppDialog(app, title, mode, menu, closeCallback) {
      let style = JSON.parse(JSON.stringify(this.dialogStyle));
      style.background = "#fff";
      let tStyle = {};
      if (
        title === this.$t("myPpt") ||
        title === this.$t("mySubscriptions") ||
        title === this.$t("personalInfo")
      ) {
        style.maxWidth = "1200px";
        style.background = "#f8f8fa";
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
        style.maxHeight = this.flag ? "100%" : "700px";
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
        document.body,
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
    /**
     * 搜索/筛选条件变化时调用，重置分页并加载第一页数据
     */
    searchAppCards() {
      this.currentPage = 1; // 重置页码
      this.hasMore = true; // 假设有更多数据
      this.meta.communityInfo.appCards = []; // 清空现有数据
      this.loadingAppCards = true;
      this.updateAppCards(false); // 加载第一页
    },
    /**
     * 滚动事件处理器，用于触发加载更多
     */
    handleScroll() {
      const container = this.$refs.oneKeyContainer;
      if (!container || this.isLoadingMore || !this.hasMore) {
        return;
      }

      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        100;

      if (isNearBottom) {
        this.loadMoreAppCards();
      }
    },
    /**
     * 加载下一页数据
     */
    loadMoreAppCards() {
      if (!this.hasMore || this.isLoadingMore) {
        return;
      }
      this.currentPage++;
      this.updateAppCards(true); // 传入 true 表示追加数据
    },
    updateMyApps() {
      if (!localStorage.folderName) {
        return false;
      }
      this.myApps = [];
      let agent = window.agent;
      let appName = window.appName;
      this.adapter.myAppList(
        {
          pageSize: 5,
          condition: {
            appAgent: agent,
            appName: appName,
          },
        },
        (res) => {
          if (res.code === 0 || res.ret === 0) {
            this.myApps = res.data.map((item) => {
              item.author = item.appOwner;
              item.usageCount = item.usageCount || 1;
              item.title = item.name || item.title;
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
              item.time = formatter.format(date);
              item.image = WebTool.attachParams("/user/getDocumentImage", {
                condition: "documentId",
                documentId: item.documentId,
                key: "image",
                _t: new Date().getTime(),
              });
              return item;
            });
            this.myAppCount = res.pagination.total;
          } else {
            this.$message({
              type: "warning",
              message: "加载我的 Apps 数据失败",
            });
          }
        }
      );
    },
    /**
     * 获取应用卡片数据，支持分页和追加
     * @param {boolean} append 是否将数据追加到现有列表，否则替换现有列表
     */
    updateAppCards(append = false) {
      if (!this.hasMore && append) {
        console.log("没有更多数据了");
        return;
      }

      this.isLoadingMore = true; // 开始加载

      let agent = window.agent;
      let appName = window.appName;

      // 配置请求参数
      this.condition.sort = this.condition.sort || -1;
      this.condition.pageSize = this.pageSize; // 使用 data 中的 pageSize
      this.condition.pageNo = this.currentPage; // 使用 data 中的 currentPage
      //this.condition.lastTime = new Date().getTime();
      this.condition.appAgent = agent;
      this.condition.appName = appName;
      //this.condition.after = new Date().getTime();
      if (
        this.meta.communityInfo.selectedCategory !==
        this.meta.communityInfo.categories[0]
      ) {
        this.condition.type = this.meta.communityInfo.selectedCategory;
      } else {
        delete this.condition.type;
      }

      // 处理所有者筛选
      if (
        this.meta.communityInfo.selectedOwner !== "all" &&
        localStorage.folderName
      ) {
        this.condition.folderName = localStorage.folderName;
      } else {
        delete this.condition.folderName;
      }

      // 处理搜索筛选
      if (this.meta.communityInfo.searchText) {
        this.condition.name = this.meta.communityInfo.searchText;
      } else {
        delete this.condition.name;
      }

      // TODO: 处理类别筛选逻辑（如果后端 API 需要）
      // if (this.meta.communityInfo.selectedCategory !== '所有 Apps') {
      //   this.condition.category = this.meta.communityInfo.selectedCategory;
      // } else {
      //   delete this.condition.category;
      // }

      this.adapter.documentList(this.condition, (res) => {
        this.isLoadingMore = false; // 结束加载
        this.loadingAppCards = false;
        if (res && res.data) {
          //this.total = res.total;
          const newCards = res.data.map((item) => {
            item.author = item.creator || "匿名";
            item.usageCount = item.usageCount || 1;
            item.title = item.name || item.title;
            let _t = new Date().getTime();
            item.image = WebTool.attachParams("/user/getDocumentImage", {
              condition: "documentId",
              documentId: item.documentId,
              key: "image",
              _t: _t,
            });
            item.avatar = WebTool.attachParams("/user/getDocumentImage", {
              condition: "folderName",
              folderName: item.folderName,
              key: "image",
              table: "account",
              _t: _t,
            });
            return item;
          });

          if (append) {
            // 追加数据
            this.meta.communityInfo.appCards =
              this.meta.communityInfo.appCards.concat(newCards);
          } else {
            // 替换数据（第一页或搜索/筛选）
            this.meta.communityInfo.appCards = newCards;
          }

          // 判断是否还有更多数据
          // this.hasMore = this.meta.communityInfo.appCards.length < this.total;
          this.hasMore = !res.isEnd;

          console.log(
            `加载第 ${this.currentPage} 页, 卡片总数: ${this.meta.communityInfo.appCards.length}, 总计: ${this.total}`
          );
        } else {
          // 如果请求失败或返回数据为空
          this.hasMore = false;
        }
      });
    },
    updateDataUrl(arr) {
      for (let i = 0; i < arr.length; i++) {
        WebTool.urlToBase64(arr[i].url, function (str) {
          console.log(str);
          arr[i].url = str;
        });
      }
    },
    initAdapter() {
      var config = this.interface || {};
      this.adapter = webCpu.initAdapter(config);
      return this.adapter;
    },
    handleClickItem(name) {
      webCpu.mitt.emit("openArticleDialog", name);
    },
  },
};
</script>

<style scoped>
/* ============================================
   DESIGN TOKENS — 白与空 · 原研哉设计规范
   注：input 页为「深色 Hero + 浅色卡片」结构，令牌仅作用在浅色面板上，
   不在此处设置整页浅色背景，以保留外层 Hero 深色底。
   ============================================ */
.oneKeyContentArea {
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

.oneKeyContentArea[data-theme="dark"] {
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

/* ... (样式部分保持不变) ... */
.oneKeyContentArea {
  position: relative;
  float: left;
  width: 100%;
  height: 100%;
  padding: 15px 0px 0px 0px;
  /* 重点：设置 overflow: auto 确保容器是可滚动的，才能监听滚动事件 */
  overflow: auto;
}

.aiGenerateArea {
  position: relative;
  width: 100%;
  float: left;
  text-align: center;
  padding: 0px 20px;
  display: inline-block;
}

.inputContentArea {
  margin: auto;
  display: inline-block;
  position: relative;
  text-align: left;
  width: 100%;
  height: auto;
  background-color: #ffffff;
  max-width: 700px;
  padding: 15px;
  border-radius: 0px;
  overflow: hidden;
}

.inputContentArea .el-textarea textarea {
  border-radius: 0px;
}

.el-checkbox__label {
  padding-left: 3px;
  vertical-align: middle;
  padding-bottom: 4px;
}

.el-select-dropdown__item {
  padding-right: 3px;
  margin-top: 3px;
}

.selectImageBtn {
  position: absolute;
  bottom: 15px;
  right: 15px;
}

.imageProgressTips {
  position: absolute;
  bottom: 48px;
  right: 63px;
  transform: scale(0.24);
  transform-origin: 100% 100%;
}

.oneKeyContentArea[flag="true"] .selectImageBtn {
  position: absolute;
  bottom: 15px;
  right: 33px;
}

.currentImageItem {
  position: absolute;
  bottom: 0px;
  right: 5px;
}

.oneKeyContentArea[flag="true"] .currentImageItem {
  position: absolute;
  bottom: 0px;
  right: 25px;
}

.currentImageItem .el-image {
  height: 60px;
  width: 80px;
}

.currentImageItem .removeImgBtn {
  position: absolute;
  left: -10px;
  top: -10px;
}

.sloganInfoArea {
  position: relative;
  float: left;
  width: 100%;
  margin: auto;
  display: inline-block;
  color: #fff;
  text-align: left;
  padding: 55px 20px 55px 20px;
  font-weight: 800;
}

.sloganInfoArea > p {
  position: relative;
  margin: auto;
  width: 100%;
  margin-bottom: 10px;
  text-align: center;
}

.sloganInfoArea > p:nth-child(1) {
  font-size: 24px;
}

.sloganInfoArea > p:nth-child(2) {
  font-size: 16px;
  text-shadow: -1px 1px rgba(26, 26, 30, 0.2);
}

.shiny-button.el-button {
  color: #fff;
  padding: 0.6em 1.2em;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.08em;
  /* 白与空：覆盖模板中的蓝色渐变 Tailwind 类，收敛为墨色直角按钮 */
  background: var(--muse-primary, #1a1a1e) !important;
  background-image: none !important;
  border-radius: 0px !important;
  box-shadow: none !important;
  transition: background-color 0.2s ease, box-shadow 0.3s ease,
    transform 0.1s ease;
}

.clone-app-button {
  float: right;
  margin-right: 15px;
}

.shiny-button.el-button:hover {
  background: var(--muse-primary-hover, #2b2b31) !important;
  box-shadow: 0 10px 30px rgba(20, 20, 30, 0.16) !important;
  transform: translateY(-1px);
}

.shiny-button.el-button:active {
  transform: translateY(1px);
  /* 白与空：1px 下沉按压感 */
}

.el-card__body {
  position: relative;
  float: left;
  width: 100%;
}

.idea-section-container {
  padding: 10px 0;
  /* 垂直内边距 */
  font-family: Arial, sans-serif;
  /* 假设字体 */
  display: flex;
  justify-content: center;
  /* 内容居中 */
  width: 100%;
}

/* 限制内容的宽度，并居中 */
.idea-section-content {
  max-width: 1200px;
  width: 100%;
  position: relative;
  /* 方便定位 "More ideas" 按钮 */
}

/* 标题样式 */
.section-title {
  color: var(--muse-text-secondary);
  /* 深色文字 */
  font-size: 12px;
  /* 字体大小 */
  font-weight: 500;
  /* 中等粗细 */
  padding: 0px;
  margin-bottom: 0px;
}

/* "More ideas" 按钮样式 */
.more-ideas-button {
  display: inline-block;
}

.el-input__wrapper {
  width: 100%;
}

.el-loading-mask {
  border-radius: 0px;
}

/* 创意按钮行容器 */
.ideas-buttons-row {
  display: flex;
  padding-top: 10px;
  gap: 15px;
  /* 按钮之间的间距 */
  overflow-x: auto;
  /* 防止内容溢出 */
  padding-bottom: 5px;
  /* 防止阴影被裁剪 */
}

/* 核心创意按钮样式 */
.idea-button {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  border-radius: var(--radius-full);
  /* 大圆角胶囊，对齐 ChatBox 空状态引导 Chip */
  font-size: 0.75rem;
  color: var(--muse-text-secondary);
  font-weight: 500;
  font-family: var(--font-system);
  cursor: pointer;
  white-space: nowrap;
  border: 1px solid var(--muse-border);
  background-color: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: all var(--duration-base) ease;
}

.idea-button:hover {
  transform: translateY(-2px);
  /* 轻微上浮效果 */
  background: var(--muse-surface);
  border-color: var(--muse-primary);
  color: var(--muse-primary);
  box-shadow: 0 2px 8px rgba(26, 26, 30, 0.10);
}

.stepItemArea {
  width: 100%;
  display: inline-block;
  position: relative;
  float: left;
  font-size: 12px;
}

.stepItemArea .el-textarea {
  height: 100%;
}

.stepItemArea .el-textarea textarea {
  height: 100%;
  padding-left: 15px;
  padding-top: 15px;
}

.selectFileItem {
  transform: scale(1.2);
  transform-origin: 20px 50px;
  width: 40px;
  vertical-align: middle;
  display: inline-block;
}

.selectFileItem .selectFileLabel {
  color: #aaa;
  width: 40px;
  cursor: pointer;
  border: none !important;
}

.myAppsArea {
  margin-top: 30px;
}

.communityArea,
.myAppsArea {
  position: relative;
  float: left;
  width: 100%;
  height: auto;
  padding: 20px 20px;
  margin-top: 30px;
  color: #fff;
}

.communityArea .el-radio__input {
  display: none;
}

.communityArea .el-select__wrapper {
  border-radius: 0px;
}

.contentItem {
  width: 100%;
  overflow: hidden;
  height: 100%;
}

.selectModule {
  margin-top: 60px;
}

.optionsArea {
  position: absolute;
  display: inline-block;
  bottom: 18px;
  left: 8px;
  z-index: 3;
}

.optionsArea .el-checkbox {
  margin-bottom: 0px !important;
  line-height: 22px;
  height: 22px;
}

.optionsArea .el-popper.is-light {
  overflow: hidden !important;
}

.optionsArea .el-select-dropdown__wrap {
  max-height: 145px;
  overflow: auto;
}

.selectModule .contentItem {
  border: solid 0px #f8f8fa;
}

.confirmItem {
  text-align: center;
  padding-right: 5px;
  margin-top: 35px;
}

.confirmItem .el-button {
  max-width: 350px;
  width: 90%;
  height: 50px;
  line-height: 50px;
  border-radius: 0px;
  font-size: 20px;
  border: none;
  font-weight: bold;
}

.communityArea .el-input__wrapper {
  border: none;
  box-shadow: none;
}

.communityArea .el-radio {
  margin-right: 5px;
  border-radius: 0px;
  margin-bottom: 0px;
}

.communityArea .el-radio.is-bordered.is-checked {
  background: #fff;
}

.communityArea .el-radio.is-bordered.el-radio--small {
  padding: 5px 10px;
  color: #fff;
}

.communityArea .el-radio__label {
  padding-left: 0px;
}

.el-avatar {
  background-color: transparent;
}

.supportInfoArea {
  padding-bottom: 15px;
}

.exampleListArea {
  padding: 0px 0px;
  position: relative;
  float: left;
  width: 100%;
}

/* ============================================
   白与空 统一 · 输入面板与 Element Plus 控件
   ============================================ */
.inputContentArea {
  background-color: var(--glass-bg) !important;
  border: 1px solid var(--muse-border) !important;
  border-radius: var(--radius-3xl) !important;
  box-shadow: var(--glass-shadow) !important;
  backdrop-filter: saturate(160%) blur(16px);
  -webkit-backdrop-filter: saturate(160%) blur(16px);
  transition: box-shadow var(--duration-slow) ease,
    border-color var(--duration-slow) ease;
}

.inputContentArea:focus-within {
  border-color: var(--muse-primary) !important;
  box-shadow: 0 0 0 3px var(--muse-primary-ring), var(--glass-shadow-hover) !important;
}

.sloganInfoArea > p:nth-child(2) {
  text-shadow: -1px 1px rgba(26, 26, 30, 0.2);
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

/* 卡片：16px 圆角 + 悬浮上浮 */
:deep(.el-card) {
  border-radius: var(--radius-3xl) !important;
  transition: all var(--duration-base) ease;
}

:deep(.el-card.is-hover-shadow:hover) {
  transform: translateY(-2px);
  box-shadow: var(--glass-shadow-hover) !important;
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
