import net from "net";

/**
 * Network utility functions
 */
export class NetworkUtils {
  /**
   * Check if a port is available
   */
  static async isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const server = net.createServer();

      server.listen(port, () => {
        server.close(() => {
          resolve(true);
        });
      });

      server.on("error", () => {
        resolve(false);
      });
    });
  }

  /**
   * Find an available port starting from a given port
   */
  static async findAvailablePort(
    startPort: number = 3501,
    maxAttempts: number = 50
  ): Promise<number> {
    for (let port = startPort; port < startPort + maxAttempts; port++) {
      if (await this.isPortAvailable(port)) {
        return port;
      }
    }
    throw new Error(
      `Unable to find available port (tried range: ${startPort}-${
        startPort + maxAttempts - 1
      })`
    );
  }
}
