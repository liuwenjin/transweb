<template>
  <div :style="style" class="FormInfoArea">
    <el-form
      class="formItem"
      :label-width="labelWidth"
      :label-position="labelPosition || 'left'"
      :label-suffix="labelSuffix || ':'"
      :inline="inline"
      
    >
      <slot v-for="(item, index) in data">
        <el-form-item
          class="formLine"
          :label="item.name || item.label"
          :required="optionMap[item.key || index].must || item.must"
          :label-width="
            optionMap[item.key || index].labelWidth || item.labelWidth
          "
          :style="optionMap[item.key || index].style || item.style"
        >
          <slot v-if="item.type === 'radio'">
            <el-radio-group
              v-model="result[item.key || index]"
              :key="item.key"
              :size="optionMap[item.key || index].size || item.size || 'small'"
              @change="dealChangeEvent(item, result)"
              :style="
                optionMap[item.key || index].valueStyle || item.valueStyle
              "
            >
              <slot
                v-for="d in optionMap[item.key || index].items || item.items"
              >
                <el-radio
                  :label="d.value === undefined ? d : d.value"
                ></el-radio>
              </slot>
            </el-radio-group>
          </slot>
          <span
            v-else-if="item.type === 'tags'"
            :style="optionMap[item.key || index].valueStyle || item.valueStyle"
          >
            <el-tag
              v-for="(tag, tIndex) in result[item.key || index]"
              :key="tIndex"
              class="eTagItem"
              closable
              :type="tag.type"
              :size="optionMap[item.key || index].size || item.size || 'small'"
              prop="value"
              @close="handleClose(tag, tIndex, item)"
              >{{ tag.name || tag }}</el-tag
            >
            <el-input
              v-if="item.inputVisible"
              ref="saveTagInput"
              v-model="item.inputValue"
              clearable
              class="input-new-tag"
              :size="optionMap[item.key || index].size || item.size || 'small'"
              @keyup.enter="handleInputConfirm(item, index)"
              @blur="handleInputConfirm(item, index)"
            >
            </el-input>
            <el-button
              v-else
              class="button-new-tag"
              :size="optionMap[item.key || index].size || item.size || 'small'"
              @click="showInput(item, index)"
              >{{
                optionMap[item.key || index].buttonLabel ||
                item.buttonLabel ||
                "新增"
              }}</el-button
            >
          </span>
          <span
            v-else-if="item.type === 'checkbox'"
            :style="optionMap[item.key || index].valueStyle || item.valueStyle"
          >
            <el-checkbox
              ref="checkAll"
              v-model="item.checkAll"
              prop="checkAll"
              label="全部"
              :indeterminate="item.isIndeterminate"
              @change="handleCheckAllChange(item, index)"
              name="type"
              :size="optionMap[item.key || index].size || item.size || 'small'"
            ></el-checkbox>
            <el-checkbox-group
              style="display: inline-block; margin-left: 15px"
              v-model="result[item.key || index]"
              :key="item.key"
              :size="optionMap[item.key || index].size || item.size || 'small'"
              @change="handleCheckedChange(item, index)"
            >
              <slot v-for="d in item.items">
                <el-checkbox
                  :label="d.value || d"
                  :size="
                    optionMap[item.key || index].size || item.size || 'small'
                  "
                  >{{ d.name || d.label || d }}</el-checkbox
                >
              </slot>
            </el-checkbox-group>
          </span>
          <span
            v-else-if="item.type === 'input'"
            :style="item.valueStyle || 'display: inline-block; width: 100%'"
          >
            <el-input
              :show-password="
                optionMap[item.key || index].showPassword || item.showPassword
              "
              v-model="result[item.key || index]"
              clearable
              :size="optionMap[item.key || index].size || item.size || 'small'"
              :placeholder="
                optionMap[item.key || index].placeholder || item.placeholder
              "
              @change="dealChangeEvent(item, result)"
            ></el-input>
          </span>
          <span
            v-else-if="item.type === 'textarea'"
            :style="item.valueStyle || 'display: inline-block; width: 100%'"
          >
            <el-input
              v-model="result[item.key || index]"
              clearable
              type="textarea"
              :rows="optionMap[item.key || index].rows || item.rows || 3"
              :size="optionMap[item.key || index].size || item.size || 'small'"
              :placeholder="
                optionMap[item.key || index].placeholder || item.placeholder
              "
              @change="dealChangeEvent(item, result)"
            ></el-input>
          </span>
          <span
            v-else-if="item.type === 'select'"
            :style="item.valueStyle || 'display: inline-block; width: 100%'"
          >
            <el-select
              default-first-option
              :allow-create="
                optionMap[item.key || index].allowCreate || item.allowCreate
              "
              :filterable="
                optionMap[item.key || index].filterable ||
                item.filterable ||
                true
              "
              :reserve-keyword="false"
              v-model="result[item.key || index]"
              :multiple="optionMap[item.key || index].multiple || item.multiple"
              :multiple-limit="
                optionMap[item.key || index].multipleLimit || item.multipleLimit
              "
              :clearable="!item.multiple"
              :size="optionMap[item.key || index].size || item.size || 'small'"
              :placeholder="
                optionMap[item.key || index].placeholder || item.placeholder
              "
              @change="dealChangeEvent(item, result)"
            >
              <el-option
                v-for="(tItem, tIndex) in optionMap[item.key || index]
                  .options || item.options"
                :key="tIndex"
                :label="tItem.label || tItem.name || tItem"
                :value="tItem.value === undefined ? tItem : tItem.value"
              ></el-option>
            </el-select>
          </span>
          <span
            v-else-if="item.type === 'cascader'"
            :style="
              optionMap[item.key || index].valueStyle ||
              item.valueStyle ||
              'display: inline-block; width: 100%'
            "
          >
            <el-cascader
              default-first-option
              :allow-create="
                optionMap[item.key || index].allowCreate || item.allowCreate
              "
              :filterable="
                optionMap[item.key || index].filterable ||
                item.filterable ||
                true
              "
              :reserve-keyword="false"
              :options="optionMap[item.key || index].options || item.options"
              v-model="result[item.key || index]"
              :multiple="optionMap[item.key || index].multiple || item.multiple"
              :multiple-limit="
                optionMap[item.key || index].multipleLimit || item.multipleLimit
              "
              :clearable="!item.multiple"
              :size="optionMap[item.key || index].size || item.size || 'small'"
              :placeholder="
                optionMap[item.key || index].placeholder || item.placeholder
              "
              @change="dealChangeEvent(item, result)"
            >
            </el-cascader>
          </span>
          <span
            v-else-if="item.type === 'switch'"
            :style="
              optionMap[item.key || index].valueStyle ||
              item.valueStyle ||
              'display: inline-block; width: 100%'
            "
          >
            <span v-if="item.label">{{ item.label }}</span>
            <el-switch
              v-model="result[item.key || index]"
              :active-color="
                optionMap[item.key || index].activeColor ||
                item.activeColor ||
                '#13ce66'
              "
              :inactive-color="
                optionMap[item.key || index].inactive ||
                item.inactive ||
                '#ff4949'
              "
              :active-text="
                optionMap[item.key || index].activeText || item.activeText || ''
              "
              :inactive-text="
                optionMap[item.key || index].inactiveText ||
                item.inactiveText ||
                ''
              "
              :inline-prompt="
                optionMap[item.key || index].textInside || item.textInside
              "
              :size="optionMap[item.key || index].size || item.size || 'small'"
              @change="dealChangeEvent(item, result)"
            ></el-switch>
          </span>
          <span v-else-if="item.type === 'datePicker'">
            <el-date-picker
              v-model="item.value"
              :size="optionMap[item.key || index].size || item.size || 'small'"
              clearable
              :format="
                optionMap[item.key || index].format ||
                item.format ||
                'YYYY-MM-DD'
              "
              :value-format="
                optionMap[item.key || index].valueFormat ||
                item.valueFormat ||
                'YYYY-MM-DD'
              "
              :type="
                optionMap[item.key || index].pickerType ||
                item.pickerType ||
                'datetime'
              "
              :placeholder="
                optionMap[item.key || index].placeholder ||
                item.placeholder ||
                '选择日期时间'
              "
              @change="dealChangeEvent(item, result)"
            ></el-date-picker>
          </span>
          <span v-else-if="item.type === 'dateRange'">
            <el-date-picker
              v-model="result[item.key || index]"
              clearable
              type="daterange"
              :start-placeholder="
                optionMap[item.key || index].startPlaceholder ||
                item.startPlaceholder ||
                '开始日期'
              "
              :end-placeholder="
                optionMap[item.key || index].endPlaceholder ||
                item.endPlaceholder ||
                '结束日期'
              "
              :size="optionMap[item.key || index].size || item.size || 'small'"
              :format="
                optionMap[item.key || index].format ||
                item.format ||
                'YYYY-MM-DD'
              "
              :value-format="
                optionMap[item.key || index].valueFormat ||
                item.valueFormat ||
                'YYYY-MM-DD'
              "
              :picker-options="
                optionMap[item.key || index].pickerOptions || item.pickerOptions
              "
              @change="dealChangeEvent(item, result)"
            ></el-date-picker>
          </span>
          <span v-else-if="item.type === 'colorPicker'">
            <el-color-picker
              v-model="result[item.key || index]"
              clearable
              :size="optionMap[item.key || index].size || item.size || 'small'"
              :show-alpha="
                optionMap[item.key || index].showAlpha || item.showAlpha
              "
              :predefine="
                optionMap[item.key || index].predefine || item.predefine
              "
              :color-format="
                optionMap[item.key || index].colorFormat || item.colorFormat
              "
              @change="dealChangeEvent(item, result)"
            ></el-color-picker>
          </span>
          <span v-else-if="item.type === 'inputNumber'">
            <el-input-number
              v-model="result[item.key || index]"
              clearable
              :size="optionMap[item.key || index].size || item.size || 'small'"
              :placeholder="
                optionMap[item.key || index].placeholder || item.placeholder
              "
              :min="optionMap[item.key || index].min || item.min || 0"
              :max="optionMap[item.key || index].max || item.max || 100"
              :precision="
                optionMap[item.key || index].precision || item.precision || 1
              "
              @change="dealChangeEvent(item, result)"
            ></el-input-number>
          </span>
          <span
            v-else-if="item.type === 'slider'"
            style="display: inline-block; width: 100%"
          >
            <el-slider
              v-model="result[item.key || index]"
              :range="optionMap[item.key || index].range || item.range"
              :vertical="optionMap[item.key || index].vertical || item.vertical"
              :placement="
                optionMap[item.key || index].placement || item.placement
              "
              :size="optionMap[item.key || index].size || item.size"
              :marks="optionMap[item.key || index].marks || item.marks"
              :min="optionMap[item.key || index].min || item.min"
              :max="optionMap[item.key || index].max || item.max"
              :precision="
                optionMap[item.key || index].precision || item.precision
              "
              :show-input="
                optionMap[item.key || index].showInput || item.showInput
              "
              :step="optionMap[item.key || index].step || item.step"
              :show-stops="
                optionMap[item.key || index].showStops || item.showStops
              "
              :show-tooltip="
                optionMap[item.key || index].showTooltip || item.showTooltip
              "
              :format-tooltip="
                optionMap[item.key || index].formatTooltip || item.formatTooltip
              "
              @change="dealChangeEvent(item, result)"
            ></el-slider>
          </span>
        </el-form-item>
      </slot>
    </el-form>
  </div>
</template>

<script>
export default {
  props: {
    dataObj: Object,
  },
  data() {
    return {
      style: {},
      labelWidth: "60px",
      labelPosition: "left",
      labelSuffix: ":",
      inline: false,
      optionMap: {},
      result: {},
      data: [
        {
          name: "选择时间段",
          type: "dateRange",
        },
        {
          name: "选择时间",
          type: "datePicker",
        },
        {
          name: "描述",
          type: "textarea",
        },
        {
          name: "输入项C",
          type: "switch",
        },
        {
          name: "输入项B",
          type: "select",
          placeholder: "请选择",
          options: ["数值A", "数值B", "数值C", "数值D"],
        },
        {
          name: "输入项A",
          type: "input",
          placeholder: "请输入",
        },
        {
          name: "测试0",
          type: "tags",
        },
        {
          name: "测试1",
          type: "checkbox",
          items: ["数值A", "数值B", "数值C"],
        },
        {
          name: "测试2",
          type: "radio",
          items: ["数值A", "数值B", "数值C"],
        },
        {
          name: "测试3",
          type: "slider",
          value: 0,
          min: 0,
          max: 20,
        },
      ],
    };
  },
  beforeMount() {
    this.updateData(this.dataObj);
  },
  methods: {
    handleClose(tag, tIndex, d) {
      console.log(tag);
      d.value.splice(tIndex, 1);
    },

    showInput(d) {
      d.inputVisible = true;
      this.$nextTick(() => {
        if (this.$refs && this.$refs.saveTagInput) {
          this.$refs.saveTagInput[0].$refs.input.focus();
        }
      });
    },

    handleInputConfirm(d) {
      let inputValue = d.inputValue;
      if (inputValue) {
        d.value.push(inputValue);
      }
      d.inputVisible = false;
      d.inputValue = "";
    },
    updateData(data) {
      data = data || {};
      for (var k in data) {
        this[k] = data[k];
      }
      var arr = this.data;
      this.optionMap = this.optionMap || {};
      this.result = this.result || {};
      for (var i = 0; i < arr.length; i++) {
        var k = arr[i].key || i;
        this.optionMap[k] = this.optionMap[k] || {};
        if (
          arr[i].type === "checkbox" ||
          arr[i].type === "tags" ||
          arr[i].type === "dateRange" ||
          (arr[i].type === "select" &&
            (this.optionMap[k].multiple || arr[i].multiple))
        ) {
          this.result[k] = this.result[k] || arr[i].value || [];
        } else if (arr[i].type === "switch") {
          this.result[k] = this.result[k] || arr[i].value || false;
        } else if (arr[i].type === "inputNumber") {
          this.result[k] = this.result[k] || arr[i].value || 0;
        } else {
          this.result[k] = this.result[k] || arr[i].value || "";
        }
      }
      // debugger
    },
    dealChangeEvent(item, result) {
      // console.log("changed:", item, result);
      this.$emit("change", result, item);
    },
    dataMap(v, options) {
      var ret = v;
      if (options && options.constructor.name === "Array") {
        for (var i = 0; i < options.length; i++) {
          var item = options[i];
          if (item.value === v) {
            ret = item.name || item.label;
            break;
          }
        }
      }
      return ret;
    },
    dealPickerEvent(start, end, item) {
      console.log(start);
      item.value = [start, end];
    },
    handleCheckAllChange(item, index) {
      if (item.checkAll) {
        item.value = item.items.map((d) => {
          return d.value || d;
        });
      } else {
        item.value = [];
      }
      item.isIndeterminate = false;
      this.$emit("change", item, index, this.data);
    },
    handleCheckedChange(item, index) {
      let checkedCount = item.value.length;
      item.checkAll = checkedCount === item.items.length;
      item.isIndeterminate =
        checkedCount > 0 && checkedCount < item.items.length;
      this.$emit("change", item, index, this.data);
    },
  },
};
</script>

<style scoped>
.formLine > label {
  font-weight: 700;
}

.el-form {
  padding: 5px 0px;
}

.input-new-tag {
  display: inline-block;
  margin-left: 10px;
  width: auto !important;
}

.spanItem {
  display: inline-block;
  margin-right: 10px;
}

.spanItem::after {
  content: ",";
  display: inline-block;
}

.spanItem:last-child::after {
  content: "" !important;
}

.FormInfoArea .el-form-item {
  margin-bottom: 5px !important;
}

.FormInfoArea .button-new-tag {
  margin-left: 10px;
}

.FormInfoArea .el-select {
  display: block;
}

label.el-form-item__label {
  margin-bottom: 0px !important;
}
.el-tag {
  margin-right: 5px;
}
.el-form-item__content > p {
  width: 100%;
  margin: 0px;
  text-align: left;
}
</style>