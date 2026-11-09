# Repository guidance

## Runtime and boundaries

- Requires Node.js >= 22.18.0. Node runs `src/index.ts` directly with native TypeScript type stripping; there is no build step or `dist/` output.
- Keep local imports ending in `.ts` and use erasable TypeScript only: no JSX, enums, parameter properties, or path aliases at runtime.
- `src/index.ts` owns the stdio transport, `src/server.ts` owns MCP metadata and tool registration, and `src/standards.ts` owns project discovery and document loading.
- Stdout is reserved for the MCP protocol. Send diagnostics to stderr; a manually started server waits silently for protocol input.

## Standards behavior

- Standards are English Markdown runtime data: `standards/common.md` plus a direct regular file at `standards/projects/<exact-project-name>.md`. There is no registry, language directory, fallback, recursive discovery, or symlink support.
- Every query re-reads the directory and both documents. An unknown project returns `""` without reading the common document; a registered project's read failure becomes an MCP tool error.
- Preserve both documents verbatim in the response. Project overrides are instructions for the consumer; the server does not parse, merge, or resolve conflicting rules.
- Keep `README.md` user-facing: use placeholder project names and never list or demonstrate a real registered project name.

## Change traps

- Keep `standards/projects/chogath-web.md`, `standards/projects/smolder-web.md`, `standards/projects/kassadin-web.md`, and `standards/projects/ksante-web.md` byte-for-byte identical, including headings, whitespace, and final newlines. Any edit to one requires updating the other three in the same change. Use a shared, project-neutral heading and verify all four files are byte-for-byte identical before completing the task.
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
