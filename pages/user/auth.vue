<template>
    <view class="user-page">
      <view class="card auth-card">
        <view class="auth-status">
          <text class="auth-status-label">当前认证状态：</text>
          <text class="auth-status-value" :class="`status-${status}`">
            {{ statusText }}
          </text>
        </view>
        <view class="form-item">
          <text class="form-label">姓名</text>
          <input class="form-input" v-model="form.name" placeholder="请输入真实姓名" />
        </view>
        <view class="form-item">
          <text class="form-label">学号</text>
          <input class="form-input" v-model="form.studentId" placeholder="请输入学号" />
        </view>
        <view class="form-item">
          <text class="form-label">校园邮箱</text>
          <input
            class="form-input"
            v-model="form.campusEmail"
            placeholder="例如 xxx@stu.ecnu.cn"
          />
        </view>
        <view class="tip-text">以上信息仅用于校内身份核验，不会对外展示。</view>
        <button class="btn btn-primary" @tap="onSubmit">提交认证</button>
      </view>
    </view>
  </template>
  
  <script>
  export default {
    data() {
      return {
        status: 'passed', // pending / passed / rejected
        form: {
          name: '张伟',
          studentId: '102XXXXXXX',
          campusEmail: 'xxx@stu.ecnu.cn'
        }
      }
    },
    computed: {
      statusText() {
        if (this.status === 'passed') return '已通过'
        if (this.status === 'pending') return '审核中'
        return '未通过'
      }
    },
    methods: {
      onSubmit() {
        // TODO: 提交到后端
        this.status = 'pending'
        uni.showToast({
          title: '已提交，等待审核',
          icon: 'none'
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
  
  .auth-card {
    margin-top: 16rpx;
  }
  
  .auth-status {
    margin-bottom: 16rpx;
    display: flex;
    align-items: center;
  }
  
  .auth-status-label {
    font-size: 24rpx;
    color: #555;
  }
  
  .auth-status-value {
    font-size: 24rpx;
    margin-left: 8rpx;
  }
  
  .status-passed {
    color: #3bb95c;
  }
  
  .status-pending {
    color: #f0a930;
  }
  
  .status-rejected {
    color: #e64f4f;
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
  
  .tip-text {
    margin-top: 16rpx;
    font-size: 22rpx;
    color: #888;
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
  
  