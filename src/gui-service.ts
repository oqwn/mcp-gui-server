import { createServer } from "http";
import { URL } from "url";
import open from "open";
import net from "net";
import { spawn, ChildProcess } from "child_process";

interface GuiSession {
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
  prompt?: string;
  title?: string;
  commandLogs?: string[];
  runningProcess?: ChildProcess;
  projectDirectory?: string;
  shellProcess?: ChildProcess;
  shellReady?: boolean;
}

export class GuiService {
  private guiSessions = new Map<string, GuiSession>();
  private server: any;
  private port: number;
  private isStdioMode: boolean;

  constructor(port: number = 3501, isStdioMode: boolean = false) {
    this.port = port;
    this.isStdioMode = isStdioMode;
    this.server = this.createGuiServer();
    this.startCleanupTimer();
  }

  // Safe logging method that respects stdio mode
  private log(message: string): void {
    if (!this.isStdioMode) {
      console.error(message);
    }
  }

  // Check if port is available
  private async isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const server = net.createServer();

      server.listen(port, () => {
        server.close(() => {
          resolve(true);
        });
      });

      server.on("error", () => {
        resolve(false);
      });
    });
  }

  // Find available port dynamically
  private async findAvailablePort(
    startPort: number = 3501,
    maxAttempts: number = 50
  ): Promise<number> {
    for (let port = startPort; port < startPort + maxAttempts; port++) {
      if (await this.isPortAvailable(port)) {
        return port;
      }
    }
    throw new Error(
      `Unable to find available port (tried range: ${startPort}-${
        startPort + maxAttempts - 1
      })`
    );
  }

  private createGuiServer() {
    return createServer(async (req: any, res: any) => {
      const url = new URL(req.url!, `http://${req.headers.host}`);

      if (url.pathname === "/" && req.method === "GET") {
        await this.handleHomePage(res);
      } else if (url.pathname === "/gui" && req.method === "GET") {
        await this.handleGuiRequest(url, res);
      } else if (url.pathname === "/submit" && req.method === "POST") {
        await this.handleSubmitRequest(req, res);
      } else if (url.pathname === "/execute" && req.method === "POST") {
        await this.handleExecuteCommand(req, res);
      } else if (url.pathname === "/logs" && req.method === "GET") {
        await this.handleGetLogs(req, res);
      } else if (url.pathname === "/health" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            status: "ok",
            port: this.port,
            time: new Date().toISOString(),
          })
        );
      } else {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end(`
          <html>
            <head>
              <title>Page Not Found</title>
              <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .error { color: #e74c3c; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1 class="error">404 - Page Not Found</h1>
                <p>The requested page does not exist.</p>
                <p><a href="/">Return to Home</a></p>
              </div>
            </body>
          </html>
        `);
      }
    });
  }

  private async handleHomePage(res: any) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MCP GUI Server</title>
    <style>
        * {
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: rgba(255, 255, 255, 0.95);
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            max-width: 600px;
            width: 100%;
            text-align: center;
        }
        h1 {
            margin: 0 0 30px 0;
            color: #333;
            font-size: 28px;
            font-weight: 600;
        }
        .info {
            background: #e7f3ff;
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
            border-left: 4px solid #2196F3;
            text-align: left;
        }
        .warning {
            background: #fff3cd;
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
            color: #856404;
            text-align: left;
        }
        .status {
            background: #d4edda;
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            border-left: 4px solid #28a745;
            text-align: left;
        }
        code {
            background: #f8f9fa;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', monospace;
        }
        .icon {
            font-size: 24px;
            margin-right: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1><span class="icon">🖥️</span>MCP GUI Server</h1>
        
        <div class="status">
            <strong>🟢 Server Status:</strong> Running<br>
            <strong>📡 Port:</strong> ${this.port}<br>
            <strong>⏰ Time:</strong> ${new Date().toLocaleString()}
        </div>
        
        <div class="info">
            <h3>📋 About MCP GUI Server</h3>
            <p>This is a Model Context Protocol (MCP) server that provides graphical user interface interaction capabilities.</p>
            <p><strong>Key Features:</strong></p>
            <ul>
                <li>Collect user input through browser interface</li>
                <li>Support various input types (text, number, email, etc.)</li>
                <li>Secure session management and automatic cleanup</li>
            </ul>
        </div>
        
        <div class="warning">
            <h3>⚠️ Important Notes</h3>
            <p>GUI interface must be accessed through MCP tool calls, direct access is not supported.</p>
            <p>To use GUI functionality:</p>
            <ol>
                <li>Call the <code>gui-input</code> tool in your MCP client</li>
                <li>System will automatically open GUI interface with correct session</li>
                <li>Enter information in the interface and submit</li>
            </ol>
        </div>
        
        <div class="info">
            <h3>🔧 Available Endpoints</h3>
            <ul>
                <li><code>/</code> - Server homepage (current page)</li>
                <li><code>/gui?session=xxx</code> - GUI input interface (requires valid session)</li>
                <li><code>/submit</code> - Form submission endpoint</li>
                <li><code>/health</code> - Health check endpoint</li>
            </ul>
        </div>
        
        <div style="margin-top: 30px; color: #666; font-size: 14px;">
            <p>💡 Need help? Please check project documentation or contact developer</p>
        </div>
    </div>
</body>
</html>
    `;

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  }

  private async handleGuiRequest(url: URL, res: any) {
    const sessionId = url.searchParams.get("session");
    if (!sessionId || !this.guiSessions.has(sessionId)) {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end(`
        <html>
          <head>
            <title>Session Invalid</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; }
              .container { background: rgba(255, 255, 255, 0.95); color: #333; padding: 40px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1); max-width: 500px; }
              .error { color: #e74c3c; }
              .info { background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196F3; text-align: left; }
              code { background: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="error">⚠️ Session Invalid or Expired</h1>
              <div class="info">
                <h3>💡 How to use GUI functionality correctly:</h3>
                <ol>
                  <li>Call the <code>gui-input</code> tool in your MCP client</li>
                  <li>System will automatically open the correct GUI interface</li>
                  <li>Do not access this URL directly</li>
                </ol>
                <p><strong>Possible reasons:</strong></p>
                <ul>
                  <li>Session expired (default 5-minute timeout)</li>
                  <li>Invalid or missing Session ID</li>
                  <li>Server restarted, sessions cleared</li>
                </ul>
              </div>
              <p><a href="/">Back to Home</a> | <a href="/health">Check Service Status</a></p>
            </div>
          </body>
        </html>
      `);
      return;
    }

    const session = this.guiSessions.get(sessionId)!;
    const html = this.generateGuiHtml(sessionId, session.prompt, session.title);
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  }

  private initializeShellSession(session: GuiSession): void {
    if (session.shellProcess) {
      return; // Already initialized
    }

    // Initialize command logs if not exists
    if (!session.commandLogs) {
      session.commandLogs = [];
    }

    // Start a persistent shell process
    const shell = process.platform === "win32" ? "cmd.exe" : "/bin/bash";
    const homeDir =
      process.env.HOME || process.env.USERPROFILE || process.cwd();

    session.shellProcess = spawn(shell, [], {
      cwd: homeDir, // Start in home directory
      env: { ...process.env },
      stdio: ["pipe", "pipe", "pipe"],
    });

    session.shellReady = false;

    // Start with empty logs for clean terminal
    session.commandLogs.push("");

    // Handle stdout
    session.shellProcess.stdout?.on("data", (data) => {
      const output = data.toString();
      session.commandLogs!.push(output);
    });

    // Handle stderr
    session.shellProcess.stderr?.on("data", (data) => {
      const output = data.toString();
      session.commandLogs!.push(output);
    });

    // Handle process exit
    session.shellProcess.on("close", (code) => {
      session.commandLogs!.push(`\n[Shell session ended]\n`);
      session.shellProcess = undefined;
      session.shellReady = false;
    });

    // Handle process error
    session.shellProcess.on("error", (error) => {
      session.commandLogs!.push(`\n[Error: ${error.message}]\n`);
      session.shellProcess = undefined;
      session.shellReady = false;
    });

    // Wait a moment for shell to initialize
    setTimeout(() => {
      session.shellReady = true;
      // Shell is ready, no initial commands needed
    }, 300);
  }

  private async handleGetLogs(req: any, res: any) {
    const url = new URL(req.url, `http://localhost:${this.port}`);
    const sessionId = url.searchParams.get("session");

    if (!sessionId || !this.guiSessions.has(sessionId)) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Session not found" }));
      return;
    }

    const session = this.guiSessions.get(sessionId)!;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        logs: session.commandLogs || [],
        success: true,
      })
    );
  }

  private async handleExecuteCommand(req: any, res: any) {
    let body = "";
    req.on("data", (chunk: any) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const { sessionId, command } = JSON.parse(body);
        const session = this.guiSessions.get(sessionId);

        if (!session) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Session not found" }));
          return;
        }

        // Initialize shell session if not already done
        this.initializeShellSession(session);

        // Check if shell is ready
        if (!session.shellProcess || !session.shellReady) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error: "Shell not ready",
              message: "Please wait for shell to initialize",
            })
          );
          return;
        }

        try {
          // Add command to logs (with prompt-like format)
          session.commandLogs!.push(`$ ${command}\n`);

          // Send command to persistent shell
          if (session.shellProcess.stdin) {
            session.shellProcess.stdin.write(`${command}\n`);
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: true,
              message: "Command sent to shell",
              logs: session.commandLogs,
            })
          );
        } catch (error) {
          session.commandLogs!.push(`\nError executing command: ${error}\n`);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: false,
              error: "Failed to execute command",
              details: error instanceof Error ? error.message : String(error),
            })
          );
        }
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Invalid request",
            details: error instanceof Error ? error.message : String(error),
          })
        );
      }
    });
  }

  private async handleSubmitRequest(req: any, res: any) {
    let body = "";
    req.on("data", (chunk: any) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        // Try JSON first, fallback to form data
        let sessionId: string;
        let userInput: string;
        let inputType: string;
        let commandLogs: string = "";

        try {
          const jsonData = JSON.parse(body);
          sessionId = jsonData.sessionId;
          userInput = jsonData.input;
          inputType = jsonData.type || "submit";
          commandLogs = jsonData.commandLogs || "";
        } catch {
          // Fallback to form data
          const params = new URLSearchParams(body);
          sessionId = params.get("session") || "";
          userInput = params.get("input") || "";
          inputType = params.get("type") || "submit";
        }

        if (!sessionId || !this.guiSessions.has(sessionId)) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: false,
              error: "Session not found or expired",
            })
          );
          return;
        }

        const session = this.guiSessions.get(sessionId)!;

        // Clean up shell process
        if (session.shellProcess) {
          session.shellProcess.kill("SIGTERM");
        }
        if (session.runningProcess) {
          session.runningProcess.kill("SIGTERM");
        }

        // Resolve the promise with the user input including command logs
        session.resolve({
          input: userInput,
          type: inputType,
          timestamp: new Date().toISOString(),
          command_logs: commandLogs,
          interactive_feedback: userInput,
        });

        this.guiSessions.delete(sessionId);

        // Return success response
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            message: "Input submitted successfully",
          })
        );
      } catch (error: any) {
        console.error("Error processing GUI input:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            error: "Error processing input",
            details: error.message,
          })
        );
      }
    });
  }

  private generateGuiHtml(
    sessionId: string,
    prompt?: string,
    title?: string
  ): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || "GUI Input"}</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%);
            color: #e5e5e5;
            min-height: 100vh;
            overflow-x: hidden;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        .header {
            background: rgba(45, 45, 45, 0.8);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .title {
            font-size: 28px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .session-info {
            color: #a0a0a0;
            font-size: 14px;
            display: flex;
            gap: 24px;
            flex-wrap: wrap;
        }
        .prompt-section {
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
        }
        .prompt-text {
            color: #93c5fd;
            line-height: 1.6;
            font-size: 16px;
        }
        .main-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            flex: 1;
        }
        @media (max-width: 768px) {
            .main-content {
                grid-template-columns: 1fr;
            }
        }
        .terminal-section {
            background: rgba(30, 30, 30, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            overflow: hidden;
        }
        .terminal-header {
            background: rgba(45, 45, 45, 0.8);
            padding: 16px 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .terminal-title {
            font-weight: 600;
            color: #ffffff;
        }
        .toggle-btn {
            background: rgba(59, 130, 246, 0.2);
            color: #3b82f6;
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 8px;
            padding: 6px 12px;
            font-size: 12px;
            cursor: pointer;
            margin-left: auto;
        }
        .terminal-content {
            padding: 20px;
            display: none;
        }
        .terminal-content.active {
            display: block;
        }
        .command-input-group {
            display: flex;
            gap: 12px;
            margin-bottom: 16px;
        }
        .command-input {
            flex: 1;
            background: rgba(20, 20, 20, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            padding: 12px;
            color: #e5e5e5;
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 14px;
        }
        .command-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .execute-btn {
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 20px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s;
        }
        .execute-btn:hover {
            background: #2563eb;
            transform: translateY(-1px);
        }
        .terminal-output {
            background: rgba(10, 10, 10, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 16px;
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 13px;
            line-height: 1.5;
            color: #d1d5db;
            min-height: 200px;
            max-height: 400px;
            overflow-y: auto;
            white-space: pre-wrap;
            user-select: text;
            -webkit-user-select: text;
            -moz-user-select: text;
            -ms-user-select: text;
        }
        .terminal-output::selection {
            background: rgba(59, 130, 246, 0.3);
            color: #ffffff;
        }
        .terminal-output::-moz-selection {
            background: rgba(59, 130, 246, 0.3);
            color: #ffffff;
        }
        .feedback-section {
            background: rgba(30, 30, 30, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 24px;
        }
        .feedback-title {
            font-size: 20px;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .feedback-textarea {
            width: 100%;
            background: rgba(20, 20, 20, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 16px;
            color: #e5e5e5;
            font-family: inherit;
            font-size: 16px;
            line-height: 1.6;
            min-height: 200px;
            resize: vertical;
            margin-bottom: 20px;
        }
        .feedback-textarea:focus {
            outline: none;
            border-color: #10b981;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        .submit-btn {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border: none;
            border-radius: 12px;
            padding: 16px 32px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: all 0.3s ease;
        }
        .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
        }
        .shortcut-hint {
            color: #6b7280;
            font-size: 12px;
            text-align: center;
            margin-top: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="title">
                🖥️ GUI Input
            </div>

        </div>
        
        ${
          prompt
            ? `
        <div class="prompt-section">
            <div class="prompt-text">${prompt}</div>
        </div>
        `
            : ""
        }
        
        <div class="main-content">
            <div class="terminal-section">
                <div class="terminal-header">
                    <span class="terminal-title">🔧 Terminal</span>
                    <button class="toggle-btn" onclick="toggleTerminal()">Show/Hide</button>
                </div>
                <div class="terminal-content" id="terminalContent">
                    <div class="command-input-group">
                        <input type="text" class="command-input" id="commandInput" placeholder="Enter command..." />
                        <button class="execute-btn" onclick="executeCommand()">Execute</button>
                    </div>
                    <div class="terminal-output" id="terminalOutput"></div>
                </div>
            </div>
            
            <div class="feedback-section">
                <div class="feedback-title">
                    💬 Your Feedback
                </div>
                <form id="feedbackForm">
                    <textarea class="feedback-textarea" id="feedbackText" placeholder="Enter your feedback here..." required></textarea>
                    <button type="submit" class="submit-btn">Submit Feedback</button>
                    <div class="shortcut-hint">Press Ctrl+Enter to submit quickly</div>
                </form>
            </div>
        </div>
    </div>
    
    <script>
        const sessionId = '${sessionId}';
        let commandLogs = [];
        let userIsSelecting = false;
        let lastLogLength = 0;
        
        function toggleTerminal() {
            const content = document.getElementById('terminalContent');
            content.classList.toggle('active');
        }
        
        // Detect when user is selecting text
        function setupSelectionDetection() {
            const output = document.getElementById('terminalOutput');
            
            output.addEventListener('mousedown', () => {
                userIsSelecting = true;
            });
            
            output.addEventListener('mouseup', () => {
                setTimeout(() => {
                    userIsSelecting = false;
                }, 100);
            });
            
            document.addEventListener('selectionchange', () => {
                const selection = window.getSelection();
                if (selection && selection.toString().length > 0) {
                    userIsSelecting = true;
                } else {
                    userIsSelecting = false;
                }
            });
        }
        
        async function executeCommand() {
            const input = document.getElementById('commandInput');
            const output = document.getElementById('terminalOutput');
            const command = input.value.trim();
            
            if (!command) return;
            
            input.value = '';
            
            try {
                const response = await fetch('/execute', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sessionId: sessionId,
                        command: command
                    }),
                });
                
                const result = await response.json();
                if (result.success) {
                    // Start polling for command output immediately
                    pollCommandOutput();
                } else {
                    output.textContent += \`Error: \${result.error}\n\`;
                    autoScrollIfNeeded();
                }
            } catch (error) {
                output.textContent += \`Error: \${error.message}\n\`;
                autoScrollIfNeeded();
            }
        }
        
        function autoScrollIfNeeded() {
            if (!userIsSelecting) {
                const output = document.getElementById('terminalOutput');
                output.scrollTop = output.scrollHeight;
            }
        }
        
        async function pollCommandOutput() {
            try {
                const response = await fetch(\`/logs?session=\${sessionId}\`);
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.logs) {
                        const output = document.getElementById('terminalOutput');
                        const currentLogs = result.logs.join('');
                        
                        // Only update if content changed
                        if (currentLogs !== output.textContent) {
                            const wasAtBottom = output.scrollTop === output.scrollHeight - output.clientHeight;
                            output.textContent = currentLogs;
                            
                            // Auto scroll only if user was at bottom or not selecting
                            if ((wasAtBottom || !userIsSelecting) && !userIsSelecting) {
                                autoScrollIfNeeded();
                            }
                        }
                        
                        // Continue polling if logs are still growing
                        if (result.logs.length > lastLogLength) {
                            lastLogLength = result.logs.length;
                            setTimeout(() => pollCommandOutput(), 800);
                        } else {
                            setTimeout(() => pollCommandOutput(), 2000);
                        }
                    }
                }
            } catch (error) {
                console.error('Error polling logs:', error);
                setTimeout(() => pollCommandOutput(), 3000);
            }
        }
        
        // Handle form submission
        document.getElementById('feedbackForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const feedbackText = document.getElementById('feedbackText').value;
            const terminalOutput = document.getElementById('terminalOutput').textContent;
            
            try {
                const response = await fetch('/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sessionId: sessionId,
                        input: feedbackText,
                        type: 'interactive_feedback',
                        commandLogs: terminalOutput
                    }),
                });
                
                if (response.ok) {
                    document.body.innerHTML = '<div style="text-align: center; padding: 50px; color: #10b981;"><h2>✅ Feedback submitted successfully!</h2><p>You can close this window now.</p></div>';
                } else {
                    alert('Error submitting feedback. Please try again.');
                }
            } catch (error) {
                alert('Error submitting feedback: ' + error.message);
            }
        });
        
        // Ctrl+Enter shortcut
        document.getElementById('feedbackText').addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('feedbackForm').dispatchEvent(new Event('submit'));
            }
        });
        
        // Enter key for command execution
        document.getElementById('commandInput').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                executeCommand();
            }
        });
        
        // Initialize selection detection
        setupSelectionDetection();
        
        // Show terminal by default
        document.getElementById('terminalContent').classList.add('active');
    </script>
</body>
</html>
    `;
  }

  public async openGuiAndWaitForInput(
    prompt?: string,
    title?: string,
    timeoutMs: number = 5 * 60 * 1000
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const sessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Store the session
      this.guiSessions.set(sessionId, {
        resolve,
        reject,
        timestamp: Date.now(),
        prompt,
        title,
      });

      // Open browser to GUI
      const guiUrl = `http://localhost:${this.port}/gui?session=${sessionId}`;
      this.log(`Opening GUI: ${guiUrl}`);

      open(guiUrl).catch((error: any) => {
        this.log("Failed to open browser: " + error);
        this.guiSessions.delete(sessionId);
        reject(new Error("Failed to open GUI"));
      });

      // Set timeout
      setTimeout(() => {
        if (this.guiSessions.has(sessionId)) {
          this.guiSessions.delete(sessionId);
          reject(new Error("GUI input timeout"));
        }
      }, timeoutMs);
    });
  }

  public async start(): Promise<void> {
    // 尝试使用指定端口，如果不可用则自动寻找可用端口
    const originalPort = this.port;

    if (!(await this.isPortAvailable(this.port))) {
      this.log(
        `⚠️  Port ${this.port} is in use, searching for available port...`
      );

      try {
        this.port = await this.findAvailablePort(originalPort, 50);
        this.log(`✅ Found available port: ${this.port}`);
      } catch (error) {
        this.log(`❌ Port allocation failed: ${error}`);
        throw error;
      }
    }

    return new Promise((resolve, reject) => {
      this.server.listen(this.port, () => {
        this.log(`🚀 GUI server started successfully, port: ${this.port}`);
        if (this.port !== originalPort) {
          this.log(
            `📍 Notice: Port automatically adjusted from ${originalPort} to ${this.port}`
          );
        }
        resolve();
      });

      this.server.on("error", (error: any) => {
        this.log(`❌ GUI server startup failed: ${error}`);
        reject(error);
      });
    });
  }

  // 获取当前端口号
  public getPort(): number {
    return this.port;
  }

  public stop(): void {
    this.server.close();
  }

  private startCleanupTimer(): void {
    // Cleanup old sessions every minute
    setInterval(() => {
      const now = Date.now();
      for (const [sessionId, session] of this.guiSessions.entries()) {
        if (now - session.timestamp > 5 * 60 * 1000) {
          // Clean up any running processes
          if (session.runningProcess) {
            session.runningProcess.kill("SIGTERM");
          }
          if (session.shellProcess) {
            session.shellProcess.kill("SIGTERM");
          }

          session.reject(new Error("Session timeout"));
          this.guiSessions.delete(sessionId);
        }
      }
    }, 60000);
  }
}
