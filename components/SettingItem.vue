<template>
  <view class="setting-item" @click="handleClick">
    <text class="item-text">{{ title }}</text>
    <view class="item-right">
      <text v-if="desc" class="item-desc">{{ desc }}</text>
      <switch v-else-if="showSwitch" :checked="switchValue" @change="handleSwitchChange" />
      <text v-else class="item-arrow">></text>
    </view>
  </view>
</template>

<script>
export default {
  name: "SettingItem",
  props: {
    title: {
      type: String,
      required: true
    },
    desc: String,
    showSwitch: {
      type: Boolean,
      default: false
    },
    switchValue: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleClick() {
      this.$emit("click");
    },
    handleSwitchChange(e) {
      this.$emit("switch-change", e.detail.value);
    }
  }
};
</script>

<style scoped>
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}
.item-text {
  font-size: 32rpx;
  color: #333;
}
.item-right {
  display: flex;
  align-items: center;
}
.item-desc {
  font-size: 28rpx;
  color: #999;
}
.item-arrow {
  font-size: 32rpx;
  color: #999;
}
</style>