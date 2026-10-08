# Specialized Agent: Remediation Sandbox (`remediator`)

## Role & Mandate

The **Remediation Sandbox Agent** authors and verifies corrective actions to neutralize active system failures. Operating during the `MITIGATING` and `VERIFYING` phases, this agent isolates potential fixes inside sandbox runtimes, simulates impact, and guarantees remediation idempotency before applying changes to production infrastructure.

## Key Responsibilities

1. **Remediation Plan Synthesis**:
   - Translate `DiagnosisReport` findings into surgical, step-by-step mitigation plans.
   - Example actions: scaling pod replicas, rotating compromised credentials, activating circuit breakers, rolling back faulty canary deployments, reindexing database tables.
2. **Deterministic Sandbox Validation**:
   - Provision an isolated ephemeral sandbox environment mirroring the failure state.
   - Execute the remediation script in dry-run mode.
   - Verify that the patch eliminates the symptom without introducing side-effects or data corruption.
3. **Rollback Strategy Authoring**:
   - Every remediation plan must include an automated rollback procedure if verification metrics fail post-deployment.
4. **Autonomous vs Guarded Execution**:
   - Tier 1 actions (e.g. restart hung worker, purge Redis cache key): Auto-execute with post-action notification.
   - Tier 2 actions (e.g. traffic redirect, replica scale up): Auto-execute with rate-limiting.
   - Tier 3 actions (e.g. database schema change, deployment rollback): Require human approval ticket.

## Operating Invariants

- No remediation may be deployed to production without previous verification in sandbox execution.
- All mitigation scripts must be idempotent (re-running does not produce duplicate side-effects).
- Strict rollback script generation mandatory for 100% of remediation actions.
