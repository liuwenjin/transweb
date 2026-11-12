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
                class="inputTextareaWrap"
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
                  :aria-label="meta.inputPlaceholder"
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
                class="inputActionGroup"
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
                  class="config-model-btn"
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
          <div class="community-search-group tw-w-full md:tw-w-96">
            <el-input
              class="community-search-input"
              @change="searchAppCards()"
              v-model="meta.communityInfo.searchText"
              :placeholder="meta.communityInfo.searchPlaceholder"
              :aria-label="meta.communityInfo.searchPlaceholder"
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
              class="community-owner-wrap tw-w-full md:tw-w-auto tw-justify-end"
            >
              <el-select
                @change="searchAppCards()"
                v-model="meta.communityInfo.selectedOwner"
                placeholder="所有创作者"
                class="community-owner-select tw-w-40"
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
      class="custom-dragging-style input-config-dialog"
      :title="configDialog.title"
      width="600"
      align-center
      append-to-body
    >
      <el-form
        :label-width="configDialog.formData.labelWidth"
        label-position="left"
        :model="configDialog.value"
      >
        <el-form-item>
          <template #label>
            <span class="config-label-text" style="white-space: nowrap;">{{ configDialog.formData.data[0].label }}</span>
          </template>
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
        <el-form-item v-if="configDialog.value.apiName === 'custom'">
          <template #label>
            <span class="config-label-text" style="white-space: nowrap;">{{ configDialog.formData.data[1].label }}</span>
          </template>
          <el-input
            size="small"
            placeholder="输入 API 的 URL"
            v-model="configDialog.value[configDialog.formData.data[1].prop]"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item>
          <template #label>
            <span class="config-label-text" style="white-space: nowrap;">{{ configDialog.formData.data[2].label }}</span>
          </template>
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
        <el-form-item v-if="configDialog.value.apiName === 'custom'">
          <template #label>
            <span class="config-label-text" style="white-space: nowrap;">{{ configDialog.formData.data[3].label }}</span>
          </template>
          <el-input
            size="small"
            type="password"
            :placeholder="configDialog.formData.data[3].placeholder"
            v-model="configDialog.value[configDialog.formData.data[3].prop]"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item v-if="configDialog.value.apiName !== 'custom'">
          <template #label>
            <span class="config-label-text" style="white-space: nowrap;">价格(输入)</span>
          </template>
          <span class="config-value">
            {{
              configDialog.formData.priceMap[
                configDialog.value.model || defaultModel
              ].in
            }}
          </span>
          <span class="config-price-unit config-value">(积分 / 百万 tokens)</span>
        </el-form-item>
        <el-form-item v-if="configDialog.value.apiName !== 'custom'">
          <template #label>
            <span class="config-label-text" style="white-space: nowrap;">价格(输出)</span>
          </template>
          <span class="config-value">
            {{
              configDialog.formData.priceMap[
                configDialog.value.model || defaultModel
              ].out
            }}
          </span>
          <span class="config-price-unit config-value">(积分 / 百万 tokens)</span>
        </el-form-item>
        <el-form-item v-if="configDialog.value.apiName !== 'custom'">
          <template #label>
            <span class="config-label-text" style="white-space: nowrap;">佣金比例</span>
          </template>
          <span class="config-value">0.1</span>
        </el-form-item>
        <el-form-item v-else>
          <template #label>
            <span class="config-label-text" style="white-space: nowrap;">价格(转发)</span>
          </template>
          <span class="config-value">100 积分 / 次</span>
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
          labelWidth: 140,
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
    this.loadHaraTheme();
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
    // 加载原研哉「白与空」主题（仅视觉层，不改变任何交互逻辑）
    loadHaraTheme() {
      if (document.getElementById("hara-theme-css")) return;
      const link = document.createElement("link");
      link.id = "hara-theme-css";
      link.rel = "stylesheet";
      link.href = "/common/hara.css";
      document.head.appendChild(link);
    },
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
/* ==========================================================================
   原研哉「白与空」· input.vue（Skill 生成器输入页）
   --------------------------------------------------------------------------
   纸白 #fafaf9 / 面白 #ffffff / 墨色 #1a1a1e / 淡墨 #6f6f6a / 发丝线 #e6e6e2
   无圆角、无渐变、无彩色强调；层级只由 1px 线、留白与字重建立。
   仅重写 .oneKeyContentArea 内部样式，模板结构与交互逻辑保持不变。
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. 设计令牌
   -------------------------------------------------------------------------- */
.oneKeyContentArea {
  --paper: var(--hara-paper, #fafaf9);
  --surface: var(--hara-surface, #ffffff);
  --ink: var(--hara-ink, #1a1a1e);
  --ink-soft: var(--hara-ink-soft, #2b2b31);
  --secondary: var(--hara-secondary, #6f6f6a);
  --tertiary: var(--hara-tertiary, #a3a39e);
  --line: var(--hara-line, #e6e6e2);
  --line-strong: var(--hara-line-strong, #b9b9b4);
  --hover: var(--hara-hover, #f4f4f1);
  --active: var(--hara-active, #ecece8);
  --ring: var(--hara-ring, rgba(26, 26, 30, 0.1));
  --success: var(--hara-success, #3f5b47);
  --error: var(--hara-error, #8e3b33);
  --error-bg: var(--hara-error-bg, #faf3f2);

  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  --dur: 0.18s;

  /* Element Plus 令牌：全部收束到墨色/纸白体系 */
  --el-color-primary: var(--ink);
  --el-color-primary-light-3: var(--ink-soft);
  --el-color-primary-light-5: #4a4a50;
  --el-color-primary-light-7: #8a8a85;
  --el-color-primary-light-8: var(--line-strong);
  --el-color-primary-light-9: var(--hover);
  --el-color-primary-dark-2: #000000;
  --el-color-success: var(--success);
  --el-color-success-light-9: #f3f6f3;
  --el-color-warning: var(--secondary);
  --el-color-warning-light-9: var(--hover);
  --el-color-danger: var(--error);
  --el-color-danger-light-9: var(--error-bg);
  --el-color-error: var(--error);
  --el-color-info: var(--secondary);
  --el-text-color-primary: var(--ink);
  --el-text-color-regular: var(--ink);
  --el-text-color-secondary: var(--secondary);
  --el-text-color-placeholder: var(--tertiary);
  --el-text-color-disabled: var(--tertiary);
  --el-border-color: var(--line);
  --el-border-color-light: var(--line);
  --el-border-color-lighter: var(--line);
  --el-border-color-extra-light: var(--line);
  --el-border-color-dark: var(--line-strong);
  --el-border-color-darker: var(--line-strong);
  --el-fill-color: var(--hover);
  --el-fill-color-light: var(--hover);
  --el-fill-color-lighter: #f8f8f6;
  --el-fill-color-blank: var(--surface);
  --el-bg-color: var(--surface);
  --el-bg-color-page: var(--paper);
  --el-bg-color-overlay: var(--surface);
  --el-mask-color: rgba(250, 250, 249, 0.86);
  --el-border-radius-base: 0;
  --el-border-radius-small: 0;
  --el-border-radius-round: 0;
  --el-border-radius-circle: 0;
  --el-font-size-base: 1rem;
  --el-font-size-medium: 0.9375rem;
  --el-font-size-small: 0.875rem;
  --el-component-size: 44px;
  --el-component-size-large: 48px;
  --el-component-size-small: 36px;
  --el-box-shadow-light: 0 1px 2px rgba(20, 20, 20, 0.04);

  font-family: var(--font-sans);
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* --------------------------------------------------------------------------
   2. 页面容器
   -------------------------------------------------------------------------- */
.oneKeyContentArea {
  position: relative;
  float: left;
  width: 100%;
  height: 100%;
  min-height: 100%;
  padding: 0 0 72px;
  overflow: auto;
  box-sizing: border-box;
  background-color: var(--paper) !important;
  background-image: none !important;
  scrollbar-width: thin;
  scrollbar-color: var(--line-strong) transparent;
}

.oneKeyContentArea::-webkit-scrollbar {
  width: 8px;
}

.oneKeyContentArea::-webkit-scrollbar-track {
  background: transparent;
}

.oneKeyContentArea::-webkit-scrollbar-thumb {
  background: var(--line-strong);
  border-radius: 0;
}

.aiGenerateArea {
  position: relative;
  display: block;
  float: none;
  width: 100%;
  padding: 0 24px;
  text-align: center;
  box-sizing: border-box;
}

/* --------------------------------------------------------------------------
   3. Hero：大留白 + 墨色排版
   -------------------------------------------------------------------------- */
.sloganInfoArea {
  position: relative;
  float: none;
  width: 100%;
  margin: 0;
  padding: 96px 24px 56px;
  color: var(--ink);
  text-align: center;
  box-sizing: border-box;
}

.sloganInfoArea > p {
  position: relative;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}

.oneKeyContentArea .sloganInfoArea .z-text,
.oneKeyContentArea .sloganInfoArea > p {
  color: var(--ink) !important;
  -webkit-text-fill-color: var(--ink) !important;
  background: none !important;
  text-shadow: none !important;
}

.oneKeyContentArea .sloganInfoArea .z-text,
.oneKeyContentArea .sloganInfoArea > p:nth-child(1) {
  font-size: clamp(1.75rem, 3.2vw, 2.5rem) !important;
  font-weight: 500 !important;
  line-height: 1.22 !important;
  letter-spacing: -0.02em !important;
  text-wrap: balance;
}

.oneKeyContentArea .sloganInfoArea .z-text *,
.oneKeyContentArea .sloganInfoArea > p * {
  color: var(--ink) !important;
  -webkit-text-fill-color: var(--ink) !important;
  background: none !important;
}

.oneKeyContentArea .sloganInfoArea > p:nth-child(2) {
  max-width: 620px;
  margin-top: 18px !important;
  font-size: 0.9375rem !important;
  font-weight: 400 !important;
  line-height: 1.75 !important;
  letter-spacing: 0 !important;
  color: var(--secondary) !important;
  -webkit-text-fill-color: var(--secondary) !important;
  text-shadow: none !important;
}

/* 内嵌 / 紧凑模式 */
.oneKeyContentArea[flag="true"] .sloganInfoArea {
  padding: 48px 20px 28px;
}

.oneKeyContentArea[flag="true"] .sloganInfoArea .z-text,
.oneKeyContentArea[flag="true"] .sloganInfoArea > p:nth-child(1) {
  font-size: 1.5rem !important;
  line-height: 1.3 !important;
}

.oneKeyContentArea[flag="true"] .sloganInfoArea > p:nth-child(2) {
  margin-top: 10px !important;
  font-size: 0.875rem !important;
}

/* --------------------------------------------------------------------------
   4. 输入卡片：面白 + 发丝线，无投影
   -------------------------------------------------------------------------- */
.inputContentArea {
  position: relative;
  display: block;
  width: 100%;
  max-width: 720px;
  height: auto;
  margin: 0 auto;
  padding: 28px;
  box-sizing: border-box;
  border: 1px solid var(--line) !important;
  border-radius: 0 !important;
  background: var(--surface) !important;
  box-shadow: none !important;
  text-align: left;
  overflow: hidden;
  transition: border-color var(--dur) ease;
}

.inputContentArea:focus-within {
  border-color: var(--line-strong) !important;
  outline: none !important;
  box-shadow: none !important;
}

/* 输入区布局：第一行文本框，第二行操作条 */
.stepItemArea {
  position: relative;
  display: block !important;
  width: 100% !important;
  padding-bottom: 0 !important;
  float: none !important;
  font-size: 0.8125rem;
}

.inputTextareaWrap {
  display: block !important;
  width: 100% !important;
  height: auto !important;
  float: none !important;
}

.stepItemArea .el-textarea {
  height: auto;
}

.oneKeyContentArea .stepItemArea .el-textarea__inner {
  display: block;
  width: 100%;
  padding: 18px 20px 76px !important;
  border: 1px solid var(--line-strong) !important;
  border-radius: 0 !important;
  background: var(--surface) !important;
  box-shadow: none !important;
  color: var(--ink) !important;
  font-family: var(--font-sans) !important;
  font-size: 1rem !important;
  line-height: 1.75 !important;
  letter-spacing: 0;
  resize: none;
  transition: border-color var(--dur) ease;
}

.oneKeyContentArea .stepItemArea .el-textarea__inner::placeholder {
  color: var(--tertiary) !important;
  opacity: 1;
}

.oneKeyContentArea .stepItemArea .el-textarea__inner:hover {
  border-color: var(--ink) !important;
}

.oneKeyContentArea .inputContentArea .stepItemArea .el-textarea__inner:focus {
  border-color: var(--ink) !important;
  outline: none !important;
  outline-offset: 0 !important;
  box-shadow: none !important;
}

/* 输入框内部不再整块高亮 */
.inputContentArea:focus-within,
.stepItemArea:focus-within,
.el-input:focus-within,
.el-select:focus-within,
.el-textarea:focus-within {
  outline: none;
}

/* --------------------------------------------------------------------------
   5. 操作条：清空（次级）/ 算力（次级）/ 生成（墨色主操作）
   -------------------------------------------------------------------------- */
.stepItemArea .optionsArea {
  position: absolute !important;
  left: 14px !important;
  bottom: 14px !important;
  z-index: 2 !important;
  display: inline-flex;
  align-items: center;
  margin: 0 !important;
}

.stepItemArea .optionsArea .el-button {
  float: none !important;
  height: 44px !important;
  min-height: 44px !important;
  margin: 0 !important;
  padding: 0 16px !important;
  border: 1px solid var(--line-strong) !important;
  border-radius: 0 !important;
  background: var(--surface) !important;
  color: var(--secondary) !important;
  font-family: var(--font-sans) !important;
  font-size: 0.875rem !important;
  font-weight: 400 !important;
  letter-spacing: 0.02em !important;
  box-shadow: none !important;
  transform: none !important;
  transition: color var(--dur) ease, border-color var(--dur) ease,
    background-color var(--dur) ease;
}

.stepItemArea .optionsArea .el-button:not(.is-disabled):hover {
  border-color: var(--ink) !important;
  background: var(--hover) !important;
  color: var(--ink) !important;
}

.inputActionGroup {
  position: absolute !important;
  right: 14px !important;
  bottom: 14px !important;
  z-index: 2 !important;
  display: flex !important;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  width: auto !important;
  max-width: calc(100% - 90px) !important;
  margin: 0 !important;
}

.inputActionGroup .el-button {
  height: 44px !important;
  min-height: 44px !important;
  margin: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  transform: none !important;
  font-family: var(--font-sans) !important;
  font-size: 0.9375rem !important;
  font-weight: 400 !important;
}

.inputActionGroup .el-button + .el-button {
  margin-left: 0 !important;
}

/* 算力配置 */
.inputActionGroup .config-model-btn.el-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px !important;
  border: 1px solid var(--line-strong) !important;
  background: var(--surface) !important;
  color: var(--ink) !important;
  letter-spacing: 0.02em !important;
  transition: border-color var(--dur) ease, background-color var(--dur) ease;
}

.inputActionGroup .config-model-btn.el-button:not(.is-disabled):hover {
  border-color: var(--ink) !important;
  background: var(--hover) !important;
  color: var(--ink) !important;
}

.inputActionGroup .config-model-btn .el-icon {
  font-size: 15px;
}

/* 主操作：墨色实心 */
.inputActionGroup .shiny-button.el-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px !important;
  border: 1px solid var(--ink) !important;
  background: var(--ink) !important;
  background-image: none !important;
  color: #ffffff !important;
  letter-spacing: 0.04em !important;
  box-shadow: none !important;
  transform: none !important;
  transition: background-color var(--dur) ease, border-color var(--dur) ease;
}

.inputActionGroup .shiny-button.el-button .el-icon {
  margin-right: 6px !important;
  font-size: 15px;
}

.inputActionGroup .shiny-button.el-button:not(.is-disabled):hover {
  border-color: var(--ink-soft) !important;
  background: var(--ink-soft) !important;
  color: #ffffff !important;
  box-shadow: none !important;
  transform: none !important;
}

.inputActionGroup .shiny-button.el-button:not(.is-disabled):active {
  border-color: #000000 !important;
  background: #000000 !important;
  transform: none !important;
}

.inputActionGroup .shiny-button.el-button.is-disabled {
  border-color: var(--line) !important;
  background: var(--hover) !important;
  color: var(--tertiary) !important;
}

.inputActionGroup .shiny-button .el-icon.is-loading {
  color: #ffffff !important;
}

/* --------------------------------------------------------------------------
   6. 示例区：发丝线分隔 + 细线网格入口
   -------------------------------------------------------------------------- */
.idea-section-container {
  display: block;
  width: 100%;
  margin-top: 26px;
  padding: 22px 0 0 !important;
  border-top: 1px solid var(--line);
  font-family: var(--font-sans);
  box-sizing: border-box;
}

.idea-section-content {
  position: relative;
  width: 100%;
  max-width: none;
}

.section-title {
  margin: 0 0 14px !important;
  padding: 0 !important;
  color: var(--secondary) !important;
  font-family: var(--font-sans) !important;
  font-size: 0.75rem !important;
  font-weight: 500 !important;
  line-height: 28px !important;
  letter-spacing: 0.1em !important;
  text-align: left;
}

/* 刷新 / 克隆：极简图标按钮 */
.more-ideas-button.el-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px !important;
  height: 28px !important;
  min-height: 28px !important;
  margin-left: 2px !important;
  padding: 0 !important;
  border: 1px solid transparent !important;
  border-radius: 0 !important;
  background: transparent !important;
  color: var(--secondary) !important;
  vertical-align: middle;
  box-shadow: none !important;
  transition: color var(--dur) ease, background-color var(--dur) ease,
    border-color var(--dur) ease;
}

.more-ideas-button.el-button:hover {
  border-color: var(--line) !important;
  background: var(--hover) !important;
  color: var(--ink) !important;
}

.clone-app-button {
  float: right;
  margin-right: 0;
}

.clone-app-button .el-button {
  display: inline-flex;
  align-items: center;
  height: 28px !important;
  min-height: 28px !important;
  padding: 0 8px !important;
  border: 1px solid transparent !important;
  border-radius: 0 !important;
  background: transparent !important;
  color: var(--secondary) !important;
  font-family: var(--font-sans) !important;
  font-size: 0.75rem !important;
  font-weight: 400 !important;
  letter-spacing: 0.08em !important;
  box-shadow: none !important;
  transition: color var(--dur) ease, background-color var(--dur) ease,
    border-color var(--dur) ease;
}

.clone-app-button .el-button:hover {
  border-color: var(--line) !important;
  background: var(--hover) !important;
  color: var(--ink) !important;
}

.clone-app-button .el-button svg,
.clone-app-button .el-button .octicon {
  width: 13px !important;
  height: 13px !important;
  margin-right: 5px !important;
  vertical-align: -1px;
}

.clone-app-button .el-dropdown-link {
  font-size: inherit;
  color: inherit;
  cursor: pointer;
}

/* 入口：细线分格 */
.ideas-buttons-row {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: 8px !important;
  padding: 0 !important;
  overflow: visible !important;
}

.idea-button {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  min-width: 0;
  min-height: 46px;
  padding: 0 16px;
  border: 1px solid var(--line);
  border-radius: 0;
  background: var(--surface);
  color: var(--ink);
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.4;
  letter-spacing: 0;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: none;
  transition: background-color var(--dur) ease, border-color var(--dur) ease;
}

.idea-button:hover {
  border-color: var(--line-strong);
  background: var(--hover);
  color: var(--ink);
  transform: none;
  box-shadow: none;
}

.idea-button:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
}

/* --------------------------------------------------------------------------
   7. 我的 Apps
   -------------------------------------------------------------------------- */
.myAppsArea {
  position: relative;
  float: none;
  clear: both;
  width: 100%;
  max-width: 1080px;
  margin: 72px auto 0 !important;
  padding: 56px 24px 0 !important;
  box-sizing: border-box;
  border-top: 1px solid var(--line);
  color: var(--ink);
}

.myAppsArea > h5 {
  margin: 0 0 24px !important;
  padding: 0 !important;
  color: var(--tertiary) !important;
  font-family: var(--font-sans) !important;
  font-size: 0.75rem !important;
  font-weight: 500 !important;
  line-height: 1.4 !important;
  letter-spacing: 0.14em !important;
  text-align: left !important;
  text-transform: uppercase;
}

.myAppsArea > h5 + div {
  padding: 0 !important;
  background: transparent !important;
  border-radius: 0 !important;
}

.myAppsArea .el-card,
.communityArea .el-card {
  border: 1px solid var(--line) !important;
  border-radius: 0 !important;
  background: var(--surface) !important;
  box-shadow: none !important;
  overflow: hidden;
  transition: border-color var(--dur) ease;
}

.myAppsArea .el-card:hover,
.communityArea .el-card:hover {
  border-color: var(--ink) !important;
  box-shadow: none !important;
  transform: none !important;
}

.myAppsArea .el-card__body {
  display: flex;
  align-items: center;
  min-height: 72px;
  padding: 16px !important;
  box-sizing: border-box;
}

/* 「更多」卡片：内容居中，与信息卡片同高 */
.myAppsArea .el-card__body > div:not(.contentCardItem) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: auto !important;
  padding: 0 !important;
}

.myAppsArea .el-card {
  height: 100% !important;
}

/* 应用图标：40px，与两行文本（22px + 18px）等高 */
.contentCardItem {
  display: flex !important;
  align-items: center;
  gap: 12px;
}

.contentCardItem .el-image {
  display: block !important;
  flex: 0 0 40px;
  float: none !important;
  width: 40px !important;
  height: 40px !important;
  border: 1px solid var(--line);
  border-radius: 0 !important;
  background: var(--hover) !important;
}

.contentCardItem > span {
  display: flex !important;
  flex-direction: column;
  justify-content: center;
  float: none !important;
  width: auto !important;
  height: 40px !important;
  min-width: 0;
  flex: 1 1 auto;
  line-height: normal !important;
}

.contentCardItem h3 {
  margin: 0 !important;
  color: var(--ink) !important;
  font-family: var(--font-sans) !important;
  font-size: 0.9375rem !important;
  font-weight: 500 !important;
  line-height: 22px !important;
  letter-spacing: 0 !important;
}

.contentCardItem .tw-text-sm,
.contentCardItem .tw-text-gray-500 {
  height: 18px;
  color: var(--tertiary) !important;
  font-size: 0.75rem !important;
  line-height: 18px !important;
  letter-spacing: 0.01em;
}

/* 「更多」入口 */
.myAppsArea .el-card .el-button {
  height: 40px !important;
  min-height: 40px !important;
  padding: 0 4px !important;
  border: 0 !important;
  background: transparent !important;
  color: var(--ink) !important;
  font-family: var(--font-sans) !important;
  font-size: 0.875rem !important;
  text-decoration: underline;
  text-underline-offset: 4px;
  box-shadow: none !important;
}

.myAppsArea .el-card .el-button:hover {
  background: transparent !important;
  color: var(--ink-soft) !important;
}

/* --------------------------------------------------------------------------
   8. 社区区
   -------------------------------------------------------------------------- */
.communityArea {
  position: relative;
  float: none;
  clear: both;
  width: 100%;
  max-width: 1080px;
  height: auto;
  margin: 72px auto 0 !important;
  padding: 56px 24px 0 !important;
  box-sizing: border-box;
  border-top: 1px solid var(--line);
  color: var(--ink);
}

.communityArea > h5 {
  margin: 0 0 10px !important;
  padding: 0 !important;
  color: var(--ink) !important;
  font-family: var(--font-sans) !important;
  font-size: 1.375rem !important;
  font-weight: 500 !important;
  line-height: 1.35 !important;
  letter-spacing: -0.01em !important;
  text-align: left !important;
}

.communityArea > p {
  margin: 0 0 32px !important;
  padding: 0 !important;
  color: var(--secondary) !important;
  font-family: var(--font-sans) !important;
  font-size: 0.9375rem !important;
  font-weight: 400 !important;
  line-height: 1.7 !important;
  letter-spacing: 0 !important;
  text-align: left !important;
}

.communityArea > .tw-min-h-screen {
  min-height: 0 !important;
  width: 100%;
  max-width: none;
  margin: 0;
}

.communityArea header {
  display: block !important;
  margin: 0 0 28px !important;
}

/* 搜索组合输入：一整块细线控件，内部仅保留一条分隔线；
   焦点只改变外框颜色，不再叠加 outline / box-shadow / inset 线 */
.community-search-group {
  display: flex !important;
  align-items: center;
  gap: 0;
  width: 100% !important;
  max-width: 520px !important;
  height: 44px;
  margin: 0 !important;
  float: none !important;
  box-sizing: border-box;
  border: 1px solid var(--line-strong);
  background: var(--surface);
  transition: border-color var(--dur) ease;
}

.community-search-group:hover,
.community-search-group:focus-within {
  border-color: var(--ink);
}

.community-search-input {
  display: flex;
  flex: 1 1 auto !important;
  width: auto !important;
  height: 100% !important;
  min-width: 0;
  border-radius: 0 !important;
  background: transparent !important;
}

.oneKeyContentArea .community-search-input .el-input__wrapper {
  display: flex;
  align-items: center;
  width: 100% !important;
  height: 100% !important;
  min-height: 0 !important;
  padding: 0 14px !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

.oneKeyContentArea .community-search-input .el-input__wrapper.is-focus,
.oneKeyContentArea .community-search-input .el-input__wrapper:focus-within,
.oneKeyContentArea .community-search-input .el-input__wrapper:focus-visible {
  border: 0 !important;
  outline: none !important;
  outline-offset: 0 !important;
  box-shadow: none !important;
}

.oneKeyContentArea .community-search-input .el-input__inner {
  height: 100% !important;
  color: var(--ink) !important;
  font-family: var(--font-sans) !important;
  font-size: 0.875rem !important;
}

.oneKeyContentArea .community-search-input .el-input__inner:focus,
.oneKeyContentArea .community-search-input .el-input__inner:focus-visible {
  outline: none !important;
  outline-offset: 0 !important;
  box-shadow: none !important;
}

.oneKeyContentArea .community-search-input .el-input__inner::placeholder {
  color: var(--tertiary) !important;
}

.oneKeyContentArea .community-search-input .el-input__prefix {
  color: var(--tertiary) !important;
  font-size: 13px;
}

.community-search-input .el-input__prefix,
.community-search-input .el-input__prefix *,
.community-search-input .el-input__suffix,
.community-search-input .el-input__suffix * {
  outline: none !important;
  box-shadow: none !important;
}

.community-owner-wrap {
  flex: 0 0 132px;
  width: 132px;
  height: 100%;
}

.community-owner-select {
  width: 100% !important;
  height: 100% !important;
}

.oneKeyContentArea .community-owner-select .el-select__wrapper {
  height: 100% !important;
  min-height: 0 !important;
  padding: 0 12px !important;
  border: 0 !important;
  border-left: 1px solid var(--line) !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

.oneKeyContentArea .community-owner-select .el-select__wrapper.is-focused,
.oneKeyContentArea .community-owner-select .el-select__wrapper:focus-within,
.oneKeyContentArea .community-owner-select .el-select__wrapper:focus-visible {
  border: 0 !important;
  border-left: 1px solid var(--line) !important;
  outline: none !important;
  outline-offset: 0 !important;
  box-shadow: none !important;
}

.oneKeyContentArea .community-owner-select .el-select__placeholder,
.oneKeyContentArea .community-owner-select .el-select__selected-item {
  color: var(--ink) !important;
  font-size: 0.875rem !important;
}

.oneKeyContentArea .community-owner-select .el-select__caret {
  color: var(--tertiary) !important;
}

/* 卡片网格 */
.communityArea .el-card {
  height: 100%;
}

.communityArea .el-card__body {
  padding: 0 !important;
}

.communityArea .el-card .tw-relative {
  background: var(--hover) !important;
}

.communityArea .el-card .el-image {
  border-radius: 0 !important;
  background: var(--hover) !important;
}

.communityArea .el-card .el-image__inner,
.communityArea .el-card .el-image__error {
  border-radius: 0 !important;
}

.communityArea .tw-image-slot {
  background: var(--hover) !important;
  color: var(--tertiary) !important;
}

/* 标签 */
.communityArea .el-card .tw-top-3 {
  top: 12px !important;
  right: 12px !important;
  padding: 4px 8px !important;
  border: 1px solid var(--line) !important;
  border-radius: 0 !important;
  background: var(--surface) !important;
  color: var(--ink) !important;
  font-family: var(--font-sans) !important;
  font-size: 0.6875rem !important;
  font-weight: 500 !important;
  letter-spacing: 0.06em !important;
}

/* 卡片底部：头像 + 标题 + 元信息 */
.communityArea .el-card .tw-pt-2 {
  display: flex !important;
  align-items: center;
  gap: 10px;
  float: none !important;
  width: 100% !important;
  padding: 14px 16px !important;
  box-sizing: border-box;
}

/* 用户图标：36px 小尺寸，与两行文本（20px + 16px）等高 */
.communityArea .el-card .el-avatar {
  display: block !important;
  flex: 0 0 36px;
  width: 36px !important;
  height: 36px !important;
  border: 1px solid var(--line) !important;
  border-radius: 0 !important;
  background: var(--hover) !important;
}

.communityArea .el-card .tw-pt-2 > span:not(.el-avatar) {
  display: flex !important;
  flex-direction: column;
  justify-content: center;
  float: none !important;
  width: auto !important;
  height: 36px !important;
  min-width: 0;
  flex: 1 1 auto;
  line-height: normal !important;
}

.communityArea .el-card h3 {
  margin: 0 !important;
  color: var(--ink) !important;
  font-family: var(--font-sans) !important;
  font-size: 0.9375rem !important;
  font-weight: 500 !important;
  line-height: 20px !important;
  letter-spacing: 0 !important;
}

.communityArea .el-card .tw-text-sm,
.communityArea .el-card .tw-text-gray-500 {
  height: 16px;
  color: var(--tertiary) !important;
  font-size: 0.75rem !important;
  line-height: 16px !important;
}

.communityArea .el-card .tw-text-sm i {
  color: var(--tertiary) !important;
  font-size: 11px;
}

/* 加载完成提示 */
.communityArea .tw-text-center.tw-py-4 p {
  margin: 24px 0 0 !important;
  color: var(--tertiary) !important;
  font-size: 0.75rem !important;
  letter-spacing: 0.06em;
}

.communityArea .el-empty,
.myAppsArea .el-empty {
  padding: 48px 0;
}

/* 空态：去掉插画，只留一条细线与文字（白与空） */
.oneKeyContentArea .el-empty__image {
  display: none !important;
}

.communityArea .el-empty__description p,
.myAppsArea .el-empty__description p {
  display: inline-block;
  min-width: 140px;
  margin: 0 !important;
  padding: 18px 24px 0 !important;
  border-top: 1px solid var(--line) !important;
  color: var(--tertiary) !important;
  font-family: var(--font-sans) !important;
  font-size: 0.8125rem !important;
  line-height: 1.5 !important;
  letter-spacing: 0.08em !important;
}

/* 页脚 */
.communityArea footer {
  margin-top: 24px;
  padding: 32px 0 40px !important;
  border-top: 1px solid var(--line) !important;
  text-align: center;
}

.communityArea footer p {
  margin: 0 !important;
  color: var(--tertiary) !important;
  font-size: 0.75rem !important;
  line-height: 1.6 !important;
  letter-spacing: 0.02em;
}

.communityArea footer a {
  color: var(--secondary) !important;
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color var(--dur) ease;
}

.communityArea footer a:hover {
  color: var(--ink) !important;
}

/* --------------------------------------------------------------------------
   9. Tailwind 语义色归位（保留类名，仅换色）
   -------------------------------------------------------------------------- */
.tw-text-blue-600,
.tw-text-blue-500 {
  color: var(--ink) !important;
}

.tw-bg-blue-50 {
  background-color: var(--hover) !important;
}

.tw-bg-blue-500,
.tw-bg-blue-600 {
  background-color: var(--ink) !important;
}

.tw-border-blue-200 {
  border-color: var(--line) !important;
}

.tw-text-gray-500 {
  color: var(--tertiary) !important;
}

.tw-bg-gray-200 {
  background-color: var(--hover) !important;
}

/* --------------------------------------------------------------------------
   10. 通用 Element Plus 控件（组件内部）
   -------------------------------------------------------------------------- */
.oneKeyContentArea .el-card {
  border-radius: 0 !important;
}

.oneKeyContentArea .el-loading-mask {
  border-radius: 0 !important;
  background: var(--el-mask-color, rgba(250, 250, 249, 0.86)) !important;
}

.oneKeyContentArea .el-loading-spinner .path {
  stroke: var(--ink) !important;
}

.oneKeyContentArea .el-avatar {
  background-color: var(--hover);
}

.oneKeyContentArea .el-checkbox__label {
  padding-left: 4px;
  vertical-align: middle;
}

/* --------------------------------------------------------------------------
   11. 响应式
   -------------------------------------------------------------------------- */
@media (max-width: 960px) {
  .sloganInfoArea {
    padding: 72px 20px 40px;
  }

  .aiGenerateArea {
    padding: 0 20px;
  }

  .myAppsArea,
  .communityArea {
    margin-top: 56px !important;
    padding-top: 44px !important;
  }
}

@media (max-width: 640px) {
  .oneKeyContentArea {
    padding-bottom: 48px;
  }

  .sloganInfoArea {
    padding: 56px 20px 32px;
  }

  .oneKeyContentArea .sloganInfoArea .z-text,
  .oneKeyContentArea .sloganInfoArea > p:nth-child(1) {
    font-size: 1.5rem !important;
    line-height: 1.32 !important;
  }

  .oneKeyContentArea .sloganInfoArea > p:nth-child(2) {
    margin-top: 12px !important;
    font-size: 0.875rem !important;
    line-height: 1.7 !important;
  }

  .aiGenerateArea {
    padding: 0 16px;
  }

  .inputContentArea {
    padding: 18px;
  }

  .oneKeyContentArea .stepItemArea .el-textarea__inner {
    padding: 14px 16px 72px !important;
    font-size: 0.9375rem !important;
    line-height: 1.7 !important;
  }

  .idea-section-container {
    margin-top: 20px;
    padding-top: 18px !important;
  }

  .ideas-buttons-row {
    grid-template-columns: minmax(0, 1fr) !important;
    gap: 8px !important;
  }

  .idea-button {
    min-height: 44px;
    padding: 0 14px;
    font-size: 0.8125rem;
  }

  .myAppsArea,
  .communityArea {
    margin-top: 48px !important;
    padding: 36px 16px 0 !important;
  }

  .myAppsArea > h5 {
    margin-bottom: 18px !important;
  }

  .communityArea > h5 {
    font-size: 1.25rem !important;
  }

  .communityArea > p {
    margin-bottom: 24px !important;
    font-size: 0.875rem !important;
  }

  .community-search-group {
    max-width: 100% !important;
  }

  .communityArea .el-card .tw-pt-2 {
    padding: 14px !important;
  }

  .communityArea footer {
    padding: 28px 0 32px !important;
  }

}

/* 窄屏：三个操作仍贴在输入框底部，只收紧内边距 */
@media (max-width: 560px) {
  .stepItemArea .optionsArea {
    left: 12px !important;
    bottom: 12px !important;
  }

  .inputActionGroup {
    right: 12px !important;
    bottom: 12px !important;
    gap: 8px;
    max-width: calc(100% - 82px) !important;
  }

  .inputActionGroup .config-model-btn.el-button {
    padding: 0 12px !important;
  }

  .inputActionGroup .shiny-button.el-button {
    min-width: 0;
    max-width: 300px !important;
    margin: 0 !important;
    padding: 0 14px !important;
    font-size: 0.875rem !important;
  }
}

@media (max-width: 380px) {
  .sloganInfoArea {
    padding: 44px 16px 26px;
  }

  .inputContentArea {
    padding: 14px;
  }

  .inputActionGroup .shiny-button.el-button {
    letter-spacing: 0.02em !important;
    font-size: 0.8125rem !important;
  }

  .inputActionGroup .config-model-btn.el-button {
    font-size: 0.8125rem !important;
  }

  .stepItemArea .optionsArea .el-button {
    font-size: 0.8125rem !important;
  }
}

/* --------------------------------------------------------------------------
   12. 动效降级
   -------------------------------------------------------------------------- */
@media (prefers-reduced-motion: reduce) {
  .oneKeyContentArea *,
  .oneKeyContentArea *::before,
  .oneKeyContentArea *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
</style>
