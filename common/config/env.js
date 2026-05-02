const useMock = false;

// 三个环境配置（现在全部不动，保持标准格式）
const prod = {
  baseUrl: "https://localhost:9001",
  useMock: false
};

const dev = {
  baseUrl: "http://localhost:7001",
  useMock: false
};

const local = {
  // 真实后端地址
  baseUrl: "/api",
  useMock: useMock
};

// 导出使用 local 环境
export default local;