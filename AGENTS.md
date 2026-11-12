# IncidentAI Agent Guidelines

Master guidelines for AI agents developing on **IncidentAI (Autonomous AI Site Reliability Engineer & Self-Healing Incident Commander)**.

All agents must adhere to:

0. **Zero Commits Without Explicit Confirmation (CRITICAL)**:
   - NEVER execute `git commit`, `git push`, or open pull requests in ANY repository unless the user explicitly commands it in the current turn (e.g. "commit these changes", "commit and push").
   - Directives like "start", "proceed", "fix this", "implement", "build", or "test" authorize implementation, building, and running tests ONLY.
   - Always leave changes staged or in the working tree, present verification results, and wait for confirmation.
1. **Organization Standards & `.github` Inheritance**:
   - Standardize all author and committer attribution to `yuva.devlab@gmail.com`.
   - Branch naming must strictly follow: `^(feat|fix|refactor|perf|chore|docs|test|ci|hotfix)/[a-z0-9-]+$`.
   - PR descriptions must adhere to the 5-section high-signal standard defined in `yuvadevlab/.github` (Summary, Changes, How to Test, Proof of Verification, Risks).
   - Commits must conform to Conventional Commits: `<type>(<optional-scope>): <imperative summary>`.
2. **Pure Platform CSS & Design Tokens**:
   - Utility-first CSS frameworks are prohibited. All styling is implemented using pure platform CSS, W3C Cascade Layers (`@layer dl-*`), and design tokens from `@yuva-devlab/tokens`.
3. **Hard 250-Line Maximum Rule**: No file in `src/` may exceed 250 lines. Decompose early at 200 lines.
4. **Detailed JSDoc & Explanatory Comments**: Every exported symbol and state transition must have clear comments.
5. **Strict Database & Enum Casing**: Lowercase `snake_case` for all canonical statuses (`p1_critical`, `idle`, `alert_detected`, etc.).
6. **Sandboxed Isolation**: Any experimental patch execution must be isolated in sandboxes with timeouts.
7. **Quality Gates & Conventional Commits**: Commits must pass husky commitlint (`feat(scope): ...`).
8. **Strict `UI_COPY` Centralization Invariant (Zero Exceptions)**:
   - ALL user-facing text (labels, headers, button text, placeholders, empty states, error messages, toast copy, and dialog descriptions) MUST be centralized in `ui-copy/` dictionaries.
   - Direct raw hardcoded strings in CLI/web components are strictly prohibited.
