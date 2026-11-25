# Seamaid Web Family Standards (Between Global and Project Standards)

## Technology Stack

- Use Next.js 15, React 19, and TypeScript.
- Style UI with Tailwind CSS v3 utility classes. Do not upgrade to Tailwind CSS v4 or introduce another styling system.
- Do not use CSS Modules. Do not add or import `*.module.css` or `*.module.scss` files, and do not enable `cssModules`.

## Browser Compatibility

- The lowest browser version the product must support is Chrome 88.
- Do not use a DOM API, Browser API, or CSS feature that Chrome 88 does not support. This includes a property, method, event, selector, at-rule, function, or value that exists only in a later Chrome version.
- TypeScript types, a newer TypeScript `lib`, MDN, Baseline, or the Chrome version installed on the current machine do not raise this floor. If Chrome 88 support is uncertain, do not use the API or CSS feature.
- A Tailwind CSS v3 utility, arbitrary value, or arbitrary property is allowed only when the CSS it emits is supported in Chrome 88.
- Do not add a polyfill, ponyfill, or PostCSS plugin to make an unsupported DOM API, Browser API, or CSS feature available.
- This ban does not forbid JavaScript syntax that the project's existing compiler already downlevels. That syntax transform is not permission to call an unsupported runtime API or to emit unsupported CSS.

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

- Running the lint check is the first step of the pull request (PR) flow, before any other PR step: run `zsh -lic 'ci lint --base <ref>'`.
- `--base <ref>` is an optional argument of the lint command, but the PR flow requires it by default: ask the developer which base ref to compare against before running the check. Skip asking only when the developer has already specified the base ref earlier in the same task, and reuse that value.
- If the check reports problems, fix them and re-run the check until it passes; do not continue the PR flow until then.
- Code review is mandatory for the fixed code: review every change produced by lint auto-fix or by manual fixes before continuing the PR flow, and confirm each change stays within lint, formatting, and type-safety scope without breaking the task's acceptance goal (requested behavior, delivered features, and already verified acceptance criteria).
- If a fix goes beyond formatting or risks breaking the acceptance goal, revert that change and replace it with the minimal change that keeps the acceptance goal intact, then re-run the lint check.
- Only an explicit developer reply of `强制提交` ("force submit") bypasses this lint gate for the current PR.
- After the lint check reports no problems, pause the PR creation workflow and ask the developer to manually check that the version number is correct and whether the static branch needs to be synchronized.
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
- The lowest browser version the product must support is Chrome 88, as defined in Browser Compatibility. That floor is a compatibility requirement, not a browser build to install for the test run.
- When using playwright-cli, do not download any additional browser version. Do not install Playwright's bundled Chromium, Chrome 88, or any other browser build, and do not run browser install commands such as `playwright install`.
- Launch the Chrome already installed on the system, for example `playwright-cli open --browser=chrome`, or a local playwright-cli config whose `browser.launchOptions.channel` is `chrome`. Do not use `--browser=chromium`.
- If system Chrome is not installed, stop and ask the user. Do not install a browser in order to continue.
