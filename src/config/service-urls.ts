/**
 * Resolves the base URL for the DevLab Logs service.
 *
 * @param override Optional explicit URL, primarily for isolated integrations and tests
 * @returns The configured DevLab Logs service URL
 * @throws Error when neither an override nor DEVLAB_LOGS_URL is configured
 */
export function getDevLabLogsUrl(override?: string): string {
  const url = override ?? process.env.DEVLAB_LOGS_URL;
  if (!url?.trim()) {
    throw new Error("DEVLAB_LOGS_URL must be configured to connect to DevLab Logs.");
  }

  return url;
}
