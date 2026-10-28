// Gera "Bem-vindos à Cabana Doce Encanto" em PNG transparente (dourado e preto)
const { chromium } = require('playwright');
const path = require('path');
const cores = {
  dourado: { txt: 'linear-gradient(180deg,#F3D98B 0%,#D4A743 45%,#A87B25 75%,#E6C46A 100%)', linha: '#C9A045' },
  preto:   { txt: 'linear-gradient(180deg,#111 0%,#111 100%)', linha: '#111' },
};
const html = (c) => `<!doctype html><html><head><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400&family=Italiana&display=block');
html,body{margin:0;background:transparent}
#t{display:inline-block;padding:40px 80px;text-align:center}
.g{background:${c.txt};-webkit-background-clip:text;background-clip:text;color:transparent}
.top{font-family:'Montserrat',sans-serif;font-weight:400;font-size:40px;letter-spacing:.55em;text-transform:uppercase;
  display:flex;align-items:center;justify-content:center;gap:34px}
.top i{display:block;width:90px;height:2px;background:${c.linha}}
.nome{font-family:'Italiana',serif;font-size:190px;line-height:1.1;margin-top:28px;padding:0 20px;letter-spacing:.08em;text-transform:uppercase}
.sub{font-family:'Cormorant Garamond',serif;font-weight:500;font-size:44px;letter-spacing:.5em;text-transform:uppercase;margin-top:6px}
</style></head><body><div id="t">
<div class="top"><i></i><span class="g">Bem-vindos à Cabana</span><i></i></div>
<div class="nome g">Doce Encanto</div>
</div></body></html>`;
(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 2000, height: 1000 }, deviceScaleFactor: 1 });
  for (const [nome, c] of Object.entries(cores)) {
    await pg.setContent(html(c), { waitUntil: 'networkidle' });
    await pg.evaluate(() => document.fonts.ready);
    await pg.locator('#t').screenshot({ path: path.join(__dirname, `bem-vindos-${nome}.png`), omitBackground: true });
  }
  await b.close();
})();
