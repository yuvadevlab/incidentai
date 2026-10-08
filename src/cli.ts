#!/usr/bin/env node
/**
 * IncidentAI CLI Entrypoint.
 * Interactive Autonomous SRE War Room & Fire Drill Command Center.
 */

import { Command } from "commander";
import dotenv from "dotenv";
import { IncidentAIOrchestrator } from "./index.js";
import { AlertListener } from "./fsm/alert_listener.js";
import { IncidentSeverity, type IncidentAlert } from "./types/index.js";

dotenv.config();

const program = new Command();

program
  .name("incidentai")
  .description(
    "IncidentAI — Autonomous AI Site Reliability Engineer & Self-Healing Incident Commander",
  )
  .version("1.0.0");

program
  .command("demo")
  .description("Run an end-to-end autonomous incident remediation drill")
  .action(async () => {
    console.log("Starting IncidentAI autonomous SRE fire drill...\n");
    const orchestrator = new IncidentAIOrchestrator();

    const sampleAlert: IncidentAlert = {
      id: `inc-${Date.now().toString(36)}`,
      title: "PostgreSQL Checkpoint Commit Timeout",
      service: "orchestrai",
      message:
        "Connection to PostgreSQL primary node timed out after 5000ms during checkpoint commit\n    at commitCheckpoint (/Repos/orchestrai/packages/core/src/checkpoint.ts:84:11)",
      traceId: "trace-demo-9921",
      severity: IncidentSeverity.P1_CRITICAL,
      timestamp: new Date().toISOString(),
    };

    await orchestrator.resolveIncident(sampleAlert);
  });

program
  .command("run")
  .description("Trigger resolution for a specific incident scenario")
  .option("-s, --scenario <name>", "Scenario title", "DB Connection Pool Exhaustion")
  .option("--service <service>", "Target service", "finai")
  .action(async (options) => {
    const orchestrator = new IncidentAIOrchestrator();
    const listener = new AlertListener();

    const alert = await listener.triggerSimulatedAlert(
      options.scenario,
      options.service,
      `Fatal error: ${options.scenario} in ${options.service}\n    at processQuery (/Repos/${options.service}/src/db.ts:42:15)`,
    );

    await orchestrator.resolveIncident(alert);
  });

program
  .command("watch")
  .description("Continuously monitor telemetry stream from devlab-logs for crashes")
  .action(() => {
    console.log("[IncidentAI] Monitoring devlab-logs telemetry stream for incident alerts...");
    const orchestrator = new IncidentAIOrchestrator();
    const listener = new AlertListener();

    listener.onAlert(async (alert) => {
      console.log(`[IncidentAI] 🚨 Alert triggered from live stream: ${alert.title}`);
      await orchestrator.resolveIncident(alert);
    });

    listener.startPolling(4000);

    process.on("SIGINT", () => {
      console.log("\n[IncidentAI] Stopping telemetry monitor...");
      listener.stopPolling();
      process.exit(0);
    });
  });

program.parse(process.argv);
