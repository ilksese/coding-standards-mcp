# Repository guidance

## Runtime and boundaries

- Requires Node.js >= 22.18.0. Node runs `src/index.ts` directly with native TypeScript type stripping; there is no build step or `dist/` output.
- Keep local imports ending in `.ts` and use erasable TypeScript only: no JSX, enums, parameter properties, or path aliases at runtime.
- `src/index.ts` owns the stdio transport, `src/server.ts` owns MCP metadata and tool registration, and `src/standards.ts` owns project discovery and document loading.
- Stdout is reserved for the MCP protocol. Send diagnostics to stderr; a manually started server waits silently for protocol input.

## Standards behavior

- Standards are English Markdown runtime data: `standards/common.md` plus a direct regular file at `standards/projects/<exact-project-name>.md`. There is no registry, language directory, recursive discovery, or symlink support.
- Every query re-reads the directory and applicable documents. An unknown project returns the common document verbatim; any required document's read failure becomes an MCP tool error.
- Preserve both documents verbatim in the response. Project overrides are instructions for the consumer; the server does not parse, merge, or resolve conflicting rules.
- Keep `README.md` user-facing: use placeholder project names and never list or demonstrate a real registered project name.

## Change traps

- Shared rules for `kassadin-web`, `chogath-web`, `ksante-web`, and `smolder-web` live only in `standards/projects/seamaid-web.md`. That file is a required family layer, not a queryable project. A member project file is optional and holds only that project's overrides. Adding a project to the family requires an explicit edit to the fixed member list in `src/standards.ts`.
- MCP server metadata, instructions, tool descriptions, and schema text in `src/server.ts` must remain English; tests reject Han characters there.
- `get_coding_standards` intentionally has one required argument, `projectName`. Keep exact, case-sensitive matching and do not restore `lang` or legacy directory fallback.
- The stdio integration test reads the real `standards/` files and asserts selected rule text; run the full suite after changing standards, not only loader unit tests.

## Commands

- Install: `pnpm install --frozen-lockfile`
- Start: `node src/index.ts` or `pnpm --silent start`
- Full test suite: `pnpm test`
- One test file: `node --test tests/standards.test.ts`
- One named test: `node --test --test-name-pattern='<substring>' tests/standards.test.ts`
- Format changed files: `npx prettier --write <files>`
- Final format check: `pnpm format:check`
