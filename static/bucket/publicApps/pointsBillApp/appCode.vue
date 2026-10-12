<template data-edit-id="1">
  <div class="simple-query" data-edit-id="2">
    <div style="margin-bottom: 10px; font-size: 16px" data-edit-id="3">
      {{ titleMap[query.type] }}
    </div>
    <div class="query-bar" data-edit-id="4">
      <el-input v-model.trim="query.name"
        placeholder="名称 name"
        size="small"
        class="input"
        clearable
        data-edit-id="5" />
      <el-button style="margin-left: 10px"
        type="primary"
        size="small"
        @click="runQuery"
        :loading="loading"
        data-edit-id="6">查询</el-button
      >
      <span style="float: right" data-edit-id="7">
        <span style="color: #999; font-size: 12px; margin-right: 5px"
          data-edit-id="8">排序:</span
        >
        <el-select style="margin-right: 10px; width: 80px"
          v-model="query.sortField"
          placeholder="排序字段"
          size="small"
          class="input"
          data-edit-id="9">
          <el-option label="值" value="value" data-edit-id="10" />
          <el-option label="时间" value="time" data-edit-id="11" />
        </el-select>
        <el-select style="width: 80px"
          v-model="query.sortOrder"
          placeholder="顺序"
          size="small"
          class="input"
          data-edit-id="12">
          <el-option label="降序" value="-1" data-edit-id="13" />
          <el-option label="升序" value="1" data-edit-id="14" />
        </el-select>
      </span>
    </div>

    <el-table :data="result.data"
      v-loading="loading"
      border
      stripe
      data-edit-id="15">
      <el-table-column prop="name" label="名称" data-edit-id="16" />
      <el-table-column prop="value" label="值" :width="100" data-edit-id="17" />
      <el-table-column prop="time"
        label="时间"
        :width="160"
        data-edit-id="18" />
      <el-table-column prop="documentId"
        label="应用 ID"
        :width="300"
        data-edit-id="18" />
    </el-table>

    <div class="pager" data-edit-id="19">
      <el-pagination background
        layout="total, prev, pager, next, jumper"
        :page-size="query.pageSize"
        :total="result.total"
        :current-page.sync="query.pageNo"
        @current-change="runQuery"
        data-edit-id="20" />
    </div>
  </div>
</template>

<script>export default 
          {"name":"SimpleMongoQueryComponent","data":function(
) {
return {
      API_PATH: webCpu.documentPrefix + "/user/mongoQuery",
      loading: false,
      titleMap: {
        expenses: "积分消费记录",
        income: "积分收入记录",
      },
      adapter: null,
      query: {"type":"expenses","name":"","sortField":"time","sortOrder":"-1","pageNo":1,"pageSize":8,"documentId":"fc2727275b1990f74193ac63f02834f8"},
      result: {
        total: 0,
        data: [],
      },
      defaultTemplate: "-",
      title: "积分变动记录",
      icon: "#",
      introduce: "显示收入/支出的积分录列表"
    };
},"watch":{"query.sortField":function (val, oldVal) {
      this.query.sortField = val;
      this.runQuery();
    },"query.sortOrder":function (val, oldVal) {
      this.query.sortOrder = val;
      this.runQuery();
    }},"mounted":function () {
    this.adapter = webCpu.initAdapter({
      mongoQuery: {
        url: this.API_PATH,
        method: "get",
      },
    });
    this.runQuery();
  },"methods":{"runQuery":async function (v) {
      this.loading = true;
      try {
        const condition = {};
        if (this.query.type) condition.type = this.query.type;
        if (this.query.name)
          condition.name = {
            $regex: this.query.name,
            $options: "i",
          };
        const sort = {
          [this.query.sortField]: Number(this.query.sortOrder),
        };

        this.query.pageNo = v || this.query.pageNo;

        const params = {
          table: "pointsBill",
          fields: "type,name,value,time,documentId",
          condition: JSON.stringify(condition),
          sort: JSON.stringify(sort),
          pageNo: String(this.query.pageNo),
          pageSize: String(this.query.pageSize),
        };

        this.adapter.mongoQuery(params, (data) => {
          if (data.ret === 0) {
            // ✅ 转换 time 字段为字符串
            data.data = (data.data || []).map((item) => ({
              ...item,
              time: item.time ? new Date(item.time).toLocaleString() : "",
            }));
            this.result = data;
          } else {
            this.$message.error(data.message || "查询失败");
          }
        });
      } catch (err) {
        console.error(err);
        this.$message.error("请求异常");
      } finally {
        this.loading = false;
      }
    }}};</script>

<style scoped>
.simple-query {
  max-width: 800px;
  margin: 24px auto;
  padding: 24px;
  background: #ffffff;
  border: 1px solid #e7e7eb;
  border-radius: 10px;
  box-shadow: 0 20px 70px rgba(20, 20, 30, 0.055),
    0 2px 8px rgba(20, 20, 30, 0.025);
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Helvetica Neue",
    Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  color: #1a1a1e;
}

.query-bar {
  gap: 8px;
  margin-bottom: 12px;
}

.input {
  width: 150px;
}

.pager {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.simple-query > div:first-child {
  font-family: "Source Han Serif SC", "Noto Serif SC", "Songti SC", "STSong",
    serif;
  font-weight: 400;
  letter-spacing: 0.04em;
}

:deep(.el-button--primary) {
  background: #1a1a1e !important;
  border-color: #1a1a1e !important;
  border-radius: 3px !important;
  transition: transform 0.3s cubic-bezier(0.2, 0.7, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.2, 0.7, 0.2, 1);
}
:deep(.el-button--primary):hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}
:deep(.el-input__wrapper) {
  border-radius: 4px !important;
  border: 1px solid #e7e7eb !important;
  transition: border-color 0.3s cubic-bezier(0.2, 0.7, 0.2, 1);
}
:deep(.el-input__wrapper):hover {
  border-color: #c9c9cf !important;
}
:deep(.el-input__wrapper.is-focus) {
  border-color: #1a1a1e !important;
}
:deep(.el-table th) {
  background: rgba(250, 250, 252, 0.5) !important;
  color: #6e6e73 !important;
  font-weight: 500 !important;
}
:deep(.el-pagination.is-background .el-pager li.is-active),
:deep(.el-pagination .el-pager li.active) {
  background: #1a1a1e !important;
  border-radius: 8px !important;
  color: #fafafc !important;
}

::selection {
  background: #1a1a1e;
  color: #fafafc;
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: #e7e7eb;
  border-radius: 99px;
}
</style>
