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
          // Use a unique marker that we'll filter out from logs
          session.shellProcess.stdin.write("echo '__shell_init_test__'\n");

          // Listen for the response
          const onData = (data: Buffer) => {
            const output = data.toString();
            if (output.includes("__shell_init_test__")) {
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

    // Normalize the command first (handle multi-line commands)
    const normalizedCommand = command
      .replace(/\\\s+/g, " ") // Remove backslashes followed by spaces (common in pasted multi-line commands)
      .replace(/\\\s*[\r\n]+\s*/g, " ") // Remove line breaks and backslashes
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    // Handle special "clear" command
    if (normalizedCommand.toLowerCase() === "clear") {
      // Clear all command logs
      session.commandLogs = [""];
      return;
    }

    // Add command to logs (with prompt-like format)
    // Ensure the command starts on a new line if there's previous output
    const lastLog = session.commandLogs![session.commandLogs!.length - 1];
    if (lastLog && !lastLog.endsWith("\n")) {
      session.commandLogs!.push(`\n$ ${normalizedCommand}`);
    } else {
      session.commandLogs!.push(`$ ${normalizedCommand}`);
    }

    // Check if this is an HTTP request command that needs clean output
    const isHttpCommand = this.isHttpRequestCommand(normalizedCommand);

    if (isHttpCommand) {
      // For HTTP request commands, modify to use clean output mode
      const cleanCommand = this.cleanHttpCommand(normalizedCommand);

      if (session.shellProcess.stdin) {
        session.shellProcess.stdin.write(`${cleanCommand}\n`);
      }
    } else {
      // Send command to persistent shell as normal
      if (session.shellProcess.stdin) {
        session.shellProcess.stdin.write(`${normalizedCommand}\n`);
      }
    }
  }

  /**
   * Check if a command is an HTTP request command
   */
  private static isHttpRequestCommand(command: string): boolean {
    const trimmedCommand = command.trim().toLowerCase();

    // Check for common HTTP request tools
    return (
      trimmedCommand.startsWith("curl ") ||
      trimmedCommand.startsWith("wget ") ||
      trimmedCommand.startsWith("http ") || // HTTPie
      trimmedCommand.startsWith("https ") || // HTTPie
      trimmedCommand.startsWith("httpie ") ||
      trimmedCommand.startsWith("fetch ") ||
      // Check for URLs in the command (basic heuristic)
      /https?:\/\//.test(command)
    );
  }

  /**
   * Clean HTTP request command to remove verbose output
   */
  private static cleanHttpCommand(command: string): string {
    const trimmedCommand = command.trim();
    let cleanCommand = command;

    // Apply tool-specific optimizations for clean output
    if (trimmedCommand.toLowerCase().startsWith("curl ")) {
      // For curl: add silent flag and ensure we show response regardless of HTTP status
      cleanCommand = cleanCommand.replace(/^curl\s+/, "curl -sS ");

      // Remove any existing -s or -S flags to avoid duplication
      cleanCommand = cleanCommand.replace(/\s+-s+\s+/g, " ");
      cleanCommand = cleanCommand.replace(/\s+-S+\s+/g, " ");

      // Ensure we have the right flags
      if (!cleanCommand.includes("-sS")) {
        cleanCommand = cleanCommand.replace(/^curl\s+/, "curl -sS ");
      }
    } else if (trimmedCommand.toLowerCase().startsWith("wget ")) {
      // For wget: add quiet flag
      if (!cleanCommand.includes("-q") && !cleanCommand.includes("--quiet")) {
        cleanCommand = cleanCommand.replace("wget ", "wget -q ");
      }
    } else if (
      trimmedCommand.toLowerCase().startsWith("http ") ||
      trimmedCommand.toLowerCase().startsWith("https ")
    ) {
      // HTTPie is already clean by default, just normalize
      // No additional flags needed
    }

    // Debug logging (only in debug mode to avoid spam)
    if (process.env.MCP_DEBUG === "true") {
      console.error("Original command:", JSON.stringify(command));
      console.error("Clean command:", JSON.stringify(cleanCommand));
    }
    return cleanCommand;
  }

  /**
   * Clean terminal output to remove HTTP tool progress bars and verbose information
   */
  private static cleanTerminalOutput(output: string): string {
    // Be very conservative - only remove obvious progress indicators
    // Preserve all actual content

    const lines = output.split("\n");
    const cleanLines = lines.filter((line) => {
      // Filter out shell initialization marker
      if (line.includes("__shell_init_test__")) {
        return false;
      }

      // Only remove very specific curl progress patterns
      // Remove lines that are clearly progress bars with percentages and transfer data
      if (
        line.includes("% Total") &&
        line.includes("% Received") &&
        line.includes("% Xferd")
      ) {
        return false;
      }

      // Remove lines that are clearly transfer statistics (all numbers and dashes)
      if (
        /^\s*\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+--:--:--\s+--:--:--\s+--:--:--/.test(
          line
        )
      ) {
        return false;
      }

      // Keep everything else - including short responses, JSON, error messages, etc.
      return true;
    });

    let result = cleanLines.join("\n");

    // Only remove trailing % if it's at the very end and likely from curl
    if (result.endsWith("%\n") || result.endsWith("%")) {
      result = result.replace(/%\s*$/, "");
    }

    // Ensure command output starts on a new line and ends with one for next command
    if (result && result.trim()) {
      if (!result.startsWith("\n")) {
        result = "\n" + result;
      }
      if (!result.endsWith("\n")) {
        result = result + "\n";
      }
    }

    // Ensure we return something if we have content
    return result;
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
