// common/api/mock.js
const projectMockList = [
  {
    projectId: 1,
    name: "第十届互联网+创新大赛",
    belongTrack: "互联网+",
    projectIntro: "AI图像识别，需要前端开发",
    tags: "前端,Vue,AI",
    publisherInfo: { nickname: "李队长" },
    status: 2,
    deadlineRecruit: "2026-06-01",
    releaseTime: "2026-03-10"
  },
  {
    projectId: 2,
    name: "大创项目-校园二手交易平台",
    belongTrack: "大创",
    projectIntro: "校园小程序，需要全栈开发",
    tags: "uniapp,小程序,全栈",
    publisherInfo: { nickname: "王同学" },
    status: 2,
    deadlineRecruit: "2026-07-15",
    releaseTime: "2026-03-12"
  }
];

// 登录模拟
function login(params) {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      message: "登录成功",
      data: { token: "mock-token-123456" }
    });
  });
}

// 用户信息模拟
function getUserProfile() {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      data: {
        userId: 1001,
        nickname: "测试用户",
        avatar: ""
      }
    });
  });
}

// 项目列表模拟
function getProjectList(params) {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      data: projectMockList
    });
  });
}

// 项目详情模拟
function getProjectDetail(projectId) {
  let item = projectMockList.find(x => x.projectId == projectId);
  return new Promise((resolve) => {
    resolve({
      code: 200,
      data: item || {}
    });
  });
}

export default {
  login,
  getUserProfile,
  getProjectList,
  getProjectDetail,
  projectMockList
};