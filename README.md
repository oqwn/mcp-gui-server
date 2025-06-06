# MCP GUI Server

[English](README.md) ｜ [简体中文](README_zh.md)

A Model Context Protocol (MCP) server that provides graphical user interface interaction capabilities with Interactive Feedback style and terminal support.

![Demo](https://img.shields.io/badge/status-stable-green)
![Node.js](https://img.shields.io/badge/node.js-18%2B-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.0%2B-blue)

## 📦 Installation

### Prerequisites

- Node.js 18+
- pnpm 8+ (recommended package manager)

Install pnpm if you haven't already:

```bash
npm install -g pnpm
```

### Install from Source

```bash
# Clone the repository
git clone https://github.com/oqwn/mcp-gui-server.git
cd mcp-gui-server

# Install dependencies (using pnpm)
pnpm install

# Build the project
pnpm run build
```

## 🚀 Usage

### MCP Client Integration (Stdio Mode)

The server runs in stdio mode by default, communicating via JSON-RPC:

```bash
pnpm start
```

Configure in your MCP client (e.g., Claude Desktop/Cursor/Windsurf):

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

### HTTP Mode (Testing)

For testing and development:

```bash
pnpm run dev
```

This starts the server in HTTP mode on `http://localhost:3501`

### Prompt Engineering

For the best results, add the following to your custom prompt in your AI assistant, you should add it on a rule or directly in the prompt (e.g., Cursor):
```
Whenever you want to ask a question, always call the MCP `gui-input`.  
Whenever you’re about to complete a user request, call the MCP `gui-input` instead of simply ending the process.
Keep calling MCP until the user’s feedback is empty, then end the request.
```

## 📁 Project Structure

```
mcp-gui-server/
├── src/
│   ├── server.ts         # Main MCP server implementation
│   ├── gui-service.ts    # GUI service with terminal support
├── package.json
├── tsconfig.json
└── README.md
```

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
