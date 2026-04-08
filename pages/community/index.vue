<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="tab-group">
        <view 
          class="tab-item" 
          :class="{ active: currentTab === 'recommend' }" 
          @click="switchTab('recommend')"
        >
          推荐
        </view>
        <view 
          class="tab-item" 
          :class="{ active: currentTab === 'latest' }" 
          @click="switchTab('latest')"
        >
          最新
        </view>
        <view 
          class="tab-item" 
          :class="{ active: currentTab === 'hot' }" 
          @click="switchTab('hot')"
        >
          最热
        </view>
      </view>
      <view class="search-box" @click="goSearch">
        <input 
          class="search-input" 
          v-model="searchKeyword" 
          placeholder="搜索帖子" 
          disabled
        />
        <view class="search-icon">🔍</view>
      </view>
    </view>

    <!-- 分类标签 -->
    <view class="category-group">
      <view 
        class="category-item" 
        :class="{ active: currentCategory === 'all' }" 
        @click="switchCategory('all')"
      >
        综合
      </view>
      <view 
        class="category-item" 
        :class="{ active: currentCategory === 'internet' }" 
        @click="switchCategory('internet')"
      >
        互联网+
      </view>
      <view 
        class="category-item" 
        :class="{ active: currentCategory === 'innovation' }" 
        @click="switchCategory('innovation')"
      >
        大创
      </view>
    </view>

    <!-- 帖子列表 -->
    <scroll-view class="post-list" scroll-y="true">
      <view 
        class="post-card" 
        v-for="(post, index) in filteredPostList" 
        :key="index"
        @click="goPostDetail(post)"
      >
        <!-- 发布者信息 -->
        <view class="post-author" @click.stop="goUserProfile(post.author)">
          <view class="avatar"></view>
          <view class="author-info">
            <view class="author-name">{{ post.author.name }}</view>
            <view class="post-time">{{ post.createTime }}</view>
          </view>
        </view>

        <!-- 帖子内容 -->
        <view class="post-content">
          <view class="post-title">{{ post.title }}</view>
          <view class="post-desc">{{ post.content }}</view>
          <view class="post-tags" v-if="post.tags && post.tags.length > 0">
            <view class="tag-item" v-for="(tag, tagIndex) in post.tags" :key="tagIndex">
              {{ tag }}
            </view>
          </view>
        </view>

        <!-- 互动按钮 -->
        <view class="post-action">
          <view class="action-item" @click.stop="toggleLike(post)">
            <view class="action-icon">👍</view>
            <view class="action-count">{{ post.likeCount }}</view>
          </view>
          <view class="action-item" @click.stop="goComment(post)">
            <view class="action-icon">💬</view>
            <view class="action-count">{{ post.commentCount }}</view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!--新建 -->
    <view class="fab-btn" @click="onPublish">
      <text class="btn-icon">+</text>
    </view>

    <!-- 发布帖子弹窗 -->
    <view class="publish-modal" v-if="showPublishModal" @click.self="closePublishModal">
      <view class="publish-card">
        <view class="publish-header">
          <view class="cancel-btn" @click="closePublishModal">取消</view>
          <view class="publish-title">发布帖子</view>
          <view class="confirm-btn" @click="submitPublish">发布</view>
        </view>
        <view class="publish-content">
          <input 
            class="title-input" 
            v-model="publishForm.title" 
            placeholder="请输入帖子标题"
          />
          <textarea 
            class="content-input" 
            v-model="publishForm.content" 
            placeholder="请输入帖子内容"
          ></textarea>
          <view class="tag-select">
            <view class="tag-label">选择标签</view>
            <view class="tag-list">
              <view 
                class="tag-option" 
                :class="{ selected: publishForm.tags.includes(tag) }"
                v-for="tag in allTags" 
                :key="tag"
                @click="toggleTag(tag)"
              >
                {{ tag }}
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 搜索弹窗 -->
    <view class="search-modal" v-if="showSearchModal" @click.self="closeSearchModal">
      <view class="search-card">
        <view class="search-header">
          <view class="cancel-btn" @click="closeSearchModal">取消</view>
          <input 
            class="search-input-full" 
            v-model="searchKeyword" 
            placeholder="搜索帖子" 
            @confirm="onSearch"
            autofocus
          />
          <view class="confirm-btn" @click="onSearch">搜索</view>
        </view>
        <view class="search-history" v-if="searchHistory.length > 0">
          <view class="history-title">搜索历史</view>
          <view class="history-item" v-for="(item, index) in searchHistory" :key="index" @click="selectHistory(item)">
            {{ item }}
          </view>
        </view>
        <view class="search-hot" v-else>
          <view class="hot-title">热门搜索</view>
          <view class="hot-list">
            <view class="hot-item" v-for="(item, index) in hotSearch" :key="index" @click="selectHistory(item)">
              {{ item }}
            </view>
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
      currentTab: 'recommend',
      currentCategory: 'all',
      searchKeyword: '',
      showPublishModal: false,
      showSearchModal: false,
      publishForm: {
        title: '',
        content: '',
        tags: []
      },
      allTags: ['前端', '后端', 'vue.js', 'ai', '互联网+', '大创', '产品', '小程序'],
      searchHistory: [],
      hotSearch: ['前端', '互联网+', '大创', 'vue.js', 'ai'],
      postList: [
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
    }
  },
  computed: {
    filteredPostList() {
      let list = [...this.postList];
      
      if (this.currentCategory !== 'all') {
        const categoryMap = {
          internet: '互联网+',
          innovation: '大创'
        };
        list = list.filter(post => 
          post.tags.some(tag => tag.includes(categoryMap[this.currentCategory]))
        );
      }
      
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase();
        list = list.filter(post => 
          post.title.toLowerCase().includes(keyword) || 
          post.content.toLowerCase().includes(keyword) ||
          post.tags.some(tag => tag.toLowerCase().includes(keyword))
        );
      }
      
      if (this.currentTab === 'latest') {
        list.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
      } else if (this.currentTab === 'hot') {
        list.sort((a, b) => b.likeCount - a.likeCount);
      }
      
      return list;
    }
  },
  methods: {
    switchTab(tab) {
      this.currentTab = tab;
    },
    switchCategory(category) {
      this.currentCategory = category;
    },
    goSearch() {
      this.showSearchModal = true;
    },
    closeSearchModal() {
      this.showSearchModal = false;
    },
    onSearch() {
      if (this.searchKeyword && !this.searchHistory.includes(this.searchKeyword)) {
        this.searchHistory.unshift(this.searchKeyword);
        if (this.searchHistory.length > 10) {
          this.searchHistory.pop();
        }
      }
      this.closeSearchModal();
      uni.showToast({
        title: '搜索成功',
        icon: 'success'
      });
    },
    selectHistory(item) {
      this.searchKeyword = item;
      this.onSearch();
    },
    onFilter() {
      uni.showToast({
        title: '筛选功能开发中',
        icon: 'none'
      });
    },
    toggleLike(post) {
      post.isLiked = !post.isLiked;
      post.likeCount += post.isLiked ? 1 : -1;
    },
    goComment(post) {
      uni.navigateTo({
        url: `/pages/comment/comment?postId=${post.id}`
      });
    },
    goPostDetail(post) {
      uni.navigateTo({
        url: `/pages/community/postDetail?postId=${post.id}`
      });
    },
    goUserProfile(author) {
      uni.navigateTo({
        url: `/pages/userProfile/userProfile?userId=${author.id}&userName=${author.name}`
      });
    },
    onPublish() {
      this.showPublishModal = true;
      this.publishForm = {
        title: '',
        content: '',
        tags: []
      };
    },
    closePublishModal() {
      this.showPublishModal = false;
    },
    toggleTag(tag) {
      const index = this.publishForm.tags.indexOf(tag);
      if (index > -1) {
        this.publishForm.tags.splice(index, 1);
      } else {
        if (this.publishForm.tags.length >= 3) {
          uni.showToast({
            title: '最多选择3个标签',
            icon: 'none'
          });
          return;
        }
        this.publishForm.tags.push(tag);
      }
    },
    submitPublish() {
      if (!this.publishForm.title.trim()) {
        uni.showToast({
          title: '请输入标题',
          icon: 'none'
        });
        return;
      }
      if (!this.publishForm.content.trim()) {
        uni.showToast({
          title: '请输入内容',
          icon: 'none'
        });
        return;
      }
      const newPost = {
        id: Date.now(),
        title: this.publishForm.title,
        content: this.publishForm.content,
        tags: this.publishForm.tags,
        author: {
          id: 1000,
          name: '我',
          avatar: ''
        },
        createTime: '刚刚',
        likeCount: 0,
        commentCount: 0,
        isLiked: false
      };
      this.postList.unshift(newPost);
      this.closePublishModal();
      uni.showToast({
        title: '发布成功',
        icon: 'success'
      });
    },
    goPage(url) {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      });
    }
  }
}
</script>

<style scoped>
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  position: relative;
}

/* 顶部导航 */
.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.tab-group {
  display: flex;
  gap: 40rpx;
}

.tab-item {
  font-size: 32rpx;
  color: #999;
  padding: 10rpx 0;
}

.tab-item.active {
  color: #333;
  font-weight: bold;
  border-bottom: 4rpx solid #007aff;
}

.search-box {
  position: relative;
  width: 240rpx;
}

.search-input {
  width: 100%;
  height: 60rpx;
  border-radius: 30rpx;
  background-color: #f0f0f0;
  padding: 0 30rpx 0 60rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.search-icon {
  position: absolute;
  left: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 32rpx;
}

/* 分类标签 */
.category-group {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #fff;
  gap: 30rpx;
}

.category-item {
  font-size: 30rpx;
  color: #666;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.category-item.active {
  color: #007aff;
  font-weight: bold;
  border-bottom: 2rpx solid #007aff;
}

.filter-btn {
  margin-left: auto;
  font-size: 28rpx;
  color: #666;
  padding: 8rpx 16rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
}

/* 帖子列表 */
.post-list {
  flex: 1;
  padding: 20rpx 30rpx;
}

.post-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  width:83%;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
}

.post-author {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
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

.post-content {
  margin-bottom: 20rpx;
}

.post-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.post-desc {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 16rpx;
}

.post-tags {
  display: flex;
  gap: 16rpx;
}

.tag-item {
  font-size: 24rpx;
  color: #007aff;
  background-color: #e8f3ff;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.post-action {
  display: flex;
  gap: 60rpx;
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
}

.action-count {
  font-size: 26rpx;
  color: #666;
}



.fab-btn {
  /* 1. 固定定位：相对于浏览器窗口固定 */
  position: fixed;
  
  /* 2. 位置：距离底部 30px，距离右侧 20px */
  bottom: 80px;
  right: 20px;
  
  /* 3. 层级：确保浮在所有元素上面 (数字越大越靠上) */
  z-index: 999;
  
  /* 4. 样式：圆形外观 */
  width: 60px;
  height: 60px;
  border-radius: 50%; /* 50% 让它变成正圆 */
  background-color: #007AFF; /* 蓝色背景，你可以改成你想要的颜色 */
  
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 10px rgba(0, 122, 255, 0.4);
}

.btn-icon {
  color: #FFFFFF; 
  font-size: 32px; 
  font-weight: bold;
  line-height: 1; /* 防止行高影响垂直居中 */
}


/* 发布弹窗 */
.publish-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.publish-card {
  width: 90%;
  max-height: 80vh;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.publish-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.cancel-btn, .confirm-btn {
  font-size: 30rpx;
  color: #007aff;
}

.publish-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.publish-content {
  padding: 30rpx;
}

.title-input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 32rpx;
  margin-bottom: 20rpx;
  box-sizing: border-box;
}

.content-input {
  width: 100%;
  height: 300rpx;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  margin-bottom: 30rpx;
  box-sizing: border-box;
}

.tag-select {
  margin-top: 20rpx;
}

.tag-label {
  font-size: 30rpx;
  color: #333;
  margin-bottom: 20rpx;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag-option {
  font-size: 26rpx;
  color: #666;
  background-color: #f0f0f0;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.tag-option.selected {
  color: #fff;
  background-color: #007aff;
}

/* 搜索弹窗 */
.search-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  z-index: 999;
}

.search-header {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #eee;
  gap: 20rpx;
}

.search-input-full {
  flex: 1;
  height: 60rpx;
  border-radius: 30rpx;
  background-color: #f0f0f0;
  padding: 0 30rpx;
  font-size: 28rpx;
}

.search-history, .search-hot {
  padding: 30rpx;
}

.history-title, .hot-title {
  font-size: 30rpx;
  color: #333;
  margin-bottom: 20rpx;
}

.history-item, .hot-item {
  font-size: 28rpx;
  color: #666;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
</style>