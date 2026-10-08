/**
 * Test Oracle validating bug reproduction and patch verification.
 */

import type { SandboxResult } from "../types/index.js";
import { SandboxRunner, type SandboxOptions } from "./sandbox_runner.js";

/**
 * Validates execution assertions before and after patch application.
 */
export class TestOracle {
  private readonly runner: SandboxRunner;

  /**
   * Initializes test oracle.
   *
   * @param runner Sandbox runner instance
   */
  constructor(runner?: SandboxRunner) {
    this.runner = runner || new SandboxRunner();
  }

  /**
   * Verifies that the bug is successfully reproduced prior to patch application.
   *
   * @param testCommand Command executing reproduction test
   * @param options Sandbox execution options
   */
  async verifyReproduction(
    testCommand: string,
    options?: SandboxOptions,
  ): Promise<{ reproduced: boolean; result: SandboxResult }> {
    const result = await this.runner.execute(testCommand, options);
    // In reproduction, a non-zero exit code or explicit failure indicates the bug exists
    const reproduced = !result.passed;
    return { reproduced, result };
  }

  /**
   * Verifies that candidate patch passes all unit tests and regression suites.
   *
   * @param testCommand Command executing verification suite
   * @param options Sandbox execution options
   */
  async verifyPatch(
    testCommand: string,
    options?: SandboxOptions,
  ): Promise<{ verified: boolean; result: SandboxResult }> {
    const result = await this.runner.execute(testCommand, options);
    // In verification, exitCode === 0 indicates clean fix with zero regressions
    return { verified: result.passed, result };
  }
}
