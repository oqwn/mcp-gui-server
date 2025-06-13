import { GuiSession } from "../types/interfaces.js";
import { TerminalService } from "./terminal-service.js";

/**
 * Session Service for managing GUI sessions
 */
export class SessionService {
  private guiSessions = new Map<string, GuiSession>();
  private isStdioMode: boolean;

  constructor(isStdioMode: boolean = false) {
    this.isStdioMode = isStdioMode;
    this.startCleanupTimer();
  }

  private log(message: string): void {
    if (!this.isStdioMode) {
      console.error(message);
    }
  }

  /**
   * Create a new GUI session
   */
  createSession(
    resolve: (value: any) => void,
    reject: (error: any) => void,
    prompt?: string,
    title?: string
  ): string {
    const sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    this.guiSessions.set(sessionId, {
      resolve,
      reject,
      timestamp: Date.now(),
      prompt,
      title,
    });

    return sessionId;
  }

  /**
   * Get a session by ID
   */
  getSession(sessionId: string): GuiSession | undefined {
    return this.guiSessions.get(sessionId);
  }

  /**
   * Check if session exists
   */
  hasSession(sessionId: string): boolean {
    return this.guiSessions.has(sessionId);
  }

  /**
   * Remove a session
   */
  removeSession(sessionId: string): void {
    const session = this.guiSessions.get(sessionId);
    if (session) {
      TerminalService.cleanupShellProcess(session);
      this.guiSessions.delete(sessionId);
    }
  }

  /**
   * Create a test session
   */
  createTestSession(): string {
    const sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    this.guiSessions.set(sessionId, {
      resolve: () => {}, // Dummy resolve function
      reject: () => {}, // Dummy reject function
      timestamp: Date.now(),
      prompt: "Test session for enhance-prompt testing",
      title: "Test Session",
    });

    this.log(`🧪 Created test session: ${sessionId}`);
    return sessionId;
  }

  /**
   * Start cleanup timer for expired sessions
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [sessionId, session] of this.guiSessions.entries()) {
        if (now - session.timestamp > 15 * 60 * 1000) {
          // 15 minutes timeout
          TerminalService.cleanupShellProcess(session);
          session.reject(new Error("Session timeout"));
          this.guiSessions.delete(sessionId);
        }
      }
    }, 60000); // Check every minute
  }

  /**
   * Get all sessions (for debugging)
   */
  getAllSessions(): Map<string, GuiSession> {
    return this.guiSessions;
  }
}
