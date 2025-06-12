#!/usr/bin/env node

// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { GuiService } from "./gui-service.js";
import chalk from "chalk";

// Detect runtime environment more strictly
const isStdioMode =
  process.argv.includes("--stdio") ||
  process.env.MCP_STDIO === "true" ||
  // Check if being run by MCP inspector
  process.argv.some((arg) => arg.includes("inspector")) ||
  // Check if parent process is node with inspector-related args
  !!(process.env._ && process.env._.includes("inspector")) ||
  // Check if process is being piped (stdin/stdout redirected)
  !process.stdin.isTTY ||
  !process.stdout.isTTY;

const port = parseInt(process.env.GUI_PORT || "3501");

// Pass stdio mode info to GUI service to suppress console output
const guiService = new GuiService(port, isStdioMode);

// Create MCP server
const server = new McpServer(
  {
    name: "MCP GUI Server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register GUI input tool (Interactive Feedback MCP style)
server.tool(
  "gui-input",
  "Opens a GUI dialog to collect user input with terminal support and Interactive Feedback style",
  {
    prompt: z.string().describe("Prompt text to show the user").optional(),
    title: z.string().describe("Title for the GUI window").optional(),
    timeout: z
      .number()
      .describe("Timeout in seconds (default: 300)")
      .optional(),
  },
  async ({
    prompt = "Please provide your input",
    title = "GUI Input",
    timeout = 300,
  }) => {
    try {
      // Only log GUI input in debug mode when in stdio
      if (isStdioMode && process.env.MCP_DEBUG === "true") {
        console.error(chalk.blue(`🎯 GUI Input: "${prompt}"`));
      } else if (!isStdioMode) {
        console.log(chalk.blue(`🎯 GUI Input: "${prompt}"`));
      }

      const result = await guiService.openGuiAndWaitForInput(
        prompt,
        title,
        timeout * 1000
      );

      return {
        content: [
          {
            type: "text",
            text: `User input received:
Type: ${result.type || "text"}
Content: ${result.interactive_feedback || result.input}
Command logs: ${result.command_logs || "No commands executed"}
Timestamp: ${result.timestamp || new Date().toISOString()}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Start server
async function main() {
  // Start GUI service (automatically handles port conflicts)
  await guiService.start();

  // Get actual port used
  const actualPort = guiService.getPort();

  if (isStdioMode) {
    // Stdio mode - completely suppress output to avoid any JSON-RPC corruption
    const transport = new StdioServerTransport();

    // Only output to stderr if absolutely necessary and safe
    if (process.env.MCP_DEBUG === "true") {
      console.error(
        chalk.green("🖥️  MCP GUI Server started successfully! (Stdio mode)")
      );
      console.error(chalk.cyan("- Using Interactive Feedback style interface"));
      console.error(chalk.cyan(`- GUI server running on port ${actualPort}`));
      console.error(chalk.yellow("- Tool: gui-input (with terminal support)"));
    }

    await server.connect(transport);
  } else {
    // Non-Stdio mode
    console.log(chalk.green("🖥️  MCP GUI Server started successfully!"));
    console.log(chalk.cyan(`- GUI server running on port ${actualPort}`));
    console.log(chalk.yellow("- Tool: gui-input (with terminal support)"));
    console.log(
      chalk.blue("- Can test via HTTP client or configure in MCP client")
    );

    // Keep process running
    await new Promise(() => {});
  }
}

// Error handling
process.on("SIGINT", () => {
  console.error(chalk.yellow("\n👋 Shutting down server..."));
  guiService.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.error(chalk.yellow("\n👋 Shutting down server..."));
  guiService.stop();
  process.exit(0);
});

// Start server
main().catch((error) => {
  console.error(chalk.red("❌ Server startup failed:"), error);
  process.exit(1);
});
