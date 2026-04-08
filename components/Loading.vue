<template>
  <!-- 全屏加载蒙层 -->
  <view class="loading-container" v-show="show">
    <!-- 动画 -->
    <view class="loading-spinner"></view>
    <!-- 文字 -->
    <text class="loading-text">{{ text }}</text>
  </view>
</template>

<script>
export default {
  name: "Loading",
  props: {
    show: {
      type: Boolean,
      default: false
    },
    // 提示文字
    text: {
      type: String,
      default: "加载中..."
    }
  }
};
</script>

<style scoped>
/* 全屏蒙层 */
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #eee;
  border-top: 4px solid #007aff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: #666;
}
</style>