# Global Coding Standards

- The new component must include JSDoc description comments to explain the component's purpose.
- Long processes must have clear comments at the decision nodes.
- Do not write comments that merely restate simple, obvious code. Delete comments that only narrate what the next line already says.
- Keep comments that explain why, non-obvious behavior, protocol or external constraints, and `[HACK]` notes.
- Any code utilizing hacks, workarounds, or non-intuitive logic must be thoroughly commented. The comments should explicitly state:

  1. The ‌rationale‌ behind choosing this approach over standard methods.
  2. The ‌specific problem‌ it solves.
  3. Any ‌known limitations‌ or side effects.

     ```javascript
     // example
     // [HACK] Reason: <Briefly explain why standard methods failed>
     // Solution: <Briefly explain the core logic of the current approach>
     // Risk: <Briefly explain potential maintenance pitfalls>
     // Track: <Related Ticket or discussion link>
     ```

- When implementing a feature, prefer a library already in the project, or a suitable third-party library, over a custom implementation. Building it yourself is too costly unless no suitable library exists.

## Think Before Coding

- State assumptions explicitly. If requirements are ambiguous or multiple interpretations would lead to different implementations, ask for clarification instead of silently choosing one.
- Read the relevant existing code before making changes. Surface tradeoffs and simpler alternatives; do not hide uncertainty or make consequential decisions on the user's behalf.

## Simplicity First

- Write the smallest amount of code that fully solves the requested problem. Do not add speculative features, abstractions, configuration, or flexibility for hypothetical future needs.
- Don't optimize code too early. Do not overengineer or proactively expand security boundaries before a real problem is encountered or a user reports a vulnerability. Preserve existing security safeguards and required validation.

## Surgical Changes

- Change only what the task requires. Do not refactor unrelated code, reformat surrounding files, or fix unrelated issues without permission.
- Match the existing style and conventions. Remove imports, variables, or helpers made unused by your own changes, but leave unrelated pre-existing cleanup for a separate task.

## Git

- When preparing a `git commit`, exclude test files and Markdown files by default; keep new files of these types untracked. Include them only if they were both already tracked by Git and already staged before preparing the commit. Do not stage them just to satisfy these conditions. Files named exactly `README.md` or `AGENTS.md`, and Markdown files under a `docs/` directory (including nested subdirectories), are exempt from the Markdown exclusion and may be staged and committed normally, subject to the `AGENTS.md` section rule below.
- When committing `AGENTS.md`, exclude the entire `## Agent skills` section, including its heading and all content up to the next level-one or level-two heading or the end of the file. Keep this section in the working-tree file; omit it from the staged version, even if it was already staged. Other sections may be committed normally.
- Never commit log files to Git. Keep them untracked.
- Do not run `git push` unless the user has explicitly approved the push.

## Documentation Sync

- Sync documentation on demand. Update it only when your change makes an existing description, example, or link inaccurate, or when it changes how users or maintainers must operate the project. Update only the directly related passages, within the same change.
- Leave Markdown untouched for internal refactoring, equivalent syntax rewrites, and tool configuration changes that do not alter how the project is used.
- Record only long-term conventions in `AGENTS.md` that code, configuration, or automated checks cannot express adequately. Do not restate existing lint rules, configuration values, or implementation details there.
- Describe the latest implemented codebase in the present tense. Replace or remove stale descriptions, paths, and references instead of appending correction notes.
- Documentation must not retain or introduce obsolete logic, migration narratives, or intermediate implementation states. Keep descriptions consistent across documents and verify referenced paths and symbols against the current code.

## Documentation Rules & Progressive Disclosure

1. **Boundary Enforcement**:
   - `README.md` is strictly for end-users and product overview (what it is, quickstart, basic usage). Never put internal architecture notes, implementation details, or agent instructions there.
   - `AGENTS.md` is strictly a concise routing map and hard-constraint index for AI agents. Keep it brief; do not dump full feature specs or long troubleshooting logs here.
   - Put detailed feature docs, workflows, schemas, and troubleshooting guides under `docs/` as separate Markdown files (`docs/<feature-or-topic>.md`), split by independent, low-coupling capabilities.

2. **Progressive Disclosure (Read on Demand)**:
   - Do not load all files in `docs/` upfront. Only read the specific `docs/*.md` file relevant to the current task.
   - When a new independent feature or subsystem is introduced, create a dedicated `docs/<name>.md` file instead of appending to `README.md` or `AGENTS.md`, and add a one-line entry in the Docs Index below.

3. **Docs Index (Load Only When Needed)**:
   - `docs/architecture.md`: System layout and cross-module boundaries.
   - `docs/testing.md`: Test commands, fixtures, and verification workflow.
   - `docs/<feature>.md`: Specific feature behavior, edge cases, and contracts.

## Goal-Driven Execution

- When the user says only “收尾”, perform requirement closeout: verify acceptance criteria and ticket completion, synchronize maintained documentation, review whether ADRs remain valid, archive completed local specs and tickets, and repair affected references. Retain valid ADRs and keep specs and plans out of Git.
- As part of closeout, delete every file and folder the task created in the system's temporary directories to free disk space. Resolve the location per platform: `TMPDIR`/`/tmp` (Linux and macOS), `%TEMP%`/`%TMP%` (Windows), or the harness-assigned session temp directory. Only remove artifacts this task created; never delete temp files owned by other sessions or processes.
- Translate the request into observable success criteria before implementing it. For multi-step work, pair each step with a concrete verification check.
- Verify behavior rather than assuming that a code change is sufficient. For bug fixes, reproduce the failure and verify the fix; for other changes, run the relevant tests or checks.

### User-Triggerability Gate

- A code review finding must identify a concrete user-accessible entry point and a reproducible action sequence before it is reported as a bug.
- Verify the behavior through the normal product entry point whenever the environment supports it. Record the route, user state, actions, observed result, and evidence.
- If no user-accessible trigger can be established, do not report the issue as a bug or assign a severity level. Record it separately as an unverified code risk only when it could affect future behavior or become reachable through a plausible product flow.
- Do not infer user reachability from a static state transition, an internal prop change, or a theoretical component lifecycle. Confirm that the relevant component lifecycle can occur through ordinary user actions.
- Every finding must include Trigger, Reproduction, Observed impact, and Evidence. Findings missing any of these fields must remain unconfirmed and must not appear in the bug findings list.
- Report what was verified, what could not be checked, and any remaining limitations. Do not claim success beyond the available evidence.

## Image Data Mocking

- Use [Placehold](https://placehold.co/) for mock image URLs when real assets are unavailable. Match the intended image dimensions and aspect ratio.
- Specify dimensions as `https://placehold.co/600x400`; a single value such as `/400` creates a square. Supported dimensions range from 10 to 4000 pixels per side.
- The default format is SVG. Specify `.png`, `.jpeg`, `.gif`, `.webp`, or `.avif` when a raster format is needed, for example `https://placehold.co/600x400.png`.
- Set background and text colors together using hex values or CSS color names: `https://placehold.co/600x400/eeeeee/333333.png`. Use `transparent` for a transparent background.
- Add descriptive text with `?text=Product+Image`; encode spaces as `+` and line breaks as `%5Cn`. Without custom text, the image displays its dimensions. An optional `font` query parameter selects a supported font; the default is Lato.
- For high-density raster images, append `@2x` or `@3x` to the size before the extension, for example `https://placehold.co/600x400@2x.png?text=Product+Image`. Retina variants are not supported for SVG.
- In Next.js projects using `next/image`, add `{ protocol: "https", hostname: "placehold.co", port: "", pathname: "/**" }` to `images.remotePatterns` in the existing `next.config.*` configuration, preserving other entries. Omit `search` to allow mock URLs with query parameters such as `text` and `font`; `search: ""` blocks them. Prefer a raster format such as `.png` rather than enabling SVG optimization for placeholders.
