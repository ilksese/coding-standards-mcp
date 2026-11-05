# Coding Standards

- The new component must include JSDoc description comments to explain the component's purpose.
- Long processes must have clear comments at the decision nodes.
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

- Don't optimize code too early.
- Do not overengineer or proactively expand security boundaries before a real problem is encountered or a user reports a vulnerability.
- When implementing a feature, prefer a library already in the project, or a suitable third-party library, over a custom implementation. Building it yourself is too costly unless no suitable library exists.
