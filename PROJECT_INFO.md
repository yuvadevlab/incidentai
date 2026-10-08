# IncidentAI — Deep Product & Technical Specification Dossier

## 1. Product Overview & Vision

### 1.1 The Operational Problem Space

In modern distributed cloud-native architectures (microservices, Kubernetes, multi-region database clusters, event meshes), downtime costs exceed $300,000 per hour for high-growth enterprises. Traditional incident response relies on fragmented alerts sent to human on-call engineers via PagerDuty or Opsgenie. Humans must wake up, log into fragmented dashboards (Datadog, Grafana, CloudWatch), sift through millions of log lines, manually speculate on root causes, and execute unverified commands under extreme pressure. This leads to extended Mean Time to Detect (MTTD) and Mean Time to Mitigate (MTTM), human error during triage, and recurring outages.

### 1.2 The IncidentAI Solution

IncidentAI is an **Autonomous AI Site Reliability Engineer and Self-Healing Incident Commander**. It transforms incident management from reactive human firefighting into deterministic, autonomous mitigation:

1. **Continuous Anomaly Ingestion**: Intercepts high-cardinality telemetry and error alerts from DevLab Logs and platform gateways.
2. **Deterministic State Machine (FSM)**: Governs the incident lifecycle via mathematical state transitions, eliminating chaotic or skipped investigation steps.
3. **Specialized Multi-Agent Swarm**: Deploys discrete, role-bounded agents (Commander, Diagnostician, Remediator, Scribe) with isolated authority.
4. **Sandboxed Dry-Run Execution**: Automatically authors remediation scripts and simulates them inside ephemeral sandbox runtimes before production execution.
5. **Human-in-the-Loop (HITL) Governance**: Enforces cryptographic sign-off for high-blast-radius operations, balancing autonomy with safety.
6. **Blameless SRE Retrospectives**: Reconstructs exact second-by-second timelines and compiles production postmortems within seconds of resolution.

---

## 2. Technical Stack & Architectural Rationale

### 2.1 Language Choice: TypeScript 5.8 (Node.js ESM)

- **Why TypeScript?**
  - **Contract-Driven Safety**: SRE systems execute dangerous infrastructure commands. TypeScript's strict type checker prevents null-pointer exceptions, missing parameters, and runtime type coercions that could trigger unintended cluster operations.
  - **Shared Domain Contracts**: Seamlessly shares schemas, enums, error contracts, and logging primitives with `@yuva-devlab/shared`, `@yuva-devlab/logger`, and the DevLab Portal.
  - **Async Event I/O**: High-concurrency non-blocking I/O ideal for polling multiple monitoring APIs, streaming logs, and coordinating agent workflows simultaneously.
- **Alternatives Considered**:
  - _Go_: Exceptional for low-level systems programming and daemons (used in `devlab-logs/agent`), but TypeScript offers superior JSON schema manipulation, dynamic agent prompt synthesis, and shared monorepo contracts with frontend interfaces.
  - _Python_: Popular for data science, but lacks the end-to-end compile-time contract guarantees and native monorepo workspace synergy with our web control plane.

### 2.2 Framework & Core Libraries

| Component               | Selection                                | Rationale                                                                                                                                |
| :---------------------- | :--------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| **CLI Runtime**         | `commander` (v13)                        | Enterprise-grade command-line parser with type-safe argument parsing, sub-command trees, and automatic help generation.                  |
| **Contract Validation** | `zod` (v3.24)                            | Runtime schema validation with TypeScript static inference. Validates all inbound alerts, telemetry envelopes, and remediation payloads. |
| **Execution Tooling**   | `tsx` + `esbuild`                        | Zero-bundle rapid execution during local development and testing without intermediate transpile steps.                                   |
| **Structured Logging**  | `@yuva-devlab/logger`                    | High-performance JSON logging with context correlation IDs, log level filtering, and trace propagation.                                  |
| **Git Hooks & Quality** | `husky` (v9) + `commitlint` + `prettier` | Guarantees 100% adherence to Conventional Commits and code formatting standards before commits touch source control.                     |

---

## 3. Structural & Architectural Design

### 3.1 Clean Domain-Driven Architecture

IncidentAI follows Clean Architecture principles with unidirectional inward dependencies:

```
src/
├── constants/       # Immutable domain primitives, status enums, severity scales
├── fsm/             # State machine engine, transition guards, event dispatchers
├── diagnosis/       # Trace correlation, log clustering, hypothesis ranking
├── sandbox/         # Ephemeral execution runners, security isolation, timeout monitors
├── repair/          # Remediation plan generators, idempotency verifiers, dispatchers
├── postmortem/      # Timeline aggregators, markdown compilers, SRE metrics engines
└── cli.ts           # Presentation layer / CLI command routing
```

### 3.2 Finite State Machine (FSM) Lifecycle

The Incident FSM guarantees that every failure is investigated and resolved systematically:

```
  [DETECTED] ──> [TRIAGING] ──> [DIAGNOSING] ──> [MITIGATING] ──> [VERIFYING] ──> [RESOLVED] ──> [POSTMORTEM]
      │              │               │                 │                │
      └──────────────┴───────────────┴─────────────────┴────────────────┴───> [ESCALATED / HITL]
```

- **DETECTED**: Ingestion of raw alert signal.
- **TRIAGING**: Severity classification (`p1_critical` to `p4_low`) and blast-radius estimation.
- **DIAGNOSING**: Anomaly isolation, log query execution, and hypothesis ranking.
- **MITIGATING**: Remediation plan generation and sandbox dry-run execution.
- **VERIFYING**: Automated post-mitigation health check and metric slope verification.
- **RESOLVED**: Confirmation of SLO restoration.
- **POSTMORTEM**: Automated timeline compilation, MTTD/MTTM computation, and retrospective publishing.

---

## 4. Security & Safety Model

1. **Zero-Hallucination Sandbox Verification**:
   - AI-generated remediation scripts are NEVER piped directly to production shells.
   - Scripts are executed inside isolated sandbox containers with resource quotas (CPU/Memory limits) and network boundaries.
2. **Tiered Authorization Rails**:
   - **Tier 1 (Read-Only / Safe)**: Cache purges, thread dumps, log extractions — Auto-executed.
   - **Tier 2 (Low Impact)**: Pod restarts, canary rerouting — Auto-executed with rate-limiting.
   - **Tier 3 (High Blast Radius)**: Traffic shifts, cluster drain, database rollbacks — Held for human approval token.
3. **Idempotency Guarantees**:
   - All mitigation commands must declare idempotency preconditions (e.g. `IF EXISTS`, state checks) to prevent double-execution side-effects during network retries.

---

## 5. Ecosystem Integration

- **`devlab-logs`**: Supplies streaming error logs, trace spans, and metric deviations via Kafka and DuckDB.
- **`devlab-portal`**: Renders real-time incident war-room UI, visualizes FSM transitions, and collects human approval signatures.
- **`devlab-guard`**: Scans auto-generated remediation code against AST governance policies before sandbox execution.
- **`orchestrai`**: Orchestrates autonomous background agent swarms and cognitive reasoning pipelines.
