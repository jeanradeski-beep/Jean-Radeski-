// Tira o "print" de cada HTML em 1080x1920
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  for (let i = 1; i <= 10; i++) {
    const n = String(i).padStart(2, '0');
    await pg.goto('file://' + path.join(__dirname, 'html', `story-${n}.html`), { waitUntil: 'networkidle' });
    await pg.evaluate(() => document.fonts.ready);
    await pg.screenshot({ path: path.join(__dirname, 'prontos', `story-${n}.jpg`), type: 'jpeg', quality: 92 });
  }
  await b.close();
})();
