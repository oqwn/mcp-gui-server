#!/usr/bin/env node

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import chalk from "chalk";

console.log(chalk.blue("🚀 Starting MCP GUI Client Example...\n"));

// Create the transport
console.log(chalk.cyan("📡 Connecting to the MCP server..."));
const transport = new StdioClientTransport({
  command: "npm",
  args: ["run", "stdio"],
});

// Create the client
const client = new Client(
  {
    name: "gui-client-example",
    version: "1.0.0",
  },
  {
    capabilities: {},
  }
);

async function runExample() {
  try {
    // Connect to the server
    await client.connect(transport);
    console.log(chalk.green("✅ Connected to the MCP server!\n"));

    // Test the GUI input tool (Interactive-Feedback style with terminal support)
    console.log(chalk.yellow("🎯 Testing gui-input tool..."));

    try {
      const inputResult = await client.callTool({
        name: "gui-input",
        arguments: {
          prompt:
            "I've implemented the MCP GUI server with Interactive Feedback style and terminal support. Please review and provide feedback:",
          title: "MCP GUI Server Review",
          timeout: 60,
        },
      });

      console.log(chalk.green("✅ GUI input tool result:"));
      console.log((inputResult.content as any)[0].text);
      console.log();
    } catch (error) {
      console.log(chalk.red("❌ GUI input tool error:"), error);
      console.log();
    }

    console.log(chalk.blue("🎉 Test completed!"));
  } catch (error) {
    console.error(chalk.red("❌ Connection error:"), error);
  } finally {
    // Clean up
    try {
      await client.close();
      console.log(chalk.gray("👋 Disconnected from server"));
    } catch (error) {
      /* Ignore close errors */
    }
  }
}

// Run the example
runExample().catch((error) => {
  console.error(chalk.red("❌ Example failed:"), error);
  process.exit(1);
});
