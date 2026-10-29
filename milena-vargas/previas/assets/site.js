/* Comportamentos do site: topo, agendamento e mensagem pelo WhatsApp (só direcionamento). */
(function(){
  const MV = window.MV;
  const top = document.getElementById('top');
  if (top){ const f=()=>top.classList.toggle('scrolled', scrollY>8); addEventListener('scroll',f,{passive:true}); f(); }

  // fecha o menu do celular ao tocar num link
  document.querySelectorAll('.mobile nav a').forEach(a=>a.addEventListener('click',()=>a.closest('details').open=false));

  // ---------- agendamento ----------
  const form = document.getElementById('bookForm');
  if (form){
    const now = new Date();
    const fmt = new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'numeric',month:'long'});
    const dfmt = new Intl.DateTimeFormat('pt-BR',{weekday:'short',day:'2-digit',month:'2-digit'});
    const sel = document.getElementById('proc');
    const daysEl = document.getElementById('days'), timesEl = document.getElementById('times'), sum = document.getElementById('summary');
    const st = {unit:'Erechim', day:null, time:null};

    // chegada por link: #p-labios, #u-erechim, #u-florianopolis
    const h = (location.hash||'').slice(1);
    if (h.startsWith('p-') && MV.byId[h.slice(2)]) sel.value = h.slice(2);
    if (h === 'u-florianopolis') st.unit = 'Florianópolis';
    document.querySelectorAll('#units .chip').forEach(c=>c.setAttribute('aria-pressed', c.dataset.unit===st.unit));

    function nextDays(){ const out=[]; const d=new Date(now); d.setHours(0,0,0,0); while(out.length<6){ d.setDate(d.getDate()+1); if(MV.unitDays[st.unit].includes(d.getDay())) out.push(new Date(d)); } return out; }
    function seed(s){ let x=0; for(const c of s) x=(x*31+c.charCodeAt(0))%9973; return x; }
    function renderDays(){
      const ds = nextDays(); st.day = ds[0]; daysEl.innerHTML='';
      ds.forEach((d,i)=>{ const b=document.createElement('button'); b.type='button'; b.className='chip'; b.textContent=dfmt.format(d).replace('.',''); b.setAttribute('aria-pressed', i===0);
        b.onclick=()=>{ st.day=d; [...daysEl.children].forEach(c=>c.setAttribute('aria-pressed', c===b)); renderTimes(); }; daysEl.appendChild(b); });
      renderTimes();
    }
    function renderTimes(){
      const slots=['09:00','09:40','10:20','11:00','11:40','13:30','14:10','14:50','15:30','16:10','16:50','17:30'];
      const s=seed(st.unit+st.day.toDateString()); st.time=null; timesEl.innerHTML='';
      slots.forEach((t,i)=>{ const taken=((s+i*7)%5)<2; const b=document.createElement('button'); b.type='button'; b.className='chip'; b.textContent=t; b.disabled=taken; b.setAttribute('aria-pressed','false'); if(taken) b.setAttribute('aria-label',t+' ocupado');
        b.onclick=()=>{ st.time=t; [...timesEl.children].forEach(c=>c.setAttribute('aria-pressed', c===b)); renderSum(); }; timesEl.appendChild(b); });
      renderSum();
    }
    const procName = ()=> sel.options[sel.selectedIndex].text.replace(/ \(.*\)/,'');
    function renderSum(done){
      const p = MV.byId[sel.value];
      const when = st.time ? fmt.format(st.day)+' às '+st.time : 'escolha um horário';
      const price = p ? (p.parc ? p.parc+' ou '+MV.brl(p.vista)+' à vista' : MV.brl(p.vista)+' à vista') : 'definido na avaliação';
      sum.classList.toggle('done', !!done);
      if (!done){
        sum.innerHTML = '<span class="eyebrow">Seu agendamento</span><b>'+procName()+'.</b><dl><dt>Cidade</dt><dd>'+st.unit+'</dd><dt>Quando</dt><dd>'+when+'</dd><dt>Investimento</dt><dd>'+price+'</dd></dl>';
        return;
      }
      const nome = document.getElementById('nome').value || 'paciente';
      const msg = 'Olá, Dra. Milena! Sou '+nome+' e acabei de reservar pelo site: '+procName()+' em '+st.unit+', '+when+'.';
      sum.innerHTML = '<span class="eyebrow">Horário reservado · prévia</span><b>Até lá, '+nome+'.</b><dl><dt>Cidade</dt><dd>'+st.unit+'</dd><dt>Quando</dt><dd>'+when+'</dd></dl>'
        + '<p style="font-size:13px;opacity:.85">No site final, o horário entra direto na agenda Google da Dra. Milena.</p>'
        + '<a class="btn btn-cream btn-sm" href="'+MV.wa(msg)+'" target="_blank" rel="noopener">Avisar a Dra. no WhatsApp</a>';
    }
    document.getElementById('units').addEventListener('click',e=>{ const b=e.target.closest('[data-unit]'); if(!b) return; st.unit=b.dataset.unit; document.querySelectorAll('#units .chip').forEach(c=>c.setAttribute('aria-pressed', c===b)); renderDays(); });
    sel.addEventListener('change',()=>renderSum());
    form.addEventListener('submit',e=>{ e.preventDefault();
      if(!st.time){ sum.classList.remove('done'); sum.innerHTML='<span class="eyebrow">Falta o horário</span><b>Escolha um horário.</b><p style="font-size:14px;color:var(--mute-d)">Toque num dos horários livres do passo 4.</p>'; timesEl.scrollIntoView({behavior:'smooth',block:'center'}); return; }
      if(!document.getElementById('ok').checked){ sum.classList.remove('done'); sum.innerHTML='<span class="eyebrow">Falta um passo</span><b>Confirme as orientações.</b><p style="font-size:14px;color:var(--mute-d)">Marque que leu as regras de reagendamento e faltas.</p>'; return; }
      renderSum(true); if (innerWidth<980) sum.scrollIntoView({behavior:'smooth',block:'center'}); });
    renderDays();
  }

  // ---------- mensagem de contato ----------
  const mf = document.getElementById('msgForm');
  if (mf){
    mf.addEventListener('submit',e=>{ e.preventDefault();
      const n=document.getElementById('mnome').value.trim(), c=document.getElementById('mcid').value, t=document.getElementById('mtxt').value.trim();
      const msg='Olá, Dra. Milena!'+(n?' Sou '+n+',':'')+' de '+c+'. '+(t||'Quero agendar uma avaliação.');
      const a=document.createElement('a'); a.href=MV.wa(msg); a.target='_blank'; a.rel='noopener'; document.body.appendChild(a); a.click(); a.remove();
    });
  }
})();
