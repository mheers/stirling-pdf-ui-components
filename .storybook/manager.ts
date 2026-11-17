import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'Stirling PDF UI Components',
    brandUrl: 'https://github.com/mheers/stirling-pdf-ui-components',
    brandTarget: '_blank',
    colorPrimary: '#2563eb',
    colorSecondary: '#af3434',
    appBg: '#fbfaf7',
    appContentBg: '#ffffff',
    appPreviewBg: '#ffffff',
    appBorderColor: '#e5e2dc',
    appBorderRadius: 8,
    textColor: '#25262b',
    textInverseColor: '#ffffff',
    barBg: '#ffffff',
    barTextColor: '#6b7280',
    barSelectedColor: '#2563eb',
    fontBase: '"Inter Variable", Inter, ui-sans-serif, system-ui, sans-serif',
    fontCode: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  }),
});
