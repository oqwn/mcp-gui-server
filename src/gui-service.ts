import { createServer } from "http";
import { URL } from "url";
import open from "open";

import { SessionService } from "./services/session-service.js";
import { LLMService } from "./services/llm-service.js";
import { NetworkUtils } from "./utils/network.js";
import { GuiHandler } from "./handlers/gui-handler.js";
import { CommandHandler } from "./handlers/command-handler.js";
import { SubmitHandler } from "./handlers/submit-handler.js";

/**
 * Refactored GUI Service with modular architecture
 */
export class GuiService {
  private server: any;
  private port: number;
  private isStdioMode: boolean;

  // Services
  private sessionService: SessionService;
  private llmService: LLMService;

  // Handlers
  private guiHandler: GuiHandler;
  private commandHandler: CommandHandler;
  private submitHandler: SubmitHandler;

  constructor(port: number = 3501, isStdioMode: boolean = false) {
    this.port = port;
    this.isStdioMode = isStdioMode;

    // Initialize services
    this.sessionService = new SessionService(isStdioMode);
    this.llmService = new LLMService(isStdioMode);

    // Initialize handlers
    this.guiHandler = new GuiHandler(
      this.sessionService,
      this.llmService,
      this.port,
      isStdioMode
    );
    this.commandHandler = new CommandHandler(
      this.sessionService,
      this.llmService,
      this.port,
      isStdioMode
    );
    this.submitHandler = new SubmitHandler(
      this.sessionService,
      this.llmService,
      this.port,
      isStdioMode
    );

    this.server = this.createGuiServer();
  }

  /**
   * Safe logging method that respects stdio mode
   */
  private log(message: string): void {
    if (!this.isStdioMode) {
      console.error(message);
    }
  }

  /**
   * Create the HTTP server with route handling
   */
  private createGuiServer() {
    return createServer(async (req: any, res: any) => {
      const url = new URL(req.url!, `http://${req.headers.host}`);

      try {
        if (url.pathname === "/" && req.method === "GET") {
          await this.guiHandler.handleHomePage(res);
        } else if (url.pathname === "/gui" && req.method === "GET") {
          await this.guiHandler.handleGuiRequest(url, res);
        } else if (url.pathname === "/submit" && req.method === "POST") {
          await this.submitHandler.handleSubmitRequest(req, res);
        } else if (url.pathname === "/execute" && req.method === "POST") {
          await this.commandHandler.handleExecuteCommand(req, res);
        } else if (
          url.pathname === "/enhance-prompt" &&
          req.method === "POST"
        ) {
          await this.submitHandler.handleEnhancePrompt(req, res);
        } else if (url.pathname === "/logs" && req.method === "GET") {
          await this.commandHandler.handleGetLogs(req, res);
        } else if (url.pathname === "/health" && req.method === "GET") {
          await this.guiHandler.handleHealthCheck(res);
        } else if (url.pathname === "/test-session" && req.method === "POST") {
          await this.submitHandler.handleCreateTestSession(req, res);
        } else {
          await this.guiHandler.handle404(res);
        }
      } catch (error) {
        this.log(`Error handling request: ${error}`);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            error: "Internal server error",
          })
        );
      }
    });
  }

  /**
   * Open GUI and wait for user input
   */
  public async openGuiAndWaitForInput(
    prompt?: string,
    title?: string,
    timeoutMs: number = 5 * 60 * 1000
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const sessionId = this.sessionService.createSession(
        resolve,
        reject,
        prompt,
        title
      );

      // Open browser to GUI
      const guiUrl = `http://localhost:${this.port}/gui?session=${sessionId}`;
      this.log(`Opening GUI: ${guiUrl}`);

      open(guiUrl).catch((error: any) => {
        this.log("Failed to open browser: " + error);
        this.sessionService.removeSession(sessionId);
        reject(new Error("Failed to open GUI"));
      });

      // Set timeout
      setTimeout(() => {
        if (this.sessionService.hasSession(sessionId)) {
          this.sessionService.removeSession(sessionId);
          reject(new Error("GUI input timeout"));
        }
      }, timeoutMs);
    });
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    const originalPort = this.port;

    if (!(await NetworkUtils.isPortAvailable(this.port))) {
      this.log(
        `⚠️  Port ${this.port} is in use, searching for available port...`
      );

      try {
        this.port = await NetworkUtils.findAvailablePort(originalPort, 50);
        this.log(`✅ Found available port: ${this.port}`);

        // Update port in all handlers
        this.guiHandler = new GuiHandler(
          this.sessionService,
          this.llmService,
          this.port,
          this.isStdioMode
        );
        this.commandHandler = new CommandHandler(
          this.sessionService,
          this.llmService,
          this.port,
          this.isStdioMode
        );
        this.submitHandler = new SubmitHandler(
          this.sessionService,
          this.llmService,
          this.port,
          this.isStdioMode
        );
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

  /**
   * Get the current port
   */
  public getPort(): number {
    return this.port;
  }

  /**
   * Stop the server
   */
  public stop(): void {
    this.server.close();
  }
}
