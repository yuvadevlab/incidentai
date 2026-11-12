/**
 * @file incidentai/src/server/health_server.ts
 * @description Native HTTP health probe listener for IncidentAI daemon & process supervisor.
 */

import http from "node:http";
import { Logger } from "@yuva-devlab/logger";
import { BUILD_METADATA, INCIDENTAI_VERSION } from "../version";

const logger = new Logger("IncidentAiHealthServer");

/**
 * Starts a native HTTP health server listening on the configured port.
 *
 * @param port - HTTP port (defaults to 8001 or process.env.PORT)
 * @returns Running http.Server instance
 */
export function startHealthServer(port = parseInt(process.env.PORT || "8001", 10)): http.Server {
  const server = http.createServer((req, res) => {
    const url = req.url || "/";

    if (url === "/health" || url === "/api/v1/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "ok",
          service: "incidentai",
          version: INCIDENTAI_VERSION,
          build: BUILD_METADATA,
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
        }),
      );
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  });

  server.listen(port, () => {
    logger.info(`IncidentAI Health Server listening on http://localhost:${port}`);
  });

  return server;
}
