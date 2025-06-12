import { URL } from "url";
import { BaseHandler } from "./base-handler.js";
import { GuiTemplate } from "../templates/gui-template.js";

/**
 * Handler for GUI-related requests
 */
export class GuiHandler extends BaseHandler {
  /**
   * Handle home page request
   */
  async handleHomePage(res: any): Promise<void> {
    const html = GuiTemplate.generateHomePage(this.port);
    this.sendHtmlResponse(res, 200, html);
  }

  /**
   * Handle GUI interface request
   */
  async handleGuiRequest(url: URL, res: any): Promise<void> {
    const sessionId = url.searchParams.get("session");

    if (!sessionId || !this.sessionService.hasSession(sessionId)) {
      const html = GuiTemplate.generateSessionInvalidPage();
      this.sendHtmlResponse(res, 404, html);
      return;
    }

    const session = this.sessionService.getSession(sessionId)!;
    const html = GuiTemplate.generateGuiHtml(
      sessionId,
      session.prompt,
      session.title
    );
    this.sendHtmlResponse(res, 200, html);
  }

  /**
   * Handle health check request
   */
  async handleHealthCheck(res: any): Promise<void> {
    this.sendJsonResponse(res, 200, {
      status: "ok",
      port: this.port,
      time: new Date().toISOString(),
    });
  }

  /**
   * Handle 404 errors
   */
  async handle404(res: any): Promise<void> {
    const html = GuiTemplate.generate404Page();
    this.sendHtmlResponse(res, 404, html);
  }
}
