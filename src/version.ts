/**
 * @file src/version.ts
 * @description Dynamic application version and build metadata for IncidentAI CLI & SRE Supervisor.
 * Implements Big Tech hybrid SemVer + Git SHA observability without hardcoded strings.
 * @module incidentai/version
 */

import pkg from "../package.json";

const gitSha = process.env.GIT_SHA || process.env.NEXT_PUBLIC_GIT_SHA || "";
const baseVersion = `v${pkg.version}`;

export const INCIDENTAI_VERSION: string =
  process.env.APP_VERSION || (gitSha ? `${baseVersion}+${gitSha.slice(0, 7)}` : baseVersion);

export const BUILD_METADATA = {
  version: baseVersion,
  gitCommit: gitSha ? gitSha.slice(0, 7) : "dev-local",
  environment: process.env.NODE_ENV || "development",
} as const;
