#!/usr/bin/env node

// Debug script to check environment variable loading in different scenarios

import dotenv from "dotenv";
import fs from "fs";
import path from "path";

console.log("🔍 Environment Variable Debug Script");
console.log("===================================");

console.log("\n1. 📁 Current working directory:", process.cwd());
console.log("2. 📄 Script location:", import.meta.url);

// Check if .env file exists in different locations
const possibleEnvPaths = [
  ".env",
  "../.env",
  "../../.env",
  path.join(process.cwd(), ".env"),
  path.join(path.dirname(new URL(import.meta.url).pathname), ".env"),
];

console.log("\n3. 🔎 Checking .env file locations:");
possibleEnvPaths.forEach((envPath) => {
  const exists = fs.existsSync(envPath);
  console.log(`   ${envPath}: ${exists ? "✅ Found" : "❌ Not found"}`);
  if (exists) {
    const stats = fs.statSync(envPath);
    console.log(
      `     Size: ${stats.size} bytes, Modified: ${stats.mtime.toISOString()}`
    );
  }
});

console.log("\n4. 📝 Before dotenv.config():");
console.log(
  "   OPENROUTER_API_KEY:",
  process.env.OPENROUTER_API_KEY
    ? `Found (${process.env.OPENROUTER_API_KEY.substring(0, 15)}...)`
    : "Not found"
);
console.log(
  "   OPENROUTER_MODEL:",
  process.env.OPENROUTER_MODEL || "Not found"
);

console.log("\n5. 🔄 Calling dotenv.config()...");
const result1 = dotenv.config();
console.log(
  "   Default config result:",
  result1.error ? `❌ Error: ${result1.error.message}` : "✅ Success"
);

console.log("\n6. 🔄 Trying explicit path config...");
const result2 = dotenv.config({ path: path.join(process.cwd(), ".env") });
console.log(
  "   Explicit path config result:",
  result2.error ? `❌ Error: ${result2.error.message}` : "✅ Success"
);

console.log("\n7. 📋 After dotenv.config():");
console.log(
  "   OPENROUTER_API_KEY:",
  process.env.OPENROUTER_API_KEY
    ? `Found (${process.env.OPENROUTER_API_KEY.substring(0, 15)}...)`
    : "Not found"
);
console.log(
  "   OPENROUTER_MODEL:",
  process.env.OPENROUTER_MODEL || "Not found"
);
console.log(
  "   OPENROUTER_BASE_URL:",
  process.env.OPENROUTER_BASE_URL || "Not found"
);

// Show all environment variables that contain API keys
console.log("\n8. 🔑 All API-related environment variables:");
const allKeys = Object.keys(process.env);
const apiKeys = allKeys.filter(
  (key) =>
    key.includes("API_KEY") ||
    key.includes("OPENROUTER") ||
    key.includes("DEEPSEEK") ||
    key.includes("OPENAI")
);

if (apiKeys.length > 0) {
  apiKeys.forEach((key) => {
    const value = process.env[key];
    console.log(
      `   ${key}: ${value ? `${value.substring(0, 15)}...` : "Empty"}`
    );
  });
} else {
  console.log("   ❌ No API-related environment variables found");
}

console.log("\n9. 🧪 Simulating MCP Server startup...");
// Try to simulate what happens in the actual server
console.log("   Process args:", process.argv);
console.log("   MCP_STDIO:", process.env.MCP_STDIO || "Not set");

// Test from different working directories
console.log("\n10. 📂 Testing from different working directories:");
const testPaths = [process.cwd(), path.dirname(process.cwd())];
testPaths.forEach((testPath) => {
  try {
    const envPath = path.join(testPath, ".env");
    const exists = fs.existsSync(envPath);
    console.log(`    ${testPath}: .env ${exists ? "✅ exists" : "❌ missing"}`);
  } catch (error) {
    console.log(`    ${testPath}: ❌ Error checking: ${error.message}`);
  }
});

console.log("\n�� Debug complete!");
