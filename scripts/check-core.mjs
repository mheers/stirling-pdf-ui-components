import fs from 'node:fs';
import path from 'node:path';

/**
 * The /core entry promises to be engine-free. Follow its relative imports and
 * assert neither the JavaScript nor the declarations reach pdfjs-dist.
 */
function collect(entry, pattern) {
  const seen = new Set();
  const stack = [path.resolve(entry)];
  const offenders = [];

  while (stack.length) {
    const file = stack.pop();
    if (seen.has(file) || !fs.existsSync(file)) continue;
    seen.add(file);

    const source = fs.readFileSync(file, 'utf8');
    if (/(?:from\s+|import\(\s*)["']pdfjs-dist(?:\/[^"']*)?["']/.test(source)) {
      offenders.push(file);
    }

    for (const match of source.matchAll(pattern)) {
      const specifier = match[1];
      if (!specifier.startsWith('.')) continue;
      const base = path.resolve(path.dirname(file), specifier);
      const candidates = [base, `${base}.d.ts`, `${base}.js`];
      const next = candidates.find((candidate) => fs.existsSync(candidate));
      if (next) stack.push(next);
    }
  }

  return { files: seen.size, offenders };
}

const js = collect('dist/core.js', /from\s+["']([^"']+)["']/g);
const dts = collect('dist/core.d.ts', /from\s+["']([^"']+)["']/g);
const offenders = [...new Set([...js.offenders, ...dts.offenders])];

if (offenders.length) {
  console.error('The core entry reached PDF.js:');
  for (const file of offenders) console.error(`  ${path.relative(process.cwd(), file)}`);
  process.exit(1);
}

console.log(`Core entry is engine-free (${js.files} JS files, ${dts.files} declaration files).`);
