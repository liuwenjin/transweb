<template>
<div class="FormInfoArea">
  <el-form ref="dataInfo" class="formItem" :label-width="dataInfo.labelWidth" :label-position="dataInfo.labelPosition || 'right'" :label-suffix="dataInfo.labelSuffix || ':'" :model="dataInfo">
    <slot v-for="(item, index) in dataInfo.data">
      <el-form-item v-if="!item.hide" class="formLine" :label="item.name || item.label" :required="item.must" :index="index" :style="item.style || dataInfo.style">
        <el-checkbox v-if="item.type === 'checkbox' && dataInfo.mode !== 'view'" ref="checkAll" v-model="item.checkAll" prop="checkAll" label="全部" :indeterminate="item.isIndeterminate" name="type" :size="item.size" @change="handleCheckAllChange(item, index)"></el-checkbox>
        <slot v-if="!!item.items && !!item.type && dataInfo.mode !== 'view'">
          <label v-for="(d, i) in item.items" :key="i" style="margin-right: 10px">
            <slot>
              <span v-if="d.type === 'checkbox' || item.type === 'checkbox'">
                <el-checkbox v-model="d.checked" prop="checked" :label="d.value" :name="item.name" :size="item.size" @change="handleCheckedChange(item, index)">{{ d.name || d.label }}</el-checkbox>
              </span>
              <span v-else-if="d.type === 'radio' || item.type === 'radio'">
                <el-radio v-model="item.value" prop="value" :label="d.value === undefined ? d : d.value" :size="item.size" name="type" @change="dealChangeEvent(item, index)">{{ d.name || d.label }}</el-radio>
              </span>
              <span v-else-if="d.type === 'switch' || item.type === 'switch'">
                <span v-if="d">{{ d }}</span>
                <el-switch v-model="item.value" prop="value" active-color="#13ce66" inactive-color="#ff4949" :size="item.size" @change="dealChangeEvent(item, index)"></el-switch>
              </span>
              <span v-else-if="
                    d.type === 'dateRange' || item.type === 'dateRange'
                  ">
                <el-date-picker :disabled="item.disabled" v-model="item.value" clearable type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" :default-time="['', '']" :size="item.size" prop="value" value-format="timestamp" :picker-options="item.pickerOptions" @change="dealChangeEvent(item, index)"></el-date-picker>
              </span>
              <span v-else-if="d.type === 'text' || item.type === 'text'">
                <el-input :disabled="item.disabled" :show-password="item.showPassword" v-model="item.value" clearable :size="item.size" :placeholder="d.placeholder" prop="value" @change="dealChangeEvent(item, index)"></el-input>
              </span>
              <span v-else-if="d.type === 'number' || item.type === 'number'" clearable>
                <el-input-number v-model="item.value" clearable :size="item.size" :placeholder="d.placeholder" :min="d.min || item.min" :max="d.max || item.max" :precision="d.precision || item.precision" prop="value" @change="dealChangeEvent(item, index)"></el-input-number>
              </span>
              <span v-else-if="d.type === 'select' || item.type === 'select'">
                <el-select :disabled="item.disabled" v-model="item.value" :multiple="item.multiple" :clearable="!item.multiple" :size="item.size" :placeholder="d.placeholder" @change="
                      dealChangeEvent({ ...item, value: d.value }, index)
                    ">
                  <el-option v-for="(tItem, tIndex) in d.options" :key="tIndex" :label="tItem.label || tItem" :value="tItem.value === undefined ? tItem : tItem.value"></el-option>
                </el-select>
              </span>
              <span v-else-if="d.type === 'textarea' || item.type === 'textarea'">
                <el-input :disabled="item.disabled" v-model="item.value" clearable type="textarea" :size="item.size" :placeholder="d.placeholder" prop="value" @change="dealChangeEvent(item, index)"></el-input>
              </span>
              <span v-else-if="
                    d.type === 'datePicker' || item.type === 'datePicker'
                  ">
                <el-date-picker :disabled="item.disabled" v-model="item.value" :size="item.size" :format="d.format || item.format || 'yyyy-MM-dd HH:mm:ss'" :value-format="
                      d['value-format'] ||
                        item['value-format'] ||
                        'yyyy-MM-dd HH:mm:ss'
                    " :type="d.pickerType || item.pickerType || 'datetime'" :placeholder="
                      d.placeholder || item.placeholder || '选择日期时间'
                    " @change="dealChangeEvent(item, index)"></el-date-picker>
              </span>
              <span v-else> </span>
            </slot>
            <slot v-if="!!d.input">
              <span v-for="(t, index) in d.input" :key="index">
                <el-input v-model="item[t.mode]" clearable :size="t.size || 'small'" :placeholder="t.placeholder" :style="
                      'display: inline-block; width: ' +
                        (t.width || 100) +
                        'px;'
                    " @change="dealChangeEvent(item, index)"></el-input>
                <span v-if="t.label" style="margin-right: 5px">{{
                    t.label
                  }}</span>
                <span v-if="t.text" style="margin-right: 10px">{{
                    t.text
                  }}</span>
              </span>
            </slot>
          </label>
        </slot>
        <span v-else-if="item.type === 'tags' && dataInfo.mode !== 'view'">
          <el-tag v-for="(tag, tIndex) in item.value" :key="tIndex" class="eTagItem" closable :type="tag.type" :size="item.size" prop="value" style="margin-left: 5px" @close="handleClose(tag, tIndex, item)">{{ tag.name || tag }}</el-tag>
          <el-input v-if="item.inputVisible" ref="saveTagInput" v-model="item.inputValue" clearable class="input-new-tag" size="mini" @keyup.enter="handleInputConfirm(item, index)" @blur="handleInputConfirm(item, index)">
          </el-input>
          <el-button v-else class="button-new-tag" size="small" @click="showInput(item, index)">+新增标签</el-button>
        </span>
        <slot v-else>
          <p v-if="
                item.value &&
                  item.value.constructor &&
                  item.value.constructor.name !== 'Array'
              ">
            {{
                item.type === 'select'
                  ? dataMap(item.value, item.items[0].options)
                  : dataMap(item.value, item.items)
              }}
          </p>
          <span v-for="(t, index) in item.value" v-else :key="index" class="spanItem">
            {{ dataMap(t, item.items) }}
          </span>
        </slot>
        <slot v-if="
              item.folding &&
                (item.type === 'checkbox' || item.type === 'radio')
            ">
          <label style="
                position: absolute;
                top: 2px;
                right: 0px;
                line-height: 15px;
              " :title="item.buttonText || '收起'">
            <el-button type="text" size="small">
              <i style="
                    display: inline-block;
                    border: solid 1px #eee;
                    padding: 2px;
                    border-radius: 2px;
                  " :class="item.buttonIcon || 'el-icon-arrow-up'"></i>
            </el-button>
          </label>
        </slot>
        <p v-if="item.errorTips" prop="errorTips" style="line-height: 1; color: rgba(220, 0, 0, 0.8)">
          {{ item.errorTips }}
        </p>
      </el-form-item>
    </slot>
  </el-form>
</div>
</template>

<script>
// var $ = require("jquery");
export default {
  props: {
    dataObj: Object,
  },
  data() {
    return {
      dataInfo: {
        labelWidth: '100px',
        labelPosition: "left",
        data: [{
          name: '姓名',
          value: 'XXXX',
        }, ],
      },
    };
  },
  beforeMount() {
    // this.dataInfo = this.dataObj;
    if (this.dataObj) {
      this.updateData(this.dataObj);
    }
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
      d.inputValue = '';
    },
    updateData(data) {
      this.dataInfo = data;
      var arr = data.data;
      var result = data.result || {};
      for (var i = 0; i < arr.length; i++) {
        var key = arr[i].key;
        if (key && result[key]) {
          arr[i].value = result[key] || arr[i].value;
        }
        if (arr[i].type === 'checkbox') {
          arr[i].value = [];
          for (var j = 0; j < arr[i].items.length; j++) {
            var item = arr[i].items[j];
            if (typeof item === 'string') {
              arr[i].items[j] = {
                name: item,
                value: item,
              };
            }
          }
        }
      }
    },
    dealChangeEvent(item, index) {
      this.$emit('change', item, index, this.dataInfo);
      console.log(item, index);
      this.checkValue(item);
    },
    getFormValue() {
      var arr = this.dataInfo.data || [];
      var tData = {};
      for (var i = 0; i < arr.length; i++) {
        var key = arr[i].key || i;
        tData[key] = arr[i].value;
        if (arr[i].items && arr[i].items[0] && arr[i].type !== 'radio') {
          tData[key] = arr[i].items[0].value || arr[i].value;
          if (arr[i].items.length > 1) {
            tData[key] = arr[i].items.map(item => {
              return item.value;
            });
          }
          arr[i].value = tData[key];
        }
      }
      return tData;
    },
    updateFormValue(data) {
      data = data || {};
      var arr = this.dataInfo.data || [];
      for (var i = 0; i < arr.length; i++) {
        var key = arr[i].key || i;
        arr[i].value = data[key];
      }
      this.$forceUpdate();
    },
    emptyFormValue(data) {
      this.updateFormValue({});
    },
    checkValue(item) {
      var tRet = {
        code: 0,
        message: 'OK',
      };
      this.getFormValue();
      if (item.must && (!item.value || item.value.length === 0)) {
        tRet.code = 1;
        tRet.message = '不可为空。';
        item.errorTips = tRet.message;
        this.$forceUpdate();
        return tRet;
      } else {
        item.errorTips = '';
      }

      var rule = item.checkRule;
      item.errorTips = undefined;
      var tt = null;
      if (rule) {
        if (rule.constructor.name === 'Object' && rule.callback) {
          tt = rule.callback(item.value);
          if (tt !== 0) {
            tRet.code = tt;
            tRet.message = rule.message || '';
          }
        } else if (rule.constructor.name === 'Array') {
          for (var i = 0; i < rule.length; i++) {
            if (
              rule[i] &&
              rule[i].constructor.name === 'Object' &&
              rule[i].callback
            ) {
              tt = rule[i].callback(item.value);
              console.log(tt);
              if (tt !== 0) {
                tRet.code = tt;
                tRet.message = rule[i].message;
                break;
              }
            }
          }
        }
      }
      if (tRet.code !== 0) {
        item.errorTips = tRet.message;
      } else {
        item.errorTips = '';
      }
      this.$forceUpdate();
      return tRet;
    },
    checkAllItems() {
      var ret = 0;
      var arr = this.dataInfo.data;
      for (var i = 0; i < arr.length; i++) {
        var tRet = this.checkValue(arr[i]);
        if (tRet.code !== 0 && ret === 0) {
          ret = tRet.code;
        }
      }
      return ret;
    },
    dataMap(v, options) {
      var ret = v;
      if (options && options.constructor.name === 'Array') {
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
      item.value = [];
      for (var i = 0; i < item.items.length; i++) {
        if (item.checkAll) {
          // item.checkAll=false
          item.items[i].checked = true;
          item.value.push(item.items[i].value || item.items[i].name);
        } else {
          item.items[i].checked = false;
        }
      }
      item.isIndeterminate = false;

      this.$forceUpdate();
      this.$emit('change', item, index, this.dataInfo);
      console.log(item, index);
      this.checkValue(item);
    },
    handleCheckedChange(item, index) {
      item.value = [];
      for (var i = 0; i < item.items.length; i++) {
        if (item.items[i].checked) {
          item.value.push(item.items[i].value || item.items[i].name);
        }
      }
      let checkedCount = item.value.length;
      item.checkAll = checkedCount === item.items.length;
      item.isIndeterminate =
        checkedCount > 0 && checkedCount < item.items.length;

      this.$forceUpdate();
      this.$emit('change', item, index, this.dataInfo);
      console.log(item, index);
      this.checkValue(item);
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          alert('submit!!');
          console.log(this.dataInfo);
        } else {
          alert('error!!');
          return false;
        }
      });
    },
  },
};
</script>

<style scoped>
.formLine>label {
  font-weight: 700;
}

.el-form {
  padding: 5px 0px;
}

.FormInfoArea :deep(.el-form-item__content) .input-new-tag {
  display: inline-block;
  margin-left: 10px;
  width: auto !important;
}

.FormInfoArea :deep(.el-select__tags) {
  max-width: 100%;
}

:deep(.el-form-item__content) {
  display: inline-block;
 }

.spanItem {
  display: inline-block;
  margin-right: 10px;
}

.spanItem::after {
  content: ',';
  display: inline-block;
}

.spanItem:last-child::after {
  content: '' !important;
}

.FormInfoArea :deep(.el-form-item) {
  margin-bottom: 5px !important;
}

.FormInfoArea :deep(.el-form-item__content) .button-new-tag {
  margin-left: 10px;
}

.FormInfoArea :deep(.el-form-item__content)>label,
.FormInfoArea :deep(.el-form-item__content)>label>span>div {
  width: 100%;
}
.FormInfoArea :deep(.el-form-item__content)>label.el-checkbox {
  width: auto;
  margin-right: 15px;
}

:deep(.el-form-item__content) {
  padding-right: 20px;
  padding-top: 1px;
  padding-bottom: 3px;
}

:deep(.el-input__inner),
.el-input-number {
  width: 100%;
}

.el-form-item__content>p {
  width: 100%;
  margin: 0px;
  text-align: left;
}
</style>
