# MCP GUI Server

[English](README.md) ｜ [简体中文](README_zh.md)

A modern Model Context Protocol (MCP) server that provides elegant graphical user interface interaction capabilities with Interactive Feedback style, terminal support, and advanced prompt engineering features.

![Demo](https://img.shields.io/badge/status-stable-green)
![Node.js](https://img.shields.io/badge/node.js-18%2B-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.0%2B-blue)
![MCP](https://img.shields.io/badge/MCP-compatible-purple)

## 🚀 Quick Start

### Option 1: NPX (Recommended for Testing)

Test the server instantly without installation:

```bash
npx mcp-gui-server
```

### Option 2: Install from Source

For development or customization:

```bash
# Clone the repository
git clone https://github.com/oqwn/mcp-gui-server.git
cd mcp-gui-server

# Install dependencies
pnpm install

# Build the project
pnpm run build

# Start the server
pnpm start
```

### Prerequisites

- Node.js 18+
- pnpm 8+ (recommended package manager)

Install pnpm if you haven't already:

```bash
npm install -g pnpm
```

## 💼 MCP Client Integration

### Step 1: Configure Your MCP Client

Add the following configuration to your MCP client (Claude Desktop, Cursor, Windsurf, etc.), Remember add the model only if you would like a ai model to enhance prompt:

#### Using NPX (Recommended)

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

#### Using Local Installation

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

### Step 2: Restart Your MCP Client

After configuration, restart your MCP client to load the server.

### Step 3: Test the Integration

In your AI assistant, the `gui-input` tool should now be available. Test it by asking:

> "Please collect some user input via the GUI"

## 🛠️ Development & Testing

### HTTP Mode (Development)

For local development and testing:

```bash
pnpm run dev
```

Server will start on `http://localhost:3501` with hot reload.

## ✨ Features

### 🎯 Core Capabilities

- **🖥️ Interactive GUI**: Beautiful, modern web interface for user input
- **📷 Image Upload Support**: Drag & drop or click to upload images (JPG, PNG, GIF, WebP, max 10MB each)
- **💻 Terminal Integration**: Execute commands with persistent shell sessions
- **🔄 Real-time Feedback**: Interactive workflow with user collaboration
- **🛡️ Session Management**: Secure, auto-expiring sessions with cleanup
- **📱 Responsive Design**: Works seamlessly on desktop and mobile
- **🎨 Syntax Highlighting**: Professional code block rendering

### 🚀 Advanced Features

- **🧠 Prompt Engineering**: Built-in AI-powered prompt enhancement
- **🔌 13+ LLM Providers**: OpenAI, Anthropic, Groq, Ollama, and more
- **🌍 Multi-language Support**: Maintains language consistency
- **⚡ Hot Reloading**: Edit prompts without server restart
- **📊 Error Handling**: Robust fallbacks and logging

### 📷 Image Upload Features

- **🎯 Intuitive Interface**: Upload button integrated with enhance and submit buttons
- **🖱️ Drag & Drop**: Drop images directly into the text area for seamless workflow
- **📁 Multiple Formats**: Supports JPG, JPEG, PNG, GIF, WebP image formats
- **📏 Size Validation**: Maximum 10MB per image with real-time validation
- **🖼️ Preview Grid**: Thumbnail previews with file information and remove functionality
- **🤖 AI Compatible**: Images properly formatted for multimodal AI model analysis
- **🔒 Secure Processing**: Images converted to base64 and included in MCP responses

### 🎛️ Optimal AI Assistant Integration

For the best results, add this rule to your AI assistant configuration:

```
1. Whenever you want to ask a question, always call the MCP gui-input.

2. Whenever you're about to complete a user request, call the MCP gui-input instead of simply ending the process.

3. Keep calling MCP until the user's feedback is empty, then end the request.
```

_Example locations: Cursor rules, Claude Desktop custom instructions, etc._

## 🏗️ Project Architecture

This project follows modern modular architecture with clear separation of concerns:

```
mcp-gui-server/
├── src/
│   ├── server.ts                 # Main MCP server implementation
│   ├── gui-service.ts           # Main GUI service orchestrator
│   ├── handlers/                # HTTP request handlers
│   │   ├── base-handler.ts      # Base handler class
│   │   ├── gui-handler.ts       # GUI interface handling
│   │   ├── command-handler.ts   # Terminal command execution
│   │   └── submit-handler.ts    # Form submission & LLM integration
│   ├── services/                # Core business logic
│   │   ├── session-service.ts   # Session management & cleanup
│   │   ├── llm-service.ts       # Multi-provider LLM integration
│   │   └── terminal-service.ts  # Shell command execution
│   ├── templates/               # HTML template generation
│   │   └── gui-template.ts      # Professional UI templates
│   ├── utils/                   # Utility functions
│   │   ├── markdown.ts          # Enhanced markdown → HTML
│   │   └── network.ts           # Port management utilities
│   └── types/                   # TypeScript interfaces
│       └── interfaces.ts        # Shared type definitions
├── prompts/                     # External prompt management
│   ├── system-prompt.md         # Main enhancement prompt
├── package.json
├── tsconfig.json
└── README.md
```

### 📋 Architecture Benefits

- **🔧 Maintainability**: Each module has single responsibility
- **🧪 Testability**: Components can be tested in isolation
- **♻️ Reusability**: Services can be used across different handlers
- **📈 Scalability**: Easy to add new features without affecting existing code
- **📚 Documentation**: Clear structure with comprehensive documentation

## 🐛 Troubleshooting

### Port Already in Use

The server automatically finds an available port when the default (3501) is occupied:

```
⚠️ Port 3501 is in use, searching for available port...
✅ Found available port: 3517
```

### Session Expired

If you see "Session Invalid or Expired":

1. Don't access GUI URLs directly
2. Use the `gui-input` tool in your MCP client
3. Check if the session timeout (5 minutes) was exceeded

### Terminal Commands Not Working

Ensure the shell process is properly initialized:

- Commands maintain state in persistent shell
- Use standard Unix/Linux commands
- Terminal starts in home directory (~)

### NPX Issues

If `npx mcp-gui-server` fails:

```bash
# Clear npm cache
npm cache clean --force

# Try with explicit version
npx mcp-gui-server@latest

# Or install globally
npm install -g mcp-gui-server
mcp-gui-server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Install dependencies: `pnpm install`
5. Build: `pnpm run build`
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 💡 Inspiration

This project is inspired by and builds upon:

- [Interactive Feedback MCP](https://github.com/noopstudios/interactive-feedback-mcp) - The original Interactive Feedback MCP implementation that inspired our UI design and human-in-the-loop workflow

## 🔗 Related Projects

- [Model Context Protocol](https://github.com/modelcontextprotocol/specification)
- [Interactive Feedback MCP](https://github.com/noopstudios/interactive-feedback-mcp)

## 📞 Support

For issues and feature requests, please use the GitHub issue tracker.

---

**Note**: This server is designed to work with MCP-compatible clients. The GUI interface requires proper session management and should not be accessed directly via browser URLs.
