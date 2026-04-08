/*
// 全局控制：true = 模拟数据 | false = 真实接口(Apifox)
const useMock = true;

const prod = {
  baseUrl: `https://localhost:9001`,
  useMock: false
}

// 开发环境 → 改成你的 APIFOX 地址！
const dev = {
  baseUrl: "http://127.0.0.1:4000/m1/7867336-7617022-default",
  useMock: false
}

const local = {
  baseUrl: "http://127.0.0.1:4000/m1/7867336-7617022-default",
  useMock: true
}

// 当前使用开发环境
export default dev;
*/
// 全局开关：
// true  = 只使用本地模拟数据（不请求任何接口，绝不报错）
// false = 请求真实接口
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
  baseUrl: "http://127.0.0.1:4523/m1/7867336-7617022-default",
  useMock: useMock
};

// 导出使用 local 环境
export default local;