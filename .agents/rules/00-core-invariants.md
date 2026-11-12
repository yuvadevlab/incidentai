# Core Invariants — IncidentAI

## 0. Strict Git Commit & Push Restriction (CRITICAL)

- **NEVER** run `git commit`, `git push`, or create pull requests without explicit, affirmative user authorization in the current turn.
- General task triggers like "start", "proceed", or "fix" authorize code authoring, linting, and testing ONLY.
- Changes must remain in the working tree or staging until the user explicitly commands to commit.

## 1. 250-Line Limit

- Every single file must stay strictly under 250 lines of code. Deconstruct early at 200 lines.

## 2. Organization Standards & .github Inheritance

- **Attribution**: Author and committer metadata standardized to `yuva.devlab@gmail.com`.
- **Branch Naming**: Must strictly follow: `^(feat|fix|refactor|perf|chore|docs|test|ci|hotfix)/[a-z0-9-]+$`.
- **Pull Requests**: Must conform to the 5-section high-signal template in `yuvadevlab/.github` (Summary, Changes, How to Test, Proof of Verification, Risks).
- **Conventional Commits**: `<type>(<optional-scope>): <imperative summary>`.
- **Pure Platform CSS**: Zero references to legacy utility-first CSS frameworks across codebase, comments, or documentation.

## 3. State Machine Invariants

- Enforce valid transitions in IncidentFSM. Never skip states.

## 4. Self-Correction Guardrails

- Max 4 repair attempts per incident; capture stderr and feed into LLM prompt; verify tests return 0 before proposing PR.

## 5. Strict TypeScript

- Zero `any` casts. Validate all external inputs with Zod schemas.

## 6. Enums Over Raw String Unions & URL Key Centralization

- Prefer TypeScript `enum`s or `as const` object dictionaries with mapped types over raw string literal unions (`"dev" | "prod"`). Updating an underlying string value only requires modifying the enum definition.
- Never hardcode raw query parameter strings or fragments like `"?redirect="` or `searchParams.get("token")`. Use centralized enums/constants and construct URLs via `URLSearchParams`.

## 7. Environment Isolation

- Shared NPM packages must never access `process.env`. The consumer application is responsible for managing its environment and passing URLs, credentials, or flags via props/options.

## 8. Semantic Component Architecture & 90/10 Hybrid Styling Standard

- **Semantic Component Styling First (90%)**: All UI components must declare purpose-revealing semantic classes (e.g. `.dl-card`, `.incident-card`, `.dl-table`) defined in domain-scoped modular stylesheets (`< 200 lines`, strictly `< 250 lines`) under `@layer dl-components`.
- **Zero Utility Soup in Markup**: Constructing UI components via long chains of atomic utility classes in JSX (`className="class-1 class-2 class-3..."`) is strictly prohibited. All element-level layout, padding, background, border, and visual styles must be encapsulated in the component's CSS rule.
- **Macro Layout Glue Only (10%)**: Utility classes (`@layer dl-utilities`) are strictly reserved for one-off macro page layout orchestration (e.g., page grid wrappers `.dl-grid`, responsive column switches `.md:grid-cols-2`, visibility toggles `.hidden`, and inter-component margins `.mt-6`).
- **Component-Scoped CSS Custom Properties**: Style variations, accent colors, and dynamic sizes must be parameterized through component-scoped CSS variables mapped to `@yuva-devlab/tokens`.
