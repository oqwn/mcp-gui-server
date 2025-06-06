# MCP GUI Server（MCP 图形界面服务器）

[English](README.md) ｜ [简体中文](README_zh.md)

一个提供 **图形用户界面交互**（Interactive Feedback 风格）和 **持久终端** 支持的 Model Context Protocol (MCP) 服务器。

![Demo](https://img.shields.io/badge/status-stable-green)
![Node.js](https://img.shields.io/badge/node.js-18%2B-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.0%2B-blue)

## 📦 安装

### 前置条件

- Node.js 18 及以上
- 推荐使用 **pnpm 8+** 作为包管理器

如果尚未安装 pnpm，可执行：

```bash
npm install -g pnpm
```

### 源码安装

```bash
# 克隆仓库
git clone https://github.com/oqwn/mcp-gui-server.git
cd mcp-gui-server

# 安装依赖
pnpm install

# 构建项目
pnpm run build
```

## 🚀 使用方法

### MCP 客户端集成（Stdio 模式）

服务器默认以 **Stdio 模式** 运行，并通过 JSON-RPC 通信：

```bash
pnpm start
```

在 MCP 客户端（如 Claude Desktop/cursor/windsurf）中配置：

```json
{
  "mcpServers": {
    "gui-server": {
      "command": "node",
      "args": ["path/to/optimized-request/dist/server.js", "--stdio"],
      "cwd": "path/to/optimized-request"
    }
  }
}
```

### HTTP 模式（调试用）

开发或调试时可启用 HTTP 模式：

```bash
pnpm run dev
```

默认监听 `http://localhost:3501`

### 提示词

为获得最佳效果，请在你的 AI 助手的自定义提示或规则（例如在 Cursor 中）加入以下内容：

> 当你需要向用户提问时，**始终**调用 MCP 的 `gui-input`。
> 当你即将完成用户请求时，**不要**直接结束流程，而是再次调用 MCP 的 `gui-input`。
> 持续调用 MCP，直到用户的反馈为空，再结束此次请求。

## 📁 项目结构

```
mcp-gui-server/
├── src/
│   ├── server.ts         # 主服务器实现
│   ├── gui-service.ts    # GUI 与终端服务
├── package.json
├── tsconfig.json
└── README.md
```

## 🐛 故障排查

### 端口被占用

```
⚠️ 端口 3501 被占用，正在查找可用端口...
✅ 已找到可用端口：3517
```

### 会话过期

若出现 “Session Invalid or Expired”：

1. 不要直接访问 GUI URL
2. 通过 MCP 客户端调用 `gui-input`
3. 确认 5 分钟会话超时是否已到

### 终端命令无效

- 确保 Shell 已正确初始化
- 命令需为标准 Unix/Linux 命令
- 初始目录为 `~`

## 🤝 贡献方式

1. Fork 本仓库
2. 创建分支：`git checkout -b feature-name`
3. 实现功能并提交代码
4. 安装依赖：`pnpm install`
5. 构建项目：`pnpm run build`
6. 发起 Pull Request

## 📄 许可证

MIT License – 详见 LICENSE 文件

## 🔗 相关项目

- [Model Context Protocol](https://github.com/modelcontextprotocol/specification)
- [Interactive Feedback MCP](https://github.com/noopstudios/interactive-feedback-mcp)

## 📞 技术支持

如有问题或需求，请通过 GitHub Issue 反馈。

---

**注意**：本服务器需配合兼容 MCP 的客户端使用。GUI 接口依赖会话管理，不应直接通过浏览器 URL 访问。
