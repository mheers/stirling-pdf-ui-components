import { fileURLToPath, URL } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

/**
 * Tailwind's default theme is emitted as `:root, :host` with normal
 * specificity. That would let a library loaded after the host app override
 * customised text sizes, spacing, or radius scales. Zero-specificity
 * selectors keep every default a fallback instead of an override.
 */
function hostSafeTheme(): Plugin {
  return {
    name: 'spdf-host-safe-theme',
    enforce: 'post',
    generateBundle(_options, bundle) {
      for (const output of Object.values(bundle)) {
        if (output.type !== 'asset' || !output.fileName.endsWith('.css')) continue;
        output.source = String(output.source).replace(
          /:root,:host\{/g,
          ':where(:root),:where(:host){',
        );
      }
    },
  };
}

export default defineConfig({
  plugins: [vue(), tailwindcss(), hostSafeTheme()],
  publicDir: false,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    cssCodeSplit: false,
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        core: fileURLToPath(new URL('./src/core.ts', import.meta.url)),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
      cssFileName: 'style',
    },
    rollupOptions: {
      // Keep the framework, the PDF engine, and the shared shadcn primitives
      // out of the bundle. A shadcn-vue host already has these packages, so
      // externalizing them avoids duplicate copies in the final app bundle.
      external: [
        'vue',
        /^pdfjs-dist(\/.*)?$/,
        'reka-ui',
        '@lucide/vue',
        'class-variance-authority',
        'clsx',
        'tailwind-merge',
      ],
      output: {
        preserveModules: false,
      },
    },
  },
});
