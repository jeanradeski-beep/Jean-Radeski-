import os
THEMES={
 'bronze':dict(band='166,140,115',ink='#f4f1ea',h2='#f9f4ee',muted='#f4f1ea',ov='#f4f1ea',rule='linear-gradient(90deg,#f4f1ea,#f9f4ee,#f4f1ea)',
   logo='../../marca/logo-horizontal-branco.png',lw=200,op_hi=.93,op_lo=.85,shadow='0 1px 14px rgba(70,50,30,.35)'),
 'creme':dict(band='249,244,238',ink='#1c3e3f',h2='#1c3e3f',muted='rgba(28,62,63,.8)',ov='rgba(28,62,63,.8)',rule='linear-gradient(90deg,#a68c73,#d2b78c,#c9baa9)',
   logo='../../marca/logo-horizontal-branco.png',lw=190,op_hi=.95,op_lo=.88,shadow='none'),
}
F='../../fotos-aj/'
STORIES=[
 ('1-domos',F+'domos-noite.jpg','top','Sorteio AJ Termas','Uma noite<br>entre os domos','com um brinde a mais',''),
 ('2-quarto',F+'quarto-lua.jpg','top','A meta','20 mil comentários','','Se chegarmos lá, o ganhador encontra uma<br>espumante especial esperando no quarto.'),
 ('3-banheira',F+'banheira.jpg','bot','O brinde','Banheira pronta','espumante gelando','Esperando o ganhador no dia da reserva.'),
 ('4-marcos',F+'aerea.jpg','top','Desafio do sorteio','Cada comentário','nos aproxima do brinde','TL'),
 ('5-convite','../../9x16/aj-noite-916.jpg','top','Participe','Comente e marque','quem vai com você','Cada comentário conta para a meta dos 20 mil.'),
]
CSS='''*{margin:0;padding:0;box-sizing:border-box}body{width:1080px;height:1920px;overflow:hidden;font-family:Montserrat,sans-serif}
.s{position:relative;width:1080px;height:1920px;overflow:hidden}.bg,.bl{position:absolute;inset:0;background-size:cover;background-position:center}
.bl{filter:blur(18px);transform:scale(1.05)}.t{position:absolute;inset:0}
.txt{position:absolute;left:100px;right:100px;text-align:center;color:var(--ink);text-shadow:var(--sh)}
.ov{font-size:24px;letter-spacing:.34em;text-transform:uppercase;color:var(--ov);font-weight:500}
.rule{width:110px;height:2px;margin:26px auto;background:var(--rule)}
h1{font-family:"Cormorant Garamond",serif;font-weight:500;font-size:86px;line-height:1.02}
h2{font-family:"Cormorant Garamond",serif;font-style:italic;font-weight:500;font-size:52px;line-height:1.15;margin-top:12px;color:var(--h2)}
.sub{font-size:29px;font-weight:400;line-height:1.5;margin-top:22px;color:var(--muted)}
.logo{position:absolute;left:50%;transform:translateX(-50%);filter:drop-shadow(0 2px 10px rgba(0,0,0,.45))}.logo img{width:100%;display:block}
.tl{position:absolute;left:100px;right:100px;bottom:190px;color:var(--ink);text-shadow:var(--sh)}
.tl .row{position:relative;display:flex;justify-content:space-between}
.tl .row:before{content:"";position:absolute;left:8px;right:8px;top:50%;height:2px;background:var(--rule)}
.tl i{width:16px;height:16px;border-radius:50%;border:2px solid var(--ink);background:rgb(var(--band));position:relative}.tl i.f{background:var(--ink)}
.tl .v,.tl .l{display:flex;justify-content:space-between}.tl .v{font-family:"Cormorant Garamond",serif;font-size:44px;font-weight:500;margin-bottom:20px}
.tl .l{font-size:19px;letter-spacing:.24em;margin-top:22px;color:var(--muted);font-weight:500}
.tl span{width:190px;text-align:center}.tl span:first-child{text-align:left}.tl span:last-child{text-align:right}'''
def band(side,a,b,img,t):
    d='180deg' if side=='top' else '0deg'
    return (f'<div class="bl" style="background-image:url({img});-webkit-mask-image:linear-gradient({d},#000 0%,#000 {a}%,transparent {b}%)"></div>'
     f'<div class="t" style="background:linear-gradient({d},rgba({t["band"]},{t["op_hi"]}) 0%,rgba({t["band"]},{t["op_lo"]}) {a}%,rgba({t["band"]},0) {b}%)"></div>')
out=[]
for tn,t in THEMES.items():
  for (n,img,side,ov,h1,h2,sub) in STORIES:
    tl = sub=='TL'
    body=f'<div class="bg" style="background-image:url({img})"></div><div class="bl" id="blA" style="background-image:url({img})"></div><div class="t" id="tA"></div>'
    hasSub = bool(sub) and not tl
    if tl: body+=f'<div class="bl" id="blB" style="background-image:url({img})"></div><div class="t" id="tB"></div>'
    pos='top:200px' if side=='top' else 'bottom:170px'
    body+=f'<div class="txt" data-side="{side}" style="{pos}"><div class="ov">{ov}</div><div class="rule"></div><h1>{h1}</h1>'+(f'<h2>{h2}</h2>' if h2 else '')+(f'<p class="sub">{sub}</p>' if hasSub else '')+'</div>'
    w=t['lw']
    if tl:
        body+='<div class="tl"><div class="v"><span>5 mil</span><span>10 mil</span><span>15 mil</span><span>20 mil</span></div><div class="row"><i></i><i></i><i></i><i class="f"></i></div><div class="l"><span>COMECE</span><span>CONTINUE</span><span>QUASE LÁ</span><span>BRINDE</span></div></div>'
    elif side=='top': body+=f'<div class="logo" style="width:{w}px;bottom:150px"><img src="{t["logo"]}"></div>'
    else: body+=f'<div class="logo" style="width:{w}px;top:220px"><img src="{t["logo"]}"></div>'
    body+=f"""<script>
(function(){{var B='{t["band"]}',hi={t["op_hi"]},lo={t["op_lo"]},H=1920;
function band(id,tid,dir,edgePx){{var a=(edgePx+40)/H*100,b=a+12;
document.getElementById(id).style.webkitMaskImage='linear-gradient('+dir+',#000 0%,#000 '+a+'%,transparent '+b+'%)';
document.getElementById(tid).style.background='linear-gradient('+dir+',rgba('+B+','+hi+') 0%,rgba('+B+','+lo+') '+a+'%,rgba('+B+',0) '+b+'%)';}}
var x=document.querySelector('.txt'),r=x.getBoundingClientRect();
if(x.dataset.side=='top')band('blA','tA','180deg',r.bottom);else band('blA','tA','0deg',H-r.top);
var tl=document.querySelector('.tl');if(tl){{var q=tl.getBoundingClientRect();band('blB','tB','0deg',H-q.top);}}
}})();</script>"""
    vars=f'--band:{t["band"]};--ink:{t["ink"]};--h2:{t["h2"]};--muted:{t["muted"]};--ov:{t["ov"]};--rule:{t["rule"]};--sh:{t["shadow"]}'
    html=f'<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,500&family=Montserrat:wght@400;500&display=swap" rel="stylesheet"><style>{CSS}</style></head><body><div class="s" style="{vars}">{body}</div></body></html>'
    fn=f'{tn}-{n}'; open(fn+'.html','w').write(html); out.append(fn)
open('list.txt','w').write('\n'.join(out))
