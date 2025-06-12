import { spawn } from "child_process";
import { GuiSession } from "../types/interfaces.js";

/**
 * Terminal Service for command execution
 */
export class TerminalService {
  /**
   * Initialize shell session for a GUI session
   */
  static async initializeShellSession(session: GuiSession): Promise<void> {
    if (session.shellProcess && session.shellReady) {
      return; // Already initialized and ready
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
      const cleanOutput = this.cleanTerminalOutput(output);
      if (cleanOutput) {
        session.commandLogs!.push(cleanOutput);
      }
    });

    // Handle stderr
    session.shellProcess.stderr?.on("data", (data) => {
      const output = data.toString();
      const cleanOutput = this.cleanTerminalOutput(output);
      if (cleanOutput) {
        session.commandLogs!.push(cleanOutput);
      }
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

    // Wait for shell to be ready with proper async handling
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (!session.shellReady) {
          reject(new Error("Shell initialization timeout"));
        }
      }, 2000); // Increased timeout to 2 seconds

      // Check if shell is ready by sending a simple command
      const checkReady = () => {
        if (session.shellProcess && session.shellProcess.stdin) {
          // Send a simple echo command to test if shell is responsive
          session.shellProcess.stdin.write("echo 'shell_ready'\n");

          // Listen for the response
          const onData = (data: Buffer) => {
            const output = data.toString();
            if (output.includes("shell_ready")) {
              session.shellReady = true;
              clearTimeout(timeout);
              session.shellProcess!.stdout?.off("data", onData);
              resolve();
            }
          };

          session.shellProcess.stdout?.on("data", onData);
        }
      };

      // Start checking after a brief delay
      setTimeout(checkReady, 100);
    });
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

    // Check if this is a curl command that needs clean output
    const isCurlCommand = command.trim().startsWith("curl");

    if (isCurlCommand) {
      // For curl commands, modify to use silent mode and clean output
      const cleanCommand = this.cleanCurlCommand(command);

      if (session.shellProcess.stdin) {
        session.shellProcess.stdin.write(`${cleanCommand}\n`);
      }
    } else {
      // Send command to persistent shell as normal
      if (session.shellProcess.stdin) {
        session.shellProcess.stdin.write(`${command}\n`);
      }
    }
  }

  /**
   * Clean curl command to remove verbose output and extract meaningful content
   */
  private static cleanCurlCommand(command: string): string {
    // Remove existing curl flags that cause verbose output
    let cleanCommand = command
      .replace(/curl\s+(-[^s]*\s+)?/, "curl -s ") // Add silent flag, remove other flags
      .replace(/\\\s*\n\s*/g, " ") // Remove line breaks and backslashes
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    // If the URL contains /hello/test1 or similar JSON endpoints, add JSON parsing
    if (
      cleanCommand.includes("/hello/test1") ||
      cleanCommand.includes("/hello/")
    ) {
      // Check if it's a JSON endpoint by looking for common patterns
      if (
        cleanCommand.includes("/hello/test") ||
        cleanCommand.match(/\/hello\/\w+/)
      ) {
        cleanCommand += ` | grep -o '"message":"[^"]*"' | cut -d'"' -f4 2>/dev/null || cat`;
      }
    }

    return cleanCommand;
  }

  /**
   * Clean terminal output to remove curl progress bars and verbose information
   */
  private static cleanTerminalOutput(output: string): string {
    // Filter out curl progress bars and verbose output
    const lines = output.split("\n");
    const cleanLines = lines.filter((line) => {
      // Remove curl progress bars (lines with % Total % Received etc.)
      if (
        line.includes("% Total") ||
        line.includes("% Received") ||
        line.includes("% Xferd")
      ) {
        return false;
      }

      // Remove curl progress data lines (numbers and dashes)
      if (/^\s*\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+/.test(line)) {
        return false;
      }

      // Remove curl error messages about malformed URLs (common with multi-line commands)
      if (line.includes("curl: (3) URL rejected: Malformed input")) {
        return false;
      }

      // Remove empty lines that are just whitespace
      if (line.trim() === "") {
        return false;
      }

      return true;
    });

    return cleanLines.join("\n");
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
