<template>
  <div class="treeEditorContainer">
    <div class="leftTreeArea">
      <el-tree
        :data="treeData"
        :props="defaultProps"
        @node-click="handleNodeClick"
      >
      <template #default="{ node, data }">
        <span class="custom-tree-node">
          <span>{{ node.label }}</span>
          <span>
            <a @click="append(node, data)"> Append </a>
            <a style="margin-left: 8px" @click="remove(node, data)"> Delete </a>
          </span>
        </span>
      </template>
    </el-tree>
  </div>
    <div class="treeItemEditorArea" ref="treeItemEditorContainer"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      data: {

      },
      treeData: [
        {
          label: "Level one 1",
          children: [
            {
              label: "Level two 1-1",
              children: [
                {
                  label: "Level three 1-1-1",
                },
              ],
            },
          ],
        },
      ],
    };
  },
  mounted() {},
  methods: {
    updateContent(key) {
      key = key || this.defaultActive || "0";
      this.defaultActive = key;
      let arr = key.split("-");
      let d = this.menuData[arr[0]];
      let url = d.url;
      if (d.children) {
        d = d.children[arr[1]] || {};
        url = d.url;
      }
      this.articleEditor.dsl.url = url;
      let elem = this.$refs.treeItemEditorContainer;
      webCpu.updateView(elem, this.articleEditor);
      location.hash = webCpu.router.path + "?article=" + key;
    },
  },
};
</script>

<style scoped>
.treeEditorContainer {
  vertical-align: middle;
  margin-top: 1px;
  display: inline-block;
  padding-left: 220px;
  width: 100%;
  height: 100%;
  position: relative;
}

.leftTreeArea {
  position: absolute;
  left: 0px;
  width: 220px;
  height: 100%;
}

.treeItemEditorArea {
  position: relative;
  width: 100%;
  height: 100%;
}

.treeEditorContainer .el-menu--horizontal {
  width: 100%;
  display: inline-block;
  border-bottom: none;
  background-color: transparent !important;
  text-align: right;
}

.treeEditorContainer .el-menu--horizontal > .el-sub-menu .el-sub-menu__title {
  border-bottom: none;
}

.el-menu--horizontal {
  border-bottom: none;
  background-color: transparent !important;
}

.el-menu--horizontal > .el-menu-item {
  vertical-align: middle;
}

.el-menu--horizontal .el-menu-item:not(.is-disabled):focus,
.el-menu--horizontal .el-menu-item:not(.is-disabled):hover {
  background-color: rgba(100, 100, 100, 0.3);
}

.el-menu-item [class^="el-icon"] {
  margin-right: 0px;
}
</style>
