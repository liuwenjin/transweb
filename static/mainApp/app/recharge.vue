<template>
  <div
    ref="rechargeContainer"
    style="position: relative; float: left; width: 100%"
    class="tw-w-full tw-h-full tw-bg-white tw-p-5 tw-overflow-auto tw-rounded-2xl tw-shadow-sm"
  >
    <!-- 顶部服务信息 -->
    <div class="tw-space-y-3 tw-text-gray-700 tw-leading-relaxed">
      <div class="tw-text-lg tw-font-semibold">
        {{ serviceName }}
      </div>
      <div>
        {{ serviceDesc || serviceDescription }}
      </div>
    </div>

    <!-- 加载完成后显示 -->
    <slot v-if="inited">
      <div class="tw-mt-6 tw-font-semibold tw-text-gray-800 tw-text-base">
        {{ $t("rechargeItemTips") }}：
      </div>
      <el-row :gutter="10" class="tw-mt-4">
        <slot v-for="(item, index) in productList">
          <el-col
            :xs="24"
            :sm="8"
            :md="8"
            :lg="8"
            class="tw-mb-2"
          >
            <el-card
              shadow="hover"
              :active="selected === index"
              @click="handleClickCard(index)"
              class="tw-relative tw-cursor-pointer tw-transition tw-duration-200 hover:tw-scale-[1.02]"
              :class="{ 'tw-ring-2 tw-ring-green-500': selected === index }"
            >
              <h3 v-if="item.title" class="tw-text-xs tw-text-gray-500 tw-mt-2">
                {{ item.title }}
              </h3>

              <!-- 积分信息强调显示 -->
              <div
                class="tw-text-2xl tw-font-extrabold tw-text-green-600 tw-mb-1"
              >
                {{
                  Math.floor(item.tokens / tokenRate).toLocaleString("en-US")
                }}
                <span
                  class="tw-text-sm tw-font-medium tw-text-gray-500 tw-ml-1"
                >
                  {{ unit2 }}
                </span>
              </div>

              <div v-if="item.description || item.tips" class="tw-text-xs tw-text-gray-500 tw-mt-2">
                {{ item.description || item.tips }}
              </div>

              <!-- 价格信息次要显示 -->
              <div class="tw-text-lg tw-font-semibold tw-text-gray-700 tw-mt-1">
                ¥ {{ (item.price / 100).toFixed(0).toLocaleString("en-US") }}
                <span
                  class="tw-text-sm tw-font-medium tw-text-gray-500 tw-ml-1"
                  >{{ unit }}</span
                >
              </div>
              <span class="tw-absolute tw-right-2 tw-top-2 tw-text-lg">
                <i
                  v-if="selected === index"
                  class="bi bi-check-circle-fill tw-text-green-500"
                ></i>
                <i v-else class="bi bi-circle tw-text-gray-400"></i>
              </span>
            </el-card>
          </el-col>
        </slot>
      </el-row>

      <!-- PC端：支付提示 + 二维码 -->
      <template v-if="!isMobile">
        <div
          class="tw-mt-6 tw-border-t tw-border-dashed tw-border-gray-300 tw-pt-3 tw-text-sm tw-font-semibold tw-text-gray-700"
        >
          {{ $t("scanTips") }}
          <i class="bi bi-qr-code-scan tw-ml-2 tw-text-gray-600"></i>
          <span class="tw-ml-5 tw-text-green-600">{{ $t("depositTips") }}</span>
        </div>

        <!-- 支付区域 - PC端 -->
        <div
          class="tw-relative tw-mt-4 tw-flex tw-flex-col md:tw-flex-row tw-items-start tw-gap-4"
          style="padding-left: 180px; height: 160px"
        >
          <!-- 二维码区 -->
          <div
            style="width: 150px; height: 150px"
            class="tw-absolute tw-left-0 tw-top-0 tw-border tw-border-gray-300 tw-rounded-lg tw-overflow-hidden tw-bg-white tw-shadow-sm"
          >
            <div ref="qrCodeContainer" class="tw-w-full tw-h-full tw-p-3"></div>
          </div>

          <!-- 积分与价格信息 -->
          <div class="tw-w-full tw-space-y-2 tw-text-gray-800">
            <!-- 积分信息强调 -->
            <h3 v-if="productList[selected].title" class="tw-text-lg tw-font-bold tw-text-gray-800">
              {{ productList[selected].title }}
            </h3>
            <div class="tw-text-xl tw-font-extrabold tw-text-green-600 tw-mt-2">
              {{ $t("scanTips2") }}：
              <span class="tw-text-2xl tw-font-extrabold tw-text-green-700">
                {{
                  Math.floor(
                    productList[selected].tokens / tokenRate
                  ).toLocaleString("en-US")
                }}
              </span>
              <span class="tw-text-sm tw-ml-1">{{ unit2 }}</span>
            </div>
            <div v-if="productList[selected].description" class="tw-text-sm tw-text-gray-500 tw-mt-2">
              {{ productList[selected].description }}
            </div>
            <!-- 价格信息次要显示 -->
            <div class="tw-text-base tw-font-semibold tw-text-gray-700">
              {{ $t("scanTips1") }}：
              <span class="tw-text-lg tw-font-bold tw-text-green-600">
                ¥{{
                  (productList[selected].price / 100)
                    .toFixed(0)
                    .toLocaleString("en-US")
                }}
              </span>
              <span class="tw-text-sm tw-ml-1">{{ unit }}</span>
            </div>

            <div
              class="tw-flex tw-items-center tw-text-sm tw-text-gray-500 tw-mt-2"
            >
              <i class="bi bi-wechat tw-text-green-500 tw-mr-2"></i>
              {{ $t("scanTips3") }}
            </div>
          </div>
        </div>
      </template>

      <!-- 移动端：H5支付按钮 / 微信JSAPI支付按钮 -->
      <template v-else>
        <div
          class="tw-mt-6 tw-border-t tw-border-dashed tw-border-gray-300 tw-pt-4"
        >
          <!-- 订单信息 -->
          <div class="tw-bg-gray-50 tw-rounded-lg tw-p-4 tw-mb-4">
            <div class="tw-flex tw-justify-between tw-items-center tw-mb-2">
              <span class="tw-text-gray-600">充值积分</span>
              <span class="tw-text-xl tw-font-extrabold tw-text-green-600">
                {{
                  Math.floor(
                    productList[selected].tokens / tokenRate
                  ).toLocaleString("en-US")
                }}
                {{ unit2 }}
              </span>
            </div>
            <div class="tw-flex tw-justify-between tw-items-center">
              <span class="tw-text-gray-600">支付金额</span>
              <span class="tw-text-lg tw-font-bold tw-text-gray-800">
                ¥{{
                  (productList[selected].price / 100)
                    .toFixed(0)
                    .toLocaleString("en-US")
                }}
                {{ unit }}
              </span>
            </div>
          </div>

          <!-- 支付状态提示 -->
          <div v-if="orderState" class="tw-mb-4 tw-text-center">
            <el-alert
              :title="payTipMap[orderState] || orderState"
              :type="
                orderState === 'SUCCESS'
                  ? 'success'
                  : orderState === 'PAYERROR'
                  ? 'error'
                  : 'warning'
              "
              :closable="false"
              show-icon
            />
          </div>

          <!-- 微信JSAPI专用提示（如果正在加载SDK） -->
          <div
            v-if="isWechat && !wxReady && !isMiniProgram"
            class="tw-mb-3 tw-text-center"
          >
            <el-alert
              title="正在加载微信支付环境，请稍后..."
              type="info"
              :closable="false"
              show-icon
            />
          </div>

          <!-- 支付按钮 -->
          <el-button
            type="success"
            size="large"
            :disabled="!isWechat"
            class="tw-w-full tw-font-bold tw-rounded-lg tw-py-4 tw-text-lg"
            @click="handleMobilePay"
          >
            <i class="bi bi-wechat tw-mr-2"></i>
            {{
              orderState === "SUCCESS"
                ? "支付成功"
                : isMiniProgram
                ? "小程序支付"
                : isWechat
                ? "微信支付"
                : "立即支付"
            }}
          </el-button>

          <div class="tw-mt-3 tw-text-xs tw-text-gray-500 tw-text-center">
            {{
              isMiniProgram
                ? "将在小程序内调起支付"
                : isWechat
                ? "将在微信内调起支付"
                : "点击按钮将跳转至微信支付页面完成支付"
            }}
          </div>
        </div>
      </template>
    </slot>

    <!-- 加载中状态 -->
    <div v-else class="tw-text-center tw-mt-10 tw-w-full tw-text-gray-500">
      <el-button
        size="large"
        text
        plain
        type="success"
        loading
        class="tw-text-gray-600"
      >
        加载中...
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: "RechargeComponent",
  data() {
    return {
      inited: false,
      selected: 0,
      unit: webCpu.messages[lang]["moneyUnit"],
      unit2: webCpu.messages[lang]["points"],
      payTipMap: {
        NOTPAY: "待支付",
        NOTSUPPORT: "暂不支持微信外支付",
        SUCCESS: "支付成功",
        USERPAYING: "支付中",
        PAYERROR: "支付失败",
        ACCEPT: "等待扣款",
        TIMEOUT: "订单超时",
        CLOSED: "订单已关闭",
      },
      orderState: "",
      tradeNo: "",
      // 设备检测：true为移动端，false为PC端
      isMobile: false,
      tokenRate: 1,
      serviceName: "TransWeb 智能生成服务",
      serviceDesc:
        "按 AI 算力消耗计费，每 1 token 扣除 1/10 积分。购买积分即可使用全部服务。",
      productList: [
        { price: 499, tokens: 500000, id: "tokens_500000", tips: "50万积分" },
        {
          price: 2850,
          tokens: 3000000,
          id: "tokens_3000000",
          tips: "300万积分",
        },
        {
          price: 8100,
          tokens: 9000000,
          id: "tokens_9000000",
          tips: "900万积分",
        },
        { price: 24000, tokens: 300000000, id: "tokens_99", tips: "3亿积分" },
      ],
      interface: {
        getWxOrder: {
          url: webCpu.documentPrefix + "/wxOrder",
          requestType: "post",
          dataType: "json",
        },
        checkWxPay: {
          url: webCpu.documentPrefix + "/checkPay",
          requestType: "get",
          dataType: "json",
        },
        cancleOrder: {
          url: webCpu.documentPrefix + "/cancleOrder",
          requestType: "get",
          dataType: "json",
        },
        getWxSignature: {
          url: webCpu.documentPrefix + "/wxSignature",
          requestType: "get",
          dataType: "json",
        },
        getOpenid: {
          url: webCpu.documentPrefix + "/wxGetOpenid",
          requestType: "get",
          dataType: "json",
        },
      },
      timer: null,
      billDealLink: "", // MWEB支付链接（H5非微信环境）
      mwebUrl: "", // 同billDealLink，保留兼容
      payLoading: false,
      // 微信JSAPI相关
      isWechat: false, // 是否微信浏览器
      wxReady: false, // 微信SDK是否配置成功
      wxConfigError: false, // 配置失败标志（用于降级）
      wxPayParams: null, // 存储JSAPI支付参数
      openid: "", // 用户openid
      pendingPay: false, // 是否有待继续的支付
      pendingProductId: null, // 待支付的套餐索引
      autoPayAfterAuth: false, // 授权后是否自动支付

      // 小程序环境相关
      isMiniProgram: false, // 是否在小程序 webview 中
      miniProgramReady: false, // 小程序 JSSDK 是否就绪
    };
  },
  computed: {
    // 支付按钮是否禁用
    payDisabled() {
      if (!this.isWechat) {
        return true;
      }
      if (this.orderState === "SUCCESS") return true;
      if (this.payLoading) return true;
      // 微信环境下如果SDK未就绪且未失败则禁用（等待加载）
      if (
        this.isWechat &&
        !this.wxReady &&
        !this.wxConfigError &&
        !this.isMiniProgram
      )
        return true;
      return false;
    },
  },
  mounted() {
    this.selected = Number(this.selected) || 0;
    if (this.selected >= this.productList.length) {
      this.selected = this.productList.length - 1;
    }
    this.adapter = webCpu.initAdapter(this.interface);
    // 检测小程序环境（需在检测微信环境之前）
    this.checkMiniProgramEnv(() => {
      // 检测微信环境（仅当非小程序时，小程序内不需要公众号 JSAPI 初始化）
      if (!this.isMiniProgram) {
        this.checkWechatEnv(() => {
          this.checkDeviceType();
          this.handleUrlCodeAndInit();
        });
      } else {
        this.checkDeviceType();
        this.handleUrlCodeAndInit();
      }
    });
    if (typeof gtag === 'function') {
        gtag('event', 'open_recharge_order');
      }
  },
  beforeDestroy() {
    clearTimeout(this.timer);
    window.removeEventListener("resize", this.checkDeviceType);
  },
  methods: {
    // 检测是否在小程序 webview 中
    checkMiniProgramEnv(callback) {
      if (
        window.__wxjs_environment === "miniprogram" ||
        /miniProgram/i.test(navigator.userAgent)
      ) {
        this.isMiniProgram = true;
        // 加载小程序 JSSDK（复用公众号的 SDK 文件）
        if (!window.wx || !window.wx.miniProgram) {
          const script = document.createElement("script");
          script.src = "https://res.wx.qq.com/open/js/jweixin-1.6.0.js";
          script.onload = () => {
            this.miniProgramReady = true;
            // 监听小程序发来的消息
            if (
              window.wx &&
              window.wx.miniProgram &&
              typeof window.wx.miniProgram.onMessage === "function"
            ) {
              window.wx.miniProgram.onMessage((data) => {
                this.$message("pay result feedback!");
                if (data.type === "payResult") {
                  this.handleMiniProgramPayResult(data);
                }
              });
            }
            if (typeof callback === "function") callback();
          };
          script.onerror = (e) => {
            console.error("小程序 JSSDK 加载失败");
            this.$message({
              type: "warning",
              message: e,
            });
            this.isMiniProgram = false; // 降级为普通 H5
            if (typeof callback === "function") callback();
          };
          document.head.appendChild(script);
        } else {
          this.miniProgramReady = true;
          if (
            window.wx &&
            window.wx.miniProgram &&
            typeof window.wx.miniProgram.onMessage === "function"
          ) {
            window.wx.miniProgram.onMessage((data) => {
              this.$message("pay result feedback!");
              if (data.type === "payResult")
                this.handleMiniProgramPayResult(data);
            });
          }

          if (typeof callback === "function") callback();
        }
      } else {
        if (typeof callback === "function") callback();
      }
    },

    // 处理 URL 中的 code 和初始化
    handleUrlCodeAndInit() {
      const code = WebTool.urlQuery(location.href, "code");
      this.openid = WebTool.urlQuery(location.href, "openid") || this.openid;
      if (code && this.isWechat && !this.isMiniProgram) {
        this.getOpenidByCode(code);
      } else {
        this.initComponent();
      }
      window.addEventListener("resize", this.checkDeviceType);
    },

    // 初始化组件（显示内容、创建订单等）
    initComponent() {
      // 如果有 pending 信息（从 sessionStorage 恢复）
      const pendingIndex = sessionStorage.getItem("pendingProductIndex");
      if (pendingIndex !== null) {
        this.selected = parseInt(pendingIndex);
        sessionStorage.removeItem("pendingProductIndex");
        this.pendingPay = true;
        this.autoPayAfterAuth = true;
      }

      // 如果是 PC 端，直接创建订单；移动端微信环境如果没有 openid，则等待用户点击支付时授权
      if (!this.isMobile) {
        this.inited = false;
        this.updateProductBill();
      } else if (this.isWechat && !this.openid && !this.isMiniProgram) {
        // 微信环境且无 openid，显示卡片但不自动创建订单
        this.inited = true;
      } else {
        // 其他情况：非微信移动端或有 openid 的微信环境，正常创建订单
        this.inited = true;
        this.updateProductBill();
      }
    },

    // 通过 code 换取 openid（仅公众号环境使用）
    getOpenidByCode(code) {
      this.adapter.getOpenid(
        { code },
        (res) => {
          if (res.openid) {
            this.openid = res.openid;
            sessionStorage.setItem("wechat_openid", this.openid);
            // 清理 URL 中的 code 参数，避免重复使用
            const newUrl = window.location.href
              .replace(/[?&]code=[^&]*/, "")
              .replace(/[?&]state=[^&]*/, "");
            window.history.replaceState({}, document.title, newUrl);
            // 检查是否有待支付的订单
            const pendingIndex = sessionStorage.getItem("pendingProductIndex");
            if (pendingIndex !== null) {
              sessionStorage.removeItem("pendingProductIndex");
              this.selected = parseInt(pendingIndex);
              this.autoPayAfterAuth = true;
              this.updateProductBill();
            } else {
              this.initComponent();
            }
          } else {
            this.$message.error("获取用户信息失败，请重试");
            this.initComponent();
          }
        },
        (err) => {
          console.error("获取 openid 失败", err);
          this.$message.error("获取用户信息失败，请重试");
          this.initComponent();
        }
      );
    },

    // 跳转微信授权页面（仅公众号环境）
    redirectToAuth() {
      sessionStorage.setItem("pendingProductIndex", this.selected);
      const currentUrl = window.location.href.split("?")[0];
      const redirectUri = encodeURIComponent(currentUrl);
      const appId = "wxfd4f37f3f8ca5dca"; // 公众号 AppID
      const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_base&state=PAY#wechat_redirect`;
      window.location.href = authUrl;
    },

    // 检测是否微信浏览器（仅用于公众号环境）
    checkWechatEnv(callback) {
      const ua = navigator.userAgent.toLowerCase();
      this.isWechat = /micromessenger/i.test(ua);
      if (this.isWechat && !this.isMiniProgram) {
        this.loadWxSdkAndConfig(callback);
      } else {
        if (typeof callback === "function") callback();
      }
    },

    // 动态加载微信JS-SDK并完成配置（仅公众号环境）
    loadWxSdkAndConfig(callback) {
      if (window.wx) {
        this.configWxSdk(callback);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://res.wx.qq.com/open/js/jweixin-1.6.0.js";
      script.onload = () => {
        this.configWxSdk(callback);
      };
      script.onerror = () => {
        console.error("微信JS-SDK加载失败");
        this.wxConfigError = true;
        this.$message.error("加载微信支付环境失败，将使用H5支付方式");
      };
      document.head.appendChild(script);
    },

    // 配置wx.config（仅公众号环境）
    configWxSdk(callback) {
      const url = window.location.href.split("#")[0];
      let type = "";
      this.adapter.getWxSignature(
        { url, type },
        (res) => {
          if (res && res.appId && res.signature) {
            wx.config({
              debug: false,
              appId: res.appId,
              timestamp: res.timestamp,
              nonceStr: res.nonceStr,
              signature: res.signature,
              jsApiList: ["chooseWXPay"],
            });
            wx.ready(() => {
              this.wxReady = true;
              console.log("微信SDK配置成功");
              if (typeof callback === "function") {
                callback();
              }
            });
            wx.error((err) => {
              console.error("微信SDK配置失败", err);
              this.wxConfigError = true;
              this.$message.warning("微信支付初始化失败，将使用H5支付方式");
              if (typeof callback === "function") {
                callback();
              }
            });
          } else {
            throw new Error("签名接口返回数据异常");
          }
        },
        (err) => {
          console.error("获取微信签名失败", err);
          this.wxConfigError = true;
          this.$message.warning("获取支付签名失败，将使用H5支付方式");
        }
      );
    },

    // 检测设备类型（移动端/PC端）
    checkDeviceType() {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice =
        /iphone|ipad|ipod|android|mobile|micromessenger/i.test(userAgent);
      const isSmallScreen = window.innerWidth < 768;
      this.isMobile = isMobileDevice || isSmallScreen;
    },

    handleClickCard(index) {
      if (this.selected === index) return;
      this.selected = index;
      if ((!this.isWechat || this.openid) && !this.isMiniProgram) {
        this.updateProductBill();
      } else if (this.isMiniProgram && this.openid) {
        // 小程序环境下，有 openid 时可以直接更新订单
        this.updateProductBill();
      }
    },

    successCallback() {
      this.$message.success("充值成功！");
      this.$emit("recharge-success");
    },

    // 创建订单（根据环境选择不同支付类型）
    updateProductBill(d) {
      const _self = this;
      d = d || this.productList[this.selected];
      this.payLoading = true;
      this.orderState = "";
      this.wxPayParams = null;

      // 确定交易类型
      let tradeType = "NATIVE"; // 默认PC扫码
      if (this.isMiniProgram) {
        // 小程序内使用 JSAPI 支付（后端使用小程序 openid）
        tradeType = "JSAPI";
      } else if (this.isWechat) {
        tradeType = "JSAPI";
      } else if (this.isMobile) {
        tradeType = "MWEB";
      }

      // 构建请求参数
      const currentHost = window.location.host;
      let defaultId = `${this.appId || "transweb"}_${this.tokenRate || 100}_${
        d.tokens
      }_${d.price}_${new Date().getTime()}`;
      const query = {
        price: d.price,
        product: d.tokens.toLocaleString("en-US") + "积分",
        product_id: d.id || defaultId,
        tokens: d.tokens,
        trade_type: tradeType,
        scene_info:
          tradeType === "MWEB"
            ? {
                h5_info: {
                  type: "Wap",
                  wap_url: "transweb.com.cn",
                  wap_name: "TransWeb 智能生成服务",
                },
              }
            : "",
      };

      // JSAPI 支付需要传递 openid
      if (tradeType === "JSAPI") {
        if (!this.openid) {
          this.$message.error("未获取到微信用户标识，请重新进入页面");
          this.payLoading = false;
          this.inited = true; // 让界面显示
          return;
        }
        query.openid = this.openid;
      }

      query.type = this.isMiniProgram ? "wxApp" : "wxService";

      query.folderName = localStorage.folderName;

      this.adapter.getWxOrder(
        query,
        function (tData) {
          _self.tradeNo = tData.out_trade_no;
          _self.inited = true;
          _self.payLoading = false;

          if (tradeType === "JSAPI") {
            _self.wxPayParams = {
              appId: tData.appId,
              timeStamp: tData.timeStamp,
              nonceStr: tData.nonceStr,
              package: tData.package,
              signType: tData.signType || "MD5",
              paySign: tData.paySign,
            };
            _self.billDealLink = "";
            _self.mwebUrl = "";

            // 小程序环境：发送支付参数给小程序
            if (_self.isMiniProgram) {
              if (_self.autoPayAfterAuth) {
                _self.autoPayAfterAuth = false;
                setTimeout(() => {
                  _self.handleMiniProgramPay();
                }, 100);
              }
            } else {
              // 公众号环境：如果授权后需要自动支付，则直接调起
              if (_self.autoPayAfterAuth) {
                _self.autoPayAfterAuth = false;
                setTimeout(() => {
                  _self.handleJSAPIPay();
                }, 100);
              }
            }
          } else if (tradeType === "MWEB") {
            _self.mwebUrl = tData.mweb_url;
            _self.billDealLink = _self.mwebUrl;
          } else if (tradeType === "NATIVE") {
            _self.billDealLink = tData.payUrl;
            if (tData.payUrl) {
              setTimeout(() => {
                _self.updateQrCode(tData.payUrl);
              }, 100);
            }
          }

          _self.checkWxPay(tData.out_trade_no);
        },
        function (error) {
          _self.payLoading = false;
          _self.inited = true;
          _self.$message.error(
            "创建订单失败：" + (error.message || "未知错误")
          );
        }
      );
    },

    // 移动端支付入口（根据环境调用JSAPI、跳转MWEB或小程序支付）
    handleMobilePay() {
      if (this.orderState === "SUCCESS") {
        this.$message.info("订单已完成支付");
        return;
      }

      // 小程序环境
      if (this.isMiniProgram) {
        if (!this.wxPayParams) {
          // 还没创建订单，先创建
          this.$message("create bill");
          this.updateProductBill();
        } else {
          this.handleMiniProgramPay();
        }
        return;
      }

      // 公众号微信环境
      if (this.isWechat) {
        if (!this.openid) {
          this.pendingPay = true;
          this.pendingProductId = this.selected;
          this.redirectToAuth();
          return;
        }
        if (!this.wxReady && !this.wxConfigError) {
          this.$message.warning("微信支付环境初始化中，请稍后再试");
          return;
        }
        if (this.wxConfigError) {
          this.fallbackToMwebPay();
          return;
        }
        this.handleJSAPIPay();
      } else {
        // 非微信移动端：跳转MWEB支付
        if (!this.billDealLink && !this.mwebUrl) {
          this.$message.error("支付链接无效，请重新选择套餐");
          return;
        }
        const payUrl = this.mwebUrl || this.billDealLink;
        sessionStorage.setItem("pendingOrderNo", this.tradeNo);
        sessionStorage.setItem("pendingOrderTime", Date.now());
        window.location.href = payUrl;
      }
    },

    // 小程序支付处理
    handleMiniProgramPay() {
      if (!this.wxPayParams) {
        this.$message.error("支付参数缺失，请重新选择套餐");
        return;
      }
      if (!this.miniProgramReady) {
        this.$message.warning("小程序通信环境未就绪，请稍后再试");
        return;
      }
      this.payLoading = true;
      this.sendPayParamsToMiniProgram(this.wxPayParams);
    },

    // 发送支付参数给小程序
    sendPayParamsToMiniProgram(params) {
      if (!window.wx || !window.wx.miniProgram) {
        console.error("小程序 JSSDK 未就绪");
        this.payLoading = false;
        this.$message.error("无法调起支付，请重试");
        return;
      }

      window.wx.miniProgram.postMessage({
        data: {
          type: "pay",
          params: params,
        },
      });

      let queryString = new URLSearchParams(params).toString();

      try {
        wx.miniProgram.navigateTo({
          url: `/pages/pay/pay?${queryString}`,
          success: function (res) {
            console.log("跳转成功", res);
            this.$message("跳转成功");
          },
          fail: function (err) {
            console.log("跳转失败", err);
            // 可以在这里处理失败逻辑，比如提示用户
            this.$message("跳转失败 " + err);
          },
        });
      } catch (e) {
        this.$message("failed to  pay.js: " + e.toString());
      }
    },

    // 处理小程序返回的支付结果
    handleMiniProgramPayResult(data) {
      this.$message("get feedback: ", data.result);
      if (data.result === "success") {
        // 轮询确认订单状态（后端通知可能延迟）
        this.checkWxPay(this.tradeNo, 500);
        this.$message.success("支付成功");
        if (typeof gtag === 'function') {
          gtag('event', 'recharge_success');
        }
      } else {
        this.payLoading = false;
        this.payDisabled = false;
        this.$message.error(data.errMsg || "支付失败");
        if (data.errMsg && data.errMsg.indexOf("cancel") !== -1) {
          this.$message.info("用户取消支付");
        }
      }
    },

    // JSAPI支付（公众号环境）
    handleJSAPIPay() {
      if (!this.wxPayParams) {
        this.$message.error("支付参数缺失，请重新选择套餐");
        return;
      }
      if (!window.wx) {
        this.$message.error("微信支付SDK未加载");
        return;
      }
      if (!this.wxReady) {
        this.$message.warning("微信支付环境未就绪，请稍后再试");
        return;
      }

      this.payLoading = true;
      const params = this.wxPayParams;
      wx.chooseWXPay({
        timestamp: params.timeStamp,
        nonceStr: params.nonceStr,
        package: params.package,
        signType: params.signType,
        paySign: params.paySign,
        success: (res) => {
          console.log("JSAPI支付成功", res);
          this.checkWxPay(this.tradeNo, 500);
        },
        fail: (err) => {
          console.error("JSAPI支付失败", err);
          this.payLoading = false;
          if (err.errMsg && err.errMsg.indexOf("cancel") !== -1) {
            this.$message.info("用户取消支付");
          } else {
            this.$message.error("支付失败：" + (err.errMsg || "未知错误"));
            if (confirm("微信支付调起失败，是否尝试使用H5支付？")) {
              this.fallbackToMwebPay();
            }
          }
        },
        cancel: () => {
          this.payLoading = false;
          this.$message.info("取消支付");
        },
      });
    },

    // 降级到H5支付（MWEB）
    fallbackToMwebPay() {
      if (!this.billDealLink && !this.mwebUrl) {
        this.$message.info("正在切换支付方式，请稍后");
        const originalWechatFlag = this.isWechat;
        this.isWechat = false;
        this.updateProductBill();
        setTimeout(() => {
          this.isWechat = originalWechatFlag;
        }, 500);
      } else {
        const payUrl = this.mwebUrl || this.billDealLink;
        sessionStorage.setItem("pendingOrderNo", this.tradeNo);
        sessionStorage.setItem("pendingOrderTime", Date.now());
        window.location.href = payUrl;
      }
    },

    cancleOrder() {
      if (!this.tradeNo) return;
      this.adapter.cancleOrder({ tradeNo: this.tradeNo }, function (tData) {
        console.log("取消订单成功", tData);
      });
    },

    updateQrCode(content) {
      const el = this.$refs.qrCodeContainer;
      if (!el) return;
      $(el).html("");
      const size = Math.min(el.clientWidth - 23, el.clientHeight - 23);
      if (typeof $(el).qrcode === "function") {
        $(el).qrcode({
          render: "canvas",
          text: content,
          width: size,
          height: size,
          background: "#ffffff",
          foreground: "#000000",
        });
      } else {
        console.error("QRCode plugin not loaded");
        el.innerHTML =
          '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:12px;color:#999;">请刷新重试</div>';
      }
    },

    checkWxPay(tradeNo, interval = 3000) {
      if (!tradeNo) return;
      clearTimeout(this.timer);
      const _self = this;
      this.adapter.checkWxPay({ out_trade_no: tradeNo }, function (d) {
        _self.orderState = d.tradeState;

        if (d.tradeState === "SUCCESS") {
          if (typeof _self.successCallback === "function") {
            _self.successCallback(d);
          }
          clearTimeout(_self.timer);
          _self.payLoading = false;
          sessionStorage.removeItem("pendingOrderNo");
          sessionStorage.removeItem("pendingOrderTime");
        } else if (d.tradeState === "CLOSED" || d.tradeState === "PAYERROR") {
          clearTimeout(_self.timer);
          _self.payLoading = false;
        } else if (!d.timeout) {
          _self.timer = setTimeout(() => {
            _self.checkWxPay(tradeNo, interval);
          }, interval);
        } else {
          _self.orderState = "TIMEOUT";
          _self.payLoading = false;
        }
      });
    },

    checkPendingOrder() {
      const pendingNo = sessionStorage.getItem("pendingOrderNo");
      const pendingTime = sessionStorage.getItem("pendingOrderTime");
      if (
        pendingNo &&
        pendingTime &&
        Date.now() - parseInt(pendingTime) < 30 * 60 * 1000
      ) {
        this.tradeNo = pendingNo;
        this.checkWxPay(pendingNo, 2000);
        this.$message.info("检测到未完成的订单，正在查询支付状态...");
      } else {
        sessionStorage.removeItem("pendingOrderNo");
        sessionStorage.removeItem("pendingOrderTime");
      }
    },
  },

  activated() {
    this.checkPendingOrder();
  },
};
</script>

<style scoped>
/* 移动端适配样式 */
@media (max-width: 768px) {
  .tw-p-5 {
    padding: 1rem;
  }

  .tw-text-2xl {
    font-size: 1.25rem;
  }

  .tw-text-lg {
    font-size: 1rem;
  }
}

/* 选中卡片样式优化 */
.el-card[active="true"] {
  border-color: #10b981;
}
</style>