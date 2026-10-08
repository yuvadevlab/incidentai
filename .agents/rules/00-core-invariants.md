# Core Invariants — IncidentAI

1. **250-Line Limit**: Every single file must stay strictly under 250 lines of code.
2. **State Machine Invariants**: Enforce valid transitions in IncidentFSM. Never skip states.
3. **Self-Correction Guardrails**: Max 4 repair attempts per incident; capture stderr and feed into LLM prompt; verify tests return 0 before proposing PR.
4. **Strict TypeScript**: Zero `any` casts. Validate all external inputs with Zod schemas.
