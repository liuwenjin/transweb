<template>
  <div class="portfolioContentArea" ref="portfolioContainer" :flag="flag">
    <div class="portfolioTileItem">{{ title }}</div>
    <div class="documentListArea" ref="documentListContainer">
      <slot v-if="documentList && documentList.length !== 0">
        <el-row :gutter="20">
          <el-col
            v-for="(item, index) in documentList"
            :key="index"
            :xs="24"
            :sm="documentList.length === 1 && !condition ? 24 : 12"
            :md="documentList.length === 1 && !condition ? 24 : 8"
            class="documentColItem"
          >
            <div
              class="grid-content documentCardItem"
              :style="{
                paddingLeft: item.price ? '' : '20px',
              }"
              @click="switchAppItem(item)"
            >
              <div class="documentLabelInfo">
                <slot v-if="item.price">
                  <span
                    class="priceSpanItem"
                    v-if="
                      !(
                        folderName &&
                        item.students &&
                        item.students.indexOf(folderName) !== -1
                      )
                    "
                    >{{ item.price || 0 }} 积分</span
                  >
                  <span class="priceSpanItem" v-else>{{
                    $t("purchasedTips")
                  }}</span>
                </slot>
                <span class="documentNameSpan">{{ item.name }}</span>
                <span class="appLabelSpan"
                  >{{ item.appOwner }} - {{ item.appLabel }}</span
                >
              </div>
              <div class="openDocumentIcon"><i class="bi bi-link"></i></div>
            </div>
          </el-col>
        </el-row>
        <el-button
          v-if="total > limit"
          text
          class="viewMoreBtn"
          type="primary"
          @click="viewMoreItems"
          >{{ $t("seeMore") }}</el-button
        >
      </slot>
      <el-empty :image-size="90" v-else></el-empty>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: webCpu.messages[lang].myPortfolio,
      currentModule: 0,
      flag: WebTool.adjustSize([false, false, true]),
      status: 1,
      limit: 6,
      total: 0,
      sort: -1,
      folderName: localStorage.folderName,
      publishedListApp: {
        url: "/plugins/elementVueItem/infoCardList.vue",
        className: "ElementVueItem",
        dsl: {
          url: webCpu.documentPrefix + "/user/getPublishedList",
          requestType: "get",
          query: {
            table: "pptItem",
            pageSize: 10,
            pageNo: 1,
            sort: -1,
          },
          dataFilter: function (d) {
            let ret = this.defaultData;
            ret.info = d.data.map((item) => {
              const date = new Date(item.time);
              const options = {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
              };

              const formatter = new Intl.DateTimeFormat("zh-CN", options);
              console.log(formatter.format(date));
              item.time = formatter.format(date);
              // let meta = agentMap[item.appName || "cardNotes"].meta;
               let pInfo =  {};
              item._price =
                (item.price || 0) + " " + webCpu.messages[lang].pointsUnit;
              if (item.publishInfo) {
                pInfo = JSON.parse(item.publishInfo || "{}");
                item.appOwner = pInfo.user;
              }
              item.appOwner =
                window.firstAgent === item.appAgent + ""
                  ? "Transweb"
                  : item.appOwner;
              item.avater = pInfo.avater || "/assets/images/logo.png";
              item.appLabel =
                item.appOwner  ? item.appOwner + " - " + (item.appLabel || item.appName) : (item.appLabel || item.appName);
              item.students = item.students || [];
              if (
                item.students &&
                item.students.indexOf(localStorage.folderName) !== -1
              ) {
                item._price = webCpu.messages[lang].purchasedTips;
              }
              ret.page = ret.page || {};
              ret.page.currentPage = d.current;
              ret.page.pageSize = d.pageSize;
              ret.page.total = d.total;
              return item;
            });
            let _self = this;
            this.methods.confirmSearchResult = function () {
              let value = this.filterOption.value;
              _self.query.condition = JSON.stringify({
                name: { $regex: value, $options: "i" },
              });
              webCpu.fresh(_self);
            };
            return ret;
          },

          style: {
            padding: "15px 20px",
          },
          data: {
            filterOption: {
              label: "名称",
              value: "",
              status: true,
              buttonText: "搜索",
              placeholder: "请输入名称进行搜索",
              style: {
                maxWidth: "300px",
              },
            },
            info: [],
            gutter: 20,
            span: WebTool.adjustSize([false, false, true]) ? 24 : 12,
            cardStyle: {
              border: "solid 1px #f3f3f3",
              background: "#f8f8f8",
              padding: "30px 20px 25px 40px",
              marginBottom: "10px",
            },
            optionMap: {
              _price: {
                class: "ellipsis",
                style: {
                  position: "absolute",
                  top: "-30px",
                  display: "inline-block",
                  fontSize: "10px",
                  left: "-80px",
                  padding: "2px 0px",
                  borderRadius: "3px",
                  textAlign: "left",
                  textIndent: "15px",
                  transform: "rotate(-15deg)",
                  color: "#999",
                  background: "#f0f0f0",
                  width: "200px",
                },
              },
              appLabel: {
                style: {
                  position: "absolute",
                  display: "inline-block",
                  fontSize: "10px",
                  textAlign: "right",
                  color: "#999",
                  width: "125px",
                  right: "-15px",
                  bottom: "-20px",
                },
              },
              name: {
                class: "ellipsis",
                style: {
                  position: "relative",
                  display: "inline-block",
                  width: "100%",
                  cursor: "pointer",
                },
              },
            },
            config: [
              {
                prop: "name",
                type: "text",
              },
              {
                prop: "appLabel",
                type: "text",
              },
              {
                prop: "avatar",
                type: "avatar",
              },
              {
                prop: "_price",
                type: "text",
              },
            ],
          },
          methods: {
            handleCurrentChange(v) {
              this._parent.query.pageNo = Number(v);
              webCpu.fresh(this._parent);
            },
            handleClickButton: function (d, config) {},
          },
        },
      },
      condition: {
        appName: "",
        appAgent: "",
        folderName: "",
        pageSize: 6,
        pageNo: 1,
      },
      dialogStyle: {
        background: "#fff",
        maxWidth: "1000px",
        width: "95%",
        maxHeight: "95%",
        boxShadow: "2px 2px 2px #999",
        borderRadius: "5px",
        borderTop: "solid 1px #ddd",
        borderLeft: "solid 1px #ddd",
        overflow: "hidden",
      },
      interface: {
        documentList: {
          url: webCpu.documentPrefix + "/user/getPublishedList",
          method: "get",
        },
        purchaseDocument: {
          url: "/user/purchaseDocument",
          method: "post",
        },
      },
      documentList: [],
      supportGap: "120px",
      lang: lang,
    };
  },
  mounted() {
    this.initAdapter();
    if (this.condition) {
      this.updateDocumentList();
    }
  },
  methods: {
    initAdapter() {
      var config = this.interface || {};
      this.adapter = webCpu.initAdapter(config);
      return this.adapter;
    },
    updateDocumentList() {
      this.condition.sort = this.sort;
      this.condition.pageSize = this.limit;
      this.adapter.documentList(this.condition, (res) => {
        if (res && res.data) {
          this.total = res.total;
          this.documentList = res.data.map((item) => {
            item.appOwner =
              window.firstAgent === item.appAgent + "" ? "Transweb" : item.appOwner;
            return item;
          });
        }
      });
    },
    switchAppItem(d) {
      if (!localStorage.logined || localStorage.logined === "false") {
        this.$message({
          message: this.$t("loginTips"),
          type: "warning",
        });
        let _self = this;
        openLoginDialog(document.body, function (tData) {
          if (tData) {
            _self.folderName = localStorage.folderName;
            _self.switchAppItem(d);
          }
        });
        return false;
      }
      if (
        (!d.publishStatus || d.publishStatus === "false") &&
        d.folderName !== this.folderName 
      ) {
        this.$message({
          message: this.$t("notPublishedTips"),
          type: "warning",
        });
        return false;
      }

      if (
        d.folderName + '' !== localStorage.folderName && localStorage.folderName !== (d.editorAgent + '') &&
        Number(d.price) &&
        !(
          d.students &&
          this.folderName &&
          d.students.indexOf(this.folderName) !== -1
        )
      ) {
        this.$confirm(
          this.$t("confirmBuyDocument", {
            points: d.price,
          }),
          this.$t("confirmDialogTitle"),
          {
            confirmButtonText: this.$t("confirmYes"),
            cancelButtonText: this.$t("confirmNo"),
            type: "warning",
          }
        ).then(() => {
          this.adapter.purchaseDocument(
            {
              documentId: d.documentId,
              table: "pptItem",
            },
            (tData) => {
              if (tData && tData.ret === 0) {
                if (this.condition) {
                  this.updateDocumentList();
                }
                this._switchAppItem(d);
              } else {
                this.$message({
                  message: this.$t("notEnoughPoints"),
                  type: "warning",
                });
              }
            }
          );
        });
      } else {
        this._switchAppItem(d);
      }
    },
    _switchAppItem(d) {
      let url = location.origin + location.pathname;
      let params = {};
      params.id = d.documentId;
      let from = WebTool.urlQuery(location.href, "from");
      if (from) {
        params.fromAccount = from;
      }
      url = WebTool.attachParams(url, params);
      if (this.documentList.length === 1 || window.parent !== window) {
        if (window.parent !== window) {
          url = WebTool.attachParams(url, {
            iframeEnable: true,
          });
        }
        location.href = url;
      } else {
        window.open(url, "_blank");
      }
    },
    openAppDialog(app, title, mode, menu, closeCallback) {
      let style = JSON.parse(JSON.stringify(this.dialogStyle));
      style.background = "#fff";
      let tStyle = {};
      style.maxWidth = "1200px";
      style.width = "100%";
      webCpu.CardItem.renderCardDialog(
        document.body,
        app,
        {
          dialogName: "menuItemDialog",
          title: title,
          titleStyle: {
            background: "var(--el-color-primary-light-9)",
            color: "var(--el-color-primary)",
          },
          closeType: "back",
          closeCallback: closeCallback,
          renderMode: mode,
          menu: menu,
        },
        style,
        tStyle
      );
    },
    viewMoreItems() {
      let _self = this;
      let app = this.publishedListApp;
      if (this.condition.folderName) {
        app.dsl.query.folderName = this.condition.folderName;
      } else {
        delete app.dsl.query.folderName;
      }
      if (this.condition.appName) {
        app.dsl.query.appName = this.condition.appName;
      } else {
        delete app.dsl.query.appName;
      }

      if (this.condition.appAgent) {
        app.dsl.query.appAgent = this.condition.appAgent;
      } else {
        delete app.dsl.query.appAgent;
      }

      app.dsl.methods.handleClickItem = function (d, config) {
        _self.switchAppItem(d);
      };
      this.openAppDialog(app, this.$t("seeMore"));
    },
  },
};
</script>

<style scoped>
.portfolioContentArea {
  position: relative;
  float: left;
  width: 100%;
  height: 100%;
  padding: 15px 0px 0px 0px;
  overflow: auto;
}

.documentListArea {
  position: relative;
  width: 100%;
  float: left;
  text-align: center;
  display: inline-block;
  padding: 0px 30px;
}

.documentCardItem {
  position: relative;
  padding: 35px 20px 30px 40px;
  border: solid 1px #ddd;
  background: #fff;
  cursor: pointer;
  border-radius: 5px;
  overflow: hidden;
}

.priceSpanItem {
  position: absolute;
  display: inline-block;
  text-align: left;
  left: -10px;
  width: 200px;
  top: -5px;
  text-indent: 15px;
  background: #f0f0f0;
  font-size: 10px;
  padding: 2px 0px;
  transform: rotate(-15deg);
  color: #999;
  margin-right: 5px;
}

.documentCardItem:hover {
  background-color: #f2f2f2;
}

.documentCardItem:hover .priceSpanItem {
  border-bottom: solid 1px #ddd;
}

.documentCardItem .openDocumentIcon {
  position: absolute;
  height: 100%;
  width: 30px;
  right: 0px;
  top: 0px;
  font-size: 20px;
  margin-top: 30px;
  text-align: center;
  display: none;
}

.documentNameSpan {
  font-size: 16px;
}

.documentCardItem:hover .openDocumentIcon {
  display: block;
}

.sloganInfoArea {
  position: relative;
  float: left;
  width: 100%;
  margin: auto;
  display: inline-block;
  text-align: left;
  padding: 55px 20px 55px 20px;
  font-weight: 800;
}

.sloganInfoArea > p {
  position: relative;
  margin: auto;
  width: 100%;
  margin-bottom: 10px;
  text-align: center;
}

.sloganInfoArea > p:nth-child(1) {
  color: rgba(47, 42, 118, 0.5);
  font-size: 48px;
}

.sloganInfoArea > p:nth-child(2) {
  font-size: 16px;
  text-shadow: -1px 1px rgba(47, 42, 118, 0.3);
}

.documentLabelInfo {
  font-size: 14px;
  text-align: left;
}

.documentLabelInfo .appLabelSpan {
  position: absolute;
  bottom: 3px;
  right: 5px;
  font-size: 12px;
  color: #bbb;
}

.documentLabelInfo .appLabelSpan > .el-avatar {
  display: inline-block;
  vertical-align: middle;
  margin-right: 2px;
  border-radius: 100%;
  opacity: 0.6;
}

.documentColItem {
  margin-bottom: 20px;
}

.viewMoreBtn {
  position: absolute;
  right: calc(50% - 30px);
  bottom: -30px;
}

.supportInfoArea {
  padding-bottom: 15px;
}

.portfolioTileItem {
  padding: 10px 30px;
  position: relative;
  float: left;
  width: 100%;
  font-size: 14px;
  color: #999;
}

.bottomInfoArea {
  position: relative;
  float: left;
  width: 100%;
  font-size: 10px;
  color: #bbb;
  margin-top: 60px;
  text-align: center;
}

.bottomOptionInfo > a {
  color: #bbb;
}
</style>