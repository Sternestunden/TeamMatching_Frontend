<template>
  <view class="user-page">
    <Loading v-if="loading && displayList.length === 0" show="true" text="加载收藏…" />

    <view v-else class="list-wrap">
      <view v-if="displayList.length === 0 && !loading" class="empty-container">
        <text class="empty-text">还没有收藏项目</text>
        <text class="empty-hint">在项目详情页点击右上角「收藏」即可加入此处</text>
      </view>

      <ProjectCard
        v-for="(project, index) in displayList"
        :key="project.id || index"
        :project="project"
        @click="goProjectDetail(project)"
      />

      <view v-if="loading && displayList.length > 0" class="load-more">
        <text>加载中…</text>
      </view>
      <view v-else-if="finished && displayList.length > 0" class="load-more muted">
        <text>没有更多了</text>
      </view>
    </view>
  </view>
</template>

<script>
import ProjectCard from '@/components/ProjectCard.vue'
import Loading from '@/components/Loading.vue'
import api from '@/common/api/index.js'

export default {
  components: { ProjectCard, Loading },
  data() {
    return {
      loading: false,
      rawList: [],
      page: 1,
      pageSize: 10,
      finished: false,
      isNavigating: false
    }
  },
  computed: {
    displayList() {
      return this.rawList.map((item) => this.mapToCard(item))
    }
  },
  onShow() {
    this.reload()
  },
  onReachBottom() {
    this.loadMore()
  },
  methods: {
    mapProjectStatusForCard(status) {
      const n = Number(status)
      if (!Number.isFinite(n)) {
        return { text: '招募中', class: 'status-recruiting' }
      }
      if (n === 3 || n === 4) {
        return { text: '已结束', class: 'status-ended' }
      }
      if (n === 0) {
        return { text: '草拟', class: 'status-draft' }
      }
      if (n === 1) {
        return { text: '实施中', class: 'status-recruiting' }
      }
      if (n === 2) {
        return { text: '招募中', class: 'status-recruiting' }
      }
      return { text: '招募中', class: 'status-recruiting' }
    },
    isListItemAnonymous(item) {
      const v = item?.isAnonymous
      return v === true || v === 1 || v === '1' || v === 'true'
    },
    mapFounderForListItem(item) {
      if (this.isListItemAnonymous(item)) {
        return '匿名用户'
      }
      return item.publisherInfo?.nickname || '匿名'
    },
    mapToCard(item) {
      const st = this.mapProjectStatusForCard(item.status)
      const tagsStr = item.tags != null ? String(item.tags) : ''
      const tags = tagsStr ? tagsStr.split(/[,，、]/).map((t) => t.trim()).filter(Boolean) : []
      return {
        id: item.projectId,
        name: item.name,
        desc: item.projectIntro || '',
        category: item.belongTrack === '大创' ? 'innovation' : 'internet+',
        tags,
        founder: this.mapFounderForListItem(item),
        status: st.text,
        statusClass: st.class,
        deadline: item.deadlineRecruit ? String(item.deadlineRecruit).slice(5, 10) : '',
        submitTime: item.releaseTime || '—',
        grade: item.grade || '不限',
        competition: item.competition || '其他',
        techStack: item.techStack ? String(item.techStack).split(',') : []
      }
    },
    normalizeListResponse(res) {
      const d = res?.data
      if (Array.isArray(d)) return d
      if (d && Array.isArray(d.list)) return d.list
      if (d && Array.isArray(d.records)) return d.records
      return []
    },
    async reload() {
      const token = uni.getStorageSync('access-token')
      if (!token) {
        this.rawList = []
        uni.showToast({ title: '请先登录', icon: 'none' })
        setTimeout(() => uni.navigateTo({ url: '/pages/login/login' }), 300)
        return
      }
      this.page = 1
      this.finished = false
      this.rawList = []
      await this.fetchPage(true)
    },
    async loadMore() {
      if (this.finished || this.loading) return
      await this.fetchPage(false)
    },
    async fetchPage(isFirst) {
      this.loading = true
      try {
        const res = await api.getMyFavoriteProjects({
          page: this.page,
          size: this.pageSize
        })
        const chunk = this.normalizeListResponse(res)
        if (isFirst) {
          this.rawList = chunk
        } else {
          this.rawList = [...this.rawList, ...chunk]
        }
        if (chunk.length < this.pageSize) {
          this.finished = true
        } else {
          this.page += 1
        }
      } catch (e) {
        console.error(e)
        if (isFirst) {
          this.rawList = []
        }
        uni.showToast({
          title: e?.data?.message || e?.message || '获取收藏失败',
          icon: 'none'
        })
        this.finished = true
      } finally {
        this.loading = false
      }
    },
    goProjectDetail(project) {
      if (this.isNavigating || !project?.id) return
      this.isNavigating = true
      uni.navigateTo({
        url: `/pages/projectDetail/index?projectId=${project.id}`,
        complete: () => {
          setTimeout(() => {
            this.isNavigating = false
          }, 400)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.user-page {
  padding: 24rpx 32rpx 48rpx;
  background-color: #f5f7fb;
  min-height: 100vh;
  box-sizing: border-box;
}

.list-wrap {
  min-height: 40vh;
}

.empty-container {
  padding: 120rpx 24rpx;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #666;
}

.empty-hint {
  display: block;
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #aaa;
  line-height: 1.5;
}

.load-more {
  text-align: center;
  padding: 24rpx 0 8rpx;
  font-size: 24rpx;
  color: #888;
}

.load-more.muted {
  color: #bbb;
}
</style>
