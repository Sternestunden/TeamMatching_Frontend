<template>
  <!-- 在最外层 view 加上 @click="$emit('click', project)" -->
  <view class="card" @click="$emit('click', project)">
    <view class="card-title">{{ project.name }}</view>
    <view class="card-desc">{{ project.desc }}</view>
    <view class="card-tags">
      <text class="tag" v-for="(tag, i) in project.tags" :key="i">{{ tag }}</text>
    </view>
    <view class="card-footer">
      <text>发起人：{{ project.founder }}</text>
      <text :class="project.statusClass">{{ project.status }}</text>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    project: { type: Object, required: true }
  }
};
</script>

<style scoped>
.card {
  background: #fff; border-radius: 12px; padding: 15px; margin-bottom: 10px;
}
.card-title { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
.card-desc { font-size: 14px; color: #666; margin-bottom: 8px; }
.card-tags { display: flex; gap: 6px; margin-bottom: 10px; }
.tag { background: #f5f5f5; padding: 3px 8px; border-radius: 6px; font-size: 12px; }
.card-footer { display: flex; justify-content: space-between; font-size: 12px; color: #999; }
.status-recruiting { color: #007aff; }
</style>