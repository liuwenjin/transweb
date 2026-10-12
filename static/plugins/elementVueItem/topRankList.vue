<template>
<div class="containerArea" :style="style">

  <!-- 数据表格table的参考含义请参考 script标签中的data.dataInfo参数注释 -->
  <span class="rankTitleArea ellipsis" :title="dataInfo.title">{{dataInfo.title}}</span>
  <el-table v-if="isShow" ref="dataTableItem" :data="dataInfo.data" :height="dataInfo.height" :max-height="dataInfo.maxHeight" :stripe="dataInfo.stripe || false" :border="dataInfo.border || false" :empty-text="dataInfo.emptyText || '暂无数据'" :fit="dataInfo.fit === undefined ? true : dataInfo.fit" :highlight-current-row="dataInfo.heightCurrentRow" :show-header="
        dataInfo.showHeader === undefined ? false : dataInfo.showHeader
      " :header-row-style="{
        background: '#f8f8f8',
      }" style="width: 100%" @cell-click="dealCellClick">
    <el-table-column v-if="dataInfo.withIndex" type="index" align="center"></el-table-column>
    <slot v-for="(d, index) in dataInfo.keyIndex">
      <el-table-column :width="dataInfo.keyType && dataInfo.keyType[index] && dataInfo.keyType[index].width ? dataInfo.keyType[index].width : 'auto'" :align="dataInfo.keyType && dataInfo.keyType[index] && dataInfo.keyType[index].align ?  dataInfo.keyType[index].align : 'left'" :label="!dataInfo.keyLabel ? '': dataInfo.keyLabel[index]">

        <template #default="scope">
          <slot v-if="dataInfo.keyType && dataInfo.keyType[index]">
            <div :style="dataInfo.keyStyle[index] || {}">
              <slot v-for="t in [dataInfo.keyType[index]]">
                <slot v-if="t.type=== 'button'">
                  <el-button link v-if="
                      !t.condition ||
                        (t.condition.constructor.name === 'Array' &&
                          t.condition.indexOf(scope.row[d]) !== -1) ||
                        (t.condition.constructor.name === 'String' &&
                          t.condition === scope.row[d])
                    " :type="t.sType || 'link'" :class="t.class" :title="t.title || t.label" :size="t.size || 'small'" @click="
                      dealClickButton(
                        t.label,
                        scope.row,
                        scope.$index
                      )
                    ">
                    {{ t.label }}
                  </el-button>
                </slot>
                <slot v-else>
                  <DeleteButton :data="scope.row" type="Tec" @deleteSuccess="handleDeleteSuccess"></DeleteButton>
                  <slot v-if="dataInfo.map && dataInfo.map[d]" :style="dataInfo.keyStyle[index] || {}">
                    <span class="ellipsis" :title="scope.row[d]" :key="index" :prop="d">{{
                    typeof dataInfo.map[d] === 'function'
                      ? dataInfo.map[d](scope.row[d])
                      : dataInfo.map[d][scope.row[d]]
                  || '-'}}</span>
                  </slot>
                  <slot v-else>
                    <div class="ellipsis" :title="scope.row[d]" :key="index" :prop="d" :style="dataInfo.keyStyle[index] || {}">
                      <span :prop="d">{{ scope.row[d] || '-'}}</span>
                    </div>
                  </slot>
                </slot>
              </slot>
            </div>
          </slot>

          <slot v-else>
            <DeleteButton :data="scope.row" type="Tec" @deleteSuccess="handleDeleteSuccess"></DeleteButton>
            <slot v-if="dataInfo.map && dataInfo.map[d]" :style="dataInfo.keyStyle[index] || {}">
              <span :title="scope.row[d]" class="ellipsis" :prop="d">{{
                  typeof dataInfo.map[d] === 'function'
                    ? dataInfo.map[d](scope.row[d])
                    : dataInfo.map[d][scope.row[d]]
                || '-'}}</span>
            </slot>
            <slot v-else>
              <div :title="scope.row[d]" class="ellipsis" :prop="d" :style="dataInfo.keyStyle[index] || {}">
                <span :prop="d">{{ scope.row[d] || '-'}}</span>
              </div>
            </slot>
          </slot>

        </template>
      </el-table-column>
    </slot>
  </el-table>
</div>
</template>

<script>
import DeleteButton from "./../components/opConfirmButton";
export default {
  props: {
    dataObj: Object,
    style: Object
  },
  components: {
    DeleteButton
  },
  data() {
    return {
      isShow: true,
      //dataInfo标识组件实例的默认数据参数定义
      dataInfo: {
        title: "XXXTop 20",
        //showHeader标识数据表格是否显示表头
        showHeader: false,
        //withIndex标识数据表格是否带有自动索引列
        withIndex: true,
        //header标识数据表格的标题有哪些列，每列与data数组元素的哪个属性绑定
        keyIndex: ['key1', 'key2', 'key3'],
        keyStyle: [],
        //data数组为数据表格Body显示的数据内容。
        data: [{
            key1: 'AA111',
            key2: 'BB111',
            key3: 'CC111',
          },
          {
            key1: 'AA112',
            key2: 'BB112',
            key3: 'CC112',
          },
        ]
      },
    };
  },
  watch: {

  },
  //组件mount之前确认是否有传入dataObj参数，有的话就替换组件实例的默认数据。
  beforeMount() {
    if (this.dataObj) {
      this.updateData(this.dataObj);
    }
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
      this.$nextTick(function () {
        this._updateData(newObj);
        this.isShow = true;
      });
    },
    handleDeleteSuccess(tData) {
      debugger;
      this.$emit("deleteSuccess", tData);
    },
    //只更新表格数据
    _updateData(newObj) {
      for (var k in newObj) {
        var obj = newObj[k] || this.dataInfo[k];
        this.dataInfo[k] = obj;
      }
    },
    //清除数据表格的选中状态
    clearSelection() {
      this.tableItem.clearSelection();
    },
    setCurrentRow(row) {
      this.tableItem.setCurrentRow(row);
    },
    toggleRowSelection(row, selected) {
      this.tableItem.toggleRowSelection(row, selected);
    },
    //响应单元格点击事件，释放cell-click事件
    dealCellClick(row, column, cell, event) {
      this.$emit('cell-click', row, column, cell, event);
    },
    //响应按钮点击事件，释放button-click事件
    dealClickButton(name, row, index) {
      this.$emit('button-click', name, row, index);
    },

  },
};
</script>

<style scoped>
.containerArea {
  width: 100%;
  height: 100%;
}

:deep(.el-table__header) thead tr th {
  background-color: #f7f7f7 !important;
  color: #000 !important;
}

.rankTitleArea {
  display: inline-block;
  width: 100%;
  padding: 10px 0px 10px 10px;
  text-align: left;
}

.el-table--fit.el-table {
  background-color: transparent;
}

.el-table--fit tr {
  background-color: transparent !important;
}

.el-table td.el-table__cell {
  border-bottom: solid 1px #111;
}

:deep(.el-table__row) td:nth-child(1) .cell>div {
  background: #8eb9f5;
  color: #fff;
  border-radius: 100%;
  font-size: 12px;
}

:deep(.el-table__row):nth-child(1) td:nth-child(1) .cell>div {
  background: #d0021b;
  color: #fff;
  border-radius: 100%;
}

:deep(.el-table__row):nth-child(2) td:nth-child(1) .cell>div {
  background: #ff8547;
  color: #fff;
  border-radius: 100%;
}

:deep(.el-table__row):nth-child(3) td:nth-child(1) .cell>div {
  background: #faad14;
  color: #fff;
  border-radius: 100%;
}

.el-table__row:hover .buttonContainer {
  display: inline-block;
}

.ellipsis {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style>
