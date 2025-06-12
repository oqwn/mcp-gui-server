import { MarkdownConverter } from "../utils/markdown.js";

/**
 * GUI Template Generator
 */
export class GuiTemplate {
  /**
   * Generate the main GUI HTML page
   */
  static generateGuiHtml(
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
    ${this.getStyles()}
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
            <div class="prompt-text">${MarkdownConverter.toHtml(prompt)}</div>
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
                    <div class="button-group">
                        <button type="button" class="enhance-btn" onclick="enhancePrompt()" title="prompt augumentation">✨</button>
                        <button type="submit" class="submit-btn" title="submit your feedback">📤 Submit</button>
                    </div>
                    <div class="shortcut-hint">Press Ctrl+Enter to submit quickly</div>
                </form>
            </div>
        </div>
    </div>
    
    ${this.getScript(sessionId)}
</body>
</html>
    `;
  }

  /**
   * Generate the homepage HTML
   */
  static generateHomePage(port: number): string {
    return `
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
            <strong>📡 Port:</strong> ${port}<br>
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
  }

  /**
   * Generate session invalid error page
   */
  static generateSessionInvalidPage(): string {
    return `
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
      `;
  }

  /**
   * Generate 404 error page
   */
  static generate404Page(): string {
    return `
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
        `;
  }

  private static getStyles(): string {
    return `
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
        .prompt-text h1 {
            color: #ffffff;
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 16px 0;
            border-bottom: 2px solid rgba(59, 130, 246, 0.3);
            padding-bottom: 8px;
        }
        .prompt-text h2 {
            color: #e5e7eb;
            font-size: 20px;
            font-weight: 600;
            margin: 16px 0 12px 0;
        }
        .prompt-text h3 {
            color: #d1d5db;
            font-size: 18px;
            font-weight: 600;
            margin: 12px 0 8px 0;
        }
        .prompt-text strong {
            color: #ffffff;
            font-weight: 600;
        }
        .prompt-text em {
            color: #bfdbfe;
            font-style: italic;
        }
        .prompt-text code {
            background: rgba(0, 0, 0, 0.3);
            color: #fbbf24;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 14px;
        }
        .prompt-text pre {
            background: rgba(0, 0, 0, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
            overflow-x: auto;
            position: relative;
        }
        .prompt-text pre code {
            background: none;
            color: #e5e7eb;
            padding: 0;
            border-radius: 0;
            display: block;
            white-space: pre;
            overflow-x: auto;
            line-height: 1.5;
        }
        .prompt-text pre[data-language]::before {
            content: attr(data-language);
            position: absolute;
            top: 8px;
            right: 12px;
            background: rgba(59, 130, 246, 0.2);
            color: #60a5fa;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        /* Language-specific syntax highlighting */
        .language-typescript .token.keyword,
        .language-javascript .token.keyword {
            color: #c586c0;
        }
        .language-typescript .token.string,
        .language-javascript .token.string {
            color: #9cdcfe;
        }
        .language-typescript .token.comment,
        .language-javascript .token.comment {
            color: #6a9955;
            font-style: italic;
        }
        .language-bash .token.command {
            color: #4ec9b0;
        }
        .language-json .token.property {
            color: #92c5f8;
        }
        .language-json .token.string {
            color: #ce9178;
        }
        .prompt-text a {
            color: #60a5fa;
            text-decoration: none;
            border-bottom: 1px solid rgba(96, 165, 250, 0.3);
        }
        .prompt-text a:hover {
            color: #93c5fd;
            border-bottom-color: rgba(147, 197, 253, 0.6);
        }
        .prompt-text ul {
            margin: 12px 0;
            padding-left: 24px;
        }
        .prompt-text li {
            margin: 4px 0;
            color: #d1d5db;
        }
        .prompt-text p {
            margin: 12px 0;
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
        .button-group {
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
        }
        .enhance-btn {
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            color: white;
            border: none;
            border-radius: 12px;
            padding: 12px;
            font-size: 20px;
            cursor: pointer;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            position: relative;
        }
        .enhance-btn:hover {
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 10px 25px rgba(139, 92, 246, 0.4);
        }
        .enhance-btn:disabled {
            background: rgba(139, 92, 246, 0.5);
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        .submit-btn {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border: none;
            border-radius: 12px;
            padding: 12px 24px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            flex: 1;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
        }
        .enhance-btn[title]:hover::after,
        .submit-btn[title]:hover::after {
            content: attr(title);
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            white-space: nowrap;
            z-index: 1000;
            margin-bottom: 5px;
            font-weight: normal;
        }
        .enhance-btn[title]:hover::before,
        .submit-btn[title]:hover::before {
            content: '';
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 5px solid transparent;
            border-top-color: rgba(0, 0, 0, 0.9);
            z-index: 1000;
        }
        .shortcut-hint {
            color: #6b7280;
            font-size: 12px;
            text-align: center;
            margin-top: 8px;
        }
    </style>`;
  }

  private static getScript(sessionId: string): string {
    return `
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
                    output.textContent += \`Error: \${result.error}\\n\`;
                    autoScrollIfNeeded();
                }
            } catch (error) {
                output.textContent += \`Error: \${error.message}\\n\`;
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
        
        // Enhance prompt function
        async function enhancePrompt() {
            const enhanceBtn = document.querySelector('.enhance-btn');
            const feedbackTextarea = document.getElementById('feedbackText');
            const originalText = feedbackTextarea.value;
            
            if (!originalText.trim()) {
                alert('Please enter some text in the feedback area first.');
                return;
            }
            
            enhanceBtn.disabled = true;
            enhanceBtn.textContent = '🔄';
            enhanceBtn.title = 'augumenting...';
            
            try {
                const response = await fetch('/enhance-prompt', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sessionId: sessionId,
                        originalPrompt: originalText
                    }),
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        feedbackTextarea.value = result.enhancedPrompt;
                        // Auto-resize textarea if needed
                        feedbackTextarea.style.height = 'auto';
                        feedbackTextarea.style.height = feedbackTextarea.scrollHeight + 'px';
                    } else {
                        alert('Enhancement failed: ' + result.error + '\\n\\nOriginal prompt kept unchanged.');
                    }
                } else {
                    alert('Error enhancing prompt. Please check your API configuration.\\n\\nOriginal prompt kept unchanged.');
                }
            } catch (error) {
                alert('Error enhancing prompt: ' + error.message + '\\n\\nOriginal prompt kept unchanged.');
            } finally {
                enhanceBtn.disabled = false;
                enhanceBtn.textContent = '✨';
                enhanceBtn.title = 'prompt augumentation';
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
    </script>`;
  }
}
