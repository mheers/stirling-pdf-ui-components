import type { Preview } from '@storybook/vue3-vite';
import '@fontsource-variable/inter';
import './storybook.css';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { configurePdfJs } from '../src/lib/pdf';

configurePdfJs({ workerSrc: workerUrl });

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
    },
    docs: {
      toc: true,
    },
    options: {
      storySort: {
        order: [
          'Introduction',
          'Foundations',
          ['Colors', 'Primitives'],
          'Components',
          [
            'PdfDropzone',
            'PdfFileCard',
            'PdfFileList',
            'PdfToolCard',
            'PdfToolGrid',
            'PdfToolHeader',
            'PdfThumbnail',
            'PdfThumbnailSidebar',
            'PdfPageGrid',
            'PdfPageOrganizer',
            'PdfViewer',
            'PdfViewerToolbar',
            'PdfPageCanvas',
            'PdfSearchPanel',
            'PageRangeInput',
            'PdfMetadataForm',
            'PdfPasswordForm',
            'PdfDocumentInfo',
            'SignaturePad',
            'SignatureInput',
            'WatermarkSettings',
            'PageNumberSettings',
            'CompressionSettings',
            'OcrSettings',
            'SplitSettings',
            'PdfProcessingState',
            'PdfResultPanel',
            'PdfPositionPicker',
          ],
        ],
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Color theme for the component preview',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  decorators: [
    (story, context) => {
      const theme = context.globals.theme === 'dark' ? 'dark' : 'light';
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
      }

      const fullscreen = context.parameters.layout === 'fullscreen';
      return {
        components: { Story: story() },
        template: `
          <div class="${fullscreen ? 'min-h-screen' : 'min-h-screen p-4 sm:p-6'} w-full bg-background font-sans text-foreground antialiased">
            <Story />
          </div>
        `,
      };
    },
  ],
};

export default preview;
