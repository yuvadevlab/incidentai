# IncidentAI — Autonomous AI Site Reliability Engineer & Incident Commander

<p align="center">
  <img src="https://img.shields.io/badge/status-active-brightgreen" alt="Status" />
  <img src="https://img.shields.io/badge/typescript-5.8.2-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/node-%3E%3D20.0.0-green" alt="Node" />
  <img src="https://img.shields.io/badge/code%20style-prettier-ff69b4" alt="Prettier" />
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License" />
</p>

**IncidentAI** is an enterprise-grade autonomous Site Reliability Engineering (SRE) commander and self-healing platform. When production alerts fire, IncidentAI mobilizes an autonomous swarm of specialized agents to triage severity, isolate root causes across distributed logs, simulate remediations in isolated sandboxes, execute verified mitigations, and publish blameless retrospective postmortems.

---

## ⚡ Key Capabilities

- **Deterministic Incident FSM**: Finite State Machine ensuring no stage skipping (`DETECTED` ➔ `TRIAGING` ➔ `DIAGNOSING` ➔ `MITIGATING` ➔ `VERIFYING` ➔ `RESOLVED` ➔ `POSTMORTEM`).
- **Distributed Forensic Triage**: Ingests error bursts and traces across DevLab Logs to cluster repetitive stack traces and identify anomalous latency signatures.
- **Sandboxed Dry-Run Remediation**: Authoring surgical remediation scripts with mandatory ephemeral sandbox validation prior to production application.
- **Human-in-the-Loop (HITL) Rails**: Enforces cryptographic authorization tokens for high-impact infrastructure mutations (`SEV-1`).
- **Automated SRE Postmortems**: Instant timeline reconstruction (MTTD, MTTA, MTTM) and blameless retrospective generation in markdown.

---

## 🏗 System Architecture

```mermaid
graph TD
    A[Telemetry / Alert Trigger] --> B[Incident Commander FSM]
    B -->|Triage & Rank| C[Severity Classifier]
    B -->|Forensics| D[Diagnosis Investigator Agent]
    D -->|Query Traces| E[DevLab Logs / DuckDB / Kafka]
    D -->|Diagnosis Report| F[Remediation Sandbox Agent]
    F -->|Dry Run| G[Ephemeral Sandbox Runtime]
    G -->|Pass Verification| H[Production Mitigation Dispatch]
    H -->|Verify Metrics| I[SLO Verification Guard]
    I -->|Resolution Event| J[Postmortem Scribe Agent]
    J -->|Publish Docs| K[Knowledge Base & Issue Tracker]
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js `>= 20.0.0`
- pnpm `>= 9.0.0`

### Installation

```bash
# Clone and install dependencies
git clone https://github.com/yuvadevlab/chaos-doctor.git incidentai
cd incidentai
pnpm install
```

### Build & Validate

```bash
# Typecheck TypeScript sources
pnpm typecheck

# Build CLI binary
pnpm build

# Run interactive simulation demo
pnpm demo
```

---

## 💻 CLI Commands

```bash
# Run complete end-to-end incident drill simulation
pnpm run dev demo

# Ingest and triage an active incident
pnpm run dev triage --severity p1_critical --source "api-gateway"

# View incident timeline and postmortems
pnpm run dev postmortem --incident-id inc_demo_101
```

---

## 📁 Repository Structure

```
incidentai/
├── .agents/                    # Specialized AI agent role definitions & guidelines
│   ├── agents/                 # Commander, Diagnostician, Remediator, Scribe
│   └── rules/                  # Core invariants and 250-line rulebook
├── .husky/                     # Git hooks (pre-commit format & commit-msg commitlint)
├── .vscode/                    # VS Code editor settings, watchers, and extensions
├── dist/                       # Compiled production JavaScript bundle
├── src/                        # Clean TypeScript architecture source files
│   ├── cli.ts                  # Commander CLI entrypoint
│   ├── constants/              # System constants and enum definitions
│   ├── fsm/                    # Deterministic Incident Finite State Machine
│   ├── diagnosis/              # Forensics, log clustering, and hypothesis engine
│   ├── sandbox/                # Isolated execution runner and dry-run validator
│   ├── repair/                 # Remediation plan synthesis and action dispatch
│   └── postmortem/             # SRE timeline reconstruction and report compiler
├── commitlint.config.ts        # Conventional commits configuration
├── package.json                # Project manifest and npm scripts
└── tsconfig.json               # Strict TypeScript configuration
```

---

## 📜 Development Guidelines

- **250-Line Maximum Rule**: Every source file in `src/` must remain under 250 lines of code.
- **Conventional Commits**: Every commit message must follow `<type>(<scope>): <subject>` format.
- **Zero Hallucination Remediation**: All mitigation scripts must undergo dry-run execution in sandboxed environments.
