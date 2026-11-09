# Project-Level Coding Standards (Take Precedence over Global Coding Standards)

## Internationalization

### Translation Calls

- Call `useTranslation` without namespaces.
- For fixed translation keys, do not use a ternary expression inside `t`. Instead, put the condition outside `t` so each call has a literal key.

#### Incorrect

```tsx
// Incorrect: passes a namespace and selects a fixed key inside t.
const { t } = useTranslation("common");
const label = t(isEditing ? "save" : "confirm");
```

#### Correct

```tsx
// Correct: no namespace; each t call uses a literal key.
const { t } = useTranslation();
const label = isEditing ? t("common.save") : t("common.confirm");
```

### Translation Placement

- Define commonly used basic words and phrases in the `common` translation module and reuse them from there. Define business-specific sentences in the relevant page namespace.

#### Incorrect

Business-specific sentences are placed in `common`, while reusable basic words are duplicated in the page namespace that consumes them.

```json
{
  "common": {
    "tip": "Only showing today's call history."
  },
  "CallRecordPage": {
    "save": "Save",
    "cancel": "Cancel"
  }
}
```

#### Correct

Reusable basic words live in `common`, while the business-specific sentence stays in the page namespace that owns the workflow.

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel"
  },
  "CallRecordPage": {
    "tip": "Only showing today's call history."
  }
}
```

## State Management

- Apply these rules to every new requirement and all newly written code.
- Do not modify existing legacy state-management logic solely to make it comply with these rules. Apply these rules to legacy code only when the user explicitly requests its optimization or refactoring.
- Manage all globally shared server state with TanStack Query's `useQuery`.
- Use Zustand for globally shared client-side business state, not as the owner of server state.
- Never initiate network requests directly from a global Zustand store.
- When server state also requires local persistence, encapsulate the integration in a custom React hook that combines `useQuery` with a Zustand store. The hook must obtain server state and request lifecycle from `useQuery`, while globally shared business state and locally persisted state come from the Zustand store. Do not move the request into the store or make the store authoritative for server state.

## Component Organization

- All component extraction and placement must prioritize **high cohesion and low coupling**. Extract a component only when it forms a meaningful, cohesive unit with clear boundaries; do not split components merely for the sake of splitting.
- Aim to keep each individual `.tsx` component within 500 lines of code. This is a guideline, not a hard limit: **high cohesion and low coupling** remain the sole guiding objective. Exceeding 500 lines is acceptable when splitting would undermine that objective; never split a component solely to meet the line-count target.
- Place all foundational, atomic UI components in `apps/web/components/ui-design`, regardless of how many pages currently use them.
- Place non-atomic components used by two or more pages in `apps/web/components`.
- Place components used by only one page in the `_components` directory under that page's route. For example, components used only by the `/account` page belong in `apps/web/app/[locale]/account/_components`.
