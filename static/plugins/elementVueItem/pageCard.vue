<template>
  <el-card
    shadow="never"
    :mode="mode"
    v-loading="loading"
    :element-loading-text="loadingTips"
    :body-style="bodyStyle"
    :style="cardStyle"
  >
    <slot v-for="(item, index) in config">
      <span
        :key="index"
        :type="item.type"
        :prop="item.prop"
        :style="optionMap[item.prop].style"
        :class="optionMap[item.prop].class || item.class"
        v-if="
          !optionMap[item.prop].hidden &&
          (!optionMap[item.prop].condition ||
            optionMap[item.prop].condition.indexOf(info[item.prop]) !== -1)
        "
        @click="handleClickCard(info, item)"
      >
        <span
          flag="label"
          :style="
            optionMap[item.prop].labelStyle ||
            'display: inline-block; vertical-align: middle;  margin-right: 5px;'
          "
          v-if="!!optionMap[item.prop].label || item.label"
          >{{ optionMap[item.prop].label || item.label
          }}<slot v-if="optionMap[item.prop].suffix">{{
            optionMap[item.prop].suffix
          }}</slot></span
        >
        <span
          flag="before"
          :style="
            optionMap[item.prop].labelStyle ||
            'display: inline-block; vertical-align: middle; margin-right: 5px;'
          "
          v-if="!!optionMap[item.prop].before"
          >{{ optionMap[item.prop].before }}</span
        >
        <slot
          v-if="
            mode === 'edit' &&
            editorMap &&
            editorMap[item.prop] &&
            !editorMap[item.prop].ignore
          "
        >
          <div
            v-if="editorMap[item.prop].type === 'plugin'"
            :style="
              editorMap[item.prop].valueStyle || {
                width: '100%',
                height: '100%',
                positon: 'relative',
                float: 'left',
              }
            "
            v-plugin="{
              app: editorMap[item.prop],
              info: info,
              prop: item.prop,
            }"
          ></div>
          <slot v-if="editorMap[item.prop].type === 'radio'">
            <el-radio-group
              v-model="info[item.prop]"
              :key="item.prop"
              :size="editorMap[item.prop].size || 'small'"
              @change="dealChangeEvent(item, result)"
              :style="editorMap[item.prop].valueStyle"
            >
              <slot v-for="v in editorMap[item.prop].items || item.items">
                <el-radio
                  :label="v.value === undefined ? v : v.value"
                ></el-radio>
              </slot>
            </el-radio-group>
          </slot>
          <span v-else-if="editorMap[item.prop].type === 'tags'">
            <el-tag
              v-for="(tag, tIndex) in info[item.prop]"
              :key="tIndex"
              class="eTagItem"
              closable
              :type="tag.type"
              :size="editorMap[item.prop].size || 'small'"
              prop="value"
              @close="handleClose(tag, tIndex, info, item)"
              >{{ tag.name || tag }}</el-tag
            >
            <el-input
              v-if="info.inputVisible"
              ref="saveTagInput"
              v-model="info.inputValue"
              clearable
              class="input-new-tag"
              :size="editorMap[item.prop].size || 'small'"
              @keyup.enter="handleInputConfirm(info, item)"
              @blur="handleInputConfirm(info, item)"
            >
            </el-input>
            <el-button
              v-else
              class="button-new-tag"
              :size="editorMap[item.prop].size || 'small'"
              @click="showInput(info, item)"
              >{{ editorMap[item.prop].buttonLabel || "新增" }}</el-button
            >
          </span>
          <span
            v-else-if="item.type === 'checkbox'"
            :style="editorMap[item.prop].valueStyle"
          >
            <el-checkbox
              ref="checkAll"
              v-model="info.checkAll"
              prop="checkAll"
              label="全部"
              :indeterminate="info.isIndeterminate"
              @change="_handleCheckAllChange(info, index, item)"
              :size="editorMap[item.prop].size || 'small'"
            ></el-checkbox>
            <el-checkbox-group
              style="display: inline-block; margin-left: 15px"
              v-model="info[item.prop]"
              :size="editorMap[item.prop].size || 'small'"
              @change="_handleCheckedChange(info, index, item)"
            >
              <slot v-for="v in editorMap[item.prop].items">
                <el-checkbox
                  :label="v.value || v"
                  :size="editorMap[item.prop].size || 'small'"
                  >{{ v.name || v.label || v }}</el-checkbox
                >
              </slot>
            </el-checkbox-group>
          </span>
          <slot v-else-if="editorMap[item.prop].type === 'input'">
            <el-input
              :show-password="
                editorMap[item.prop].showPassword || item.showPassword
              "
              v-model="info[item.prop]"
              clearable
              :style="
                editorMap[item.prop].valueStyle ||
                'display: inline-block; width: 100%'
              "
              :size="editorMap[item.prop].size || 'small'"
              :placeholder="editorMap[item.prop].placeholder"
              @change="dealChangeEvent(info, item)"
            ></el-input>
          </slot>
          <slot v-else-if="editorMap[item.prop].type === 'textarea'">
            <el-input
              v-model="info[item.prop]"
              clearable
              type="textarea"
              :style="
                editorMap[item.prop].valueStyle ||
                'display: inline-block; width: 100%'
              "
              :disabled="editorMap[item.prop].disabled || false"
              :rows="editorMap[item.prop].rows || 3"
              :size="editorMap[item.prop].size || 'small'"
              :placeholder="editorMap[item.prop].placeholder"
              @change="dealChangeEvent(info, item)"
            ></el-input>
          </slot>
          <slot v-else-if="editorMap[item.prop].type === 'file'">
            <div
              class="custom-file pageCard-file"
              :style="editorMap[item.prop].valueStyle"
            >
              <input
                type="file"
                class="pageCard-file-input custom-file-input"
                :id="'inputGroupFile' + index"
                :prop="item.prop"
                :accept="editorMap[item.prop].accept"
                @change="handleFileChange"
                :aria-describedby="'inputGroupFileAddon' + index"
              />
              <label
                :title="info[item.prop] ? editorMap[item.prop].placeholder : ''"
                class="custom-file-label pageCard-file-label"
                :for="'inputGroupFile01' + index"
                ><span class="selectFileName">{{
                  editorMap[item.prop].placeholder || "选择一个文件"
                }}</span></label
              >
            </div>
            <span
              style="position: relative"
              v-if="
                editorMap[item.prop].isImage &&
                !!info[item.prop] &&
                info[item.prop] !== '-'
              "
            >
              <el-button
                @click="removeImageInput(item.prop)"
                title="取消"
                style="
                  position: relative;
                  top: 30px;
                  margin-left: -50px;
                  transform: scale(0.7);
                  transform-origin: 0;
                  z-index: 888;
                "
                plain
                circle
                size="small"
                ><el-icon><close /></el-icon
              ></el-button>
              <el-image
                style="
                  margin-top: -30px;
                  max-width: 100%;
                  max-height: 200px;
                  width: 100%;
                  height: auto;
                "
                :src="info[item.prop]"
              ></el-image>
            </span>
          </slot>
          <slot v-else-if="editorMap[item.prop].type === 'select'">
            <el-select
              default-first-option
              :allow-create="
                editorMap[item.prop].allowCreate || item.allowCreate
              "
              :style="
                editorMap[item.prop].valueStyle ||
                'display: inline-block; width: 100%'
              "
              :filterable="editorMap[item.prop].filterable || true"
              :reserve-keyword="false"
              v-model="info[item.prop]"
              :multiple="editorMap[item.prop].multiple"
              :multiple-limit="editorMap[item.prop].multipleLimit"
              :clearable="!editorMap[item.prop].multiple"
              :size="editorMap[item.prop].size || 'small'"
              :placeholder="editorMap[item.prop].placeholder"
              :disabled="editorMap[item.prop].disabled"
              @change="dealChangeEvent(info, item)"
            >
              <el-option
                v-for="(tItem, tIndex) in editorMap[item.prop].options"
                :key="tIndex"
                :label="tItem.label || tItem.name || tItem"
                :value="tItem.value === undefined ? tItem : tItem.value"
              ></el-option>
            </el-select>
          </slot>
          <slot v-else-if="editorMap[item.prop].type === 'cascader'">
            <el-cascader
              default-first-option
              :style="
                editorMap[item.prop].valueStyle ||
                'display: inline-block; width: 100%'
              "
              :allow-create="editorMap[item.prop].allowCreate"
              :filterable="editorMap[item.prop].filterable || true"
              :reserve-keyword="false"
              :options="editorMap[item.prop].options"
              v-model="info[item.prop]"
              :multiple="editorMap[item.prop].multiple"
              :multiple-limit="editorMap[item.prop].multipleLimit"
              :clearable="!editorMap[item.prop].multiple"
              :size="editorMap[item.prop].size || 'small'"
              :placeholder="editorMap[item.prop].placeholder"
              @change="dealChangeEvent(info, item)"
            >
            </el-cascader>
          </slot>
          <slot v-else-if="editorMap[item.prop].type === 'switch'">
            <span v-if="editorMap[item.prop].label">{{ item.label }}</span>
            <el-switch
              :style="
                editorMap[item.prop].valueStyle ||
                'display: inline-block; width: 100%'
              "
              v-model="info[item.prop]"
              :active-color="editorMap[item.prop].activeColor || '#13ce66'"
              :inactive-color="editorMap[item.prop].inactive || '#ff4949'"
              :active-text="editorMap[item.prop].activeText || ''"
              :inactive-text="editorMap[item.prop].inactiveText || ''"
              :inline-prompt="editorMap[item.prop].textInside"
              :size="editorMap[item.prop].size || 'small'"
              @change="dealChangeEvent(info, item)"
            ></el-switch>
          </slot>
          <slot v-else-if="editorMap[item.prop].type === 'datePicker'">
            <el-date-picker
              v-model="item.value"
              :size="editorMap[item.prop].size || 'small'"
              clearable
              :style="editorMap[item.prop].valueStyle"
              :format="editorMap[item.prop].format || 'YYYY-MM-DD'"
              :value-format="editorMap[item.prop].valueFormat || 'YYYY-MM-DD'"
              :type="editorMap[item.prop].pickerType || 'datetime'"
              :placeholder="editorMap[item.prop].placeholder || '选择日期时间'"
              @change="dealChangeEvent(info, item)"
            ></el-date-picker>
          </slot>
          <slot v-else-if="editorMap[item.prop].type === 'dateRange'">
            <el-date-picker
              v-model="info[item.prop]"
              clearable
              type="daterange"
              :start-placeholder="
                editorMap[item.prop].startPlaceholder || '开始日期'
              "
              :style="editorMap[item.prop].valueStyle"
              :end-placeholder="
                editorMap[item.prop].endPlaceholder || '结束日期'
              "
              :size="editorMap[item.prop].size || 'small'"
              :format="editorMap[item.prop].format || 'YYYY-MM-DD'"
              :value-format="editorMap[item.prop].valueFormat || 'YYYY-MM-DD'"
              :picker-options="editorMap[item.prop].pickerOptions"
              @change="dealChangeEvent(info, item)"
            ></el-date-picker>
          </slot>
          <span
            :style="editorMap[item.prop].valueStyle"
            v-else-if="editorMap[item.prop].type === 'colorPicker'"
          >
            <el-color-picker
              v-model="info[item.prop]"
              clearable
              :size="editorMap[item.prop].size || 'small'"
              :show-alpha="editorMap[item.prop].showAlpha"
              :predefine="editorMap[item.prop].predefine"
              :color-format="editorMap[item.prop].colorFormat || 'hex'"
              @change="dealChangeEvent(info, item)"
            ></el-color-picker>
          </span>
          <slot v-else-if="editorMap[item.prop].type === 'inputNumber'">
            <el-input-number
              v-model="info[item.prop]"
              clearable
              :style="editorMap[item.prop].valueStyle"
              :size="editorMap[item.prop].size || 'small'"
              :placeholder="editorMap[item.prop].placeholder"
              :min="editorMap[item.prop].min"
              :max="editorMap[item.prop].max"
              @change="dealChangeEvent(info, item)"
            ></el-input-number>
          </slot>
          <slot
            v-else-if="editorMap[item.prop].type === 'slider'"
            style="display: inline-block; width: 100%"
          >
            <el-slider
              v-model="info[item.prop]"
              :range="editorMap[item.prop].range"
              :vertical="editorMap[item.prop].vertical"
              :placement="editorMap[item.prop].placement"
              :size="editorMap[item.prop].size"
              :marks="editorMap[item.prop].marks"
              :min="editorMap[item.prop].min"
              :max="editorMap[item.prop].max"
              :precision="editorMap[item.prop].precision"
              :show-input="editorMap[item.prop].showInput"
              :step="editorMap[item.prop].step"
              :show-stops="editorMap[item.prop].showStops"
              :show-tooltip="editorMap[item.prop].showTooltip"
              :format-tooltip="editorMap[item.prop].formatTooltip"
              :style="editorMap[item.prop].valueStyle"
              @change="dealChangeEvent(info, item)"
            ></el-slider>
          </slot>
        </slot>
        <slot v-else-if="item.type === 'text'">
          <span
            :title="info[item.prop]"
            :type="item.type"
            :style="
              optionMap[item.prop].valueStyle ||
              item.valueStyle ||
              'display: inline-block; vertical-align: middle;'
            "
            :class="optionMap[item.prop].valueClass || item.valueClass"
          >
            {{ info[item.prop] }}
          </span>
        </slot>
        <slot v-else-if="item.type === 'JSON' || item.type === 'json'">
          <div
            :style="
              optionMap[item.prop].valueStyle || {
                width: '100%',
                height: '100%',
              }
            "
            :class="optionMap[item.prop].class || item.class"
            v-json
            :data="
              typeof info[item.prop] !== 'undefined'
                ? JSON.stringify(info[item.prop])
                : '{}'
            "
          ></div>
        </slot>
        <slot v-else-if="item.type === 'mindmap'">
          <div
            :style="
              optionMap[item.prop].valueStyle || {
                width: '100%',
                height: '100%',
              }
            "
            :class="optionMap[item.prop].class || item.class"
            v-mindmap="{
              content: info[item.prop],
              params: optionMap[item.prop].params,
            }"
          ></div>
        </slot>
        <slot v-else-if="item.type === 'html'">
          <span
            :style="
              optionMap[item.prop].valueStyle ||
              'display: inline-block; vertical-align: middle;'
            "
            :class="optionMap[item.prop].valueClass || item.valueClass"
            v-html="info[item.prop]"
            :key="index"
          ></span>
        </slot>
        <slot v-else-if="item.type === 'iframe'">
          <div
            style="position: relative; width: 100%; height: 100%"
            :class="optionMap[item.prop].class || item.class"
          >
            <iframe width="100%" height="100%" :src="info[item.prop]"></iframe>
          </div>
        </slot>
        <slot v-else-if="item.type === 'tags'">
          <slot v-for="tag in info[item.prop]">
            <el-tag :size="optionMap[item.prop].size || item.size || 'small'"
              ><span
                :style="
                  optionMap[item.prop].tagStyle ||
                  item.tagStyle || {
                    width:
                      optionMap[item.prop].tagWidth || item.tagWidth || 'auto',
                  }
                "
                :class="optionMap[item.prop].class || item.class || 'ellipsis'"
                :title="tag.label || tag"
                >{{ tag.label || tag }}</span
              >
              <slot v-if="tag.value !== undefined"
                >(<span>{{ tag.value }}</span
                >)</slot
              >
            </el-tag>
          </slot>
        </slot>
        <slot v-else-if="item.type === 'image'">
          <slot v-if="typeof info[item.prop] === 'string'">
            <el-image
              :style="
                optionMap[item.prop].valueStyle || {
                  width: '100%',
                  height: '100%',
                }
              "
              :src="info[item.prop]"
              :fit="optionMap[item.prop].fit || item.fit"
            ></el-image>
          </slot>
          <slot v-else v-for="url in info[item.prop]">
            <el-image
              :style="
                optionMap[item.prop].valueStyle || {
                  width: '100%',
                  height: '100%',
                }
              "
              :src="url"
              :fit="optionMap[item.prop].fit || item.fit"
            ></el-image>
          </slot>
        </slot>
        <slot v-else-if="item.type === 'avatar'">
          <slot v-if="typeof info[item.prop] === 'string'">
            <el-avatar
              :style="
                optionMap[item.prop].valueStyle || {
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#f8f8f8'
                }
              "
              :src="info[item.prop]"
              :size="optionMap[item.prop].size"
              :shape="optionMap[item.prop].shape"
              :fit="optionMap[item.prop].fit || item.fit"
            ></el-avatar>
          </slot>
          <slot v-else v-for="url in info[item.prop]">
            <el-avatar
              :style="
                optionMap[item.prop].valueStyle || {
                  width: '100%',
                  height: '100%',
                }
              "
              :src="url"
              :size="optionMap[item.prop].size"
              :shape="optionMap[item.prop].shape"
              :fit="optionMap[item.prop].fit || item.fit"
            ></el-avatar>
          </slot>
        </slot>
        <slot v-else-if="item.type === 'video'">
          <video
            :height="optionMap[item.prop].height || item.height || '100%'"
            :width="optionMap[item.prop].width || item.width || '100%'"
            :src="info[item.prop]"
            controls="controls"
            :style="optionMap[item.prop].style || item.style"
            :key="index"
          >
            您的浏览器不支持 video 标签。
          </video>
        </slot>
        <slot v-else-if="item.type === 'qrCode'">
          <div
            :key="index"
            :content="info[item.prop]"
            :style="
              optionMap[item.prop].valueStyle || {
                width: '100%',
                height: '100%',
              }
            "
            v-qr
          ></div>
        </slot>
        <slot v-else-if="item.type === 'plugin'">
          <div
            :style="
              optionMap[item.prop].valueStyle ||
              optionMap[item.prop].style || {
                width: '100%',
                height: '100%',
              }
            "
            v-plugin="{
              app: optionMap[item.prop],
              info: info,
              value: info[item.prop],
              prop: item.prop,
            }"
          ></div>
        </slot>
        <slot v-else-if="item.type === 'button'">
          <span
            style="width: 100%; display: block"
            :size="optionMap[item.prop].size || item.size || 'small'"
            v-if="
              optionMap[item.prop].content &&
              optionMap[item.prop].content.length === 1
            "
          >
            <el-button
              :loading="optionMap[item.prop].content[0].loading"
              :size="optionMap[item.prop].content[0].size || 'small'"
              :type="optionMap[item.prop].content[0].type"
              :plain="optionMap[item.prop].content[0].plain"
              :round="optionMap[item.prop].content[0].round"
              :circle="optionMap[item.prop].content[0].circle"
              :text="optionMap[item.prop].content[0].text"
              :style="optionMap[item.prop].content[0].style"
              @click="handleClickButton(info, optionMap[item.prop].content[0])"
            >
              <component
                class="icons"
                v-if="optionMap[item.prop].content[0].icon"
                :is="optionMap[item.prop].content[0].icon"
                :style="`width: ${optionMap[item.prop].content[0].width};`"
              ></component>
              <i :class="optionMap[item.prop].content[0].iconClass"></i>
              {{ optionMap[item.prop].content[0].label }}
            </el-button>
          </span>
          <el-button-group
            v-else
            style="width: 100%; display: block"
            :size="optionMap[item.prop].size || item.size || 'small'"
          >
            <slot v-for="bItem in optionMap[item.prop].content || item.content">
              <el-button
                :loading="bItem.loading"
                :size="bItem.size || 'small'"
                :type="bItem.type"
                :plain="bItem.plain"
                :round="bItem.round"
                :circle="bItem.circle"
                :text="bItem.text"
                v-if="!bItem.hidden"
                :style="bItem.style"
                @click.stop="handleClickButton(info, bItem)"
              >
                <component
                  class="icons"
                  v-if="bItem.icon"
                  :is="bItem.icon"
                  :style="`width: ${bItem.width};`"
                ></component>
                <i :class="bItem.iconClass"></i>
                {{ bItem.label }}
              </el-button>
            </slot>
          </el-button-group>
        </slot>
        <slot v-if="!!optionMap[item.prop].extraInfo && !!info.extraFlag"
          ><span
            :style="optionMap[item.prop].labelStyle || 'display: inline-block;'"
            v-if="typeof optionMap[item.prop].extraInfo === 'string'"
            >{{ optionMap[item.prop].extraInfo }}</span
          >
          <span
            :style="optionMap[item.prop].extraStyle || 'display: inline-block;'"
            v-else
            :data="JSON.stringify(optionMap[item.prop].extraInfo)"
            :value="JSON.stringify(info)"
            :valueType="'JSON'"
            :paramName="optionMap[item.prop].paramName"
            >{{ optionMap[item.prop].extraInfo }}</span
          >
        </slot>
      </span>
    </slot>
    <input
      ref="hiddenFileInput"
      type="file"
      accept="*/*"
      class="tw-hidden"
      @change="onFileSelected($event)"
    />
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      loadingTips: "加载中...",
      bodyStyle: {},
      cardStyle: {},
      optionMap: {},
      editorMap: {},
      config: [],
      mode: "edit",
      info: {},
      mode: "",
    };
  },
  directives: {
    mindmap: {
      mounted: function (el, param) {
        el.id = "mindmap_" + new Date().getTime();
        el.style.width = el.clientWidth + "px";
        el.style.height = el.clientHeight + "px";
        let _self = param.instance;
        let content = JSON.parse(
          JSON.stringify(param.value.content || { root: {} })
        );
        $.fn.observeDisplayToVisible = function (callback) {
          return this.each(function () {
            const observer = new MutationObserver(() => {
              const $el = $(this.parentNode);
              const isVisible = $el.is(":visible");
              if (!this._lastVisible && isVisible) {
                callback.call(this);
              }
              this._lastVisible = isVisible;
            });

            observer.observe(this.parentNode, {
              attributes: true,
              attributeFilter: ["class", "style"],
            });

            // 存储观察器以便后续断开
            this._displayObserver = observer;
          });
        };
        let prefix = `<div class="dropdown prefixDropdown">
  <button type="button" class="btn btn-link dropdown-toggle btn-sm" data-toggle="dropdown" aria-expanded="false">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
  <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
</svg>
  </button>
  <div class="dropdown-menu">
    <a class="dropdown-item cloneNodeItem">复制元素</a>
    <a class="dropdown-item deleteNodeItem">删除元素</a>
    <a class="dropdown-item addNodeItem">添加子元素</a>
  </div>
</div>`;
        let subfix = `<span class='valueEditor'><div class="dropdown subfixDropdown" style="display: inline-block;">
  <button type="button" class="btn btn-link dropdown-toggle btn-sm" data-toggle="dropdown" aria-expanded="false">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-menu-button-wide-fill" viewBox="0 0 16 16">
  <path d="M1.5 0A1.5 1.5 0 0 0 0 1.5v2A1.5 1.5 0 0 0 1.5 5h13A1.5 1.5 0 0 0 16 3.5v-2A1.5 1.5 0 0 0 14.5 0h-13zm1 2h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1zm9.927.427A.25.25 0 0 1 12.604 2h.792a.25.25 0 0 1 .177.427l-.396.396a.25.25 0 0 1-.354 0l-.396-.396zM0 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V8zm1 3v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2H1zm14-1V8a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v2h14zM2 8.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0 4a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z"/>
</svg>
  </button>
  <div class="dropdown-menu">
    <a class="dropdown-item selectModuleItem">选择组件</a>
    <a class="dropdown-item addImageItem">插入图片</a>
    <a class="dropdown-item addVideoItem">插入视频/网页</a>
    <a class="dropdown-item addAgentItem">插入文档/智能体</a>
  </div>
</div><span>`;

        if (_self.mode !== "edit") {
          prefix = "";
          subfix = "";
        }
        content = WebTool.jsonToJsMind(content, null, prefix, subfix);
        content = content[0] || content;
        content = WebTool.copyObject(content, true);
        let params = JSON.parse(JSON.stringify(param.value.params || {}));
        params.container = el;
        params.width = el.clientWidth + "px";
        params.height = el.clientHeight + "px";
        params.zoom = {
          min: 0.05,
          max: 3,
        };
        params.editable = false;
        params.layout = {
          hspace: 30, // 节点之间的水平间距
          vspace: 5, // 节点之间的垂直间距
          pspace: 13, // 节点与连接线之间的水平间距（用于容纳节点收缩/展开控制器）
          cousin_space: 0, // 相邻节点的子节点之间的额外的垂直间距
        };
        params.view = {
          line_width: 1,
          node_overflow: "visible",
          line_color: "#c6e2ff",
        };
        params.shortcut = {
          enable: false,
        };

        content.isroot = true;
        content.id = "root";

        _self.jm = new jsMind(params);

        let sChangeCallback = (a, b) => {
          let selectedNode = _self.jm.get_selected_node();
          if (!selectedNode) {
            return;
          }
          let id = selectedNode.id;
          let editable = document.querySelector(`span[nodeid='${id}']`);
          if (!editable) {
            return false;
          }
          const selection = window.getSelection();
          if (
            !selection.rangeCount ||
            (editable &&
              editable.contains &&
              !editable.contains(selection.anchorNode))
          )
            return;

          const range = selection.getRangeAt(0);

          const rect = range.getBoundingClientRect();
          const editableRect = editable.getBoundingClientRect();

          let relativeY = rect.top - editableRect.top;

          if (
            range.startContainer &&
            range.startContainer.data &&
            range.startContainer.data[range.endOffset - 1] === "\n"
          ) {
            relativeY += 25;
          }

          editable.parentElement.querySelector(".valueEditor").style.top = `${
            relativeY - 5
          }px`;
        };

        function getGlobalOffset(editable) {
          const selection = window.getSelection();
          if (selection.rangeCount === 0) return 0;

          const range = selection.getRangeAt(0);
          let node = range.startContainer;
          let offset = range.startOffset;
          let totalOffset = 0;

          // 递归计算节点前的文本长度
          const scan = (currentNode) => {
            while (currentNode) {
              if (currentNode === node) {
                // 如果是目标节点，直接添加偏移量
                if (currentNode.nodeType === Node.TEXT_NODE) {
                  totalOffset += offset;
                }
                return;
              }

              if (currentNode.nodeType === Node.TEXT_NODE) {
                // 文本节点直接累加长度
                totalOffset += currentNode.length;
              } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
                // 元素节点递归处理子节点
                scan(currentNode.childNodes[0]);
              }

              // 继续处理下一个兄弟节点
              currentNode = currentNode.nextSibling;
            }
          };

          // 从可编辑元素的第一个子节点开始扫描
          scan(editable.firstChild);
          return totalOffset;
        }

        _self.jm.emitMessage = function (str) {
          let card = webCpu.cards.documentEditor;
          if (!card || !card.task || !card.task.vueItem) {
            return false;
          }
          let vueItem = card.task.vueItem;
          // let tCard = _self._parent._parent.dialogData.parentCard.dialogData.parentCard;
          let tCard = _self._parent._parent || _self._parent;
          vueItem[str](tCard, "...", null, {
            width: "100%",
            height: "100%",
          });
          let selectedNode = _self.jm.get_selected_node();
          let id = selectedNode.id;
          let editable = document.querySelector(`span[nodeid='${id}']`);
          let offset = getGlobalOffset(editable);
          console.log("当前光标偏移：", offset);

          let getHtmlString = function (value) {
            let str = `<img style="width: auto; max-width: 100%; max-height: 250px; height: auto; border: none;" src="${value.dataUrl}" />`;
            if (
              value.type !== "localImage" &&
              value.type !== "webImage" &&
              value.type !== "aiImage"
            ) {
              str = `<iframe style="width: 100%; height: 250px; border: none;" src="${value.dataUrl}" ></iframe>`;
            }
            return str;
          };

          let _that = this;

          if (str === "addAgentItem") {
            str = "addVideoItem";
          }
          webCpu.mitt.off(str);
          webCpu.mitt.on(str, function (value) {
            let selectedNode = _self.jm.get_selected_node();
            let id = selectedNode.id;
            editable = document.querySelector(`span[nodeid='${id}']`);
            let html = getHtmlString(value);
            let str = editable.innerHTML;
            if (value.type === "selectModuleItem") {
              str = value.url;
            } else {
              str = str.substring(0, offset) + html + str.substring(offset);
            }
            webCpu.CardItem.dismissMask(_self._parent._parent);
            editable.innerHTML = str;
            _that.editNode(editable);
          });
        };

        _self.jm.editSelectedNode = function (str) {
          let elem = $(el).find(
            "jmnodes jmnode.selected span[nodetype='value']"
          )[0];
          if (elem) {
            elem.innerHTML = str;
            this.editNode(elem);
          }
        };

        _self.jm.editNode = function (elem) {
          let id = elem.getAttribute("nodeId");
          let topic = `${
            prefix || ""
          }<span nodeType='value' contenteditable=true nodeId='${id}'>${
            elem.innerHTML
          }</span>${subfix || ""}`;
          this.enable_edit();
          let node = this.get_node(id);
          node.data.label = elem.innerHTML;
          this.update_node(node, topic);
          this.disable_edit();
          setTimeout(() => {
            updateEvents();
          }, 500);
        };

        _self.jm.cloneNodeItem = function (node) {
          if (!node) {
            let elem =
              window.event.currentTarget.parentElement.parentElement
                .parentElement;
            let id = elem.getAttribute("nodeId");
            node = this.get_node(id);
          }

          this.expand_node(node);
          node = node.children[node.children.length - 1];

          this.enable_edit();
          this.insertNodeAfter(node);
          this.disable_edit();
        };

        _self.jm.addNodeItem = function (label, node) {
          if (!node) {
            let elem =
              window.event.currentTarget.parentElement.parentElement
                .parentElement;
            let id = elem.getAttribute("nodeId");
            node = this.get_node(id);
          }
          if (node.data.type === "array") {
            this.addArrayElement(node, label);
          } else {
            this.addValueItem(node, label);
          }
        };

        _self.jm.addArrayElement = function (node, label) {
          let type = node.data.type;
          if (type !== "array") {
            return false;
          }
          this.enable_edit();
          let newId = `node_${Math.random() * 1000}`;
          let index = node.children.length;
          let tLabel = "NO." + (index + 1);
          let topic = `<span nodeType="array_item"  nodeId='${newId}'>${
            prefix || ""
          }${tLabel}</span>`;
          this.add_node(node, newId, topic, null, "right");
          let newNode = this.get_node(newId);
          newNode.data.label = label;
          newNode.data.type = "array_item";

          newId = `node_${Math.random() * 1000}`;
          label = label || "新增元素...";
          topic = `${prefix || ""}<span nodeType='value' contenteditable=${
            _self.mode === "edit"
          } nodeId='${newId}'>${label}</span>${subfix || ""}`;
          this.add_node(newNode, newId, topic, null, "right");
          newNode = this.get_node(newId);
          newNode.data.label = label;
          newNode.data.type = "value";
          this.disable_edit();
          setTimeout(() => {
            updateEvents();
          }, 500);
        };

        _self.jm.addValueItem = function (node, newLabel) {
          let type = node.data.type;
          if (type === "array") {
            return false;
          }
          this.enable_edit();
          let newId = `node_${Math.random() * 1000}`;
          newLabel = newLabel || "新增元素...";
          let topic = `${prefix || ""}<span nodeType='value' contenteditable=${
            _self.mode === "edit"
          } nodeId='${newId}'>${newLabel}</span>${subfix || ""}`;

          let newNode = null;
          if (
            node.children &&
            node.children[0] &&
            node.children[0].data.type === "value"
          ) {
            node.data.type = "array";
            node.topic = `<span nodeType="array" nodeId='${node.id}'>${
              prefix || ""
            }${node.data.label}</span>`;
            this.update_node(node.id, node.topic);
            let tNode = node.children[0];
            let tData = tNode.data;
            tData.id = tNode.id;
            tData.topic = tNode.topic;
            this.remove_node(tNode);

            let tNewId01 = `node_${Math.random() * 1000}`;
            let tTopic = `<span nodeType="array_item"  nodeId='${tNewId01}'>${
              prefix || ""
            }NO.1</span>`;
            this.add_node(node, tNewId01, tTopic, null, "right");
            newNode = this.get_node(tNewId01);
            newNode.data.label = "NO.1";
            newNode.data.type = "array_item";

            this.add_node(newNode, tData.id, tData.topic, null, "right");
            newNode = this.get_node(tData.id);
            newNode.data.label = tData.label;

            let tNewId02 = `node_${Math.random() * 1000}`;
            tTopic = `<span nodeType="array_item"  nodeId='${tNewId02}'>${
              prefix || ""
            }NO.2</span>`;
            this.add_node(node, tNewId02, tTopic, null, "right");
            newNode = this.get_node(tNewId02);
            newNode.data.label = "NO.2";
            newNode.data.type = "array_item";

            this.add_node(newNode, newId, topic, null, "right");
            newNode = this.get_node(newId);
            newNode.data.label = newLabel;
            newNode.data.type = "value";
          } else {
            this.add_node(node, newId, topic, null, "right");
            newNode = this.get_node(newId);
            newNode.data.label = newLabel;
            newNode.data.type = "value";
            if (type === "value") {
              node.data.type = "key";
              node.topic = `<span nodeType="key" nodeId='${node.id}'>${
                prefix || ""
              }${node.data.label}</span>`;
            }
            this.update_node(node.id, node.topic);
          }
          this.update_node(node, node.topic);
          setTimeout(() => {
            updateEvents();
            this.disable_edit();
          }, 500);
        };

        _self.jm.insertNodeAfter = function (node) {
          this.enable_edit();
          let newId = `node_${Math.random() * 1000}`;
          let index = node.data.key + 1;
          let topic = node.topic.replace(node.id, newId);
          topic = topic.replace(`NO.${node.data.key}`, `NO.${index + 1}`);
          this.insert_node_after(node.id, newId, topic);
          let tNode = this.get_node(newId);
          tNode.data.label = "NO." + (index + 1);
          console.log("node added", tNode, "after", node.data.key, node.id);
          this.copyChildrenNodes(node, tNode);
          this.updateNodeIndex(node.parent, index + 1);
          setTimeout(() => {
            updateEvents();
            this.disable_edit();
          }, 500);
        };
        _self.jm.updateNodeIndex = function (parent, index, flag) {
          let arr = parent.children;
          console.log("node.children: ", arr, index);
          for (let i = 0; i < arr.length; i++) {
            let node = arr[i];
            let topic = `<span nodeType="array_item"  nodeId='${node.id}'>${
              prefix || ""
            }NO.${i + 1}</span>`;
            node.data.key = i;
            node.label = `NO.${i + 1}`;
            this.update_node(node, topic);
          }
        };
        _self.jm.copyChildrenNodes = function (node, pNode) {
          if (node.children && node.children.length !== 0) {
            for (let i = 0; i < node.children.length; i++) {
              let tNode = node.children[i];
              let newId = `node_${Math.random() * 1000}`;
              let reg = new RegExp(tNode.id, "g");
              tNode.topic = tNode.topic.replace(reg, newId);
              let mData = JSON.parse(JSON.stringify(tNode.data));
              this.add_node(pNode, newId, tNode.topic, mData, tNode.direction);
              let parent = _self.jm.get_node(newId);
              this.copyChildrenNodes(tNode, parent);
            }
          }
        };

        _self.jm.updateParentNode = function (parent) {
          let arr = parent.children;
          console.log("node.children: ", arr);
          let type = parent.data.type;
          if (arr.length === 0) {
            if (type === "key") {
              parent.data.type = "value";
              parent.topic = `${
                prefix || ""
              }<span nodeType='value' contenteditable=${
                _self.mode === "edit"
              } nodeId='${parent.id}'>${parent.data.label}</span>${
                subfix || ""
              }`;
            } else if (type === "array_item") {
              this.deleteNodeItem(parent, true);
            }
            this.enable_edit();
            this.update_node(parent, parent.topic);
            setTimeout(() => {
              updateEvents();
              this.disable_edit();
            }, 500);
          }
        };

        _self.jm._deleteNodeItem = function (node) {
          let parent = node.parent;
          let index = node.data.key;
          this.enable_edit();
          this.remove_node(node.id);
          if (parent.data.type === "array") {
            this.updateNodeIndex(parent, index, true);
          } else {
            this.updateParentNode(parent);
          }
          setTimeout(() => {
            updateEvents();
            this.disable_edit();
          }, 500);
        };

        _self.jm.deleteNodeItem = function (node, flag) {
          let parent = node.parent;
          if (parent.children.length === 1 && parent.data.type === "array") {
            _self.$message({
              type: "warning",
              message: webCpu.messages[lang].cannotDeleteTips,
            });
            return false;
          }

          if (flag) {
            this._deleteNodeItem(node);
          } else {
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
                this._deleteNodeItem(node);
              });
          }
        };

        _self.jm.getNodeByPath = function (path, split) {
          let parts = path.split(split || "/");
          let node = this.get_node(this.mind.root.id);
          for (let i = 1; i < parts.length; i++) {
            node = node.children.find((n) => n.data.label === parts[i]);
            if (!node) break;
          }
          return node;
        };

        $(el).find("canvas").attr("width", el.clientWidth);
        $(el).find("canvas").attr("height", el.clientHeight);
        $(el)
          .find("jmnodes")
          .css({
            width: el.clientWidth + "px",
            height: el.clientHeight + "px",
          });

        _self.jm.show({
          data: content,
          format: "node_tree",
          meta: {
            name: "jsMind remote",
            author: "neilking@163.com",
            version: "0.1",
          },
        });
        let updateEvents = function () {
          document.removeEventListener("selectionchange", sChangeCallback);
          document.addEventListener("selectionchange", sChangeCallback);

          // 停止监听所有元素
          $(el)
            .find("jmnodes jmnode span[nodetype='value']")
            .each(function () {
              if (this._displayObserver) {
                this._displayObserver.disconnect();
              }
            });

          $(el)
            .find("jmnodes jmnode span[nodetype='value']")
            .observeDisplayToVisible(function () {
              console.log("元素已显示:", this);
              let arr = $(this).find("iframe");
              for (let i = 0; i < arr.length; i++) {
                $(arr[i]).attr("src", $(arr[i]).attr("src"));
              }
            });

          //deleteNodeItem
          $(el).find("jmnodes jmnode .deleteNodeItem").off("click");
          $(el)
            .find("jmnodes jmnode .deleteNodeItem")
            .on("click", function () {
              let id = $(this.parentNode.parentNode.parentNode).attr("nodeid");
              let node = _self.jm.get_node(id);
              _self.jm.deleteNodeItem(node);
            });

          $(el).find("jmnodes jmnode .addNodeItem").off("click");
          $(el)
            .find("jmnodes jmnode .addNodeItem")
            .on("click", function () {
              let id = $(this.parentNode.parentNode.parentNode).attr("nodeid");
              let node = _self.jm.get_node(id);
              _self.jm.addNodeItem("", node);
            });

          $(el).find("jmnodes jmnode .addAgentItem").off("click");
          $(el)
            .find("jmnodes jmnode .addAgentItem")
            .on("click", function () {
              _self.jm.emitMessage("addAgentItem");
            });

          $(el).find("jmnodes jmnode .addVideoItem").off("click");
          $(el)
            .find("jmnodes jmnode .addVideoItem")
            .on("click", function () {
              _self.jm.emitMessage("addVideoItem");
            });

          $(el).find("jmnodes jmnode .addImageItem").off("click");
          $(el)
            .find("jmnodes jmnode .addImageItem")
            .on("click", function () {
              _self.jm.emitMessage("addImageItem");
            });

          $(el).find("jmnodes jmnode .selectModuleItem").off("click");
          $(el)
            .find("jmnodes jmnode .selectModuleItem")
            .on("click", function () {
              _self.jm.emitMessage("selectModuleItem");
            });

          $(el).find("jmnodes jmnode .cloneNodeItem").off("click");
          $(el)
            .find("jmnodes jmnode .cloneNodeItem")
            .on("click", function () {
              let id = $(this.parentNode.parentNode.parentNode).attr("nodeid");
              let node = _self.jm.get_node(id);
              _self.jm.insertNodeAfter(node);
            });

          $(el).find("jmnodes jmnode span").off("click");
          $(el)
            .find("jmnodes jmnode span")
            .on("click", (e) => {
              let id = e.currentTarget.getAttribute("nodeId");
              let node = _self.jm.get_node(id);
              if (typeof _self.nodeClickCallback === "function") {
                _self.nodeClickCallback(node);
              }
            });

          $(el).find("jmnodes jmnode span[nodetype='value']").off("blur");
          $(el)
            .find("jmnodes jmnode span[nodetype='value']")
            .on("blur", (e) => {
              setTimeout(() => {
                _self.jm.editNode(e.currentTarget);
              }, 200);
            });
          $(el).find("jmnodes jmnode span[nodetype='value']").off("paste");
          $(el)
            .find("jmnodes jmnode span[nodetype='value']")
            .on("paste", (e) => {
              e.preventDefault();
              if (window.event.clipboardData) {
                const text = window.event.clipboardData.getData("text/plain");
                document.execCommand("insertText", false, text);
              }
            });
        };
        _self.jm.updateEvents = updateEvents;
        setTimeout(() => {
          updateEvents();
        }, 500);
        _self.jm.expand_to_depth(3);

        if (typeof _self.jmInitCallback === "function") {
          _self.jmInitCallback(_self.jm);
        }
      },
    },
    json: {
      mounted: function (el, a, b) {
        var data = $(el).attr("data");
        data = JSON.parse(data);
        if (data) {
          $(el).jsonViewer(data);
        } else {
          $(el).html("暂无数据");
        }
      },
    },
    plugin: {
      mounted: function (el, param) {
        var app = param.value.app;
        var value = param.value.info[param.value.prop];
        var paramName = app.paramName;
        app.dsl = app.dsl || {
          data: {},
        };
        if (paramName) {
          app.dsl.data[paramName] = value;
        } else {
          app.dsl.data = value;
        }
        webCpu.updateView(el, app);
      },
    },
    qr: {
      mounted: function (el, params) {
        var content = el.getAttribute("content");
        let _parent = params.instance;
        let temp = _parent.$el;
        let t = Math.min(temp.clientWidth, temp.clientHeight);
        var w = el.clientWidth;
        var h = el.clientHeight;
        var v = Math.min(w, h);
        var size = Math.min(t, v);
        $(el)
          .parent()
          .css({
            width: size + "px",
            height: size + "px",
          });
        $(el).qrcode({
          render: "canvas",
          text: content,
          width: size - 40, // 二维码的宽度
          height: size - 40, // 二维码的高度
          background: "#ffffff", // 二维码的后景色
          foreground: "#000000", // 二维码的前景色
          // src: "img/logo.png", // 二维码中间的图片
        });
      },
    },
  },
  beforeMount() {
    this.updateData(this.dataObj || {});
  },
  methods: {
    objectToString(obj) {
      return WebTool.objectToString(obj);
    },
    handleClose(tag, tIndex, d, item) {
      console.log(tag);
      info.splice(tIndex, 1);
    },
    handleFileSelected(id, base64) {
      console.log(id, base64.splice(0, 10));
    },
    onFileSelected(event) {
      const file = event.target.files[0];
      let id = event.target.getAttribute("_id");
      if (!file) return;
      const reader = new FileReader();
      let _self = this;
      reader.onload = (e) => {
        const base64Data = e.target.result;
        if (typeof _self.handleFileSelected === "function") {
          _self.handleFileSelected(id, base64Data);
        }
        event.target.files.length = 0;
        event.target.value = "";
      };
      reader.readAsDataURL(file);
    },
    triggerFileInput(id) {
      let inputRef = this.$refs.hiddenFileInput;
      inputRef.setAttribute("_id", id);
      inputRef.click();
    },
    removeImageInput(prop) {
      if (this.info[prop] && this.editorMap[prop].isImage) {
        this.info[prop] = "";
        this.optionMap[prop].style = this.optionMap[prop].style || {};
        this.editorMap[prop].placeholder = "";
      }
      this.dealChangeEvent(this.info, {
        prop: prop,
      });
    },
    handleFileChange(e) {
      let prop = e.target.getAttribute("prop");
      let selectedFile = e.target.files[0];
      if (!selectedFile) {
        return false;
      }
      this.editorMap[prop].placeholder = selectedFile.name;
      // 使用 FileReader 读取文件
      const reader = new FileReader();
      let _self = this;
      reader.onload = function (e) {
        // 将文件读取为Base64格式的字符串
        const base64String = e.target.result;
        if (base64String.search("data:image") !== -1 && _self.editorMap[prop]) {
          _self.editorMap[prop].isImage = true;
        }
        // 在这里可以使用 base64String 进行其他操作，例如显示图片预览等
        console.log("Base64:", base64String);
        _self.info[prop] = base64String;
        _self.dealChangeEvent(_self.info, {
          prop: prop,
        });
      };

      // 以DataURL格式读取文件
      reader.readAsDataURL(selectedFile);
    },
    showInput(d, item) {
      d.inputVisible = true;
      this.$nextTick(() => {
        if (this.$refs && this.$refs.saveTagInput) {
          this.$refs.saveTagInput[0].$refs.input.focus();
        }
      });
    },
    handleInputConfirm(d, item) {
      let inputValue = d.inputValue;
      if (inputValue) {
        info.push(inputValue);
      }
      d.inputVisible = false;
      d.inputValue = "";
    },
    _handleCheckAllChange(d, index, item) {
      if (d.checkAll) {
        info = item.items.map((d) => {
          return d.value || d;
        });
      } else {
        info = [];
      }
      d.isIndeterminate = false;
    },
    _handleCheckedChange(d, index, item) {
      let checkedCount = info.length;
      d.checkAll = checkedCount === item.items.length;
      d.isIndeterminate = checkedCount > 0 && checkedCount < item.items.length;
    },
    updateData(obj) {
      for (var k in obj) {
        this[k] = obj[k] || this[k];
      }
      this.info = this.info || {};
      this.optionMap = this.optionMap || {};
      for (let j = 0; j < this.config.length; j++) {
        var k = this.config[j].prop;
        this.optionMap[k] = this.optionMap[k] || {};
      }
    },
    handleClickCard(d, config) {},
    handleClickButton(d, config) {},
    dealChangeEvent(d, config) {},
  },
  props: {
    dataObj: Object,
  },
};
</script>

<style scoped>
.cardListArea {
  width: 100%;
  height: auto;
  padding: 0px 0px;
}

.ellipsis {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  display: inline-block;
  vertical-align: middle;
  max-width: 100%;
}

.ellipsisTag {
  float: left;
  position: relative;
  margin-right: 5px;
  margin-top: 5px;
}

.ellipsisTag > span.ellipsis {
  position: relative;
  display: inline-block;
  max-width: 100px;
  vertical-align: middle;
}

jmnode {
  padding: 0px !important;
  margin: 0px !important;
  box-shadow: none;
  display: inline-flex;
  box-sizing: border-box;
}

jmnode.selected {
  z-index: 999;
}

jmnode > span {
  padding: 10px;
  padding-top: 10px !important;
  margin: 0px !important;
  display: inline-block;
  vertical-align: middle;
  border: solid 1px #c6e2ff;
  border-radius: 5px;
}

jmnode > span[nodetype="value"] {
  white-space: pre-wrap;
  font-size: 14px;
}

jmnode > span[contenteditable="true"] {
  max-width: calc(100% - 20px) !important;
}

.el-card[mode="view"] jmnode > span[nodetype="value"] {
  max-width: 100% !important;
  cursor: pointer;
}
.el-card[mode="edit"] jmnode > span[nodetype="value"] {
  padding-right: 40px;
}

jmnode .prefixDropdown {
  display: inline-flex;
  vertical-align: middle;
}

jmnode > span .prefixDropdown .dropdown-item {
  display: none;
  cursor: pointer;
}

jmnode > .prefixDropdown .dropdown-item:nth-child(1) {
  display: none;
}

jmnode > span[nodetype="array_item"] .prefixDropdown .dropdown-item,
jmnode > span[nodetype="root"] .prefixDropdown .dropdown-item:nth-child(3),
jmnode > span[nodetype="key"] .prefixDropdown .dropdown-item:nth-child(2),
jmnode > span[nodetype="key"] .prefixDropdown .dropdown-item:nth-child(3),
jmnode > span[nodetype="array"] .prefixDropdown .dropdown-item:nth-child(2) {
  display: block;
}

jmnode > span[nodetype="value"][contenteditable="true"]:focus-visible {
  outline: none; /* 禁用默认外框 */
  box-shadow: none; /* 禁用阴影（某些浏览器） */
}

jmnode span.valueEditor {
  display: none;
  padding: 3px !important;
}
jmnode span.valueEditor .dropdown-toggle {
  padding: 10px !important;
}

jmnode span.valueEditor .subfixDropdown .dropdown-item {
  padding-top: 10px;
  padding-bottom: 10px;
  font-size: 24px;
}

jmnode.selected > span {
  color: #ddd;
}

jmnode.selected > span {
  color: #000;
  background-color: #ddd;
}

jmnode.selected > span[nodetype="value"][contenteditable="true"] {
  background-color: #666;
  color: #fff;
}

span[nodetype="value"][contenteditable="true"] {
  line-height: 25px;
}

jmnode.selected > span.valueEditor {
  display: inline-block;
  position: absolute;
  top: 0px;
  right: 1px;
  transform: scale(0.65);
  transform-origin: 100% 0px;
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
  border-right: none;
  background-color: #666;
  z-index: 4;
}

jmnode.selected > span.valueEditor .dropdown-toggle {
  color: #fff;
}

jmnode > span[nodetype="value"] {
  box-shadow: 2px 2px 2px #666;
  border-top: solid 1px #ddd;
  border-left: solid 1px #ddd;
}

jmnode > span[nodetype="value"] img {
  max-width: 100%;
}

.el-card {
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
}

.el-card__body {
  padding: 0px;
  height: 100%;
  float: left;
  width: 100%;
  position: relative;
}

.el-form-item {
  margin-bottom: 0px;
}

i.bi {
  margin-right: 5px;
}

.cardListArea .el-form-item__content {
  display: inline-block;
  vertical-align: middle;
}

.el-input__wrapper {
  width: 100% !important;
}

.cardListArea .el-form-item__content span {
  vertical-align: middle;
  line-height: 1;
}

.resultOptionArea {
  width: 100%;
  position: relative;
  float: left;
  margin-bottom: 35px;
  font-size: 14px;
  color: #999;
  border-bottom: solid 1px #ddd;
  padding-bottom: 5px;
}

.resultOptionArea .el-button,
.resultOptionArea .checkBoxItem {
  bottom: -33px;
  position: absolute;
  z-index: 3;
}

/* 使下拉菜单在 hover 时展开 */
.dropdown:hover .dropdown-menu {
  display: block;
  top: calc(50% + 5px);
  transition: opacity 0.3s ease;
  opacity: 1;
  z-index: 9999;
}

/* 默认隐藏下拉菜单 */
.dropdown-menu {
  display: none;
}

/* 禁用点击展开功能 */
.dropdown-toggle {
  pointer-events: none; /* 禁用点击事件 */
}

.dropdown .dropdown-toggle.btn-link,
span[nodeType="value"] .btn-sm {
  padding: 0rem 0.1rem !important;
  display: inline-block;
  margin-top: -2px;
  vertical-align: middle;
}
span[nodeType="value"] .btn-sm {
  margin-left: 10px;
  margin-top: -3px;
}

.dropdown-toggle::after {
  display: none;
}

.pageCard-file {
  transform: scale(0.6);
  transform-origin: 0 0;
}

.btn-link {
  text-decoration: none; /* 移除下划线 */
}

.resultOptionArea .checkBoxItem {
  left: 10px;
}
.resultOptionArea .el-button {
  right: 10px;
}

.el-pagination {
  position: absolute;
  bottom: 5px;
}

.titleInfo {
  margin-left: 10px;
}
.pageCard-file-label > .selectFileName {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  display: inline-block;
  vertical-align: middle;
  width: calc(100% - 110px);
}

label {
  margin-bottom: 0px;
}

span[flag="label"] {
  font-size: 12px;
}

.ellipsis_2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.ellipsis_3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
.ellipsis_4 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  overflow: hidden;
}
.ellipsis_5 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
  overflow: hidden;
}

.input-new-tag {
  display: inline-block;
  margin-left: 10px;
  width: auto !important;
}

.el-card__body .el-select {
  width: 100%;
}

.el-tag {
  margin-right: 5px;
}
</style>
