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
        {{ $t ? $t("rechargeItemTips") : "选择充值套餐" }}：
      </div>

      <!-- 套餐卡片列表 -->
      <el-row :gutter="10" class="tw-mt-4">
        <slot v-for="(item, index) in productList">
          <el-col
            :xs="24"
            :sm="8"
            :md="8"
            :lg="8"
            :key="item.id || index"
            class="tw-mb-3"
          >
            <el-card
              shadow="hover"
              :active="selected === index"
              @click="handleClickCard(index)"
              class="tw-relative tw-cursor-pointer tw-transition tw-duration-200 hover:tw-scale-[1.02]"
              :class="{ 'tw-ring-2 tw-ring-blue-500': selected === index }"
            >
              <h3 v-if="item.title" class="tw-text-xs tw-text-gray-500 tw-mt-1">
                {{ item.title }}
              </h3>

              <!-- 积分信息强调显示 -->
              <div
                class="tw-text-2xl tw-font-extrabold tw-text-blue-600 tw-mb-1"
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

              <div
                v-if="item.description || item.tips"
                class="tw-text-xs tw-text-gray-500 tw-mt-1"
              >
                {{ item.description || item.tips }}
              </div>

              <!-- 价格信息次要显示 -->
              <div class="tw-text-lg tw-font-semibold tw-text-gray-700 tw-mt-2">
                $ {{ (item.price / 100).toFixed(2) }}
                <span
                  class="tw-text-sm tw-font-medium tw-text-gray-500 tw-ml-1"
                  >{{ unit }}</span
                >
              </div>

              <!-- 选择状态标识 -->
              <span class="tw-absolute tw-right-3 tw-top-3 tw-text-lg">
                <i
                  v-if="selected === index"
                  class="bi bi-check-circle-fill tw-text-blue-500"
                ></i>
                <i v-else class="bi bi-circle tw-text-gray-300"></i>
              </span>
            </el-card>
          </el-col>
        </slot>
      </el-row>

      <!-- 支付区域 -->
      <div
        class="tw-mt-6 tw-border-t tw-border-dashed tw-border-gray-200 tw-pt-6"
      >
        <!-- 当前订单简要 -->
        <div
          class="tw-bg-gray-50 tw-rounded-xl tw-p-4 tw-mb-6 tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start sm:tw-items-center tw-gap-2"
        >
          <div>
            <span class="tw-text-sm tw-text-gray-500">已选套餐：</span>
            <span class="tw-font-bold tw-text-gray-800 tw-ml-1">
              {{
                Math.floor(
                  productList[selected].tokens / tokenRate
                ).toLocaleString("en-US")
              }}
              {{ unit2 }}
            </span>
          </div>
          <div>
            <span class="tw-text-sm tw-text-gray-500">应付金额：</span>
            <span class="tw-text-xl tw-font-extrabold tw-text-blue-600">
              $ {{ (productList[selected].price / 100).toFixed(2) }} {{ unit }}
            </span>
          </div>
        </div>

        <!-- 状态提示 -->
        <div v-if="orderState" class="tw-mb-4">
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

        <!-- PayPal 容器容器框 -->
        <div class="tw-max-w-md tw-mx-auto tw-mt-4">
          <div
            v-show="payLoading"
            class="tw-text-center tw-py-4 tw-text-gray-500"
          >
            <el-button size="large" text plain type="primary" loading>
              正在发起支付...
            </el-button>
          </div>
          <!-- PayPal 官方按钮组件渲染挂载点 -->
          <div
            ref="paypalButtonContainer"
            id="paypal-button-container"
            class="tw-w-full"
          ></div>
        </div>
      </div>
    </slot>

    <!-- 加载中状态 -->
    <div v-else class="tw-text-center tw-py-12 tw-w-full tw-text-gray-500">
      <el-button
        size="large"
        text
        plain
        type="primary"
        loading
        class="tw-text-gray-600"
      >
        初始化支付组件中...
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: "PaypalRechargeComponent",
  props: {
    // 支持由外部传入 PayPal Client ID，也可以写死在 default 中
    paypalClientId: {
      type: String,
      default: "YOUR_PAYPAL_CLIENT_ID", // 替换为你的 PayPal Client ID
    },
    currency: {
      type: String,
      default: "USD",
    },
  },
  data() {
    const lang = (window.webCpu && window.webCpu.lang) || "en";
    const messages = (window.webCpu && window.webCpu.messages) || {};
    return {
      inited: false,
      selected: 0,
      unit: (messages[lang] && messages[lang]["moneyUnit"]) || "USD",
      unit2: (messages[lang] && messages[lang]["points"]) || "积分",
      payTipMap: {
        NOTPAY: "待支付",
        SUCCESS: "支付成功",
        USERPAYING: "支付处理中",
        PAYERROR: "支付失败",
        CANCELLED: "已取消支付",
      },
      orderState: "",
      tradeNo: "",
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
        createPaypalOrder: {
          url:
            (window.webCpu ? window.webCpu.documentPrefix : "") +
            "/paypal/createOrder",
          requestType: "post",
          dataType: "json",
        },
        capturePaypalOrder: {
          url:
            (window.webCpu ? window.webCpu.documentPrefix : "") +
            "/paypal/captureOrder",
          requestType: "post",
          dataType: "json",
        },
      },
      payLoading: false,
      paypalSdkLoaded: false,
      paypalButtonsInstance: null,
    };
  },
  mounted() {
    this.selected = Number(this.selected) || 0;
    if (this.selected >= this.productList.length) {
      this.selected = this.productList.length - 1;
    }

    if (window.webCpu && typeof window.webCpu.initAdapter === "function") {
      this.adapter = window.webCpu.initAdapter(this.interface);
    }

    this.initComponent();

    if (typeof gtag === "function") {
      gtag("event", "open_recharge_order");
    }
  },
  methods: {
    // 初始化组件并加载 PayPal SDK
    initComponent() {
      this.loadPaypalSdk()
        .then(() => {
          this.inited = true;
          this.$nextTick(() => {
            this.renderPaypalButtons();
          });
        })
        .catch((err) => {
          console.error("PayPal SDK 加载失败:", err);
          this.$message.error("加载 PayPal 支付环境失败，请刷新重试");
        });
    },

    // 动态载入 PayPal SDK Script
    loadPaypalSdk() {
      return new Promise((resolve, reject) => {
        if (window.paypal) {
          this.paypalSdkLoaded = true;
          return resolve();
        }

        const script = document.createElement("script");
        script.src = `https://www.paypal.com/sdk/js?client-id=${this.paypalClientId}&currency=${this.currency}`;
        script.async = true;
        script.onload = () => {
          this.paypalSdkLoaded = true;
          resolve();
        };
        script.onerror = (err) => reject(err);
        document.head.appendChild(script);
      });
    },

    // 渲染 PayPal 按钮
    renderPaypalButtons() {
      if (!window.paypal || !this.$refs.paypalButtonContainer) return;

      // 如果之前渲染过，先销毁/清理旧容器
      if (this.paypalButtonsInstance) {
        this.$refs.paypalButtonContainer.innerHTML = "";
      }

      const _self = this;

      this.paypalButtonsInstance = window.paypal.Buttons({
        style: {
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "paypal",
        },

        // 1. 创建订单 (由后端生成 PayPal Order ID)
        createOrder: (data, actions) => {
          _self.payLoading = true;
          _self.orderState = "USERPAYING";
          const selectedProduct = _self.productList[_self.selected];

          return new Promise((resolve, reject) => {
            const query = {
              price: selectedProduct.price,
              currency: _self.currency,
              product_id: selectedProduct.id,
              tokens: selectedProduct.tokens,
              folderName: localStorage.folderName || "",
            };

            const handleSuccess = (res) => {
              _self.payLoading = false;
              if (res && (res.orderID || res.id)) {
                _self.tradeNo = res.orderID || res.id;
                resolve(res.orderID || res.id);
              } else {
                _self.orderState = "PAYERROR";
                _self.$message.error("创建 PayPal 订单失败");
                reject(new Error("Missing orderID"));
              }
            };

            const handleError = (err) => {
              _self.payLoading = false;
              _self.orderState = "PAYERROR";
              _self.$message.error(
                "创建订单失败：" + (err.message || "未知错误")
              );
              reject(err);
            };

            if (_self.adapter && _self.adapter.createPaypalOrder) {
              _self.adapter.createPaypalOrder(query, handleSuccess, handleError);
            } else {
              // 备用 fetch 方案
              fetch(_self.interface.createPaypalOrder.url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(query),
              })
                .then((r) => r.json())
                .then(handleSuccess)
                .catch(handleError);
            }
          });
        },

        // 2. 授权批准后，通知后端捕获扣款 (Capture)
        onApprove: (data, actions) => {
          _self.payLoading = true;

          return new Promise((resolve, reject) => {
            const query = {
              orderID: data.orderID,
              tradeNo: _self.tradeNo,
            };

            const handleSuccess = (res) => {
              _self.payLoading = false;
              if (res && res.status === "COMPLETED") {
                _self.orderState = "SUCCESS";
                _self.successCallback(res);
                resolve();
              } else {
                _self.orderState = "PAYERROR";
                _self.$message.error("扣款确认失败，请联系客服");
                reject(new Error("Capture failed"));
              }
            };

            const handleError = (err) => {
              _self.payLoading = false;
              _self.orderState = "PAYERROR";
              _self.$message.error("支付验证异常，请重试");
              reject(err);
            };

            if (_self.adapter && _self.adapter.capturePaypalOrder) {
              _self.adapter.capturePaypalOrder(query, handleSuccess, handleError);
            } else {
              fetch(_self.interface.capturePaypalOrder.url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(query),
              })
                .then((r) => r.json())
                .then(handleSuccess)
                .catch(handleError);
            }
          });
        },

        // 3. 用户取消支付
        onCancel: (data) => {
          _self.payLoading = false;
          _self.orderState = "CANCELLED";
          _self.$message.info("已取消支付");
        },

        // 4. 发生异常
        onError: (err) => {
          console.error("PayPal Error:", err);
          _self.payLoading = false;
          _self.orderState = "PAYERROR";
          _self.$message.error("PayPal 支付发生错误，请稍后重试");
        },
      });

      this.paypalButtonsInstance.render("#paypal-button-container");
    },

    // 切换卡片选择
    handleClickCard(index) {
      if (this.selected === index) return;
      this.selected = index;
      this.orderState = "";
    },

    // 支付成功回调
    successCallback(data) {
      this.$message.success("充值成功！");
      if (typeof gtag === "function") {
        gtag("event", "recharge_success");
      }
      this.$emit("recharge-success", data);
    },
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

/* 选中卡片 border 高亮 */
.el-card[active="true"] {
  border-color: #3b82f6;
}
</style>