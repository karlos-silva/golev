/**
 * Export de carrossel Go Lev: HTML -> PNGs em alta qualidade (1080x1350, 4:5).
 *
 * Os slides do carrossel.html são NATIVOS 1080x1350 (reduzidos no preview via
 * transform:scale). Aqui o scale é zerado e cada .slide é fotografado em tamanho
 * real, com deviceScaleFactor para nitidez.
 *
 * Uso:
 *   node brand/content/_tools/shoot-carrossel.mjs <caminho/carrossel.html> [opções]
 *
 * Opções:
 *   --pal <e1|e4|azul|unisex>   paleta a aplicar (default: a do HTML / e1)
 *   --scale <n>                 deviceScaleFactor (default: 2 -> 2160x2700)
 *   --out <dir>                 pasta de saída (default: <pasta-do-html>/png)
 *
 * Saída: slide-01.png ... slide-NN.png
 */
import { chromium } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { mkdirSync, existsSync } from 'node:fs';

const htmlArg = process.argv[2];
if (!htmlArg) {
  console.error('uso: node shoot-carrossel.mjs <carrossel.html> [--pal e1] [--scale 2] [--out dir]');
  process.exit(1);
}
const htmlPath = resolve(htmlArg);
if (!existsSync(htmlPath)) {
  console.error(`arquivo não encontrado: ${htmlPath}`);
  process.exit(1);
}

const args = process.argv.slice(3);
const flag = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const pal = flag('--pal', null);
const scale = Number(flag('--scale', '2'));
const outDir = resolve(flag('--out', join(dirname(htmlPath), 'png')));
mkdirSync(outDir, { recursive: true });

const SLIDE_W = 1080;
const SLIDE_H = 1350;

const browser = await chromium.launch();
const context = await browser.newContext({
  deviceScaleFactor: scale,
  viewport: { width: SLIDE_W + 80, height: SLIDE_H + 80 },
});
const page = await context.newPage();
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });

// garante fontes carregadas (Hanken/Newsreader via Google Fonts)
await page.evaluate(async () => { if (document.fonts) await document.fonts.ready; });

if (pal) await page.evaluate((p) => document.body.setAttribute('data-pal', p), pal);

// modo export: zera o scale de preview e neutraliza a moldura
await page.addStyleTag({ content: `
  .bar{display:none!important}
  .deck{display:block!important;max-width:none!important;margin:0!important;padding:0!important}
  .card{width:${SLIDE_W}px!important;height:${SLIDE_H}px!important;overflow:visible!important;
        border-radius:0!important;box-shadow:none!important;margin:0!important}
  .card .n{display:none!important}
  .slide{transform:none!important}
` });
await page.waitForTimeout(150);

const slides = await page.$$('.slide');
if (slides.length === 0) {
  console.error('nenhum .slide encontrado no HTML');
  await browser.close();
  process.exit(1);
}

let i = 0;
for (const slide of slides) {
  i += 1;
  const file = join(outDir, `slide-${String(i).padStart(2, '0')}.png`);
  await slide.screenshot({ path: file });
  console.log(`✓ ${file}`);
}

await browser.close();
console.log(`\n${slides.length} slides exportados em ${outDir} (deviceScaleFactor ${scale} → ${SLIDE_W * scale}×${SLIDE_H * scale}px)`);
