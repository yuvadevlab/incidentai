/**
 * Real-time alert listener and anomaly detector for IncidentAI.
 * Monitors devlab-logs telemetry stream and health endpoints for error spikes.
 */

import { IncidentSeverity, type IncidentAlert } from "../types";
import { UI_COPY } from "../ui-copy";
import { getDevLabLogsUrl } from "../config/service-urls";
import { getDevLabLogsReadApiKey } from "../config/devlab-logs-auth";

export type AlertCallback = (alert: IncidentAlert) => Promise<void> | void;

/**
 * Monitors telemetry and triggers incident alerts upon error spikes or health breaches.
 */
export class AlertListener {
  private readonly telemetryApiUrl: string;
  private isPolling = false;
  private pollTimer: NodeJS.Timeout | null = null;
  private readonly listeners: Set<AlertCallback> = new Set();
  private lastSeenLogId: string | null = null;
  private warnedMissingReadApiKey = false;

  /**
   * Initializes alert listener.
   *
   * @param telemetryApiUrl DevLab Telemetry service base URL
   */
  constructor(telemetryApiUrl?: string) {
    this.telemetryApiUrl = getDevLabLogsUrl(telemetryApiUrl);
  }

  /**
   * Subscribes a callback to receive incoming incident alerts.
   */
  onAlert(callback: AlertCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Broadcasts an incident alert to all registered listeners.
   */
  async emitAlert(alert: IncidentAlert): Promise<void> {
    for (const listener of this.listeners) {
      try {
        await listener(alert);
      } catch (err) {
        console.error(UI_COPY.OPERATOR.ALERT_SUBSCRIBER_FAILED, err);
      }
    }
  }

  /**
   * Triggers an emergency simulated alert for testing or fire drills.
   *
   * @param scenario Incident archetype name
   * @param service Target impacted microservice
   * @param message Detailed error trace
   */
  async triggerSimulatedAlert(
    scenario: string,
    service: string = "finai",
    message: string = "Connection to PostgreSQL primary node timed out after 5000ms",
  ): Promise<IncidentAlert> {
    const alert: IncidentAlert = {
      id: `incident-${Date.now()}`,
      title: `[Simulated Drill] ${scenario}`,
      service,
      message,
      traceId: `trace-drill-${Date.now().toString(36)}`,
      severity: IncidentSeverity.P1_CRITICAL,
      timestamp: new Date().toISOString(),
    };

    await this.emitAlert(alert);
    return alert;
  }

  /**
   * Starts periodic polling of devlab-logs for high-frequency error bursts.
   *
   * @param intervalMs Cadence between query cycles in milliseconds
   */
  startPolling(intervalMs: number = 5000): void {
    if (this.isPolling) return;
    this.isPolling = true;

    this.pollTimer = setInterval(() => {
      void this.checkTelemetryErrors();
    }, intervalMs);
  }

  /**
   * Halts active polling loops.
   */
  stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.isPolling = false;
  }

  /**
   * Inspects devlab-logs for newly recorded error records.
   */
  private async checkTelemetryErrors(): Promise<void> {
    try {
      const readApiKey = getDevLabLogsReadApiKey();
      if (!readApiKey) {
        if (!this.warnedMissingReadApiKey) {
          console.warn("DEVLAB_LOGS_READ_API_KEY is required to poll DevLab Logs.");
          this.warnedMissingReadApiKey = true;
        }
        return;
      }
      const headers: Record<string, string> = { Accept: "application/json" };
      headers["Authorization"] = `Bearer ${readApiKey}`;
      const res = await fetch(`${this.telemetryApiUrl}/api/v1/logs?level=error&limit=5`, {
        headers,
      });
      if (!res.ok) return;

      const data = (await res.json()) as {
        logs?: Array<{ id: string; service: string; message: string; trace_id?: string }>;
      };
      const errorLogs = data.logs || [];

      if (errorLogs.length === 0) return;

      const newest = errorLogs[0];
      if (newest && newest.id !== this.lastSeenLogId) {
        this.lastSeenLogId = newest.id;

        const alert: IncidentAlert = {
          id: `incident-${newest.id.substring(0, 8)}`,
          title: `Detected high-severity crash in ${newest.service}`,
          service: newest.service,
          message: newest.message,
          traceId: newest.trace_id,
          severity: IncidentSeverity.P1_CRITICAL,
          timestamp: new Date().toISOString(),
        };

        await this.emitAlert(alert);
      }
    } catch {
      // Telemetry service may be temporarily offline during startup
    }
  }
}
