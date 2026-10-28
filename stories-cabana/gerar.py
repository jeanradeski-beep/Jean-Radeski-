"""Gera os 10 stories (1080x1920) da sequência da cabana."""
from pathlib import Path
import subprocess

BASE = Path(__file__).parent
OUT = BASE / "prontos"
OUT.mkdir(exist_ok=True)

# (foto, posição da foto, texto principal, linha pequena opcional)
# Estilo discreto: frase curta e informativa, centralizada, sem destaque exagerado.
STORIES = [
    ("drone.jpg", "center", "Localizado em Salto Veloso,<br>uma experiência privativa em meio à mata.", "Salto Veloso"),
    ("ponte.jpg", "center 40%", "O caminho até a cabana<br>já faz parte da experiência.", ""),
    ("cabana-noite.jpg", "center 60%", "Arquitetura A-frame moderna, em vidro,<br>que reflete suas luzes quentes.", ""),
    ("cama.jpg", "center", "Um futon perfeito, com massagem<br>e vista privilegiada para a mata.", ""),
    ("hidro.jpg", "center 30%", "Hidromassagem<br>com vista para a mata.", ""),
    ("cozinha.jpg", "center", "Cozinha completa para você<br>não se preocupar com nada.", ""),
    ("adega.jpg", "center 45%", "Adega completa.", ""),
    ("cardapio", "", "Opções de alimentação congeladas,<br>deliciosas e prontas para fazer.", ""),
    ("lareira.jpg", "center 40%", "Detalhes que encantam.", ""),
    ("spa-mata.jpg", "center 55%", "Um spa com ofurô e cama suspensa,<br>imerso na mata, ao lado do rio<br>e ao som das quedas d'água.", ""),
    ("banheira.jpg", "center 40%", "Ofurô e cama suspensa,<br>entre samambaias.", "Tour completo no próximo story"),
]

CSS = """
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Montserrat:wght@400;500&display=block');
* { margin:0; padding:0; box-sizing:border-box; }
html, body { width:1080px; height:1920px; overflow:hidden; background:#0f1a14; }
.bg { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.shade { position:absolute; inset:0; background:linear-gradient(180deg, rgba(8,14,10,0) 55%, rgba(8,14,10,.55) 78%, rgba(8,14,10,.7) 100%); }
.box { position:absolute; left:80px; right:80px; bottom:340px; text-align:center; color:#F4EEE4; }
.txt { font-family:'Cormorant Garamond',serif; font-weight:400; font-size:50px; line-height:1.3;
  text-shadow:0 2px 18px rgba(0,0,0,.55); }
.tag { font-family:'Montserrat',sans-serif; font-weight:500; font-size:22px; letter-spacing:.38em;
  text-transform:uppercase; color:rgba(244,238,228,.78); margin-top:30px; text-shadow:0 2px 12px rgba(0,0,0,.6); }
.line { width:46px; height:1px; background:rgba(244,238,228,.6); margin:0 auto 30px; }
"""


CARDAPIO = ["risoto.jpg", "pizza.jpg"]  # fotos do quadrado do story de cardápio


def html_cardapio(texto):
    fotos = [f for f in CARDAPIO if (BASE / "fotos" / f).exists()]
    lado = 820 if len(fotos) == 1 else 440
    quadros = "".join(
        f'<img src="{(BASE / "fotos" / f).as_uri()}" style="width:{lado}px;height:{lado}px;object-fit:cover;border-radius:6px">'
        for f in fotos)
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{CSS}
body {{ background:#17231c; }}
.grid {{ position:absolute; top:330px; left:0; right:0; display:flex; justify-content:center; gap:28px; }}
</style></head><body>
<div class="grid">{quadros}</div>
<div class="box"><div class="line"></div><div class="txt">{texto}</div></div>
</body></html>"""


def html(foto, pos, texto, tag, n):
    if foto == "cardapio":
        return html_cardapio(texto)
    tag_html = f'<div class="tag">{tag}</div>' if tag else ""
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<img class="bg" src="{(BASE / 'fotos' / foto).as_uri()}" style="object-position:{pos}">
<div class="shade"></div>
<div class="box"><div class="line"></div><div class="txt">{texto}</div>{tag_html}</div>
</body></html>"""


STORIES = [s for s in STORIES if s[0] == "cardapio" or (BASE / "fotos" / s[0]).exists()]

HTML = BASE / "html"
HTML.mkdir(exist_ok=True)
for i, s in enumerate(STORIES, 1):
    (HTML / f"story-{i:02d}.html").write_text(html(*s, i), encoding="utf-8")

# Renderiza com o Playwright do Node (render.js)
subprocess.run(["node", str(BASE / "render.js")], check=True)
print("ok")
