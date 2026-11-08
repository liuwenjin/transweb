<template>
  <div class="subscription-container">
    <el-card class="subscription-card" shadow="never" body-style="padding: 0; background: transparent;">
      <el-row :gutter="20" class="subscription-plans">
        <el-col
          :xs="24"
          :sm="12"
          :md="8"
          :lg="8"
          :xl="8"
          v-for="plan in plans"
          :key="plan.id"
        >
          <el-card class="plan-card" body-style="padding: 24px; display: flex; flex-direction: column; height: 100%;">
            <h3 class="plan-title">{{ plan.title }}</h3>
            <p class="plan-price"><span class="plan-amount">${{ plan.price.toFixed(2) }}</span><span class="plan-period"> / {{ plan.monthCount }} {{ plan.monthCount === 1 ? "month" : "months" }}</span></p>
            <div class="plan-description">{{ plan.description }}</div>
            <ul class="plan-features">
              <li v-for="(item, index) in functions" :key="index">
                {{ item.content }}
              </li>
            </ul>
            <el-button
              @click="handleDeal(plan)"
              class="plan-button"
              type="primary"
              size="large"
              >{{ plan.buttonText }}</el-button
            >
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "SubscriptionPrice",
  data() {
    return {
      index: 1,
      functions: [
        {
          content: "Canverting document to ppt.",
        },
        {
          content: "Generating illustration by AI.",
        },
      ],
      plans: [
        {
          id: 1,
          title: "1 month subscription",
          monthCount: 1,
          price: 10,
          description: "1 month subscription, flexible choice.  ",
          type: "success",
          buttonText: "Choose this plan",
        },
        {
          id: 2,
          title: "3 month subscription",
          monthCount: 3,
          price: 27.9,
          description: "Subscribe for 3 months and enjoy a discount. ",
          type: "primary",
          buttonText: "Choose this plan",
        },
        {
          id: 3,
          title: "1 year subscription",
          monthCount: 12,
          price: 79.9,
          description: "Subscribe for 1 year and save more. ",
          type: "danger",
          buttonText: "Choose this plan",
        },
      ],
    };
  },
  beforeMount() {
    if (this.index && this.index > 0) {
      this.plans = [this.plans[this.index - 1]];
    }
  },
  methods: {
    handleDeal(plan) {
      webCpu.mitt.emit("handleDeal", plan);
    },
    activePaypal(plan) {
      let _self = this;
      webCpu.CardItem.htmlDialog(
        this._parent.card,
        plan.title,
        "<div id='paypal-button-container' style='text-align: center; padding-top: 20px;'></div>",
        {
          closeType: "back",
          renderMode: "stack",
          dialogName: "paypalDialogCard",
          titleStyle: {
            background: "var(--el-color-primary-light-9)",
            color: "var(--el-color-primary)",
          },
          callback: function () {
            paypal
              .Buttons({
                createOrder: function (data, actions) {
                  let item = actions.order.create({
                    purchase_units: [
                      {
                        amount: {
                          value: Number(plan.price), // 替换为你要支付的金额
                        },
                      },
                    ],
                  });
                  console.log("create order:", item);
                  return item;
                },
                onApprove: function (data, actions) {
                  return actions.order.capture().then(function (details) {
                    plan.order = details;
                    console.log("order info", details);
                    webCpu.mitt.emit("subscriptionSuccess", plan);
                    // 这里可以处理订单成功后的逻辑，比如更新数据库等
                  });
                },
                onError: function (err) {
                  console.error(err);
                  _self.$message({
                    type: "warning",
                    message: "交易出现错误，请重试。"
                  });
                },
              })
              .render("#paypal-button-container"); // 渲染 PayPal 按钮
          },
        },
        {
          width: "500px",
          height: "300px",
          padding: "30px 0px"
        }
      );
    },
  },
};
</script>

<style scoped>
.subscription-container {
  max-width: 1200px;
  margin: 50px auto;
  padding: 20px;
}

.subscription-card {
  margin-bottom: 20px;
}

.subscription-plans {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.plan-card {
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out;
}

.plan-card:hover {
  transform: translateY(-5px);
}

.plan-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.plan-price {
  font-size: 24px;
  color: #409eff;
  margin-bottom: 10px;
}

.plan-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
}

.plan-button {
  width: 100%;
}

/* ==========================================================================
   GOV.UK 服务设计规范适配层
   - 纸白 / 墨色 / GDS 蓝绿；直角、无阴影
   - 正文 19px，辅助信息 16px；黄色键盘焦点
   ========================================================================== */
.subscription-container {
  --gds-black: #0b0c0c;
  --gds-blue: #1d70b8;
  --gds-green: #00703c;
  --gds-green-hover: #005a30;
  --gds-green-shadow: #002d18;
  --gds-yellow: #ffdd00;
  --gds-grey: #f3f2f1;
  --gds-border: #b1b4b6;
  --gds-secondary: #505a5f;
  --gds-font: "GDS Transport", Arial, "Noto Sans SC", "Source Han Sans SC",
    "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;

  max-width: 1020px;
  margin: 40px auto;
  padding: 0 15px;
  font-family: var(--gds-font);
  color: var(--gds-black);
  font-size: 1.1875rem;
  line-height: 1.5;

  /* Element Plus 主题变量：按钮、卡片与输入框统一为 GDS 外观 */
  --el-color-primary: var(--gds-green);
  --el-color-primary-light-3: var(--gds-green-hover);
  --el-color-primary-dark-2: var(--gds-green-shadow);
  --el-border-radius-base: 0;
  --el-border-color: var(--gds-border);
  --el-border-color-light: var(--gds-border);
  --el-text-color-primary: var(--gds-black);
  --el-text-color-regular: var(--gds-black);
  --el-font-size-base: 1.1875rem;
  --el-component-size-large: 44px;
}

.subscription-container .subscription-card {
  margin-bottom: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.subscription-container .subscription-plans {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: stretch;
  gap: 20px;
}

.subscription-container .subscription-plans .el-col {
  flex: 1 1 260px;
  width: auto;
  max-width: 320px;
}

.subscription-container .subscription-plans .el-col {
  display: flex;
}

.subscription-container .plan-card {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #ffffff;
  border: 1px solid var(--gds-border);
  border-radius: 0;
  box-shadow: none;
  overflow: visible;
  transition: border-color 0.15s ease;
}

.subscription-container .plan-card:hover {
  transform: none;
  border-color: var(--gds-black);
  box-shadow: none;
}

.subscription-container .plan-title {
  margin: 0 0 10px;
  font-family: var(--gds-font);
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.25;
  color: var(--gds-black);
}

.subscription-container .plan-price {
  margin: 0 0 15px;
  color: var(--gds-black);
  font-variant-numeric: tabular-nums;
}

.subscription-container .plan-amount {
  display: block;
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.09;
}

.subscription-container .plan-period {
  display: block;
  margin-top: 5px;
  font-size: 1rem;
  color: var(--gds-secondary);
}

.subscription-container .plan-description {
  margin: 0 0 20px;
  font-size: 1.1875rem;
  line-height: 1.5;
  color: var(--gds-black);
}

.subscription-container .plan-features {
  margin: 0 0 25px;
  padding-left: 20px;
  color: var(--gds-black);
  font-size: 1rem;
  line-height: 1.5;
}

.subscription-container .plan-features li + li {
  margin-top: 8px;
}

.subscription-container .plan-button.el-button {
  width: 100%;
  margin-top: auto;
  min-height: 44px;
  padding: 8px 10px 7px;
  border: 2px solid transparent;
  border-radius: 0;
  background: var(--gds-green);
  color: #ffffff;
  font-family: var(--gds-font);
  font-size: 1.1875rem;
  font-weight: 400;
  letter-spacing: 0;
  box-shadow: 0 2px 0 var(--gds-green-shadow);
}

.subscription-container .plan-button.el-button:hover {
  background: var(--gds-green-hover);
  border-color: var(--gds-green-hover);
  color: #ffffff;
  box-shadow: 0 2px 0 var(--gds-green-shadow);
  transform: none;
}

.subscription-container .plan-button.el-button:active {
  top: 2px;
  box-shadow: none;
  transform: none;
}

.subscription-container .plan-button.el-button:focus-visible {
  outline: 3px solid transparent;
  outline-offset: 0;
  background: var(--gds-yellow);
  border-color: var(--gds-yellow);
  color: var(--gds-black);
  box-shadow: 0 2px 0 var(--gds-black);
}

@media (max-width: 640px) {
  .subscription-container {
    margin: 20px auto;
  }
}
</style>