<template>
  <view class="container">
    <!-- 个人信息卡片 -->
    <view class="info-card">
      <view class="card-title">个人信息</view>
      <view class="info-item">
        <view class="info-label">姓名：</view>
        <view class="info-value">{{ userInfo.name }}</view>
      </view>
      <view class="info-item">
        <view class="info-label">学号：</view>
        <view class="info-value">{{ userInfo.studentId }}</view>
      </view>
      <view class="info-item">
        <view class="info-label">校园邮箱：</view>
        <view class="info-value">{{ userInfo.email }}</view>
      </view>
    </view>

    <!-- 技能/经历卡片 -->
    <view class="skill-card">
      <view class="card-title">技能/经历</view>
      <view class="skill-list" v-if="userInfo.skills && userInfo.skills.length > 0">
        <view class="skill-item" v-for="(skill, index) in userInfo.skills" :key="index">
          {{ skill }}
        </view>
      </view>
      <view class="empty-tip" v-else>暂无技能/经历</view>
    </view>

    <!-- 发布的帖子 -->
    <view class="post-section">
      <view class="section-title">发布的帖子</view>
      <view 
        class="post-item" 
        v-for="(post, index) in userPostList" 
        :key="index"
        @click="goPostDetail(post)"
      >
        <view class="post-title">{{ post.title }}</view>
        <view class="post-desc">{{ post.content }}</view>
        <view class="post-meta">
          <view class="meta-item">
            <view class="meta-icon">👍</view>
            {{ post.likeCount }}
          </view>
          <view class="meta-item">
            <view class="meta-icon">💬</view>
            {{ post.commentCount }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userId: '',
      userInfo: {
        name: '张伟',
        studentId: '102XXXXXXX',
        email: 'XXX@stu.ecnu.cn',
        skills: ['前端开发', 'vue.js', '小程序']
      },
      userPostList: [
        {
          id: 1,
          title: '第十届互联网+创新大赛组队',
          content: 'ai图像识别项目需要前端开发，有经验的同学欢迎加入！',
          likeCount: 23,
          commentCount: 5
        },
        {
          id: 2,
          title: '大创项目找队友',
          content: '做一个校园组队小程序，需要后端和产品同学一起参与！',
          likeCount: 15,
          commentCount: 3
        }
      ]
    }
  },
  onLoad(options) {
    this.userId = options.userId || '';
    if (options.userName) {
      this.userInfo.name = options.userName;
    }
  },
  methods: {
    goPostDetail(post) {
      uni.navigateTo({
        url: `/pages/postDetail/postDetail?postId=${post.id}`
      });
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 30rpx;
}

.info-card, .skill-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
}

.card-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #eee;
}

.info-item {
  display: flex;
  margin-bottom: 24rpx;
  font-size: 32rpx;
}

.info-label {
  color: #333;
  font-weight: bold;
  width: 160rpx;
}

.info-value {
  color: #666;
  flex: 1;
}

.skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.skill-item {
  font-size: 28rpx;
  color: #007aff;
  background-color: #e8f3ff;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}

.empty-tip {
  font-size: 28rpx;
  color: #999;
  text-align: center;
  padding: 40rpx 0;
}

.post-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.post-item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.post-item:last-child {
  border-bottom: none;
}

.post-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.post-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.4;
  margin-bottom: 12rpx;
}

.post-meta {
  display: flex;
  gap: 40rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
  font-size: 24rpx;
  color: #999;
}

.meta-icon {
  font-size: 28rpx;
}
</style>