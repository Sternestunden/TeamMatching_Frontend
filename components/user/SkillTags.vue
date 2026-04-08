<template>
  <view class="card section-card">
    <view class="section-header">
      <view class="section-icon section-icon-tag"></view>
      <text class="section-title">我的简历 / 技能树</text>
    </view>
    <view class="divider"></view>
    
    <view class="skill-tags">
      <!-- 只显示 skill.name -->
      <view
        v-for="(skill, index) in skills"
        :key="index"
        class="skill-chip"
        @tap="viewSkill(skill, index)"
      >
        <text class="skill-text">{{ skill.name }}</text>
        <text class="del-btn" @tap.stop="deleteSkill(index)">×</text>
      </view>
    </view>

    <view class="skill-actions">
      <view class="add-btn" @tap="$emit('add')">
        <text class="add-btn-plus">＋</text>
        <text class="add-btn-text">添加</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "SkillTags",
  props: {
    skills: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    viewSkill(skill, index) {
      this.$emit("view", { skill, index });
    },
    deleteSkill(index) {
      this.$emit("delete", index);
    },
  },
};
</script>

<style scoped>
.skill-tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 8rpx;
}

.skill-chip {
  display: flex;
  align-items: center;
  padding: 8rpx 20rpx;
  border-radius: 32rpx;
  margin-right: 12rpx;
  margin-bottom: 12rpx;
  background: #e6f0ff;
  border: 2rpx solid #355ac9;
}

.add-btn {
  padding: 8rpx 20rpx;
  border-radius: 32rpx;
  margin-right: 12rpx;
  margin-bottom: 12rpx;
  width: 50px;
  border: 2rpx solid #355ac9;
}

.skill-text {
  font-size: 24rpx;
  color: #355ac9;
}

.del-btn {
  font-size: 28rpx;
  color: #355ac9;
  margin-left: 8rpx;
  line-height: 1;
}
</style>