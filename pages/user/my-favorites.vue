<template>
    <view class="user-page">
      <view class="card" v-for="(item, index) in favorites" :key="index">
        <view class="fav-title-row">
          <text class="fav-tag">{{ item.type }}</text>
          <text class="fav-time">{{ item.time }}</text>
        </view>
        <text class="fav-title">{{ item.title }}</text>
        <text class="fav-subtitle">{{ item.subtitle }}</text>
      </view>
      <view v-if="favorites.length === 0" class="empty-wrapper">
        <text class="empty-text">还没有收藏内容</text>
      </view>
    </view>
  </template>
  
  <script>
  export default {
    data() {
      return {
        favorites: [
          {
            type: '项目',
            title: '基于AI的校园组队平台',
            subtitle: '正在招募前端 / 算法同学',
            time: '昨天'
          },
          {
            type: '帖子',
            title: '分享一次校赛组队经验',
            subtitle: '如何找到靠谱队友',
            time: '2天前'
          }
        ]
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
    padding: 24rpx 28rpx 28rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
    margin-bottom: 24rpx;
  }
  
  .fav-title-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12rpx;
  }
  
  .fav-tag {
    font-size: 22rpx;
    color: #355ac9;
    padding: 4rpx 14rpx;
    border-radius: 999rpx;
    background-color: #e6edff;
  }
  
  .fav-time {
    font-size: 22rpx;
    color: #999;
  }
  
  .fav-title {
    font-size: 30rpx;
    color: #333;
  }
  
  .fav-subtitle {
    margin-top: 6rpx;
    font-size: 24rpx;
    color: #888;
  }
  
  .empty-wrapper {
    margin-top: 120rpx;
    display: flex;
    justify-content: center;
  }
  
  .empty-text {
    font-size: 26rpx;
    color: #999;
  }
  </style>
  
  