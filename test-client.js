#!/usr/bin/env node

import http from "http";

class EnhancePromptTester {
  constructor(port = 3511) {
    this.port = port;
    this.baseUrl = `http://localhost:${port}`;
  }

  async createSession() {
    console.log(`🔑 Creating a test session using the new test endpoint...`);

    try {
      const response = await this.makeRequest("/test-session", "POST");
      console.log(`📱 Test session endpoint response: ${response.statusCode}`);

      if (response.statusCode === 200) {
        const result = JSON.parse(response.body);
        if (result.success) {
          console.log(`✅ Session created successfully: ${result.sessionId}`);
          return result.sessionId;
        } else {
          console.log(`❌ Failed to create session: ${result.error}`);
          throw new Error(result.error);
        }
      } else {
        console.log(`❌ HTTP error: ${response.statusCode}`);
        console.log(`Response body: ${response.body}`);
        throw new Error(`HTTP ${response.statusCode}`);
      }
    } catch (error) {
      console.log(`⚠️  Session creation failed: ${error.message}`);
      throw error;
    }
  }

  makeRequest(path, method = "GET", data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: "localhost",
        port: this.port,
        path: path,
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      const req = http.request(options, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body,
          });
        });
      });

      req.on("error", reject);

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  async testEnhancePrompt(prompt = "hello") {
    console.log(`🧪 Testing enhance-prompt endpoint with prompt: "${prompt}"`);
    console.log(`📡 Server URL: ${this.baseUrl}/enhance-prompt`);
    console.log("⏰ Starting request...\n");

    // First, let's try to create a session or check what sessions exist
    const sessionId = await this.createSession();
    console.log(`📝 Using session ID: ${sessionId}`);

    const postData = JSON.stringify({
      sessionId: sessionId,
      originalPrompt: prompt,
    });

    const options = {
      hostname: "localhost",
      port: this.port,
      path: "/enhance-prompt",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const req = http.request(options, (res) => {
        const duration = Date.now() - startTime;
        console.log(`📨 Response received after ${duration}ms`);
        console.log(`📊 Status: ${res.statusCode} ${res.statusMessage}`);
        console.log(`📋 Headers:`, res.headers);

        let body = "";

        res.on("data", (chunk) => {
          body += chunk;
          console.log(`📥 Received chunk: ${chunk.length} bytes`);
        });

        res.on("end", () => {
          console.log(
            `✅ Response complete - Total time: ${Date.now() - startTime}ms`
          );
          console.log(`📄 Response body:`, body);

          try {
            const result = JSON.parse(body);
            console.log(`🎯 Parsed result:`, result);
            resolve(result);
          } catch (error) {
            console.log(`❌ Failed to parse JSON:`, error.message);
            resolve({ raw: body });
          }
        });
      });

      req.on("error", (error) => {
        const duration = Date.now() - startTime;
        console.log(`❌ Request failed after ${duration}ms:`, error.message);
        reject(error);
      });

      req.on("timeout", () => {
        console.log(`⏰ Request timed out after 30s`);
        req.destroy();
        reject(new Error("Request timeout"));
      });

      // Set timeout
      req.setTimeout(30000);

      console.log(`📤 Sending request with data:`, postData);
      req.write(postData);
      req.end();
    });
  }

  async waitForServer() {
    console.log(`🔍 Checking if server is running on port ${this.port}...`);

    for (let i = 0; i < 10; i++) {
      try {
        await this.healthCheck();
        console.log(`✅ Server is ready!`);
        return true;
      } catch (error) {
        console.log(`⏳ Waiting for server... (${i + 1}/10)`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    throw new Error("Server not ready after 10 seconds");
  }

  async healthCheck() {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: "localhost",
          port: this.port,
          path: "/health",
          method: "GET",
        },
        (res) => {
          if (res.statusCode === 200) {
            resolve();
          } else {
            reject(new Error(`Health check failed: ${res.statusCode}`));
          }
        }
      );

      req.on("error", reject);
      req.setTimeout(2000);
      req.end();
    });
  }
}

async function main() {
  const tester = new EnhancePromptTester();

  try {
    // Wait for server to be ready
    await tester.waitForServer();

    // Test enhance prompt
    console.log("\n🚀 Starting enhance-prompt test...\n");
    const result = await tester.testEnhancePrompt("hello");

    console.log("\n🎉 Test completed successfully!");
    console.log("📋 Final result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.log("\n❌ Test failed:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default EnhancePromptTester;
