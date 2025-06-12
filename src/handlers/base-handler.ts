import { SessionService } from "../services/session-service.js";
import { LLMService } from "../services/llm-service.js";
import { TerminalService } from "../services/terminal-service.js";

/**
 * Base handler class with common functionality
 */
export abstract class BaseHandler {
  protected sessionService: SessionService;
  protected llmService: LLMService;
  protected isStdioMode: boolean;
  protected port: number;

  constructor(
    sessionService: SessionService,
    llmService: LLMService,
    port: number,
    isStdioMode: boolean = false
  ) {
    this.sessionService = sessionService;
    this.llmService = llmService;
    this.port = port;
    this.isStdioMode = isStdioMode;
  }

  /**
   * Safe logging method that respects stdio mode
   */
  protected log(message: string): void {
    if (!this.isStdioMode) {
      console.error(message);
    }
  }

  /**
   * Parse request body
   */
  protected async parseRequestBody(req: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk: any) => {
        body += chunk.toString();
      });

      req.on("end", () => {
        try {
          const data = JSON.parse(body);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      });

      req.on("error", reject);
    });
  }

  /**
   * Send JSON response
   */
  protected sendJsonResponse(res: any, statusCode: number, data: any): void {
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  }

  /**
   * Send HTML response
   */
  protected sendHtmlResponse(res: any, statusCode: number, html: string): void {
    res.writeHead(statusCode, { "Content-Type": "text/html" });
    res.end(html);
  }

  /**
   * Send error response
   */
  protected sendErrorResponse(
    res: any,
    statusCode: number,
    message: string
  ): void {
    this.sendJsonResponse(res, statusCode, {
      success: false,
      error: message,
    });
  }
}
