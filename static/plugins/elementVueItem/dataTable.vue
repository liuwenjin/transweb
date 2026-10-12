<template>
  <div class="containerArea" :style="style">
    <!-- 数据表格table的参考含义请参考 script标签中的data.dataInfo参数注释 -->
    <el-table
      v-if="isShow"
      ref="dataTableItem"
      :data="data"
      :height="height"
      :max-height="maxHeight"
      :stripe="stripe || false"
      :border="border || false"
      :empty-text="emptyText || '暂无数据'"
      :fit="fit === undefined ? true : fit"
      :highlight-current-row="heightCurrentRow"
      :show-header="showHeader === undefined ? true : showHeader"
      :header-row-style="
        headerRowStyle || {
          background: '#f8f8f8',
        }
      "
      style="width: 100%"
      @selection-change="handleSelectionChange"
      @cell-click="dealCellClick"
      @sort-change="dealSortChange"
    >
      <el-table-column
        v-if="withSelection"
        type="selection"
        width="50"
        align="center"
      ></el-table-column>
      <el-table-column
        v-if="withIndex"
        type="index"
        align="center"
        label="序号"
        width="80"
      ></el-table-column>
      <slot v-for="(d, index) in header">
        <el-table-column
          :sortable="d.sortable"
          :align="d.align"
          :prop="d.prop"
          :label="d.label"
          :fixed="d.fixed"
          :header-align="d.headerAlign || d.align"
          :width="d.width"
          :index="d.index"
          :min-width="d.minWidth"
          :show-overflow-tooltip="d.showOverflowTooltip"
          :class-name="d.className"
          :resizable="d.resizable"
        >
          <template #header v-if="header[index].deletable">
            <span style="display: inline-block; padding-left: 10px">{{
              header[index].label
            }}</span>
            <el-button
              title="删除"
              circle
              link
              style="position: absolute; left: 0px; font-size: 16px"
              type="warning"
              size="small"
              @click="deleteColumnItem(index)"
            >
              <el-icon>
                <circle-close />
              </el-icon>
            </el-button>
          </template>
          <template #default="scope">
            <slot v-if="!!d.buttons">
              <slot v-for="t in d.buttons">
                <el-button
                  link
                  v-if="
                    !t.showFlag &&
                    (!t.condition ||
                      (t.condition.constructor.name === 'Array' &&
                        t.condition.indexOf(scope.row[d.prop]) !== -1) ||
                      (t.condition.constructor.name === 'String' &&
                        t.condition === scope.row[d.prop]))
                  "
                  :type="t.type || 'primary'"
                  :class="t.class"
                  :title="t.title || t.label"
                  :size="t.size || 'small'"
                  @click="
                    dealClickButton(
                      t.eventName || t.label,
                      scope.row,
                      scope.$index
                    )
                  "
                >
                  {{ t.label }}
                </el-button>
              </slot>
            </slot>
            <span :title="scope.row[d.prop].join('、') " v-else-if="d.itemType === 'array'">
              {{ scope.row[d.prop] ? scope.row[d.prop].join("、") : "" }}
            </span>
            <slot v-else>
              <slot v-if="map && map[d.prop]">
                <span :title="map[d.prop](scope.row[d.prop]) " :class="d.class" :prop="d.prop" :style="d.style">{{
                  "" + (map[d.prop](scope.row[d.prop]) || "-")
                }}</span>
              </slot>
              <slot v-else>
                <span :title="scope.row[d.prop]" :class="d.class" :prop="d.prop" :style="d.style">{{
                  scope.row[d.prop] || "-"
                }}</span>
              </slot>
            </slot>
          </template>
        </el-table-column>
      </slot>
    </el-table>
  </div>
</template>

<script>
export default {
  props: {
    dataObj: Object,
  },
  data() {
    return {
      isShow: true,
      height: "360px",
      maxHeight: "360px",
      stripe: false,
      border: false,
      emptyText: "",
      fit: true,
      style: {},
      heightCurrentRow: true,
      headerRowStyle: null,
      map: {},
      //showHeader标识数据表格是否显示表头
      showHeader: true,
      //withSelection标识数据表格是否带有复选框列
      withSelection: true,
      //withIndex标识数据表格是否带有自动索引列
      withIndex: true,
      //header标识数据表格的标题有哪些列，每列与data数组元素的哪个属性绑定
      tempSelected: {},
      header: [
        {
          //prop标识该元素所代表的数据列与data数组元素的哪个属性绑定
          prop: "key1",
          //label标识该元素所代表的数据列头名称标签
          label: "列名1",
          //width标识该元素所代表的数据列宽的像素值
          width: "180",
          //width标识该元素所代表的数据列的单元格文本对齐方式
          align: "center",
        },
        {
          prop: "key2",
          label: "列名2",
          width: "180",
          align: "center",
        },
        {
          prop: "key3",
          label: "列名3",
        },
        {
          prop: "key3",
          label: "操作",
          align: "left",
          buttons: [
            {
              //text标识相应按钮的文本信息
              label: "编辑",
              //eventName标识点击相应按钮触发的事件名称
              eventName: "eidtItem",
              //condition标识某数据行的相应按钮显示的条件
              condition: ["CC112"],
              //标识相应按钮的大小
              size: "small",
              //icon标识相应按钮的图标
              icon: "el-icon-edit",
            },
            {
              label: "删除",
              eventName: "removeItem",
              // 删除按钮颜色
              class: "deleteColor",
            },
          ],
        },
      ],
      //data数组为数据表格Body显示的数据内容。
      data: [
        {
          key1: "AA111",
          key2: "BB111",
          key3: "CC111",
        },
        {
          key1: "AA112",
          key2: "BB112",
          key3: "CC112",
        },
      ],

      //page为数据表格分页配置
      page: {
        //background标识分页条是否有背景，有的话背景是什么
        background: false,
        //sizes标识当前分页条支持每页最多显示记录数可以切换的数值
        sizes: [15, 30, 45, 60],
        //pageSize标识当前分页条每页最多显示条数
        pageSize: 15,
        //layout标识当前分页条包含的操作元素
        layout: "total, sizes, prev, pager, next, jumper",
        //total标识当前分页条对应数据总量总条数
        total: 0,
      },
    };
  },
  watch: {
    selected() {
      this.$nextTick(() => {
        for (const item of this.selected) {
          var arr = this.$refs.dataTableItem.data;
          for (var i = 0; i < arr.length; i++) {
            if (item._id === arr[i]._id) {
              this.$refs.dataTableItem.toggleRowSelection(arr[i], true);
            }
          }
        }
      });
    },
  },
  mounted() {
    //获取数据表格实例
    this.tableItem = this.$refs.dataTableItem;
  },
  created() {},
  methods: {
    //更新表格数据，同时也让数据表格界面更新
    updateData(newObj) {
      this.isShow = false;
      this._updateData(newObj);
      this.$nextTick(function () {
        this.isShow = true;
      });
    },
    //只更新表格数据
    _updateData(newObj) {
       for (var k in newObj) {
        this[k] = newObj[k];
      }
    },
    //清除数据表格的选中状态
    clearSelection() {
      this.tableItem.clearSelection();
    },
    setCurrentRow(row) {
      this.tableItem.setCurrentRow(row);
    },
    toggleAllSelection() {
      this.tableItem.toggleAllSelection();
    },
    toggleRowSelection(row, selected) {
      this.tableItem.toggleRowSelection(row, selected);
    },
    //清除数据表格排序状态
    clearSort() {
      this.tableItem.clearSort();
    },

    deleteColumnItem(index) {
      if (!this.minHeader || this.header.length > this.minHeader) {
        this.header.splice(index, 1);
        this.$emit("deleteColumn", index);
        this.$forceUpdate();
      } else {
        this.$message({
          type: "warning",
          message: "不可继续删除, 该表格最少有" + this.minHeader + "列",
        });
      }
    },
    //响应选中变化事件，释放selection-change事件
    handleSelectionChange(val) {
      // const selectList = this.tableItem.selection; // 获取复选框选中列表
      this.selected = val;
      if (this.selectMode) {
        this.tempSelected[this.page.currentPage] = val;
      }
      this.$emit("selection-change", val);
    },
    //响应分页size变化事件，释放size-change事件
    dealSizeChange(val) {
      this.page.pageSize = val;
      this.page.currentPage = 1;
      this.$emit("page-change", this.page.currentPage || 1, val);
    },
    //响应翻页事件，释放page-change事件
    dealPageChange(val) {
      this.page.currentPage = val;
      if (this.selectMode) {
        var arr = this.tempSelected[this.page.currentPage] || [];
        this.selected = arr;
      }

      this.$emit("page-change", val, this.page.pageSize);
    },
    //响应单元格点击事件，释放cell-click事件
    dealCellClick(row, column, cell, event) {
      this.$emit("cell-click", row, column, cell, event);
    },
    //响应按钮点击事件，释放button-click事件
    dealClickButton(eventName, row, index) {
      this.$emit("button-click", eventName, row, index);
    },
    //响应排序变化事件，释放sort-change事件
    dealSortChange(param) {
      this.$emit("sort-change", param);
    },
  },
};
</script>

<style scoped>

.el-table__body {
  table-layout: fixed;
}
.ellipsis {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: inline-block;
  vertical-align: middle;
  max-width: 100%;
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

</style>
