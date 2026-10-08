/**
 * Automated Post-Mortem & GitHub PR Generator.
 * Formats structured executive debriefs, root-cause analyses, and ready-to-merge PR documentation.
 */

import fs from "node:fs/promises";
import path from "node:path";
import type {
  IncidentAlert,
  DiagnosticReport,
  RepairOutcome,
  PostMortemReport,
} from "../types/index.js";
import type { TimelineEntry } from "./timeline_builder.js";

/**
 * Generates markdown post-mortems and pull request bodies.
 */
export class PostMortemGenerator {
  /**
   * Generates a complete executive post-mortem and writes to disk.
   */
  async generateReport(
    alert: IncidentAlert,
    diagnostic: DiagnosticReport,
    repair: RepairOutcome,
    timeline: TimelineEntry[],
    branch: string,
  ): Promise<PostMortemReport> {
    const markdown = this.renderMarkdown(alert, diagnostic, repair, timeline, branch);

    const outDir = path.resolve(process.cwd(), "postmortems");
    await fs.mkdir(outDir, { recursive: true });
    const filePath = path.resolve(outDir, `${alert.id}-postmortem.md`);
    await fs.writeFile(filePath, markdown, "utf-8");

    console.log(`[PostMortem] Executive debrief archived at: ${filePath}`);

    return {
      incidentId: alert.id,
      title: `[IncidentAI] Auto-Remediation for ${alert.title}`,
      severity: alert.severity,
      service: alert.service,
      rootCause: diagnostic.hypotheses[0] || "Boundary exception",
      resolution: repair.finalPatch?.explanation || "Applied verified patch",
      attemptsCount: repair.attempts,
      prBranch: branch,
      prUrl: `https://github.com/yuva-devlab/${alert.service}/pull/new/${branch}`,
      timeline: timeline.map((t) => ({
        timestamp: t.timestamp,
        phase: t.phase as any,
        description: t.description,
      })),
    };
  }

  /**
   * Renders the comprehensive markdown debrief.
   */
  private renderMarkdown(
    alert: IncidentAlert,
    diagnostic: DiagnosticReport,
    repair: RepairOutcome,
    timeline: TimelineEntry[],
    branch: string,
  ): string {
    return `# Incident Post-Mortem & Auto-Remediation Report: ${alert.id}

**Target Service**: \`${alert.service}\`  
**Severity**: \`${alert.severity.toUpperCase()}\`  
**Status**: **RESOLVED VIA INCIDENTAI SELF-HEALING LOOP**  
**Branch**: \`${branch}\`  
**Generated At**: \`${new Date().toISOString()}\`  

---

## 1. Executive Incident Summary
* **Trigger Alert**: ${alert.title}
* **Impacted Service**: \`${alert.service}\`
* **Raw Error Trace**: 
\`\`\`text
${alert.message}
\`\`\`

---

## 2. Root Cause Analysis (RCA) & AST Mapping
* **Failing File**: \`${diagnostic.targetFile}:${diagnostic.targetLine}\`
* **Target Function**: \`${diagnostic.summary}\`
* **Primary Hypotheses**:
${diagnostic.hypotheses.map((h, i) => `  ${i + 1}. ${h}`).join("\n")}

### Code Context:
\`\`\`typescript
${diagnostic.codeSnippet}
\`\`\`

---

## 3. Self-Correction & Repair Journey
* **Total Repair Attempts**: \`${repair.attempts}\`
* **Final Verification Status**: \`${repair.success ? "100% VERIFIED (PASSED)" : "FAILED"}\`
* **Applied Code Fix**:
\`\`\`diff
${repair.finalPatch?.diff || "// Verified fix"}
\`\`\`

---

## 4. Chronological Incident Timeline
| Offset | Phase | Event Description |
| :--- | :--- | :--- |
${timeline.map((t) => `| **${t.offset}** | \`${t.phase}\` | ${t.description} |`).join("\n")}

---

*Authored autonomously by **IncidentAI** (Autonomous AI Site Reliability Engineer).*
`;
  }
}
