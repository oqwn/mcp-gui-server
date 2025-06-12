import { spawn } from "child_process";
import { GuiSession } from "../types/interfaces.js";

/**
 * Terminal Service for command execution
 */
export class TerminalService {
  /**
   * Initialize shell session for a GUI session
   */
  static initializeShellSession(session: GuiSession): void {
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
    }, 300);
  }

  /**
   * Execute a command in the session's shell
   */
  static executeCommand(session: GuiSession, command: string): void {
    if (!session.shellProcess || !session.shellReady) {
      throw new Error("Shell not ready");
    }

    // Add command to logs (with prompt-like format)
    session.commandLogs!.push(`$ ${command}\n`);

    // Send command to persistent shell
    if (session.shellProcess.stdin) {
      session.shellProcess.stdin.write(`${command}\n`);
    }
  }

  /**
   * Clean up shell process
   */
  static cleanupShellProcess(session: GuiSession): void {
    if (session.shellProcess) {
      session.shellProcess.kill("SIGTERM");
    }
    if (session.runningProcess) {
      session.runningProcess.kill("SIGTERM");
    }
  }
}
