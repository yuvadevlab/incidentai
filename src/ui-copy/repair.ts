export const REPAIR_COPY = {
  ATTEMPT: (attempt: number, max: number): string =>
    `[SelfCorrection] Initiating repair attempt ${attempt} of ${max}...`,
  VERIFIED: (attempt: number): string =>
    `[SelfCorrection] Patch attempt ${attempt} VERIFIED successfully with zero regressions.`,
  VALIDATION_FAILED: (attempt: number): string =>
    `[SelfCorrection] Attempt ${attempt} failed validation:`,
  COMMAND_FAILED: (exitCode: number): string => `Command failed with exit code ${exitCode}`,
  EXHAUSTED: (attempts: number): string =>
    `Failed to achieve verified green status after ${attempts} self-correction iterations.`,
} as const;
