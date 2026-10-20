<template data-edit-id="1">
  <div class="simple-query" v-loading="loading" data-edit-id="2">
    <!-- 背景渐变点缀 -->
    <div class="ambient-glow" data-edit-id="111"></div>

    <!-- Hero 标题区域（不改变文案，展示「白与空」留白风格） -->
    <div class="hero-section" data-edit-id="112">
      <h1 class="hero-title" data-edit-id="113">
        {{ title || "历史记录查询" }}
      </h1>
    </div>

    <!-- 控制栏 / 头部栏 -->
    <div class="header-bar" data-edit-id="3">
      <!-- 查询栏 -->
      <div class="query-bar" data-edit-id="8">
        <div class="query-right" data-edit-id="12">
          <span class="sort-label" data-edit-id="13">排序:</span>
          <el-select style="width: 110px" v-model="query.sortField" placeholder="排序字段" size="small" data-edit-id="14">
            <el-option label="值" value="value" data-edit-id="15" />
            <el-option label="时间" value="_time" data-edit-id="16" />
          </el-select>
          <el-select style="width: 110px; margin-left: 8px" v-model="query.sortOrder" placeholder="顺序" size="small" data-edit-id="17">
            <el-option label="降序" value="-1" data-edit-id="18" />
            <el-option label="升序" value="1" data-edit-id="19" />
          </el-select>
        </div>
      </div>
      <!-- 视图切换按钮 -->
      <el-button-group class="view-toggle" data-edit-id="5">
        <el-button :type="isCardView ? 'primary' : ''" size="small" @click="isCardView = true" data-edit-id="6">
          <el-icon data-edit-id="47">
            <grid data-edit-id="48" />
          </el-icon>卡片
        </el-button>
        <el-button :type="!isCardView ? 'primary' : ''" size="small" @click="isCardView = false" data-edit-id="7">
          <el-icon data-edit-id="49">
            <list data-edit-id="50" />
          </el-icon>表格
        </el-button>
      </el-button-group>
    </div>

    <!-- 表格视图 -->
    <el-table v-show="!isCardView" :data="result.data" class="data-table" data-edit-id="20">
      <el-table-column v-for="d in headers" :key="d.prop" :prop="d.prop" :label="d.label" :width="d.width || 80" class-name="no-wrap-column" data-edit-id="21" />
      <el-table-column fixed="right" label="操作" width="200" data-edit-id="109">
        <template #default="scope">
          <el-button link type="primary" size="small" @click.prevent="viewAgentResult(scope.row)">
            查看
          </el-button>
          <el-dropdown trigger="click" @command="(cmd) => handleItemCommand(cmd, scope.row)" style="margin-left: 8px; vertical-align: middle;">
            <el-button link type="primary" size="small">
              操作
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="delete">删除</el-dropdown-item>
                <el-dropdown-item command="copyLink">复制链接</el-dropdown-item>
                <el-dropdown-item command="copyResult">复制aigc结果</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <!-- 卡片列表视图 -->
    <div v-show="isCardView" class="card-list" data-edit-id="22">
      <el-row :gutter="20" data-edit-id="23">
        <el-col v-for="(item, index) in result.data" :key="index" :xs="24" :sm="12" :md="12" :lg="8" class="card-col" data-edit-id="24">
          <el-card class="data-card" shadow="never" data-edit-id="25">
            <!-- 卡片头部 -->
            <div class="card-header" data-edit-id="26">
              <div class="header-left" data-edit-id="27">
                <span class="agent-tag" data-edit-id="28">{{ item.version }}@{{ item._time }}</span>
              </div>

              <span class="share-switch-wrap">
                共享:
                <el-switch @change="handleChange(item)" size="small" v-model="item.isShare"></el-switch>
              </span>
            </div>

            <!-- 卡片内容 -->
            <div class="card-body" data-edit-id="31">
              <div class="info-row result-row" data-edit-id="38">
                <div class="result-content" :title="item.result" data-edit-id="40">
                  {{ item.result || "-" }}
                </div>
              </div>

              <div class="tw-w-full card-footer-meta" style="font-size: 12px" data-edit-id="41">
                <span class="time-value" data-edit-id="43">积分消费：{{ item.pointsCost || 0 }}</span>

                <div class="header-actions">
                  <el-button size="small" class="action-btn" @click="viewAgentResult(item)" data-edit-id="88">{{ "查看" }}</el-button>
                  <el-dropdown trigger="click" @command="(cmd) => handleItemCommand(cmd, item)">
                    <el-button size="small" class="action-btn">
                      操作
                      <el-icon class="el-icon--right">
                        <arrow-down />
                      </el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="delete">删除</el-dropdown-item>
                        <el-dropdown-item command="copyLink">复制链接</el-dropdown-item>
                        <el-dropdown-item command="copyResult">复制aigc结果</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 空状态 -->
      <el-empty v-if="result.data.length === 0" description="暂无数据" class="custom-empty" data-edit-id="44" />
    </div>

    <!-- 分页 -->
    <div class="pager" data-edit-id="45" v-if="result.data.length !== 0">
      <el-pagination background layout="total, prev, pager, next, jumper" :page-size="query.pageSize" :total="result.total" :current-page.sync="query.pageNo" @current-change="runQuery" data-edit-id="46" />
    </div>
  </div>
</template>

<script>
  export default {
    "name": "SimpleMongoQueryComponent",
    "data": function() {
      return {
        API_PATH: webCpu.documentPrefix + "/user/mongoQuery",
        loading: false,
        title: "历史记录查询",
        table: "questionData",
        isCardView: true,
        headers: [{
            prop: "pointsCost",
            label: "积分",
            width: 80,
          },
          {
            prop: "result",
            label: "生成结果",
            width: "auto",
          },
          {
            prop: "version",
            label: "版本标识",
            width: 100,
          },
          {
            prop: "_time",
            label: "生成时间",
            width: 160,
          },
        ],
        content: {
          isSolo: true,
        },
        adapter: null,
        query: {
          "documentId": "cd9749a782b310cab9a073c8c4a19f3a"
        },
        result: {
          total: 0,
          data: [],
        },
        defaultTemplate: "-",
        introduce: "undefined",
        icon: "未定义"
      };
    },
    "watch": {
      "query.sortField": function(val, oldVal) {
        this.query.sortField = val;
        this.runQuery();
      },
      "query.sortOrder": function(val, oldVal) {
        this.query.sortOrder = val;
        this.runQuery();
      }
    },
    "mounted": function() {
      this.adapter = webCpu.initAdapter({
        mongoQuery: {
          url: this.API_PATH,
          method: "get",
        },
        setDocumentAttribute: {
          url: "/user/setDocumentStatus",
          method: "post",
          dataType: "json",
        },
        deleteQuestionData: {
          url: "/user/deleteQuestionData",
          method: "post",
          dataType: "json",
        },
      });
      this.runQuery();
    },
    "methods": {
      "runQuery": async function(v) {
        this.loading = true;
        try {
          let condition = {};
          if (this.query.folderName) condition.folderName = this.query.folderName;
          if (this.query.apiName) condition.apiName = this.query.apiName;

          let id = WebTool.urlQuery(location.href, "id");
          if (id) condition.documentId = id;
          if (this.content && this.content.isSolo)
            condition.documentId = this.query.documentId;

          let sort = {};
          this.query.sortField = this.query.sortField || "_time";
          this.query.sortOrder = this.query.sortOrder || "-1";
          if (this.query.sortField) {
            sort = {
              [this.query.sortField]: Number(this.query.sortOrder),
            };
          }

          if (this.query.admin) condition.admin = this.query.admin;
          if (!condition.documentId) delete condition.documentId;

          this.query.pageNo = Number(v) || this.query.pageNo;
          const params = {
            table: this.table,
            fields: this.headers
              .map((item) => item.prop)
              .concat(["content"])
              .join(",") + ", documentId, baseId, versionId, isShare",
            condition: JSON.stringify(condition),
            sort: JSON.stringify(sort),
            pageNo: String(this.query.pageNo),
            pageSize: String(this.query.pageSize),
          };

          this.adapter.mongoQuery(params, (data) => {
            if (data.ret === 0) {
              data.data = (data.data || []).map((item) => {
                item._time = new Date(item.time || item._time).toLocaleString();
                item.versionId = item.versionId || "";
                item.isShare = item.isShare === "true";
                item.pointsCost = item.pointsCost || 0;
                item.version = item.versionId.slice(0, 5);
                return item;
              });
              this.result = data;
            } else {
              this.$message.error(data.message || "查询失败");
            }
            this.loading = false;
          });
        } catch (err) {
          console.error(err);
          this.$message.error("请求异常");
          this.loading = false;
        }
      },
      "getResult": function(item) {
        WebTool.copyString(item.result);
        this.$message("该生成结果已复制到剪贴板");
      },
      "copyLink": function(item) {
        let url = `https://transweb.cn?id=${item.documentId}&dataId=${item._id}&dataView=true&solo=true`;
        WebTool.copyString(url);
        this.$message("文档链接已复制");
      },
      "copyResult": function(item) {
        WebTool.copyString(item.result || "");
        this.$message("aigc结果已复制到剪贴板");
      },
      "handleItemCommand": function(command, item) {
        if (command === "delete") {
          this.deleteItem(item);
        } else if (command === "copyLink") {
          this.copyLink(item);
        } else if (command === "copyResult") {
          this.copyResult(item);
        }
      },
      "deleteItem": function(item) {
        const _self = this;
        this.$confirm("删除后无法恢复，确定删除该条记录吗？", "提示", {
            confirmButtonText: "删除",
            cancelButtonText: "取消",
            type: "warning",
          })
          .then(function() {
            _self.adapter.deleteQuestionData({
                _id: item._id,
                type: "single"
              },
              function(tData) {
                if (tData.ret === 0) {
                  _self.$message({
                    type: "success",
                    message: "删除成功！"
                  });
                  _self.runQuery();
                } else {
                  _self.$message({
                    type: "warning",
                    message: tData.message || "删除失败",
                  });
                }
              }
            );
          })
          .catch(function() {});
      },
      "handleChange": function(item) {
        let attr = {
          _id: item._id,
          key: "isShare",
          value: item.isShare,
        };
        this.setDocumentAttribute(attr, (rData) => {
          this.$message({
            type: "success",
            message: "分享标识更新成功！",
          });
        });
      },
      "setDocumentAttribute": function(attr, callback) {
        attr = attr || {};
        attr.table = this.table;
        attr.cKey = "_id";
        attr._id = attr._id || attr.dataId || "";
        let _self = this;
        this.adapter.setDocumentAttribute(attr, function(tData) {
          if (tData.ret === 0) {
            if (typeof callback === "function") callback(tData);
          } else {
            _self.$message({
              type: "warning",
              message: _self.$t("operationFailedTips"),
            });
          }
        });
      },
      "viewAgentResult": function(item) {
        try {
          let url = `${webCpu.documentPrefix}?id=${item.documentId}&dataId=${item._id}`;
          window.open(url, "_blank");
        } catch (e) {
          console.log(e);
        }
      },
      "getTypeTagType": function(type) {
        const typeMap = {
          aigcText: "复制文本",
          aigcImage: "下载图片",
          aigcAudio: "下载音频",
        };
        return typeMap[type] || "复制文本";
      }
    }
  };
</script>

<style scoped>
  /* 基础容器 & 极其丰富的顶级留白 */
  .simple-query {
    position: relative;
    max-width: 1200px;
    margin: 20px auto 40px;
    padding: 0 32px;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Helvetica Neue",
      "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    color: #1a1a1e;
    box-sizing: border-box;
  }

  /* 背景柔和渐变点缀 */
  .ambient-glow {
    position: absolute;
    top: -120px;
    left: 50%;
    transform: translateX(-50%);
    width: 1000px;
    height: 400px;
    background: radial-gradient(circle,
        rgba(230, 232, 236, 0.8) 0%,
        rgba(250, 250, 252, 0) 70%);
    pointer-events: none;
    z-index: -1;
  }

  /* Hero 标题排版 */
  .hero-section {
    margin-bottom: 48px;
  }

  .hero-title {
    font-family: "Source Han Serif SC", "Noto Serif SC", "Songti SC", "STSong",
      serif;
    font-size: 24px;
    font-weight: 400;
    letter-spacing: 0.04em;
    line-height: 1.08;
    color: #1a1a1e;
    margin: 0;
    max-width: 800px;
  }

  /* 头部控制栏：玻璃拟态卡片 */
  .header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding: 12px 20px;
    background: #ffffff;
    border: 1px solid #e7e7eb;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(20, 20, 30, 0.025);
    transition: all 0.3s cubic-bezier(0.2, 0.7, 0.2, 1);
  }

  .query-bar {
    display: flex;
    align-items: center;
  }

  .query-right {
    display: flex;
    align-items: center;
  }

  .sort-label {
    color: #6E6E73;
    font-size: 14px;
    font-weight: 500;
    margin-right: 12px;
  }

  /* Vue / Element 按钮组微调 */
  .view-toggle .el-button {
    border-radius: 3px !important;
    border: none;
    background: transparent;
    color: #6e6e73;
    font-weight: 500;
    padding: 8px 16px;
    transition: all 0.3s ease;
  }

  .view-toggle .el-button--primary {
    background: #1a1a1e !important;
    color: #fafafc !important;
    border-color: #1a1a1e !important;
    box-shadow: 0 2px 8px rgba(26, 26, 30, 0.12);
  }

  /* 表格样式重构 */
  .data-table {
    margin-top: 16px;
    border-radius: 10px;
    overflow: hidden;
    background: #ffffff;
    border: 1px solid #e7e7eb;
    box-shadow: 0 20px 70px rgba(20, 20, 30, 0.055),
      0 2px 8px rgba(20, 20, 30, 0.025);
  }

  .data-table th.el-table__cell {
    background-color: rgba(250, 250, 252, 0.5);
    color: #6e6e73;
    font-weight: 500;
    font-size: 14px;
    border-bottom: 1px solid #e7e7eb;
  }

  .data-table td.el-table__cell {
    border-bottom: 1px solid #e7e7eb;
    color: #6e6e73;
    font-size: 14px;
  }

  .no-wrap-column .cell {
    white-space: nowrap;
  }

  /* 卡片列表 */
  .card-list {
    margin-top: 16px;
    min-height: 240px;
  }

  .card-col {
    margin-bottom: 24px;
  }

  .data-card {
    height: 100%;
    background: #ffffff !important;
    border: 1px solid #e7e7eb !important;
    border-radius: 12px !important;
    padding: 4px;
    box-shadow: 0 20px 70px rgba(20, 20, 30, 0.055),
      0 2px 8px rgba(20, 20, 30, 0.025) !important;
    transition: all 0.3s cubic-bezier(0.2, 0.7, 0.2, 1) !important;
  }

  .data-card:hover {
    transform: translateY(-2px);
    background: #ffffff !important;
    border-color: #1a1a1e !important;
    box-shadow: 0 24px 80px rgba(20, 20, 30, 0.08),
      0 4px 12px rgba(20, 20, 30, 0.04) !important;
  }

  .data-card .el-card__body {
    padding: 20px;
  }

  /* 卡片头部 */
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    overflow: hidden;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .agent-tag {
    color: #6e6e73;
    font-size: 12px;
    font-weight: 500;
  }

  .action-btn {
    border-radius: 3px;
    font-weight: 500;
    background: #f3f3f5;
    border: 1px solid #e7e7eb;
    color: #1a1a1e;
    transition: all 0.3s ease;
  }

  .action-btn:hover {
    background: #1a1a1e;
    border-color: #1a1a1e;
    color: #fafafc;
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }

  /* 卡片内容 */
  .card-body {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0px;
  }

  .info-row {
    margin-bottom: 16px;
  }

  .result-content {
    color: #6e6e73;
    font-size: 14px;
    line-height: 1.6;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    word-break: break-all;
    background: #f3f3f5;
    padding: 5px 10px;
    border-radius: 8px;
    min-height: 72px;
  }

  .card-footer-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 12px;
    border-top: 1px solid #e7e7eb;
    color: #6e6e73;
  }

  .time-value {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
    color: #6E6E73;
  }

  .type-tag {
    color: #1A1A1E !important;
    font-weight: 500;
  }

  .type-tag:hover {
    opacity: 0.8;
  }

  .share-switch-wrap {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #a5a5aa;
  }

  /* 分页容器 */
  .pager {
    display: flex;
    justify-content: center;
    margin-top: 56px;
    padding-top: 24px;
  }

  .pager .el-pagination.is-background .el-pager li:not(.disabled).active {
    background-color: #1a1a1e;
    color: #fafafc;
    border-radius: 8px;
  }

  .pager .el-pagination.is-background .el-pager li {
    border-radius: 8px;
    background-color: #ffffff;
    border: 1px solid #e7e7eb;
  }

  /* 自定义空状态 */
  .custom-empty {
    padding: 60px 0;
  }

  /* 响应式调整 */
  @media (max-width: 768px) {
    .simple-query {
      margin: 40px auto;
      padding: 0 16px;
    }

    .hero-title {
      font-size: 40px;
    }

    .header-bar {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
    }

    .query-right {
      width: 100%;
      justify-content: space-between;
    }
  }

  /* —— 白与空 规范增补 —— */
  ::selection {
    background: #1a1a1e;
    color: #fafafc;
  }

  .simple-query .el-table__body-wrapper::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .simple-query .el-table__body-wrapper::-webkit-scrollbar-thumb {
    background: #e7e7eb;
    border-radius: 99px;
  }

  .simple-query .el-table__body-wrapper::-webkit-scrollbar-track {
    background: transparent;
  }

  .el-card {
    border-radius: 12px;
  }

  .el-input__wrapper,
  .el-select__wrapper {
    border-radius: 4px;
    box-shadow: 0 0 0 1px #e7e7eb inset;
  }

  .el-input__wrapper:hover,
  .el-select__wrapper:hover {
    box-shadow: 0 0 0 1px #c9c9cf inset;
  }

  .el-input__wrapper.is-focus,
  .el-select__wrapper.is-focused {
    box-shadow: 0 0 0 1px #1a1a1e inset;
  }

  .el-textarea__inner {
    border-radius: 4px;
    border-color: #e7e7eb;
  }

  .el-textarea__inner:hover {
    border-color: #c9c9cf;
  }

  .el-textarea__inner:focus {
    border-color: #1a1a1e;
  }

  .el-button--primary:not(.is-link):not(.is-text) {
    background-color: #1a1a1e;
    border-color: #1a1a1e;
    color: #fafafc;
    border-radius: 3px;
  }

  .el-button--primary:not(.is-link):not(.is-text):hover {
    background-color: #1a1a1e;
    border-color: #1a1a1e;
    color: #fafafc;
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }

  .el-button--primary.is-link,
  .el-button--primary.is-text {
    color: #1a1a1e;
  }

  .el-button--primary.is-link:hover,
  .el-button--primary.is-text:hover {
    color: #6e6e73;
  }
</style>