<template>
  <div class="feedback-container">
    <div v-if="currentStep < 4" class="header-section">
      <el-image
        class="back-icon"
        @click="goBack()"
        style="width: 40px; height: auto"
        src="https://transweb-1254183942.cos.ap-beijing.myqcloud.com/tidyMeApp/icons/back.webp"
      ></el-image>
      <div class="title-area">
        <h2>反馈领积分</h2>
        <p class="subtitle">(完成反馈，赠送20积分)</p>
      </div>
    </div>

    <div v-else class="success-header">
      <el-button
        text
        style="color: #fff"
        class="el-icon-close close-icon"
        @click="closeAll()"
      >
        <el-icon><close-bold /></el-icon>
      </el-button>
    </div>

    <div
      class="content-scroll-view"
      :class="{ 'center-content': currentStep === 4 }"
    >
      <div v-if="currentStep === 1" class="step-content">
        <div class="question-card">
          <p class="question-title">{{ steps[0].title }}</p>
          <div class="options-grid">
            <div
              v-for="opt in options[steps[0].prop]"
              :key="opt"
              :class="['option-item', { active: form[steps[0].prop].includes(opt) }]"
              @click="toggleMultiSelect('purposes', opt)"
            >
              {{ opt }}
            </div>
          </div>
        </div>
        <div class="question-card">
          <p class="question-title">{{steps[1].title}}</p>
          <div class="options-grid">
            <div
              v-for="opt in options[steps[1].prop]"
              :key="opt"
              :class="['option-item', { active: form[steps[1].prop].includes(opt) }]"
              @click="toggleMultiSelect('effects', opt)"
            >
              {{ opt }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="currentStep === 2" class="step-content">
        <div class="question-card">
          <p class="question-title">{{ steps[2].title }}</p>
          <div class="options-grid">
            <div
              v-for="opt in options[steps[2].prop]"
              :key="opt"
              :class="['option-item', { active: form[steps[2].prop] === opt }]"
              @click="form[steps[2].prop] = opt"
            >
              {{ opt }}
            </div>
          </div>
        </div>
        <div class="question-card">
          <p class="question-title">{{ steps[3].title }}</p>
          <div class="options-grid">
            <div
              v-for="opt in options[steps[3].prop]"
              :key="opt"
              :class="['option-item', { active: form[steps[3].prop] === opt }]"
              @click="form[steps[3].prop] = opt"
            >
              {{ opt }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="currentStep === 3" class="step-content">
        <div class="question-card">
          <p class="question-title">{{steps[4].title}}</p>
          <div class="rate-container">
            <el-rate
              v-model="form[steps[4].prop]"
              :max="5"
              icon-class="el-icon-star-on"
            ></el-rate>
          </div>
        </div>
        <div class="question-card">
          <p class="question-title">{{ steps[5].title }}</p>
          <el-input
            type="textarea"
            :rows="8"
            placeholder="请留下您的其他建议..."
            v-model="form[steps[5].prop]"
            class="custom-textarea"
          ></el-input>
        </div>
      </div>

      <div v-if="currentStep === 4" class="success-content">
        <div class="success-card">
          <h3 class="success-title">感谢您的反馈！</h3>
          <div class="badge-container">
            <el-image
              fit="contain"
              style="width: 150px; height: 150px"
              src="https://transweb-1254183942.cos.ap-beijing.myqcloud.com/tidyMeApp/icons/success.png"
            ></el-image>
          </div>
        </div>

        <div class="success-info">
          <p class="points-text">
            <i class="el-icon-coin"></i> 20积分已存入账户！
          </p>
          <p class="daily-tips">每天登录还能再领积分哦。</p>

          <div class="share-invite">
            <p>分享给好友，</p>
            <p>快点一起收拾吧！</p>
          </div>

          <div class="share-btn" @click="handleShare">快点 分享给好友</div>
        </div>
      </div>
    </div>

    <div v-if="currentStep < 4" class="footer-section">
      <div class="pagination-dots">
        <span
          v-for="i in 3"
          :key="i"
          :class="['dot', { active: currentStep === i }]"
        ></span>
      </div>
      <div class="action-btn" @click="handleNext">
        <el-button
          style="color: #fff"
          v-if="currentStep === 3"
          :loading="loading"
          :disabled="loading"
          text
          >提交反馈/领取积分</el-button
        >
        <span v-else>继 续</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentStep: 1,
      loading: false,
      steps: [
        {
          prop: "purposes",
          title: "1、你的使用目的（可多选）",
        },
        {
          prop: "effects",
          title: "2、生成效果如何（可多选）",
        },
        {
          prop: "frequencies",
          title: "3、预期使用频率（单选）",
        },
        {
          prop: "recommend",
          title: "4、推荐好友使用（单选）",
        },
        {
          prop: "rating",
          title: "5、整体使用满意度",
        },
        {
          prop: "suggestion",
          title: "6、其他建议",
        },
      ],
      options: {
        purposes: [
          "获得生活收拾方案",
          "工作任务/设计参考",
          "AI 娱乐尝试",
          "其他",
        ],
        effects: [
          "效果很惊艳",
          "看起来不错",
          "质量一般",
          "风格不准",
          "生成太慢",
          "其他",
        ],
        frequencies: ["每天会用到", "经常会用到", "偶尔会用到", "基本用不到"],
        recommend: ["会主动推荐", "需要时推荐", "不太推荐", "绝不推荐"],
      },

      form: {
        purposes: [],
        effects: [],
        frequency: "",
        recommend: "",
        rating: -1,
        suggestion: "",
      },
      interface: {
        sendFeedback: {
          url: "/user/sendFeedback",
          method: "post",
        },
      },
    };
  },
  mounted() {
    this.adapter = webCpu.initAdapter(this.interface);
  },
  methods: {
    goBack() {
      if (this.currentStep > 1 && this.currentStep < 5) {
        this.currentStep--;
      } else {
        this.closeAll();
      }
    },
    closeAll() {
      if (window.webCpu && webCpu.CardItem) {
        webCpu.CardItem.dismissMask(this.parentItem || document.body);
      }
    },
    toggleMultiSelect(key, val) {
      const index = this.form[key].indexOf(val);
      if (index > -1) {
        this.form[key].splice(index, 1);
      } else {
        this.form[key].push(val);
      }
    },
    handleNext() {
      if(!this.checkInput()) {
        this.$message({
          type: "warning",
          message: "有题目还没回答。"
        });
        return false;
      }
      if (this.currentStep < 3) {
        this.currentStep++;
      } else {
        this.submitFeedback();
      }
    },
    checkInput() {
      let ret = true;
      let arr = [ this.currentStep * 2 - 2, this.currentStep * 2 - 1];
      for(let i = 0; i < arr.length; i++) {
        let prop = this.steps[arr[i]].prop;
        if(this.form[prop] && this.form[prop].length !== 0) {
          continue;
        }
        else {
          ret = false;
          break;
        }
      }
      return ret;
    },
    submitFeedback() {
      console.log("提交的数据：", this.form);
      // 模拟提交成功，进入设计稿的第4步
      this.loading = true;
      this.adapter.sendFeedback(this.form, (tData) => {
        this.loading = false;
        if (tData.ret === 1) {
          this.$message("暂时不支持重复反馈。");
          this.closeAll();
        } else {
          this.currentStep = 4;
        }
      });
    },
    handleShare() {
      this.$message({
        message: "调用分享功能...",
        type: "info",
      });
    },
  },
};
</script>

<style scoped>
/* 保持原有的背景样式 */
.feedback-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #1a1a1a;
  background-image: url("https://transweb-1254183942.cos.ap-beijing.myqcloud.com/tidyMeApp/icons/bg.webp");
  /* 核心：保持比例缩放，确保覆盖整个容器（不会变形，但超出部分会被裁掉） */
  background-size: cover;

  /* 核心：居中显示，确保图片最中间的内容可见 */
  background-position: center;

  /* 辅助：防止图片在容器过大时产生平铺重复 */
  background-repeat: no-repeat;
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

/* 头部样式 */
.header-section {
  position: relative;
  text-align: center;
  padding-top: 40px;
  margin-bottom: 30px;
}
.success-header {
  padding: 10px 0;
  height: 40px;
}
.close-icon {
  font-size: 32px;
  cursor: pointer;
  color: #fff;
}
.back-icon {
  position: absolute;
  left: 0;
  top: 0;
  cursor: pointer;
}
.title-area h2 {
  font-size: 24px;
  margin: 0;
  letter-spacing: 2px;
}
.subtitle {
  font-size: 14px;
  color: #ccc;
  margin-top: 8px;
}

/* 内容区域 */
.content-scroll-view {
  flex: 1;
  overflow-y: auto;
}
.center-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 选项卡片与网格 (步骤1-3) */
.question-card {
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}
.question-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}
.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}
.option-item {
  border: 1px solid #444;
  border-radius: 8px;
  padding: 12px 5px;
  text-align: center;
  font-size: 14px;
  cursor: pointer;
}
.option-item.active {
  background-color: #fff;
  color: #000;
  border-color: #fff;
  font-weight: bold;
}

/* 步骤4：成功页样式还原 */
.success-content {
  text-align: center;
  animation: fadeIn 0.5s ease;
}
.success-card {
  background-color: #0d0d0d;
  padding: 40px 20px;
  margin-bottom: 30px;
}
.success-title {
  font-size: 22px;
  margin-bottom: 30px;
  letter-spacing: 1px;
}
.badge-container {
  display: flex;
  justify-content: center;
}

.success-info {
  padding: 0 20px;
}
.points-text {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}
.daily-tips {
  font-size: 16px;
  color: #eee;
  margin-bottom: 30px;
}
.share-invite {
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 40px;
}
.share-btn {
  background-color: #1a1a1a;
  border: 1px solid #333;
  color: #fff;
  padding: 16px 0;
  border-radius: 12px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
}

/* 底部通用组件 */
.footer-section {
  margin-top: auto;
  text-align: center;
  padding-bottom: 20px;
}
.pagination-dots {
  margin-bottom: 20px;
}
.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid #fff;
  margin: 0 8px;
}
.dot.active {
  background-color: #fff;
}
.action-btn {
  background-color: #0d0d0d;
  color: #fff;
  padding: 15px 0;
  border-radius: 12px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  border: 1px solid #333;
}

/* 基础UI重置 */
.custom-textarea .el-textarea__inner {
  background-color: #f5f5f5;
  border: none;
  border-radius: 12px;
  color: #333;
}
.rate-container .el-icon-star-on {
  font-size: 35px;
  color: #ffcc00 !important;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>