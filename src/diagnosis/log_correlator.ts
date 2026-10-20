/**
 * Log Correlator querying devlab-logs Log-RAG and correlation endpoints.
 * Aggregates multi-stream logs by trace_id and extracts stack trace frames.
 */

import type { IncidentAlert, StackFrame } from "../types";
import { UI_COPY } from "../ui-copy";
import { getDevLabLogsUrl } from "../config/service-urls";
import { getDevLabLogsReadApiKey } from "../config/devlab-logs-auth";

// Regex matching standard V8/Node.js stack trace line: at [func] ([file]:[line]:[col])
const STACK_FRAME_REGEX =
  /^\s*at\s+(?:(?<fn>[a-zA-Z0-9_$.<>]+)\s+\()?(?<file>[^():\n]+):(?<line>\d+):(?<col>\d+)\)?$/;

/**
 * Correlates incident logs across distributed telemetry traces.
 */
export class LogCorrelator {
  private readonly telemetryApiUrl: string;

  /**
   * Initializes log correlator.
   *
   * @param telemetryApiUrl DevLab Telemetry base URL
   */
  constructor(telemetryApiUrl?: string) {
    this.telemetryApiUrl = getDevLabLogsUrl(telemetryApiUrl);
  }

  /**
   * Pulls related logs, executes semantic RAG search, and parses stack frames.
   *
   * @param alert Incoming incident alert
   */
  async correlateTrace(alert: IncidentAlert): Promise<{
    correlatedLogs: Array<{ id: string; service: string; message: string; timestamp: string }>;
    semanticSummary: string;
    stackFrames: StackFrame[];
  }> {
    const correlatedLogs: Array<{
      id: string;
      service: string;
      message: string;
      timestamp: string;
    }> = [];
    let semanticSummary = alert.message;
    const readApiKey = getDevLabLogsReadApiKey();
    if (!readApiKey) {
      console.warn("DEVLAB_LOGS_READ_API_KEY is required to query DevLab Logs.");
      return {
        correlatedLogs,
        semanticSummary,
        stackFrames: this.extractStackFrames(alert.message),
      };
    }

    // 1. Fetch trace-correlated logs if traceId exists
    if (alert.traceId) {
      try {
        const headers: Record<string, string> = { Accept: "application/json" };
        if (readApiKey) {
          headers["Authorization"] = `Bearer ${readApiKey}`;
        }
        const res = await fetch(
          `${this.telemetryApiUrl}/api/v1/logs?traceId=${encodeURIComponent(alert.traceId)}`,
          { headers },
        );
        if (res.ok) {
          const data = (await res.json()) as {
            logs?: Array<{ id: string; service: string; message: string; timestamp: string }>;
          };
          if (data.logs && data.logs.length > 0) {
            correlatedLogs.push(...data.logs);
          }
        }
      } catch (err) {
        console.warn(UI_COPY.OPERATOR.TRACE_LOGS_FAILED, err);
      }
    }

    // 2. Query Log-RAG for semantically similar historical failures
    try {
      const ragHeaders: Record<string, string> = { "Content-Type": "application/json" };
      if (readApiKey) {
        ragHeaders["Authorization"] = `Bearer ${readApiKey}`;
      }
      const ragRes = await fetch(`${this.telemetryApiUrl}/api/v1/logs/rag-search`, {
        method: "POST",
        headers: ragHeaders,
        body: JSON.stringify({ query: alert.message, limit: 3 }),
      });
      if (ragRes.ok) {
        const ragData = (await ragRes.json()) as {
          matches?: Array<{ summary: string; similarity: number }>;
        };
        if (ragData.matches && ragData.matches.length > 0 && ragData.matches[0]) {
          semanticSummary = `${alert.message} (Historical Match: ${ragData.matches[0].summary})`;
        }
      }
    } catch {
      // Graceful fallback to raw message
    }

    // 3. Extract stack frames from message payload
    const stackFrames = this.extractStackFrames(alert.message);

    return {
      correlatedLogs,
      semanticSummary,
      stackFrames,
    };
  }

  /**
   * Extracts structured stack frames from stack traces embedded in error messages.
   *
   * @param errorText Raw error string with possible stack trace
   */
  extractStackFrames(errorText: string): StackFrame[] {
    const frames: StackFrame[] = [];
    const lines = errorText.split("\n");

    for (const line of lines) {
      const match = STACK_FRAME_REGEX.exec(line);
      if (match && match.groups) {
        const file = match.groups["file"]?.trim() || "";
        const lineNum = parseInt(match.groups["line"] || "0", 10);
        const colNum = parseInt(match.groups["col"] || "0", 10);
        const fn = match.groups["fn"]?.trim() || "anonymous";

        // Ignore third-party node_modules frames
        if (file && !file.includes("node_modules")) {
          frames.push({
            file,
            line: lineNum,
            column: colNum,
            functionName: fn,
          });
        }
      }
    }

    return frames;
  }
}
