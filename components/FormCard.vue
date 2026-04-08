<template>
  <!-- 半透明卡片容器：内部可放任意内容 -->
  <view class="card-wrapper">
    <view class="card-body">
      <!-- 标题 -->
      <view class="card-title" v-if="title">
        {{ title }}
      </view>

      <!-- 插槽：你想放什么就放什么！ -->
      <slot />
    </view>
  </view>
</template>

<script>
export default {
  name: 'FormCard',
  props: {
    title: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.card-wrapper {
  width: 90%;
  margin: 20rpx auto;
}

.card-body {
  background: rgba(255, 255, 255, 0.88);
  border-radius: 10rpx;
  padding: 30rpx;
  box-sizing: border-box;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
  color: #333;
}
</style>