import { createApp } from 'vue';
import { configurePdfJs } from '@mheers/stirling-pdf-ui-components';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import App from './App.vue';
import './style.css';

configurePdfJs({ workerSrc: workerUrl });

createApp(App).mount('#app');
