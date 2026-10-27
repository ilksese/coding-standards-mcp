# spammer-web Coding Standards

## Internationalization

- Call `useTranslation` without namespaces.
- For fixed translation keys, do not use a ternary expression inside `t`. Instead, put the condition outside `t` so each call has a literal key.

### Incorrect

```tsx
// Incorrect: passes a namespace and selects a fixed key inside t.
const { t } = useTranslation("common");
const label = t(isEditing ? "actions.save" : "actions.create");
```

### Correct

```tsx
// Correct: no namespace; each t call uses a literal key.
const { t } = useTranslation();
const label = isEditing ? t("actions.save") : t("actions.create");
```

## Component Organization

- All component extraction and placement must prioritize **high cohesion and low coupling**. Extract a component only when it forms a meaningful, cohesive unit with clear boundaries; do not split components merely for the sake of splitting.
- Aim to keep each individual `.tsx` component within 500 lines of code. This is a guideline, not a hard limit: **high cohesion and low coupling** remain the sole guiding objective. Exceeding 500 lines is acceptable when splitting would undermine that objective; never split a component solely to meet the line-count target.
- Place all foundational, atomic UI components in `apps/web/components/ui-design`, regardless of how many pages currently use them.
- Place non-atomic components used by two or more pages in `apps/web/components`.
- Place components used by only one page in the `_components` directory under that page's route. For example, components used only by the `/account` page belong in `apps/web/app/[locale]/account/_components`.
