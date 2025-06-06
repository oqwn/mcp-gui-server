# MCP GUI Server

[English](README.md) ｜ [简体中文](README_zh.md)

A Model Context Protocol (MCP) server that provides graphical user interface interaction capabilities with Interactive Feedback style and terminal support.

![Demo](https://img.shields.io/badge/status-stable-green)
![Node.js](https://img.shields.io/badge/node.js-18%2B-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.0%2B-blue)

## 🌟 Features

- **Interactive Feedback Style GUI**: Modern dark theme interface inspired by Interactive Feedback MCP
- **Persistent Terminal Support**: Execute commands with maintained shell state
- **Copy-Paste Friendly**: Optimized terminal output with smart selection detection
- **Session Management**: Secure session handling with automatic cleanup
- **Multiple Run Modes**: Stdio mode for MCP clients, HTTP mode for testing
- **Auto Port Discovery**: Automatically finds available ports when default is in use
- **Human-in-the-Loop Workflows**: Collect user feedback and command execution logs

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

Configure in your MCP client (e.g., Claude Desktop):

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

### Development Mode

With auto-reload on file changes:

```bash
pnpm run dev
```

## 🛠️ Available Tools

### gui-input

Opens a GUI dialog to collect user input with terminal support.

**Parameters:**

- `prompt` (optional): Text to show the user
- `title` (optional): Window title
- `timeout` (optional): Timeout in seconds (default: 300)

**Example:**

```javascript
await mcpClient.callTool("gui-input", {
  prompt: "Please provide your feedback on the system",
  title: "System Feedback",
  timeout: 600,
});
```

**Returns:**

```
User input received:
Type: text
Content: [user's input]
Command logs: [terminal commands executed]
Timestamp: 2024-01-01T12:00:00.000Z
```

## 🖥️ Terminal Features

- **Persistent Shell**: Commands maintain state (cd, environment variables work)
- **Home Directory Start**: Automatically starts in user's home directory
- **All Commands Supported**: Full Linux/Unix command support
- **Smart Scrolling**: Auto-scroll pauses during text selection
- **Copy-Paste Optimized**: Clean selection without interference

## 🎨 Interface

The GUI features a modern dark theme with:

- **Interactive Feedback Style**: Clean, professional design
- **Collapsible Terminal**: Execute commands with real-time output
- **User Input Area**: Large text area for feedback
- **Session Management**: Automatic session handling

## 📁 Project Structure

```
mcp-gui-server/
├── src/
│   ├── server.ts         # Main MCP server implementation
│   ├── gui-service.ts    # GUI service with terminal support
│   └── client-example.ts # HTTP client example
├── dist/                 # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## ⚙️ Configuration

### Environment Variables

- `GUI_PORT`: Port for GUI server (default: 3501)
- `MCP_STDIO`: Force stdio mode when set to "true"

### Command Line Arguments

- `--stdio`: Run in stdio mode
- `--dev`: Development mode with auto-reload

### Available Scripts

- `pnpm start`: Run the compiled server
- `pnpm run dev`: Development mode with auto-reload
- `pnpm run build`: Build TypeScript to JavaScript
- `pnpm run stdio`: Run in stdio mode directly from source

## 🔒 Security

- **Session Validation**: All GUI access requires valid session tokens
- **Automatic Cleanup**: Sessions expire after 5 minutes of inactivity
- **Process Isolation**: Terminal commands run in isolated shell processes
- **Safe Defaults**: Starts in user's home directory with standard environment

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
