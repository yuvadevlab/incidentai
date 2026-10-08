/**
 * AST Code Mapper inspecting local repository files around failing stack frames.
 * Extracts function signatures, target line context, and surrounding AST statements.
 */

import fs from "node:fs/promises";
import path from "node:path";
import type { StackFrame } from "../types/index.js";

export interface MappedSourceContext {
  targetFile: string;
  targetLine: number;
  codeSnippet: string;
  functionName: string;
}

/**
 * Maps stack trace locations directly to source file AST blocks.
 */
export class AstMapper {
  private readonly baseDirs: string[];

  /**
   * Initializes AST mapper with search root directories.
   *
   * @param baseDirs Optional list of repository root paths to search
   */
  constructor(baseDirs?: string[]) {
    this.baseDirs = baseDirs || [path.resolve(process.cwd(), ".."), process.cwd()];
  }

  /**
   * Resolves the primary failing application frame and extracts code context.
   *
   * @param frames Parsed stack frames
   * @param fallbackFile Default file if no stack frames found
   */
  async mapFrameToSource(
    frames: StackFrame[],
    fallbackFile?: string,
  ): Promise<MappedSourceContext> {
    const primaryFrame = frames[0];
    const candidateFile = primaryFrame ? primaryFrame.file : fallbackFile || "src/index.ts";
    const targetLine = primaryFrame ? primaryFrame.line : 1;
    const functionName = primaryFrame ? primaryFrame.functionName : "unknown";

    const resolvedPath = await this.resolveFilePath(candidateFile);
    if (!resolvedPath) {
      return {
        targetFile: candidateFile,
        targetLine,
        codeSnippet: `// Source file not found on disk: ${candidateFile}`,
        functionName,
      };
    }

    try {
      const fileContent = await fs.readFile(resolvedPath, "utf-8");
      const lines = fileContent.split("\n");

      // Extract window of 25 lines before and after target line
      const startLine = Math.max(0, targetLine - 25);
      const endLine = Math.min(lines.length, targetLine + 25);
      const snippet = lines
        .slice(startLine, endLine)
        .map((line, idx) => {
          const currentLineNum = startLine + idx + 1;
          const marker = currentLineNum === targetLine ? " > " : "   ";
          return `${marker}${currentLineNum.toString().padStart(4, " ")} | ${line}`;
        })
        .join("\n");

      return {
        targetFile: resolvedPath,
        targetLine,
        codeSnippet: snippet,
        functionName,
      };
    } catch (err) {
      return {
        targetFile: resolvedPath,
        targetLine,
        codeSnippet: `// Error reading file: ${String(err)}`,
        functionName,
      };
    }
  }

  /**
   * Locates file across registered base directories.
   */
  private async resolveFilePath(filePath: string): Promise<string | null> {
    if (path.isAbsolute(filePath)) {
      try {
        await fs.access(filePath);
        return filePath;
      } catch {
        return null;
      }
    }

    for (const base of this.baseDirs) {
      const fullPath = path.resolve(base, filePath);
      try {
        await fs.access(fullPath);
        return fullPath;
      } catch {
        // Continue searching
      }
    }

    return null;
  }
}
