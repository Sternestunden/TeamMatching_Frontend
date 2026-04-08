<template>
  <view class="detail-page">
    <!-- 帖子内容区 -->
    <scroll-view class="content-scroll" scroll-y>
      <!-- 帖子头部 -->
      <view class="post-card">
        <!-- 标题 -->
        <view class="post-title">{{ post.title }}</view>
        
        <!-- 作者信息 -->
        <view class="post-author">
          <view class="avatar"></view>
          <view class="author-info">
            <view class="author-name">{{ post.author.name }}</view>
            <view class="post-time">{{ post.createTime }}</view>
          </view>
        </view>

        <!-- 帖子内容 -->
        <view class="post-content">
          <view class="post-desc">{{ post.content }}</view>
          
          <!-- 标签 -->
          <view class="post-tags" v-if="post.tags && post.tags.length > 0">
            <view class="tag-item" v-for="(tag, tagIndex) in post.tags" :key="tagIndex">
              {{ tag }}
            </view>
          </view>
        </view>

        <!-- 点赞按钮（靠右） -->
        <view class="post-action">
          <view class="action-item" @click="toggleLike">
            <view class="action-icon" :class="{ liked: post.isLiked }">👍</view>
            <view class="action-count">{{ post.likeCount }}</view>
          </view>
        </view>
      </view>

      <!-- 评论区 -->
      <view class="comment-section">
        <view class="comment-title">评论区 ({{ comments.length }})</view>
        
        <!-- 评论列表 -->
        <view class="comment-list">
          <view class="comment-item" v-for="(item, index) in comments" :key="index">
            <view class="comment-author">
              <view class="avatar-small"></view>
              <view class="comment-info">
                <view class="comment-name">{{ item.userName }}</view>
                <view class="comment-time">{{ item.time }}</view>
              </view>
            </view>
            <view class="comment-content">{{ item.content }}</view>
          </view>
        </view>

        <!-- 空评论提示 -->
        <view class="empty-comment" v-if="comments.length === 0">
          暂无评论，快来抢沙发吧～
        </view>
      </view>
    </scroll-view>

    <!-- 底部评论输入框（固定） -->
    <view class="comment-input-bar">
      <input
        class="comment-input"
        v-model="newComment"
        placeholder="写下你的评论..."
        @confirm="submitComment"
      />
      <button class="submit-btn" @click="submitComment" :disabled="!newComment.trim()">
        发送
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      postId: null,
      post: {},
      comments: [],
      newComment: ''
    }
  },
  onLoad(options) {
    // 1. 获取跳转传参的帖子ID
    this.postId = options.postId
    // 2. 设置导航栏标题
    uni.setNavigationBarTitle({ title: '帖子详情' })
    // 3. 从本地模拟数据中找到对应帖子（实际项目从接口获取）
    this.loadPostDetail()
  },
  methods: {
    // 加载帖子详情（模拟数据，实际替换为接口请求）
    loadPostDetail() {
      // 这里模拟社区页面的帖子数据，实际项目从接口获取
      const mockPosts = [
        {
          id: 1,
          title: '第十届互联网+创新大赛组队',
          content: 'ai图像识别项目需要前端开发，有经验的同学欢迎加入！',
          tags: ['前端', 'vue.js', 'ai'],
          author: {
            id: 1001,
            name: '李队长',
            avatar: ''
          },
          createTime: '01/01截止',
          likeCount: 23,
          commentCount: 5,
          isLiked: false
        },
        {
          id: 2,
          title: '大创项目找队友',
          content: '做一个校园组队小程序，需要后端和产品同学一起参与！',
          tags: ['后端', '产品', '小程序'],
          author: {
            id: 1002,
            name: '张同学',
            avatar: ''
          },
          createTime: '01/05截止',
          likeCount: 15,
          commentCount: 3,
          isLiked: false
        }
      ]

      // 找到对应ID的帖子
      this.post = mockPosts.find(item => item.id == this.postId) || {}
      
      // 模拟评论数据
      this.comments = [
        {
          userName: '小王同学',
          time: '2小时前',
          content: '我会vue，请问还缺人吗？'
        },
        {
          userName: '前端大佬',
          time: '1小时前',
          content: '项目有什么技术难点吗？可以一起交流'
        }
      ]
    },

    // 切换点赞
    toggleLike() {
      this.post.isLiked = !this.post.isLiked
      this.post.likeCount += this.post.isLiked ? 1 : -1
    },

    // 提交评论
    submitComment() {
      const content = this.newComment.trim()
      if (!content) return

      // 添加新评论到列表
      this.comments.unshift({
        userName: '我',
        time: '刚刚',
        content: content
      })

      // 清空输入框
      this.newComment = ''
      uni.showToast({ title: '评论成功', icon: 'success' })
    }
  }
}
</script>

<style scoped>
.detail-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
   padding-bottom: 110rpx;
}

/* 内容滚动区 */
.content-scroll {
  flex: 1;
  padding: 20rpx 30rpx;
}

/* 帖子卡片 */
.post-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
  width: 19.5rem;
}

/* 帖子标题 */
.post-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  line-height: 1.4;
}

/* 作者信息 */
.post-author {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background-color: #007aff;
  margin-right: 20rpx;
}

.author-info {
  flex: 1;
}

.author-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.post-time {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

/* 帖子内容 */
.post-content {
  margin-bottom: 20rpx;
}

.post-desc {
  font-size: 30rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20rpx;
}

/* 标签 */
.post-tags {
  display: flex;
  gap: 16rpx;
}

.tag-item {
  font-size: 26rpx;
  color: #007aff;
  background-color: #e8f3ff;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
}

/* 点赞按钮（靠右） */
.post-action {
  display: flex;
  justify-content: flex-end;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.action-icon {
  font-size: 36rpx;
  opacity: 0.6;
  transition: all 0.2s;
}

.action-icon.liked {
  opacity: 1;
  color: #ff3b30;
}

.action-count {
  font-size: 26rpx;
  color: #666;
}

/* 评论区 */
.comment-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
  width: 19.5rem;
}

.comment-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

/* 评论列表 */
.comment-list {
  margin-bottom: 20rpx;
}

.comment-item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.comment-author {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.avatar-small {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background-color: #f0f0f0;
  margin-right: 16rpx;
}

.comment-info {
  flex: 1;
}

.comment-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.comment-time {
  font-size: 22rpx;
  color: #999;
  margin-top: 2rpx;
}

.comment-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
  padding-left: 64rpx;
}

/* 空评论 */
.empty-comment {
  text-align: center;
  padding: 40rpx 0;
  font-size: 28rpx;
  color: #999;
}

/* 底部评论输入栏（固定在底部，不随滚动） */
.comment-input-bar {
  position: fixed; /* 核心：固定定位 */
  left: 0;
  bottom: 0;
  width: 100%; /* 占满屏幕宽度 */
  z-index: 99; /* 保证在最上层 */
  
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-top: 1rpx solid #eee;
  gap: 20rpx;
  box-sizing: border-box; /* 防止padding撑开宽度 */
}

.comment-input {
  flex: 1;
  height: 70rpx;
  border-radius: 35rpx;
  background-color: #f5f5f5;
  padding: 0 30rpx;
  font-size: 28rpx;
  border: none;
  outline: none;
}

.submit-btn {
  height: 70rpx;
  padding: 0 30rpx;
  border-radius: 35rpx;
  background-color: #007aff;
  color: #fff;
  font-size: 28rpx;
  border: none;
  white-space: nowrap;
}

button::after {
  border: none;
}
</style>