import { CLI_COPY } from "./cli";
import { ORCHESTRATION_COPY } from "./orchestration";
import { POSTMORTEM_COPY } from "./postmortem";
import { REPAIR_COPY } from "./repair";

export * from "./cli";
export * from "./orchestration";
export * from "./postmortem";
export * from "./repair";

export const OPERATOR_COPY = {
  TRACE_LOGS_FAILED: "[LogCorrelator] Could not retrieve trace logs:",
  TRANSITION_SUBSCRIBER_FAILED: "[IncidentFSM] Subscriber error during transition:",
  ALERT_SUBSCRIBER_FAILED: "[AlertListener] Error dispatching alert to subscriber:",
  GIT_WARNING: "[GitCommitter] Git operation warning:",
} as const;

export const UI_COPY = {
  CLI: CLI_COPY,
  ORCHESTRATION: ORCHESTRATION_COPY,
  POSTMORTEM: POSTMORTEM_COPY,
  REPAIR: REPAIR_COPY,
  OPERATOR: OPERATOR_COPY,
} as const;
