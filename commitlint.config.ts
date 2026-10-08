import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "perf",
        "refactor",
        "style",
        "test",
        "docs",
        "build",
        "ci",
        "chore",
        "revert",
      ],
    ],
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],
    "scope-empty": [2, "never"],
    "scope-case": [2, "always", "kebab-case"],
    "scope-enum": [
      1,
      "always",
      [
        "core",
        "fsm",
        "diagnosis",
        "sandbox",
        "repair",
        "postmortem",
        "cli",
        "deps",
        "docs",
        "incident",
      ],
    ],
    "subject-empty": [2, "never"],
    "subject-min-length": [2, "always", 8],
    "subject-max-length": [2, "always", 100],
    "header-max-length": [2, "always", 100],
  },
};

export default config;
