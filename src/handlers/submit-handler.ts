import { BaseHandler } from "./base-handler.js";
import {
  SubmitRequest,
  PromptEnhancementRequest,
} from "../types/interfaces.js";
import { TerminalService } from "../services/terminal-service.js";

/**
 * Handler for form submission and prompt enhancement
 */
export class SubmitHandler extends BaseHandler {
  /**
   * Handle form submission request
   */
  async handleSubmitRequest(req: any, res: any): Promise<void> {
    try {
      let sessionId: string = "";
      let userInput: string = "";
      let inputType: string = "submit";
      let commandLogs: string = "";

      try {
        const jsonData: SubmitRequest = await this.parseRequestBody(req);
        sessionId = jsonData.sessionId;
        userInput = jsonData.input;
        inputType = jsonData.type || "submit";
        commandLogs = jsonData.commandLogs || "";
      } catch {
        // Fallback to form data parsing
        let body = "";
        req.on("data", (chunk: any) => {
          body += chunk.toString();
        });

        await new Promise<void>((resolve) => {
          req.on("end", () => {
            const params = new URLSearchParams(body);
            sessionId = params.get("session") || "";
            userInput = params.get("input") || "";
            inputType = params.get("type") || "submit";
            resolve();
          });
        });
      }

      if (!sessionId || !this.sessionService.hasSession(sessionId)) {
        this.sendErrorResponse(res, 404, "Session not found or expired");
        return;
      }

      const session = this.sessionService.getSession(sessionId)!;

      // Clean up processes
      TerminalService.cleanupShellProcess(session);

      // Resolve the promise with the user input including command logs
      session.resolve({
        input: userInput,
        type: inputType,
        timestamp: new Date().toISOString(),
        command_logs: commandLogs,
        interactive_feedback: userInput,
      });

      this.sessionService.removeSession(sessionId);

      // Return success response
      this.sendJsonResponse(res, 200, {
        success: true,
        message: "Input submitted successfully",
      });
    } catch (error: any) {
      console.error("Error processing GUI input:", error);
      this.sendErrorResponse(
        res,
        500,
        `Error processing input: ${error.message}`
      );
    }
  }

  /**
   * Handle prompt enhancement request
   */
  async handleEnhancePrompt(req: any, res: any): Promise<void> {
    try {
      const { sessionId, originalPrompt }: PromptEnhancementRequest =
        await this.parseRequestBody(req);

      if (!sessionId || !this.sessionService.hasSession(sessionId)) {
        this.sendErrorResponse(res, 404, "Session not found");
        return;
      }

      if (!originalPrompt || !originalPrompt.trim()) {
        this.sendErrorResponse(res, 400, "Original prompt is required");
        return;
      }

      try {
        // Call AI enhancement service
        const enhancedPrompt = await this.llmService.enhancePrompt(
          originalPrompt
        );

        this.sendJsonResponse(res, 200, {
          success: true,
          enhancedPrompt: enhancedPrompt,
        });
      } catch (error) {
        this.sendErrorResponse(
          res,
          500,
          `Enhancement failed: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    } catch (error) {
      this.sendErrorResponse(
        res,
        500,
        `Failed to parse request: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Handle create test session request
   */
  async handleCreateTestSession(req: any, res: any): Promise<void> {
    try {
      const sessionId = this.sessionService.createTestSession();

      this.sendJsonResponse(res, 200, {
        success: true,
        sessionId: sessionId,
        message: "Test session created successfully",
      });
    } catch (error) {
      this.sendErrorResponse(
        res,
        500,
        `Failed to create test session: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
