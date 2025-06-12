import { BaseHandler } from "./base-handler.js";
import { TerminalService } from "../services/terminal-service.js";
import { CommandExecutionRequest } from "../types/interfaces.js";

/**
 * Handler for command execution requests
 */
export class CommandHandler extends BaseHandler {
  /**
   * Handle command execution request
   */
  async handleExecuteCommand(req: any, res: any): Promise<void> {
    try {
      const { sessionId, command }: CommandExecutionRequest =
        await this.parseRequestBody(req);
      const session = this.sessionService.getSession(sessionId);

      if (!session) {
        this.sendErrorResponse(res, 404, "Session not found");
        return;
      }

      // Initialize shell session if not already done
      TerminalService.initializeShellSession(session);

      // Check if shell is ready
      if (!session.shellProcess || !session.shellReady) {
        this.sendErrorResponse(res, 400, "Shell not ready");
        return;
      }

      try {
        TerminalService.executeCommand(session, command);

        this.sendJsonResponse(res, 200, {
          success: true,
          message: "Command sent to shell",
          logs: session.commandLogs,
        });
      } catch (error) {
        session.commandLogs!.push(`\nError executing command: ${error}\n`);
        this.sendErrorResponse(
          res,
          500,
          `Failed to execute command: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    } catch (error) {
      this.sendErrorResponse(
        res,
        400,
        `Invalid request: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Handle get logs request
   */
  async handleGetLogs(req: any, res: any): Promise<void> {
    const url = new URL(req.url, `http://localhost:${this.port}`);
    const sessionId = url.searchParams.get("session");

    if (!sessionId || !this.sessionService.hasSession(sessionId)) {
      this.sendErrorResponse(res, 404, "Session not found");
      return;
    }

    const session = this.sessionService.getSession(sessionId)!;
    this.sendJsonResponse(res, 200, {
      logs: session.commandLogs || [],
      success: true,
    });
  }
}
