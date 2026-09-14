#!/usr/bin/env node
/* Render-Pipeline für die Illustrationen (Galerie + Buch).
   Aufruf:  node illu-render.mjs <name> [<name> ...] [--only=png|eps|book] [--out=DIR]
   Erzeugt je Illustration:
     illu-thumbs/<name>.png        Farbe, Punktraster-Hintergrund, 3x
     illu-thumbs-sw/<name>.png     Schwarz-Weiß (S/W-sichere Palette + Graustufen), 3x
     eps/<name>-{85,97,107}mm.eps  Vektor-EPS (CMYK) in Druckbreiten
     _book-preview/<name>.png      Buchseiten-Vorschau 140x216 mm, Grafik auf 110 mm Satzspiegelbreite
*/
import { chromium } from '/Users/tobiastroendle/dev/maklermailclub/node_modules/playwright/index.mjs';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = '/Users/tobiastroendle/dev';
const args = process.argv.slice(2);
const names = args.filter(a => !a.startsWith('--')).map(n => n.replace(/\.html$/, ''));
const only = (args.find(a => a.startsWith('--only=')) || '--only=all').split('=')[1];
const outRoot = (args.find(a => a.startsWith('--out=')) || `--out=${ROOT}`).split('=')[1];
if (!names.length) { console.error('Bitte Dateinamen angeben.'); process.exit(1); }

for (const d of ['illu-thumbs', 'illu-thumbs-sw', 'eps', '_book-preview']) fs.mkdirSync(path.join(outRoot, d), { recursive: true });

const MM_WIDTHS = [85, 97, 107];
const BOOK_W = 110;               // Satzspiegelbreite im Buch (140 mm − 2 × 15 mm)
const PT_PER_MM = 72 / 25.4;
const PX_PER_MM = 96 / 25.4;

const browser = await chromium.launch();
const ctx = await browser.newContext({ deviceScaleFactor: 3, viewport: { width: 1600, height: 1200 } });
const ctx1 = await browser.newContext({ deviceScaleFactor: 1, viewport: { width: 1600, height: 1200 } });

async function open(name, query, c = ctx) {
  const page = await c.newPage();
  await page.goto(`file://${ROOT}/${name}.html?${query}`, { waitUntil: 'networkidle' });
  // .wrap ist flex + min-height:100vh → #capture würde sonst auf Viewport-Höhe gestreckt
  await page.addStyleTag({ content: '.wrap{align-items:flex-start!important;min-height:0!important}' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  return page;
}

async function exportPNG(name, gray) {
  // Element-Screenshot von #capture bei 3x (Punktraster liegt auf .wrap, wird mitgeschnitten)
  const page = await open(name, gray ? 'bg=grid&sw=1&gray=1' : 'bg=grid');
  const target = path.join(outRoot, gray ? 'illu-thumbs-sw' : 'illu-thumbs', `${name}.png`);
  const box = await page.locator('#capture').boundingBox();
  await page.locator('#capture').screenshot({ path: target });
  await page.close();
  return { target, box };
}

async function exportEPS(name, box) {
  const page = await open(name, 'bg=white', ctx1);
  await page.addStyleTag({ content: `
    .toolbar{display:none!important} body{margin:0} html,body{background:#fff!important}
    .wrap{padding:0!important;min-height:0!important;background:#fff!important;display:block!important}
    #capture{margin:0!important}` });
  await page.waitForTimeout(100);
  const b = await page.locator('#capture').boundingBox();
  const out = [];
  for (const mm of MM_WIDTHS) {
    const scale = (mm * PX_PER_MM) / b.width;          // CSS-px → Zielbreite
    const hmm = (b.height * scale) / PX_PER_MM;
    const pdf = path.join(outRoot, 'eps', `_${name}-${mm}mm.pdf`);
    await page.pdf({ path: pdf, width: `${mm}mm`, height: `${hmm + 0.5}mm`, scale: Math.min(2, Math.max(0.1, scale)),
      printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, pageRanges: '1' });
    const eps = path.join(outRoot, 'eps', `${name}-${mm}mm.eps`);
    execFileSync('gs', ['-q', '-dBATCH', '-dNOPAUSE', '-dEPSCrop', '-sDEVICE=eps2write',
      '-dProcessColorModel=/DeviceCMYK', '-sColorConversionStrategy=CMYK', `-sOutputFile=${eps}`, pdf]);
    fs.unlinkSync(pdf);
    out.push(eps);
  }
  await page.close();
  return out;
}

async function bookPreview(name, pngPath) {
  // Buchseite 140 x 216 mm, Satzspiegel 110 mm, Grafik in voller Satzspiegelbreite + Bildunterschrift
  const page = await ctx1.newPage();
  const data = fs.readFileSync(pngPath).toString('base64');
  const title = fs.readFileSync(`${ROOT}/${name}.html`, 'utf8').match(/<title>([^<]*)<\/title>/)?.[1] || name;
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
    @page{size:140mm 216mm;margin:0} html,body{margin:0}
    body{width:140mm;height:216mm;font-family:Georgia,serif;position:relative;background:#fff}
    .head{position:absolute;top:12mm;left:15mm;right:15mm;font:600 8.5pt/1 Helvetica,Arial,sans-serif;border-bottom:.4pt solid #999;padding-bottom:1.5mm;display:flex;justify-content:space-between}
    .fig{position:absolute;top:22mm;left:15mm;width:110mm}
    .fig img{width:110mm;display:block}
    .cap{margin-top:3mm;font:8pt/1.3 Helvetica,Arial,sans-serif}.cap b{font-weight:700}
    .txt{position:absolute;left:15mm;right:15mm;bottom:14mm;font-size:9.5pt;line-height:1.45;text-align:justify;color:#222}
  </style></head><body>
    <div class="head"><span>120</span><span>4 KI-Erfolgsfaktor Führung</span></div>
    <div class="fig"><img src="data:image/png;base64,${data}"><div class="cap"><b>Abbildung X.Y:</b> ${title}</div></div>
    <div class="txt">Vergleichstext im Buchsatz (ca. 9,5 pt): Mit Vorbild führen ist der größte Hebel bei der KI-Adoption in Teams. Nicht das Budget. Nicht die Plattform. Nicht das Schulungsprogramm.</div>
  </body></html>`);
  const pdf = path.join(outRoot, '_book-preview', `${name}.pdf`);
  await page.pdf({ path: pdf, width: '140mm', height: '216mm', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await page.close();
  execFileSync('pdftoppm', ['-r', '160', '-png', '-singlefile', pdf, path.join(outRoot, '_book-preview', name)]);
  fs.unlinkSync(pdf);
  return path.join(outRoot, '_book-preview', `${name}.png`);
}

for (const name of names) {
  if (!fs.existsSync(`${ROOT}/${name}.html`)) { console.error(`fehlt: ${name}.html`); continue; }
  const t0 = Date.now();
  let info = '';
  if (only === 'all' || only === 'png' || only === 'book') {
    const { target, box } = await exportPNG(name, false);
    const ptPerPx = (BOOK_W * PT_PER_MM) / box.width;
    info += `capture ${Math.round(box.width)}x${Math.round(box.height)}px → im Buch ${BOOK_W}x${Math.round(box.height / box.width * BOOK_W)} mm, 1px = ${ptPerPx.toFixed(2)}pt (13px = ${(13 * ptPerPx).toFixed(1)}pt)`;
    if (only !== 'book') await exportPNG(name, true);
    if (only === 'all' || only === 'book') await bookPreview(name, target);
  }
  if (only === 'all' || only === 'eps') {
    const box = await (async () => { const p = await open(name, 'bg=white', ctx1); const b = await p.locator('#capture').boundingBox(); await p.close(); return b; })();
    await exportEPS(name, box);
  }
  console.log(`${name}: ${info} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
}
await browser.close();
