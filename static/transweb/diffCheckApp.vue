<template>
  <div id="rootContainerItem" class="tw-relative tw-bg-slate-50">
    <el-card
      class="tw-rounded-2xl tw-shadow-lg tw-border-0 tw-w-full tw-mx-auto tw-bg-white custom-card"
    >
      <div v-if="dimensions.length > 0">
        <div class="tw-mb-6 tw-flex tw-items-center tw-justify-between">
          <h3 class="tw-text-lg tw-font-bold tw-text-slate-800">
            版本差异对比
          </h3>
        </div>
        <el-collapse v-model="activeNames" class="custom-collapse">
          <el-collapse-item
            v-for="(dim, index) in dimensions"
            :key="index"
            :name="dim.name"
          >
            <template #title>
              <div class="tw-flex tw-items-center tw-w-full tw-pr-4">
                <i class="bi bi-box tw-mr-3 tw-text-slate-400"></i>
                <span
                  class="tw-text-base tw-font-semibold tw-leading-relaxed tw-text-slate-700"
                >
                  {{ dim.name }}
                </span>
                <div class="tw-flex-grow"></div>
                <el-tag
                  v-if="dim.hasDiff"
                  type="danger"
                  size="small"
                  effect="light"
                  class="tw-rounded-md"
                >
                  <i class="bi bi-exclamation-circle tw-mr-1"></i>差异
                </el-tag>
                <el-tag
                  v-else
                  type="success"
                  size="small"
                  effect="light"
                  class="tw-rounded-md"
                >
                  <i class="bi bi-check-circle tw-mr-1"></i>一致
                </el-tag>
              </div>
            </template>
            <div class="tw-p-4 tw-bg-slate-50 tw-rounded-xl tw-mt-2">
              <el-table
                :data="dim.tableData"
                :row-class-name="tableRowClassName"
                border
                class="tw-w-full custom-table"
              >
                <el-table-column prop="key" label="属性节点" min-width="160">
                  <template #default="scope">
                    <span class="tw-font-mono tw-text-xs tw-text-slate-600">{{
                      scope.row.key
                    }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="valA"
                  label="当前版本 (A)"
                  min-width="180"
                >
                  <template #default="scope">
                    <div
                      class="tw-break-all tw-text-sm"
                      :class="{
                        'tw-text-red-600':
                          scope.row.isDiff && !scope.row.applied,
                        'tw-text-emerald-600 tw-font-bold': scope.row.applied,
                      }"
                    >
                      {{ scope.row.valA }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="valB"
                  label="对比版本 (B)"
                  min-width="180"
                >
                  <template #default="scope">
                    <div
                      class="tw-break-all tw-text-sm"
                      :class="{ 'tw-text-green-600': scope.row.isDiff }"
                    >
                      {{ scope.row.valB }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120" align="center">
                  <template #default="scope">
                    <el-button
                      v-if="scope.row.isDiff && !scope.row.applied"
                      link
                      type="primary"
                      size="small"
                      @click="applyChange(scope.row)"
                    >
                      采用 B
                    </el-button>
                    <el-button
                      v-if="scope.row.applied"
                      link
                      type="danger"
                      size="small"
                      @click="cancelChange(scope.row)"
                    >
                      撤销
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
      <div v-else class="tw-py-16">
        <el-empty description="暂无可对比的 JSON 数据">
          <template #image>
            <i class="bi bi-inbox tw-text-6xl tw-text-slate-200"></i>
          </template>
        </el-empty>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "JsonVersionCompare",
  data() {
    return {
      activeNames: [],
      dimensions: [],
      versionA: {},
      versionB: {},
    };
  },
  mounted() {
    this.buildComparisonData();
  },
  methods: {
    normalize(val) {
      if (val === null || val === undefined) return "";
      return String(val).trim();
    },
    isObjectOrArray(val) {
      return val !== null && typeof val === "object";
    },
    flatten(obj, prefix = "") {
      let result = {};
      for (const key in obj) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (this.isObjectOrArray(obj[key])) {
          Object.assign(result, this.flatten(obj[key], newKey));
        } else {
          result[newKey] = obj[key];
        }
      }
      return result;
    },
    transformJsonStrings(data, transformFn) {
      // 参数校验
      if (typeof transformFn !== "function") {
        throw new TypeError("transformFn must be a function");
      }

      // 处理 null
      if (data === null) return null;

      // 处理字符串类型（核心逻辑：应用指定函数）
      if (typeof data === "string") {
        return transformFn(data) || data;
      }

      // 处理非对象的基本类型（数字、布尔、undefined等）
      if (typeof data !== "object") {
        return data;
      }

      // 处理数组
      if (Array.isArray(data)) {
        return data.map((item) => this.transformJsonStrings(item, transformFn) || item);
      }

      // 处理普通对象
      const result = {};
      for (const [key, value] of Object.entries(data)) {
        result[key] = this.transformJsonStrings(value, transformFn) || value;
      }
      return result;
    },
    buildComparisonData() {
      this.versionA = this.transformJsonStrings(this.versionA, (str) => {
        return WebTool.markdownToObject(str);
      });

      this.versionB = this.transformJsonStrings(this.versionB, (str) => {
        return WebTool.markdownToObject(str);
      });

      const allRootKeys = Array.from(
        new Set([...Object.keys(this.versionA), ...Object.keys(this.versionB)])
      );
      this.dimensions = allRootKeys.map((rootKey) => {
        const flatA = this.isObjectOrArray(this.versionA[rootKey])
          ? this.flatten(this.versionA[rootKey], rootKey)
          : {
              [rootKey]: this.versionA[rootKey],
            };
        const flatB = this.isObjectOrArray(this.versionB[rootKey])
          ? this.flatten(this.versionB[rootKey], rootKey)
          : {
              [rootKey]: this.versionB[rootKey],
            };
        const allLeafKeys = Array.from(
          new Set([...Object.keys(flatA), ...Object.keys(flatB)])
        );
        let hasDiff = false;
        const tableData = allLeafKeys.map((key) => {
          const valA = flatA[key] !== undefined ? String(flatA[key]) : "(缺失)";
          const valB = flatB[key] !== undefined ? String(flatB[key]) : "(缺失)";
          const isDiff = this.normalize(valA) !== this.normalize(valB);
          if (isDiff) hasDiff = true;
          return {
            key,
            valA,
            valB,
            originalValA: valA,
            isDiff,
            applied: false,
          };
        });
        return {
          name: rootKey,
          hasDeepKeys: true,
          hasDiff,
          tableData,
        };
      });
      this.dimensions.forEach((d) => {
        if (d.hasDiff) this.activeNames.push(d.name);
      });
    },
    applyChange(row) {
      row.valA = row.valB;
      row.applied = true;
    },
    cancelChange(row) {
      row.valA = row.originalValA;
      row.applied = false;
    },
    generateNewVersion() {
      const result = {};
      this.dimensions.forEach((dim) => {
        dim.tableData.forEach((item) => {
          result[item.key] = item.valA;
        });
      });
      return this.unflattenJSON(result);
    },
    unflattenJSON(flatObj) {
      const result = {};
      for (const fullKey in flatObj) {
        const value = flatObj[fullKey];
        const keys = fullKey.split(".");
        let current = result;
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const nextKey = keys[i + 1];
          const isLast = i === keys.length - 1;
          const isIndex = /^\d+$/.test(key);
          const nextIsIndex = /^\d+$/.test(nextKey);
          if (isLast) {
            current[isIndex ? Number(key) : key] = value;
          } else {
            if (current[isIndex ? Number(key) : key] == null) {
              current[isIndex ? Number(key) : key] = nextIsIndex ? [] : {};
            }
            current = current[isIndex ? Number(key) : key];
          }
        }
      }
      return result;
    },
    tableRowClassName({ row }) {
      if (row.applied) return "custom-applied-row";
      return row.isDiff ? "custom-diff-row" : "";
    },
  },
};
</script>

<style scoped>
.custom-card {
  overflow: hidden;
}

.custom-collapse {
  border-top: none;
  border-bottom: none;
}

.custom-table {
  --el-table-border-color: #e2e8f0;
  --el-table-header-bg-color: #f8fafc;
  border-radius: 0.5rem;
}

.el-table .custom-diff-row {
  --el-table-tr-bg-color: #fef2f2;
}

.el-table .custom-applied-row {
  --el-table-tr-bg-color: #f0fdf4;
}
</style>