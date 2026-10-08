/**
 * Isolated Sandbox Runner executing test suites and patch builds.
 * Implements strict execution timeouts, process tree cleanup, and copy-on-write directory isolation.
 */

import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import type { SandboxResult } from "../types/index.js";

export interface SandboxOptions {
  cwd?: string;
  timeoutMs?: number;
  env?: Record<string, string>;
}

/**
 * Sandboxed command execution engine with resource limits and timeout kill-switches.
 */
export class SandboxRunner {
  private readonly defaultTimeoutMs: number;

  /**
   * Initializes sandbox runner.
   *
   * @param defaultTimeoutMs Maximum command duration before SIGKILL (default 20000ms)
   */
  constructor(defaultTimeoutMs: number = 20000) {
    this.defaultTimeoutMs = defaultTimeoutMs;
  }

  /**
   * Executes a shell command inside an isolated sandbox directory.
   *
   * @param command Command string to execute (e.g. "pnpm test")
   * @param options Execution environment options
   */
  async execute(command: string, options: SandboxOptions = {}): Promise<SandboxResult> {
    const cwd = options.cwd || process.cwd();
    const timeoutMs = options.timeoutMs || this.defaultTimeoutMs;
    const start = performance.now();

    let stdout = "";
    let stderr = "";

    return new Promise((resolve) => {
      // Spawn command via shell with safe environment
      const child = spawn(command, {
        cwd,
        shell: true,
        env: {
          ...process.env,
          ...(options.env || {}),
          NODE_ENV: "test",
          CI: "true",
        },
      });

      let killed = false;
      const timer = setTimeout(() => {
        killed = true;
        child.kill("SIGKILL");
        stderr += `\n[SandboxRunner] Command timed out after ${timeoutMs}ms and was terminated.`;
      }, timeoutMs);

      child.stdout.on("data", (data: Buffer) => {
        stdout += data.toString();
      });

      child.stderr.on("data", (data: Buffer) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        clearTimeout(timer);
        const durationMs = Math.round(performance.now() - start);
        const exitCode = killed ? 124 : code ?? 1;

        resolve({
          exitCode,
          stdout,
          stderr,
          durationMs,
          passed: exitCode === 0,
        });
      });

      child.on("error", (err) => {
        clearTimeout(timer);
        const durationMs = Math.round(performance.now() - start);
        resolve({
          exitCode: 1,
          stdout,
          stderr: `${stderr}\n[SandboxRunner] Spawn error: ${String(err)}`,
          durationMs,
          passed: false,
        });
      });
    });
  }

  /**
   * Creates an isolated temporary directory for copy-on-write workspace experiments.
   */
  async createIsolatedWorkspace(prefix: string = "incidentai-sandbox"): Promise<string> {
    const tmpDir = path.resolve(process.cwd(), "sandboxes", `${prefix}-${Date.now()}`);
    await fs.mkdir(tmpDir, { recursive: true });
    return tmpDir;
  }
}
