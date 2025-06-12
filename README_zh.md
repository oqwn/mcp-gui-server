# MCP GUI Server（MCP 图形界面服务器）

[English](README.md) ｜ [简体中文](README_zh.md)

一个现代化的 Model Context Protocol (MCP) 服务器，提供优雅的图形用户界面交互功能，具备 Interactive Feedback 风格、终端支持和高级提示词工程功能。

![Demo](https://img.shields.io/badge/status-stable-green)
![Node.js](https://img.shields.io/badge/node.js-18%2B-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.0%2B-blue)
![MCP](https://img.shields.io/badge/MCP-compatible-purple)

## 🚀 快速开始

### 方式一：NPX（推荐用于测试）

无需安装即可测试服务器：

```bash
npx mcp-gui-server
```

### 方式二：源码安装

用于开发或自定义：

```bash
# 克隆仓库
git clone https://github.com/oqwn/mcp-gui-server.git
cd mcp-gui-server

# 安装依赖
pnpm install

# 构建项目
pnpm run build

# 启动服务器
pnpm start
```

### 前置条件

- Node.js 18+
- pnpm 8+（推荐的包管理器）

如果尚未安装 pnpm：

```bash
npm install -g pnpm
```

## 💼 MCP 客户端集成

### 步骤 1：配置 MCP 客户端

在你的 MCP 客户端（Claude Desktop、Cursor、Windsurf 等）中添加以下配置，记住只有在需要 AI 模型增强提示时才添加模型配置：

#### 使用 NPX（推荐）

```json
{
  "mcpServers": {
    "mcp-gui-server": {
      "command": "npx",
      "args": ["-y", "mcp-gui-server"],
      "env": {
        "OPENROUTER_API_KEY": "YOUR API KEY",
        "OPENROUTER_BASE_URL": "https://openrouter.ai/api/v1",
        "OPENROUTER_MODEL": "MODEL YOUR SELECTED"
      }
    }
  }
}
```

#### 使用本地安装

```json
{
  "mcpServers": {
    "gui-server": {
      "command": "node",
      "args": [
        "/Users/wenzijun/Documents/project/mcp-gui-server/dist/server.js",
        "--stdio"
      ],
      "env": {
        "OPENROUTER_API_KEY": "YOUR API KEY",
        "OPENROUTER_BASE_URL": "https://openrouter.ai/api/v1",
        "OPENROUTER_MODEL": "MODEL YOUR SELECTED"
      }
    }
  }
}
```

### 步骤 2：重启 MCP 客户端

配置完成后，重启你的 MCP 客户端以加载服务器。

### 步骤 3：测试集成

在你的 AI 助手中，`gui-input` 工具现在应该可用。测试方法：

> "请通过 GUI 收集一些用户输入"

## 🛠️ 开发与测试

### HTTP 模式（开发）

用于本地开发和测试：

```bash
pnpm run dev
```

服务器将在 `http://localhost:3501` 启动，支持热重载。

## ✨ 功能特性

### 🎯 核心功能

- **🖥️ 交互式 GUI**：美观、现代的网页界面用于用户输入
- **📷 图片上传支持**：拖拽或点击上传图片（支持 JPG、PNG、GIF、WebP，单个文件最大 10MB）
- **💻 终端集成**：支持持久 shell 会话的命令执行
- **🔄 实时反馈**：与用户协作的交互工作流
- **🛡️ 会话管理**：安全的、自动过期的会话清理
- **📱 响应式设计**：在桌面和移动设备上无缝工作
- **🎨 语法高亮**：专业的代码块渲染

### 🚀 高级功能

- **🧠 提示词工程**：内置 AI 驱动的提示词增强
- **🔌 13+ LLM 提供商**：OpenAI、Anthropic、Groq、Ollama 等
- **🌍 多语言支持**：保持语言一致性
- **⚡ 热重载**：无需重启服务器即可编辑提示词
- **📊 错误处理**：强大的回退机制和日志记录

### 📷 图片上传功能

- **🎯 直观界面**：上传按钮与增强和提交按钮集成在同一行
- **🖱️ 拖拽上传**：直接将图片拖拽到文本区域，工作流程无缝衔接
- **📁 多种格式**：支持 JPG、JPEG、PNG、GIF、WebP 图片格式
- **📏 大小验证**：单个图片最大 10MB，实时验证文件大小
- **🖼️ 预览网格**：缩略图预览，显示文件信息并支持单独删除
- **🤖 AI 兼容**：图片格式化为适合多模态 AI 模型分析的格式
- **🔒 安全处理**：图片转换为 base64 格式并包含在 MCP 响应中

### 🎛️ AI 助手最佳集成

为获得最佳效果，请在你的 AI 助手配置中添加此规则：

```
1. 当你需要向用户提问时，始终调用 MCP gui-input。

2. 当你即将完成用户请求时，调用 MCP gui-input 而不是直接结束流程。

3. 持续调用 MCP，直到用户的反馈为空，然后结束请求。
```

_示例位置：Cursor 规则、Claude Desktop 自定义指令等_

## 🏗️ 项目架构

本项目采用现代模块化架构，职责清晰分离：

```
mcp-gui-server/
├── src/
│   ├── server.ts                 # 主 MCP 服务器实现
│   ├── gui-service.ts           # 主 GUI 服务协调器
│   ├── handlers/                # HTTP 请求处理器
│   │   ├── base-handler.ts      # 基础处理器类
│   │   ├── gui-handler.ts       # GUI 接口处理
│   │   ├── command-handler.ts   # 终端命令执行
│   │   └── submit-handler.ts    # 表单提交和 LLM 集成
│   ├── services/                # 核心业务逻辑
│   │   ├── session-service.ts   # 会话管理和清理
│   │   ├── llm-service.ts       # 多提供商 LLM 集成
│   │   └── terminal-service.ts  # Shell 命令执行
│   ├── templates/               # HTML 模板生成
│   │   └── gui-template.ts      # 专业 UI 模板
│   ├── utils/                   # 实用工具
│   │   ├── markdown.ts          # 增强的 markdown → HTML
│   │   └── network.ts           # 端口管理工具
│   └── types/                   # TypeScript 接口
│       └── interfaces.ts        # 共享类型定义
├── prompts/                     # 外部提示词管理
│   └── system-prompt.md         # 主要增强提示词
├── package.json
├── tsconfig.json
└── README.md
```

### 📋 架构优势

- **🔧 可维护性**：每个模块都有单一职责
- **🧪 可测试性**：组件可独立测试
- **♻️ 可重用性**：服务可在不同处理器间重用
- **📈 可扩展性**：易于添加新功能而不影响现有代码
- **📚 文档完整**：清晰的结构和全面的文档

## 🐛 故障排查

### 端口被占用

服务器会在默认端口（3501）被占用时自动寻找可用端口：

```
⚠️ 端口 3501 被占用，正在查找可用端口...
✅ 已找到可用端口：3517
```

### 会话过期

如果看到"Session Invalid or Expired"：

1. 不要直接通过浏览器访问 GUI URL
2. 通过 MCP 客户端使用 `gui-input` 工具
3. 检查是否超过会话超时（5 分钟）

### 终端命令无效

确保 shell 进程正确初始化：

- 命令在持久 shell 中保持状态
- 使用标准 Unix/Linux 命令
- 终端从主目录（~）开始

### NPX 问题

如果 `npx mcp-gui-server` 失败：

```bash
# 清除 npm 缓存
npm cache clean --force

# 尝试使用明确版本
npx mcp-gui-server@latest

# 或全局安装
npm install -g mcp-gui-server
mcp-gui-server
```

## 🤝 贡献指南

1. Fork 仓库
2. 创建功能分支：`git checkout -b feature-name`
3. 进行更改
4. 安装依赖：`pnpm install`
5. 构建：`pnpm run build`
6. 提交 Pull Request

## 📄 许可证

MIT License - 详见 LICENSE 文件

## 💡 致谢

本项目受以下项目启发并基于：

- [Interactive Feedback MCP](https://github.com/noopstudios/interactive-feedback-mcp) - 启发我们 UI 设计和人机交互工作流的原始 Interactive Feedback MCP 实现

## 🔗 相关项目

- [Model Context Protocol](https://github.com/modelcontextprotocol/specification)
- [Interactive Feedback MCP](https://github.com/noopstudios/interactive-feedback-mcp)

## 📞 支持

如有问题和功能请求，请使用 GitHub issue tracker。

---

**注意**：本服务器设计为与 MCP 兼容的客户端配合使用。GUI 接口需要适当的会话管理，不应直接通过浏览器 URL 访问。
