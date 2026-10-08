# IncidentAI Agent Guidelines

Master guidelines for AI agents developing on **IncidentAI (Autonomous AI Site Reliability Engineer & Self-Healing Incident Commander)**.

All agents must adhere to:

1. **Hard 250-Line Maximum Rule**: No file in `src/` may exceed 250 lines. Decompose early at 200 lines.
2. **Detailed JSDoc & Explanatory Comments**: Every exported symbol and state transition must have clear comments.
3. **Strict Database & Enum Casing**: Lowercase `snake_case` for all canonical statuses (`p1_critical`, `idle`, `alert_detected`, etc.).
4. **Sandboxed Isolation**: Any experimental patch execution must be isolated in sandboxes with timeouts.
5. **Quality Gates & Conventional Commits**: Commits must pass husky commitlint (`feat(scope): ...`).
