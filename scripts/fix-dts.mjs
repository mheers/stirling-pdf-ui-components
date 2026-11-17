import fs from 'node:fs';
import path from 'node:path';

// The stylesheet is imported by the JS entry so Vite emits `style.css`, but the
// declaration file must not import a CSS file that no longer exists in dist.
const declaration = path.resolve('dist/index.d.ts');
let source = fs.readFileSync(declaration, 'utf8');
source = source.replace(/^import ['"]\.\/styles\/index\.css['"];\n?/m, '');
fs.writeFileSync(declaration, source);
console.log('Removed stylesheet import from dist/index.d.ts');
