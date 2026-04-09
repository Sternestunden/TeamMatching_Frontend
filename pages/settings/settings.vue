<template>
  <view class="settings-page">
    <!-- 账号与安全 -->
    <view class="section">
      <view class="section-title">账号与安全</view>
      <view class="card">
        <view class="item" @click="handleModifyPwd">
          <text class="item-label">修改密码</text>
          <view class="item-arrow">&gt;</view>
        </view>
        <view class="item divider" @click="handleCampusAuth">
          <text class="item-label">校园身份认证</text>
          <view class="item-badge">已认证</view>
        </view>
      </view>
    </view>

    <!-- 通知设置 -->
    <view class="section">
      <view class="section-title">通知设置</view>
      <view class="card">
        <view class="item">
          <text class="item-label">新消息通知</text>
          <switch class="item-switch" :checked="notifyEnabled" @change="handleNotifyChange" />
        </view>
      </view>
    </view>

    <!-- 通用 -->
    <view class="section">
      <view class="section-title">通用</view>
      <view class="card">
        <view class="item" @click="handleClearCache">
          <text class="item-label">清除缓存</text>
          <view class="item-arrow">&gt;</view>
        </view>
		<!--
        <view class="item divider" @click="handleAboutUs">
          <text class="item-label">关于我们</text>
          <view class="item-arrow">&gt;</view>
        </view>
		-->
      </view>
    </view>

    <!-- 底部退出登录按钮 -->
    <view class="logout-wrapper">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      notifyEnabled: true
    }
  },
  methods: {
    handleModifyPwd() {
      uni.showToast({ title: '跳转到修改密码', icon: 'none' });
    },
    handleCampusAuth() {
      uni.showToast({ title: '已认证', icon: 'none' });
    },
    handleNotifyChange(e) {
      this.notifyEnabled = e.detail.value;
      uni.showToast({
        title: this.notifyEnabled ? '已开启通知' : '已关闭通知',
        icon: 'none'
      });
    },
    handleClearCache() {
      uni.showModal({
        title: '提示',
        content: '确定要清除缓存吗？',
        success: (res) => {
          if (res.confirm) {
            uni.clearStorageSync();
            uni.showToast({ title: '清除成功', icon: 'success' });
          }
        }
      });
    },
    handleAboutUs() {
      uni.showToast({ title: '关于我们', icon: 'none' });
    },
    handleLogout() {
      uni.showModal({
        title: '退出登录',
        content: '确定要退出当前账号吗？',
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            uni.removeStorageSync('access-token');
            uni.removeStorageSync('userInfo');
            uni.showToast({ title: '已退出登录', icon: 'success', duration: 1500 });
            setTimeout(() => {
              uni.reLaunch({ url: '/pages/login/login' });
            }, 1500);
          }
        }
      });
    }
  }
};
</script>

<style scoped>
page {
  background-color: #f7f8fa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Microsoft YaHei", 黑体, Arial, sans-serif;
}

.settings-page {
  background-color: #f7f8fa;
  min-height: 100vh;
  padding: 20px 20px 0;
}

.section {
  margin-bottom: 24px;
}
.section-title {
  font-size: 16px;
  color: #999;
  margin: 0 0 12px 8px;
}

.card {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}
.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  font-size: 18px;
  color: #333333;
}
.item.divider {
  border-top: 1px solid #f0f0f0;
}

.item-label {
  font-size: 18px;
  color: #222;
}
.item-arrow {
  color: #bbbbbb;
  font-size: 18px;
  font-weight: bold;
}
.item-badge {
  color: #003399;
  font-size: 18px;
  font-weight: 500;
}

/* 开关样式：背景条为蓝色，滑块为白色 */
.item-switch {
  transform: scale(0.9);
}
::v-deep .uni-switch-input {
  width: 37pt !important;
  height: 20pt !important;
}
/* 开关背景条：与ECNU已认证一致的蓝色 #003399 */
::v-deep .uni-switch-input::before {
  background-color: #003399 !important;
  border-radius: 10pt !important;
}
/* 开关滑块：白色 #ffffff */
::v-deep .uni-switch-input::after {
  background-color: #ffffff !important;
  border-radius: 8pt !important;
  width: 16pt !important;
  height: 16pt !important;
  top: 2pt !important;
  right: 2pt !important;
}

.logout-wrapper {
  margin-top: 30px;
  padding: 0;
}
.logout-btn {
  width: 100%;
  height: 50px;
  background-color: #ffffff;
  color: #003399;
  border: 1px solid #e5e5e5;
  border-radius: 25px;
  font-size: 18px;
  font-weight: 500;
  padding: 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}
::v-deep .logout-btn::after {
  border: none;
}
</style>