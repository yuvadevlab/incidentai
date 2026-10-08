/**
 * Canonical types, strict enums, and schemas for Chaos Doctor Autonomous SRE Platform.
 * All enums and statuses strictly adhere to lowercase snake_case conventions.
 */

import { z } from "zod";

/**
 * Incident lifecycle finite state machine states.
 */
export enum IncidentState {
  IDLE = "idle",
  ALERT_DETECTED = "alert_detected",
  DIAGNOSING = "diagnosing",
  SANDBOX_REPRODUCING = "sandbox_reproducing",
  HEALING = "healing",
  VERIFYING = "verifying",
  PR_SUBMITTED = "pr_submitted",
  FAILED = "failed",
}

/**
 * Canonical incident severity classification.
 */
export enum IncidentSeverity {
  P1_CRITICAL = "p1_critical",
  P2_HIGH = "p2_high",
  P3_MEDIUM = "p3_medium",
  P4_LOW = "p4_low",
}

/**
 * Alert schema emitted by health monitors or log anomaly detectors.
 */
export const IncidentAlertSchema = z.object({
  id: z.string(),
  title: z.string(),
  service: z.string(),
  message: z.string(),
  traceId: z.string().optional(),
  tenantId: z.string().optional(),
  severity: z.nativeEnum(IncidentSeverity),
  timestamp: z.string(),
});

export type IncidentAlert = z.infer<typeof IncidentAlertSchema>;

/**
 * Parsed application stack frame.
 */
export interface StackFrame {
  file: string;
  line: number;
  column: number;
  functionName: string;
}

/**
 * Diagnostic analysis report connecting telemetry traces to source code.
 */
export interface DiagnosticReport {
  incidentId: string;
  service: string;
  traceId?: string;
  summary: string;
  stackFrames: StackFrame[];
  targetFile: string;
  targetLine: number;
  codeSnippet: string;
  hypotheses: string[];
}

/**
 * Isolated sandbox command execution result.
 */
export interface SandboxResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  passed: boolean;
}

/**
 * Code repair candidate patch generated during self-correction.
 */
export interface PatchCandidate {
  patchId: string;
  attempt: number;
  targetFile: string;
  diff: string;
  fullContent?: string;
  explanation: string;
}

/**
 * Final resolution result of the self-correction repair loop.
 */
export interface RepairOutcome {
  success: boolean;
  attempts: number;
  finalPatch?: PatchCandidate;
  verificationResult?: SandboxResult;
  error?: string;
}

/**
 * Post-mortem architectural debrief and PR metadata.
 */
export interface PostMortemReport {
  incidentId: string;
  title: string;
  severity: IncidentSeverity;
  service: string;
  rootCause: string;
  resolution: string;
  attemptsCount: number;
  prBranch: string;
  prUrl?: string;
  timeline: Array<{ timestamp: string; phase: IncidentState; description: string }>;
}
