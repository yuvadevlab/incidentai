/**
 * Returns the configured server-only credential for DevLab Logs read requests.
 */
export function getDevLabLogsReadApiKey(): string | null {
  return process.env.DEVLAB_LOGS_READ_API_KEY || null;
}
