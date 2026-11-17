# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses semantic versioning.

## [0.1.0] — 2026-11-17

The first public foundation.

### Added

- **Files:** `PdfDropzone`, `PdfFileCard`, `PdfFileList`
- **Viewer:** `PdfViewer`, `PdfViewerToolbar`, `PdfThumbnailSidebar`, `PdfPageCanvas`,
  `PdfSearchPanel`, `PdfDocumentInfo`
- **Pages:** `PdfThumbnail`, `PdfPageGrid`, `PdfPageOrganizer`, `PageRangeInput`,
  `PdfPositionPicker`
- **Tool UX:** `PdfToolCard`, `PdfToolGrid`, `PdfToolHeader`
- **Task panels:** `PdfMetadataForm`, `PdfPasswordForm`, `WatermarkSettings`,
  `PageNumberSettings`, `CompressionSettings`, `OcrSettings`, `SplitSettings`
- **Signing:** `SignaturePad`, `SignatureInput`
- **Feedback:** `PdfProcessingState`, `PdfResultPanel`
- **Primitives:** alert, badge, button, card, checkbox, dialog, empty state, field, input, kbd,
  label, popover, progress, radio group, scroll area, segmented control, select, separator, sheet,
  skeleton, slider, spinner, switch, tabs, textarea, tooltip
- Shared PDF.js document cache, password handling, search, text layer, and highlight helpers
- Page range parser with typographic dash support
- Storybook stories, docs, sample PDFs, and a buildable Vite example
- MIT license and GitHub project templates
- `PdfViewer` accepts a `password` prop and emits `unlocked`, so document info, thumbnails, and the
  page organizer can share an open password entered in the viewer dialog.
- `PDF_POSITIONS`, `clampPercent`, `TrimCanvasOptions`, and `ButtonVariants` are exported.
- `SpdfUiPlugin` / `provideSpdfUi` let a shadcn host substitute its own Button, Input, Textarea,
  Checkbox, Switch, Slider, Badge, Skeleton, and Spinner, plus class recipes for native controls and
  overlay skins.
- `@mheers/stirling-pdf-ui-components/core` is an engine-free entry for apps that already render
  PDFs elsewhere. `pdfjs-dist` is an optional peer and is never loaded by `/core`.

### Changed

- Reka UI, Lucide, `clsx`, `tailwind-merge`, and `class-variance-authority` are externalized peers,
  so a shadcn-vue host keeps one copy of each. The published JavaScript is ~260 kB (61 kB gzip) and
  a single-component import is ~4–5 kB.
- Theme fallbacks live in the lowest `theme` layer with zero specificity, and Tailwind's default
  theme selectors are rewritten the same way. Host shadcn tokens win regardless of CSS import order.
- Icons use the current `@lucide/vue` package instead of the deprecated `lucide-vue-next`.

### Fixed

- `PdfPageGrid` keeps its range anchor across repeated shift-clicks.
- `SplitSettings` generates `1-3` filenames instead of `1, 3`, and single-page chunks use `1` rather
  than `1-1`.
- `searchPdfDocument` reports truncation when the per-page cap hides further matches.
- `PdfPageOrganizer` no longer mutates while disabled (undo, redo, keyboard shortcuts, handles, and
  delete buttons), rotates the blank-page aspect ratio, and shows a password warning.
- `PdfPositionPicker`, `RadioGroup`, `Tabs`, and segmented controls gained disabled and roving-focus
  fixes; several form labels are now correctly associated with their inputs.
- Signature capture displays and replaces an externally restored signature correctly.
- `formatBytes` handles values below one byte, and `truncateMiddle` respects tiny length budgets.
- Viewer search cannot repopulate a closed panel, fullscreen failures are contained, and lazy
  rendering falls back when `IntersectionObserver` is unavailable.
- `PdfProcessingState` uses a neutral icon for its idle state.

[0.1.0]: https://github.com/mheers/stirling-pdf-ui-components/releases/tag/v0.1.0
