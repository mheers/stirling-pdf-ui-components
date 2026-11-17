import './styles/index.css';

// UI primitives
export { default as Alert } from './components/ui/Alert.vue';
export { default as Badge } from './components/ui/Badge.vue';
export { default as Button } from './components/ui/Button.vue';
export { buttonVariants } from './components/ui/button-variants';
export { default as Card } from './components/ui/Card.vue';
export { default as CardContent } from './components/ui/CardContent.vue';
export { default as CardDescription } from './components/ui/CardDescription.vue';
export { default as CardFooter } from './components/ui/CardFooter.vue';
export { default as CardHeader } from './components/ui/CardHeader.vue';
export { default as CardTitle } from './components/ui/CardTitle.vue';
export { default as Checkbox } from './components/ui/Checkbox.vue';
export { default as Dialog } from './components/ui/Dialog.vue';
export { default as EmptyState } from './components/ui/EmptyState.vue';
export { default as Field } from './components/ui/Field.vue';
export { default as Input } from './components/ui/Input.vue';
export { default as Kbd } from './components/ui/Kbd.vue';
export { default as Label } from './components/ui/Label.vue';
export { default as Popover } from './components/ui/Popover.vue';
export { default as Progress } from './components/ui/Progress.vue';
export { default as RadioGroup } from './components/ui/RadioGroup.vue';
export { default as ScrollArea } from './components/ui/ScrollArea.vue';
export { default as SegmentedControl } from './components/ui/SegmentedControl.vue';
export { default as Select } from './components/ui/Select.vue';
export { default as Separator } from './components/ui/Separator.vue';
export { default as Sheet } from './components/ui/Sheet.vue';
export { default as Skeleton } from './components/ui/Skeleton.vue';
export { default as Slider } from './components/ui/Slider.vue';
export { default as Spinner } from './components/ui/Spinner.vue';
export { default as Switch } from './components/ui/Switch.vue';
export { default as Tabs } from './components/ui/Tabs.vue';
export { default as Textarea } from './components/ui/Textarea.vue';
export { default as Tooltip } from './components/ui/Tooltip.vue';
export type { RadioItem, SegmentItem, SelectOption, TabItem } from './components/ui/types';

// PDF components
export { default as CompressionSettings } from './components/pdf/CompressionSettings.vue';
export { default as OcrSettings } from './components/pdf/OcrSettings.vue';
export { default as PageNumberSettings } from './components/pdf/PageNumberSettings.vue';
export { default as PageRangeInput } from './components/pdf/PageRangeInput.vue';
export { default as PdfDocumentInfo } from './components/pdf/PdfDocumentInfo.vue';
export { default as PdfDropzone } from './components/pdf/PdfDropzone.vue';
export { default as PdfFileCard } from './components/pdf/PdfFileCard.vue';
export { default as PdfFileList } from './components/pdf/PdfFileList.vue';
export { default as PdfMetadataForm } from './components/pdf/PdfMetadataForm.vue';
export { default as PdfPageCanvas } from './components/pdf/PdfPageCanvas.vue';
export { default as PdfPageGrid } from './components/pdf/PdfPageGrid.vue';
export { default as PdfPageOrganizer } from './components/pdf/PdfPageOrganizer.vue';
export { default as PdfPasswordForm } from './components/pdf/PdfPasswordForm.vue';
export { default as PdfPositionPicker } from './components/pdf/PdfPositionPicker.vue';
export { default as PdfProcessingState } from './components/pdf/PdfProcessingState.vue';
export { default as PdfResultPanel } from './components/pdf/PdfResultPanel.vue';
export { default as PdfSearchPanel } from './components/pdf/PdfSearchPanel.vue';
export { default as PdfThumbnail } from './components/pdf/PdfThumbnail.vue';
export { default as PdfThumbnailSidebar } from './components/pdf/PdfThumbnailSidebar.vue';
export { default as PdfToolCard } from './components/pdf/PdfToolCard.vue';
export { default as PdfToolGrid } from './components/pdf/PdfToolGrid.vue';
export { default as PdfToolHeader } from './components/pdf/PdfToolHeader.vue';
export { default as PdfViewer } from './components/pdf/PdfViewer.vue';
export { default as PdfViewerToolbar } from './components/pdf/PdfViewerToolbar.vue';
export { default as SignatureInput } from './components/pdf/SignatureInput.vue';
export { default as SignaturePad } from './components/pdf/SignaturePad.vue';
export { default as SplitSettings } from './components/pdf/SplitSettings.vue';
export { default as WatermarkSettings } from './components/pdf/WatermarkSettings.vue';

// Composables
export { useElementSize } from './composables/useElementSize';
export type { ElementSize } from './composables/useElementSize';
export { useInView } from './composables/useInView';
export type { UseInViewOptions } from './composables/useInView';
export { usePdfDocument } from './composables/usePdfDocument';
export type { PdfSourceInput, UsePdfDocumentOptions } from './composables/usePdfDocument';

// PDF engine + utilities
export {
  acquirePdfDocument,
  clearPdfDocumentCache,
  configurePdfJs,
  findPdfTextHighlights,
  findTextLayerHighlights,
  getPdfDocumentStats,
  getPdfJsConfig,
  isPdfPasswordError,
  isRenderCancelled,
  loadPdfJs,
  normalizeRotation,
  pageRotation,
  pdfPasswordErrorCode,
  pdfSourceKey,
  renderPdfPage,
  renderPdfTextLayer,
  scaleForWidth,
  searchPdfDocument,
} from './lib/pdf';
export type {
  AcquirePdfDocumentOptions,
  PdfDocumentHandle,
  PdfHighlightBox,
  PdfJsConfig,
  PdfPageRender,
  PdfSearchMatch,
  PdfSearchResults,
  PdfTextLayerHandle,
  RenderPdfPageOptions,
} from './lib/pdf';
export { PdfConfigurationError } from './lib/pdf';

export { formatBytes, formatDuration, pageCountLabel, savedPercent, truncateMiddle } from './lib/format';
export { cn } from './lib/cn';
export {
  canvasToTrimmedDataUrl,
  isCanvasBlank,
  readFileAsDataUrl,
  renderTypedSignature,
} from './lib/canvas';
export {
  COMMON_OCR_LANGUAGES,
  defaultCompressionOptions,
  defaultOcrOptions,
  defaultPageNumberOptions,
  defaultPasswordOptions,
  defaultPdfMetadata,
  defaultPdfPermissions,
  defaultSplitOptions,
  defaultWatermarkOptions,
} from './lib/defaults';
export {
  formatPageRange,
  pageRangePresets,
  pageSelectionSummary,
  parsePageRange,
} from './lib/page-range';
export type { PageRange, PageRangeParseResult, PageRangePreset } from './lib/page-range';
export { inDocumentOrder, updateSelection } from './lib/selection';
export type { SelectionModifiers, SelectionResult } from './lib/selection';
export type * from './lib/types';
