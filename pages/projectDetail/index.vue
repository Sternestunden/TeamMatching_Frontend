<template>
  <view
    class="detail-page"
    :class="{
      'detail-page--no-action': hideCommunicate,
      'detail-page--applied': !hideCommunicate && hasAppliedToProject
    }"
  >

    <!-- 页面内容区（给 NavBar 和底部按钮留空间） -->
    <view class="detail-content">
      <view class="detail-toolbar">
        <view class="toolbar-spacer"></view>
        <view
          class="fav-btn"
          :class="{ active: isFavored, disabled: favoriteLoading }"
          @tap="onToggleFavorite"
        >
          <text class="fav-icon">{{ isFavored ? '★' : '☆' }}</text>
          <text class="fav-text">{{ favoriteLoading ? '…' : (isFavored ? '已收藏' : '收藏') }}</text>
        </view>
      </view>

      <!-- 第二行：项目名称（黑体粗字） -->
      <view class="project-title">
        <text>{{ project.name }}</text>
      </view>

      <!-- 状态 + 与创建表单一致的维度标签 -->
      <view v-if="project.statusLabel" class="status-strip">
        <text class="status-pill">{{ project.statusLabel }}</text>
      </view>
      <view class="chip-row">
        <text v-if="project.belongTrack" class="chip">{{ project.belongTrack }}</text>
        <text v-if="project.projectType" class="chip chip-muted">{{ project.projectType }}</text>
        <text v-if="project.levelLabel" class="chip chip-muted">{{ project.levelLabel }}</text>
        <text class="chip chip-muted">{{ project.allowCrossMajor ? '允许跨专业' : '不允许跨专业' }}</text>
      </view>
      <view v-if="project.deadlineText || project.releaseText || projectStatLine" class="meta-line">
        <text v-if="project.deadlineText" class="meta-item">招募截止：{{ project.deadlineText }}</text>
        <text v-if="project.releaseText" class="meta-item">发布：{{ project.releaseText }}</text>
        <text v-if="project.auditLabel" class="meta-item">审核：{{ project.auditLabel }}</text>
        <text v-if="projectStatLine" class="meta-item">{{ projectStatLine }}</text>
      </view>

      <view v-if="!hideCommunicate && hasAppliedToProject" class="applied-top-banner">
        <text class="applied-top-pill">已投递</text>
        <text class="applied-top-msg">你已向本项目发起过沟通，可在底部再次投递更新意向</text>
      </view>

      <!-- 发起人 -->
      <view class="publisher-card">
        <view class="publisher-card-inner" @tap="goToLeaderPage">
          <view class="publisher-avatar-ring">
            <Avatar :src="project.leaderAvatar" :size="56" />
          </view>
          <view class="publisher-main">
            <text class="publisher-kicker">发起人</text>
            <text class="publisher-name">{{ project.leaderName }}</text>
            <text v-if="!project.isAnonymous" class="publisher-sub">查看资料与公开动态</text>
            <text v-else class="publisher-sub publisher-sub--muted">广场侧已隐藏真实身份与主页入口</text>
          </view>
          <view v-if="!project.isAnonymous" class="publisher-go">
            <text class="publisher-go-text">主页</text>
            <text class="publisher-go-arrow">›</text>
          </view>
        </view>
        <view v-if="project.isAnonymous && project.contactInfo" class="publisher-anon-strip">
          <view class="publisher-anon-strip-head">
            <text class="publisher-anon-icon">✉</text>
            <text class="publisher-anon-title">对外联系方式</text>
          </view>
          <text class="publisher-anon-body">{{ project.contactInfo }}</text>
        </view>
      </view>

      <view v-if="project.projectFeatures" class="detail-section">
        <view class="detail-section-header">
          <view class="detail-section-accent"></view>
          <view class="detail-section-heading">
            <text class="detail-section-title">项目亮点</text>
            <text class="detail-section-hint">核心特色与差异化</text>
          </view>
        </view>
        <view class="detail-section-panel">
          <view
            v-for="(line, i) in featuresParagraphs"
            :key="'feat-' + i"
            :class="['detail-para', !line ? 'detail-para--blank' : '']"
          >{{ line }}</view>
        </view>
      </view>

      <view v-if="project.tagList && project.tagList.length" class="detail-section detail-section--tags">
        <view class="detail-section-header">
          <view class="detail-section-accent"></view>
          <view class="detail-section-heading">
            <text class="detail-section-title">标签</text>
            <text class="detail-section-hint">技能与方向关键词</text>
          </view>
        </view>
        <view class="detail-section-panel detail-section-panel--tags">
          <view class="tag-chips">
            <text v-for="(t, ti) in project.tagList" :key="ti" class="tag-chip">{{ t }}</text>
          </view>
        </view>
      </view>

      <view class="detail-section">
        <view class="detail-section-header">
          <view class="detail-section-accent"></view>
          <view class="detail-section-heading">
            <text class="detail-section-title">项目介绍</text>
            <text class="detail-section-hint">背景、目标与具体说明</text>
          </view>
        </view>
        <view class="detail-section-panel">
          <view
            v-for="(line, i) in detailParagraphs"
            :key="'intro-' + i"
            :class="['detail-para', !line ? 'detail-para--blank' : '']"
          >{{ line }}</view>
        </view>
      </view>

      <view v-if="project.roles && project.roles.length" class="role-section">
        <view class="detail-section-header role-section-header">
          <view class="detail-section-accent"></view>
          <view class="detail-section-heading">
            <text class="detail-section-title">招募角色</text>
            <text class="detail-section-hint">岗位、人数与具体要求</text>
          </view>
        </view>
        <view class="detail-section-panel detail-section-panel--roles">
          <view v-for="(r, idx) in project.roles" :key="idx" class="role-block">
            <view class="role-line">
              <text class="role-name">{{ r.role }}</text>
              <text class="role-quota">名额 {{ r.memberQuota }} · 已加入 {{ r.currentMembers != null ? r.currentMembers : 0 }}</text>
            </view>
            <view v-if="r.recruitRequirements" class="role-req-wrap">
              <text class="role-req-label">具体要求</text>
              <view
                v-for="(reqLine, ri) in roleReqLines(r.recruitRequirements)"
                :key="ri"
                :class="['role-req-para', !reqLine ? 'role-req-para--blank' : '']"
              >{{ reqLine }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部：立即沟通 / 已投递 + 再次投递（发起人不展示） -->
    <view v-if="!hideCommunicate" class="bottom-action-bar">
      <view v-if="hasAppliedToProject" class="applied-bottom-strip">
        <text class="applied-bottom-pill">已投递</text>
        <text class="applied-bottom-hint">可再次投递以补充说明或改选角色（以平台规则为准）</text>
      </view>
      <view class="bottom-btn-inner">
        <button class="communicate-btn" @tap="handleCommunicate">
          {{ hasAppliedToProject ? '再次投递' : '立即沟通' }}
        </button>
      </view>
    </view>

    <!-- 统一投递表单 -->
    <view v-if="showApplyPopup" class="apply-mask" @tap="closeApplyPopup">
      <view class="apply-panel" @tap.stop>
        <view class="apply-header">
          <text class="apply-title">{{ hasAppliedToProject ? '再次投递' : '申请加入项目' }}</text>
          <text class="apply-close" @tap="closeApplyPopup">✕</text>
        </view>

        <view class="apply-item">
          <text class="apply-label">申请角色</text>
          <view class="role-select-grid">
            <view
              v-for="(roleLabel, idx) in roleOptionLabels"
              :key="idx"
              class="role-select-card"
              :class="{ active: applyForm.roleIndex === idx }"
              @tap="selectApplyRole(idx)"
            >
              <text class="role-select-text">{{ roleLabel }}</text>
            </view>
          </view>
        </view>

        <view class="apply-item">
          <text class="apply-label">申请理由</text>
          <textarea
            class="apply-textarea"
            v-model="applyForm.applyReason"
            placeholder="请输入申请原因/自我介绍"
            auto-height
          />
        </view>

        <view class="apply-item">
          <text class="apply-label">上传简历和附件</text>
          <view class="apply-row">
            <switch :checked="applyForm.useProfileResume" @change="onUseProfileResumeChange" />
            <text class="apply-row-text">复用个人简历</text>
          </view>
          <text class="apply-tip">{{ profileResumeText }}</text>

          <view v-if="!applyForm.useProfileResume" class="upload-line">
            <button class="upload-btn" @tap="onUploadApplyResume">上传投递简历</button>
            <text class="upload-name">{{ applyForm.customResumeFileName || '未上传' }}</text>
            <text v-if="applyForm.customResumeFileId" class="upload-op danger" @tap="clearApplyResume">移除</text>
          </view>

          <view class="upload-line">
            <button class="upload-btn" @tap="onUploadApplyAttachment">上传其他附件</button>
            <text class="upload-name">{{ applyForm.applicationAttachmentFileName || '未上传（可选）' }}</text>
            <text v-if="applyForm.applicationAttachmentFileId" class="upload-op danger" @tap="clearApplyAttachment">移除</text>
          </view>
        </view>

        <view class="apply-summary">
          <text class="summary-title">提交内容确认</text>
          <text class="summary-item">角色：{{ roleOptionLabels[applyForm.roleIndex] || '未选择' }}</text>
          <text class="summary-item">理由：{{ applyForm.applyReason ? '已填写' : '未填写' }}</text>
          <text class="summary-item">简历：{{ applyForm.useProfileResume ? (profileResume.fileName || '复用个人简历') : (applyForm.customResumeFileName || '未上传') }}</text>
          <text class="summary-item">附件：{{ applyForm.applicationAttachmentFileName || '未上传（可选）' }}</text>
        </view>

        <view class="apply-footer">
          <button class="apply-cancel" @tap="closeApplyPopup">取消</button>
          <button class="apply-submit" :disabled="applying" @tap="submitApplyFromPopup">
            {{ applying ? '提交中…' : (hasAppliedToProject ? '确认再次投递' : '提交申请') }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/common/api/index.js'

export default {
  computed: {
    projectStatLine() {
      const p = this.project
      const parts = []
      if (p.viewCount != null && p.viewCount !== '') parts.push(`浏览 ${p.viewCount}`)
      if (p.applyCount != null && p.applyCount !== '') parts.push(`申请 ${p.applyCount}`)
      if (p.favoriteCount != null && p.favoriteCount !== '') parts.push(`收藏 ${p.favoriteCount}`)
      return parts.length ? parts.join(' · ') : ''
    },
    roleOptionLabels() {
      const roles = Array.isArray(this.project.roles) ? this.project.roles : []
      return roles.map((r, idx) => `${r.role || `角色${idx + 1}`}（剩余${this.calcRemainQuota(r)}）`)
    },
    profileResumeText() {
      if (this.profileResume.fileId) {
        return `当前可复用：${this.profileResume.fileName || '个人简历'}`
      }
      return '开启「复用个人简历」后将从服务端拉取你在「我的简历」中的附件；也可关闭开关并上传本次投递简历'
    },
    /** 按换行分段，小程序里 <text> 的 pre-wrap 不稳定，用块级更可靠 */
    detailParagraphs() {
      const raw = this.project.detail == null ? '' : String(this.project.detail)
      if (!raw.trim()) return ['暂无介绍']
      return raw.split(/\r?\n/)
    },
    featuresParagraphs() {
      const raw = this.project.projectFeatures == null ? '' : String(this.project.projectFeatures)
      if (!raw.trim()) return []
      return raw.split(/\r?\n/)
    }
  },
  data() {
    return {
      projectId: '',
      /** 从「我发起的项目」进入时为 true，不展示「立即沟通」 */
      hideCommunicate: false,
      /** 当前登录用户是否曾向本项目投递（本地记录 + 接口字段） */
      hasAppliedToProject: false,
      /** 与 POST /favorite/project/{id} 返回的 data.isFavored 一致 */
      isFavored: false,
      favoriteLoading: false,
      project: {
        id: '',
        name: '',
        belongTrack: '',
        projectType: '',
        level: null,
        levelLabel: '',
        allowCrossMajor: false,
        projectFeatures: '',
        tags: '',
        tagList: [],
        deadlineText: '',
        releaseText: '',
        status: null,
        statusLabel: '',
        viewCount: null,
        applyCount: null,
        favoriteCount: null,
        auditLabel: '',
        leaderAvatar: '',
        leaderName: '',
        publisherUserId: '',
        detail: '',
        roles: [],
        isAnonymous: false,
        contactInfo: ''
      },
      applying: false,
      showApplyPopup: false,
      profileResume: {
        fileId: null,
        fileName: ''
      },
      applyForm: {
        roleIndex: 0,
        applyReason: '',
        useProfileResume: false,
        customResumeFileId: null,
        customResumeFileName: '',
        applicationAttachmentFileId: null,
        applicationAttachmentFileName: ''
      }
    }
  },
  onLoad(options) {
    const id = options?.projectId || options?.id
    const hc = options?.hideCommunicate
    this.hideCommunicate = hc === '1' || hc === 'true' || hc === true
    if (id) {
      this.projectId = String(id)
      this.syncAppliedFromStorageOnly()
      this.getProjectDetailFromApi()
    } else {
      uni.showToast({
        title: '参数错误',
        icon: 'none',
        duration: 2000
      })
    }
  },
  onShow() {
    if (this.hideCommunicate || !this.projectId) return
    this.hasAppliedToProject = this.hasAppliedToProject || this.hasLocalApplied(this.projectId)
  },
  methods: {
    hasLocalApplied(projectId) {
      if (!projectId) return false
      const m = uni.getStorageSync('userAppliedProjectIds') || {}
      return !!m[String(projectId)]
    },
    markProjectAppliedStorage(projectId) {
      if (!projectId) return
      const m = { ...(uni.getStorageSync('userAppliedProjectIds') || {}) }
      m[String(projectId)] = { at: Date.now() }
      uni.setStorageSync('userAppliedProjectIds', m)
    },
    syncAppliedFromStorageOnly() {
      this.hasAppliedToProject = this.hasLocalApplied(this.projectId)
    },
    resolveAppliedFromApi(data) {
      if (!data || typeof data !== 'object') return false
      const keys = ['hasApplied', 'alreadyApplied', 'appliedByMe', 'myApplied', 'userApplied', 'hasApply', 'applied']
      for (let i = 0; i < keys.length; i++) {
        const v = data[keys[i]]
        if (v === true || v === 1 || v === '1' || v === 'true') return true
      }
      const st = data.myApplicationStatus ?? data.applicationStatus ?? data.myApplyStatus
      if (st != null && st !== '' && String(st) !== '0') return true
      if (data.myApplication != null && typeof data.myApplication === 'object') return true
      return false
    },
    syncAppliedStateFromDetail(data) {
      const fromApi = this.resolveAppliedFromApi(data)
      const fromLocal = this.hasLocalApplied(this.projectId)
      this.hasAppliedToProject = !!(fromApi || fromLocal)
    },
    levelLabel(level) {
      const n = Number(level)
      const m = { 1: '校级', 2: '省级', 3: '国家级' }
      return m[n] != null ? m[n] : ''
    },
    projectStatusLabel(status) {
      const n = Number(status)
      const m = { 0: '草拟', 1: '实施中', 2: '招募中', 3: '已完成', 4: '已终止' }
      return m[n] != null ? m[n] : ''
    },
    auditStatusLabel(auditStatus) {
      if (auditStatus === undefined || auditStatus === null || auditStatus === '') return ''
      const n = Number(auditStatus)
      const m = { 0: '待审核', 1: '审核已通过', 2: '审核未通过' }
      return m[n] != null ? m[n] : ''
    },
    formatDetailDateTime(iso) {
      if (iso == null || iso === '') return ''
      const d = new Date(iso)
      if (Number.isNaN(d.getTime())) {
        const s = String(iso)
        return s.length >= 16 ? s.slice(0, 16).replace('T', ' ') : s
      }
      const y = d.getFullYear()
      const m = `${d.getMonth() + 1}`.padStart(2, '0')
      const day = `${d.getDate()}`.padStart(2, '0')
      const hh = `${d.getHours()}`.padStart(2, '0')
      const mm = `${d.getMinutes()}`.padStart(2, '0')
      return `${y}-${m}-${day} ${hh}:${mm}`
    },
    roleReqLines(text) {
      return String(text || '').split(/\r?\n/)
    },
	
    async getProjectDetailFromApi() {
      try {
        const res = await api.getProjectDetail(this.projectId)
		
        const data = res?.data
        if (data == null || data.projectId == null) {
          uni.showToast({ title: '加载失败', icon: 'none' })
          return
        }
        const pub = data.publisherInfo || {}
        const anon =
          data.isAnonymous === true ||
          data.isAnonymous === 1 ||
          data.isAnonymous === '1' ||
          data.isAnonymous === 'true'
        const tagsRaw = data.tags != null ? String(data.tags) : ''
        const tagList = tagsRaw
          .split(/[,，、]/)
          .map((s) => s.trim())
          .filter(Boolean)
        const favored =
          data.isFavored === true ||
          data.isFavored === 1 ||
          data.isFavored === '1' ||
          data.isFavored === 'true' ||
          data.isFavorite === true ||
          data.favored === true
        this.isFavored = !!favored
        this.syncAppliedStateFromDetail(data)
        this.project = {
          id: data.projectId,
          name: data.name || '',
          belongTrack: data.belongTrack || '',
          projectType: data.projectType || '',
          level: data.level != null ? Number(data.level) : null,
          levelLabel: this.levelLabel(data.level),
          allowCrossMajor: !!data.allowCrossMajor,
          projectFeatures: data.projectFeatures != null ? String(data.projectFeatures) : '',
          tags: tagsRaw,
          tagList,
          deadlineText: this.formatDetailDateTime(data.deadlineRecruit),
          releaseText: this.formatDetailDateTime(data.releaseTime),
          status: data.status != null ? Number(data.status) : null,
          statusLabel: this.projectStatusLabel(data.status),
          viewCount: data.viewCount,
          applyCount: data.applyCount,
          favoriteCount: data.favoriteCount,
          auditLabel: this.auditStatusLabel(data.auditStatus),
          leaderAvatar: anon ? '' : (pub.avatar || ''),
          leaderName: anon ? '匿名用户' : (pub.nickname || '发布者'),
          publisherUserId: anon ? '' : String(pub.userId || ''),
          detail: data.projectIntro || '',
          roles: Array.isArray(data.roleRequirements) ? data.roleRequirements : [],
          isAnonymous: anon,
          contactInfo: anon ? (data.contactInfo || '') : ''
        }
      } catch (e) {
        console.error(e)
        uni.showToast({ title: '网络异常', icon: 'none' })
      }
    },

    async onToggleFavorite() {
      if (!this.projectId || this.favoriteLoading) return
      const token = uni.getStorageSync('access-token')
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        setTimeout(() => uni.navigateTo({ url: '/pages/login/login' }), 300)
        return
      }
      this.favoriteLoading = true
      const wasFavored = this.isFavored
      try {
        const res = await api.toggleFavoriteProject(this.projectId)
        const next = res?.data?.isFavored
        this.isFavored = next === true || next === 1 || next === '1' || next === 'true'
        uni.showToast({ title: this.isFavored ? '已收藏' : '已取消收藏', icon: 'none' })
        const fc = Number(this.project.favoriteCount)
        if (Number.isFinite(fc)) {
          if (!wasFavored && this.isFavored) this.project.favoriteCount = fc + 1
          else if (wasFavored && !this.isFavored) this.project.favoriteCount = Math.max(0, fc - 1)
        }
		console.log('✅ 项目详情接口联调成功', this.project)
      } catch (e) {
        console.error(e)
        uni.showToast({ title: e?.data?.message || e?.message || '操作失败', icon: 'none' })
      } finally {
        this.favoriteLoading = false
      }
    },
    // 跳转到队长个人页
    goToLeaderPage() {
      if (this.project.isAnonymous) return
      const uid = encodeURIComponent(this.project.publisherUserId || '')
      const name = encodeURIComponent(this.project.leaderName || '')
      const avatar = encodeURIComponent(this.project.leaderAvatar || '')
      uni.navigateTo({
        url: `/pages/userProfile/userProfile?userId=${uid}&userName=${name}&avatar=${avatar}`
      });
    },
    // 立即沟通（打开统一表单）
    handleCommunicate() {
      const token = uni.getStorageSync('access-token')
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        setTimeout(() => uni.navigateTo({ url: '/pages/login/login' }), 300)
        return
      }
      if (this.applying) return
      const roles = Array.isArray(this.project.roles) ? this.project.roles : []
      if (roles.length === 0) {
        uni.showToast({ title: '该项目暂无可投递角色', icon: 'none' })
        return
      }
      this.openApplyPopup()
    },

    openApplyPopup() {
      this.applyForm.roleIndex = 0
      this.applyForm.applyReason = ''
      this.applyForm.customResumeFileId = null
      this.applyForm.customResumeFileName = ''
      this.applyForm.applicationAttachmentFileId = null
      this.applyForm.applicationAttachmentFileName = ''
      this.hydrateProfileResumeFromCache()
      this.applyForm.useProfileResume = !!this.profileResume.fileId
      this.showApplyPopup = true
    },

    closeApplyPopup() {
      if (this.applying) return
      this.showApplyPopup = false
    },

    selectApplyRole(index) {
      this.applyForm.roleIndex = Number(index || 0)
    },

    async onUseProfileResumeChange(e) {
      const checked = !!e?.detail?.value
      if (!checked) {
        this.applyForm.useProfileResume = false
        return
      }
      if (this.profileResume.fileId) {
        this.applyForm.useProfileResume = true
        return
      }
      const localResume = uni.getStorageSync('userApplyResume') || {}
      if (localResume?.fileId) {
        this.profileResume.fileId = localResume.fileId
        this.profileResume.fileName = localResume.fileName || '我的简历'
        this.applyForm.useProfileResume = true
        return
      }
      try {
        uni.showLoading({ title: '加载简历…' })
        const res = await api.getMyUploadedFiles({ targetType: 1, page: 1, size: 10 })
        const list = this.normalizeUploadedFilesRes(res)
        if (list.length && list[0]?.fileId) {
          this.syncApplyResumeCacheFromList(list)
          this.profileResume.fileId = list[0].fileId
          this.profileResume.fileName = list[0].fileName || '我的简历'
          this.applyForm.useProfileResume = true
        } else {
          uni.showToast({ title: '暂无可复用简历，请先在「我的简历」上传', icon: 'none' })
          this.applyForm.useProfileResume = false
        }
      } catch (err) {
        console.error(err)
        uni.showToast({
          title: err?.data?.message || err?.message || '加载失败',
          icon: 'none'
        })
        this.applyForm.useProfileResume = false
      } finally {
        uni.hideLoading()
      }
    },

    normalizeUploadedFilesRes(res) {
      const d = res?.data
      if (Array.isArray(d)) return d
      if (d && Array.isArray(d.list)) return d.list
      if (d && Array.isArray(d.records)) return d.records
      return []
    },

    syncApplyResumeCacheFromList(list) {
      if (!Array.isArray(list) || !list.length) {
        uni.removeStorageSync('userApplyResume')
        return
      }
      const latest = list[0]
      uni.setStorageSync('userApplyResume', {
        fileId: latest.fileId,
        fileName: latest.fileName || '',
        fileUrl: latest.fileUrl || ''
      })
    },

    /** 仅读本地缓存，打开弹窗不请求接口；勾选「复用」时再拉列表 */
    hydrateProfileResumeFromCache() {
      const localResume = uni.getStorageSync('userApplyResume') || {}
      if (localResume?.fileId) {
        this.profileResume.fileId = localResume.fileId
        this.profileResume.fileName = localResume.fileName || '我的简历'
      } else {
        this.profileResume.fileId = null
        this.profileResume.fileName = ''
      }
    },

    async onUploadApplyResume() {
      const file = await this.uploadOptionalFile(1, '投递简历')
      if (!file?.fileId) return
      this.applyForm.customResumeFileId = file.fileId
      this.applyForm.customResumeFileName = file.fileName || '已上传简历'
    },

    async onUploadApplyAttachment() {
      const file = await this.uploadOptionalFile(5, '其他附件')
      if (!file?.fileId) return
      this.applyForm.applicationAttachmentFileId = file.fileId
      this.applyForm.applicationAttachmentFileName = file.fileName || '已上传附件'
    },
    clearApplyResume() {
      this.applyForm.customResumeFileId = null
      this.applyForm.customResumeFileName = ''
    },
    clearApplyAttachment() {
      this.applyForm.applicationAttachmentFileId = null
      this.applyForm.applicationAttachmentFileName = ''
    },

    chooseLocalFile(label) {
      return new Promise((resolve, reject) => {
        // 小程序环境优先 chooseMessageFile，可选任意类型文件
        if (typeof uni.chooseMessageFile === 'function') {
          uni.chooseMessageFile({
            count: 1,
            type: 'file',
            success: (res) => {
              const file = res?.tempFiles?.[0]
              const filePath = file?.path || file?.tempFilePath || ''
              resolve(filePath || '')
            },
            fail: (e) => {
              if (String(e?.errMsg || '').includes('cancel')) resolve('')
              else reject(e)
            }
          })
          return
        }

        // 兜底：使用选择图片
        uni.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: (res) => resolve(res?.tempFilePaths?.[0] || ''),
          fail: (e) => {
            if (String(e?.errMsg || '').includes('cancel')) resolve('')
            else reject(e)
          }
        })
      })
    },

    async uploadOptionalFile(targetType, label) {
      const filePath = await this.chooseLocalFile(label)
      if (!filePath) {
        return null
      }
      try {
        uni.showLoading({ title: `上传${label}中...` })
        const res = await api.uploadFile({ filePath, targetType, isTemp: false })
        const file = res?.data
        const fileId = file?.fileId
        if (!fileId) {
          throw new Error(`${label}上传失败`)
        }
        uni.showToast({ title: `${label}上传成功`, icon: 'success' })
        return file
      } finally {
        uni.hideLoading()
      }
    },

    calcRemainQuota(role) {
      const quota = Number(role?.memberQuota || 0)
      const current = Number(role?.currentMembers || 0)
      const remain = quota - current
      return Number.isFinite(remain) && remain >= 0 ? remain : 0
    },

    async submitApplyFromPopup() {
      const roles = Array.isArray(this.project.roles) ? this.project.roles : []
      const selected = roles[this.applyForm.roleIndex]
      if (!selected?.requirementId) {
        uni.showToast({ title: '请选择有效角色', icon: 'none' })
        return
      }
      const applyReason = String(this.applyForm.applyReason || '').trim()
      if (!applyReason) {
        uni.showToast({ title: '请填写申请理由', icon: 'none' })
        return
      }

      let customResumeFileId = null
      if (this.applyForm.useProfileResume) {
        customResumeFileId = this.profileResume.fileId || null
      } else {
        customResumeFileId = this.applyForm.customResumeFileId || null
      }
      const applicationAttachmentFileId = this.applyForm.applicationAttachmentFileId || null

      await this.submitApply(selected.requirementId, applyReason, {
        customResumeFileId,
        applicationAttachmentFileId
      })
    },

    async submitApply(requirementId, applyReason, extra = {}) {
      this.applying = true
      try {
        const payload = {
          requirementId: Number(requirementId),
          applyReason
        }
        if (extra.customResumeFileId) payload.customResumeFileId = Number(extra.customResumeFileId)
        if (extra.applicationAttachmentFileId) payload.applicationAttachmentFileId = Number(extra.applicationAttachmentFileId)
        const res = await api.applyProject(this.projectId, payload)
        this.markProjectAppliedStorage(this.projectId)
        this.hasAppliedToProject = true
        uni.showToast({
          title: res?.data?.message || '投递成功',
          icon: 'success'
        })
        this.showApplyPopup = false
      } catch (e) {
        console.error('投递失败', e)
        uni.showToast({
          title: e?.data?.message || e?.message || '投递失败',
          icon: 'none'
        })
      } finally {
        this.applying = false
      }
    }
	
  }
};
</script>

<style scoped>
/* 页面容器：给 NavBar 和底部按钮留空间 */
.detail-page {
  min-height: 100vh;
  background-color: #fff;
  padding-bottom: 80px; /* 给底部按钮预留空间 */
}

.detail-page--applied {
  padding-bottom: 132px;
}

.detail-page--no-action {
  padding-bottom: 24px;
}

.applied-top-banner {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
  margin: 12px 0 4px;
  padding: 10px 14px;
  background: linear-gradient(90deg, #ecfdf5 0%, #f0fdf4 100%);
  border: 1px solid #bbf7d0;
  border-radius: 12px;
}
.applied-top-pill {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 700;
  color: #047857;
  padding: 4px 10px;
  border-radius: 999px;
  background: #d1fae5;
}
.applied-top-msg {
  flex: 1;
  font-size: 13px;
  color: #166534;
  line-height: 1.45;
}

/* 内容区 */
.detail-content {
  padding: 15px 20px;
  position: relative;
}

.detail-toolbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  margin: -4px 0 12px;
}
.toolbar-spacer {
  flex: 1;
}
.fav-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
}
.fav-btn.active {
  border-color: #f0b429;
  background: linear-gradient(180deg, #fffdf5 0%, #fff8e6 100%);
}
.fav-btn.disabled {
  opacity: 0.55;
}
.fav-icon {
  font-size: 18px;
  color: #f0b429;
  line-height: 1;
}
.fav-btn.active .fav-icon {
  color: #e6a800;
}
.fav-text {
  font-size: 14px;
  color: #475569;
  font-weight: 500;
}
.fav-btn.active .fav-text {
  color: #92400e;
}

/* 第二行：项目名称（黑体粗字） */
.project-title {
  font-size: 28px;
  font-weight: bold;
  color: #000;
  margin-bottom: 15px;
}

.status-strip {
  margin-bottom: 10px;
}
.status-pill {
  display: inline-block;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #e8f0ff;
  color: #355ac9;
}
.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.chip {
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 6px;
  background: #f0f4ff;
  color: #355ac9;
}
.chip-muted {
  background: #f5f5f7;
  color: #555;
}
.meta-line {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}
.meta-item {
  font-size: 12px;
  color: #888;
  line-height: 1.45;
}
.tag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.tag-chip {
  font-size: 13px;
  padding: 8px 14px;
  border-radius: 999px;
  background: #eef2ff;
  color: #355ac9;
  border: 1px solid #d8def8;
}

/* 发起人卡片 */
.publisher-card {
  margin: 8px 0 24px;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06);
}
.publisher-card-inner {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 14px;
  padding: 16px 16px 16px 14px;
}
.publisher-avatar-ring {
  flex-shrink: 0;
  padding: 3px;
  border-radius: 50%;
  background: linear-gradient(145deg, #355ac9 0%, #7c9ef0 50%, #c7d7ff 100%);
  box-shadow: 0 2px 12px rgba(53, 90, 201, 0.25);
}
.publisher-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.publisher-kicker {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #64748b;
  text-transform: uppercase;
}
.publisher-name {
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.25;
}
.publisher-sub {
  font-size: 12px;
  color: #355ac9;
  line-height: 1.45;
}
.publisher-sub--muted {
  color: #94a3b8;
}
.publisher-go {
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(53, 90, 201, 0.1);
  border: 1px solid rgba(53, 90, 201, 0.2);
}
.publisher-go-text {
  font-size: 13px;
  font-weight: 600;
  color: #355ac9;
}
.publisher-go-arrow {
  font-size: 18px;
  font-weight: 300;
  color: #355ac9;
  line-height: 1;
  margin-top: -1px;
}
.publisher-anon-strip {
  padding: 12px 16px 16px;
  border-top: 1px dashed #cbd5e1;
  background: rgba(255, 255, 255, 0.65);
}
.publisher-anon-strip-head {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.publisher-anon-icon {
  font-size: 14px;
  color: #d97706;
}
.publisher-anon-title {
  font-size: 12px;
  font-weight: 600;
  color: #92400e;
  letter-spacing: 0.02em;
}
.publisher-anon-body {
  display: block;
  font-size: 14px;
  color: #334155;
  line-height: 1.65;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 区块：标题区（色条+大标题+灰副标题）与正文区（白底+灰字+大行距）明确分离 */
.detail-section {
  margin-top: 28px;
}
.detail-section--tags {
  margin-top: 24px;
}
.detail-section-header {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 12px;
  margin-bottom: 12px;
}
.detail-section-accent {
  width: 4px;
  min-height: 44px;
  border-radius: 4px;
  background: linear-gradient(180deg, #355ac9 0%, #5b7ee8 100%);
  flex-shrink: 0;
}
.detail-section-heading {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  padding: 2px 0 4px;
}
.detail-section-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 0.03em;
  line-height: 1.3;
}
.detail-section-hint {
  font-size: 13px;
  color: #64748b;
  font-weight: 400;
  line-height: 1.4;
}
.detail-section-panel {
  margin-left: 16px;
  padding: 18px 16px 20px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
}
.detail-section-panel--tags {
  padding-bottom: 16px;
}
.detail-section-panel--roles {
  padding-top: 14px;
  padding-bottom: 14px;
}
.detail-para {
  font-size: 15px;
  font-weight: 400;
  color: #475569;
  line-height: 2;
  letter-spacing: 0.02em;
  margin-bottom: 16px;
  word-break: break-word;
}
.detail-para:last-child {
  margin-bottom: 0;
}
.detail-para--blank {
  min-height: 12px;
  margin-bottom: 8px;
}
.role-section-header {
  margin-bottom: 12px;
}

/* 底部操作区 */
.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 10px 20px 14px;
  padding-bottom: calc(14px + env(safe-area-inset-bottom));
  background-color: #fff;
  border-top: 1px solid #e8edf5;
  box-shadow: 0 -4px 20px rgba(15, 23, 42, 0.06);
}
.applied-bottom-strip {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}
.applied-bottom-pill {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 700;
  color: #047857;
  padding: 4px 10px;
  border-radius: 999px;
  background: #d1fae5;
}
.applied-bottom-hint {
  flex: 1;
  font-size: 12px;
  color: #64748b;
  line-height: 1.45;
}
.bottom-btn-inner {
  display: flex;
  justify-content: center;
}
.communicate-btn {
  width: 100%;
  max-width: 400px;
  height: 48px;
  background: linear-gradient(180deg, #355ac9 0%, #2d4eb3 100%);
  color: #fff;
  font-size: 17px;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  line-height: 48px;
}
.communicate-btn:active {
  opacity: 0.92;
}

.role-section {
  margin-top: 28px;
}
.role-block {
  margin-bottom: 18px;
  padding-bottom: 18px;
  border-bottom: 1px solid #eef2f7;
}
.role-block:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}
.role-line {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
}
.role-name {
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  flex: 1;
}
.role-quota {
  font-size: 12px;
  color: #64748b;
  flex-shrink: 0;
  margin-top: 3px;
}
.role-req-wrap {
  margin-top: 10px;
  padding: 12px 14px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e8edf5;
}
.role-req-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #355ac9;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}
.role-req-para {
  display: block;
  font-size: 14px;
  color: #475569;
  line-height: 1.9;
  margin-bottom: 10px;
  word-break: break-word;
}
.role-req-para:last-child {
  margin-bottom: 0;
}
.role-req-para--blank {
  min-height: 8px;
  margin-bottom: 6px;
}

.apply-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: flex-end;
  z-index: 999;
}
.apply-panel {
  width: 100%;
  background: #fff;
  border-radius: 16px 16px 0 0;
  padding: 14px 14px calc(14px + env(safe-area-inset-bottom));
  box-sizing: border-box;
  max-height: 80vh;
  overflow-y: auto;
}
.apply-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.apply-title {
  font-size: 16px;
  font-weight: 600;
  color: #111;
}
.apply-close {
  font-size: 18px;
  color: #999;
}
.apply-item {
  margin-bottom: 12px;
}
.apply-label {
  display: block;
  font-size: 13px;
  color: #555;
  margin-bottom: 8px;
}
.role-select-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.role-select-card {
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 10px;
  padding: 8px;
}
.role-select-card.active {
  border-color: #1677ff;
  background: #eef5ff;
}
.role-select-text {
  font-size: 12px;
  color: #222;
  line-height: 1.4;
}
.apply-textarea {
  width: 100%;
  min-height: 90px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  box-sizing: border-box;
  font-size: 14px;
  color: #222;
}
.apply-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.apply-row-text {
  font-size: 13px;
  color: #333;
}
.apply-tip {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #888;
}
.upload-line {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.upload-btn {
  width: 140px;
  height: 34px;
  line-height: 34px;
  border-radius: 8px;
  background: #eef5ff;
  color: #1677ff;
  font-size: 13px;
  border: 1px solid #d6e6ff;
  margin: 0;
}
.upload-name {
  flex: 1;
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.upload-op {
  font-size: 12px;
  color: #1677ff;
  padding: 4px 0;
}
.upload-op.danger {
  color: #ff4d4f;
}
.apply-summary {
  margin-top: 12px;
  border: 1px solid #e8eef9;
  background: #f8fbff;
  border-radius: 10px;
  padding: 10px;
}
.summary-title {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #1f2a44;
  margin-bottom: 6px;
}
.summary-item {
  display: block;
  font-size: 12px;
  color: #4b5563;
  line-height: 1.6;
}
.apply-footer {
  margin-top: 14px;
  display: flex;
  gap: 10px;
}
.apply-cancel,
.apply-submit {
  flex: 1;
  height: 40px;
  line-height: 40px;
  border-radius: 10px;
  font-size: 14px;
}
.apply-cancel {
  background: #f3f4f6;
  color: #333;
}
.apply-submit {
  background: #1677ff;
  color: #fff;
}
</style>