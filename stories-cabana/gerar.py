"""Gera os stories (1080x1920) da sequência da cabana.

Estilo: foto em tela cheia + faixa com desfoque verde (em cima ou embaixo,
onde não cobre o assunto da foto) com o texto.
"""
from pathlib import Path
import subprocess

BASE = Path(__file__).parent
FOTOS = BASE / "fotos"
OUT = BASE / "prontos"
HTML = BASE / "html"
OUT.mkdir(exist_ok=True)
HTML.mkdir(exist_ok=True)

# foto, foco da foto, faixa ("top"/"low"), chamada pequena, título, apoio, extra
STORIES = [
    ("drone.jpg", "center", "top", "Salto Veloso",
     "Uma experiência privativa<br>em meio à mata.", "",
     {"rodape": [("Videira", "51 km"), ("Joaçaba", "54 km"), ("Chapecó", "180 km"),
                 ("Curitiba", "346 km"), ("Floripa", "445 km")]}),
    ("ponte.jpg", "center 40%", "low", "O caminho",
     "Atravesse a ponte.", "Todo o ambiente cercado pela natureza.", {}),
    ("cabana-noite.jpg", "center 60%", "top", "Arquitetura A-frame",
     "Moderna, em vidro,<br>refletindo suas luzes quentes.", "", {"descer": 200}),
    ("cama.jpg", "center 60%", "top", "Futon com massagem",
     "Um futon perfeito, com vista<br>privilegiada para a mata.", "", {}),
    ("hidro.jpg", "center 30%", "low", "Hidromassagem",
     "Um banho com<br>vista para a floresta.", "", {}),
    ("cozinha.jpg", "center 70%", "top", "Cozinha completa",
     "Para você não se<br>preocupar com nada.", "", {}),
    ("adega.jpg", "center", "top", "Adega completa",
     "Pra brindar<br>cada momento.", "", {}),
    ("pizza.jpg", "center 75%", "top", "Cardápio da cabana",
     "Opções congeladas<br>e deliciosas.", "", {}),
    ("risoto.jpg", "center 60%", "top", "Praticidade",
     "Opções práticas e<br>prontas para fazer.", "", {}),
    ("lareira.jpg", "center 60%", "low", "Lareira",
     "Detalhes que encantam.", "", {"h": 560}),
    ("spa-mata.jpg", "center 70%", "top", "Spa na mata",
     "Banheira e cama suspensa,<br>imerso na mata.", "Ao lado do rio, ao som das quedas d'água.", {}),
    ("banheira.jpg", "center 70%", "top", "Um espaço para relaxar",
     "Entre samambaias,<br>sem pressa.", "", {}),
]

CSS = """
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,500;1,600&family=Montserrat:wght@500;600&display=block');
* { margin:0; padding:0; box-sizing:border-box; }
html, body { width:1080px; height:1920px; overflow:hidden; background:#0f1a14; }
.bg { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }

/* faixa com desfoque verde */
.blur { position:absolute; left:0; right:0; height:820px;
  backdrop-filter: blur(14px) saturate(1.05); -webkit-backdrop-filter: blur(14px) saturate(1.05); }
.blur.top { top:0;
  background:linear-gradient(180deg, rgba(16,38,26,.72) 0%, rgba(16,38,26,.5) 60%, rgba(16,38,26,0) 100%);
  -webkit-mask-image:linear-gradient(180deg,#000 0%,#000 62%,transparent 100%); mask-image:linear-gradient(180deg,#000 0%,#000 62%,transparent 100%); }
.blur.low { bottom:0;
  background:linear-gradient(0deg, rgba(16,38,26,.72) 0%, rgba(16,38,26,.5) 60%, rgba(16,38,26,0) 100%);
  -webkit-mask-image:linear-gradient(0deg,#000 0%,#000 62%,transparent 100%); mask-image:linear-gradient(0deg,#000 0%,#000 62%,transparent 100%); }

.box { position:absolute; left:90px; right:90px; color:#F6EFE4; }
.box.top { top:135px; }
.box.low { bottom:200px; }
.kicker { font-family:'Montserrat',sans-serif; font-weight:600; font-size:28px; letter-spacing:.32em;
  text-transform:uppercase; color:#E9A15B; display:flex; align-items:center; gap:22px; margin-bottom:30px; text-shadow:0 1px 10px rgba(0,0,0,.7); }
.kicker::before { content:''; width:70px; height:2px; background:#E9A15B; }
h1 { font-family:'Cormorant Garamond',serif; font-style:italic; font-weight:500; font-size:84px; line-height:1.05; text-shadow:0 2px 24px rgba(0,0,0,.45); }
p { font-family:'Montserrat',sans-serif; font-weight:500; font-size:34px; line-height:1.4;
  margin-top:30px; color:rgba(246,239,228,.88); }
.count { position:absolute; top:150px; right:90px; font-family:'Montserrat',sans-serif; font-weight:600;
  font-size:24px; letter-spacing:.25em; color:rgba(246,239,228,.75); }
.cta { display:inline-flex; margin-top:38px; padding:22px 38px; border-radius:60px; background:#E9A15B;
  color:#1B140D; font-family:'Montserrat',sans-serif; font-weight:600; font-size:28px;
  letter-spacing:.14em; text-transform:uppercase; }
.rodape { position:absolute; left:90px; right:90px; bottom:190px; color:#F6EFE4; height:120px; }
.rodape .trilho { position:absolute; left:0; right:0; top:50px; height:1px; background:rgba(246,239,228,.6); }
.rodape .pt { position:absolute; top:0; height:120px; font-family:'Montserrat',sans-serif; white-space:nowrap; }
.rodape .pt::before { content:''; position:absolute; top:44px; left:-6px; width:11px; height:11px; border-radius:50%;
  background:#E9A15B; box-shadow:0 0 0 5px rgba(233,161,91,.22); }
.rodape .pt .km { position:absolute; top:0; font-weight:600; font-size:26px; color:#E9A15B; transform:translateX(-50%); }
.rodape .pt .nome { position:absolute; top:80px; font-weight:500; font-size:19px; letter-spacing:.12em;
  text-transform:uppercase; color:rgba(246,239,228,.88); transform:translateX(-50%); }
.rodape .pt.first .km, .rodape .pt.first .nome { transform:none; left:-6px; }
.rodape .pt.last .km, .rodape .pt.last .nome { transform:none; right:-6px; }
.inset { position:absolute; left:60px; bottom:170px; width:290px; height:290px; object-fit:cover;
  border-radius:10px; border:6px solid #F6EFE4; box-shadow:0 18px 50px rgba(0,0,0,.45); transform:rotate(-3deg); }
"""


def html(foto, pos, faixa, kicker, titulo, apoio, extra, n, total):
    apoio_html = f"<p>{apoio}</p>" if apoio else ""
    cta = '<div class="cta">Toque pra ver &nbsp;→</div>' if extra.get("cta") else ""
    rodape = ""
    if extra.get("rodape"):
        pts = extra["rodape"]
        cidades = ""
        for i, (c, km) in enumerate(pts):
            x = i / (len(pts) - 1) * 100
            cls = "first" if i == 0 else "last" if i == len(pts) - 1 else ""
            cidades += (f'<div class="pt {cls}" style="left:{x}%"><span class="km">{km}</span>'
                        f'<span class="nome">{c}</span></div>')
        rodape = ('<div class="blur low" style="height:500px"></div>'
                  f'<div class="rodape"><div class="trilho"></div>{cidades}</div>')
    inset = ""
    if extra.get("inset") and (FOTOS / extra["inset"]).exists():
        inset = f'<img class="inset" src="{(FOTOS / extra["inset"]).as_uri()}">'
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<img class="bg" src="{(FOTOS / foto).as_uri()}" style="object-position:{pos};transform:translateY({extra.get('descer', 0)}px)">
{rodape}
<div class="blur {faixa}" style="height:{extra.get('h', 620)}px"></div>
{inset}
<div class="box {faixa}"><div class="kicker">{kicker}</div><h1>{titulo}</h1>{apoio_html}{cta}</div>
</body></html>"""


# Só entram os stories cuja foto existe (ex.: adega)
ativos = [s for s in STORIES if (FOTOS / s[0]).exists()]
for f in list(HTML.glob("*.html")) + list(OUT.glob("*.jpg")):
    f.unlink()
for i, s in enumerate(ativos, 1):
    (HTML / f"story-{i:02d}.html").write_text(html(*s, i, len(ativos)), encoding="utf-8")

subprocess.run(["node", str(BASE / "render.js")], check=True)
print(f"ok: {len(ativos)} stories")
