<template>
  <view class="chat-page">

    <!-- 消息列表 -->
    <scroll-view 
      class="message-list" 
      scroll-y 
      scroll-with-animation 
      :scroll-top="scrollTop"
      @scrolltolower="loadMoreHistory"
      :style="{ flex: 1 }"
    >
      <!-- 合并v-for循环，避免key冲突 -->
      <view class="message-item" v-for="(msg, index) in messageList" :key="index">
        <!-- 自己发送的消息 -->
        <view class="my-message" v-if="msg.senderId === userId">
          <text class="msg-content">{{ msg.content }}</text>
          <image 
            class="avatar-small" 
            :src="myAvatar || '/static/default-avatar.png'" 
            mode="aspectFill"
          ></image>
        </view>
        <!-- 对方发送的消息 -->
        <view class="other-message" v-else>
          <image 
            class="avatar-small" 
            :src="sessionInfo.avatar || '/static/default-avatar.png'" 
            mode="aspectFill"
          ></image>
          <text class="msg-content">{{ msg.content }}</text>
        </view>
      </view>
      <!-- 加载更多提示 -->
      <text class="load-more" v-if="loading">加载中...</text>
    </scroll-view>

    <!-- 输入框区域 -->
    <view class="input-area">
      <input 
        class="msg-input" 
        v-model="inputContent" 
        placeholder="请输入消息..."
        confirm-type="send"
        @confirm="sendMessage"
      />
      <button class="send-btn" @click="sendMessage">发送</button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted,nextTick  } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import env from '@/common/config/env.js'
//import { useStorage } from '@/uni_modules/uni-storage'; // 兼容Vue3的storage调用

// Vue3 响应式数据（替代data）
const sessionId = ref('');
//const userId = ref(useStorage.getStorageSync('userId') || '10001'); // 从缓存取用户ID
const userId = ref(uni.getStorageSync('userId') || '10001');
//const myAvatar = ref(useStorage.getStorageSync('avatar') || '');
const myAvatar = ref(uni.getStorageSync('avatar') || '');

const sessionInfo = reactive({
  avatar: '',
  name: ''
});
const messageList = ref([]);
const inputContent = ref('');
const scrollTop = ref(0);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(20);

const getAuthHeader = () => {
  const token = uni.getStorageSync('access-token') || ''
  const header = { 'Content-Type': 'application/json' }
  if (token) header.Authorization = `Bearer ${token}`
  return header
}

// 页面加载时获取参数
onLoad((options) => {
  sessionId.value = options.sessionId || '';
  sessionInfo.avatar = options.avatar || '';
  sessionInfo.name = options.name || '聊天对象';
  // 获取历史消息
  getHistoryMessages();
});

// 封装uni.request为Promise（Vue3兼容）
const request = (options) => {
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      success: (res) => resolve(res),
      fail: (err) => reject(err)
    });
  });
};

// 返回上一页
const goBack = () => {
  uni.navigateBack({ delta: 1 });
};

// 获取历史消息
const getHistoryMessages = async () => {
  if (loading.value) return;
  loading.value = true;
  
  try {
    const res = await request({
      url: `${env.baseUrl}/chat/messages`,
      method: 'GET',
      header: getAuthHeader(),
      data: {
        sessionId: sessionId.value,
        pageNum: pageNum.value,
        pageSize: pageSize.value
      }
    });

    if (res.data && res.data.code === 200) {
      const newMessages = res.data.data?.records || [];
      messageList.value = [...newMessages, ...messageList.value];
      pageNum.value++;
      // 首次加载滚到底部（确保DOM渲染完成）
      if (pageNum.value === 2) {
        scrollToBottom();
      }
    } else {
      uni.showToast({ title: res.data?.message || '加载消息失败', icon: 'none' });
    }
  } catch (err) {
    uni.showToast({ title: '加载消息失败', icon: 'none' });
    console.error('加载历史消息失败:', err);
  } finally {
    loading.value = false;
  }
};

// 加载更多历史消息
const loadMoreHistory = () => {
  getHistoryMessages();
};

// 发送消息
const sendMessage = async () => {
  const content = inputContent.value.trim();
  if (!content) {
    uni.showToast({ title: '请输入消息内容', icon: 'none' });
    return;
  }

  try {
    const res = await request({
      url: `${env.baseUrl}/chat/message`,
      method: 'POST',
      header: getAuthHeader(),
      data: {
        sessionId: sessionId.value,
        content: content,
        senderId: userId.value
      }
    });

    if (res.data && res.data.code === 200) {
      // 发送成功，添加到消息列表
      messageList.value.push({
        senderId: userId.value,
        content: content,
        createTime: new Date().toLocaleTimeString()
      });
      inputContent.value = '';
      scrollToBottom(); // 滚到底部
      uni.showToast({ title: '发送成功', icon: 'none' });
    } else {
      uni.showToast({ title: res.data?.message || '发送失败', icon: 'none' });
    }
  } catch (err) {
    console.error('发送消息失败:', err);
    uni.showToast({ title: '发送失败', icon: 'none' });
  }
};

// 滚动到底部（修复DOM未渲染问题）
const scrollToBottom = () => {
  // 双重延迟确保scroll-view渲染完成
  setTimeout(() => {
    nextTick(() => {
      scrollTop.value = 999999;
    });
  }, 100);
};
</script>

<style scoped>
/* 页面容器 */
.chat-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  /* 防止内容溢出，且给底部输入框预留空间 */
  padding-bottom: 60px;
  box-sizing: border-box; /* 让padding包含在高度内 */
  position: relative;
}

/* 顶部导航栏 */
.chat-header {
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.back-btn {
  font-size: 18px;
  color: #333;
}

.user-info {
  display: flex;
  align-items: center;
  margin-left: 15px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.user-name {
  font-size: 16px;
  color: #333;
  margin-left: 8px;
}

.empty {
  flex: 1;
}

/* 消息列表 */
.message-list {
flex: 1;
  padding: 15px;
  overflow-y: auto;
  /* 新增：限制最大高度，避免和底部输入框重叠 */
  max-height: calc(100vh - 104px); /* 104 = 导航栏44px + 输入框60px */
}

.message-item {
  margin-bottom: 10px;
}

.my-message {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.other-message {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.msg-content {
  max-width: 60%;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.4;
  margin: 0 8px;
  word-wrap: break-word;
}

.my-message .msg-content {
  background-color: #007aff;
  color: #fff;
}

.other-message .msg-content {
  background-color: #fff;
  color: #333;
  border: 1px solid #eee;
}

.load-more {
  display: block;
  text-align: center;
  font-size: 12px;
  color: #999;
  margin: 10px 0;
}

/* 输入框区域 */
.input-area {
   display: flex;
    align-items: center;
    padding: 10px 15px;
    background-color: #fff;
    border-top: 1px solid #eee;
    /* 核心固定定位样式 */
    position: fixed; /* 固定在视口底部 */
    left: 0;
    bottom: 0;
    width: 100%; /* 占满屏幕宽度 */
    box-sizing: border-box; /* 让padding不超出宽度 */
    z-index: 999; /* 确保在最上层，不被其他元素遮挡 */
    height: 60px; /* 固定高度，和chat-page的padding-bottom对应 */
}

.msg-input {
  flex: 1;
  height: 40px;
  padding: 0 10px;
  background-color: #f5f5f5;
  border-radius: 20px;
  font-size: 14px;
  border: none;
  outline: none;
}

.send-btn {
  width: 80px;
  height: 40px;
  background-color: #007aff;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  margin-left: 10px;
}

.send-btn:active {
  background-color: #0066cc;
}
</style>