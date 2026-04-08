<template>
  <view class="avatar-container" :style="{ width: size + 'px', height: size + 'px' }">
    <!-- 头像图片 -->
    <image 
      class="avatar-img"
      :src="src || defaultAvatar" 
      mode="aspectFill"
      @error="handleImgError"
    ></image>
    <!-- 头像角标（可选，比如是否在线） -->
    <!--view class="avatar-badge" v-if="showBadge"--><!--/view-->
  </view>
</template>

<script>
export default {
  name: "Avatar",
  props: {
    // 头像图片地址
    src: {
      type: String,
      default: ""
    },
    size: {
      type: Number,
      default: 40
    },
    // 是否显示角标
    showBadge: {
      type: Boolean,
      default: false
    },
    // default
    defaultAvatar: {
      type: String,
      default: "/static/images/avatar-default.png"
    }
  },
  methods: {
    // 图片加载失败时显示默认头像
    handleImgError(e) {
      e.target.src = this.defaultAvatar;
    }
  }
};
</script>

<style scoped>
.avatar-container {
  border-radius: 50%;
  overflow: hidden;
  position: relative;
}
.avatar-img {
  width: 100%;
  height: 100%;
}
/* 头像角标（比如在线状态） */
.avatar-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 1/5 * size;
  height: 1/5 * size;
  min-width: 8px;
  min-height: 8px;
  background-color: #00c853;
  border: 2px solid #fff;
  border-radius: 50%;
}
</style>