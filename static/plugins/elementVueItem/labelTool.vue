<template>
<div ref="labelToolArea" :mode="mode" :toolBar="toolBar" class="labelToolArea">
  <div class="contentArea" :flag="commentsOption.flag">
    <div class="mainContentArea">
      <div class="contentContainer" :flag="commentsOption.flag">
        <div ref="entityContentArea" class="docContentItem" :switchFlag="switchFlag" @mousedown="removeSearchHighlight">
          <div class="lineLabelList">
            <div v-for="(t, j) in lineLabels" :key="t.id" :style="t.style" :_index="j" :source="t.source" :target="t.target" :title="t.label" :highlight="t.highlight" :baseFlag="t.base" :sameFlag="t._same" class="spanInfoArea" @mouseover="mouseoverLineItem" @mouseleave="mouseleaveLineItem">
              <span class="spanText">{{ t.label }}</span>
              <span :mode="tMode" class="opSpanInfoArea" type="line">
                <Edit title="编辑标注信息" :_index="j" index="0" class="editSpanBtn"></Edit>
                <Delete title="删除标注信息" class="removeSpanBtn" :_index="j" index="0" style="margin-left: 10px"></Delete>
                <span v-if="tMode === 'checkTwo' && t.base === '0'" class="setBaseOp">
                  <input :_type="'relation'" :_index="j" type="checkbox" />基准</span>
                <span v-if="tMode === 'checkTwo' && t.base === '1'" class="setBaseOp">
                  <input :_type="'relation'" :_index="j" checked type="checkbox" />基准</span>
              </span>
            </div>
          </div>
          <p v-for="(d, i) in group" :key="d.key" class="contentItem" :index="i + 1" :style="paddingLeft" @mouseup="handleSelectText" v-html="d.html"></p>
        </div>
      </div>

      <div v-if="commentsOption.flag" class="commentsListArea">
        <div v-if="commentsOption.data.length === 0" class="emptyDataTips">
          暂无数据
        </div>
        <div v-for="(item, index) in commentsOption.data" :key="index" :group="item.group" :index="item.index" :_index="index" class="commentsItem" @mouseover="mouseoverCommentsItem" @mouseleave="mouseleaveCommentsItem">
          <span v-if="tMode !== 'check'" class="commentsText" v-html="item.content"></span>
          <Delete v-if="tMode === 'check'" class="el-icon-delete removeCommentsBtn" @click="dealClickRemoveComments(item)"></Delete>
          <el-input v-if="tMode === 'check'" v-model="item.content" type="textarea" :rows="2" placeholder="请输入内容" @keyup="handleEnterUp" @change="handleCommentChange(item)">
          </el-input>
          <div v-if="item.comment !== ''" class="commentsInfo">
            <span class="nameItem" v-text="item.author"></span>
            <span class="timeItem" v-text="item.time"></span>
          </div>
        </div>
      </div>
      <div ref="canvasItemArea" class="canvasItemArea">
        <svg ref="canvasItem" class="canvasItem" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
          <defs>
            <marker id="markerArrow" viewBox="0 0 20 20" refX="25" refY="10" markerUnits="strokeWidth" markerWidth="5" markerHeight="10" orient="auto">
              <path d="M 0 0 L 20 10 L 0 20 z" fill="#91D5FF" stroke="#91D5FF" />
            </marker>
            <marker id="markerArrow1" viewBox="0 0 20 20" refX="25" refY="10" markerUnits="strokeWidth" markerWidth="5" markerHeight="10" orient="auto">
              <path d="M 0 0 L 20 10 L 0 20 z" fill="#ff4d4f" stroke="#ff4d4f" />
            </marker>
            <marker id="markerArrow2" viewBox="0 0 20 20" refX="25" refY="10" markerUnits="strokeWidth" markerWidth="5" markerHeight="10" orient="auto">
              <path d="M 0 0 L 20 10 L 0 20 z" fill="#52c41a" stroke="#52c41a" />
            </marker>
          </defs>
          <g class="pathGroup"></g>
          <g class="textGroup"></g>
          <g :flag="commentsOption.flag" class="commentsGroup"></g>
        </svg>
      </div>
    </div>
    <el-dialog :width="labelDialog.width || '600px'" v-model="labelDialog.visible" :title="labelDialog.dialogObj.title">
      <div class="dialogContentArea" :style="labelDialog.state === 1 ? 'height: 600px;' : 'height: 300px;'">
        <div class="editLabelArea">
          <h3 class="contentTopArea ellipsis" :title="labelDialog.data.text">
            {{ labelDialog.data.text }}
          </h3>
          <div class="contentLeftArea">
            <slot v-if="labelDialog.visible">
              <el-tree ref="entityLabelTree" :data="entityLabelTree.data" :node-key="entityLabelTree.nodeKey || 'id'" :highlight-current="true" show-checkbox :check-strictly="false" :default-checked-keys="entityLabelTree.defaultEntity" style="height: 190px; overflow: auto" @node-click="handleLabelClick" @check-change="entityLabelChange"></el-tree>
            </slot>
          </div>
          <div class="contentRightArea">
            <slot v-if="
                  entityLabelTree.select &&
                    entityLabelTree.select.length !== 0 &&
                    labelDialog.visible
                ">
              <el-tree ref="entityParamList" :data="entityLabelTree.select || []" :node-key="entityLabelTree.nodeKey || 'id'" show-checkbox :highlight-current="true" :check-strictly="false" :default-checked-keys="entityLabelTree.defaultParam" style="height: 190px; overflow: auto" @check-change="entityLabelChange"></el-tree>
            </slot>
          </div>
        </div>
        <div v-if="labelDialog.type === 'edit' && !toolBar" :state="labelDialog.state" class="extraDataArea">
          <h5 class="switchTableBtn" @click="switchDialogTable(labelDialog)">
            更多待修改项 <i class="el-icon-arrow-down"></i>
          </h5>
          <slot v-if="labelDialog.state === 1">
            <el-table ref="multipleTable" :data="labelDialog.currentTable.data" :border="true" :height="280" style="width: 100%" @selection-change="handleSelectionChange">
              <el-table-column align="center" type="selection" width="55">
              </el-table-column>
              <el-table-column align="center" type="index" width="50" label="序号">
              </el-table-column>
              <slot v-for="d in labelDialog.currentTable.headers">
                <el-table-column :width="d.width" :label="d.label" :property="d.property || d.prop">
                  <template #scope="scope">
                    <div class="ellipsis" :title="scope.row[scope.column.property]">
                      {{ scope.row[scope.column.property] }}
                    </div>
                  </template>
                </el-table-column>
              </slot>
            </el-table>
          </slot>
        </div>
      </div>
      <span>
        <el-button class="btns" size="small" @click="labelDialog.visible = false">取消</el-button>
        <el-button class="btns" type="primary" size="small" @click="labelDialog.visible = dealConfirmLabel();">确定</el-button>
      </span>
    </el-dialog>
    <el-dialog v-model="relationDialog.visible" :width="relationDialog.width || '600px'"  :title="relationDialog.dialogObj.title">
      <div class="dialogContentArea" :style="
            relationDialog.state === 1 ? 'height: 700px;' : 'height: 400px;'
          ">
        <div class="editRelationArea">
          <h3 :type="relationDialog.lineType || 'relation'" class="contentTopArea">
            <label class="masterName" :title="relationDialog.source"><span class="ellipsis">{{
                  relationDialog.source
                }}</span></label>
            <label class="relationLabelArea">
              <span class="linkArrowIcon">
                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="100%" height="30px" preserveAspectRatio="xMinYMid meet" viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M0 18h156m-5-5l5 5l-5 5" />
                </svg>
              </span>
              <span class="relationLabel ellipsis" :title="relationDialog.currentLabel" v-text="relationDialog.currentLabel"></span></label>
            <label class="slaveName" :title="relationDialog.target">
              <span class="ellipsis">{{ relationDialog.target }}</span></label>
          </h3>
          <div class="relationContentArea">
            <h5>
              {{
                  relationDialog.lineType === 'relation'
                    ? '选择关系标签'
                    : '选择属性标签'
                }}
            </h5>
            <slot v-if="relationDialog.visible">
              <el-tree ref="relationLabelTree" :data="relationLabelTree.data" :node-key="relationLabelTree.nodeKey || 'id'" :default-checked-keys="relationLabelTree.defaultRelation" style="height: 190px; overflow: auto" :show-checkbox="true" @check-change="relationLabelChange" @check="relationCurrentChange"></el-tree>
            </slot>
          </div>
        </div>
        <div v-if="relationDialog.type === 'edit' && !toolBar" :state="relationLabelTree.state" class="extraDataArea">
          <h5 class="switchTableBtn" @click="switchDialogTable(relationDialog)">
            更多待修改项 <i class="el-icon-arrow-down"></i>
          </h5>
          <slot v-if="relationDialog.state === 1">
            <el-table ref="multipleTable" :data="relationDialog.currentTable.data" :border="true" :height="280" style="width: 100%" @selection-change="handleSelectionChange1">
              <el-table-column align="center" type="selection" width="55">
              </el-table-column>
              <el-table-column align="center" type="index" width="50" label="序号">
              </el-table-column>
              <slot v-for="d in relationDialog.currentTable.headers">
                <el-table-column :width="d.width" :label="d.label" :property="d.property || d.prop">
                  <template #scope="scope">
                    <div class="ellipsis" :title="scope.row[scope.column.property]">
                      {{ scope.row[scope.column.property] }}
                    </div>
                  </template>
                </el-table-column>
              </slot>
            </el-table>
          </slot>
        </div>
      </div>
      <span>
        <el-button class="btns" size="small" @click="relationDialog.visible = false">取消</el-button>
        <el-button class="btns" type="primary" size="small" @click="relationDialog.visible = dealConfirmRelation();">确定</el-button>
      </span>
    </el-dialog>
  </div>
  <div class="labelOptionArea" :flag="commentsOption.flag" :style="(!labelOption.comments || !commentsOption.flag) ? {
    width: '100%'
  } : {
    width: '100%'
  }">
    <div class="buttonArea" style="display: inline-block">
      <span v-if="mode === 'edit'" class="opBtnItem" @click="switchToolMode">
        <Pointer class="iconfont iconpizhu1"></Pointer>标注模式
      </span>
      <span v-else class="opBtnItem" @click="switchToolMode">
        <View class="iconfont iconpizhu"></View>预览模式
      </span>
      <span class="opBtnItem" @click="redoLabelOp" v-if="labelOption.undo">
        <RefreshLeft class="iconfont iconchexiao"></RefreshLeft>撤回
      </span>
      <span class="opBtnItem" @click="removeLabelInfo" v-if="labelOption.clear">
        <DeleteFilled class="iconfont iconqingkong1"></DeleteFilled>清空
      </span>
      <span v-if="tMode !== 'check' && labelOption.algorithm" class="opBtnItem" :style="{
            color: status.calcing < 1 && tMode !== 'check' ? '#000' : '#999',
          }" @click="switchClacLabelMode"><svg t="1655952840136" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2029" width="64" height="64">
          <path d="M849.8 510.4c3.5-4.5 6.8-9.1 10-13.6 57.1-80.4 71.2-154.7 39.8-209.3-31.4-54.6-102.8-79.6-201-70.6-5.7 0.5-11.4 1.2-17.2 1.9-2.2-5.4-4.6-10.7-6.9-15.9C633.4 113.3 576 64 513 64s-120.3 49.5-161.4 139c-2.4 5.1-4.6 10.4-6.9 15.7-5.7-0.7-11.4-1.4-17-1.9-98.1-9.2-169.6 15.8-201 70.4-31.5 54.6-17.4 128.9 39.6 209.3 3.2 4.5 6.6 9.1 10 13.6-3.5 4.5-6.8 9.1-10 13.6C109.2 604.1 95 678.4 126.5 733c27.2 47.3 84.4 72.4 162.9 72.4 12.2 0 24.9-0.6 38-1.8 5.7-0.5 11.4-1.2 17.2-1.9 2.2 5.4 4.6 10.7 6.9 15.9C392.6 907.2 450 956.5 513 956.5s120.3-49.3 161.5-138.9c2.4-5.1 4.6-10.4 6.9-15.7 5.7 0.7 11.4 1.4 17 1.9 13.3 1.2 26.1 1.9 38.4 1.9 78.4 0 135.4-25.1 162.7-72.2 31.5-54.6 17.4-128.9-39.6-209.3-3.3-4.7-6.6-9.2-10.1-13.8zM322.2 746.8c-73.6 6.8-127-8.6-146.4-42.3-19.4-33.7-6-87.6 36.9-147.8l1.5-2.1c25.4 27 54.5 53.2 86.7 78.1 5.4 40.2 13.6 78.4 24.2 113.8-0.9 0.1-1.9 0.2-2.9 0.3z m-28.4-194c-15.5-14-30-28.2-43.2-42.6 13.2-14.4 27.6-28.6 43.2-42.6-0.6 14.1-1 28.3-1 42.7 0 14.2 0.4 28.4 1 42.5z m7.2-165.1c-32.2 24.8-61.3 51.1-86.7 78-0.5-0.7-1.1-1.4-1.5-2.1-42.8-60.4-56.2-114.3-36.8-147.9 16.4-28.4 56.9-43.8 113.3-43.8 10.5 0 21.6 0.5 33.1 1.6 0.9 0.1 1.8 0.2 2.8 0.3-10.6 35.4-18.8 73.7-24.2 113.9z m358.3-46.2c-11.8-7.5-23.9-14.9-36.2-22-12.3-7.1-24.7-13.9-37.1-20.3 19.7-6.4 39.1-11.7 58-15.9 5.8 18.2 10.9 37.6 15.3 58.2zM513.1 121.1c38.6 0 79.4 39.9 110.6 108.5-35.9 8.5-73 20.5-110.4 35.8-37.5-15.4-74.7-27.5-110.6-36 31-68.5 71.8-108.3 110.4-108.3z m-131 162c19 4.2 38.4 9.5 58.2 16-12.4 6.4-24.8 13.2-37.2 20.3-12.4 7.1-24.5 14.5-36.3 22 4.4-20.6 9.5-40.1 15.3-58.3zM366.8 679c11.8 7.5 23.9 14.9 36.2 22 12.3 7.1 24.7 13.9 37.1 20.3-19.7 6.4-39.1 11.7-58 15.9-5.8-18.1-10.9-37.6-15.3-58.2z m146.3 220.5c-38.6 0-79.4-39.9-110.6-108.5 35.9-8.5 73-20.5 110.4-35.8 37.5 15.4 74.7 27.5 110.6 36-31.1 68.4-71.9 108.3-110.4 108.3zM644 737.4c-19-4.2-38.4-9.5-58.2-16 12.4-6.4 24.8-13.2 37.2-20.3 12.4-7.1 24.5-14.5 36.3-22-4.4 20.6-9.5 40.1-15.3 58.3z m27.5-135.5c-24.1 17.5-49.9 34.2-77 49.8-27 15.6-54.4 29.4-81.6 41.5-27.2-12.1-54.5-26-81.5-41.6-27-15.6-52.7-32.4-76.8-49.9-3.1-29-4.8-59.6-4.8-91.5 0-32 1.7-62.6 4.8-91.6 24.1-17.5 49.9-34.2 77-49.8 27-15.6 54.4-29.4 81.6-41.5 27.2 12.1 54.5 26 81.5 41.6 27 15.6 52.7 32.4 76.8 49.9 3.1 29 4.8 59.6 4.8 91.5 0 32-1.7 62.5-4.8 91.6z m32.4-328.2c11.4-1.1 22.4-1.6 32.8-1.6 56.6 0 97.2 15.4 113.6 43.9 19.4 33.7 6 87.6-36.9 147.8l-1.5 2.1c-25.4-27-54.5-53.2-86.7-78.1-5.4-40.2-13.6-78.4-24.2-113.8 1-0.1 1.9-0.2 2.9-0.3z m28.4 194.1c15.5 14 30 28.2 43.2 42.6-13.2 14.4-27.6 28.6-43.2 42.6 0.6-14.1 1-28.3 1-42.7 0-14.3-0.3-28.5-1-42.5z m117.8 237.1c-19.4 33.7-72.8 49-146.4 42.1-0.9-0.1-1.8-0.2-2.8-0.3 10.6-35.4 18.8-73.6 24.2-113.8 32.2-24.8 61.3-51.1 86.7-78 0.5 0.7 1.1 1.4 1.5 2.1 42.9 60.3 56.2 114.2 36.8 147.9z" p-id="2030"></path>
          <path d="M482.4 501.6h-25.6V476c0-6.6-6.8-12-15.3-12-8.4 0-15.3 5.4-15.3 12v25.6h-25.6c-6.6 0-12 6.8-12 15.3 0 8.4 5.4 15.3 12 15.3h25.6v25.6c0 6.6 6.8 12 15.3 12 8.4 0 15.3-5.4 15.3-12v-25.6h25.6c6.6 0 12-6.8 12-15.3s-5.4-15.3-12-15.3zM629 501.6h-81.7c-6.6 0-12 6.8-12 15.3 0 8.4 5.4 15.3 12 15.3H629c6.6 0 12-6.8 12-15.3 0.1-8.5-5.3-15.3-12-15.3z" p-id="2031"></path>
        </svg>算法标注</span>
      <span class="opBtnItem" @click="switchCommentMode" v-if="labelOption.comments">
        <EditPen class="iconfont iconbiaoji"></EditPen>查看批注
      </span>
    </div>
    <div v-if="labelOption.validMark || labelOption.flagMark" class="checkGroup">
      <UserFilled v-if="tMode === 'check' && status.is_valid" class="iconfont iconpizhu_special"></UserFilled>
      <span v-if="tMode === 'check' && status.is_valid" style="font-size: 12px">标注人员已置为无效</span>
      <el-checkbox v-if="tMode !== 'check' && labelOption.validMark" v-model="status.is_valid" size="small" label="无效" @change="handleFlagChange">无效</el-checkbox>
      <el-checkbox v-if="tMode !== 'check' && labelOption.flagMark" v-model="status.checking" size="small" label="标记" @change="handleFlagChange">标记</el-checkbox>
    </div>
  </div>
  <div class="commentListTitle" :flag="commentsOption.flag" >
    <MessageBox class="iconfont iconbiaotiicon col1577FF"></MessageBox>批注
  </div>
</div>
</template>

<script>
export default {
  data() {
    return {
      scrollWidth: 0,
      switchFlag: 3,
      mode: 'edit',
      toolBar: true,
      labelOption: {
        undo: false,
        clear: false,
        algorithm: true,
        comments: true,
        validMark: true,
        flagMark: false
      },
      tMode: '',
      nodeData: [],
      relationData: [],
      status: {
        checking: true,
        is_valid: false,
        calcing: 0,
      },
      entityLabelTree: {
        nodeKey: 'id',
        select: [],
        defaultEntity: [],
        defaultParam: [],
        data: [{
            id: '1',
            label: '人物',
            params: [{
              id: '1-1',
              label: '姓名',
            }, ],
          },
          {
            id: '2',
            label: '地点',
            params: [{
              id: '2-1',
              label: '位置',
            }, ],
          },
          {
            id: '3',
            label: '机构',
            params: [{
              id: '3-1',
              label: '名称',
            }, ],
          },
          {
            id: '4',
            label: '时间',
          },
          {
            id: 5,
            label: '国家',
            params: [{
              id: '1-1',
              label: '名称',
            }, ],
          },
        ],
      },
      relationLabelTree: {
        defaultRelation: [],
        current: null,
        data: [{
          id: '3-1',
          label: '名称',
        }, ],
        labels: [],
      },
      labelDialog: {
        state: 0,
        dialogObj: {
          title: '选择标签(实体/属性)',
          width: '560px',
        },
        type: 'add',
        visible: false,
        data: {},
        currentTable: {
          headers: [{
              label: '实体名称',
              property: 'name',
              width: 100,
            },
            {
              label: '标签类型',
              property: 'type',
              width: 100,
            },
            {
              label: '所属句子',
              property: 'sentence',
            },
          ],
          data: [],
        },
        extraData: {
          paramData: [{}],
          entityData: [{}],
        },
      },
      relationDialog: {
        state: 0,
        dialogObj: {
          title: '设置标签连线',
          width: '560px',
        },
        type: 'add',
        visible: false,
        data: {},
        currentTable: {
          headers: [],
          data: [],
        },
      },
      sentence: 0,
      commentsOption: {
        current: 0,
        // flag: 1,
        flag: 0,
        data: [{
            id: '0212142',
            type: 'node',
            content: '测试批注1',
            author: '张三',
          },
          {
            id: '0212141',
            type: 'node',
            content: '测试批注2',
            author: '张三',
          },
        ],
      },
      lineLabels: [],
      group: [],
      backup: {
        relation: [],
        labels: [],
        remarks: [],
      },
      clacResult: {
        relation: [],
        labels: [],
        remarks: [],
      },
      dataInfo: {
        flag: 0,
        activeName: 'entity',
        content: [],
        relation: [],
        remarks: [],
        labels: [],
      },
    };
  },
  computed: {
    paddingLeft() {
      var len = String(this.sentence).length;
      return {
        paddingLeft: len * 8 + 'px',
      };
    },
  },
  mounted() {
    var h = $(this.$refs.labelToolArea)
      .find('.contentArea')
      .height();
    this.scrollWidth = $(this.$refs.labelToolArea)
      .find(".contentArea").width() - $(this.$refs.labelToolArea)
      .find(".mainContentArea").width()

    this.$nextTick(function () {

      if (this.markData) {
        this.updateData(this.markData);
        this.opBackupData();
      }
    });
  },
  methods: {
    initConfig() {
      if (this.config) {
        this.nodeData = this.config.nodeData || this.nodeData || [];
        this.relationData = this.config.relationData || this.nodeData || [];
        this.mode = this.config.mode || this.mode || 'edit';
        this.tMode = this.config.tMode || this.tMode;
        for (var k in this.status) {
          this.status[k] = this.config[k] || this.status[k] || false;
        }
        if (this.config.labelOption) {
          for (var k in this.labelOption) {
            this.labelOption[k] = this.config.labelOption[k] || this.labelOption[k];
          }
        }
      }
    },
    //每次操作结束后请求后台最新标注数据更新页面中的标注信息
    freshData() {

    },
    //修改文档标记时触发
    handleFlagChange() {

    },
    //批注发生变化时触发
    handleCommentChange(item) {

    },
    handleEnterUp(e) {

    },
    handleSelectionChange(val) {
      this.labelDialog.batSelect = val;
    },
    handleSelectionChange1(val) {
      this.relationDialog.batSelect = val;
    },
    //编辑实体或属性对话框和编辑关系对话框时，切换批量修改表格显示或隐藏
    switchDialogTable(dialogData) {
      if (dialogData.state === 0) {
        dialogData.state = 1;
      } else {
        dialogData.state = 0;
      }
    },
    //格式化转入的标注任务参数(项目标签数据和业务数据)
    switchMarkData(tData) {
      if (!tData) {
        return false;
      }
      var labels = tData.docNodes || [];
      var paragraphs = tData.txtParagraphs || [];
      this.sentence = paragraphs.length;
      this.commentsOption.data = [];
      var relations = tData.docRelations || [];
      this.dataInfo.content = paragraphs.map(item => {
        return item.content || item;
      });
      var _self = this;

      this.dataInfo.labels = labels.map(item => {
        //待修改
        item.id = item._id || item.id;
        item.text = item.node_name || item.text || '-';
        item.label = item.entity_name || item.entityName || item.label;
        var type = item.node_type || item.type;
        var typeName = item.type_name || item.typeName || item.keyName || item.paramName;
        if (type === 1 && typeName && item.label) {
          //实体的属性标签
          item.label = typeName + '-' + item.label;
          item.type = 'param';
        }
        item.group = item.index;
        //批注信息
        var comments = item.postil || item.comments;
        if (comments) {
          // var time = tool.transformPHPTime(item.comment_time, 1);
          var cItem = {
            id: item.id,
            content: comments,
            author: item.comment_user || '-',
            time: time || '',
          };
          _self.commentsOption.data.push(cItem);
        }

        return item;
      });
      this.dataInfo.relation = relations.map(item => {
        //待修改
        item.source = item.source_id || item.source;
        item.target = item.target_id || item.target;
        item.label = item.relation_name || item.relationName || item.label;
        item.id = item._id || item.id || (item.source + '-' + item.target + '-' + item.label);
        return item;
      });
    },
    //格式化实体、属性和关系标签数据
    switchLabelData(nodeData, relationData) {
      nodeData = nodeData || this.nodeData || [];
      relationData = relationData || this.relationData || [];

      this.entityLabelTree.data = nodeData.map(item => {
        item.id = item.tag_type_id || item.id;
        item.label = item.tag_type_name || item.label || item.name;
        var properties = item.properties || [];
        item.params = properties.map(tItem => {
          return {
            id: tItem.tag_id || tItem.id,
            label: tItem.name || tItem.label,
          };
        });
        return item;
      });
      if (relationData && relationData.length !== 0) {
        this.relationLabelTree.labels = relationData.map(item => {
          item.id = item.tag_id || item.id;
          item.label = item.tag_name || item.label;
          return item;
        });
      }
    },
    //操作数组元素：数组元素中包含指定属性的(匹配属性名和值)，会被删除
    removeItem(arr, param) {
      var index = this.searchArray(arr, param);
      if (index !== -1) {
        arr.splice(index, 1);
      }
    },
    //操作按钮点击事件的统一响应函数，根据按钮的函数名动态地回调
    handleOpBtnClick(funcName) {
      if (typeof this[funcName] === 'function') {
        this[funcName]();
      }
    },
    //通过属性查找数组中的元素索引
    searchArray(arr, param) {
      var ret = -1;
      for (var i = 0; i < arr.length; i++) {
        let flag = true;
        for (let k in param) {
          flag = flag && param[k] === arr[i][k];
        }
        if (flag) {
          ret = i;
          break;
        }
      }
      return ret;
    },
    //更新标签编辑的对话框内容
    updateLabelDialog() {
      var data = this.labelDialog.data;
      this.labelDialog.state = 0;
      var type = data.type || 'entity';
      this.entityLabelTree.defaultEntity = [];
      this.entityLabelTree.select = [];
      this.entityLabelTree.defaultParam = [];
      if (type === 'entity' && this.labelDialog.type !== 'add') {
        this.entityLabelTree.defaultEntity = [data.entity_id];
        this.entityLabelTree.current = {
          entity: {
            id: data.entity_id,
            label: data.entity_name,
          },
        };
      } else if (data && data.entity_id) {
        var tArr = this.entityLabelTree.data;
        this.entityLabelTree.current = {
          _entity: {
            id: data.entity_id,
            label: data.entity_name,
          },
        };
        var index = this.searchArray(tArr, {
          id: data.entity_id
        });
        if (index !== -1 && tArr[index]) {
          this.entityLabelTree.defaultEntity = [];
          this.entityLabelTree.select = tArr[index].params;
          // this.entityLabelTree.defaultParam = [data.type_id];
          // 由于任务管理-标注部分，右侧表格用的是算法的本体，里边没有type_id，所以暂时用type_name代替
          this.entityLabelTree.defaultParam = [data.type_name];
          this.entityLabelTree.current.param = {
            id: data.type_id,
            label: data.type_name,
          };
        }
      }

      //todo: 可以添加显示相关标签列表，进行批量修改;
    },
    //获取实体标签列表中某个实体标签的属性标签列表
    getParamList(label) {
      var ret = [];
      for (var i = 0; i < this.entityLabelTree.data.length; i++) {
        var entity = this.entityLabelTree.data[i];
        if (entity.label === label) {
          ret = entity.params || [];
          break;
        }
      }
      return ret;
    },
    //更新标签连线编辑的对话框内容
    updateRelationDialog() {
      this.relationDialog.state = 0;
      var rData = this.relationDialog.data;
      //设置默认选中项
      this.relationLabelTree.defaultRelation = [rData.relation_id];
      var sid = rData.source;
      var tid = rData.target;
      var sIndex = $(this.$refs.labelToolArea)
        .find(`.spanItem[id='${sid}']`)
        .attr('_index');
      var tIndex = $(this.$refs.labelToolArea)
        .find(`.spanItem[id='${tid}']`)
        .attr('_index');
      var sData = this.dataInfo.labels[sIndex];
      var tData = this.dataInfo.labels[tIndex];
      var sType = sData.type || 'entity';
      var tType = tData.type || 'entity';
      var type = 'param';
      this.relationDialog.source = sData.text;
      this.relationDialog.target = tData.text;
      if (sType !== 'entity') {
        this.$message('起始标签需要为实体。');
        return false;
      }
      rData.type = 0;
      if (sType === 'entity' && tType === 'entity') {
        type = 'relation';
        rData.type = 1;
        this.relationLabelTree.data = this.relationLabelTree.labels;
        if (
          !this.relationLabelTree.data ||
          this.relationLabelTree.data.length === 0
        ) {
          this.$message('缺少关系标签数据');
          return false;
        }
      } else if (sType === 'entity' && tType !== 'entity') {
        this.relationLabelTree.data = this.getParamList(sData.label);
        if (
          !this.relationLabelTree.data ||
          this.relationLabelTree.data.length === 0
        ) {
          this.$message(`[${sData.label}]实体没有配置属性标签数据。`);
          return false;
        }
      } else {
        // this.relationLabelTree.data = this.getParamList(tData.label);
      }

      this.relationDialog.lineType = type;
      this.relationDialog.currentLabel = rData.label || '';

      //Todo: 可以显示相关数据列表，进行批量修改

      return true;
    },
    //切换算法标注结果
    switchClacLabelMode() {
      this.$confirm('确实切换显示算法标注结果吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.$emit("confirmAlgorithmResult");
      });
    },
    //切换显示批注列表
    switchCommentMode() {
      if (this.commentsOption.flag === 0) {
        this.commentsOption.flag = 1;
      } else {
        this.commentsOption.flag = 0;
      }
      this.updateCommentList();
      this.scrollWidth = $(this.$refs.labelToolArea)
        .find(".contentArea").width() - $(this.$refs.labelToolArea)
        .find(".mainContentArea").width()
    },
    //标注行为产生的数据会实时保存，保存按钮只作提示用
    saveLabelData() {
      this.$message('已保存。');
    },
    //撤销当前操作
    redoLabelOp() {
      //发送撤销上次操作请求
      var _self = this;
      if (this.backupOp && this.backupOp.type) {
        this.$emit("undo", this.backupOp);
      }
    },
    //标注操作信息的备份
    opBackup(type, param) {
      this.backupOp = {
        type: type,
        data: param,
        task_id: this.currentInfo.task_id,
        doc_id: this.currentInfo.doc_id,
        user_id: this.currentInfo.user_id || '-',
        group_num: this.currentInfo.groupNum,
      };
    },
    //备份操作前的标签数据
    opBackupData(flag) {
      if (flag) {
        this.dataInfo.flag = 0;
        this.commentsOption.data = [];
        for (let k in this.backup) {
          this.dataInfo[k] = [];
          for (let i = 0; i < this.backup[k].length; i++) {
            if (k === 'remarks') {
              this.commentsOption.data.push({
                ...this.backup[k][i]
              });
            } else {
              this.dataInfo[k].push({
                ...this.backup[k][i]
              });
            }
          }
        }
      } else {
        this.dataInfo.remarks = this.commentsOption.data;
        for (let k in this.backup) {
          this.backup[k] = [];
          for (let i = 0; i < this.dataInfo[k].length; i++) {
            this.backup[k].push({
              ...this.dataInfo[k][i]
            });
          }
        }
      }
    },
    //清空标签数据
    removeLabelInfo() {
      this.$confirm('确实要清空所有标签吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.$emit("confirmClearData");
      });
    },
    //实体标签树选中变化的响应函数
    entityLabelChange(data, checked) {
      // console.log(data, checked, node, '08');
      var nodeData = this.labelDialog.data;
      var rIndex = this.findRelation(nodeData.id);
      if (checked && this.$refs.entityLabelTree) {
        this.entityLabelTree.current = this.entityLabelTree.current || {};
        if (data.params) {
          this.entityLabelTree.select = [];
          if (this.labelDialog.data.type === 'param' && rIndex !== -1) {
            this.$message('需要先删除标签上的连线，才能改为实体标签');
            return false;
          }
          this.$refs.entityLabelTree.setCheckedNodes([data]);

          this.entityLabelTree.current.entity = data;
          this.entityLabelTree.current.param = null;
        } else {
          if (this.labelDialog.data.type !== 'param' && rIndex !== -1) {
            this.$refs.entityParamList.setCheckedNodes([]);
            this.$message('需要先删除标签上的连线，才能改为属性标签');
            return false;
          }
          this.$refs.entityLabelTree.setCheckedNodes([]);
          this.entityLabelTree.current.entity = null;
          this.entityLabelTree.current.param = data;
          this.$refs.entityParamList.setCheckedNodes([data]);
        }
      } else {
        // this.entityLabelTree.current.entity = null;
        // this.entityLabelTree.current.param = null;
      }
    },
    //关系标签树选中变化的响应函数(只控制多选为单选)
    relationLabelChange(data, checked) {
      if (checked && this.$refs.relationLabelTree) {
        this.$refs.relationLabelTree.setCheckedNodes([data]);
      }
    },
    //关系标签树，选中对象发生变化时更新关系标签名称
    relationCurrentChange(a, b) {
      if (b.checkedNodes.length !== 0) {
        this.relationDialog.selectLabel = a.label;
        this.relationDialog.current = a;
      } else {
        this.relationDialog.selectLabel = '';
      }
    },
    //实体或属性标签树选中发生变化时触发该响应函数
    handleLabelClick(data) {
      this.entityLabelTree.current = this.entityLabelTree.current || {};
      this.entityLabelTree.current._entity = data;
      this.entityLabelTree.select = data.params;
    },
    //删除标注
    dealClickRemoveComments(item) {
      this.$confirm('确实要删除批注吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        //操作前备份
        this.opBackupData();
        var _index = $('#' + item.id).attr('_index');
        var nodeData = this.dataInfo.labels[_index];
        this.opBackup('update_node', [{
          ...nodeData
        }]);
        // var nodeData = this.group[nodeData.group].labels[nodeData.index];
        nodeData.postil = '';
        this.$emit("confirmDeleteComments", nodeData);
      });
    },
    //切换工具的功能模式：标注模式或预览模式
    switchToolMode() {
      if (this.mode === 'view') {
        this.mode = 'edit';
      } else {
        this.mode = 'view';
      }
      this.updateContentArea();
    },
    //替换当前的标注数据
    updateData(markData) {
      this.initConfig();
      this.currentInfo = markData;
      this.dataInfo.relation = [];
      this.dataInfo.labels = [];
      this.commentsOption.data = [];
      this.dataInfo.remarks = [];
      this.switchMarkData(markData);
      this.switchLabelData();
      this.updateContentArea();
    },
    //通过id删除标签连线的数组元素
    removeRelationById(id, flag) {
      if (!flag) {
        this.removeItem(this.dataInfo.relation, {
          source: id
        });
        this.removeItem(this.dataInfo.relation, {
          target: id
        });
      } else {
        var param = {};
        param[flag] = id;
        this.removeItem(this.dataInfo.relation, param);
      }
    },
    //通过源标签ID或目标标签ID查找关系连线，返回结果的索引
    findRelation(source, target) {
      var ret = -1;
      var arr = this.dataInfo.relation;
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].source === source && arr[i].target === target) {
          ret = i;
          break;
        }
        if (!target && (arr[i].source === source || arr[i].target === source)) {
          ret = i;
          break;
        }
      }
      return ret;
    },
    //通过段落编号和标签索引查找批注对象
    findCommentItem(group, index) {
      var ret = -1;
      var arr = this.commentsOption.data;
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].group === group && arr[i].index === index) {
          ret = i;
          break;
        }
      }
      return ret;
    },
    //响应文本选择事件
    handleSelectText(e) {
      if (this.mode === 'view') {
        return false;
      }
      var elem = this.$refs.entityContentArea;
      let txt = window.getSelection ?
        window.getSelection() :
        elem.selection.createRange().text;
      var sText = txt.toString();
      if (txt.type !== 'Range') {
        // this.$message('请您从左到右划选文字进行标注。');
        return false;
      }

      if (sText !== '') {
        var ret = this.getSelectTextOffset(txt); //选中文本数据
        ret.group = e.srcElement.getAttribute('index') - 1;
        if (ret.text === '' || e.srcElement.className !== 'contentItem') {
          this.$message('鼠标划选内容无效。');
        } else {
          this.labelDialog.dialogObj.title = '选择标签(实体/属性)';
          this.labelDialog.type = 'add';
          this.labelDialog.data = ret;
          this.updateLabelDialog();
          this.labelDialog.visible = true;
        }
      }
    },
    //确认实体属性标签操作对话框对标签的操作
    dealConfirmLabel(val) {
      if (!val) {
        this.labelDialog.visible = false;
        return false;
      }
      if (
        !this.entityLabelTree.current ||
        (!this.entityLabelTree.current.param &&
          !this.entityLabelTree.current.entity)
      ) {
        this.$message('需要选择一个标签。');
        return false;
      }

      //将标签数据备份
      this.opBackupData();

      var label = '';
      var param = this.entityLabelTree.current.param;
      var data = this.labelDialog.data;
      var olderData = {
        ...data
      };

      if (param) {
        var _entity = this.entityLabelTree.current._entity;
        label = param.label + '-' + _entity.label;
        data.type = 'param';
        data.node_type = 1;
        data.type_id = param.id;
        data.type_name = param.label;
        data.entity_id = _entity.id;
        data.entity_name = _entity.label;
      } else {
        var entity = this.entityLabelTree.current.entity;
        label = entity.label;
        data.type = 'entity';
        data.node_type = 0;
        data.entity_id = entity.id;
        data.entity_name = entity.label;
      }

      var _self = this;
      data.index = data.group;
      data.task_id = this.currentInfo.task_id || this.currentInfo.taskId;
      data.node_name = data.text;
      data.doc_id = this.currentInfo.doc_id;
      if (this.toolBar) {
        data.index = data.index + 1;
      }

      this.$emit('confirmChangeLabel', this.dataInfo.labels, data, this.labelDialog.batSelect);

      this.labelDialog.visible = false;
    },
    //确认关系属性连线标签操作对话框对标签的操作
    dealConfirmRelation(val) {
      if (!val) {
        this.relationDialog.visible = false;
        return false;
      }
      var nodeData = this.$refs.relationLabelTree.getCheckedNodes()[0];
      if (!nodeData) {
        this.$message('需要选择一个标签。');
        return false;
      }

      //将标签数据备份
      this.opBackupData();

      var rData = this.relationDialog.data;
      var lType = this.relationDialog.lineType;
      var olderData = {
        ...rData
      };
      if (lType === 'relation') {
        rData.type = 1;
      } else {
        rData.type = 0;
      }
      rData.relation_id = nodeData.id;
      rData.label = nodeData.label;
      rData.task_id = this.currentInfo.task_id || this.currentInfo.taskId;
      rData.relation_name = nodeData.label;
      rData.doc_id = this.currentInfo.doc_id;
      rData.source_id = rData.source;
      rData.target_id = rData.target;

      this.$emit('confirmChangeRelation', this.dataInfo.relation, rData, this.relationDialog.batSelect);

      this.relationDialog.visible = false;
    },
    //更新数据标签显示
    updateContentArea() {
      //生成内容数组
      this.group = [];
      let _self = this;
      // console.log(this.dataInfo, 'this.dataInfo');
      if (this.dataInfo.content && this.dataInfo.content.map) {
        _self.group = this.dataInfo.content.map(item => {
          item = {
            key: Math.random(),
            content: item,
            labels: [],
          };
          return item;
        });
      }
      //将标签按content数组进行分组
      let arr = this.dataInfo.labels;
      for (let i = 0; i < arr.length; i++) {
        arr[i].id = arr[i].id || i;
        arr[i].pIndex = i;
        var index = arr[i].group;
        if (this.group[index] && this.group[index].labels) {
          this.group[index].labels.push(arr[i]);
        }
      }

      //添加content内容标签信息
      this.group = this.group.map(item => {
        item.html = this.addSpanByData(item.labels, item.content);
        return item;
      });

      // this.$forceUpdate();
      //更新关系节点和边数据
      setTimeout(() => {
        _self.updateSvgItem();
        _self.initSpanEvent();
      }, 150);
      this.highlightSearchMode = false;
    },
    //初始化标签事件
    initSpanEvent() {
      this.$nextTick(function () {
        var _self = this;
        //清除事件绑定
        $(this.$refs.labelToolArea)
          .find('.opSpanInfoArea .removeSpanBtn')
          .off('click');
        $(this.$refs.labelToolArea)
          .find('.opSpanInfoArea .editSpanBtn')
          .off('click');
        $(this.$refs.labelToolArea)
          .find('.opSpanInfoArea .addCommentsBtn')
          .off('click');
        $(this.$refs.labelToolArea)
          .find('.spanItem .selectText')
          .off('dragstart');
        $(this.$refs.labelToolArea)
          .find('.spanItem .selectText')
          .off('drop');
        $(this.$refs.labelToolArea)
          .find('.spanItem .selectText')
          .off('dragover');
        $(this.$refs.labelToolArea)
          .find('.spanInfoArea')
          .off('click');
        $(this.$refs.labelToolArea)
          .find('.spanItem')
          .off('click');

        if (this.mode === 'view') {
          return false;
        }

        $(this.$refs.labelToolArea)
          .find('.opSpanInfoArea .removeSpanBtn')
          .on('click', function () {
            var index = $(this).attr('_index');
            var flag = $(this.parentNode.parentNode.parentNode).hasClass(
              'lineLabelList'
            );
            if (!flag) {
              var nodeData = _self.dataInfo.labels[index];
              var ret = _self.findRelation(nodeData.id);
              if (ret !== -1) {
                _self.$nextTick(() => {
                  _self.$message('需要先删除该标签上的连线。');
                });
                return false;
              }
            }
            // var d = _self.dataInfo.labels[index];
            _self
              .$confirm('确定要删除吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              })
              .then(() => {
                //将标签数据备份
                let d = _self.lineLabels[index];
                _self.opBackupData();
                _self.$emit("confirmDeleteLine", d);
              });
            return false;
          });

        $(this.$refs.labelToolArea)
          .find('.opSpanInfoArea input')
          .off('click');
        $(this.$refs.labelToolArea)
          .find('.opSpanInfoArea input')
          .on('click', function (e) {
            e.stopPropagation();
          });
        $(this.$refs.labelToolArea)
          .find('.opSpanInfoArea .setBaseOp input')
          .off('change');
        $(this.$refs.labelToolArea)
          .find('.opSpanInfoArea .setBaseOp input')
          .on('change', function (e) {
            var _index = $(this).attr('_index');
            var _type = $(this).attr('_type');

            var base = this.checked ? 1 : 0;
            if (_type === 'relation') {
              var rItem = _self.dataInfo.relation[_index];
              _self.$emit("setRelationBase", rItem);
            } else {
              var labelItem = _self.dataInfo.labels[_index];
              _self.$emit("setLabelBase", labelItem);
            }
          });

        $(this.$refs.labelToolArea)
          .find('.opSpanInfoArea .editSpanBtn')
          .on('click', function () {
            var type = $(this)
              .parent()
              .attr('type');
            let _index = $(this).attr('_index');
            if (type === 'line') {
              _self.relationDialog.type = 'edit';
              _self.relationDialog.data = _self.dataInfo.relation[_index];
              _self.updateRelationDialog();
              _self.relationDialog.type = 'edit';
              _self.relationDialog.visible = true;
              _self.relationDialog.dialogObj.title = '编辑标签连线';
            } else {
              _self.labelDialog.visible = true;
              _self.labelDialog.type = 'edit';
              _self.labelDialog.data = _self.dataInfo.labels[_index];
              _self.labelDialog.data._index = _index;
              _self.labelDialog.dialogObj.title = '编辑标签(属性、实体)';
              _self.updateLabelDialog();
            }
            return false;
          });

        $(this.$refs.labelToolArea)
          .find('.opSpanInfoArea .addCommentsBtn')
          .on('click', function () {
            var index = $(this).attr('_index');
            var label = _self.dataInfo.labels[index];
            _self.commentsOption.flag = 1;
            _self.addCommentItem(label.id, '', 'node');
            return false;
          });

        $(this.$refs.labelToolArea)
          .find('.spanItem .selectText')
          .on('dragstart', function (e) {
            _self.currentDrag = e.currentTarget;
          });

        $(this.$refs.labelToolArea)
          .find('.spanItem .selectText')
          .on('drop', function (e) {
            e.preventDefault();
            var source = _self.currentDrag.parentElement.id;
            var sIndex = $(_self.currentDrag.parentElement).attr('_index');
            var tIndex = $(e.currentTarget.parentElement).attr('_index');
            var sNode = _self.dataInfo.labels[sIndex];
            var tNode = _self.dataInfo.labels[tIndex];
            var target = e.currentTarget.parentElement.id;
            var rIndex = _self.findRelation(source, target);
            if (rIndex === -1 && sNode.id !== tNode.id) {
              _self.relationDialog.data = {
                source: sNode.id,
                target: tNode.id,
                source_name: sNode.text,
                target_name: tNode.text,
                // 任务管理里边的参数
                source_index: Math.max(sNode.index + 1, 0),
                target_index: Math.max(tNode.index + 1, 0),
                source_offset: sNode.offset,
                target_offset: tNode.offset,
                source_type: sNode.entity_name,
                target_type: tNode.type_name ?
                  tNode.type_name : tNode.entity_name,
              };
              var ret = _self.updateRelationDialog();
              if (ret) {
                _self.relationDialog.visible = true;
                _self.relationDialog.type = 'add';
                _self.relationDialog.dialogObj.title = '设置标签连线';
              }
            }
          });

        $(this.$refs.labelToolArea)
          .find('.spanItem .selectText')
          .on('dragover ', function (e) {
            e.preventDefault();
          });

        $(this.$refs.labelToolArea)
          .find('.spanInfoArea')
          .on('click', function () {
            var active = $(this).attr('active');
            $(_self.$refs.labelToolArea)
              .find('.spanInfoArea[active=true]')
              .attr('active', false);
            if (active === 'true' || active === true) {
              $(this).attr('active', false);
            } else {
              $(this).attr('active', true);
            }
          });

        $(this.$refs.labelToolArea)
          .find('.spanItem')
          .on('click', function () {});
      });
    },
    //添加标签连线
    addRelationData(rData) {
      rData = {
        ...rData
      };
      rData.id = rData._id;
      this.removeItem(this.dataInfo.relation, rData.id);
      this.dataInfo.relation.push(rData);
    },
    //调校标签连线的起始坐标
    adustNodePosition(elem) {
      var pos = {
        x: 50,
        y: 50,
      };
      var tRect = elem.getBoundingClientRect();
      var pRect = $(this.$refs.labelToolArea)
        .find('.canvasItem')[0]
        .getBoundingClientRect();
      pos.x = tRect.x - pRect.x;
      pos.y = tRect.y - pRect.y;
      return pos;
    },
    //生成连线参数
    produceLinesParams() {
      var ret = [];
      var arr = this.dataInfo.relation || [];

      this.lineLabels = [];
      for (var i = 0; i < arr.length; i++) {
        var d = arr[i];
        var item = {
          type: 'line',
          arrow: true,
          data: d,
          shape: [],
        };
        // 连线图形的参数;
        var shape = item.shape;
        var elem = $(this.$refs.labelToolArea).find(
          `.spanItem[id='${d.source}']`
        )[0];
        if (!elem) {
          continue;
        }
        var pos = this.adustNodePosition(elem);
        shape.push(pos);
        elem = $(this.$refs.labelToolArea).find(
          `.spanItem[id='${d.target}']`
        )[0];
        if (!elem) {
          continue;
        }

        pos = this.adustNodePosition(elem);
        shape.push(pos);

        //贝塞尔线的控制点坐标
        var cPos = {
          x: (shape[0].x + shape[1].x) / 3 + 10,
          y: shape[1].y + 40,
        };
        if (
          Math.abs(shape[1].x - shape[0].x) < Math.abs(shape[1].y - shape[0].y)
        ) {
          cPos = {
            x: shape[1].x + 40,
            y: (shape[0].y + shape[1].y) / 3 + 10,
          };
          if (shape[1].y > shape[0].y) {
            cPos.x = shape[1].x - 40;
          }
        } else {
          if (shape[1].x > shape[0].x) {
            cPos.y = shape[1].y - 40;
          }
        }

        shape.push(cPos);
        ret.push(item);

      }
      return ret;
    },
    //初始化SVG对象
    initSvgItem() {
      this.svgItem = this.$refs.canvasItem;
      this.svgItem.querySelector('.pathGroup').innerHTML = '';
      this.svgItem.querySelector('.textGroup').innerHTML = '';
      this.svgItem.querySelector('.commentsGroup').innerHTML = '';
    },
    //更新关系线(svg元素)
    updateSvgItem() {
      this.initSvgItem();
      //更新标签连线
      this.updatelabelLine();
      //更新批注连线
      this.updateCommentList();
    },
    //鼠标悬浮在连线的标签上时，高亮显示连线
    mouseoverLineItem(e) {
      var index = $(e.currentTarget).attr('_index');
      var rData = this.lineLabels[index];
      var selector = $(this.$refs.labelToolArea).find('#path' + rData.id);
      selector.css('stroke', '#52c41a');
      selector.attr('marker-end', 'url(#markerArrow2)');
    },
    //鼠标离开连线的标签上时，高亮显示连线
    mouseleaveLineItem(e) {
      var index = $(e.currentTarget).attr('_index');
      var rData = this.lineLabels[index];
      var selector = $(this.$refs.labelToolArea).find('#path' + rData.id);
      selector.css('stroke', '#91D5FF');
      selector.attr('marker-end', 'url(#markerArrow)');
    },
    //更新标签连线
    updatelabelLine() {
      this.svgItem.querySelector('.pathGroup').innerHTML = '';
      this.svgItem.querySelector('.textGroup').innerHTML = '';
      let arr = this.produceLinesParams();
      for (let i = 0; i < arr.length; i++) {
        let shape = arr[i].shape;
        let pathData = `M${shape[0].x},${shape[0].y}Q${shape[2].x},${shape[2].y},${shape[1].x},${shape[1].y}`;
        let path = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path'
        );
        let pId = arr[i].data.id;
        path.setAttribute('d', pathData);
        path.setAttribute(
          'style',
          'stroke-width:1; stroke:#91D5FF; fill: none'
        );
        path.setAttribute('marker-end', 'url(#markerArrow)');

        //取消标签高亮或关系高亮效果
        $(this.$refs.labelToolArea)
          .find('.spanItem .selectText')
          .attr('highlight', false);
        $(this.$refs.labelToolArea)
          .find('.spanItem')
          .removeClass('highlightItem');
        if (
          this.currentLabelLine &&
          this.currentLabelLine.source === arr[i].data.source &&
          this.currentLabelLine.target === arr[i].data.target
        ) {
          path.setAttribute(
            'style',
            'stroke-width:2; stroke:#91D5FF; fill: none'
          );
          path.setAttribute('marker-end', 'url(#markerArrow)');

          let sid = this.currentLabelLine.source;
          let tid = this.currentLabelLine.target;
          $(this.$refs.labelToolArea)
            .find(`.spanItem#${sid} .selectText`)
            .attr('highlight', true);
          $(this.$refs.labelToolArea)
            .find(`.spanItem#${tid} .selectText`)
            .attr('highlight', true);
        }

        this.svgItem.querySelector('.pathGroup').appendChild(path);
        path.setAttribute('id', 'path' + pId);

        //创建text对象，不实际显示信息，仅做html连线标签定位
        let text = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'text'
        );

        if (
          Math.abs(shape[1].x - shape[0].x) > Math.abs(shape[1].y - shape[0].y)
        ) {
          text.setAttribute('x', Math.abs((shape[1].x - shape[0].x) / 2));
        } else {
          text.setAttribute('x', Math.abs((shape[1].y - shape[0].y) / 2));
        }

        text.setAttribute('index', i);
        let textPath = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'textPath'
        );
        textPath.setAttribute('href', '#path' + pId);
        textPath.innerHTML = '.';
        text.appendChild(textPath);
        this.svgItem.querySelector('.textGroup').appendChild(text);
        arr[i].textItem = text;
      }
      //更新标签连线的文本坐标
      var _self = this;
      setTimeout(function () {
        _self.updateLineLabels(arr);
      }, 50);
    },
    //更新批注线
    updateCommentLine() {
      var tRect = $(this.$refs.labelToolArea)
        .find('.contentContainer')[0]
        .getBoundingClientRect();
      $(this.$refs.labelToolArea)
        .find(`.contentItem .spanItem>.selectText`)
        .attr('commentHighlight', false);
      for (let i = 0; i < this.commentsOption.data.length; i++) {
        var cItem = this.commentsOption.data[i];
        if (cItem.current) {
          this.commentsOption.current = i;
        }
        if (i !== this.commentsOption.current) {
          continue;
        }
        var path = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path'
        );
        path.setAttribute(
          'style',
          'stroke-width:0.5; stroke: #ff4d4f; fill: none'
        );
        let item = this.commentsOption.data[i];
        let labelItem = $(this.$refs.labelToolArea).find(
          `.contentItem .spanItem[id='${item.id}']>.selectText`
        )[0];
        if (labelItem) {
          labelItem.setAttribute('commentHighlight', true);
          let rect = labelItem.getBoundingClientRect();
          var commentItem = $(this.$refs.labelToolArea)
            .find('.commentsItem')
            .eq(i)[0];
          if (commentItem) {
            let _rect = commentItem.getBoundingClientRect();
            var pos = [rect.right - tRect.x, rect.bottom - tRect.y];
            var _pos = [_rect.x - tRect.x, _rect.y - tRect.y];
            var pathData = `M${pos[0]},${pos[1]} L${pos[0] + 3},${pos[1] +
          3} H${tRect.width - 40} L${_pos[0] - 10}, ${_pos[1] + 25}`;
            path.setAttribute('d', pathData);
            this.svgItem.querySelector('.commentsGroup').appendChild(path);
          }
        }

      }
    },
    //更新批注列表
    updateCommentList(index) {
      if (typeof index !== 'undefined') {
        this.commentsOption.current = index;
      }
      if (!this.svgItem) {
        return false;
      }
      this.svgItem.querySelector('.commentsGroup').innerHTML = '';

      if (this.commentsOption.flag === 0) {
        return false;
      }

      var tArr = this.commentsOption.data;
      var _self = this;
      //对批注对象进行排序
      tArr.sort((b, a) => {
        a.group = $(this.$refs.labelToolArea)
          .find(`.contentItem #${a.id}`)
          .parent()
          .index();
        a.index = $(_self.$refs.labelToolArea)
          .find(`.contentItem #${a.id}`)
          .attr('index');
        b.group = $(_self.$refs.labelToolArea)
          .find(`.contentItem #${b.id}`)
          .parent()
          .index();
        b.index = $(_self.$refs.labelToolArea)
          .find(`.contentItem #${b.id}`)
          .attr('index');
        var ret = Number(b.group) - Number(a.group);
        if (ret === 0) {
          ret = Number(b.index) - Number(a.index);
        }
        return ret;
      });
      this.commentsOption.data = [];
      for (let i = 0; i < tArr.length; i++) {
        if (this.tMode !== 'check') {
          tArr[i].content = tArr[i].content.replace(/\n/g, '<br/>');
        }
        this.commentsOption.data.push(tArr[i]);
      }

      //更新批注线
      if (this.commentsOption.flag === 1) {
        this.$nextTick(() => {
          this.updateCommentLine();
        });
      }
    },
    //查找批注对象的索引
    findCommentById(id) {
      var ret = -1;
      var arr = this.commentsOption.data;
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].id === id) {
          ret = i;
          break;
        }
      }
      return ret;
    },
    //添加批注
    addCommentItem(id, content, type) {
      if (!id) {
        return false;
      }
      //清除批注的current标记。
      this.commentsOption.data = this.commentsOption.data.map(item => {
        delete item.current;
        return item;
      });

      var tIndex = this.findCommentById(id);
      if (tIndex === -1) {
        //将标签数据备份
        this.opBackupData();
        //添加带current标记的批注对象
        var item = {
          id: id,
          type: type || 'node',
          current: true,
          content: content || '',
          author: '',
        };
        this.commentsOption.data.push(item);
        this.$emit('remark-add', this.commentsOption.data, item);
      } else {
        this.commentsOption.data[tIndex].current = true;
      }
      this.commentsOption.current = -1;
      this.updateCommentList();
    },
    //更新标签连线的文本提示
    updateLineLabels(arr) {
      this.lineLabels = [];
      // var tArr = [];
      for (let i = 0; i < arr.length; i++) {
        var d = arr[i].data;
        // d.key = 'link-' + new Date().getTime();
        var box = arr[i].textItem.getBBox();
        d.style = {
          left: box.x - 40 + 'px',
          top: box.y + 'px',
        };
        if (this.comments) {
          d.style.top = box.y - 5 + 'px';
        }
        if (
          this.currentLabelLine &&
          d.source === this.currentLabelLine.source &&
          d.target === this.currentLabelLine.target
        ) {
          d.highlight = true;
        } else {
          d.highlight = false;
        }
        this.lineLabels.push(d);
        // this.$set(this.lineLabels, i, d);
      }
      this.lineLabels = this.lineLabels.concat([]);
      this.initSpanEvent();
    },
    mouseoverCommentsItem(e) {
      var index = $(e.currentTarget).attr('_index');
      //清除批注的current标注。
      this.commentsOption.data = this.commentsOption.data.map(item => {
        delete item.current;
        return item;
      });
      //更新批注列表
      this.updateCommentList(Number(index));
    },
    //获取选中文本的偏移量
    getSelectTextOffset(txt) {
      var lastNode = txt.baseNode.previousElementSibling;
      var pos = Math.min(txt.baseOffset, txt.focusOffset);
      var t2 = Math.max(txt.baseOffset, txt.focusOffset);
      let str = txt.baseNode.data.slice(pos, t2); //选中文本
      if (lastNode) {
        var tPos = Number(lastNode.getAttribute('offset'));
        var text = lastNode.innerText;
        var tText = text.split('\n')[0];
        pos += tPos + tText.length;
      }
      let ret = {
        text: str,
        type: txt.type,
        offset: pos,
        id: new Date().getTime() + '',
      };
      return ret;
    },
    // 改标签内容和样式
    addSpanByData(data, text) {
      if (!data || data.length === 0 || typeof text !== 'string') {
        return text;
      }
      data.sort(function (a, b) {
        return a.offset - b.offset;
      });
      var rStr = text.slice(0, data[0].offset);
      for (var i = 0; i < data.length; i++) {
        var item = data[i];
        if (!item.text) {
          continue;
        }
        var tStr = `<span style="position: relative;" type="${item.type}" _index=${item.pIndex} class="spanItem" index=${i} id="${item.id}" title="${item.label}" offset=${item.offset}><span draggable='true' title="${item.text}"  class="selectText">${item.text}</span> 
                <div class="spanInfoArea" style=""><span class="spanText" >${item.label}</span>
                <span mode='${this.tMode}'  class="opSpanInfoArea">
                  <svg title="编辑标注信息" _index=${item.pIndex} index=${i} class="editSpanBtn" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" style="margin-right: 5px;"><path fill="currentColor" d="M832 512a32 32 0 1 1 64 0v352a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V160a32 32 0 0 1 32-32h352a32 32 0 0 1 0 64H192v640h640V512z"></path><path fill="currentColor" d="m469.952 554.24 52.8-7.552L847.104 222.4a32 32 0 1 0-45.248-45.248L477.44 501.44l-7.552 52.8zm422.4-422.4a96 96 0 0 1 0 135.808l-331.84 331.84a32 32 0 0 1-18.112 9.088L436.8 623.68a32 32 0 0 1-36.224-36.224l15.104-105.6a32 32 0 0 1 9.024-18.112l331.904-331.84a96 96 0 0 1 135.744 0z"></path></svg>
                  <svg title="删除标注信息"  _index=${item.pIndex} index=${i} class="removeSpanBtn"  viewBox="0 0 1024 1024"  xmlns="http://www.w3.org/2000/svg" ><path fill="currentColor" d="M160 256H96a32 32 0 0 1 0-64h256V95.936a32 32 0 0 1 32-32h256a32 32 0 0 1 32 32V192h256a32 32 0 1 1 0 64h-64v672a32 32 0 0 1-32 32H192a32 32 0 0 1-32-32V256zm448-64v-64H416v64h192zM224 896h576V256H224v640zm192-128a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32zm192 0a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32z"></path></svg> </span></div></span>`;
        if (this.tMode === 'checkTwo') {
          //审核结对标注结果，可以支持设置基准
          var checkFlag = '';
          if (item.base === '1' || item.base === 1) {
            checkFlag = 'checked';
          }
          tStr = `<span style="position: relative;" type="${
            item.type
          }" _index=${item.pIndex} class="spanItem" index=${i} id="${
            item.id
          }" title="${item.label}" offset=${
            item.offset
          }><span draggable='true' class="selectText"  title="${item.text}" >${
            item.text
          }</span> 
                <div class="spanInfoArea" baseFlag="${item.base ||
                  0}" sameFlag="${
            item._same
          }" style=""><span class="spanText" >${item.label}</span>
                <span mode='${
                  this.tMode
                }' class="opSpanInfoArea"><Edit title="编辑标注信息" _index=${
            item.pIndex
          } index=${i} class="editSpanBtn"></Edit><Delete title="删除标注信息" class="removeSpanBtn" _index=${
            item.pIndex
          } index=${i} style="margin: 0 2px;"></Delete> <span class='setBaseOp'><input _type='node' _index=${
            item.pIndex
          } ${checkFlag} type='checkbox'>基准</span></span></div></span>`;
        } else if (this.tMode === 'check') {
          //审核模式时支持批注
          tStr = `<span style="position: relative;" type="${item.type}" _index=${item.pIndex} class="spanItem" index=${i} id="${item.id}" title="${item.label}" offset=${item.offset}><span draggable='true'  title="${item.text}"  class="selectText">${item.text}</span> 
                <div class="spanInfoArea" style=""><span class="spanText" >${item.label}</span>
                <span mode='${this.tMode}' class="opSpanInfoArea"><Edit title="编辑标注信息" _index=${item.pIndex} index=${i} class="iconfont iconatlas_edit_icon editSpanBtn"></Edit> <EditPen title="添加批注" class="addCommentsBtn iconfont iconbiaoji" _index=${item.pIndex} index=${i}></EditPen><Delete title="删除标注信息" class="removeSpanBtn" _index=${item.pIndex} index=${i} style="margin: 0 2px;"></Delete> </span></div></span>`;
        }
        rStr += tStr;
        if (i < data.length - 1) {
          rStr += text.slice(
            data[i].offset + data[i].text.length,
            data[i + 1].offset
          );
        } else {
          rStr += text.slice(data[i].offset + data[i].text.length);
        }
      }
      return rStr;
    },
    //高亮查询文本
    highlightSearchText(text) {
      this.clearHighligtItems();
      this.$nextTick(() => {
        this.highlightSearchMode = true;
        let items = $(this.$refs.labelToolArea).find('.contentItem');
        let bol = items.text().includes(text);
        if (!bol) {
          this.$message({
            message: '请输入文章中存在的关键词！',
            type: 'warning',
          });
        } else {
          for (let i = 0; i < items.length; i++) {
            var cNodes = items[i].childNodes;
            for (let j = 0; j < cNodes.length; j++) {
              let node = cNodes[j];
              if (node.nodeName === '#text') {
                var tNode = document.createElement('span');
                var reg = new RegExp(text, 'gi');
                tNode.innerHTML = node.textContent.replace(
                  reg,
                  `<i class="searchHighlightText">${text}</i>`
                );
                node.after(tNode);
                node.remove();
              }
            }
          }
        }
      });
    },
    removeSearchHighlight() {
      if (this.highlightSearchMode) {
        this.updateContentArea();
      }
    },
    //高亮显示筛选的连线
    highlightLineById(sid, tid) {
      this.currentLabelLine = {
        source: sid,
        target: tid,
      };
      this.updateContentArea();
    },
    //清空高亮对象
    clearHighligtItems() {
      this.currentLabelLine = {};
      $(this.$refs.labelToolArea)
        .find('.spanItem')
        .removeClass('highlightItem');
      this.updatelabelLine();
    },
    // 高亮显示筛选的标签
    highlightLabelsById(id) {
      if (id && id.constructor.name === 'String') {
        id = [id];
      }
      //清空其他高亮对象
      this.clearHighligtItems();
      if (id && id.constructor.name === 'Array') {
        for (let i = 0; i < id.length; i++) {
          let selector = $(this.$refs.labelToolArea).find(
            `.spanItem[id='${id[i]}']`
          );
          selector.addClass('highlightItem');
        }
      }
    },
    // 高亮显示筛选的标签
    highlightLabelsByItem(item) {
      var id = [];
      var elems = document.querySelectorAll(
        `[title=${item.entity_name}]>[title=${item.node_name}]`
      );
      for (var i = 0; i < elems.length; i++) {
        var tElem = elems[i].parentNode;
        id.push(tElem.id);
      }
      this.highlightLabelsById(id);
    },

  },
  props: {
    markData: Object,
    config: Object
  }
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.labelToolArea {
  position: relative;
  float: left;
  height: 100%;
  width: 100%;
  padding-top: 48px;
}

.labelToolArea[toolBar='false'] {
  padding-top: 0px;
}

.labelToolArea[toolBar='false'] .labelOptionArea {
  display: none;
}

.contentArea {
  position: relative;
  float: left;
  height: 100%;
  width: 100%;
  overflow-y: auto !important;
  box-sizing: border-box;
  scrollbar-color: #ddd #fff;
  scrollbar-width: thin;
  text-align: left;
}

.mainContentArea {
  width: 100%;
  height: auto;
  min-height: 100%;
  position: relative;
  float: left;
  background-color: rgb(245, 245, 245);
}

.mainContentArea[flag='1'],
.contentArea[flag='1'] {
  width: calc(100% + 380px);
}

.labelOptionArea,
.commentListTitle {
  position: absolute;
  width: 100%;
  top: 0px;
  background: rgba(24, 144, 255, 0.1);
  border: 1px solid rgba(24, 144, 255, 0.1);
  box-sizing: border-box;
  backdrop-filter: blur(45px);
  border-radius: 2px;
  height: 48px;
  line-height: 48px;
  z-index: 1;
  text-align: left;
}

.commentListTitle {
  width: 370px;
  padding-left: 10px;
  right: -382px;
  display: none;
}

.commentListTitle>svg {
  width: 18px;
  vertical-align: middle;
  margin-right: 5px;
  font-size: 14px;
}

.commentListTitle[flag='1'] {
  display: inline-block;
}

.contentContainer {
  width: 100%;
  min-height: 100%;
  height: auto;
  position: relative;
  background: #fff;
  padding-left: 20px;
  float: left;
}

.contentContainer[flag='1'] {
  width: calc(100% - 363px);
}

.relationCanvasItem,
.canvasItemArea {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  z-index: 0;
  height: 100%;
  overflow: hidden;
}

.docContentItem {
  padding-left: 10px;
  position: relative;
  z-index: 1;
  height: auto;
  min-height: 400px;
  width: 100%;
  line-height: 5;
  border-radius: 5px;
  white-space: pre-line;
  counter-reset: section;
  counter-increment: section;
  float: left;
}


.docContentItem[switchFlag='1'] :deep(.spanInfoArea)[sameFlag='0'] {
  display: none !important;
}

.docContentItem[switchFlag='2'] :deep(.spanInfoArea)[sameFlag='1'] {
  display: none !important;
}

:deep(.spanInfoArea)[sameFlag='0'] .setBaseOp {
  display: inline-block !important;
}

:deep(.opSpanInfoArea)[mode='check'] {
  width: 70px;
}

:deep(.opSpanInfoArea) span {
  display: inline-block;
  box-sizing: border-box;
  height: 20px;
  line-height: 20px;
}

:deep(span.opSpanInfoArea)>svg {
  display: inline-block;
  margin-top: 4px;
  width: 13px;
  height: 13px;
  cursor: pointer;
}

.lineLabelList {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 0px;
  height: 0px;
  z-index: 5;
}

.commentsListArea {
  position: relative;
  float: right;
  padding-left: 5px;
  padding-top: 15px;
  padding-bottom: 15px;
  width: 350px;
  height: 100%;
  background-color: #fff;
  overflow: auto;
  z-index: 1;
}

.contentItem {
  position: relative;
  margin-top: 20px;
  padding-right: 80px;
  padding-left: 20px;
  font-style: normal;
  font-weight: normal;
  word-break: break-all;
  font-size: 14px;
  line-height: 56px;
}

.contentItem::before {
  content: attr(index);
  position: absolute;
  left: -15px;
  top: 0px;
  color: #999;
}

.contentItem i {
  /* color: red; */
  font-style: normal;
  /* font-weight: 900; */
  color: #ffffff;
  font-weight: normal;
  background: #1890ff;
}

.labelOptionArea {
  padding-left: 0px;
  text-align: left;
  width: calc(100% - 12px);
}

.labelOptionArea .buttonArea {
  display: inline-block;
  line-height: 48px;
  height: 48px;
}

.labelOptionArea .opBtnItem {
  margin: 0px 15px;
  cursor: pointer;
  font-size: 12px;
  position: relative;
  color: rgba(0, 0, 0, 0.85);
  vertical-align: top;
}

.labelOptionArea .opBtnItem svg {
  width: 16px;
  height: 16px;
  padding-right: 3px;
  vertical-align: middle;
}

.docContentItem :deep(.spanItem) {
  box-sizing: border-box;
  border-radius: 2px;
  display: inline-block;
  line-height: 20px;
  margin: 0 5px;
  min-width: 60px;
  cursor: pointer;
  text-align: center;
  position: relative;
  vertical-align: middle;
  max-width: 100%;
}

.spanInfoArea:hover,
.selectText:hover {
  border: 1px solid #52c41a;
}

.contentContainer[flag='1'] .selectText[commenthighlight='true'] {
  border: 1px solid #ffa39e;
  color: #ff4d4f;
}

:deep(.spanItem)[type='param'] .selectText {
  border: 1px solid #ffc53d;
}

:deep(.spanItem)[type='param'] .spanInfoArea {
  border: 1px solid #ffc53d;
  color: #ffc53d;
  background: #fffbe6;
}

:deep(.selectText)[commenthighlight='true']:hover {
  border: 1px solid #52c41a;
}

:deep(.spanItem).highlightItem {
  background-color: rgb(64, 158, 255);
  color: #fff;
}

:deep(.spanInfoArea)[highlight='true'],
:deep(.selectText)[highlight='true'] {
  background-color: rgb(64, 158, 255);
  color: #fff;
}

.commentsItem {
  float: left;
  position: relative;
  border: solid 1px #f2f2f2;
  border-radius: 5px;
  width: calc(100% - 10px);

  padding: 10px;
  padding-right: 20px;
  margin-top: 10px;
  box-shadow: 1px 1px 1px #666;
}

.commentsItem .commentsText {
  max-height: 100px;
  display: inline-block;
  width: 100%;
  word-break: break-all;
  overflow: auto;
}

.commentsItem .removeCommentsBtn {
  cursor: pointer;
  color: #aaa;
  display: none;
  position: absolute;
  right: 5px;
  top: 5px;
}

.commentsItem:hover .removeCommentsBtn {
  color: #666;
  display: inline-block;
}

.el-radio.is-bordered {
  margin-left: 0px !important;
  margin-right: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  float: left;
}

:deep(.el-dialog__body) {
  padding: 20px 20px !important;
}

.docContentItem :deep(.spanInfoArea) {
  position: absolute;
  top: -25px;
  left: 0px;
  width: calc(100% + 2px);
  min-width: 40px;
  font-family: OPPOSans;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 20px;
  height: 20px;
  display: inline-block;
  text-align: center;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  box-sizing: border-box;
  border-radius: 2px;
  user-select: none;
  color: #1890ff;
}

:deep(.spanItem) .opSpanInfoArea i:nth-child(2) {
  margin: 0px 5px !important;
}

:deep(.opSpanInfoArea) i:hover {
  color: #1890ff !important;
}

.lineLabelList :deep(.spanInfoArea) {
  width: auto !important;
  max-width: 250px;
}

:deep(.spanInfoArea)>.spanText {
  width: 100%;
  display: inline-block;
  cursor: pointer;
  margin-top: -1px;
  overflow: hidden;
  padding: 0px 3px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.opSpanInfoArea) {
  position: absolute;
  display: none;
  background: rgba(34, 38, 44, 0.45);
  box-sizing: border-box;
  backdrop-filter: blur(8px);
  border-radius: 2px;
  color: #fff;
  left: calc(100% + 6px);
  top: -1px;
  width: 50px;
  z-index: 555;
  padding: 0px 5px;
  line-height: 20px;
  height: 20px;
  user-select: none;
  white-space: nowrap; 
}

.lineLabelList .opSpanInfoArea[mode='check'] .setBaseOp,
.lineLabelList .opSpanInfoArea[mode='do'] .setBaseOp {
  display: none;
}

.lineLabelList .opSpanInfoArea[mode='check'] {
  width: 50px;
}

:deep(.opSpanInfoArea)[mode='checkTwo'],
.lineLabelList .opSpanInfoArea[mode='checkTwo'] {
  width: 50px;
}

.opSpanInfoArea[mode='checkTwo'] input {
  vertical-align: middle;
}

.lineLabelList .opSpanInfoArea {
  width: 50px;
}

:deep(.opSpanInfoArea)::before {
  position: absolute;
  top: 5px;
  left: -10px;
  content: '';
  width: 0px;
  height: 0px;
  border: 5px solid transparent;
  border-right-color: rgba(34, 38, 44, 0.45);
  display: inline-block;
}

:deep(.selectText) {
  border: 1px solid #91d5ff;
  /* background: #e6f7ff; */
  box-sizing: border-box;
  border-radius: 2px;
  display: inline-block;
  line-height: 20px;
  min-width: 60px;
  cursor: pointer;
  padding: 0px 3px;
  max-width: 100%;
  text-align: center;
  user-select: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topFormArea .el-form-item {
  margin-bottom: 0px !important;
}

:deep(.spanInfoArea)[active='true'] .opSpanInfoArea,
.lineLabelItem:hover .opSpanInfoArea {
  display: inline-block;
}

.highlightText {
  background: #1890ff;
  backdrop-filter: blur(30px);
  font-style: normal;
  color: #ffffff;
  border-radius: 2px;
}

.checkGroup {
  float: right;
  display: inline-block;
  margin-right: 5px;
}

.checkGroup>.el-checkbox {
  font-size: 12px !important;
  margin-right: 5px !important;
  transform: scale(0.9);
  transform-origin: center center;
}

.checkGroup .el-checkbox__label {
  font-size: 12px !important;
  vertical-align: middle;
  padding-left: 5px;
}

.checkGroup .el-checkbox__inner {
  background: #bae7ff;
}

.checkGroup i {
  margin-right: 5px;
  font-size: 16px;
  vertical-align: middle;
  color: #05146e;
}

.dialogContentArea {
  position: relative;
  height: auto;
  width: 100%;
}

.editLabelArea,
.editRelationArea {
  float: left;
  position: relative;
  width: 100%;
  height: auto;
  border: 1px solid #d9d9d9;
  box-sizing: border-box;
  padding: 10px 0px;
  border-radius: 2px;
}

.contentTopArea {
  font-size: 14px;
  margin: 0px;
  width: 100%;
  float: left;
  padding-left: 10px;
  padding-bottom: 10px;
  box-shadow: inset 0px -1px 0px #f0f0f0;
}

.editRelationArea .contentTopArea {
  padding-top: 30px;
  box-shadow: none;
}

.editRelationArea {
  border: none;
}

.contentLeftArea,
.contentRightArea,
.relationContentArea {
  width: 50%;
  position: relative;
  display: inline-block;
  float: left;
}

.relationContentArea {
  width: 100%;
}

.contentRightArea .el-tree {
  position: relative;
  overflow: auto;
  max-height: 200px !important;
}

.el-icon-caret-right {
  margin-left: -13px !important;
}

.extraDataArea {
  position: relative;
  float: left;
  width: 100%;
  margin-top: 30px;
}

.extraDataArea>h5 {
  margin-bottom: 10px;
}

.relationLabelArea {
  position: relative;
  width: auto;
  margin: 0px 20px;
}

.relationLabelArea img {
  width: 200px;
  height: 5px;
}

.relationLabelArea .relationLabel {
  position: absolute;
  display: inline-block;
  width: 200px;
  text-align: center;
  left: 0px;
  top: -20px;
  font-size: 12px;
  font-weight: normal;
}

.contentTopArea .relationLabelArea .relationLabel::before {
  content: '\5C5E\6027';
}

.contentTopArea[type='relation'] .relationLabelArea .relationLabel::before {
  content: '\5173\7CFB';
}

.masterName,
.slaveName {
  position: relative;
  padding: 10px 0px;
  display: inline-block;
  text-align: center;
}

.masterName>span,
.slaveName>span {
  display: inline-block;
  min-width: 50px;
  max-width: 120px;
}

.commentsInfo {
  color: #999;
  margin-top: 5px;
  text-align: right;
}

.commentsInfo .nameItem,
.commentsInfo .timeItem {
  font-size: 12px;
  display: inline-block;
  vertical-align: middle;
}

.commentsInfo .timeItem {
  margin-left: 10px;
}

.contentTopArea .masterName::before {
  content: '\5B9E\4F53';
}

.contentTopArea .slaveName::before {
  content: '\5C5E\6027';
}

.contentTopArea[type='relation'] .masterName::before {
  content: '\4E3B\4F53';
}

.contentTopArea[type='relation'] .slaveName::before {
  content: '\5BA2\4F53';
}

.contentLeftArea>h5 {
  margin-bottom: 10px;
}

.masterName::before,
.slaveName::before {
  display: inline-block;
  padding: 3px;
  background: #1890ff;
  border-radius: 2px;
  color: #fff;
  position: absolute;
  left: calc(50% - 22px);
  top: -25px;
  font-size: 12px;
  width: 40px;
  text-align: center;
}

.setBaseOp {
  font-size: 10px;
  vertical-align: middle;
  margin-top: -2px;
  transform: scale(0.9);
}

.setBaseOp input {
  transform: scale(1.15);
  display: inline-block;
}

.linkArrowIcon {
  width: 200px;
  height: 20px;
  display: inline-block;
}

i.searchHighlightText {
  display: inline-block;
  background: #1890ff !important;
  line-height: 18px;
  font-style: normal;
}

.switchTableBtn {
  cursor: pointer;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.emptyDataTips {
  text-align: center;
  font-size: 12px;
  color: #999;
}

.labelOptionArea .opBtnItem:first-child::after,
.labelOptionArea .opBtnItem:last-child::before {
  content: '';
  display: inline-block;
  width: 0px;
  height: 15px;
  position: absolute;
  right: -15px;
  top: 0px;
  border-right: solid 1px #999;
}

.labelOptionArea .opBtnItem:last-child:before {
  left: -15px;
}
</style>
