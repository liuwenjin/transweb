<template>
  <div class="pptAppContent" data-edit-id="1">
    <div class="contentInfoArea" ref="mainContentItem" data-edit-id="2">
      <div data-edit-id="3">
        <el-input
          v-model="agent"
          style="max-width: 600px"
          :placeholder="placeholder"
          class="input-with-select"
          data-edit-id="4"
        >
          <template #append>
            <el-button
              :loading="loading"
              :disabled="loading"
              @click="confirmSearchData()"
              >查询</el-button
            >
          </template>
        </el-input>
      </div>
      <div
        v-if="
          currentData &&
          Object.keys(currentData) &&
          Object.keys(currentData).length !== 0
        "
      >
        <el-descriptions
          style="margin-top: 20px; padding: 10px 15px; background-color: #fff"
        >
          <slot v-for="item in Object.keys(currentData)">
            <el-descriptions-item :label="item">{{
              currentData[item]
            }}</el-descriptions-item>
          </slot>
        </el-descriptions>
        <div style="margin-top: 10px">
          <span style="margin-right: 20px">
            角色调整:
            <el-switch
              active-text="合伙人"
              inactive-text="普通用户"
              @change="handleRoleChange"
              inline-prompt
              v-model="roleSwitch"
              style="
                --el-switch-on-color: #13ce66;
                --el-switch-off-color: #ff4949;
                margin-left: 10px;
              "
            ></el-switch>
          </span>
          <span v-if="roleSwitch">
            积分调整：
            <el-input-number
              v-model="points"
              style="max-width: 600px; margin-right: 10px"
              :placeholder="placeholder"
            >
            </el-input-number>
            <el-button
              :loading="cLoading"
              :disabled="cLoading"
              @click="cutPoints()"
              >扣除</el-button
            >
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  style: { width: "100%", height: "100%" },
  data: function () {
    return {
      agent: "",
      placeholder: "请输入 agent ID",
      loading: false,
      currentData: {},
      points: 0,
      cLoading: false,
      roleSwitch: true,
      interface: {
        getPartnerData: {
          url: "/user/getPartnerData",
          method: "get",
        },
        cutPoints: {
          url: "/user/cutPoints",
          method: "post",
        },
        switchRoleItem: {
          url: "/user/switchRoleItem",
          method: "post",
        },
      },
      defaultTemplate: "-",
      query: { documentId: "ecf152610102bd3ec719d5f019dc3707" },
      title: "积分管理",
      icon: "#",
      introduce: "为账户添加或删除积分，或配置用户权限",
    };
  },
  computed: {},
  mounted: function () {
    this.adapter = webCpu.initAdapter(this.interface);
  },
  methods: {
    getPartnerData: function (agent) {
      let _self = this;
      this.loading = true;
      this.adapter.getPartnerData(
        {
          agent: agent,
        },
        function (tData) {
          _self.loading = false;
          _self.currentData = tData.data || {};
          _self.currentData.role = _self.currentData.role || "[]";
          _self.roleSwitch =
            JSON.parse(_self.currentData.role).indexOf("partner") !== -1;
        }
      );
    },
    handleRoleChange: function () {
      let _self = this;
      let roles = this.currentData.role;
      if (typeof roles === "string") {
        roles = JSON.parse(this.currentData.role);
      }
      if ((roles.indexOf("partner") !== -1) === this.roleSwitch) {
        return false;
      }
      let role = this.roleSwitch ? ["partner"] : [];

      this.adapter.switchRoleItem(
        {
          agent: this.currentData.folderName,
          role: role,
        },
        function (tData) {
          _self.points = 0;
          _self.$message({
            type: "success",
            message: "操作成功",
          });
          _self.getPartnerData(_self.currentData.folderName);
        }
      );
    },
    cutPoints: function () {
      this.$confirm(
        `确定要从账户 ${this.currentData["folderName"]} 扣除 ${this.points} 积分吗？`,
        this.$t("confirmDialogTitle"),
        {
          confirmButtonText: this.$t("confirmYes"),
          cancelButtonText: this.$t("confirmNo"),
          type: "warning",
        }
      ).then(() => {
        this._cutPoints();
      });
    },
    _cutPoints: function () {
      let _self = this;
      this.cLoading = true;
      this.adapter.cutPoints(
        {
          agent: this.currentData.folderName,
          points: this.points,
        },
        function (tData) {
          _self.cLoading = false;
          _self.points = 0;
          _self.$message({
            type: "success",
            message: "操作成功",
          });
          _self.getPartnerData(_self.currentData.folderName);
        }
      );
    },
    confirmSearchData: function () {
      if (!this.agent) {
        this.$message({
          type: "warning",
          message: "需要输入",
        });
      }
      this.getPartnerData(this.agent);
    },
  },
};
</script>

<style scoped>
.pptAppContent {
  position: relative;
  float: left;
  width: 100%;
  height: 100%;
  color: #1a1a1e;
  background: #fafafc;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial,
    sans-serif;
  -webkit-font-smoothing: antialiased;
}

.pptAppContent .contentInfoArea {
  float: left;
  padding: 20px 30px;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
}

/* ===== TransWeb · 白与空：细滚动条 / 选中 / Element Plus 穿透 ===== */
.pptAppContent .contentInfoArea::-webkit-scrollbar {
  width: 6px;
}

.pptAppContent .contentInfoArea::-webkit-scrollbar-thumb {
  background: #e7e7eb;
  border-radius: 99px;
}

.pptAppContent .contentInfoArea::-webkit-scrollbar-track {
  background: transparent;
}

.pptAppContent ::selection {
  background: #1a1a1e;
  color: #fafafc;
}

.pptAppContent :deep(.el-input__wrapper),
.pptAppContent :deep(.el-textarea__inner) {
  border-radius: 4px;
  box-shadow: 0 0 0 1px #e7e7eb;
  transition: box-shadow 0.3s ease;
}

.pptAppContent :deep(.el-input__wrapper:hover),
.pptAppContent :deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px #c9c9cf;
}

.pptAppContent :deep(.el-input__wrapper.is-focus),
.pptAppContent :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #1a1a1e;
}

.pptAppContent :deep(.el-button--primary) {
  background: #1a1a1e;
  border-color: #1a1a1e;
  border-radius: 3px;
  letter-spacing: 0.06em;
  transition: box-shadow 0.3s ease, transform 0.2s ease;
}

.pptAppContent :deep(.el-button--primary:hover) {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.pptAppContent :deep(.el-button--primary:active) {
  transform: translateY(0);
}
</style>