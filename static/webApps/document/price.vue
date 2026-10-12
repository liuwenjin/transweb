<template>
  <div class="subscription-container">
    <el-card class="subscription-card" shadow="hover">
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
          <el-card class="plan-card" body-style="padding: 20px;">
            <div class="plan-title">{{ plan.title }}</div>
            <div class="plan-price">Price: ${{ plan.price.toFixed(2) }}</div>
            <div class="plan-description">{{ plan.description }}</div>
            <ul style="padding-inline-start: 13px; font-size: 12px">
              <li v-for="(item, index) in functions" :key="index">
                {{ item.content }}
              </li>
            </ul>
            <el-button
              @click="handleDeal(plan)"
              class="plan-button"
              :type="plan.type"
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
</style>