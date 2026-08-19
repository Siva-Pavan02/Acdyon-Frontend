import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = new URL('../', import.meta.url).pathname.replace(/^\//, '').replaceAll('/', '\\');
const required = ['index.html', 'styles.css', 'app.js', 'README.md'];
const fail = message => { console.error(`Validation failed: ${message}`); process.exitCode = 1; };

required.forEach(file => { if (!existsSync(join(root, file))) fail(`missing ${file}`); });
const html = readFileSync(join(root, 'index.html'), 'utf8');
const app = readFileSync(join(root, 'app.js'), 'utf8');
const frames = readdirSync(join(root, 'Nike shoes frames')).filter(file => /^frame_\d+\.\d{2}\.jpg$/.test(file));
if (frames.length !== 40) fail(`expected 40 frames, found ${frames.length}`);
if (!html.includes('target="_blank"') || !html.includes('rel="noopener noreferrer"')) fail('external link safety attributes missing');
if (!html.includes('https://www.nike.com/launch/t/air-tech-challenge-2-photon-dust-and-dusty-cactus')) fail('official product URL missing');
if (html.includes('$180') || html.includes('FRAME 00')) fail('fabricated price or debug frame label present in UI');
if (!app.includes('requestAnimationFrame') || !app.includes('image.decode')) fail('animation/decode controller missing');
const syntax = spawnSync(process.execPath, ['--check', join(root, 'app.js')], { encoding: 'utf8' });
if (syntax.status !== 0) fail(syntax.stderr.trim());
if (process.exitCode !== 1) console.log(`Validated static site: ${frames.length} frames, safe external CTA, and app.js syntax.`);
