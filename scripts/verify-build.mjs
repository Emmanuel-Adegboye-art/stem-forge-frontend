import { readdirSync, readFileSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';

const DIST = resolve(process.cwd(), 'dist');
const ASSET_REF = /(?:src|href)="(?!https?:|\/\/|data:|#|mailto:)([^"]+\.(?:js|mjs|css))"/g;

if (!existsSync(DIST)) {
    console.error('verify-build: dist/ not found — run `npm run build` first.');
    process.exit(1);
}

function htmlFiles(dir) {
    return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) return htmlFiles(full);
        return entry.name.endsWith('.html') ? [full] : [];
    });
}

const missing = [];

for (const file of htmlFiles(DIST)) {
    const html = readFileSync(file, 'utf8');
    for (const [, ref] of html.matchAll(ASSET_REF)) {
        const target = ref.startsWith('/')
            ? join(DIST, ref)
            : resolve(dirname(file), ref);
        if (!existsSync(target)) {
            missing.push(`${file.slice(DIST.length + 1)} -> ${ref}`);
        }
    }
}

if (missing.length) {
    console.error('verify-build: these assets are referenced but missing from dist/:');
    for (const entry of missing) console.error(`  ${entry}`);
    console.error('\nMove the file into public/ so Vite copies it verbatim.');
    process.exit(1);
}

console.log('verify-build: all referenced assets are present in dist/');
