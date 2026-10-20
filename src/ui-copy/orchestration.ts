export const ORCHESTRATION_COPY = {
  DETECTED: (title: string): string => `[IncidentAI] 🚨 INCIDENT DETECTED: ${title}`,
  IMPACT: (service: string, severity: string): string =>
    `[IncidentAI] Impacted Service: ${service} | Severity: ${severity}`,
  ALERT_RECEIVED: (title: string): string => `Alert received: ${title}`,
  CORRELATE: "Correlating telemetry and mapping AST source context",
  DIAGNOSIS: "Isolating in sandbox and generating reproduction spec",
  REPAIR: "Starting self-correcting LLM code patch synthesis",
  VERIFY: "Verifying regression test suite across workspace",
  DIAGNOSIS_COMPLETE: "[IncidentAI] 🔍 Root-Cause Diagnosis Complete:",
  FAILING_FILE: (file: string, line: number): string =>
    `             Failing File: ${file}:${line}`,
  TOP_HYPOTHESIS: (hypothesis: string | undefined): string =>
    `             Top Hypothesis: ${hypothesis}`,
  SANDBOX: (path: string): string => `[IncidentAI] 🧪 Sandbox Environment Isolated at: ${path}`,
  COMMIT: "[IncidentAI] 📦 Committing verified patch and creating branch...",
  PR_CREATED: "Pull request created on branch",
  RESOLVED: "[IncidentAI] ✅ INCIDENT RESOLVED & PR OPENED!",
  PR_BRANCH: (branch: string): string => `             PR Branch: ${branch}`,
  ATTEMPTS: (count: number): string => `             Attempts:  ${count}`,
} as const;
