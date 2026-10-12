<template>
  <div class="cardListArea">
    <div v-if="withHeader" class="resultOptionArea">
      <span v-if="withSelection" class="checkBoxItem">
        <el-checkbox
          @change="handleCheckAllChange"
          :indeterminate="isIndeterminate"
          v-model="checkAll"
          label="全选"
          ref="checkAllItem"
        />
      </span>
      <span>{{ name }}</span
      >共: <span>{{ page.total }} 条</span>
      <el-button
        v-if="withExportBtn"
        style="float: right"
        type="primary"
        size="small"
        >导出</el-button
      >
    </div>
    <el-row :gutter="gutter">
      <el-col v-for="(d, i) in data" :key="i" :span="span">
        <el-card shadow="never" :style="style">
          <slot v-if="withSelection">
            <el-checkbox
              @change="handleCheckedChange(d, i)"
              style="position: absolute; top: 1px; left: 0px"
              v-model="d.checked"
              size="large"
            />
          </slot>
          <div
            v-for="(item, index) in config"
            :key="index"
            :style="item.style"
            @click="handleClickCard(d, i, item)"
          >
            <span v-if="item.label" style="margin-">{{item.label}}:</span>
            <slot v-if="item.type === 'text'">
              <span
                :class="item.class"
                :prop="item.prop"
                :title="d[item.prop]"
                >{{ d[item.prop] }}</span
              >
            </slot>
            <slot v-else-if="item.type === 'image'">
              <el-image
                :class="item.class"
                :prop="item.prop"
                :src="d[item.prop]"
                style="width: 100%; height: 100%"
              ></el-image>
            </slot>
            <slot v-else-if="item.type === 'button'">
              <el-button
                :class="item.class"
                @click="handleClickBtn(d, item)"
                :size="item.size || 'small'"
                link
                :type="item.buttonType || 'warning'"
              >
                <el-icon v-if="item.icon"
                  ><component :is="item.icon"></component></el-icon
                >{{ item.label }}
              </el-button>
            </slot>
            <slot v-else-if="item.type === 'form'">
              <el-form
                :class="item.class"
                :label-width="item.labelWidth"
                :label-position="item.labelPosition"
                :label-suffix="item.labelSuffix"
              >
                <slot v-for="t in item.data">
                  <el-form-item :label="t.label" :style="t.style">
                    <slot v-if="!t.type || t.type === 'text'">
                      <span :class="t.class">{{ d[t.prop] }}</span>
                    </slot>
                    <slot v-else-if="t.type === 'tags'">
                      <slot v-for="tag in d[t.prop]">
                        <el-tag
                          ><span class="ellipsis" :title="tag.label || tag">{{
                            tag.label || tag
                          }}</span>
                          <slot
                            v-if="tag.value !== undefined"
                            >(<span>{{ tag.value }}</span
                            >)</slot
                          >
                        </el-tag>
                      </slot>
                    </slot>
                  </el-form-item>
                </slot>
              </el-form>
            </slot>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <slot v-if="withPage && page && page.total > page.pageSize">
      <el-pagination
        style="padding: 10px 0px"
        :currentPage="page.currentPage"
        :page-size="page.pageSize"
        size="small"
        background
        layout="prev, pager, next, jumper"
        :total="page.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </slot>
  </div>
</template>

<script>
export default {
  data() {
    return {
      style: {},
      checkAll: false,
      name: "科研信息",
      gutter: 20,
      span: 24,
      style: "padding-left: 5px;",
      withHeader: false,
      withPage: false,
      withExportBtn: false,
      withSelection: false,
      isIndeterminate: false,
      optionMap: {
        title: {
          style: "font-weight: 700;",
          class: "",
        },
        formItem: {
          labelWidth: "72px",
          labelPosition: "left",
          labelSuffix: ":",
        },
        type: {
          style: "width: 240px; display:inline-block;",
        },
        entity: {
          style: "width: calc( 100% - 245px ); float: right; display:inline-block;",
        },
      },
      config: [
        {
          type: "text",
          prop: "title",
        },
        {
          type: "text",
          prop: "description",
        },
        {
          type: "form",
          prop: "formItem",
          data: [
            {
              label: "类别",
              prop: "type",
            },
            {
              label: "相关实体",
              prop: "entity",
              type: "tags",
            },
          ],
        },
      ],
      data: [
        {
          title: "测试标题001",
          description: "描述内容....",
          type: "人工智能",
          entity: [
            {
              label: "项目",
              value: 2,
            },
            {
              label: "机构",
              value: 2,
            },
            {
              label: "人员",
              value: 2,
            },
          ],
        },
        {
          title: "测试标题001",
          description: "描述内容....",
          type: "人工智能",
          entity: [
            {
              label: "项目",
              value: 2,
            },
            {
              label: "机构",
              value: 2,
            },
            {
              label: "人员",
              value: 2,
            },
          ],
        },
      ],
      page: {
        total: 321,
        pageSize: 10,
        currentPage: 1,
      },
    };
  },
  mounted() {
    this.updateData(this.dataObj);
  },
  methods: {
    updateData(obj) {
      for (var k in obj) {
        this[k] = obj[k];
      }
      this.$forceUpdate();
    },
    handleClickCard(d, i, config) {
      this.$emit("click-card", d, i, config);
    },
    handleClickButton(d, i, config) {
      this.$emit("click-button", d, i, config);
    },
    handleSizeChange(v) {
      this.$emit("page-change", this.page.currentPage, v);
    },
    handleCurrentChange(v) {
      this.$emit("page-change", v, this.page.pageSize);
    },
    handleClickBtn(d, item) {
      console.log(d, item);
    },
    handleCheckAllChange() {
      this.value = [];
      for (var i = 0; i < this.data.length; i++) {
        if (this.checkAll) {
          this.data[i].checked = true;
          this.value.push(this.data[i].value || this.data[i].name);
        } else {
          this.data[i].checked = false;
        }
      }
      this.isIndeterminate = false;

      this.$forceUpdate();
      this.$emit("change", this.value, this);
    },
    handleCheckedChange(index) {
      var item = this;
      this.value = [];
      for (var i = 0; i < this.data.length; i++) {
        if (this.data[i] && this.data[i].checked) {
          this.value.push(this.data[i].value || this.data[i].name);
        }
      }
      let checkedCount = this.value.length;
      this.checkAll = checkedCount === this.data.length;
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.data.length;
      this.$forceUpdate();
      this.$emit("change", index, this.value, this.dataInfo);
    },
  },
  props: {
    dataObj: Object,
  },
};
</script>

<style scoped>
.cardListArea {
  position: relative;
  width: 100%;
  height: auto;
  padding: 0px 10px;
}

.ellipsis {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 100%;
  display: inline-block;
}

.ellipsisTag {
  float: left;
  position: relative;
  max-width: 100px;
  margin-right: 5px;
  margin-top: 5px;
}

.ellipsisTag span {
  position: relative;
  display: inline-block;
  vertical-align: middle;
}

.el-card {
  position: relative;
  width: 100%;
  border: none;
  background-color: transparent;
  border-bottom: solid 1px #f8f8f8;
  padding-bottom: 10px;
  padding-top: 10px;
}

.el-card__body {
  padding: 5px;
}

.el-form-item {
  margin-bottom: 0px;
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
  right: 0px;
}

.resultOptionArea .checkBoxItem {
  left: 0px;
  bottom: -35px;
}
</style>
