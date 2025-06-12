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
      let uploadedImages: any[] = [];

      const contentType = req.headers["content-type"] || "";

      if (contentType.includes("multipart/form-data")) {
        // Handle multipart form data (with images)
        const formData = await this.parseMultipartFormData(req);
        sessionId = formData.fields.sessionId || "";
        userInput = formData.fields.input || "";
        inputType = formData.fields.type || "submit";
        commandLogs = formData.fields.commandLogs || "";
        uploadedImages = formData.files || [];
      } else {
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
      }

      if (!sessionId || !this.sessionService.hasSession(sessionId)) {
        this.sendErrorResponse(res, 404, "Session not found or expired");
        return;
      }

      const session = this.sessionService.getSession(sessionId)!;

      // Clean up processes
      TerminalService.cleanupShellProcess(session);

      // Resolve the promise with the user input including command logs and images
      session.resolve({
        input: userInput,
        type: inputType,
        timestamp: new Date().toISOString(),
        command_logs: commandLogs,
        interactive_feedback: userInput,
        uploaded_images: uploadedImages,
      });

      this.sessionService.removeSession(sessionId);

      // Return success response
      this.sendJsonResponse(res, 200, {
        success: true,
        message: "Input submitted successfully",
      });
    } catch (error: any) {
      this.log(`Error processing GUI input: ${error}`);
      this.sendErrorResponse(
        res,
        500,
        `Error processing input: ${error.message}`
      );
    }
  }

  /**
   * Parse multipart form data (for file uploads)
   */
  private async parseMultipartFormData(req: any): Promise<{
    fields: Record<string, string>;
    files: Array<{
      fieldname: string;
      filename: string;
      mimetype: string;
      data: Buffer;
      size: number;
    }>;
  }> {
    return new Promise((resolve, reject) => {
      const boundary = this.getBoundary(req.headers["content-type"]);
      if (!boundary) {
        reject(new Error("No boundary found in content-type"));
        return;
      }

      let body = Buffer.alloc(0);
      req.on("data", (chunk: Buffer) => {
        body = Buffer.concat([body, chunk]);
      });

      req.on("end", () => {
        try {
          const result = this.parseMultipartBody(body, boundary);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      req.on("error", reject);
    });
  }

  /**
   * Extract boundary from content-type header
   */
  private getBoundary(contentType: string): string | null {
    const match = contentType.match(/boundary=(.+)$/);
    return match ? match[1] : null;
  }

  /**
   * Parse multipart body
   */
  private parseMultipartBody(
    body: Buffer,
    boundary: string
  ): {
    fields: Record<string, string>;
    files: Array<{
      fieldname: string;
      filename: string;
      mimetype: string;
      data: Buffer;
      size: number;
    }>;
  } {
    const fields: Record<string, string> = {};
    const files: Array<{
      fieldname: string;
      filename: string;
      mimetype: string;
      data: Buffer;
      size: number;
    }> = [];

    const boundaryBuffer = Buffer.from(`--${boundary}`);
    const parts = this.splitBuffer(body, boundaryBuffer);

    for (const part of parts) {
      if (part.length === 0) continue;

      const headerEndIndex = part.indexOf(Buffer.from("\r\n\r\n"));
      if (headerEndIndex === -1) continue;

      const headerSection = part.slice(0, headerEndIndex).toString();
      const dataSection = part.slice(headerEndIndex + 4);

      const contentDisposition = this.parseContentDisposition(headerSection);
      if (!contentDisposition.name) continue;

      if (contentDisposition.filename) {
        // This is a file
        const contentType = this.extractContentType(headerSection);
        files.push({
          fieldname: contentDisposition.name,
          filename: contentDisposition.filename,
          mimetype: contentType,
          data: dataSection.slice(0, -2), // Remove trailing \r\n
          size: dataSection.length - 2,
        });
      } else {
        // This is a regular field
        fields[contentDisposition.name] = dataSection
          .slice(0, -2)
          .toString("utf8");
      }
    }

    return { fields, files };
  }

  /**
   * Split buffer by delimiter
   */
  private splitBuffer(buffer: Buffer, delimiter: Buffer): Buffer[] {
    const parts: Buffer[] = [];
    let start = 0;
    let index = 0;

    while ((index = buffer.indexOf(delimiter, start)) !== -1) {
      if (index > start) {
        parts.push(buffer.slice(start, index));
      }
      start = index + delimiter.length;
    }

    if (start < buffer.length) {
      parts.push(buffer.slice(start));
    }

    return parts;
  }

  /**
   * Parse Content-Disposition header
   */
  private parseContentDisposition(headers: string): {
    name?: string;
    filename?: string;
  } {
    const match = headers.match(
      /Content-Disposition: form-data; name="([^"]+)"(?:; filename="([^"]+)")?/
    );
    return {
      name: match?.[1],
      filename: match?.[2],
    };
  }

  /**
   * Extract Content-Type from headers
   */
  private extractContentType(headers: string): string {
    const match = headers.match(/Content-Type: (.+)/);
    return match?.[1]?.trim() || "application/octet-stream";
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
