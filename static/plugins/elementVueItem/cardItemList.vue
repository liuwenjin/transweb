<template>
  <div class="cardListArea" :style="style">
    <slot v-if="data.length !== 0">
      <div
        class="resultOptionArea"
        v-if="showOption"
        :style="{
          marginBottom: withSelection && optionBtn ? '35px' : '5px',
        }"
      >
        <span class="checkBoxItem">
          <el-checkbox
            v-if="withSelection"
            @change="handleCheckAllChange"
            :indeterminate="isIndeterminate"
            v-model="checkAll"
            label="全选"
            ref="checkAll"
            :size="checkboxSize || 'large'"
          />
        </span>
        <span class="titleInfo">{{ name }}</span
        >共: <span>{{ page.total }} 条</span>
        <el-button
          v-if="optionBtn"
          style="float: right"
          type="primary"
          size="small"
          @click="handleClickTopBtn"
          >{{ optionBtnText || "导出" }}</el-button
        >
      </div>
      <el-row
        :gutter="gutter"
        :style="{
          position: 'relative',
          width: '100%',
          height: '100%',
          paddingBottom: !!page && page.total ? '50px' : '0px',
        }"
      >
        <el-col
          v-for="(d, i) in data"
          :key="i"
          :span="span"
          :style="{
            'padding-right':
              i % (24 / span) === 24 / span - 1 ? '0px' : gutter / 2 + 'px',
          }"
        >
          <slot v-if="withSelection">
            <el-checkbox
              @change="handleCheckedChange(d, i)"
              :style="{
                position: 'absolute',
                top: '3px',
                left: '10px',
                display: 'inline-block',
              }"
              v-model="d.checked"
              :size="checkboxSize || 'large'"
            />
          </slot>
          <div
            :style="cardStyle"
            v-plugin="{
              info: d,
            }"
          >
            {{ d }}
          </div>
        </el-col>
      </el-row>
      <slot
        v-if="
          page &&
          page.total &&
          page.total > page.pageSize &&
          page.pageSize !== 1
        "
      >
        <el-pagination
          :current-page="page.currentPage"
          :page-size="page.pageSize"
          size="small"
          :layout="page.layout || 'prev, pager, next, jumper'"
          :total="page.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </slot>
      <slot v-else-if="page && page.pageSize === 1">
        <el-pagination
          :current-page="page.currentPage"
          :page-size="page.pageSize"
          size="small"
          layout="prev, next"
          :total="page.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </slot>
    </slot>
    <el-empty v-else description="暂无数据"></el-empty>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showOption: false,
      name: "科研信息",
      mode: "view",
      gutter: 10,
      span: 24,
      style: "",
      withSelection: false,
      isIndeterminate: false,
      optionBtn: false,
      optionBtnText: "导出",
      cardStyle: {},
      cardApp: {
        url: "/plugins/elementVueItem/pageCard.vue",
        className: "ElementVueItem",
        dsl: {},
      },
      config: [],
      info: {},
      data: [],
      page: {},
    };
  },
  directives: {
    plugin: {
      mounted: function (el, param, item) {
        console.log(el, param, item);
        var _self = param.instance;
        var app = _self.cardApp;
        app.dsl.data = {
          info: param.value.info,
          cardStyle: _self.cardStyle,
          config: _self.config,
          optionMap: _self.optionMap,
        };
        webCpu.updateView(el, app);
      },
    },
  },
  beforeMount() {
    this.updateData(this.dataObj || {});
    this.cardApp.dsl.methods = this.cardApp.dsl.methods || {};
    var _self = this;
    this.cardApp.dsl.methods.handleClickButton = function (d, config) {
      _self.handleClickButton(d, config);
    };
    this.cardApp.dsl.methods.handleClickCard = function (d, config) {
      _self.handleClickCard(d, config);
    };
  },
  methods: {
    objectToString(obj) {
      return WebTool.objectToString(obj);
    },
    handleClose(tag, tIndex, d, item) {
      console.log(tag);
      d[item.prop].splice(tIndex, 1);
    },
    showInput(d, item) {
      d.inputVisible = true;
      this.$nextTick(() => {
        if (this.$refs && this.$refs.saveTagInput) {
          this.$refs.saveTagInput[0].$refs.input.focus();
        }
      });
    },
    loadByScroll() {
      console.log("loading more...");
    },
    getResult(index) {
      index = index || 0;
      return this.info[index];
    },
    handleClickTopBtn() {},
    handleInputConfirm(d, item) {
      let inputValue = d.inputValue;
      if (inputValue) {
        d[item.prop].push(inputValue);
      }
      d.inputVisible = false;
      d.inputValue = "";
    },
    _handleCheckAllChange(d, index, item) {
      if (d.checkAll) {
        d[item.prop] = item.items.map((d) => {
          return d.value || d;
        });
      } else {
        d[item.prop] = [];
      }
      d.isIndeterminate = false;
    },
    _handleCheckedChange(d, index, item) {
      let checkedCount = d[item.prop].length;
      d.checkAll = checkedCount === item.items.length;
      d.isIndeterminate = checkedCount > 0 && checkedCount < item.items.length;
    },
    updateData(obj) {
      for (var k in obj) {
        this[k] = obj[k] || this[k];
      }
      this.info = this.info || {};
      if (this.info && this.info.constructor.name !== "Array") {
        this.info = [this.info];
      }
      //将record中每个元素的属性值转换为数组
      this.data = JSON.parse(JSON.stringify(this.info));
      // for (let i = 0; i < this.data.length; i++) {
      //   var item = this.data[i];
      //   for (var key in item) {
      //     if (item[key] && item[key].constructor.name !== "Array") {
      //       item[key] = [item[key]];
      //     }
      //   }
      // }
      this.optionMap = this.optionMap || {};
      for (let j = 0; j < this.config.length; j++) {
        var k = this.config[j].prop;
        this.optionMap[k] = this.optionMap[k] || {};
        if (
          this.config[j].type === "text" &&
          this.config[j].icon &&
          this.config[j].icon.constructor.name !== "Array"
        ) {
          this.config[j].icon = [this.config[j].icon];
        }
      }
    },
    handleClickCard(d, config, i) {},
    handleClickButton(d, config, i) {},
    handleSizeChange(v) {},
    handleCurrentChange(v) {},
    dealChangeEvent(item, data) {},
    handleCheckAllChange() {
      var item = this;
      item.value = [];
      for (var i = 0; i < item.info.length; i++) {
        if (item.checkAll) {
          item.info[i].checked = true;
          item.value.push(item.info[i].value || item.info[i].name);
        } else {
          item.info[i].checked = false;
        }
      }
      item.isIndeterminate = false;

      this.$forceUpdate();
      // this.$emit("change", item.value, this);
    },
    handleCheckedChange(index) {
      var item = this;
      item.value = [];
      for (var i = 0; i < item.info.length; i++) {
        if (item.info[i] && item.info[i].checked) {
          item.value.push(item.info[i].value || item.info[i].name);
        }
      }
      let checkedCount = item.value.length;
      item.checkAll = checkedCount === item.info.length;
      item.isIndeterminate =
        checkedCount > 0 && checkedCount < item.info.length;
      this.$forceUpdate();
      // this.$emit("change", index, item.value, this);
    },
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

.el-card {
  position: relative;
  width: 100%;
  border: none;
}

.el-card__body {
  padding: 10px 15px;
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

label {
  margin-bottom: 0px;
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
