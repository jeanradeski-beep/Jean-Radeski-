"""Gera os 10 stories (1080x1920) da sequência da cabana."""
from pathlib import Path
import subprocess

BASE = Path(__file__).parent
OUT = BASE / "prontos"
OUT.mkdir(exist_ok=True)

# (foto, posição da foto, posição do texto, kicker, título, apoio)
STORIES = [
    ("drone.jpg", "center", "low", "Escondida na Serra",
     "No meio da mata<br>existe uma luz acesa…", "Consegue encontrar?"),
    ("ponte.jpg", "center 40%", "low", "O caminho",
     "Atravesse a ponte.", "O mundo lá fora fica pra trás."),
    ("cabana-noite.jpg", "center 60%", "top", "Quando anoitece",
     "Ela acende<br>pra você.", "Paredes de vidro. Floresta ao redor."),
    ("cama.jpg", "center", "low", "Pra dormir",
     "Abraçado pela<br>madeira e pelo silêncio.", "Sem despertador. Sem pressa."),
    ("hidro.jpg", "center 30%", "low", "Hidro aquecida",
     "Um banho com<br>vista pra floresta.", "A chuva do lado de fora, o calor aqui dentro."),
    ("cozinha.jpg", "center", "top", "Cozinha completa",
     "Cada detalhe<br>pensado pra você.", "É só chegar e se sentir em casa."),
    ("risoto.jpg", "center 60%", "top", "Até o jantar",
     "já te espera.", "Risoto de tomate seco · pronto em 25 min"),
    ("lareira.jpg", "center 40%", "top", "Fim de tarde",
     "Lareira acesa,<br>flores na mesa.", "E um livro pra deixar o seu recado."),
    ("spa-mata.jpg", "center 55%", "top", "Mas ainda não acabou…",
     "Tem um espaço<br>secreto na mata.", "Siga as luzes."),
    ("banheira.jpg", "center 40%", "top", "Banheira ao ar livre",
     "Entre samambaias.<br>Só vocês dois.", "No próximo story: o tour completo"),
]

CSS = """
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,500;1,600&family=Montserrat:wght@500;600&display=block');
* { margin:0; padding:0; box-sizing:border-box; }
html, body { width:1080px; height:1920px; overflow:hidden; background:#0f1a14; }
.bg { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.shade { position:absolute; inset:0; }
.shade.low { background:linear-gradient(180deg, rgba(10,18,13,.35) 0%, rgba(10,18,13,0) 22%, rgba(10,18,13,0) 45%, rgba(10,18,13,.88) 82%, rgba(10,18,13,.95) 100%); }
.shade.top { background:linear-gradient(180deg, rgba(10,18,13,.92) 0%, rgba(10,18,13,.75) 26%, rgba(10,18,13,0) 50%, rgba(10,18,13,0) 82%, rgba(10,18,13,.45) 100%); }
.box { position:absolute; left:90px; right:90px; color:#F6EFE4; }
.box.low { bottom:330px; }
.box.top { top:250px; }
.kicker { font-family:'Montserrat',sans-serif; font-weight:600; font-size:30px; letter-spacing:.32em;
  text-transform:uppercase; color:#E9A15B; display:flex; align-items:center; gap:22px; margin-bottom:34px; }
.kicker::before { content:''; width:70px; height:2px; background:#E9A15B; }
h1 { font-family:'Cormorant Garamond',serif; font-style:italic; font-weight:500; font-size:104px;
  line-height:1.02; text-shadow:0 4px 30px rgba(0,0,0,.45); }
p { font-family:'Montserrat',sans-serif; font-weight:500; font-size:36px; line-height:1.4;
  margin-top:36px; color:rgba(246,239,228,.88); }
.count { position:absolute; top:150px; right:90px; font-family:'Montserrat',sans-serif; font-weight:600;
  font-size:24px; letter-spacing:.25em; color:rgba(246,239,228,.75); }
.cta { display:inline-flex; align-items:center; gap:18px; margin-top:44px; padding:24px 40px;
  border-radius:60px; background:#E9A15B; color:#1B140D; font-family:'Montserrat',sans-serif;
  font-weight:600; font-size:30px; letter-spacing:.14em; text-transform:uppercase; }
"""


def html(foto, pos, where, kicker, titulo, apoio, n):
    cta = '<div class="cta">Toque pra ver &nbsp;→</div>' if n == 10 else ""
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<img class="bg" src="{(BASE / 'fotos' / foto).as_uri()}" style="object-position:{pos}">
<div class="shade {where}"></div>
<div class="count">{n:02d} / 10</div>
<div class="box {where}"><div class="kicker">{kicker}</div><h1>{titulo}</h1><p>{apoio}</p>{cta}</div>
</body></html>"""


HTML = BASE / "html"
HTML.mkdir(exist_ok=True)
for i, s in enumerate(STORIES, 1):
    (HTML / f"story-{i:02d}.html").write_text(html(*s, i), encoding="utf-8")

# Renderiza com o Playwright do Node (render.js)
subprocess.run(["node", str(BASE / "render.js")], check=True)
print("ok")
