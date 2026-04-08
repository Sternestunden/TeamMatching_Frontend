<template>
    <view class="user-page">
      <view class="card profile-card">
        <view class="profile-avatar" @tap="onUploadAvatar">
          <view class="avatar-circle">
            <text class="avatar-text">上传头像</text>
          </view>
        </view>
        <view class="form-item">
          <text class="form-label">姓名</text>
          <input class="form-input" v-model="form.name" placeholder="请输入姓名" />
        </view>
        <view class="form-item">
          <text class="form-label">年级</text>
          <input class="form-input" v-model="form.grade" placeholder="如 25级" />
        </view>
        <view class="form-item">
          <text class="form-label">学院</text>
          <input class="form-input" v-model="form.college" placeholder="请输入学院名称" />
        </view>
        <view class="form-item">
          <text class="form-label">个性签名</text>
          <textarea
            class="form-textarea"
            v-model="form.bio"
            placeholder="简单介绍一下自己和擅长方向"
            auto-height
          />
        </view>
        <button class="btn btn-primary" @tap="onSave">保存修改</button>
      </view>
    </view>
  </template>
  
  <script>
  export default {
    data() {
      return {
        form: {
          name: '王小明',
          grade: '25级',
          college: '软件工程学院',
          bio: ''
        }
      }
    },
    methods: {
      onUploadAvatar() {
        uni.showToast({
          title: '上传头像功能待接入',
          icon: 'none'
        })
      },
      onSave() {
        // 这里后续可以接后端保存接口
        uni.showToast({
          title: '已保存',
          icon: 'success'
        })
      }
    }
  }
  </script>
  
  <style lang="scss">
  .user-page {
    padding: 32rpx;
    background-color: #f5f7fb;
    min-height: 100vh;
    box-sizing: border-box;
  }
  
  .card {
    background-color: #fff;
    border-radius: 24rpx;
    padding: 24rpx 28rpx 40rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
  }
  
  .profile-card {
    margin-top: 16rpx;
  }
  
  .profile-avatar {
    display: flex;
    justify-content: center;
    margin-bottom: 24rpx;
  }
  
  .avatar-circle {
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
    border: 4rpx solid #355ac9;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .avatar-text {
    font-size: 24rpx;
    color: #355ac9;
  }
  
  .form-item {
    margin-top: 16rpx;
  }
  
  .form-label {
    font-size: 24rpx;
    color: #555;
  }
  
  .form-input {
    margin-top: 8rpx;
    padding: 16rpx 20rpx;
    border-radius: 16rpx;
    border: 2rpx solid #e0e0ea;
    font-size: 24rpx;
  }
  
  .form-textarea {
    margin-top: 8rpx;
    padding: 16rpx 20rpx;
    border-radius: 16rpx;
    border: 2rpx solid #e0e0ea;
    font-size: 24rpx;
    min-height: 160rpx;
  }
  
  .btn {
    margin-top: 32rpx;
    height: 80rpx;
    line-height: 80rpx;
    font-size: 28rpx;
    border-radius: 20rpx;
  }
  
  .btn-primary {
    background-color: #355ac9;
    color: #fff;
  }
  </style>
  
  