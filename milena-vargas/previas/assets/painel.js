/* Painel da Dra. Milena · cada página chama a parte que precisa pelo data-page do <body>.
   WhatsApp só por direcionamento: o painel abre a conversa com a mensagem pronta. */
(function(){
  const MV = window.MV, $ = s=>document.querySelector(s);
  const page = document.body.dataset.page;
  const now = new Date();
  const fmtLong = new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'numeric',month:'long'});
  const cap = s => s.replace(/^./,c=>c.toUpperCase());
  const dBR = iso => iso.split('-').reverse().join('/');
  const nm = id => MV.byId[id] ? MV.byId[id].nome : 'Avaliação facial';
  const first = n => n.split(' ')[0];
  const initials = n => n.split(' ').map(x=>x[0]).slice(0,2).join('');
  document.querySelectorAll('[data-today]').forEach(el=>el.textContent = cap(fmtLong.format(now)));

  // ---------- modal compartilhado ----------
  const modal = document.createElement('div');
  modal.className='modal'; modal.hidden=true;
  modal.innerHTML='<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt"><p class="example" id="mk"></p><h3 id="mt"></h3><div id="mb"></div><button class="btn btn-dark" id="mclose">Fechar</button></div>';
  document.body.appendChild(modal);
  const close=()=>modal.hidden=true;
  modal.addEventListener('click',e=>{ if(e.target===modal) close(); });
  modal.querySelector('#mclose').onclick=close;
  addEventListener('keydown',e=>{ if(e.key==='Escape') close(); });
  function sheet(kicker,title,html){ $('#mk').textContent=kicker; $('#mt').textContent=title; $('#mb').innerHTML=html; modal.hidden=false; $('#mclose').focus(); }
  function waSheet(p, steps, text){
    sheet('WhatsApp · direcionamento', p.nome,
      '<ol>'+steps.map(s=>'<li>'+s+'</li>').join('')+'</ol><pre style="margin-top:12px">'+text.replace(/</g,'&lt;')+'</pre>'
      +'<p class="fine" style="margin-top:10px">Paciente de exemplo: nada é aberto nem enviado. No painel final, o botão abre a conversa de '+first(p.nome)+' ('+p.tel+') com este texto, e a Dra. só toca em enviar.</p>');
  }
  const msgFicha = p => 'Olá, '+first(p.nome)+'! Segue sua ficha de atendimento com os cuidados após o procedimento. Qualquer dúvida, me chama por aqui. Dra. Milena Vargas';
  const msgConfirma = (p,t,u,proc) => 'Olá, '+first(p.nome)+'! Passando para confirmar seu horário amanhã às '+t+' em '+u+' ('+nm(proc).toLowerCase()+'). Pode me confirmar? Lembrando que reagendamentos precisam de aviso com 24 horas de antecedência.';
  const msgFalta = p => 'Olá, '+first(p.nome)+'! Sentimos sua falta hoje. Para reagendar, conforme as orientações, é cobrada uma taxa de 15% do valor do procedimento. Me chama por aqui que encontramos um novo horário.';
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-wa]'); if(!b) return; e.preventDefault();
    const p=MV.pac[+b.dataset.pac], kind=b.dataset.wa;
    if(kind==='ficha') waSheet(p,['O painel baixa a ficha em PDF.','Abre a conversa de '+first(p.nome)+' no WhatsApp com a mensagem abaixo.','A Dra. anexa o PDF e toca em enviar.'],msgFicha(p));
    if(kind==='confirma'){ const a=MV.amanha.find(x=>x.pac===p.id); waSheet(p,['Abre a conversa com a mensagem pronta.','A Dra. ou a secretária só toca em enviar.'],msgConfirma(p,a.t,a.u,a.p)); }
    if(kind==='falta') waSheet(p,['Abre a conversa com a mensagem pronta.','A taxa já aparece na ficha financeira da paciente.'],msgFalta(p));
    if(kind==='livre') waSheet(p,['Abre a conversa de '+first(p.nome)+' sem texto.'],'');
  });
  const toast = t => sheet('Prévia', t, '<p style="font-size:14px;color:var(--mute)">Nesta prévia nada é salvo. No painel final, a alteração fica gravada e aparece também na agenda Google.</p>');

  // ---------- HOJE ----------
  if(page==='hoje'){
    let filter='Todas', sel=0;
    const ag=$('#agenda'), pt=$('#patient');
    function render(){
      const list=MV.hoje.map((x,i)=>[x,i]).filter(([x])=>filter==='Todas'||x.u===filter);
      $('#k1').textContent=list.length;
      $('#k1e').textContent=list.filter(([x])=>x.s==='ok').length+' confirmadas';
      $('#k2').textContent=MV.brl(list.filter(([x])=>x.s!=='falta').reduce((a,[x])=>a+MV.byId[x.p].vista,0)).replace(',00','');
      if(!list.find(([,i])=>i===sel)&&list.length) sel=list[0][1];
      ag.innerHTML='';
      list.forEach(([x,i])=>{ const p=MV.pac[x.pac], s=MV.status[x.s];
        const b=document.createElement('button'); b.className='row'; b.setAttribute('role','option'); b.setAttribute('aria-selected',i===sel);
        b.innerHTML='<time>'+x.t+'</time><span><b>'+p.nome+'</b><span class="sub">'+nm(x.p)+' · '+x.nota+'</span></span><span class="pills"><span class="pill p-unit">'+x.u+'</span><span class="pill '+s[0]+'">'+s[1]+'</span></span>';
        b.onclick=()=>{sel=i; render();}; ag.appendChild(b); });
      const x=MV.hoje[sel], p=MV.pac[x.pac], pr=MV.byId[x.p];
      const last=p.hist[p.hist.length-1];
      pt.innerHTML='<h2>Paciente selecionada <small><a href="paciente.html#p'+p.id+'">abrir ficha completa →</a></small></h2>'
        +'<h3 style="font-size:32px">'+p.nome+'</h3><p class="sub" style="color:var(--mute);font-size:13px;margin-top:4px">'+p.idade+' anos · '+p.cidade+' · '+x.t+' · '+pr.nome+' · '+MV.brl(pr.vista)+'</p>'
        +(p.alerta?'<p class="alert '+(p.alerta[0]==='bad'?'bad':'')+'"><b>Atenção:</b> '+p.alerta[1]+'</p>':'')
        +'<div class="hist" style="margin-top:12px">'+(p.hist.length?p.hist.map(h=>'<div><time>'+dBR(h.d)+'</time><span>'+nm(h.p)+' · '+h.det+'</span></div>').join(''):'<div><time>—</time><span>Primeira vez na clínica</span></div>')+'</div>'
        +'<img src="../assets/img/'+pr.img+'" alt="Fotos de acompanhamento" style="width:100%;aspect-ratio:16/9;object-fit:cover;margin-top:12px">'
        +'<div class="acts"><a class="btn btn-dark btn-sm" href="../ficha/ficha-a4.html">Abrir ficha A4</a>'
        +(x.s==='falta'?'<button class="btn btn-wa btn-sm" data-wa="falta" data-pac="'+p.id+'">Mensagem de reagendamento</button>':'<button class="btn btn-wa btn-sm" data-wa="ficha" data-pac="'+p.id+'">Enviar ficha no WhatsApp</button>')+'</div>';
    }
    $('#ufilter').addEventListener('click',e=>{ const b=e.target.closest('[data-f]'); if(!b) return; filter=b.dataset.f; document.querySelectorAll('#ufilter .f').forEach(c=>c.setAttribute('aria-pressed',c===b)); render(); });
    render();
    $('#remind').innerHTML=MV.amanha.map(r=>{ const p=MV.pac[r.pac]; return '<div><span><b style="font-weight:400;color:var(--ink)">'+r.t+' · '+p.nome+'</b><br>'+nm(r.p)+' · '+r.u+'</span><button class="btn btn-wa btn-sm" data-wa="confirma" data-pac="'+p.id+'">Confirmar</button></div>'; }).join('');
    // reaplicações próximas
    const rows=[];
    MV.pacientes.forEach(p=>{ const h=[...p.hist].reverse().find(x=>x.p&&MV.byId[x.p].reaplicMeses>1); if(!h) return; const d=new Date(h.d+'T12:00'); d.setMonth(d.getMonth()+MV.byId[h.p].reaplicMeses); const dias=Math.round((d-now)/864e5); if(dias<=45) rows.push([dias,p,h,d]); });
    rows.sort((a,b)=>a[0]-b[0]);
    $('#reapl').innerHTML=rows.slice(0,5).map(([dias,p,h,d])=>'<div><span><b style="font-weight:400;color:var(--ink)"><a href="paciente.html#p'+p.id+'" style="text-decoration:none">'+p.nome+'</a></b><br>'+nm(h.p)+' · '+(dias<0?'venceu há '+(-dias)+' dias':'em '+dias+' dias')+'</span><span class="pill '+(dias<0?'p-warn':'p-info')+'">'+d.toLocaleDateString('pt-BR')+'</span></div>').join('')||'<p class="example">Nenhuma reaplicação nos próximos 45 dias.</p>';
  }

  // ---------- AGENDA ----------
  if(page==='agenda'){
    const monday=new Date(now); monday.setHours(0,0,0,0); monday.setDate(monday.getDate()-((monday.getDay()+6)%7));
    const START=8, END=19, H=56;
    const names=MV.pacientes.map(p=>p.id);
    const procs=['toxina','labios','facial','limpeza','bio','rino'];
    function eventsFor(d,i){
      const dow=d.getDay(); const unit=MV.unitDays['Erechim'].includes(dow)?'Erechim':MV.unitDays['Florianópolis'].includes(dow)?'Florianópolis':null;
      if(!unit) return [];
      if(d.toDateString()===now.toDateString()) return MV.hoje.map(x=>({t:x.t,pac:x.pac,p:x.p,u:unit}));
      const out=[]; const slots=['09:00','10:20','11:40','14:10','15:30','16:50']; let k=(d.getDate()*7)%names.length;
      slots.forEach((t,j)=>{ if((d.getDate()+j)%3===0) return; out.push({t,pac:names[(k+j)%names.length],p:procs[(d.getDate()+j)%procs.length],u:unit}); });
      if(i===1) out.push({t:'12:30',g:'Almoço · compromisso pessoal',dur:60});
      return out;
    }
    let html='<div class="hd" style="border-right:1px solid var(--line)"></div>';
    const days=[];
    for(let i=0;i<6;i++){ const d=new Date(monday); d.setDate(monday.getDate()+i); days.push(d);
      const dow=d.getDay(); const unit=MV.unitDays['Erechim'].includes(dow)?'Erechim':MV.unitDays['Florianópolis'].includes(dow)?'Florianópolis':'Sem atendimento';
      html+='<div class="hd'+(d.toDateString()===now.toDateString()?' today':'')+'">'+new Intl.DateTimeFormat('pt-BR',{weekday:'short'}).format(d).replace('.','')+'<b>'+d.getDate()+'</b><small>'+unit+'</small></div>'; }
    html+='<div class="hours">'+Array.from({length:END-START},(_,i)=>'<div>'+String(START+i).padStart(2,'0')+':00</div>').join('')+'</div>';
    days.forEach((d,i)=>{
      const evs=eventsFor(d,i);
      html+='<div class="col'+(evs.length?'':' off')+'" style="height:'+((END-START)*H)+'px">';
      evs.forEach(ev=>{ const [hh,mm]=ev.t.split(':').map(Number); const top=((hh-START)+mm/60)*H;
        if(ev.g){ html+='<div class="ev gcal" style="top:'+top+'px;height:'+(ev.dur/60*H-4)+'px"><b>'+ev.t+'</b>'+ev.g+'</div>'; return; }
        const pr=MV.byId[ev.p], p=MV.pac[ev.pac];
        html+='<a class="ev '+(ev.u==='Erechim'?'ere':'flo')+'" href="paciente.html#p'+p.id+'" style="top:'+top+'px;height:'+Math.max(pr.min/60*H-4,46)+'px"><b>'+ev.t+' · '+first(p.nome)+'</b>'+pr.nome+'</a>'; });
      html+='</div>'; });
    $('#week').innerHTML=html;
    const end=new Date(monday); end.setDate(monday.getDate()+5);
    $('#range').textContent=monday.toLocaleDateString('pt-BR',{day:'numeric',month:'long'})+' a '+end.toLocaleDateString('pt-BR',{day:'numeric',month:'long'});
    $('#novo').onclick=()=>sheet('Novo agendamento','Marcar horário',
      '<div style="display:flex;flex-direction:column;gap:10px"><label>Paciente<select>'+MV.pacientes.map(p=>'<option>'+p.nome+'</option>').join('')+'</select></label>'
      +'<label>Procedimento<select>'+MV.procs.map(p=>'<option>'+p.nome+' ('+p.min+' min)</option>').join('')+'</select></label>'
      +'<label>Cidade<select><option>Erechim</option><option>Florianópolis</option></select></label>'
      +'<p class="fine">No painel final, o horário vai para a agenda Google da Dra. e some do site na hora.</p></div>');
  }

  // ---------- PACIENTES ----------
  if(page==='pacientes'){
    let q='', city='Todas';
    function next(p){ const h=[...p.hist].reverse().find(x=>x.p); if(!h) return null; const d=new Date(h.d+'T12:00'); d.setMonth(d.getMonth()+MV.byId[h.p].reaplicMeses); return [d,h]; }
    function render(){
      const list=MV.pacientes.filter(p=>(city==='Todas'||p.cidade===city)&&p.nome.toLowerCase().includes(q));
      $('#count').textContent=list.length+' pacientes';
      $('#tbody').innerHTML=list.map(p=>{ const last=p.hist[p.hist.length-1]; const n=next(p);
        const dias=n?Math.round((n[0]-now)/864e5):null;
        const due=n?'<span class="pill '+(dias<0?'p-warn':dias<=30?'p-info':'p-unit')+'">'+n[0].toLocaleDateString('pt-BR',{month:'short',year:'numeric'}).replace('.','')+'</span>':'<span class="example">—</span>';
        return '<tr class="click" data-id="'+p.id+'"><td><a href="paciente.html#p'+p.id+'"><b style="font-weight:400">'+p.nome+'</b></a>'+(p.alerta?' <span class="pill '+(p.alerta[0]==='bad'?'p-bad':'p-warn')+'">atenção</span>':'')+'</td><td>'+p.cidade+'</td><td>'+(last?nm(last.p)+'<br><span class="example">'+dBR(last.d)+'</span>':'<span class="example">primeira vez</span>')+'</td><td>'+due+'</td><td>'+p.origem+'</td><td class="n">'+MV.brl(p.hist.reduce((a,h)=>a+h.valor,0))+'</td></tr>'; }).join('');
    }
    $('#q').addEventListener('input',e=>{q=e.target.value.toLowerCase(); render();});
    $('#cf').addEventListener('click',e=>{ const b=e.target.closest('[data-f]'); if(!b) return; city=b.dataset.f; document.querySelectorAll('#cf .f').forEach(c=>c.setAttribute('aria-pressed',c===b)); render(); });
    $('#tbody').addEventListener('click',e=>{ const tr=e.target.closest('tr[data-id]'); if(tr && !e.target.closest('a')) location.href='paciente.html#p'+tr.dataset.id; });
    $('#novo').onclick=()=>toast('Cadastrar paciente');
    render();
  }

  // ---------- PACIENTE ----------
  if(page==='paciente'){
    function load(){
      const m=(location.hash||'').match(/^#p(\d+)$/); const p=MV.pac[m?+m[1]:1]||MV.pac[1];
      document.title=p.nome+' · Painel Milena Vargas';
      const total=p.hist.reduce((a,h)=>a+h.valor,0);
      const last=[...p.hist].reverse().find(x=>x.p);
      let next='—'; if(last){ const d=new Date(last.d+'T12:00'); d.setMonth(d.getMonth()+MV.byId[last.p].reaplicMeses); next=nm(last.p)+' · '+d.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}); }
      $('#head').innerHTML='<span class="av">'+initials(p.nome)+'</span><div><p class="example">Paciente · desde '+(p.hist[0]?dBR(p.hist[0].d):'hoje')+'</p><h1>'+p.nome+'</h1><p style="color:var(--mute);font-size:14px">'+p.idade+' anos · '+p.cidade+' · veio pelo '+p.origem+'</p></div>'
        +'<div class="tools" style="margin-left:auto"><a class="btn btn-dark" href="../ficha/ficha-a4.html">Nova ficha A4</a><button class="btn btn-wa" data-wa="livre" data-pac="'+p.id+'">Abrir WhatsApp</button></div>';
      $('#alert').innerHTML=p.alerta?'<p class="alert '+(p.alerta[0]==='bad'?'bad':'')+'" style="margin:0"><b>Atenção:</b> '+p.alerta[1]+'</p>':'';
      $('#dados').innerHTML='<div><span>Nascimento</span>'+p.nasc+'</div><div><span>WhatsApp</span>'+p.tel+'</div><div><span>Cidade</span>'+p.cidade+'</div><div><span>Como conheceu</span>'+p.origem+'</div><div><span>Total investido</span>'+MV.brl(total)+'</div><div><span>Próxima manutenção</span>'+next+'</div>';
      const a=p.anamnese;
      $('#anam').innerHTML=[['Gestante ou amamentando',a.gestante],['Alergias',a.alergias],['Anticoagulante',a.anticoag],['Doença autoimune',a.autoimune],['Herpes labial',a.herpes],['Procedimento recente',a.recente]].map(([k,v])=>'<div><span>'+k+'</span>'+(v!=='Não'?'<b style="color:var(--warn);font-weight:400">'+v+'</b>':v)+'</div>').join('');
      $('#hist').innerHTML=p.hist.length?p.hist.slice().reverse().map(h=>'<tr><td>'+dBR(h.d)+'</td><td>'+nm(h.p)+'</td><td>'+h.det+'</td><td>'+h.lote+'</td><td class="n">'+(h.valor?MV.brl(h.valor):'—')+'</td></tr>').join(''):'<tr><td colspan="5" class="example">Nenhum procedimento ainda.</td></tr>';
      const imgs=[...new Set(p.hist.filter(h=>h.p).map(h=>MV.byId[h.p].img))];
      $('#fotos').innerHTML=imgs.length?imgs.map(i=>'<figure><img src="../assets/img/'+i+'" alt="Fotos de antes e depois"><figcaption>Antes e depois · mesma luz e ângulo</figcaption></figure>').join(''):'<p class="example">As fotos de antes e depois aparecem aqui depois do primeiro procedimento.</p>';
      $('#docs').innerHTML='<a href="../ficha/ficha-a4.html">Ficha de atendimento A4 <span>PDF · imprimir ou enviar</span></a><a href="#" data-wa="ficha" data-pac="'+p.id+'">Enviar última ficha pelo WhatsApp <span>abre a conversa</span></a><a href="#" onclick="return false">Termo de consentimento <span>assinado em '+(p.hist[0]?dBR(p.hist[0].d):'—')+'</span></a><a href="#" onclick="return false">Autorização de uso de imagem <span>'+(p.hist.length?'assinada':'pendente')+'</span></a>';
      document.querySelectorAll('#pick option').forEach(o=>o.selected=(+o.value===p.id));
    }
    $('#pick').innerHTML=MV.pacientes.map(p=>'<option value="'+p.id+'">'+p.nome+'</option>').join('');
    $('#pick').onchange=e=>{ location.hash='p'+e.target.value; };
    const tabs=document.querySelectorAll('.tabs button');
    tabs.forEach(t=>t.onclick=()=>{ tabs.forEach(x=>x.setAttribute('aria-selected',x===t)); document.querySelectorAll('[data-panel]').forEach(pn=>pn.hidden=pn.dataset.panel!==t.dataset.tab); });
    addEventListener('hashchange',load); load();
  }

  // ---------- FINANCEIRO ----------
  if(page==='financeiro'){
    const y=now.getFullYear(), m=now.getMonth();
    const plan=[[2,'toxina','Erechim','Cartão 3x'],[2,'limpeza','Erechim','Pix'],[3,'labios','Erechim','Cartão 3x'],[5,'bio','Florianópolis','Pix'],[6,'rino','Florianópolis','Cartão 4x'],[7,'toxina','Erechim','Pix'],[8,'facial','Erechim','Cartão 3x'],[9,'limpeza','Erechim','Pix'],[12,'toxina','Florianópolis','Pix'],[13,'labios','Florianópolis','Cartão 3x'],[14,'toxina','Erechim','Cartão 3x'],[15,'bio','Erechim','Pix'],[16,'limpeza','Erechim','Pix'],[19,'facial','Florianópolis','Pix'],[20,'labios','Erechim','Pix'],[21,'toxina','Erechim','Cartão 3x'],[22,'limpeza','Erechim','Pix'],[23,'rino','Florianópolis','Pix'],[26,'toxina','Erechim','Pix'],[27,'bio','Erechim','Cartão 3x'],[27,'limpeza','Erechim','Pix'],[28,'labios','Erechim','Pix']];
    const today=now.getDate(); const last=new Date(y,m+1,0).getDate(); [[1,'toxina','Florianópolis','Pix'],[1,'labios','Florianópolis','Cartão 3x'],[2,'bio','Erechim','Pix'],[3,'limpeza','Erechim','Pix']].forEach(([k,p,u,f])=>plan.push([Math.min(today+k,last),p,u,f]));
    const rows=plan.map(([d,p,u,f],i)=>{ const pr=MV.byId[p]; const card=f.startsWith('Cartão'); const n=card?+f.match(/\d/)[0]:1;
      const valor=card? (pr.parc? +pr.parc.match(/R\$ ([\d.,]+)/)[1].replace('.','').replace(',','.')*n : pr.vista) : pr.vista;
      return {d:new Date(y,m,d),p,u,f,valor,status:(i>=plan.length-4||d>today)?'Agendado':'Recebido',pac:MV.pacientes[i%MV.pacientes.length]}; });
    const rec=rows.filter(r=>r.status==='Recebido'), fut=rows.filter(r=>r.status!=='Recebido');
    const sum=a=>a.reduce((s,r)=>s+r.valor,0);
    const taxas=2, taxaV=Math.round(1050*.15*100)/100+Math.round(950*.15*100)/100;
    $('#k1').textContent=MV.brl(sum(rec)).replace(',00','');
    $('#k2').textContent=MV.brl(sum(fut)).replace(',00','');
    $('#k3').textContent=MV.brl(sum(rows)/rows.length).replace(/,\d\d$/,'');
    $('#k4').textContent=MV.brl(taxaV);
    $('#k4e').textContent=taxas+' faltas sem aviso';
    $('#mes').textContent=cap(now.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}));
    const by={}; rows.forEach(r=>by[r.p]=(by[r.p]||0)+r.valor); const max=Math.max(...Object.values(by));
    $('#bars').innerHTML=Object.entries(by).sort((a,b)=>b[1]-a[1]).map(([p,v])=>'<div class="bar"><span>'+nm(p)+'</span><div class="track"><div class="fill" style="width:'+(v/max*100)+'%"></div></div><span class="n">'+MV.brl(v).replace(',00','')+'</span></div>').join('');
    const e=sum(rows.filter(r=>r.u==='Erechim')), fl=sum(rows.filter(r=>r.u==='Florianópolis')), t=e+fl;
    $('#split').innerHTML='<div style="width:'+(e/t*100)+'%;background:var(--ere)"></div><div style="width:'+(fl/t*100)+'%;background:var(--flo)"></div>';
    $('#splitl').innerHTML='<span><i style="background:var(--ere)"></i>Erechim '+MV.brl(e).replace(',00','')+' · '+Math.round(e/t*100)+'%</span><span><i style="background:var(--flo)"></i>Florianópolis '+MV.brl(fl).replace(',00','')+' · '+Math.round(fl/t*100)+'%</span>';
    const pix=sum(rows.filter(r=>r.f==='Pix')), cart=t-pix;
    $('#forma').innerHTML='<div style="width:'+(pix/t*100)+'%;background:var(--taupe)"></div><div style="width:'+(cart/t*100)+'%;background:var(--stone)"></div>';
    $('#formal').innerHTML='<span><i style="background:var(--taupe)"></i>Pix / à vista '+Math.round(pix/t*100)+'%</span><span><i style="background:var(--stone)"></i>Cartão '+Math.round(cart/t*100)+'%</span>';
    $('#tbody').innerHTML=rows.slice().sort((a,b)=>b.d-a.d).map(r=>'<tr><td>'+r.d.toLocaleDateString('pt-BR')+'</td><td>'+r.pac.nome+'</td><td>'+nm(r.p)+'</td><td>'+r.u+'</td><td>'+r.f+'</td><td><span class="pill '+(r.status==='Recebido'?'p-ok':'p-info')+'">'+r.status+'</span></td><td class="n">'+MV.brl(r.valor)+'</td></tr>').join('');
  }

  // ---------- PROCEDIMENTOS ----------
  if(page==='procedimentos'){
    $('#tbody').innerHTML=MV.procs.map(p=>'<tr><td><b style="font-weight:400">'+p.nome+'</b><br><span class="example">'+p.curto+'</span></td>'
      +'<td><input type="text" value="'+(p.parc||'—')+'" aria-label="Cartão '+p.nome+'" style="width:150px"></td>'
      +'<td class="n"><input type="text" value="'+MV.brl(p.vista)+'" aria-label="À vista '+p.nome+'" style="width:120px;text-align:right"></td>'
      +'<td>'+p.min+' min</td><td>'+p.dur+'</td><td>'+(p.retornoDias?p.retornoDias+' dias':'—')+'</td><td>'+(p.reaplicMeses>1?'em '+p.reaplicMeses+' meses':'a cada 30 a 45 dias')+'</td></tr>').join('');
    $('#salvar').onclick=()=>toast('Salvar tabela de procedimentos');
  }
})();
