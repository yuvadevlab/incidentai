#!/usr/bin/env node
/**
 * IncidentAI CLI Entrypoint.
 * Interactive Autonomous SRE War Room & Fire Drill Command Center.
 */

import { Command } from "commander";
import dotenv from "dotenv";
import { IncidentAIOrchestrator } from ".";
import { AlertListener } from "./fsm/alert_listener";
import { IncidentSeverity, type IncidentAlert } from "./types";
import { UI_COPY } from "./ui-copy";

dotenv.config();

const program = new Command();

program.name("incidentai").description(UI_COPY.CLI.DESCRIPTION).version("1.0.0");

program
  .command("demo")
  .description(UI_COPY.CLI.DEMO_DESCRIPTION)
  .action(async () => {
    console.log(UI_COPY.CLI.DEMO_START);
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
  .description(UI_COPY.CLI.RUN_DESCRIPTION)
  .option("-s, --scenario <name>", UI_COPY.CLI.SCENARIO_HELP, UI_COPY.CLI.DEFAULT_SCENARIO)
  .option("--service <service>", UI_COPY.CLI.SERVICE_HELP, UI_COPY.CLI.DEFAULT_SERVICE)
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
  .description(UI_COPY.CLI.WATCH_DESCRIPTION)
  .action(() => {
    console.log(UI_COPY.CLI.WATCH_START);
    const orchestrator = new IncidentAIOrchestrator();
    const listener = new AlertListener();

    listener.onAlert(async (alert) => {
      console.log(UI_COPY.CLI.ALERT(alert.title));
      await orchestrator.resolveIncident(alert);
    });

    listener.startPolling(4000);

    process.on("SIGINT", () => {
      console.log(UI_COPY.CLI.WATCH_STOP);
      listener.stopPolling();
      process.exit(0);
    });
  });

program.parse(process.argv);
