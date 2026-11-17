# Contributing

Thanks for taking the time to improve Stirling PDF UI Components. This project values a calm,
predictable API and a high bar for interaction detail over a large surface area.

## Setup

```bash
pnpm install
pnpm dev          # Storybook at http://localhost:6006
pnpm typecheck
pnpm test
```

Requires Node 22.13+ and pnpm 10.

## What belongs here

This library owns **presentation and local interaction** for PDF workflows. It does not implement
PDF processing. A component should:

- collect a valid request payload, or
- display a document/result, or
- provide a reusable interaction (selection, reordering, previewing).

Compression, OCR, merging, encryption, and conversion are performed by your backend or SDK. The
components emit the options; they never pretend to process a file.

## Component conventions

- Use Vue 3 `<script setup lang="ts">` and the Composition API.
- Put the `spdf` class on every component root. Portaled content needs it too.
- Use semantic tokens (`bg-background`, `text-muted-foreground`, `border-border`, …). Do not add raw
  colors except for document content that must not follow the theme.
- Use the shared primitives in `src/components/ui` before introducing a new one.
- Accept a `class` prop and merge it with `cn()`.
- Support `v-model` with `defineModel` where the component owns a value.
- Type every public prop and event. Export public interfaces from `src/index.ts`.
- Do not import `pdfjs-dist` directly in a component. Use `src/lib/pdf.ts` and the composables.
- Do not leak global styles. The shipped reset is scoped to `.spdf`.

### Accessibility checklist

- Every interactive element is reachable by keyboard.
- Icon-only buttons have an `aria-label`.
- Toggles expose `aria-pressed`, `aria-checked`, or the correct role.
- Focus is visible and never trapped outside a dialog.
- Errors are announced (`role="alert"`) and connected with `aria-describedby`.
- Motion respects `prefers-reduced-motion`.
- Test the story with the Storybook a11y panel and with the keyboard only.

### Story requirements

Every exported component gets a co-located `*.stories.ts` file with:

1. A realistic default story using the sample PDFs in `public/samples`.
2. At least one edge state: loading, error, empty, disabled, or selected.
3. A docs description that explains when to use it.
4. `tags: ['autodocs']` and typed args.

Stories should never depend on a network request other than the static sample files.

### Tests

Add unit tests for pure logic (parsing, selection, formatting) and component tests for behavior
that is easy to regress: emitted values, validation, and keyboard interactions. Run:

```bash
pnpm test
pnpm typecheck
```

## Pull requests

- Keep changes focused. One component or one behavior per PR is ideal.
- Include a story and tests with behavior changes.
- Update the README component table when adding or renaming an export.
- Run `pnpm build` and `pnpm build:storybook` before opening the PR.
- Describe the user problem, the chosen interaction, and anything you deliberately did not do.

There is no CI. Reviewers run the same local commands.

## Commit messages

Short, imperative, and scoped when useful:

```text
feat(viewer): add fit-page mode
fix(organizer): keep selection after reorder
docs: document the PDF.js worker setup
```

## License

By contributing, you agree that your contribution is licensed under the MIT license.
