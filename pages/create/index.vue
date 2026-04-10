<template>
  <view class="create-page">
    <!-- 从「我发起的项目」进入编辑时：显式返回列表（switchTab 会打断页面栈，系统返回无效） -->
    <view v-if="editingProjectId" class="edit-back-row" @tap="onBackFromEdit">
      <text class="edit-back-icon">‹</text>
      <text class="edit-back-text">返回我发起的项目</text>
    </view>

    <!-- 顶部步骤栏 -->
    <view class="steps">
      <view 
        class="step-item" 
        :class="stepStatus[1] ? 'done' : currentStep === 1 ? 'active' : ''"
        @click="goStep(1)"
      >
        <text v-if="stepStatus[1]">✓</text> 基本信息
      </view>
      <view 
        class="step-item" 
        :class="stepStatus[2] ? 'done' : currentStep === 2 ? 'active' : ''"
        @click="goStep(2)"
      >
        <text v-if="stepStatus[2]">✓</text> 团队与角色
      </view>
      <view 
        class="step-item" 
        :class="stepStatus[3] ? 'done' : currentStep === 3 ? 'active' : ''"
        @click="goStep(3)"
      >
        3.预览发布
      </view>
    </view>

    <!-- 步骤内容区域 -->
    <scroll-view class="content" scroll-y :scroll-top="scrollTop">
      <!-- 步骤1：基本信息 -->
      <view v-if="currentStep === 1">
        <FormCard title="项目基本信息">
          <view class="form-item">
            <text class="label">项目名称<text class="req">*</text></text>
            <input v-model="form.name" placeholder="请输入项目名称" class="input" />
          </view>
          <view class="form-item">
            <text class="label">项目描述<text class="req">*</text></text>
            <textarea v-model="form.desc" placeholder="请输入项目描述" class="textarea" />
          </view>
        </FormCard>

        <FormCard title="赛道与分级（接口 belongTrack / level）">
          <view class="form-item">
            <text class="label">所属赛道<text class="req">*</text></text>
            <view class="select" @click="selectCategory">
              {{ form.category || '请选择（如大创、挑战杯）' }}
            </view>
          </view>
          <view class="form-item">
            <text class="label">项目级别<text class="req">*</text></text>
            <view class="select" @click="selectLevel">
              {{ levelDisplay }}
            </view>
          </view>
          <view class="form-item">
            <text class="label">项目类型<text class="req">*</text></text>
            <view class="select" @click="selectProjectType">
              {{ form.projectType || '请选择' }}
            </view>
          </view>
          <view class="form-item">
            <text class="label">项目状态<text class="req">*</text></text>
            <view class="select" @click="selectApiStatus">
              {{ apiStatusDisplay }}
            </view>
          </view>
        </FormCard>

        <FormCard title="亮点与标签（接口 projectFeatures / tags）">
          <view class="form-item">
            <text class="label">项目特点 / 亮点</text>
            <textarea v-model="form.projectFeatures" placeholder="如：智能匹配、跨专业协作" class="textarea" />
          </view>
          <view class="form-item">
            <text class="label">项目标签</text>
            <input v-model="form.tags" placeholder="多个标签请用英文逗号分隔，如：AI,组队,校园" class="input" />
          </view>
        </FormCard>

        <FormCard title="招聘需求">
          <view class="add-row">
            <button class="add-btn" @click="addRole">添加角色</button>
          </view>
        
          <!-- 一组 = 角色名称 + 招募数量 放在一起 -->
          <view class="role-group" v-for="(item, idx) in form.roles" :key="idx">
            <view class="form-item">
              <text class="label">角色名称 {{ idx + 1 }}<text class="req">*</text></text>
              <input v-model="item.name" placeholder="如：前端、后端、设计" class="input" />
            </view>
            <view class="form-item">
              <text class="label">招募数量<text class="req">*</text></text>
              <input v-model="item.count" placeholder="请输入数字" class="input" />
            </view>
          </view>
        </FormCard>
      </view>

      <!-- 步骤2：团队与角色 -->
      <view v-if="currentStep === 2">
        <FormCard title="招募设置">
          <view class="form-item">
            <text class="label">截止时间<text class="req">*</text></text>
            <view class="deadline-pickers">
              <picker mode="date" :value="form.deadlineDate" @change="onDeadlineDateChange">
                <view class="picker-value">{{ form.deadlineDate || '选择日期' }}</view>
              </picker>
              <picker mode="time" :value="form.deadlineTime" @change="onDeadlineTimeChange">
                <view class="picker-value">{{ form.deadlineTime || '选择时间' }}</view>
              </picker>
            </view>
          </view>
          <view class="form-item switch-row">
            <text class="label">允许跨专业申请</text>
            <view class="switch" :class="form.allowCrossMajor ? 'on' : ''" @click="form.allowCrossMajor = !form.allowCrossMajor">
              <view class="switch-circle"></view>
            </view>
          </view>
          <view class="form-item switch-row">
            <text class="label">匿名发布</text>
            <view class="switch" :class="form.isAnonymous ? 'on' : ''" @click="form.isAnonymous = !form.isAnonymous">
              <view class="switch-circle"></view>
            </view>
          </view>
          <view v-if="form.isAnonymous" class="form-item">
            <text class="label">对外联系方式<text class="req">*</text></text>
            <input v-model="form.contactInfo" placeholder="匿名时在广场展示的联系方式，如：队长微信 xxx" class="input" />
          </view>
        </FormCard>

        <FormCard title="角色详情配置">
          <view class="form-item" v-for="(item, idx) in form.roles" :key="idx">
            <text class="label">{{ item.name || '未命名角色' }} ({{ item.count || 0 }}人)</text>
            <textarea v-model="item.requirement" placeholder="具体要求：" class="textarea" />
          </view>
        </FormCard>
      </view>

      <!-- 步骤3：预览发布 -->
      <view v-if="currentStep === 3">
        <FormCard>
          <view class="preview-title">{{ form.name || '基于AI的校园组队平台' }}</view>
          <view class="preview-tags">
            <view class="tag tag-type">{{ form.category || '大创项目' }}</view>
            <view class="tag tag-status">{{ apiStatusDisplay }}</view>
            <view class="tag tag-level">{{ levelDisplay }}</view>
            <view class="tag tag-ptype">{{ form.projectType || '创新训练' }}</view>
          </view>
          <view v-if="form.projectFeatures" class="preview-features">亮点：{{ form.projectFeatures }}</view>
          <view v-if="form.tags" class="preview-tags-line">标签：{{ form.tags }}</view>
          <view v-if="form.isAnonymous" class="preview-anon">匿名发布 · 联系方式：{{ form.contactInfo || '未填写' }}</view>
          <view class="preview-desc">
            项目描述预览：{{ form.desc || '本项目旨在利用人工智能技术，为华师大学生提供一个高效，精准的比赛组队平台' }}
          </view>
          <view class="recruit-section">
            <view class="recruit-title">招募信息</view>
            <view class="recruit-deadline">⏰ 截止时间：{{ deadlinePreview || '2025-01-23 23:59' }}</view>
            <view class="role-list">
              <view class="role-item" v-for="(item, idx) in form.roles" :key="idx">
                <view class="role-header">
                  <text>{{ item.name || '前端开发' }} ({{ item.count || 2 }}人)</text>
                  <text class="arrow">∧</text>
                </view>
                <view class="role-req">
                  具体要求：{{ item.requirement || '熟练掌握Vue/React，有小程序开发经验' }}
                </view>
              </view>
            </view>
          </view>
        </FormCard>
      </view>
    </scroll-view>

    <!-- 底部固定按钮 -->
    <view class="footer">
      <button v-if="!editingProjectId" class="btn draft" @click="saveDraft">保存草稿</button>
      <button class="btn next" @click="nextStep">
        {{ currentStep === 3 ? (editingProjectId ? '保存修改' : '发布') : '下一步' }}
      </button>
    </view>
  </view>
</template>

<script>
import FormCard from '@/components/FormCard.vue'
import api from '@/common/api/index.js'

export default {
  components: { FormCard },
  data() {
    return {
      currentStep: 1,
	  scrollTop: 0,
      stepStatus: { 1: false, 2: false, 3: false },
      form: {
        name: '',
        desc: '',
        category: '',
        /** 接口 status：0草拟 1实施 2招募中 3完成 4终止 */
        apiStatus: 2,
        /** 接口 level：1校级 2省级 3国家级 */
        level: 1,
        /** 接口 projectType */
        projectType: '创新训练',
        projectFeatures: '',
        tags: '',
        isAnonymous: false,
        contactInfo: '',
        deadlineDate: '',
        deadlineTime: '23:59',
        allowCrossMajor: false,
        roles: [{ name: '', count: '', requirement: '' }]
      },
      categoryOptions: ['大创', '挑战杯', '互联网+', '其他'],
      projectTypeOptions: ['创新训练', '创业实践'],
      apiStatusOptions: [
        { label: '草拟', value: 0 },
        { label: '实施', value: 1 },
        { label: '招募中', value: 2 },
        { label: '完成', value: 3 },
        { label: '终止', value: 4 }
      ],
      editingDraftId: null,
      editingProjectId: null
    }
  },

  computed: {
    deadlinePreview() {
      if (!this.form.deadlineDate || !this.form.deadlineTime) return ''
      return `${this.form.deadlineDate} ${this.form.deadlineTime}`
    },
    levelDisplay() {
      const m = { 1: '校级', 2: '省级', 3: '国家级' }
      const lv = Number(this.form.level)
      return m[lv] || '校级'
    },
    apiStatusDisplay() {
      const m = { 0: '草拟', 1: '实施', 2: '招募中', 3: '完成', 4: '终止' }
      const s = Number(this.form.apiStatus)
      return m[s] !== undefined ? m[s] : '招募中'
    }
  },

  onShow() {
    uni.$off('loadDraft')
    uni.$on('loadDraft', (draft) => {
      this.editingProjectId = null
      this.editingDraftId = draft.id // 记录正在编辑的草稿ID
      this.form = this.normalizeDraftForm(draft.form)
      // 兼容旧草稿字段
      if (this.form.deadline && !this.form.deadlineDate) {
        this.form.deadlineDate = String(this.form.deadline).slice(0, 10)
      }
      if (!this.form.deadlineTime) {
        this.form.deadlineTime = '23:59'
      }
      this.currentStep = draft.currentStep
      this.stepStatus = draft.stepStatus
      uni.setNavigationBarTitle({ title: '新建项目' })
      uni.showToast({ title: '已加载草稿', icon: 'success' })
    })

    uni.$off('editProject')
    uni.$on('editProject', ({ projectId }) => {
      if (projectId != null) this.loadProjectForEdit(projectId)
    })

    uni.$off('clearProjectEdit')
    uni.$on('clearProjectEdit', () => {
      this.resetToNewProject()
    })
  },

  methods: {
    validateStep(step) {
      if (step === 1) {
        const name = this.form.name?.trim()
        const desc = this.form.desc?.trim()
        const category = this.form.category?.trim()
        if (!name) return { ok: false, msg: '请填写项目名称' }
        if (!desc) return { ok: false, msg: '请填写项目描述' }
        if (!category) return { ok: false, msg: '请选择竞赛类别' }
        if (!Array.isArray(this.form.roles) || this.form.roles.length === 0) {
          return { ok: false, msg: '请至少添加一个角色需求' }
        }
        for (let i = 0; i < this.form.roles.length; i++) {
          const r = this.form.roles[i] || {}
          const roleName = String(r.name || '').trim()
          const count = String(r.count || '').trim()
          if (!roleName) return { ok: false, msg: `请填写角色名称 ${i + 1}` }
          if (!count) return { ok: false, msg: `请填写角色 ${i + 1} 的招募数量` }
          const n = Number(count)
          if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) {
            return { ok: false, msg: `角色 ${i + 1} 的招募数量需为正整数` }
          }
        }
        return { ok: true }
      }

      if (step === 2) {
        const deadline = this.buildDeadlineRecruit()
        if (!deadline) return { ok: false, msg: '请选择截止时间' }
        if (this.form.isAnonymous && !String(this.form.contactInfo || '').trim()) {
          return { ok: false, msg: '匿名发布请填写对外联系方式' }
        }
        return { ok: true }
      }

      if (step === 3) {
        const v1 = this.validateStep(1)
        if (!v1.ok) return v1
        const v2 = this.validateStep(2)
        if (!v2.ok) return v2
        return { ok: true }
      }

      return { ok: true }
    },
    onDeadlineDateChange(e) {
      this.form.deadlineDate = e.detail.value
    },
    onDeadlineTimeChange(e) {
      this.form.deadlineTime = e.detail.value
    },
    buildDeadlineRecruit() {
      const d = this.form.deadlineDate
      const t = this.form.deadlineTime
      if (!d || !t) return ''
      // 后端字段是 LocalDateTime，需要 YYYY-MM-DDTHH:mm:ss
      return `${d}T${t}:00`
    },
    goStep(step) {
      if (this.stepStatus[step] || step <= this.currentStep) {
        this.currentStep = step
		this.scrollTop = 0
      } else {
        uni.showToast({ title: '请先完成当前步骤', icon: 'none' })
      }
    },

    selectCategory() {
      uni.showActionSheet({
        itemList: this.categoryOptions,
        success: (res) => {
          this.form.category = this.categoryOptions[res.tapIndex]
        }
      })
    },

    selectLevel() {
      uni.showActionSheet({
        itemList: ['校级', '省级', '国家级'],
        success: (res) => {
          this.form.level = res.tapIndex + 1
        }
      })
    },

    selectProjectType() {
      uni.showActionSheet({
        itemList: this.projectTypeOptions,
        success: (res) => {
          this.form.projectType = this.projectTypeOptions[res.tapIndex]
        }
      })
    },

    selectApiStatus() {
      const labels = this.apiStatusOptions.map((x) => x.label)
      uni.showActionSheet({
        itemList: labels,
        success: (res) => {
          const opt = this.apiStatusOptions[res.tapIndex]
          if (opt) this.form.apiStatus = opt.value
        }
      })
    },

    /** 合并旧版草稿缺省字段 */
    normalizeDraftForm(raw) {
      const f = JSON.parse(JSON.stringify(raw || {}))
      if (f.apiStatus === undefined && f.status) {
        const legacy = { 招募中: 2, 已结束: 4 }
        f.apiStatus = legacy[f.status] != null ? legacy[f.status] : 2
      }
      if (f.apiStatus === undefined || f.apiStatus === '') f.apiStatus = 2
      if (f.level === undefined || f.level === '') f.level = 1
      if (!f.projectType) f.projectType = '创新训练'
      if (f.projectFeatures === undefined) f.projectFeatures = ''
      if (f.tags === undefined) f.tags = ''
      if (f.isAnonymous === undefined) f.isAnonymous = false
      if (f.contactInfo === undefined) f.contactInfo = ''
      if (!Array.isArray(f.roles) || f.roles.length === 0) {
        f.roles = [{ name: '', count: '', requirement: '' }]
      }
      return f
    },

    addRole() {
      this.form.roles.push({ name: '', count: '', requirement: '' })
    },

    onBackFromEdit() {
      this.resetToNewProject()
      uni.navigateTo({
        url: '/pages/user/my-projects?type=launched'
      })
    },

    resetToNewProject() {
      this.editingProjectId = null
      this.editingDraftId = null
      this.currentStep = 1
      this.stepStatus = { 1: false, 2: false, 3: false }
      this.form = {
        name: '',
        desc: '',
        category: '',
        apiStatus: 2,
        level: 1,
        projectType: '创新训练',
        projectFeatures: '',
        tags: '',
        isAnonymous: false,
        contactInfo: '',
        deadlineDate: '',
        deadlineTime: '23:59',
        allowCrossMajor: false,
        roles: [{ name: '', count: '', requirement: '' }]
      }
      uni.setNavigationBarTitle({ title: '新建项目' })
    },

    parseDeadlineRecruit(raw) {
      if (!raw) return { date: '', time: '23:59' }
      const s = String(raw).replace(/Z$/i, '')
      const [datePart, timePart = ''] = s.split('T')
      let time = '23:59'
      if (timePart) {
        const hm = timePart.match(/^(\d{1,2}):(\d{2})/)
        if (hm) time = `${hm[1].padStart(2, '0')}:${hm[2]}`
      }
      return { date: datePart || '', time }
    },

    applyProjectDetailToForm(data) {
      const { date, time } = this.parseDeadlineRecruit(data.deadlineRecruit)
      const rolesFromApi = Array.isArray(data.roleRequirements) ? data.roleRequirements : []
      const st = data.status
      this.form = {
        name: data.name || '',
        desc: data.projectIntro || '',
        category: data.belongTrack || '',
        apiStatus: typeof st === 'number' && st >= 0 && st <= 4 ? st : 2,
        level: data.level != null ? data.level : 1,
        projectType: data.projectType || '创新训练',
        projectFeatures: data.projectFeatures || '',
        tags: data.tags || '',
        isAnonymous: !!data.isAnonymous,
        contactInfo: data.contactInfo || '',
        deadlineDate: date,
        deadlineTime: time,
        allowCrossMajor: !!data.allowCrossMajor,
        roles:
          rolesFromApi.length > 0
            ? rolesFromApi.map((r) => ({
                name: r.role || '',
                count: String(r.memberQuota != null ? r.memberQuota : ''),
                requirement: r.recruitRequirements || ''
              }))
            : [{ name: '', count: '', requirement: '' }]
      }
    },

    async loadProjectForEdit(projectId) {
      try {
        const res = await api.getProjectDetail(projectId)
        const data = res?.data
        if (data == null || data.projectId == null) {
          uni.showToast({ title: '项目不存在', icon: 'none' })
          return
        }
        this.editingDraftId = null
        this.editingProjectId = projectId
        this.applyProjectDetailToForm(data)
        this.currentStep = 1
        this.stepStatus = { 1: true, 2: true, 3: true }
        uni.setNavigationBarTitle({ title: '编辑项目' })
        uni.showToast({ title: '已进入编辑', icon: 'success' })
      } catch (err) {
        console.error('加载项目失败', err)
        uni.showToast({ title: '加载失败', icon: 'none' })
      }
    },

    saveDraft() {
      if (this.editingProjectId) {
        uni.showToast({ title: '编辑已发布项目请使用「保存修改」', icon: 'none' })
        return
      }
      if (!this.form.name) {
        uni.showToast({ title: '请填写项目名称', icon: 'none' })
        return
      }

      const draftData = {
        currentStep: this.currentStep,
        stepStatus: { ...this.stepStatus },
        form: JSON.parse(JSON.stringify(this.form))
      }

      let drafts = uni.getStorageSync('projectDrafts') || []

      if (this.editingDraftId) {
        // 覆盖更新原有草稿
        drafts = drafts.map(d => 
          d.id === this.editingDraftId ? { ...d, ...draftData } : d
        )
        uni.showToast({ title: '草稿已更新', icon: 'success' })
      } else {
        // 新建草稿
        const newDraft = {
          id: Date.now(),
          title: this.form.name,
          ...draftData
        }
        drafts.unshift(newDraft)
        uni.showToast({ title: '草稿保存成功', icon: 'success' })
      }

      uni.setStorageSync('projectDrafts', drafts)

      // 清空表单
      setTimeout(() => {
        this.currentStep = 1
        this.stepStatus = { 1: false, 2: false, 3: false }
        this.form = {
          name: '',
          desc: '',
          category: '',
          apiStatus: 2,
          level: 1,
          projectType: '创新训练',
          projectFeatures: '',
          tags: '',
          isAnonymous: false,
          contactInfo: '',
          deadlineDate: '',
          deadlineTime: '23:59',
          allowCrossMajor: false,
          roles: [{ name: '', count: '', requirement: '' }]
        }
        this.editingDraftId = null
      }, 1500)
    },

    nextStep() {
      if (this.currentStep < 3) {
        const v = this.validateStep(this.currentStep)
        if (!v.ok) {
          uni.showToast({ title: v.msg, icon: 'none' })
          return
        }
        this.stepStatus[this.currentStep] = true
        this.currentStep++
		this.scrollTop = 0
      } else {
        this.submitProject()
      }
    },

    // ======================
    // ✅ 发布项目 → 自动删除草稿
    // ======================
    buildCreateOrUpdatePayload() {
      const deadlineRecruit = this.buildDeadlineRecruit()
      const roleRequirements = this.form.roles.map((item) => ({
        role: item.name,
        memberQuota: Number(item.count),
        recruitRequirements: item.requirement || ''
      }))
      const anon = !!this.form.isAnonymous
      const lv = Number(this.form.level)
      const st = Number(this.form.apiStatus)
      return {
        name: this.form.name.trim(),
        belongTrack: this.form.category,
        level: Number.isFinite(lv) && lv >= 1 && lv <= 3 ? lv : 1,
        projectType: this.form.projectType,
        projectIntro: this.form.desc,
        projectFeatures: (this.form.projectFeatures || '').trim(),
        tags: (this.form.tags || '').trim(),
        allowCrossMajor: this.form.allowCrossMajor,
        isAnonymous: anon,
        contactInfo: anon ? String(this.form.contactInfo || '').trim() : '',
        deadlineRecruit,
        status: Number.isFinite(st) && st >= 0 && st <= 4 ? st : 2,
        roleRequirements
      }
    },

    async submitProject() {
      const v = this.validateStep(3)
      if (!v.ok) {
        uni.showToast({ title: v.msg, icon: 'none' })
        return
      }

      const isUpdate = !!this.editingProjectId
      const params = this.buildCreateOrUpdatePayload()

      if (!params.deadlineRecruit) {
        uni.showToast({ title: '请选择截止时间', icon: 'none' })
        return
      }

      try {
        if (isUpdate) {
          await api.updateProject(this.editingProjectId, params)
          uni.showToast({ title: '保存成功', icon: 'success' })
          uni.$emit('project:updated', { projectId: this.editingProjectId })
        } else {
          const res = await api.createProject(params)
          uni.showToast({ title: '发布成功', icon: 'success' })
          uni.$emit('project:created', res?.data || null)
          if (this.editingDraftId) {
            let drafts = uni.getStorageSync('projectDrafts') || []
            drafts = drafts.filter((d) => d.id !== this.editingDraftId)
            uni.setStorageSync('projectDrafts', drafts)
            this.editingDraftId = null
          }
        }

        setTimeout(() => {
          this.resetToNewProject()
          if (isUpdate) {
            uni.navigateTo({ url: '/pages/user/my-projects?type=launched' })
          } else {
            uni.switchTab({ url: '/pages/square/index' })
          }
        }, 600)
      } catch (err) {
        console.error(isUpdate ? '保存失败' : '发布失败', err)
        uni.showToast({
          title: err?.data?.message || err?.message || (isUpdate ? '保存失败' : '发布失败'),
          icon: 'none'
        })
      }
    },
  }
}
</script>

<style scoped>
.create-page {
  min-height: 100vh;
  background: #f5f7fb;
  padding-bottom: 120rpx;
}

.edit-back-row {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx 12rpx;
  background: #fff;
  border-bottom: 1rpx solid #e8e8ef;
}
.edit-back-icon {
  font-size: 44rpx;
  line-height: 1;
  color: #1677ff;
  margin-right: 4rpx;
  font-weight: 600;
}
.edit-back-text {
  font-size: 28rpx;
  color: #1677ff;
}

/* 步骤栏 */
.steps {
  display: flex;
  padding: 20rpx;
  background: #fff;
}
.step-item {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  border-radius: 10rpx;
  font-size: 26rpx;
  color: #1677ff;
  background: #ffffff;
  border: 1rpx solid #1677ff;
  position: relative;
  margin: 0 5rpx;
}
.step-item.active {
  background: #1677ff;
  color: #fff;
}
.step-item.done {
  background: #1677ff;
  color: #fff;
}
.step-item.done text {
  margin-right: 8rpx;
}

/* 内容 */
.content {
  padding: 20rpx 0;
  height: calc(100vh - 300rpx);
}

/* 表单项 */
.form-item {
  margin-bottom: 30rpx;
}
.label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}
.input, .textarea, .select {
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  line-height: 80rpx;
  background: #fff;
}
.textarea {
  min-height: 120rpx;
  line-height: 1.5;
  padding: 20rpx;
}
.select {
  color: #666;
}

.input {
	height:40px;
	width: 100%;
	padding: 0 12px;
	box-sizing: border-box;
	
	border: 1px solid #ddd;
	border-radius: 4px; 
	outline: none;
}

.deadline-pickers {
  display: flex;
  gap: 12px;
}

.picker-value {
  height: 40px;
  line-height: 40px;
  padding: 0 12px;
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  color: #333;
}

.req {
  color: #ff4d4f;
  margin-left: 4px;
}
/* 开关样式 */
.switch-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.switch {
  width: 80rpx;
  height: 40rpx;
  border-radius: 20rpx;
  background: #ccc;
  position: relative;
}
.switch.on {
  background: #1677ff;
}
.switch-circle {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 2rpx;
  left: 2rpx;
  transition: all 0.3s;
}
.switch.on .switch-circle {
  left: 42rpx;
}

/* 添加按钮 */
.add-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20rpx;
}
.add-btn {
  font-size: 24rpx;
  padding: 10rpx 20rpx;
  background: #1677ff;
  color: #fff;
  border-radius: 8rpx;
}

/* 预览页面样式 */
.preview-title {
  font-size: 48rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}
.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 30rpx;
}
.tag {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}
.tag-type {
  background: #e6f2ff;
  color: #1677ff;
}
.tag-status {
  background: #f0f9eb;
  color: #67c23a;
}
.tag-level {
  background: #fff7e6;
  color: #d48806;
}
.tag-ptype {
  background: #f9f0ff;
  color: #722ed1;
}
.preview-features,
.preview-tags-line {
  font-size: 26rpx;
  color: #555;
  line-height: 1.5;
  margin-bottom: 16rpx;
}
.preview-anon {
  font-size: 26rpx;
  color: #d48806;
  margin-bottom: 20rpx;
}
.preview-desc {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  margin-bottom: 40rpx;
}
.recruit-section {
  border-top: 1rpx dashed #ccc;
  padding-top: 30rpx;
}
.recruit-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}
.recruit-deadline {
  font-size: 28rpx;
  margin-bottom: 30rpx;
}
.role-item {
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  margin-bottom: 20rpx;
}
.role-header {
  display: flex;
  justify-content: space-between;
  padding: 20rpx;
  background: #f5f5f5;
  font-size: 28rpx;
}
.arrow {
  color: #999;
}
.role-req {
  padding: 20rpx;
  font-size: 26rpx;
  color: #666;
}

/* 底部固定按钮 */
.footer {
  position: fixed;
  left: -10px;
  bottom: 48px;
  width: 100%;
  display: flex;
  padding: 20rpx;
  background: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
}
.btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 10rpx;
  font-size: 30rpx;
  margin: 0 10rpx;
}
.draft {
  background: #f5f5f5;
  color: #666;
}
.next {
  background: #1677ff;
  color: #fff;
}
</style>