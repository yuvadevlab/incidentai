export const CLI_COPY = {
  DESCRIPTION:
    "IncidentAI — Autonomous AI Site Reliability Engineer & Self-Healing Incident Commander",
  DEMO_DESCRIPTION: "Run an end-to-end autonomous incident remediation drill",
  RUN_DESCRIPTION: "Trigger resolution for a specific incident scenario",
  SCENARIO_HELP: "Scenario title",
  SERVICE_HELP: "Target service",
  WATCH_DESCRIPTION: "Continuously monitor telemetry stream from devlab-logs for crashes",
  DEMO_START: "Starting IncidentAI autonomous SRE fire drill...\n",
  DEFAULT_SCENARIO: "DB Connection Pool Exhaustion",
  DEFAULT_SERVICE: "finai",
  WATCH_START: "[IncidentAI] Monitoring devlab-logs telemetry stream for incident alerts...",
  ALERT: (title: string): string => `[IncidentAI] 🚨 Alert triggered from live stream: ${title}`,
  WATCH_STOP: "\n[IncidentAI] Stopping telemetry monitor...",
} as const;
