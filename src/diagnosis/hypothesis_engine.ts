/**
 * Hypothesis Engine leveraging local Ollama LLMs to formulate 3 testable root-cause hypotheses.
 * Generates structured DiagnosticReport for sandbox reproduction and repair loops.
 */

import type { IncidentAlert, DiagnosticReport, StackFrame } from "../types";
import type { MappedSourceContext } from "./ast_mapper";

/**
 * AI Root-Cause Hypothesis Generator.
 */
export class HypothesisEngine {
  private readonly ollamaUrl: string;
  private readonly model: string;

  /**
   * Initializes hypothesis engine.
   *
   * @param ollamaUrl Ollama endpoint URL
   * @param model Reasoning model identifier
   */
  constructor(ollamaUrl?: string, model?: string) {
    this.ollamaUrl = ollamaUrl || process.env.OLLAMA_URL || "http://localhost:11434";
    this.model = model || process.env.REASONING_MODEL || "qwen3:8b";
  }

  /**
   * Generates structured diagnostic hypotheses from error payload and source code snippet.
   */
  async generateHypotheses(
    alert: IncidentAlert,
    sourceContext: MappedSourceContext,
    stackFrames: StackFrame[],
  ): Promise<DiagnosticReport> {
    const prompt = `You are IncidentAI, an autonomous principal SRE diagnosing a production incident.
INCIDENT: ${alert.title}
SERVICE: ${alert.service}
ERROR MESSAGE: ${alert.message}
FAILING FILE: ${sourceContext.targetFile} (Line ${sourceContext.targetLine})

RELEVANT CODE CONTEXT:
\`\`\`
${sourceContext.codeSnippet}
\`\`\`

List exactly 3 concise, testable hypotheses explaining why this error occurred.
Format as numbered list:
1. ...
2. ...
3. ...`;

    let hypotheses: string[] = [];

    try {
      const res = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as { response?: string };
        const rawResponse = data.response || "";
        hypotheses = rawResponse
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => /^\d+\./.test(line));
      }
    } catch {
      // Graceful fallback to heuristic hypotheses
    }

    // Fallback if LLM generated less than 3 hypotheses
    if (hypotheses.length === 0) {
      hypotheses = [
        `Unchecked null or undefined reference accessed near line ${sourceContext.targetLine}`,
        `Network or database connection timeout under high latency or deadlock`,
        `Malformed input payload bypassing schema boundary validation in ${alert.service}`,
      ];
    }

    return {
      incidentId: alert.id,
      service: alert.service,
      traceId: alert.traceId,
      summary: `Automated root-cause analysis for ${alert.service} crash at ${sourceContext.targetFile}:${sourceContext.targetLine}`,
      stackFrames,
      targetFile: sourceContext.targetFile,
      targetLine: sourceContext.targetLine,
      codeSnippet: sourceContext.codeSnippet,
      hypotheses,
    };
  }
}
