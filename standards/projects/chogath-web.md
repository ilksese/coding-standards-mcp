# Project-Level Coding Standards (Take Precedence over Global Coding Standards)

## UI Copy Precedence

- When UI copy in Figma designs conflicts with the product requirements document (PRD), use the copy from the PRD.

## Backend API Generation

- Backend API interfaces are dynamically generated into the `.heimdall` directory by running `pnpm run codegen`.
- The generated APIs are already mapped in `tsconfig.json` with the following aliases:
  - `@imf/heimdall-ts/api/*` maps to `heimdall/http/*`.
  - `@imf/heimdall-ts/api` maps to `.heimdall/index.ts`.

## Backend API Mocking

- Mock backend API responses through custom React hooks, using `setTimeout` to simulate asynchronous server latency and Mock.js to generate response data. Match the expected backend response structure.

## Code Formatting

- Changes outside the task scope caused by code formatting tools do not need to be reverted.

## Pull Request Prerequisites

- Before creating any pull request (PR), pause the PR creation workflow and ask the developer to manually check that the version number is correct and whether the static branch needs to be synchronized.
- Resume the PR creation workflow only after the developer explicitly replies `继续` ("continue"). Until then, remain paused and do not create the PR.

## Cross-Repository Access

- Treat repositories other than the current task's repository as read-only by default.
- Cross-repository writes require the user's explicit prior permission. If permission has not been granted, pause and ask the user before writing to another repository.

## Device-Specific Routing

- Next.js server middleware inspects the client's `User-Agent` request header and automatically serves mobile or desktop HTML. Use request URLs without `/m` or `/pc` route segments.
- This also applies when visiting pages with browser automation tools for regression testing: use URLs without `/m` or `/pc` route segments and configure the browser's `User-Agent` for the target device. Changing only the viewport does not select the mobile or desktop HTML.

## Regression Testing

- Use playwright-cli for regression testing.
- Use a mobile `User-Agent` by default for regression testing.
