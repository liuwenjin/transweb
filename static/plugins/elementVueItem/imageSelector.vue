<template>
  <div class="imageSelectorArea">
    <el-upload
      class="imageUploadItem"
      action="#"
      :show-file-list="false"
      :on-change="handleImageChange"
      :auto-upload="false"
    >
      <el-avatar
        v-if="type === 'avatar'"
        :style="{ width: '100%', height: '100%' }"
        :src="dataUrl || defaultImage"
        :size="size || 90"
        fit="cover"
      ></el-avatar>
      <el-image
        v-else-if="type === 'image'"
        :src="dataUrl || defaultImage"
        :style="{ width: '100%', height: '100%' }"
        :size="size || 90"
        fit="cover"
      ></el-image>
      <span class="optionButtnArea"
        ><el-button type="primary" circle
          ><el-icon><edit /></el-icon></el-button
      ></span>
    </el-upload>
  </div>
</template>

<style scoped>
.imageSelectorArea {
  position: relative;
  width: 100%;
  height: 100%;
  background: #f2f2f2;
  padding: 5px;
}
.imageUploadItem {
  position: absolute;
  width: calc( 100% - 10px );
  height: calc( 100% - 10px );
}
.el-upload {
  width: 100%;
  height: 100%;
}
.el-image {
  position: relative;
  width: 100%;
  height: 100%;
}

.el-upload:hover  .optionButtnArea {
  display: inline-block;
}

.optionButtnArea {
  position: absolute;
  left: 0px;
  display: none;
  top: calc(50% - 15px);
  width: 100%;
  font-size: 20px;
  color: #333;
  text-align: center;
}
</style>

<script>
export default {
  data() {
    return {
      defaultImage: "",
      width: "300px",
      height: "300px",
      limit: 4000000,
      size: 90,
      file: null,
      dataUrl: "",
      type: "avatar",
    };
  },
  computed: {},
  mounted() {},
  methods: {
    handleImageChange(file, fileList) {
      this.file = file;
      this.value = file;
      var _self = this;
      let reader = new FileReader();
      if (file.raw.size > this.limit) {
        this.$message({
          type: "warning",
          message: `修改失败，文件大小超过上限(${this.limit}b)。`,
        });
        return false;
      }
      reader.readAsDataURL(file.raw);
      reader.onload = function (e) {
        _self.dataUrl = e.target.result;
        if (typeof _self.changeCallback === "function") {
          _self.changeCallback(_self.dataUrl);
        }
      };
    },
  },
};
</script>
