<template>
    <view class="card user-card">
      <view class="user-card-left">
        <view class="avatar-circle" @tap="$emit('upload-avatar')">
          <image
            v-if="userInfo.avatarUrl"
            class="avatar-img"
            :src="userInfo.avatarUrl"
            mode="aspectFill"
          />
          <text v-else class="avatar-text">上传头像</text>
        </view>
      </view>
      <view class="user-card-right">
        <!-- 核心修改：外层加容器，让名字行占满宽度 -->
        <view class="user-name-container">
          <view class="user-name-row">
            <text class="user-name">{{ userInfo.name }}</text>
            <text class="edit-icon" @tap="$emit('edit')">✎</text>
          </view>
        </view>
        <text class="user-subtitle">{{ userInfo.grade }} {{ userInfo.college }}</text>
        <AuthStatus class="user-auth-status" @tap="$emit('show-auth')" />
      </view>
    </view>
  </template>
  
  <script>
  import AuthStatus from './AuthStatus.vue'
  
  export default {
    name: 'UserInfo',
    components: {
      AuthStatus
    },
    props: {
      userInfo: {
        type: Object,
        default: () => ({})
      }
    }
  }
  </script>
  
  <style scoped lang="scss">
  .user-card {
    display: flex;
    align-items: flex-start; /* 顶部对齐，更美观 */
    padding: 20rpx;
  }
  
  .user-card-left {
    margin-right: 32rpx;
  }
  
  .avatar-circle {
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
    border: 4rpx solid #355ac9;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  
  .avatar-text {
    font-size: 24rpx;
    color: #355ac9;
  }

  .avatar-img {
    width: 100%;
    height: 100%;
  }
  
  .user-card-right {
    flex: 1; /* 占满剩余宽度 */
  }
  
  /* 新增容器：确保名字行能撑满右侧区域 */
  .user-name-container {
    width: 100%;
  }
  
  .user-name-row {
    display: flex;
    align-items: center;
    justify-content: space-between; /* 关键：名字左、铅笔右 */
    width: 100%; /* 占满容器宽度 */
  }
  
  .user-name {
    font-size: 32rpx;
    font-weight: 600;
    color: #222;
  }
  
  .edit-icon {
    font-size: 28rpx;
    color: #666;
    margin-left: 0; /* 移除默认左边距 */
  }
  
  .user-subtitle {
    margin-top: 8rpx;
    font-size: 24rpx;
    color: #888;
    display: block; /* 独占一行 */
  }
  
  .user-auth-status {
    margin-top: 16rpx;
    display: inline-block;
  }
  </style>