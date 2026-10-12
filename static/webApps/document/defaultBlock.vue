<template>
  <div
    class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-screen tw-bg-gradient-to-br tw-from-pink-400 tw-to-blue-500 tw-text-white tw-text-center"
  >
    <!-- 吉祥物：卡通小火箭 -->
    <div class="tw-animate-bounce-slow">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        class="tw-w-24 tw-h-24 tw-mb-6"
      >
        <!-- 火箭主体 -->
        <path
          d="M32 2c8 6 12 18 12 28s-4 22-12 32c-8-10-12-22-12-32S24 8 32 2z"
          fill="#fff"
          stroke="#ec4899"
          stroke-width="2"
        />
        <!-- 火箭窗户 -->
        <circle
          cx="32"
          cy="22"
          r="6"
          fill="#3b82f6"
          stroke="#fff"
          stroke-width="2"
        />
        <!-- 火箭尾翼 -->
        <path
          d="M20 38l-6 8c4 2 8 4 12 6-2-4-4-8-6-14zM44 38c-2 6-4 10-6 14 4-2 8-4 12-6l-6-8z"
          fill="#fbbf24"
          stroke="#fff"
          stroke-width="2"
        />
        <!-- 火焰 -->
        <path
          d="M28 58c0 4 2 6 4 6s4-2 4-6-4-6-4-12c0 6-4 8-4 12z"
          fill="#f87171"
        />
      </svg>
    </div>

    <!-- 主标题 -->
    <h1 class="tw-text-5xl md:tw-text-6xl tw-font-extrabold tw-animate-bounce">
      🚧 建设中...
    </h1>

    <!-- 副标题 -->
    <p class="tw-mt-4 tw-text-lg md:tw-text-xl tw-opacity-90">
      我们正在加速起飞，敬请期待 ✨
    </p>

    <!-- 按钮 -->
    <button
      @click="backHome()"
      class="tw-mt-8 tw-bg-white tw-text-pink-500 tw-font-semibold tw-px-6 tw-py-2 tw-rounded-full tw-shadow-lg hover:tw-scale-105 tw-transition-transform"
    >
      返回首页
    </button>
  </div>
</template>

<script>
export default {
  name: "UnderConstruction",
  methods: {
    backHome() {
      let agent = WebTool.urlQuery(location.href, "agent");
      if (!agent && this.currentApp && this.currentApp.publishInfo) {
        agent = this.currentApp.publishInfo.folderName;
      }
      if (agent) {
        location.href = location.origin + "?agent=" + agent;
      } else {
        location.href = location.origin;
      }
    },
  },
};
</script>

<style scoped>
/* 自定义慢速浮动动画 */
@keyframes bounce-slow {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}
.tw-animate-bounce-slow {
  animation: bounce-slow 3s infinite;
}
</style>
