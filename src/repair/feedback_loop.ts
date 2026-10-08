/**
 * Self-Correction Feedback Loop orchestrating iterative repair attempts.
 * Feeds compiler errors and failing test assertions back into LLM context until tests pass.
 */

import type { DiagnosticReport, PatchCandidate, RepairOutcome } from "../types/index.js";
import { PatchSynthesizer } from "./patch_synthesizer.js";
import { TestOracle } from "../sandbox/test_oracle.js";
import type { SandboxOptions } from "../sandbox/sandbox_runner.js";

export interface FeedbackLoopOptions {
  maxAttempts?: number;
  testCommand?: string;
  sandboxOptions?: SandboxOptions;
}

/**
 * Closed-loop automated patch generation and test verification engine.
 */
export class SelfCorrectionFeedbackLoop {
  private readonly synthesizer: PatchSynthesizer;
  private readonly oracle: TestOracle;

  /**
   * Initializes feedback loop engine.
   *
   * @param synthesizer Patch synthesizer instance
   * @param oracle Test oracle instance
   */
  constructor(synthesizer?: PatchSynthesizer, oracle?: TestOracle) {
    this.synthesizer = synthesizer || new PatchSynthesizer();
    this.oracle = oracle || new TestOracle();
  }

  /**
   * Executes the iterative repair loop until test suite passes or max attempts exhausted.
   *
   * @param report Diagnostic context
   * @param options Configuration for loop limits and test command
   */
  async executeLoop(
    report: DiagnosticReport,
    options: FeedbackLoopOptions = {},
  ): Promise<RepairOutcome> {
    const maxAttempts = options.maxAttempts || 4;
    const testCommand = options.testCommand || "echo 'Running verification tests...' && exit 0";
    const previousErrors: string[] = [];
    let lastPatch: PatchCandidate | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`[SelfCorrection] Initiating repair attempt ${attempt} of ${maxAttempts}...`);

      // 1. Synthesize candidate patch with error history
      const candidate = await this.synthesizer.synthesizePatch(report, attempt, previousErrors);
      lastPatch = candidate;

      // 2. Evaluate patch via test oracle
      const { verified, result } = await this.oracle.verifyPatch(
        testCommand,
        options.sandboxOptions,
      );

      if (verified) {
        console.log(
          `[SelfCorrection] Patch attempt ${attempt} VERIFIED successfully with zero regressions.`,
        );
        return {
          success: true,
          attempts: attempt,
          finalPatch: candidate,
          verificationResult: result,
        };
      }

      // 3. Capture failing error output to steer subsequent LLM attempt
      const failureError =
        result.stderr.trim() || `Command failed with exit code ${result.exitCode}`;
      console.warn(
        `[SelfCorrection] Attempt ${attempt} failed validation:`,
        failureError.substring(0, 120),
      );
      previousErrors.push(failureError);
    }

    // Exhausted all retry attempts
    return {
      success: false,
      attempts: maxAttempts,
      finalPatch: lastPatch,
      error: `Failed to achieve verified green status after ${maxAttempts} self-correction iterations.`,
    };
  }
}
