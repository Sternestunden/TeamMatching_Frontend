<template>
  <view class="nav-bar">
    <!-- 左侧返回按钮 -->
    <view class="left-btn" @click="goBack" v-if="showBack">
      <text>←</text>
    </view>
    <!-- 标题 -->
    <view class="title">{{ title }}</view>
    <!-- 右侧按钮 -->
    <view class="right-btn" @click="rightClick" v-if="rightText">
      <text>{{ rightText }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: "NavBar",
  props: {
    title: { type: String, default: "默认标题" },
    showBack: { type: Boolean, default: true },
    rightText: { type: String, default: "" }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    rightClick() {
      this.$emit("right-click"); // 触发父组件事件
    }
  }
};
</script>

<style scoped>
.nav-bar {
  height: 44px;
  line-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-bottom: 1px solid #eee;
}
.left-btn {
  position: absolute;
  left: 10px;
  font-size: 16px;
}
.title {
  font-size: 16px;
  font-weight: bold;
}
.right-btn {
  position: absolute;
  right: 10px;
  font-size: 14px;
  color: #007aff;
}
</style>