<template>
  <view class="square-page">
    <view class="filter-header">
      <view class="filter-row1">
        <view class="sort-filter">
          <text class="sort-item" :class="{ active: currentSort === 'recommend' }" @click="changeSort('recommend')">推荐</text>
          <text class="sort-item" :class="{ active: currentSort === 'latest' }" @click="changeSort('latest')">最新</text>
        </view>
        <view class="search-bar">
          <input class="search-input" type="text" placeholder="搜索项目/关键词" v-model="searchKeyword" @confirm="handleSearch" />
          <text class="search-icon" @click="handleSearch">🔍</text>
        </view>
		<text class="filter-btn" @click="showFilter = true">筛选</text>
      </view>

      <view class="filter-row2">
       <!-- <text class="category-item" :class="{ active: currentCategory === 'all' }" @click="changeCategory('all')">综合</text>-->
       <!-- <text class="category-item" :class="{ active: currentCategory === 'internet+' }" @click="changeCategory('internet+')">互联网+</text>-->
       <!--<text class="category-item" :class="{ active: currentCategory === 'innovation' }" @click="changeCategory('innovation')">大创</text>-->
        
      </view>
    </view>

    <Loading show="true" text="加载项目中..." v-if="loading" />

    <view class="project-list" v-else>
      <view class="empty-tip" v-if="filteredProjects.length === 0">
        <text>暂无符合条件的项目</text>
      </view>

      <ProjectCard 
        v-for="(project, index) in filteredProjects" 
        :key="project.id || index"
        :project="project"
        @click="goProjectDetail(project)"
      />
    </view>

    <!-- 🔥 筛选弹窗（侧拉） -->
    <view class="filter-modal" v-if="showFilter" @click="closeFilter">
      <view class="filter-panel" @click.stop>
        <!-- 头部 -->
        <view class="filter-header-top">
          <text class="close-icon" @click="closeFilter">✕</text>
          <text class="filter-title">筛选</text>
        </view>
      
        <!-- 主体：左侧筛选分类 + 右侧选项 -->
        <view class="filter-body">
          <!-- 左侧：筛选分类（年级/比赛/技术栈） -->
          <view class="filter-sidebar">
            <text 
              class="sidebar-item" 
              :class="{ active: activeFilterTab === 'grade' }"
              @click="activeFilterTab = 'grade'"
            >年级</text>
            <text 
              class="sidebar-item" 
              :class="{ active: activeFilterTab === 'competition' }"
              @click="activeFilterTab = 'competition'"
            >比赛</text>
            <text 
              class="sidebar-item" 
              :class="{ active: activeFilterTab === 'tech' }"
              @click="activeFilterTab = 'tech'"
            >技术栈</text>
          </view>
      
          <!-- 右侧：选项内容区 -->
          <view class="filter-content">
            <!-- 年级 -->
            <view v-if="activeFilterTab === 'grade'" class="filter-section">
              <text class="section-title">年级要求</text>
              <view class="option-grid">
                <text 
                  class="filter-option" 
                  :class="{ selected: selectedGrades.includes(item) }"
                  @click="toggleSelect('grade', item)"
                  v-for="item in gradeOptions" 
                  :key="item"
                >{{ item }}</text>
              </view>
            </view>
      
            <!-- 比赛 -->
            <view v-if="activeFilterTab === 'competition'" class="filter-section">
              <text class="section-title">比赛类型</text>
              <view class="option-grid">
                <text 
                  class="filter-option" 
                  :class="{ selected: selectedCompetitions.includes(item) }"
                  @click="toggleSelect('competition', item)"
                  v-for="item in competitionOptions" 
                  :key="item"
                >{{ item }}</text>
              </view>
            </view>
      
            <!-- 技术栈 -->
            <view v-if="activeFilterTab === 'tech'" class="filter-section">
              <text class="section-title">技术栈</text>
              <view class="option-grid">
                <text 
                  class="filter-option" 
                  :class="{ selected: selectedTechs.includes(item) }"
                  @click="toggleSelect('tech', item)"
                  v-for="item in techOptions" 
                  :key="item"
                >{{ item }}</text>
              </view>
            </view>
          </view>
        </view>
      
        <!-- 底部按钮 -->
        <view class="filter-footer">
          <button class="btn-clear" @click="clearAllFilter">清除</button>
          <button class="btn-confirm" @click="confirmFilter">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import ProjectCard from '../../components/ProjectCard.vue'
import Loading from '@/components/Loading.vue'
import api from '@/common/api/index.js'

export default {
  components: {
    ProjectCard,
    Loading
  },
  data() {
    return {
      isNavigating: false,
      loading: false,
      currentSort: "recommend",
      currentCategory: "all",
      searchKeyword: "",
      showFilter: false,
      projectList: [],
      currentPage: 1,
      
      // 🔥 筛选相关数据
      activeFilterTab: "grade", // 当前激活的筛选标签
      // 选项列表
      gradeOptions: ["全部", "大一", "大二", "大三", "大四", "研究生"],
      competitionOptions: ["互联网+", "大创", "挑战杯", "其他"],
      techOptions: ["Vue", "React", "Python", "Java", "C++", "前端", "后端", "AI"],
      // 已选中的选项
      selectedGrades: [],
	  
      selectedCompetitions: [],
      selectedTechs: []
    };
  },

  computed: {
    filteredProjects() {
      let result = [...this.projectList];

      // 后端字段 → 前端字段映射
      // 接口 status：0草拟 1实施 2招募中 3完成 4终止（原先把「非0」都当已结束，导致 2 被误判）
      result = result.map(item => {
        const st = this.mapProjectStatusForCard(item.status)
        return {
        id: item.projectId,
        name: item.name,
        desc: item.projectIntro,
        category: item.belongTrack === "大创" ? "innovation" : "internet+",
        tags: item.tags ? item.tags.split(",") : [],
        founder: this.mapFounderForListItem(item),
        status: st.text,
        statusClass: st.class,
        deadline: item.deadlineRecruit ? item.deadlineRecruit.slice(5, 10) : "",
        submitTime: item.releaseTime || "暂无发布时间",
        grade: item.grade || "不限",
        competition: item.competition || "其他",
        techStack: item.techStack ? item.techStack.split(",") : []
        }
      });

      // 分类筛选
      if (this.currentCategory !== "all") {
        result = result.filter(item => item.category === this.currentCategory);
      }

      // 搜索
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase();
        result = result.filter(item => {
          const nameMatch = item.name?.toLowerCase().includes(keyword);
          const descMatch = item.desc?.toLowerCase().includes(keyword);
          const tagMatch = item.tags?.some(t => t.toLowerCase().includes(keyword));
          return nameMatch || descMatch || tagMatch;
        });
      }

      // 🔥 年级筛选
      if (this.selectedGrades.length > 0 && !this.selectedGrades.includes("全部")) {
        result = result.filter(item => 
          this.selectedGrades.includes(item.grade)
        );
      }

      // 🔥 比赛筛选
      if (this.selectedCompetitions.length > 0) {
        result = result.filter(item => 
          this.selectedCompetitions.includes(item.competition)
        );
      }

      // 🔥 技术栈筛选
      if (this.selectedTechs.length > 0) {
        result = result.filter(item => 
          item.techStack.some(tech => this.selectedTechs.includes(tech))
        );
      }

      // 排序
      if (this.currentSort === "latest") {
        result.sort((a, b) => new Date(b.submitTime) - new Date(a.submitTime));
      } else {
        result.sort(() => Math.random() - 0.5);
      }
      
      console.log("最终要渲染的数据：", result); 
      return result;
    }
  },

  onLoad() {
    uni.$off('project:created')
    uni.$on('project:created', () => {
      this.currentPage = 1
      this.fetchProjects()
    })
    this.fetchProjects();
  },

  onShow() {
    // 从其他页面返回时刷新，确保能看到最新发布的项目
    this.currentPage = 1
    this.fetchProjects()
  },

  onUnload() {
    uni.$off('project:created')
  },

  methods: {
    /** 与 TeamMatching 接口文档一致：仅 3完成 / 4终止 视为已结束 */
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

    /** 列表项是否匿名发布（需后端在 ProjectListItem 中带 isAnonymous） */
    isListItemAnonymous(item) {
      const v = item?.isAnonymous
      return v === true || v === 1 || v === '1' || v === 'true'
    },

    /** 匿名时不展示真实昵称，与接口说明一致 */
    mapFounderForListItem(item) {
      if (this.isListItemAnonymous(item)) {
        return '匿名用户'
      }
      return item.publisherInfo?.nickname || '匿名'
    },

    buildProjectListQuery() {
      const params = {
        sort: this.currentSort,
        keyword: this.searchKeyword,
        page: this.currentPage || 1,
        size: 10
      }
      // 接口 track 为可选；传 all 会导致后端筛不出数据，综合不传 track（空）
      if (this.currentCategory && this.currentCategory !== 'all') {
        const TRACK_MAP = {
          'internet+': '互联网+',
          innovation: '大创'
        }
        params.track = TRACK_MAP[this.currentCategory] || this.currentCategory
      }
      return params
    },

    async fetchProjects() {
      this.loading = true;
      try {
        const res = await api.getProjectList(this.buildProjectListQuery());

        console.log("接口原始返回：", res);

        if (res.data && Array.isArray(res.data)) {
          this.projectList = res.data;
        } else if (res.data && res.data.list && Array.isArray(res.data.list)) {
          this.projectList = res.data.list;
        } else {
          console.warn("接口返回格式异常或无数据", res);
          this.projectList = []
        }

      } catch (err) {
        console.error("捕获到异常（可能是Code非0），尝试提取数据...", err);
        // 给用户一个明确提示，避免“空列表但不知道原因”
        const msg =
          err?.data?.message ||
          err?.message ||
          (typeof err?.errMsg === 'string' ? err.errMsg : '') ||
          '获取项目失败'
        uni.showToast({ title: msg, icon: 'none' })

        if (err.data && Array.isArray(err.data)) {
          console.log("从错误中抢救到了数据！");
          this.projectList = err.data;
        } else if (err.data && err.data.data && Array.isArray(err.data.data)) {
           this.projectList = err.data.data;
        } else {
          this.projectList = []
        }
      } finally {
        this.loading = false;
      }
    },

    changeSort(t) {
      this.currentSort = t;
      this.currentPage = 1;
      this.fetchProjects();
    },
    changeCategory(t) {
      this.currentCategory = t;
      this.currentPage = 1;
      this.fetchProjects();
    },
    handleSearch() {
      this.currentPage = 1;
      this.fetchProjects();
    },

    goProjectDetail(project) {
      if (this.isNavigating) return; 
      this.isNavigating = true;
      console.log("点击的项目对象：", project);
      const id = project.id; 
      
      if (!id) {
        this.isNavigating = false;
        return;
      }

      uni.navigateTo({
        url: `/pages/projectDetail/index?projectId=${id}`,
        fail: (err) => {
          console.error("跳转失败", err);
        },
        complete: () => {
          setTimeout(() => {
            this.isNavigating = false;
          }, 500); 
        }
      });
    },

    // 🔥 筛选相关方法
    // 🔥 修复：真正的多选逻辑（点谁选谁，互不干扰）
    toggleSelect(type, item) {
      let list;
      if (type === "grade") list = this.selectedGrades;
      else if (type === "competition") list = this.selectedCompetitions;
      else if (type === "tech") list = this.selectedTechs;
    
      // 核心：只切换当前点击项，不影响其他
      const index = list.indexOf(item);
      if (index > -1) {
        // 已经选中 → 取消
        list.splice(index, 1);
      } else {
        // 未选中 → 添加
        list.push(item);
      }
    },

    // 清除所有筛选
    clearAllFilter() {
      this.selectedGrades = [];
      this.selectedCompetitions = [];
      this.selectedTechs = [];
    },

    // 确定筛选：关闭弹窗
    confirmFilter() {
      this.showFilter = false;
    },

    // 关闭筛选弹窗
    closeFilter() {
      this.showFilter = false;
    }
  }
};
</script>

<style scoped>
.square-page {
  min-height: 100vh;
  background: #f5f7fb;
  padding-top: 25%;
}
.filter-header {
  position: fixed; top: 40px; left: 0; width: 92%;
  background: #fff; padding: 15px 15px;
  border-bottom: 1px solid #eee; z-index: 99;
  height:30px;
}
.filter-row1 {
  display: flex; justify-content: space-between; align-items: center;
}
.sort-filter {
  display: flex; gap: 20px;
}
.sort-item {
  font-size: 16px; color: #666;
}
.sort-item.active {
  color: #007aff; font-weight: bold; border-bottom: 2px solid #007aff;
}
.search-bar {
  background: #f5f5f5;
      border-radius: 20px;
      padding: 5px 15px;
      width: 45%;
      display: flex;
      align-items: center;
      /* flex: 1; */
      margin-left: 20px
}
.search-input {
  border: none; outline: none; background: transparent; flex: 1;
}
.filter-row2 {
  display: flex; gap: 20px; margin-top: 15px;
}
.category-item {
  font-size: 14px; color: #666;
}
.category-item.active {
  color: #007aff; font-weight: bold;
}
.filter-btn {
  margin-left: auto; border: 1px solid #007aff; padding: 3px 8px; border-radius: 4px; color: #007aff;
}
.project-list {
  padding: 10px;
}
.empty-tip {
  text-align: center; padding: 50px 0; color: #999;
}

/* 筛选弹窗 */
.filter-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.4);
  z-index: 999;
  animation: fadeIn 0.3s ease;
}
.filter-panel {
  width: 85vw;
  height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

/* 筛选头部 */
.filter-header-top {
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: 1rpx solid #eee;
}
.close-icon {
  position: absolute;
  left: 30rpx;
  font-size: 40rpx;
  color: #333;
}
.filter-title {
  font-size: 36rpx;
  font-weight: bold;
}

/* 主体左右布局 */
.filter-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 左侧：筛选分类 */
.filter-sidebar {
  width: 200rpx;
  background: #f5f5f5;
  flex-shrink: 0;
}
.sidebar-item {
  display: block;
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  font-size: 32rpx;
  color: #333;
  border-left: 6rpx solid transparent;
}
.sidebar-item.active {
  background: #fff;
  border-left-color: #003399;
  color: #003399;
  font-weight: bold;
}

/* 右侧：选项内容 */
.filter-content {
  flex: 1;
  padding: 30rpx;
  overflow-y: auto;
}
.filter-section {
  margin-bottom: 40rpx;
}
.section-title {
  font-size: 32rpx;
  font-weight: 500;
  margin-bottom: 20rpx;
  display: block;
}
.option-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}
.filter-option {
  height: 70rpx;
  line-height: 70rpx;
  text-align: center;
  font-size: 28rpx;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
  background: #f5f5f5;
}
.filter-option.selected {
  border-color: #003399;
  background: #e6f0ff;
  color: #003399;
}

/* 底部按钮 */
.filter-footer {
  display: flex;
  padding: 20rpx 30rpx;
  gap: 20rpx;
  border-top: 1rpx solid #eee;
}
.btn-clear {
  flex: 1;
  height: 80rpx;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 8rpx;
  font-size: 32rpx;
}
.btn-confirm {
  flex: 2;
  height: 80rpx;
  background: #003399;
  color: #fff;
  border: none;
  border-radius: 8rpx;
  font-size: 32rpx;
  font-weight: bold;
}

button::after {
  border: none;
}
</style>