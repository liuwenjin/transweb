<template>
  <div class="tw-h-full tw-overflow-auto">
    <div class="tw-p-8 tw-max-w-2xl tw-mx-auto">
      <div class="tw-bg-white tw-p-6 tw-rounded-xl tw-shadow-sm">
        <p class="tw-text-lg tw-mb-6">
          {{ questions[currentQuestionIndex].question }}
        </p>

        <el-radio-group v-model="selectedAnswer" @change="handleAnswerChange">
          <el-radio
            class="tw-w-full"
            v-for="(option, index) in questions[currentQuestionIndex].options"
            :key="index"
            :value="index"
          >
            {{ option }}
          </el-radio>

          <!-- ✅ 新增“其他”选项 -->
          <el-radio
            style="
              line-height: 30px;
              height: 30px;
              display: inline-block;
              width: 60px;
              margin-bottom: 0px;
              vertical-align: middle;
            "
            :value="'other'"
            >其他</el-radio
          >
          <div
            style="
              display: inline-block;
              width: calc(100% - 90px);
              vertical-align: middle;
            "
            v-if="selectedAnswer === 'other'"
          >
            <el-input
              v-model="customAnswer"
              size="small"
              @change="customAnswerChange"
              placeholder="请输入你的答案"
              clearable
            ></el-input>
          </div>
        </el-radio-group>

        <!-- 当选择“其他”时，显示输入框 -->
        <div class="tw-flex tw-justify-between tw-mt-8">
          <el-button
            v-if="currentQuestionIndex > 0"
            class="tw-rounded-md"
            @click="prevQuestion"
          >
            上一题
          </el-button>

          <el-button
            v-if="currentQuestionIndex === 0"
            class="tw-rounded-md"
            @click="handleGenerateDirect"
          >
            <i class="bi bi-lightbulb"></i> 直接生成
          </el-button>

          <el-button
            v-if="currentQuestionIndex < questions.length - 1"
            class="tw-font-semibold tw-rounded-md"
            type="primary"
            @click="handleAnswer"
          >
            下一题
          </el-button>

          <el-button
            v-if="currentQuestionIndex === questions.length - 1"
            class="tw-font-semibold tw-rounded-md"
            type="primary"
            @click="handleFinish()"
          >
            <i class="bi bi-lightbulb"></i> 开始生成
          </el-button>
        </div>

        <div
          class="tw-flex tw-mt-2 tw-justify-center tw-text-sm tw-text-gray-500"
        >
          <el-progress
            class="tw-w-full"
            :text-inside="true"
            :stroke-width="20"
            color="#999"
            :percentage="
              Number(((currentQuestionIndex + 1) / questions.length).toFixed(2)) * 100
            "
          ></el-progress>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentQuestionIndex: 0,
      selectedAnswer: null,
      customAnswer: "",
      answers: [null, null, null],
      questions: [
        {
          question: "你希望这个应用主要解决什么问题？",
          options: [
            "提升效率，自动化重复任务",
            "增强用户互动与社交连接",
            "辅助学习或个人成长",
          ],
        },
        {
          question: "你的目标用户最可能在什么场景下使用它？",
          options: [
            "通勤途中或碎片时间",
            "工作或学习专注时段",
            "睡前放松或情绪调节时",
          ],
        },
        {
          question: "你更看重这个应用的哪个方面？",
          options: [
            "界面简洁，上手快",
            "功能强大，可定制",
            "带来情绪满足或成就感",
          ],
        },
      ],
    };
  },
  created() {
    this.answers.length = this.questions.length;
  },
  methods: {
    handleAnswerChange() {
      // 清空“其他”内容，防止切换选项时残留
      if (this.selectedAnswer !== "other") {
        this.customAnswer = "";
      }
      this.handleAnswer();
    },
    customAnswerChange() {
      if (this.selectedAnswer === "other") {
        this.answers[this.currentQuestionIndex] = this.customAnswer.trim();
      }
    },
    handleAnswer() {
      if (this.selectedAnswer === null) {
        this.$message({
          type: "warning",
          message: "请先选择一个选项后再继续",
        });
        return;
      }
      // ✅ 保存答案逻辑
      if (this.selectedAnswer === "other") {
        if (!this.customAnswer.trim()) {
          this.$message({
            type: "warning",
            message: "请输入你的自定义答案",
          });
          return;
        }
        this.answers[this.currentQuestionIndex] = this.customAnswer.trim();
      } else {
        this.answers[this.currentQuestionIndex] = this.selectedAnswer;
      }
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.nextQuestion();
      }
    },
    prevQuestion() {
      this.currentQuestionIndex--;
      const prevAnswer = this.answers[this.currentQuestionIndex];
      if (typeof prevAnswer === "string") {
        this.selectedAnswer = "other";
        this.customAnswer = prevAnswer;
      } else {
        this.selectedAnswer = prevAnswer;
        this.customAnswer = "";
      }
    },
    nextQuestion() {
      this.currentQuestionIndex++;
      const nextAnswer = this.answers[this.currentQuestionIndex];
      if (typeof nextAnswer === "string") {
        this.selectedAnswer = "other";
        this.customAnswer = nextAnswer;
      } else {
        this.selectedAnswer = nextAnswer;
        this.customAnswer = "";
      }
    },
    handleFinish(flag) {
      if (!flag && !this.answers.every((a) => a !== null)) {
        this.$message({
          type: "warning",
          message: "请完成所有题目后再生成",
        });
        return;
      }
      let results = [];
      if (!flag) {
        results = this.questions.map((item, index) => {
          const answer = this.answers[index];
          return `${index + 1}: ${item.question} -> ${
            typeof answer === "number" ? item.options[answer] : answer
          }`;
        });
      }
      webCpu.mitt.emit("confirmTask", results);
    },
    handleGenerateDirect() {
      this.handleFinish(true);
    },
  },
};
</script>

<style>
.tw-font-semibold {
  font-weight: 600;
}

.tw-rounded-md {
  border-radius: 0.375rem;
}

.tw-text-gray-500 {
  color: #6b7280;
}

.tw-bg-indigo-600 {
  background-color: #4f46e5;
}

.tw-text-white {
  color: #ffffff;
}
</style>
