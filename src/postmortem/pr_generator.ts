/**
 * Automated Post-Mortem & GitHub PR Generator.
 * Formats structured executive debriefs, root-cause analyses, and ready-to-merge PR documentation.
 */

import fs from "node:fs/promises";
import path from "node:path";
import type { IncidentAlert, DiagnosticReport, RepairOutcome, PostMortemReport } from "../types";
import type { TimelineEntry } from "./timeline_builder";
import { UI_COPY } from "../ui-copy";

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

    console.log(UI_COPY.POSTMORTEM.ARCHIVED(filePath));

    return {
      incidentId: alert.id,
      title: UI_COPY.POSTMORTEM.TITLE(alert.title),
      severity: alert.severity,
      service: alert.service,
      rootCause: diagnostic.hypotheses[0] || UI_COPY.POSTMORTEM.FALLBACK_ROOT_CAUSE,
      resolution: repair.finalPatch?.explanation || UI_COPY.POSTMORTEM.FALLBACK_RESOLUTION,
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
    const copy = UI_COPY.POSTMORTEM;
    return `# ${copy.REPORT_TITLE}: ${alert.id}

**${copy.TARGET_SERVICE}**: \`${alert.service}\`<br>
**${copy.SEVERITY}**: \`${alert.severity.toUpperCase()}\`<br>
**${copy.STATUS}**: **${copy.RESOLVED_STATUS}**<br>
**${copy.BRANCH}**: \`${branch}\`<br>
**${copy.GENERATED_AT}**: \`${new Date().toISOString()}\`<br>

---

## 1. ${copy.EXECUTIVE_SUMMARY}
* **${copy.TRIGGER_ALERT}**: ${alert.title}
* **${copy.IMPACTED_SERVICE}**: \`${alert.service}\`
* **${copy.RAW_TRACE}**:
\`\`\`text
${alert.message}
\`\`\`

---

## 2. ${copy.ROOT_CAUSE}
* **${copy.FAILING_FILE}**: \`${diagnostic.targetFile}:${diagnostic.targetLine}\`
* **${copy.TARGET_FUNCTION}**: \`${diagnostic.summary}\`
* **${copy.HYPOTHESES}**:
${diagnostic.hypotheses.map((h, i) => `  ${i + 1}. ${h}`).join("\n")}

### ${copy.CODE_CONTEXT}:
\`\`\`typescript
${diagnostic.codeSnippet}
\`\`\`

---

## 3. ${copy.REPAIR_JOURNEY}
* **${copy.REPAIR_ATTEMPTS}**: \`${repair.attempts}\`
* **${copy.VERIFICATION}**: \`${repair.success ? copy.VERIFIED : copy.FAILED}\`
* **${copy.APPLIED_FIX}**:
\`\`\`diff
${repair.finalPatch?.diff || copy.FALLBACK_DIFF}
\`\`\`

---

## 4. ${copy.TIMELINE}
| ${copy.OFFSET} | ${copy.PHASE} | ${copy.EVENT_DESCRIPTION} |
| :--- | :--- | :--- |
${timeline.map((t) => `| **${t.offset}** | \`${t.phase}\` | ${t.description} |`).join("\n")}

---

*${copy.AUTHOR} **IncidentAI** (${copy.DESCRIPTION}).*
`;
  }
}
