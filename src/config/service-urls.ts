/**
 * Resolves the base URL for the DevLab Logs service.
 *
 * @param override Optional explicit URL, primarily for isolated integrations and tests
 * @returns The configured DevLab Logs service URL
 */
export function getDevLabLogsUrl(override?: string): string {
  return override ?? process.env.DEVLAB_LOGS_URL ?? "http://localhost:4003";
}
